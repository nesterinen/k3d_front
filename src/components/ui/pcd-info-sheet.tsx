import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useContext } from "react"
import StorageContext from "@/reducers/storageReducer"
 
export function PCDInfoSheet() {
  const [storage, ] = useContext(StorageContext)

  const round = (num: number | undefined) => {
    if(num) {
      return Math.floor(num)
    }

    return undefined
  }

  interface ColumnProps {
    text: string,
    value: number | string | undefined
  }
  const Column = ({text, value}: ColumnProps) => {
    return (
    <div className="grid grid-cols-3 items-center gap-4">
      <p className="text-sm font-semibold">
          {text}
      </p>
      <p className="text-sm font-semibold text-muted-foreground">
          {value}
      </p>
    </div>
    )
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>PointCloud</SheetTitle>
          <SheetDescription className="border-b">
            Information:
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">

          <Column text="Size:" value={`${storage.stats?.width} x ${storage.stats?.height}`}/>
          <Column text="Lowest:" value={`${round(storage.stats?.min_value)}m`}/>
          <Column text="Highest:" value={`${round(storage.stats?.max_value)}m`}/>
          <Column text="Mean:" value={`${round(storage.stats?.mean_value)}m`}/>

          <p className="border-b text-sm font-semibold text-muted-foreground">
            Cursor:
          </p>

          <Column text="Northing:" value={round(storage.stats?.cursorNorth)}/>
          <Column text="Easting:" value={round(storage.stats?.cursorEast)}/>
          <Column text="Elevation:" value={`${round(storage.stats?.elevation)}m`}/>

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