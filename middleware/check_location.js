export const checkHeaderMiddleware = (req, res, next) => {
  const myHeader = req.headers['x-coordinates'];
  if (myHeader) {
    const [latitude, longitude] = myHeader.split(',');
    req.coordinates = {
      type: 'Point',
      coordinates: [longitude.trim(), latitude.trim()]
    };
  }
  console.log("Coordinates: ", myHeader ? req.coordinates : "No Location Headers", "on", req.method, req.path)
  // If the header exists, you can perform additional checks or actions here.
  // If everything is fine, call next() to pass control to the next middleware or route handler.
  next();
};


export const require_location = (req, res, next) => {
  const myHeader = req.headers['x-coordinates'];
  if (!myHeader) {
    return res.status(400).json({error: 'Location headers not found. Please add location headers'})
  }
  console.log("Coordinates: ", myHeader ? req.coordinates : "No Location Headers", "on", req.method, req.path)
  // If the header exists, you can perform additional checks or actions here.
  // If everything is fine, call next() to pass control to the next middleware or route handler.
  next();
};


export const isBuildingWithinNMeters = async (store_location, officer_location) => {
  console.log('STORE LOCATION', store_location)
  console.log('OFFICER LOCATION', officer_location)
  const earthRadius = 6371; // Radius of the Earth in kilometers

  const dLat = toRadians(store_location.coordinates[1] - officer_location.coordinates[1]);
  const dLng = toRadians(store_location.coordinates[0] - officer_location.coordinates[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(store_location.coordinates[1])) *
    Math.cos(toRadians(officer_location.coordinates[1])) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  const dist = distance * 1000;
  console.log("DISTANCE OF OFFICER FROM BUILDING: ->", )
  const maxDistance = parseInt(process.env.LOCATION_DISTANCE)
  return dist <= maxDistance
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}