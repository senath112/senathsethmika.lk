import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

const courses = [
  {
    title: 'Advanced Genetics',
    description: 'Explore the cutting-edge of genetic research and technology.',
    image: 'https://picsum.photos/600/400?random=1',
    aiHint: 'science genetics'
  },
  {
    title: 'Organic Chemistry II',
    description: 'Deep dive into complex organic reactions and synthesis.',
    image: 'https://picsum.photos/600/400?random=2',
    aiHint: 'science chemistry'
  },
  {
    title: 'Quantum Physics',
    description: 'Unravel the mysteries of the universe at the subatomic level.',
    image: 'https://picsum.photos/600/400?random=3',
    aiHint: 'science physics'
  },
  {
    title: 'Cellular Biology',
    description: 'A comprehensive study of cell structure, function, and signaling.',
    image: 'https://picsum.photos/600/400?random=4',
    aiHint: 'science biology'
  },
    {
    title: 'Environmental Science',
    description: 'Understand the interactions between physical, chemical, and biological components of the environment.',
    image: 'https://picsum.photos/600/400?random=5',
    aiHint: 'science environment'
  },
  {
    title: 'Astrophysics',
    description: 'Study the physical nature of stars, galaxies, and the cosmos.',
    image: 'https://picsum.photos/600/400?random=6',
    aiHint: 'science space'
  },
];

export default function CoursesPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Courses</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={course.image}
                alt={course.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={course.aiHint}
              />
            </div>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
              <Button className="w-full">Enroll Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
