import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Chess MCQ</CardTitle>
          <CardDescription className="text-center">
            Welcome to the Chess Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/login">
            <Button className="w-full">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="w-full">
              Sign Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
