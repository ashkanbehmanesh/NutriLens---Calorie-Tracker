import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Trash2, Loader2, Sparkles, Heart, Search, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { estimateMealCalories } from '../services/geminiService';
import { Meal, FavoriteFood } from '../types';

interface Props {
  type: string;
  editingMeal?: Meal | null;
  favorites?: FavoriteFood[];
  onClose: () => void;
  onAdd: (meal: Meal) => void;
  onUpdate: (meal: Meal) => void;
  onDelete: (id: string) => void;
  onAddFavorite?: (fav: FavoriteFood) => void;
}

const MealEntryModal: React.FC<Props> = ({ 
  type, 
  editingMeal, 
  favorites = [],
  onClose, 
  onAdd, 
  onUpdate, 
  onDelete,
  onAddFavorite 
}) => {
  const [description, setDescription] = useState(editingMeal?.description || '');
  const [image, setImage] = useState<string | null>(editingMeal?.image || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedType, setSelectedType] = useState(editingMeal?.type || type);
  const [saveToFavorite, setSaveToFavorite] = useState(false);
  const [showFavoritesPicker, setShowFavoritesPicker] = useState(false);
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMeal) {
      setDescription(editingMeal.description);
      setImage(editingMeal.image || null);
    }
  }, [editingMeal]);

  const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await resizeImage(reader.result as string);
        setImage(resized);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFavoriteItem = (fav: FavoriteFood) => {
    // Directly log the favorite item into current meal type without typing!
    const mealData: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedType,
      name: fav.name,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      description: fav.description || fav.name,
      image: undefined,
      timestamp: Date.now(),
    };
    onAdd(mealData);
    onClose();
  };

  const handleAnalyze = async () => {
    if (!description && !image) return;
    
    setIsAnalyzing(true);
    try {
      const result = await estimateMealCalories(description || "Meal in photo", image || undefined);
      
      const mealData: Meal = {
        id: editingMeal?.id || Math.random().toString(36).substr(2, 9),
        type: selectedType,
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        description: description,
        image: undefined, // Don't store the image in the database
        timestamp: editingMeal?.timestamp || Date.now(),
      };
      
      if (editingMeal) {
        onUpdate(mealData);
      } else {
        onAdd(mealData);
      }

      // Also save to favorites if requested
      if (saveToFavorite && onAddFavorite) {
        onAddFavorite({
          id: 'fav_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
          name: result.name,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          description: description || result.name,
          defaultMealType: selectedType,
          createdAt: Date.now()
        });
      }

      onClose();
    } catch (error) {
      console.error("Analysis error:", error);
      alert("AI Analysis failed. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingMeal && window.confirm("Remove this meal from your log?")) {
      onDelete(editingMeal.id);
      onClose();
    }
  };

  const filteredFavorites = favorites.filter(f => 
    f.name.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(favSearchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:items-center sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-panel rounded-t-[48px] sm:rounded-[48px] shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-8 pb-4 flex justify-between items-center glass-header border-b-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{editingMeal ? 'Edit' : 'Log'} {selectedType}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">AI-Powered Tracking</p>
          </div>
          <div className="flex gap-2">
            {editingMeal && (
              <button 
                type="button"
                onClick={handleDelete} 
                className="p-3 bg-rose-500/20 backdrop-blur-md rounded-2xl text-rose-600 hover:bg-rose-500/30 transition-all border border-rose-500/30"
                aria-label="Delete meal"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              type="button"
              onClick={onClose} 
              className="p-3 glass-button rounded-2xl text-slate-500 hover:text-slate-700 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6 custom-scrollbar">
          {/* Quick Favorite Chooser Banner */}
          {!editingMeal && favorites.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowFavoritesPicker(!showFavoritesPicker)}
                className="w-full p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 flex items-center justify-between hover:bg-rose-500/15 transition-all text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Choose from Favorites ({favorites.length})</span>
                </div>
                {showFavoritesPicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showFavoritesPicker && (
                <div className="p-4 glass-panel rounded-2xl space-y-3 border border-rose-400/30 animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={favSearchQuery}
                      onChange={(e) => setFavSearchQuery(e.target.value)}
                      placeholder="Filter favorite foods..."
                      className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    {filteredFavorites.length === 0 ? (
                      <p className="text-center py-4 text-xs font-medium text-slate-400">No matching favorites</p>
                    ) : (
                      filteredFavorites.map(fav => (
                        <div
                          key={fav.id}
                          onClick={() => handleSelectFavoriteItem(fav)}
                          className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-pointer group flex items-center justify-between gap-2 shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs truncate group-hover:text-white">{fav.name}</p>
                            <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-medium truncate">{fav.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-black text-xs block group-hover:text-white">{fav.calories} kcal</span>
                            <span className="text-[9px] text-slate-500 group-hover:text-white/80 font-bold">P: {fav.protein}g</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-bold">
                    Click any favorite to log it instantly!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Photo Snap Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-[32px] border-2 border-dashed border-white/60 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all hover:bg-white/50"
          >
            {image ? (
              <>
                <img src={image} className="w-full h-full object-cover" alt="Meal preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-sm font-black text-slate-600">Tap to snap a photo</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Recommended for accuracy</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest px-1">Meal Type</label>
              <div className="flex flex-wrap gap-2">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedType === t 
                        ? 'bg-blue-500/90 backdrop-blur-md text-white shadow-md border border-blue-400/50' 
                        : 'glass-button text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest px-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are we eating? (e.g. 2 avocados, large chicken breast, rice bowl...)"
                className="w-full p-6 glass-input rounded-[24px] min-h-[120px] text-slate-900 font-medium transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Save to Favorites Checkbox Toggle */}
            {!editingMeal && onAddFavorite && (
              <label className="flex items-center gap-3 p-3.5 glass-panel rounded-2xl cursor-pointer hover:bg-white/60 transition-all select-none">
                <input 
                  type="checkbox"
                  checked={saveToFavorite}
                  onChange={(e) => setSaveToFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer accent-rose-500"
                />
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Heart className={`w-4 h-4 ${saveToFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                  <span>Save this meal to my Favorites</span>
                </div>
              </label>
            )}
            
            <p className="text-[10px] font-bold text-slate-500 italic text-center px-4">
              Tip: You can just provide a photo and Gemini will estimate everything! Add a description for extra precision.
            </p>
          </div>
        </div>

        <div className="p-8 pt-4 glass-header border-b-0 border-t border-white/60">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={(!description && !image) || isAnalyzing}
            className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-3 font-black text-lg transition-all shadow-xl border ${
              isAnalyzing 
                ? 'bg-white/40 backdrop-blur-md text-slate-500 cursor-not-allowed shadow-none border-white/50' 
                : 'bg-blue-500/90 backdrop-blur-md text-white shadow-blue-200/50 active:scale-95 border-blue-400/50'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analyzing Meal...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                {editingMeal ? 'Update Stats' : 'Analyze & Log'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealEntryModal;
