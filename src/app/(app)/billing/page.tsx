
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generatePaymentPdf } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  invoice: string;
  date: string;
  course: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

function BillingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
             </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function BillingPage() {
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('N/A');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    async function fetchStudentName() {
        const studentDocRef = doc(db, 'students', user.uid);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
            setStudentName(studentDocSnap.data().name || 'N/A');
        } else {
            setStudentName(user.displayName || 'N/A');
        }
    }
    fetchStudentName();
    
    setLoading(true);
    const q = query(collection(db, 'payments'), where('studentId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const paymentsData: Payment[] = [];
      querySnapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...(doc.data() as Omit<Payment, 'id'>) });
      });
      setPaymentHistory(paymentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDownload = async (payment: Payment) => {
    if (!user) return;
    setDownloadingId(payment.id);
    try {
        const pdfBase64 = await generatePaymentPdf({
            ...payment,
            studentName: studentName
        });
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${pdfBase64}`;
        link.download = `receipt-${payment.invoice}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not generate the payment slip.'
        });
    } finally {
        setDownloadingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Billing & Payments</h1>
      </div>
      {loading ? (
        <BillingSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View your past payments and download invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Download</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">No payment history found.</TableCell>
                    </TableRow>
                )}
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.invoice}</TableCell>
                    <TableCell>{payment.course}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.status === 'Paid' ? 'secondary' : 'destructive'} 
                        className={payment.status === 'Paid' ? 'bg-green-100 text-green-800' : ''}>
                          {payment.status}
                      </Badge>
                    </TableCell>
                     <TableCell>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDownload(payment)}
                            disabled={downloadingId === payment.id}>
                                {downloadingId === payment.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
