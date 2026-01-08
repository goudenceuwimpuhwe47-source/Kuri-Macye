# Kuri-Macye - Multi-Vendor E-Commerce Platform

Kuri-Macye is a full-stack multi-vendor e-commerce web application designed to connect customers with multiple sellers. It features a robust multi-role system (Customer, Seller, Admin), secure authentication, real-time cart handling, and integrated payment gateways including MTN Mobile Money and Stripe.

## 🚀 Features

### Public Features
- **Product Browsing**: Browse products from various sellers with filtering by category, price, and search.
- **Product Details**: View detailed product information, seller details, and customer reviews.

### Customer Features
- **Shopping Cart**: Manage items from multiple sellers in a single cart.
- **Checkout**: Secure checkout process with shipping address and order summary.
- **Order History**: Track order status (Pending, Paid, Shipped, Delivered).
- **Reviews**: Rate and review purchased products.
- **Payments**: Pay via **MTN Mobile Money** (Sandbox) or **Credit Card** (Stripe).

### Seller Features
- **Seller Dashboard**: Manage store profile and view sales statistics.
- **Product Management**: Add, edit, and delete own products.
- **Order Management**: View and fulfill orders containing own products.

### Admin Features
- **User Management**: View users, change roles, and deactivate/reactivate accounts.
- **Seller Approval**: Approve or block seller accounts.
- **Global Oversight**: Manage all products and orders across the platform.

## 🛠️ Tech Stack

- **Frontend**: React.js, React Router, Axios, CSS3 (Custom & Responsive)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, Google OAuth (Passport.js)
- **Payments**: MTN MoMo API, Stripe

## ⚙️ How to Run

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/goudenceuwimpuhwe47-source/Kuri-Macye.git
cd Kuri-Macye
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=http://localhost:5000/auth/google/callback
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
STRIPE_SECRET_KEY=your_stripe_secret_key
MTN_MOMO_PRIMARY_KEY=your_momo_primary_key
MTN_MOMO_API_USER=generated_api_user
MTN_MOMO_API_KEY=generated_api_key
client_url=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Navigate to the frontend folder and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start the frontend development server:
```bash
npm run dev
# App runs on http://localhost:5173
```

### 4. Database Seeding (Optional)
To create a default admin user, run the seeder script in the `backend` directory:
```bash
node seeder.js
```

## 🔑 Default Admin Credentials

If you ran the seeder script, you can log in with:

- **Email**: `goudenceuwimpuhwe47@gmail.com`
- **Password**: `kurimake123`

## 🤝 Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
