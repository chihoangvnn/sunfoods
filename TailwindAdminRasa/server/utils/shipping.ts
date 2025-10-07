import { db as database } from "../db";
import { shippingZones } from "../../shared/schema";
import { eq, and, lte, gte } from "drizzle-orm";

type Database = typeof database;

export interface ShippingOption {
  zoneId: string;
  name: string;
  fee: number;
  estimatedDelivery: string;
  zoneType: string;
  isFreeShip: boolean;
}

export async function calculateShippingFee(
  db: Database,
  distanceKm: number,
  orderTime: Date = new Date()
): Promise<ShippingOption[]> {
  const zones = await db
    .select()
    .from(shippingZones)
    .where(
      and(
        eq(shippingZones.isActive, true),
        lte(shippingZones.minDistanceKm, distanceKm.toString()),
        gte(shippingZones.maxDistanceKm, distanceKm.toString())
      )
    )
    .orderBy(shippingZones.sortOrder);

  const options: ShippingOption[] = [];

  for (const zone of zones) {
    let finalFee = parseFloat(zone.shippingFee);
    let isFreeShip = finalFee === 0;

    if (zone.isFreeShipTimeWindow) {
      const currentHour = orderTime.getHours();
      const currentDay = orderTime.getDay();
      
      const startHour = zone.freeShipStartHour || 0;
      const endHour = zone.freeShipEndHour || 23;
      const allowedDays = (zone.freeShipDays as number[]) || [0,1,2,3,4,5,6];

      if (
        currentHour >= startHour && 
        currentHour < endHour &&
        allowedDays.includes(currentDay)
      ) {
        finalFee = 0;
        isFreeShip = true;
      }
    }

    options.push({
      zoneId: zone.id,
      name: zone.name,
      fee: finalFee,
      estimatedDelivery: zone.estimatedDeliveryDays || "",
      zoneType: zone.zoneType,
      isFreeShip
    });
  }

  return options;
}

export function isWithinFreeShipWindow(
  zone: any,
  checkTime: Date = new Date()
): boolean {
  if (!zone.isFreeShipTimeWindow) {
    return false;
  }

  const currentHour = checkTime.getHours();
  const currentDay = checkTime.getDay();
  
  const startHour = zone.freeShipStartHour || 0;
  const endHour = zone.freeShipEndHour || 23;
  const allowedDays = (zone.freeShipDays as number[]) || [0,1,2,3,4,5,6];

  return (
    currentHour >= startHour && 
    currentHour < endHour &&
    allowedDays.includes(currentDay)
  );
}
