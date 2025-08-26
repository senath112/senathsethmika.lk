
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeLecture } from '@/ai/flows/lecture-summary';

export default function AIPlaygroundPage() {
  const [lectureContent, setLectureContent] = useState('');
  const [confusingSections, setConfusingSections] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!lectureContent || !confusingSections) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide both lecture content and confusing sections.',
      });
      return;
    }

    setIsLoading(true);
    setSummary('');

    try {
      const result = await summarizeLecture({
        lectureContent,
        confusingSections,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error summarizing lecture:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description:
          'An error occurred while summarizing the lecture. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">AI Playground</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lecture Summarizer</CardTitle>
            <CardDescription>
              This tool uses AI to summarize confusing parts of a lecture based
              on student feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lecture-content">Lecture Content</Label>
              <Textarea
                id="lecture-content"
                value={lectureContent}
                onChange={(e) => setLectureContent(e.target.value)}
                placeholder="Paste the full lecture transcript or content here."
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confusing-sections">Confusing Sections</Label>
              <Textarea
                id="confusing-sections"
                value={confusingSections}
                onChange={(e) => setConfusingSections(e.target.value)}
                placeholder="Describe the parts students found confusing. e.g., 'The explanation of mitosis from 10:30 to 12:00 was unclear.'"
                className="min-h-[75px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button onClick={handleSummarize} disabled={isLoading}>
              {isLoading ? 'Summarizing...' : 'Summarize'}
            </Button>
            {summary && (
              <Card className="w-full bg-muted/50">
                <CardHeader>
                  <CardTitle>AI-Generated Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{summary}</p>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
