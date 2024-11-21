import { useReducer, createContext } from "react"

interface StateType {
    latitude: number,
    longitude: number,
    size: number,
    loading: boolean
}

interface ActionType {
    type: 'SET_COORDINATES' | 'SET_SIZE' | 'START_LOADING' | 'STOP_LOADING',
    payload: {
        latitude?: number,
        longitude?: number,
        size?: number
    }
}

const coordinteReducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
        case 'SET_COORDINATES':
            if (!action.payload.latitude || !action.payload.longitude) {
                return state
            }
            return {
                ...state,
                latitude: action.payload.latitude,
                longitude: action.payload.longitude,
            }
        
        case 'SET_SIZE':
            if (!action.payload.size) return state
            return {
                ...state,
                size: action.payload.size
            }

        case 'START_LOADING':
            return {
                ...state,
                loading: true
            }

        case 'STOP_LOADING':
            return {
                ...state,
                loading: false
            }

        default:
            return state
    }
}


//const CoordinateContext = createContext<(StateType | React.Dispatch<ActionType>)[]>({} as (StateType | React.Dispatch<ActionType>)[])
const CoordinateContext = createContext<[StateType, React.Dispatch<ActionType>]>({} as [StateType, React.Dispatch<ActionType>])

interface CCPProps {
    children: React.ReactNode
}
export const CoordinateContextProvider = ({ children }: CCPProps) => {
    const [coordinates, coordinatesDispatch] = useReducer(coordinteReducer, {
        latitude: 62.66591065727223,
        longitude: 29.81011475983172,
        size: 1000,
        loading: false
    })

    return (
        <CoordinateContext.Provider value={[coordinates, coordinatesDispatch]}>
            {children}
        </CoordinateContext.Provider>

    )
}

export default CoordinateContext