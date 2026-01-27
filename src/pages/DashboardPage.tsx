import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TreeDeciduous, MoreVertical, Globe, EyeOff, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTrees } from '@/hooks/useTrees';
import { useToast } from '@/hooks/use-toast';
import { Tree } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const visibilityIcons = {
  private: EyeOff,
  unlisted: LinkIcon,
  public: Globe,
};

const visibilityLabels = {
  private: 'Private',
  unlisted: 'Unlisted',
  public: 'Public',
};

export default function DashboardPage() {
  const { trees, isLoading, deleteTree } = useTrees();
  const { toast } = useToast();
  const [treeToDelete, setTreeToDelete] = useState<Tree | null>(null);

  const handleDelete = async () => {
    if (!treeToDelete) return;

    try {
      await deleteTree.mutateAsync(treeToDelete.id);
      toast({
        title: 'Tree deleted',
        description: `"${treeToDelete.name}" has been permanently deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the tree. Please try again.',
      });
    }
    setTreeToDelete(null);
  };

  return (
    <AppLayout requireAuth>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">My Trees</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and build your family trees
            </p>
          </div>
          <Link to="/app/new-tree">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tree
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 w-32 rounded bg-muted" />
                  <div className="h-4 w-48 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-24 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trees.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TreeDeciduous className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                No trees yet
              </h3>
              <p className="mt-2 text-center text-muted-foreground max-w-sm">
                Create your first family tree to start documenting your family history
              </p>
              <Link to="/app/new-tree">
                <Button className="mt-6 gap-2">
                  <Plus className="h-4 w-4" />
                  Create your first tree
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trees.map(tree => {
              const VisibilityIcon = visibilityIcons[tree.visibility];
              return (
                <Card key={tree.id} className="group relative overflow-hidden transition-shadow hover:shadow-medium">
                  <Link to={`/app/tree/${tree.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                          {tree.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <VisibilityIcon className="h-3 w-3" />
                          <span>{visibilityLabels[tree.visibility]}</span>
                        </div>
                      </div>
                      {tree.description && (
                        <CardDescription className="line-clamp-2">
                          {tree.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(tree.updated_at), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/app/tree/${tree.id}/settings`}>
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {tree.visibility === 'public' && (
                        <DropdownMenuItem asChild>
                          <Link to={`/t/${tree.slug}`} target="_blank">
                            View public page
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          setTreeToDelete(tree);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!treeToDelete} onOpenChange={() => setTreeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{treeToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your family tree
              and all associated people, relationships, and photos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete tree
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
