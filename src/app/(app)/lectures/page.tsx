import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LectureSummaryForm } from "./lecture-summary-form";

export default function LecturesPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Lectures</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Biology 101: The Cell</CardTitle>
              <CardDescription>Recorded on 2024-05-15</CardDescription>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  className="rounded-lg w-full h-full"
                  src="https://www.youtube.com/embed/8vyW4h6W22s"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </AspectRatio>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <LectureSummaryForm />
        </div>
      </div>
    </>
  );
}
