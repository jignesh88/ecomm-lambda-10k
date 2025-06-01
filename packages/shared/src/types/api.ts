import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface APIResponse<T = any> {
  statusCode: number;
  headers?: Record<string, string>;
  body: {
    success: boolean;
    data?: T;
    error?: {
      message: string;
      code?: string;
      details?: any;
    };
    pagination?: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user?: {
    sub: string;
    email: string;
    username?: string;
    groups?: string[];
  };
}

export type LambdaHandler<T = any> = (
  event: AuthenticatedEvent
) => Promise<APIGatewayProxyResult>;

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
  validationErrors?: ValidationError[];
}

export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface RequestContext {
  requestId: string;
  userId?: string;
  userGroups?: string[];
  correlationId?: string;
  startTime: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface CacheInfo {
  hit: boolean;
  ttl?: number;
  key?: string;
}

export interface PerformanceMetrics {
  duration: number;
  memoryUsed: number;
  dbQueries?: number;
  cacheHits?: number;
  cacheMisses?: number;
}
