import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { personSchema, PersonFormData } from '@/lib/validation';
import { Person } from '@/lib/types';

interface PersonFormProps {
  person?: Person;
  onSubmit: (data: PersonFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function PersonForm({ person, onSubmit, isLoading, submitLabel = 'Save' }: PersonFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      primary_given: person?.primary_given || '',
      primary_middle: person?.primary_middle || '',
      primary_family: person?.primary_family || '',
      suffix: person?.suffix || '',
      sex: person?.sex || 'U',
      birth_date: person?.birth_date || '',
      birth_place: person?.birth_place || '',
      death_date: person?.death_date || '',
      death_place: person?.death_place || '',
      bio_short: person?.bio_short || '',
      bio_full_md: person?.bio_full_md || '',
      person_visibility: person?.person_visibility || 'tree-default',
    },
  });

  const sex = watch('sex');
  const personVisibility = watch('person_visibility');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name section */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">Name</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_given">First name *</Label>
            <Input id="primary_given" {...register('primary_given')} />
            {errors.primary_given && (
              <p className="text-sm text-destructive">{errors.primary_given.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_middle">Middle name</Label>
            <Input id="primary_middle" {...register('primary_middle')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_family">Last name *</Label>
            <Input id="primary_family" {...register('primary_family')} />
            {errors.primary_family && (
              <p className="text-sm text-destructive">{errors.primary_family.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input id="suffix" placeholder="Jr., Sr., III, etc." {...register('suffix')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Sex</Label>
          <Select value={sex} onValueChange={(val) => setValue('sex', val as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
              <SelectItem value="X">Other</SelectItem>
              <SelectItem value="U">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vital stats */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">Vital Information</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth date</Label>
            <Input id="birth_date" placeholder="e.g., 1950 or Jan 15, 1950" {...register('birth_date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_place">Birth place</Label>
            <Input id="birth_place" placeholder="City, State, Country" {...register('birth_place')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="death_date">Death date</Label>
            <Input id="death_date" placeholder="Leave empty if living" {...register('death_date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="death_place">Death place</Label>
            <Input id="death_place" {...register('death_place')} />
          </div>
        </div>
      </div>

      {/* Biography */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">Biography</h3>
        
        <div className="space-y-2">
          <Label htmlFor="bio_short">Short bio</Label>
          <Textarea
            id="bio_short"
            rows={2}
            placeholder="A brief description..."
            {...register('bio_short')}
          />
          {errors.bio_short && (
            <p className="text-sm text-destructive">{errors.bio_short.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio_full_md">Full biography (Markdown)</Label>
          <Textarea
            id="bio_full_md"
            rows={6}
            placeholder="Tell their story... (Markdown supported)"
            {...register('bio_full_md')}
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">Privacy</h3>
        
        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select 
            value={personVisibility} 
            onValueChange={(val) => setValue('person_visibility', val as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tree-default">Use tree settings</SelectItem>
              <SelectItem value="public">Always public</SelectItem>
              <SelectItem value="private">Always private</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Control whether this person is visible on your public tree
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
