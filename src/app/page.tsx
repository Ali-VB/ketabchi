import { Header } from '@/components/header';
import { HomeFilters } from '@/components/home-filters';
import { RequestCard } from '@/components/request-card';
import { TripCard } from '@/components/trip-card';
import type { BookRequest, Trip } from '@/lib/types';

const mockRequests: BookRequest[] = [
  { id: '1', title: 'در جستجوی زمان از دست رفته', to_city: 'تهران', deadline: '۱۴۰۳/۰۵/۱۰', user: { name: 'نادر ابراهیمی', avatar: 'https://placehold.co/40x40.png' } },
  { id: '2', title: 'بوف کور', to_city: 'اصفهان', deadline: '۱۴۰۳/۰۵/۱۵', user: { name: 'صادق هدایت', avatar: 'https://placehold.co/40x40.png' } },
  { id: '3', title: 'کلیدر', to_city: 'شیراز', deadline: '۱۴۰۳/۰۵/۲۰', user: { name: 'محمود دولت‌آبادی', avatar: 'https://placehold.co/40x40.png' } },
  { id: '4', title: 'چشم‌هایش', to_city: 'تبریز', deadline: '۱۴۰۳/۰۵/۲۵', user: { name: 'بزرگ علوی', avatar: 'https://placehold.co/40x40.png' } },
];

const mockTrips: Trip[] = [
  { id: '1', from_city: 'پاریس', to_city: 'تهران', date: '۱۴۰۳/۰۵/۱۲', capacity: 5, user: { name: 'آلیس', avatar: 'https://placehold.co/40x40.png' } },
  { id: '2', from_city: 'تورنتو', to_city: 'اصفهان', date: '۱۴۰۳/۰۵/۱۸', capacity: 3, user: { name: 'بابک', avatar: 'https://placehold.co/40x40.png' } },
  { id: '3', from_city: 'لندن', to_city: 'شیراز', date: '۱۴۰۳/۰۵/۲۲', capacity: 7, user: { name: 'سارا', avatar: 'https://placehold.co/40x40.png' } },
  { id: '4', from_city: 'دبی', to_city: 'تبریز', date: '۱۴۰۳/۰۵/۲۸', capacity: 2, user: { name: 'مریم', avatar: 'https://placehold.co/40x40.png' } },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HomeFilters />
        <section className="container py-8 md:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
            {mockTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
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
