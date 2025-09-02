
'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addNotice } from './actions';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const noticesData: Notice[] = [];
      querySnapshot.forEach((doc) => {
        noticesData.push({ id: doc.id, ...(doc.data() as Omit<Notice, 'id'>) });
      });
      setNotices(noticesData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNotice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addNotice(null, formData);

    if (result?.errors) {
      const errorMessages = Object.values(result.errors).flat().join(', ');
      toast({
        variant: 'destructive',
        title: 'Error adding notice',
        description: errorMessages || 'An unknown error occurred.',
      });
    } else {
      toast({
        title: 'Success',
        description: result.message,
      });
      formRef.current?.reset();
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Manage Notices</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Notice</CardTitle>
            <CardDescription>Create and publish a new notice for all users.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddNotice} ref={formRef}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title</Label>
                <Input id="title" name="title" placeholder="e.g., Upcoming Holiday" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Notice Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Full text of the notice..."
                  required
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Publish Notice</Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Notices</CardTitle>
            <CardDescription>List of all previously published notices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice.id} className="p-3 border rounded-md">
                  <h4 className="font-semibold">{notice.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {notice.createdAt ? format(notice.createdAt.toDate(), 'PPP') : 'No date'}
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{notice.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No notices published yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
