import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PersonForm } from '@/components/forms/PersonForm';
import { RelationshipDialog } from '@/components/dialogs/RelationshipDialog';
import { usePerson, usePeople, useRelationships, usePersonMutations, useRelationshipMutations } from '@/hooks/usePeople';
import { useTree } from '@/hooks/useTrees';
import { useToast } from '@/hooks/use-toast';
import { Person, Relationship, getFullName } from '@/lib/types';
import { PersonFormData } from '@/lib/validation';
import ReactMarkdown from 'react-markdown';

export default function PersonEditorPage() {
  const { treeId, personId } = useParams<{ treeId: string; personId: string }>();
  const navigate = useNavigate();
  const { data: tree } = useTree(treeId);
  const { data: person, isLoading: personLoading } = usePerson(personId);
  const { data: people = [] } = usePeople(treeId);
  const { data: relationships = [] } = useRelationships(treeId);
  const { updatePerson, deletePerson } = usePersonMutations(treeId || '');
  const { deleteRelationship } = useRelationshipMutations(treeId || '');
  const { toast } = useToast();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);

  const handleSubmit = async (data: PersonFormData) => {
    if (!personId) return;
    
    setIsUpdating(true);
    try {
      await updatePerson.mutateAsync({ id: personId, ...data });
      toast({ title: 'Profile saved!' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!personId) return;

    try {
      await deletePerson.mutateAsync(personId);
      toast({ title: 'Person deleted' });
      navigate(`/app/tree/${treeId}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete person',
      });
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      await deleteRelationship.mutateAsync(relationshipId);
      toast({ title: 'Relationship removed' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove relationship',
      });
    }
  };

  // Get relationships for this person
  const personRelationships = relationships.filter(
    r => r.from_person_id === personId || r.to_person_id === personId
  );

  if (personLoading) {
    return (
      <AppLayout requireAuth>
        <div className="container max-w-3xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!person) {
    return (
      <AppLayout requireAuth>
        <div className="container py-8 text-center">
          <h1 className="font-serif text-2xl font-bold">Person not found</h1>
          <Link to={`/app/tree/${treeId}`}>
            <Button className="mt-4">Back to Tree</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requireAuth>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to={`/app/tree/${treeId}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {getFullName(person)}
            </h1>
            <p className="text-muted-foreground">{tree?.name}</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="biography">Biography</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Edit Profile</CardTitle>
                <CardDescription>Update personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonForm
                  person={person}
                  onSubmit={handleSubmit}
                  isLoading={isUpdating}
                  submitLabel="Save changes"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">Relationships</h3>
              <Button onClick={() => setShowAddRelationship(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {personRelationships.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No relationships added yet</p>
                  <Button onClick={() => setShowAddRelationship(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add relationship
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {personRelationships.map(rel => (
                  <RelationshipCard
                    key={rel.id}
                    relationship={rel}
                    currentPersonId={personId!}
                    people={people}
                    onDelete={() => handleDeleteRelationship(rel.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="biography">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Full Biography</CardTitle>
                <CardDescription>Preview of the biography (Markdown)</CardDescription>
              </CardHeader>
              <CardContent>
                {person.bio_full_md ? (
                  <div className="prose-heritage">
                    <ReactMarkdown>{person.bio_full_md}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No biography written yet. Edit in the Profile tab.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="mt-8 border-destructive/50">
          <CardHeader>
            <CardTitle className="font-serif text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete this person</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Person
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {getFullName(person)}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All relationships involving this person will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Relationship Dialog */}
      {treeId && (
        <RelationshipDialog
          open={showAddRelationship}
          onOpenChange={setShowAddRelationship}
          treeId={treeId}
          fromPersonId={personId || null}
          people={people}
        />
      )}
    </AppLayout>
  );
}

function RelationshipCard({
  relationship,
  currentPersonId,
  people,
  onDelete,
}: {
  relationship: Relationship;
  currentPersonId: string;
  people: Person[];
  onDelete: () => void;
}) {
  const isFrom = relationship.from_person_id === currentPersonId;
  const otherPersonId = isFrom ? relationship.to_person_id : relationship.from_person_id;
  const otherPerson = people.find(p => p.id === otherPersonId);

  const relationshipLabels: Record<string, { from: string; to: string }> = {
    'parent-child': { from: 'Parent of', to: 'Child of' },
    'spouse': { from: 'Spouse', to: 'Spouse' },
    'partner': { from: 'Partner', to: 'Partner' },
    'adoptive': { from: 'Adoptive parent of', to: 'Adopted by' },
    'guardian': { from: 'Guardian of', to: 'Ward of' },
  };

  const label = isFrom
    ? relationshipLabels[relationship.type]?.from
    : relationshipLabels[relationship.type]?.to;

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium text-foreground">
            {otherPerson ? getFullName(otherPerson) : 'Unknown'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}
