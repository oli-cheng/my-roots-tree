// Type definitions for the Family Tree Builder

export type TreeVisibility = 'private' | 'unlisted' | 'public';
export type PersonVisibility = 'tree-default' | 'public' | 'private';
export type SexType = 'M' | 'F' | 'X' | 'U';
export type RelationshipType = 'parent-child' | 'spouse' | 'partner' | 'adoptive' | 'guardian';
export type AppRole = 'owner' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tree {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  visibility: TreeVisibility;
  share_id: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreeMember {
  id: string;
  tree_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Person {
  id: string;
  tree_id: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  primary_given: string;
  primary_middle: string | null;
  primary_family: string;
  suffix: string | null;
  alt_names: string[];
  sex: SexType;
  birth_date: string | null;
  birth_place: string | null;
  death_date: string | null;
  death_place: string | null;
  bio_short: string | null;
  bio_full_md: string | null;
  tags: string[];
  person_visibility: PersonVisibility;
  avatar_url: string | null;
}

export interface Relationship {
  id: string;
  tree_id: string;
  from_person_id: string;
  to_person_id: string;
  type: RelationshipType;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  tree_id: string;
  person_id: string | null;
  url: string;
  caption: string | null;
  taken_date: string | null;
  location: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  tree_id: string;
  person_id: string;
  type: string;
  date: string | null;
  place: string | null;
  description: string | null;
  created_at: string;
}

// Helper types
export interface PersonWithRelationships extends Person {
  parents: Person[];
  children: Person[];
  spouses: Person[];
  partners: Person[];
}

export function getFullName(person: Person): string {
  const parts = [person.primary_given];
  if (person.primary_middle) parts.push(person.primary_middle);
  parts.push(person.primary_family);
  if (person.suffix) parts.push(person.suffix);
  return parts.join(' ');
}

export function getLifespan(person: Person): string {
  const birth = person.birth_date ? extractYear(person.birth_date) : '?';
  const death = person.death_date ? extractYear(person.death_date) : '';
  
  if (death) {
    return `${birth}–${death}`;
  } else if (birth !== '?') {
    return `b. ${birth}`;
  }
  return '';
}

function extractYear(dateStr: string): string {
  // Handle various date formats
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : dateStr;
}

export function isDeceased(person: Person): boolean {
  return !!person.death_date;
}
