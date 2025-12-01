import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/atoms/card'

export function DisasterMapCard() {
  return (
    <div className="col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Disaster Response Map</CardTitle>
          <CardDescription>
            Explore reported incidents, relief efforts, and resource requests across Sri
            Lanka in real time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mock map */}
          <div className="h-[50vh] w-full relative rounded-lg overflow-hidden border bg-gray-100">
            {/* Mock map image or illustration */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Sri_Lanka_location_map.svg"
              alt="Sri Lanka Relief Map"
              className="object-cover w-full h-full opacity-80"
            />
            {/* Example markers */}
            <div className="absolute top-[45%] left-[63%] -translate-x-1/2 -translate-y-1/2">
              <span className="flex items-center">
                <span
                  className="inline-block h-4 w-4 rounded-full bg-orange-500 border-2 border-white animate-pulse"
                  title="Incident"
                ></span>
                <span className="ml-2 text-xs font-semibold text-black drop-shadow">
                  Colombo: Flood
                </span>
              </span>
            </div>
            <div className="absolute top-[60%] left-[74%] -translate-x-1/2 -translate-y-1/2">
              <span className="flex items-center">
                <span
                  className="inline-block h-3 w-3 rounded-full bg-green-500 border-2 border-white"
                  title="Aid Center"
                ></span>
                <span className="ml-2 text-xs font-semibold text-black drop-shadow">
                  Galle: Aid Center
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

