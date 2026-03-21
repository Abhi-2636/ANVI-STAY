import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

profile_idx = code.find('        <!-- Tenant Profile Card -->')
mini_stats_idx = code.find('        <!-- #9: Mini Stats Overview Cards -->')
payment_idx = code.find('        <!-- Payment Status Cards -->')
end_dash_idx = code.find('      `;\n    const maintenancePage = byId("tenant-maintenance-page");')

if -1 in [profile_idx, mini_stats_idx, payment_idx, end_dash_idx]:
    print("Could not find one of the key indexes:")
    print("profile_idx:", profile_idx)
    print("mini_stats_idx:", mini_stats_idx)
    print("payment_idx:", payment_idx)
    print("end_dash_idx:", end_dash_idx)
    exit(1)

# Extract sections
profile_str = code[profile_idx:mini_stats_idx].strip()
payment_str = code[payment_idx:end_dash_idx].strip()

# Create the new dashboard string
# Keep everything before Profile Card
dash_before_profile = code[:profile_idx]

# New home dashboard UI to insert
new_dashboard_additions = """
        <!-- NEW OUTSTANDING DUES SUPER HERO BANNER -->
        <div class="bg-gradient-to-br from-slate-900 to-black rounded-[2rem] p-8 sm:p-10 mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 group">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          
          <div class="relative z-10 w-full sm:w-auto text-center sm:text-left">
            <p class="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center justify-center sm:justify-start gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Status</p>
            ${(!t.rentPaid || !t.elecPaid) 
              ? `<h2 class="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">₹${Number((!t.rentPaid ? Number(t.rentAmount || 0) : 0) + (!t.elecPaid ? totalElec : 0)).toLocaleString("en-IN")} <span class="text-rose-400 text-lg">Due</span></h2>
                 <p class="text-sm font-bold text-slate-400">Total Outstanding Amount</p>`
              : `<h2 class="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-1">All Clear! 🎉</h2>
                 <p class="text-sm font-bold text-slate-400">You have zero outstanding dues.</p>`
            }
          </div>
          
          <div class="relative z-10 w-full sm:w-auto">
            <button onclick="switchTenantTab('pay')" class="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
              <i class="fas fa-wallet text-emerald-500"></i> ${(!t.rentPaid || !t.elecPaid) ? "Pay Now" : "View Receipts"}
            </button>
          </div>
        </div>

        <!-- Emergency Contacts -->
        <div class="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-[50px]"></div>
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3"><i class="fas fa-phone-alt mr-1"></i> Quick Connect</p>
            <p class="text-sm text-slate-300 mb-4">You can reach the admin directly for any serious situations.</p>
            <a href="https://wa.me/919142272776?text=${encodeURIComponent('Hi Administrator,')}" target="_blank" 
              class="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              <i class="fab fa-whatsapp text-lg"></i> Send WhatsApp Message
            </a>
          </div>
        </div>
"""

# Now assemble to replacing the giant dash innerHTML
new_code = dash_before_profile + new_dashboard_additions + code[end_dash_idx:]

# The injection for Pay and Profile pages inside fetchTenantDashboard (right after dash.innerHTML assignment)
# We will inject it directly after `      `;\n`
insertion_string = '      `;\n'
injection_point = new_code.find(insertion_string, profile_idx)
if injection_point == -1:
    print("Could not find insertion point!")
    exit(1)

page_injections = f'''
    const payPage = byId("tenant-pay-page");
    if (payPage) {{
      payPage.innerHTML = `
        <div class="flex items-center gap-3 mb-6 sm:mb-8 fade-in">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
            <i class="fas fa-wallet text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payments</h2>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Manage your rent and view invoices</p>
          </div>
        </div>
        {payment_str}
      `;
    }}

    const profilePage = byId("tenant-profile-page");
    if (profilePage) {{
      profilePage.innerHTML = `
        <div class="flex items-center gap-3 mb-6 sm:mb-8 fade-in">
          <div class="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
            <i class="fas fa-user-circle text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Profile</h2>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Your official registered details</p>
          </div>
        </div>
        {profile_str}
        <div class="mt-8 w-full flex justify-center">
            <button onclick="tenantLogout()" class="px-6 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-100/50 text-rose-600 rounded-2xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm">
              <i class="fas fa-power-off text-sm"></i> Securely Log Out
            </button>
        </div>
      `;
    }}
'''

final_code = new_code[:injection_point + len(insertion_string)] + page_injections + new_code[injection_point + len(insertion_string):]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(final_code)

print("Successfully rewrote js/app.js")
