import Link from "next/link";

export default function SiteHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-base"
          >
            😄
          </span>
          Humor Project
        </Link>
        <nav className="flex min-w-0 items-center gap-1 sm:gap-2">
          {children}
        </nav>
      </div>
    </header>
  );
}
