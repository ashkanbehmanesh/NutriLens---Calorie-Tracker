
import React, { useState, useMemo } from 'react';
import { UserProfile, Meal, WeightLog, FavoriteFood } from '../types';
import { Plus, Settings, ChevronLeft, ChevronRight, Camera, Utensils, Zap, Check, AlertTriangle, AlertCircle, Trash2, Edit2, Calendar, Scale, Heart, Sparkles } from 'lucide-react';
import MealEntryModal from './MealEntryModal';
import FavoritesModal from './FavoritesModal';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  user: UserProfile;
  meals: Meal[];
  weightLogs: WeightLog[];
  favorites: FavoriteFood[];
  onAddMeal: (meal: Meal) => void;
  onUpdateMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
  onAddWeightLog: (weight: number) => void;
  onAddFavorite: (fav: FavoriteFood) => void;
  onDeleteFavorite: (id: string) => void;
  onOpenProfile: () => void;
}

const Dashboard: React.FC<Props> = ({ 
  user, 
  meals, 
  weightLogs, 
  favorites = [],
  onAddMeal, 
  onUpdateMeal, 
  onDeleteMeal, 
  onAddWeightLog, 
  onAddFavorite,
  onDeleteFavorite,
  onOpenProfile 
}) => {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('Lunch');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const isFavorite = (meal: Meal) => {
    return favorites.some(
      f => f.name.toLowerCase().trim() === meal.name.toLowerCase().trim() &&
           Math.abs(f.calories - meal.calories) <= 20
    );
  };

  const handleToggleFavoriteMeal = (meal: Meal, e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = favorites.find(
      f => f.name.toLowerCase().trim() === meal.name.toLowerCase().trim() &&
           Math.abs(f.calories - meal.calories) <= 20
    );
    if (existing) {
      if (window.confirm(`Remove "${meal.name}" from favorites?`)) {
        onDeleteFavorite(existing.id);
        showToast(`Removed "${meal.name}" from favorites`);
      }
    } else {
      const newFav: FavoriteFood = {
        id: 'fav_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        description: meal.description || meal.name,
        defaultMealType: meal.type,
        createdAt: Date.now()
      };
      onAddFavorite(newFav);
      showToast(`Saved "${meal.name}" to favorites! ⭐`);
    }
  };

  const handleLogFavoriteToToday = (fav: FavoriteFood, targetType?: string) => {
    const mealType = targetType || fav.defaultMealType || getDefaultMealType();
    
    let timestamp = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) {
      let timeStr = '12:30:00';
      if (mealType === 'Breakfast') timeStr = '08:00:00';
      else if (mealType === 'Dinner') timeStr = '19:30:00';
      else if (mealType === 'Snack') timeStr = '16:00:00';
      timestamp = new Date(`${selectedDate}T${timeStr}`).getTime();
    }

    const mealData: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      type: mealType,
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      description: fav.description || fav.name,
      image: undefined,
      timestamp
    };

    onAddMeal(mealData);
    showToast(`Logged "${fav.name}" to ${mealType}! 🍽️`);
  };

  const dates = useMemo(() => {
    const list = [];
    for (let i = -14; i <= 0; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  }, []);

  const todayMeals = useMemo(() => {
    return meals.filter(m => new Date(m.timestamp).toISOString().split('T')[0] === selectedDate);
  }, [meals, selectedDate]);
  
  const roundUpToOneDecimal = (num: number) => Math.ceil(num * 10) / 10;

  const totalConsumed = Math.round(todayMeals.reduce((acc, m) => acc + m.calories, 0));
  const totalProtein = roundUpToOneDecimal(todayMeals.reduce((acc, m) => acc + m.protein, 0));
  const totalCarbs = roundUpToOneDecimal(todayMeals.reduce((acc, m) => acc + m.carbs, 0));
  const totalFat = roundUpToOneDecimal(todayMeals.reduce((acc, m) => acc + m.fat, 0));

  const calorieDiff = totalConsumed - user.dailyCalorieTarget;
  const absDiff = Math.abs(calorieDiff);
  
  let statusColor = 'text-green-500';
  let bgColor = 'bg-green-500';
  let statusIcon = <Check className="w-5 h-5" />;
  let statusText = "On Track";

  if (absDiff >= 500) {
    statusColor = 'text-red-500';
    bgColor = 'bg-red-500';
    statusIcon = <AlertCircle className="w-5 h-5" />;
    statusText = calorieDiff > 0 ? "Way Over" : "Way Under";
  } else if (absDiff >= 200) {
    statusColor = 'text-amber-500';
    bgColor = 'bg-amber-500';
    statusIcon = <AlertTriangle className="w-5 h-5" />;
    statusText = calorieDiff > 0 ? "Near Limit" : "Light Today";
  }

  const openAddMeal = (type: string) => {
    setSelectedMealType(type);
    setEditingMeal(null);
    setShowEntryModal(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowEntryModal(true);
  };

  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDefaultMealType = () => {
    const hour = new Date().getHours();
    if (hour > 4 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Snack';
  };

  const getMealTime = (type: string, defaultTimeStr: string) => {
    const mealsOfType = todayMeals.filter(m => m.type === type);
    if (mealsOfType.length > 0) {
      return new Date(mealsOfType[0].timestamp).getTime();
    }
    return new Date(`${selectedDate}T${defaultTimeStr}`).getTime();
  };

  const breakfastTime = getMealTime('Breakfast', '07:30:00');
  const lunchTime = getMealTime('Lunch', '12:30:00');
  const dinnerTime = getMealTime('Dinner', '19:30:00');

  const snacks = todayMeals.filter(m => !['Breakfast', 'Lunch', 'Dinner'].includes(m.type));

  const preBreakfastSnacks = snacks.filter(m => new Date(m.timestamp).getTime() < breakfastTime);
  const morningSnacks = snacks.filter(m => {
    const t = new Date(m.timestamp).getTime();
    return t >= breakfastTime && t < lunchTime;
  });
  const afternoonSnacks = snacks.filter(m => {
    const t = new Date(m.timestamp).getTime();
    return t >= lunchTime && t < dinnerTime;
  });
  const eveningSnacks = snacks.filter(m => new Date(m.timestamp).getTime() >= dinnerTime);

  const renderSnackSection = (title: string, mealsToRender: Meal[]) => {
    if (mealsToRender.length === 0) return null;
    return (
      <div key={title} className="glass-panel rounded-[32px] p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <Zap className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-black text-slate-900 text-lg">{title}</span>
        </div>
        {mealsToRender.map(meal => (
          <div 
            key={meal.id} 
            className="mb-4 last:mb-0 pt-4 border-t border-white/30 flex gap-4 cursor-pointer hover:bg-white/20 p-2 rounded-2xl transition-colors"
            onClick={() => handleEditMeal(meal)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate" title={meal.name}>
                    {meal.name.length > 22 ? meal.name.substring(0, 22) + '...' : meal.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <p className="font-black text-slate-900 text-xs whitespace-nowrap">{meal.calories} kcal</p>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavoriteMeal(meal, e)}
                    className="p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title={isFavorite(meal) ? "In favorites (click to remove)" : "Save to favorites"}
                  >
                    <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isFavorite(meal) ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-500'}`} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 truncate mt-1">{meal.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMainMealSection = (type: string) => {
    const mealsForType = todayMeals.filter(m => m.type === type);
    return (
      <div key={type} className="glass-panel rounded-[32px] p-5 group transition-all">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:bg-white/70 transition-colors">
              <Utensils className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg">{type}</span>
              {mealsForType.length > 0 && (
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {mealsForType.reduce((acc, m) => acc + m.calories, 0)} kcal
                </p>
              )}
            </div>
          </div>
          {mealsForType.length === 0 ? (
            <button 
              onClick={() => openAddMeal(type)}
              className="w-10 h-10 glass-button rounded-xl flex items-center justify-center text-slate-500 hover:bg-blue-500/90 hover:text-white transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => openAddMeal(type)}
              className="w-10 h-10 glass-button rounded-xl flex items-center justify-center text-slate-500 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {mealsForType.map(meal => (
          <div 
            key={meal.id} 
            className="mt-4 pt-4 border-t border-white/30 flex gap-4 animate-in fade-in slide-in-from-top-2 cursor-pointer hover:bg-white/20 p-2 rounded-2xl transition-colors"
            onClick={() => handleEditMeal(meal)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-base truncate" title={meal.name}>
                    {meal.name.length > 22 ? meal.name.substring(0, 22) + '...' : meal.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <p className="font-black text-slate-900 text-sm whitespace-nowrap">{meal.calories} kcal</p>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavoriteMeal(meal, e)}
                    className="p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title={isFavorite(meal) ? "In favorites (click to remove)" : "Save to favorites"}
                  >
                    <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite(meal) ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-500'}`} />
                  </button>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed mb-2 mt-1">{meal.description}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] font-black text-slate-500 bg-white/50 px-2 py-1 rounded-lg border border-white/40 uppercase tracking-widest">P: {meal.protein}g</span>
                <span className="text-[10px] font-black text-slate-500 bg-white/50 px-2 py-1 rounded-lg border border-white/40 uppercase tracking-widest">C: {meal.carbs}g</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      {/* Header */}
      <div className="p-6 glass-header sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-slate-500 text-sm font-bold uppercase tracking-widest">NutriLens</h2>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-black text-slate-900">
                {selectedDate === new Date().toISOString().split('T')[0] ? 'Dashboard' : formatDateLabel(selectedDate)}
              </h1>
              {selectedDate !== new Date().toISOString().split('T')[0] && (
                <button 
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-all"
                >
                  Today
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFavoritesModal(true)}
              className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center text-rose-500 hover:text-rose-600 relative active:scale-95 transition-all"
              title="Favorite Foods"
              aria-label="Favorite Foods"
            >
              <Heart className={`w-6 h-6 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-sm">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </button>
            <div className="relative w-12 h-12">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <button className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center text-slate-600">
                <Calendar className="w-6 h-6" />
              </button>
            </div>
            <button 
              onClick={onOpenProfile}
              className="w-12 h-12 glass-button rounded-2xl flex items-center justify-center text-slate-600"
              aria-label="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in fade-in slide-in-from-top-3">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Goal Card */}
        <div className="glass-panel rounded-[40px] p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/50 backdrop-blur-sm ${statusColor} shadow-inner`}>
                {statusIcon}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{statusText}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{user.goal}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-green-600">{user.dailyCalorieTarget}</span>
                <span className="text-xs text-slate-400 font-bold">kcal</span>
              </div>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-5xl font-black text-slate-900 leading-none">{totalConsumed}</span>
                <span className="text-lg font-bold text-slate-400 ml-2">kcal</span>
              </div>
              <div className="text-right pb-1">
                <span className="text-sm font-black text-slate-500">
                  {Math.round((totalConsumed / user.dailyCalorieTarget) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-5 flex rounded-full bg-white/50 backdrop-blur-sm p-1">
              <div 
                style={{ width: `${Math.min((totalConsumed / user.dailyCalorieTarget) * 100, 100)}%` }}
                className={`shadow-lg rounded-full transition-all duration-1000 ease-out ${bgColor}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Protein', value: totalProtein, target: user.macros.protein, color: 'bg-blue-400' },
              { label: 'Carbs', value: totalCarbs, target: user.macros.carbs, color: 'bg-amber-400' },
              { label: 'Fat', value: totalFat, target: user.macros.fat, color: 'bg-rose-400' }
            ].map(macro => (
              <div key={macro.label} className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{macro.label}</p>
                <p className="font-black text-slate-900 text-sm">
                  {macro.value}g 
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">/ {macro.target}g</span>
                </p>
                <div className="h-1.5 bg-white/50 backdrop-blur-sm rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full ${macro.color} rounded-full transition-all duration-700`} 
                    style={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Progress */}
        <div className="glass-panel rounded-[40px] p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/50 backdrop-blur-sm text-blue-600 shadow-inner">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Weight Progress</h3>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <input 
              type="number" 
              step="any"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter today's weight (kg)"
              className="flex-1 px-4 py-3 glass-input rounded-2xl text-slate-900 font-bold"
            />
            <button 
              onClick={() => {
                if (newWeight && !isNaN(parseFloat(newWeight))) {
                  onAddWeightLog(parseFloat(newWeight));
                  setNewWeight('');
                }
              }}
              disabled={!newWeight}
              className="px-6 py-3 bg-blue-500/90 backdrop-blur-md text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg border border-blue-400/50"
            >
              Log
            </button>
          </div>

          {weightLogs.length > 0 ? (
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightLogs.slice(-14)}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="#cbd5e1"
                    fontSize={10}
                    tickMargin={10}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    stroke="#cbd5e1"
                    fontSize={10}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm font-medium">
              No weight logs yet. Log your weight to see progress!
            </div>
          )}
        </div>

        {/* Quick Favorites Bar (if any favorites exist) */}
        {favorites.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Quick Favorites</h4>
              </div>
              <button 
                onClick={() => setShowFavoritesModal(true)}
                className="text-[11px] font-black text-blue-600 hover:underline"
              >
                View All ({favorites.length})
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {favorites.slice(0, 8).map(fav => (
                <button
                  key={fav.id}
                  onClick={() => handleLogFavoriteToToday(fav)}
                  className="glass-button px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-left flex-shrink-0 active:scale-95 group hover:border-rose-300 transition-all shadow-sm"
                  title={`Click to log ${fav.name}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{fav.name}</p>
                    <p className="text-[10px] font-black text-slate-500">{fav.calories} kcal</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-slate-900">Today's Meals</h3>
            <button 
              onClick={() => openAddMeal('Snack')}
              className="text-blue-700 text-xs font-black uppercase tracking-widest flex items-center gap-2 glass-button px-4 py-2 rounded-full active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Snack
            </button>
          </div>

          <div className="space-y-4">
            {renderSnackSection('Early Snacks', preBreakfastSnacks)}
            {renderMainMealSection('Breakfast')}
            {renderSnackSection('Morning Snacks', morningSnacks)}
            {renderMainMealSection('Lunch')}
            {renderSnackSection('Afternoon Snacks', afternoonSnacks)}
            {renderMainMealSection('Dinner')}
            {renderSnackSection('Evening Snacks', eveningSnacks)}
          </div>
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto flex justify-center pointer-events-none z-20">
        <button 
          onClick={() => openAddMeal(getDefaultMealType())}
          className="bg-blue-500/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg shadow-blue-200/50 flex items-center gap-2 text-white text-sm font-bold active:scale-95 transition-all pointer-events-auto border border-blue-400/50"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {showEntryModal && (
        <MealEntryModal 
          type={selectedMealType} 
          editingMeal={editingMeal}
          favorites={favorites}
          onClose={() => setShowEntryModal(false)} 
          onAdd={onAddMeal} 
          onUpdate={onUpdateMeal}
          onDelete={onDeleteMeal}
          onAddFavorite={onAddFavorite}
        />
      )}

      {showFavoritesModal && (
        <FavoritesModal
          favorites={favorites}
          currentMealType={getDefaultMealType()}
          onClose={() => setShowFavoritesModal(false)}
          onSelectFavorite={(fav, targetType) => handleLogFavoriteToToday(fav, targetType)}
          onAddFavorite={onAddFavorite}
          onDeleteFavorite={onDeleteFavorite}
        />
      )}
    </div>
  );
};

export default Dashboard;
