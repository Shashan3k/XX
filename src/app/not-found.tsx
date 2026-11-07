import Link from "next/link";
import { PanasunaLogo } from "@/components/brand/PanasunaLogo";

/** Several header routes are still being built; keep their 404 on-brand and one tap from home. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <PanasunaLogo variant="seal" className="size-24" />
      <h1 className="text-4xl text-foreground">
        <span lang="en">This page is being prepared.</span>
      </h1>
      <p className="max-w-md text-muted-foreground" lang="ta">
        இந்தப் பக்கம் தயாராகி வருகிறது.
      </p>
      <Link href="/" className="text-gold-ink underline underline-offset-4 hover:text-foreground">
        Back to home · முகப்புக்குத் திரும்ப
      </Link>
    </main>
  );
}
