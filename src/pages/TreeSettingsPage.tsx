import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { TreeForm } from '@/components/forms/TreeForm';
import { useTree, useTrees } from '@/hooks/useTrees';
import { useToast } from '@/hooks/use-toast';
import { TreeFormData } from '@/lib/validation';

export default function TreeSettingsPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { data: tree, isLoading } = useTree(treeId);
  const { updateTree, deleteTree } = useTrees();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSubmit = async (data: TreeFormData) => {
    if (!treeId) return;
    
    setIsUpdating(true);
    try {
      await updateTree.mutateAsync({ id: treeId, ...data });
      toast({ title: 'Settings saved!' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update settings',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!treeId) return;

    try {
      await deleteTree.mutateAsync(treeId);
      toast({ title: 'Tree deleted' });
      navigate('/app');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete tree',
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout requireAuth>
        <div className="container max-w-2xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-64 rounded bg-muted" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!tree) {
    return (
      <AppLayout requireAuth>
        <div className="container py-8 text-center">
          <h1 className="font-serif text-2xl font-bold">Tree not found</h1>
          <Link to="/app">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const shareUrl = tree.visibility === 'unlisted'
    ? `${window.location.origin}/u/${tree.slug}?share=${tree.share_id}`
    : tree.visibility === 'public'
    ? `${window.location.origin}/t/${tree.slug}`
    : null;

  return (
    <AppLayout requireAuth>
      <div className="container max-w-2xl py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to={`/app/tree/${treeId}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Tree Settings</h1>
            <p className="text-muted-foreground">{tree.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">General</CardTitle>
              <CardDescription>Update your tree's name and visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <TreeForm
                tree={tree}
                onSubmit={handleSubmit}
                isLoading={isUpdating}
                submitLabel="Save changes"
              />
            </CardContent>
          </Card>

          {/* Share Link */}
          {shareUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Share Link</CardTitle>
                <CardDescription>
                  {tree.visibility === 'unlisted'
                    ? 'Anyone with this link can view your tree'
                    : 'Your tree is publicly accessible at this URL'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast({ title: 'Link copied!' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="font-serif text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete this tree and all its data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Tree
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{tree.name}"?</AlertDialogTitle>
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
