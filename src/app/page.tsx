
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 lg:px-6 border-b bg-card/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Atom className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Senath Sethmika.lk</h1>
        </div>
        <div className="space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Potential in Science
                  </h1>
                  <p className="text-xl font-medium text-primary">විද්‍යාවේ හදගැස්ම</p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join a modern educational hub designed for science class students. Access lectures, download materials, and track your progress with ease.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                     <Link href="/signup">Get Started <ArrowRight className="ml-2" /></Link>
                  </Button>
                   <Button size="lg" variant="secondary" asChild>
                     <Link href="/courses">Explore Courses</Link>
                   </Button>
                </div>
              </div>
                <Image
                    src="https://picsum.photos/600/400"
                    width="600"
                    height="400"
                    alt="Hero"
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                    data-ai-hint="science education"
                />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features Built for Success</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Our platform provides everything you need to excel in your studies, from high-quality lectures to personalized progress tracking.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
                    <FeatureCard title="On-Demand Lectures" description="Never miss a class. Watch and re-watch recorded lectures at your convenience, with a 3-view limit to encourage focused learning." />
                    <FeatureCard title="Secure Documents" description="Download course materials, syllabi, and notes. PDFs are automatically watermarked with your student ID for security." />
                    <FeatureCard title="Digital ID Card" description="Access your personalized digital student ID card with a unique QR code, ready to download and use." />
                    <FeatureCard title="Course Enrollment" description="Easily browse and enroll in available courses. Get instant access to approved course materials." />
                    <FeatureCard title="AI-Powered Summaries" description="Struggling with a concept? Use our AI tool to get summaries of confusing lecture parts, helping you grasp complex topics." />
                    <FeatureCard title="Admin Dashboard" description="A comprehensive backend for administrators to manage courses, students, enrollments, and platform settings." />
                </div>
            </div>
        </section>
      </main>

       <footer className="bg-card/80 backdrop-blur-lg mt-auto p-4 text-center text-card-foreground">
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


function FeatureCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="grid gap-1">
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}
