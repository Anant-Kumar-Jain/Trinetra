import React, { useState, useEffect, useRef } from 'react';
import { Camera, Incident, CameraStatus } from '../types';
import { MapPin, Zap, Maximize2, Filter, Search, AlertCircle, PlayCircle, Video, Layers, AlertTriangle, X, Wifi, WifiOff, PenTool, Lock, Send, CheckCircle2, ShieldAlert, Eye, Globe, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { VideoAnalyzer } from './VideoAnalyzer';
import { verifyLocationContext } from '../services/geminiService';
import L from 'leaflet';

interface AuthorityDashboardProps {
  cameras: Camera[];
  incidents: Incident[];
  onRequestAccess?: (id: string) => void;
  onVerifyCamera?: (id: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({ cameras, incidents, onRequestAccess, onVerifyCamera }) => {
  const [dashboardCameras, setDashboardCameras] = useState<Camera[]>(cameras);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [requestingCamera, setRequestingCamera] = useState<Camera | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [viewMode, setViewMode] = useState<'MAP' | 'GRID'>('MAP');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  
  // Enhanced Filtering State
  const [filterStatus, setFilterStatus] = useState<'ALL' | CameraStatus>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  useEffect(() => {
      setDashboardCameras(cameras);
  }, [cameras]);

  useEffect(() => {
      // Simulate real-time status updates for the map
      const interval = setInterval(() => {
          setDashboardCameras(prev => {
              const idx = Math.floor(Math.random() * prev.length);
              // Only toggle status if we have enough cameras to avoid flickering everything
              if (prev.length > 0) {
                  const targetCam = prev[idx];
                  let newStatus = CameraStatus.ACTIVE;
                  if (targetCam.status === CameraStatus.ACTIVE) newStatus = CameraStatus.MAINTENANCE;
                  else if (targetCam.status === CameraStatus.MAINTENANCE) newStatus = CameraStatus.OFFLINE;
                  else newStatus = CameraStatus.ACTIVE;
                  
                  return prev.map((c, i) => i === idx ? { ...c, status: newStatus } : c);
              }
              return prev;
          });
      }, 3500);
      return () => clearInterval(interval);
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const criticalIncidents = incidents.filter(
    inc => (inc.severity === 'HIGH' || inc.severity === 'CRITICAL') && !dismissedAlerts.has(inc.id)
  );

  const currentAlert = criticalIncidents.length > 0 ? criticalIncidents[0] : null;

  const handleDismissAlert = (id: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(id);
    setDismissedAlerts(newDismissed);
  };

  const handleRequestAccess = () => {
    setRequestSent(true);
    if (requestingCamera && onRequestAccess) {
        onRequestAccess(requestingCamera.id);
    }
    setTimeout(() => {
        setRequestSent(false);
        setRequestingCamera(null);
    }, 2000);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
      }).setView([26.9124, 75.7873], 13);
      
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    
    // Clear existing markers (excluding tiles)
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Filter cameras based on selected status
    const visibleCameras = dashboardCameras.filter(c => {
        if (filterStatus === 'ALL') return true;
        return c.status === filterStatus;
    });

    visibleCameras.forEach(cam => {
      let fillColor = '#64748b';
      let statusColorText = 'text-slate-600';
      let statusBg = 'bg-slate-100';
      const isPrivate = !cam.isShared;

      if (isPrivate) {
          fillColor = '#6366f1'; 
          statusColorText = 'text-indigo-700';
          statusBg = 'bg-indigo-100';
      } else if (cam.status === CameraStatus.ACTIVE) {
          fillColor = '#10b981';
          statusColorText = 'text-green-700';
          statusBg = 'bg-green-100';
      } else if (cam.status === CameraStatus.MAINTENANCE) {
          fillColor = '#f59e0b';
          statusColorText = 'text-amber-700';
          statusBg = 'bg-amber-100';
      } else if (cam.status === CameraStatus.OFFLINE) {
          fillColor = '#ef4444';
          statusColorText = 'text-red-700';
          statusBg = 'bg-red-100';
      }

      // Add a pulse effect for active shared cameras
      if (cam.status === CameraStatus.ACTIVE && cam.isShared) {
         const pulse = L.circleMarker([cam.lat, cam.lng], {
             radius: 12,
             fillColor: fillColor,
             color: 'transparent',
             fillOpacity: 0.2
         }).addTo(map);
      }

      const marker = L.circleMarker([cam.lat, cam.lng], {
          radius: 6, 
          fillColor: fillColor,
          color: '#fff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 1
      }).addTo(map);

      const actionBtnId = isPrivate ? `request-cam-${cam.id}` : `view-cam-${cam.id}`;
      const verifyBtnId = `verify-cam-${cam.id}`;
      
      const actionBtnText = isPrivate ? (cam.pendingAccessRequest ? 'Request Pending' : 'Request Access') : 'View Feed';
      const actionBtnClass = isPrivate 
          ? (cam.pendingAccessRequest ? 'bg-indigo-900 text-indigo-300 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-500')
          : 'bg-slate-900 text-white hover:bg-slate-700';

      const statusLabel = isPrivate ? 'PRIVATE' : cam.status;
      const verifiedBadge = cam.locationVerified ? 
          '<div class="flex items-center gap-1 text-[10px] text-green-600 font-bold mb-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg> Verified Location</div>' 
          : '<div class="flex items-center gap-1 text-[10px] text-slate-500 font-medium mb-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Unverified</div>';

      marker.bindPopup(`
          <div class="font-sans min-w-[220px] p-1">
              ${verifiedBadge}
              <div class="flex items-center justify-between mb-2">
                 <h3 class="font-bold text-sm text-slate-800">${cam.name}</h3>
                 <span class="text-[10px] px-1.5 py-0.5 rounded ${statusBg} ${statusColorText} font-bold border border-current opacity-70">${statusLabel}</span>
              </div>
              <p class="text-xs text-slate-600 mb-2 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-50"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${cam.location}</p>
              ${isPrivate ? '<div class="text-[10px] text-slate-500 mb-2 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Owner permission required</div>' : ''}
              
              <div class="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                 <button id="${actionBtnId}" class="${actionBtnClass} text-xs px-3 py-2 rounded w-full transition-colors font-bold shadow-sm" ${isPrivate && cam.pendingAccessRequest ? 'disabled' : ''}>${actionBtnText}</button>
                 ${!cam.locationVerified ? `<button id="${verifyBtnId}" class="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs px-3 py-1.5 rounded w-full transition-colors font-medium">Verify Location with Maps</button>` : ''}
              </div>
          </div>
      `, {
          closeButton: false,
          className: 'custom-popup'
      });

      marker.on('popupopen', () => {
           const btn = document.getElementById(actionBtnId);
           if (btn) {
               btn.onclick = () => {
                   if (isPrivate) {
                       if (!cam.pendingAccessRequest) setRequestingCamera(cam);
                   } else {
                       setSelectedCamera(cam);
                   }
               };
           }

           // Handle Verify Button
           const vBtn = document.getElementById(verifyBtnId);
           if (vBtn) {
               vBtn.onclick = async () => {
                   vBtn.innerText = "Verifying...";
                   vBtn.setAttribute('disabled', 'true');
                   try {
                       const result = await verifyLocationContext(cam.location, cam.lat, cam.lng);
                       if (result.verified && onVerifyCamera) {
                           onVerifyCamera(cam.id);
                       } else {
                           vBtn.innerText = "Verification Failed";
                           vBtn.classList.add('text-red-600', 'bg-red-50');
                       }
                   } catch (e) {
                       vBtn.innerText = "Error";
                   }
               };
           }
      });
    });

    incidents.forEach(inc => {
         const baseCam = cameras.find(c => c.id === inc.cameraId) || cameras[0];
         // Slight offset to not overlap perfectly if camera also shown
         const lat = baseCam.lat + 0.0005; 
         const lng = baseCam.lng + 0.0005;
         
         let iconPath = '';
         if (inc.type === 'FIRE') iconPath = `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-2.74-4.88-2.74-4.88S5.5 10.62 5.5 12a2.5 2.5 0 0 0 2.5 2.5Z" /><path d="M12 2c0 0-8 6-8 12a8 8 0 0 0 16 0c0-6-8-12-8-12Z" />`; 
         else if (inc.type === 'ACCIDENT') iconPath = `<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>`; 
         else iconPath = `<circle cx="12" cy="12" r="10"/>`;

         let colorClass = 'bg-blue-500';
         if(inc.severity === 'MEDIUM') colorClass = 'bg-amber-500'; 
         if(inc.severity === 'HIGH') colorClass = 'bg-orange-600'; 
         if(inc.severity === 'CRITICAL') colorClass = 'bg-red-600'; 

         const icon = L.divIcon({
             className: 'custom-incident-icon',
             html: `<div class="relative flex items-center justify-center w-full h-full group"><div class="absolute inset-0 rounded-full ${colorClass} animate-ping opacity-75"></div><div class="relative z-10 w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center text-white transform group-hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconPath}</svg></div></div>`,
             iconSize: [32, 32],
             iconAnchor: [16, 16]
         });
         
         const marker = L.marker([lat, lng], { icon }).addTo(map);
         marker.bindTooltip(`${inc.type}: ${inc.location}`, { direction: 'top', offset: [0, -16] });
    });

  }, [dashboardCameras, incidents, cameras, filterStatus]);

  useEffect(() => {
      return () => {
          if (mapInstanceRef.current) {
              mapInstanceRef.current.remove();
              mapInstanceRef.current = null;
          }
      }
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      
      {/* Sidebar - Incident Feed */}
      <div className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col z-[1500] shadow-xl relative">
        <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={16} /> Live Incidents
            </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {incidents.map(incident => (
                <div key={incident.id} className={`bg-slate-800 p-3 rounded border-l-4 cursor-pointer transition-colors group ${incident.severity === 'HIGH' || incident.severity === 'CRITICAL' ? 'border-red-500 bg-red-900/10' : 'border-slate-600 hover:bg-slate-700'}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold text-sm ${incident.severity === 'HIGH' || incident.severity === 'CRITICAL' ? 'text-red-400' : 'text-slate-300'}`}>{incident.type}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{incident.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{incident.description}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {currentAlert && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between shadow-lg z-[2100] animate-in slide-in-from-top-full duration-300 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full animate-pulse"><AlertTriangle size={20} className="text-white" /></div>
              <div><h3 className="font-bold text-sm uppercase tracking-wide">{currentAlert.severity} ALERT: {currentAlert.type}</h3></div>
            </div>
            <button onClick={() => handleDismissAlert(currentAlert.id)}><X size={20} /></button>
          </div>
        )}

        <div className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-[2050] relative">
            
            {/* Filter Controls */}
            <div className="flex gap-3 relative">
                <div className="relative">
                    <button 
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${filterStatus !== 'ALL' ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'}`}
                    >
                        <Filter size={14} /> 
                        {filterStatus === 'ALL' ? 'Filter: All Nodes' : `Filter: ${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}`}
                        <ChevronDown size={12} />
                    </button>
                    
                    {isFilterDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-[3000] overflow-hidden">
                            <button onClick={() => { setFilterStatus('ALL'); setIsFilterDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 ${filterStatus === 'ALL' ? 'text-white bg-slate-800' : 'text-slate-400'}`}>All Nodes</button>
                            <button onClick={() => { setFilterStatus(CameraStatus.ACTIVE); setIsFilterDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 ${filterStatus === CameraStatus.ACTIVE ? 'text-green-400 bg-slate-800' : 'text-green-600'}`}>Active Only</button>
                            <button onClick={() => { setFilterStatus(CameraStatus.OFFLINE); setIsFilterDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 ${filterStatus === CameraStatus.OFFLINE ? 'text-red-400 bg-slate-800' : 'text-red-600'}`}>Offline Only</button>
                            <button onClick={() => { setFilterStatus(CameraStatus.MAINTENANCE); setIsFilterDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-800 ${filterStatus === CameraStatus.MAINTENANCE ? 'text-amber-400 bg-slate-800' : 'text-amber-600'}`}>Maintenance Only</button>
                        </div>
                    )}
                </div>
                
                {/* Overlay to close dropdown if clicking outside */}
                {isFilterDropdownOpen && (
                    <div className="fixed inset-0 z-[2900]" onClick={() => setIsFilterDropdownOpen(false)}></div>
                )}

                <div className="h-8 w-px bg-slate-800 mx-1"></div>
                <button onClick={() => setViewMode('MAP')} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all ${viewMode === 'MAP' ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-400 border-transparent hover:text-white'}`}><Globe size={14} /> Map View</button>
                <button onClick={() => setViewMode('GRID')} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all ${viewMode === 'GRID' ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-400 border-transparent hover:text-white'}`}><Layers size={14} /> Grid View</button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live System Status
            </div>
        </div>

        <div className="flex-1 relative bg-slate-950 overflow-hidden">
            <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full"></div>

            {/* Map Legend Overlay */}
            {viewMode === 'MAP' && (
                <div className="absolute bottom-8 left-6 z-[400] bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4 min-w-[180px]">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-700/50">Network Status</h4>
                    <div className="space-y-2.5">
                        {(filterStatus === 'ALL' || filterStatus === CameraStatus.ACTIVE) && (
                            <div className="flex items-center gap-3">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-slate-300 font-medium">Active Shared</span>
                            </div>
                        )}
                        {filterStatus === 'ALL' && (
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20"></div>
                                <span className="text-xs text-slate-300 font-medium">Private Node</span>
                            </div>
                        )}
                        {(filterStatus === 'ALL' || filterStatus === CameraStatus.MAINTENANCE) && (
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-xs text-slate-300 font-medium">Maintenance</span>
                            </div>
                        )}
                        {(filterStatus === 'ALL' || filterStatus === CameraStatus.OFFLINE) && (
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-slate-300 font-medium">Offline</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
                            <span className="text-xs text-slate-300 font-medium">Incident</span>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'GRID' && (
                <div className="absolute inset-0 z-[2000] bg-slate-950 p-6 overflow-y-auto animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {dashboardCameras.filter(c => filterStatus === 'ALL' || c.status === filterStatus).map(cam => (
                            <div key={cam.id} className="bg-black rounded-lg overflow-hidden border border-slate-700 relative group aspect-video">
                                {!cam.isShared ? (
                                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                        <div className="bg-slate-800 p-4 rounded-full border border-slate-700 shadow-xl relative z-10"><Lock size={32} className="text-slate-400" /></div>
                                        <div className="text-center relative z-10"><h4 className="text-slate-300 font-bold tracking-wide">RESTRICTED FEED</h4></div>
                                    </div>
                                ) : (
                                    <video src={cam.videoUrl} poster={cam.thumbnailUrl} autoPlay muted loop playsInline className={`w-full h-full object-cover opacity-60 ${cam.privacySetting === 'BLUR_FACES' ? 'blur-sm' : ''}`} />
                                )}
                                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                                    <span className="text-xs font-mono text-white">{!cam.isShared ? 'PRIVATE' : cam.status}</span>
                                    {cam.locationVerified && <span className="text-[10px] text-green-400 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedCamera && (
                 <div className="absolute inset-0 z-[3000] bg-slate-950/95 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                     <VideoAnalyzer camera={selectedCamera} onClose={() => setSelectedCamera(null)} />
                 </div>
            )}
            
            {requestingCamera && (
                <div className="absolute inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                         {requestSent ? (
                             <div className="p-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                                 <div className="bg-green-500/20 p-4 rounded-full mb-4"><CheckCircle2 className="text-green-500" size={48} /></div>
                                 <h3 className="text-xl font-bold text-white mb-2">Request Sent</h3>
                             </div>
                         ) : (
                             <div className="p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Request Access</h3>
                                <p className="text-sm text-slate-400 mb-6">Requesting access to {requestingCamera.name}.</p>
                                <button onClick={handleRequestAccess} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg">Send Official Request</button>
                                <button onClick={() => setRequestingCamera(null)} className="w-full mt-2 text-slate-500 hover:text-white py-2">Cancel</button>
                             </div>
                         )}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};