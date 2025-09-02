
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Bell,
} from 'lucide-react';
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-sky-500' },
  { href: '/courses', label: 'Courses', icon: GraduationCap, color: 'text-emerald-500' },
  { href: '/documents', label: 'Documents', icon: FileText, color: 'text-amber-500' },
  { href: '/billing', label: 'Billing', icon: CreditCard, color: 'text-violet-500' },
  { href: '/notices', label: 'Notices', icon: Bell, color: 'text-rose-500' },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-start gap-2">
       <TooltipProvider delayDuration={0}>
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
               <Button
                variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                className="w-full justify-start md:justify-center md:h-12 md:w-12 rounded-full"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className={cn("mr-2 h-5 w-5 md:mr-0", item.color)} />
                  <span className="md:hidden">{item.label}</span>
                </Link>
              </Button>
            </TooltipTrigger>
             <TooltipContent side="right" className="md:block hidden">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </nav>
  );
}

function AppLayoutSkeleton() {
  return (
     <div className="flex flex-col min-h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-lg px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
           <div className="w-full flex-1">
            <Logo />
           </div>
           <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <main className="font-body antialiased flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
            <Skeleton className="w-full h-64" />
        </main>
      </div>
  )
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isClient && !loading && !user && !pathname.startsWith('/admin')) {
      router.push('/login');
    }
  }, [user, loading, router, pathname, isClient]);

  if (!isClient || loading) {
    return <AppLayoutSkeleton />;
  }
  
  if (!user) {
    return null; 
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header */}
       <header className="flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-lg px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-card/80 backdrop-blur-lg">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Logo />
              </div>
              <SidebarNav />
            </SheetContent>
          </Sheet>
           <div className="w-full flex-1 md:hidden text-center">
            <Logo className="inline-flex" />
          </div>
          <UserNav />
        </header>
        
       {/* Desktop Header */}
       <header className="hidden md:flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-lg px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
        <Logo />
        <div className="flex-1" />
        <UserNav />
      </header>

      {/* Desktop Dock */}
      <div className="hidden md:block fixed top-1/2 -translate-y-1/2 left-4 z-50">
        <div className="bg-card/80 backdrop-blur-lg border rounded-full p-2 shadow-lg">
            <SidebarNav />
        </div>
      </div>

      <main className="font-body antialiased flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto md:pl-24">
        {children}
      </main>

      <footer className="bg-card/80 backdrop-blur-lg mt-auto p-4 text-center text-card-foreground md:pl-24">
        <p className="font-bold">Senath Sethmika</p>
        <p className="font-medium text-primary">විද්‍යාවේ හදගැස්ම</p>
        <div className="flex justify-center gap-4 mt-2 text-sm">
            <a href="tel:0760250623" className="hover:underline">076 025 0623</a>
            <a href="tel:0720250621" className="hover:underline">072 025 0621</a>
        </div>
      </footer>
    </div>
  );
}
