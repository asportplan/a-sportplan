import { useState, useCallback, useEffect } from 'react';
import { generateProgram as generateLocalProgram } from '../core/engine/rule-engine.js';
import { 
  getGeneratedProgram, 
  saveGeneratedProgram, 
  clearAllUserData, 
  getUserProfile, 
  saveUserProfile, 
  getUserEquipment, 
  saveUserEquipment 
} from '../core/db/user-store.js';
import { api, ApiError } from '../lib/api-client.js';

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
      }
    }
    if (cached) {
      setProgramData(cached);
    }
  }, []);

  const startWizard = () => {
    setActiveTab('wizard');
    setCurrentStep(1);
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const generate = useCallback(async (isAuthenticated) => {
    setIsGenerating(true);
    setError(null);
    setIsOfflineMode(false);

    try {
      if (isAuthenticated) {
        // Try backend API
        try {
          const result = await api.generateProgram();
          const prog = result?.program || result?.data?.program || result?.data;
          if (result && (result.success || prog) && prog) {
            setProgramData(prog);
            saveGeneratedProgram(prog);
            setActiveTab('program');
            return { success: true, program: prog };
          }
        } catch (apiErr) {
          console.warn('[PreciseTrain] Backend API notice, falling back to local scientific engine:', apiErr);
          setIsOfflineMode(true);
        }
      } else {
        setIsOfflineMode(true);
      }

      // Local scientific rule engine (offline / fallback mode)
      const result = generateLocalProgram();
      if (result && result.success && result.program) {
        setProgramData(result.program);
        saveGeneratedProgram(result.program);
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
    isLoading: isGenerating,
    error,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    activeTab,
    setActiveTab,
    startWizard,
    generate,
    resetAll,
    clearError,
    isOfflineMode,
  };
}
