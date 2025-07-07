import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { RequestCard } from '@/components/request-card';
import { TripCard } from '@/components/trip-card';
import { getAllRequests, getAllTrips } from '@/lib/firebase/firestore';
import type { BookRequest, Trip } from '@/lib/types';


export default async function Home() {
  const requests = await getAllRequests();
  const trips = await getAllTrips();

  const allItems = [
    ...requests.map(r => ({ type: 'request', data: r, date: new Date(r.deadline) })),
    ...trips.map(t => ({ type: 'trip', data: t, date: new Date(t.date) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <section className="container py-8 md:py-12">
          {allItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {allItems.map((item) =>
                item.type === 'request' ? (
                  <RequestCard key={item.data.id} request={item.data as BookRequest} />
                ) : (
                  <TripCard key={item.data.id} trip={item.data as Trip} />
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
