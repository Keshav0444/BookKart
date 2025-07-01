# BookKart – Full Stack E-Commerce Web App

BookKart is a complete full-stack e-commerce application built with Next.js, Node.js, MongoDB, and Tailwind CSS. It features user authentication (OTP & Google login), product browsing, cart, wishlist, checkout with Razorpay payment, and an admin dashboard.

---

## Features

- User registration and login with OTP and Google OAuth
- Browse books by categories with advanced filters
- Add to cart, wishlist, and buy now features
- Secure checkout with Razorpay payment gateway
- User profile and order history management
- Admin panel for managing products, users, and orders
- Responsive UI with Tailwind CSS
- RESTful API backend with Node.js and Express
- MongoDB for data storage

---

## Tech Stack

- Frontend: Next.js, React.js, Tailwind CSS  
- Backend: Node.js, Express.js  
- Database: MongoDB with Mongoose  
- Authentication: JWT, OTP, Google OAuth  
- Payment: Razorpay  

---

## Getting Started

### Prerequisites

- Node.js (v18 or above)  
- MongoDB Atlas account or local MongoDB instance  
- Razorpay account (for payments)  
- Google OAuth credentials (for Google login)  

---

### Clone the Repository

```bash
git clone https://github.com/yourusername/bookkart.git
cd bookkart


# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install


Setup Environment Variables
Create a .env file in the backend directory with the following variables:


MONGODB_URI=your_mongodb_connection_string_here
EMAIL_USER=your_email_address_here
EMAIL_PASS=your_email_password_here
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Cloudinary Configuration (for image upload)
CLOUDINARY_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here



Run the Application
Start Backend Server

cd backend
npm run dev
