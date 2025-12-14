import React, { useState, useEffect } from 'react';
import { Camera, CameraStatus, PrivacyLevel } from '../types';
import { Lock, Unlock, Activity, EyeOff, ShieldCheck, AlertTriangle, Play, ChevronLeft, LayoutGrid, Smartphone, Key, Timer, CheckCircle2, RefreshCw, MapPin, Check, X, BellRing, Settings2 } from 'lucide-react';
import { VideoAnalyzer } from './VideoAnalyzer';
import { verifyLocationContext } from '../services/geminiService';

interface CitizenPortalProps {
  cameras: Camera[];
  toggleSharing: (id: string, duration?: number) => void;
  rejectRequest: (id: string) => void;
  updatePrivacy: (id: string, level: PrivacyLevel) => void;
  toggleAutoApprove: (id: string) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ cameras, toggleSharing, rejectRequest, updatePrivacy, toggleAutoApprove }) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  
  // OTP & Approval State
  const [authStep, setAuthStep] = useState<'REVIEW' | 'OTP' | 'SUCCESS'>('REVIEW');
  const [otp, setOtp] = useState('');
  const [accessDuration, setAccessDuration] = useState('120'); 
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  // Location Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, {verified: boolean, summary: string}>>({});

  const selectedCamera = cameras.find(c => c.id === selectedCameraId);

  // Derived state: Pending Requests (Simulated by 'pendingAccessRequest' property)
  const pendingRequests = cameras.filter(c => c.pendingAccessRequest && !c.isShared);

  useEffect(() => {
    if (!showEmergencyModal) {
      setAuthStep('REVIEW');
      setOtp('');
      setError('');
      setAccessDuration('120');
    }
  }, [showEmergencyModal]);

  const handleSendOtp = () => {
    setIsResending(true);
    setTimeout(() => {
        setIsResending(false);
        setAuthStep('OTP');
    }, 800);
  };

  const handleVerifyOtp = () => {
      if (otp === '1234') {
          setAuthStep('SUCCESS');
          setTimeout(() => {
              // Grant access logic
              if (pendingRequests.length > 0) {
                  // If verifying specific pending requests
                  pendingRequests.forEach(req => toggleSharing(req.id, parseInt(accessDuration)));
              } else {
                  // Default emergency flow
                  toggleSharing(cameras[0].id, parseInt(accessDuration));
              }
              setShowEmergencyModal(false);
          }, 1500);
      } else {
          setError('Invalid OTP. Please try again.');
          setOtp('');
      }
  };

  const handleVerifyLocation = async (cam: Camera) => {
      setVerifyingId(cam.id);
      try {
          const result = await verifyLocationContext(cam.location, cam.lat, cam.lng);
          setVerificationResults(prev => ({
              ...prev,
              [cam.id]: result
          }));
      } catch (e) {
          console.error(e);
      }
      setVerifyingId(null);
  };

  // Live View Mode
  if (selectedCamera) {
      return (
          <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedCameraId(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                      >
                          <ChevronLeft size={20} />
                          <span className="text-sm font-semibold">Back to Grid</span>
                      </button>
                      <div className="h-6 w-px bg-slate-700"></div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="text-blue-500" size={20}/> 
                          Live Monitor
                      </h2>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wider hidden sm:inline-block">Switch Feed:</span>
                      <select 
                        value={selectedCamera.id}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                      >
                          {cameras.map(cam => (
                              <option key={cam.id} value={cam.id}>
                                  {cam.name} ({cam.status})
                              </option>
                          ))}
                      </select>
                  </div>
              </div>

              <div className="flex-1 p-4 md:p-6 overflow-hidden">
                  <div className="h-full w-full max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden border border-slate-800">
                      <VideoAnalyzer 
                          camera={selectedCamera} 
                          onClose={() => setSelectedCameraId(null)}
                          onUpdatePrivacy={updatePrivacy} 
                      />
                  </div>
              </div>
          </div>
      );
  }

  // Grid View Mode
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-top-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Surveillance Nodes</h2>
          <p className="text-slate-400 max-w-2xl">
            Manage your private CCTV feeds. You retain full ownership. Verify locations using Google Maps data to increase trust score.
          </p>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-lg flex items-center gap-3">
          <ShieldCheck className="text-emerald-400 h-8 w-8" />
          <div>
            <p className="text-sm text-emerald-300 font-semibold">System Secure</p>
            <p className="text-xs text-emerald-400/70">Data is end-to-end encrypted</p>
          </div>
        </div>
      </div>

      {/* Pending Access Requests */}
      {pendingRequests.length > 0 && (
          <div className="bg-slate-900 border border-indigo-500/50 rounded-xl p-6 shadow-xl shadow-indigo-900/10 animate-in slide-in-from-top-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BellRing className="text-indigo-400" /> Pending Access Requests
              </h3>
              <div className="grid gap-4">
                  {pendingRequests.map(req => (
                      <div key={req.id} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                          <div>
                              <p className="text-sm font-bold text-white">{req.name}</p>
                              <p className="text-xs text-slate-400">{req.location}</p>
                              <p className="text-xs text-indigo-300 mt-1">Authority requested access • Reason: "Incident Investigation"</p>
                          </div>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => toggleSharing(req.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1"
                              >
                                  <Check size={14} /> Approve
                              </button>
                              <button 
                                onClick={() => rejectRequest(req.id)}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded text-xs font-bold flex items-center gap-1"
                              >
                                  <X size={14} /> Reject
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Emergency Override Banner */}
      {showEmergencyModal || pendingRequests.length === 0 ? (
           <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 p-6 rounded-xl flex items-center justify-between shadow-lg shadow-orange-900/10">
           <div className="flex items-center gap-4">
               <div className="bg-orange-500/20 p-3 rounded-full animate-pulse">
                   <AlertTriangle className="text-orange-500 h-6 w-6" />
               </div>
               <div>
                   <h3 className="text-lg font-semibold text-orange-200">Neighborhood Emergency Alert</h3>
                   <p className="text-sm text-orange-200/70">Police have requested temporary access to cameras in **Sector 4** due to a reported robbery.</p>
               </div>
           </div>
           <button 
               onClick={() => setShowEmergencyModal(true)}
               className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-orange-900/20"
           >
               Review Request
           </button>
         </div>
      ) : null}

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((cam) => {
            const verification = verificationResults[cam.id];
            return (
              <div key={cam.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/30 transition-all shadow-xl group">
                <div className="relative h-48 bg-slate-900">
                  <video 
                    src={cam.videoUrl} 
                    poster={cam.thumbnailUrl}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity ${cam.privacySetting === PrivacyLevel.BLUR_FACES ? 'blur-[4px]' : ''}`}
                  />
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cam.status === CameraStatus.ACTIVE ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {cam.status}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <button 
                        onClick={() => setSelectedCameraId(cam.id)}
                        className="bg-blue-600/90 hover:bg-blue-500 text-white p-3 rounded-full backdrop-blur-sm transform hover:scale-110 transition-transform shadow-lg"
                      >
                          <Play fill="currentColor" size={24} className="ml-1" />
                      </button>
                  </div>
                  
                  {!cam.isShared && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-10 pointer-events-none">
                          <div className="flex flex-col items-center text-slate-400">
                              <EyeOff className="h-8 w-8 mb-2" />
                              <span className="text-sm font-medium">Sharing Disabled</span>
                          </div>
                      </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-white">{cam.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <LayoutGrid size={12}/> {cam.location}
                      </p>
                    </div>
                    <button
                        onClick={() => toggleSharing(cam.id)}
                        className={`p-2 rounded-lg transition-colors ${cam.isShared ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        title={cam.isShared ? "Revoke Access" : "Grant Access"}
                    >
                        {cam.isShared ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                  </div>
                  
                  {/* Verification Section */}
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50 flex items-center justify-between">
                        {verification?.verified || cam.locationVerified ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-bold">Verified Location</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-slate-500" />
                                <span className="text-xs text-slate-400">Location Unverified</span>
                            </div>
                        )}
                        
                        {!(verification?.verified || cam.locationVerified) && (
                            <button 
                                onClick={() => handleVerifyLocation(cam)}
                                disabled={!!verifyingId}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
                            >
                                {verifyingId === cam.id ? 'Verifying...' : 'Verify with Maps'}
                            </button>
                        )}
                  </div>
                  {verification && verification.summary && (
                      <p className="text-[10px] text-slate-500 italic">{verification.summary}</p>
                  )}

                  {/* Config & Privacy Controls */}
                  <div className="bg-slate-900/50 p-3 rounded-lg space-y-3 border border-slate-700/50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="text-sm text-slate-300 font-medium">Configuration</span>
                        <Settings2 size={14} className="text-slate-500"/>
                    </div>
                    
                    {/* Auto Approve Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Auto-Approve Requests</span>
                        <button 
                            onClick={() => toggleAutoApprove(cam.id)}
                            className={`w-9 h-5 rounded-full relative transition-colors ${cam.autoApprove ? 'bg-green-600' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${cam.autoApprove ? 'left-5' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-400">Privacy Mode</span>
                    </div>
                    <div className="flex gap-2">
                        {[PrivacyLevel.NONE, PrivacyLevel.BLUR_FACES, PrivacyLevel.ANONYMIZED].map((level) => (
                            <button
                                key={level}
                                onClick={() => updatePrivacy(cam.id, level)}
                                disabled={!cam.isShared}
                                className={`flex-1 py-1.5 px-2 text-[10px] uppercase tracking-wider font-semibold rounded border transition-all ${
                                    cam.privacySetting === level 
                                    ? 'bg-blue-600 border-blue-500 text-white' 
                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                                } ${!cam.isShared ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {level === PrivacyLevel.NONE ? 'Raw' : level.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
        })}
      </div>

      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-orange-500/50 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
                {/* Auth Steps (Same as before) */}
                {authStep === 'REVIEW' && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-500/20 p-2 rounded-full">
                                <AlertTriangle className="text-orange-500" size={24}/>
                            </div>
                            <h3 className="text-xl font-bold text-white">Emergency Access Request</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                            The Local Authority (Jaipur Police) requests access to cameras.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowEmergencyModal(false)} className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-medium text-sm">Reject</button>
                            <button onClick={handleSendOtp} disabled={isResending} className="flex-1 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-900/40 transition-all text-sm flex items-center justify-center gap-2">Verify & Approve</button>
                        </div>
                    </div>
                )}
                {authStep === 'OTP' && (
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-500/20 p-2 rounded-full"><Smartphone className="text-blue-400" size={24}/></div>
                            <div><h3 className="text-lg font-bold text-white">Verify Identity</h3><p className="text-xs text-slate-400">Enter code sent to +91 ******8899</p></div>
                        </div>
                        <div className="mb-6 text-center">
                            <input type="text" value={otp} onChange={(e) => { if(e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setOtp(e.target.value); setError(''); }} placeholder="0000" className="bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] font-mono text-white focus:border-blue-500 outline-none w-full" autoFocus />
                            {error && <p className="text-red-400 text-xs mt-2 animate-pulse">{error}</p>}
                            <p className="text-xs text-slate-500 mt-3">Mock OTP for demo: <span className="text-slate-300 font-mono">1234</span></p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleVerifyOtp} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-all text-sm flex items-center justify-center gap-2"><Key size={16} /> Confirm Access</button>
                            <button onClick={() => setAuthStep('REVIEW')} className="text-slate-500 text-xs hover:text-white transition-colors">Cancel & Go Back</button>
                        </div>
                    </div>
                )}
                {authStep === 'SUCCESS' && (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="bg-green-500/20 p-4 rounded-full mb-4 animate-in zoom-in duration-300"><CheckCircle2 className="text-green-500" size={48} /></div>
                        <h3 className="text-xl font-bold text-white mb-2">Access Granted</h3>
                        <p className="text-slate-400 text-sm">Authority access enabled.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};