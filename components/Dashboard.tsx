
import React, { useState, useMemo } from 'react';
import { UserProfile, Meal } from '../types';
import { Plus, Settings, ChevronLeft, ChevronRight, Camera, Utensils, Zap, Check, AlertTriangle, AlertCircle, Trash2, Edit2, Calendar } from 'lucide-react';
import MealEntryModal from './MealEntryModal';

interface Props {
  user: UserProfile;
  meals: Meal[];
  onAddMeal: (meal: Meal) => void;
  onUpdateMeal: (meal: Meal) => void;
  onDeleteMeal: (id: string) => void;
  onOpenProfile: () => void;
}

const Dashboard: React.FC<Props> = ({ user, meals, onAddMeal, onUpdateMeal, onDeleteMeal, onOpenProfile }) => {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('Lunch');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
  
  const totalConsumed = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = todayMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + m.fat, 0);

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
    const d = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="p-6 bg-white sticky top-0 z-10 border-b border-slate-100 ios-glass">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest">NutriLens</h2>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          </div>
          <button 
            onClick={onOpenProfile}
            className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar -mx-6 px-6 pb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                selectedDate === date 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {formatDateLabel(date)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
        {/* Goal Card */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-slate-50 ${statusColor} shadow-inner`}>
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
            <div className="overflow-hidden h-5 flex rounded-full bg-slate-100 p-1">
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
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{macro.label}</p>
                <p className="font-black text-slate-900 text-sm">
                  {macro.value}g 
                  <span className="text-[10px] text-slate-300 font-bold block mt-0.5">/ {macro.target}g</span>
                </p>
                <div className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full ${macro.color} rounded-full transition-all duration-700`} 
                    style={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-slate-900">Today's Meals</h3>
            <button 
              onClick={() => openAddMeal('Snack')}
              className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Snack
            </button>
          </div>

          <div className="space-y-4">
            {['Breakfast', 'Lunch', 'Dinner'].map(type => {
              const mealsForType = todayMeals.filter(m => m.type === type);
              return (
                <div key={type} className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 group transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-slate-100 transition-colors">
                        <Utensils className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-lg">{type}</span>
                        {mealsForType.length > 0 && (
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {mealsForType.reduce((acc, m) => acc + m.calories, 0)} kcal
                          </p>
                        )}
                      </div>
                    </div>
                    {mealsForType.length === 0 ? (
                      <button 
                        onClick={() => openAddMeal(type)}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => openAddMeal(type)}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {mealsForType.map(meal => (
                    <div 
                      key={meal.id} 
                      className="mt-4 pt-4 border-t border-slate-50 flex gap-4 animate-in fade-in slide-in-from-top-2"
                      onClick={() => handleEditMeal(meal)}
                    >
                      {meal.image ? (
                        <img src={meal.image} alt={meal.name} className="w-20 h-20 rounded-[24px] object-cover shadow-md" />
                      ) : (
                        <div className="w-20 h-20 rounded-[24px] bg-slate-100 flex items-center justify-center text-slate-300">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-black text-slate-900 text-base truncate pr-2">{meal.name}</p>
                          <p className="font-black text-slate-900 text-sm whitespace-nowrap">{meal.calories} kcal</p>
                        </div>
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mb-2">{meal.description}</p>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">P: {meal.protein}g</span>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">C: {meal.carbs}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Extras */}
            {todayMeals.filter(m => !['Breakfast', 'Lunch', 'Dinner'].includes(m.type)).length > 0 && (
              <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner">
                    <Zap className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="font-black text-slate-900 text-lg">Snacks</span>
                </div>
                {todayMeals.filter(m => !['Breakfast', 'Lunch', 'Dinner'].includes(m.type)).map(meal => (
                  <div 
                    key={meal.id} 
                    className="mb-4 last:mb-0 pt-4 border-t border-slate-50 flex gap-4"
                    onClick={() => handleEditMeal(meal)}
                  >
                    {meal.image && <img src={meal.image} className="w-16 h-16 rounded-2xl object-cover shadow-md" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-slate-900 text-sm truncate pr-2">{meal.name}</p>
                        <p className="font-black text-slate-900 text-xs">{meal.calories} kcal</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 truncate mt-1">{meal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-8 ios-glass pointer-events-none">
        <button 
          onClick={() => openAddMeal('Snack')}
          className="mx-auto w-20 h-20 bg-blue-600 rounded-[28px] shadow-2xl shadow-blue-300 flex items-center justify-center text-white active:scale-95 transition-all pointer-events-auto"
        >
          <Camera className="w-10 h-10" />
        </button>
      </div>

      {showEntryModal && (
        <MealEntryModal 
          type={selectedMealType} 
          editingMeal={editingMeal}
          onClose={() => setShowEntryModal(false)} 
          onAdd={onAddMeal} 
          onUpdate={onUpdateMeal}
          onDelete={onDeleteMeal}
        />
      )}
    </div>
  );
};

export default Dashboard;
