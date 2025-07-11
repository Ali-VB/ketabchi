'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Mail, Loader2, ExternalLink } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import type { Conversation, Message, User, Match } from '@/lib/types';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  getOrCreateConversationAndMatch, 
  getRequestById, 
  getTripById, 
  createMatch,
  getUserProfile, 
} from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('recipient');
  const requestId = searchParams.get('requestId');
  const tripId = searchParams.get('tripId');
  
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isCreatingMatch, setIsCreatingMatch] = React.useState(false);
  const [existingMatch, setExistingMatch] = React.useState<Match | null>(null);
  
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);


  React.useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setIsLoadingConversations(true);

    const setupConversations = async () => {
      try {
        // If a recipient is specified in the URL, ensure the conversation exists first.
        if (recipientId) {
            const { conversationId, match } = await getOrCreateConversationAndMatch(user.uid, recipientId, requestId, tripId);
            if (isMounted) {
                setExistingMatch(match);
            }
        }

        // Then, fetch the complete and up-to-date list of all conversations.
        const allConversations = await getConversations(user.uid);
        
        if (!isMounted) return;

        setConversations(allConversations);

        // Now, determine which conversation to select from the clean list.
        if (recipientId) {
          const targetConversation = allConversations.find(c => c.users.includes(recipientId));
          setSelectedConversation(targetConversation || null);
        } else if (allConversations.length > 0) {
          // If no recipient is specified, select the most recent conversation.
          setSelectedConversation(allConversations[0]);
        } else {
          // No conversations exist.
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error("Failed to setup conversations:", error);
        toast({ variant: "destructive", title: "خطا", description: "امکان بارگذاری گفتگوها وجود نداشت." });
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false);
        }
      }
    };

    setupConversations();

    return () => {
      isMounted = false;
    };
  }, [user, recipientId, requestId, tripId, toast]);


  // Listen for messages in the selected conversation
  React.useEffect(() => {
    if (selectedConversation) {
      setIsLoadingMessages(true);
      const unsubscribe = getMessages(selectedConversation.id, (newMessages) => {
        setMessages(newMessages);
        setIsLoadingMessages(false);
      });
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    setIsSending(true);
    try {
      await sendMessage(selectedConversation.id, {
        text: newMessage,
        senderId: user.uid,
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateMatchAndPay = async () => {
    if (!requestId || !tripId || !user) return;

    setIsCreatingMatch(true);
    try {
        let matchId = existingMatch?.id;

        const request = await getRequestById(requestId);
        if (!request) {
            toast({ variant: 'destructive', title: 'خطا', description: 'درخواست مورد نظر یافت نشد.' });
            return;
        }

        // The requester is the one who initiates payment
        if (request.userId !== user.uid) {
            toast({ variant: 'destructive', title: 'خطای مجوز', description: 'شما مجاز به ایجاد این تراکنش نیستید.' });
            return;
        }
        
        if (!matchId) {
            const trip = await getTripById(tripId);

            if (!trip) {
                toast({ variant: 'destructive', title: 'خطا', description: 'سفر مورد نظر یافت نشد.' });
                return;
            }
            
            matchId = await createMatch(request, trip);
        }
        
        const bookTitles = request?.books?.map(b => b.title).join(', ') || 'کتاب';
        const amount = 50.00; // Placeholder amount

        // Create a checkout session
        const res = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount,
                matchId, 
                bookTitles 
            }),
        });
        
        if (!res.ok) {
           const { error } = await res.json();
           throw new Error(error || 'Failed to create checkout session');
        }

        const { url } = await res.json();
        
        if (url) {
            window.open(url, '_blank');
        } else {
             throw new Error('Checkout URL not received from server.');
        }

    } catch (error) {
        console.error("Error creating match and opening Stripe:", error);
        toast({
            variant: "destructive",
            title: "خطا در پرداخت",
            description: (error as Error).message || "متاسفانه مشکلی در هنگام شروع فرآیند پرداخت پیش آمد.",
        });
    } finally {
        setIsCreatingMatch(false);
    }
}

  if (authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const paymentButtonDisabled = isCreatingMatch || (!!existingMatch && existingMatch.status !== 'pending_payment');
  const getPaymentButtonText = () => {
    if (isCreatingMatch) return "در حال آماده‌سازی..."
    if (existingMatch?.status === 'active') return "تراکنش فعال است";
    if (existingMatch?.status === 'completed') return "تراکنش تکمیل شده";
    if (existingMatch?.status === 'disputed') return "تراکنش مورد اختلاف";
    if (existingMatch?.status === 'cancelled') return "تراکنش لغو شده";
    if (existingMatch?.status === 'pending_payment') return "ادامه پرداخت";
    return "پرداخت و شروع تراکنش";
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-[calc(100vh-120px)] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="col-span-1 border-e flex flex-col">
        <div className="p-4 border-b">
           <h2 className="text-xl font-bold">گفتگوها</h2>
        </div>
        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
             <div className="p-4 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>
          ) : conversations.length === 0 ? (
             <div className="p-4 text-center text-sm text-muted-foreground">هیچ گفتگویی یافت نشد.</div>
          ) : (
            conversations.map((convo) => (
              <button 
                key={convo.id} 
                className={cn(
                  "flex w-full items-center gap-3 p-4 text-right hover:bg-muted/50 transition-colors",
                  selectedConversation?.id === convo.id && "bg-muted"
                )}
                onClick={() => setSelectedConversation(convo)}
              >
                 <Avatar>
                    <AvatarImage src={convo.otherUser.photoURL ?? `https://placehold.co/40x40.png`} data-ai-hint="user portrait" />
                    <AvatarFallback>{convo.otherUser.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{convo.otherUser.displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-3 border-b flex items-center gap-3">
               <Avatar>
                    <AvatarImage src={selectedConversation.otherUser.photoURL ?? `https://placehold.co/40x40.png`} data-ai-hint="user portrait" />
                    <AvatarFallback>{selectedConversation.otherUser.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              <h3 className="text-lg font-semibold">{selectedConversation.otherUser.displayName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/20">
              <div className="space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.uid;
                    return (
                    <div key={msg.id} className={cn("flex items-end gap-2", isOwn && "justify-end")}>
                      <div className={cn(
                        "max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3",
                        isOwn ? "bg-primary text-primary-foreground" : "bg-card border"
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                          "text-xs mt-1 text-right",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>{new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    )
                  })
                )}
                 <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input 
                  placeholder="پیام خود را بنویسید..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoComplete="off"
                />
                <Button type="submit" size="icon" aria-label="ارسال پیام" disabled={!newMessage.trim() || isSending}>
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
                </Button>
              </form>
            </div>
            {requestId && tripId && user?.uid !== selectedConversation.otherUser.uid && (
                <div className="p-4 border-t bg-accent/10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-accent-foreground/80">
                            <p className="font-bold">شروع تراکنش با {selectedConversation.otherUser.displayName}</p>
                            <p className="text-sm">پس از توافق، برای امن‌سازی پرداخت روی دکمه کلیک کنید.</p>
                        </div>
                        <Button 
                            onClick={handleCreateMatchAndPay} 
                            disabled={paymentButtonDisabled} 
                            className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
                        >
                            {isCreatingMatch ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ExternalLink className="me-2 h-4 w-4" />}
                            {getPaymentButtonText()}
                        </Button>
                    </div>
                </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-center p-4">
             <div>
                <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <h3 className="text-xl font-bold tracking-tight mt-6">
                    بخش پیام‌رسانی
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    یک گفتگو را برای مشاهده پیام‌ها انتخاب کنید یا یک گفتگوی جدید را از طریق کارت‌های درخواست و سفر شروع کنید.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
