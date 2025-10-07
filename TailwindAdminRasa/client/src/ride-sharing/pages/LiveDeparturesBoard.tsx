import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCard } from "@/ride-sharing/components/TripCard";
import { Card } from "@/components/ui/card";
import { Bus, ArrowRight } from "lucide-react";
import { mockTrips } from "@/ride-sharing/mockData";

export default function LiveDeparturesBoard() {
  const [activeTab, setActiveTab] = useState("tp-to-dn");
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const now = currentTime;

  const tpToDnTrips = mockTrips
    .filter(t => {
      const departureWindowEnd = new Date(t.departureWindowEnd).getTime();
      return t.startLocation === "Tiên Phước" && 
             t.endLocation === "Đà Nẵng" && 
             now <= departureWindowEnd;
    })
    .sort((a, b) => new Date(a.departureWindowStart).getTime() - new Date(b.departureWindowStart).getTime());

  const dnToTpTrips = mockTrips
    .filter(t => {
      const departureWindowEnd = new Date(t.departureWindowEnd).getTime();
      return t.startLocation === "Đà Nẵng" && 
             t.endLocation === "Tiên Phước" && 
             now <= departureWindowEnd;
    })
    .sort((a, b) => new Date(a.departureWindowStart).getTime() - new Date(b.departureWindowStart).getTime());

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex items-center gap-2">
        <Bus className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Bảng Chờ Trực Tuyến</h1>
          <p className="text-muted-foreground">Các chuyến xe sắp khởi hành</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tp-to-dn" className="flex items-center gap-2">
            Tiên Phước
            <ArrowRight className="h-4 w-4" />
            Đà Nẵng
          </TabsTrigger>
          <TabsTrigger value="dn-to-tp" className="flex items-center gap-2">
            Đà Nẵng
            <ArrowRight className="h-4 w-4" />
            Tiên Phước
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tp-to-dn" className="space-y-4 mt-6">
          {tpToDnTrips.length > 0 ? (
            tpToDnTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Chưa có chuyến xe nào sắp khởi hành trên tuyến này
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dn-to-tp" className="space-y-4 mt-6">
          {dnToTpTrips.length > 0 ? (
            dnToTpTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Chưa có chuyến xe nào sắp khởi hành trên tuyến này
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
