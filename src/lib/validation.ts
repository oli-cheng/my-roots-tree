import { z } from 'zod';

export const treeSchema = z.object({
  name: z.string().min(1, 'Tree name is required').max(100, 'Name too long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  visibility: z.enum(['private', 'unlisted', 'public']),
  description: z.string().max(500, 'Description too long').optional(),
});

export const personSchema = z.object({
  primary_given: z.string().min(1, 'First name is required').max(100, 'Name too long'),
  primary_middle: z.string().max(100, 'Name too long').optional(),
  primary_family: z.string().min(1, 'Last name is required').max(100, 'Name too long'),
  suffix: z.string().max(20, 'Suffix too long').optional(),
  sex: z.enum(['M', 'F', 'X', 'U']),
  birth_date: z.string().max(50, 'Date too long').optional(),
  birth_place: z.string().max(200, 'Place too long').optional(),
  death_date: z.string().max(50, 'Date too long').optional(),
  death_place: z.string().max(200, 'Place too long').optional(),
  bio_short: z.string().max(300, 'Bio too long').optional(),
  bio_full_md: z.string().max(10000, 'Bio too long').optional(),
  person_visibility: z.enum(['tree-default', 'public', 'private']),
});

export const relationshipSchema = z.object({
  from_person_id: z.string().uuid(),
  to_person_id: z.string().uuid(),
  type: z.enum(['parent-child', 'spouse', 'partner', 'adoptive', 'guardian']),
  start_date: z.string().max(50, 'Date too long').optional(),
  end_date: z.string().max(50, 'Date too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const eventSchema = z.object({
  type: z.string().min(1, 'Event type is required').max(50, 'Type too long'),
  date: z.string().max(50, 'Date too long').optional(),
  place: z.string().max(200, 'Place too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
});

export const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const profileSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export type TreeFormData = z.infer<typeof treeSchema>;
export type PersonFormData = z.infer<typeof personSchema>;
export type RelationshipFormData = z.infer<typeof relationshipSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
