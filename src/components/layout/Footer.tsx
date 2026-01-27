import { TreeDeciduous, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <TreeDeciduous className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-semibold text-foreground">
              Family Roots
            </span>
          </Link>
          
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Built with <Heart className="h-3 w-3 text-primary" /> for preserving family memories
          </p>
        </div>
      </div>
    </footer>
  );
}
