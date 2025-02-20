import { useContext } from "react"

import { Button } from "@/components/ui/button"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import StorageContext from "@/reducers/storageReducer"

export function MapInfoSheet() {
  const [storage, dispatch] = useContext(StorageContext)

  const selectorAction = (value: 
        'leaflet' |
        'maastokartta' |
        'taustakartta' |
        'selkokartta' |
        'ortokuva') => {
    dispatch({type: 'SET_LAYER', payload:{layer: value}})
  }

  const Selector = () => {
    return (
      <Select onValueChange={selectorAction}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={storage.layer} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="leaflet">leaflet</SelectItem>
          <SelectItem value="ortokuva">ortokuva</SelectItem>
          <SelectItem value="maastokartta">maastokartta</SelectItem>
          <SelectItem value="selkokartta">selkokartta</SelectItem>
          <SelectItem value="taustakartta">taustakartta</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  const sizeSelectorAction = (value: "500" | "1000" | "1500" | "2000") => {
    dispatch({type: 'SET_SIZE', payload:{size: parseInt(value)}})
  }

  const SizeSelector = () => {
    return (
      <Select onValueChange={sizeSelectorAction}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={storage.size}/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="500">500</SelectItem>
          <SelectItem value="1000">1000</SelectItem>
          <SelectItem value="1500">1500</SelectItem>
          <SelectItem value="2000">2000</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="border-b">Map</SheetTitle>
        </SheetHeader>

        <h2 className="font-semibold text-muted-foreground">Info:</h2>

        <div className="grid gap-4 py-4">

          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Map style:
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
                {storage.layer}
            </p>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Latitude:
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
                {storage.latitude}
            </p>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Longitude:
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
                {storage.longitude}
            </p>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Selection size:
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
                {storage.size}m²
            </p>
          </div>

        </div>

        <h2 className="font-semibold text-muted-foreground border-t mb-2">Settings:</h2>
        <div className="grid gap-4 py-4">
        <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Map size(m²):
            </p>
                <SizeSelector/>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Map style:
            </p>
            <Selector/>
          </div>

        </div>


        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}