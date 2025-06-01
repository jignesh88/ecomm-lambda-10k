# High-Performance Ecommerce Platform

A scalable ecommerce API platform built to handle **10,000+ TPS** using AWS serverless architecture with Lambda, API Gateway, PostgreSQL (Aurora), and Redis caching.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Route53       │────│ API Gateway  │────│ Lambda Functions│
│   (DNS)         │    │ (Load Bal.)  │    │ (Compute)       │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                    │
                       ┌─────────────────┐         │
                       │ Cognito         │─────────┤
                       │ (Auth)          │         │
                       └─────────────────┘         │
                                                    │
┌─────────────────┐    ┌──────────────┐           │
│ Redis           │────│ Aurora       │───────────┘
│ (Cache)         │    │ PostgreSQL   │
└─────────────────┘    └──────────────┘
```

## 🚀 Key Features

- **High Performance**: Designed for 10K+ TPS with intelligent caching
- **Serverless**: AWS Lambda functions with auto-scaling
- **Database**: Aurora PostgreSQL with read replicas
- **Caching**: Redis for sub-millisecond response times
- **Security**: AWS Cognito authentication + API Gateway rate limiting
- **Monitoring**: CloudWatch dashboards and alerts
- **CI/CD**: Automated deployment with Turborepo

## 📋 Prerequisites

- **Node.js** 18+ 
- **AWS CLI** configured with appropriate permissions
- **AWS CDK** v2.100.0+
- **Docker** (for local development)
- **pnpm** 8.10.0+ (package manager)

## 🛠️ Quick Start

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/jignesh88/ecomm-lambda-10k.git
cd ecomm-lambda-10k
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Configure your AWS environment
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1
export CDK_DEFAULT_ACCOUNT=$AWS_ACCOUNT_ID
export CDK_DEFAULT_REGION=$AWS_REGION
```

### 3. Build All Packages

```bash
pnpm build
```

### 4. Deploy Infrastructure

```bash
# Deploy all AWS resources
pnpm deploy:infra

# Or deploy with custom domain
pnpm cdk deploy --context domainName=api.yourstore.com --context hostedZoneId=Z123456789
```

### 5. Run Database Migrations

```bash
# After infrastructure is deployed, get the database connection details
# from AWS Secrets Manager and run migrations
export DATABASE_URL="postgresql://username:password@cluster-endpoint:5432/ecommerce"
pnpm db:migrate
pnpm db:seed
```

## 🏃‍♂️ Development

### Local Development Setup

```bash
# Start all services in development mode
pnpm dev

# Run specific package
pnpm --filter @ecommerce/api dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Database Operations

```bash
# Run migrations
pnpm db:migrate

# Rollback last migration
pnpm db:rollback

# Seed database with sample data
pnpm db:seed

# Reset database (rollback + migrate + seed)
pnpm db:reset
```

## 📁 Project Structure

```
ecommerce-platform/
├── packages/
│   ├── api/                    # Lambda functions
│   ├── infrastructure/         # CDK infrastructure
│   ├── database/              # Migrations & scripts
│   ├── shared/                # Shared utilities
│   └── monitoring/            # Observability
├── apps/                      # Frontend applications
├── tools/                     # Build & deployment tools
└── docs/                      # Documentation
```

## 🔌 API Endpoints

### Categories
- `GET /categories` - List all categories
- `GET /categories/{id}` - Get category by ID

### Products  
- `GET /products` - List products with filtering/pagination
- `GET /products/{id}` - Get product by ID

### Users
- `GET /users` - List users (admin)
- `GET /users/{id}` - Get user profile

### Cart
- `GET /cart/{id}` - Get user's cart
- `POST /cart/{id}/items` - Add item to cart
- `PUT /cart/{id}/items/{itemId}` - Update cart item
- `DELETE /cart/{id}/items/{itemId}` - Remove cart item

### Checkout
- `POST /checkout/{id}` - Process checkout

### Orders
- `GET /orders` - List orders
- `GET /orders/{id}` - Get order by ID

## ⚡ Performance Optimization

### 10K TPS Configuration

The platform is optimized for high throughput:

1. **Lambda Concurrency**: 
   - Reserved concurrency: 5,000 per function
   - Provisioned concurrency for critical endpoints

2. **API Gateway**:
   - Rate limiting: 10,000 RPS
   - Burst limit: 20,000 RPS
   - Caching enabled (5 minutes TTL)

3. **Database**:
   - Aurora with 2+ read replicas
   - Connection pooling
   - Optimized indexes for common queries

4. **Redis Caching**:
   - Product data cached for 10 minutes
   - User sessions cached for 24 hours
   - Cart data cached for 1 hour

## 🚀 Deployment

### Automated Deployment

```bash
# Deploy everything (infrastructure + code)
pnpm deploy

# Deploy only infrastructure changes
pnpm deploy:infra

# Deploy only Lambda code changes
pnpm --filter @ecommerce/api deploy
```

## 🔒 Security

### Authentication Flow

1. **User Registration/Login**: Cognito User Pool
2. **JWT Token**: Issued by Cognito
3. **API Authorization**: Lambda authorizer validates JWT
4. **Rate Limiting**: API Gateway + custom rate limiter

### Security Best Practices

- All Lambda functions run in private subnets
- Database accessible only from Lambda security group
- Redis encrypted in transit and at rest
- Secrets stored in AWS Secrets Manager
- HTTPS enforced for all API endpoints

## 📊 Monitoring & Observability

### CloudWatch Dashboards

- **API Performance**: Request count, latency, error rates
- **Database Metrics**: Connections, CPU, memory usage  
- **Cache Performance**: Hit/miss ratios, latency
- **Business Metrics**: Orders, revenue, conversion rates

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run specific package tests
pnpm --filter @ecommerce/api test

# Run with coverage
pnpm test:coverage
```

### Load Testing

```bash
# Install Artillery for load testing
npm install -g artillery

# Run load test
artillery run tests/load/api-load-test.yml

# Test 10K TPS scenario
artillery run tests/load/high-throughput-test.yml
```

## 🔧 Troubleshooting

### Common Issues

#### 1. CDK Deployment Failures

```bash
# Check CDK version
npx cdk --version

# Bootstrap CDK (if not done)
npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# Destroy and redeploy if stuck
npx cdk destroy --all
npx cdk deploy --all
```

#### 2. Lambda Function Errors

```bash
# Check Lambda logs
aws logs tail /aws/lambda/ecommerce-get-products --follow

# Check function configuration
aws lambda get-function --function-name ecommerce-get-products
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Lambda Functions**: Auto-scale based on demand
2. **API Gateway**: Handles burst traffic automatically  
3. **Aurora**: Add read replicas as needed
4. **Redis**: Use cluster mode for >90GB data

### Vertical Scaling

1. **Lambda Memory**: Increase for CPU-intensive operations
2. **RDS Instance Size**: Scale up for higher CPU/memory needs
3. **Redis Node Type**: Upgrade for more memory/throughput

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/jignesh88/ecomm-lambda-10k/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jignesh88/ecomm-lambda-10k/discussions)

---

## 🎯 Next Steps

After successful deployment, consider:

1. **Frontend Integration**: Build React/Next.js storefront
2. **Payment Processing**: Integrate Stripe/PayPal
3. **Email Services**: Add SES for transactional emails
4. **Search**: Implement Elasticsearch for product search
5. **Analytics**: Add Google Analytics/Mixpanel tracking
6. **Mobile App**: React Native mobile application
7. **Admin Dashboard**: Management interface for inventory/orders

Happy coding! 🚀