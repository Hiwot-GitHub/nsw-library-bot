import { Suspense } from "react";
import Chat from "@/components/Chat";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen text-gray-500">
          Loading library chat assistant...
        </div>
      }>
        <Chat />
      </Suspense>
    </main>
  );
}