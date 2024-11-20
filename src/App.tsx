import { useRef, useState } from "react"
import PointCloudViewer from "./components/three/3d"

interface PointCloudViewerElement extends HTMLDivElement {
  resize: (width: number, height: number) => void,
  resetControls: () => void,
  diagnosisModeSwitch: () => void,
  getPointCloudFromApi: (latitude: number, longitude: number) => void
}

function App() {
  const [width, setWidth] = useState(500)
  const [height, setHeight] = useState(500)
  const childRef = useRef<PointCloudViewerElement>()

  const resizeEvent = (width: number, height: number) => {
    setWidth(width)
    setHeight(height)
    if(childRef.current) childRef.current.resize(width, height)
  }

  const resetControlsEvent = () => {
    if(childRef.current) childRef.current.resetControls()
  }

  const diagnosisModeSwitchEvent = () => {
    if(childRef.current) childRef.current.diagnosisModeSwitch()
  }

  const fetchApiEvent = (lat:number , lng: number) => {
    if(childRef.current) childRef.current.getPointCloudFromApi(lat, lng)
  }

  return (
    <>
      <div style={{borderColor:"grey", borderStyle:"solid", borderWidth:"2px", width:`${width}px`, height:`${height}px`}}>
          <PointCloudViewer ref={childRef}/>
      </div>

      <button onClick={() => resizeEvent(500, 250)}>250</button>
      <button onClick={() => resizeEvent(500, 500)}>500</button>
      <button onClick={resetControlsEvent}>reset</button>
      <button onClick={diagnosisModeSwitchEvent}>diagnosis</button>
      <button onClick={() => fetchApiEvent(62.60064557510063, 29.762067322297078)}>FETCH</button>
    </>
  )
}

export default App
