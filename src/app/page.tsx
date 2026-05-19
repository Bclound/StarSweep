import { Dashboard } from "@/components/Dashboard";

export default function Home({ searchParams }: { searchParams?: { auth?: string } }) {
  return <Dashboard authFailed={searchParams?.auth === "failed"} />;
}
