import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Welcome to the Rental Application Portal
          </CardTitle>
          <CardDescription className="text-center">
            The easiest way to manage your rental applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="mb-4">
            Click the button below to go to the admin dashboard.
          </p>
          <Link href="/admin">
            <Button>Go to Admin Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}