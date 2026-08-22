import React, { useState } from 'react';
import TopNavBar from './components/layout/TopNavBar';
import SideNavBar from './components/layout/SideNavBar';
import BottomNavBar from './components/layout/BottomNavBar';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import FeaturesGrid from './components/home/FeaturesGrid';
import WizardContainer from './components/wizard/WizardContainer';
import ProgramResult from './components/program/ProgramResult';
import EquipmentPage from './components/pages/EquipmentPage';
import GoalsPage from './components/pages/GoalsPage';
import ScreeningPage from './components/pages/ScreeningPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import SettingsPage from './components/pages/SettingsPage';
import SavedProgramsPage from './components/pages/SavedProgramsPage';
import GuidePage from './components/pages/GuidePage';
import CalculatorPage from './components/pages/CalculatorPage';
import AuthModal from './components/auth/AuthModal';
import NotificationModal from './components/common/NotificationModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useProgramGenerator } from './hooks/useProgramGenerator';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './hooks/useLanguage.js';

function App() {
  const { 
    activeTab, 
    setActiveTab, 
    startWizard, 
    resetAll, 
    programData,
    isLoading,
    error,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    generate,
    clearError,
    isOfflineMode
  } = useProgramGenerator();

  const auth = useAuth();
  const { lang } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <TopNavBar 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        user={auth.user}
        onOpenLogin={() => setShowAuthModal(true)}
        onLogout={auth.signOut}
      />
      
      {isOfflineMode && (
        <div className="bg-warning-container text-on-warning-container px-md py-sm text-center text-body-sm font-semibold flex justify-center items-center gap-xs">
          <span className="material-symbols-outlined text-sm">wifi_off</span>
          <span>{lang === 'en' ? 'Offline Mode Active. Programs generated locally.' : 'Modus Offline Aktif. Program dihasilkan secara lokal.'}</span>
          {!auth.isAuthenticated && (
            <button onClick={() => setShowAuthModal(true)} className="underline ml-1">{lang === 'en' ? 'Sign in' : 'Masuk'}</button>
          )}
          <span>{lang === 'en' ? 'to sync.' : 'untuk sinkronisasi.'}</span>
        </div>
      )}
      
      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        <SideNavBar activeTab={activeTab} onNavigate={setActiveTab} />
        
        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto pb-24 md:pb-6 bg-surface p-md md:p-lg w-full min-w-0">
          {activeTab === 'home' && (
            <>
              <HeroSection onStart={startWizard} />
              <FeaturesGrid />
            </>
          )}

          {activeTab === 'guide' && (
            <div className="max-w-container-max mx-auto">
              <GuidePage onStartWizard={startWizard} onNavigate={(tab) => setActiveTab(tab)} />
            </div>
          )}

          {activeTab === 'wizard' && (
            <div className="max-w-container-max mx-auto">
              <WizardContainer 
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                nextStep={nextStep}
                prevStep={prevStep}
                generate={() => generate(auth.isAuthenticated)}
              />
            </div>
          )}

          {activeTab === 'program' && (
            <div className="max-w-container-max mx-auto">
              <ErrorBoundary key={programData ? programData.generated_at || 'program' : 'empty'}>
                <ProgramResult 
                  programData={programData} 
                  isLoading={isLoading} 
                  onEditParameters={startWizard}
                  onCreateNew={startWizard}
                  onNavigate={setActiveTab}
                />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="max-w-container-max mx-auto">
              <EquipmentPage onGenerate={() => generate(auth.isAuthenticated)} />
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="max-w-container-max mx-auto">
              <GoalsPage />
            </div>
          )}

          {activeTab === 'screening' && (
            <div className="max-w-container-max mx-auto">
              <ScreeningPage />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-container-max mx-auto">
              <AnalyticsPage />
            </div>
          )}

          {activeTab === 'saved_programs' && (
            <div className="max-w-container-max mx-auto">
              <SavedProgramsPage 
                currentProgram={programData}
                onSelectProgram={(prog) => {
                  setActiveTab('program');
                }}
                onCreateNew={() => startWizard()}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-container-max mx-auto">
              <SettingsPage onReset={resetAll} user={auth.user} onOpenLogin={() => setShowAuthModal(true)} />
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="max-w-container-max mx-auto">
              <CalculatorPage onStartWizard={startWizard} />
            </div>
          )}
        </div>
      </main>

      <Footer />

      <BottomNavBar activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Auth Modal for Login / Register */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuth={() => {}} 
        authHook={auth}
      />

      {/* System Notification & Safety Clearance Modal */}
      <NotificationModal 
        isOpen={!!error}
        onClose={clearError}
        title={lang === 'en' ? 'Health Screening & Medical Safety' : 'Skrining Kesehatan & Keamanan Medis'}
        message={error}
        type="error"
      />
    </>
  );
}

export default App;
