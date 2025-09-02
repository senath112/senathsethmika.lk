
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

function NoticeSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const noticesData: Notice[] = [];
      querySnapshot.forEach((doc) => {
        noticesData.push({ id: doc.id, ...(doc.data() as Omit<Notice, 'id'>) });
      });
      setNotices(noticesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Notices</h1>
      </div>
      <div className="grid gap-6">
        {loading && Array.from({ length: 3 }).map((_, i) => <NoticeSkeleton key={i} />)}
        {!loading && notices.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No Notices Yet</CardTitle>
            <CardDescription className="mt-2">Check back later for important announcements.</CardDescription>
          </Card>
        )}
        {!loading && notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader>
              <CardTitle>{notice.title}</CardTitle>
              <CardDescription>
                {notice.createdAt ? format(notice.createdAt.toDate(), 'PPP') : 'No date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{notice.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
