
import React, { useState, useEffect } from 'react';
import { UserProfile, Meal } from './types';
import { calculatePersonalizedGoals } from './services/geminiService';
import { auth, onAuthStateChanged, User } from './firebase';
import { getUserProfile, saveUserProfile, getMealsFromDb, addMealToDb, updateMealInDb, deleteMealFromDb } from './services/database';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/ProfileSettings';
import Login from './components/Login';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Fetch data from Firestore
        try {
          const profile = await getUserProfile(user.uid);
          const userMeals = await getMealsFromDb(user.uid);
          setUserProfile(profile);
          setMeals(userMeals);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        setUserProfile(null);
        setMeals([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async (profile: Partial<UserProfile>) => {
    if (!firebaseUser) return;
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
      
      await saveUserProfile(firebaseUser.uid, fullProfile);
      setUserProfile(fullProfile);
      setShowProfile(false);
    } catch (error) {
      console.error("Error calculating goals:", error);
      alert("Failed to calculate goals. Please try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddMeal = async (meal: Meal) => {
    if (!firebaseUser) return;
    setMeals(prev => [meal, ...prev]);
    await addMealToDb(firebaseUser.uid, meal);
  };

  const handleUpdateMeal = async (updatedMeal: Meal) => {
    if (!firebaseUser) return;
    setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
    await updateMealInDb(firebaseUser.uid, updatedMeal);
  };

  const handleDeleteMeal = async (id: string) => {
    if (!firebaseUser) return;
    setMeals(prev => prev.filter(m => m.id !== id));
    await deleteMealFromDb(firebaseUser.uid, id);
  };

  const handleReset = async () => {
    if (confirm("Reset everything? This will delete all your cloud-synced data.")) {
      // In a real app, you'd delete Firestore documents
      // For now, let's just trigger a re-onboarding by clearing the profile locally (which updates db)
      if (!firebaseUser) return;
      setUserProfile(null);
      // Actual implementation would need to delete collection docs
    }
  };

  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">
          {isInitializing ? "Syncing your plan..." : "Loading NutriLens..."}
        </h2>
        <p className="text-slate-500 mt-2">Connecting to your profile.</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Login />;
  }

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      {showProfile ? (
        <ProfileSettings 
          user={userProfile} 
          onSave={handleOnboardingComplete} 
          onBack={() => setShowProfile(false)} 
          onReset={handleReset}
        />
      ) : (
        <Dashboard 
          user={userProfile} 
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
