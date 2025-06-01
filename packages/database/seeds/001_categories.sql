-- Seed data for categories

INSERT INTO categories (id, name, slug, description, parent_id, image_url, is_active, sort_order, metadata) VALUES
-- Main categories
('550e8400-e29b-41d4-a716-446655440001', 'Electronics', 'electronics', 'Electronic devices and accessories', NULL, 'https://example.com/images/electronics.jpg', true, 1, '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'Clothing', 'clothing', 'Fashion and apparel', NULL, 'https://example.com/images/clothing.jpg', true, 2, '{}'),
('550e8400-e29b-41d4-a716-446655440003', 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL, 'https://example.com/images/home-garden.jpg', true, 3, '{}'),
('550e8400-e29b-41d4-a716-446655440004', 'Sports & Outdoors', 'sports-outdoors', 'Sporting goods and outdoor equipment', NULL, 'https://example.com/images/sports.jpg', true, 4, '{}'),
('550e8400-e29b-41d4-a716-446655440005', 'Books', 'books', 'Books and literature', NULL, 'https://example.com/images/books.jpg', true, 5, '{}'),

-- Electronics subcategories
('550e8400-e29b-41d4-a716-446655440011', 'Smartphones', 'smartphones', 'Mobile phones and accessories', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/smartphones.jpg', true, 1, '{}'),
('550e8400-e29b-41d4-a716-446655440012', 'Laptops', 'laptops', 'Portable computers', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/laptops.jpg', true, 2, '{}'),
('550e8400-e29b-41d4-a716-446655440013', 'Headphones', 'headphones', 'Audio devices', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/headphones.jpg', true, 3, '{}'),
('550e8400-e29b-41d4-a716-446655440014', 'Cameras', 'cameras', 'Digital cameras and accessories', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/images/cameras.jpg', true, 4, '{}'),

-- Clothing subcategories
('550e8400-e29b-41d4-a716-446655440021', 'Men\'s Clothing', 'mens-clothing', 'Clothing for men', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/images/mens-clothing.jpg', true, 1, '{}'),
('550e8400-e29b-41d4-a716-446655440022', 'Women\'s Clothing', 'womens-clothing', 'Clothing for women', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/images/womens-clothing.jpg', true, 2, '{}'),
('550e8400-e29b-41d4-a716-446655440023', 'Shoes', 'shoes', 'Footwear for all', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/images/shoes.jpg', true, 3, '{}'),
('550e8400-e29b-41d4-a716-446655440024', 'Accessories', 'accessories', 'Fashion accessories', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/images/accessories.jpg', true, 4, '{}'),

-- Home & Garden subcategories
('550e8400-e29b-41d4-a716-446655440031', 'Furniture', 'furniture', 'Home furniture', '550e8400-e29b-41d4-a716-446655440003', 'https://example.com/images/furniture.jpg', true, 1, '{}'),
('550e8400-e29b-41d4-a716-446655440032', 'Kitchen', 'kitchen', 'Kitchen appliances and tools', '550e8400-e29b-41d4-a716-446655440003', 'https://example.com/images/kitchen.jpg', true, 2, '{}'),
('550e8400-e29b-41d4-a716-446655440033', 'Garden', 'garden', 'Gardening supplies', '550e8400-e29b-41d4-a716-446655440003', 'https://example.com/images/garden.jpg', true, 3, '{}'),

-- Sports subcategories
('550e8400-e29b-41d4-a716-446655440041', 'Fitness', 'fitness', 'Fitness equipment', '550e8400-e29b-41d4-a716-446655440004', 'https://example.com/images/fitness.jpg', true, 1, '{}'),
('550e8400-e29b-41d4-a716-446655440042', 'Outdoor Gear', 'outdoor-gear', 'Camping and hiking gear', '550e8400-e29b-41d4-a716-446655440004', 'https://example.com/images/outdoor-gear.jpg', true, 2, '{}'),

-- Books subcategories
('550e8400-e29b-41d4-a716-446655440051', 'Fiction', 'fiction', 'Fiction books', '550e8400-e29b-41d4-a716-446655440005', 'https://example.com/images/fiction.jpg', true, 1, '{}'),
('550e8400-e29b-41d4-a716-446655440052', 'Non-Fiction', 'non-fiction', 'Non-fiction books', '550e8400-e29b-41d4-a716-446655440005', 'https://example.com/images/non-fiction.jpg', true, 2, '{}'),
('550e8400-e29b-41d4-a716-446655440053', 'Technology', 'technology-books', 'Technology and programming books', '550e8400-e29b-41d4-a716-446655440005', 'https://example.com/images/tech-books.jpg', true, 3, '{}');
