import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import AuthCallback from "./pages/auth/AuthCallback";
import Dashboard from "./pages/Dashboard";
import OnboardingWizard from "./pages/OnboardingWizard";
import ToastsPage from "./pages/ToastsPage";
import LibraryPage from "./pages/LibraryPage";
import AIGeneratePage from "./pages/AIGeneratePage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import FeastsPage from "./pages/FeastsPage";
import NewFeastPage from "./pages/NewFeastPage";
import FeastDetailPage from "./pages/FeastDetailPage";
import LiveFeastPage from "./pages/LiveFeastPage";
import JoinFeastPage from "./pages/JoinFeastPage";
import UpgradePage from "./pages/UpgradePage";
import AdminTelemetryPage from "./pages/AdminTelemetryPage";
import AIHistoryPage from "./pages/AIHistoryPage";
import ApiTestingPage from "./pages/ApiTestingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingWizard />
                </ProtectedRoute>
              } />

              {/* App shell with sidebar/bottom nav */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/feasts" element={<FeastsPage />} />
                <Route path="/feasts/new" element={<NewFeastPage />} />
                <Route path="/feasts/:id" element={<FeastDetailPage />} />
                <Route path="/feasts/:id/live" element={<LiveFeastPage />} />
                <Route path="/toasts" element={<ToastsPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/ai-generate" element={<AIGeneratePage />} />
                <Route path="/ai-history" element={<AIHistoryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/upgrade" element={<UpgradePage />} />
                <Route path="/admin/telemetry" element={<AdminTelemetryPage />} />
              </Route>

              {/* Join feast via share code (outside app shell but requires auth) */}
              <Route path="/feasts/join/:shareCode" element={
                <ProtectedRoute><JoinFeastPage /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
