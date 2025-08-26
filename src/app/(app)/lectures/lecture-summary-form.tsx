"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getLectureSummary } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, Sparkles, Terminal } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  message: null,
  errors: null,
  summary: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export function LectureSummaryForm() {
  const [state, formAction] = useFormState(getLectureSummary, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== "Validation failed." && !state.errors) {
       if (state.message === "Summary generated successfully.") {
        // No toast for success, summary is displayed
       } else {
         toast({
           variant: "destructive",
           title: "Error",
           description: state.message,
         });
       }
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>AI Lecture Summary</CardTitle>
          <CardDescription>
            Confused about a part of the lecture? Paste the content and describe the confusing parts to get a summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lectureContent">Lecture Content</Label>
            <Textarea
              id="lectureContent"
              name="lectureContent"
              placeholder="Paste the lecture transcript or notes here..."
              rows={8}
            />
            {state.errors?.lectureContent && (
              <p className="text-sm font-medium text-destructive">{state.errors.lectureContent[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confusingSections">Confusing Sections</Label>
            <Textarea
              id="confusingSections"
              name="confusingSections"
              placeholder="e.g., 'The part about mitochondrial DNA was unclear.'"
              rows={3}
            />
             {state.errors?.confusingSections && (
              <p className="text-sm font-medium text-destructive">{state.errors.confusingSections[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
      
      {state.summary && (
        <Alert className="mt-4">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Summary</AlertTitle>
          <AlertDescription>
            {state.summary}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
