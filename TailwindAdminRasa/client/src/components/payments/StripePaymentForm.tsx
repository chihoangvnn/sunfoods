import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock, Smartphone } from "lucide-react";

interface StripePaymentFormProps {
  onSubmit: (data: any) => void;
  isProcessing?: boolean;
}

export function StripePaymentForm({ onSubmit, isProcessing }: StripePaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    zipCode: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + " / " + v.slice(2, 4);
    }
    return v;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
              maxLength={19}
              required
            />
          </div>

          <div>
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="JOHN DOE"
              value={formData.cardName}
              onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Label htmlFor="expiryDate">Expiry</Label>
              <Input
                id="expiryDate"
                placeholder="MM / YY"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
                maxLength={7}
                required
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                type="password"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, "") })}
                maxLength={4}
                required
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="zipCode">ZIP</Label>
              <Input
                id="zipCode"
                placeholder="10001"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay Securely
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" disabled={isProcessing}>
                <Smartphone className="h-4 w-4 mr-2" />
                Apple Pay
              </Button>
              <Button type="button" variant="outline" className="flex-1" disabled={isProcessing}>
                <Smartphone className="h-4 w-4 mr-2" />
                Google Pay
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
            <Lock className="h-3 w-3" />
            <span>Secured by Stripe. Your payment information is encrypted.</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
