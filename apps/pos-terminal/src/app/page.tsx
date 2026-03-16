import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // TODO: Task 10 will build the full POS UI at /pos
  // For now, show a placeholder
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">POS Terminal</h1>
        <p className="text-gray-600">
          Welcome, {session.user?.name || session.user?.email}
        </p>
        <p className="text-sm text-gray-400">
          POS interface coming in Task 10
        </p>
      </div>
    </div>
  );
}
