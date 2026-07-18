export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS = 6371; // kilometers

  const toRadians = (
    degrees: number
  ): number => {
    return degrees * (Math.PI / 180);
  };

  const deltaLatitude =
    toRadians(lat2 - lat1);

  const deltaLongitude =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLatitude / 2) *
      Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS * c;
}