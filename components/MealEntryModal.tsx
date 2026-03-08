
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Trash2, Loader2, Sparkles, Send } from 'lucide-react';
import { estimateMealCalories } from '../services/geminiService';
import { Meal } from '../types';

interface Props {
  type: string;
  editingMeal?: Meal | null;
  onClose: () => void;
  onAdd: (meal: Meal) => void;
  onUpdate: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

const MealEntryModal: React.FC<Props> = ({ type, editingMeal, onClose, onAdd, onUpdate, onDelete }) => {
  const [description, setDescription] = useState(editingMeal?.description || '');
  const [image, setImage] = useState<string | null>(editingMeal?.image || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMeal) {
      setDescription(editingMeal.description);
      setImage(editingMeal.image || null);
    }
  }, [editingMeal]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!description && !image) return;
    
    setIsAnalyzing(true);
    try {
      const result = await estimateMealCalories(description || "Meal in photo", image || undefined);
      
      const mealData: Meal = {
        id: editingMeal?.id || Math.random().toString(36).substr(2, 9),
        type: editingMeal?.type || type,
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        description: description,
        image: image || undefined,
        timestamp: editingMeal?.timestamp || Date.now(),
      };
      
      if (editingMeal) {
        onUpdate(mealData);
      } else {
        onAdd(mealData);
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:items-center sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-t-[48px] sm:rounded-[48px] shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{editingMeal ? 'Edit' : 'Log'} {type}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AI-Powered Tracking</p>
          </div>
          <div className="flex gap-2">
            {editingMeal && (
              <button 
                type="button"
                onClick={handleDelete} 
                className="p-3 bg-rose-50 rounded-2xl text-rose-500 hover:bg-rose-100 transition-all"
                aria-label="Delete meal"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              type="button"
              onClick={onClose} 
              className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8 custom-scrollbar">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all hover:bg-slate-100"
          >
            {image ? (
              <>
                <img src={image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-sm font-black text-slate-500">Tap to snap a photo</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Recommended for accuracy</p>
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
              <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest px-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are we eating? (e.g. 2 avocados, large chicken breast, rice bowl...)"
                className="w-full p-6 bg-slate-100 border-none rounded-[24px] min-h-[140px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none resize-none leading-relaxed"
              />
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 italic text-center px-4">
              Tip: You can just provide a photo and Gemini will estimate everything! Add a description for extra precision.
            </p>
          </div>
        </div>

        <div className="p-8 pt-4 bg-white border-t border-slate-50">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={(!description && !image) || isAnalyzing}
            className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-3 font-black text-lg transition-all shadow-2xl ${
              isAnalyzing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white shadow-blue-200 active:scale-95'
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
