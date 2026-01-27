import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User } from 'lucide-react';
import { Person, getFullName, getLifespan, isDeceased } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PersonNodeProps {
  data: {
    person: Person;
    onClick: (person: Person) => void;
    selected?: boolean;
  };
}

export const PersonNode = memo(function PersonNode({ data }: PersonNodeProps) {
  const { person, onClick, selected } = data;
  const fullName = getFullName(person);
  const lifespan = getLifespan(person);
  const deceased = isDeceased(person);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-tree-edge !bg-background"
      />
      <div
        className={cn(
          'tree-node cursor-pointer px-4 py-3 min-w-[160px] max-w-[220px]',
          selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
        onClick={() => onClick(person)}
      >
        <div className="flex items-center gap-3">
          {person.avatar_url ? (
            <img
              src={person.avatar_url}
              alt={fullName}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border border-border',
              person.sex === 'M' && 'bg-blue-100 text-blue-700',
              person.sex === 'F' && 'bg-pink-100 text-pink-700',
              (person.sex === 'X' || person.sex === 'U') && 'bg-muted text-muted-foreground',
            )}>
              <User className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-serif font-medium text-sm truncate text-foreground',
              deceased && 'text-muted-foreground'
            )}>
              {fullName}
            </p>
            {lifespan && (
              <p className="text-xs text-muted-foreground">{lifespan}</p>
            )}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-tree-edge !bg-background"
      />
    </>
  );
});
