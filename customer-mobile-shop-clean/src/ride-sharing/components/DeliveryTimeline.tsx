'use client'

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";
import type { Package } from "../mockData";

interface DeliveryTimelineProps {
  package: Package;
}

export function DeliveryTimeline({ package: pkg }: DeliveryTimelineProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!pkg.estimatedDeliveryTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const estimated = new Date(pkg.estimatedDeliveryTime!);
      const diffMs = estimated.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes < 0) {
        setIsOverdue(true);
        const overdueMins = Math.abs(diffMinutes);
        if (overdueMins >= 60) {
          const hours = Math.floor(overdueMins / 60);
          const mins = overdueMins % 60;
          setTimeRemaining(`Quá hạn ${hours} giờ ${mins > 0 ? mins + ' phút' : ''}`);
        } else {
          setTimeRemaining(`Quá hạn ${overdueMins} phút`);
        }
      } else {
        setIsOverdue(false);
        if (diffMinutes >= 60) {
          const hours = Math.floor(diffMinutes / 60);
          const mins = diffMinutes % 60;
          setTimeRemaining(`Còn ${hours} giờ ${mins > 0 ? mins + ' phút' : ''}`);
        } else {
          setTimeRemaining(`Còn ${diffMinutes} phút`);
        }
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [pkg.estimatedDeliveryTime]);

  if (!pkg.estimatedDeliveryTime) {
    return null;
  }

  const formatEstimatedTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    if (pkg.status === "delivered") return 100;
    if (pkg.status === "in_transit") return 66;
    if (pkg.status === "price_confirmed") return 33;
    return 0;
  };

  const getProgressColor = () => {
    if (isOverdue) return "bg-red-500";
    
    const now = new Date();
    const estimated = new Date(pkg.estimatedDeliveryTime!);
    const diffMinutes = Math.floor((estimated.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes <= 30) return "bg-orange-500";
    return "bg-green-500";
  };

  const getTimeStatusColor = () => {
    if (isOverdue) return "text-red-600";
    
    const now = new Date();
    const estimated = new Date(pkg.estimatedDeliveryTime!);
    const diffMinutes = Math.floor((estimated.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes <= 30) return "text-orange-600";
    return "text-green-600";
  };

  const steps = [
    {
      label: "Đã chấp nhận",
      icon: CheckCircle,
      completed: pkg.status === "price_confirmed" || pkg.status === "in_transit" || pkg.status === "delivered"
    },
    {
      label: "Đang giao hàng",
      icon: Truck,
      completed: pkg.status === "in_transit" || pkg.status === "delivered"
    },
    {
      label: "Đã giao hàng",
      icon: CheckCircle,
      completed: pkg.status === "delivered"
    }
  ];

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-500">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">Thời gian giao hàng</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatEstimatedTime(pkg.estimatedDeliveryTime)}
            </p>
          </div>
          <div className={`text-right ${getTimeStatusColor()}`}>
            {isOverdue && <AlertCircle className="h-4 w-4 inline mb-1" />}
            <p className="text-sm font-bold">{timeRemaining}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-sm ${step.completed ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
