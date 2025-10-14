"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import POSSales from "@/components/POSSales"
import { OrdersPOS } from "@/components/OrdersPOS"
import { ChatSupportPOS } from "@/components/ChatSupportPOS"
import { ShoppingCart, Package, MessageCircle } from "lucide-react"

export default function POSPage() {
  return (
    <div className="container mx-auto p-2 md:p-4">
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-2 md:mb-4">
          <TabsTrigger value="sales" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
            <ShoppingCart className="h-4 w-4" />
            <span>Bán hàng</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
            <Package className="h-4 w-4" />
            <span>Orders POS</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
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
  )
}
