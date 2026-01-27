-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'editor', 'viewer');

-- Create visibility enum
CREATE TYPE public.tree_visibility AS ENUM ('private', 'unlisted', 'public');

-- Create person_visibility enum
CREATE TYPE public.person_visibility AS ENUM ('tree-default', 'public', 'private');

-- Create sex enum
CREATE TYPE public.sex_type AS ENUM ('M', 'F', 'X', 'U');

-- Create relationship_type enum
CREATE TYPE public.relationship_type AS ENUM ('parent-child', 'spouse', 'partner', 'adoptive', 'guardian');

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================
-- TREES TABLE
-- =====================
CREATE TABLE public.trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  visibility tree_visibility NOT NULL DEFAULT 'private',
  share_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;

-- =====================
-- TREE_MEMBERS TABLE
-- =====================
CREATE TABLE public.tree_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tree_id, user_id)
);

ALTER TABLE public.tree_members ENABLE ROW LEVEL SECURITY;

-- =====================
-- PEOPLE TABLE
-- =====================
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  primary_given TEXT NOT NULL,
  primary_middle TEXT,
  primary_family TEXT NOT NULL,
  suffix TEXT,
  alt_names TEXT[] DEFAULT '{}',
  sex sex_type DEFAULT 'U',
  birth_date TEXT,
  birth_place TEXT,
  death_date TEXT,
  death_place TEXT,
  bio_short TEXT,
  bio_full_md TEXT,
  tags TEXT[] DEFAULT '{}',
  person_visibility person_visibility DEFAULT 'tree-default',
  avatar_url TEXT
);

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- =====================
-- RELATIONSHIPS TABLE
-- =====================
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  from_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  to_person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  type relationship_type NOT NULL,
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_people CHECK (from_person_id != to_person_id)
);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- =====================
-- PHOTOS TABLE
-- =====================
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  caption TEXT,
  taken_date TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- =====================
-- EVENTS TABLE
-- =====================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TEXT,
  place TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =====================
-- HELPER FUNCTION: Check if user is a member with edit rights
-- =====================
CREATE OR REPLACE FUNCTION public.is_tree_editor(p_tree_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tree_members
    WHERE tree_id = p_tree_id
      AND user_id = p_user_id
      AND role IN ('owner', 'editor')
  )
$$;

-- =====================
-- HELPER FUNCTION: Check if user is a tree member (any role)
-- =====================
CREATE OR REPLACE FUNCTION public.is_tree_member(p_tree_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tree_members
    WHERE tree_id = p_tree_id
      AND user_id = p_user_id
  )
$$;

-- =====================
-- HELPER FUNCTION: Check if tree is public
-- =====================
CREATE OR REPLACE FUNCTION public.is_tree_public(p_tree_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trees
    WHERE id = p_tree_id
      AND visibility = 'public'
  )
$$;

-- =====================
-- TREES RLS POLICIES
-- =====================

-- Members can view their trees
CREATE POLICY "Members can view their trees"
  ON public.trees FOR SELECT
  USING (
    public.is_tree_member(id, auth.uid())
    OR visibility = 'public'
  );

-- Only owner can update tree
CREATE POLICY "Editors can update trees"
  ON public.trees FOR UPDATE
  USING (public.is_tree_editor(id, auth.uid()));

-- Only owner can delete tree
CREATE POLICY "Owner can delete trees"
  ON public.trees FOR DELETE
  USING (owner_id = auth.uid());

-- Authenticated users can create trees
CREATE POLICY "Authenticated users can create trees"
  ON public.trees FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- =====================
-- TREE_MEMBERS RLS POLICIES
-- =====================

-- Members can view tree membership
CREATE POLICY "Members can view tree membership"
  ON public.tree_members FOR SELECT
  USING (public.is_tree_member(tree_id, auth.uid()));

-- Editors can manage members
CREATE POLICY "Editors can insert members"
  ON public.tree_members FOR INSERT
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update members"
  ON public.tree_members FOR UPDATE
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete members"
  ON public.tree_members FOR DELETE
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- =====================
-- PEOPLE RLS POLICIES
-- =====================

-- Can view people if member OR tree is public and person is not private
CREATE POLICY "View people"
  ON public.people FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR (
      public.is_tree_public(tree_id)
      AND person_visibility != 'private'
    )
  );

-- Editors can insert people
CREATE POLICY "Editors can insert people"
  ON public.people FOR INSERT
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

-- Editors can update people
CREATE POLICY "Editors can update people"
  ON public.people FOR UPDATE
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- Editors can delete people
CREATE POLICY "Editors can delete people"
  ON public.people FOR DELETE
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- =====================
-- RELATIONSHIPS RLS POLICIES
-- =====================

CREATE POLICY "View relationships"
  ON public.relationships FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR public.is_tree_public(tree_id)
  );

CREATE POLICY "Editors can insert relationships"
  ON public.relationships FOR INSERT
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update relationships"
  ON public.relationships FOR UPDATE
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete relationships"
  ON public.relationships FOR DELETE
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- =====================
-- PHOTOS RLS POLICIES
-- =====================

CREATE POLICY "View photos"
  ON public.photos FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR public.is_tree_public(tree_id)
  );

CREATE POLICY "Editors can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update photos"
  ON public.photos FOR UPDATE
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete photos"
  ON public.photos FOR DELETE
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- =====================
-- EVENTS RLS POLICIES
-- =====================

CREATE POLICY "View events"
  ON public.events FOR SELECT
  USING (
    public.is_tree_member(tree_id, auth.uid())
    OR public.is_tree_public(tree_id)
  );

CREATE POLICY "Editors can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can update events"
  ON public.events FOR UPDATE
  USING (public.is_tree_editor(tree_id, auth.uid()));

CREATE POLICY "Editors can delete events"
  ON public.events FOR DELETE
  USING (public.is_tree_editor(tree_id, auth.uid()));

-- =====================
-- STORAGE BUCKET FOR PHOTOS
-- =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('family-photos', 'family-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view public photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'family-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'family-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their uploads"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================
-- TRIGGERS FOR UPDATED_AT
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trees_updated_at
  BEFORE UPDATE ON public.trees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at
  BEFORE UPDATE ON public.relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();