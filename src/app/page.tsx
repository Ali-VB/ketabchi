'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { RequestCard } from '@/components/request-card';
import { TripCard } from '@/components/trip-card';
import { getAllRequests, getAllTrips, findMatches } from '@/lib/firebase/firestore';
import type { BookRequest, Trip, MatchedRequest, MatchedTrip } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { Loader2 } from 'lucide-react';

type CombinedItem = {
  type: 'request' | 'trip';
  data: BookRequest | Trip;
  date: Date;
  matchCount?: number;
};

export default function Home() {
  const [allItems, setAllItems] = useState<CombinedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const requests = await getAllRequests(10);
        const trips = await getAllTrips(10);

        let requestMatches: MatchedRequest[] = [];
        let tripMatches: MatchedTrip[] = [];

        if (user) {
          const matches = await findMatches(user.uid);
          requestMatches = matches.requestMatches;
          tripMatches = matches.tripMatches;
        }

        const combinedItems: CombinedItem[] = [
          ...requests.map(r => {
            let matchCount: number | undefined = undefined;
            if (user && r.userId === user.uid) {
              const match = requestMatches.find(rm => rm.id === r.id);
              if (match) {
                matchCount = match.matchingTrips.length;
              }
            }
            return { type: 'request' as const, data: r, date: new Date(r.deadline_end), matchCount };
          }),
          ...trips.map(t => {
            let matchCount: number | undefined = undefined;
            if (user && t.userId === user.uid) {
                const match = tripMatches.find(tm => tm.id === t.id);
                if (match) {
                    matchCount = match.matchingRequests.length;
                }
            }
            return { type: 'trip' as const, data: t, date: new Date(t.date_end), matchCount };
          })
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setAllItems(combinedItems);
      } catch (error) {
          console.error("Error fetching homepage items:", error);
      } finally {
          setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <section className="container py-8 md:py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {allItems.map((item) =>
                item.type === 'request' ? (
                  <RequestCard 
                    key={item.data.id} 
                    request={item.data as BookRequest} 
                    showFooter={!user || user.uid !== item.data.userId}
                    matchCount={item.matchCount}
                  />
                ) : (
                  <TripCard 
                    key={item.data.id} 
                    trip={item.data as Trip} 
                    showFooter={!user || user.uid !== item.data.userId}
                    matchCount={item.matchCount}
                  />
                )
              )}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
                <h3 className="text-xl font-bold tracking-tight">هنوز هیچ درخواستی ثبت نشده است</h3>
                <p className="text-sm text-muted-foreground mt-2">اولین درخواست کتاب یا سفر را شما ثبت کنید!</p>
            </div>
          )}
        </section>
      </main>
      <footer className="border-t">
        <div className="container py-6 text-center text-muted-foreground">
          <p>&copy; ۱۴۰۳ کتابچی. تمام حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
}
