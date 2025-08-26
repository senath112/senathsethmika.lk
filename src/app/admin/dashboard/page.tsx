
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, BarChart } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboardPage() {
  const [studentCount, setStudentCount] = useState<number | string>("Loading...");
  const [courseCount, setCourseCount] = useState<number | string>("Loading...");

  useEffect(() => {
    async function fetchData() {
      const studentSnapshot = await getCountFromServer(collection(db, "students"));
      setStudentCount(studentSnapshot.data().count);
      
      const courseSnapshot = await getCountFromServer(collection(db, "courses"));
      setCourseCount(courseSnapshot.data().count);
    }
    fetchData();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{studentCount}</div>
                <p className="text-xs text-muted-foreground">Registered on the platform</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{courseCount}</div>
                <p className="text-xs text-muted-foreground">Available for enrollment</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">87.5%</div>
                <p className="text-xs text-muted-foreground">Weekly average (demo data)</p>
            </CardContent>
        </Card>
      </div>
       <div className="grid gap-4 mt-4">
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent platform events.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No recent activity to display.</p>
            </CardContent>
        </Card>
       </div>
    </>
  );
}
