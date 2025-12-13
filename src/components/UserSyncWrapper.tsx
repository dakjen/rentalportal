"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  console.log("UserSyncWrapper: isLoaded =", isLoaded, ", isSignedIn =", isSignedIn, ", user =", user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log("UserSyncWrapper: Attempting to sync user", user.id);
      fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error("UserSyncWrapper: Failed to sync user:", response.statusText);
          } else {
            console.log("UserSyncWrapper: User synced successfully.");
            // After successful sync, refresh the current page to re-run server components
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("UserSyncWrapper: Error syncing user:", error);
        });
    }
  }, [isLoaded, isSignedIn, user, router, pathname]);

  return <>{children}</>;
}
