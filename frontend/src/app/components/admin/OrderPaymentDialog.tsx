import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProcessSellerPaymentMutation } from "@/store/adminApi";
import { IndianRupee, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface OrderPaymentDialogProps {
  order: any;
  onClose: () => void;
}
const OrderPaymentDialog: React.FC<OrderPaymentDialogProps> = ({
  order,
  onClose,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const router = useRouter();
  const [processPayment, { isLoading }] = useProcessSellerPaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await processPayment({
        orderId: order._id,
        paymentData: {
          productId: selectedProduct,
          paymentMethod,
          amount: order.totalAmount,
          notes,
        },
      }).unwrap();

      toast.success("Payment Processed successfully");
      onClose();
      router.refresh();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update order");
    }
  };

  const getSelectProduct = () => {
    if (!selectedProduct) return null;
    return order.items.find((item: any) => item.product._id === selectedProduct)
      ?.product;
  };

  const product = getSelectProduct();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Select Product</Label>
          <Select
            value={selectedProduct}
            onValueChange={setSelectedProduct}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {order.items.map((item: any) => (
                <SelectItem key={item?.product?._id} value={item?.product?._id}>
                  {item.product.subject} (₹{item.product.finalPrice})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {product && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span>{product.seller.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span>{product.seller.email}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <span>{product.seller?.phoneNumber || "Not Provided"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium">Payment Method:</span>
                  <span>{product.paymentMode || "Not Specified"}</span>
                </div>

                {product.paymentMode === "UPI" &&
                  product.paymentDetails?.upiId && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">UPI ID:</span>
                      <span>{product.paymentDetails?.upiId}</span>
                    </div>
                  )}

                {product.paymentMode === "Bank Account" &&
                  product.paymentDetails?.bankDetails && (
                    <>
                            <div className="flex justify-between">
                      <span className="text-sm font-medium">Bank:</span>
                      <span>{product.paymentDetails?.bankDetails?.bankName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Account Number:</span>
                      <span>{product.paymentDetails?.bankDetails?.accountNumber}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium">IFSC Code:</span>
                      <span>{product.paymentDetails?.bankDetails?.ifscCode}</span>
                    </div>
                    </>

                  )}
              </div>
            </CardContent>
          </Card>
        )}


<div className="space-y-2">
          <Label htmlFor="status">Payment Method</Label>
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
                 <SelectItem value="UPI">UPI</SelectItem>
                         <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                         <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>


        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"/>
          <Input
            id="amount"
            type="number"
            value={order.totalAmount}
            onChange={() => {}}
            placeholder="0.00"
            className="pl-9"
            required
          />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this update"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
          >
            {isLoading ? "Processing.." : "Process Payment"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default OrderPaymentDialog;
