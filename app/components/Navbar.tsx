import Link from 'next/link';

import SignOutButton from './SignOutButton';

interface NavbarProps {
  email?: string | null;
  showUploadLink?: boolean;
}

export default function Navbar({ email, showUploadLink }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900 hover:text-gray-600 transition-colors"
        >
          Almost Crackd
        </Link>

        {email && (
          <div className="flex items-center gap-3 min-w-0">
            {showUploadLink && (
              <Link
                href="/protected/upload"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </Link>
            )}
            <span className="hidden md:block text-sm text-gray-400 truncate max-w-48">
              {email}
            </span>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}
