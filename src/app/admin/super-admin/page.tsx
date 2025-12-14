import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SuperAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Super Admin Tools</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Advanced system settings and tools available only to Super Admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Placeholder for super admin specific tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
