import { Metadata } from 'next';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Car, Calendar, User } from "lucide-react";
import { mockDrivers, mockTrips, mockDriverReviews } from "@/ride-sharing/mockData";
import { TripCard } from "@/ride-sharing/components/TripCard";
import ReviewsList from "@/ride-sharing/components/ReviewsList";
import RatingStats from "@/ride-sharing/components/RatingStats";

export async function generateMetadata({ params }: { params: Promise<{ driverId: string }> }): Promise<Metadata> {
  const { driverId } = await params;
  const driver = mockDrivers.find(d => d.id === driverId);
  
  if (!driver) {
    return {
      title: 'Tài xế không tồn tại',
    };
  }

  return {
    title: `Tài xế ${driver.name} - ⭐${driver.rating}/5.0 | ${driver.completedTrips} chuyến`,
    description: `Tài xế ${driver.name} có ${driver.yearsExperience} năm kinh nghiệm, đã hoàn thành ${driver.completedTrips} chuyến với đánh giá ${driver.rating}/5.0. Đặt vé ngay!`,
    openGraph: {
      title: `Tài xế ${driver.name} - ⭐${driver.rating}/5.0`,
      description: `${driver.completedTrips} chuyến hoàn thành | ${driver.yearsExperience} năm kinh nghiệm`,
      images: [
        {
          url: '/images/spiritual-banner-2.jpg',
          width: 1200,
          height: 630,
          alt: `Tài xế ${driver.name}`,
        }
      ],
    },
  };
}

export default async function DriverProfilePage({ params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;
  const driver = mockDrivers.find(d => d.id === driverId);
  const driverTrips = mockTrips.filter(t => t.driverId === driverId);
  const driverReviews = Object.values(mockDriverReviews).flat().filter(r => 
    mockTrips.find(t => t.id === r.tripId)?.driverId === driverId
  ).slice(0, 5);

  if (!driver) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Không tìm thấy tài xế</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {driver.name.charAt(0)}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold mb-1">{driver.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{driver.rating}</span>
                  <span className="text-muted-foreground">/5.0</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{driver.completedTrips} chuyến</p>
                  <p className="text-xs text-muted-foreground">Hoàn thành</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{driver.yearsExperience} năm</p>
                  <p className="text-xs text-muted-foreground">Kinh nghiệm</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm col-span-2 md:col-span-1">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{driver.vehicles[0]?.model}</p>
                  <p className="text-xs text-muted-foreground">{driver.vehicles[0]?.seatType} chỗ • {driver.vehicles[0]?.licensePlate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {driverReviews.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Đánh giá từ khách hàng</h2>
          <div className="space-y-4">
            <RatingStats reviews={driverReviews} />
            <ReviewsList reviews={driverReviews} emptyMessage="Chưa có đánh giá nào" />
          </div>
        </Card>
      )}

      {driverTrips.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chuyến xe sắp tới</h2>
            <Badge variant="secondary">{driverTrips.length} chuyến</Badge>
          </div>
          
          <div className="space-y-3">
            {driverTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {driverTrips.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Tài xế chưa có chuyến xe nào sắp tới</p>
        </Card>
      )}
    </div>
  );
}
