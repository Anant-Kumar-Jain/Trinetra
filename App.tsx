import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CitizenPortal } from './components/CitizenPortal';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { AuthPage } from './components/AuthPage';
import { UserRole, Camera, PrivacyLevel } from './types';
import { MOCK_CAMERAS, MOCK_INCIDENTS } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.AUTHORITY);
  const [cameras, setCameras] = useState<Camera[]>(MOCK_CAMERAS);

  const handleLogin = (selectedRole: UserRole) => {
      setRole(selectedRole);
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
  };

  const toggleSharing = (id: string, durationMinutes?: number) => {
    setCameras(prev => prev.map(cam => 
      cam.id === id ? { ...cam, isShared: !cam.isShared, pendingAccessRequest: false } : cam
    ));
    
    if (durationMinutes) {
        console.log(`Access granted for Camera ${id} for ${durationMinutes} minutes.`);
    }
  };

  const rejectRequest = (id: string) => {
    setCameras(prev => prev.map(cam => 
      cam.id === id ? { ...cam, pendingAccessRequest: false } : cam
    ));
  };

  const updatePrivacy = (id: string, level: PrivacyLevel) => {
    setCameras(prev => prev.map(cam => 
      cam.id === id ? { ...cam, privacySetting: level } : cam
    ));
  };

  const handleRequestAccess = (id: string) => {
    setCameras(prev => prev.map(cam => {
      if (cam.id === id) {
        // If auto-approve is on, immediately grant share access
        if (cam.autoApprove) {
          console.log(`Auto-approving access for ${cam.name}`);
          return { ...cam, isShared: true, pendingAccessRequest: false };
        }
        return { ...cam, pendingAccessRequest: true };
      }
      return cam;
    }));
  };

  const handleVerifyCamera = (id: string) => {
    setCameras(prev => prev.map(cam => 
      cam.id === id ? { ...cam, locationVerified: true } : cam
    ));
  };

  const toggleAutoApprove = (id: string) => {
    setCameras(prev => prev.map(cam => 
      cam.id === id ? { ...cam, autoApprove: !cam.autoApprove } : cam
    ));
  };

  if (!isAuthenticated) {
      return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Navbar currentRole={role} onLogout={handleLogout} />
      
      <main className="">
        {role === UserRole.CITIZEN ? (
          <CitizenPortal 
            cameras={cameras} 
            toggleSharing={toggleSharing} 
            rejectRequest={rejectRequest}
            updatePrivacy={updatePrivacy} 
            toggleAutoApprove={toggleAutoApprove}
          />
        ) : (
          <AuthorityDashboard 
            cameras={cameras}
            incidents={MOCK_INCIDENTS}
            onRequestAccess={handleRequestAccess}
            onVerifyCamera={handleVerifyCamera}
          />
        )}
      </main>
    </div>
  );
};

export default App;