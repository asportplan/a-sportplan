import { useState, useCallback, useEffect } from 'react';
import { generateProgram as generateLocalProgram } from '../core/engine/rule-engine.js';
import { 
  getGeneratedProgram, 
  saveGeneratedProgram, 
  clearAllUserData, 
  getUserProfile, 
  saveUserProfile, 
  getUserEquipment, 
  saveUserEquipment,
  getSavedProgramsLibrary,
  saveProgramToLibrary,
  resetForNewProgram
} from '../core/db/user-store.js';

export function useProgramGenerator() {
  const [programData, setProgramData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'wizard', 'program', 'equipment', 'goals', 'screening', 'analytics', 'settings'
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Auto-initialize default profile, equipment & cached program on mount if empty
  useEffect(() => {
    let cached = getGeneratedProgram();
    if (!cached) {
      const profile = getUserProfile();
      if (!profile || !profile.selected_goals || profile.selected_goals.length === 0) {
        saveUserProfile({
          age: 25,
          training_age_level: 'BEGINNER',
          active_program_duration_weeks: 8,
          target_1rm_increase_pct: 10,
          selected_goals: ['hypertrophy'],
        });
      }
      const equip = getUserEquipment();
      if (!equip || equip.length === 0) {
        saveUserEquipment([
          { exercise_slug: 'barbell_bench_press', user_1rm_kg: 60 },
          { exercise_slug: 'barbell_back_squat', user_1rm_kg: 80 },
          { exercise_slug: 'barbell_deadlift', user_1rm_kg: 100 },
          { exercise_slug: 'dumbbell_biceps_curl', user_1rm_kg: 14 },
          { exercise_slug: 'lat_pulldown_machine', user_1rm_kg: 50 },
          { exercise_slug: 'bodyweight_pull_up', user_1rm_kg: null },
          { exercise_slug: 'bodyweight_push_up', user_1rm_kg: null },
        ]);
      }
      const initialGen = generateLocalProgram();
      if (initialGen.success && initialGen.program) {
        cached = initialGen.program;
        saveGeneratedProgram(cached);
        saveProgramToLibrary(cached);
      }
    } else {
      // Ensure the active cached program is also present in the library collection
      const lib = getSavedProgramsLibrary();
      if (lib.length === 0) {
        saveProgramToLibrary(cached);
      }
    }
    if (cached) {
      setProgramData(cached);
    }
  }, []);

  const startWizard = useCallback((isNew = false) => {
    if (isNew) {
      resetForNewProgram();
    }
    setActiveTab('wizard');
    setCurrentStep(1);
  }, []);

  const createNewProgram = useCallback(() => {
    resetForNewProgram();
    setActiveTab('wizard');
    setCurrentStep(1);
  }, []);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Switch active program explicitly (e.g. from SavedProgramsPage library)
  const selectProgram = useCallback((prog) => {
    if (prog) {
      setProgramData(prog);
      saveGeneratedProgram(prog);
      setActiveTab('program');
    }
  }, []);

  const generate = useCallback(async (isAuthenticated) => {
    setIsGenerating(true);
    setError(null);
    setIsOfflineMode(false);

    try {
      // Always generate with the local rule engine: it reads the profile, equipment and screening the
      // athlete just entered in this browser. The backend /programs/generate reads a separate server
      // database the wizard never writes to, so its output could be built from stale data.
      // Signed-in users still get their data synced to Supabase by user-store.
      setIsOfflineMode(!isAuthenticated);

      const result = generateLocalProgram();
      if (result && result.success && result.program) {
        setProgramData(result.program);
        saveGeneratedProgram(result.program);
        // Automatically save every new generated program to Library collection
        saveProgramToLibrary(result.program);
        setActiveTab('program');
        return result;
      } else {
        throw new Error(result?.error || 'Gagal membuat program latihan');
      }
    } catch (err) {
      const msg = err.message || 'Gagal membuat program latihan';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetAll = useCallback(() => {
    clearAllUserData();
    setProgramData(null);
    setCurrentStep(1);
    setActiveTab('home');
    setError(null);
    setIsOfflineMode(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    programData,
    setProgramData,
    selectProgram,
    isLoading: isGenerating,
    error,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    activeTab,
    setActiveTab,
    startWizard,
    createNewProgram,
    generate,
    resetAll,
    clearError,
    isOfflineMode,
  };
}
