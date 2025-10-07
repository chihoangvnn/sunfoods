import { Request, Response, Router, NextFunction } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().max(255).optional(),
  status: z.string().optional()
});

interface DriverRequest extends Request {
  driver?: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    roles: string[];
    membershipTier: string;
  };
}

const checkDriverAccess = async (req: DriverRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = (req.session as any)?.userId;
    
    if (!customerId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Vui lòng đăng nhập để truy cập Driver Portal'
      });
    }

    const customer = await storage.getCustomer(customerId);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    const hasDriverRole = customer.customerRole === 'driver';

    if (!hasDriverRole) {
      return res.status(403).json({
        error: 'Driver access required',
        message: 'Bạn cần có quyền Driver để truy cập nội dung này.'
      });
    }

    req.driver = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      roles: [customer.customerRole],
      membershipTier: customer.membershipTier || 'member'
    };

    next();
  } catch (error) {
    console.error('❌ Driver Access Check Error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Lỗi kiểm tra quyền truy cập Driver'
    });
  }
};

router.use(checkDriverAccess);

// 📊 GET /api/driver-portal/dashboard - Dashboard statistics
router.get('/dashboard', async (req: DriverRequest, res: Response) => {
  try {
    const driverId = req.driver!.id;
    
    const trips = await storage.getDriverTrips(driverId);
    const vehicles = await storage.getDriverVehicles(driverId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrips = trips.filter(trip => {
      const tripDate = new Date(trip.departureTime);
      return tripDate >= today;
    });
    
    const completedTrips = trips.filter(trip => trip.status === 'completed');
    const totalRevenue = completedTrips.reduce((sum, trip) => sum + Number(trip.totalRevenue || 0), 0);
    const totalDistance = completedTrips.reduce((sum, trip) => sum + Number(trip.distance || 0), 0);
    
    const todayRevenue = todayTrips
      .filter(trip => trip.status === 'completed')
      .reduce((sum, trip) => sum + Number(trip.totalRevenue || 0), 0);
    
    const stats = {
      totalTrips: trips.length,
      completedTrips: completedTrips.length,
      activeTrips: trips.filter(trip => ['scheduled', 'boarding', 'in_progress'].includes(trip.status)).length,
      totalRevenue,
      totalDistance,
      todayRevenue,
      todayTrips: todayTrips.length,
      vehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length
    };

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching driver dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard',
      message: 'Không thể tải dashboard'
    });
  }
});

// 🚗 GET /api/driver-portal/vehicles - List driver's vehicles
router.get('/vehicles', async (req: DriverRequest, res: Response) => {
  try {
    const driverId = req.driver!.id;
    const vehicles = await storage.getDriverVehicles(driverId);
    
    res.json(vehicles);
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    res.status(500).json({
      error: 'Failed to fetch vehicles',
      message: 'Không thể tải danh sách xe'
    });
  }
});

// ➕ POST /api/driver-portal/vehicles - Create new vehicle
router.post('/vehicles', async (req: DriverRequest, res: Response) => {
  try {
    const driverId = req.driver!.id;
    
    const vehicleData = {
      ...req.body,
      driverId,
      status: 'active',
      isVerified: false
    };
    
    const vehicle = await storage.createVehicle(vehicleData);
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('❌ Error creating vehicle:', error);
    res.status(500).json({
      error: 'Failed to create vehicle',
      message: 'Không thể tạo xe mới'
    });
  }
});

// 🚌 GET /api/driver-portal/trips - List driver's trips
router.get('/trips', async (req: DriverRequest, res: Response) => {
  try {
    const driverId = req.driver!.id;
    const query = querySchema.parse(req.query);
    
    const trips = await storage.getDriverTrips(driverId, query.status, query.limit);
    
    res.json(trips);
  } catch (error) {
    console.error('❌ Error fetching trips:', error);
    res.status(500).json({
      error: 'Failed to fetch trips',
      message: 'Không thể tải danh sách chuyến đi'
    });
  }
});

// 🔍 GET /api/driver-portal/trips/:id - Get trip details
router.get('/trips/:id', async (req: DriverRequest, res: Response) => {
  try {
    const { id } = req.params;
    const driverId = req.driver!.id;
    
    const trip = await storage.getDriverTripById(id);
    
    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'Không tìm thấy chuyến đi'
      });
    }
    
    if (trip.driverId !== driverId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Bạn không có quyền truy cập chuyến đi này'
      });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('❌ Error fetching trip:', error);
    res.status(500).json({
      error: 'Failed to fetch trip',
      message: 'Không thể tải thông tin chuyến đi'
    });
  }
});

// ➕ POST /api/driver-portal/trips - Create new trip
router.post('/trips', async (req: DriverRequest, res: Response) => {
  try {
    const driverId = req.driver!.id;
    
    const tripData = {
      ...req.body,
      driverId,
      status: 'scheduled',
      bookedSeats: 0,
      totalRevenue: '0',
      expenses: '0',
      netProfit: '0'
    };
    
    const trip = await storage.createTrip(tripData);
    
    res.status(201).json(trip);
  } catch (error) {
    console.error('❌ Error creating trip:', error);
    res.status(500).json({
      error: 'Failed to create trip',
      message: 'Không thể tạo chuyến đi mới'
    });
  }
});

// ✏️ PUT /api/driver-portal/trips/:id/status - Update trip status
router.put('/trips/:id/status', async (req: DriverRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actualArrivalTime } = req.body;
    const driverId = req.driver!.id;
    
    const trip = await storage.getDriverTripById(id);
    
    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'Không tìm thấy chuyến đi'
      });
    }
    
    if (trip.driverId !== driverId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Bạn không có quyền cập nhật chuyến đi này'
      });
    }
    
    const updatedTrip = await storage.updateTripStatus(
      id, 
      status, 
      actualArrivalTime ? new Date(actualArrivalTime) : undefined
    );
    
    res.json(updatedTrip);
  } catch (error) {
    console.error('❌ Error updating trip status:', error);
    res.status(500).json({
      error: 'Failed to update trip status',
      message: 'Không thể cập nhật trạng thái chuyến đi'
    });
  }
});

// ✏️ PUT /api/driver-portal/trips/:id - Update trip
router.put('/trips/:id', async (req: DriverRequest, res: Response) => {
  try {
    const { id } = req.params;
    const driverId = req.driver!.id;
    
    const trip = await storage.getDriverTripById(id);
    
    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'Không tìm thấy chuyến đi'
      });
    }
    
    if (trip.driverId !== driverId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Bạn không có quyền cập nhật chuyến đi này'
      });
    }
    
    const updatedTrip = await storage.updateTrip(id, req.body);
    
    res.json(updatedTrip);
  } catch (error) {
    console.error('❌ Error updating trip:', error);
    res.status(500).json({
      error: 'Failed to update trip',
      message: 'Không thể cập nhật chuyến đi'
    });
  }
});

export default router;
