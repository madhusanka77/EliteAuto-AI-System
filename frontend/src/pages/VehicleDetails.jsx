import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function VehicleDetails() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { id } = useParams();

  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [isPageLoading, setIsPageLoading] = useState(!location.state?.vehicle); 

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [aiPrice,            setAiPrice]            = useState(null);
  const [isLoading,          setIsLoading]          = useState(false);
  const [isSaved,            setIsSaved]            = useState(false);
  const [showShareMenu,      setShowShareMenu]      = useState(false);
  const [currentImageIndex,  setCurrentImageIndex]  = useState(0);
  const [galleryImages,      setGalleryImages]      = useState([]);
  const [confirmDialog,      setConfirmDialog]      = useState(false);
  const [toast,              setToast]              = useState(null);
  const [imgLoaded,          setImgLoaded]          = useState(false);

  // 📱 Social Media Post States
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');

  // 📄 AI PDF Brochure States
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const storageKey = `saved_vehicles_${loggedInUser?.email || 'guest'}`;

  // 🚀 Fetch vehicle data if not provided
  useEffect(() => {
    if (!vehicle && id) {
      setIsPageLoading(true);
      axios.get(`http://localhost:8080/api/vehicles/${id}`)
        .then(res => {
          if (res.data) setVehicle(res.data);
          setIsPageLoading(false);
        })
        .catch(err => {
          axios.get(`http://localhost:8080/api/vehicles/all`)
            .then(resAll => {
              const found = resAll.data.find(v => String(v.id) === String(id) || String(v.vehicleId) === String(id));
              if (found) setVehicle(found);
              setIsPageLoading(false);
            })
            .catch(() => setIsPageLoading(false));
        });
    } else {
      setIsPageLoading(false);
    }
  }, [id, vehicle]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (vehicle) {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || [];
      setIsSaved(saved.includes(vehicle.id));
      const imgs = [vehicle.image, vehicle.image2, vehicle.image3, vehicle.image4, vehicle.image5]
        .filter(img => img != null && img !== '');
      setGalleryImages(imgs);
    }
  }, [vehicle, storageKey]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const canEditOrDelete = () => {
    if (!loggedInUser || !vehicle) return false;
    if (loggedInUser.role === 'ADMIN') return true;
    if (loggedInUser.role === 'SELLER') {
      return vehicle.sellerEmail === loggedInUser.email ||
             vehicle.userId     === loggedInUser.id    ||
             vehicle.sellerId   === loggedInUser.id    ||
             vehicle.seller     === loggedInUser.email;
    }
    return false;
  };

  const handleToggleSave = () => {
    let saved = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (isSaved) {
      saved = saved.filter(savedId => savedId !== vehicle.id);
      showToast('Removed from saved list', 'success');
    } else {
      saved.push(vehicle.id);
      showToast('Saved to your list! ⭐', 'success');
    }
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setIsSaved(!isSaved);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard! 📋', 'success');
    setShowShareMenu(false);
  };

  const handlePredict = async () => {
    setIsLoading(true);
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

      const res = await axios.post('http://localhost:5000/predict', vehicleData);

      if (res?.data?.status === 'success') {
        setTimeout(() => { 
          setAiPrice(res.data.predicted_price); 
          setIsLoading(false); 
          showToast('AI Valuation Generated! ✨', 'success');
        }, 800); 
      } else {
        showToast('AI Error: ' + (res.data?.message || 'Unknown'), 'error');
        setIsLoading(false);
      }
    } catch (error) {
      showToast('Failed to connect to AI Server! Is Python running? 🔌', 'error');
      setIsLoading(false);
    }
  };

  // 📱 AI Social Media Post Generator Logic
  const handleGeneratePost = async () => {
    if (!vehicle) return;
    setIsGeneratingPost(true);
    setGeneratedPost("");
    try {
      const res = await axios.post('http://localhost:5000/generate-social-post', { vehicle });
      if (res.data.status === 'success') {
        setGeneratedPost(res.data.post);
        showToast('FB Ad Text Generated! ✨', 'success');
      } else {
        showToast("Failed to generate post.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("AI Agent error. Is Python running?", "error");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // 📄 AI PDF Brochure Generator Logic
  const handleDownloadBrochure = async () => {
    setIsGeneratingPDF(true);
    try {
      // responseType: 'blob' is crucial for downloading files
      const res = await axios.post('http://localhost:5000/generate-brochure', { vehicle }, { responseType: 'blob' });
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${vehicle.brand}_${vehicle.model}_Brochure.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Brochure Downloaded Successfully! 📄', 'success');
    } catch (error) {
      console.error("PDF Download Error:", error);
      showToast('Failed to generate brochure!', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPost);
    showToast("Post Copied to Clipboard! 📋✨", "success");
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:8080/api/vehicles/delete/${vehicle.id}`)
      .then(() => {
        setConfirmDialog(false);
        showToast('Vehicle Deleted Successfully! 🗑️', 'success');
        setTimeout(() => navigate('/vehicles'), 1000);
      })
      .catch(err => {
        setConfirmDialog(false);
        showToast('Error deleting vehicle!', 'error');
      });
  };

  const nextImage = () => setCurrentImageIndex(p => p === galleryImages.length - 1 ? 0 : p + 1);
  const prevImage = () => setCurrentImageIndex(p => p === 0 ? galleryImages.length - 1 : p - 1);

  const pageUrl   = window.location.href;
  const shareText = `Check out this ${vehicle?.brand} ${vehicle?.model} on EliteAuto!`;

  const conditionColor = (c) => {
    if (c === 'Brand New')     return 'text-[#0096ff] bg-[#0096ff]/15 border-[#0096ff]/30';
    if (c === 'Reconditioned') return 'text-yellow-400 bg-yellow-400/15 border-yellow-400/30';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0d1117]">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#0096ff]/20"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-[#0096ff] animate-spin"></div>
        </div>
        <h2 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm">Loading Vehicle...</h2>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans bg-slate-50 dark:bg-[#0d1117]">
        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#11181f] flex items-center justify-center text-4xl mb-6 border border-slate-200 dark:border-white/5 shadow-md">🚗</div>
        <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-widest mb-3">Vehicle not found!</h2>
        <p className="text-slate-500 text-sm mb-8">The vehicle you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/vehicles')}
          className="bg-[#0096ff] hover:bg-[#0080e6] text-white font-black uppercase tracking-widest text-xs px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#0096ff]/20">
          Return to Inventory
        </button>
      </div>
    );
  }

  return (
  <div className="font-sans text-slate-900 dark:text-slate-100 min-h-screen pb-20 relative transition-colors duration-300 bg-slate-50 dark:bg-[#0d1117]">

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .thumb-btn { transition: border-color .2s ease, opacity .2s ease; }
        .thumb-btn:hover { opacity: 1 !important; }
        .spec-card { transition: border-color .2s ease, background .2s ease; }
        .spec-card:hover { border-color: rgba(0,150,255,0.3); background: rgba(0,150,255,0.05); }
        .gallery-arrow { opacity:0; transition: opacity .2s ease, background .2s ease; }
        .gallery-wrap:hover .gallery-arrow { opacity:1; }
      `}</style>

      {/* ── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] min-w-[280px] p-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 bg-white dark:bg-[#11181f] text-slate-900 dark:text-white transition-all ${
          toast.type === 'success' ? 'border-[#0096ff]' : 'border-red-500'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-bold text-[11px] uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* ── DELETE CONFIRM ────────────────────────────────── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 border-t-red-500 fade-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-xl text-red-500 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-wide">Delete Vehicle?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-[#1a2228] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors border border-slate-200 dark:border-white/10">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-red-900/30">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO HEADER ───────────────────────────────────── */}
<div className="relative overflow-hidden pt-16 pb-10 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-[#090d12] dark:to-[#0d1117]">
  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
    style={{ backgroundImage:'radial-gradient(currentColor 1px,transparent 1px)', backgroundSize:'24px 24px' }}></div>
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,150,255,0.1),transparent)]"></div>
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0096ff]/40 to-transparent"></div>

  <div className="relative z-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
    <button onClick={() => navigate('/vehicles')}
      className="flex items-center gap-2 text-slate-500 hover:text-[#0096ff] font-bold uppercase tracking-widest text-[10px] mb-8 transition-colors group">
      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      Back to Inventory
    </button>

    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest border ${conditionColor(vehicle.condition)}`}>
            {vehicle.condition}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{vehicle.year}</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
          {vehicle.brand} <span className="text-[#0096ff]">{vehicle.model}</span>
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-slate-500 text-xs font-medium">{vehicle.fuelType}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span className="text-slate-500 text-xs font-medium">{vehicle.transmission}</span>
          {vehicle.mileage && <>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="text-slate-500 text-xs font-medium">{vehicle.mileage.toLocaleString()} km</span>
          </>}
        </div>
      </div>

      <div className="text-left lg:text-right">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Asking Price</p>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          <span className="text-lg text-slate-500 mr-1">$</span>
          {vehicle.price?.toLocaleString()}
        </h2>
      </div>
    </div>

    {/* Action bar */}
    <div className="flex items-center gap-3 mt-6 flex-wrap">
      <button onClick={handleToggleSave}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
          isSaved
            ? 'bg-yellow-50 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 border-yellow-400/30 hover:bg-yellow-100 dark:hover:bg-yellow-400/20'
            : 'bg-white dark:bg-[#1a2228] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.07] hover:text-[#0096ff] hover:border-[#0096ff]/30 shadow-sm dark:shadow-none'
        }`}>
        <span>{isSaved ? '⭐' : '☆'}</span>
        {isSaved ? 'Saved' : 'Save'}
      </button>

      <div className="relative">
        <button onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-white dark:bg-[#1a2228] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07] hover:text-[#0096ff] hover:border-[#0096ff]/30 transition-all shadow-sm dark:shadow-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share
        </button>

        {showShareMenu && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setShowShareMenu(false)}></div>
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl z-[100] py-2 overflow-hidden">
              {[
                { label:'WhatsApp', icon:'💬', href:`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText+' '+pageUrl)}` },
                { label:'Facebook', icon:'📘', href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}` },
                { label:'Email',    icon:'✉️', href:`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(pageUrl)}` },
              ].map((s,i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
                  <span>{s.icon}</span>{s.label}
                </a>
              ))}
              <div className="h-px bg-slate-200 dark:bg-white/[0.05] my-1"></div>
              <button onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
                <span>📋</span>Copy Link
              </button>
            </div>
          </>
        )}
      </div>

      {/* 📄 AI Brochure Button */}
      <button onClick={handleDownloadBrochure} disabled={isGeneratingPDF}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-50 dark:bg-[#0096ff]/10 text-[#0096ff] border border-blue-200 dark:border-[#0096ff]/30 hover:bg-[#0096ff] hover:text-white transition-all shadow-sm dark:shadow-none">
        {isGeneratingPDF ? (
          <><div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Gen...</>
        ) : "📄 Brochure"}
      </button>

      {canEditOrDelete() && (
        <>
          <button onClick={() => navigate('/add-vehicle', { state: { editVehicle: vehicle } })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-white dark:bg-[#1a2228] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07] hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-400/10 transition-all shadow-sm dark:shadow-none">
            ⚙️ Edit
          </button>
          <button onClick={() => setConfirmDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-white dark:bg-[#1a2228] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.07] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all shadow-sm dark:shadow-none">
            🗑️ Delete
          </button>
        </>
      )}
    </div>
  </div>
</div>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT: Gallery + Description ── */}
          <div className="lg:col-span-7 space-y-5 fade-up">

            {/* Gallery */}
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
            <div className="gallery-wrap relative aspect-[16/10] bg-slate-50 dark:bg-[#1a2228] overflow-hidden transition-colors">
              {galleryImages.length > 0 ? (
                <>
                  <img
                    key={currentImageIndex}
                    src={galleryImages[currentImageIndex]}
                    alt={vehicle.model}
                    onLoad={() => setImgLoaded(true)}
                    className="w-full h-full object-contain transition-opacity duration-300"
                    style={{ opacity: imgLoaded ? 1 : 0 }}
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <button onClick={prevImage}
                        className="gallery-arrow absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/60 hover:bg-[#0096ff] dark:hover:bg-[#0096ff] rounded-xl flex items-center justify-center text-slate-800 dark:text-white hover:text-white transition-all backdrop-blur-sm shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                        </svg>
                      </button>
                      <button onClick={nextImage}
                        className="gallery-arrow absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/60 hover:bg-[#0096ff] dark:hover:bg-[#0096ff] rounded-xl flex items-center justify-center text-slate-800 dark:text-white hover:text-white transition-all backdrop-blur-sm shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                      <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-slate-800 dark:text-white tracking-widest shadow-sm">
                        {currentImageIndex + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}
                  <div className={`absolute top-4 left-4 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest backdrop-blur-sm border bg-white/80 dark:bg-transparent ${conditionColor(vehicle.condition)}`}>
                    {vehicle.condition}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                  <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 6h-2l-2 5H4l-1 2v3h1m8-10l2 5h4l1 2v3h-1m-8 0h5"/>
                  </svg>
                  <span className="font-black uppercase tracking-widest text-xs">No Image Available</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-white dark:bg-[#11181f] transition-colors">
                {galleryImages.map((img, idx) => (
                  <button key={idx} onClick={() => { setImgLoaded(false); setCurrentImageIndex(idx); }}
                    className={`thumb-btn flex-shrink-0 h-16 w-24 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-[#0096ff] opacity-100'
                        : 'border-slate-200 dark:border-white/[0.07] opacity-60 hover:opacity-100'
                    }`}>
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover bg-slate-50 dark:bg-transparent"/>
                  </button>
                ))}
              </div>
            )}
          </div>

           {/* Description */}
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
              <div className="w-8 h-8 rounded-lg bg-[#0096ff]/10 border border-[#0096ff]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0096ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Description &amp; Features</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
              {vehicle.description || 'No additional description provided by the seller. Please contact for more information.'}
            </p>
          </div>
          </div>

          {/* ── RIGHT: Specs + AI + Actions ── */}
          <div className="lg:col-span-5 space-y-5 fade-up" style={{ animationDelay: '100ms' }}>

            {/* Specs Card */}
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-md">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
                <div className="w-8 h-8 rounded-lg bg-[#0096ff]/10 border border-[#0096ff]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#0096ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/>
                  </svg>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Vehicle Specifications</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Mileage',      val: `${vehicle.mileage?.toLocaleString() || '0'} km`, icon: '🛣️' },
                  { label: 'Engine',       val: `${vehicle.engine || 'N/A'} cc`,                  icon: '⚙️' },
                  { label: 'Fuel Type',    val: vehicle.fuelType || 'N/A',                        icon: '⛽' },
                  { label: 'Transmission', val: vehicle.transmission || 'N/A',                    icon: '🔧' },
                  { label: 'Year',         val: vehicle.year || 'N/A',                            icon: '📅' },
                  { label: 'Condition',    val: vehicle.condition || 'N/A',                       icon: '✨' },
                ].map((spec, i) => (
                  <div key={i} className="spec-card bg-slate-50 dark:bg-[#1a2228] rounded-xl p-3.5 border border-slate-100 dark:border-white/[0.05]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{spec.icon}</span>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{spec.label}</p>
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{spec.val}</p>
                  </div>
                ))}
              </div>

              {/* Contact button */}
              <a href={`tel:${vehicle.contact || ''}`}
                className="w-full bg-[#0096ff] hover:bg-[#0080e6] text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md shadow-[#0096ff]/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Contact: {vehicle.contact || 'Not Provided'}
              </a>
            </div>

            {/* AI Valuation Card */}
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background:'radial-gradient(circle,rgba(0,150,255,0.05) 0%,transparent 70%)', transform:'translate(30%,-30%)' }}></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
                  <div className="w-9 h-9 rounded-xl bg-[#0096ff]/10 border border-[#0096ff]/20 flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">AI Market Valuation</h3>
                    <p className="text-[9px] text-slate-500 mt-0.5">Powered by ML model</p>
                  </div>
                  <span className="ml-auto text-[8px] font-black text-[#0096ff] bg-[#0096ff]/10 border border-[#0096ff]/20 px-2 py-1 rounded-lg tracking-widest">LIVE</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  Our Machine Learning model analyzes current market trends to determine the true value of this vehicle.
                </p>

                {!aiPrice && !isLoading && (
                  <button onClick={handlePredict}
                    className="w-full bg-[#0096ff] hover:bg-[#0080e6] text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0096ff]/20">
                    <span>✨</span> Generate AI Valuation
                  </button>
                )}

                {isLoading && (
                  <div className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] py-4 rounded-xl flex items-center justify-center gap-3">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full border-2 border-[#0096ff]/20"></div>
                      <div className="absolute inset-0 rounded-full border-t-2 border-[#0096ff] animate-spin"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Analyzing Market Data...</span>
                  </div>
                )}

                {aiPrice && (
                  <div className="bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.06] p-5 rounded-xl">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">True Market Value</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                      <span className="text-lg text-slate-500 mr-1">$</span>
                      {aiPrice.toLocaleString()}
                    </p>

                    {vehicle.price > aiPrice + 50000 ? (
                      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-3">
                        <span className="text-base flex-shrink-0">⚠️</span>
                        <p>Priced above market average. Try negotiating with the seller!</p>
                      </div>
                    ) : vehicle.price < aiPrice - 50000 ? (
                      <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-3">
                        <span className="text-base flex-shrink-0">🔥</span>
                        <p>Great Deal! Priced below current market value.</p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 dark:bg-[#0096ff]/10 border border-blue-200 dark:border-[#0096ff]/20 text-[#0096ff] px-4 py-3 rounded-xl text-xs font-bold flex items-start gap-3">
                        <span className="text-base flex-shrink-0">⚖️</span>
                        <p>Fair Price. Matches current market expectations.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Price comparison mini card */}
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-md">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Price Breakdown</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Asking Price</span>
                <span className="text-base font-black text-slate-900 dark:text-white">$ {vehicle.price?.toLocaleString()}</span>
              </div>
              {aiPrice && (
                <div className="flex items-center justify-between mb-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">AI Market Value</span>
                  <span className="text-base font-black text-[#0096ff]">$ {aiPrice.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.05]">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Vehicle ID</span>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-[#1a2228] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.05]">#{vehicle.id}</span>
              </div>
            </div>

            {/* ── AI SOCIAL MEDIA MARKETER (ADMIN ONLY) ── */}
            {canEditOrDelete() && (
              <div className="mt-8 bg-blue-50/50 dark:bg-[#0096ff]/5 border border-blue-200 dark:border-[#0096ff]/20 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0096ff] text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">📱</div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">AI Marketing Agent</h3>
                      <p className="text-[10px] font-medium text-slate-500">Auto-generate converting FB/IG posts</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleGeneratePost} 
                    disabled={isGeneratingPost}
                    className="bg-[#0096ff] hover:bg-[#0080e6] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md transition-all flex items-center gap-2"
                  >
                    {isGeneratingPost ? (
                      <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Wait...</>
                    ) : "✨ Generate"}
                  </button>
                </div>

                {generatedPost && (
                  <div className="mt-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-[#1a2228] border border-slate-200 dark:border-white/10 rounded-2xl p-4 relative group">
                      <textarea 
                        readOnly 
                        value={generatedPost} 
                        rows={8}
                        className="w-full bg-transparent outline-none text-xs font-medium text-slate-700 dark:text-slate-300 resize-none"
                        style={{ scrollbarWidth: 'none' }}
                      />
                      <button 
                        onClick={copyToClipboard}
                        className="absolute top-4 right-4 bg-slate-100 dark:bg-white/10 hover:bg-[#0096ff] dark:hover:bg-[#0096ff] text-slate-600 dark:text-white hover:text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm"
                      >
                        📋 Copy Text
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleDetails;