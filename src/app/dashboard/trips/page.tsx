'use client';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { TripCard } from "@/components/trip-card";
import { type Trip } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewTripForm } from "@/components/new-trip-form";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserTrips } from "@/lib/firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function MyTripsPage() {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserTrips(user.uid)
        .then(setTrips)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">سفرهای من</h2>
          <p className="text-muted-foreground">سفرهای اعلام‌شده خود را مدیریت کنید.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="me-2 h-4 w-4" />
              اعلام سفر جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>اعلام سفر جدید</DialogTitle>
              <DialogDescription>
                مشخصات سفر خود را برای کمک به دیگران وارد کنید.
              </DialogDescription>
            </DialogHeader>
            <NewTripForm setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trips.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
          <h3 className="text-xl font-bold tracking-tight">هنوز سفری اعلام نکرده‌اید</h3>
          <p className="text-sm text-muted-foreground mt-2">برای شروع، یک سفر جدید اعلام کنید.</p>
          <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="me-2 h-4 w-4" />
            اعلام اولین سفر
          </Button>
        </div>
      )}
    </div>
  );
}
