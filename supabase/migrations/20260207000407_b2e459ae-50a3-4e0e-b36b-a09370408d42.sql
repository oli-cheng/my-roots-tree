
-- Fix: Allow tree owners to insert themselves as first member
-- The current policy requires is_tree_editor which creates a chicken-and-egg problem
DROP POLICY IF EXISTS "Editors can insert members" ON public.tree_members;

CREATE POLICY "Owners and editors can insert members"
  ON public.tree_members FOR INSERT TO authenticated
  WITH CHECK (
    -- Allow if user is the tree owner (for initial member creation)
    EXISTS (
      SELECT 1 FROM public.trees
      WHERE id = tree_id AND owner_id = auth.uid()
    )
    OR public.is_tree_editor(tree_id, auth.uid())
  );
