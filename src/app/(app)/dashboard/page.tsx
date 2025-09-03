
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Download, Edit, GraduationCap, Save, X, MapPin, Loader2, Phone, Sun, Moon, CloudSun, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import { saveStudentDetails } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import * as htmlToImage from 'html-to-image';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Location {
    latitude: number;
    longitude: number;
}

function MinimalIdCard({ user, studentName, studentOlYear, studentId, qrCodeUrl, generatedAt }: { user: any, studentName: string, studentOlYear: string, studentId: string, qrCodeUrl: string, generatedAt: string | null}) {
  return (
    <div className="bg-white p-6 rounded-lg max-w-xs mx-auto font-sans">
        <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{studentName}</h2>
            <p className="text-gray-600 font-mono">{studentOlYear}{studentId}</p>
        </div>
        <div className="flex justify-center">
            <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={150}
                height={150}
                className="rounded-md"
                data-ai-hint="qr code"
              />
        </div>
         <div className="text-center mt-4 pt-2 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700">SenathSethmika.lk</p>
            {generatedAt && <p className="text-xs text-gray-500 mt-1">{generatedAt}</p>}
        </div>
    </div>
  )
}

function StudentIdCard() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentMajor, setStudentMajor] = useState("");
  const [studentOlYear, setStudentOlYear] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [downloadTrigger, setDownloadTrigger] = useState(0);


  const idCardRef = useRef<HTMLDivElement>(null);
  const minimalIdCardRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStudentData() {
      if (user) {
        setLoading(true);
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudentName(data.name || user.displayName || "Student Name");
          setStudentMajor(data.major || "");
          setStudentOlYear(data.olYear || "");
          setMobileNumber(data.mobile || "");
          setLocation(data.location || null);
        } else {
           setStudentName(user.displayName || "Student Name");
           setStudentMajor("");
        }
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [user]);

  useEffect(() => {
    if (downloadTrigger === 0) return;

    const generateAndDownload = async () => {
        if (minimalIdCardRef.current === null) {
            return;
        }

        // Set generatedAt right before image generation
        const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        setGeneratedAt(currentTime);

        // Allow state to update before capturing
        await new Promise(resolve => setTimeout(resolve, 50));
        
        htmlToImage.toPng(minimalIdCardRef.current!, { 
            cacheBust: true, 
            pixelRatio: 2,
            skipAutoScale: true,
        })
            .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `student-id-card-${user?.uid.substring(0,5)}.png`;
            link.href = dataUrl;
            link.click();
            })
            .catch((err) => {
            console.log(err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to download ID card image.",
            })
            }).finally(() => {
                // Reset for next download
                setGeneratedAt(null); 
            });
    }
    
    generateAndDownload();

  }, [downloadTrigger, user, toast]);


  const handleSave = async () => {
    if (!user) return;
    try {
      await saveStudentDetails({
        id: user.uid,
        name: studentName,
        major: studentMajor,
        mobile: mobileNumber,
        location: location || undefined,
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
  
  const handleDownloadClick = () => {
    setDownloadTrigger(prev => prev + 1);
  }

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Error', description: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setIsLocating(false);
        toast({ title: 'Success', description: 'Location fetched successfully! Click save to store it.' });
      },
      () => {
        setIsLocating(false);
        toast({ variant: 'destructive', title: 'Error', description: 'Unable to retrieve your location. Please grant permission.' });
      }
    );
  };

  if (loading) {
    return (
      <Card className="overflow-hidden shadow-lg col-span-1 lg:col-span-2">
        <div className="bg-primary/10 p-4 sm:p-6 flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </Card>
    );
  }

  const studentId = user?.uid.substring(0, 5).toUpperCase() || 'XXXXX';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${user?.uid || 'N/A'}`;
  const isProfileComplete = !!location && !!mobileNumber;

  return (
    <>
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
          <div ref={minimalIdCardRef}>
            <MinimalIdCard 
              user={user}
              studentName={studentName}
              studentOlYear={studentOlYear}
              studentId={studentId}
              qrCodeUrl={qrCodeUrl}
              generatedAt={generatedAt}
            />
          </div>
      </div>
      <Card className="overflow-hidden shadow-lg col-span-1 lg:col-span-2">
       <div ref={idCardRef} className="bg-card">
         <div className="bg-primary/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={user?.photoURL || "https://picsum.photos/100"} alt="Student Name" data-ai-hint="person" />
            <AvatarFallback>{studentName?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-grow">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="studentName" className="sr-only">Student Name</Label>
                  <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="text-2xl font-bold p-0 border-none shadow-none focus-visible:ring-0" />
                </div>
                <div>
                  <Label htmlFor="studentOlYear" className="sr-only">O/L Batch</Label>
                  <Input id="studentOlYear" value={studentOlYear} onChange={(e) => setStudentOlYear(e.target.value)} className="text-primary font-medium p-0 border-none shadow-none focus-visible:ring-0" placeholder="Your O/L Batch (e.g. 2025)" />
                </div>
                <div>
                   <Label htmlFor="mobileNumber" className="sr-only">Mobile Number</Label>
                   <Input id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile Number" className="text-sm p-0 border-none shadow-none focus-visible:ring-0" />
                </div>
              </div>
            ) : (
              <div>
                <CardTitle className="text-2xl">{studentName}</CardTitle>
                {studentOlYear && <CardDescription className="text-primary font-medium">O/L Batch: {studentOlYear}</CardDescription>}
                {mobileNumber && <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" />{mobileNumber}</p>}
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-4 sm:p-6 grid grid-cols-2 gap-4 items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Student ID</p>
            <p className={cn("font-semibold", !isProfileComplete && "text-red-500")}>
                {studentOlYear}{studentId}
            </p>
            <p className="text-sm font-medium text-muted-foreground mt-4">Valid Thru</p>
            <p className="font-semibold">12/2026</p>
            {!isProfileComplete && (
                <p className="text-xs text-red-500 mt-4">
                    Profile incomplete. Please update your details.
                </p>
            )}
          </div>
          <div className="flex justify-end">
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={100}
              height={100}
              className={cn("rounded-md", !isProfileComplete && "border-2 border-red-500 p-1")}
              data-ai-hint="qr code"
            />
          </div>
        </CardContent>
       </div>
       <div className="p-4 sm:p-6 border-t flex items-center justify-end gap-2">
            {!location && (
                <Button size="sm" variant="outline" onClick={handleFetchLocation} disabled={isLocating}>
                    {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Update Location
                </Button>
            )}
             {!mobileNumber && !isEditing && (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Phone className="mr-2 h-4 w-4" />
                    Update Phone
                </Button>
            )}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0}>
                           <Button size="icon" variant="outline" onClick={handleDownloadClick} disabled={!isProfileComplete}>
                             <Download />
                           </Button>
                        </span>
                    </TooltipTrigger>
                    {!isProfileComplete && (
                        <TooltipContent>
                           <p>Please update your phone and location to download.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
            {isEditing ? (
              <>
                <Button size="icon" onClick={handleSave}><Save /></Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X /></Button>
              </>
            ) : (
             mobileNumber && (
              <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit />
              </Button>
             )
            )}
        </div>
      </Card>
    </>
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

function DashboardGreeting() {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [icon, setIcon] = useState<React.ElementType>(Sun);
    const [studentName, setStudentName] = useState('');

    useEffect(() => {
        if (user) {
            const fetchStudentName = async () => {
                const docRef = doc(db, "students", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStudentName(docSnap.data().name || user.displayName || '');
                } else {
                    setStudentName(user.displayName || '');
                }
            };
            fetchStudentName();
        }

        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good morning');
            setIcon(() => Sun);
        } else if (hour < 17) {
            setGreeting('Good afternoon');
            setIcon(() => CloudSun);
        } else {
            setGreeting('Good evening');
            setIcon(() => Moon);
        }
    }, [user]);

    if (!greeting || !studentName) {
        return <Skeleton className="h-8 w-1/2 mb-4" />;
    }

    const Icon = icon;

    return (
        <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">{greeting}, {studentName.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Welcome back to your dashboard.</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  return (
    <>
      <DashboardGreeting />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StudentIdCard />
        <QuickAccessCard
          icon={Store}
          title="Store"
          description="Browse and enroll in courses"
          href="/store"
        />
        <QuickAccessCard
          icon={GraduationCap}
          title="My Lectures"
          description="Access your enrolled courses"
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
