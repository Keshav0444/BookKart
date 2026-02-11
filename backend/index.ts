import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoute';
import productRoutes from './routes/productRoute';
import cartRoutes from './routes/cartRoute';
import wishlistRoutes from './routes/wishListRoute';
import orderRoutes from './routes/orderRoute';
import addressRoute from './routes/addressRoute';
import userRoute from './routes/userRoute';
import adminRoute from './routes/adminRoute'
import connectDB from './config/dbConfig';
import passport from './controllers/strategy/google.strategy';
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://book-kart-one.vercel.app"
    ];

    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check if origin matches Vercel preview pattern
    if (/^https:\/\/book-kart-.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize())
app.use(cookieParser());

// Connect to MongoDB
connectDB()


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/address', addressRoute);
app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;