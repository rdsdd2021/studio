import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GeofencingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Geofencing</h1>
        <p className="text-muted-foreground">Define and manage the operational area for your team.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Fencing Area Configuration</CardTitle>
            <CardDescription>
                Set the central point and radius for your geofence. Users logging in outside this area can be flagged or restricted.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                 <div>
                    <Label htmlFor="latitude">Center Latitude</Label>
                    <Input id="latitude" placeholder="e.g., 28.6139" defaultValue="28.6139" />
                </div>
                 <div>
                    <Label htmlFor="longitude">Center Longitude</Label>
                    <Input id="longitude" placeholder="e.g., 77.2090" defaultValue="77.2090" />
                </div>
                 <div>
                    <Label htmlFor="radius">Radius (in meters)</Label>
                    <Input id="radius" placeholder="e.g., 5000" defaultValue="5000" type="number" />
                </div>
            </div>
            <div className="relative rounded-lg overflow-hidden border bg-muted">
                 <Image
                    src="https://placehold.co/600x400.png"
                    alt="Map placeholder"
                    width={600}
                    height={400}
                    data-ai-hint="map"
                    className="object-cover w-full h-full opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary/30 border-2 border-dashed border-primary flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">Fence Area</span>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button>Save Configuration</Button>
        </CardFooter>
      </Card>
    </div>
  )
}