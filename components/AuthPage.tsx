import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Lock, User, Mail, Building, BadgeCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { TrinetraLogo } from './Logo';

interface AuthPageProps {
  onLogin: (role: UserRole) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API authentication delay
    setTimeout(() => {
      setLoading(false);
      onLogin(role);
    }, 1500);
  };

  const getThemeColor = () => role === UserRole.AUTHORITY ? 'red' : 'blue';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] transition-colors duration-700 ${role === UserRole.AUTHORITY ? 'bg-red-600/10' : 'bg-blue-600/10'}`}></div>
          <div className={`absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-700 ${role === UserRole.AUTHORITY ? 'bg-orange-600/10' : 'bg-emerald-600/10'}`}></div>
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-${role === UserRole.AUTHORITY ? 'red' : 'blue'}-500/50 to-transparent transition-all duration-700`}></div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="md:w-5/12 bg-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group">
           <div className={`absolute inset-0 bg-gradient-to-br from-${role === UserRole.AUTHORITY ? 'red' : 'blue'}-900/20 to-slate-900/50 z-0 transition-all duration-700`}></div>
           
           {/* Decorative Grid Pattern */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
                <TrinetraLogo className="h-12 w-12" />
                <h1 className="text-2xl font-bold text-white tracking-tight">TRINETRA</h1>
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
               Third Eye Is <br/>
               <span className={`transition-colors duration-500 ${role === UserRole.AUTHORITY ? 'text-red-500' : 'text-blue-400'}`}>Always Watching</span>
             </h2>
             <p className="text-slate-400 text-sm leading-relaxed mb-6">
               Securely connecting private infrastructure with public safety authorities. 
               Experience real-time incident response and AI-powered analytics with complete privacy control.
             </p>
           </div>
           
           <div className="relative z-10 mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 transition-colors ${role === UserRole.AUTHORITY ? 'text-red-400' : 'text-blue-400'}`}>
                      <Shield size={14} />
                  </div>
                  <div>
                    <span className="block font-semibold text-white">End-to-End Encryption</span>
                    <span className="text-xs text-slate-500">AES-256 standard data protection</span>
                  </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 transition-colors ${role === UserRole.AUTHORITY ? 'text-orange-400' : 'text-emerald-400'}`}>
                      <Lock size={14} />
                  </div>
                  <div>
                     <span className="block font-semibold text-white">Granular Access Control</span>
                     <span className="text-xs text-slate-500">Owner-controlled sharing permissions</span>
                  </div>
              </div>
           </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:w-7/12 p-8 md:p-12 bg-slate-950 flex flex-col justify-center transition-colors duration-500 relative">
           {/* Visual Border Top to indicate role color */}
           <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${role === UserRole.AUTHORITY ? 'red' : 'blue'}-500 to-transparent opacity-50`}></div>

           <div className="flex justify-end mb-6">
               <button 
                 onClick={() => setIsLogin(!isLogin)}
                 className={`text-xs font-medium transition-colors bg-opacity-10 px-3 py-1.5 rounded-full border border-opacity-20 ${role === UserRole.AUTHORITY ? 'text-red-400 hover:text-red-300 bg-red-900 border-red-500' : 'text-blue-400 hover:text-blue-300 bg-blue-900 border-blue-500'}`}
               >
                 {isLogin ? "Create new account" : "Back to login"}
               </button>
           </div>

           <div className="mb-8">
               <h3 className="text-2xl font-bold text-white mb-2 transition-all">
                   {isLogin 
                     ? (role === UserRole.AUTHORITY ? 'Authority Access' : 'Civil Society Login') 
                     : (role === UserRole.AUTHORITY ? 'Officer Registration' : 'Citizen Registration')}
               </h3>
               <p className="text-slate-400 text-sm transition-all">
                   {isLogin
                     ? (role === UserRole.AUTHORITY ? 'Authenticate to access the restricted Command Center.' : 'Sign in to manage your private surveillance nodes.')
                     : (role === UserRole.AUTHORITY ? 'Verification required. Official government ID needed.' : 'Join the secure civic watch network.')}
               </p>
           </div>

           {/* Role Selection Tabs */}
           <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex mb-8 relative">
               <button
                 type="button"
                 onClick={() => setRole(UserRole.CITIZEN)}
                 className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 relative z-10 ${role === UserRole.CITIZEN ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <User size={16} /> Civil Society
               </button>
               <button
                 type="button"
                 onClick={() => setRole(UserRole.AUTHORITY)}
                 className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 relative z-10 ${role === UserRole.AUTHORITY ? 'bg-red-600/10 text-red-400 border border-red-500/20 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                   <BadgeCheck size={16} /> Authority
               </button>
           </div>

           {role === UserRole.AUTHORITY && (
              <div className="mb-6 p-3 bg-red-900/10 border border-red-500/20 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="text-red-500 h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200/80 leading-relaxed">
                      <strong>Restricted Area:</strong> Unauthorized access to the Authority Grid is a punishable offense under the National Cyber Security Act. All attempts are logged.
                  </p>
              </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
               {!isLogin && (
                   <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 fade-in">
                       <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-slate-400 ml-1">Full Name</label>
                           <div className="relative group">
                               <User className="absolute left-3 top-2.5 text-slate-500 h-4 w-4 group-focus-within:text-white transition-colors" />
                               <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-slate-600 focus:ring-0 focus:outline-none transition-all" placeholder="Name" required />
                           </div>
                       </div>
                       {role === UserRole.AUTHORITY ? (
                           <div className="space-y-1.5">
                               <label className="text-xs font-semibold text-slate-400 ml-1">Badge ID</label>
                               <div className="relative group">
                                   <BadgeCheck className="absolute left-3 top-2.5 text-slate-500 h-4 w-4 group-focus-within:text-red-400 transition-colors" />
                                   <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all" placeholder="RJ-PD-8821" required />
                               </div>
                           </div>
                       ) : (
                           <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 ml-1">Phone</label>
                                <div className="relative group">
                                    <input type="tel" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" placeholder="+91..." required />
                                </div>
                           </div>
                       )}
                   </div>
               )}

               <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
                   <div className="relative group">
                       <Mail className="absolute left-3 top-2.5 text-slate-500 h-4 w-4 group-focus-within:text-white transition-colors" />
                       <input 
                           type="email" 
                           className={`w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none transition-all ${role === UserRole.AUTHORITY ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} 
                           placeholder={role === UserRole.AUTHORITY ? "officer@police.gov.in" : "user@example.com"} 
                           required 
                       />
                   </div>
               </div>

               <div className="space-y-1.5">
                   <div className="flex justify-between items-center px-1">
                       <label className="text-xs font-semibold text-slate-400">Password</label>
                       {isLogin && <a href="#" className={`text-[10px] hover:underline ${role === UserRole.AUTHORITY ? 'text-red-400' : 'text-blue-400'}`}>Forgot Password?</a>}
                   </div>
                   <div className="relative group">
                       <Lock className="absolute left-3 top-2.5 text-slate-500 h-4 w-4 group-focus-within:text-white transition-colors" />
                       <input 
                           type="password" 
                           className={`w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none transition-all ${role === UserRole.AUTHORITY ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} 
                           placeholder="••••••••" 
                           required 
                       />
                   </div>
               </div>

               {!isLogin && role === UserRole.CITIZEN && (
                   <div className="space-y-1.5 animate-in slide-in-from-bottom-2 fade-in">
                       <label className="text-xs font-semibold text-slate-400 ml-1">Premise Address</label>
                       <div className="relative group">
                           <Building className="absolute left-3 top-2.5 text-slate-500 h-4 w-4 group-focus-within:text-blue-400 transition-colors" />
                           <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Sector 4, Jaipur, Rajasthan" required />
                       </div>
                   </div>
               )}
               
               {!isLogin && role === UserRole.AUTHORITY && (
                   <div className="space-y-1.5 animate-in slide-in-from-bottom-2 fade-in">
                       <label className="text-xs font-semibold text-slate-400 ml-1">Department / Station</label>
                       <div className="relative group">
                           <Building className="absolute left-3 top-2.5 text-slate-500 h-4 w-4 group-focus-within:text-red-400 transition-colors" />
                           <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all" placeholder="Central Cyber Crime Unit" required />
                       </div>
                   </div>
               )}

               <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full font-bold py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white ${
                      role === UserRole.AUTHORITY 
                      ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-red-900/20' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20'
                  }`}
               >
                   {loading ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                       <>
                         {isLogin 
                           ? (role === UserRole.AUTHORITY ? 'Access Command Center' : 'Access Civil Dashboard') 
                           : (role === UserRole.AUTHORITY ? 'Request Officer Account' : 'Register Node')}
                         <ArrowRight size={16} />
                       </>
                   )}
               </button>
           </form>
           
           <div className="mt-8 pt-6 border-t border-slate-800 text-center">
               <p className="text-[10px] text-slate-500">
                   By accessing Trinetra, you agree to our <a href="#" className="text-slate-400 hover:text-white underline decoration-slate-700">Privacy Protocols</a> and <a href="#" className="text-slate-400 hover:text-white underline decoration-slate-700">Acceptable Use Policy</a>.
                   <br/>Unauthorized access is a punishable offense under Cyber Laws.
               </p>
           </div>
        </div>
      </div>
    </div>
  );
};