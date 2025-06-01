-- Migration: Create cart and cart_items tables
-- Description: Shopping cart functionality

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    
    -- Applied discounts/coupons
    applied_coupons JSONB DEFAULT '[]',
    
    -- Shipping and billing addresses
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Cart status
    status VARCHAR(50) DEFAULT 'active', -- active, abandoned, converted
    abandoned_at TIMESTAMP WITH TIME ZONE,
    
    -- Recovery
    recovery_token VARCHAR(255),
    recovery_sent_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product snapshot (in case product changes)
    product_snapshot JSONB NOT NULL, -- Stores product details at time of addition
    
    -- Custom options/variants
    selected_options JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(cart_id, product_id, selected_options)
);

-- Indexes
CREATE INDEX idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_carts_abandoned_at ON carts(abandoned_at) WHERE abandoned_at IS NOT NULL;
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Triggers
CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate cart totals
CREATE OR REPLACE FUNCTION recalculate_cart_totals(cart_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE carts 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM cart_items 
            WHERE cart_id = cart_uuid
        ),
        total = subtotal + tax_amount + shipping_amount - discount_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = cart_uuid;
END;
$$ LANGUAGE plpgsql;
