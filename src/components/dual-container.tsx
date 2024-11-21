import { useRef } from "react"

import PointCloudViewer from "./three/3d"
import LeafletMap from "./leafletMap"

import { useContext } from "react"
import CoordinateContext from "../reducers/coordinateReducer"

import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { InfoSheet } from "./ui/info-sheet"

interface PointCloudViewerElement extends HTMLDivElement {
  resize: (width: number, height: number) => void,
  resetControls: () => void,
  diagnosisModeSwitch: () => void,
  getPointCloudFromApi: (latitude: number, longitude: number, size: number, callback: () => void) => boolean
}

function App() {
  //const [width, setWidth] = useState(500)
  //const [height, setHeight] = useState(500)

  const childRef = useRef<PointCloudViewerElement>()

  const [storage, dispatch] = useContext(CoordinateContext)

  /*
  const resizeEvent = (width: number, height: number) => {
    setWidth(width)
    setHeight(height)
    if(childRef.current) childRef.current.resize(width, height)
  }
  */

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

  const Loading = () => {
    return (
      <>
        <svg aria-hidden="true" className="inline w-8 h-8 text-current animate-spin dark:text-current fill-secondary dark:fill-secondary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
        <p className="text-sm font-semibold mx-2">loading..</p>
      </>
    )
  }

  return (
    <div className="flex flex-wrap justify-center">

    <div className="w-[500px] h-[572px] m-2">

        <div className="w-[500px] h-[500px] border text-center content-center">
          <LeafletMap/>
        </div>

        <div className="w-[500px] h-[72px] border border-foreground items-center flex">
            <div className="w-2/4 text-left pl-2 grid grid-cols-[70px_auto] grid-rows-2 columns-sm">
                <p className="text-sm font-semibold">latitude:</p>
                <p className="text-sm font-semibold">{storage.latitude}</p>
                <p className="text-sm font-semibold">longitude:</p>
                <p className="text-sm font-semibold">{storage.longitude}</p>
            </div>

            <div className="w-1/4 flex items-center">
                {storage.loading ? <Loading/> : <></>}
            </div>

            <div className="w-1/4 content-center text-center">
                <Button onClick={() => fetchApiEvent(storage.latitude, storage.longitude)}>Fetch Map</Button>
            </div>


        </div>
    </div>


    <div className="w-[500px] h-[572px] m-2">
        <div className="w-[500px] h-[500px] border text-center content-center">
            <PointCloudViewer ref={childRef}/>
        </div>

        <div className="w-[500px] h-[72px] border border-foreground items-center flex">
            <div className="w-1/3 content-center text-center">
                <p className="text-sm font-semibold">Diagnosis mode</p>
                <Switch onCheckedChange={diagnosisModeSwitchEvent}/>
            </div>

            <div className="w-1/3 content-center text-center">
                <InfoSheet/>
            </div>

            <div className="w-1/3 content-center text-center">
                <Button onClick={resetControlsEvent}>Reset Camera</Button>
            </div>
        </div>
    </div>

</div>
  )
}

export default App