-- Seed default categories
INSERT INTO categories (name, type, icon) VALUES
('Food & Dining', 'expense', '🍔'),
('Transportation', 'expense', '🚗'),
('Shopping', 'expense', '🛍️'),
('Utilities & Bills', 'expense', '⚡'),
('Entertainment', 'expense', '🎬'),
('Healthcare', 'expense', '🏥'),
('Housing & Rent', 'expense', '🏠'),
('Education', 'expense', '📚'),
('Travel', 'expense', '✈️'),
('Salary', 'income', '💰'),
('Freelance', 'income', '💻'),
('Business', 'income', '💼'),
('Investments', 'income', '📈'),
('Other Income', 'income', '🎁');

-- Seed default payment methods
INSERT INTO payment_methods (name) VALUES 
('Cash'), ('UPI'), ('Debit Card'), ('Credit Card'), 
('Bank Transfer'), ('Net Banking'), ('Other');

-- Seed default roles
INSERT INTO roles (id, name) VALUES (1, 'User'), (2, 'Admin');

-- Seed sample user (Password: Password123!)
-- Hash generated using bcrypt for Password123!
INSERT INTO users (email, username, hashed_password, first_name, last_name, is_active)
VALUES ('user@example.com', 'john_doe', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'John', 'Doe');

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Seed sample admin user (Password: Admin123!)
INSERT INTO users (email, username, hashed_password, first_name, last_name, is_active)
VALUES ('admin@example.com', 'admin_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Admin', 'User');

INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);

-- Seed sample income
INSERT INTO income (user_id, amount, source, description, date)
VALUES (1, 50000.00, 'salary', 'Monthly Salary', CURRENT_TIMESTAMP);

-- Seed sample expenses
INSERT INTO expenses (user_id, amount, category_id, description, payment_method, date)
VALUES 
(1, 1200.00, 1, 'Grocery shopping', 'UPI', CURRENT_TIMESTAMP),
(1, 450.00, 2, 'Fuel refill', 'Credit Card', CURRENT_TIMESTAMP),
(1, 2500.00, 4, 'Electricity bill', 'Net Banking', CURRENT_TIMESTAMP);

-- Seed sample budget
INSERT INTO budgets (user_id, month, year, total_amount)
VALUES (1, 8, 2026, 30000.00);

INSERT INTO budget_categories (budget_id, category_id, allocated_amount)
VALUES (1, 1, 8000.00), (1, 2, 4000.00), (1, 4, 5000.00);

-- Seed sample savings goal
INSERT INTO savings_goals (user_id, title, target_amount, current_amount, target_date, status)
VALUES (1, 'Emergency Fund', 100000.00, 25000.00, '2027-08-01 00:00:00', 'active');
