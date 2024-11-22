import { useRef } from "react"

import PointCloudViewer from "./three/3d"
import LeafletMap from "./leafletMap"

import { useContext } from "react"
import CoordinateContext from "../reducers/coordinateReducer"

import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { InfoSheet } from "./ui/info-sheet"
import { Loading } from "./ui/loading"

interface PointCloudViewerElement extends HTMLDivElement {
  resize: (width: number, height: number) => void,
  resetControls: () => void,
  diagnosisModeSwitch: () => void,
  getPointCloudFromApi: (latitude: number, longitude: number, size: number, callback: () => void) => boolean
}

function App() {
  const childRef = useRef<PointCloudViewerElement>()

  const [storage, dispatch] = useContext(CoordinateContext)

  const resetControlsEvent = () => {
    if(childRef.current) childRef.current.resetControls()
  }

  const diagnosisModeSwitchEvent = () => {
    if(childRef.current) childRef.current.diagnosisModeSwitch()
  }

  const fetchApiEvent = (lat:number , lng: number, size= 1000) => {
    if(childRef.current) {
      dispatch({type: 'START_LOADING', payload: {}})
      childRef.current.getPointCloudFromApi(lat, lng, size, 
        () => dispatch({type: 'STOP_LOADING', payload: {}})
      )
    }
  }

  return (
    <div className="flex flex-wrap justify-center">

      <div className="w-[90vw] h-[70vh] m-2 border text-center content-center min-w-80 max-w-2xl mb-12">
        <LeafletMap mapType="ortokuva"/>

        <div className="w-full h-12 border border-foreground items-center flex">
            <div className="w-2/4 text-left pl-2 grid grid-cols-[70px_auto] grid-rows-2 columns-sm">
                <p className="text-sm font-semibold">latitude:</p>
                <p className="text-sm font-semibold">{storage.latitude}</p>
                <p className="text-sm font-semibold">longitude:</p>
                <p className="text-sm font-semibold">{storage.longitude}</p>
            </div>

            <div className="w-2/4 content-center text-center flex justify-end pr-1">
                {storage.loading ?
                <Loading/>  :
                <Button onClick={() => fetchApiEvent(storage.latitude, storage.longitude)}>Fetch Map</Button>
                }
            </div>
        </div>
      </div>


      <div className="w-[90vw] h-[70vh] m-2 border text-center content-center min-w-80 max-w-2xl mb-12">
          <PointCloudViewer ref={childRef}/>

          <div className="w-full h-12 border border-foreground items-center flex">
            <div className="w-1/3 content-center text-center">
                <p className="text-sm font-semibold">Diagnosis mode</p>
                <Switch onCheckedChange={diagnosisModeSwitchEvent}/>
            </div>

            <div className="w-1/3 content-center text-center">
                <InfoSheet/>
            </div>

            <div className="w-1/3 content-center text-center">
                <Button onClick={resetControlsEvent}>Reset</Button>
            </div>
          </div>
      </div>

    </div>
  )
}

export default App