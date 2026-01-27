import { useParams, Link } from 'react-router-dom';
import { AlertCircle, Calendar, MapPin, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { usePerson, usePeople, useRelationships } from '@/hooks/usePeople';
import { usePublicTree } from '@/hooks/useTrees';
import { getFullName, getLifespan, Person } from '@/lib/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function PublicPersonPage() {
  const { slug, personId } = useParams<{ slug: string; personId: string }>();
  const { data: tree, isLoading: treeLoading } = usePublicTree(slug);
  const { data: person, isLoading: personLoading } = usePerson(personId);
  const { data: people = [] } = usePeople(tree?.id);
  const { data: relationships = [] } = useRelationships(tree?.id);

  const isLoading = treeLoading || personLoading;

  // Get related people
  const getRelatedPeople = (type: 'parents' | 'children' | 'spouses') => {
    if (!person) return [];
    return relationships
      .filter(rel => {
        if (type === 'parents') {
          return rel.to_person_id === person.id && rel.type === 'parent-child';
        }
        if (type === 'children') {
          return rel.from_person_id === person.id && rel.type === 'parent-child';
        }
        if (type === 'spouses') {
          return (
            (rel.from_person_id === person.id || rel.to_person_id === person.id) &&
            (rel.type === 'spouse' || rel.type === 'partner')
          );
        }
        return false;
      })
      .map(rel => {
        if (type === 'parents') {
          return people.find(p => p.id === rel.from_person_id);
        }
        if (type === 'children') {
          return people.find(p => p.id === rel.to_person_id);
        }
        if (type === 'spouses') {
          const otherId = rel.from_person_id === person.id ? rel.to_person_id : rel.from_person_id;
          return people.find(p => p.id === otherId);
        }
        return undefined;
      })
      .filter((p): p is Person => !!p);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container max-w-3xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-64 rounded bg-muted" />
            <div className="h-96 rounded bg-muted" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tree || !person) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
              Person Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This person doesn't exist or is not publicly accessible.
            </p>
            <Link to={`/t/${slug}`}>
              <Button className="mt-6">Back to Tree</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const parents = getRelatedPeople('parents');
  const children = getRelatedPeople('children');
  const spouses = getRelatedPeople('spouses');
  const lifespan = getLifespan(person);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-3xl py-8">
        {/* Back link */}
        <Link
          to={`/t/${slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {tree.name}
        </Link>

        {/* Profile header */}
        <div className="flex items-start gap-6 mb-8">
          {person.avatar_url ? (
            <img
              src={person.avatar_url}
              alt={getFullName(person)}
              className="h-24 w-24 rounded-full object-cover border-2 border-border shadow-medium"
            />
          ) : (
            <div className={cn(
              'flex h-24 w-24 items-center justify-center rounded-full border-2 border-border shadow-medium',
              person.sex === 'M' && 'bg-blue-100 text-blue-700',
              person.sex === 'F' && 'bg-pink-100 text-pink-700',
              (person.sex === 'X' || person.sex === 'U') && 'bg-muted text-muted-foreground',
            )}>
              <User className="h-12 w-12" />
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {getFullName(person)}
            </h1>
            {lifespan && (
              <p className="mt-1 text-lg text-muted-foreground">{lifespan}</p>
            )}
            {person.bio_short && (
              <p className="mt-3 text-muted-foreground">{person.bio_short}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Vital information */}
            {(person.birth_date || person.birth_place || person.death_date || person.death_place) && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {(person.birth_date || person.birth_place) && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Born</p>
                        <p className="text-foreground">
                          {[person.birth_date, person.birth_place].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {(person.death_date || person.death_place) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Died</p>
                        <p className="text-foreground">
                          {[person.death_date, person.death_place].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Biography */}
            {person.bio_full_md && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-xl font-semibold mb-4">Biography</h2>
                  <div className="prose-heritage">
                    <ReactMarkdown>{person.bio_full_md}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Relationships */}
          <div className="space-y-6">
            {parents.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Parents
                  </h3>
                  <div className="space-y-2">
                    {parents.map(p => (
                      <Link
                        key={p.id}
                        to={`/t/${slug}/person/${p.id}`}
                        className="block text-foreground hover:text-primary transition-colors"
                      >
                        {getFullName(p)}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {spouses.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Spouse/Partner
                  </h3>
                  <div className="space-y-2">
                    {spouses.map(p => (
                      <Link
                        key={p.id}
                        to={`/t/${slug}/person/${p.id}`}
                        className="block text-foreground hover:text-primary transition-colors"
                      >
                        {getFullName(p)}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {children.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Children
                  </h3>
                  <div className="space-y-2">
                    {children.map(p => (
                      <Link
                        key={p.id}
                        to={`/t/${slug}/person/${p.id}`}
                        className="block text-foreground hover:text-primary transition-colors"
                      >
                        {getFullName(p)}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
