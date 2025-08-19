"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <img
          src="/404-page-notfound.svg"
          alt="Page Not Found"
          className="mx-auto mb-6 h-48 w-48"
          />

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Oops! Page not found
        </h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
          The page you are looking for might have been moved, deleted, or you may have mistyped the address.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiHome className="h-4 w-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}