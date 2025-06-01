-- Migration: Additional performance indexes
-- Description: Creates additional indexes for optimal 10K TPS performance

-- Composite indexes for common query patterns
CREATE INDEX idx_products_category_active_price ON products(category_id, is_active, price) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_products_featured_active_created ON products(is_featured, is_active, created_at DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_products_stock_active ON products(stock, is_active) 
    WHERE deleted_at IS NULL AND track_inventory = true;

-- Full-text search optimization
CREATE INDEX idx_products_search_vector ON products 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(description, ''))) 
    WHERE deleted_at IS NULL;

-- User activity indexes
CREATE INDEX idx_users_active_total_spent ON users(is_active, total_spent DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_users_last_login_active ON users(last_login_at DESC, is_active) 
    WHERE deleted_at IS NULL;

-- Cart optimization indexes
CREATE INDEX idx_carts_user_status_updated ON carts(user_id, status, updated_at DESC) 
    WHERE user_id IS NOT NULL;

CREATE INDEX idx_carts_abandoned_recovery ON carts(abandoned_at, recovery_sent_at) 
    WHERE status = 'abandoned';

-- Order analytics indexes
CREATE INDEX idx_orders_user_created_status ON orders(user_id, created_at DESC, order_status) 
    WHERE user_id IS NOT NULL;

CREATE INDEX idx_orders_date_status_total ON orders(DATE(created_at), order_status, total) 
    WHERE order_status NOT IN ('cancelled');

CREATE INDEX idx_orders_payment_created ON orders(payment_status, created_at DESC);

-- Additional order indexes for high performance
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_confirmed_at ON orders(confirmed_at) WHERE confirmed_at IS NOT NULL;
CREATE INDEX idx_orders_shipped_at ON orders(shipped_at) WHERE shipped_at IS NOT NULL;
CREATE INDEX idx_orders_total ON orders(total);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_order_items_sku ON order_items(product_sku);

-- Partial indexes for specific use cases
CREATE INDEX idx_active_products_by_category ON products(category_id, created_at DESC) 
    WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX idx_low_stock_products ON products(stock, name) 
    WHERE track_inventory = true AND stock <= low_stock_threshold AND is_active = true;

CREATE INDEX idx_recent_orders ON orders(created_at DESC) 
    WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- Performance statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE calls > 10
ORDER BY mean_time DESC;
