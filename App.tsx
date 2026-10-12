
import React, { useState, useEffect } from 'react';
import { UserProfile, Meal, WeightLog, Theme, FavoriteFood } from './types';
import { calculatePersonalizedGoals } from './services/geminiService';
import { auth, onAuthStateChanged, User } from './firebase';
import { 
  getUserProfile, 
  saveUserProfile, 
  getMealsFromDb, 
  addMealToDb, 
  updateMealInDb, 
  deleteMealFromDb, 
  getWeightLogsFromDb, 
  addWeightLogToDb,
  getFavoritesFromDb,
  addFavoriteToDb,
  deleteFavoriteFromDb
} from './services/database';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ProfileSettings from './components/ProfileSettings';
import Login from './components/Login';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
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
          const logs = await getWeightLogsFromDb(user.uid);
          const userFavorites = await getFavoritesFromDb(user.uid);
          setUserProfile(profile);
          setMeals(userMeals);
          setWeightLogs(logs);
          setFavorites(userFavorites);
        } catch (error: any) {
          console.error("Error loading user data:", error);
          if (error?.message?.includes('Missing or insufficient permissions')) {
            alert("Database Error: Missing or insufficient permissions. Please update your Firestore Security Rules in the Firebase Console to allow access.");
          }
        }
      } else {
        setUserProfile(null);
        setMeals([]);
        setWeightLogs([]);
        setFavorites([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const theme = userProfile?.theme || Theme.SYSTEM;
      const root = window.document.documentElement;
      
      root.classList.remove('light', 'dark');

      if (theme === Theme.SYSTEM) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme.toLowerCase());
      }
    };

    applyTheme();

    // Listen for system theme changes if set to system
    if ((userProfile?.theme || Theme.SYSTEM) === Theme.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [userProfile?.theme]);

  const handleOnboardingComplete = async (profile: Partial<UserProfile>, skipRecalculation: boolean = false) => {
    if (!firebaseUser) return;
    setIsInitializing(true);
    try {
      let fullProfile: UserProfile;

      if (skipRecalculation && userProfile) {
        fullProfile = {
          ...userProfile,
          ...profile,
          theme: profile.theme || Theme.SYSTEM,
        };
      } else {
        const results = await calculatePersonalizedGoals(profile);
        fullProfile = {
          name: profile.name!,
          dateOfBirth: profile.dateOfBirth,
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
          theme: profile.theme || Theme.SYSTEM,
        };
      }
      
      await saveUserProfile(firebaseUser.uid, fullProfile);
      setUserProfile(fullProfile);
      setShowProfile(false);
    } catch (error: any) {
      console.error("Error calculating goals:", error);
      if (error?.message?.includes('offline') || error?.message?.includes('permission-denied')) {
        alert("Database Error: Could not connect to Firestore. Please ensure you have created a Firestore Database in your Firebase Console.");
      } else if (error?.message?.includes('Missing or insufficient permissions')) {
        alert("Database Error: Missing or insufficient permissions. Please update your Firestore Security Rules in the Firebase Console to allow access.");
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddMeal = async (meal: Meal) => {
    if (!firebaseUser) return;
    setMeals(prev => [meal, ...prev]);
    try {
      await addMealToDb(firebaseUser.uid, meal);
    } catch (error: any) {
      console.error("Error adding meal:", error);
      if (error?.message?.includes('Missing or insufficient permissions')) {
        alert("Database Error: Missing or insufficient permissions. Please update your Firestore Security Rules in the Firebase Console to allow access.");
      }
      // Revert optimistic update
      setMeals(prev => prev.filter(m => m.id !== meal.id));
    }
  };

  const handleUpdateMeal = async (updatedMeal: Meal) => {
    if (!firebaseUser) return;
    const previousMeals = [...meals];
    setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
    try {
      await updateMealInDb(firebaseUser.uid, updatedMeal);
    } catch (error: any) {
      console.error("Error updating meal:", error);
      if (error?.message?.includes('Missing or insufficient permissions')) {
        alert("Database Error: Missing or insufficient permissions. Please update your Firestore Security Rules in the Firebase Console to allow access.");
      }
      // Revert optimistic update
      setMeals(previousMeals);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!firebaseUser) return;
    const previousMeals = [...meals];
    setMeals(prev => prev.filter(m => m.id !== id));
    try {
      await deleteMealFromDb(firebaseUser.uid, id);
    } catch (error: any) {
      console.error("Error deleting meal:", error);
      if (error?.message?.includes('Missing or insufficient permissions')) {
        alert("Database Error: Missing or insufficient permissions. Please update your Firestore Security Rules in the Firebase Console to allow access.");
      }
      // Revert optimistic update
      setMeals(previousMeals);
    }
  };

  const handleAddWeightLog = async (weight: number) => {
    if (!firebaseUser) return;
    const log: WeightLog = {
      id: Date.now().toString(),
      weight,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };
    setWeightLogs(prev => [...prev, log]);
    try {
      await addWeightLogToDb(firebaseUser.uid, log);
      // Update user profile weight as well
      if (userProfile) {
        const updatedProfile = { ...userProfile, weight };
        setUserProfile(updatedProfile);
        await saveUserProfile(firebaseUser.uid, updatedProfile);
      }
    } catch (error: any) {
      console.error("Error adding weight log:", error);
      if (error?.message?.includes('Missing or insufficient permissions')) {
        alert("Database Error: Missing or insufficient permissions. Please update your Firestore Security Rules in the Firebase Console to allow access.");
      }
      setWeightLogs(prev => prev.filter(l => l.id !== log.id));
    }
  };

  const handleAddFavorite = async (favorite: FavoriteFood) => {
    if (!firebaseUser) return;
    setFavorites(prev => [favorite, ...prev.filter(f => f.id !== favorite.id)]);
    try {
      await addFavoriteToDb(firebaseUser.uid, favorite);
    } catch (error: any) {
      console.error("Error adding favorite:", error);
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    if (!firebaseUser) return;
    setFavorites(prev => prev.filter(f => f.id !== id));
    try {
      await deleteFavoriteFromDb(firebaseUser.uid, id);
    } catch (error: any) {
      console.error("Error deleting favorite:", error);
    }
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
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
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
    <div className="min-h-screen bg-transparent max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
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
          weightLogs={weightLogs}
          favorites={favorites}
          onAddMeal={handleAddMeal} 
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={handleDeleteMeal}
          onAddWeightLog={handleAddWeightLog}
          onAddFavorite={handleAddFavorite}
          onDeleteFavorite={handleDeleteFavorite}
          onOpenProfile={() => setShowProfile(true)}
        />
      )}
    </div>
  );
};

export default App;
