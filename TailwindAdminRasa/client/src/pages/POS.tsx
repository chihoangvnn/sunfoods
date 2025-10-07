import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import POSSales from "@/components/POSSales";
import { OrdersPOS } from "@/components/OrdersPOS";
import { ChatSupportPOS } from "@/components/ChatSupportPOS";
import { ShoppingCart, Package, MessageCircle } from "lucide-react";

export default function POS() {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Bán hàng</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Orders POS</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-0">
          <POSSales />
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <OrdersPOS />
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <ChatSupportPOS />
        </TabsContent>
      </Tabs>
    </div>
  );
}
