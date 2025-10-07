import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Book, ShoppingCart } from "lucide-react";
import { PaymentMethodSelector, type PaymentMethod } from "@/components/payments/PaymentMethodSelector";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import { PayPalButton } from "@/components/payments/PayPalButton";
import { ShopifyCheckout } from "@/components/payments/ShopifyCheckout";
import { AppleGooglePayButton } from "@/components/payments/AppleGooglePayButton";
import { KlarnaPaymentForm } from "@/components/payments/KlarnaPaymentForm";
import { BraintreePaymentForm } from "@/components/payments/BraintreePaymentForm";

// Mock cart data
const MOCK_CART_ITEMS = [
  {
    id: "1",
    isbn: "9781451673319",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    quantity: 1,
    price: 17.99,
    coverImage: "https://placehold.co/80x120/e0f2fe/1e40af?text=Book"
  },
  {
    id: "2",
    isbn: "9780525559474",
    title: "Educated",
    author: "Tara Westover",
    quantity: 2,
    price: 15.99,
    coverImage: "https://placehold.co/80x120/dbeafe/1e3a8a?text=Book"
  }
];

export default function BookCheckout() {
  const [, navigate] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [isProcessing, setIsProcessing] = useState(false);

  const cartItems = MOCK_CART_ITEMS;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = 5.99;
  const total = subtotal + tax + shipping;

  const handlePaymentSuccess = (paymentDetails: any) => {
    console.log("Payment successful:", paymentDetails);
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      navigate("/book-payment-success");
    }, 1500);
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment failed:", error);
    navigate("/book-payment-failed");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/books-management")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Books
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-gray-600">{item.author}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <Badge variant="secondary" className="w-full justify-center py-2">
                <Book className="h-3 w-3 mr-1" />
                {cartItems.length} books in cart
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2">🔒 Secure Checkout</h4>
              <p className="text-xs text-gray-700">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
              />
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div>
            {paymentMethod === "stripe" && (
              <StripePaymentForm
                onSubmit={handlePaymentSuccess}
                isProcessing={isProcessing}
              />
            )}
            
            {(paymentMethod === "applepay" || paymentMethod === "googlepay") && (
              <AppleGooglePayButton
                paymentType={paymentMethod}
                amount={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
            
            {paymentMethod === "klarna" && (
              <KlarnaPaymentForm
                amount={total}
                onSubmit={handlePaymentSuccess}
                isProcessing={isProcessing}
              />
            )}
            
            {paymentMethod === "braintree" && (
              <BraintreePaymentForm
                amount={total}
                onSubmit={handlePaymentSuccess}
                isProcessing={isProcessing}
              />
            )}
            
            {paymentMethod === "paypal" && (
              <PayPalButton
                amount={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
            
            {paymentMethod === "shopify" && (
              <ShopifyCheckout
                amount={total}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
