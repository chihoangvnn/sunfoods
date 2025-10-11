'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Circle, Lock, Unlock } from "lucide-react";

export interface Seat {
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

interface SeatSelectorProps {
  seatType: 4 | 7;
  seats: Seat[];
  onSeatClick: (seatId: string) => void;
  onLockSeat?: (seatId: string) => void;
  onUnlockSeat?: (seatId: string) => void;
  mode: "passenger" | "driver";
}

export default function SeatSelector({ seatType, seats, onSeatClick, onLockSeat, onUnlockSeat, mode }: SeatSelectorProps) {
  const getSeatByPosition = (id: string) => {
    return seats.find(seat => seat.id === id);
  };

  const getSeatColor = (status: Seat["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending_confirmation":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "confirmed":
        return "bg-gray-400 hover:bg-gray-500 text-white";
      case "locked":
        return "bg-gray-400 hover:bg-gray-500 text-white";
    }
  };

  const getSeatLabel = (status: Seat["status"]) => {
    switch (status) {
      case "available":
        return "Trống";
      case "pending_confirmation":
        return "Chờ XN";
      case "confirmed":
        return "Đã đặt";
      case "locked":
        return "Khóa";
    }
  };

  const renderSeat = (seatId: string) => {
    const seat = getSeatByPosition(seatId);
    if (!seat) return null;

    const isClickable = 
      (mode === "passenger" && seat.status === "available") ||
      (mode === "driver" && seat.status !== "available" && seat.status !== "locked");

    const showLockButton = mode === "driver" && seat.status === "available" && onLockSeat;
    const showUnlockButton = mode === "driver" && seat.status === "locked" && onUnlockSeat;

    return (
      <div className="relative">
        <Button
          onClick={() => isClickable && onSeatClick(seatId)}
          className={`
            w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center
            rounded-lg transition-all duration-200 shadow-md
            ${getSeatColor(seat.status)}
            ${!isClickable && "opacity-60 cursor-not-allowed"}
          `}
          disabled={!isClickable}
        >
          {seat.status === "locked" ? (
            <Lock className="h-5 w-5 mb-1" />
          ) : (
            <User className="h-5 w-5 mb-1" />
          )}
          <span className="text-xs font-semibold">{seatId}</span>
          <span className="text-[10px]">{getSeatLabel(seat.status)}</span>
        </Button>
        
        {showLockButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLockSeat(seatId);
            }}
            className="absolute -top-1 -right-1 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 shadow-lg transition-all"
            title="Khóa ghế"
          >
            <Lock className="h-3 w-3" />
          </button>
        )}
        
        {showUnlockButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlockSeat(seatId);
            }}
            className="absolute -top-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 shadow-lg transition-all"
            title="Mở khóa ghế"
          >
            <Unlock className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  const renderDriverSeat = () => (
    <div className="w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center bg-blue-600 text-white rounded-lg shadow-md">
      <Circle className="h-5 w-5 mb-1 fill-white" />
      <span className="text-xs font-semibold">Tài xế</span>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sơ đồ ghế ngồi</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {mode === "passenger" 
            ? "Chọn ghế bạn muốn đặt" 
            : "Xem tình trạng đặt chỗ"}
        </p>
        
        <div className="flex gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Đã xác nhận</span>
          </div>
          {mode === "driver" && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded flex items-center justify-center">
                <Lock className="h-3 w-3 text-white" />
              </div>
              <span>Đã khóa</span>
            </div>
          )}
        </div>
      </div>

      {/* Car Cabin Wrapper */}
      <div 
        className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-slate-100 to-slate-50 border-2 border-slate-300 shadow-xl px-8 py-10"
      >
        {/* Windshield SVG */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex justify-center">
          <svg 
            width="120" 
            height="28" 
            viewBox="0 0 120 28" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md"
            aria-hidden="true"
          >
            <path 
              d="M15 28 L8 8 C8 4 12 0 15 0 L105 0 C108 0 112 4 112 8 L105 28 Z" 
              fill="#3b82f6" 
              opacity="0.3"
            />
            <path 
              d="M15 28 L8 8 C8 4 12 0 15 0 L105 0 C108 0 112 4 112 8 L105 28" 
              stroke="#1e40af" 
              strokeWidth="2"
            />
          </svg>
        </div>

        {seatType === 4 ? (
          <div className="flex flex-col gap-10">
            <div className="flex justify-center items-center gap-4">
              {renderDriverSeat()}
              {renderSeat("A")}
            </div>
            <div className="flex justify-center items-center gap-4">
              {renderSeat("B")}
              {renderSeat("Giữa")}
              {renderSeat("C")}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="flex justify-center items-center gap-4">
              {renderDriverSeat()}
              {renderSeat("A")}
            </div>
            <div className="flex justify-center items-center gap-4">
              {renderSeat("B")}
              {renderSeat("C")}
              {renderSeat("D")}
            </div>
            <div className="flex justify-center items-center gap-4">
              {renderSeat("E")}
              {renderSeat("Giữa")}
              {renderSeat("F")}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
