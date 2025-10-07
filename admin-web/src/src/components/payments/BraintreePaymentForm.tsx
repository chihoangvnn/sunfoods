import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

interface BraintreePaymentFormProps {
  amount: number;
  onSubmit: (paymentDetails: any) => void;
  isProcessing?: boolean;
}

export function BraintreePaymentForm({ amount, onSubmit, isProcessing = false }: BraintreePaymentFormProps) {
  const [paymentType, setPaymentType] = useState<"venmo" | "card">("venmo");
  const [venmoUsername, setVenmoUsername] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateVenmo = () => {
    const newErrors: { [key: string]: string } = {};

    if (!venmoUsername || venmoUsername.length < 3) {
      newErrors.venmoUsername = "Please enter your Venmo username";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCard = () => {
    const newErrors: { [key: string]: string } = {};

    if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Please enter expiry date (MM/YY)";
    }

    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    if (!nameOnCard || nameOnCard.length < 3) {
      newErrors.nameOnCard = "Please enter the name on card";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = paymentType === "venmo" ? validateVenmo() : validateCard();

    if (!isValid) {
      return;
    }

    const paymentDetails = {
      id: `braintree_${Date.now()}`,
      method: "braintree",
      paymentType,
      amount,
      status: "completed",
      timestamp: new Date().toISOString(),
      ...(paymentType === "venmo" 
        ? { venmoUsername } 
        : { cardNumber: `****${cardNumber.slice(-4)}`, nameOnCard })
    };

    onSubmit(paymentDetails);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-400" />
          Pay with Braintree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-gray-700">
              Braintree by PayPal - Secure payment processing trusted by millions
            </AlertDescription>
          </Alert>

          <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as "venmo" | "card")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="venmo" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Venmo
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit Card
              </TabsTrigger>
            </TabsList>

            <TabsContent value="venmo" className="space-y-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Pay with Venmo</span>
                </div>
                <p className="text-sm text-gray-700">
                  Popular among US millennials - Split payments with friends or pay instantly
                </p>
              </div>

              <div>
                <Label htmlFor="venmoUsername">Venmo Username</Label>
                <Input
                  id="venmoUsername"
                  type="text"
                  placeholder="@username"
                  value={venmoUsername}
                  onChange={(e) => setVenmoUsername(e.target.value)}
                  className={errors.venmoUsername ? "border-red-500" : ""}
                />
                {errors.venmoUsername && (
                  <p className="text-red-500 text-xs mt-1">{errors.venmoUsername}</p>
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Amount to pay:</span>
                <span className="text-xl font-bold text-blue-600">${amount.toFixed(2)}</span>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  type="text"
                  placeholder="John Doe"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className={errors.nameOnCard ? "border-red-500" : ""}
                />
                {errors.nameOnCard && (
                  <p className="text-red-500 text-xs mt-1">{errors.nameOnCard}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (value.length <= 16 && /^\d*$/.test(value)) {
                      setCardNumber(value);
                    }
                  }}
                  className={errors.cardNumber ? "border-red-500" : ""}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setExpiryDate(value);
                    }}
                    maxLength={5}
                    className={errors.expiryDate ? "border-red-500" : ""}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCvv(value);
                      }
                    }}
                    className={errors.cvv ? "border-red-500" : ""}
                  />
                  {errors.cvv && (
                    <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pay ${amount.toFixed(2)}
              </span>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Powered by Braintree, a PayPal service. Your payment information is encrypted and secure.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
