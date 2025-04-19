"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useCreateOrUpdateOrderMutation,
  useGetOrderByIdQuery,
  useCreateRazorpayPaymentMutation,
} from "@/store/api";
import { clearCart, setCart } from "@/store/slices/cartSlice";
import {
  removeFromWishlistAction,
  addToWishlistAction,
} from "@/store/slices/wishlistSlice";
import { setCheckoutStep, setOrderId, resetCheckout } from "@/store/slices/checkoutSlice";
import toast from "react-hot-toast";
import NoData from "@/lib/NoData";
import { toggleLoginDialog } from "@/store/slices/userSlice";
import { Address } from "@/types/type";
import BookLoader from "@/lib/BookLoader";
import Script from 'next/script'
import { CartItems } from "@/app/components/CartItems";
import { PriceDetails } from "@/app/components/PriceDetails";
import { Button } from "@/components/ui/button";
import CheckoutAddress from "@/app/components/CheckoutAddress";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const { step, orderId } = useSelector((state: RootState) => state.checkout);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(user?._id);
  const [removeFromCartMutation] = useRemoveFromCartMutation();
  const cart = useSelector((state: RootState) => state.cart);
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [createOrUpdateOrder] = useCreateOrUpdateOrderMutation();
  const { data: orderData, isLoading: isOrderLoading } = useGetOrderByIdQuery(orderId || '');
  const [createRazorpayOrder] = useCreateRazorpayPaymentMutation();
  const [selectedAddress,setSelectedAddress] = useState<Address | null>(null);


   useEffect(() =>{
     if(user && user.role !== "user"){
       router.push('/admin')
     }
   },[user,router])

  useEffect(() => {
    if (orderData && orderData.shippingAddress) {
     setSelectedAddress(orderData.shippingAddress);
    }
  }, [orderData]);

  useEffect(() => {
    if (step === "address" && !selectedAddress) {
      setShowAddressDialog(true);
    }
  }, [step, selectedAddress]);


  useEffect(() => {
    if (cartData?.success && cartData.data) {
      dispatch(setCart(cartData.data));
    }
  }, [cartData, dispatch]);

  const handleRemoveItem = async (productId: string) => {
    try {
      const result = await removeFromCartMutation(productId).unwrap();
      if (result.success && result.data) {
        dispatch(setCart(result.data));
        toast.success(result.message || "Item removed from cart");
      } else {
        throw new Error(result.message || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item from cart");
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const isInWishlist = wishlist.some((item) =>
        item.products.includes(productId)
      );
      console.log(isInWishlist)
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
          dispatch(addToWishlistAction(result.data));
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

  const totalAmount = cart.items.reduce((acc, item) => acc + (item.product.finalPrice * item.quantity), 0);
  const totalOriginalPrice = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalDiscount = totalOriginalPrice - totalAmount;

  const shippingCharge = cart.items.map(item => item.product.shippingCharge.toLowerCase() === 'free' ? 0 : parseFloat(item.product.shippingCharge) || 0)
  const maximunShippingCharge = Math.max(...shippingCharge,0)
  const finalAmount = totalAmount+ maximunShippingCharge;

  const handleOpenLogin = () => {
    dispatch(toggleLoginDialog());
  };

  const handleProceedToCheckout = async () => {
    if (step === "cart") {
      try {
        const result = await createOrUpdateOrder({ updates: { totalAmount: finalAmount } }).unwrap();
        if (result.success) {
          toast.success('Order created successfully')
          dispatch(setOrderId(result.data._id));
          dispatch(setCheckoutStep("address"));
        } else {
          throw new Error(result.message || "Failed to create order");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to create order");
      }
    } else if (step === "address") {
      if (selectedAddress) {
        dispatch(setCheckoutStep("payment"));
      } else {
        setShowAddressDialog(true);
      }
    } else if (step === "payment") {
      handlePayment();
    }
  };

  const handleAddressSelect = async (address: Address) => {
    setSelectedAddress(address);
    setShowAddressDialog(false);
    if (orderId) {
      try {
        await createOrUpdateOrder({updates: { orderId,shippingAddress: address } }).unwrap();
        toast.success("Address updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update address");
      }
    }
  };

  const handlePayment = async () => {
    if (!orderId) {
      toast.error('No order found. Please try again.');
      return;
    }
  
    setIsProcessing(true);
    try {
      const { data, error } = await createRazorpayOrder(orderId);
      console.log('Razorpay Order Data:', data);
  
      if (error) {
        throw new Error('Failed to create Razorpay order');
      }

      const razorpayOrder = data.data.order;
  
      const options = {
        key: 'rzp_test_4GI77KLfXcjflR',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'BookKart',
        description: 'Book Purchase',
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            const result = await createOrUpdateOrder({
              updates: {
                orderId,
                paymentDetails: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
              },
            }).unwrap();
            if (result.success) {
              dispatch(clearCart());
              dispatch(resetCheckout());
              toast.success('Payment successful!');
              router.push(`/checkout/payment-success?orderId=${orderId}`);
            } else {
              throw new Error(result.message || 'Failed to update order');
            }
          } catch (error) {
            console.error('Failed to update order:', error);
            toast.error('Payment successful, but failed to update order. Please contact support.');
          }
        },
        prefill: {
          name: orderData?.data?.user?.name,
          email: orderData?.data?.user?.email,
          contact: orderData?.data?.shippingAddress?.phoneNumber,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <NoData
        message="Please log in to access your cart."
        description="You need to be logged in to view your cart and checkout."
        buttonText="Login"
        imageUrl="/images/login.jpg"
        onClick={handleOpenLogin}
      />
    );
  }
  if (cart.items.length === 0) {
    return (
      <NoData
        message="Your cart is empty."
        description="Looks like you haven't added any items yet. 
        Explore our collection and find something you love!"
        buttonText="Browse Books"
        imageUrl="/images/cart.webp" 
        onClick={() => router.push('/books')}
      />
    );
  }

  if (isCartLoading || isOrderLoading) {
     return <BookLoader/> ;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-white">
        <div className="bg-gray-100 py-4 px-6 mb-8">
          <div className="container mx-auto flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in
              your cart
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full p-3 ${
                    step === "cart"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <span className="font-medium hidden md:inline">Cart</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full p-3 ${
                    step === "address"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="font-medium hidden md:inline">Address</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full p-3 ${
                    step === "payment"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                </div>
                <span className="font-medium hidden md:inline">Payment</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Order Summary</CardTitle>
                  <CardDescription>Review your items</CardDescription>
                </CardHeader>
                <CardContent>
                  <CartItems
                    items={cart.items}
                    onRemoveItem={handleRemoveItem}
                    onToggleWishlist={toggleWishlist}
                    wishlist={wishlist}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <PriceDetails
                totalOriginalPrice={totalOriginalPrice}
                totalDiscount={totalDiscount}
                totalAmount={finalAmount}
                shippingCharge={maximunShippingCharge}
                itemCount={cart.items.length}
                isProcessing={isProcessing}
                step={step}
                onProceed={handleProceedToCheckout}
                onGoBack={() => dispatch(setCheckoutStep(step === "address" ? "cart" : "address"))}
              />
              {selectedAddress && (
                <Card className="mt-6 mb-6 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p>{selectedAddress?.addressLine1}</p>
                      {selectedAddress.addressLine2 && (
                        <p>{selectedAddress.addressLine2}</p>
                      )}
                      <p>
                        {selectedAddress.city}, {selectedAddress.state}{" "}
                        {selectedAddress.pincode}
                      </p>
                      <p>Phone: {selectedAddress.phoneNumber}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowAddressDialog(true)}
                    >
                      <MapPin className="h-4 w-4 mr-2" /> Change Address
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select or Add Delivery Address</DialogTitle>
              </DialogHeader>
              <CheckoutAddress 
                onAddressSelect={handleAddressSelect}
                selectedAddressId={selectedAddress?._id}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

