# Ku-isoko Multi-Vendor E-Commerce Requirements

## 1. Project Overview
**Ku-isoko** is a full-stack multi-vendor e-commerce web application.

- **Backend**: Node.js + Express
- **Frontend**: React
- **Database**: MongoDB

## 2. Roles & Permissions
- **Customer**: Browse products, manage cart, place orders, write reviews.
- **Seller**: Register store, manage products, view relevant order items.
- **Admin**: Manage users, sellers, products, and global settings.

## 3. Functional Requirements

### 3.1 Product Management
- Each product linked to a `sellerId`.
- Fields: name, description, price, stock, category, imageUrl, sellerId.
- **Sellers** can CRUD their own products.
- **Admins** can manage all products.
- **Public** can view all products with filtering (category, price range) and search.

### 3.2 Authentication & User Management
- **Signup**: Email/Password, role selection (Customer/Seller).
- **Login**: JWT-based, verified users only.
- **Google OAuth**: Integrated login.
- **Forgot Password**: OTP-based reset (10-minute lifespan).
- **Admin Control**: Deactivate/reactivate users, manage roles.

### 3.3 Multi-Vendor Logic
- Seller profiles: storeName, storeDescription, phone, logoUrl.
- **Admin Approval**: Sellers must be approved (Active/Pending/Blocked).
- Inactive sellers' products are hidden.

### 3.4 Cart & Orders
- **Multi-Seller Cart**: Items from different sellers in one cart.
- **Multi-Seller Order**: Single order creation containing items from multiple sellers.
- **Order Statuses**: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED.
- **Shipping**: fullName, phone, city, addressLine, status, shipping fee rule.

### 3.5 Reviews
- **Customers**: Add/edit/delete reviews with 1-5 rating and comment. Only if purchased.
- **Display**: Average rating and list on product details.

### 3.6 Payments
- **Required**: MTN MoMo Sandbox.
- **Second Method**: Stripe or PayPal Sandbox.

## 4. Frontend Pages
1. **Home**: Product grid, filters (category, price), search.
2. **Product Details**: Info, Seller name, Reviews, Related Products.
3. **Auth**: Signup, Login, Forgot Password, Reset Password.
4. **Cart**: Manage quantities, total calculation.
5. **Checkout**: Shipping form, Payment selection, simulation.
6. **Order History**: List of orders with status.
7. **Seller Dashboard**: Product management, Order viewing.
8. **Admin Dashboard**: User/Seller management, global oversight.

## 5. Technical Architecture
- **Backend structure**: `/models`, `/routes`, `/controllers`, `/middleware`, `/utils`, `/config`.
- **Security**: JWT, Role-based middleware, `.env` configuration.
