import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import CompleteAdminSidebar from "@/components/CompleteAdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect } from "react";
import { initializeGA4 } from "@/lib/analytics";

// Pages
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import BookOrders from "@/pages/BookOrders";
import BookOrdersDashboard from "@/pages/BookOrdersDashboard";
import BookCategories from "@/pages/BookCategories";
import DriverManagement from "@/pages/DriverManagement";
import DeliveryDashboard from "@/pages/DeliveryDashboard";
import VehicleManagement from "@/pages/VehicleManagement";
import DeliveryOrders from "@/pages/DeliveryOrders";
import CarGroups from "@/pages/CarGroups";
import OrderDetails from "@/pages/OrderDetails";
import Customers from "@/pages/Customers";
import CustomerDetails from "@/pages/CustomerDetails";
import { AnalyticsDashboard as Analytics } from "@/pages/AnalyticsDashboard";
import PostPerformanceAnalytics from "@/pages/PostPerformanceAnalytics";
import BestTimeRecommendations from "@/pages/BestTimeRecommendations";
import Chatbot from "@/pages/Chatbot";
import ChatbotAnalytics from "@/pages/ChatbotAnalytics";
import ChatbotSettings from "@/pages/ChatbotSettings";
import ChatbotResponses from "@/pages/ChatbotResponses";
import ChatbotTest from "@/pages/ChatbotTest";
import LandingPage from "@/pages/LandingPage";
import LandingPageManager from "@/pages/LandingPageManager";
import ProductLandingPageManager from "@/pages/ProductLandingPageManager";
import LandingPageEditor from "@/pages/LandingPageEditor";
import PublicLandingPage from "@/pages/PublicLandingPage";
import PublicStorefront from "@/pages/PublicStorefront";
import StorefrontManager from "@/pages/StorefrontManager";
import CategoryManager from "@/pages/CategoryManager";
import FrontendManagement from "@/pages/FrontendManagement";
import CustomerLocalAssignment from "@/pages/CustomerLocalAssignment";
import TagManagement from "@/pages/TagManagement";
import IndustryManager from "@/pages/IndustryManager";
import TaskAssignment from "@/pages/TaskAssignment";
import FaqTemplatesPage from "@/pages/FaqTemplatesPage";
import FAQLibrary from "@/pages/FAQLibrary";
import ShopSettings from "@/pages/ShopSettings";
import { ContentLibrary } from "@/pages/ContentLibrary";
import ScheduledPostsQueue from "@/components/ScheduledPostsQueue";
import { PostScheduler } from "@/pages/PostScheduler";
import { QueueManager } from "@/pages/QueueManager";
import ViettelPostSettings from "@/pages/ViettelPostSettings";
import FacebookAppsManager from "@/pages/FacebookAppsManager";
import GroupsManager from "@/pages/GroupsManager";
import TikTokBusiness from "@/pages/TikTokBusiness";
import TikTokShop from "@/pages/TikTokShop";
import Shopee from "@/pages/Shopee";
import Satellites from "@/pages/Satellites";
import ApiManagement from "@/pages/ApiManagement";
import WorkerManagement from "@/components/WorkerManagement";
import { IPPoolManager } from "@/pages/IPPoolManager";
import NotFound from "@/pages/not-found";
import ProductPage from "@/pages/ProductPage";
import ReviewManagement from "@/pages/ReviewManagement";
import ShopeeHomePage from "@/pages/ShopeeHomePage";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import BotStatusDashboard from "@/pages/BotStatusDashboard";
import NgrokConfig from "@/pages/NgrokConfig";
import POS from "@/pages/POS";
import MobileStorefront from "@/pages/MobileStorefront";
import BooksManagement from "@/pages/BooksManagement";
import ExistingBooksManagement from "@/components/BooksManagement";
import BookCustomers from "@/pages/BookCustomers";
import BookSellers from "@/pages/BookSellers";
import SellerConfigPanel from "@/pages/SellerConfigPanel";
import SellerPerformanceAnalytics from "@/pages/SellerPerformanceAnalytics";
import BookCheckout from "@/pages/BookCheckout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailed from "@/pages/PaymentFailed";
import PaymentGatewaySettings from "@/pages/PaymentGatewaySettings";
import BookPaymentTransactions from "@/pages/BookPaymentTransactions";
import FullLunarCalendarPage from "@/pages/FullLunarCalendarPage";
import AffiliateManagement from "@/pages/AffiliateManagement";
import AffiliateProductAssignment from "@/pages/AffiliateProductAssignment";
import AffiliateProductManagement from "@/pages/AffiliateProductManagement";
import AffiliateProductRequestApproval from "@/pages/AffiliateProductRequestApproval";
import StoreProductAssignment from "@/pages/StoreProductAssignment";
import VIPManagement from "@/pages/VIPManagement";
import VIPRegister from "@/pages/VIPRegister";
import DriverApprovalManagement from "@/pages/DriverApprovalManagement";
import AffiliateApprovalManagement from "@/pages/AffiliateApprovalManagement";
import MemberProfile from "@/pages/MemberProfile";
import MyVouchers from "@/pages/MyVouchers";
import Campaigns from "@/pages/Campaigns";
import LinkedAccounts from "@/pages/LinkedAccounts";
import ChatLogs from "@/pages/ChatLogs";
import DiscountManagement from "@/pages/DiscountManagement";
import GiftManagement from "@/pages/GiftManagement";
import GuestCheckoutPage from "@/pages/GuestCheckoutPage";
import BookCatalogAdmin from "@/pages/BookCatalogAdmin";
import GeneralCategoriesAdmin from "@/pages/GeneralCategoriesAdmin";
import CategoriesAdmin from "@/pages/CategoriesAdmin";
import CookieManagement from "@/pages/CookieManagement";
import InvoiceDesigner from "@/pages/InvoiceDesigner";

// Vendor Management
import VendorManagement from "@/pages/VendorManagement";
import VendorOrders from "@/pages/VendorOrders";
import VendorReturns from "@/pages/VendorReturns";
import VendorFinancial from "@/pages/VendorFinancial";

// Customer Role Dashboards
import CustomerDashboard from "@/pages/CustomerDashboard";
import CustomerAffiliateDashboard from "@/pages/CustomerAffiliateDashboard";
import CustomerVIPDashboard from "@/pages/CustomerVIPDashboard";
import CustomerDriverDashboard from "@/pages/CustomerDriverDashboard";

// Admin Authentication
import AdminLogin from "@/pages/AdminLogin";
import AdminUsersManagement from "@/pages/AdminUsersManagement";
import AdminCampaigns from "@/pages/AdminCampaigns";
import AdminOAuthSettings from "@/pages/AdminOAuthSettings";

// Affiliate Portal imports
import AffiliateLogin from "@/pages/AffiliateLogin";
import AffiliateRegister from "@/pages/AffiliateRegister";
import AffiliateDashboard from "@/pages/AffiliateDashboard";
import AffiliateTools from "@/pages/AffiliateTools";
import AffiliateEarnings from "@/pages/AffiliateEarnings";
import AffiliateSettings from "@/pages/AffiliateSettings";
import AffiliateCreateOrder from "@/pages/AffiliateCreateOrder";
import ProductCatalog from "@/pages/affiliate-portal/ProductCatalog";
import ProductRequest from "@/pages/affiliate-portal/ProductRequest";
import AffiliateProtectedRoute from "@/components/AffiliateProtectedRoute";
// import { AffiliateAuthProvider } from "@/contexts/AffiliateAuthContext"; // REMOVED: Admin doesn't need affiliate auth
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import POSProtectedRoute from "@/components/POSProtectedRoute";
import POSLayout from "@/layouts/POSLayout";
import POSLogin from "@/pages/POSLogin";

// Admin Routes (inside sidebar layout)
function AdminRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/store" component={LandingPage} />
      <Route path="/product-landing-pages" component={ProductLandingPageManager} />
      <Route path="/landing-page-editor" component={LandingPageEditor} />
      <Route path="/landing-page-editor/:id" component={LandingPageEditor} />
      <Route path="/storefront-manager" component={StorefrontManager} />
      <Route path="/products" component={Products} />
      <Route path="/general-categories-admin" component={GeneralCategoriesAdmin} />
      <Route path="/categories-admin" component={CategoriesAdmin} />
      <Route path="/orders" component={Orders} />
      <Route path="/book-orders" component={BookOrders} />
      <Route path="/book-orders-dashboard" component={BookOrdersDashboard} />
      <Route path="/driver-management" component={DriverManagement} />
      <Route path="/delivery-dashboard" component={DeliveryDashboard} />
      <Route path="/vehicle-management" component={VehicleManagement} />
      <Route path="/delivery-orders" component={DeliveryOrders} />
      <Route path="/car-groups" component={CarGroups} />
      <Route path="/book-categories" component={BookCategories} />
      <Route path="/orders/:id" component={OrderDetails} />
      <Route path="/customers" component={Customers} />
      <Route path="/customers/:id" component={CustomerDetails} />
      <Route path="/affiliate-management" component={AffiliateManagement} />
      <Route path="/affiliate-products" component={AffiliateProductAssignment} />
      <Route path="/affiliate-product-management" component={AffiliateProductManagement} />
      <Route path="/affiliate-product-requests" component={AffiliateProductRequestApproval} />
      <Route path="/store-products" component={StoreProductAssignment} />
      <Route path="/vip-approvals" component={VIPManagement} />
      <Route path="/driver-approvals" component={DriverApprovalManagement} />
      <Route path="/affiliate-approvals" component={AffiliateApprovalManagement} />
      <Route path="/admin-users" component={AdminUsersManagement} />
      <Route path="/admin-campaigns" component={AdminCampaigns} />
      <Route path="/admin/oauth-settings" component={AdminOAuthSettings} />
      <Route path="/categories" component={CategoryManager} />
      <Route path="/frontend-management" component={FrontendManagement} />
      <Route path="/customer-local-assignment" component={CustomerLocalAssignment} />
      <Route path="/tag-management" component={TagManagement} />
      <Route path="/industries" component={IndustryManager} />
      <Route path="/task-assignment" component={TaskAssignment} />
      <Route path="/faq-templates" component={FaqTemplatesPage} />
      <Route path="/faq-library" component={FAQLibrary} />
      <Route path="/shop-settings" component={ShopSettings} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/post-analytics" component={PostPerformanceAnalytics} />
      <Route path="/best-time-recommendations" component={BestTimeRecommendations} />
      <Route path="/review-management" component={ReviewManagement} />
      <Route path="/chatbot" component={Chatbot} />
      <Route path="/chatbot-analytics" component={ChatbotAnalytics} />
      <Route path="/chatbot-settings" component={ChatbotSettings} />
      <Route path="/chatbot-responses" component={ChatbotResponses} />
      <Route path="/chatbot-test" component={ChatbotTest} />
      <Route path="/chat-logs" component={ChatLogs} />
      <Route path="/content-library" component={ContentLibrary} />
      <Route path="/queue-manager" component={QueueManager} />
      <Route path="/post-scheduler" component={PostScheduler} />
      <Route path="/satellites" component={Satellites} />
      <Route path="/viettelpost-settings" component={ViettelPostSettings} />
      <Route path="/landing-page-manager" component={LandingPageManager} />
      <Route path="/facebook-apps" component={FacebookAppsManager} />
      <Route path="/groups-manager" component={GroupsManager} />
      <Route path="/tiktok-business" component={TikTokBusiness} />
      <Route path="/tiktok-shop" component={TikTokShop} />
      <Route path="/shopee" component={Shopee} />
      <Route path="/api-management" component={ApiManagement} />
      <Route path="/worker-management" component={WorkerManagement} />
      <Route path="/ip-pool-manager" component={IPPoolManager} />
      <Route path="/bot-status" component={BotStatusDashboard} />
      <Route path="/ngrok-config" component={NgrokConfig} />
      <Route path="/books" component={ExistingBooksManagement} />
      <Route path="/book-catalog-admin" component={BookCatalogAdmin} />
      <Route path="/books-abebooks" component={BooksManagement} />
      <Route path="/book-customers" component={BookCustomers} />
      <Route path="/book-sellers" component={BookSellers} />
      <Route path="/book-sellers/:sellerId/config" component={SellerConfigPanel} />
      <Route path="/seller-performance" component={SellerPerformanceAnalytics} />
      <Route path="/book-checkout" component={BookCheckout} />
      <Route path="/payment-settings" component={PaymentGatewaySettings} />
      <Route path="/book-transactions" component={BookPaymentTransactions} />
      <Route path="/discounts" component={DiscountManagement} />
      <Route path="/gifts" component={GiftManagement} />
      <Route path="/cookie-management" component={CookieManagement} />
      <Route path="/admin/invoice-designer" component={InvoiceDesigner} />
      <Route path="/mobile" component={MobileStorefront} />
      <Route path="/member-profile" component={MemberProfile} />
      <Route path="/member/vouchers" component={MyVouchers} />
      <Route path="/member/campaigns" component={Campaigns} />
      <Route path="/linked-accounts" component={LinkedAccounts} />
      <Route path="/vendors" component={VendorManagement} />
      <Route path="/vendor-orders" component={VendorOrders} />
      <Route path="/vendor-returns" component={VendorReturns} />
      <Route path="/vendor-financial" component={VendorFinancial} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize GA4 when app loads
  useEffect(() => {
    initializeGA4();
  }, []);

  // Custom sidebar width for e-commerce admin
  const style = {
    "--sidebar-width": "20rem",       // 320px for better navigation
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  return (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router hook={useHashLocation}>
              {/* Public Routes (outside admin layout) */}
              <Switch>
              <Route path="/checkout" component={GuestCheckoutPage} />
              <Route path="/lp/:slug" component={PublicLandingPage} />
              <Route path="/sf/:name" component={PublicStorefront} />
              <Route path="/product/:slug" component={ProductPage} />
              <Route path="/shop" component={ShopeeHomePage} />
              <Route path="/calendar" component={FullLunarCalendarPage} />
              <Route path="/book-payment-success" component={PaymentSuccess} />
              <Route path="/book-payment-failed" component={PaymentFailed} />
              
              {/* Customer Role Dashboards - Require customer ID in URL */}
              <Route path="/customer/dashboard/:customerId" component={CustomerDashboard} />
              <Route path="/customer/affiliate-dashboard/:customerId" component={CustomerAffiliateDashboard} />
              <Route path="/customer/vip-dashboard" component={CustomerVIPDashboard} />
              <Route path="/customer/driver-services/:customerId" component={CustomerDriverDashboard} />
              
              {/* Admin Login */}
              <Route path="/login" component={AdminLogin} />
              <Route path="/admin/login" component={AdminLogin} />
              
              {/* POS Login */}
              <Route path="/pos/login" component={POSLogin} />
              
              {/* VIP Registration (Public QR-based) */}
              <Route path="/vip-register/:token" component={VIPRegister} />
              
              {/* Affiliate Portal Routes */}
              <Route path="/aff/login" component={AffiliateLogin} />
              <Route path="/aff/register" component={AffiliateRegister} />
              <Route path="/aff/dashboard">
                <AffiliateProtectedRoute>
                  <AffiliateDashboard />
                </AffiliateProtectedRoute>
              </Route>
              <Route path="/aff/tools">
                <AffiliateProtectedRoute>
                  <AffiliateTools />
                </AffiliateProtectedRoute>
              </Route>
              <Route path="/aff/create-order">
                <AffiliateProtectedRoute>
                  <AffiliateCreateOrder />
                </AffiliateProtectedRoute>
              </Route>
              <Route path="/aff/products">
                <AffiliateProtectedRoute>
                  <ProductCatalog />
                </AffiliateProtectedRoute>
              </Route>
              <Route path="/aff/product-requests">
                <AffiliateProtectedRoute>
                  <ProductRequest />
                </AffiliateProtectedRoute>
              </Route>
              <Route path="/aff/earnings">
                <AffiliateProtectedRoute>
                  <AffiliateEarnings />
                </AffiliateProtectedRoute>
              </Route>
              <Route path="/aff/settings">
                <AffiliateProtectedRoute>
                  <AffiliateSettings />
                </AffiliateProtectedRoute>
              </Route>
              
              {/* POS Route - Full-screen layout */}
              <Route path="/pos">
                <POSProtectedRoute>
                  <POSLayout>
                    <POS />
                  </POSLayout>
                </POSProtectedRoute>
              </Route>
              
              <Route path="/*">
                {/* Admin Routes (simple layout) - Auth disabled for testing */}
                <div className="flex flex-row h-screen overflow-hidden bg-[#F5F5F5]" style={{ display: 'flex', flexDirection: 'row' }}>
                  {/* Sidebar - Fixed Left */}
                  <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0" style={{ width: '256px', flexShrink: 0 }}>
                    <CompleteAdminSidebar />
                  </div>
                  
                  {/* Main Content Area - Flex Right */}
                  <div className="flex-1 overflow-y-auto" style={{ flex: 1 }}>
                    <AdminRouter />
                  </div>
                </div>
              </Route>
            </Switch>
            </Router>
            
            <Toaster />
          </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
