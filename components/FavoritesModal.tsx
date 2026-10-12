import React, { useState, useMemo } from 'react';
import { FavoriteFood, Meal } from '../types';
import { X, Heart, Plus, Search, Trash2, Utensils, Check, Sparkles, Loader2, Zap } from 'lucide-react';
import { estimateMealCalories } from '../services/geminiService';

interface Props {
  favorites: FavoriteFood[];
  currentMealType?: string;
  onClose: () => void;
  onSelectFavorite: (favorite: FavoriteFood, targetMealType: string) => void;
  onAddFavorite: (favorite: FavoriteFood) => void;
  onDeleteFavorite: (id: string) => void;
}

const FavoritesModal: React.FC<Props> = ({
  favorites,
  currentMealType = 'Lunch',
  onClose,
  onSelectFavorite,
  onAddFavorite,
  onDeleteFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  // Form state for creating a new favorite directly
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [description, setDescription] = useState('');
  const [defaultType, setDefaultType] = useState(currentMealType);
  const [isEstimating, setIsEstimating] = useState(false);

  const filteredFavorites = useMemo(() => {
    return favorites.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = 
        filterType === 'All' || 
        !item.defaultMealType || 
        item.defaultMealType === filterType;
      return matchesSearch && matchesType;
    });
  }, [favorites, searchQuery, filterType]);

  const handleAiEstimate = async () => {
    if (!description && !name) {
      alert("Please enter a food name or description first to estimate calories.");
      return;
    }
    setIsEstimating(true);
    try {
      const result = await estimateMealCalories(description || name);
      setName(prev => prev || result.name);
      setCalories(result.calories.toString());
      setProtein(result.protein.toString());
      setCarbs(result.carbs.toString());
      setFat(result.fat.toString());
      if (!description) setDescription(result.name);
    } catch (err) {
      console.error("AI estimation error:", err);
      alert("Could not estimate automatically. Please enter values manually.");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCreateFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a food name.");
      return;
    }
    const calNum = parseFloat(calories) || 0;
    const pNum = parseFloat(protein) || 0;
    const cNum = parseFloat(carbs) || 0;
    const fNum = parseFloat(fat) || 0;

    const newFav: FavoriteFood = {
      id: 'fav_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      calories: Math.round(calNum),
      protein: Math.round(pNum * 10) / 10,
      carbs: Math.round(cNum * 10) / 10,
      fat: Math.round(fNum * 10) / 10,
      description: description.trim() || name.trim(),
      defaultMealType: defaultType,
      createdAt: Date.now()
    };

    onAddFavorite(newFav);
    setShowAddForm(false);
    // Reset form
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setDescription('');
  };

  const handleLogFavorite = (fav: FavoriteFood, targetType: string) => {
    onSelectFavorite(fav, targetType);
    setLoggedNotification(`Added "${fav.name}" to ${targetType}!`);
    setTimeout(() => {
      setLoggedNotification(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:items-center sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg glass-panel rounded-t-[44px] sm:rounded-[44px] shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center glass-header border-b-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 backdrop-blur-md flex items-center justify-center text-rose-500 border border-rose-500/30">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">Favorite Foods</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {favorites.length}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Quick 1-Tap Meal Logging
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-3 glass-button rounded-2xl text-slate-500 hover:text-slate-700 transition-all"
            aria-label="Close favorites"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast notification */}
        {loggedNotification && (
          <div className="mx-6 mt-2 p-3 rounded-2xl bg-emerald-500/90 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{loggedNotification}</span>
          </div>
        )}

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 pt-3 space-y-4 custom-scrollbar">
          {/* Action bar: Search + Add button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search favorite foods..."
                className="w-full pl-11 pr-4 py-3 glass-input rounded-2xl text-sm font-bold text-slate-900"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                showAddForm 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-blue-500/90 text-white hover:bg-blue-600'
              }`}
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? 'Cancel' : 'New Food'}
            </button>
          </div>

          {/* New Favorite Form */}
          {showAddForm && (
            <form onSubmit={handleCreateFavorite} className="p-5 glass-panel rounded-3xl space-y-4 border border-blue-400/30 animate-in fade-in slide-in-from-top-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Add New Favorite Food</span>
                <button
                  type="button"
                  onClick={handleAiEstimate}
                  disabled={isEstimating}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-[11px] font-black flex items-center gap-1.5 transition-all"
                >
                  {isEstimating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                  Auto-Estimate with AI
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Food Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oatmeal with Whey & Banana"
                  required
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Portion / Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 1 cup rolled oats, 1 scoop vanilla whey, 1 medium banana"
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Calories *</label>
                  <input 
                    type="number" 
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="kcal"
                    required
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Protein (g)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="g"
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Carbs (g)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Fat (g)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="g"
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Default Meal Type</label>
                <div className="flex gap-2">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDefaultType(t)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        defaultType === t 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'glass-button text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white" /> Save to Favorites
              </button>
            </form>
          )}

          {/* Filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === type
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'glass-button text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Favorites List */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12 px-6 glass-panel rounded-3xl space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {searchQuery ? 'No matching favorite foods' : 'No favorites saved yet'}
              </h3>
              <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
                {searchQuery 
                  ? 'Try searching with a different word or clear your search query.' 
                  : 'Star meals from your daily log or tap "New Food" above to add recurring items for 1-tap logging!'}
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-blue-600 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add First Favorite
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFavorites.map(fav => (
                <div 
                  key={fav.id}
                  className="glass-panel rounded-3xl p-4.5 space-y-3 border border-white/60 hover:border-blue-400/40 transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-base truncate" title={fav.name}>
                          {fav.name}
                        </h4>
                        {fav.defaultMealType && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                            {fav.defaultMealType}
                          </span>
                        )}
                      </div>
                      {fav.description && fav.description !== fav.name && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                          {fav.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-lg font-black text-slate-900">{fav.calories}</span>
                        <span className="text-[10px] font-bold text-slate-400">kcal</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Remove "${fav.name}" from favorites?`)) {
                            onDeleteFavorite(fav.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg mt-1 inline-block"
                        title="Delete favorite"
                        aria-label="Delete favorite"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Macros info */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-[10px] font-black text-blue-700 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">
                      P: {fav.protein}g
                    </span>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 uppercase tracking-widest">
                      C: {fav.carbs}g
                    </span>
                    <span className="text-[10px] font-black text-rose-700 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 uppercase tracking-widest">
                      F: {fav.fat}g
                    </span>
                  </div>

                  {/* 1-Tap Log Buttons */}
                  <div className="pt-2 border-t border-white/40 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Log to:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                        <button
                          key={type}
                          onClick={() => handleLogFavorite(fav, type)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold glass-button hover:bg-blue-500 hover:text-white transition-all active:scale-95 text-slate-700 shadow-sm"
                        >
                          + {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
