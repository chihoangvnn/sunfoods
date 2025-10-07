import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Lock } from "lucide-react";

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
}

export function PayPalButton({ amount, onSuccess, onError }: PayPalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalClick = async () => {
    setIsProcessing(true);
    
    // Simulate PayPal processing (mock)
    setTimeout(() => {
      const mockPayPalResponse = {
        orderID: `PP-${Date.now()}`,
        payerID: `PAYER-${Math.random().toString(36).substr(2, 9)}`,
        paymentID: `PAY-${Math.random().toString(36).substr(2, 9)}`,
        status: "COMPLETED",
        amount: amount,
        currency: "USD",
        timestamp: new Date().toISOString()
      };
      
      setIsProcessing(false);
      onSuccess(mockPayPalResponse);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-yellow-500" />
          PayPal Checkout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-600">
            You'll be redirected to PayPal to complete your purchase securely.
          </p>
        </div>

        <Button
          onClick={handlePayPalClick}
          disabled={isProcessing}
          size="lg"
          className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Connecting to PayPal...
            </>
          ) : (
            <>
              <DollarSign className="h-5 w-5 mr-2" />
              Continue with PayPal
            </>
          )}
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Lock className="h-3 w-3" />
            <span>Secure payment processed by PayPal</span>
          </div>
          <div className="text-xs text-gray-500">
            <p>✓ Buyer protection included</p>
            <p>✓ No credit card required</p>
            <p>✓ Pay with balance or linked bank account</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
