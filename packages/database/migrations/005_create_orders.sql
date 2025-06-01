-- Migration: Create orders and order_items tables
-- Description: Order management system

CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed', 
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'partially_refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'partially_paid',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
);

CREATE TYPE fulfillment_status AS ENUM (
    'unfulfilled',
    'partial',
    'fulfilled',
    'shipped',
    'delivered',
    'cancelled'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Contact information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Financial details
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Applied discounts
    applied_coupons JSONB DEFAULT '[]',
    
    -- Addresses
    billing_address JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    
    -- Status tracking
    order_status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    fulfillment_status fulfillment_status DEFAULT 'unfulfilled',
    
    -- Important dates
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(512),
    estimated_delivery_date DATE,
    
    -- Payment
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    
    -- Notes and metadata
    customer_notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product details at time of order
    product_name VARCHAR(500) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_snapshot JSONB NOT NULL,
    
    -- Pricing
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Selected options/variants
    selected_options JSONB DEFAULT '{}',
    
    -- Fulfillment
    fulfilled_quantity INTEGER DEFAULT 0,
    fulfillment_status fulfillment_status DEFAULT 'unfulfilled',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        new_number := 'ORD' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        SELECT COUNT(*) INTO exists_count 
        FROM orders 
        WHERE order_number = new_number;
        
        EXIT WHEN exists_count = 0;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Triggers
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
