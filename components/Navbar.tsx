import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Bell, AlertTriangle, FileText, Info, Trash2, Clock, X, Menu, LogOut, User, BadgeCheck } from 'lucide-react';
import { TrinetraLogo } from './Logo';
import { MOCK_NOTIFICATIONS } from '../constants';

interface NavbarProps {
  currentRole: UserRole;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onLogout }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showHistory, setShowHistory] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <>
      <nav className="border-b border-slate-700 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <TrinetraLogo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">
                  TRINETRA
                </h1>
                <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">Third Eye Is Always Watching</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              
              {/* Role Indicator Badge (Mobile/Desktop) */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  currentRole === UserRole.AUTHORITY 
                  ? 'bg-red-900/20 border-red-500/30 text-red-400' 
                  : 'bg-blue-900/20 border-blue-500/30 text-blue-400'
              }`}>
                  {currentRole === UserRole.AUTHORITY ? <BadgeCheck size={14} /> : <User size={14} />}
                  <span className="text-xs font-bold tracking-wide">{currentRole}</span>
              </div>

              <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

              {/* Notification Bell */}
              <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`p-2 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                        <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                          Notifications 
                          {unreadCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                        </h3>
                        {notifications.length > 0 && (
                          <button 
                            onClick={handleClearAll}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors hover:bg-slate-800 px-2 py-1 rounded"
                          >
                            <Trash2 size={12} /> Clear
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              onClick={() => markAsRead(notification.id)}
                              className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-slate-800/30' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-full h-fit shrink-0 ${
                                  notification.type === 'ALERT' ? 'bg-red-500/20 text-red-400' :
                                  notification.type === 'REQUEST' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {notification.type === 'ALERT' && <AlertTriangle size={14} />}
                                  {notification.type === 'REQUEST' && <FileText size={14} />}
                                  {notification.type === 'INFO' && <Info size={14} />}
                                </div>
                                <div>
                                  <div className="flex justify-between items-start mb-1">
                                    <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                                      {notification.title}
                                    </p>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">{notification.time}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 leading-relaxed">{notification.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="p-2 bg-slate-950 border-t border-slate-800">
                        <button 
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            setShowHistory(true);
                          }}
                          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 w-full py-1.5 hover:bg-slate-800 rounded"
                        >
                          <Clock size={12} /> View Notification Archive
                        </button>
                      </div>
                    </div>
                  )}
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-red-900/20 hover:border-red-500/30 border border-transparent rounded-lg transition-all group"
                title="Logout"
              >
                <LogOut className="h-5 w-5 group-hover:text-red-400" />
                <span className="hidden md:inline text-sm font-medium group-hover:text-red-400">Logout</span>
              </button>

              <button className="md:hidden text-slate-400 p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Notification History</h2>
                  <p className="text-xs text-slate-400">Archive of all system alerts and logs</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {MOCK_NOTIFICATIONS.map((notification, index) => (
                <div key={`${notification.id}-history-${index}`} className="p-5 border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-full h-fit shrink-0 ${
                      notification.type === 'ALERT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      notification.type === 'REQUEST' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {notification.type === 'ALERT' && <AlertTriangle size={18} />}
                      {notification.type === 'REQUEST' && <FileText size={18} />}
                      {notification.type === 'INFO' && <Info size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                        <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">{notification.time}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mb-3">{notification.message}</p>
                      <div className="flex gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                           notification.type === 'ALERT' ? 'bg-red-900/30 text-red-500' :
                           notification.type === 'REQUEST' ? 'bg-orange-900/30 text-orange-500' :
                           'bg-blue-900/30 text-blue-500'
                        }`}>
                          {notification.type}
                        </span>
                        <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-900">
                          Archived
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-8 text-center">
                 <p className="text-xs text-slate-600">End of history log</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end">
              <button 
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium transition-colors"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};