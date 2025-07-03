import { Header } from '@/components/header';
import { HomeFilters } from '@/components/home-filters';
import { RequestCard } from '@/components/request-card';
import { TripCard } from '@/components/trip-card';
import type { BookRequest, Trip } from '@/lib/types';

const mockRequests: BookRequest[] = [
    { id: 'req1', title: 'کتابی از آمریکا', to_city: 'تهران', deadline: '2024-08-25', user: { name: 'سارا فهیمی', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'req2', title: 'کتابی از کانادا', to_city: 'اصفهان', deadline: '2024-09-05', user: { name: 'علی رضایی', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'req3', title: 'کتاب تخصصی', to_city: 'شیراز', deadline: '2024-09-10', user: { name: 'مریم نوری', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'req4', title: 'رمان خارجی', to_city: 'تبریز', deadline: '2024-09-15', user: { name: 'رضا قاسمی', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'req5', title: 'مجموعه اشعار', to_city: 'مشهد', deadline: '2024-09-20', user: { name: 'زهرا حسینی', avatar: 'https://placehold.co/40x40.png' } },
];

const mockTrips: Trip[] = [
    { id: 'trip1', from_city: 'تهران', to_city: 'تورنتو', date: '2024-08-30', capacity: 3, user: { name: 'نیما افشار', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'trip2', from_city: 'اصفهان', to_city: 'نیویورک', date: '2024-09-02', capacity: 2, user: { name: 'آزاده کریمی', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'trip3', from_city: 'شیراز', to_city: 'ونکوور', date: '2024-09-12', capacity: 5, user: { name: 'بابک رسولی', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'trip4', from_city: 'تبریز', to_city: 'لس آنجلس', date: '2024-09-18', capacity: 4, user: { name: 'پریسا محمدی', avatar: 'https://placehold.co/40x40.png' } },
    { id: 'trip5', from_city: 'مشهد', to_city: 'مونترال', date: '2024-09-25', capacity: 1, user: { name: 'شهریار احمدی', avatar: 'https://placehold.co/40x40.png' } },
];

const allItems = [
    ...mockRequests.map(r => ({ type: 'request', data: r })),
    ...mockTrips.map(t => ({ type: 'trip', data: t }))
  ].sort((a, b) => a.data.id > b.data.id ? 1 : -1);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HomeFilters />
        <section className="container py-8 md:py-12">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {allItems.map((item) =>
              item.type === 'request' ? (
                <RequestCard key={item.data.id} request={item.data as BookRequest} />
              ) : (
                <TripCard key={item.data.id} trip={item.data as Trip} />
              )
            )}
          </div>
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
