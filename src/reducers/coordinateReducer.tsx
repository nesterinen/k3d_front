import { useReducer, createContext } from "react"

interface StateType {
    latitude: number,
    longitude: number
}

interface ActionType {
    type: 'SET_COORDINATES',
    payload: {
        latitude: number,
        longitude: number
    }
}

const coordinteReducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
        case 'SET_COORDINATES':
            return {
                latitude: action.payload.latitude,
                longitude: action.payload.longitude
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
        longitude: 29.81011475983172
    })

    return (
        <CoordinateContext.Provider value={[coordinates, coordinatesDispatch]}>
            {children}
        </CoordinateContext.Provider>

    )
}

export default CoordinateContext