import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate     = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [vehicles,  setVehicles]  = useState([]);
  const [users,     setUsers]     = useState([]);
  const [aiStats,   setAiStats]   = useState({ accuracy: 0, data_samples: 0 }); 
  const [isLoading, setIsLoading] = useState(true);

  // 📈 AI Price Audit States
  const [auditResults, setAuditResults] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);

  // 🔥 Hot Leads States 
  const [hotLeads, setHotLeads] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loggedInUser || loggedInUser.role !== 'ADMIN') navigate('/');
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (loggedInUser?.role === 'ADMIN') {
      const fetchData = async () => {
        try {
          const [rv, ru, ra] = await Promise.all([
            axios.get('http://localhost:8080/api/vehicles/all'),
            axios.get('http://localhost:8080/api/users/all'),
            axios.get('http://127.0.0.1:5000/model-stats')
          ]);
          setVehicles(rv.data.reverse());
          setUsers(ru.data);
          setAiStats(ra.data);
        } catch (err) {
          console.error('Dashboard fetch error', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [loggedInUser]);

  
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get('http://localhost:5000/get-hot-leads');
        if (res.data.status === "success") {
          setHotLeads(res.data.alerts);
        }
      } catch (err) {
        console.error("Hot Leads Fetch Error", err);
      }
    };

    fetchLeads();
    const interval = setInterval(fetchLeads, 10000); 

    const handleLeadUpdate = () => fetchLeads();
    window.addEventListener('leadUpdated', handleLeadUpdate);
    
    return () => {
        clearInterval(interval);
        window.removeEventListener('leadUpdated', handleLeadUpdate);
    };
  }, []);

  
  const handleMarkAsRead = async (leadId) => {
    try {
      setHotLeads(prev => prev.filter(l => l.id !== leadId));
      
      await axios.delete(`http://localhost:5000/mark-lead-read/${leadId}`);
      
      window.dispatchEvent(new Event('leadUpdated'));
    } catch (err) {
      console.error("Failed to mark lead as read", err);
    }
  };

  // 🔮 AI Price Audit Function
  const runPriceAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await axios.get('http://localhost:5000/analyze-inventory');
      if (res.data.status === "success") {
        setAuditResults(res.data.recommendations);
      }
    } catch (err) {
      console.error("Audit failed", err);
      alert("Failed to connect to AI Server.");
    } finally {
      setIsAuditing(false);
    }
  };

  if (!loggedInUser || loggedInUser.role !== 'ADMIN') return null;

  const totalValue = vehicles.reduce((s, v) => s + (v.price || 0), 0);
  const recentVehicles = vehicles.slice(0, 5);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (aiStats.accuracy / 100) * circumference;

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100 min-h-screen pb-20 transition-colors duration-300 bg-slate-50 dark:bg-[#0d1117]">
      
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .progress-ring__circle { transition: stroke-dashoffset 1s ease-in-out; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden pt-10 pb-10 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-[#090d12] dark:to-[#0d1117]">
        <div className="relative z-10 px-6 lg:px-10 fade-up text-left">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Elite <span className="text-[#0096ff]">Command Center</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Real-time AI Business Intelligence</p>
        </div>
      </div>

      <div className="px-6 lg:px-10 space-y-6">

        {/* ── TOP STAT CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 fade-up">
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Inventory</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{vehicles.length}</h3>
          </div>
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Market Worth</p>
            <h3 className="text-3xl font-black text-[#0096ff]">Rs.{(totalValue/1000000).toFixed(1)}M</h3>
          </div>
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">System Users</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</h3>
          </div>
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm border-b-4 border-b-orange-500">
            <p className="text-[8px] font-black text-orange-500 uppercase mb-1">Active Leads</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{hotLeads.length}</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* ── 🔥 AI HOT LEAD ALERTS (NEW SECTION) ── */}
          <div className="lg:col-span-4 bg-white dark:bg-[#11181f] border border-orange-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <span className="text-xl animate-bounce">🔥</span>
                 <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Hot Lead Alerts</h3>
               </div>
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
               </span>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {hotLeads.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Waiting for high-intent customers...</p>
                </div>
              ) : (
                hotLeads.map((lead) => (
                  <div key={lead.id} className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 transition-all hover:border-orange-500/30 group relative">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase truncate max-w-[150px]">{lead.user}</span>
                        <span className="text-[7px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Hot</span>
                      </div>
                      
                      {/* 🚀 Read (Tick) Button එක */}
                      <button 
                        onClick={() => handleMarkAsRead(lead.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                        title="Mark as Read"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 leading-snug">"{lead.msg}"</p>
                    <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 italic">
                        <span className="font-black text-orange-500 not-italic">AI ANALYSIS:</span> {lead.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── RECENT ACTIVITY TABLE ── */}
          <div className="lg:col-span-8 bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.05] flex justify-between items-center bg-slate-50 dark:bg-[#161d24]">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest">Inventory Snapshot</span>
                <button onClick={() => navigate('/vehicles')} className="text-[9px] font-black text-[#0096ff] uppercase px-3 py-1 rounded-lg border border-[#0096ff]/20 hover:bg-[#0096ff]/10 transition-all">Full Stock</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[8px] uppercase tracking-widest text-slate-500 bg-white dark:bg-[#0d1117]">
                            <th className="px-6 py-4 font-black">Vehicle Details</th>
                            <th className="px-6 py-4 font-black">Condition</th>
                            <th className="px-6 py-4 font-black text-right">Listed Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentVehicles.map((v) => (
                            <tr key={v.id} className="border-t border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => navigate(`/vehicle/${v.id}`, { state: { vehicle: v } })}>
                                <td className="px-6 py-4"><p className="text-xs font-black uppercase text-slate-900 dark:text-white">{v.brand} {v.model} ({v.year})</p></td>
                                <td className="px-6 py-4"><span className="text-[9px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-500">{v.condition}</span></td>
                                <td className="px-6 py-4 text-right font-black text-xs text-[#0096ff]">Rs.{v.price?.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

        </div>

        {/* ── AI PRICE OPTIMIZATION SECTION ── */}
        <div className="mt-10 fade-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-[#f97316] rounded-full"></div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">AI Price Optimization</h2>
            </div>
            <button onClick={runPriceAudit} disabled={isAuditing}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-orange-900/20 transition-all flex items-center gap-2">
              {isAuditing ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Analyzing...</> : "✨ Run Inventory Audit"}
            </button>
          </div>

          {auditResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auditResults.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#11181f] border-l-4 border-[#f97316] p-5 rounded-2xl shadow-sm hover:scale-[1.02] transition-all">
                  <p className="text-[9px] font-black text-slate-500 uppercase">{item.name}</p>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <p className="text-[10px] text-red-500 font-bold line-through opacity-70">Rs.{item.currentPrice.toLocaleString()}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">Rs.{item.suggestedPrice.toLocaleString()}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Target Valuation</p>
                    </div>
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-2 py-1 rounded border border-red-500/20">+{item.overpricedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : !isAuditing && (
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/5 p-10 rounded-3xl text-center">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Audit is ready to verify inventory pricing</p>
            </div>
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="pt-10 flex flex-wrap gap-4 border-t border-slate-200 dark:border-white/5">
            <button onClick={() => navigate('/')} className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase border border-slate-200 dark:border-white/10 transition-all">Back to Showroom</button>
            <button onClick={() => navigate('/add-vehicle')} className="bg-[#0096ff] hover:bg-[#0080e6] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-900/20 transition-all">Add New Stock</button>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;