import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Vehicles() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const searchState = location.state;

  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const SLIDER_MAX = 50000000;

  const [searchTerm,   setSearchTerm]   = useState(searchState?.initialSearch   || '');
  const [maxPrice,     setMaxPrice]     = useState(searchState?.initialMaxPrice || SLIDER_MAX);
  const [condition,    setCondition]    = useState('All');
  const [transmission, setTransmission] = useState('All');
  const [fuelType,     setFuelType]     = useState('All');
  const [minPrice,     setMinPrice]     = useState(0);
  const [activeTab,    setActiveTab]    = useState('available');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const loggedInUser      = JSON.parse(localStorage.getItem('loggedInUser'));
  const canManageVehicles = loggedInUser && (
    loggedInUser.role?.toUpperCase() === 'ADMIN' ||
    loggedInUser.role?.toUpperCase() === 'SELLER'
  );
  const storageKey = `saved_vehicles_${loggedInUser?.email || 'guest'}`;
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  useEffect(() => { window.scrollTo(0, 0); fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/vehicles/all');
      setVehicles(res.data.reverse());
    } catch (error) { console.error('Error fetching vehicles:', error); }
    finally { setLoading(false); }
  };

  const handleCheckAIPrice = async (vehicle) => {
    try {
      const vehicleData = {
        Brand: vehicle.brand || "Toyota",
        Model: vehicle.model || "Unknown",
        Year: parseInt(vehicle.year) || 2015,
        UsedOrNew: vehicle.condition ? vehicle.condition.toUpperCase() : "USED",
        Transmission: vehicle.transmission || "Automatic",
        FuelType: vehicle.fuelType || "Petrol",
        Kilometres: vehicle.mileage ? parseInt(vehicle.mileage) : 50000 
      };

      const response = await axios.post('http://localhost:5000/predict', vehicleData);

      if (response?.data?.status === 'success') {
        alert(`🚗 ${vehicle.brand} ${vehicle.model}\n\nAI True Value: $ ${response.data.predicted_price.toLocaleString()} ✨`);
      } else {
        alert(`⚠️ AI Error: ${response?.data?.message || 'Unknown error occurred'}`);
      }
    } catch (error) { 
      console.error("AI Server Error:", error);
      alert('AI Server not responding! 🔌 Make sure python server is running.'); 
    }
  };

  const handleDeleteClick = (id) => setConfirmDialog({ isOpen: true, id });
  const confirmDelete = () => {
    axios.delete(`http://localhost:8080/api/vehicles/delete/${confirmDialog.id}`)
      .then(() => { setConfirmDialog({ isOpen: false, id: null }); fetchVehicles(); })
      .catch(err => { console.error(err); setConfirmDialog({ isOpen: false, id: null }); });
  };

  const savedVehicleIds = JSON.parse(localStorage.getItem(storageKey)) || [];

  const filteredVehicles = vehicles.filter((v) => {
    return (
      `${v.brand} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeTab === 'saved' ? savedVehicleIds.includes(v.id) : true) &&
      (condition    === 'All' || v.condition    === condition) &&
      (transmission === 'All' || v.transmission === transmission) &&
      (fuelType     === 'All' || v.fuelType     === fuelType) &&
      v.price >= minPrice && v.price <= maxPrice
    );
  });

  const handleClearFilters = () => {
    setSearchTerm(''); setCondition('All'); setTransmission('All');
    setFuelType('All'); setMinPrice(0); setMaxPrice(SLIDER_MAX);
    navigate('/vehicles', { replace: true, state: {} });
  };

  const hasActiveFilters = searchTerm !== '' || condition !== 'All' || transmission !== 'All' ||
    fuelType !== 'All' || minPrice !== 0 || maxPrice !== SLIDER_MAX;

  const minPercent = (minPrice / SLIDER_MAX) * 100;
  const maxPercent = (maxPrice / SLIDER_MAX) * 100;

  const conditionColor = (c) => {
    if (c === 'Brand New')     return 'text-[#0096ff] bg-[#0096ff]/10 dark:bg-[#0096ff]/15 border-transparent dark:border-[#0096ff]/30';
    if (c === 'Reconditioned') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/15 border-transparent dark:border-yellow-400/30';
    return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 border-transparent dark:border-slate-400/20';
  };
  const fuelColor = (f) => {
    if (f === 'Petrol')   return 'text-[#0096ff]';
    if (f === 'Diesel')   return 'text-slate-600 dark:text-slate-300';
    if (f === 'Hybrid')   return 'text-green-600 dark:text-green-400';
    if (f === 'Electric') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100 pb-20 relative bg-slate-50 dark:bg-[#0d1117] min-h-screen transition-colors duration-300">
      <style>{`
        .custom-slider{-webkit-appearance:none!important;appearance:none!important;background:transparent!important;outline:none!important}
        .custom-slider::-webkit-slider-runnable-track{-webkit-appearance:none!important;background:transparent!important}
        .custom-slider::-webkit-slider-thumb{-webkit-appearance:none!important;appearance:none!important;pointer-events:auto!important;width:18px!important;height:18px!important;background:#0096ff!important;border:3px solid #ffffff!important;border-radius:50%!important;cursor:pointer!important;box-shadow:0 0 0 2px #0096ff!important;margin-top:-8px!important}
        html.dark .custom-slider::-webkit-slider-thumb{border-color:#0d1117!important;}
        .custom-slider::-moz-range-thumb{pointer-events:auto!important;width:18px!important;height:18px!important;background:#0096ff!important;border:3px solid #ffffff!important;border-radius:50%!important;cursor:pointer!important;box-shadow:0 0 0 2px #0096ff!important}
        html.dark .custom-slider::-moz-range-thumb{border-color:#0d1117!important;}
        .vehicle-card{transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s ease,border-color .3s ease,background-color .3s ease}
        .vehicle-card:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.15),0 0 0 1px rgba(0,150,255,0.25);border-color:rgba(0,150,255,0.3)!important}
        html.dark .vehicle-card:hover{box-shadow:0 24px 48px rgba(0,0,0,.6),0 0 0 1px rgba(0,150,255,0.25);}
        .vehicle-card .card-img img{transition:transform .6s cubic-bezier(.4,0,.2,1)}
        .vehicle-card:hover .card-img img{transform:scale(1.08)}
        .vehicle-card .hover-overlay{opacity:0;transition:opacity .3s ease}
        .vehicle-card:hover .hover-overlay{opacity:1}
        .vehicle-card .action-bar{transform:translateY(12px);opacity:0;transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s ease}
        .vehicle-card:hover .action-bar{transform:translateY(0);opacity:1}
        .vehicle-card .card-content{transition:transform .3s cubic-bezier(.4,0,.2,1)}
        .vehicle-card:hover .card-content{transform:translateY(-4px)}
        .vehicle-card .price-glow{transition:color .3s ease,text-shadow .3s ease}
        .vehicle-card:hover .price-glow{color:#0096ff;text-shadow:0 0 20px rgba(0,150,255,0.2)}
        html.dark .vehicle-card:hover .price-glow{color:#38bdf8;text-shadow:0 0 20px rgba(0,150,255,0.4)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease forwards}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .vehicle-card:hover .brand-shimmer{background:linear-gradient(90deg,#0096ff,#38bdf8,#0096ff);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1.5s linear infinite}
        .sidebar-slide{transition:width .35s cubic-bezier(.4,0,.2,1),min-width .35s cubic-bezier(.4,0,.2,1),opacity .25s ease}
        .sidebar-slide.open{width:292px;min-width:292px;opacity:1}
        .sidebar-slide.closed{width:0px;min-width:0px;opacity:0;pointer-events:none}
      `}</style>

      {/* DELETE MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setConfirmDialog({ isOpen: false, id: null })}>
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 border-t-red-500 transition-colors"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-xl text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-wide">Delete Vehicle?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, id: null })}
                className="px-5 py-2.5 bg-slate-100 dark:bg-[#1a2228] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors border border-transparent dark:border-white/10">Cancel</button>
              <button onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="relative overflow-hidden pt-28 pb-20 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-[#090d12] dark:to-[#0d1117] transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]" style={{ backgroundImage:'radial-gradient(currentColor 1px,transparent 1px)', backgroundSize:'24px 24px' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,150,255,0.12),transparent)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0096ff]/40 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0096ff]/10 border border-slate-200 dark:border-[#0096ff]/20 px-4 py-1.5 rounded-full mb-6 shadow-sm dark:shadow-none">
            <span className="w-1.5 h-1.5 bg-[#0096ff] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-[#0096ff] uppercase tracking-widest">Premium AI-Valuated Fleet</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">
            Elite <span className="text-[#0096ff]">Inventory</span>
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#0096ff] to-transparent mx-auto mt-5"></div>
          <p className="text-slate-500 text-sm font-medium mt-4">
            {vehicles.length > 0 ? `${vehicles.length} vehicles available` : 'Loading inventory...'}
          </p>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="w-full px-4 md:px-6 lg:px-10 mt-10">
        <div className="flex gap-3 items-start">

          {/* ── SIDEBAR (slides left) ── */}
          <div className={`sidebar-slide flex-shrink-0 overflow-hidden ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/5 rounded-2xl shadow-md dark:shadow-xl transition-colors" style={{ width:'292px' }}>
              {/* Sidebar header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#0096ff]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/>
                  </svg>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Filters</span>
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#0096ff] animate-pulse"></span>}
                </div>
                {hasActiveFilters && (
                  <button onClick={handleClearFilters} className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors">
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter body */}
              <div className="px-5 py-4 space-y-5 overflow-y-auto" style={{ maxHeight:'calc(100vh - 280px)' }}>
                {/* Search */}
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Search Brand / Model</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="e.g. Toyota Prius" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white text-sm font-medium pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#0096ff]/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"/>
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Condition</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[{val:'All',label:'All'},{val:'Brand New',label:'Brand New'},{val:'Reconditioned',label:'Recon'},{val:'Used',label:'Used'}].map((c)=>(
                      <button key={c.val} onClick={()=>setCondition(c.val)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${condition===c.val?'bg-[#0096ff] text-white border-[#0096ff] shadow-md shadow-[#0096ff]/20':'bg-slate-50 dark:bg-[#1a2228] text-slate-600 dark:text-slate-500 border-slate-200 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-transparent hover:border-slate-300 dark:hover:border-white/20'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Transmission</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[{val:'All',label:'Any'},{val:'Automatic',label:'Auto'},{val:'Manual',label:'Manual'},{val:'Tiptronic',label:'Tip'}].map((t)=>(
                      <button key={t.val} onClick={()=>setTransmission(t.val)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${transmission===t.val?'bg-[#0096ff] text-white border-[#0096ff] shadow-md shadow-[#0096ff]/20':'bg-slate-50 dark:bg-[#1a2228] text-slate-600 dark:text-slate-500 border-slate-200 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-transparent hover:border-slate-300 dark:hover:border-white/20'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Fuel Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[{val:'All',label:'Any',dot:'#64748b'},{val:'Petrol',label:'Petrol',dot:'#0096ff'},{val:'Diesel',label:'Diesel',dot:'#94a3b8'},{val:'Hybrid',label:'Hybrid',dot:'#22c55e'},{val:'Electric',label:'Electric',dot:'#eab308'}].map((f)=>(
                      <button key={f.val} onClick={()=>setFuelType(f.val)}
                        className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1.5 ${fuelType===f.val?'bg-[#0096ff] text-white border-[#0096ff] shadow-md shadow-[#0096ff]/20':'bg-slate-50 dark:bg-[#1a2228] text-slate-600 dark:text-slate-500 border-slate-200 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-transparent hover:border-slate-300 dark:hover:border-white/20'}`}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:fuelType===f.val?'#fff':f.dot}}></span>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Price Range ($)</label>
                  <div className="relative h-1 bg-slate-200 dark:bg-[#0d1117] rounded-full mb-6 mt-3 mx-1">
                    <div className="absolute h-1 bg-[#0096ff] rounded-full pointer-events-none" style={{left:`${minPercent}%`,right:`${100-maxPercent}%`}}></div>
                    <input type="range" min="0" max={SLIDER_MAX} step="100000" value={minPrice} onChange={(e)=>setMinPrice(Math.min(Number(e.target.value),maxPrice-100000))} className="custom-slider absolute w-full z-20"/>
                    <input type="range" min="0" max={SLIDER_MAX} step="100000" value={maxPrice} onChange={(e)=>setMaxPrice(Math.max(Number(e.target.value),minPrice+100000))} className="custom-slider absolute w-full z-30"/>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <div className="flex-1">
                      <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600 mb-1">Min</label>
                      <input type="number" value={minPrice} onChange={(e)=>setMinPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white text-xs font-bold px-2 py-2 rounded-lg focus:outline-none focus:border-[#0096ff]/50 text-center transition-colors"/>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600 mb-1">Max</label>
                      <input type="number" value={maxPrice} onChange={(e)=>setMaxPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white text-xs font-bold px-2 py-2 rounded-lg focus:outline-none focus:border-[#0096ff]/50 text-center transition-colors"/>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                  {[{label:'Total',val:vehicles.length},{label:'Filtered',val:filteredVehicles.length},{label:'Brand New',val:vehicles.filter(v=>v.condition==='Brand New').length},{label:'Saved',val:savedVehicleIds.length}].map((s,i)=>(
                    <div key={i} className="bg-slate-50 dark:bg-[#1a2228] rounded-xl p-3 text-center border border-slate-100 dark:border-white/[0.04]">
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">{s.label}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── TOGGLE BUTTON ── */}
          <div className="flex-shrink-0 sticky top-24 self-start">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative flex flex-col items-center justify-center w-8 h-20 bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.07] rounded-xl hover:border-[#0096ff]/50 dark:hover:border-[#0096ff]/50 hover:bg-slate-50 dark:hover:bg-[#0096ff]/10 transition-all group shadow-md dark:shadow-lg"
              title={sidebarOpen ? 'Collapse Filters' : 'Expand Filters'}>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0096ff] rounded-full border-2 border-white dark:border-[#0d1117] animate-pulse"></span>
              )}
              <svg className={`w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-[#0096ff] transition-all duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              <span className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-600 group-hover:text-[#0096ff] transition-colors mt-2"
                style={{ writingMode:'vertical-rl', textOrientation:'mixed' }}>
                Filters
              </span>
            </button>
          </div>

          {/* ── VEHICLE GRID ── */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex gap-1 bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/5 p-1 rounded-xl shadow-sm dark:shadow-none">
                <button onClick={()=>setActiveTab('available')}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab==='available'?'bg-[#0096ff] text-white shadow-md shadow-[#0096ff]/20':'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                  Available Fleet
                </button>
                <button onClick={()=>setActiveTab('saved')}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeTab==='saved'?'bg-yellow-400 dark:bg-yellow-500 text-slate-900 shadow-md shadow-yellow-500/20':'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                  Saved ⭐
                </button>
              </div>
              <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 shadow-sm dark:shadow-none">
                <span className="text-[#0096ff] text-sm font-black">{filteredVehicles.length}</span> Vehicles
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#0096ff]/20"></div>
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#0096ff] animate-spin"></div>
                  <div className="absolute inset-3 rounded-full border-t-2 border-[#0096ff]/40 animate-spin" style={{animationDirection:'reverse',animationDuration:'0.8s'}}></div>
                </div>
                <span className="font-black uppercase tracking-widest text-xs text-slate-500">Loading Inventory...</span>
              </div>

            ) : filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm dark:shadow-none">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-[#1a2228] flex items-center justify-center text-3xl mb-4 border border-slate-200 dark:border-white/5">🚗</div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">
                  {activeTab==='saved'?'No Saved Vehicles':'No Vehicles Found'}
                </h3>
                <p className="text-sm text-slate-500">{activeTab==='saved'?'Star some vehicles to see them here.':'Try adjusting your filters.'}</p>
                {activeTab!=='saved'&&(
                  <button onClick={handleClearFilters} className="mt-6 border border-[#0096ff]/40 text-[#0096ff] hover:bg-[#0096ff] hover:text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                    Clear Filters
                  </button>
                )}
              </div>

            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filteredVehicles.map((vehicle, idx) => (
                  <div
                    key={vehicle.id}
                    className="vehicle-card fade-up bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.07] rounded-2xl overflow-hidden cursor-pointer flex flex-col relative shadow-md dark:shadow-none"
                    style={{ animationDelay: `${Math.min(idx * 40, 400)}ms`, animationFillMode: 'both' }}
                    onClick={() => navigate(`/vehicle/${vehicle.id}`, { state: { vehicle } })}
                  >
                    {/* ── IMAGE SECTION ── */}
                    <div className="card-img h-52 bg-slate-100 dark:bg-[#1a2228] relative overflow-hidden flex-shrink-0">
                      {vehicle.image ? (
                        <img src={vehicle.image} alt={vehicle.model} className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-14 h-14 text-slate-400 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 6h-2l-2 5H4l-1 2v3h1m8-10l2 5h4l1 2v3h-1m-8 0h5"/>
                          </svg>
                        </div>
                      )}

                      {/* Base gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                      {/* HOVER OVERLAY — dark tint + centered Details button */}
                      <div className="hover-overlay absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}>
                        <div className="action-bar flex flex-col items-center gap-2 pointer-events-none">
                          <div className="flex items-center gap-2 bg-[#0096ff] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0096ff]/30">
                            <span>View Details</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                            </svg>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/70 text-[9px] font-bold uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-white/50"></span>
                            Click to explore
                            <span className="w-1 h-1 rounded-full bg-white/50"></span>
                          </div>
                        </div>
                      </div>

                      {/* Condition badge */}
                      <div className={`absolute top-3 left-3 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest backdrop-blur-sm border z-10 ${conditionColor(vehicle.condition)}`} style={{backgroundColor: vehicle.condition === 'Brand New' ? 'rgba(0,150,255,0.9)' : vehicle.condition === 'Reconditioned' ? 'rgba(234,179,8,0.9)' : 'rgba(241,245,249,0.95)', color: vehicle.condition === 'Brand New' ? '#fff' : vehicle.condition === 'Reconditioned' ? '#000' : '#475569' , borderColor: 'transparent'}}>
                        {vehicle.condition}
                      </div>

                      {/* Saved badge */}
                      {savedVehicleIds.includes(vehicle.id) && (
                        <div className="absolute top-3 right-3 bg-yellow-400/90 backdrop-blur-sm text-slate-900 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest z-10">
                          ⭐ Saved
                        </div>
                      )}

                      {/* Bottom brand overlay on image */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
                        <p className="brand-shimmer text-[9px] font-black text-[#38bdf8] uppercase tracking-widest">{vehicle.brand}</p>
                        <h3 className="font-black text-white uppercase tracking-tight text-xl leading-tight drop-shadow-lg">{vehicle.model}</h3>
                      </div>
                    </div>

                    {/* ── CARD CONTENT ── */}
                    <div className="card-content p-4 flex flex-col flex-grow bg-white dark:bg-transparent">

                      {/* Specs row */}
                      <div className="grid grid-cols-3 gap-1.5 py-3 border-b border-slate-100 dark:border-white/[0.06] mb-3">
                        <div className="text-center bg-slate-50 dark:bg-[#1a2228] rounded-lg py-2 border border-slate-100 dark:border-white/[0.04]">
                          <p className="text-[7px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-0.5">Year</p>
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{vehicle.year}</p>
                        </div>
                        <div className="text-center bg-slate-50 dark:bg-[#1a2228] rounded-lg py-2 border border-slate-100 dark:border-white/[0.04]">
                          <p className="text-[7px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-0.5">Engine</p>
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">{vehicle.engine || 'N/A'}cc</p>
                        </div>
                        <div className="text-center bg-slate-50 dark:bg-[#1a2228] rounded-lg py-2 border border-slate-100 dark:border-white/[0.04]">
                          <p className="text-[7px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-0.5">Fuel</p>
                          <p className={`text-[11px] font-black ${fuelColor(vehicle.fuelType)}`}>{vehicle.fuelType}</p>
                        </div>
                      </div>

                      {/* Tags row */}
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-[#1a2228] px-2 py-1 rounded-md border border-slate-200 dark:border-white/[0.05]">
                          {vehicle.transmission || 'N/A'}
                        </span>
                        {vehicle.mileage && (
                          <span className="text-[8px] font-bold text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-[#1a2228] px-2 py-1 rounded-md border border-slate-200 dark:border-white/[0.05]">
                            {vehicle.mileage.toLocaleString()} km
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-end justify-between mt-auto mb-3">
                        <div>
                          <p className="text-[7px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-0.5">Asking Price</p>
                          <p className="price-glow text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1 font-bold">$</span>
                            {vehicle.price?.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCheckAIPrice(vehicle); }}
                          className="w-8 h-8 bg-slate-50 dark:bg-[#1a2228] hover:bg-[#0096ff]/10 dark:hover:bg-[#0096ff]/15 hover:border-[#0096ff]/40 text-slate-400 hover:text-[#0096ff] flex items-center justify-center rounded-lg transition-all border border-slate-200 dark:border-white/[0.06] text-sm flex-shrink-0"
                          title="Check AI True Market Value">
                          ✨
                        </button>
                      </div>

                      {/* Admin/Seller buttons */}
                      {canManageVehicles && (
                        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate('/add-vehicle', { state: { editVehicle: vehicle } }); }}
                            className="flex-1 bg-slate-50 dark:bg-[#1a2228] hover:bg-yellow-50 dark:hover:bg-yellow-400/10 hover:border-yellow-400 hover:dark:border-yellow-400/30 hover:text-yellow-600 dark:hover:text-yellow-400 border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-500 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                            ⚙️ Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(vehicle.id); }}
                            className="flex-1 bg-slate-50 dark:bg-[#1a2228] hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500 hover:dark:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-500 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vehicles;