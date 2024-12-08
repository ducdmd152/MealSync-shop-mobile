interface Coordinate {
  lat: number;
  long: number;
}
// Hàm tính khoảng cách giữa hai điểm (lat1, lon1) và (lat2, lon2) theo km
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất tính theo km
  const toRadians = (degree: number) => (degree * Math.PI) / 180; // Chuyển đổi độ sang radian

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function isWithinRadius(
  point: Coordinate,
  locations: Coordinate[],
  radius: number = 3
): boolean {
  for (const location of locations) {
    const [lon1, lat1] = [location.long, location.lat];
    const [lon2, lat2] = [point.long, point.lat];
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    // console.log("distance: ", lat1, lon1, lat2, lon2, distance);
    if (distance <= radius) {
      // console.log(
      //   `${point.label} nằm trong bán kính ${radius} km từ ${location.label}`
      // );
      return true; // Chỉ cần thỏa mãn với một địa điểm
    }
  }
  // console.log(
  //   `${point.label} không nằm trong bán kính ${radius} km từ bất kỳ địa điểm nào.`
  // );
  return false;
}

export default {
  isWithinRadius,
};
