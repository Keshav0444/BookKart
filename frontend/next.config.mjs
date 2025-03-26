
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:true,
  eslint:{
    ignoreDuringBuilds:true,
  },
  images: {
    domains: ['lh3.googleusercontent.com','res.cloudinary.com','images.unsplash.com','media.istockphoto.com'], 
  },
};

export default nextConfig;
