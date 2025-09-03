
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { scienceBot } from '@/ai/flows/science-bot';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ScienceBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await scienceBot({ question: input });
      const botMessage: Message = { role: 'bot', content: result.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with Science Bot:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'The science bot encountered an error. Please try again.',
      });
      setMessages(prev => prev.slice(0, -1)); // Remove the user's message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Science Bot</h1>
      </div>
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            AI Science Tutor
          </CardTitle>
          <CardDescription>
            Ask me any question about Biology, Chemistry, or Physics!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.role === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-prose rounded-lg p-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                     <div className="max-w-prose rounded-lg p-3 bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
