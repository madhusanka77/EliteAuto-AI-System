import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';

const TS = {
  contentStyle: {
    backgroundColor: '#11181f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#fff' 
  },
};

// ── Activity Feed ─────────────────────────────────────────────
function ActivityFeed({ vehicles }) {
  const recent = vehicles.slice(0, 6);
  const getTag = (v, i) => {
    if (i === 0) return { tag: 'New Listing', tc: 'text-[#0096ff] bg-[#0096ff]/10', icon: '🚗', color: '#0096ff', bg: 'rgba(0,150,255,.12)' };
    if (v.condition === 'Brand New') return { tag: 'Brand New', tc: 'text-green-400 bg-green-400/10', icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,.12)' };
    if (v.condition === 'Reconditioned') return { tag: 'Reconditioned', tc: 'text-yellow-400 bg-yellow-400/10', icon: '📝', color: '#eab308', bg: 'rgba(234,179,8,.12)' };
    return { tag: 'Used', tc: 'text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-400/10', icon: '🔍', color: '#64748b', bg: 'rgba(148,163,184,.12)' };
  };
  return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Recent Activity</h3>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Live Feed <span className="text-[9px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded ml-1">Live</span></p>
        </div>
        <span className="text-[10px] text-slate-500">Latest {recent.length}</span>
      </div>
      <div className="flex flex-col">
        {recent.length === 0 && <p className="text-[11px] text-slate-500 py-4 text-center">No vehicles yet.</p>}
        {recent.map((v, i) => {
          const t = getTag(v, i);
          return (
            <div key={v.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-white/[0.04] last:border-b-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">{v.brand} {v.model} added to inventory</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Rs. {v.price?.toLocaleString()} • {v.year}</p>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded flex-shrink-0 ${t.tc}`}>{t.tag}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Top Valued Vehicles ───────────────────────────────────────
function TopSellingVehicles({ vehicles }) {
  const top = [...vehicles].sort((a, b) => b.price - a.price).slice(0, 4);
  const rankColor = (r) => r === 1 ? '#eab308' : r === 2 ? '#94a3b8' : r === 3 ? '#f97316' : '#475569';
  return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 flex flex-col transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Top Valued</h3>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Highest Priced</p>
        </div>
        <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-1.5 py-0.5 rounded font-black">Inventory</span>
      </div>
      <div className="flex flex-col gap-3">
        {top.length === 0 && <p className="text-[11px] text-slate-500 py-4 text-center">No vehicles yet.</p>}
        {top.map((v, i) => (
          <div key={v.id} className="bg-slate-50 dark:bg-[#1a2228] border border-slate-100 dark:border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black" style={{ color: rankColor(i + 1) }}>#{i + 1}</span>
              <div>
                <p className="text-[12px] font-black text-slate-900 dark:text-white">{v.brand} <span className="text-slate-500 dark:text-slate-400 font-normal">{v.model}</span></p>
                <p className="text-[10px] text-slate-500">{v.year} • {v.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-black text-slate-900 dark:text-white">Rs. {(v.price / 1000000).toFixed(1)}M</p>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded mt-0.5 inline-block text-[#0096ff] bg-[#0096ff]/10">{v.fuelType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Enquiry Tracker ───────────────────────────────────────────
const ENQUIRIES = [
  { initials:'AK', bg:'rgba(0,150,255,.15)',  color:'#0096ff', name:'Amal Kumara',      vehicle:'BMW X5',        status:'Negotiating', sc:'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10' },
  { initials:'RP', bg:'rgba(34,197,94,.15)',  color:'#22c55e', name:'Ravi Perera',       vehicle:'Toyota Prius',  status:'Interested',  sc:'text-[#0096ff] bg-[#0096ff]/10' },
  { initials:'SM', bg:'rgba(239,68,68,.15)',  color:'#ef4444', name:'Sunil Mendis',      vehicle:'Honda Vezel',   status:'Closed',      sc:'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10' },
  { initials:'NK', bg:'rgba(234,179,8,.15)',  color:'#eab308', name:'Nimal Karunaratne', vehicle:'Nissan Leaf',   status:'New',         sc:'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10' },
  { initials:'DW', bg:'rgba(0,150,255,.15)',  color:'#0096ff', name:'Dilshan Wijeratne', vehicle:'Mercedes E250', status:'Follow-up',   sc:'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10' },
];
function EnquiryTracker() {
  return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 flex flex-col transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Customer Enquiries</h3>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Tracker <span className="text-[9px] text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 px-1.5 py-0.5 rounded ml-1">8 New</span></p>
        </div>
      </div>
      <div className="flex flex-col">
        {ENQUIRIES.map((e, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-white/[0.04] last:border-b-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0" style={{ background: e.bg, color: e.color }}>{e.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">{e.name}</p>
              <p className="text-[10px] text-slate-500">{e.vehicle}</p>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded flex-shrink-0 ${e.sc}`}>{e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────
const HEAT_COLORS = ['#0f2033','#0d4d82','#0073c2','#0096ff','#38bdf8'];
function heatColor(val, max) {
  if (!max) return HEAT_COLORS[0];
  const idx = Math.min(Math.floor((val / max) * HEAT_COLORS.length), HEAT_COLORS.length - 1);
  return HEAT_COLORS[idx];
}
function VehicleAgeHeatmap({ brands, years, data }) {
  const allVals = brands.flatMap(b => data[b] || []);
  const maxVal  = allVals.length > 0 ? Math.max(...allVals) : 1;
  if (!brands.length) return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 transition-colors">
      <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Vehicle Age Heatmap</h3>
      <p className="text-[11px] text-slate-500 text-center py-6">No data yet.</p>
    </div>
  );
  return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vehicle Age Heatmap</h3>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Inventory by Year &amp; Brand</p>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-slate-500">
          <span>Low</span>{HEAT_COLORS.map((c,i)=><div key={i} className="w-3 h-3 rounded-sm" style={{background:c}}/>)}<span>High</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ display:'grid', gridTemplateColumns:`80px repeat(${years.length},1fr)`, gap:'4px', minWidth:'400px' }}>
          <div/>
          {years.map(y=><div key={y} className="text-center text-[9px] text-slate-500 font-bold pb-1">{y}</div>)}
          {brands.map(brand=>(
            <React.Fragment key={brand}>
              <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold flex items-center pr-2 truncate">{brand}</div>
              {(data[brand]||years.map(()=>0)).map((val,yi)=>(
                <div key={yi} className="rounded-md h-8 flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                  style={{background:heatColor(val,maxVal), opacity: val>0 ? 0.6+(val/maxVal)*0.4 : 0.15}}>
                  {val||''}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Profit Margin Calculator ──────────────────────────────────
function ProfitMarginCalculator({ avgPrice }) {
  const [purchase, setPurchase] = useState(avgPrice || 3500000);
  const [selling,  setSelling]  = useState(avgPrice ? Math.round(avgPrice * 1.2) : 4200000);
  const [expenses, setExpenses] = useState(120000);
  useEffect(() => {
    if (avgPrice > 0) { setPurchase(avgPrice); setSelling(Math.round(avgPrice * 1.2)); }
  }, [avgPrice]);
  const profit   = selling - purchase - expenses;
  const margin   = selling > 0 ? (profit / selling) * 100 : 0;
  const roi      = purchase > 0 ? (profit / purchase) * 100 : 0;
  const barPct   = Math.max(0, Math.min(100, margin));
  const barColor = barPct >= 15 ? '#22c55e' : barPct >= 5 ? '#eab308' : '#ef4444';
  const results  = [
    { label:'Net Profit',  val:`Rs. ${Math.round(profit).toLocaleString()}`,             color: profit>=0?'#22c55e':'#ef4444' },
    { label:'Margin %',    val:`${margin.toFixed(1)}%`,                                  color: margin>=15?'#22c55e':margin>=5?'#eab308':'#ef4444' },
    { label:'ROI',         val:`${roi.toFixed(1)}%`,                                     color: roi>=20?'#22c55e':roi>=8?'#eab308':'#ef4444' },
    { label:'Total Cost',  val:`Rs. ${Math.round(purchase+expenses).toLocaleString()}`,  color:'#64748b' },
  ];
  return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 transition-colors">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Profit Margin Calculator</h3>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Live Margin Estimator</p>
        </div>
        <span className="text-[9px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded font-black">Interactive</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[{label:'Purchase Price (Rs.)',val:purchase,set:(v)=>setPurchase(Number(v))},{label:'Selling Price (Rs.)',val:selling,set:(v)=>setSelling(Number(v))},{label:'Expenses (Rs.)',val:expenses,set:(v)=>setExpenses(Number(v))}].map((f,i)=>(
          <div key={i}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">{f.label}</p>
            <input type="number" value={f.val} onChange={(e)=>f.set(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a2228] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-white text-[13px] font-bold px-3 py-2 outline-none focus:border-[#0096ff]/50 transition-colors"/>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {results.map((r,i)=>(
          <div key={i} className="bg-slate-50 dark:bg-[#1a2228] border border-slate-100 dark:border-white/5 rounded-xl p-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{r.label}</p>
            <p className="text-base font-black mt-1" style={{color:r.color}}>{r.val}</p>
          </div>
        ))}
      </div>
      <div className="h-2 bg-slate-100 dark:bg-[#1a2228] rounded-full overflow-hidden">
        <div className="h-2 rounded-full transition-all duration-500" style={{width:`${barPct}%`,background:barColor}}/>
      </div>
      <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-600 mt-1"><span>0%</span><span>100%</span></div>
    </div>
  );
}

// ── Comparison Tool ───────────────────────────────────────────
const COMPARE_SPECS = ['Year','Price','Mileage','Fuel','Transmission','Condition','Engine'];
function VehicleComparisonTool({ vehicles }) {
  const top2 = [...vehicles].sort((a,b)=>b.price-a.price).slice(0,2);
  const getVals = (v) => [v.year, `Rs. ${v.price?.toLocaleString()}`, `${v.mileage?.toLocaleString()||0} km`, v.fuelType||'N/A', v.transmission||'N/A', v.condition, `${v.engine||'N/A'} cc`];
  if (top2.length < 2) return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 transition-colors">
      <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Comparison Tool</h3>
      <p className="text-[11px] text-slate-500 text-center py-6">Need at least 2 vehicles to compare.</p>
    </div>
  );
  return (
    <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg p-5 transition-colors">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Comparison Tool</h3>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Side-by-Side Analysis</p>
        </div>
        <span className="text-[9px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded font-black">Top 2 by Price</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-[500px]">
          <div className="pt-11 flex flex-col flex-shrink-0" style={{width:'110px'}}>
            {COMPARE_SPECS.map((s,i)=>(
              <div key={i} className="flex items-center py-2 border-b border-slate-100 dark:border-white/[0.04] last:border-b-0">
                <span className="text-[10px] text-slate-500 font-semibold">{s}</span>
              </div>
            ))}
          </div>
          {top2.map((v,ci)=>(
            <div key={ci} className="flex-1 bg-slate-50 dark:bg-[#1a2228] border border-slate-100 dark:border-white/5 rounded-xl p-3">
              <p className="text-[13px] font-black text-slate-900 dark:text-white mb-1">{v.brand} {v.model}</p>
              <span className="text-[8px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded font-black block mb-2">{v.condition}</span>
              {getVals(v).map((val,ri)=>(
                <div key={ri} className="flex items-center py-2 border-b border-slate-100 dark:border-white/[0.04] last:border-b-0">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN HOME ─────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();

  const [vehicles,        setVehicles]        = useState([]);
  const [stats,           setStats]           = useState({ total:0, brandNew:0, value:0, avgPrice:0 });
  const [aiStats,         setAiStats]         = useState({ accuracy: 0, data_samples: 0 }); // 🚀 AI Data සඳහා අලුත් State එක
  const [brandData,       setBrandData]       = useState([]);
  const [fuelData,        setFuelData]        = useState([]);
  const [transData,       setTransData]       = useState([]);
  const [priceRangeData,  setPriceRangeData]  = useState([]);
  const [heatmapData,     setHeatmapData]     = useState({ brands:[], years:[], data:{} });

  const sparkData = {
    s1:[{v:10},{v:25},{v:15},{v:40},{v:30},{v:50}],
    s2:[{v:50},{v:40},{v:30},{v:45},{v:20},{v:35}],
    s3:[{v:100},{v:120},{v:90},{v:150},{v:180},{v:170}],
    s4:[{v:10},{v:15},{v:12},{v:20},{v:18},{v:25}],
  };
  const barChartData = [
    {name:'Jan',val:200},{name:'Feb',val:300},{name:'Mar',val:150},
    {name:'Apr',val:400},{name:'May',val:250},{name:'Jun',val:450},{name:'Jul',val:380},
  ];
  const areaChartData = [
    {name:'Q1',profit:4000},{name:'Q2',profit:3000},{name:'Q3',profit:6000},
    {name:'Q4',profit:8000},{name:'Q5',profit:5000},{name:'Q6',profit:9000},
  ];
  const weeklyData = [
    {day:'Mon',views:45,leads:8,enquiries:3},{day:'Tue',views:72,leads:12,enquiries:5},
    {day:'Wed',views:58,leads:9,enquiries:4},{day:'Thu',views:90,leads:15,enquiries:7},
    {day:'Fri',views:110,leads:18,enquiries:9},{day:'Sat',views:135,leads:22,enquiries:11},
    {day:'Sun',views:98,leads:14,enquiries:6},
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 🚀 Spring Boot දත්ත ලබා ගැනීම
      const res   = await axios.get('http://localhost:8080/api/vehicles/all');
      const vData = res.data.reverse();
      setVehicles(vData);

      axios.get('http://127.0.0.1:5000/model-stats')
        .then(ra => setAiStats(ra.data))
        .catch(e => console.log("AI Server error"));

      // Stats
      let totalVal=0, newCount=0;
      vData.forEach(v=>{ totalVal+=v.price; if(v.condition==='Brand New') newCount++; });
      setStats({ total:vData.length, brandNew:newCount, value:totalVal, avgPrice:vData.length>0?Math.round(totalVal/vData.length):0 });

      // Brand Distribution
      const brandCount={};
      vData.forEach(v=>{ brandCount[v.brand]=(brandCount[v.brand]||0)+1; });
      const computedBrandData = Object.entries(brandCount).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,5);
      setBrandData(computedBrandData);

      // Fuel Type
      const fuelColors={Petrol:'#0096ff',Diesel:'#38bdf8',Hybrid:'#22c55e',Electric:'#eab308'};
      const fuelCount={};
      vData.forEach(v=>{ if(v.fuelType) fuelCount[v.fuelType]=(fuelCount[v.fuelType]||0)+1; });
      setFuelData(Object.entries(fuelCount).map(([name,value])=>({ name, value, fill:fuelColors[name]||'#64748b' })));

      // Transmission
      const transColors={Automatic:'#0096ff',Manual:'#64748b',Tiptronic:'#22c55e'};
      const transCount={};
      vData.forEach(v=>{ if(v.transmission) transCount[v.transmission]=(transCount[v.transmission]||0)+1; });
      const tot=vData.length||1;
      setTransData(Object.entries(transCount).map(([name,value])=>({ name, value, pct:Math.round((value/tot)*100), color:transColors[name]||'#64748b' })));

      // Price Buckets
      const buckets=[
        {range:'<1M',  min:0,       max:1000000 },{range:'1-2M', min:1000000, max:2000000},
        {range:'2-3M', min:2000000, max:3000000 },{range:'3-5M', min:3000000, max:5000000},
        {range:'5-8M', min:5000000, max:8000000 },{range:'8-12M',min:8000000, max:12000000},
        {range:'12M+', min:12000000,max:Infinity},
      ];
      setPriceRangeData(buckets.map(b=>({ range:b.range, count:vData.filter(v=>v.price>=b.min&&v.price<b.max).length })));

      // Heatmap
      const topBrands = Object.entries(brandCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([b])=>b);
      const hmYears   = ['2019','2020','2021','2022','2023','2024'];
      const hmData    = {};
      topBrands.forEach(brand=>{
        hmData[brand]=hmYears.map(year=>vData.filter(v=>v.brand===brand&&String(v.year)===year).length);
      });
      setHeatmapData({ brands:topBrands, years:hmYears, data:hmData });

    } catch(err) { console.error('Error fetching data:', err); }
  };

  // Derived
  const conditionsCount = vehicles.reduce((acc,v)=>{ acc[v.condition]=(acc[v.condition]||0)+1; return acc; },{});
  const pieData         = Object.keys(conditionsCount).map(key=>({ name:key, value:conditionsCount[key] }));
  const PIE_COLORS      = ['#0096ff','#8884d8','#64748b'];
  const maxBrandCount   = brandData.length>0 ? Math.max(...brandData.map(b=>b.count)) : 1;
  const totalFuel       = fuelData.reduce((a,b)=>a+b.value,0)||1;
  const targetSold      = vehicles.filter(v=>v.condition!=='Brand New').length;
  const targetPct       = vehicles.length>0 ? Math.min(Math.round((targetSold/vehicles.length)*100),100) : 0;
  const targetDonutData = [{ name:'Used/Recon', value:targetPct, fill:'#0096ff' },{ name:'New', value:100-targetPct, fill:'#cbd5e1' }]; 
  const funnelData      = [
    {name:'Visitors',    value:vehicles.length*48, fill:'#0096ff'},
    {name:'Views',       value:vehicles.length*28, fill:'#38bdf8'},
    {name:'Enquiries',   value:vehicles.length*10, fill:'#22c55e'},
    {name:'Negotiations',value:vehicles.length*4,  fill:'#eab308'},
    {name:'Sold',        value:Math.max(vehicles.length,1), fill:'#f97316'},
  ];

  const gridColor = "rgba(148, 163, 184, 0.2)";

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100 flex flex-col gap-4 animate-fade-in pb-10 transition-colors">

      {/* TOP ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          {[
            {label:'Total Inventory', badge:'+12%', bc:'text-[#0096ff] bg-[#0096ff]/10', val:stats.total,     sub:'Active Vehicles',spark:sparkData.s1,stroke:'#0096ff'},
            {label:'Brand New',       badge:`${stats.total>0?Math.round((stats.brandNew/stats.total)*100):0}%`, bc:'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10', val:stats.brandNew, sub:'0 Mileage Cars', spark:sparkData.s2,stroke:'#ef4444'},
          ].map((c,i)=>(
            <div key={i} className="bg-white dark:bg-[#11181f] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col justify-between relative overflow-hidden transition-colors">
              <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={c.spark}><Line type="monotone" dataKey="v" stroke={c.stroke} strokeWidth={2} dot={false}/></LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{c.label}</span>
                <span className={`text-[9px] ${c.bc} px-1.5 py-0.5 rounded font-black`}>{c.badge}</span>
              </div>
              <div className="mt-3 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{c.val}</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
          <div className="bg-white dark:bg-[#11181f] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col justify-between relative overflow-hidden transition-colors">
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData.s3}><Line type="monotone" dataKey="v" stroke="#0096ff" strokeWidth={2} dot={false}/></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Value</span>
              <span className="text-[9px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded font-black">+5%</span>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white"><span className="text-xs text-slate-500 mr-1">Rs.</span>{(stats.value/1000000).toFixed(1)}<span className="text-xs">M</span></h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Market Worth</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#11181f] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col justify-between relative overflow-hidden transition-colors">
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData.s4}><Line type="monotone" dataKey="v" stroke="#0096ff" strokeWidth={2} dot={false}/></LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Avg Price</span>
              <span className="text-[9px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded font-black">+8%</span>
            </div>
            <div className="mt-3 relative z-10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white truncate"><span className="text-[10px] text-slate-500 mr-1">Rs.</span>{stats.avgPrice.toLocaleString()}</h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Per Vehicle</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg relative overflow-hidden flex flex-col justify-between transition-colors">
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(currentColor 1px,transparent 1px)',backgroundSize:'16px 16px'}}></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0096ff]/15 via-transparent to-transparent opacity-80 pointer-events-none"></div>
          <div className="absolute top-4 left-4 bg-white/80 dark:bg-[#1a2228]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg z-20 shadow-sm">
            <span className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-0.5">Sys Status</span>
            <span className="text-[10px] text-[#0096ff] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#0096ff] rounded-full animate-pulse"></span> ONLINE</span>
          </div>
          <div className="absolute top-4 right-4 bg-white/80 dark:bg-[#1a2228]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg z-20 text-right shadow-sm">
            <span className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-0.5">Live Sync</span>
            <span className="text-[10px] text-slate-900 dark:text-white font-bold">100%</span>
          </div>
          <div className="relative z-10 flex-grow flex items-center justify-center -mt-2">
            <img src="https://freepngimg.com/thumb/car/3-2-car-free-download-png.png" alt="Premium Car" className="w-[85%] object-contain drop-shadow-[0_15px_20px_rgba(0,150,255,0.25)]"/>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2 relative z-10">
            {[
              {icon:'📍',color:'text-red-500',   label:'Listed',val:stats.total},
              {icon:'⚡',color:'text-yellow-500',label:'Views', val:stats.total*14},
              {icon:'📞',color:'text-[#0096ff]', label:'Leads', val:Math.round(stats.total*1.8)},
            ].map((s,i)=>(
              <div key={i} className="flex flex-col items-center bg-slate-50 dark:bg-[#1a2228] py-2 rounded-xl border border-slate-100 dark:border-white/5">
                <span className={`${s.color} mb-0.5 text-[10px]`}>{s.icon}</span>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">{s.label}</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Market Activity</h3>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{(stats.total*14).toLocaleString()} <span className="text-[#0096ff] text-[9px] bg-[#0096ff]/10 px-1.5 py-0.5 rounded ml-1">Views</span></p>
            </div>
          </div>
          <div className="flex-grow w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                <Tooltip cursor={{fill:'rgba(148, 163, 184, 0.1)'}} {...TS}/>
                <Bar dataKey="val" fill="#0096ff" radius={[4,4,4,4]} barSize={10}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase mt-2 px-1">
            {barChartData.map(d=><span key={d.name}>{d.name}</span>)}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 🚀 FIXED AI ACCURACY SPEEDOMETER */}
        <div className="lg:col-span-4 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col items-center justify-center relative overflow-hidden transition-colors">
          <div className="w-full flex justify-between items-start absolute top-5 px-5 z-20">
            <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">AI Accuracy</h3>
            <span className="text-[9px] text-[#0096ff] font-black border border-[#0096ff]/30 px-1.5 py-0.5 rounded">LIVE</span>
          </div>
          <div className="relative w-40 h-40 flex items-center justify-center z-10 mt-6">
            <div className="absolute w-full h-full rounded-full border-[10px] border-slate-100 dark:border-[#1a2228]"></div>
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="url(#blueGrad)" strokeWidth="10"
                strokeDasharray="440" 
                strokeDashoffset={440-(440*(aiStats?.accuracy || 0))/100}
                className="transition-all duration-1000 ease-out" strokeLinecap="round"/>
              <defs>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0096ff"/><stop offset="100%" stopColor="#38bdf8"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center text-center">
              
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {Math.round(aiStats?.accuracy || 0)}
              </span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 mt-4 text-center z-10 w-full border-t border-slate-200 dark:border-white/5 pt-3">
            Precision based on {aiStats?.data_samples || 0} real-time market samples.
          </p>
        </div>

        {/* Condition Donut */}
        <div className="lg:col-span-4 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">Condition Breakdown</h3>
          <div className="flex items-center gap-6 flex-grow pt-2">
            <div className="w-32 h-32 flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip {...TS}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-lg font-black text-slate-900 dark:text-white">{stats.total}</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-grow">
              {pieData.map((item,i)=>(
                <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-[#1a2228] p-2 rounded-lg border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}></div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Area Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <div className="mb-2">
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Valuation Trend</h3>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">Rs. {(stats.value/1000000).toFixed(1)}M <span className="text-yellow-600 dark:text-yellow-500 text-[9px] bg-yellow-100 dark:bg-yellow-500/10 px-1.5 py-0.5 rounded ml-1">⇡ Live</span></p>
          </div>
          <div className="flex-grow w-full h-24 -mb-2 -ml-2 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0096ff" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#0096ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                <Tooltip {...TS}/>
                <Area type="monotone" dataKey="profit" stroke="#0096ff" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART ROW 1 — Brand + Funnel + Target */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Brand Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Brand Distribution</h3>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Top Makes <span className="text-[9px] text-[#0096ff] bg-[#0096ff]/10 px-1.5 py-0.5 rounded ml-1">Live</span></p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-4">
            {brandData.map((b,i)=>{
              const pct=Math.round((b.count/maxBrandCount)*100);
              return(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 w-14 flex-shrink-0 truncate">{b.name}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-[#1a2228] rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-[#0096ff]" style={{width:`${pct}%`}}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white w-5 text-right">{b.count}</span>
                </div>
              );
            })}
          </div>
          <div className="flex-grow h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:9,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <Tooltip cursor={{fill:'rgba(148, 163, 184, 0.1)'}} {...TS}/>
                <Bar dataKey="count" fill="#0096ff" radius={[4,4,4,4]} barSize={14}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sales Funnel</h3>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Lead Conversion <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-1.5 py-0.5 rounded ml-1">Live</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500">Est. Rate</p>
              <p className="text-sm font-black text-[#0096ff]">
                {funnelData[0]?.value>0?((funnelData[4]?.value/funnelData[0]?.value)*100).toFixed(1):0}%
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-grow justify-center">
            {funnelData.map((stage,i)=>{
              const maxVal=funnelData[0]?.value||1;
              const width=Math.round((stage.value/maxVal)*100);
              const prevVal=i>0?funnelData[i-1].value:null;
              const dropPct=prevVal?Math.round(((prevVal-stage.value)/prevVal)*100):null;
              return(
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 text-right flex-shrink-0"><span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{stage.name}</span></div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 dark:bg-[#1a2228] rounded-md overflow-hidden h-8">
                      <div className="h-full rounded-md flex items-center px-2" style={{width:`${width}%`,backgroundColor:stage.fill+'33',borderLeft:`3px solid ${stage.fill}`}}>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white whitespace-nowrap">{stage.value.toLocaleString()}</span>
                      </div>
                    </div>
                    {dropPct!==null&&<span className="text-[9px] text-red-500 dark:text-red-400 w-10 text-right flex-shrink-0">-{dropPct}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Health Donut */}
        <div className="lg:col-span-3 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col items-center justify-center transition-colors">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Inventory Health</h3>
          <div className="relative w-36 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={targetDonutData} innerRadius={46} outerRadius={68} dataKey="value" startAngle={90} endAngle={-270} stroke="none" paddingAngle={2}>
                  {targetDonutData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{targetPct}%</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">Used/Recon</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART ROW 2 — Price Distribution + Fuel & Trans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Price Distribution</h3>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Inventory Spread</p>
            </div>
          </div>
          <div className="flex-grow h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceRangeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                <XAxis dataKey="range" tick={{fontSize:9,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:'#64748b'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip cursor={{fill:'rgba(148, 163, 184, 0.1)'}} {...TS}/>
                <Bar dataKey="count" fill="#0096ff" radius={[4,4,0,0]} barSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg flex flex-col transition-colors">
          <div className="mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vehicle Specs</h3>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Fuel &amp; Transmission</p>
          </div>
          <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-2">Fuel Type</p>
          <div className="flex flex-col gap-2 mb-4">
            {fuelData.map((f,i)=>{
              const pct=Math.round((f.value/totalFuel)*100);
              return(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">{f.name}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-[#1a2228] rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{width:`${pct}%`,backgroundColor:f.fill}}></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white w-5 text-right">{f.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WEEKLY TIMELINE */}
      <div className="bg-white dark:bg-[#11181f] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Weekly Engagement</h3>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">Leads &amp; Views Timeline</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
              <XAxis dataKey="day" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
              <Tooltip {...TS}/>
              <Line type="monotone" dataKey="views" stroke="#0096ff" strokeWidth={2} dot={{fill:'#0096ff',r:3}}/>
              <Line type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} dot={{fill:'#22c55e',r:3}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EXTRA SECTIONS */}
      <ActivityFeed vehicles={vehicles}/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopSellingVehicles vehicles={vehicles}/>
        <EnquiryTracker/>
      </div>
      <VehicleAgeHeatmap brands={heatmapData.brands} years={heatmapData.years} data={heatmapData.data}/>
      <ProfitMarginCalculator avgPrice={stats.avgPrice}/>
      <VehicleComparisonTool vehicles={vehicles}/>

      {/* RECENT ADDITIONS TABLE */}
      <div className="bg-white dark:bg-[#11181f] rounded-2xl border border-slate-200 dark:border-white/5 shadow-md dark:shadow-lg overflow-hidden flex flex-col mt-1 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#1a2228]/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Recent Additions</h3>
          <button onClick={()=>navigate('/vehicles')} className="text-[10px] font-bold text-[#0096ff] border border-[#0096ff]/30 px-3 py-1.5 rounded-lg hover:bg-[#0096ff] hover:text-white transition-all uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] uppercase tracking-widest text-slate-500 bg-white dark:bg-[#11181f]">
                {['Vehicle Ref','Brand & Model','Year','Condition','Asking Price','Status'].map((h,i)=>(
                  <th key={i} className={`px-5 py-3 font-bold ${i===4?'text-right':i===5?'text-center':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs">
              {vehicles.slice(0,5).map(v=>(
                <tr key={v.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={()=>navigate(`/vehicle/${v.id}`,{state:{vehicle:v}})}>
                  <td className="px-5 py-3"><div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#1a2228] flex items-center justify-center text-[9px] text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-white/5">#{v.id}</div></td>
                  <td className="px-5 py-3"><p className="font-bold text-slate-900 dark:text-white text-[13px]">{v.brand}</p><p className="text-[10px] text-slate-500 mt-0.5">{v.model}</p></td>
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-medium text-[11px]">{v.year}</td>
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-medium text-[11px]">{v.condition}</td>
                  <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white text-[13px]">Rs. {v.price?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-center"><span className="bg-[#0096ff]/10 text-[#0096ff] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#0096ff]/20">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Home;