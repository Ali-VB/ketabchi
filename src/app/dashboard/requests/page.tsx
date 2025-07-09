'use client';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { RequestCard } from "@/components/request-card";
import { type BookRequest, type Trip } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewRequestForm } from "@/components/new-request-form";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserRequests, findMatches } from "@/lib/firebase/firestore";
import { useSearchParams } from "next/navigation";

type RequestWithMatches = BookRequest & { matchingTrips: Trip[] };

export default function MyRequestsPage() {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requests, setRequests] = useState<RequestWithMatches[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRequests = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const [userRequests, { requestMatches }] = await Promise.all([
            getUserRequests(user.uid),
            findMatches(user.uid)
        ]);
        
        const requestsWithMatchesData = userRequests.map(request => {
          const matchData = requestMatches.find(m => m.id === request.id);
          return {
            ...request,
            matchingTrips: matchData ? matchData.matchingTrips : [],
          };
        });

        setRequests(requestsWithMatchesData);

      } catch (error) {
        console.error("Failed to fetch requests with matches:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);


  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">درخواست‌های من</h2>
          <p className="text-muted-foreground">درخواست‌های کتاب خود را مدیریت کنید و سفرهای منطبق را ببینید.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="me-2 h-4 w-4" />
              درخواست جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ایجاد درخواست کتاب جدید</DialogTitle>
              <DialogDescription>
                مشخصات کتاب مورد نظر خود را وارد کنید.
              </DialogDescription>
            </DialogHeader>
            <NewRequestForm setDialogOpen={setIsDialogOpen} onPostSuccess={fetchRequests} />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              showFooter={false}
              matchCount={request.matchingTrips.length}
              matchingTrips={request.matchingTrips}
              isDashboardView={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
          <h3 className="text-xl font-bold tracking-tight">هنوز درخواستی ثبت نکرده‌اید</h3>
          <p className="text-sm text-muted-foreground mt-2">برای شروع، یک درخواست کتاب جدید ایجاد کنید.</p>
          <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="me-2 h-4 w-4" />
            ایجاد درخواست اول
          </Button>
        </div>
      )}
    </div>
  );
}
