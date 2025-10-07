import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, CheckCircle2, AlertCircle, Calendar, CreditCard } from "lucide-react";

interface KlarnaPaymentFormProps {
  amount: number;
  onSubmit: (paymentDetails: any) => void;
  isProcessing?: boolean;
}

export function KlarnaPaymentForm({ amount, onSubmit, isProcessing = false }: KlarnaPaymentFormProps) {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [installmentOption, setInstallmentOption] = useState<"pay_in_4" | "pay_in_30">("pay_in_4");
  const [errors, setErrors] = useState<{ email?: string; phoneNumber?: string }>({});

  const installmentAmount = amount / 4;
  const minAmount = 50;
  const isEligible = amount >= minAmount;

  const validateForm = () => {
    const newErrors: { email?: string; phoneNumber?: string } = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 7) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentDetails = {
      id: `klarna_${Date.now()}`,
      method: "klarna",
      installmentOption,
      email,
      phoneNumber,
      amount,
      installmentAmount: installmentOption === "pay_in_4" ? installmentAmount : amount,
      status: "pending_approval",
      timestamp: new Date().toISOString()
    };

    onSubmit(paymentDetails);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-pink-500" />
          Pay with Klarna - Buy Now, Pay Later
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEligible && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Klarna is available for orders $50 and above. Your current total is ${amount.toFixed(2)}.
              </AlertDescription>
            </Alert>
          )}

          {isEligible && (
            <>
              <Alert className="bg-pink-50 border-pink-200">
                <CheckCircle2 className="h-4 w-4 text-pink-600" />
                <AlertDescription className="text-sm text-gray-700">
                  <strong>0% interest</strong> - Pay in 4 interest-free installments or in 30 days
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Label>Choose Your Payment Plan</Label>
                <RadioGroup value={installmentOption} onValueChange={(value) => setInstallmentOption(value as "pay_in_4" | "pay_in_30")}>
                  <Card className={`cursor-pointer transition-all ${installmentOption === "pay_in_4" ? "ring-2 ring-pink-500 bg-pink-50" : "hover:bg-gray-50"}`}>
                    <CardContent className="p-4" onClick={() => setInstallmentOption("pay_in_4")}>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="pay_in_4" id="pay_in_4" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="pay_in_4" className="cursor-pointer font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Pay in 4 installments
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            ${installmentAmount.toFixed(2)} every 2 weeks
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            First payment today, remaining 3 payments every 2 weeks
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-all ${installmentOption === "pay_in_30" ? "ring-2 ring-pink-500 bg-pink-50" : "hover:bg-gray-50"}`}>
                    <CardContent className="p-4" onClick={() => setInstallmentOption("pay_in_30")}>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="pay_in_30" id="pay_in_30" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="pay_in_30" className="cursor-pointer font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Pay in 30 days
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            ${amount.toFixed(2)} due in 30 days
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Single payment, no interest, pay later
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567 or +44 20 1234 5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Include country code for international numbers</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing || !isEligible}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Continue with Klarna
                  </span>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You'll be redirected to Klarna to complete your purchase. 
                Subject to credit approval. Must be 18+ years old.
              </p>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
