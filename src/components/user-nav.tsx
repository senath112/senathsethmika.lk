
"use client"

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, LogOut, User } from "lucide-react"
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export function UserNav() {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState("Student Name");
  const [gender, setGender] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchStudentData() {
      if (user) {
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudentName(data.name || user.displayName || "Student Name");
          setGender(data.gender || "");
        } else {
          setStudentName(user.displayName || "Student Name");
        }
      }
    }
    fetchStudentData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  }

  const getAvatarUrl = () => {
      if (user?.photoURL) return user.photoURL;
      if (gender === 'Male') return `https://avatar.iran.liara.run/public/boy?username=${user?.uid}`;
      if (gender === 'Female') return `https://avatar.iran.liara.run/public/girl?username=${user?.uid}`;
      return `https://avatar.iran.liara.run/public?username=${user?.uid}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getAvatarUrl()} alt={studentName} data-ai-hint="person" />
            <AvatarFallback>{studentName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'S'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{studentName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "student@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
