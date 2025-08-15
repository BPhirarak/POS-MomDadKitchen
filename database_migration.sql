-- Database Migration Script for POS-MomDadKitchen
-- Update menu_items table structure and create customer_master table

-- Drop existing menu_items table (backup data first if needed)
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create new menu_items table with structure from FoodMenuMaster.csv
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(255),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    sold_by_weight BOOLEAN DEFAULT FALSE,
    option_1_name VARCHAR(100),
    option_1_value VARCHAR(100),
    option_2_name VARCHAR(100),
    option_2_value VARCHAR(100),
    option_3_name VARCHAR(100),
    option_3_value VARCHAR(100),
    cost DECIMAL(10,2),
    barcode VARCHAR(255),
    sku_of_included_item VARCHAR(50),
    quantity_of_included_item INTEGER,
    track_stock BOOLEAN DEFAULT FALSE,
    available_for_sale_organic BOOLEAN DEFAULT TRUE,
    price_organic DECIMAL(10,2),
    in_stock_organic INTEGER DEFAULT 0,
    low_stock_organic INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_master table with structure from CustomerMaster.csv
CREATE TABLE customer_master (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    customer_code VARCHAR(50),
    points_balance INTEGER DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_sku ON menu_items(sku);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_customer_master_customer_id ON customer_master(customer_id);
CREATE INDEX idx_customer_master_customer_name ON customer_master(customer_name);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_master_updated_at
    BEFORE UPDATE ON customer_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();