// API Constants
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_ORDER: 'desc' as const,
  DEFAULT_SORT_BY: 'created_at',
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 1000,
} as const;

// Cache Constants
export const CACHE_CONSTANTS = {
  TTL: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },
  KEYS: {
    PRODUCT: 'product',
    PRODUCTS: 'products',
    CATEGORY: 'category',
    CATEGORIES: 'categories',
    USER: 'user',
    CART: 'cart',
    ORDER: 'order',
    SESSION: 'session',
  },
  PREFIXES: {
    RATE_LIMIT: 'rl',
    SESSION: 'sess',
    USER: 'user',
    PRODUCT: 'prod',
  },
} as const;

// Database Constants
export const DB_CONSTANTS = {
  MAX_CONNECTIONS: 20,
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  QUERY_TIMEOUT: 15000, // 15 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Business Constants
export const BUSINESS_CONSTANTS = {
  CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const,
  DEFAULT_CURRENCY: 'USD',
  TAX_RATES: {
    DEFAULT: 0.0875, // 8.75%
  },
  SHIPPING: {
    FREE_SHIPPING_THRESHOLD: 50,
    DEFAULT_SHIPPING_RATE: 9.99,
  },
  INVENTORY: {
    LOW_STOCK_THRESHOLD: 10,
    OUT_OF_STOCK_THRESHOLD: 0,
  },
  ORDER: {
    AUTO_CANCEL_HOURS: 24,
    FULFILLMENT_TIMEOUT_DAYS: 7,
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Validation Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Authentication Errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization Errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Not Found Errors (404)
  NOT_FOUND: 'NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  
  // Conflict Errors (409)
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Lambda Constants
export const LAMBDA_CONSTANTS = {
  TIMEOUT: {
    DEFAULT: 30, // 30 seconds
    LONG_RUNNING: 300, // 5 minutes
  },
  MEMORY: {
    SMALL: 256,
    MEDIUM: 512,
    LARGE: 1024,
    XLARGE: 2048,
  },
  RESERVED_CONCURRENCY: {
    DEFAULT: 100,
    HIGH_TRAFFIC: 1000,
  },
} as const;

// AWS Constants
export const AWS_CONSTANTS = {
  REGIONS: {
    US_EAST_1: 'us-east-1',
    US_WEST_2: 'us-west-2',
    EU_WEST_1: 'eu-west-1',
  },
  SERVICES: {
    RDS_DATA: 'rds-data',
    SECRETS_MANAGER: 'secretsmanager',
    ELASTICACHE: 'elasticache',
    COGNITO: 'cognito-idp',
  },
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9-]+$/,
  SKU: /^[A-Z0-9-_]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
  CURRENCY: /^[A-Z]{3}$/,
  POSTAL_CODE: {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CACHING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_ANALYTICS: true,
  ENABLE_RECOMMENDATIONS: false,
  ENABLE_INVENTORY_TRACKING: true,
  ENABLE_TAX_CALCULATION: true,
  ENABLE_SHIPPING_CALCULATION: true,
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME_MS: 500,
  DB_QUERY_TIME_MS: 100,
  CACHE_OPERATION_TIME_MS: 10,
  LAMBDA_COLD_START_MS: 3000,
  LAMBDA_WARM_START_MS: 100,
} as const;

// Monitoring Constants
export const MONITORING_CONSTANTS = {
  METRICS: {
    REQUEST_COUNT: 'RequestCount',
    RESPONSE_TIME: 'ResponseTime',
    ERROR_RATE: 'ErrorRate',
    CACHE_HIT_RATE: 'CacheHitRate',
    DB_CONNECTION_COUNT: 'DatabaseConnections',
  },
  ALARMS: {
    HIGH_ERROR_RATE_THRESHOLD: 0.05, // 5%
    HIGH_LATENCY_THRESHOLD: 3000, // 3 seconds
    LOW_CACHE_HIT_RATE_THRESHOLD: 0.8, // 80%
  },
} as const;
