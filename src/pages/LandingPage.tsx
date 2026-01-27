import { Link } from 'react-router-dom';
import { TreeDeciduous, Users, Lock, Share2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: TreeDeciduous,
    title: 'Build Beautiful Trees',
    description: 'Interactive family tree visualization with intuitive drag-and-drop interface',
  },
  {
    icon: Users,
    title: 'Add Unlimited People',
    description: 'Document every family member with rich profiles, photos, and life events',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Keep your tree private, share with select people, or publish for the world',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share your family history with relatives using simple links',
  },
];

const steps = [
  'Create your account for free',
  'Name your first family tree',
  'Add yourself as the starting point',
  'Connect parents, siblings, and children',
  'Share your heritage with family',
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient relative overflow-hidden py-20 md:py-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in">
                Preserve Your Family's
                <span className="block text-primary">Legacy Forever</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Create beautiful, interactive family trees. Document generations of stories,
                photos, and connections. Share your heritage with loved ones.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {user ? (
                  <Link to="/app">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button size="lg" className="gap-2 w-full sm:w-auto">
                        Start Building Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Sign in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Everything You Need
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools to document and share your family history
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Get Started in Minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Building your family tree is simple and intuitive
              </p>
            </div>

            <div className="mx-auto max-w-xl">
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-soft"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                    <CheckCircle className="ml-auto h-5 w-5 text-muted-foreground/30" />
                  </li>
                ))}
              </ol>

              <div className="mt-10 text-center">
                <Link to="/signup">
                  <Button size="lg" className="gap-2">
                    Create Your Tree
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-2xl bg-primary p-8 text-center shadow-elevated md:p-12">
              <TreeDeciduous className="mx-auto h-12 w-12 text-primary-foreground/80" />
              <h2 className="mt-6 font-serif text-2xl font-bold text-primary-foreground md:text-3xl">
                Start Preserving Your Family History Today
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join thousands of families documenting their heritage. Free to get started.
              </p>
              <Link to="/signup">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="mt-8 gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
