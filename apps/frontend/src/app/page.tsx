import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-primary-600">
          OmniBusiness AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Unified business management platform with AI capabilities.
          Manage everything from finance to marketing in one place.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
