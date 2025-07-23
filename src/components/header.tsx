import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { BarChart2 } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Icons.logo className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          <span className="font-bold text-lg sm:text-xl font-headline group-hover:text-primary transition-colors">
            KidneyScan AI
          </span>
        </Link>
        <nav>
          <Button asChild variant="ghost">
            <Link href="/analytics">
              <BarChart2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
