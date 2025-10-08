import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Lock, Bolt } from "lucide-react";

interface ShopifyCheckoutProps {
  amount: number;
  onSuccess: (details: any) => void;
}

export function ShopifyCheckout({ amount, onSuccess }: ShopifyCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleShopifyPay = async () => {
    if (!email || !phone) return;
    
    setIsProcessing(true);
    
    // Simulate Shopify processing (mock)
    setTimeout(() => {
      const mockShopifyResponse = {
        orderID: `SHOP-${Date.now()}`,
        customerEmail: email,
        customerPhone: phone,
        paymentID: `SPAY-${Math.random().toString(36).substr(2, 9)}`,
        status: "COMPLETED",
        amount: amount,
        currency: "USD",
        timestamp: new Date().toISOString()
      };
      
      setIsProcessing(false);
      onSuccess(mockShopifyResponse);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-green-500" />
          Shopify Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bolt className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Express Checkout</span>
          </div>
          <p className="text-sm text-green-800">
            Save your info for next time. One-click checkout on all Shopify stores.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={handleShopifyPay}
          disabled={isProcessing || !email || !phone}
          size="lg"
          className="w-full bg-[#5C6AC4] hover:bg-[#4c5ab4] text-white"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              <Bolt className="h-5 w-5 mr-2" />
              Pay with Shopify
            </>
          )}
        </Button>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3" />
            <span>Secured by Shopify Payments</span>
          </div>
          <div className="text-xs text-gray-500">
            <p>✓ Fast one-click checkout</p>
            <p>✓ Saved across all Shopify stores</p>
            <p>✓ Encrypted payment information</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
