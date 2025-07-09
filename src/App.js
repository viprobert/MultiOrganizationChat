import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation  } from 'react-router-dom';
import AuthPage from './pages/AuthPage'; 
import DashboardPage from './pages/DashboardPage'; 
import UserRolesPage from './pages/UserRolesPage';
import TagPage from './pages/TagPage';
import TeamsPage from './pages/TeamsPage';
import UserPage from './pages/UserPage';
import UserProfile from './components/UserProfile.js';
import ChannelPage from './pages/ChannelPage';
import OrganizationPage from './pages/OrganizationPage';
import PermissionPage from './pages/PermissionPage';
import CustomerRatingPage from './pages/CustomerRatingPage.js';
import ChatPage from './pages/ChatPage.js';
import AssignChatsPage from './pages/AssignChatsPage.js';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', color: '#333' }}>
        <p style={{ fontSize: '1.2rem' }}>Loading application...</p>
      </div>
    );
  }

    if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = user?.permissions?.includes(requiredPermission);

  if (requiredPermission && !hasPermission) {
    // FIX: Return a "Permission Denied" message if permission is missing
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fef3f2', color: '#ef4444', border: '1px solid #f87171', borderRadius: '0.5rem', margin: '2rem auto', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Access Denied!</h2>
        <p style={{ fontSize: '1.125rem' }}>You do not have the necessary permissions to view this page.</p>
      </div>
    );
  }

   return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if(!loading && isAuthenticated){
      if (location.pathname === '/' || location.pathname === '/login'){
        if (user?.permissions?.includes('dashboard_view')){
          navigate('/dashboard', { replace: true });
        }
        else if (user?.permissions?.includes('chat_view')) { 
          navigate('/chat', { replace: true });
        }
        else if (user?.permissions?.includes('organization_view')) { 
          navigate('/organization', { replace: true });
        }
        else if (user?.permissions?.includes('channel_view')) { 
          navigate('/channel', { replace: true });
        }
        else if (user?.permissions?.includes('users_view')) { 
          navigate('/users', { replace: true });
        }
        else if (user?.permissions?.includes('userrole_view')) { 
          navigate('/user-roles', { replace: true });
        }
        else if (user?.permissions?.includes('permissions_view')) { 
          navigate('/permission', { replace: true });
        }
        else if (user?.permissions?.includes('tags_view')) { 
          navigate('/tags', { replace: true });
        }
        else if (user?.permissions?.includes('teams_view')) { 
          navigate('/teams', { replace: true });
        }
        else if (user?.permissions?.includes('assign_chat')){
          navigate('/assign-chat', { replace: true })
        }
        else{
          console.warn("User is authenticated but has no default view permissions.");
        }
      }
    }
  },[loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', color: '#333' }}>
        <p style={{ fontSize: '1.2rem' }}>Loading authentication...</p>
      </div>
    );
  }

  return (
      <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route path="/customer-rating" element={<CustomerRatingPage />} />

      <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>} />

      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredPermission="dashboard_view">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute requiredPermission="chat_view">
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <ProtectedRoute requiredPermission="organization_view">
            <OrganizationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/channel"
        element={
          <ProtectedRoute requiredPermission="channel_view">
            <ChannelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermission="users_view">
            <UserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-roles"
        element={
          <ProtectedRoute requiredPermission="userrole_view">
            <UserRolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permission"
        element={
          <ProtectedRoute requiredPermission="permissions_view">
            <PermissionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tag"
        element={
          <ProtectedRoute requiredPermission="tags_view">
            <TagPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute requiredPermission="teams_view">
            <TeamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assign-chat"
        element={
          <ProtectedRoute requiredPermission="assign_chat">
            <AssignChatsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    );
};

export default App;
