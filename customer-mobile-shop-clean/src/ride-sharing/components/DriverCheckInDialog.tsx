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
import { CheckCircle, MapPin, Clock, Users, AlertCircle } from "lucide-react";
import { canDriverCheckIn } from "../utils/tripValidation";
import type { TripStatus } from "../mockData";

interface DriverCheckInDialogProps {
  tripId: string;
  status: TripStatus;
  departureWindowStart: string;
  checkInTime: string | null;
  startLocation: string;
  endLocation: string;
  bookedSeats: number;
  totalSeats: number;
  onCheckIn: () => void;
  children?: React.ReactNode;
}

export function DriverCheckInDialog({
  tripId,
  status,
  departureWindowStart,
  checkInTime,
  startLocation,
  endLocation,
  bookedSeats,
  totalSeats,
  onCheckIn,
  children
}: DriverCheckInDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validation = canDriverCheckIn(status, departureWindowStart, checkInTime);

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

  const formatDepartureTime = () => {
    return new Date(departureWindowStart).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            disabled={!validation.canCheckIn} 
            size="sm"
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Check-in
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Xác nhận Check-in
          </DialogTitle>
          <DialogDescription>
            Xác nhận bạn đã sẵn sàng cho chuyến đi
          </DialogDescription>
        </DialogHeader>

        {!validation.canCheckIn ? (
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
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Tuyến đường</p>
                  <p className="text-sm text-muted-foreground">
                    {startLocation} → {endLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Giờ khởi hành</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDepartureTime()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Hành khách</p>
                  <p className="text-sm text-muted-foreground">
                    {bookedSeats}/{totalSeats} chỗ đã đặt
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sau khi check-in, hành khách sẽ nhận được thông báo và có thể check-in. 
                Bạn sẽ có thể khởi hành chuyến đi.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          {validation.canCheckIn && (
            <Button 
              onClick={handleCheckIn} 
              disabled={isSubmitting}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isSubmitting ? "Đang xử lý..." : "Xác nhận Check-in"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
