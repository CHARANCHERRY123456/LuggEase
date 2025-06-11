// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Calculate estimated delivery time based on distance
export const calculateEstimatedTime = (distance) => {
  // Assume average speed of 30 km/h in city
  const averageSpeed = 30;
  const timeInHours = distance / averageSpeed;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  return timeInMinutes;
};

// Generate delivery route waypoints
export const generateRoute = (pickup, drop, currentLocation = null) => {
  const waypoints = [];
  
  if (currentLocation) {
    waypoints.push(currentLocation);
  }
  
  waypoints.push(pickup);
  waypoints.push(drop);
  
  return waypoints;
};