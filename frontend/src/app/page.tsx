"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  BookOpen,
  Search,
  CreditCard,
  Truck,
  Camera,
  Tag,
  Wallet,
  ArrowRight,
  Library,
  Store,
} from "lucide-react";
import NewBooks from "@/app/Homepage/NewBooks";

const bannerImages = [
  "/images/book1.jpg",
  "/images/book2.jpg",
  "/images/book3.jpg",
];

const blogPosts = [
  {
    imageSrc:
      "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b25saW5lJTIwc2VsbCUyMGJvb2tzfGVufDB8fDB8fHww",
    title: "Where and how to sell old books online?",
    description:
      "Get started with selling your used books online and earn money from your old books.",
    icon: <BookOpen className="w-6 h-6 text-primary" />,
  },
  {
    imageSrc:
      "https://media.istockphoto.com/id/910384920/photo/kid-reading-near-locked-door.webp?a=1&b=1&s=612x612&w=0&k=20&c=J3FL4ZVORItw_bkLzlVo4WO-xUy22S7Qqbuq2xusNnc=",
    title: "What to do with old books?",
    description:
      "Learn about different ways to make use of your old books and get value from them.",
    icon: <Library className="w-6 h-6 text-primary" />,
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1492539438225-2666b2a98f93?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG9sZCUyMCUyMGJvb2tzfGVufDB8fDB8fHww",
    title: "What is BookKart?",
    description:
      "Discover how BookKart helps you buy and sell used books online easily.",
    icon: <Store className="w-6 h-6 text-primary" />,
  },
];

const sellSteps = [
  {
    step: "Step 1",
    title: "Post an ad for selling used books",
    description:
      "Post an ad on BookKart describing your book details to sell your old books online.",
    icon: <Camera className="h-8 w-8 text-primary" />,
  },
  {
    step: "Step 2",
    title: "Set the selling price for your books",
    description: "Set the price for your books at which you want to sell them.",
    icon: <Tag className="h-8 w-8 text-primary" />,
  },
  {
    step: "Step 3",
    title: "Get paid into your UPI/Bank account",
    description:
      "You will get money into your account once you receive an order for your book.",
    icon: <Wallet className="h-8 w-8 text-primary" />,
  },
];

const buySteps = [
  {
    step: "Step 1",
    title: "Select the used books you want",
    description: "Search from over thousands of used books listed on BookKart.",
    icon: <Search className="h-8 w-8 text-primary" />,
  },
  {
    step: "Step 2",
    title: "Place the order by making payment",
    description:
      "Then simply place the order by clicking on the 'Buy Now' button.",
    icon: <CreditCard className="h-8 w-8 text-primary" />,
  },
  {
    step: "Step 3",
    title: "Get the books delivered at your doorstep",
    description: "The books will be delivered to you at your doorstep!",
    icon: <Truck className="h-8 w-8 text-primary" />,
  },
];

export default function Homepage() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentImage === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            Buy and Sell Old Books Online in India
          </h1>
          <div className="flex flex-col sm:flex-row gap-6">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <Link href="/books">
                  <div className="text-left">
                    <div className="text-sm opacity-90">Start Shopping</div>
                    <div className="font-semibold">Buy Used Books</div>
                  </div>
                </Link>
              </div>
            </Button>
            <Button
              size="lg"
              className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-black/10 p-2 rounded-lg group-hover:bg-black/20 transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <Link href="/book-sell">
                  <div className="text-left">
                    <div className="text-sm opacity-90">Start Selling</div>
                    <div className="font-semibold">Sell Old Books</div>
                  </div>
                </Link>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Newly Added Books Section */}
      <NewBooks />
      <Button
        size="lg"
        className="flex mt-10 mb-10 mx-auto bg-yellow-500 px-8 py-6 rounded-xl"
      >
        <Link href="/books">
          <div className="text-sm ">Explore All Books</div>
        </Link>
      </Button>
      {/* How to Sell Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How to <span className="text-primary">SELL</span> your old books
              online on BookKart?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Earning money by selling your old books is just 3 steps away from
              you :)
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-300 -z-10" />
            {sellSteps.map((step, index) => (
              <div key={index} className="relative flex flex-col h-full">
                <div className="bg-white rounded-xl p-8 shadow-lg text-center flex-grow flex flex-col">
                  <div className="absolute top-2 left-14 -translate-x-1/2 bg-yellow-400 text-gray-900  px-4 py-1 rounded-full text-sm font-medium z-10">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Buy Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How to <span className="text-primary">BUY</span> second hand books
              online on BookKart?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Saving some good amount of money by buying used books is just 3
              steps away from you :)
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-300 -z-10" />
            {buySteps.map((step, index) => (
              <div key={index} className="relative flex flex-col h-full">
                <div className="bg-yellow-400 rounded-xl p-8 shadow-lg text-center flex-grow flex flex-col">
                  <div className="absolute top-2 left-14 -translate-x-1/2 bg-primary bg-white text-gray-900 px-4 py-1 rounded-full text-sm font-medium">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[rgb(221,234,254)]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Read from our <span className="text-primary">Blog</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card
                key={index}
                className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.imageSrc}
                      alt={post.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {post.icon}
                      </div>
                      <span className="flex-grow">{post.title}</span>
                    </h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      {post.description}
                    </p>
                    <Button
                      variant="link"
                      className="mt-4 p-0 flex items-center gap-1 text-primary hover:text-primary-dark transition-colors duration-300"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
