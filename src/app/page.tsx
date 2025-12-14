import Image from "next/image";
import { Building, FileUser, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-[hsl(19_64%_49%)]">
              A unified property and asset management system.
            </h1>
            <p className="text-muted-foreground md:text-xl text-[hsl(0_0%_26%)]">
              This platform brings leasing, marketing, applications, and ongoing operations into one clean, modern interface. It includes a fully built-in rental application tool, allowing prospects to apply directly through the platform while property managers review, score, and track applications from an admin dashboard. The system also supports a lightweight lease-up marketing module where users can create listings, manage leads, and track interest throughout pre-leasing. Beyond leasing, the platform is designed to grow into a broader asset-management toolkit, giving teams the ability to organize property data, manage units, track tasks, store documents, and streamline communication between staff and residents. The goal is to replace scattered apps with one simple, intuitive platform that handles everything from first inquiry &rarr; application &rarr; approval &rarr; ongoing management, all in the same ecosystem.
            </p>
            <div className="pt-6">
              <Link href="/admin">
                <Button className="bg-[hsl(77_100%_26%)] hover:bg-[hsl(77_100%_20%)] text-white font-bold py-2 px-4 rounded">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src="/globe.svg"
              alt="Globe"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="py-12 md:py-24 lg:py-32">
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center space-y-2">
                    <FileUser className="w-16 h-16 text-[hsl(77_100%_26%)]" />
                    <h3 className="text-xl font-bold text-[hsl(19_64%_49%)]">Custom Forms</h3>
                    <p className="text-muted-foreground text-[hsl(0_0%_26%)]">
                        Create beautiful, custom application forms for each of your projects.
                    </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <LayoutDashboard className="w-16 h-16 text-[hsl(77_100%_26%)]" />
                    <h3 className="text-xl font-bold text-[hsl(19_64%_49%)]">Centralized Dashboard</h3>
                    <p className="text-muted-foreground text-[hsl(0_0%_26%)]">
                        Manage all your applications from a single, intuitive dashboard.
                    </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <Building className="w-16 h-16 text-[hsl(77_100%_26%)]" />
                    <h3 className="text-xl font-bold text-[hsl(19_64%_49%)]">Project-Based</h3>
                    <p className="text-muted-foreground text-[hsl(0_0%_26%)]">
                        Organize your application forms and submissions by project.
                    </p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}