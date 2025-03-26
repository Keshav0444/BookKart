import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';

interface PriceDetailsProps {
  totalOriginalPrice: number;
  totalDiscount: number;
  totalAmount: number;
  itemCount: number;
  shippingCharge:number;
  isProcessing: boolean;
  step: 'cart' | 'address' | 'payment';
  onProceed: () => void;
  onGoBack: () => void;
}

export const PriceDetails: React.FC<PriceDetailsProps> = ({
  shippingCharge,
  totalOriginalPrice,
  totalDiscount,
  totalAmount,
  itemCount,
  isProcessing,
  step,
  onProceed,
  onGoBack,
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Price Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Price ({itemCount} items)</span>
          <span>₹{totalOriginalPrice}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>- ₹{totalDiscount}</span>
        </div>
        <div className='flex justify-between'>
                    <span >Delivery Charge</span>
                    <span className={`${shippingCharge === 0 ? 'text-green-600' : 'text-black'}`}>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
                 </div>
        <div className="border-t pt-4 font-medium flex justify-between">
          <span>Total Amount</span>
          <span>₹{totalAmount}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          disabled={isProcessing}
          onClick={onProceed}
        >
          {isProcessing ? (
            "Processing..."
          ) : step === "payment" ? (
            <>
              <CreditCard className="h-4 w-4 mr-2" /> Continue To Pay
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 mr-2" /> 
              {step === 'cart' ? 'Proceed to Checkout' : 'Proceed to Payment'}
            </>
          )}
        </Button>
        {step !== "cart" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onGoBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Safe and Secure Payments</span>
        </div>
      </CardFooter>
    </Card>
  );
};

