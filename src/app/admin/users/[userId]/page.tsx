"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function UserPage({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    userRoles: { roleId: number }[];
  } | null>(null);
  const [allRoles, setAllRoles] = useState<{ id: number; name: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/admin/users/${params.userId}`);
      const data = await response.json();
      setUser(data);
      setSelectedRoles(
        data.userRoles.map((ur: { roleId: number }) => ur.roleId)
      );
    };

    const fetchRoles = async () => {
      const response = await fetch("/api/admin/roles");
      const data = await response.json();
      setAllRoles(data);
    };

    fetchUser();
    fetchRoles();
  }, [params.userId]);

  const handleRoleChange = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await fetch(`/api/admin/users/${params.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roles: selectedRoles,
      }),
    });
    router.push("/admin/users");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div className="mb-4">
          <Label>Roles</Label>
          <Select
            onValueChange={(value) => handleRoleChange(Number(value))}
            value={selectedRoles[0]?.toString() || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {allRoles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}