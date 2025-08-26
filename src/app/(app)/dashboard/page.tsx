import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function StudentIdCard() {
  return (
    <Card className="overflow-hidden shadow-lg col-span-1 lg:col-span-2">
      <div className="bg-primary/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="h-24 w-24 border-4 border-white shadow-md">
          <AvatarImage src="https://picsum.photos/100" alt="Student Name" data-ai-hint="person" />
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <CardTitle className="text-2xl">Student Name</CardTitle>
          <CardDescription className="text-primary font-medium">Biology Major</CardDescription>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6 grid grid-cols-2 gap-4 items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Student ID</p>
          <p className="font-semibold">SYN-123456</p>
          <p className="text-sm font-medium text-muted-foreground mt-4">Valid Thru</p>
          <p className="font-semibold">12/2026</p>
        </div>
        <div className="flex justify-end">
          <Image
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SYN-123456"
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
