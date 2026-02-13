import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Person, Relationship } from '@/lib/types';
import { PersonNode } from './PersonNode';
import { PersonSidePanel } from './PersonSidePanel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Maximize2 } from 'lucide-react';

interface FamilyTreeViewProps {
  people: Person[];
  relationships: Relationship[];
  isEditable?: boolean;
  treeId?: string;
  onAddPerson?: () => void;
  onAddRelationship?: (fromPersonId: string) => void;
}

const nodeTypes = {
  person: PersonNode,
};

export function FamilyTreeView({
  people,
  relationships,
  isEditable = false,
  treeId,
  onAddPerson,
  onAddRelationship,
}: FamilyTreeViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [rootPersonId, setRootPersonId] = useState<string | undefined>(
    people[0]?.id
  );

  const handleNodeClick = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (people.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Build a hierarchical layout
    const nodeMap = new Map<string, { person: Person; level: number; order: number }>();
    const visited = new Set<string>();
    const levels: Map<number, Person[]> = new Map();

    // Find parent-child relationships
    const parentChildRels = relationships.filter(r => r.type === 'parent-child');
    const childToParents = new Map<string, string[]>();
    const parentToChildren = new Map<string, string[]>();

    parentChildRels.forEach(rel => {
      const parents = childToParents.get(rel.to_person_id) || [];
      parents.push(rel.from_person_id);
      childToParents.set(rel.to_person_id, parents);

      const children = parentToChildren.get(rel.from_person_id) || [];
      children.push(rel.to_person_id);
      parentToChildren.set(rel.from_person_id, children);
    });

    // Start from root or first person
    const root = rootPersonId ? people.find(p => p.id === rootPersonId) : people[0];
    if (!root) return { nodes: [], edges: [] };

    // BFS to assign levels
    const queue: { personId: string; level: number }[] = [{ personId: root.id, level: 0 }];
    
    // Also go up to parents
    const rootParents = childToParents.get(root.id) || [];
    rootParents.forEach(parentId => {
      queue.push({ personId: parentId, level: -1 });
    });

    while (queue.length > 0) {
      const { personId, level } = queue.shift()!;
      if (visited.has(personId)) continue;
      visited.add(personId);

      const person = people.find(p => p.id === personId);
      if (!person) continue;

      const levelPeople = levels.get(level) || [];
      levelPeople.push(person);
      levels.set(level, levelPeople);

      nodeMap.set(personId, { person, level, order: levelPeople.length - 1 });

      // Add children
      const children = parentToChildren.get(personId) || [];
      children.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ personId: childId, level: level + 1 });
        }
      });

      // Add parents going up
      const parents = childToParents.get(personId) || [];
      parents.forEach(parentId => {
        if (!visited.has(parentId)) {
          queue.push({ personId: parentId, level: level - 1 });
        }
      });
    }

    // Add any unvisited people
    people.forEach(person => {
      if (!visited.has(person.id)) {
        const maxLevel = Math.max(...Array.from(levels.keys()), 0);
        const levelPeople = levels.get(maxLevel + 1) || [];
        levelPeople.push(person);
        levels.set(maxLevel + 1, levelPeople);
        nodeMap.set(person.id, { person, level: maxLevel + 1, order: levelPeople.length - 1 });
      }
    });

    // Normalize levels to start from 0
    const minLevel = Math.min(...Array.from(levels.keys()));
    
    // Create nodes
    const nodes: Node[] = [];
    nodeMap.forEach(({ person, level, order }) => {
      const normalizedLevel = level - minLevel;
      const levelPeople = levels.get(level) || [];
      const levelWidth = levelPeople.length;
      const xOffset = (order - (levelWidth - 1) / 2) * 250;

      nodes.push({
        id: person.id,
        type: 'person',
        position: { x: 400 + xOffset, y: normalizedLevel * 150 },
        data: {
          person,
          onClick: handleNodeClick,
          selected: selectedPerson?.id === person.id,
        },
      });
    });

    // Build a position lookup for handle selection
    const positionMap = new Map<string, { x: number; y: number }>();
    nodes.forEach(n => positionMap.set(n.id, n.position));

    // Create edges
    const isHorizontal = (type: string) => type === 'spouse' || type === 'partner';

    const edges: Edge[] = relationships.map(rel => {
      const horizontal = isHorizontal(rel.type);

      let sourceHandle = 'bottom';
      let targetHandle = 'top';

      if (horizontal) {
        const sourcePos = positionMap.get(rel.from_person_id);
        const targetPos = positionMap.get(rel.to_person_id);
        const sourceIsLeft = (sourcePos?.x ?? 0) <= (targetPos?.x ?? 0);
        sourceHandle = sourceIsLeft ? 'right-source' : 'left-source';
        targetHandle = sourceIsLeft ? 'left-target' : 'right-target';
      }

      return {
        id: rel.id,
        source: rel.from_person_id,
        target: rel.to_person_id,
        type: 'smoothstep',
        sourceHandle,
        targetHandle,
        className: horizontal ? 'spouse' : '',
        markerStart: horizontal
          ? { type: MarkerType.ArrowClosed, color: 'hsl(var(--tree-edge-spouse))' }
          : undefined,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: horizontal ? 'hsl(var(--tree-edge-spouse))' : 'hsl(var(--tree-edge))',
        },
        style: {
          strokeWidth: 2,
          stroke: horizontal
            ? 'hsl(var(--tree-edge-spouse))' 
            : 'hsl(var(--tree-edge))',
          strokeDasharray: horizontal ? '5 5' : undefined,
        },
      };
    });

    return { nodes, edges };
  }, [people, relationships, rootPersonId, handleNodeClick, selectedPerson]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (people.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No people in this tree yet</p>
          {isEditable && onAddPerson && (
            <Button onClick={onAddPerson}>Add first person</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] gap-4">
      <div className="flex-1 rounded-lg border border-border overflow-hidden bg-background">
        <div className="flex items-center justify-between border-b border-border p-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Root:</span>
            <Select value={rootPersonId} onValueChange={setRootPersonId}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Choose root" />
              </SelectTrigger>
              <SelectContent>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.primary_given} {person.primary_family}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEditable && onAddPerson && (
            <Button size="sm" onClick={onAddPerson}>
              Add person
            </Button>
          )}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-background"
        >
          <Controls showInteractive={false}>
            <button className="react-flow__controls-button">
              <Maximize2 className="h-3 w-3" />
            </button>
          </Controls>
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
        </ReactFlow>
      </div>

      {selectedPerson && (
        <PersonSidePanel
          person={selectedPerson}
          people={people}
          relationships={relationships}
          isEditable={isEditable}
          treeId={treeId}
          onClose={() => setSelectedPerson(null)}
          onAddRelationship={onAddRelationship}
        />
      )}
    </div>
  );
}
