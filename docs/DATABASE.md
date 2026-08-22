# Database Documentation

## Entity Relationship Overview

The Finance Management System uses relational entities for users, security roles, transactions, categories, budgets, savings goals, notifications, and audit logging.

## Core Tables

- **`users`**: Manages user authentication credentials, names, status, and login timestamps.
- **`roles`**: Defines user authorization roles (`User`, `Admin`).
- **`user_roles`**: Junction table mapping users to roles.
- **`categories`**: Financial categories for expenses and income (e.g. Food, Salary, Transport).
- **`payment_methods`**: Payment methods (Cash, UPI, Debit Card, Credit Card, Bank Transfer, Net Banking).
- **`transactions`**: High-level ledger of all income, expense, and transfer transactions.
- **`income`**: Detailed income entries linked to income sources.
- **`expenses`**: Detailed expense entries linked to categories and payment methods.
- **`budgets`**: Monthly budget targets created per user.
- **`budget_categories`**: Specific category allocations within a monthly budget.
- **`savings_goals`**: User savings goals with target amounts and dates.
- **`savings_transactions`**: Ledger of deposits and withdrawals against savings goals.
- **`notifications`**: User alert messages for budget warnings and account activity.
- **`audit_logs`**: System audit trails recording all admin operations.
