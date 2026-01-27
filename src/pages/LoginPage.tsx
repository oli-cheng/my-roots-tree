import { TreeDeciduous } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TreeDeciduous className="h-8 w-8 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">Family Roots</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue building your family tree
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
            <AuthForm mode="login" />
          </div>
        </div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 hero-gradient">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-12">
              <TreeDeciduous className="mx-auto h-20 w-20 text-primary/30" />
              <h3 className="mt-6 font-serif text-3xl font-bold text-foreground/80">
                Your Family's Story Awaits
              </h3>
              <p className="mt-4 max-w-md text-muted-foreground">
                Continue documenting your heritage and connecting generations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
