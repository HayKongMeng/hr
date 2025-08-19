"use client"; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle } from 'react-icons/fi'; 

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <FiAlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Page Not Found
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}