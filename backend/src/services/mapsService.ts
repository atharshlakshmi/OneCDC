import axios from "axios";
import { TransportMode } from "../types";
import { AppError } from "../middleware";
import logger from "../utils/logger";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to get latitude and longitude
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new AppError("Google Maps API key not configured", 500);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY,
        region: "sg", // Bias results to Singapore
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else if (response.data.status === "ZERO_RESULTS") {
      throw new AppError("Address not found. Please check the address and try again.", 400);
    } else {
      throw new AppError(`Geocoding failed: ${response.data.status}`, 500);
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`Geocoding error: ${error.message}`);
    throw new AppError("Failed to geocode address", 500);
  }
};

/**
 * Generate Most Efficient Route (Use Case #2-2)
 * Uses Google Maps Directions API
 */
export const generateMostEfficientRoute = async (
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number; shopId: string; shopName: string; address?: string }>,
  mode: TransportMode = TransportMode.WALKING
) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new AppError("Google Maps API key not configured", 500);
  }

  try {
    // Use new Routes API (v2)
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;

    // Build waypoints for the new API format
    const intermediates = destinations.map((dest) => ({
      location: {
        latLng: {
          latitude: dest.lat,
          longitude: dest.lng,
        },
      },
    }));

    // Map transport mode to new API format
    const travelModeMap: Record<string, string> = {
      [TransportMode.WALKING]: "WALK",
      [TransportMode.DRIVING]: "DRIVE",
      [TransportMode.TRANSIT]: "TRANSIT",
    };

    // For one-way route: origin -> shops -> last shop (no return)
    // Remove the last destination from intermediates to make it the final destination
    const lastShop = intermediates[intermediates.length - 1];
    const intermediateWaypoints = intermediates.slice(0, -1);

    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: lastShop, // End at the last shop instead of returning to origin
      intermediates: intermediateWaypoints,
      travelMode: travelModeMap[mode] || "WALK",
      optimizeWaypointOrder: true,
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
      languageCode: "en-US",
      units: "METRIC",
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs,routes.optimizedIntermediateWaypointIndex",
      },
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new AppError("No routes found", 500);
    }

    const route = response.data.routes[0];
    const optimizedIndices = route.optimizedIntermediateWaypointIndex || [];

    // Reorder destinations based on optimized order
    // Note: optimizedIntermediateWaypointIndex only includes intermediate waypoints (not the final destination)
    const optimizedDestinations = optimizedIndices.map((index: number) => destinations[index]);

    // Add the last shop (which is the destination) to the end of the optimized order
    const lastShopIndex = destinations.length - 1;
    optimizedDestinations.push(destinations[lastShopIndex]);

    return {
      totalDistance: route.distanceMeters || 0,
      totalDuration: parseInt(route.duration?.replace("s", "") || "0"),
      optimizedOrder: optimizedDestinations,
      polyline: route.polyline?.encodedPolyline || "",
      legs: route.legs || [],
      mode,
    };
  } catch (error: any) {
    logger.error(`Route generation error: ${error.message}`);
    if (error.response) {
      logger.error(`Google API Response: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
};
