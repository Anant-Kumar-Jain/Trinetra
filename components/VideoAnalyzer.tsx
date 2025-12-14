import React, { useState, useRef, useEffect } from 'react';
import { Camera, AnalysisResult, PrivacyLevel } from '../types';
import { analyzeFrame } from '../services/geminiService';
import { X, Aperture, FileSearch, ShieldAlert, ScanLine, Box, Play, Pause, AlertTriangle, Users, Settings, Monitor, RefreshCw, Eye, EyeOff, Lock, Search, Fingerprint, ChevronRight, Gauge } from 'lucide-react';

interface VideoAnalyzerProps {
  camera: Camera;
  onClose: () => void;
  onUpdatePrivacy?: (id: string, level: PrivacyLevel) => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ camera, onClose, onUpdatePrivacy }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'OBJECTS' | 'ANOMALY' | 'FACE' | 'ANPR' | 'PRIVACY' | 'SEARCH'>('OBJECTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  
  // Playback Control
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // OSD State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [osdSettings, setOsdSettings] = useState({
    show: true,
    position: 'top-left' as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    color: 'white' as 'white' | 'green' | 'amber',
    showDate: true
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Timer for OSD
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    if (videoRef.current && !videoError) {
      if (isPlaying) videoRef.current.play().catch(e => console.error("Play error:", e));
      else videoRef.current.pause();
    }
    
    return () => clearInterval(timer);
  }, [isPlaying, camera, videoError]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
        videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Capture a sequence of frames from the <video> element
  const captureFrameSequence = async () => {
    if (!videoRef.current || videoError) return;
    if (activeTab === 'SEARCH' && !searchQuery.trim()) return;
    
    if (videoRef.current.readyState < 2) {
       console.warn("Video not ready for capture");
       return;
    }

    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
        const frames: string[] = [];
        const captureCount = 3; // Capture 3 frames for slicing
        const interval = 400; // 400ms interval

        for (let i = 0; i < captureCount; i++) {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 640 / videoRef.current.videoWidth);
            canvas.width = videoRef.current.videoWidth * scale;
            canvas.height = videoRef.current.videoHeight * scale;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
                frames.push(dataUrl.split(',')[1]);
            }
            // Update progress
            setProgress(Math.round(((i + 1) / captureCount) * 40));
            // Wait for next frame
            if (i < captureCount - 1) {
                await new Promise(r => setTimeout(r, interval));
            }
        }
        
        setProgress(50); // Capturing done, sending to AI
        
        const analysis = await analyzeFrame(frames, activeTab, searchQuery);
        
        setProgress(100);
        setResult(analysis);
        setAnalyzing(false);

    } catch (e) {
        console.error("Frame capture error:", e);
        setResult({
            text: "Failed to capture video frames.",
            detectedObjects: [],
            safetyScore: 0
        });
        setAnalyzing(false);
    }
  };

  // Helper styles for OSD
  const getColorClass = (c: string) => {
      switch(c) {
          case 'green': return 'text-green-400 border-green-500/30';
          case 'amber': return 'text-amber-400 border-amber-500/30';
          default: return 'text-white border-white/20';
      }
  };

  const getPositionClass = (p: string) => {
      switch(p) {
          case 'top-right': return 'top-6 right-16 items-end'; 
          case 'bottom-left': return 'bottom-20 left-6 items-start';
          case 'bottom-right': return 'bottom-20 right-6 items-end';
          case 'top-left': default: return 'top-6 left-6 items-start';
      }
  };

  const handleRetry = () => {
    setVideoError(false);
    if (videoRef.current) {
        videoRef.current.load();
    }
  };

  const applyPrivacyRecommendation = () => {
     if (onUpdatePrivacy && camera) {
         onUpdatePrivacy(camera.id, PrivacyLevel.BLUR_FACES);
     }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 h-full flex flex-col md:flex-row overflow-hidden shadow-2xl">
      
      {/* Video Feed Section */}
      <div className="flex-1 relative bg-black flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-red-500/80 p-2 rounded-full hover:bg-red-600 text-white shadow-lg transition-transform hover:scale-110">
            <X size={16} />
        </button>

        <div className="flex-1 relative overflow-hidden group flex items-center justify-center bg-black">
            {!videoError ? (
                <video
                    ref={videoRef}
                    src={camera.videoUrl}
                    poster={camera.thumbnailUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    onError={() => setVideoError(true)}
                    onLoadedMetadata={() => {
                        if(videoRef.current) videoRef.current.playbackRate = playbackSpeed;
                    }}
                    className={`w-full h-full object-contain ${camera.privacySetting === PrivacyLevel.BLUR_FACES ? 'blur-[4px]' : ''}`} 
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-4 p-8 text-center bg-slate-900/50 w-full h-full animate-in fade-in">
                    <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-200">Video Feed Unavailable</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">Unable to establish secure connection with the surveillance node.</p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-slate-800 max-w-md w-full overflow-hidden text-left shadow-inner">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                             <ScanLine size={12} /> Source Diagnostic
                        </p>
                        <div className="space-y-2">
                            <div>
                                <span className="text-[10px] text-slate-600 block">Stream URL</span>
                                <code className="text-xs text-blue-400 font-mono break-all block bg-slate-900/50 p-2 rounded border border-slate-800/50 select-all">
                                    {camera.videoUrl}
                                </code>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-[10px] text-slate-600 block">Status</span>
                                    <span className="text-xs text-red-400 font-mono">CONNECTION_REFUSED</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-600 block">Protocol</span>
                                    <span className="text-xs text-slate-400 font-mono">HLS/HTTPS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleRetry}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <RefreshCw size={14} /> Retry Connection
                    </button>
                </div>
            )}
            
            {osdSettings.show && !videoError && (
                <div className={`absolute z-30 flex flex-col gap-1 pointer-events-none transition-all duration-300 ${getPositionClass(osdSettings.position)}`}>
                    <div className={`bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded border shadow-lg flex flex-col ${getPositionClass(osdSettings.position).includes('items-end') ? 'items-end' : 'items-start'} ${getColorClass(osdSettings.color)}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5 flex items-center gap-2">
                            <span>CAM: {camera.name}</span>
                            <span className="opacity-50">|</span>
                            <span>{camera.location}</span>
                        </div>
                        <div className="font-mono text-xl font-bold leading-none tracking-widest drop-shadow-md">
                            {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
                            {osdSettings.showDate && <span className="text-sm ml-2 opacity-75">{currentTime.toLocaleDateString('en-GB')}</span>}
                        </div>
                    </div>
                </div>
            )}
            
            {analyzing && (
                <div className="absolute inset-0 bg-blue-900/20 z-20 flex flex-col items-center justify-center pointer-events-none backdrop-blur-[1px]">
                    <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden mb-4 border border-slate-600">
                        <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="bg-black/80 px-6 py-3 rounded-lg border border-blue-500/30 shadow-2xl flex flex-col items-center">
                         <div className="flex items-center gap-2 text-blue-400 mb-1">
                             <ScanLine className="animate-pulse" size={18} />
                             <span className="font-mono font-bold tracking-wider uppercase">Processing Video</span>
                         </div>
                         <p className="text-xs text-slate-400">Extracting frames & Analyzing with Gemini Pro...</p>
                    </div>
                </div>
            )}

            {result && !analyzing && (
                <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-20">
                    <div className="self-end mt-12">
                         {activeTab === 'ANOMALY' && result.safetyScore < 50 && (
                             <div className="bg-red-600/90 text-white px-4 py-2 rounded-lg border-2 border-red-400 animate-pulse flex items-center gap-2 shadow-lg shadow-red-900/50">
                                 <AlertTriangle size={20} />
                                 <span className="font-bold">THREAT DETECTED</span>
                             </div>
                         )}
                         {activeTab === 'SEARCH' && result.matchFound && (
                             <div className="bg-green-600/90 text-white px-4 py-2 rounded-lg border-2 border-green-400 animate-bounce flex items-center gap-2 shadow-lg shadow-green-900/50">
                                 <Fingerprint size={20} />
                                 <span className="font-bold">TARGET MATCHED</span>
                             </div>
                         )}
                    </div>
                    
                    <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-4 max-w-lg self-center mb-10 transition-all transform animate-in fade-in slide-in-from-bottom-8 pointer-events-auto shadow-2xl">
                         <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                             {activeTab === 'OBJECTS' && <Box className="text-blue-400" size={18}/>}
                             {activeTab === 'ANOMALY' && <ShieldAlert className="text-red-400" size={18}/>}
                             {activeTab === 'FACE' && <Users className="text-green-400" size={18}/>}
                             {activeTab === 'ANPR' && <FileSearch className="text-yellow-400" size={18}/>}
                             {activeTab === 'PRIVACY' && <EyeOff className="text-purple-400" size={18}/>}
                             {activeTab === 'SEARCH' && <Search className="text-pink-400" size={18}/>}
                             <span className="text-sm font-bold text-white uppercase">{activeTab} ANALYSIS</span>
                         </div>
                         
                         {activeTab === 'PRIVACY' ? (
                             <div className="space-y-3">
                                 <div className="flex items-start gap-3">
                                     <div className={`p-2 rounded-full ${result.privacyRecommendation ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                         {result.privacyRecommendation ? <Eye size={20} /> : <Lock size={20} />}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-sm text-white">Gemini Assessment</h4>
                                         <p className="text-xs text-slate-300 mt-1">{result.text}</p>
                                     </div>
                                 </div>
                                 
                                 {/* Risk List */}
                                 {result.detectedObjects.length > 0 && (
                                     <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                                         <span className="text-[10px] uppercase text-red-400 font-bold mb-1 block">Risks Identified</span>
                                         <div className="flex flex-wrap gap-1">
                                             {result.detectedObjects.map((risk, i) => (
                                                 <span key={i} className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">{risk}</span>
                                             ))}
                                         </div>
                                     </div>
                                 )}

                                 {/* Explicit Privacy Action Button */}
                                 {result.privacyRecommendation && camera.privacySetting === PrivacyLevel.NONE && onUpdatePrivacy && (
                                     <button 
                                        onClick={applyPrivacyRecommendation}
                                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded shadow-lg shadow-purple-900/40 text-xs font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-2"
                                     >
                                        <EyeOff size={14} /> Apply Face Blur (Recommended) <ChevronRight size={14} />
                                     </button>
                                 )}
                             </div>
                         ) : (
                             <p className={`text-sm text-slate-200`}>{result.text}</p>
                         )}
                         
                         {activeTab === 'ANPR' && result.anprCandidates && (
                             <div className="flex flex-col gap-1 mt-2">
                                 {result.anprCandidates.map((plate, i) => (
                                      <div key={i} className="font-mono text-yellow-400 bg-yellow-900/40 px-2 py-1 rounded border border-yellow-500/30 text-center">
                                          {plate}
                                      </div>
                                 ))}
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>

        <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center px-6 justify-between relative z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-slate-300 hover:text-white" disabled={videoError}>
                    {isPlaying ? <Pause /> : <Play />}
                </button>
                
                {/* Speed Control */}
                <div className="relative">
                    <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${showSpeedMenu ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'}`}
                    >
                        <Gauge size={14} /> 
                        <span className="w-8 text-center">{playbackSpeed}x</span>
                    </button>
                    
                    {showSpeedMenu && (
                        <>
                            <div className="fixed inset-0 z-[100]" onClick={() => setShowSpeedMenu(false)}></div>
                            <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden flex flex-col min-w-[120px] z-[110] animate-in slide-in-from-bottom-2 fade-in">
                                <div className="px-3 py-2 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Playback Speed</div>
                                {[0.25, 0.5, 1, 1.5, 2, 4, 8].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => handleSpeedChange(speed)}
                                        className={`px-4 py-2 text-xs font-mono text-left hover:bg-slate-800 transition-colors flex items-center justify-between ${playbackSpeed === speed ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-300'}`}
                                    >
                                        <span>{speed}x</span>
                                        {playbackSpeed === speed && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="h-1 bg-slate-700 w-48 lg:w-64 rounded-full overflow-hidden ml-2">
                    <div className={`h-full bg-blue-500 w-2/3 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                </div>
            </div>
            
            <div className="flex gap-2 relative">
                 <button 
                    onClick={() => setOsdSettings(s => ({...s, show: !s.show}))}
                    className={`h-8 w-8 flex items-center justify-center rounded border transition-colors ${osdSettings.show ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                    <Monitor size={14} />
                 </button>
                 <button 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className={`h-8 w-8 flex items-center justify-center rounded border transition-colors ${showSettingsMenu ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                    <Settings size={14} />
                </button>
            </div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Aperture className="text-blue-400" /> AI Controls
            </h3>
        </div>

        <div className="grid grid-cols-2 gap-1 p-2 bg-slate-850">
            {[
                { id: 'OBJECTS', label: 'Object Det.', icon: Box },
                { id: 'ANOMALY', label: 'Anomaly', icon: ShieldAlert },
                { id: 'FACE', label: 'Facial Rec.', icon: Users },
                { id: 'ANPR', label: 'ANPR', icon: FileSearch },
                { id: 'PRIVACY', label: 'Privacy Audit', icon: EyeOff },
                { id: 'SEARCH', label: 'Face Match', icon: Search },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setResult(null); }}
                    className={`py-3 text-xs font-semibold flex flex-col items-center gap-1 rounded transition-colors ${activeTab === tab.id ? 'bg-slate-700 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'}`}
                >
                    <tab.icon size={16} />
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
            <div className="bg-slate-900/50 p-3 rounded mb-4 text-xs text-slate-400 border border-slate-700/50">
                <p className="font-semibold text-slate-300 mb-1">Mode Description:</p>
                {activeTab === 'OBJECTS' && "Identify and list all physical entities in the frame."}
                {activeTab === 'ANOMALY' && "Scan for safety threats, accidents, or fire hazards."}
                {activeTab === 'FACE' && "Analyze demographic attributes and crowd sentiment."}
                {activeTab === 'ANPR' && "Extract license plate numbers."}
                {activeTab === 'PRIVACY' && "Gemini (Pro) slices video frames to detect PII/faces and recommends blurring."}
                {activeTab === 'SEARCH' && "Match faces or persons in video using descriptive search query."}
            </div>

            {activeTab === 'SEARCH' && (
                <div className="mb-4 space-y-2">
                    <label className="text-xs font-bold text-slate-300">Target Description</label>
                    <textarea 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. Man in red hoodie with glasses"
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none resize-none h-24"
                    />
                </div>
            )}

            <button 
                onClick={captureFrameSequence}
                disabled={analyzing || videoError || (activeTab === 'SEARCH' && !searchQuery.trim())}
                className={`w-full py-3 rounded-lg font-bold shadow-lg mb-6 transition-all ${analyzing ? 'bg-slate-600 text-slate-300' : videoError || (activeTab === 'SEARCH' && !searchQuery.trim()) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30'}`}
            >
                {analyzing ? 'Scanning Frames...' : `Scan Video for ${activeTab}`}
            </button>
        </div>
      </div>
    </div>
  );
};