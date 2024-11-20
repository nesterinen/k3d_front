// create square area from selected coordinates and size
const bboxFromWGS= (latitude: number, longitude: number, size_km=1) => {
    //According to NASA, Earth's radius at the equator is 6,378 kilometers, while the radius at the poles is 6,356 km
    const earth_radius = 6367 // km

    //https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters
    const new_latitude = latitude + (size_km / earth_radius) * (180 / Math.PI)
    const new_longitude = longitude + (size_km / earth_radius) * (180 / Math.PI) / Math.cos(latitude * Math.PI/180)

    // half_size_km_as_latitude
    const h_lat = (new_latitude - latitude) / 2
    const h_lng = (new_longitude - longitude) / 2

    // square size_km bounding box
    const bbox = [
        [
            latitude - h_lat,
            longitude - h_lng
        ],
        [
            latitude + h_lat,
            longitude + h_lng
        ]
    ]

    return bbox
}

export default bboxFromWGS