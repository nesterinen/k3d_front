import "leaflet/dist/leaflet.css"
import { useState } from "react"

import { MapContainer, TileLayer, useMapEvents, Rectangle, WMSTileLayer } from "react-leaflet"
import { LatLngBounds, LeafletMouseEvent } from "leaflet"

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

    //style={{ height: "498px", width: "500px", zIndex: 5 }}
    // style={{ height: "80vh", width: "45vw", zIndex: 5 }}


    return (
            <MapContainer 
                center={[coordinates.latitude, coordinates.longitude]}
                zoom={14}
                style={{ display:"flex", width:"100%", height:"100%", zIndex: 5 }}
                >
    
                <WMSTileLayer
                    url="https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?service=WMTS&request=GetTile&version=1.0.0&layer=maastokartta&TileMatrixSet=WGS84_Pseudo-Mercator&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=image/png&api-key=7737f837-ab4a-4765-9727-6deaa4a80082"
                    minZoom={1}
                    maxZoom={15}
                />
                <LocationMarker/>
            </MapContainer>
    )
}

export default LeafletMap


/*
            <MapContainer 
                center={[coordinates.latitude, coordinates.longitude]}
                zoom={14}
                style={{ display:"flex", width:"100%", height:"100%", zIndex: 5 }}
                >
    
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker/>
            </MapContainer>
*/