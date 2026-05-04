import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = session!.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    workspaceId?: string | null;
    role?: string | null;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <form action="/api/auth/signout" method="post">
          <input type="hidden" name="callbackUrl" value="/login" />
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </div>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white">Logged in as</CardTitle>
          <CardDescription>Your current session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-300">
          <Row label="Name" value={user.name ?? "—"} />
          <Row label="Email" value={user.email ?? "—"} />
          <Row label="User ID" value={user.id} />
          <Row label="Workspace ID" value={user.workspaceId ?? "—"} />
          <Row label="Role" value={user.role ?? "—"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-800 py-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono text-gray-200">{value}</span>
    </div>
  );
}
