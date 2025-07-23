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
import { Help } from './pages/Help';
import { ActivityLog } from './pages/ActivityLog';
import HomeworkPage from "./pages/Homework";
import ClassesPage from "./pages/Classes";
import ReportCard from "./pages/ReportCard";
import ParentDashboard from "./pages/ParentDashboard";
import ParentChildren from "./pages/ParentChildren";
import ParentNotifications from "./pages/ParentNotifications";
import TeacherProfile from "./pages/TeacherProfile";
import ParentProfile from "./pages/ParentProfile";
import AdminDashboard from "./pages/AdminDashboard";

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
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <Layout>
                    {localStorage.getItem('role') === 'admin' ? <AdminDashboard /> :
                     localStorage.getItem('role') === 'teacher' ? <Dashboard /> :
                     localStorage.getItem('role') === 'student' ? <Dashboard /> :
                     localStorage.getItem('role') === 'parent' ? <ParentDashboard /> :
                     <Dashboard />}
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/teachers" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Teachers Page</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/report-cards" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Report Cards</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/report-card" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Layout>
                    <ReportCard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/homework" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <Layout>
                    {/* Render student homework page for students, placeholder for others */}
                    {localStorage.getItem('role') === 'student' ? <HomeworkPage /> : (
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-4">Homework</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    )}
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/classes" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <Layout>
                    {/* Render student classes page for students, placeholder for others */}
                    {localStorage.getItem('role') === 'student' ? <ClassesPage /> : (
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-4">Classes</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    )}
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/creativity-board" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <Layout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold mb-4">Creativity Board</h1>
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <Layout>
                    {localStorage.getItem('role') === 'teacher' ? <TeacherProfile /> :
                     localStorage.getItem('role') === 'parent' ? <ParentProfile /> :
                     localStorage.getItem('role') === 'student' ? <Profile /> :
                     <Profile />}
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/help" element={<Help />} />
              <Route path="/activity-log" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLog />
                </ProtectedRoute>
              } />
              <Route path="/parent" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Layout>
                    <ParentDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/parent/children" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Layout>
                    <ParentChildren />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/parent/notifications" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Layout>
                    <ParentNotifications />
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
