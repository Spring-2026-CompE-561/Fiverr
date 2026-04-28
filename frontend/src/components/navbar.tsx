import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          GigLink
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/browse" className="text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/post"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Post Gig
          </Link>
        </nav>
      </div>
    </header>
  );
}
