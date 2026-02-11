"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToCloudinary = exports.multerMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Function to upload a single file to Cloudinary
const uploadFileToCloudinary = (file) => {
    const options = {
        resource_type: 'image',
    };
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(file.path, options, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
};
exports.uploadFileToCloudinary = uploadFileToCloudinary;
// Multer middleware for handling multiple file uploads
const multerMiddleware = (0, multer_1.default)({ dest: 'uploads/' }).array('images', 4);
exports.multerMiddleware = multerMiddleware;
