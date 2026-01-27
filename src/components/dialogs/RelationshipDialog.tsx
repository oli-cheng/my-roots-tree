import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Person, RelationshipType, getFullName } from '@/lib/types';
import { useRelationshipMutations } from '@/hooks/usePeople';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeId: string;
  fromPersonId: string | null;
  people: Person[];
}

const relationshipTypes: { value: RelationshipType; label: string; description: string }[] = [
  { value: 'parent-child', label: 'Parent → Child', description: 'From is parent, To is child' },
  { value: 'spouse', label: 'Spouse', description: 'Married partners' },
  { value: 'partner', label: 'Partner', description: 'Unmarried partners' },
  { value: 'adoptive', label: 'Adoptive Parent', description: 'From adopted To' },
  { value: 'guardian', label: 'Guardian', description: 'Legal guardian relationship' },
];

export function RelationshipDialog({
  open,
  onOpenChange,
  treeId,
  fromPersonId,
  people,
}: RelationshipDialogProps) {
  const [fromPerson, setFromPerson] = useState(fromPersonId || '');
  const [toPerson, setToPerson] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('parent-child');
  const [isLoading, setIsLoading] = useState(false);
  const { createRelationship } = useRelationshipMutations(treeId);
  const { toast } = useToast();

  // Update fromPerson when dialog opens with a specific person
  useState(() => {
    if (fromPersonId) {
      setFromPerson(fromPersonId);
    }
  });

  const handleSubmit = async () => {
    if (!fromPerson || !toPerson) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both people',
      });
      return;
    }

    if (fromPerson === toPerson) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot create relationship between the same person',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createRelationship.mutateAsync({
        from_person_id: fromPerson,
        to_person_id: toPerson,
        type: relationshipType,
      });
      toast({ title: 'Relationship added!' });
      onOpenChange(false);
      setFromPerson('');
      setToPerson('');
      setRelationshipType('parent-child');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create relationship',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableToPersons = people.filter(p => p.id !== fromPerson);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add Relationship</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Relationship Type</Label>
            <Select value={relationshipType} onValueChange={(v) => setRelationshipType(v as RelationshipType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({type.description})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Person</Label>
            <Select value={fromPerson} onValueChange={setFromPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {getFullName(person)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>To Person</Label>
            <Select value={toPerson} onValueChange={setToPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {availableToPersons.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {getFullName(person)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {relationshipType === 'parent-child' && fromPerson && toPerson && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              This will make <strong>{people.find(p => p.id === fromPerson)?.primary_given}</strong> a 
              parent of <strong>{people.find(p => p.id === toPerson)?.primary_given}</strong>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Relationship
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
