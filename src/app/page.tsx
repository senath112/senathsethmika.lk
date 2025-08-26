import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.54-.88 2.86-1.94 3.68l2.64 2.56c2.5-2.3 3.88-5.74 3.88-9.88s-1.38-7.58-3.88-9.88l-2.64 2.56c1.06.82 1.7 2.13 1.94 3.68h-7.84zM2.87 14.2l-2.64 2.56C.08 14.34 0 11.9 0 9.88s.08-4.46.23-6.88l2.64 2.56c-.1.7-.15 1.42-.15 2.14s.05 1.44.15 2.14zM12 24c3.24 0 6.08-1.08 8.16-2.84l-2.64-2.56c-1.22.82-2.76 1.32-4.48 1.32s-3.26-.5-4.48-1.32L2.87 21.16C4.95 22.92 7.79 24 11.04 24l.96-.02z" fill="#4285F4" />
    <path d="M24 12c0-1.84-.16-3.6-.45-5.28H12.48v3.28h7.84c-.24 1.54-.88 2.86-1.94 3.68a6.5 6.5 0 0 1 -4.48 1.32c-3.58 0-6.48-2.9-6.48-6.48s2.9-6.48 6.48-6.48c1.98 0 3.54.82 4.64 1.84l2.56-2.56C18.08 1.08 15.24 0 12 0S4.95 1.08 2.87 2.84l2.64 2.56C6.15 4.04 7.4 3.52 9.52 3.52c3.58 0 6.48 2.9 6.48 6.48s-2.9 6.48-6.48 6.48c-2.12 0-3.37-.52-4.02-1.24l-2.64 2.56C5.45 20.92 8.29 22 11.04 22l.96-.02c3.24 0 6.08-1.08 8.16-2.84a6.5 6.5 0 0 1 -4.48 -1.32c1.06-.82 1.7-2.13 1.94-3.68H12.48V10.92z" fill="#EA4335" />
    <path d="M12.48 10.92v3.28h7.84c-.24 1.54-.88 2.86-1.94 3.68l2.64 2.56c2.5-2.3 3.88-5.74 3.88-9.88s-1.38-7.58-3.88-9.88l-2.64 2.56c1.06.82 1.7 2.13 1.94 3.68h-7.84z" fill="#FBBC05" />
    <path d="M2.87 14.2l-2.64 2.56C.08 14.34 0 11.9 0 9.88s.08-4.46.23-6.88l2.64 2.56c-.1.7-.15 1.42-.15 2.14s.05 1.44.15 2.14zM12 24c3.24 0 6.08-1.08 8.16-2.84l-2.64-2.56c-1.22.82-2.76 1.32-4.48 1.32s-3.26-.5-4.48-1.32L2.87 21.16C4.95 22.92 7.79 24 11.04 24l.96-.02z" fill="#34A853" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Atom className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Synapse Learning</CardTitle>
          <CardDescription>Welcome! Sign in to access your educational hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12 text-base" asChild>
              <Link href="/dashboard">
                <GoogleIcon className="mr-2 h-5 w-5" />
                Sign in with Google
              </Link>
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
