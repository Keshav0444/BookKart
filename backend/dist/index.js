"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const cartRoute_1 = __importDefault(require("./routes/cartRoute"));
const wishListRoute_1 = __importDefault(require("./routes/wishListRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const addressRoute_1 = __importDefault(require("./routes/addressRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const google_strategy_1 = __importDefault(require("./controllers/strategy/google.strategy"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(google_strategy_1.default.initialize());
app.use((0, cookie_parser_1.default)());
// Connect to MongoDB
(0, dbConfig_1.default)();
// Routes
app.use('/api/auth', authRoute_1.default);
app.use('/api/products', productRoute_1.default);
app.use('/api/cart', cartRoute_1.default);
app.use('/api/wishlist', wishListRoute_1.default);
app.use('/api/orders', orderRoute_1.default);
app.use('/api/address', addressRoute_1.default);
app.use('/api/users', userRoute_1.default);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
