import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-[#e8320a] mb-2">404</p>
        <h1 className="text-2xl font-black text-[#0f0f0f] mb-2">Page not found</h1>
        <p className="text-gray-400 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
