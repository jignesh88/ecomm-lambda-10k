import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface InfrastructureStackProps extends cdk.StackProps {
  stage: string;
  domainName?: string;
  hostedZoneId?: string;
}

export class InfrastructureStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly database: rds.DatabaseCluster;
  public readonly redis: elasticache.CacheCluster;
  public readonly userPool: cognito.UserPool;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    // VPC Configuration
    this.vpc = new ec2.Vpc(this, 'EcommerceVPC', {
      maxAzs: 3,
      natGateways: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-with-egress',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'private-isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // RDS PostgreSQL Cluster
    this.database = this.createDatabase();

    // Redis Cache Cluster
    this.redis = this.createRedisCluster();

    // Cognito User Pool
    this.userPool = this.createUserPool();

    // Lambda Functions
    const lambdaFunctions = this.createLambdaFunctions();

    // API Gateway
    this.api = this.createApiGateway(lambdaFunctions);

    // Route53 (if domain provided)
    if (props.domainName && props.hostedZoneId) {
      this.createRoute53Records(props.domainName, props.hostedZoneId);
    }

    // CloudWatch Dashboards and Alarms
    this.createMonitoring();
  }

  private createDatabase(): rds.DatabaseCluster {
    const dbSubnetGroup = new rds.SubnetGroup(this, 'DbSubnetGroup', {
      vpc: this.vpc,
      description: 'Subnet group for RDS',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for RDS',
    });

    const cluster = new rds.DatabaseCluster(this, 'PostgreSQLCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_4,
      }),
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.LARGE),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        securityGroups: [dbSecurityGroup],
      },
      instances: 2,
      subnetGroup: dbSubnetGroup,
      defaultDatabaseName: 'ecommerce',
      credentials: rds.Credentials.fromGeneratedSecret('dbadmin'),
      backup: {
        retention: cdk.Duration.days(7),
        preferredWindow: '03:00-04:00',
      },
      cloudwatchLogsExports: ['postgresql'],
      monitoring: {
        interval: cdk.Duration.seconds(60),
      },
      storageEncrypted: true,
      deletionProtection: true,
    });

    // Allow Lambda access to RDS
    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow Lambda access to PostgreSQL'
    );

    return cluster;
  }

  private createRedisCluster(): elasticache.CacheCluster {
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for Redis',
      subnetIds: this.vpc.privateSubnets.map(subnet => subnet.subnetId),
    });

    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Redis',
    });

    redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Lambda access to Redis'
    );

    return new elasticache.CacheCluster(this, 'RedisCluster', {
      cacheNodeType: 'cache.r6g.large',
      engine: 'redis',
      numCacheNodes: 2,
      vpcSubnets: redisSubnetGroup,
      securityGroupIds: [redisSecurityGroup.securityGroupId],
      autoMinorVersionUpgrade: true,
    });
  }

  private createUserPool(): cognito.UserPool {
    const userPool = new cognito.UserPool(this, 'EcommerceUserPool', {
      userPoolName: 'ecommerce-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: true,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'EcommerceUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
      },
    });

    return userPool;
  }

  private createLambdaFunctions(): { [key: string]: lambda.Function } {
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Grant permissions for RDS and Redis access
    this.database.secret?.grantRead(lambdaRole);
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'elasticache:DescribeCacheClusters',
        'elasticache:DescribeReplicationGroups',
      ],
      resources: ['*'],
    }));

    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        DB_CLUSTER_ARN: this.database.clusterArn,
        DB_SECRET_ARN: this.database.secret?.secretArn || '',
        REDIS_ENDPOINT: this.redis.attrRedisEndpointAddress,
        USER_POOL_ID: this.userPool.userPoolId,
      },
    };

    const functions: { [key: string]: lambda.Function } = {};

    // Categories
    functions.getCategories = new lambda.Function(this, 'GetCategoriesFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/categories/get-categories'),
      functionName: 'ecommerce-get-categories',
    });

    functions.getCategory = new lambda.Function(this, 'GetCategoryFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/categories/get-category'),
      functionName: 'ecommerce-get-category',
    });

    // Products
    functions.getProducts = new lambda.Function(this, 'GetProductsFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/products/get-products'),
      functionName: 'ecommerce-get-products',
    });

    functions.getProduct = new lambda.Function(this, 'GetProductFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/products/get-product'),
      functionName: 'ecommerce-get-product',
    });

    // Users
    functions.getUsers = new lambda.Function(this, 'GetUsersFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/users/get-users'),
      functionName: 'ecommerce-get-users',
    });

    functions.getUser = new lambda.Function(this, 'GetUserFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/users/get-user'),
      functionName: 'ecommerce-get-user',
    });

    // Cart
    functions.getCart = new lambda.Function(this, 'GetCartFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/cart/get-cart'),
      functionName: 'ecommerce-get-cart',
    });

    // Checkout
    functions.processCheckout = new lambda.Function(this, 'ProcessCheckoutFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/checkout/process-checkout'),
      functionName: 'ecommerce-process-checkout',
      timeout: cdk.Duration.minutes(5),
    });

    // Orders
    functions.getOrders = new lambda.Function(this, 'GetOrdersFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/orders/get-orders'),
      functionName: 'ecommerce-get-orders',
    });

    functions.getOrder = new lambda.Function(this, 'GetOrderFunction', {
      ...commonLambdaProps,
      code: lambda.Code.fromAsset('packages/api/dist/handlers/orders/get-order'),
      functionName: 'ecommerce-get-order',
    });

    return functions;
  }

  private createApiGateway(functions: { [key: string]: lambda.Function }): apigateway.RestApi {
    const api = new apigateway.RestApi(this, 'EcommerceAPI', {
      restApiName: 'Ecommerce Service',
      description: 'High-performance ecommerce API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
      deployOptions: {
        stageName: 'prod',
        throttle: {
          rateLimit: 10000,
          burstLimit: 20000,
        },
        cachingEnabled: true,
        cacheClusterEnabled: true,
        cacheClusterSize: '1.6',
        cacheTtl: cdk.Duration.seconds(300),
      },
    });

    // API Key for rate limiting
    const apiKey = api.addApiKey('EcommerceApiKey', {
      apiKeyName: 'ecommerce-api-key',
    });

    const usagePlan = api.addUsagePlan('EcommerceUsagePlan', {
      name: 'ecommerce-usage-plan',
      throttle: {
        rateLimit: 10000,
        burstLimit: 20000,
      },
      quota: {
        limit: 1000000,
        period: apigateway.Period.MONTH,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    // Categories endpoints
    const categories = api.root.addResource('categories');
    categories.addMethod('GET', new apigateway.LambdaIntegration(functions.getCategories));
    
    const categoryById = categories.addResource('{id}');
    categoryById.addMethod('GET', new apigateway.LambdaIntegration(functions.getCategory));

    // Products endpoints
    const products = api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(functions.getProducts));
    
    const productById = products.addResource('{id}');
    productById.addMethod('GET', new apigateway.LambdaIntegration(functions.getProduct));

    // Users endpoints
    const users = api.root.addResource('users');
    users.addMethod('GET', new apigateway.LambdaIntegration(functions.getUsers));
    
    const userById = users.addResource('{id}');
    userById.addMethod('GET', new apigateway.LambdaIntegration(functions.getUser));

    // Cart endpoints
    const cart = api.root.addResource('cart');
    const cartById = cart.addResource('{id}');
    cartById.addMethod('GET', new apigateway.LambdaIntegration(functions.getCart));

    // Checkout endpoints
    const checkout = api.root.addResource('checkout');
    const checkoutById = checkout.addResource('{id}');
    checkoutById.addMethod('POST', new apigateway.LambdaIntegration(functions.processCheckout));

    // Orders endpoints
    const orders = api.root.addResource('orders');
    orders.addMethod('GET', new apigateway.LambdaIntegration(functions.getOrders));
    
    const orderById = orders.addResource('{id}');
    orderById.addMethod('GET', new apigateway.LambdaIntegration(functions.getOrder));

    return api;
  }

  private createRoute53Records(domainName: string, hostedZoneId: string): void {
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName: domainName,
    });

    new route53.ARecord(this, 'ApiRecord', {
      zone: hostedZone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(new route53targets.ApiGateway(this.api)),
    });
  }

  private createMonitoring(): void {
    const dashboard = new cloudwatch.Dashboard(this, 'EcommerceDashboard', {
      dashboardName: 'ecommerce-metrics',
    });

    // API Gateway metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway Requests',
        left: [this.api.metricRequestCount()],
        right: [this.api.metricLatency()],
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway Errors',
        left: [this.api.metricClientError(), this.api.metricServerError()],
      })
    );

    // Database metrics
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Database Connections',
        left: [this.database.metricDatabaseConnections()],
      }),
      new cloudwatch.GraphWidget({
        title: 'Database CPU',
        left: [this.database.metricCPUUtilization()],
      })
    );

    // Alarms
    new cloudwatch.Alarm(this, 'HighErrorRateAlarm', {
      metric: this.api.metricServerError(),
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'High API error rate',
    });

    new cloudwatch.Alarm(this, 'HighLatencyAlarm', {
      metric: this.api.metricLatency(),
      threshold: 3000,
      evaluationPeriods: 2,
      alarmDescription: 'High API latency',
    });
  }
}
