'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match } from '@/lib/types';
import { getAllMatches } from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

const formatEnglishDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

const getStatusBadge = (status: Match['status']) => {
  const statusStyles = {
    active: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-100",
    disputed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-100",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100",
  }
  return <Badge variant="secondary" className={cn("capitalize", statusStyles[status])}>{status}</Badge>;
};

export default function MatchManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.uid !== ADMIN_USER_ID) {
                toast({ variant: 'destructive', title: 'Unauthorized', description: 'You do not have permission to view this page.' });
                router.push('/dashboard');
                return;
            }
            
            setIsLoading(true);
            getAllMatches()
                .then(matches => {
                    setAllMatches(matches);
                    setFilteredMatches(matches);
                })
                .catch(err => {
                    console.error(err);
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to load matches.' });
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading, router, toast]);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredMatches(allMatches);
        } else {
            setFilteredMatches(allMatches.filter(match => match.status === activeTab));
        }
    }, [activeTab, allMatches]);

    if (authLoading || isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Match Management</CardTitle>
                <CardDescription>
                    View and manage all matches on the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="disputed">Disputed</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab} className="mt-4">
                        {filteredMatches.length === 0 && !isLoading ? (
                            <div className="py-12 text-center">
                               <p className="text-muted-foreground">No matches found for this status.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Requester</TableHead>
                                        <TableHead>Traveler</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMatches.map(match => (
                                        <TableRow key={match.id}>
                                            <TableCell className="font-medium">{match.request.user.displayName}</TableCell>
                                            <TableCell className="font-medium">{match.trip.user.displayName}</TableCell>
                                            <TableCell>{getStatusBadge(match.status)}</TableCell>
                                            <TableCell>${(match.amount ?? 0).toFixed(2)}</TableCell>
                                            <TableCell>{formatEnglishDate(match.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm">View Details</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
