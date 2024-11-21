//import './App.css'

import { ThemeProvider } from "@/components/ui/theme-provider"
import { SiteHeader } from '@/components/ui/site-header'
import DualContainer from '@/components/dual-container'
import { SiteFooter } from "@/components/ui/site-footer"

import { CoordinateContextProvider } from './reducers/coordinateReducer.tsx'

function App() {
  return (
    <CoordinateContextProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <div className="min-h-screen">
                <SiteHeader/>
                <DualContainer/>
                <SiteFooter/>
            </div>
        </ThemeProvider>
    </CoordinateContextProvider>
  )
}
export default App

/*
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SiteHeader/>
      <DualContainer/>
    </ThemeProvider>
*/