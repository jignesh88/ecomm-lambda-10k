import Joi from 'joi';
import { ValidationError } from '../types/api';

export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    optional?: boolean;
    default?: any;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
  };
}

export class ValidationService {
  static validateQueryParams<T>(
    params: Record<string, any>,
    schema: ValidationSchema
  ): T {
    const result: any = {};
    const errors: ValidationError[] = [];

    for (const [key, config] of Object.entries(schema)) {
      const value = params[key];

      // Check if required field is missing
      if (config.required && (value === undefined || value === null)) {
        errors.push({
          field: key,
          message: `${key} is required`,
          value,
        });
        continue;
      }

      // Set default value if not provided
      if (value === undefined && config.default !== undefined) {
        result[key] = config.default;
        continue;
      }

      // Skip validation if optional and not provided
      if (config.optional && value === undefined) {
        continue;
      }

      // Type validation
      try {
        result[key] = this.validateFieldType(key, value, config);
      } catch (error) {
        errors.push({
          field: key,
          message: error instanceof Error ? error.message : 'Validation error',
          value,
        });
      }
    }

    if (errors.length > 0) {
      const error = new Error('Validation failed');
      (error as any).validationErrors = errors;
      throw error;
    }

    return result as T;
  }

  private static validateFieldType(
    fieldName: string,
    value: any,
    config: ValidationSchema[string]
  ): any {
    switch (config.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`${fieldName} must be a string`);
        }
        if (config.min && value.length < config.min) {
          throw new Error(`${fieldName} must be at least ${config.min} characters`);
        }
        if (config.max && value.length > config.max) {
          throw new Error(`${fieldName} must be at most ${config.max} characters`);
        }
        if (config.pattern && !config.pattern.test(value)) {
          throw new Error(`${fieldName} has invalid format`);
        }
        if (config.enum && !config.enum.includes(value)) {
          throw new Error(`${fieldName} must be one of: ${config.enum.join(', ')}`);
        }
        return value;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new Error(`${fieldName} must be a number`);
        }
        if (config.min !== undefined && numValue < config.min) {
          throw new Error(`${fieldName} must be at least ${config.min}`);
        }
        if (config.max !== undefined && numValue > config.max) {
          throw new Error(`${fieldName} must be at most ${config.max}`);
        }
        return numValue;

      case 'boolean':
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
        }
        throw new Error(`${fieldName} must be a boolean`);

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`${fieldName} must be an array`);
        }
        if (config.min && value.length < config.min) {
          throw new Error(`${fieldName} must have at least ${config.min} items`);
        }
        if (config.max && value.length > config.max) {
          throw new Error(`${fieldName} must have at most ${config.max} items`);
        }
        return value;

      case 'object':
        if (typeof value !== 'object' || value === null) {
          throw new Error(`${fieldName} must be an object`);
        }
        return value;

      default:
        return value;
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
  }

  static validateUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>"'&]/g, '');
  }

  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Joi schemas for common validations
export const CommonSchemas = {
  uuid: Joi.string().uuid(),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),
  sort: Joi.object({
    sortBy: Joi.string().default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  search: Joi.object({
    search: Joi.string().min(1).max(255).optional(),
  }),
};
