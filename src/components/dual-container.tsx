import { useRef, useState, useEffect } from "react"

import PointCloudViewer from "./three/3d"
import LeafletMap from "./leafletMap"

import { useContext } from "react"
import StorageContext from "../reducers/storageReducer"

import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { PCDInfoSheet } from "./ui/pcd-info-sheet"
import { MapInfoSheet } from "./ui/map-info-sheet"
import { Loading } from "./ui/loading"

interface PointCloudViewerElement extends HTMLDivElement {
  resize: (width: number, height: number) => void,
  resize2: () => void,
  resetControls: () => void,
  diagnosisModeSwitch: () => void,
  getPointCloudFromApi: (latitude: number, longitude: number, size: number, callback: () => void) => boolean
}

function App() {
  const childRef = useRef<PointCloudViewerElement>()

  const [fullsceen, setFullscreen] = useState(false)

  const [storage, dispatch] = useContext(StorageContext)

  const resetControlsEvent = () => {
    if(childRef.current) childRef.current.resetControls()
  }

  const diagnosisModeSwitchEvent = () => {
    if(childRef.current) childRef.current.diagnosisModeSwitch()
  }

  const fetchApiEvent = (lat:number , lng: number) => {
    if(childRef.current) {
      dispatch({type: 'START_LOADING', payload: {}})
      childRef.current.getPointCloudFromApi(lat, lng, storage.size, 
        () => dispatch({type: 'STOP_LOADING', payload: {}})
      )
    }
  }

  useEffect(() => {
    childRef.current?.resize2()
  }, [fullsceen])

  const switchFullscreen = () => {
    setFullscreen(!fullsceen)
  }

  return (
    <div className="flex flex-wrap justify-center">

      {fullsceen ? 
      <></>
      :
      <div className="w-[90vw] h-[80vh] m-2 border text-center content-center min-w-80 max-w-2xl mb-20">
        <LeafletMap/>

        <div className="w-full h-12 border border-foreground items-center flex justify-evenly">
            <div className="text-left pl-2 grid grid-rows-2">
                <p className="text-sm font-semibold">{storage.latitude}</p>
                <p className="text-sm font-semibold">{storage.longitude}</p>
            </div>

            <div>
              <MapInfoSheet/>
            </div>

            <div className="content-center text-center flex justify-end px-1">
                {storage.loading ?
                <Loading/>  :
                <Button onClick={() => fetchApiEvent(storage.latitude, storage.longitude)}>Fetch Map</Button>
                }
            </div>
        </div>
      </div>
      }



      <div className={`w-[90vw] h-[80vh] m-2 border text-center content-center min-w-80 mb-12 ${fullsceen ? '' : 'max-w-2xl'}`}>
          <PointCloudViewer ref={childRef}/>
          <div className="w-full h-12 border border-foreground items-center flex justify-evenly">
            <div className="content-center text-center">
                <p className="text-sm font-semibold">Diagnosis mode</p>
                <Switch onCheckedChange={diagnosisModeSwitchEvent}/>
            </div>

            <div className="content-center text-center">
                <PCDInfoSheet/>
            </div>

            <div className="content-center text-center">
                <Button onClick={resetControlsEvent}>Reset view</Button>
            </div>

            <div className="content-center text-center">
              <Button onClick={() => switchFullscreen()}>
                {fullsceen ? 
                <p>Minimize</p> : 
                <p>Maximize</p>}
              </Button>
            </div>
          </div>
      </div>
    </div>
  )
}

export default App //  max-w-2xl  // className="w-[90vw] h-[70vh] m-2 border text-center content-center min-w-80 max-w-2xl mb-12"
// <div className={`w-[90vw] h-[70vh] m-2 border text-center content-center min-w-80 mb-12 ${fullsceen ? childRef.current?.dispatchEvent(new Event('resize')) : 'max-w-2xl'}`}>