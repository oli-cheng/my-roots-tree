import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import NewTreePage from "./pages/NewTreePage";
import TreeEditorPage from "./pages/TreeEditorPage";
import TreeSettingsPage from "./pages/TreeSettingsPage";
import PersonEditorPage from "./pages/PersonEditorPage";
import PublicTreePage from "./pages/PublicTreePage";
import UnlistedTreePage from "./pages/UnlistedTreePage";
import PublicPersonPage from "./pages/PublicPersonPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Authenticated routes */}
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/new-tree" element={<NewTreePage />} />
            <Route path="/app/tree/:treeId" element={<TreeEditorPage />} />
            <Route path="/app/tree/:treeId/settings" element={<TreeSettingsPage />} />
            <Route path="/app/tree/:treeId/person/:personId" element={<PersonEditorPage />} />
            
            {/* Public routes */}
            <Route path="/t/:slug" element={<PublicTreePage />} />
            <Route path="/t/:slug/person/:personId" element={<PublicPersonPage />} />
            <Route path="/u/:slug" element={<UnlistedTreePage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
