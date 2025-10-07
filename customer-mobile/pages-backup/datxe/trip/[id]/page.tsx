import { Metadata } from 'next';
import TripDetails from "@/ride-sharing/pages/TripDetails";
import { mockTrips, mockDrivers } from "@/ride-sharing/mockData";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const trip = mockTrips.find(t => t.id === id);
  
  if (!trip) {
    return {
      title: 'Chuyến xe không tồn tại',
    };
  }

  const driver = mockDrivers.find(d => d.id === trip.driverId);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return {
    title: `${trip.startLocation} → ${trip.endLocation} - ${formatPrice(trip.pricePerSeat)}/ghế | Tài xế ${trip.driverName} ⭐${trip.driverRating}`,
    description: `Đặt vé xe từ ${trip.startLocation} đến ${trip.endLocation}. Tài xế ${trip.driverName} (${trip.driverRating}/5.0). Giá: ${formatPrice(trip.pricePerSeat)}/ghế. Xe ${trip.vehicleModel} ${trip.seatType} chỗ.`,
    openGraph: {
      title: `${trip.startLocation} → ${trip.endLocation} - ${formatPrice(trip.pricePerSeat)}/ghế`,
      description: `Tài xế ${trip.driverName} ⭐${trip.driverRating} | ${trip.vehicleModel} ${trip.seatType} chỗ`,
      images: [
        {
          url: '/images/spiritual-banner-3.jpg',
          width: 1200,
          height: 630,
          alt: `${trip.startLocation} đến ${trip.endLocation}`,
        }
      ],
    },
  };
}

export default function TripDetailsPage() {
  return <TripDetails />;
}
