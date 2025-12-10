import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <aside className="md:col-span-1">
        <Card>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin">Dashboard</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/forms">Application Forms</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/applications">Applications</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </Card>
      </aside>
      <main className="md:col-span-3">
        <Card>
          <div className="p-4">{children}</div>
        </Card>
      </main>
    </div>
  );
}
