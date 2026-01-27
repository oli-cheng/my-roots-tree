import { Link } from 'react-router-dom';
import { X, Edit, Plus, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Person, Relationship, getFullName, getLifespan, isDeceased } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PersonSidePanelProps {
  person: Person;
  people: Person[];
  relationships: Relationship[];
  isEditable?: boolean;
  treeId?: string;
  onClose: () => void;
  onAddRelationship?: (fromPersonId: string) => void;
}

export function PersonSidePanel({
  person,
  people,
  relationships,
  isEditable = false,
  treeId,
  onClose,
  onAddRelationship,
}: PersonSidePanelProps) {
  // Find related people
  const getRelatedPeople = (type: 'parents' | 'children' | 'spouses') => {
    return relationships
      .filter(rel => {
        if (type === 'parents') {
          return rel.to_person_id === person.id && rel.type === 'parent-child';
        }
        if (type === 'children') {
          return rel.from_person_id === person.id && rel.type === 'parent-child';
        }
        if (type === 'spouses') {
          return (
            (rel.from_person_id === person.id || rel.to_person_id === person.id) &&
            (rel.type === 'spouse' || rel.type === 'partner')
          );
        }
        return false;
      })
      .map(rel => {
        if (type === 'parents') {
          return people.find(p => p.id === rel.from_person_id);
        }
        if (type === 'children') {
          return people.find(p => p.id === rel.to_person_id);
        }
        if (type === 'spouses') {
          const otherId = rel.from_person_id === person.id ? rel.to_person_id : rel.from_person_id;
          return people.find(p => p.id === otherId);
        }
        return undefined;
      })
      .filter((p): p is Person => !!p);
  };

  const parents = getRelatedPeople('parents');
  const children = getRelatedPeople('children');
  const spouses = getRelatedPeople('spouses');

  const deceased = isDeceased(person);
  const lifespan = getLifespan(person);

  return (
    <div className="w-80 flex-shrink-0 rounded-lg border border-border bg-card shadow-medium overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-serif font-semibold text-foreground">Profile</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Avatar and name */}
        <div className="flex items-center gap-3">
          {person.avatar_url ? (
            <img
              src={person.avatar_url}
              alt={getFullName(person)}
              className="h-16 w-16 rounded-full object-cover border border-border"
            />
          ) : (
            <div className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full border border-border',
              person.sex === 'M' && 'bg-blue-100 text-blue-700',
              person.sex === 'F' && 'bg-pink-100 text-pink-700',
              (person.sex === 'X' || person.sex === 'U') && 'bg-muted text-muted-foreground',
            )}>
              <User className="h-8 w-8" />
            </div>
          )}
          <div>
            <h4 className={cn(
              'font-serif text-lg font-semibold',
              deceased ? 'text-muted-foreground' : 'text-foreground'
            )}>
              {getFullName(person)}
            </h4>
            {lifespan && (
              <p className="text-sm text-muted-foreground">{lifespan}</p>
            )}
          </div>
        </div>

        {/* Vital info */}
        {(person.birth_date || person.birth_place) && (
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Born</p>
              <p className="text-foreground">
                {[person.birth_date, person.birth_place].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>
        )}

        {(person.death_date || person.death_place) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Died</p>
              <p className="text-foreground">
                {[person.death_date, person.death_place].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>
        )}

        {/* Short bio */}
        {person.bio_short && (
          <p className="text-sm text-muted-foreground">{person.bio_short}</p>
        )}

        {/* Relationships */}
        <div className="space-y-3">
          {parents.length > 0 && (
            <div>
              <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Parents
              </h5>
              <div className="space-y-1">
                {parents.map(p => (
                  <p key={p.id} className="text-sm text-foreground">{getFullName(p)}</p>
                ))}
              </div>
            </div>
          )}

          {spouses.length > 0 && (
            <div>
              <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Spouse/Partner
              </h5>
              <div className="space-y-1">
                {spouses.map(p => (
                  <p key={p.id} className="text-sm text-foreground">{getFullName(p)}</p>
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                Children
              </h5>
              <div className="space-y-1">
                {children.map(p => (
                  <p key={p.id} className="text-sm text-foreground">{getFullName(p)}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          {isEditable && treeId ? (
            <>
              <Link to={`/app/tree/${treeId}/person/${person.id}`} className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Edit className="h-4 w-4" />
                  Edit profile
                </Button>
              </Link>
              {onAddRelationship && (
                <Button
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={() => onAddRelationship(person.id)}
                >
                  <Plus className="h-4 w-4" />
                  Add relationship
                </Button>
              )}
            </>
          ) : (
            <Link to={`/t/${person.tree_id}/person/${person.id}`} className="block">
              <Button variant="outline" className="w-full">
                View full profile
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
