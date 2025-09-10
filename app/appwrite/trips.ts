import { appwriteConfig, database } from "./client";
import { Query } from "appwrite";

export const getAllTrips = async (limit: number, offset: number) => {
  const allTrips = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.tripsTableId,
    [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
  );

  if (allTrips.total === 0) {
    console.error("No trips found");
    return { allTrips: [], total: 0 };
  }

  return { allTrips: allTrips.documents, total: allTrips.total };
};

export const getTripById = async (tripId: string) => {
  const trip = await database.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.tripsTableId,
    tripId
  );

  if (!trip) {
    console.error("Trip not found");
    return null;
  }

  return trip;
};
