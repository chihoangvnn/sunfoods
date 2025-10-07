import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Home, Package } from "lucide-react";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();

  // Mock order data
  const orderData = {
    orderNumber: `ORD-${Date.now()}`,
    date: new Date().toLocaleDateString(),
    total: 55.96,
    items: 3,
    email: "customer@example.com"
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardContent className="p-8 text-center">
          {/* Success Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" />
              <CheckCircle className="h-20 w-20 text-green-500 relative" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4 text-center">Order Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number</span>
                <span className="font-mono font-semibold">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{orderData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span className="font-semibold">{orderData.items} books</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-semibold">Total Paid</span>
                <span className="text-green-600 font-bold text-lg">${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900">
              📧 A confirmation email has been sent to <strong>{orderData.email}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/book-orders")}
              size="lg"
              className="w-full"
            >
              <Package className="h-5 w-5 mr-2" />
              View Order Details
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate("/books-management")}
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                onClick={() => alert("Invoice downloaded (mock)")}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">What happens next?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-gray-600">We're preparing your books for shipment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Shipping Notification</p>
                <p className="text-gray-600">You'll receive tracking info via email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-gray-600">Estimated delivery in 3-5 business days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
