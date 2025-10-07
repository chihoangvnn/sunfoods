import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  DollarSign, 
  ShoppingBag, 
  Save, 
  Key, 
  AlertCircle,
  CheckCircle,
  Settings,
  Banknote,
  Smartphone,
  Wallet
} from "lucide-react";

export default function PaymentGatewaySettings() {
  const { toast } = useToast();
  
  const [stripeSettings, setStripeSettings] = useState({
    enabled: true,
    publishableKey: "pk_test_••••••••••••",
    secretKey: "sk_test_••••••••••••",
    webhookSecret: "whsec_••••••••••••",
    testMode: true
  });

  const [paypalSettings, setPaypalSettings] = useState({
    enabled: true,
    clientId: "••••••••••••",
    clientSecret: "••••••••••••",
    sandboxMode: true
  });

  const [shopifySettings, setShopifySettings] = useState({
    enabled: false,
    apiKey: "",
    apiSecret: "",
    storeName: "",
    testMode: true
  });

  const [klarnaSettings, setKlarnaSettings] = useState({
    enabled: true,
    apiKey: "••••••••••••",
    apiSecret: "••••••••••••",
    region: "US",
    testMode: true
  });

  const [braintreeSettings, setBraintreeSettings] = useState({
    enabled: true,
    merchantId: "••••••••••••",
    publicKey: "••••••••••••",
    privateKey: "••••••••••••",
    venmoEnabled: true,
    sandboxMode: true
  });

  const [applePaySettings, setApplePaySettings] = useState({
    enabled: true,
    merchantId: "••••••••••••",
    certificateId: "••••••••••••",
    stripeLinked: true,
    testMode: true
  });

  const [googlePaySettings, setGooglePaySettings] = useState({
    enabled: true,
    merchantId: "••••••••••••",
    merchantName: "BookStore",
    stripeLinked: true,
    testMode: true
  });

  const handleSaveStripe = () => {
    toast({
      title: "Stripe Settings Saved",
      description: "Your Stripe configuration has been updated successfully.",
    });
  };

  const handleSavePayPal = () => {
    toast({
      title: "PayPal Settings Saved",
      description: "Your PayPal configuration has been updated successfully.",
    });
  };

  const handleSaveShopify = () => {
    toast({
      title: "Shopify Settings Saved",
      description: "Your Shopify configuration has been updated successfully.",
    });
  };

  const handleSaveKlarna = () => {
    toast({
      title: "Klarna Settings Saved",
      description: "Your Klarna configuration has been updated successfully.",
    });
  };

  const handleSaveBraintree = () => {
    toast({
      title: "Braintree Settings Saved",
      description: "Your Braintree configuration has been updated successfully.",
    });
  };

  const handleSaveApplePay = () => {
    toast({
      title: "Apple Pay Settings Saved",
      description: "Your Apple Pay configuration has been updated successfully.",
    });
  };

  const handleSaveGooglePay = () => {
    toast({
      title: "Google Pay Settings Saved",
      description: "Your Google Pay configuration has been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Gateway Settings</h1>
        <p className="text-gray-600">Configure payment methods for your book store</p>
      </div>

      {/* Gateway Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gateway Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-semibold">Stripe</div>
                  <div className="text-xs text-gray-500">Cards/Wallet</div>
                </div>
              </div>
              <Badge variant={stripeSettings.enabled ? "default" : "secondary"}>
                {stripeSettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Banknote className="h-8 w-8 text-pink-500" />
                <div>
                  <div className="font-semibold">Klarna</div>
                  <div className="text-xs text-gray-500">BNPL</div>
                </div>
              </div>
              <Badge variant={klarnaSettings.enabled ? "default" : "secondary"}>
                {klarnaSettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="font-semibold">Braintree</div>
                  <div className="text-xs text-gray-500">Card/Venmo</div>
                </div>
              </div>
              <Badge variant={braintreeSettings.enabled ? "default" : "secondary"}>
                {braintreeSettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="font-semibold">PayPal</div>
                  <div className="text-xs text-gray-500">PayPal</div>
                </div>
              </div>
              <Badge variant={paypalSettings.enabled ? "default" : "secondary"}>
                {paypalSettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-green-500" />
                <div>
                  <div className="font-semibold">Shopify</div>
                  <div className="text-xs text-gray-500">Shopify Pay</div>
                </div>
              </div>
              <Badge variant={shopifySettings.enabled ? "default" : "secondary"}>
                {shopifySettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-gray-700" />
                <div>
                  <div className="font-semibold">Apple Pay</div>
                  <div className="text-xs text-gray-500">Quick Checkout</div>
                </div>
              </div>
              <Badge variant={applePaySettings.enabled ? "default" : "secondary"}>
                {applePaySettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold">Google Pay</div>
                  <div className="text-xs text-gray-500">Quick Checkout</div>
                </div>
              </div>
              <Badge variant={googlePaySettings.enabled ? "default" : "secondary"}>
                {googlePaySettings.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gateway Configuration Tabs */}
      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
          <TabsTrigger value="stripe">
            <CreditCard className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Stripe</span>
          </TabsTrigger>
          <TabsTrigger value="klarna">
            <Banknote className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Klarna</span>
          </TabsTrigger>
          <TabsTrigger value="braintree">
            <Smartphone className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Braintree</span>
          </TabsTrigger>
          <TabsTrigger value="paypal">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">PayPal</span>
          </TabsTrigger>
          <TabsTrigger value="shopify">
            <ShoppingBag className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Shopify</span>
          </TabsTrigger>
          <TabsTrigger value="applepay">
            <Smartphone className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Apple Pay</span>
          </TabsTrigger>
          <TabsTrigger value="googlepay">
            <Wallet className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Google Pay</span>
          </TabsTrigger>
        </TabsList>

        {/* Stripe Configuration */}
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Configuration</CardTitle>
              <CardDescription>
                Configure Stripe payment gateway for credit card payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Stripe</Label>
                  <p className="text-sm text-gray-500">Accept credit card payments via Stripe</p>
                </div>
                <Switch
                  checked={stripeSettings.enabled}
                  onCheckedChange={(checked) => setStripeSettings({ ...stripeSettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripe-publishable">Publishable Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="stripe-publishable"
                      value={stripeSettings.publishableKey}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                      placeholder="pk_test_..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stripe-secret">Secret Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="stripe-secret"
                      type="password"
                      value={stripeSettings.secretKey}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="stripe-webhook"
                      type="password"
                      value={stripeSettings.webhookSecret}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, webhookSecret: e.target.value })}
                      placeholder="whsec_..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-gray-500">Use test API keys for development</p>
                  </div>
                  <Switch
                    checked={stripeSettings.testMode}
                    onCheckedChange={(checked) => setStripeSettings({ ...stripeSettings, testMode: checked })}
                  />
                </div>
              </div>

              {stripeSettings.testMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Test Mode Enabled</p>
                      <p>You're using test API keys. No real transactions will be processed.</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveStripe} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Stripe Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Klarna Configuration */}
        <TabsContent value="klarna">
          <Card>
            <CardHeader>
              <CardTitle>Klarna Configuration</CardTitle>
              <CardDescription>
                Configure Klarna Buy Now, Pay Later for installment payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Klarna</Label>
                  <p className="text-sm text-gray-500">Accept BNPL payments via Klarna</p>
                </div>
                <Switch
                  checked={klarnaSettings.enabled}
                  onCheckedChange={(checked) => setKlarnaSettings({ ...klarnaSettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="klarna-api-key">API Key (Username)</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="klarna-api-key"
                      value={klarnaSettings.apiKey}
                      onChange={(e) => setKlarnaSettings({ ...klarnaSettings, apiKey: e.target.value })}
                      placeholder="Your Klarna API Username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="klarna-api-secret">API Secret (Password)</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="klarna-api-secret"
                      type="password"
                      value={klarnaSettings.apiSecret}
                      onChange={(e) => setKlarnaSettings({ ...klarnaSettings, apiSecret: e.target.value })}
                      placeholder="Your Klarna API Password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="klarna-region">Region</Label>
                  <div className="flex gap-2 mt-2">
                    <select
                      id="klarna-region"
                      value={klarnaSettings.region}
                      onChange={(e) => setKlarnaSettings({ ...klarnaSettings, region: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="US">United States</option>
                      <option value="EU">Europe</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select your primary market region</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-gray-500">Use Klarna Playground for testing</p>
                  </div>
                  <Switch
                    checked={klarnaSettings.testMode}
                    onCheckedChange={(checked) => setKlarnaSettings({ ...klarnaSettings, testMode: checked })}
                  />
                </div>
              </div>

              {klarnaSettings.testMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Test Mode Enabled</p>
                      <p>Using Klarna Playground. No real transactions will be processed.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-pink-800">
                    <p className="font-semibold mb-1">Available Payment Options</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Pay in 4 installments (0% APR)</li>
                      <li>Pay in 30 days</li>
                      <li>Minimum order: $50</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveKlarna} className="w-full bg-pink-500 hover:bg-pink-600">
                <Save className="h-4 w-4 mr-2" />
                Save Klarna Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Braintree Configuration */}
        <TabsContent value="braintree">
          <Card>
            <CardHeader>
              <CardTitle>Braintree Configuration</CardTitle>
              <CardDescription>
                Configure Braintree for card payments and Venmo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Braintree</Label>
                  <p className="text-sm text-gray-500">Accept payments via Braintree (PayPal service)</p>
                </div>
                <Switch
                  checked={braintreeSettings.enabled}
                  onCheckedChange={(checked) => setBraintreeSettings({ ...braintreeSettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="braintree-merchant-id">Merchant ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="braintree-merchant-id"
                      value={braintreeSettings.merchantId}
                      onChange={(e) => setBraintreeSettings({ ...braintreeSettings, merchantId: e.target.value })}
                      placeholder="Your Braintree Merchant ID"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="braintree-public-key">Public Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="braintree-public-key"
                      value={braintreeSettings.publicKey}
                      onChange={(e) => setBraintreeSettings({ ...braintreeSettings, publicKey: e.target.value })}
                      placeholder="Your Braintree Public Key"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="braintree-private-key">Private Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="braintree-private-key"
                      type="password"
                      value={braintreeSettings.privateKey}
                      onChange={(e) => setBraintreeSettings({ ...braintreeSettings, privateKey: e.target.value })}
                      placeholder="Your Braintree Private Key"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Venmo</Label>
                    <p className="text-sm text-gray-500">Allow customers to pay with Venmo</p>
                  </div>
                  <Switch
                    checked={braintreeSettings.venmoEnabled}
                    onCheckedChange={(checked) => setBraintreeSettings({ ...braintreeSettings, venmoEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sandbox Mode</Label>
                    <p className="text-sm text-gray-500">Use Braintree sandbox for testing</p>
                  </div>
                  <Switch
                    checked={braintreeSettings.sandboxMode}
                    onCheckedChange={(checked) => setBraintreeSettings({ ...braintreeSettings, sandboxMode: checked })}
                  />
                </div>
              </div>

              {braintreeSettings.sandboxMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Sandbox Mode Enabled</p>
                      <p>Using Braintree sandbox environment for testing.</p>
                    </div>
                  </div>
                </div>
              )}

              {braintreeSettings.venmoEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Venmo Enabled</p>
                      <p>Perfect for US millennials - popular mobile payment method</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveBraintree} className="w-full bg-blue-500 hover:bg-blue-600">
                <Save className="h-4 w-4 mr-2" />
                Save Braintree Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PayPal Configuration */}
        <TabsContent value="paypal">
          <Card>
            <CardHeader>
              <CardTitle>PayPal Configuration</CardTitle>
              <CardDescription>
                Configure PayPal for accepting payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable PayPal</Label>
                  <p className="text-sm text-gray-500">Accept payments via PayPal</p>
                </div>
                <Switch
                  checked={paypalSettings.enabled}
                  onCheckedChange={(checked) => setPaypalSettings({ ...paypalSettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="paypal-client-id">Client ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="paypal-client-id"
                      value={paypalSettings.clientId}
                      onChange={(e) => setPaypalSettings({ ...paypalSettings, clientId: e.target.value })}
                      placeholder="Your PayPal Client ID"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paypal-secret">Client Secret</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="paypal-secret"
                      type="password"
                      value={paypalSettings.clientSecret}
                      onChange={(e) => setPaypalSettings({ ...paypalSettings, clientSecret: e.target.value })}
                      placeholder="Your PayPal Client Secret"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sandbox Mode</Label>
                    <p className="text-sm text-gray-500">Use PayPal sandbox for testing</p>
                  </div>
                  <Switch
                    checked={paypalSettings.sandboxMode}
                    onCheckedChange={(checked) => setPaypalSettings({ ...paypalSettings, sandboxMode: checked })}
                  />
                </div>
              </div>

              {paypalSettings.sandboxMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Sandbox Mode Enabled</p>
                      <p>Using PayPal sandbox environment for testing.</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSavePayPal} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save PayPal Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shopify Configuration */}
        <TabsContent value="shopify">
          <Card>
            <CardHeader>
              <CardTitle>Shopify Configuration</CardTitle>
              <CardDescription>
                Configure Shopify Pay for fast checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Shopify Pay</Label>
                  <p className="text-sm text-gray-500">Accept payments via Shopify</p>
                </div>
                <Switch
                  checked={shopifySettings.enabled}
                  onCheckedChange={(checked) => setShopifySettings({ ...shopifySettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="shopify-store">Store Name</Label>
                  <div className="flex gap-2 mt-2">
                    <ShoppingBag className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="shopify-store"
                      value={shopifySettings.storeName}
                      onChange={(e) => setShopifySettings({ ...shopifySettings, storeName: e.target.value })}
                      placeholder="your-store.myshopify.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shopify-api-key">API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="shopify-api-key"
                      value={shopifySettings.apiKey}
                      onChange={(e) => setShopifySettings({ ...shopifySettings, apiKey: e.target.value })}
                      placeholder="Your Shopify API Key"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shopify-secret">API Secret</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="shopify-secret"
                      type="password"
                      value={shopifySettings.apiSecret}
                      onChange={(e) => setShopifySettings({ ...shopifySettings, apiSecret: e.target.value })}
                      placeholder="Your Shopify API Secret"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-gray-500">Use test environment</p>
                  </div>
                  <Switch
                    checked={shopifySettings.testMode}
                    onCheckedChange={(checked) => setShopifySettings({ ...shopifySettings, testMode: checked })}
                  />
                </div>
              </div>

              {!shopifySettings.enabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Shopify Pay Disabled</p>
                      <p>Enable Shopify Pay to accept payments from Shopify customers.</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveShopify} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Shopify Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apple Pay Configuration */}
        <TabsContent value="applepay">
          <Card>
            <CardHeader>
              <CardTitle>Apple Pay Configuration</CardTitle>
              <CardDescription>
                Configure Apple Pay for one-tap checkout (via Stripe integration)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Apple Pay</Label>
                  <p className="text-sm text-gray-500">Quick checkout for iOS users</p>
                </div>
                <Switch
                  checked={applePaySettings.enabled}
                  onCheckedChange={(checked) => setApplePaySettings({ ...applePaySettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Stripe Integration Required</p>
                    <p>Apple Pay is configured through Stripe. Ensure Stripe is properly set up for Apple Pay to work.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="apple-merchant-id">Apple Merchant ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="apple-merchant-id"
                      value={applePaySettings.merchantId}
                      onChange={(e) => setApplePaySettings({ ...applePaySettings, merchantId: e.target.value })}
                      placeholder="merchant.com.yourcompany"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Get this from your Apple Developer account</p>
                </div>

                <div>
                  <Label htmlFor="apple-cert-id">Certificate ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="apple-cert-id"
                      type="password"
                      value={applePaySettings.certificateId}
                      onChange={(e) => setApplePaySettings({ ...applePaySettings, certificateId: e.target.value })}
                      placeholder="Your certificate ID"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Linked to Stripe</Label>
                    <p className="text-sm text-gray-500">Apple Pay requires active Stripe account</p>
                  </div>
                  <Badge variant={applePaySettings.stripeLinked ? "default" : "secondary"}>
                    {applePaySettings.stripeLinked ? "Linked" : "Not Linked"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-gray-500">Use test environment</p>
                  </div>
                  <Switch
                    checked={applePaySettings.testMode}
                    onCheckedChange={(checked) => setApplePaySettings({ ...applePaySettings, testMode: checked })}
                  />
                </div>
              </div>

              {applePaySettings.testMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Test Mode Enabled</p>
                      <p>Testing Apple Pay requires a real device. Use Safari on iOS/macOS for testing.</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveApplePay} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Apple Pay Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Pay Configuration */}
        <TabsContent value="googlepay">
          <Card>
            <CardHeader>
              <CardTitle>Google Pay Configuration</CardTitle>
              <CardDescription>
                Configure Google Pay for one-tap checkout (via Stripe integration)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Google Pay</Label>
                  <p className="text-sm text-gray-500">Quick checkout for Android users</p>
                </div>
                <Switch
                  checked={googlePaySettings.enabled}
                  onCheckedChange={(checked) => setGooglePaySettings({ ...googlePaySettings, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Stripe Integration Required</p>
                    <p>Google Pay is configured through Stripe. Ensure Stripe is properly set up for Google Pay to work.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="google-merchant-id">Google Merchant ID</Label>
                  <div className="flex gap-2 mt-2">
                    <Key className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="google-merchant-id"
                      value={googlePaySettings.merchantId}
                      onChange={(e) => setGooglePaySettings({ ...googlePaySettings, merchantId: e.target.value })}
                      placeholder="BCR2DN4XXXXX"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Get this from Google Pay Business Console</p>
                </div>

                <div>
                  <Label htmlFor="google-merchant-name">Merchant Name</Label>
                  <div className="flex gap-2 mt-2">
                    <ShoppingBag className="h-4 w-4 text-gray-400 mt-3" />
                    <Input
                      id="google-merchant-name"
                      value={googlePaySettings.merchantName}
                      onChange={(e) => setGooglePaySettings({ ...googlePaySettings, merchantName: e.target.value })}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This will appear in the Google Pay sheet</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Linked to Stripe</Label>
                    <p className="text-sm text-gray-500">Google Pay requires active Stripe account</p>
                  </div>
                  <Badge variant={googlePaySettings.stripeLinked ? "default" : "secondary"}>
                    {googlePaySettings.stripeLinked ? "Linked" : "Not Linked"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-gray-500">Use test environment</p>
                  </div>
                  <Switch
                    checked={googlePaySettings.testMode}
                    onCheckedChange={(checked) => setGooglePaySettings({ ...googlePaySettings, testMode: checked })}
                  />
                </div>
              </div>

              {googlePaySettings.testMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Test Mode Enabled</p>
                      <p>Use Google's test cards to simulate payments in test mode.</p>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveGooglePay} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Google Pay Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
