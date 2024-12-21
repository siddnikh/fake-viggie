import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Your protected content here */}
    </div>
  );
}
