-- Migration: Create products table
-- Description: Creates the products table with all necessary fields for ecommerce

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(1000),
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price >= 0),
    cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
    track_inventory BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    weight DECIMAL(8,3),
    dimensions JSONB, -- {length, width, height, unit}
    images JSONB DEFAULT '[]', -- Array of image URLs
    attributes JSONB DEFAULT '{}', -- Product-specific attributes
    seo_title VARCHAR(255),
    seo_description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    taxable BOOLEAN DEFAULT true,
    vendor VARCHAR(255),
    tags TEXT[], -- Array of tags
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for high-performance queries
CREATE INDEX idx_products_slug ON products(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category_id ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_price ON products(price) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_stock ON products(stock) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_created_at ON products(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_name_text ON products USING gin(to_tsvector('english', name)) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_description_text ON products USING gin(to_tsvector('english', description)) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_tags ON products USING gin(tags) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
