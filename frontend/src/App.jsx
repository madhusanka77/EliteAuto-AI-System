import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home'; 
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vehicles from './pages/Vehicles';
import Login from './pages/Login';
import VehicleDetails from './pages/VehicleDetails';
import AddVehicle from './pages/AddVehicle'; 
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    return <Navigate to="/login" />;
  }
  return children; 
};

function Sidebar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [toast, setToast] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [hotLeadsCount, setHotLeadsCount] = useState(0);

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
  const isAdmin = loggedInUser && loggedInUser.role?.toUpperCase() === 'ADMIN';
  const canManageVehicles = loggedInUser && (loggedInUser.role?.toUpperCase() === 'ADMIN' || loggedInUser.role?.toUpperCase() === 'SELLER');

  useEffect(() => {
    if (!isAdmin) return;

    const fetchLeadsCount = async () => {
      try {
        const res = await axios.get('http://localhost:5000/get-hot-leads');
        if (res.data.status === "success") {
          setHotLeadsCount(res.data.alerts.length);
        }
      } catch (err) {
        console.error("Failed to fetch lead count", err);
      }
    };

    fetchLeadsCount();
    const interval = setInterval(fetchLeadsCount, 10000); 

    const handleLeadUpdate = () => fetchLeadsCount();
    window.addEventListener('leadUpdated', handleLeadUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('leadUpdated', handleLeadUpdate); // Cleanup
    };
  }, [isAdmin]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    showToast("Logged out successfully! 👋", "success");
    setTimeout(() => navigate('/login'), 1000);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const firstName = loggedInUser?.firstName || loggedInUser?.first_name || '';
  const lastName = loggedInUser?.lastName || loggedInUser?.last_name || '';
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : 'U';
  const userName = firstName ? `${firstName} ${lastName}`.trim() : 'User';

  // 🎨 NavItem Component එක
  const NavItem = ({ path, icon, label, badgeCount }) => {
    const active = isActive(path);
    return (
      <Link 
        to={path} 
        className={`flex items-center ${isExpanded ? 'gap-4 px-4 py-3.5 rounded-2xl justify-start' : 'justify-center rounded-2xl w-12 h-12 mx-auto'} font-semibold text-[13px] transition-all duration-300 ${active ? 'bg-[#0096ff] text-white shadow-[0_0_20px_rgba(0,150,255,0.3)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
        title={!isExpanded ? label : ""}
      >
        
        <div className="flex-shrink-0 relative">
          {icon}
          
          {badgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 ${active ? 'border-[#0096ff]' : 'border-white dark:border-[#11181f]'}`}></span>
            </span>
          )}
        </div>
        
        
        {isExpanded && (
          <div className="flex items-center justify-between w-full">
            <span className="whitespace-nowrap">{label}</span>
            {badgeCount > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {badgeCount} NEW
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {toast && (
        <div className={`fixed top-10 right-6 z-[200] min-w-[280px] p-4 rounded-xl shadow-2xl border-l-4 transform transition-all duration-300 flex items-center gap-3 bg-white dark:bg-[#1a2228] text-slate-900 dark:text-white ${toast.type === 'success' ? 'border-[#0096ff]' : 'border-red-500'}`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-semibold text-xs tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* 🎨 SIDEBAR */}
      <aside className={`${isExpanded ? 'w-64' : 'w-20'} h-screen bg-white dark:bg-[#11181f] border-r border-slate-200 dark:border-white/5 flex flex-col flex-shrink-0 relative z-50 transition-all duration-300 shadow-xl dark:shadow-none`}>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="absolute -right-3 top-10 w-6 h-6 bg-[#0096ff] text-white rounded-full flex items-center justify-center z-50 shadow-[0_0_10px_rgba(0,150,255,0.5)] hover:scale-110 transition-transform cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            {isExpanded ? <polyline points="15 18 9 12 15 6"></polyline> : <polyline points="9 18 15 12 9 6"></polyline>}
          </svg>
        </button>

        <div className={`h-24 flex items-center border-b border-slate-200 dark:border-white/5 mb-6 overflow-hidden ${isExpanded ? 'px-8 justify-start' : 'justify-center'} transition-all duration-300`}>
          <Link to="/" className={`flex ${isExpanded ? 'flex-row items-center gap-3' : 'flex-col items-center gap-1'} group w-full`}>
            <div className="text-[#0096ff] flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={isExpanded ? "w-8 h-8" : "w-6 h-6"}>
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 0 0 6.622 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              </svg>
            </div>
            {isExpanded ? (
              <span className="text-2xl font-black tracking-wide text-slate-900 dark:text-white whitespace-nowrap">
                Elite<span className="text-[#0096ff]">Auto</span>
              </span>
            ) : (
              <span className="text-[9px] font-black tracking-wide text-slate-900 dark:text-white uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                EA
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-3 py-2 space-y-3 scrollbar-hide">
          <NavItem path="/" label="Home Page" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>} />
          
          {loggedInUser && (
            <>
              
              {isAdmin && <NavItem path="/dashboard" label="Dashboard" badgeCount={hotLeadsCount} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>} />}
              
              <NavItem path="/vehicles" label="Inventory" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="8" rx="2" ry="2"></rect><path d="M5 11L7 6h10l2 5"></path><circle cx="7" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle></svg>} />
              {canManageVehicles && <NavItem path="/add-vehicle" label="Add Vehicle" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>} />}
              {isAdmin && <NavItem path="/users" label="Manage Users" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} />}
            </>
          )}
        </div>

        {/* User Profile & Theme Toggle */}
        <div className={`p-4 mt-auto w-full flex flex-col gap-3 transition-all duration-300 border-t border-slate-200 dark:border-white/5`}>
          <button onClick={toggleTheme} className={`flex items-center ${isExpanded ? 'justify-start px-4 gap-3' : 'justify-center'} w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#1a2228] text-slate-600 dark:text-slate-400 hover:text-[#0096ff] dark:hover:text-[#0096ff] transition-all font-bold text-xs uppercase tracking-widest`}>
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {isExpanded && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {loggedInUser ? (
            isExpanded ? (
              <div className="bg-slate-50 dark:bg-[#1a2228] p-2.5 w-full rounded-2xl flex items-center justify-between border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#0096ff] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{loggedInUser.role}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 transition-colors flex-shrink-0" title="Logout">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#0096ff] flex items-center justify-center text-white font-black text-xl flex-shrink-0 mx-auto" title={userName}>
                  {userInitial}
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 transition-colors mx-auto" title={`Logout (${loggedInUser.role})`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            )
          ) : (
             <Link to="/login" className={`flex items-center justify-center ${isExpanded ? 'w-full gap-2 py-3.5' : 'w-12 h-12 mx-auto'} bg-slate-100 dark:bg-[#1a2228] hover:bg-[#0096ff] dark:hover:bg-[#0096ff] text-[#0096ff] dark:text-[#0096ff] hover:text-white dark:hover:text-white rounded-2xl font-bold text-sm transition-all shadow-sm`} title="Dealer Login">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               {isExpanded && <span>Login</span>}
             </Link>
          )}
        </div>
      </aside>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <style>{`
        body {
          background-color: #f8fafc !important; 
          color: #0f172a;
          margin: 0;
          overflow: hidden; 
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        html.dark body {
          background-color: #0b1114 !important;
          color: #ffffff;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        html.dark ::-webkit-scrollbar-thumb { background: #1e293b; }
        ::-webkit-scrollbar-thumb:hover { background: #0096ff; }
        .glow-bg {
          position: absolute; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0, 150, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
          border-radius: 50%; pointer-events: none; z-index: -1;
        }
        .bg-[url('https://images.pexels.com/photos/3136695/pexels-photo-3136695.jpeg?auto=compress&cs=tinysrgb&w=1920')] { display: none !important; }
        nav.sticky { display: none !important; }
      `}</style>

      <div className="flex h-screen w-full font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0b1114] relative overflow-hidden transition-colors duration-300">
        
        <Sidebar theme={theme} toggleTheme={toggleTheme} />
        
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth bg-slate-50 dark:bg-[#0b1114] transition-colors duration-300">
          <div className="glow-bg top-[-10%] left-[10%]"></div>
          <div className="glow-bg bottom-[-20%] right-[-10%] opacity-50"></div>

          <main className="flex-grow w-full relative z-10 p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/vehicles" element={<Vehicles />} /> 
              <Route path="/vehicle/:id" element={<VehicleDetails />} /> 
              <Route path="/add-vehicle" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          
          <footer className="text-center py-6 text-slate-500 text-xs font-semibold tracking-widest uppercase border-t border-slate-200 dark:border-white/5 relative z-10 mt-auto bg-slate-50 dark:bg-[#0b1114] transition-colors duration-300">
            &copy; {new Date().getFullYear()} EliteAuto Premium Dealership. All Rights Reserved.
          </footer>
        </div>

        <Chatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;