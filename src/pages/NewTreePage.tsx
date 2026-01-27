import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TreeDeciduous, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { TreeForm } from '@/components/forms/TreeForm';
import { PersonForm } from '@/components/forms/PersonForm';
import { useTrees } from '@/hooks/useTrees';
import { usePersonMutations } from '@/hooks/usePeople';
import { useToast } from '@/hooks/use-toast';
import { TreeFormData, PersonFormData } from '@/lib/validation';

type Step = 'tree' | 'person';

export default function NewTreePage() {
  const [step, setStep] = useState<Step>('tree');
  const [treeId, setTreeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createTree } = useTrees();
  const { toast } = useToast();

  const handleTreeSubmit = async (data: TreeFormData) => {
    setIsLoading(true);
    try {
      const tree = await createTree.mutateAsync({
        name: data.name,
        slug: data.slug,
        visibility: data.visibility,
        description: data.description,
      });
      setTreeId(tree.id);
      setStep('person');
      toast({
        title: 'Tree created!',
        description: 'Now add yourself as the first person.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create tree',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout requireAuth>
      <div className="container max-w-2xl py-8">
        <div className="mb-8 text-center">
          <TreeDeciduous className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
            {step === 'tree' ? 'Create New Tree' : 'Add Yourself'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === 'tree'
              ? 'Start by naming your family tree'
              : 'Add yourself as the first person in your tree'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            step === 'tree' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
          }`}>
            1
          </div>
          <div className="h-px w-12 bg-border" />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            step === 'person' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="font-serif">
              {step === 'tree' ? 'Tree Details' : 'Your Profile'}
            </CardTitle>
            <CardDescription>
              {step === 'tree'
                ? 'Choose a name and privacy settings for your tree'
                : 'Add your basic information to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'tree' ? (
              <TreeForm
                onSubmit={handleTreeSubmit}
                isLoading={isLoading}
                submitLabel="Continue"
              />
            ) : treeId ? (
              <AddFirstPerson treeId={treeId} />
            ) : null}
          </CardContent>
        </Card>

        {step === 'tree' && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You can change these settings later
          </p>
        )}
      </div>
    </AppLayout>
  );
}

function AddFirstPerson({ treeId }: { treeId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createPerson } = usePersonMutations(treeId);
  const { toast } = useToast();

  const handleSubmit = async (data: PersonFormData) => {
    setIsLoading(true);
    try {
      await createPerson.mutateAsync(data);
      toast({
        title: 'Welcome to your family tree!',
        description: 'You can now start adding family members.',
      });
      navigate(`/app/tree/${treeId}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create person',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate(`/app/tree/${treeId}`);
  };

  return (
    <div className="space-y-6">
      <PersonForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Add & Continue"
      />
      <div className="text-center">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
