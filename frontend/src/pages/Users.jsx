import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users,         setUsers]         = useState([]);
  const [isEditing,     setIsEditing]     = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [errors,        setErrors]        = useState({});
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [toast,         setToast]         = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null });
  const [searchTerm,    setSearchTerm]    = useState('');
  const [roleFilter,    setRoleFilter]    = useState('All');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    contactNumber: '', password: '', role: 'BUYER',
  });

  const fetchUsers = () => {
    axios.get('http://localhost:8080/api/users/all')
      .then(r => setUsers(r.data))
      .catch(e => console.error('Error fetching users:', e));
  };

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const val = e.target.name === 'contactNumber'
      ? e.target.value.replace(/[^0-9]/g, '')
      : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.contactNumber.trim()) e.contactNumber = 'Contact number is required.';
    else if (!/^0\d{9}$/.test(formData.contactNumber.trim()))
      e.contactNumber = 'Enter a valid 10-digit number starting with 0.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const action = isEditing
      ? axios.put(`http://localhost:8080/api/users/update/${editId}`, formData)
      : axios.post('http://localhost:8080/api/users/register', formData);
    action.then(() => {
      showToast(isEditing ? 'User Updated! 👥' : 'User Registered! 🚀', 'success');
      fetchUsers(); resetForm(); setIsSubmitting(false);
    }).catch(err => {
      console.error(err);
      showToast('Failed to save user.', 'error');
      setIsSubmitting(false);
    });
  };

  const handleEdit = (user) => {
    setIsEditing(true); setEditId(user.id);
    setFormData({
      firstName: user.firstName || '', lastName: user.lastName || '',
      email: user.email || '', contactNumber: user.contactNumber || '',
      password: '', role: user.role || 'BUYER',
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ firstName:'', lastName:'', email:'', contactNumber:'', password:'', role:'BUYER' });
    setIsEditing(false); setEditId(null); setErrors({});
  };

  const handleDeleteClick = (id) => setConfirmDialog({ isOpen: true, userId: id });

  const confirmDelete = () => {
    axios.delete(`http://localhost:8080/api/users/delete/${confirmDialog.userId}`)
      .then(() => {
        showToast('User Deleted! 🗑️', 'success');
        fetchUsers(); setConfirmDialog({ isOpen: false, userId: null });
      }).catch(err => {
        console.error(err);
        showToast('Failed to delete user.', 'error');
        setConfirmDialog({ isOpen: false, userId: null });
      });
  };

  const roleColor = (role) => {
    if (role === 'ADMIN')  return 'text-[#0096ff] bg-[#0096ff]/10 dark:bg-[#0096ff]/15 border-transparent dark:border-[#0096ff]/30';
    if (role === 'SELLER') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/15 border-transparent dark:border-yellow-400/30';
    return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 border-transparent dark:border-slate-400/20';
  };

  const initial = (u) => (u.firstName || '?').charAt(0).toUpperCase();

  const avatarColor = (role) => {
    if (role === 'ADMIN')  return { bg: 'rgba(0,150,255,.15)',   color: '#0096ff' };
    if (role === 'SELLER') return { bg: 'rgba(234,179,8,.15)',   color: '#eab308' };
    return                        { bg: 'rgba(148,163,184,.12)', color: '#64748b' };
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole   = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const inp = (field) =>
    `w-full bg-slate-50 dark:bg-[#1a2228] border ${errors[field] ? 'border-red-500/60 focus:border-red-500' : 'border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50'} text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600`;

  const labelCls = 'block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2';

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100 min-h-screen pb-20 bg-slate-50 dark:bg-[#0d1117] transition-colors duration-300">

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .user-row { transition: background .2s ease; }
        html.dark .user-row:hover { background: rgba(255,255,255,0.02); }
        .user-row:hover { background: #f8fafc; }
        .user-row:hover .row-actions { opacity: 1; }
        .row-actions { opacity: 0; transition: opacity .2s ease; }
        .select-wrap { position: relative; }
        .select-wrap::after {
          content:''; position:absolute; right:14px; top:50%; transform:translateY(-50%);
          width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent;
          border-top:5px solid #64748b; pointer-events:none;
        }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 1000px #f8fafc inset!important; -webkit-text-fill-color:#0f172a!important; }
        html.dark input:-webkit-autofill { -webkit-box-shadow:0 0 0 1000px #1a2228 inset!important; -webkit-text-fill-color:#fff!important; }
      `}</style>

      {/* ── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] min-w-[280px] p-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 bg-white dark:bg-[#11181f] text-slate-900 dark:text-white transition-colors ${
          toast.type === 'success' ? 'border-[#0096ff]' : 'border-red-500'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-bold text-[11px] uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* ── DELETE CONFIRM ────────────────────────────────── */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 border-t-red-500 fade-up transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-xl text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-wide">Delete User?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, userId: null })}
                className="px-5 py-2.5 bg-slate-100 dark:bg-[#1a2228] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors border border-transparent dark:border-white/10">
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

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-10 pb-10 bg-gradient-to-b from-slate-200 to-slate-50 dark:from-[#090d12] dark:to-[#0d1117] transition-colors duration-300">
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]"
          style={{ backgroundImage:'radial-gradient(currentColor 1px,transparent 1px)', backgroundSize:'24px 24px' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,150,255,0.15),transparent)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0096ff]/40 to-transparent"></div>

        <div className="relative z-10 px-4 md:px-8 lg:px-10 fade-up">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0096ff]/10 border border-slate-200 dark:border-[#0096ff]/20 px-3 py-1 rounded-full mb-4 shadow-sm dark:shadow-none">
            <span className="w-1.5 h-1.5 bg-[#0096ff] rounded-full animate-pulse"></span>
            <span className="text-[9px] font-bold text-[#0096ff] uppercase tracking-widest">Admin • Access Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">
            System <span className="text-[#0096ff]">Users</span>
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#0096ff] to-transparent mt-4"></div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ───────────────────────────────────── */}
      <div className="px-4 md:px-8 lg:px-10 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── FORM ────────────────────────────────────────── */}
          <div className="lg:col-span-4 fade-up" style={{ animationDelay:'40ms' }}>
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-md dark:shadow-xl overflow-hidden sticky top-6 transition-colors">

              {/* Form header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:'rgba(0,150,255,0.12)', color:'#0096ff' }}>
                    {isEditing ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                        <path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {isEditing ? 'Update User' : 'Register User'}
                    </h2>
                    <p className="text-[8px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">System Access</p>
                  </div>
                </div>
                {isEditing && (
                  <button onClick={resetForm}
                    className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-all">
                    Cancel
                  </button>
                )}
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>First Name <span className="text-red-500 dark:text-red-400">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                      className={`w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-3 py-2.5 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                      placeholder="Ashen"/>
                  </div>
                  <div>
                    <label className={labelCls}>Last Name <span className="text-red-500 dark:text-red-400">*</span></label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                      className={`w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-3 py-2.5 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                      placeholder="Kavisha"/>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Email Address <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className={`w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                    placeholder="ashen@gmail.com"/>
                </div>

                <div>
                  <label className={labelCls}>Contact Number <span className="text-red-500 dark:text-red-400">*</span></label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} maxLength="10" required
                    className={inp('contactNumber')} placeholder="0712345678"/>
                  {errors.contactNumber && (
                    <p className="text-[9px] text-red-500 dark:text-red-400 font-bold mt-1.5 flex items-center gap-1">
                      <span>⚠</span>{errors.contactNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    Password {!isEditing && <span className="text-red-500 dark:text-red-400">*</span>}
                  </label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    required={!isEditing}
                    className={`w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600`}
                    placeholder={isEditing ? 'Leave blank to keep current' : '••••••••'}/>
                </div>

                <div>
                  <label className={labelCls}>System Role</label>
                  <div className="select-wrap">
                    <select name="role" value={formData.role} onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none transition-colors appearance-none cursor-pointer">
                      <option value="ADMIN">ADMIN — Full Access</option>
                      <option value="SELLER">SELLER — Manage Vehicles</option>
                      <option value="BUYER">BUYER — View Only</option>
                    </select>
                  </div>
                </div>

                {/* Role preview badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${roleColor(formData.role)}`} style={{borderColor: 'transparent'}}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.role === 'ADMIN' ? '#0096ff' : formData.role === 'SELLER' ? '#eab308' : '#64748b' }}></span>
                  {formData.role} — {formData.role === 'ADMIN' ? 'Full system access' : formData.role === 'SELLER' ? 'Can manage vehicles' : 'View only access'}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-3 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md dark:shadow-lg ${
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
                      {isEditing ? 'Update User' : 'Register User'}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

          {/* ── USER TABLE ──────────────────────────────────── */}
          <div className="lg:col-span-8 fade-up" style={{ animationDelay:'80ms' }}>
            <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-md dark:shadow-xl overflow-hidden transition-colors">

              {/* Table header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0096ff]/10 border border-[#0096ff]/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#0096ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Registered Accounts</span>
                  <div className="bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.06] px-3 py-1 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400">
                    <span className="text-[#0096ff] font-black">{filteredUsers.length}</span> / {users.length}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-slate-500"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search..." value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-xs font-medium pl-8 pr-3 py-2 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 w-36"/>
                  </div>

                  {/* Role filter pills */}
                  <div className="flex gap-1">
                    {['All','ADMIN','SELLER','BUYER'].map(r => (
                      <button key={r} onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                          roleFilter === r
                            ? 'bg-[#0096ff] text-white border-[#0096ff]'
                            : 'bg-slate-50 dark:bg-[#1a2228] text-slate-600 dark:text-slate-500 border-slate-200 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[8px] uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-[#0d1117]/60">
                      <th className="px-6 py-3 font-black">User</th>
                      <th className="px-6 py-3 font-black">Contact Info</th>
                      <th className="px-6 py-3 font-black">Role</th>
                      <th className="px-6 py-3 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#1a2228] flex items-center justify-center text-2xl mx-auto mb-3 border border-slate-200 dark:border-white/5">👥</div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, i) => {
                        const av = avatarColor(user.role);
                        return (
                          <tr key={user.id} className="user-row border-t border-slate-100 dark:border-white/[0.04]">

                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                                  style={{ background: av.bg, color: av.color }}>
                                  {initial(user)}
                                </div>
                                <div>
                                  <p className="text-[12px] font-black text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                  <p className="text-[9px] text-slate-500 font-medium mt-0.5">ID: #{user.id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-3.5">
                              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{user.email}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{user.contactNumber || '—'}</p>
                            </td>

                            <td className="px-6 py-3.5">
                              <span className={`text-[8px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-widest border ${roleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>

                            <td className="px-6 py-3.5 text-right">
                              <div className="row-actions flex justify-end gap-2">
                                <button onClick={() => handleEdit(user)}
                                  className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 hover:text-[#0096ff] bg-slate-50 dark:bg-[#1a2228] hover:bg-[#0096ff]/10 dark:hover:bg-[#0096ff]/10 hover:border-[#0096ff]/30 border border-slate-200 dark:border-white/[0.06] px-3 py-1.5 rounded-lg transition-all">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteClick(user.id)}
                                  className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-[#1a2228] hover:bg-red-100 dark:hover:bg-red-400/10 hover:border-red-400/30 border border-slate-200 dark:border-white/[0.06] px-3 py-1.5 rounded-lg transition-all">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Stats footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center gap-6">
                {['ADMIN','SELLER','BUYER'].map(r => {
                  const count = users.filter(u => u.role === r).length;
                  const av    = avatarColor(r);
                  return (
                    <div key={r} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: av.color }}></span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {r}: <span className="text-slate-900 dark:text-white">{count}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Users;