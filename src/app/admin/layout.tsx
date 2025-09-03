
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Users,
  Settings,
  LayoutDashboard,
  Menu,
  BookOpen,
  ClipboardCheck,
  Cpu,
  QrCode,
  FileQuestion,
  Megaphone,
  FileText,
  BarChart2,
} from 'lucide-react';
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";


const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/enrollments', label: 'Enrollments', icon: ClipboardCheck },
  { href: '/admin/notices', label: 'Notices', icon: Megaphone },
  { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
  { href: '/admin/ai', label: 'AI', icon: Cpu },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.href}
          variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
          className="justify-start"
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <SidebarNav />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Logo />
                </Link>
                <SidebarNav />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search bar here if needed */}
          </div>
          <UserNav />
        </header>
        <main className="font-body antialiased flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
