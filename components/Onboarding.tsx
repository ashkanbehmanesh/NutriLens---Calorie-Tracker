
import React, { useState } from 'react';
import { UserProfile, Gender, Goal, ActivityLevel, WeightGoalSpeed } from '../types';
import { User, Scale, ArrowRight, Ruler, Target, Zap, Dumbbell, FastForward, Timer, TrendingDown } from 'lucide-react';

interface Props {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    weight: 70,
    height: 170,
    gender: Gender.MALE,
    goal: Goal.STEADY,
    weightGoalSpeed: WeightGoalSpeed.MODERATE,
    activityLevel: ActivityLevel.MODERATE,
    sportsInfo: '',
  });

  const nextStep = () => {
    // Skip pace step if goal is maintenance
    if (step === 3 && formData.goal === Goal.STEADY) {
      setStep(5);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    // Handle skip back logic
    if (step === 5 && formData.goal === Goal.STEADY) {
      setStep(3);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const isFormValid = formData.name && formData.weight && formData.height;

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col">
      <div className="p-8 flex-1">
        <div className="mb-8">
          <div className="h-1 w-full bg-slate-100 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Step {step} of 5</p>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Welcome to NutriLens</h1>
            <p className="text-slate-500 text-lg">Let's get to know you better to calculate your ideal intake.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none"
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Gender</label>
                <div className="flex gap-2">
                  {Object.values(Gender).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`flex-1 py-4 px-4 rounded-[20px] font-bold transition-all ${
                        formData.gender === g 
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Activity Level</h1>
            <p className="text-slate-500 text-lg">How active are you on a daily basis?</p>
            
            <div className="space-y-3">
              {Object.values(ActivityLevel).map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, activityLevel: level })}
                  className={`w-full text-left p-5 rounded-[24px] border-2 transition-all flex items-center gap-4 ${
                    formData.activityLevel === level 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${formData.activityLevel === level ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${formData.activityLevel === level ? 'text-slate-900' : 'text-slate-600'}`}>{level}</h3>
                    <p className="text-xs text-slate-400">
                      {level === ActivityLevel.SEDENTARY && "Office job, little to no exercise"}
                      {level === ActivityLevel.LIGHT && "Light exercise 1-3 days/week"}
                      {level === ActivityLevel.MODERATE && "Moderate exercise 3-5 days/week"}
                      {level === ActivityLevel.ACTIVE && "Hard exercise 6-7 days/week"}
                      {level === ActivityLevel.EXTRA_ACTIVE && "Very hard exercise/physical job"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">What's your goal?</h1>
            <p className="text-slate-500 text-lg">We'll adjust your caloric intake based on your choice.</p>
            
            <div className="space-y-4">
              {Object.values(Goal).map((g) => (
                <button
                  key={g}
                  onClick={() => setFormData({ ...formData, goal: g })}
                  className={`w-full text-left p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group ${
                    formData.goal === g 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl transition-all ${formData.goal === g ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 group-hover:text-slate-600'}`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-black text-lg ${formData.goal === g ? 'text-slate-900' : 'text-slate-600'}`}>{g}</h3>
                      <p className="text-sm text-slate-500">
                        {g === Goal.STEADY && "Maintain current body weight"}
                        {g === Goal.INCREASE && "Build muscle and size"}
                        {g === Goal.DECREASE && "Burn fat and lose weight"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Goal Pace</h1>
            <p className="text-slate-500 text-lg">How quickly do you want to reach your goal?</p>
            
            <div className="space-y-4">
              {[
                { 
                  val: WeightGoalSpeed.RELAXED, 
                  desc: 'Mild progress (~0.25kg/wk)', 
                  sub: 'Sustainable and easier to maintain.',
                  icon: <Timer className="w-5 h-5" />
                },
                { 
                  val: WeightGoalSpeed.MODERATE, 
                  desc: 'Steady progress (~0.5kg/wk)', 
                  sub: 'The gold standard for most people.',
                  icon: <TrendingDown className="w-5 h-5" />
                },
                { 
                  val: WeightGoalSpeed.INTENSE, 
                  desc: 'Aggressive pace (~1kg/wk)', 
                  sub: 'Challenging, requires high discipline.',
                  icon: <FastForward className="w-5 h-5" />
                }
              ].map((pace) => (
                <button
                  key={pace.val}
                  onClick={() => setFormData({ ...formData, weightGoalSpeed: pace.val })}
                  className={`w-full text-left p-5 rounded-[24px] border-2 transition-all flex items-center gap-4 ${
                    formData.weightGoalSpeed === pace.val 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${formData.weightGoalSpeed === pace.val ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'}`}>
                    {pace.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${formData.weightGoalSpeed === pace.val ? 'text-slate-900' : 'text-slate-600'}`}>{pace.val}</h3>
                    <p className="text-sm text-slate-500 font-medium">{pace.desc}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{pace.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto max-h-[70vh] custom-scrollbar pb-10">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Extras (Optional)</h1>
            <p className="text-slate-500 text-lg">Measurements and specific sports help us be more precise.</p>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block px-1 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-500" /> Specific Sports/Exercise
                </label>
                <textarea
                  value={formData.sportsInfo}
                  onChange={(e) => setFormData({ ...formData, sportsInfo: e.target.value })}
                  placeholder="e.g. Basketball 10 hrs/week, Gym 4 hrs/week..."
                  className="w-full px-6 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mt-2">Body Measurements</h3>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Waist (cm)</label>
                  <input
                    type="number"
                    value={formData.waist || ''}
                    onChange={(e) => setFormData({ ...formData, waist: parseFloat(e.target.value) || undefined })}
                    className="w-full px-6 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none"
                    placeholder="Enter measurement"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Hips (cm)</label>
                  <input
                    type="number"
                    value={formData.hips || ''}
                    onChange={(e) => setFormData({ ...formData, hips: parseFloat(e.target.value) || undefined })}
                    className="w-full px-6 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none"
                    placeholder="Enter measurement"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Chest (cm)</label>
                  <input
                    type="number"
                    value={formData.chest || ''}
                    onChange={(e) => setFormData({ ...formData, chest: parseFloat(e.target.value) || undefined })}
                    className="w-full px-6 py-4 bg-slate-100 border-none rounded-[20px] focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all outline-none"
                    placeholder="Enter measurement"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 ios-glass border-t border-slate-100 flex gap-4">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-[24px] transition-all hover:bg-slate-200"
          >
            Back
          </button>
        )}
        <button
          onClick={step < 5 ? nextStep : handleSubmit}
          disabled={step === 1 && !isFormValid}
          className={`flex-[2] py-5 font-black rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-2 ${
            step === 1 && !isFormValid 
              ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' 
              : 'bg-blue-600 text-white shadow-blue-200 active:scale-95'
          }`}
        >
          {step < 5 ? (
            <>Continue <ArrowRight className="w-5 h-5" /></>
          ) : (
            "Let's Go!"
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
