
import React, { useState } from 'react';
import { UserProfile, Gender, Goal, ActivityLevel, WeightGoalSpeed, Theme } from '../types';
import { auth, signOut } from '../firebase';
import { ChevronLeft, User, Scale, Ruler, Target, Trash2, Save, Zap, Dumbbell, Timer, TrendingDown, FastForward, LogOut, Sun, Moon, Monitor, Settings } from 'lucide-react';

interface Props {
  user: UserProfile;
  onSave: (profile: Partial<UserProfile>, skipRecalculation?: boolean) => void;
  onBack: () => void;
  onReset: () => void;
}

const ProfileSettings: React.FC<Props> = ({ user, onSave, onBack, onReset }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({ ...user });
  const [activeTab, setActiveTab] = useState<'user' | 'system'>('user');

  const handleSave = () => {
    // If we only changed system settings (like theme), we can skip recalculation.
    // Let's do a simple check: if user data changed, we recalculate.
    const isUserDataChanged = 
      formData.name !== user.name ||
      formData.dateOfBirth !== user.dateOfBirth ||
      formData.weight !== user.weight ||
      formData.height !== user.height ||
      formData.goal !== user.goal ||
      formData.weightGoalSpeed !== user.weightGoalSpeed ||
      formData.activityLevel !== user.activityLevel ||
      formData.sportsInfo !== user.sportsInfo;

    onSave(formData, !isUserDataChanged);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut(auth);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col h-full overflow-hidden">
      <div className="p-6 glass-header sticky top-0 z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-3 glass-button rounded-2xl text-slate-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-slate-900">Settings</h1>
          <button onClick={handleSave} className="p-3 bg-blue-500/90 backdrop-blur-md rounded-2xl text-white shadow-lg shadow-blue-200/50 active:scale-95 transition-all border border-blue-400/50">
            <Save className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex p-1 bg-white/30 backdrop-blur-md rounded-2xl">
          <button 
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'user' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User className="w-4 h-4" /> User
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'system' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Settings className="w-4 h-4" /> System
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === 'user' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Basics</h3>
              <div className="glass-panel rounded-[32px] p-6 space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-2 block px-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 glass-input rounded-[20px] text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 mb-2 block px-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-6 py-4 glass-input rounded-[20px] text-slate-900 font-bold"
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
                      className="w-full px-6 py-4 glass-input rounded-[20px] text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 mb-2 block px-1">Height (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                      className="w-full px-6 py-4 glass-input rounded-[20px] text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Goal & Pace</h3>
              <div className="glass-panel rounded-[32px] p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 mb-2 block px-1">Primary Goal</label>
                  {Object.values(Goal).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, goal: g })}
                      className={`w-full text-left p-4 rounded-[20px] border-2 transition-all flex items-center gap-3 ${
                        formData.goal === g 
                          ? 'border-blue-400/50 bg-blue-500/10 backdrop-blur-md' 
                          : 'border-white/40 bg-white/30 backdrop-blur-sm'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${formData.goal === g ? 'bg-blue-500/90 text-white shadow-md' : 'bg-white/50 text-slate-500'}`}>
                        <Target className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-sm ${formData.goal === g ? 'text-slate-900' : 'text-slate-600'}`}>{g}</span>
                    </button>
                  ))}
                </div>

                {formData.goal !== Goal.STEADY && (
                  <div className="space-y-3 pt-4 border-t border-white/40">
                    <label className="text-xs font-black text-slate-700 mb-2 block px-1">Goal Pace</label>
                    {[
                      { val: WeightGoalSpeed.RELAXED, icon: <Timer className="w-4 h-4" /> },
                      { val: WeightGoalSpeed.MODERATE, icon: <TrendingDown className="w-4 h-4" /> },
                      { val: WeightGoalSpeed.INTENSE, icon: <FastForward className="w-4 h-4" /> }
                    ].map((pace) => (
                      <button
                        key={pace.val}
                        onClick={() => setFormData({ ...formData, weightGoalSpeed: pace.val })}
                        className={`w-full text-left p-4 rounded-[20px] border-2 transition-all flex items-center gap-3 ${
                          formData.weightGoalSpeed === pace.val 
                            ? 'border-blue-400/50 bg-blue-500/10 backdrop-blur-md' 
                            : 'border-white/40 bg-white/30 backdrop-blur-sm'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${formData.weightGoalSpeed === pace.val ? 'bg-blue-500/90 text-white shadow-md' : 'bg-white/50 text-slate-500'}`}>
                          {pace.icon}
                        </div>
                        <span className={`font-bold text-sm ${formData.weightGoalSpeed === pace.val ? 'text-slate-900' : 'text-slate-600'}`}>{pace.val}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Daily Activity</h3>
              <div className="glass-panel rounded-[32px] p-6 space-y-3">
                 {Object.values(ActivityLevel).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, activityLevel: level })}
                      className={`w-full text-left p-4 rounded-[20px] border-2 transition-all flex items-center gap-3 ${
                        formData.activityLevel === level 
                          ? 'border-blue-400/50 bg-blue-500/10 backdrop-blur-md' 
                          : 'border-white/40 bg-white/30 backdrop-blur-sm'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${formData.activityLevel === level ? 'bg-blue-500/90 text-white shadow-md' : 'bg-white/50 text-slate-500'}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-sm ${formData.activityLevel === level ? 'text-slate-900' : 'text-slate-600'}`}>{level}</span>
                    </button>
                  ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Sports & Exercise</h3>
              <div className="glass-panel rounded-[32px] p-6">
                 <label className="text-xs font-black text-slate-700 mb-2 block px-1 uppercase tracking-widest">Description</label>
                 <textarea
                    value={formData.sportsInfo}
                    onChange={(e) => setFormData({ ...formData, sportsInfo: e.target.value })}
                    placeholder="e.g. Basketball 10 hrs/week, Gym 4 hrs/week..."
                    className="w-full px-6 py-4 glass-input rounded-[20px] text-slate-900 font-bold min-h-[100px] resize-none"
                  />
              </div>
            </section>

            <section className="space-y-4 pt-4">
              <button 
                onClick={onReset}
                className="w-full py-5 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-600 font-black rounded-[24px] flex items-center justify-center gap-2 hover:bg-rose-500/30 transition-all"
              >
                <Trash2 className="w-5 h-5" /> Reset My Data
              </button>
            </section>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Theme</h3>
              <div className="glass-panel rounded-[32px] p-6 space-y-3">
                {[
                  { val: Theme.LIGHT, icon: <Sun className="w-4 h-4" /> },
                  { val: Theme.DARK, icon: <Moon className="w-4 h-4" /> },
                  { val: Theme.SYSTEM, icon: <Monitor className="w-4 h-4" /> }
                ].map((theme) => (
                  <button
                    key={theme.val}
                    onClick={() => setFormData({ ...formData, theme: theme.val })}
                    className={`w-full text-left p-4 rounded-[20px] border-2 transition-all flex items-center gap-3 ${
                      (formData.theme || Theme.SYSTEM) === theme.val 
                        ? 'border-blue-400/50 bg-blue-500/10 backdrop-blur-md' 
                        : 'border-white/40 bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${(formData.theme || Theme.SYSTEM) === theme.val ? 'bg-blue-500/90 text-white shadow-md' : 'bg-white/50 text-slate-500'}`}>
                      {theme.icon}
                    </div>
                    <span className={`font-bold text-sm ${(formData.theme || Theme.SYSTEM) === theme.val ? 'text-slate-900' : 'text-slate-600'}`}>{theme.val}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        <section className="space-y-4 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 mt-8">
          <button 
            onClick={handleLogout}
            className="w-full py-5 glass-button text-slate-700 font-black rounded-[24px] flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </section>
        
        <div className="h-10" />
      </div>
    </div>
  );
};

export default ProfileSettings;
