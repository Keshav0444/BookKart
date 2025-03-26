"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ShoppingCart,
  Eye,
  User,
  Loader2,
} from "lucide-react";
import {
  useAddToCartMutation,
  useGetProductByIdQuery,
  useRemoveFromWishlistMutation,
  useAddToWishlistMutation,
} from "@/store/api";
import { BookDetails } from "@/types/type";
import BookLoader from "@/lib/BookLoader";
import NoData from "@/lib/NoData";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import { RootState } from "@/store/store";
import {
  removeFromWishlistAction,
  addToWishlistAction,
} from "@/store/slices/wishlistSlice";
import { ShareButton } from "@/app/components/Share";

export default function BookDetailsPage() {
  const params = useParams();
  const id = params.id;
  const { data: apiResponse, isLoading, isError } = useGetProductByIdQuery(id);
  const [book, setBook] = useState<BookDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const router = useRouter();
  const dispatch = useDispatch();
  const [addToCartMutation] = useAddToCartMutation();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (apiResponse?.success) {
      setBook(apiResponse.data);
    }
  }, [apiResponse]);

  const handleAddToCart = async () => {
    if (book) {
      setIsAddingToCart(true);
      try {
        const result = await addToCartMutation({
          productId: book._id,
          quantity: 1,
        }).unwrap();
        console.log("Add to cart successfully", result);
        if (result.success && result.data) {
          dispatch(addToCart(result.data));
          toast.success(result.message || "Added to cart successfully!");
        } else {
          throw new Error(result.message || "Failed to add to cart");
        }
      } catch (error: any) {
        const errorMessage = error?.data?.message;
        toast.error(errorMessage);
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const isInWishlist = wishlist.some((item) =>
        item.products.includes(productId)
      );
      console.log(isInWishlist);
      if (isInWishlist) {
        const result = await removeFromWishlist(productId).unwrap();
        if (result.success) {
          dispatch(removeFromWishlistAction(productId));

          toast.success("Removed from wishlist");
        } else {
          throw new Error(result.message || "Failed to remove from wishlist");
        }
      } else {
        const result = await addToWishlist(productId).unwrap();
        if (result.success) {
          const results = dispatch(addToWishlistAction(result.data));
          console.log(results);
          toast.success("Added to wishlist");
        } else {
          throw new Error(result.message || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update wishlist");
    }
  };

  if (isLoading) {
    return <BookLoader />;
  }

  if (!book || isError) {
    return (
      <div className="my-10 max-w-3xl justify-center mx-auto">
        <NoData
          imageUrl="/images/no-book.jpg"
          message="Loading...."
          description="Wait, we are fetching book details"
          onClick={() => router.push("/book-sell")}
          buttonText="Sell Your First Book"
        />
      </div>
    );
  }

  const bookImages = book?.images || [];

  const calculateDiscount = (price: number, finalPrice: number): number => {
    if (price > finalPrice && price > 0) {
      return Math.round(((price - finalPrice) / price) * 100);
    }
    return 0;
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  console.log(book);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground bg-white p-4 rounded-lg shadow-sm">
          <Link href="/" className=" hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href="/books" className=" hover:underline">
            Books
          </Link>
          <span>/</span>
          <p className="text-gray-600">{book.category}</p>
          <span>/</span>
          <span className="text-gray-600">{book.title}</span>
        </nav>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Gallery - Decreased size */}
          <div className="space-y-4">
            <div className="relative h-[400px] overflow-hidden rounded-lg border bg-white shadow-md">
              <Image
                src={bookImages[selectedImage]}
                alt={book.title}
                fill
                className="object-contain"
              />
              {calculateDiscount(book.price, book.finalPrice) > 0 && (
                <span className="absolute left-0 top-2 rounded-r-lg bg-red-500 px-2 py-1 text-xs font-medium text-white">
                  {calculateDiscount(book.price, book.finalPrice)}% Off
                </span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {bookImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                    selectedImage === index
                      ? "ring-2 ring-primary scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${book.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{book.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Posted {formatDate(book.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <ShareButton
                  url={`${window.location.origin}/books/${book._id}`}
                  title={`Check out this book: ${book.title}`}
                  text={`I found this interesting book on BookKart: ${book.title}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWishlist(book._id)}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${
                      wishlist.some((w) => w.products.includes(book._id))
                        ? "fill-red-500"
                        : ""
                    }`}
                  />
                  <span className="hidden md:inline">
                    {wishlist.some((w) => w.products.includes(book._id))
                      ? "Remove"
                      : "Add"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold">₹{book?.finalPrice}</span>
                {book?.price && book.price > book.finalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{book.price}
                  </span>
                )}
                <Badge variant="secondary" className="text-green-600">
                  Shipping Available
                </Badge>
              </div>

              <Button
                className="w-60 py-6 bg-blue-700"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Book Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-medium text-muted-foreground">
                      Subject/Title
                    </div>
                    <div>{book?.subject}</div>
                    <div className="font-medium text-muted-foreground">
                      Course
                    </div>
                    <div>{book?.classType}</div>
                    <div className="font-medium text-muted-foreground">
                      Category
                    </div>
                    <div>{book?.category}</div>
                    <div className="font-medium text-muted-foreground">
                      Author
                    </div>
                    <div>{book?.author || "-"}</div>
                    <div className="font-medium text-muted-foreground">
                      Edition
                    </div>
                    <div>{book?.edition || "-"}</div>
                    <div className="font-medium text-muted-foreground">
                      Condition
                    </div>
                    <div>{book?.condition}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Description and Seller Info Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Description */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{book.description}</p>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Our Community</h3>
                <p className="text-muted-foreground">
                  We're not just another shopping website where you buy from
                  professional sellers -{" "}
                  <span className="text-primary">
                    we are a vibrant community of students, book lovers across
                    India
                  </span>{" "}
                  who deliver happiness to each other!
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>Ad Id: {book._id}</div>
                <div>Posted: {formatDate(book.createdAt)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Sold By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{book.seller?.name}</span>
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {book.seller?.addresses?.[0]?.city
                        ? `${book.seller.addresses[0].city}, ${book.seller.addresses[0].state}`
                        : "Location not specified"}
                    </div>
                  </div>
                </div>
              </div>
              {book.seller?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <span>Contact: {book.seller.phoneNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">How does it work?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "Step 1",
                title: "Seller posts an Ad",
                description:
                  "Seller posts an ad on book kart to sell their used books.",
                image: { src: "/icons/ads.png", alt: "Post Ad" },
              },
              {
                step: "Step 2",
                title: "Buyer Pays Online",
                description:
                  "Buyer makes an online payment to book kart to buy those books.",
                image: { src: "/icons/pay_online.png", alt: "Payment" },
              },
              {
                step: "Step 3",
                title: "Seller ships the books",
                description: "Seller then ships the books to the buyer",
                image: { src: "/icons/fast-delivery.png", alt: "Shipping" },
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-amber-50 to-amber-100 border-none"
              >
                <CardHeader>
                  <Badge className="w-fit mb-2">{item.step}</Badge>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
