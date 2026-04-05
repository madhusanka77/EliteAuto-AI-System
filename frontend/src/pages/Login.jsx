import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [credentials,  setCredentials]  = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [toast,        setToast]        = useState(null);
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) =>
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    axios.post('http://localhost:8080/api/users/login', credentials)
      .then(res => {
        const user = res.data;
        showToast(`Welcome back, ${user.firstName}! 🎉`, 'success');
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        setTimeout(() => { window.location.href = '/'; }, 1500);
      })
      .catch(err => {
        console.error('Login Error:', err);
        showToast('Invalid email or password! ❌', 'error');
        setIsSubmitting(false);
      });
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0d1117] transition-colors duration-300">

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 4s ease-in-out infinite; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 12s linear infinite; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #f8fafc inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
        html.dark input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #1a2228 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      {/* ── Background elements ──────────────────────────── */}
      <div className="absolute inset-0 opacity-10 dark:opacity-[0.025]"
        style={{ backgroundImage:'radial-gradient(currentColor 1px,transparent 1px)', backgroundSize:'28px 28px' }}></div>

      {/* Large glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(0,150,255,0.12) 0%,transparent 70%)' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(0,150,255,0.08) 0%,transparent 70%)' }}></div>

      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-slate-200 dark:border-white/[0.03] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-slate-200 dark:border-white/[0.04] pointer-events-none spin-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#0096ff]/20 dark:border-[#0096ff]/[0.06] pointer-events-none"></div>

      {/* ── TOAST ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] min-w-[280px] p-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 bg-white dark:bg-[#11181f] text-slate-900 dark:text-white transition-colors ${
          toast.type === 'success' ? 'border-[#0096ff]' : 'border-red-500'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-bold text-[11px] uppercase tracking-widest">{toast.message}</p>
        </div>
      )}

      {/* ── LOGIN CARD ────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md px-4 fade-up">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 float relative"
            style={{ background:'rgba(0,150,255,0.12)', border:'1px solid rgba(0,150,255,0.2)' }}>
            {/* Glow ring around icon */}
            <div className="absolute inset-0 rounded-2xl"
              style={{ boxShadow:'0 0 30px rgba(0,150,255,0.2)' }}></div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0096ff"
              strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 relative z-10">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </div>

          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 transition-colors">
            Dealer <span className="text-[#0096ff]">Portal</span>
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#0096ff] to-transparent mx-auto mt-3 mb-3"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#11181f] border border-slate-200 dark:border-white/[0.07] rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-colors"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.1)' }}>

          {/* Top accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#0096ff] to-transparent"></div>

          <div className="p-8">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input
                    type="email" name="email" value={credentials.email}
                    onChange={handleChange} required
                    className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium pl-11 pr-4 py-3.5 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="admin@eliteauto.lk"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'} name="password"
                    value={credentials.password} onChange={handleChange} required
                    className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.07] focus:border-[#0096ff]/50 text-slate-900 dark:text-white text-sm font-medium pl-11 pr-12 py-3.5 rounded-xl outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                  {/* Show/hide password */}
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md dark:shadow-lg mt-2 ${
                  isSubmitting
                    ? 'bg-slate-500 dark:bg-slate-600 cursor-not-allowed opacity-70'
                    : 'bg-[#0096ff] hover:bg-[#0080e6] shadow-[#0096ff]/25 hover:shadow-[#0096ff]/40'
                }`}
                style={{ boxShadow: isSubmitting ? undefined : '0 8px 24px rgba(0,150,255,0.25)' }}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    Secure Login
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.05] text-center">
              <p className="text-[8px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-1">
                Forgot your password?
              </p>
              <button type="button"
                className="text-[#0096ff] hover:text-slate-900 dark:hover:text-white text-[10px] font-bold transition-colors uppercase tracking-widest">
                Contact System Administrator
              </button>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.04] to-transparent"></div>
        </div>

        {/* Security note */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[8px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          Secured connection • EliteAuto {new Date().getFullYear()}
        </div>

      </div>
    </div>
  );
}

export default Login;