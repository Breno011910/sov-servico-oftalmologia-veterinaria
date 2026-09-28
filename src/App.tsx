import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Patients from '@/components/Patients';
import PatientForm from '@/components/PatientForm';
import PatientRecord from '@/components/PatientRecord';
import ConsultationForm from '@/components/ConsultationForm';
import ConsultationView from '@/components/ConsultationView';
import AuthScreen from '@/components/AuthScreen';
import ResetPassword from '@/components/ResetPassword';
import { AuthProvider, useAuth } from '@/auth';
import { seedDemoData } from '@/storage';
import { supabase } from '@/supabaseClient';
import type { Screen } from '@/types';

function AppContent() {
  const { user, session, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });
  const [seeded, setSeeded] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Detect password recovery from the URL hash that Supabase sends in the email link.
    // We must NOT strip the hash before Supabase processes it — getSession/onAuthStateChange
    // reads the access_token from the hash to establish the recovery session.
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }
  }, []);

  useEffect(() => {
    if (user && !seeded && !isPasswordRecovery) {
      seedDemoData(user.id).then(() => setSeeded(true));
    }
    if (!user) setSeeded(false);
  }, [user, seeded, isPasswordRecovery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    );
  }

  if (isPasswordRecovery && session) {
    // Clean the recovery token from the URL now that the session is established
    if (window.location.hash.includes('type=recovery')) {
      history.replaceState(null, '', window.location.pathname);
    }
    return (
      <ResetPassword
        onBack={() => {
          setIsPasswordRecovery(false);
          supabase.auth.signOut();
        }}
      />
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (screen.name) {
      case 'dashboard':
        return <Dashboard onNavigate={setScreen} />;
      case 'patients':
        return <Patients onNavigate={setScreen} />;
      case 'patientForm':
        return <PatientForm patientId={screen.patientId} onNavigate={setScreen} />;
      case 'patientRecord':
        return <PatientRecord patientId={screen.patientId} onNavigate={setScreen} />;
      case 'consultationForm':
        return <ConsultationForm patientId={screen.patientId} onNavigate={setScreen} />;
      case 'consultationView':
        return (
          <ConsultationView
            patientId={screen.patientId}
            consultationId={screen.consultationId}
            onNavigate={setScreen}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar current={screen.name} onNavigate={setScreen} />
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
