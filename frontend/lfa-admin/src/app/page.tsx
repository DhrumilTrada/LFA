'use client';

import Link from 'next/link';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">LFA Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">Welcome, {user?.name}</span>
                  <Link
                    href="/gallery"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Gallery
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              LFA Admin Dashboard
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage your LFA website content with ease
            </p>

            {isAuthenticated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Link
                  href="/gallery"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">Gallery Management</h3>
                  <p className="text-gray-600">
                    Upload, organize, and manage gallery images
                  </p>
                </Link>

                <div className="bg-white p-6 rounded-lg shadow opacity-50">
                  <h3 className="text-xl font-semibold mb-2">More Features</h3>
                  <p className="text-gray-600">
                    Additional modules coming soon...
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please log in to access the admin features
                </p>
                <Link
                  href="/login"
                  className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-600"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
