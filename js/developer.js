// ══════════════════════════════════════════════════════════════
// ══  DEVELOPER PROFILE PAGE — Abhishek Kumar              ══
// ══════════════════════════════════════════════════════════════

window.openDeveloperPage = () => {
  // Prevent duplicate
  if (document.getElementById("developer-overlay")) {
    document.getElementById("developer-overlay").style.display = "flex";
    document.body.style.overflow = "hidden";
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "developer-overlay";
  overlay.className = "fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto";
  overlay.style.cssText = "background:#020617; animation: viewFadeIn 0.4s ease; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);";
  document.body.style.overflow = "hidden";

  overlay.innerHTML = `
    <style>
      #developer-overlay * { box-sizing: border-box; }
      @keyframes devFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes devSlideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
      @keyframes devSkillBar { from { width: 0%; } }
      @keyframes devPulseGlow { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.05); } }
      .dev-card { animation: devSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      .dev-card:nth-child(1) { animation-delay: 0.1s; }
      .dev-card:nth-child(2) { animation-delay: 0.2s; }
      .dev-card:nth-child(3) { animation-delay: 0.3s; }
      .dev-card:nth-child(4) { animation-delay: 0.4s; }
      .dev-card:nth-child(5) { animation-delay: 0.5s; }
      .dev-card:nth-child(6) { animation-delay: 0.6s; }
      .dev-skill-fill { animation: devSkillBar 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; width: 0%; }
      .delay-1 { animation-delay: 0.8s; }
      .delay-2 { animation-delay: 0.9s; }
      .delay-3 { animation-delay: 1.0s; }
      .delay-4 { animation-delay: 1.1s; }
      .dev-bg-grid { background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 3rem 3rem; }
    </style>

    <!-- Background Canvas -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute inset-0 bg-[#020617]"></div>
      <div class="absolute inset-0 dev-bg-grid"></div>
      <div class="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-[#C8A24A]/[0.05] blur-[150px] rounded-full mix-blend-screen" style="animation: devPulseGlow 8s ease-in-out infinite;"></div>
      <div class="absolute top-[40%] -right-[20%] w-[900px] h-[900px] bg-blue-600/[0.04] blur-[150px] rounded-full mix-blend-screen" style="animation: devPulseGlow 10s ease-in-out infinite reverse;"></div>
      <div class="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] bg-emerald-600/[0.04] blur-[150px] rounded-full mix-blend-screen" style="animation: devPulseGlow 12s ease-in-out infinite;"></div>
    </div>

    <!-- Navigation -->
    <div class="fixed top-0 left-0 w-full z-[100000] p-6 lg:p-10 flex items-center justify-between pointer-events-none">
      <button onclick="closeDeveloperPage()" class="pointer-events-auto flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-x-1">
        <i class="fas fa-arrow-left text-xs text-[#C8A24A]"></i>
        <span>Back to Site</span>
      </button>
      <button onclick="closeDeveloperPage()" class="pointer-events-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:scale-110 hover:rotate-90" aria-label="Close">
        <i class="fas fa-xmark text-lg"></i>
      </button>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full max-w-5xl mx-auto px-6 py-28 lg:py-32">

      <div class="text-center mb-24 dev-card">
        <!-- Aesthetic Avatar -->
        <div class="relative inline-block mb-10" style="animation: devFloat 4s ease-in-out infinite;">
          <div class="absolute -inset-4 bg-gradient-to-r from-[#C8A24A] via-emerald-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div class="relative w-36 h-36 lg:w-44 lg:h-44 rounded-[2.5rem] overflow-hidden border-2 border-white/20 shadow-[0_20px_50px_-10px_rgba(200,162,74,0.4)] rotate-3 hover:rotate-0 transition-transform duration-500 bg-[#060b18]">
            <img src="assets/img/abhi.jpeg" alt="Abhishek Kumar" class="absolute inset-0 w-full h-full object-cover z-10">
            <!-- Glass Overlay -->
            <div class="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30 z-20 pointer-events-none"></div>
          </div>
          <!-- Status Badge -->
          <div class="absolute -bottom-3 -right-3 px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl border-4 border-[#020617] shadow-xl flex items-center gap-2 z-30">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Available Now
          </div>
        </div>

        <h1 class="text-5xl lg:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
          Abhishek <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#eadeb5] via-[#C8A24A] to-[#8d6d2a]">Kumar</span>
        </h1>
        
        <p class="text-slate-400 text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-8">
          Crafting premium digital experiences. I specialize in building robust, beautifully designed full-stack applications that solve real-world problems.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 mb-10">
          <span class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs font-bold shadow-sm backdrop-blur-sm"><i class="fas fa-laptop-code text-[#C8A24A]"></i> Full-Stack Developer</span>
          <span class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs font-bold shadow-sm backdrop-blur-sm"><i class="fas fa-paint-brush text-blue-400"></i> UI/UX Designer</span>
          <span class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs font-bold shadow-sm backdrop-blur-sm"><i class="fas fa-graduation-cap text-emerald-400"></i> BCA Student, LPU</span>
        </div>

        <!-- Social Connect -->
        <div class="flex items-center justify-center gap-4">
          <a href="https://github.com/Abhi-2636" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] text-white font-bold transition-all duration-300 hover:-translate-y-1">
            <i class="fab fa-github text-xl"></i> <span class="hidden sm:inline">GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/abhishek-kumar-797aa7219" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 hover:bg-[#0a66c2] text-white font-bold transition-all duration-300 hover:-translate-y-1">
            <i class="fab fa-linkedin-in text-xl"></i> <span class="hidden sm:inline">LinkedIn</span>
          </a>
          <a href="https://www.instagram.com/king_abhi2636/" target="_blank" rel="noopener noreferrer" class="group w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
            <div class="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i class="fab fa-instagram text-xl relative z-10"></i>
          </a>
        </div>
      </div>


      <!-- ═══ Featured Masterpiece: ANVI STAY ═══ -->
      <div class="mb-20 dev-card">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A24A] to-amber-700 p-[1px]">
              <div class="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
                <i class="fas fa-crown text-[#C8A24A]"></i>
              </div>
            </div>
            <div>
              <h3 class="text-2xl font-black text-white tracking-tight">Flagship Product</h3>
              <p class="text-[#C8A24A] text-xs font-bold uppercase tracking-widest">Case Study</p>
            </div>
          </div>
        </div>

        <div class="relative bg-[#060b18] border border-white/[0.08] rounded-[2.5rem] p-1 shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-br from-[#C8A24A]/10 to-transparent opacity-50 rounded-[2.5rem]"></div>
          
          <div class="relative bg-[#0b1120] rounded-[2.25rem] p-8 lg:p-12 overflow-hidden">
            <!-- Decorative Graphics -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C8A24A]/20 to-transparent opacity-30 rounded-bl-[100px]"></div>
            <i class="fas fa-quote-right absolute -bottom-10 -right-10 text-[150px] text-white/[0.02]"></i>

            <div class="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <!-- Content -->
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-bold text-white mb-6">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Production Ready
                </div>
                
                <h4 class="text-4xl font-black text-white mb-2">ANVI STAY</h4>
                <p class="text-xl text-[#C8A24A] font-medium mb-6">Complete PG & Hostel Management OS</p>
                
                <p class="text-slate-400 leading-relaxed mb-8">
                  ANVI STAY is a full-stack operational engine designed to digitize and automate the entire student housing experience near LPU.
                  From prospective tenant inquiries to automated monthly billing, the system seamlessly manages a network of 8+ premium properties.
                </p>

                <div class="space-y-4 mb-8">
                  <div class="flex items-start gap-3">
                    <div class="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-emerald-400 text-xs"></i></div>
                    <p class="text-sm text-slate-300"><strong>Real-time Admin Dashboard:</strong> Revenue charts, occupancy tracking, and ticket management.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-emerald-400 text-xs"></i></div>
                    <p class="text-sm text-slate-300"><strong>Automated Billing & Invoicing:</strong> Instant PDF receipts, payment tracking, and WhatsApp integrations.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-emerald-400 text-xs"></i></div>
                    <p class="text-sm text-slate-300"><strong>Premium UI Engineering:</strong> Apple-inspired glassmorphism, dynamic data tables, and a mobile-first design.</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 rounded-lg bg-[#f7df1e]/10 text-[#f7df1e] text-xs font-bold">JavaScript ES6+</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[#339933]/10 text-[#339933] text-xs font-bold">Node/Express</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[#47A248]/10 text-[#47A248] text-xs font-bold">MongoDB</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[#38B2AC]/10 text-[#38B2AC] text-xs font-bold">Tailwind CSS</span>
                </div>
              </div>

              <!-- Visual Representation / Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-server text-3xl text-emerald-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">Robust Backend</h5>
                  <p class="text-xs text-slate-400 relative z-10">REST API with JWT Auth</p>
                </div>
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group translate-y-6">
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-paint-roller text-3xl text-blue-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">Premium UI/UX</h5>
                  <p class="text-xs text-slate-400 relative z-10">Glassmorphic Animations</p>
                </div>
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-chart-line text-3xl text-purple-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">Data Analytics</h5>
                  <p class="text-xs text-slate-400 relative z-10">Chart.js Revenue Graphs</p>
                </div>
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group translate-y-6">
                  <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-mobile-alt text-3xl text-amber-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">Cross-Platform</h5>
                  <p class="text-xs text-slate-400 relative z-10">100% Mobile Responsive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Another Masterpiece: Heaven Rooms ═══ -->
      <div class="mb-20 dev-card delay-1">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-[1px]">
              <div class="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
                <i class="fas fa-building text-emerald-400"></i>
              </div>
            </div>
            <div>
              <h3 class="text-2xl font-black text-white tracking-tight">Premium Architecture</h3>
              <p class="text-emerald-400 text-xs font-bold uppercase tracking-widest">Case Study</p>
            </div>
          </div>
        </div>

        <div class="relative bg-[#060b18] border border-white/[0.08] rounded-[2.5rem] p-1 shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50 rounded-[2.5rem]"></div>
          
          <div class="relative bg-[#0b1120] rounded-[2.25rem] p-8 lg:p-12 overflow-hidden">
            <!-- Decorative Graphics -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 to-transparent opacity-30 rounded-bl-[100px]"></div>
            <i class="fas fa-quote-right absolute -bottom-10 -right-10 text-[150px] text-white/[0.02]"></i>

            <div class="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <!-- Content -->
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-bold text-white mb-6">
                  <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> App-Like UX
                </div>
                
                <h4 class="text-4xl font-black text-white mb-2">Heaven Rooms</h4>
                <p class="text-xl text-emerald-400 font-medium mb-6">Premium Student Accommodation Platform</p>
                
                <p class="text-slate-400 leading-relaxed mb-8">
                  Designed and developed the frontend architecture for Heaven Rooms, a luxury student accommodation service located near Lovely Professional University (LPU). The platform delivers a premium, app-like user experience through modern glassmorphism design, advanced micro-interactions, and robust dynamic filtering capabilities.
                </p>

                <div class="space-y-4 mb-8">
                  <div class="flex items-start gap-3">
                    <div class="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-blue-400 text-xs"></i></div>
                    <p class="text-sm text-slate-300"><strong>Dynamic Property Filtering:</strong> Client-side filtering/sorting based on budget, availability, and name without page reloads.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-blue-400 text-xs"></i></div>
                    <p class="text-sm text-slate-300"><strong>Advanced Micro-Interactions:</strong> Trailing cursors, magnetic CTAs, and a spotlight-tracking effect on components.</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check text-blue-400 text-xs"></i></div>
                    <p class="text-sm text-slate-300"><strong>Conversion Optimization:</strong> WhatsApp API integration, interactive Swiper sliders, dynamic FAQ, and Maps API.</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1.5 rounded-lg bg-[#E34F26]/10 text-[#E34F26] text-xs font-bold">HTML5</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[#1572B6]/10 text-[#1572B6] text-xs font-bold">Vanilla CSS/JS</span>
                  <span class="px-3 py-1.5 rounded-lg bg-[#FFD700]/10 text-[#FFD700] text-xs font-bold">Swiper/Lenis.js</span>
                </div>
              </div>

              <!-- Visual Representation / Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-magic text-3xl text-blue-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">Glassmorphism</h5>
                  <p class="text-xs text-slate-400 relative z-10">Frosted Glass UI Elements</p>
                </div>
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group translate-y-6">
                  <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-bolt text-3xl text-emerald-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">High Performance</h5>
                  <p class="text-xs text-slate-400 relative z-10">Smooth Scroll & Animations</p>
                </div>
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-br from-[#C8A24A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-filter text-3xl text-[#C8A24A] mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">Smart Filtering</h5>
                  <p class="text-xs text-slate-400 relative z-10">No-Reload Data Sorting</p>
                </div>
                <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.05] transition-colors relative overflow-hidden group translate-y-6">
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i class="fas fa-users text-3xl text-purple-400 mb-4 block relative z-10 group-hover:scale-110 transition-transform"></i>
                  <h5 class="text-white font-bold mb-1 relative z-10">High Impact</h5>
                  <p class="text-xs text-slate-400 relative z-10">500+ Daily Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Technical Arsenal ═══ -->
      <div class="mb-24 dev-card">
        <h3 class="text-2xl font-black text-white tracking-tight mb-2 text-center">Technical Arsenal</h3>
        <p class="text-slate-400 text-sm text-center mb-10">Tools & technologies mastered for production</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Frontend -->
          <div class="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-3xl p-8 hover:border-[#C8A24A]/40 transition-colors group">
            <h4 class="text-white font-bold mb-6 flex items-center gap-2"><i class="fas fa-layer-group text-[#C8A24A]"></i> Frontend Development</h4>
            <div class="space-y-5">
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">HTML5 / CSS3 / Vanilla JS</span><span class="text-[#C8A24A] font-bold">98%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-1 h-full bg-gradient-to-r from-yellow-500 to-[#C8A24A]" style="width: 98%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">Tailwind CSS (Advanced)</span><span class="text-[#C8A24A] font-bold">95%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-2 h-full bg-gradient-to-r from-cyan-500 to-blue-500" style="width: 95%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">Responsive & Animation Design</span><span class="text-[#C8A24A] font-bold">90%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-3 h-full bg-gradient-to-r from-pink-500 to-purple-500" style="width: 90%;"></div></div>
              </div>
            </div>
          </div>

          <!-- Backend -->
          <div class="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-3xl p-8 hover:border-emerald-500/40 transition-colors group">
            <h4 class="text-white font-bold mb-6 flex items-center gap-2"><i class="fas fa-server text-emerald-400"></i> Backend Engineering</h4>
            <div class="space-y-5">
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">Node.js / Express.js</span><span class="text-emerald-400 font-bold">92%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-1 h-full bg-gradient-to-r from-emerald-600 to-green-400" style="width: 92%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">RESTful API Design</span><span class="text-emerald-400 font-bold">90%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-2 h-full bg-gradient-to-r from-teal-500 to-emerald-400" style="width: 90%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">Authentication (JWT, Crypto)</span><span class="text-emerald-400 font-bold">85%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-3 h-full bg-gradient-to-r from-blue-500 to-emerald-500" style="width: 85%;"></div></div>
              </div>
            </div>
          </div>

          <!-- Database & Tools -->
          <div class="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-3xl p-8 hover:border-blue-500/40 transition-colors group">
            <h4 class="text-white font-bold mb-6 flex items-center gap-2"><i class="fas fa-database text-blue-400"></i> Database & Architecture</h4>
            <div class="space-y-5">
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">MongoDB / Mongoose</span><span class="text-blue-400 font-bold">88%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-1 h-full bg-gradient-to-r from-green-600 to-green-400" style="width: 88%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">MongoDB Atlas (Cloud)</span><span class="text-blue-400 font-bold">85%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-2 h-full bg-gradient-to-r from-blue-600 to-cyan-400" style="width: 85%;"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1.5"><span class="text-slate-300 font-medium">Git / Version Control</span><span class="text-blue-400 font-bold">90%</span></div>
                <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div class="dev-skill-fill delay-3 h-full bg-gradient-to-r from-orange-600 to-red-500" style="width: 90%;"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Contact CTA Card ═══ -->
      <div class="text-center dev-card pb-12">
        <div class="bg-gradient-to-b from-[#0f172a] to-[#060b18] rounded-[3rem] p-12 lg:p-16 border border-white/[0.08] border-t-[#C8A24A]/30 relative overflow-hidden shadow-2xl">
          <div class="absolute inset-0 bg-[#C8A24A]/5"></div>
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#C8A24A] to-transparent opacity-50"></div>
          
          <div class="relative z-10 max-w-2xl mx-auto">
            <h3 class="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4">Ready for your next big project?</h3>
            <p class="text-slate-400 text-base lg:text-lg mb-10">Whether you need a complex web application, a premium landing page, or a complete digital transformation, I'm here to bring your vision to reality.</p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-5">
              <a href="mailto:abhisingh11644@gmail.com" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-black text-sm px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)]">
                <i class="fas fa-paper-plane text-[#C8A24A]"></i> Get In Touch
              </a>
              <a href="https://wa.me/917631821416" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25d366] text-white font-black text-sm px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_10px_30px_-10px_rgba(37,211,102,0.4)]">
                <i class="fab fa-whatsapp text-xl"></i> Drop a MSG
              </a>
            </div>
          </div>
        </div>

        <!-- Signature -->
        <p class="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-12 mb-4">
          Coded with <span class="text-red-500 animate-pulse inline-block">&hearts;</span> by Abhishek
        </p>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeDeveloperPage();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
};

window.closeDeveloperPage = () => {
  const overlay = document.getElementById("developer-overlay");
  if (overlay) {
    overlay.style.animation = "viewFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = "";
    }, 400); // match animation duration
  }
};
