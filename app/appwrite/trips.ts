import { appwriteConfig, database } from "./client";
import { Query } from "appwrite";

export const getAllTrips = async (limit?: number, offset: number = 0) => {
  try {
    const queries = [Query.offset(offset)];
    if (limit) {
      queries.push(Query.limit(limit));
    }

    const { documents: trips, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.tripsTableId,
      queries
    );

    if (total === 0) return { allTrips: [], total };

    return { allTrips: trips, total };
  } catch (error) {
    console.log("Error fetching trips:", error);
    return { allTrips: [], total: 0 };
  }
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

export const deleteTrip = async (tripId: string) => {
  try {
    await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripsTableId,
      tripId
    );
    return true;
  } catch (error) {
    console.log("Error deleting trip:", error);
    throw error;
  }
};
