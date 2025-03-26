"use client";

import { Check, Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useAddToCartMutation
} from "@/store/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { removeFromWishlistAction } from "@/store/slices/wishlistSlice";
import toast from "react-hot-toast";
import BookLoader from "@/lib/BookLoader";
import NoData from "@/lib/NoData";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/store/slices/cartSlice";
import { BookDetails } from "@/types/type";


export default function WishlistPage() {
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const dispatch = useDispatch();
  const router = useRouter()
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { data: wishListData, isLoading } = useGetWishlistQuery({});
  const [wishlistItems, setWishlistItems] = useState<BookDetails[]>([]);
  const [addToCartMutation] = useAddToCartMutation();
  const cart = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    if (wishListData?.success) {
      setWishlistItems(wishListData.data.products);
    }
  }, [wishListData]);
  console.log(wishListData)

  const toggleWishlist = async (productId: string) => {
    try {
      const isInWishlist = wishlist.some((item) =>
        item.products.includes(productId)
      );
      if (isInWishlist) {
        const result = await removeFromWishlist(productId).unwrap();
        if (result.success) {
          dispatch(removeFromWishlistAction(productId));
          toast.success("Removed from wishlist");
        } else {
          throw new Error(result.message || "Failed to remove from wishlist");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update wishlist");
    }
  };


  const handleAddToCart = async (productId: string) => {
      setIsAddingToCart(true);
      try {
        const result = await addToCartMutation({
          productId,
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
        const errorMessage = error?.data?.message 
        toast.error(errorMessage);
      } finally {
        setIsAddingToCart(false);
      }
    }
 
    console.log('Add to cart successfully',cart)
    const isItemInCart = (productId: string) => {
      return cart.some((cartItem) => cartItem.product._id === productId);
    };

    console.log(isItemInCart)

  if (isLoading) return <BookLoader />;
  if (!wishlistItems.length)
    return (
      <NoData
        message="Your wishlist is empty."
        description="Looks like you haven't added any items to your wishlist yet. 
             Browse our collection and save your favorites!"
        buttonText="Browse Books"
        imageUrl="/images/wishlist.webp"
        onClick={() => router.push("/books")}
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Heart className="h-6 w-6 text-red-600" />
        <h3 className="text-2xl font-bold">My Wishlist</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>${item.finalPrice.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={item.images[0]}
                alt={item.title}
                className="aspect-square w-full object-cover"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleWishlist(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {isItemInCart(item._id) ? (
                <Button disabled>
                  <Check className="mr-2 h-5 w-5" />
                  Item in Cart
                </Button>
              ) : (
                <Button onClick={() => handleAddToCart(item._id)}>
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
