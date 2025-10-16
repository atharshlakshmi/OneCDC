import axios from 'axios';
import { TransportMode } from '../types';
import { AppError } from '../middleware';
import logger from '../utils/logger';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Generate Most Efficient Route (Use Case #2-2)
 * Uses Google Maps Directions API
 */
export const generateMostEfficientRoute = async (
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number; shopId: string; shopName: string }>,
  mode: TransportMode = TransportMode.WALKING
) => {
  if (!GOOGLE_MAPS_API_KEY) {
    logger.warn('Google Maps API key not configured, using mock route');
    // Return mock route when API key not available
    return generateMockRoute(origin, destinations, mode);
  }

  try {
    // Convert destinations to waypoints
    const waypoints = destinations
      .map((dest) => `${dest.lat},${dest.lng}`)
      .join('|');

    const url = `https://maps.googleapis.com/maps/api/directions/json`;
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${origin.lat},${origin.lng}`, // Return to origin
      waypoints: `optimize:true|${waypoints}`,
      mode: mode.toLowerCase(),
      key: GOOGLE_MAPS_API_KEY,
    };

    const response = await axios.get(url, { params });

    if (response.data.status !== 'OK') {
      logger.error(`Google Maps API error: ${response.data.status}`);
      throw new AppError('Failed to generate route', 500);
    }

    const route = response.data.routes[0];
    const optimizedOrder = route.waypoint_order;

    // Reorder destinations based on optimized order
    const optimizedDestinations = optimizedOrder.map(
      (index: number) => destinations[index]
    );

    return {
      totalDistance: route.legs.reduce(
        (sum: number, leg: any) => sum + leg.distance.value,
        0
      ), // in meters
      totalDuration: route.legs.reduce(
        (sum: number, leg: any) => sum + leg.duration.value,
        0
      ), // in seconds
      optimizedOrder: optimizedDestinations,
      polyline: route.overview_polyline.points,
      legs: route.legs,
      mode,
    };
  } catch (error: any) {
    logger.error(`Route generation error: ${error.message}`);

    // Fallback to mock route if API fails
    if (error.response?.status === 401 || error.code === 'ENOTFOUND') {
      logger.warn('Using mock route due to API error');
      return generateMockRoute(origin, destinations, mode);
    }

    throw new AppError('Failed to generate route', 500);
  }
};

/**
 * Generate Mock Route (fallback when Google Maps API unavailable)
 */
const generateMockRoute = (
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number; shopId: string; shopName: string }>,
  mode: TransportMode
) => {
  // Simple greedy algorithm: nearest neighbor
  const optimizedOrder: typeof destinations = [];
  const remaining = [...destinations];
  let current = origin;

  while (remaining.length > 0) {
    // Find nearest destination
    let nearestIndex = 0;
    let minDistance = Infinity;

    remaining.forEach((dest, index) => {
      const distance = Math.sqrt(
        Math.pow(dest.lat - current.lat, 2) + Math.pow(dest.lng - current.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    const nearest = remaining.splice(nearestIndex, 1)[0];
    optimizedOrder.push(nearest);
    current = nearest;
  }

  // Calculate mock distances (simplified)
  let totalDistance = 0;
  let prevPoint = origin;

  optimizedOrder.forEach((dest) => {
    const dist = Math.sqrt(
      Math.pow(dest.lat - prevPoint.lat, 2) + Math.pow(dest.lng - prevPoint.lng, 2)
    );
    totalDistance += dist * 111000; // Rough conversion to meters
    prevPoint = dest;
  });

  // Add return to origin
  totalDistance += Math.sqrt(
    Math.pow(origin.lat - prevPoint.lat, 2) + Math.pow(origin.lng - prevPoint.lng, 2)
  ) * 111000;

  // Estimate duration based on mode
  const speedMap = {
    [TransportMode.WALKING]: 5, // km/h
    [TransportMode.DRIVING]: 40, // km/h
    [TransportMode.TRANSIT]: 25, // km/h
  };

  const speed = speedMap[mode];
  const totalDuration = (totalDistance / 1000 / speed) * 3600; // in seconds

  logger.info(`Mock route generated: ${optimizedOrder.length} stops, ${Math.round(totalDistance)}m`);

  return {
    totalDistance: Math.round(totalDistance),
    totalDuration: Math.round(totalDuration),
    optimizedOrder,
    polyline: 'mock_polyline',
    legs: optimizedOrder.map((dest, index) => ({
      start: index === 0 ? origin : optimizedOrder[index - 1],
      end: dest,
      distance: { value: Math.round(totalDistance / optimizedOrder.length) },
      duration: { value: Math.round(totalDuration / optimizedOrder.length) },
    })),
    mode,
    isMockRoute: true,
  };
};
