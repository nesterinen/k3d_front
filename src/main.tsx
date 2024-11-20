import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { CoordinateContextProvider } from './reducers/coordinateReducer.tsx'

createRoot(document.getElementById('root')!).render(
    <CoordinateContextProvider>
        <App />
    </CoordinateContextProvider>
)
