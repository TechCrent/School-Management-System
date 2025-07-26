import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Login } from "./pages/Login";
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
import AdminReports from "./pages/AdminReports";
import Subjects from "./pages/Subjects";
import Teachers from "./pages/Teachers";
import TeacherClasses from "./pages/TeacherClasses";
import TeacherHomework from "./pages/TeacherHomework";
import TeacherStudents from "./pages/TeacherStudents";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { AuthProvider } from './components/layout/AuthContext';
import { StudentDashboard } from "./pages/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
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
                       localStorage.getItem('role') === 'teacher' ? <TeacherDashboard /> :
                       localStorage.getItem('role') === 'student' ? <StudentDashboard /> :
                       localStorage.getItem('role') === 'parent' ? <ParentDashboard /> :
                       <div className="p-8 text-center text-muted-foreground">No dashboard available for your role.</div>}
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/students" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Students />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/teachers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <Teachers />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <AdminReports />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/activity-log" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout>
                      <ActivityLog />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Shared Routes */}
                <Route path="/classes" element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                    <Layout>
                      {localStorage.getItem('role') === 'teacher' ? <TeacherClasses /> :
                       localStorage.getItem('role') === 'admin' ? <ClassesPage /> :
                       localStorage.getItem('role') === 'student' ? <ClassesPage /> :
                       localStorage.getItem('role') === 'parent' ? <ClassesPage /> :
                       <ClassesPage />}
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/subjects" element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                    <Layout>
                      <Subjects />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/homework" element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
                    <Layout>
                      {localStorage.getItem('role') === 'student' ? <HomeworkPage /> :
                       localStorage.getItem('role') === 'teacher' ? <TeacherHomework /> : 
                       localStorage.getItem('role') === 'admin' ? <TeacherHomework /> :
                       <HomeworkPage />}
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/report-cards" element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <Layout>
                      <ReportCard />
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
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                    <Layout>
                      {localStorage.getItem('role') === 'teacher' ? <TeacherProfile /> :
                       localStorage.getItem('role') === 'parent' ? <ParentProfile /> :
                       localStorage.getItem('role') === 'student' ? <Profile /> :
                       localStorage.getItem('role') === 'admin' ? <Profile /> :
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
                <Route path="/help" element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Parent Routes */}
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
                
                {/* Teacher Routes */}
                <Route path="/teacher/classes" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <Layout>
                      <TeacherClasses />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/teacher/homework" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <Layout>
                      <TeacherHomework />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/teacher/students" element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <Layout>
                      <TeacherStudents />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Legacy Routes - Redirect to proper routes */}
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
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </NotificationProvider>
  </AuthProvider>
);

export default App;
