import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { NotificationProvider } from './components/layout/NotificationContext';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

const queryClient = new QueryClient();

const App = () => (
  <NotificationProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppToaster />
        <SonnerToaster />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/teachers" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Teachers Page</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/report-cards" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Report Cards</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/homework" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Homework</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/classes" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Classes</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/creativity-board" element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Creativity Board</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </NotificationProvider>
);

export default App;
