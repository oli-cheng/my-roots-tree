import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Globe, EyeOff, Link as LinkIcon } from 'lucide-react';
import slugify from 'slugify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { treeSchema, TreeFormData } from '@/lib/validation';
import { Tree } from '@/lib/types';

interface TreeFormProps {
  tree?: Tree;
  onSubmit: (data: TreeFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TreeForm({ tree, onSubmit, isLoading, submitLabel = 'Save' }: TreeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TreeFormData>({
    resolver: zodResolver(treeSchema),
    defaultValues: {
      name: tree?.name || '',
      slug: tree?.slug || '',
      visibility: tree?.visibility || 'private',
      description: tree?.description || '',
    },
  });

  const name = watch('name');
  const visibility = watch('visibility');

  // Auto-generate slug from name
  useEffect(() => {
    if (!tree && name) {
      const slug = slugify(name, { lower: true, strict: true });
      setValue('slug', slug);
    }
  }, [name, tree, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Tree name *</Label>
        <Input
          id="name"
          placeholder="e.g., The Smith Family"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Public URL</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/t/</span>
          <Input
            id="slug"
            placeholder="the-smith-family"
            {...register('slug')}
          />
        </div>
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This will be your tree's public URL if you make it visible
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="A brief description of this family tree..."
          {...register('description')}
        />
      </div>

      <div className="space-y-3">
        <Label>Visibility</Label>
        <RadioGroup
          value={visibility}
          onValueChange={(val) => setValue('visibility', val as any)}
          className="space-y-3"
        >
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="private" id="private" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Private</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Only you can view and edit this tree
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="unlisted" id="unlisted" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Unlisted</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Anyone with the link can view, but it won't appear in search
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="public" id="public" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Public</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Anyone can view this tree at its public URL
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
