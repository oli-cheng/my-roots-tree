import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Person, Relationship, RelationshipType } from '@/lib/types';
import { PersonFormData } from '@/lib/validation';
import { useAuth } from './useAuth';

export function usePeople(treeId: string | undefined) {
  return useQuery({
    queryKey: ['people', treeId],
    queryFn: async () => {
      if (!treeId) return [];
      
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('tree_id', treeId)
        .order('primary_family', { ascending: true })
        .order('primary_given', { ascending: true });
      
      if (error) throw error;
      return data as Person[];
    },
    enabled: !!treeId,
  });
}

export function usePerson(personId: string | undefined) {
  return useQuery({
    queryKey: ['person', personId],
    queryFn: async () => {
      if (!personId) return null;
      
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .single();
      
      if (error) throw error;
      return data as Person;
    },
    enabled: !!personId,
  });
}

export function useRelationships(treeId: string | undefined) {
  return useQuery({
    queryKey: ['relationships', treeId],
    queryFn: async () => {
      if (!treeId) return [];
      
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('tree_id', treeId);
      
      if (error) throw error;
      return data as Relationship[];
    },
    enabled: !!treeId,
  });
}

export function usePersonMutations(treeId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createPerson = useMutation({
    mutationFn: async (personData: PersonFormData) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('people')
        .insert([{
          tree_id: treeId,
          created_by: user.id,
          updated_by: user.id,
          primary_given: personData.primary_given,
          primary_middle: personData.primary_middle || null,
          primary_family: personData.primary_family,
          suffix: personData.suffix || null,
          sex: personData.sex,
          birth_date: personData.birth_date || null,
          birth_place: personData.birth_place || null,
          death_date: personData.death_date || null,
          death_place: personData.death_place || null,
          bio_short: personData.bio_short || null,
          bio_full_md: personData.bio_full_md || null,
          person_visibility: personData.person_visibility,
          alt_names: [],
          tags: [],
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people', treeId] });
    },
  });

  const updatePerson = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Person> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: person, error } = await supabase
        .from('people')
        .update({
          ...data,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return person as Person;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['people', treeId] });
      queryClient.invalidateQueries({ queryKey: ['person', data.id] });
    },
  });

  const deletePerson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people', treeId] });
      queryClient.invalidateQueries({ queryKey: ['relationships', treeId] });
    },
  });

  return { createPerson, updatePerson, deletePerson };
}

export function useRelationshipMutations(treeId: string) {
  const queryClient = useQueryClient();

  const createRelationship = useMutation({
    mutationFn: async (data: {
      from_person_id: string;
      to_person_id: string;
      type: RelationshipType;
      start_date?: string;
      end_date?: string;
      notes?: string;
    }) => {
      const { data: relationship, error } = await supabase
        .from('relationships')
        .insert([{
          tree_id: treeId,
          from_person_id: data.from_person_id,
          to_person_id: data.to_person_id,
          type: data.type,
          start_date: data.start_date,
          end_date: data.end_date,
          notes: data.notes,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return relationship as Relationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', treeId] });
    },
  });

  const deleteRelationship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships', treeId] });
    },
  });

  return { createRelationship, deleteRelationship };
}
