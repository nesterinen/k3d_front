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
 
export function InfoSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Details</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>PointCloud</SheetTitle>
          <SheetDescription>
            Information about .tif and pointcloud
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Size:
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
                500x500
            </p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-semibold">
                Elevation:
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
                62.4m - 127.2m
            </p>
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