import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, Crown, DollarSign, Truck, ExternalLink } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  membershipTier: string;
  customerRole: string;
  isAffiliate: boolean;
  affiliateCode?: string;
  affiliateStatus?: string;
  totalSpent: string;
  pointsBalance: number;
  joinDate: string;
}

interface ActivatedRoles {
  isCustomer: boolean;
  isAffiliate: boolean;
  isDriver: boolean;
  isVip: boolean;
  isCorporate: boolean;
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/customer/dashboard/:customerId");
  const customerId = params?.customerId;
  const [activeTab, setActiveTab] = useState<string>("profile");

  const { data, isLoading, error } = useQuery<{
    customer: CustomerProfile;
    activatedRoles: ActivatedRoles;
  }>({
    queryKey: ["customer-dashboard", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID required");
      const res = await fetch(`/api/customer-dashboard/${customerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch customer dashboard");
      return res.json();
    },
    enabled: !!customerId,
  });

  useEffect(() => {
    if (!customerId) {
      setLocation("/");
    }
  }, [customerId, setLocation]);

  if (!customerId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Customer ID is required. Please access this page with a valid customer ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Failed to load customer dashboard"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { customer, activatedRoles } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Customer Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {customer.name}
              </h1>
              <p className="text-muted-foreground">{customer.phone}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {customer.membershipTier}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {customer.status}
            </Badge>
          </div>
        </div>

        {/* Dynamic Tabs Based on Activated Roles */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            {/* Profile Tab - Always visible */}
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>

            {/* Affiliate Tab - Show if isAffiliate = true */}
            {activatedRoles.isAffiliate && (
              <TabsTrigger value="affiliate" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Affiliate
              </TabsTrigger>
            )}

            {/* Driver Tab - Show if customerRole = driver */}
            {activatedRoles.isDriver && (
              <TabsTrigger value="driver" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Driver
              </TabsTrigger>
            )}

            {/* VIP Tab - Show if customerRole = vip */}
            {activatedRoles.isVip && (
              <TabsTrigger value="vip" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                VIP
              </TabsTrigger>
            )}

            {/* Corporate Tab - Show if customerRole = corporate */}
            {activatedRoles.isCorporate && (
              <TabsTrigger value="corporate" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Corporate
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab Content */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-medium">{customer.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg font-medium">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-lg font-medium">{parseFloat(customer.totalSpent).toLocaleString()} đ</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Points Balance</p>
                    <p className="text-lg font-medium">{customer.pointsBalance.toLocaleString()} points</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-lg font-medium capitalize">{customer.customerRole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-lg font-medium">
                      {new Date(customer.joinDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {customer.isAffiliate && customer.affiliateCode && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Affiliate Code</p>
                        <p className="text-lg font-medium">{customer.affiliateCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Affiliate Status</p>
                        <Badge variant="outline" className="capitalize">
                          {customer.affiliateStatus}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliate Tab Content */}
          {activatedRoles.isAffiliate && (
            <TabsContent value="affiliate">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 space-y-4">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-2xl font-bold mb-2">Affiliate Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      View your affiliate stats, commissions, and create quick orders
                    </p>
                    <Button
                      onClick={() => setLocation(`/customer/affiliate-dashboard/${customerId}`)}
                      className="gap-2"
                    >
                      Open Affiliate Portal
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Driver Tab Content */}
          {activatedRoles.isDriver && (
            <TabsContent value="driver">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 space-y-4">
                    <Truck className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-2xl font-bold mb-2">Driver Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      Manage your vehicles, trips, and delivery services
                    </p>
                    <Button
                      onClick={() => setLocation(`/customer/driver-services/${customerId}`)}
                      className="gap-2"
                    >
                      Open Driver Portal
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* VIP Tab Content */}
          {activatedRoles.isVip && (
            <TabsContent value="vip">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 space-y-4">
                    <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-2xl font-bold mb-2">VIP Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      Access exclusive VIP products and special offers
                    </p>
                    <Button
                      onClick={() => setLocation(`/customer/vip-dashboard`)}
                      className="gap-2"
                    >
                      Open VIP Portal
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Corporate Tab Content */}
          {activatedRoles.isCorporate && (
            <TabsContent value="corporate">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <User className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                    <h3 className="text-2xl font-bold mb-2">Corporate Dashboard</h3>
                    <p className="text-muted-foreground">
                      Corporate features and bulk ordering coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
