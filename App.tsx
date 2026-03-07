
import React, { useState, useEffect } from 'react';
import { UserProfile, Meal } from './types';
import { calculatePersonalizedGoals } from './services/geminiService';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/ProfileSettings';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('nutrilens_user');
    const savedMeals = localStorage.getItem('nutrilens_meals');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nutrilens_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nutrilens_meals', JSON.stringify(meals));
  }, [meals]);

  const handleOnboardingComplete = async (profile: Partial<UserProfile>) => {
    setIsInitializing(true);
    try {
      const results = await calculatePersonalizedGoals(profile);
      const fullProfile: UserProfile = {
        name: profile.name!,
        weight: profile.weight!,
        height: profile.height!,
        gender: profile.gender!,
        goal: profile.goal!,
        weightGoalSpeed: profile.weightGoalSpeed!,
        activityLevel: profile.activityLevel!,
        sportsInfo: profile.sportsInfo,
        waist: profile.waist,
        hips: profile.hips,
        chest: profile.chest,
        dailyCalorieTarget: results.targetCalories,
        macros: results.macros,
      };
      setUser(fullProfile);
      setShowProfile(false);
    } catch (error) {
      console.error("Error calculating goals:", error);
      alert("Failed to calculate goals. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddMeal = (meal: Meal) => {
    setMeals(prev => [meal, ...prev]);
  };

  const handleUpdateMeal = (updatedMeal: Meal) => {
    setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleReset = () => {
    if (confirm("Reset everything? This will delete all logs.")) {
      localStorage.removeItem('nutrilens_user');
      localStorage.removeItem('nutrilens_meals');
      setUser(null);
      setMeals([]);
      setShowProfile(false);
    }
  };

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">
          {isInitializing ? "Recalculating your plan..." : "Loading NutriLens..."}
        </h2>
        <p className="text-slate-500 mt-2">Personalizing your experience.</p>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      {showProfile ? (
        <ProfileSettings 
          user={user} 
          onSave={handleOnboardingComplete} 
          onBack={() => setShowProfile(false)} 
          onReset={handleReset}
        />
      ) : (
        <Dashboard 
          user={user} 
          meals={meals} 
          onAddMeal={handleAddMeal} 
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={handleDeleteMeal}
          onOpenProfile={() => setShowProfile(true)}
        />
      )}
    </div>
  );
};

export default App;
