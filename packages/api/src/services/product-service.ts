import { DatabaseService } from './database';
import { CacheService } from './cache';
import { Product } from '../models/product';
import { logger } from '@ecommerce/shared';

export interface GetProductsFilters {
  category?: string;
  limit: number;
  offset: number;
  search?: string;
  sortBy: 'name' | 'price' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface GetProductsResult {
  products: Product[];
  total: number;
}

export class ProductService {
  private db: DatabaseService;
  private cache: CacheService;

  constructor() {
    this.db = new DatabaseService();
    this.cache = new CacheService();
  }

  async getProducts(filters: GetProductsFilters): Promise<GetProductsResult> {
    const cacheKey = this.generateCacheKey(filters);
    
    try {
      // Try to get from cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.info('Products retrieved from cache', { cacheKey });
        return JSON.parse(cached);
      }

      // If not in cache, query database
      const result = await this.queryProductsFromDatabase(filters);
      
      // Cache the result for 5 minutes
      await this.cache.set(cacheKey, JSON.stringify(result), 300);
      
      logger.info('Products retrieved from database and cached', { 
        cacheKey,
        count: result.products.length 
      });

      return result;

    } catch (error) {
      logger.error('Error in ProductService.getProducts', { error, filters });
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    
    try {
      // Try cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Query database
      const query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = $1 AND p.deleted_at IS NULL
      `;
      
      const result = await this.db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const product = this.mapRowToProduct(result.rows[0]);
      
      // Cache for 10 minutes
      await this.cache.set(cacheKey, JSON.stringify(product), 600);
      
      return product;

    } catch (error) {
      logger.error('Error in ProductService.getProductById', { error, id });
      throw error;
    }
  }

  private async queryProductsFromDatabase(filters: GetProductsFilters): Promise<GetProductsResult> {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    // Add filters
    if (filters.category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      params.push(filters.category);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Add sorting
    const validSortColumns = {
      name: 'p.name',
      price: 'p.price',
      created_at: 'p.created_at'
    };
    
    const sortColumn = validSortColumns[filters.sortBy] || 'p.created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(filters.limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(filters.offset);

    // Execute main query
    const result = await this.db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
    `;
    
    const countParams: any[] = [];
    let countParamCount = 0;

    if (filters.category) {
      countParamCount++;
      countQuery += ` AND c.slug = $${countParamCount}`;
      countParams.push(filters.category);
    }

    if (filters.search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${filters.search}%`);
    }

    const countResult = await this.db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return {
      products: result.rows.map(row => this.mapRowToProduct(row)),
      total
    };
  }

  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      categoryId: row.category_id,
      categoryName: row.category_name,
      sku: row.sku,
      stock: row.stock,
      images: row.images ? JSON.parse(row.images) : [],
      attributes: row.attributes ? JSON.parse(row.attributes) : {},
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private generateCacheKey(filters: GetProductsFilters): string {
    const keyParts = [
      'products',
      filters.category || 'all',
      filters.search || 'nosearch',
      filters.sortBy,
      filters.sortOrder,
      filters.limit.toString(),
      filters.offset.toString()
    ];
    
    return keyParts.join(':');
  }
}
