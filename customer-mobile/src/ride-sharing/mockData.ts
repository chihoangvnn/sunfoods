const now = new Date();
const addMinutes = (minutes: number) => {
  const date = new Date(now);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

export const mockDrivers = [
  {
    id: "d1",
    name: "Hùng",
    phone: "0905 123 456",
    rating: 4.8,
    completedTrips: 127,
    yearsExperience: 5,
    vehicles: [
      { model: "Toyota Innova", licensePlate: "92A-123.45", seatType: 7 }
    ]
  },
  {
    id: "d2",
    name: "Minh",
    phone: "0912 345 678",
    rating: 4.9,
    completedTrips: 95,
    yearsExperience: 3,
    vehicles: [
      { model: "Ford Everest", licensePlate: "92A-567.89", seatType: 7 }
    ]
  },
  {
    id: "d3",
    name: "Thanh",
    phone: "0987 654 321",
    rating: 4.7,
    completedTrips: 156,
    yearsExperience: 6,
    vehicles: [
      { model: "Mazda CX-5", licensePlate: "92B-234.56", seatType: 4 }
    ]
  },
  {
    id: "d4",
    name: "Tuấn",
    phone: "0909 876 543",
    rating: 4.6,
    completedTrips: 78,
    yearsExperience: 4,
    vehicles: [
      { model: "Honda CR-V", licensePlate: "92B-789.01", seatType: 7 }
    ]
  },
  {
    id: "d5",
    name: "Long",
    phone: "0903 456 789",
    rating: 4.5,
    completedTrips: 203,
    yearsExperience: 8,
    vehicles: [
      { model: "Mitsubishi Xpander", licensePlate: "92A-333.44", seatType: 7 }
    ]
  }
];

export type TripStatus = "pending" | "checked_in" | "in_progress" | "completed" | "cancelled";

export interface PassengerCheckIn {
  passengerId: string;
  passengerName: string;
  checkedInAt: string;
  seatId: string;
}

export const mockTrips = [
  {
    id: "1",
    driverId: "d1",
    driverName: "Hùng",
    driverPhone: "0905 123 456",
    driverRating: 4.8,
    vehicleModel: "Toyota Innova",
    seatType: 7,
    licensePlate: "92A-123.45",
    vehicleImageUrl: null,
    startLocation: "Tiên Phước",
    endLocation: "Đà Nẵng",
    departureWindowStart: addMinutes(5),
    departureWindowEnd: addMinutes(35),
    totalSeats: 7,
    availableSeats: 4,
    pricePerSeat: 120000,
    status: "pending" as TripStatus,
    checkInTime: null as string | null,
    actualDepartureTime: null as string | null,
    completedTime: null as string | null,
    passengerCheckIns: [] as PassengerCheckIn[]
  },
  {
    id: "2",
    driverId: "d2",
    driverName: "Minh",
    driverPhone: "0912 345 678",
    driverRating: 4.9,
    vehicleModel: "Ford Everest",
    seatType: 7,
    licensePlate: "92A-567.89",
    vehicleImageUrl: null,
    startLocation: "Tiên Phước",
    endLocation: "Đà Nẵng",
    departureWindowStart: addMinutes(20),
    departureWindowEnd: addMinutes(50),
    totalSeats: 7,
    availableSeats: 7,
    pricePerSeat: 130000,
    status: "pending" as TripStatus,
    checkInTime: null as string | null,
    actualDepartureTime: null as string | null,
    completedTime: null as string | null,
    passengerCheckIns: [] as PassengerCheckIn[]
  },
  {
    id: "3",
    driverId: "d3",
    driverName: "Thanh",
    driverPhone: "0987 654 321",
    driverRating: 4.7,
    vehicleModel: "Mazda CX-5",
    seatType: 4,
    licensePlate: "92B-234.56",
    vehicleImageUrl: null,
    startLocation: "Đà Nẵng",
    endLocation: "Tiên Phước",
    departureWindowStart: addMinutes(45),
    departureWindowEnd: addMinutes(75),
    totalSeats: 4,
    availableSeats: 3,
    pricePerSeat: 110000,
    status: "pending" as TripStatus,
    checkInTime: null as string | null,
    actualDepartureTime: null as string | null,
    completedTime: null as string | null,
    passengerCheckIns: [] as PassengerCheckIn[]
  },
  {
    id: "4",
    driverId: "d4",
    driverName: "Tuấn",
    driverPhone: "0909 876 543",
    driverRating: 4.6,
    vehicleModel: "Honda CR-V",
    seatType: 7,
    licensePlate: "92B-789.01",
    vehicleImageUrl: null,
    startLocation: "Đà Nẵng",
    endLocation: "Tiên Phước",
    departureWindowStart: addMinutes(90),
    departureWindowEnd: addMinutes(120),
    totalSeats: 7,
    availableSeats: 4,
    pricePerSeat: 125000,
    status: "pending" as TripStatus,
    checkInTime: null as string | null,
    actualDepartureTime: null as string | null,
    completedTime: null as string | null,
    passengerCheckIns: [] as PassengerCheckIn[]
  },
  {
    id: "5",
    driverId: "d5",
    driverName: "Long",
    driverPhone: "0903 456 789",
    driverRating: 4.5,
    vehicleModel: "Mitsubishi Xpander",
    seatType: 7,
    licensePlate: "92A-333.44",
    vehicleImageUrl: null,
    startLocation: "Tiên Phước",
    endLocation: "Đà Nẵng",
    departureWindowStart: addMinutes(-10),
    departureWindowEnd: addMinutes(20),
    totalSeats: 7,
    availableSeats: 2,
    pricePerSeat: 115000,
    status: "checked_in" as TripStatus,
    checkInTime: addMinutes(-15),
    actualDepartureTime: null as string | null,
    completedTime: null as string | null,
    passengerCheckIns: [
      {
        passengerId: "p1",
        passengerName: "Nguyễn Văn A",
        checkedInAt: addMinutes(-12),
        seatId: "A"
      }
    ] as PassengerCheckIn[]
  }
];

export const mockVehicles = [
  {
    id: "1",
    licensePlate: "92A-123.45",
    model: "Toyota Innova",
    seatType: 7
  },
  {
    id: "2",
    licensePlate: "92B-456.78",
    model: "Mazda CX-5",
    seatType: 4
  }
];

export interface SeatBooking {
  id: string;
  status: "available" | "pending_confirmation" | "confirmed" | "locked";
  passengerId?: string;
  passengerName?: string;
  passengerPhone?: string;
  pickupLocation?: {
    address?: string;
    gpsCoords?: {
      lat: number;
      lng: number;
    };
  };
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  tripId: string;
  createdAt: string;
  tags?: string[];
}

export const mockDriverReviews: Record<string, Review[]> = {
  "1": [ // Tài xế Hùng
    {
      id: "dr1",
      reviewerId: "p1",
      reviewerName: "Nguyễn Văn A",
      rating: 5,
      comment: "Tài xế lái xe rất an toàn, đúng giờ. Rất hài lòng!",
      tripId: "1",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      tags: ["Đúng giờ", "Lái xe tốt", "Thân thiện"]
    },
    {
      id: "dr2",
      reviewerId: "p2",
      reviewerName: "Trần Thị B",
      rating: 4,
      comment: "Xe sạch sẽ, tài xế nhiệt tình.",
      tripId: "1",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      tags: ["Xe sạch", "Nhiệt tình"]
    },
    {
      id: "dr3",
      reviewerId: "p3",
      reviewerName: "Lê Văn C",
      rating: 5,
      comment: "Tuyệt vời! Sẽ đi lại lần sau.",
      tripId: "1",
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      tags: ["Đúng giờ", "Chuyên nghiệp"]
    }
  ],
  "2": [ // Tài xế Minh
    {
      id: "dr4",
      reviewerId: "p4",
      reviewerName: "Phạm Thị D",
      rating: 5,
      comment: "Chuyến đi tuyệt vời!",
      tripId: "2",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      tags: ["Tốt"]
    }
  ]
};

export const mockPassengerReviews: Record<string, Review[]> = {
  "p1": [ // Nguyễn Văn A
    {
      id: "pr1",
      reviewerId: "d1",
      reviewerName: "Hùng",
      rating: 5,
      comment: "Khách hàng đúng giờ, lịch sự.",
      tripId: "1",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      tags: ["Đúng giờ", "Lịch sự"]
    }
  ],
  "p2": [ // Trần Thị B
    {
      id: "pr2",
      reviewerId: "d1",
      reviewerName: "Hùng",
      rating: 4,
      comment: "Khách tốt.",
      tripId: "1",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ]
};

export const mockTripSeats: Record<string, SeatBooking[]> = {
  "1": [
    { id: "Giữa", status: "available" },
    { 
      id: "A", 
      status: "confirmed",
      passengerId: "p1",
      passengerName: "Nguyễn Văn A", 
      passengerPhone: "0901234567",
      pickupLocation: {
        address: "Ngã 3 Tiên Kỳ",
        gpsCoords: { lat: 15.5437, lng: 108.2345 }
      }
    },
    { 
      id: "B", 
      status: "pending_confirmation",
      passengerId: "p2",
      passengerName: "Trần Thị B", 
      passengerPhone: "0907654321",
      pickupLocation: {
        address: "Trước chợ Tiên Phước"
      }
    },
    { id: "C", status: "available" },
    { id: "D", status: "available" },
    { 
      id: "E", 
      status: "pending_confirmation",
      passengerId: "p3",
      passengerName: "Lê Văn C", 
      passengerPhone: "0909876543",
      pickupLocation: {
        gpsCoords: { lat: 15.5512, lng: 108.2401 }
      }
    },
    { id: "F", status: "available" }
  ],
  "2": [
    { id: "Giữa", status: "available" },
    { id: "A", status: "available" },
    { id: "B", status: "available" },
    { id: "C", status: "available" },
    { id: "D", status: "available" },
    { id: "E", status: "available" },
    { id: "F", status: "available" }
  ],
  "3": [
    { id: "Giữa", status: "available" },
    { id: "A", status: "confirmed", passengerId: "p4", passengerName: "Phạm Thị D", passengerPhone: "0908765432" },
    { id: "B", status: "available" },
    { id: "C", status: "available" }
  ],
  "4": [
    { id: "Giữa", status: "available" },
    { id: "A", status: "pending_confirmation", passengerId: "p5", passengerName: "Hoàng Văn E", passengerPhone: "0906543210" },
    { id: "B", status: "confirmed", passengerId: "p6", passengerName: "Đỗ Thị F", passengerPhone: "0905432109" },
    { id: "C", status: "confirmed", passengerId: "p7", passengerName: "Mai Văn G", passengerPhone: "0904321098" },
    { id: "D", status: "available" },
    { id: "E", status: "available" },
    { id: "F", status: "available" }
  ],
  "5": [
    { id: "Giữa", status: "available" },
    { id: "A", status: "confirmed", passengerId: "p8", passengerName: "Nguyễn Văn H", passengerPhone: "0901111111" },
    { id: "B", status: "confirmed", passengerId: "p9", passengerName: "Trần Thị I", passengerPhone: "0902222222" },
    { id: "C", status: "confirmed", passengerId: "p10", passengerName: "Lê Văn K", passengerPhone: "0903333333" },
    { id: "D", status: "confirmed", passengerId: "p11", passengerName: "Phạm Thị L", passengerPhone: "0904444444" },
    { id: "E", status: "confirmed", passengerId: "p12", passengerName: "Hoàng Văn M", passengerPhone: "0905555555" },
    { id: "F", status: "available" }
  ]
};

// ==================== PACKAGE DELIVERY SYSTEM ====================

export interface Package {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  images: string[];
  
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  value?: number;
  packageType?: "electronics" | "food" | "fragile" | "documents" | "clothing" | "other";
  description?: string;
  
  paymentMethod: "cash" | "cod" | "bank_transfer";
  codAmount?: number;
  deliveryFee?: number;
  serviceFee?: number;
  
  specialNotes?: string;
  deliveryInstructions?: string;
  
  status: "pending" | "bidded" | "price_confirmed" | "in_transit" | "delivered" | "cancelled";
  confirmedPrice?: number;
  confirmedDriverId?: string;
  confirmedDriverName?: string;
  confirmedDriverPhone?: string;
  estimatedDeliveryTime?: string;
  
  podImages?: string[];
  podOtp?: string;
  podTimestamp?: string;
  
  rating?: number;
  ratingComment?: string;
  ratedAt?: string;
  
  cancelReason?: string;
  cancelledBy?: "sender" | "driver";
  cancelledAt?: string;
  
  createdAt: string;
  priceConfirmedAt?: string;
  deliveredAt?: string;
}

export interface PackageBid {
  id: string;
  packageId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  price: number;
  estimatedDeliveryTime?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export const mockPackages: Package[] = [
  {
    id: "pkg1",
    senderId: "sender1",
    senderName: "Nguyễn Văn An",
    senderPhone: "0901234567",
    senderAddress: "123 Lê Lợi, Tiên Phước",
    receiverName: "Trần Thị Bình",
    receiverPhone: "0907654321",
    receiverAddress: "456 Trần Phú, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400"
    ],
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 15 },
    value: 500000,
    packageType: "electronics",
    description: "Laptop Dell cũ, còn nguyên hộp",
    paymentMethod: "cod",
    codAmount: 500000,
    specialNotes: "Hàng dễ vỡ, xin vui lòng cẩn thận",
    deliveryInstructions: "Gọi trước 15 phút",
    status: "pending",
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "pkg2",
    senderId: "sender2",
    senderName: "Lê Thị Chi",
    senderPhone: "0909876543",
    senderAddress: "789 Nguyễn Huệ, Tiên Phước",
    receiverName: "Phạm Văn Dũng",
    receiverPhone: "0908765432",
    receiverAddress: "321 Hải Phòng, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400"
    ],
    weight: 5,
    dimensions: { length: 40, width: 30, height: 25 },
    value: 1200000,
    packageType: "fragile",
    description: "Đồ gốm sứ trang trí",
    paymentMethod: "cash",
    specialNotes: "Hàng dễ vỡ, gói kỹ",
    status: "bidded",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "pkg3",
    senderId: "sender1",
    senderName: "Nguyễn Văn An",
    senderPhone: "0901234567",
    senderAddress: "123 Lê Lợi, Tiên Phước",
    receiverName: "Hoàng Thị Ên",
    receiverPhone: "0906543210",
    receiverAddress: "654 Lý Thường Kiệt, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400",
      "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400"
    ],
    weight: 1,
    dimensions: { length: 25, width: 20, height: 10 },
    value: 300000,
    packageType: "clothing",
    description: "Quần áo thời trang",
    paymentMethod: "bank_transfer",
    deliveryInstructions: "Giao giờ hành chính",
    status: "price_confirmed",
    confirmedPrice: 50000,
    deliveryFee: 45000,
    serviceFee: 5000,
    confirmedDriverId: "d1",
    confirmedDriverName: "Hùng",
    confirmedDriverPhone: "0905 123 456",
    estimatedDeliveryTime: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    priceConfirmedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "pkg4",
    senderId: "sender3",
    senderName: "Đỗ Văn Giang",
    senderPhone: "0905432109",
    senderAddress: "147 Hai Bà Trưng, Tiên Phước",
    receiverName: "Mai Thị Hoa",
    receiverPhone: "0904321098",
    receiverAddress: "258 Điện Biên Phủ, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=400"
    ],
    weight: 0.5,
    dimensions: { length: 30, width: 21, height: 2 },
    value: 50000,
    packageType: "documents",
    description: "Hồ sơ và giấy tờ quan trọng",
    paymentMethod: "cash",
    specialNotes: "Giao trực tiếp vào tay người nhận",
    deliveryInstructions: "Gọi điện trước, không giao cho người khác",
    status: "in_transit",
    confirmedPrice: 45000,
    deliveryFee: 40000,
    serviceFee: 5000,
    confirmedDriverId: "d2",
    confirmedDriverName: "Minh",
    confirmedDriverPhone: "0912 345 678",
    estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(),
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    priceConfirmedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "pkg5",
    senderId: "sender2",
    senderName: "Lê Thị Chi",
    senderPhone: "0909876543",
    senderAddress: "789 Nguyễn Huệ, Tiên Phước",
    receiverName: "Nguyễn Văn Inh",
    receiverPhone: "0903210987",
    receiverAddress: "369 Quang Trung, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1581181207749-ba5e4a89f926?w=400"
    ],
    weight: 3,
    dimensions: { length: 35, width: 25, height: 20 },
    value: 800000,
    packageType: "food",
    description: "Đặc sản địa phương",
    paymentMethod: "cod",
    codAmount: 800000,
    specialNotes: "Hàng thực phẩm, giao nhanh",
    status: "delivered",
    confirmedPrice: 40000,
    deliveryFee: 35000,
    serviceFee: 5000,
    confirmedDriverId: "d1",
    confirmedDriverName: "Hùng",
    confirmedDriverPhone: "0905 123 456",
    estimatedDeliveryTime: new Date(Date.now() - 79200000).toISOString(),
    podImages: [
      "https://images.unsplash.com/photo-1578763625217-9d6c0fae01a8?w=400"
    ],
    podOtp: "1234",
    podTimestamp: new Date(Date.now() - 79200000).toISOString(),
    rating: 5,
    ratingComment: "Giao hàng nhanh, tài xế thân thiện!",
    ratedAt: new Date(Date.now() - 75600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    priceConfirmedAt: new Date(Date.now() - 82800000).toISOString(),
    deliveredAt: new Date(Date.now() - 79200000).toISOString()
  },
  {
    id: "pkg6",
    senderId: "sender4",
    senderName: "Trần Văn Khang",
    senderPhone: "0902109876",
    senderAddress: "951 Phan Chu Trinh, Tiên Phước",
    receiverName: "Lê Thị Lan",
    receiverPhone: "0901098765",
    receiverAddress: "753 Bạch Đằng, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400",
      "https://images.unsplash.com/photo-1613581419121-5a2e6e5e5b5a?w=400",
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400"
    ],
    weight: 8,
    dimensions: { length: 50, width: 40, height: 30 },
    value: 2000000,
    packageType: "other",
    description: "Đồ gia dụng",
    paymentMethod: "bank_transfer",
    deliveryInstructions: "Giao buổi chiều sau 14h",
    status: "delivered",
    confirmedPrice: 60000,
    deliveryFee: 55000,
    serviceFee: 5000,
    confirmedDriverId: "d3",
    confirmedDriverName: "Thanh",
    confirmedDriverPhone: "0987 654 321",
    estimatedDeliveryTime: new Date(Date.now() - 165600000).toISOString(),
    podImages: [
      "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=400"
    ],
    podOtp: "5678",
    podTimestamp: new Date(Date.now() - 165600000).toISOString(),
    rating: 4,
    ratingComment: "Tốt, nhưng đến hơi trễ một chút",
    ratedAt: new Date(Date.now() - 162000000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    priceConfirmedAt: new Date(Date.now() - 169200000).toISOString(),
    deliveredAt: new Date(Date.now() - 165600000).toISOString()
  },
  {
    id: "pkg7",
    senderId: "sender1",
    senderName: "Nguyễn Văn An",
    senderPhone: "0901234567",
    senderAddress: "123 Lê Lợi, Tiên Phước",
    receiverName: "Võ Văn Nam",
    receiverPhone: "0909999888",
    receiverAddress: "888 Lê Duẩn, Đà Nẵng",
    images: [
      "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400"
    ],
    weight: 1.5,
    dimensions: { length: 30, width: 25, height: 15 },
    value: 400000,
    packageType: "electronics",
    description: "Tai nghe Bluetooth",
    paymentMethod: "cod",
    codAmount: 400000,
    status: "cancelled",
    cancelReason: "Người nhận không có mặt, người gửi yêu cầu hủy",
    cancelledBy: "sender",
    cancelledAt: new Date(Date.now() - 900000).toISOString(),
    createdAt: new Date(Date.now() - 5400000).toISOString()
  }
];

export const mockPackageBids: Record<string, PackageBid[]> = {
  "pkg1": [],
  "pkg2": [
    {
      id: "bid1",
      packageId: "pkg2",
      driverId: "d1",
      driverName: "Hùng",
      driverPhone: "0905 123 456",
      price: 50000,
      estimatedDeliveryTime: new Date(Date.now() + 7200000).toISOString(),
      status: "pending",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "bid2",
      packageId: "pkg2",
      driverId: "d2",
      driverName: "Minh",
      driverPhone: "0912 345 678",
      price: 45000,
      estimatedDeliveryTime: new Date(Date.now() + 5400000).toISOString(),
      status: "pending",
      createdAt: new Date(Date.now() - 1200000).toISOString()
    }
  ],
  "pkg3": [
    {
      id: "bid3",
      packageId: "pkg3",
      driverId: "d1",
      driverName: "Hùng",
      driverPhone: "0905 123 456",
      price: 50000,
      estimatedDeliveryTime: new Date(Date.now() + 3600000).toISOString(),
      status: "accepted",
      createdAt: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: "bid4",
      packageId: "pkg3",
      driverId: "d3",
      driverName: "Thanh",
      driverPhone: "0987 654 321",
      price: 55000,
      estimatedDeliveryTime: new Date(Date.now() + 7200000).toISOString(),
      status: "rejected",
      createdAt: new Date(Date.now() - 4800000).toISOString()
    }
  ],
  "pkg4": [
    {
      id: "bid5",
      packageId: "pkg4",
      driverId: "d2",
      driverName: "Minh",
      driverPhone: "0912 345 678",
      price: 45000,
      estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(),
      status: "accepted",
      createdAt: new Date(Date.now() - 9000000).toISOString()
    }
  ],
  "pkg5": [
    {
      id: "bid6",
      packageId: "pkg5",
      driverId: "d1",
      driverName: "Hùng",
      driverPhone: "0905 123 456",
      price: 40000,
      estimatedDeliveryTime: new Date(Date.now() - 79200000).toISOString(),
      status: "accepted",
      createdAt: new Date(Date.now() - 84600000).toISOString()
    }
  ],
  "pkg6": [
    {
      id: "bid7",
      packageId: "pkg6",
      driverId: "d3",
      driverName: "Thanh",
      driverPhone: "0987 654 321",
      price: 60000,
      estimatedDeliveryTime: new Date(Date.now() - 165600000).toISOString(),
      status: "accepted",
      createdAt: new Date(Date.now() - 171000000).toISOString()
    }
  ],
  "pkg7": [
    {
      id: "bid8",
      packageId: "pkg7",
      driverId: "d4",
      driverName: "Tuấn",
      driverPhone: "0909 876 543",
      price: 35000,
      estimatedDeliveryTime: new Date(Date.now() + 5400000).toISOString(),
      status: "pending",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ]
};
