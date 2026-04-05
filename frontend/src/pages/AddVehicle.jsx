import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddVehicle() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing,    setIsEditing]    = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // 🤖 AI Auto Extract, Predict & Publish Function
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', price: '', condition: 'Brand New',
    image: '', image2: '', image3: '', image4: '', image5: '',
    mileage: '', fuelType: 'Petrol', transmission: 'Automatic',
    engine: '', contact: '', description: '',
  });

  // 🚀 මෙතන තමයි වෙනස් කළේ! Database එකට කෙලින්ම යවන්නේ නැතුව Form එක පුරවනවා.
  const handleAutoFill = async () => {
    if (!rawText.trim()) {
      showToast('Please paste the advertisement text first!', 'error');
      return;
    }
    setIsExtracting(true);
    try {
      showToast('🕵️ AI Agent Extracting Data...', 'success');
      
      const extractRes = await axios.post('http://localhost:5000/extract-vehicle', { text: rawText });
      
      if (extractRes.data.status === 'success' && extractRes.data.data) {
        const aiData = extractRes.data.data;
        showToast('✨ Data Extracted! Predicting Price...', 'success');

        let predictedPrice = 0;
        try {
          const predictPayload = {
            Brand: aiData.brand || "Toyota",
            Model: aiData.model || "Unknown",
            Year: parseInt(aiData.year) || new Date().getFullYear(),
            UsedOrNew: aiData.condition ? aiData.condition.toUpperCase() : "USED",
            Transmission: aiData.transmission || "Automatic",
            FuelType: aiData.fuelType || "Petrol",
            Kilometres: aiData.mileage ? parseInt(aiData.mileage) : 50000
          };
          
          const predictRes = await axios.post('http://localhost:5000/predict', predictPayload);
          if (predictRes.data.status === 'success') {
            predictedPrice = predictRes.data.predicted_price;
          }
        } catch (predError) {
          console.error("Prediction failed inside agent:", predError);
        }

        const finalPrice = aiData.price > 0 ? aiData.price : predictedPrice;
        
        const aiNote = predictedPrice > 0 
          ? `\n\n🤖 AI Market Valuation: Rs. ${predictedPrice.toLocaleString()}` 
          : '';

        // 🚀 FORM එක ඔටෝ ෆිල් කිරීම
        setFormData(prev => ({
          ...prev,
          brand: aiData.brand || prev.brand,
          model: aiData.model || prev.model,
          year: aiData.year || prev.year,
          price: finalPrice || prev.price,
          mileage: aiData.mileage || prev.mileage,
          engine: aiData.engine || prev.engine,
          condition: aiData.condition || prev.condition,
          transmission: aiData.transmission || prev.transmission,
          fuelType: aiData.fuelType || prev.fuelType,
          contact: aiData.contact || prev.contact,
          description: (rawText + aiNote).trim()
        }));

        showToast('🚀 Form Auto-Filled! Please review and add photos.', 'success');
        setRawText('');

      } else {
        showToast('Failed to extract data.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('AI Task failed. Check Python server.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const loggedInUser      = JSON.parse(localStorage.getItem('loggedInUser'));
  const canManageVehicles = loggedInUser && (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'SELLER');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!canManageVehicles) navigate('/vehicles');

    if (location.state?.editVehicle) {
      const v = location.state.editVehicle;
      setIsEditing(true);
      setEditId(v.id);
      setFormData({
        brand: v.brand || '', model: v.model || '', year: v.year || '',
        price: v.price || '', condition: v.condition || 'Brand New',
        image: v.image || '', image2: v.image2 || '', image3: v.image3 || '',
        image4: v.image4 || '', image5: v.image5 || '',
        mileage: v.mileage || '', fuelType: v.fuelType || 'Petrol',
        transmission: v.transmission || 'Automatic', engine: v.engine || '',
        contact: v.contact || '', description: v.description || '',
      });
    }
  }, [location.state, canManageVehicles, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const val = e.target.name === 'contact'
      ? e.target.value.replace(/[^0-9]/g, '')
      : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleSingleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
      if (fieldName === 'image' && errors.image) setErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (idx) => {
    const keys  = ['image','image2','image3','image4','image5'];
    const imgs  = keys.map(k => formData[k]);
    imgs.splice(idx, 1);
    imgs.push('');
    setFormData(prev => {
      const n = { ...prev };
      keys.forEach((k, i) => { n[k] = imgs[i]; });
      return n;
    });
  };

  const handlePredictPrice = async () => {
    if (!formData.brand || !formData.model || !formData.year) {
      showToast('Enter Brand, Model & Year first!', 'error'); return;
    }
    setIsPredicting(true);
    try {
      console.log("⏳ Sending data to AI Model...");
      const vehicleData = {
        Brand: formData.brand || "Toyota",
        Model: formData.model || "Unknown",
        Year: parseInt(formData.year) || 2015,
        UsedOrNew: formData.condition ? formData.condition.toUpperCase() : "USED",
        Transmission: formData.transmission || "Automatic",
        FuelType: formData.fuelType || "Petrol",
        Kilometres: formData.mileage ? parseInt(formData.mileage) : 50000
      };

      const res = await axios.post('http://localhost:5000/predict', vehicleData);

      if (res?.data?.status === 'success') {
        setFormData(prev => ({ ...prev, price: res.data.predicted_price }));
        if (errors.price) setErrors(prev => ({ ...prev, price: null }));
        showToast(`Predicted: Rs. ${res.data.predicted_price.toLocaleString()} ✨`, 'success');
      } else if (res?.data?.status === 'error') {
        showToast('AI Error: ' + res.data.message, 'error');
      } else {
        showToast('Received empty response from Server!', 'error');
      }
    } catch (error) {
      console.error("AI Server Error:", error);
      showToast('Failed to connect to AI Server 🔌 Make sure python server is running.', 'error');
    } finally {
      setIsPredicting(false);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!(formData.brand || '').trim())  e.brand = 'Brand name is required.';
    if (!(formData.model || '').trim())  e.model = 'Model name is required.';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1)
      e.year = 'Valid manufacture year required.';
    if (!formData.price || formData.price <= 0) e.price = 'Valid selling price required.';
    const phone = formData.contact || '';
    if (!phone.trim()) e.contact = 'Contact phone is required.';
    else if (!/^0\d{9}$/.test(phone.trim())) e.contact = 'Enter a valid 10-digit number starting with 0.';
    if (!formData.mileage || formData.mileage < 0)  e.mileage = 'Valid mileage required.';
    if (!formData.engine  || formData.engine  <= 0) e.engine  = 'Valid engine capacity required.';
    if (!formData.image) e.image = 'Main vehicle photo is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setIsSubmitting(true);
    const action = isEditing
      ? axios.put(`http://localhost:8080/api/vehicles/update/${editId}`, formData)
      : axios.post('http://localhost:8080/api/vehicles/add', formData);
    action.then(() => {
      showToast(isEditing ? 'Vehicle Updated! 🚗' : 'Vehicle Added! 🎉', 'success');
      setTimeout(() => { setIsSubmitting(false); navigate('/vehicles'); }, 1500);
    }).catch(err => {
      console.error(err); setIsSubmitting(false);
      showToast('Something went wrong. Try again.', 'error');
    });
  };

  const imgKeys = ['image','image2','image3','image4','image5'];

  const inp = (field) =>
    `w-full bg-slate-50 dark:bg-[#1a2228] border ${errors[field] ? 'border-red-500/60 focus:border-red-500' : 'border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50'} text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600`;

  const sel = `w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors appearance-none cursor-pointer`;

  const labelCls = `block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2`;

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100 min-h-screen pb-20 relative bg-slate-50 dark:bg-[#0d1117] transition-colors duration-300">

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .select-wrap { position:relative; }
        .select-wrap::after {
          content:'';
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          width:0; height:0;
          border-left:4px solid transparent; border-right:4px solid transparent;
          border-top:5px solid #64748b; pointer-events:none;
        }
        .img-slot { transition: border-color .2s ease, background .2s ease; }
        .img-slot:hover { border-color: rgba(0,150,255,0.5); background: rgba(0,150,255,0.05); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 1000px #f8fafc inset!important; -webkit-text-fill-color:#0f172a!important; }
        html.dark input:-webkit-autofill { -webkit-box-shadow:0 0 0 1000px #1a2228 inset!important; -webkit-text-fill-color:#fff!important; }
      `}</style>

      {/* ── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] min-w-[280px] p-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 bg-white dark:bg-[#11181f] text-slate-900 dark:text-white transition-all ${
          toast.type === 'success' ? 'border-[#0096ff]' : toast.type === 'error' ? 'border-red-500' : 'border-[#0096ff]'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : '✨'}</span>
          <p className="font-bold text-[11px] uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-10 pb-10 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-[#090d12] dark:to-[#0d1117] transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]"
          style={{ backgroundImage:'radial-gradient(currentColor 1px,transparent 1px)', backgroundSize:'24px 24px' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,150,255,0.15),transparent)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0096ff]/40 to-transparent"></div>

        <div className="relative z-10 px-4 md:px-8 lg:px-10 text-center fade-up">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0096ff]/10 border border-slate-200 dark:border-[#0096ff]/20 px-3 py-1 rounded-full mb-4 shadow-sm dark:shadow-none">
            <span className="text-[9px] font-bold text-[#0096ff] uppercase tracking-widest">
              {isEditing ? 'Edit Mode • Update Listing' : 'New Entry • System Inventory'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Vehicle <span className="text-[#0096ff]">{isEditing ? 'Update' : 'Register'}</span>
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#0096ff] to-transparent mx-auto mt-4"></div>
        </div>
      </div>

      {/* ── FORM CARD ─────────────────────────────────────── */}
      <div className="px-4 md:px-8 lg:px-10 mt-8 max-w-5xl mx-auto fade-up" style={{ animationDelay:'60ms' }}>
        <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-md dark:shadow-2xl overflow-hidden transition-colors duration-300">

          {/* Card header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(0,150,255,0.12)', color: '#0096ff' }}>
                {isEditing ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  {isEditing ? 'Update Listing' : 'Register Vehicle'}
                </h2>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                  System Inventory Entry
                </p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/vehicles')}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0096ff] bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] hover:border-[#0096ff]/40 px-4 py-2 rounded-xl transition-all shadow-sm dark:shadow-none">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} noValidate className="p-8">

            {/* ── Section: AI Auto Fill ── */}
            <div className="mb-8 p-5 bg-[#0096ff]/5 dark:bg-[#0096ff]/10 border border-[#0096ff]/20 rounded-2xl transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#0096ff] text-white flex items-center justify-center text-lg shadow-md">🤖</div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">AI Agent Auto-Fill</h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Paste Facebook/Web ad text and let AI extract the details.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste ad text here... (e.g., 'Toyota Axio 2016 for sale. 45000km, 85 lakhs...')"
                  className="flex-1 bg-white dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white text-xs font-medium px-4 py-3 rounded-xl outline-none focus:border-[#0096ff]/50 transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isExtracting}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] px-6 py-3 md:py-0 rounded-xl transition-all shadow-md disabled:opacity-60 whitespace-nowrap"
                >
                  {isExtracting ? (
                    <><div className="w-3.5 h-3.5 border-2 border-slate-400 dark:border-slate-600 border-t-slate-100 dark:border-t-slate-900 rounded-full animate-spin"></div> Extracting...</>
                  ) : (
                    <><span>✨</span> Auto Extract</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Section: Basic Info ── */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 rounded-full bg-[#0096ff]"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Basic Information</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className={labelCls}>Brand Name <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                    className={inp('brand')} placeholder="e.g. Toyota"/>
                  {errors.brand && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.brand}</p>}
                </div>

                <div>
                  <label className={labelCls}>Model Name <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange}
                    className={inp('model')} placeholder="e.g. Prius"/>
                  {errors.model && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.model}</p>}
                </div>

                <div>
                  <label className={labelCls}>Year <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange}
                    className={inp('year')} placeholder="e.g. 2022"/>
                  {errors.year && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.year}</p>}
                </div>

              </div>
            </div>

            {/* ── Section: Price & Contact ── */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 rounded-full bg-[#22c55e]"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Price & Contact</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="md:col-span-2">
                  <label className={labelCls}>Selling Price (Rs.) & AI Prediction <span className="text-red-500 dark:text-red-400">*</span></label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input type="number" name="price" value={formData.price} onChange={handleChange}
                        className={inp('price')} placeholder="e.g. 4500000"/>
                      {errors.price && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.price}</p>}
                    </div>
                    <button type="button" onClick={handlePredictPrice} disabled={isPredicting}
                      className="flex items-center gap-2 bg-[#0096ff] hover:bg-[#0080e6] disabled:opacity-60 text-white font-black uppercase tracking-widest text-[10px] px-5 rounded-xl transition-all shadow-md dark:shadow-lg shadow-[#0096ff]/20 flex-shrink-0 whitespace-nowrap">
                      {isPredicting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : <span>✨</span>}
                      {isPredicting ? 'Predicting...' : 'AI Predict'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Contact Phone <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="text" name="contact" value={formData.contact} onChange={handleChange} maxLength="10"
                    className={inp('contact')} placeholder="e.g. 0712345678"/>
                  {errors.contact && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.contact}</p>}
                </div>

              </div>
            </div>

            {/* ── Section: Vehicle Specs ── */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 rounded-full bg-[#a78bfa]"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Vehicle Specifications</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className={labelCls}>Condition</label>
                  <div className="select-wrap">
                    <select name="condition" value={formData.condition} onChange={handleChange} className={sel}>
                      <option value="Brand New">Brand New</option>
                      <option value="Used">Used</option>
                      <option value="Reconditioned">Reconditioned</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Fuel Type</label>
                  <div className="select-wrap">
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className={sel}>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Transmission</label>
                  <div className="select-wrap">
                    <select name="transmission" value={formData.transmission} onChange={handleChange} className={sel}>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="Tiptronic">Tiptronic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Mileage (km) <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleChange}
                    className={inp('mileage')} placeholder="e.g. 45000"/>
                  {errors.mileage && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.mileage}</p>}
                </div>

                <div>
                  <label className={labelCls}>Engine Capacity (cc) <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="number" name="engine" value={formData.engine} onChange={handleChange}
                    className={inp('engine')} placeholder="e.g. 1800"/>
                  {errors.engine && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.engine}</p>}
                </div>

              </div>
            </div>

            {/* ── Section: Photos ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-[#f97316]"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Vehicle Photos <span className="text-red-500 dark:text-red-400">*</span>
                  </span>
                </div>
                {errors.image && (
                  <p className="text-[9px] text-red-500 dark:text-red-400 font-bold flex items-center gap-1"><span>⚠</span>{errors.image}</p>
                )}
              </div>

              <div className="grid grid-cols-5 gap-3">
                {imgKeys.map((imgKey, index) => {
                  const hasImage        = !!formData[imgKey];
                  const isPrevFilled    = index === 0 ? true : !!formData[imgKeys[index - 1]];
                  const isDisabled      = !hasImage && !isPrevFilled;
                  const isNextAvailable = !hasImage && isPrevFilled;

                  return (
                    <div key={imgKey} className={`relative aspect-square rounded-2xl overflow-hidden ${isDisabled ? 'opacity-40' : ''}`}>
                      <input type="file" accept="image/*" id={`up-${imgKey}`}
                        className="hidden" disabled={isDisabled}
                        onChange={(e) => handleSingleImageUpload(e, imgKey)}/>

                      {hasImage ? (
                        <div className="w-full h-full relative group">
                          <img src={formData[imgKey]} alt="upload" className="w-full h-full object-cover"/>
                          {/* overlay on hover */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => removeImage(index)}
                              className="w-8 h-8 bg-red-500 hover:bg-red-400 rounded-lg flex items-center justify-center text-white text-sm transition-colors shadow-md">
                              ✕
                            </button>
                          </div>
                          {/* main badge */}
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-[#0096ff] text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest shadow-sm">
                              Main
                            </div>
                          )}
                        </div>
                      ) : (
                        <label htmlFor={isDisabled ? undefined : `up-${imgKey}`}
                          className={`img-slot w-full h-full border-2 border-dashed flex flex-col items-center justify-center rounded-2xl transition-all ${
                            isDisabled
                              ? 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1a2228] cursor-not-allowed'
                              : index === 0 && errors.image
                              ? 'border-red-500/60 bg-red-50 dark:bg-red-500/5 cursor-pointer'
                              : isNextAvailable
                              ? 'border-[#0096ff]/40 bg-[#0096ff]/5 cursor-pointer hover:border-[#0096ff]/70'
                              : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#1a2228] cursor-not-allowed'
                          }`}>
                          {isDisabled ? (
                            <svg className="w-6 h-6 text-slate-400 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                            </svg>
                          ) : (
                            <>
                              <svg className={`w-6 h-6 mb-1.5 ${index === 0 && errors.image ? 'text-red-500 dark:text-red-400' : 'text-[#0096ff]'}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.023 10.293"/>
                              </svg>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${index === 0 && errors.image ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>
                                {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[8px] text-slate-500 mt-2 font-medium">Upload up to 5 photos. First photo will be the main listing image.</p>
            </div>

            {/* ── Section: Description ── */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 rounded-full bg-[#38bdf8]"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description & Features</span>
              </div>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                placeholder="Describe the vehicle's features, history, special notes..."/>
            </div>

            {/* ── Submit ── */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/[0.05]">
              <button type="button" onClick={() => navigate('/vehicles')}
                className="px-6 py-3 bg-slate-100 dark:bg-[#1a2228] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 dark:border-white/[0.07]">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md dark:shadow-lg ${
                  isSubmitting
                    ? 'bg-slate-500 dark:bg-slate-600 cursor-not-allowed opacity-70'
                    : 'bg-[#0096ff] hover:bg-[#0080e6] shadow-[#0096ff]/20'
                }`}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {isEditing ? 'Update Listing' : 'Publish Listing'}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddVehicle;