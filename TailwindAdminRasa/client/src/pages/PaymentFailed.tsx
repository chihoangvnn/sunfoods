import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, HelpCircle, RefreshCcw } from "lucide-react";

export default function PaymentFailed() {
  const [, navigate] = useLocation();

  // Mock error data
  const errorData = {
    errorCode: "PAYMENT_DECLINED",
    errorMessage: "Your payment was declined by your bank",
    timestamp: new Date().toLocaleString(),
    attemptedAmount: 55.96
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardContent className="p-8 text-center">
          {/* Error Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
              <XCircle className="h-20 w-20 text-red-500 relative" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't process your payment. Please try again.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-red-900 mb-4 text-center">Error Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Error Code</span>
                <span className="font-mono font-semibold text-red-600">{errorData.errorCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Message</span>
                <span className="font-semibold text-red-600">{errorData.errorMessage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold">{errorData.timestamp}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-semibold">Attempted Amount</span>
                <span className="text-gray-900 font-bold text-lg">${errorData.attemptedAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              onClick={() => navigate("/book-checkout")}
              size="lg"
              className="w-full"
            >
              <RefreshCcw className="h-5 w-5 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={() => navigate("/books-management")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shopping
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3 text-left">
              <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Need Help?</p>
                <p className="text-blue-800 mb-2">
                  If you continue experiencing issues, please try:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Using a different payment method</li>
                  <li>Checking your card details are correct</li>
                  <li>Contacting your bank to authorize the payment</li>
                  <li>Reaching out to our support team</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Reasons */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Common reasons for payment failure:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-2 mt-1 flex-shrink-0">
                <span className="text-gray-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Insufficient Funds</p>
                <p className="text-gray-600">Your account may not have enough balance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-2 mt-1 flex-shrink-0">
                <span className="text-gray-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Card Declined</p>
                <p className="text-gray-600">Your bank may have declined the transaction</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-2 mt-1 flex-shrink-0">
                <span className="text-gray-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Incorrect Details</p>
                <p className="text-gray-600">Card number, expiry, or CVV may be incorrect</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
