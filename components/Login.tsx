
import React, { useState } from 'react';
import { signInWithPopup, auth, googleProvider } from '../firebase';
import { LogIn, Sparkles, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-12">
        <div className="w-24 h-24 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">NutriLens</h1>
        <p className="text-slate-500 font-medium text-lg">Your AI-Powered Nutrition Journey</p>
      </div>

      <div className="space-y-6 w-full max-w-sm">
        <div className="bg-slate-50 rounded-[32px] p-6 space-y-4 border border-slate-100">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Secure Sync</p>
              <p className="text-xs text-slate-400">Access your data on any device</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-[24px] shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-6 h-6" />
              Sign in with Google
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest px-4">
          By signing in, you agree to track your journey with AI precision
        </p>
      </div>
    </div>
  );
};

export default Login;
