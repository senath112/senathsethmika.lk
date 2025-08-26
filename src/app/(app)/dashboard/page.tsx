
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Edit, PlayCircle, Save, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { saveStudentDetails } from "./actions";
import { useToast } from "@/hooks/use-toast";

function StudentIdCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [studentName, setStudentName] = useState("Student Name");
  const [studentMajor, setStudentMajor] = useState("Biology Major");
  const studentId = "SYN-123456";
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await saveStudentDetails({
        id: studentId,
        name: studentName,
        major: studentMajor,
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Student details saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save student details.",
      });
    }
  };


  return (
    <Card className="overflow-hidden shadow-lg col-span-1 lg:col-span-2">
       <div className="bg-primary/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="h-24 w-24 border-4 border-white shadow-md">
          <AvatarImage src="https://picsum.photos/100" alt="Student Name" data-ai-hint="person" />
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-grow">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <Label htmlFor="studentName" className="sr-only">Student Name</Label>
                <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="text-2xl font-bold p-0 border-none shadow-none focus-visible:ring-0" />
              </div>
              <div>
                <Label htmlFor="studentMajor" className="sr-only">Major</Label>
                <Input id="studentMajor" value={studentMajor} onChange={(e) => setStudentMajor(e.target.value)} className="text-primary font-medium p-0 border-none shadow-none focus-visible:ring-0" />
              </div>
            </div>
          ) : (
            <div>
              <CardTitle className="text-2xl">{studentName}</CardTitle>
              <CardDescription className="text-primary font-medium">{studentMajor}</CardDescription>
            </div>
          )}
        </div>
         <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="icon" onClick={handleSave}><Save /></Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X /></Button>
            </>
          ) : (
            <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4 sm:p-6 grid grid-cols-2 gap-4 items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Student ID</p>
          <p className="font-semibold">{studentId}</p>
          <p className="text-sm font-medium text-muted-foreground mt-4">Valid Thru</p>
          <p className="font-semibold">12/2026</p>
        </div>
        <div className="flex justify-end">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${studentId}`}
            alt="QR Code"
            width={100}
            height={100}
            className="rounded-md"
            data-ai-hint="qr code"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessCard({ icon: Icon, title, description, href }: { icon: React.ElementType, title: string, description: string, href: string }) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <a href={href}>
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StudentIdCard />
        <QuickAccessCard
          icon={Users}
          title="Students"
          description="Manage student information"
          href="/students"
        />
        <QuickAccessCard
          icon={PlayCircle}
          title="Lectures"
          description="Watch recorded lectures"
          href="/lectures"
        />
        <QuickAccessCard
          icon={BookOpen}
          title="Documents"
          description="Download course materials"
          href="/documents"
        />
      </div>
    </>
  );
}
