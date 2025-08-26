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
import { Download, FileText, FileType, BookCopy } from "lucide-react";

const documents = [
  {
    name: "Biology 101 Syllabus",
    type: "Syllabus",
    date: "2024-01-15",
    fileType: "PDF",
    icon: BookCopy
  },
  {
    name: "Lab Safety Guidelines",
    type: "Tutorial",
    date: "2024-01-18",
    fileType: "PDF",
    icon: FileText
  },
  {
    name: "Lecture Notes - Week 1",
    type: "Notes",
    date: "2024-01-22",
    fileType: "DOCX",
    icon: FileText
  },
  {
    name: "Genetics Lab Report Template",
    type: "Tutorial",
    date: "2024-02-05",
    fileType: "DOCX",
    icon: FileType
  },
  {
    name: "Midterm Study Guide",
    type: "Notes",
    date: "2024-02-20",
    fileType: "PDF",
    icon: FileText
  },
];

export default function DocumentsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Documents</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
          <CardDescription>
            Download syllabi, lecture notes, and other important documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Icon</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.name}>
                  <TableCell className="hidden sm:table-cell">
                    <doc.icon className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {doc.name}
                    <div className="md:hidden text-sm text-muted-foreground">{doc.date}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.type === 'Syllabus' ? 'default' : 'secondary'}>{doc.type}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{doc.date}</TableCell>
                  <TableCell>
                    <Button aria-label="Download" size="icon" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
