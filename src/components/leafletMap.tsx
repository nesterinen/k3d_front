import "leaflet/dist/leaflet.css"
import { useState } from "react"

import { MapContainer, TileLayer, useMapEvents, Rectangle, WMSTileLayer } from "react-leaflet"
import { LeafletMouseEvent } from "leaflet"

import bboxFromWGS from "../utils/bboxFromWGS89"

import { useContext } from "react"
import StorageContext from "../reducers/storageReducer"

interface MapProps {
    mapType?: 
        'leaflet' |
        'maastokartta' |
        'taustakartta' |
        'selkokartta' |
        'ortokuva'
}

const LeafletLayer = () => {
    return (
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
    )
}

const MMLKartta = ({mapType}: MapProps) => {
    const api_key = '7737f837-ab4a-4765-9727-6deaa4a80082'

    const baseUrl = 'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?service=WMTS&request=GetTile&version=1.0.0'
    const layer = '&layer=' + mapType 
    const crs = '&TileMatrixSet=WGS84_Pseudo-Mercator'
    const tile = '&TileMatrix={z}&TileRow={y}&TileCol={x}'
    const format = '&style=default&format=image/png&api-key=' + api_key

    return (
        <WMSTileLayer
            key={mapType}
            url={baseUrl + layer + crs + tile + format}
            attribution='&copy; <a href="https://www.maanmittauslaitos.fi/karttakuvapalvelu">Maanmittauslaitos WMTS</a>'
            minZoom={1}
            maxZoom={15}
        />
    )
}

const MapSelector = ({mapType}: MapProps) => {
    if (mapType) {
        if(mapType === 'leaflet'){ 
            return <LeafletLayer/>
        } else {
            return <MMLKartta mapType={mapType}/>
        }
    } else {
        return <LeafletLayer/>
    }
}

// https://react-leaflet.js.org/docs/example-events/
const LeafletMap= () => {
    const [storage, dispatch] = useContext(StorageContext)
    const [bbox, setbbox] = useState(bboxFromWGS(storage.latitude, storage.longitude, storage.size/1000))

    // Event listener on map clicks and 1km2 square rectangle at coordinates
    const LocationMarker = () => {
        useMapEvents({
            click(event: LeafletMouseEvent){
                const clickCoordinates = event.latlng

                setbbox(bboxFromWGS(clickCoordinates.lat, clickCoordinates.lng, storage.size/1000))

                dispatch({type: 'SET_COORDINATES', payload: {latitude: clickCoordinates.lat, longitude: clickCoordinates.lng}})
            }
        })

        return (
            <Rectangle bounds={bbox} pathOptions={{color: "black"}}/>
        )
    }

    return(
        <MapContainer 
                center={[storage.latitude, storage.longitude]}
                zoom={14}
                style={{ display:"flex", width:"100%", height:"100%", zIndex: 5 }}
                >

            <MapSelector mapType={storage.layer}/>


            <LocationMarker/>
        </MapContainer>
    )
}

export default LeafletMap