import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, DollarSign, ShoppingBag, Smartphone, Wallet, Banknote } from "lucide-react";

export type PaymentMethod = "stripe" | "paypal" | "shopify" | "applepay" | "googlepay" | "klarna" | "braintree";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: "stripe" as PaymentMethod,
      name: "Stripe",
      description: "Pay with credit/debit card",
      icon: CreditCard,
      badge: "Popular",
      color: "text-blue-500"
    },
    {
      id: "applepay" as PaymentMethod,
      name: "Apple Pay",
      description: "Quick checkout with Apple Pay",
      icon: Smartphone,
      badge: "Fast",
      color: "text-gray-800"
    },
    {
      id: "googlepay" as PaymentMethod,
      name: "Google Pay",
      description: "Quick checkout with Google Pay",
      icon: Wallet,
      badge: "Fast",
      color: "text-blue-600"
    },
    {
      id: "klarna" as PaymentMethod,
      name: "Klarna",
      description: "Buy now, pay later in 4 installments",
      icon: Banknote,
      badge: "0% APR",
      color: "text-pink-500"
    },
    {
      id: "braintree" as PaymentMethod,
      name: "Braintree / Venmo",
      description: "Pay with Venmo or credit card",
      icon: DollarSign,
      badge: "US Favorite",
      color: "text-blue-400"
    },
    {
      id: "paypal" as PaymentMethod,
      name: "PayPal",
      description: "Pay securely with your PayPal account",
      icon: DollarSign,
      badge: "Secure",
      color: "text-yellow-500"
    },
    {
      id: "shopify" as PaymentMethod,
      name: "Shopify Pay",
      description: "Fast checkout with Shopify",
      icon: ShoppingBag,
      badge: "Fast",
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
        <p className="text-sm text-gray-500">Choose how you'd like to pay for your books</p>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
        <div className="grid gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onMethodChange(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                          <Icon className={`h-5 w-5 ${method.color}`} />
                          <span className="font-semibold">{method.name}</span>
                        </Label>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}
