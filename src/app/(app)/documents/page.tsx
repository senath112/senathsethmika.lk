
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
import { Button } from "@/components/ui/button";
import { Download, FileText, BookCopy, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getWatermarkedPdf } from "./actions";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  fileUrl: string;
  courseId: string;
  courseTitle: string;
}

function DocumentsSkeleton() {
  return (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell"><span className="sr-only">Icon</span></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Course</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-5" /></TableCell>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-1/4" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const enrollmentQuery = query(
      collection(db, 'enrollmentRequests'),
      where('studentId', '==', user.uid),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(enrollmentQuery, async (snapshot) => {
      if (snapshot.empty) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      const courseIds = snapshot.docs.map(doc => doc.data().courseId);
      if (courseIds.length === 0) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      
      const documentsQuery = query(collection(db, 'documents'), where('courseId', 'in', courseIds));
      
      onSnapshot(documentsQuery, (querySnapshot) => {
        const docsData: Document[] = [];
        querySnapshot.forEach((doc) => {
          docsData.push({ id: doc.id, ...doc.data() } as Document);
        });
        setDocuments(docsData);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [user]);


  const getIcon = (type: string) => {
    switch (type) {
      case 'Syllabus':
        return BookCopy;
      case 'Tutorial':
        return FileText;
      default:
        return FileText;
    }
  }

  const handleDownload = async (doc: Document) => {
    if (!user) return;
    
    // Check if the document is a PDF
    if (!doc.fileUrl.toLowerCase().endsWith('.pdf')) {
        // For non-PDF files, perform a direct download
        window.open(doc.fileUrl, '_blank');
        return;
    }

    setDownloadingDocId(doc.id);
    try {
        const studentId = user.uid;
        const watermarkedPdfBase64 = await getWatermarkedPdf(doc.fileUrl, studentId);
        
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${watermarkedPdfBase64}`;
        link.download = `${doc.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not process the document for download. Please try again."
        })
    } finally {
        setDownloadingDocId(null);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Documents</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
          <CardDescription>
            Download syllabi, lecture notes, and other important documents for your enrolled courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <DocumentsSkeleton />
          ) : documents.length === 0 ? (
             <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Documents Found</AlertTitle>
                <AlertDescription>
                  It looks like you're not enrolled in any courses that have documents yet, or no documents have been uploaded for your courses.
                   <Button asChild variant="link" className="p-0 ml-1 h-auto">
                      <Link href="/courses">Browse Courses</Link>
                   </Button>
                </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Icon</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const Icon = getIcon(doc.type);
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {doc.name}
                        <div className="md:hidden text-sm text-muted-foreground">{doc.date}</div>
                      </TableCell>
                       <TableCell>{doc.courseTitle}</TableCell>
                      <TableCell>
                        <Badge variant={doc.type === 'Syllabus' ? 'default' : 'secondary'}>{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{doc.date}</TableCell>
                      <TableCell>
                        <Button 
                            aria-label="Download" 
                            size="icon" 
                            variant="outline"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingDocId === doc.id}
                        >
                           {downloadingDocId === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                                <Download className="h-4 w-4" />
                           )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
