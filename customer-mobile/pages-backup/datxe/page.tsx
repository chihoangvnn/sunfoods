import LiveDeparturesBoardClient from "./LiveDeparturesBoardClient";
import { getPublicTrips } from "../../../server/rideSharingService";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function DatXePage() {
  const trips = await getPublicTrips({
    status: 'pending',
    activeOnly: true,
  });

  return <LiveDeparturesBoardClient initialTrips={trips} />;
}
