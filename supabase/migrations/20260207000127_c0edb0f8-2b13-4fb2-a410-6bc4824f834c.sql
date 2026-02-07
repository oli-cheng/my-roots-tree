
-- Drop all existing restrictive policies and recreate as permissive

-- TREES
DROP POLICY IF EXISTS "Authenticated users can create trees" ON public.trees;
DROP POLICY IF EXISTS "Members can view their trees" ON public.trees;
DROP POLICY IF EXISTS "Editors can update trees" ON public.trees;
DROP POLICY IF EXISTS "Owner can delete trees" ON public.trees;

CREATE POLICY "Authenticated users can create trees"
  ON public.trees FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Members can view their trees"
  ON public.trees FOR SELECT TO authenticated
  USING (
    public.is_tree_member(id, auth.uid())
    OR visibility = 'public'
  );

CREATE POLICY "Editors can update trees"
  ON public.trees FOR UPDATE TO authenticated
  USING (public.is_tree_editor(id, auth.uid()));

CREATE POLICY "Owner can delete trees"
  ON public.trees FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- TREE_MEMBERS
DROP POLICY IF EXISTS "Members can view tree membership" ON public.tree_members;
DROP POLICY IF EXISTS "Editors can insert members" ON public.tree_members;
DROP POLICY IF EXISTS "Editors can update members" ON public.tree_members;
DROP POLICY IF EXISTS "Editors can delete members" ON public.tree_members;

CREATE POLICY "Members can view tree membership"
  ON public.tree_members FOR SELECT TO authenticated
  USING (public.is_tree_member(tree_id, auth.uid()));

CREATE POLICY "Editors can insert members"
  ON public.tree_members FOR INSERT TO authenticated
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update members"
  ON public.tree_members FOR UPDATE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete members"
  ON public.tree_members FOR DELETE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- PEOPLE
DROP POLICY IF EXISTS "View people" ON public.people;
DROP POLICY IF EXISTS "Editors can insert people" ON public.people;
DROP POLICY IF EXISTS "Editors can update people" ON public.people;
DROP POLICY IF EXISTS "Editors can delete people" ON public.people;

CREATE POLICY "View people"
  ON public.people FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR (public.is_tree_public(tree_id) AND person_visibility != 'private')
  );

CREATE POLICY "Editors can insert people"
  ON public.people FOR INSERT TO authenticated
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update people"
  ON public.people FOR UPDATE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete people"
  ON public.people FOR DELETE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- RELATIONSHIPS
DROP POLICY IF EXISTS "View relationships" ON public.relationships;
DROP POLICY IF EXISTS "Editors can insert relationships" ON public.relationships;
DROP POLICY IF EXISTS "Editors can update relationships" ON public.relationships;
DROP POLICY IF EXISTS "Editors can delete relationships" ON public.relationships;

CREATE POLICY "View relationships"
  ON public.relationships FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR public.is_tree_public(tree_id)
  );

CREATE POLICY "Editors can insert relationships"
  ON public.relationships FOR INSERT TO authenticated
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update relationships"
  ON public.relationships FOR UPDATE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete relationships"
  ON public.relationships FOR DELETE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- PHOTOS
DROP POLICY IF EXISTS "View photos" ON public.photos;
DROP POLICY IF EXISTS "Editors can insert photos" ON public.photos;
DROP POLICY IF EXISTS "Editors can update photos" ON public.photos;
DROP POLICY IF EXISTS "Editors can delete photos" ON public.photos;

CREATE POLICY "View photos"
  ON public.photos FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR public.is_tree_public(tree_id)
  );

CREATE POLICY "Editors can insert photos"
  ON public.photos FOR INSERT TO authenticated
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update photos"
  ON public.photos FOR UPDATE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete photos"
  ON public.photos FOR DELETE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- EVENTS
DROP POLICY IF EXISTS "View events" ON public.events;
DROP POLICY IF EXISTS "Editors can insert events" ON public.events;
DROP POLICY IF EXISTS "Editors can update events" ON public.events;
DROP POLICY IF EXISTS "Editors can delete events" ON public.events;

CREATE POLICY "View events"
  ON public.events FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR public.is_tree_public(tree_id)
  );

CREATE POLICY "Editors can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
