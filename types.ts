
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum Goal {
  STEADY = 'Steady Weight',
  INCREASE = 'Weight Gain',
  DECREASE = 'Weight Loss'
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary',
  LIGHT = 'Lightly Active',
  MODERATE = 'Moderately Active',
  ACTIVE = 'Very Active',
  EXTRA_ACTIVE = 'Extra Active'
}

export enum WeightGoalSpeed {
  RELAXED = 'Relaxed',
  MODERATE = 'Steady',
  INTENSE = 'Aggressive'
}

export enum Theme {
  LIGHT = 'Light',
  DARK = 'Dark',
  SYSTEM = 'System'
}

export interface UserProfile {
  name: string;
  dateOfBirth?: string; // YYYY-MM-DD
  weight: number; // in kg
  height: number; // in cm
  gender: Gender;
  goal: Goal;
  weightGoalSpeed: WeightGoalSpeed;
  activityLevel: ActivityLevel;
  sportsInfo?: string;
  waist?: number;
  hips?: number;
  chest?: number;
  dailyCalorieTarget: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  theme?: Theme;
}

export interface Meal {
  id: string;
  type: string; // Breakfast, Lunch, Dinner, Snack, etc.
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  image?: string;
  timestamp: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
}

export interface WeightLog {
  id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface FavoriteFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  defaultMealType?: string;
  createdAt: number;
}
