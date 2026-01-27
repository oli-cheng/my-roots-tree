import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tree, TreeVisibility } from '@/lib/types';
import { useAuth } from './useAuth';

export function useTrees() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const treesQuery = useQuery({
    queryKey: ['trees', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Tree[];
    },
    enabled: !!user,
  });

  const createTree = useMutation({
    mutationFn: async (treeData: {
      name: string;
      slug: string;
      visibility: TreeVisibility;
      description?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Create tree
      const { data: tree, error: treeError } = await supabase
        .from('trees')
        .insert({
          owner_id: user.id,
          name: treeData.name,
          slug: treeData.slug,
          visibility: treeData.visibility,
          description: treeData.description,
        })
        .select()
        .single();
      
      if (treeError) throw treeError;

      // Add owner as tree member
      const { error: memberError } = await supabase
        .from('tree_members')
        .insert({
          tree_id: tree.id,
          user_id: user.id,
          role: 'owner',
        });
      
      if (memberError) throw memberError;

      return tree as Tree;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
    },
  });

  const updateTree = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tree> & { id: string }) => {
      const { data: tree, error } = await supabase
        .from('trees')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return tree as Tree;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
    },
  });

  const deleteTree = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
    },
  });

  return {
    trees: treesQuery.data ?? [],
    isLoading: treesQuery.isLoading,
    error: treesQuery.error,
    createTree,
    updateTree,
    deleteTree,
  };
}

export function useTree(treeId: string | undefined) {
  return useQuery({
    queryKey: ['tree', treeId],
    queryFn: async () => {
      if (!treeId) return null;
      
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('id', treeId)
        .single();
      
      if (error) throw error;
      return data as Tree;
    },
    enabled: !!treeId,
  });
}

export function usePublicTree(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-tree', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('slug', slug)
        .eq('visibility', 'public')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as Tree;
    },
    enabled: !!slug,
  });
}

export function useUnlistedTree(slug: string | undefined, shareId: string | undefined) {
  return useQuery({
    queryKey: ['unlisted-tree', slug, shareId],
    queryFn: async () => {
      if (!slug || !shareId) return null;
      
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('slug', slug)
        .eq('share_id', shareId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Tree;
    },
    enabled: !!slug && !!shareId,
  });
}
