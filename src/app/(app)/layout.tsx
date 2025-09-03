
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
  BarChart2,
  Store,
  Bot,
} from 'lucide-react';
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, bgColor: 'bg-sky-500 hover:bg-sky-600', iconColor: 'text-sky-500' },
  { href: '/lectures', label: 'My Lectures', icon: GraduationCap, bgColor: 'bg-emerald-500 hover:bg-emerald-600', iconColor: 'text-emerald-500' },
  { href: '/store', label: 'Store', icon: Store, bgColor: 'bg-blue-500 hover:bg-blue-600', iconColor: 'text-blue-500' },
  { href: '/documents', label: 'Documents', icon: FileText, bgColor: 'bg-amber-500 hover:bg-amber-600', iconColor: 'text-amber-500' },
  { href: '/analysis', label: 'Analysis', icon: BarChart2, bgColor: 'bg-indigo-500 hover:bg-indigo-600', iconColor: 'text-indigo-500' },
  { href: '/billing', label: 'Billing', icon: CreditCard, bgColor: 'bg-violet-500 hover:bg-violet-600', iconColor: 'text-violet-500' },
  { href: '/science-bot', label: 'Science Bot', icon: Bot, bgColor: 'bg-gray-500 hover:bg-gray-600', iconColor: 'text-gray-500' },
  { href: '/notices', label: 'Notices', icon: Bell, bgColor: 'bg-rose-500 hover:bg-rose-600', iconColor: 'text-rose-500' },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-2">
       <TooltipProvider delayDuration={0}>
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
               <Button
                variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                className={cn(
                    "w-full justify-center h-12 w-12 rounded-full text-white",
                    item.bgColor,
                    pathname.startsWith(item.href) && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            </TooltipTrigger>
             <TooltipContent side="right">
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
    <div className="relative flex flex-col min-h-screen">

      {/* Mobile Header - Floating Pill */}
       <header className="md:hidden fixed top-4 left-4 right-4 z-50 flex h-14 items-center justify-between gap-4 rounded-full border bg-card/80 backdrop-blur-lg px-4 shadow-lg">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-card/80 backdrop-blur-lg">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4 border-b pb-4">
                  <Logo />
              </div>
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        asChild
                    >
                        <Link href={item.href}>
                        <item.icon className={cn("mr-2 h-5 w-5", item.iconColor)} />
                        <span>{item.label}</span>
                        </Link>
                    </Button>
                ))}
            </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 text-center">
            <Logo className="inline-flex" />
          </div>
          <UserNav />
        </header>
        
       {/* Desktop Header - Floating Pill */}
       <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 h-16 items-center gap-8 rounded-full border bg-card/80 backdrop-blur-lg px-8 shadow-lg">
        <Logo />
        <div className="h-6 w-px bg-border" />
        <UserNav />
      </header>

      {/* Desktop Dock - Floating Pill */}
      <aside className="hidden md:block fixed top-1/2 -translate-y-1/2 left-4 z-50">
        <div className="bg-card/80 backdrop-blur-lg border rounded-full p-2 shadow-lg space-y-2">
            <SidebarNav />
        </div>
      </aside>

      <main className="font-body antialiased flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto md:pl-24 pt-24">
        {children}
      </main>

      <footer className="bg-card/80 backdrop-blur-lg mt-auto p-4 text-center text-card-foreground border-t">
        <p className="font-bold">Senath Sethmika</p>
        <p className="font-medium text-primary text-sm">විද්‍යාවේ හදගැස්ම</p>
         <div className="flex justify-center gap-4 mt-2 text-sm">
            <a href="tel:0760250623" className="hover:underline">076 025 0623</a>
            <a href="tel:0720250621" className="hover:underline">072 025 0621</a>
        </div>
      </footer>
    </div>
  );
}
