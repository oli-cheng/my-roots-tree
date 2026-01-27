import { useParams, Link } from 'react-router-dom';
import { AlertCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FamilyTreeView } from '@/components/tree/FamilyTreeView';
import { usePublicTree } from '@/hooks/useTrees';
import { usePeople, useRelationships } from '@/hooks/usePeople';
import { useAuth } from '@/hooks/useAuth';

export default function PublicTreePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: tree, isLoading: treeLoading, error } = usePublicTree(slug);
  const { data: people = [], isLoading: peopleLoading } = usePeople(tree?.id);
  const { data: relationships = [] } = useRelationships(tree?.id);

  const isLoading = treeLoading || peopleLoading;
  const isOwner = user && tree && tree.owner_id === user.id;

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

  if (error || !tree) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
              Tree Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This family tree doesn't exist or is not publicly accessible.
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
        {/* Owner Banner */}
        {isOwner && (
          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <Edit className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You own this tree. Switch to edit mode to make changes.</span>
              <Link to={`/app/tree/${tree.id}`}>
                <Button size="sm" variant="outline" className="ml-4">
                  Edit Tree
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Tree Info */}
        <div className="mb-8">
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
