'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, MapPin, Car, AlertCircle } from "lucide-react";
import { canPassengerCheckIn } from "../utils/tripValidation";
import type { TripStatus, PassengerCheckIn } from "../mockData";

interface PassengerCheckInDialogProps {
  tripId: string;
  status: TripStatus;
  checkInTime: string | null;
  passengerCheckIns: PassengerCheckIn[];
  passengerId: string;
  departureWindowStart: string;
  driverName: string;
  vehicleModel: string;
  licensePlate: string;
  pickupLocation: string;
  seatId: string;
  onCheckIn: () => void;
  children?: React.ReactNode;
}

export function PassengerCheckInDialog({
  tripId,
  status,
  checkInTime,
  passengerCheckIns,
  passengerId,
  departureWindowStart,
  driverName,
  vehicleModel,
  licensePlate,
  pickupLocation,
  seatId,
  onCheckIn,
  children
}: PassengerCheckInDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = canPassengerCheckIn(
    status,
    checkInTime,
    passengerCheckIns,
    passengerId,
    departureWindowStart
  );

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      await onCheckIn();
      setOpen(false);
    } catch (error) {
      console.error("Check-in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            disabled={!validation.canPassengerCheckIn} 
            size="sm"
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Check-in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Xác nhận đã lên xe
          </DialogTitle>
          <DialogDescription>
            Xác nhận bạn đã có mặt tại điểm đón và lên xe
          </DialogDescription>
        </DialogHeader>

        {!validation.canPassengerCheckIn ? (
          <div className="py-4">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Không thể check-in
                </p>
                <p className="text-sm text-destructive/80 mt-1">
                  {validation.reason}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Thông tin xe</p>
                  <p className="text-sm text-muted-foreground">
                    {driverName} - {vehicleModel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Biển số: {licensePlate}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Điểm đón</p>
                  <p className="text-sm text-muted-foreground">
                    {pickupLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Ghế của bạn</p>
                  <p className="text-sm text-muted-foreground">
                    Ghế {seatId}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Chỉ check-in khi bạn đã có mặt tại điểm đón và đã lên xe. 
                Tài xế sẽ nhận được thông báo.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          {validation.canPassengerCheckIn && (
            <Button 
              onClick={handleCheckIn} 
              disabled={isSubmitting}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              {isSubmitting ? "Đang xử lý..." : "Xác nhận đã lên xe"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
