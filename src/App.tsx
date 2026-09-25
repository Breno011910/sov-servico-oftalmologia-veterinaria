import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Patients from '@/components/Patients';
import PatientForm from '@/components/PatientForm';
import PatientRecord from '@/components/PatientRecord';
import ConsultationForm from '@/components/ConsultationForm';
import ConsultationView from '@/components/ConsultationView';
import AuthScreen from '@/components/AuthScreen';
import { AuthProvider, useAuth } from '@/auth';
import { seedDemoData } from '@/storage';
import type { Screen } from '@/types';

function AppContent() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (user && !seeded) {
      seedDemoData(user.id).then(() => setSeeded(true));
    }
    if (!user) setSeeded(false);
  }, [user, seeded]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
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
