import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Settings, ChevronLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { FamilyTreeView } from '@/components/tree/FamilyTreeView';
import { PersonForm } from '@/components/forms/PersonForm';
import { RelationshipDialog } from '@/components/dialogs/RelationshipDialog';
import { useTree } from '@/hooks/useTrees';
import { usePeople, useRelationships, usePersonMutations } from '@/hooks/usePeople';
import { useToast } from '@/hooks/use-toast';
import { getFullName, getLifespan, Person } from '@/lib/types';
import { PersonFormData } from '@/lib/validation';
import { cn } from '@/lib/utils';

export default function TreeEditorPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { data: tree, isLoading: treeLoading } = useTree(treeId);
  const { data: people = [], isLoading: peopleLoading } = usePeople(treeId);
  const { data: relationships = [] } = useRelationships(treeId);
  const { createPerson } = usePersonMutations(treeId || '');
  const { toast } = useToast();

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [relationshipFromPerson, setRelationshipFromPerson] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = treeLoading || peopleLoading;

  const handleAddPerson = async (data: PersonFormData) => {
    setIsCreating(true);
    try {
      await createPerson.mutateAsync(data);
      toast({ title: 'Person added successfully!' });
      setShowAddPerson(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add person',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddRelationship = (fromPersonId: string) => {
    setRelationshipFromPerson(fromPersonId);
    setShowRelationshipDialog(true);
  };

  const filteredPeople = people.filter(person => {
    if (!searchQuery) return true;
    const fullName = getFullName(person).toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <AppLayout requireAuth>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!tree) {
    return (
      <AppLayout requireAuth>
        <div className="container py-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">Tree not found</h1>
          <Link to="/app">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requireAuth>
      <div className="container py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">{tree.name}</h1>
              <p className="text-sm text-muted-foreground">
                {people.length} {people.length === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tree.visibility === 'public' && (
              <Link to={`/t/${tree.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  View public page
                </Button>
              </Link>
            )}
            <Link to={`/app/tree/${treeId}/settings`}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tree" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
            <TabsTrigger value="people" className="gap-2">
              <Users className="h-4 w-4" />
              People
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tree">
            <FamilyTreeView
              people={people}
              relationships={relationships}
              isEditable
              treeId={treeId}
              onAddPerson={() => setShowAddPerson(true)}
              onAddRelationship={handleAddRelationship}
            />
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            {/* Search and add */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button onClick={() => setShowAddPerson(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Person
              </Button>
            </div>

            {/* People list */}
            {filteredPeople.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No matching people found' : 'No people in this tree yet'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddPerson(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add first person
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredPeople.map(person => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    treeId={treeId!}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Person Dialog */}
      <Dialog open={showAddPerson} onOpenChange={setShowAddPerson}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add Person</DialogTitle>
          </DialogHeader>
          <PersonForm
            onSubmit={handleAddPerson}
            isLoading={isCreating}
            submitLabel="Add Person"
          />
        </DialogContent>
      </Dialog>

      {/* Add Relationship Dialog */}
      {treeId && (
        <RelationshipDialog
          open={showRelationshipDialog}
          onOpenChange={setShowRelationshipDialog}
          treeId={treeId}
          fromPersonId={relationshipFromPerson}
          people={people}
        />
      )}
    </AppLayout>
  );
}

function PersonCard({ person, treeId }: { person: Person; treeId: string }) {
  const lifespan = getLifespan(person);
  
  return (
    <Link
      to={`/app/tree/${treeId}/person/${person.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-all hover:shadow-medium hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border border-border text-sm font-medium',
          person.sex === 'M' && 'bg-blue-100 text-blue-700',
          person.sex === 'F' && 'bg-pink-100 text-pink-700',
          (person.sex === 'X' || person.sex === 'U') && 'bg-muted text-muted-foreground',
        )}>
          {person.primary_given.charAt(0)}{person.primary_family.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {getFullName(person)}
          </p>
          {lifespan && (
            <p className="text-sm text-muted-foreground">{lifespan}</p>
          )}
        </div>
      </div>
      {person.bio_short && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {person.bio_short}
        </p>
      )}
    </Link>
  );
}
