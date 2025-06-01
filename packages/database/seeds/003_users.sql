-- Seed data for users

INSERT INTO users (
    id, cognito_sub, email, username, first_name, last_name, phone_number,
    date_of_birth, gender, avatar_url, addresses, preferences,
    newsletter_subscribed, marketing_consent, is_active, is_verified,
    total_orders, total_spent, average_order_value, metadata
) VALUES
-- Admin/Test Users
('770e8400-e29b-41d4-a716-446655440001', 'admin-123456789', 'admin@example.com', 'admin', 'Admin', 'User', '+1-555-0100', '1985-01-15', 'prefer-not-to-say', 'https://example.com/avatars/admin.jpg', 
    '[{"id": "addr-001", "firstName": "Admin", "lastName": "User", "address1": "123 Admin St", "city": "San Francisco", "province": "CA", "country": "US", "zip": "94105", "isDefault": true}]',
    '{"notifications": {"email": true, "sms": false}, "theme": "dark", "language": "en"}',
    true, true, true, true, 0, 0.00, 0.00, '{"role": "admin", "permissions": ["read", "write", "delete"]}'),

-- Customer Users
('770e8400-e29b-41d4-a716-446655440002', 'user-123456789', 'john.doe@example.com', 'johndoe', 'John', 'Doe', '+1-555-0101', '1990-05-20', 'male', 'https://example.com/avatars/john.jpg',
    '[{"id": "addr-002", "firstName": "John", "lastName": "Doe", "address1": "456 Main St", "address2": "Apt 2B", "city": "New York", "province": "NY", "country": "US", "zip": "10001", "phone": "+1-555-0101", "isDefault": true}]',
    '{"notifications": {"email": true, "sms": true}, "currency": "USD", "language": "en"}',
    true, true, true, true, 3, 1247.97, 415.99, '{}'),

('770e8400-e29b-41d4-a716-446655440003', 'user-987654321', 'jane.smith@example.com', 'janesmith', 'Jane', 'Smith', '+1-555-0102', '1988-12-10', 'female', 'https://example.com/avatars/jane.jpg',
    '[{"id": "addr-003", "firstName": "Jane", "lastName": "Smith", "address1": "789 Oak Ave", "city": "Los Angeles", "province": "CA", "country": "US", "zip": "90210", "phone": "+1-555-0102", "isDefault": true}, {"id": "addr-004", "firstName": "Jane", "lastName": "Smith", "company": "Tech Corp", "address1": "321 Business Blvd", "city": "Los Angeles", "province": "CA", "country": "US", "zip": "90211", "isDefault": false}]',
    '{"notifications": {"email": true, "sms": false}, "currency": "USD", "language": "en", "size_preferences": {"clothing": "M", "shoes": "8"}}',
    true, false, true, true, 5, 2156.45, 431.29, '{}'),

('770e8400-e29b-41d4-a716-446655440004', 'user-456789123', 'mike.johnson@example.com', 'mikej', 'Mike', 'Johnson', '+1-555-0103', '1992-03-25', 'male', 'https://example.com/avatars/mike.jpg',
    '[{"id": "addr-005", "firstName": "Mike", "lastName": "Johnson", "address1": "555 Pine St", "city": "Seattle", "province": "WA", "country": "US", "zip": "98101", "phone": "+1-555-0103", "isDefault": true}]',
    '{"notifications": {"email": false, "sms": true}, "currency": "USD", "language": "en"}',
    false, true, true, true, 1, 399.00, 399.00, '{}'),

('770e8400-e29b-41d4-a716-446655440005', 'user-789123456', 'sarah.wilson@example.com', 'sarahw', 'Sarah', 'Wilson', '+1-555-0104', '1995-08-14', 'female', 'https://example.com/avatars/sarah.jpg',
    '[{"id": "addr-006", "firstName": "Sarah", "lastName": "Wilson", "address1": "222 Elm St", "city": "Chicago", "province": "IL", "country": "US", "zip": "60601", "phone": "+1-555-0104", "isDefault": true}]',
    '{"notifications": {"email": true, "sms": true}, "currency": "USD", "language": "en", "interests": ["technology", "books", "fitness"]}',
    true, true, true, true, 2, 849.98, 424.99, '{}'),

('770e8400-e29b-41d4-a716-446655440006', 'user-321654987', 'alex.brown@example.com', 'alexb', 'Alex', 'Brown', '+1-555-0105', '1987-11-30', 'non-binary', 'https://example.com/avatars/alex.jpg',
    '[{"id": "addr-007", "firstName": "Alex", "lastName": "Brown", "address1": "777 Maple Dr", "city": "Austin", "province": "TX", "country": "US", "zip": "73301", "phone": "+1-555-0105", "isDefault": true}]',
    '{"notifications": {"email": true, "sms": false}, "currency": "USD", "language": "en", "dietary_preferences": ["vegetarian"]}',
    true, true, true, true, 4, 1678.43, 419.61, '{}'),

-- International Users
('770e8400-e29b-41d4-a716-446655440007', 'user-147258369', 'emma.taylor@example.com', 'emmat', 'Emma', 'Taylor', '+44-20-7946-0958', '1991-06-18', 'female', 'https://example.com/avatars/emma.jpg',
    '[{"id": "addr-008", "firstName": "Emma", "lastName": "Taylor", "address1": "45 Baker Street", "city": "London", "province": "England", "country": "GB", "zip": "NW1 6XE", "phone": "+44-20-7946-0958", "isDefault": true}]',
    '{"notifications": {"email": true, "sms": true}, "currency": "GBP", "language": "en"}',
    true, false, true, true, 2, 756.50, 378.25, '{}'),

('770e8400-e29b-41d4-a716-446655440008', 'user-963852741', 'luc.martin@example.com', 'lucm', 'Luc', 'Martin', '+33-1-42-86-83-26', '1989-09-12', 'male', 'https://example.com/avatars/luc.jpg',
    '[{"id": "addr-009", "firstName": "Luc", "lastName": "Martin", "address1": "12 Rue de Rivoli", "city": "Paris", "province": "Île-de-France", "country": "FR", "zip": "75001", "phone": "+33-1-42-86-83-26", "isDefault": true}]',
    '{"notifications": {"email": true, "sms": false}, "currency": "EUR", "language": "fr"}',
    false, true, true, true, 1, 299.99, 299.99, '{}'),

-- Inactive/Test Users
('770e8400-e29b-41d4-a716-446655440009', 'user-inactive-001', 'inactive@example.com', 'inactive', 'Inactive', 'User', '+1-555-0999', '1980-01-01', 'prefer-not-to-say', NULL,
    '[{"id": "addr-010", "firstName": "Inactive", "lastName": "User", "address1": "999 Inactive St", "city": "Nowhere", "province": "XX", "country": "US", "zip": "00000", "isDefault": true}]',
    '{}', false, false, false, false, 0, 0.00, 0.00, '{"status": "inactive"}'),

('770e8400-e29b-41d4-a716-446655440010', 'user-test-001', 'test@example.com', 'testuser', 'Test', 'User', '+1-555-0000', '2000-01-01', 'prefer-not-to-say', NULL,
    '[{"id": "addr-011", "firstName": "Test", "lastName": "User", "address1": "123 Test Ave", "city": "Test City", "province": "TC", "country": "US", "zip": "12345", "isDefault": true}]',
    '{"notifications": {"email": false, "sms": false}, "test_mode": true}',
    false, false, true, true, 0, 0.00, 0.00, '{"role": "test", "created_for": "testing purposes"}');

-- Update user stats for realistic data
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '2 hours' WHERE email = 'john.doe@example.com';
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE email = 'jane.smith@example.com';
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '3 days' WHERE email = 'mike.johnson@example.com';
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '5 hours' WHERE email = 'sarah.wilson@example.com';
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '12 hours' WHERE email = 'alex.brown@example.com';
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '2 days' WHERE email = 'emma.taylor@example.com';
UPDATE users SET last_login_at = CURRENT_TIMESTAMP - INTERVAL '1 week' WHERE email = 'luc.martin@example.com';
