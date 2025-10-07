import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, Wallet, CheckCircle2, AlertCircle } from "lucide-react";

interface AppleGooglePayButtonProps {
  paymentType: "applepay" | "googlepay";
  amount: number;
  onSuccess: (paymentDetails: any) => void;
  onError?: (error: any) => void;
}

export function AppleGooglePayButton({ paymentType, amount, onSuccess, onError }: AppleGooglePayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApplePay = paymentType === "applepay";
  const Icon = isApplePay ? Smartphone : Wallet;
  const displayName = isApplePay ? "Apple Pay" : "Google Pay";
  const buttonColor = isApplePay ? "bg-black hover:bg-gray-800" : "bg-blue-600 hover:bg-blue-700";

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful payment
      const paymentDetails = {
        id: `${paymentType}_${Date.now()}`,
        method: paymentType,
        amount: amount,
        status: "completed",
        timestamp: new Date().toISOString()
      };

      onSuccess(paymentDetails);
    } catch (err: any) {
      const errorMessage = `${displayName} payment failed. Please try again.`;
      setError(errorMessage);
      if (onError) {
        onError({ message: errorMessage });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Pay with {displayName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-gray-700">
            {isApplePay 
              ? "Use Face ID, Touch ID, or your passcode to complete the purchase securely."
              : "Complete your purchase quickly with your saved Google Pay information."}
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order Total:</span>
            <span className="font-bold text-lg">${amount.toFixed(2)}</span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full h-12 text-white ${buttonColor}`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                Pay ${amount.toFixed(2)} with {displayName}
              </span>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By confirming your purchase, you agree to our terms and conditions.
          Your payment information is processed securely via Stripe.
        </p>
      </CardContent>
    </Card>
  );
}
