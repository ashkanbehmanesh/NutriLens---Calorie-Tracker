
import React, { useState } from 'react';
import { UserProfile, Gender, Goal, ActivityLevel, WeightGoalSpeed } from '../types';
import { auth, signOut } from '../firebase';
import { ChevronLeft, User, Scale, Ruler, Target, Trash2, Save, Zap, Dumbbell, Timer, TrendingDown, FastForward, LogOut } from 'lucide-react';

interface Props {
  user: UserProfile;
  onSave: (profile: Partial<UserProfile>) => void;
  onBack: () => void;
  onReset: () => void;
}

const ProfileSettings: React.FC<Props> = ({ user, onSave, onBack, onReset }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({ ...user });

  const handleSave = () => {
    onSave(formData);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut(auth);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-full overflow-hidden">
      <div className="p-6 bg-white border-b border-slate-100 ios-glass sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onBack} className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Profile</h1>
        <button onClick={handleSave} className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100 active:scale-95 transition-all">
          <Save className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Basics</h3>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="text-xs font-black text-slate-700 mb-2 block px-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 mb-2 block px-1">Weight (kg)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-700 mb-2 block px-1">Height (cm)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Daily Activity</h3>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-3">
             {Object.values(ActivityLevel).map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, activityLevel: level })}
                  className={`w-full text-left p-4 rounded-[20px] border-2 transition-all flex items-center gap-3 ${
                    formData.activityLevel === level 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-50 bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${formData.activityLevel === level ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className={`font-bold text-sm ${formData.activityLevel === level ? 'text-slate-900' : 'text-slate-600'}`}>{level}</span>
                </button>
              ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Sports & Exercise</h3>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
             <label className="text-xs font-black text-slate-700 mb-2 block px-1 uppercase tracking-widest">Description</label>
             <textarea
                value={formData.sportsInfo}
                onChange={(e) => setFormData({ ...formData, sportsInfo: e.target.value })}
                placeholder="e.g. Basketball 10 hrs/week, Gym 4 hrs/week..."
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold outline-none min-h-[100px] resize-none"
              />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Account</h3>
          <div className="space-y-3">
            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-white border border-slate-200 text-slate-600 font-black rounded-[24px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
            <button 
              onClick={onReset}
              className="w-full py-5 bg-rose-50 text-rose-500 font-black rounded-[24px] flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
            >
              <Trash2 className="w-5 h-5" /> Reset My Data
            </button>
          </div>
        </section>
        
        <div className="h-10" />
      </div>
    </div>
  );
};

export default ProfileSettings;
