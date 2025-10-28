import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if authenticated
    if (status === "authenticated") {
      router.push("/dashboard");
    }
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
