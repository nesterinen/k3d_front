import "leaflet/dist/leaflet.css"
import { useState } from "react"

import { MapContainer, TileLayer, useMapEvents, Rectangle } from "react-leaflet"
import { LeafletMouseEvent } from "leaflet"

import bboxFromWGS from "../utils/bboxFromWGS89"

import { useContext } from "react"
import CoordinateContext from "../reducers/coordinateReducer"

// https://react-leaflet.js.org/docs/example-events/
const LeafletMap= () => {
    const [coordinates, coordsDispatch] = useContext(CoordinateContext)
    const [bbox, setbbox] = useState(bboxFromWGS(coordinates.latitude, coordinates.longitude, coordinates.size/1000))

    // Event listener on map clicks and 1km2 square rectangle at coordinates
    const LocationMarker = () => {
        useMapEvents({
            click(event: LeafletMouseEvent){
                const clickCoordinates = event.latlng

                setbbox(bboxFromWGS(clickCoordinates.lat, clickCoordinates.lng, coordinates.size/1000))

                coordsDispatch({type: 'SET_COORDINATES', payload: {latitude: clickCoordinates.lat, longitude: clickCoordinates.lng}})
            }
        })

        return (
            <Rectangle bounds={bbox} pathOptions={{color: "black"}}/>
        )
    }

    // style={{ height: "498px", width: "498px" }}

    return (
        <div>
            <MapContainer center={[coordinates.latitude, coordinates.longitude]} zoom={14} style={{ height: "498px", width: "500px", zIndex: 5 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker/>
            </MapContainer>
        </div>
    )
}

export default LeafletMap