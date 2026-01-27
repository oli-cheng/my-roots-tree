import { useParams, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FamilyTreeView } from '@/components/tree/FamilyTreeView';
import { useUnlistedTree } from '@/hooks/useTrees';
import { usePeople, useRelationships } from '@/hooks/usePeople';

export default function UnlistedTreePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const shareId = searchParams.get('share');
  
  const { data: tree, isLoading: treeLoading, error } = useUnlistedTree(slug, shareId || undefined);
  const { data: people = [], isLoading: peopleLoading } = usePeople(tree?.id);
  const { data: relationships = [] } = useRelationships(tree?.id);

  const isLoading = treeLoading || peopleLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-64 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tree || !shareId) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
              Invalid or Expired Link
            </h1>
            <p className="mt-2 text-muted-foreground">
              This family tree link is no longer valid or the tree has been made private.
            </p>
            <Link to="/">
              <Button className="mt-6">Go Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        {/* Tree Info */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground mb-4">
            Unlisted tree • Shared via link
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">{tree.name}</h1>
          {tree.description && (
            <p className="mt-2 text-muted-foreground max-w-2xl">{tree.description}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {people.length} {people.length === 1 ? 'person' : 'people'} in this tree
          </p>
        </div>

        {/* Tree View */}
        <FamilyTreeView
          people={people}
          relationships={relationships}
          isEditable={false}
        />
      </main>
      <Footer />
    </div>
  );
}
