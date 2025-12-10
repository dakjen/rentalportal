import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Rental Application Portal</h1>
      <p className="mt-4">
        <Link href="/admin" className="text-blue-500">
          Go to Admin Dashboard
        </Link>
      </p>
    </div>
  );
}