🐰 Rabbit E-commerce Platform

Live Application URL: https://rabbit-gray.vercel.app/

A full-stack, responsive e-commerce application built with the MERN (MongoDB, Express, React, Node.js) stack. This platform features robust user authentication, a dynamic shopping cart, integrated payment processing, and comprehensive admin tools for product and order management.

✨ Key Features

User Experience (Frontend)

Intuitive Product Catalog: Browse products categorized by collections with filtering and pagination.

Dynamic Shopping Cart: Supports persistent carts for both registered users and anonymous guests.

Secure Authentication: User login and registration, including password reset functionality.

User Profile & Order History: Users can manage their profile information and view all past orders.

Integrated Checkout: Seamless checkout flow with support for shipping details and payment integration (e.g., Stripe/PayPal integration placeholder).

Responsive Design: Optimized for mobile, tablet, and desktop viewing.

Backend & Administration

RESTful API: Robust backend API built with Express.js and Node.js.

Product Management: Admin dashboard for creating, reading, updating, and deleting products (CRUD).

User Management: Admin controls to view and manage all registered users.

Order Management: Admins can view and update the status of all incoming orders.

Middleware: Secure routing using JSON Web Tokens (JWT) for user and admin authentication.

Database: MongoDB Atlas for flexible, scalable data storage.

💻 Tech Stack

Category

Technology

Description

Frontend

React, Redux Toolkit, React Router

Modern UI, global state management, and navigation.

Styling

Tailwind CSS

Utility-first CSS framework for rapid and responsive styling.

Backend

Node.js, Express.js

JavaScript runtime and web application framework.

Database

MongoDB, Mongoose

NoSQL database and an ODM (Object Data Modeling) library for Node.js.

Security

JWT, bcrypt

User authentication and password hashing.

Deployment

Vercel (Frontend), Vercel (Backend Serverless)

Continuous deployment and serverless hosting.

🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites

You need the following installed on your system:

Node.js (LTS recommended)

MongoDB Atlas Account (or local MongoDB instance)

Git

Backend Setup

Clone the repository:

git clone [Your Repository URL] rabbit-ecommerce
cd rabbit-ecommerce


Navigate to the backend directory and install dependencies:

cd backend
npm install


Create a .env file in the backend directory and add your environment variables:

PORT=5000
NODE_ENV=development
MONGO_URI="YOUR_MONGODB_CONNECTION_STRING"
JWT_SECRET="A_STRONG_SECRET_KEY"
# Example:
VITE_BACKEND_URL="http://localhost:5000" 


Run the backend server:

npm start


The server will run on http://localhost:5000 (or the port specified in your .env).

Frontend Setup

Navigate to the frontend directory and install dependencies:

cd ../frontend
npm install


Create a .env file in the frontend directory and add the Vercel backend URL:

VITE_BACKEND_URL="[https://rabbit-server-omega.vercel.app](https://rabbit-server-omega.vercel.app)" 
# For local development: VITE_BACKEND_URL="http://localhost:5000"


Run the frontend application:

npm run dev


The React application will open on http://localhost:3000 (or another port).

🗺️ API Endpoints (Example)

Method

Endpoint

Description

Requires Auth

GET

/api/products

Get a list of all products.

No

GET

/api/products/:id

Get details for a specific product.

No

GET

/api/cart?userId=...

Retrieve the user's or guest's cart.

No

POST

/api/users/login

Log a user in and return a JWT.

No

POST

/api/cart

Add a product to the cart.

No

POST

/api/checkout

Process the final order and payment.

Yes

GET

/api/admin/orders

Admin: View all orders.

Admin

📝 Folder Structure

.
├── backend/
│   ├── config/             # DB connection and configuration
│   ├── middleware/         # Auth, error handling, etc.
│   ├── models/             # Mongoose schemas (User, Product, Order, Cart)
│   ├── routes/             # API routes (userRoutes, productRoutes, cartRoutes)
│   └── server.js           # Main application entry point
└── frontend/
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Router-level components (Home, Checkout, Admin)
    │   ├── redux/          # Redux slices and store configuration
    │   └── App.jsx         # Main application and router setup


👥 Contributors

[Bublai Sarkar] - Initial Work & Maintenance - (https://github.com/bublaisarkar)