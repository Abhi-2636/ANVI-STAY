import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ---- Minimal, safe Firebase bootstrap ----
let app, auth, db;
let firebaseReady = false;

try {
  const firebaseConfig = JSON.parse(
    typeof __firebase_config !== "undefined" ? __firebase_config : "{}",
  );
  if (firebaseConfig && Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseReady = true;
  } else {
    console.warn(
      "[Anvi Stay] Firebase config not provided. Running in demo mode.",
    );
  }
} catch (e) {
  console.error("[Anvi Stay] Firebase initialization failed:", e);
}

const appId =
  typeof __app_id !== "undefined" ? __app_id : "anvi-stay-final-v22";

// ---- Data ----
const buildings = [
  {
    id: "sp1",
    name: "SP Bhargav 1",
    rooms: 30,
    rent: "12000",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800",
    type: "Fully Furnished",
    desc: "Our flagship property with 30 spacious rooms across 4 floors. Modern interiors, ample natural light, and a vibrant student community just minutes from LPU campus.",
    facilities: [
      "Double Bed",
      "Study Table & Chair",
      "Wardrobe",
      "Attached Bathroom",
      "Geyser",
      "Mirror",
      "Curtains",
      "Power Backup",
    ],
    amenities: [
      "24/7 Water Supply",
      "High-Speed Wi-Fi",
      "CCTV Security",
      "Parking",
      "Common Kitchen",
      "Laundry Area",
      "RO Drinking Water",
      "Daily Housekeeping",
    ],
    rules: [
      "No smoking inside rooms",
      "Gate closes at 10:30 PM",
      "Visitors allowed till 8 PM",
      "Keep noise levels low after 10 PM",
    ],
  },
  {
    id: "sp2",
    name: "SP Bhargav 2",
    rooms: 5,
    rent: "11500",
    image:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800",
    type: "Fully Furnished",
    desc: "A cozy 5-room property offering premium rooms with modern amenities and a quiet study environment.",
    facilities: [
      "Double Bed",
      "Study Table & Chair",
      "Wardrobe",
      "Attached Bathroom",
      "Geyser",
      "Power Backup",
    ],
    amenities: [
      "24/7 Water Supply",
      "Wi-Fi",
      "CCTV Security",
      "Parking",
      "RO Drinking Water",
    ],
    rules: [
      "No smoking inside rooms",
      "Gate closes at 10:30 PM",
      "Visitors allowed till 8 PM",
    ],
  },
  {
    id: "sp3",
    name: "SP Bhargav 3",
    rooms: 5,
    rent: "11500",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800",
    type: "Fully Furnished",
    desc: "Compact and well-maintained 5-room property. Ideal for students who prefer a quieter living space with all essential comforts.",
    facilities: [
      "Double Bed",
      "Study Table & Chair",
      "Wardrobe",
      "Attached Bathroom",
      "Geyser",
      "Power Backup",
    ],
    amenities: [
      "24/7 Water Supply",
      "Wi-Fi",
      "CCTV Security",
      "Parking",
      "RO Drinking Water",
    ],
    rules: [
      "No smoking inside rooms",
      "Gate closes at 10:30 PM",
      "Visitors allowed till 8 PM",
    ],
  },
  {
    id: "ambey1",
    name: "Ambey Apartment 1",
    rooms: 11,
    rent: "9000",
    image:
      "https://images.unsplash.com/photo-1630694093867-4b947d812bf0?q=80&w=800",
    type: "Semi-Furnished",
    desc: "Affordable and spacious 11-room apartment with comfortable rooms. Great for budget-conscious students who want value for money.",
    facilities: [
      "Bed",
      "Table & Chair",
      "Cupboard",
      "Common Bathroom",
      "Fan",
      "Power Backup",
    ],
    amenities: [
      "Water Supply",
      "Wi-Fi",
      "CCTV",
      "Parking",
      "RO Water",
      "Common Kitchen",
    ],
    rules: [
      "No smoking",
      "Gate closes at 10 PM",
      "Visitors allowed till 7 PM",
      "Keep common areas clean",
    ],
  },
  {
    id: "ambey2",
    name: "Ambey Apartment 2",
    rooms: 7,
    rent: "9500",
    image:
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800",
    type: "Semi-Furnished",
    desc: "A 7-room apartment with well-ventilated rooms, all basic facilities, and a friendly atmosphere.",
    facilities: [
      "Bed",
      "Table & Chair",
      "Cupboard",
      "Common Bathroom",
      "Fan",
      "Power Backup",
    ],
    amenities: ["Water Supply", "Wi-Fi", "CCTV", "Parking", "RO Water"],
    rules: ["No smoking", "Gate closes at 10 PM", "Visitors allowed till 7 PM"],
  },
  {
    id: "skg",
    name: "SKG Apartment",
    rooms: 7,
    rent: "8500",
    image:
      "https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?q=80&w=800",
    type: "Semi-Furnished",
    desc: "Budget-friendly 7-room apartment near the market area. Easy access to shops, eateries, and the university shuttle route.",
    facilities: [
      "Bed",
      "Table",
      "Cupboard",
      "Common Bathroom",
      "Fan",
      "Power Backup",
    ],
    amenities: ["Water Supply", "Wi-Fi", "CCTV", "Parking", "RO Water"],
    rules: ["No smoking", "Gate closes at 10 PM", "Visitors allowed till 7 PM"],
  },
  {
    id: "ns",
    name: "NS Pariyal",
    rooms: 6,
    rent: "7500",
    image:
      "https://images.unsplash.com/photo-1536376074432-8d2a3ff44531?q=80&w=800",
    type: "Semi-Furnished",
    desc: "Our most affordable option with 6 rooms. Basic but comfortable accommodation for students on a tight budget.",
    facilities: ["Bed", "Table", "Fan", "Common Bathroom", "Power Backup"],
    amenities: ["Water Supply", "Wi-Fi", "RO Water", "Parking"],
    rules: ["No smoking", "Gate closes at 10 PM", "Keep premises clean"],
  },
  {
    id: "comfort",
    name: "Comfort Corner",
    rooms: 11,
    rent: "10000",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800",
    type: "Fully Furnished",
    desc: "True to its name, Comfort Corner offers 11 well-designed rooms with premium furnishing and a homely feel. Popular among senior students.",
    facilities: [
      "Bed",
      "Study Table & Chair",
      "Wardrobe",
      "Attached Bathroom",
      "Geyser",
      "Mirror",
      "Power Backup",
    ],
    amenities: [
      "24/7 Water Supply",
      "High-Speed Wi-Fi",
      "CCTV Security",
      "Parking",
      "RO Drinking Water",
      "Laundry Area",
    ],
    rules: [
      "No smoking inside rooms",
      "Gate closes at 10:30 PM",
      "Visitors allowed till 8 PM",
    ],
  },
  {
    id: "blessing",
    name: "Blessing PG",
    rooms: 6,
    rent: "7000",
    image:
      "https://images.unsplash.com/photo-1512918766671-ed6a9980a659?q=80&w=800",
    type: "Semi-Furnished",
    desc: "A homely PG with 6 rooms offering meals and a family-like atmosphere. Ideal for first-year students new to the city.",
    facilities: ["Bed", "Table", "Fan", "Common Bathroom", "Power Backup"],
    amenities: [
      "Water Supply",
      "Wi-Fi",
      "Home-cooked Meals",
      "RO Water",
      "Laundry",
    ],
    rules: [
      "No smoking",
      "Gate closes at 9:30 PM",
      "Meal timings to be followed",
    ],
  },
];

let state = {
  user: null,
  view: "landing",
  activeBuilding: buildings[0].id,
  tenants: {},
  activeLFilter: "all",
  selectedRoom: null,
  rentPaidLocal: false,
  elecPaidLocal: false,
  globalNotice: "",
  // Notification state
  adminNotifs: [], // array of notification objects
  adminNotifSeen: new Set(), // ids of seen notifs
  tenantNotifs: [], // tenant-side notifications
  tenantNotifSeen: new Set(),
  prevOpenComplaints: 0, // for detecting new complaints
  prevNoticeCount: 0, // for detecting new notices
  notifPollingId: null, // interval id
};

// Master amenities list (admin can toggle per room)
const MASTER_AMENITIES = [
  { icon: "fa-bed", name: "Bed" },
  { icon: "fa-chair", name: "Study Table & Chair" },
  { icon: "fa-door-closed", name: "Wardrobe" },
  { icon: "fa-bath", name: "Attached Bathroom" },
  { icon: "fa-fire-flame-simple", name: "Geyser" },
  { icon: "fa-fan", name: "Fan / AC" },
  { icon: "fa-bolt", name: "Power Backup" },
  { icon: "fa-wifi", name: "Wi-Fi" },
  { icon: "fa-video", name: "CCTV Security" },
  { icon: "fa-car", name: "Parking" },
  { icon: "fa-glass-water-droplet", name: "RO Drinking Water" },
  { icon: "fa-droplet", name: "24/7 Water Supply" },
  { icon: "fa-broom", name: "Housekeeping" },
  { icon: "fa-utensils", name: "Kitchen Access" },
  { icon: "fa-shirt", name: "Laundry Area" },
  { icon: "fa-image", name: "Mirror" },
  { icon: "fa-window-maximize", name: "Curtains" },
  { icon: "fa-bowl-food", name: "Meals Included" },
];

// ---- Utilities ----
const safeSet = (id, prop, val) => {
  const el = document.getElementById(id);
  if (el) el[prop] = val;
};
const safeGet = (id) => {
  const el = document.getElementById(id);
  return el ? el.value : "";
};
const num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};
const byId = (id) => document.getElementById(id);

function toast(msg, timeout = 3000) {
  const t = byId("toast");
  const inner = byId("toast-inner");
  if (!t || !inner) return;
  inner.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), timeout);
}

function toggleMobileMenu(btn) {
  const panel = byId("mobile-menu");
  const icon = byId("menu-icon");
  const isOpen = panel.classList.contains("open");
  if (isOpen) {
    panel.classList.remove("open");
    if (icon) {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  } else {
    panel.classList.add("open");
    if (icon) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark");
    }
  }
  if (btn) btn.setAttribute("aria-expanded", String(!isOpen));
}
window.toggleMobileMenu = toggleMobileMenu;

window.closeMobileMenu = () => {
  const panel = byId("mobile-menu");
  const btn = byId("mobile-menu-btn");
  const icon = byId("menu-icon");
  if (panel) panel.classList.remove("open");
  if (icon) {
    icon.classList.remove("fa-xmark");
    icon.classList.add("fa-bars");
  }
  if (btn) btn.setAttribute("aria-expanded", "false");
};

// Scroll shadow on header
let lastScrollY = 0;
window.addEventListener(
  "scroll",
  () => {
    const header = byId("main-header");
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    // Scroll-to-top button visibility
    const scrollBtn = byId("scroll-to-top-btn");
    if (scrollBtn) {
      if (window.scrollY > 400) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    }
    lastScrollY = window.scrollY;
  },
  { passive: true },
);

// ---- Smooth view switch helper ----
function animateView(targetId) {
  const el = byId(targetId);
  if (!el) return;
  el.classList.add("fade-in");
  // Remove after animation completes
  setTimeout(() => el.classList.remove("fade-in"), 380);
}

// ---- Bootstrap ----
async function run() {
  if (firebaseReady) {
    try {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
      onAuthStateChanged(auth, (u) => {
        if (u) {
          state.user = u;
          startLiveSync();
        }
      });
    } catch (e) {
      console.warn("[Anvi Stay] Auth failed; continuing without live sync.", e);
    }
  } else {
    console.warn("[Anvi Stay] Skipping live sync (demo mode).");
  }

  await initProperties();
  renderLandingUI();
  renderTestimonials();
  initStatsCounter();
  initDarkMode();
  initListeners();

  // Initialize from URL hash OR restore admin session
  const savedToken = localStorage.getItem("anvi_admin_token");
  const hash = window.location.hash.replace("#", "");
  if (savedToken && (hash === "landlord" || !hash || hash === "landing")) {
    // Restore admin session from localStorage
    adminToken = savedToken;
    switchView("landlord");
  } else if (
    hash &&
    hash !== "landing" &&
    ["tenant", "admin-login", "landlord"].includes(hash)
  ) {
    if (hash === "landlord" && !savedToken) {
      switchView("admin-login");
    } else {
      switchView(hash);
    }
  } else {
    history.replaceState({ view: "landing" }, "", "#landing");
    updateNavState();
  }
}

// ---- Live Sync ----
function startLiveSync() {
  if (!firebaseReady || !db) return;
  onSnapshot(
    doc(db, "artifacts", appId, "public", "data", "config", "broadcast"),
    (snap) => {
      if (snap.exists()) {
        state.globalNotice = snap.data().text || "";
        safeSet("global-notice-input", "value", state.globalNotice);
      }
    },
  );

  onSnapshot(
    collection(db, "artifacts", appId, "public", "data", "tenants"),
    (snap) => {
      state.tenants = {};
      snap.forEach((d) => {
        state.tenants[d.id] = d.data();
      });
      if (state.view === "landlord") renderLandlordGrid();
      updateLandlordStats();
    },
  );
}

// ---- Navigation / Views with History API ----
const viewHistory = ["landing"];
const viewNames = {
  landing: "Home",
  tenant: "Resident Login",
  "admin-login": "Owner Access",
  landlord: "Command Panel",
};

window.switchView = (v, fromPopstate = false) => {
  state.view = v;
  document
    .querySelectorAll(".view-section")
    .forEach((s) => s.classList.remove("active"));
  const target = byId(`view-${v}`);
  if (target) {
    target.classList.add("active");
    animateView(`view-${v}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (v === "landlord") {
    loadRoomsFromAPI();
    loadAdminNotices();
    renderLTabs();
    renderLandlordGrid();
    startNotifPolling();
    updateAdminTopbarDate();
  }
  if (v !== "landlord") stopNotifPolling();
  if (v === "tenant") populateTenantSelectors();

  // History API
  if (!fromPopstate) {
    if (viewHistory[viewHistory.length - 1] !== v) viewHistory.push(v);
    history.pushState({ view: v }, "", `#${v}`);
  }
  updateNavState();
};

window.goBack = () => {
  // Clear admin session on logout
  adminToken = null;
  localStorage.removeItem("anvi_admin_token");
  localStorage.removeItem("anvi_admin_name");
  state.tenants = {};
  stopNotifPolling();
  if (viewHistory.length > 1) {
    viewHistory.pop();
    const prev = viewHistory[viewHistory.length - 1];
    switchView(prev, true);
    history.pushState({ view: prev }, "", `#${prev}`);
  } else {
    switchView("landing", true);
    history.pushState({ view: "landing" }, "", "#landing");
  }
  toast("Logged out successfully.");
};

function updateNavState() {
  const v = state.view;
  const isLanding = v === "landing";
  const isAdminView = v === "admin-login" || v === "landlord";

  // Desktop nav links - show on landing, hide on inner views
  const desktopLinks = byId("nav-desktop-links");
  if (desktopLinks) {
    if (isLanding) {
      desktopLinks.classList.remove("md:hidden");
      desktopLinks.classList.add("md:flex");
    } else {
      desktopLinks.classList.add("md:hidden");
      desktopLinks.classList.remove("md:flex");
    }
  }

  // Hide main header on admin views
  const header = byId("main-header");
  if (header) {
    if (isAdminView) {
      header.style.display = "none";
    } else {
      header.style.display = "";
    }
  }

  // Active nav link
  setActiveNavLink(v);
  // Close mobile menu
  closeMobileMenu();
}

window.navigateTo = (v) => {
  switchView(v);
  setActiveNavLink(v);
};

function setActiveNavLink(v) {
  document
    .querySelectorAll("[data-nav]")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll("[data-nav-m]")
    .forEach((el) => el.classList.remove("text-[#C8A24A]"));
  if (v === "tenant") {
    document.querySelector('[data-nav="portal"]')?.classList.add("active");
    document
      .querySelector('[data-nav-m="tenant"]')
      ?.classList.add("text-[#C8A24A]");
  }
  if (v === "admin-login" || v === "landlord") {
    document.querySelector('[data-nav="portal"]')?.classList.add("active");
    document
      .querySelector('[data-nav-m="admin"]')
      ?.classList.add("text-[#C8A24A]");
  }
}

// Browser back/forward button support
window.addEventListener("popstate", (e) => {
  const v = e.state?.view || "landing";
  switchView(v, true);
});

// ---- Facility icon mapping ----
const facilityIcons = {
  "Double Bed": "fa-bed",
  Bed: "fa-bed",
  "Study Table & Chair": "fa-chair",
  "Table & Chair": "fa-chair",
  Table: "fa-table",
  Wardrobe: "fa-shirt",
  Cupboard: "fa-box-archive",
  "Attached Bathroom": "fa-shower",
  "Common Bathroom": "fa-bath",
  Geyser: "fa-temperature-arrow-up",
  Mirror: "fa-mirror",
  Curtains: "fa-scroll",
  Fan: "fa-fan",
  "Power Backup": "fa-bolt",
  "24/7 Water Supply": "fa-droplet",
  "Water Supply": "fa-droplet",
  "High-Speed Wi-Fi": "fa-wifi",
  "Wi-Fi": "fa-wifi",
  "CCTV Security": "fa-video",
  CCTV: "fa-video",
  Parking: "fa-car",
  "Common Kitchen": "fa-utensils",
  "Laundry Area": "fa-shirt",
  Laundry: "fa-shirt",
  "RO Drinking Water": "fa-glass-water",
  "RO Water": "fa-glass-water",
  "Daily Housekeeping": "fa-broom",
  "Home-cooked Meals": "fa-utensils",
};

function getFacilityIcon(name) {
  return facilityIcons[name] || "fa-check";
}

// ---- Property Detail Modal ----
window.openPropertyModal = (buildingId) => {
  const p = buildings.find((b) => b.id === buildingId);
  if (!p) return;

  safeSet("pm-image", "src", p.image);
  byId("pm-image")?.setAttribute("alt", p.name);
  safeSet("pm-name", "textContent", p.name);
  safeSet("pm-rooms-badge", "textContent", `${p.rooms} Rooms`);
  safeSet(
    "pm-rent",
    "innerHTML",
    `₹${(+p.rent).toLocaleString("en-IN")}<span class="text-sm font-bold text-slate-400 ml-1">/mo</span>`,
  );
  safeSet("pm-type", "textContent", p.type || "Furnished");
  safeSet(
    "pm-desc",
    "textContent",
    p.desc || "Comfortable student accommodation near LPU.",
  );

  // Facilities
  const facContainer = byId("pm-facilities");
  if (facContainer) {
    facContainer.innerHTML = (p.facilities || [])
      .map(
        (f) =>
          `<span class="facility-tag"><i class="fas ${getFacilityIcon(f)}"></i>${f}</span>`,
      )
      .join("");
  }

  // Amenities
  const amenContainer = byId("pm-amenities");
  if (amenContainer) {
    amenContainer.innerHTML = (p.amenities || [])
      .map(
        (a) =>
          `<span class="facility-tag"><i class="fas ${getFacilityIcon(a)}"></i>${a}</span>`,
      )
      .join("");
  }

  // Rules
  const rulesContainer = byId("pm-rules");
  if (rulesContainer) {
    rulesContainer.innerHTML = (p.rules || [])
      .map(
        (r) =>
          `<div class="flex items-start gap-2 text-sm text-slate-600"><i class="fas fa-circle-info text-[#C8A24A] mt-0.5 text-xs"></i><span>${r}</span></div>`,
      )
      .join("");
  }

  // WhatsApp link
  const waLink = byId("pm-whatsapp");
  if (waLink)
    waLink.href = `https://wa.me/919142272776?text=${encodeURIComponent("Hello ANVI STAY Team!\n\nI am interested in booking a room.\n\n🏠 PG Name: " + p.name + "\n🛏️ Room Type: " + (p.type || "N/A") + "\n💰 Rent: ₹" + (+p.rent).toLocaleString("en-IN") + "/month\n\nPlease share the following details:\n• Room availability & move-in dates\n• Security deposit amount\n• Any current offers or discounts\n• Photos of available rooms\n\nThank you!")}`;

  // Show modal
  const modal = byId("property-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() =>
      byId("property-modal-content")?.classList.add("pm-open"),
    );
  }
};

window.closePropertyModal = () => {
  const modal = byId("property-modal");
  const panel = byId("property-modal-content");
  if (panel) panel.classList.remove("pm-open");
  document.body.style.overflow = "";
  if (modal) {
    modal.style.transition = "opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.style.opacity = "";
      modal.style.transition = "";
    }, 280);
  }
};

// Close on backdrop click
byId("property-modal")?.addEventListener("click", (e) => {
  if (e.target === byId("property-modal")) closePropertyModal();
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    !byId("property-modal")?.classList.contains("hidden")
  ) {
    closePropertyModal();
  }
});

// ---- Landing ----
// Real-time availability data store
let liveAvailability = {};

async function fetchAvailability() {
  try {
    const res = await fetch(`${API_BASE}/rooms/availability`);
    const data = await res.json();
    if (data.success && data.data) {
      liveAvailability = data.data;
      renderLandingUI(); // Re-render cards with fresh data
    }
  } catch (e) {
    console.warn("[Availability] Could not fetch live data, using defaults.");
  }
}

function renderLandingUI() {
  const container = byId("landing-property-list");
  if (!container) return;

  container.innerHTML = buildings
    .map((p, idx) => {
      // Get real-time availability for this building
      const avail = liveAvailability[p.id] || null;
      const totalRooms = avail ? avail.total : p.rooms;
      const vacantRooms = avail ? avail.vacant : p.rooms;
      const bookedRooms = avail ? avail.booked : 0;
      const occupiedRooms = avail ? avail.occupied : 0;
      const availableRooms = avail ? avail.available : p.rooms;
      const occupancyPct = avail ? avail.occupancyPct : 0;
      const isFull = availableRooms === 0 && avail;
      const isLive = !!avail;

      // Availability badge
      let availBadge;
      if (isFull) {
        availBadge = `<span class="bg-red-500/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg" style="backdrop-filter:blur(6px)">
            <i class="fas fa-ban text-[6px] mr-1"></i> Full
          </span>`;
      } else if (isLive && vacantRooms > 0) {
        availBadge = `<span class="bg-emerald-500/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg" style="backdrop-filter:blur(6px)">
            <i class="fas fa-circle text-[5px] mr-1 animate-pulse"></i> ${vacantRooms} Vacant
          </span>`;
      } else if (isLive && bookedRooms > 0) {
        availBadge = `<span class="bg-amber-500/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg" style="backdrop-filter:blur(6px)">
            <i class="fas fa-clock text-[6px] mr-1"></i> ${bookedRooms} Booked
          </span>`;
      } else {
        availBadge = `<span class="bg-emerald-500/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg" style="backdrop-filter:blur(6px)">
            <i class="fas fa-circle text-[5px] mr-1 animate-pulse"></i> Available
          </span>`;
      }

      // Occupancy bar (only if live data)
      const occupancyBar = isLive
        ? `
          <div class="flex items-center gap-2 mb-3">
            <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700" style="width:${occupancyPct}%;background:${occupancyPct >= 90 ? "#ef4444" : occupancyPct >= 70 ? "#f59e0b" : "#10b981"}"></div>
            </div>
            <span class="text-[9px] font-black ${occupancyPct >= 90 ? "text-red-500" : occupancyPct >= 70 ? "text-amber-500" : "text-emerald-500"}">${occupancyPct}% filled</span>
          </div>`
        : "";

      // Room count badge with status
      const roomBadge = isLive
        ? `<span class="bg-[#1F3D2B]/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg" style="backdrop-filter:blur(6px)">
              <i class="fas fa-door-open mr-1 text-[#C8A24A]"></i> ${vacantRooms}/${totalRooms} Free
            </span>`
        : `<span class="bg-[#1F3D2B]/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-black shadow-lg" style="backdrop-filter:blur(6px)">
              <i class="fas fa-door-open mr-1 text-[#C8A24A]"></i> ${p.rooms} Rooms
            </span>`;

      return `
        <div class="property-card ${isFull ? "opacity-75" : ""}" onclick="openRoomDetail(${idx})">
          <div class="h-44 sm:h-60 relative overflow-hidden">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-110" loading="lazy" width="800" height="500">
            <div class="absolute inset-0" style="background:linear-gradient(180deg,transparent 40%,rgba(11,17,32,0.75) 100%)"></div>
            <div class="absolute top-4 left-4 flex gap-2">
              ${roomBadge}
            </div>
            <div class="absolute top-4 right-4 flex gap-2">
              <button onclick="openLightbox(${idx}, 0);event.stopPropagation()" class="bg-white/15 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs hover:bg-white/30 transition-colors shadow-lg" style="backdrop-filter:blur(6px)" title="View Gallery">
                <i class="fas fa-images"></i>
              </button>
              <button onclick="toggleCompare(${idx}, event)" class="bg-white/15 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs hover:bg-white/30 transition-colors shadow-lg" style="backdrop-filter:blur(6px)" title="Compare">
                <i class="fas fa-scale-balanced"></i>
              </button>
              ${availBadge}
            </div>
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white mb-1">${p.name}</h3>
              <div class="flex items-center text-white/70 text-[10px] font-bold uppercase tracking-widest">
                <i class="fas fa-location-dot mr-1.5 text-[#C8A24A]"></i> Law Gate, Phagwara
              </div>
            </div>
          </div>
          <div class="p-5 sm:p-6 flex flex-col flex-1">
            ${occupancyBar}
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-[9px] font-bold text-amber-700"><i class="fas fa-wifi text-[8px]"></i> Wi-Fi</span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-[9px] font-bold text-blue-700"><i class="fas fa-snowflake text-[8px]"></i> AC</span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-700"><i class="fas fa-shield-halved text-[8px]"></i> CCTV</span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-[9px] font-bold text-purple-700"><i class="fas fa-bolt text-[8px]"></i> Backup</span>
            </div>
            <div class="flex justify-between items-end border-t pt-4 mt-auto" style="border-color:rgba(200,162,74,0.12)">
              <div>
                <p class="text-[9px] uppercase font-black tracking-widest mb-0.5 text-slate-400">Starting from</p>
                <div class="flex items-baseline gap-1">
                  <p class="text-2xl sm:text-3xl font-black text-[#C8A24A] tracking-tighter leading-none">₹${(+p.rent).toLocaleString("en-IN")}</p>
                  <span class="text-[10px] font-bold text-slate-400">/mo</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                ${isFull
          ? `<span class="text-[9px] font-bold uppercase tracking-wider text-red-400">Fully Booked</span>`
          : `<span class="text-[9px] font-bold uppercase tracking-wider hidden sm:inline text-[#C8A24A]">Explore →</span>`
        }
                <a href="https://wa.me/919142272776?text=${encodeURIComponent("Hello ANVI STAY!\n\nI'm interested in:\n\n🏠 PG: " + p.name + "\n🛏️ Type: " + (p.type || "N/A") + "\n💰 Rent: ₹" + (+p.rent).toLocaleString("en-IN") + "/mo\n\nPlease share availability and details. Thank you!")}" target="_blank" rel="noopener noreferrer" class="text-white w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-colors shadow-lg gold-hover-btn" style="background:linear-gradient(135deg,#1F3D2B,#2a5438)" onclick="event.stopPropagation()" aria-label="WhatsApp enquiry">
                  <i class="fab fa-whatsapp text-lg"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Fetch availability on page load and auto-refresh every 60s
fetchAvailability();
setInterval(fetchAvailability, 60000);

// ---- Room Detail Modal ----
window.openRoomDetail = (idx) => {
  const p = buildings[idx];
  if (!p) return;
  const modal = byId("room-detail-modal");
  const content = byId("room-detail-content");
  if (!modal || !content) return;

  const amenities = [
    { icon: "fa-wifi", label: "Free Wi-Fi" },
    { icon: "fa-bed", label: "Furnished Rooms" },
    { icon: "fa-shower", label: "Attached Washroom" },
    { icon: "fa-bolt", label: "24/7 Power Backup" },
    { icon: "fa-broom", label: "Daily Housekeeping" },
    { icon: "fa-shield-halved", label: "CCTV Security" },
    { icon: "fa-droplet", label: "RO Water" },
    { icon: "fa-utensils", label: "Food Available" },
  ];

  content.innerHTML = `
        <div class="relative h-56 sm:h-80 overflow-hidden">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0" style="background:linear-gradient(180deg,transparent 30%,rgba(11,17,32,0.9) 100%)"></div>
          <button onclick="closeRoomDetail()" class="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center text-lg hover:bg-white/30 transition" style="backdrop-filter:blur(8px)">
            <i class="fas fa-xmark"></i>
          </button>
          <div class="absolute top-4 left-4 flex items-center gap-2">
            <span class="bg-emerald-500/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider" style="backdrop-filter:blur(6px)">
              <i class="fas fa-circle text-[5px] mr-1 animate-pulse"></i> Available
            </span>
            <span class="bg-white/15 text-white px-2.5 py-1 rounded-lg text-[9px] font-black" style="backdrop-filter:blur(6px)">
              ${p.type || "Fully Furnished"}
            </span>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <h3 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-1.5">${p.name}</h3>
            <div class="flex items-center text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <i class="fas fa-location-dot mr-2 text-[#C8A24A]"></i> Law Gate, Phagwara, Punjab
            </div>
          </div>
        </div>
        <div class="p-6 sm:p-8">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="text-center p-3 sm:p-4 rounded-2xl" style="background:linear-gradient(135deg,rgba(200,162,74,0.08),rgba(200,162,74,0.03))">
              <p class="text-2xl sm:text-3xl font-black tracking-tighter" style="color:#C8A24A">₹${(+p.rent).toLocaleString("en-IN")}</p>
              <p class="text-[9px] font-black uppercase tracking-widest mt-1 text-slate-400">Monthly Rent</p>
            </div>
            <div class="text-center p-3 sm:p-4 rounded-2xl" style="background:rgba(31,61,43,0.05)">
              <p class="text-2xl sm:text-3xl font-black tracking-tighter" style="color:#1F3D2B">${p.rooms}</p>
              <p class="text-[9px] font-black uppercase tracking-widest mt-1 text-slate-400">Total Rooms</p>
            </div>
          </div>

          <!-- About Property -->
          <div class="mb-5">
            <h4 class="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style="color:#1F3D2B">
              <span class="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center"><i class="fas fa-info-circle text-[8px] text-blue-500"></i></span>About This Property
            </h4>
            <p class="text-sm text-slate-500 leading-relaxed">Premium student accommodation located near LPU Law Gate, Phagwara. ${p.name} offers fully furnished rooms with modern amenities, 24/7 security surveillance, and a student-friendly environment. Ideal for university students seeking safe, comfortable, and affordable housing.</p>
          </div>

          <!-- Property Highlights -->
          <div class="mb-5">
            <h4 class="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style="color:#1F3D2B">
              <span class="w-5 h-5 bg-amber-50 rounded-md flex items-center justify-center"><i class="fas fa-sparkles text-[8px] text-[#C8A24A]"></i></span>Property Highlights
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <i class="fas fa-couch text-xs text-[#C8A24A]"></i>
                <span class="text-[10px] sm:text-xs font-bold text-slate-600">Fully Furnished</span>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <i class="fas fa-route text-xs text-blue-500"></i>
                <span class="text-[10px] sm:text-xs font-bold text-slate-600">2 Min from LPU</span>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <i class="fas fa-video text-xs text-emerald-500"></i>
                <span class="text-[10px] sm:text-xs font-bold text-slate-600">CCTV Monitored</span>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <i class="fas fa-bolt text-xs text-purple-500"></i>
                <span class="text-[10px] sm:text-xs font-bold text-slate-600">Power Backup</span>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <i class="fas fa-droplet text-xs text-cyan-500"></i>
                <span class="text-[10px] sm:text-xs font-bold text-slate-600">RO Drinking Water</span>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <i class="fas fa-wrench text-xs text-orange-500"></i>
                <span class="text-[10px] sm:text-xs font-bold text-slate-600">Quick Maintenance</span>
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <h4 class="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2" style="color:#1F3D2B">
            <span class="w-5 h-5 bg-amber-50 rounded-md flex items-center justify-center"><i class="fas fa-star text-[8px] text-[#C8A24A]"></i></span>Amenities Included
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            ${amenities
      .map(
        (a) => `
              <div class="flex items-center gap-2.5 p-2.5 rounded-xl border" style="border-color:rgba(200,162,74,0.1);background:rgba(200,162,74,0.03)">
                <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <i class="fas ${a.icon} text-[10px]" style="color:#C8A24A"></i>
                </div>
                <span class="text-[10px] sm:text-xs font-bold text-slate-700">${a.label}</span>
              </div>
            `,
      )
      .join("")}
          </div>

          <!-- Nearby Places -->
          <div class="mb-5">
            <h4 class="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style="color:#1F3D2B">
              <span class="w-5 h-5 bg-emerald-50 rounded-md flex items-center justify-center"><i class="fas fa-map-pin text-[8px] text-emerald-500"></i></span>Nearby Places
            </h4>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50">
                <i class="fas fa-graduation-cap text-xs text-emerald-600"></i>
                <div>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700">LPU Main Gate</p>
                  <p class="text-[9px] text-slate-400">2 min drive</p>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50">
                <i class="fas fa-cart-shopping text-xs text-blue-600"></i>
                <div>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700">UnityOne Mall</p>
                  <p class="text-[9px] text-slate-400">5 min drive</p>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50">
                <i class="fas fa-utensils text-xs text-amber-600"></i>
                <div>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700">Restaurants & Cafes</p>
                  <p class="text-[9px] text-slate-400">Walking distance</p>
                </div>
              </div>
              <div class="flex items-center gap-2 p-2.5 rounded-xl bg-red-50/50">
                <i class="fas fa-hospital text-xs text-red-600"></i>
                <div>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700">Medical Facilities</p>
                  <p class="text-[9px] text-slate-400">3 min drive</p>
                </div>
              </div>
            </div>
          </div>

          <!-- House Rules -->
          <div class="mb-6">
            <h4 class="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style="color:#1F3D2B">
              <span class="w-5 h-5 bg-red-50 rounded-md flex items-center justify-center"><i class="fas fa-clipboard-list text-[8px] text-red-500"></i></span>House Rules
            </h4>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                <i class="fas fa-clock text-[9px] text-slate-400 w-4 text-center"></i> Gate closes at 10:00 PM – 10:30 PM
              </div>
              <div class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                <i class="fas fa-ban-smoking text-[9px] text-slate-400 w-4 text-center"></i> No smoking inside premises
              </div>
              <div class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                <i class="fas fa-users text-[9px] text-slate-400 w-4 text-center"></i> Visitors allowed till 7-8 PM only
              </div>
              <div class="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                <i class="fas fa-file-contract text-[9px] text-slate-400 w-4 text-center"></i> 6-month minimum stay (lock-in period)
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <a href="https://wa.me/919142272776?text=${encodeURIComponent("Hello ANVI STAY Team!\n\nI would like to book a room.\n\n🏠 PG Name: " + p.name + "\n🛏️ Room Type: " + (p.type || "N/A") + "\n💰 Rent: ₹" + (+p.rent).toLocaleString("en-IN") + "/month\n📍 Total Rooms: " + p.rooms + "\n\nPlease share:\n• Available rooms & floor preference\n• Move-in process & documents required\n• Security deposit details\n\nThank you!")}" target="_blank" rel="noopener noreferrer"
              class="flex-1 text-center text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors shadow-lg hover:shadow-xl" style="background:linear-gradient(135deg,#C8A24A,#b8922f)">
              <i class="fab fa-whatsapp mr-2"></i>Book via WhatsApp
            </a>
            <button onclick="closeRoomDetail(); switchView('tenant')"
              class="flex-1 text-center px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors border-2 hover:shadow-md" style="color:#1F3D2B; border-color:#1F3D2B" onmouseover="this.style.backgroundColor='#1F3D2B';this.style.color='white'" onmouseout="this.style.backgroundColor='transparent';this.style.color='#1F3D2B'">
              <i class="fas fa-fingerprint mr-2"></i>Resident Login
            </button>
          </div>
        </div>
      `;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

window.closeRoomDetail = () => {
  const modal = byId("room-detail-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
};

// Close room-detail on backdrop click
byId("room-detail-modal")?.addEventListener("click", (e) => {
  if (e.target === byId("room-detail-modal")) closeRoomDetail();
});

// Close room-detail on Escape key
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    !byId("room-detail-modal")?.classList.contains("hidden")
  ) {
    closeRoomDetail();
  }
});

// ---- Backend API Base URL ----
const API_BASE = "http://localhost:5001/api";
let adminToken = localStorage.getItem("anvi_admin_token") || null; // JWT persisted in localStorage

// ---- Admin Auth / Broadcast ----
window.validateAdmin = async () => {
  const email = safeGet("admin-email-input").trim();
  const password = safeGet("admin-pass-input").trim();
  const errEl = byId("admin-login-error");

  if (!email || !password) {
    if (errEl) {
      errEl.textContent = "Please enter both email and password.";
      errEl.classList.remove("hidden");
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      localStorage.setItem("anvi_admin_token", adminToken);
      localStorage.setItem("anvi_admin_name", data.data.name || "Admin");
      if (errEl) errEl.classList.add("hidden");
      switchView("landlord");
      toast(`Welcome back, ${data.data.name}!`);
    } else {
      if (errEl) {
        errEl.textContent = data.message || "Authentication failed.";
        errEl.classList.remove("hidden");
      }
      toast("Security Error: Authentication Denied.", 4000);
    }
  } catch (err) {
    console.error("[Admin Login]", err);
    if (errEl) {
      errEl.textContent =
        "Server unreachable. Make sure the backend is running.";
      errEl.classList.remove("hidden");
    }
    toast("Connection error. Check backend server.", 4000);
  }
};

window.updateGlobalNotice = async () => {
  const text = safeGet("global-notice-input");
  if (!firebaseReady || !db) {
    toast("Live updates unavailable (demo mode).");
    return;
  }
  await setDoc(
    doc(db, "artifacts", appId, "public", "data", "config", "broadcast"),
    { text },
  );
  toast("Broadcast updated!");
};

// ---- Tenant Portal ----
function populateTenantSelectors() {
  const sel = byId("tenant-building-select");
  if (sel)
    sel.innerHTML = buildings
      .map((b) => `<option value="${b.id}">${b.name}</option>`)
      .join("");
}

window.toggleTenantPass = () => {
  const inp = byId("tenant-pass-input");
  const eye = byId("tenant-pass-eye");
  if (!inp || !eye) return;
  if (inp.type === "password") {
    inp.type = "text";
    eye.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    inp.type = "password";
    eye.classList.replace("fa-eye-slash", "fa-eye");
  }
};

// ---- Tenant Logout ----
window.tenantLogout = () => {
  const dash = byId("tenant-dash");
  const loginForm = byId("tenant-login-form");
  if (dash) {
    dash.classList.add("hidden");
    dash.innerHTML = "";
  }
  if (loginForm) loginForm.classList.remove("hidden");
  const bottomNav = byId("mobile-bottom-nav");
  if (bottomNav) bottomNav.classList.add("hidden");
  // Clear inputs
  safeSet("tenant-room-input", "value", "");
  safeSet("tenant-pass-input", "value", "");
  state.tenantLogin = null;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.submitTenantComplaint = async () => {
  const text = byId("tenant-complaint-input")?.value?.trim();
  if (!text) {
    toast("Please describe your issue.");
    return;
  }
  if (!state.tenantLogin) {
    toast("Session expired. Please login again.");
    return;
  }
  const { bid, rno, pass } = state.tenantLogin;
  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}/complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass, text }),
    });
    const result = await res.json();
    if (result.success) {
      toast("Complaint submitted!");
      // Refresh dashboard to show the new complaint
      fetchTenantDashboard();
    } else {
      toast(result.message || "Failed to submit complaint.", 4000);
    }
  } catch (err) {
    console.error("[submitComplaint]", err);
    toast("Server error.", 4000);
  }
};

function showTenantError(msg) {
  const el = byId("tenant-error");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 4000);
}

window.fetchTenantDashboard = async () => {
  // Use stored login credentials if available (e.g. after complaint refresh)
  const bid = state.tenantLogin?.bid || byId("tenant-building-select").value;
  const rno = state.tenantLogin?.rno || byId("tenant-room-input").value?.trim();
  const pass =
    state.tenantLogin?.pass || byId("tenant-pass-input").value?.trim();
  if (!rno || !pass) {
    showTenantError("Please enter both Room number and Password.");
    return;
  }

  const dash = byId("tenant-dash");
  const loginForm = byId("tenant-login-form");
  const bottomNav = byId("mobile-bottom-nav");

  // Show Skeleton First
  if (loginForm && !state.tenantLogin) {
    loginForm.classList.add("hidden");
    dash.classList.remove("hidden");
    if(bottomNav) bottomNav.classList.remove("hidden");
    dash.innerHTML = `
      <div class="space-y-6">
        <div class="h-40 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] w-full skeleton"></div>
        <div class="h-64 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] w-full skeleton"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] skeleton"></div>
          <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] skeleton"></div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  try {
    const res = await fetch(`${API_BASE}/rooms/tenant-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buildingId: bid,
        roomNo: Number(rno),
        password: pass,
      }),
    });
    const result = await res.json();

    if (!result.success) {
      if (loginForm) loginForm.classList.remove("hidden");
      dash.classList.add("hidden");
      if(bottomNav) bottomNav.classList.add("hidden");
      showTenantError(result.message || "Login failed.");
      return;
    }

    const t = result.data;
    // Also store in local state so other parts of the UI can reference it
    const key = `${bid}-${rno}`;
    state.tenants[key] = t;
    // Store credentials for complaint submission
    state.tenantLogin = { bid, rno, pass };

    const units = num(t.elecCurrent) - num(t.elecLast) + (num(t.invCurrent) - num(t.invLast));
    const totalElec = units * num(t.elecRate, 13);
    const totalMaint = num(t.maintCharge, 300);
    const bill = totalElec + totalMaint;
    const totalBill = bill;

    // Fetch active notices from API
    let noticesHtml = "";
    let fetchedNotices = [];
    try {
      const nRes = await fetch(`${API_BASE}/notices`);
      const nResult = await nRes.json();
      if (nResult.success && nResult.data.length) {
        fetchedNotices = nResult.data;
        noticesHtml = nResult.data
          .map(
            (n) => `
            <div class="bg-${n.priority === "urgent" ? "rose" : n.priority === "warning" ? "amber" : "blue"}-50 border border-${n.priority === "urgent" ? "rose" : n.priority === "warning" ? "amber" : "blue"}-200 p-4 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-4">
              <div class="w-10 h-10 bg-${n.priority === "urgent" ? "rose" : n.priority === "warning" ? "amber" : "blue"}-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas ${n.priority === "urgent" ? "fa-triangle-exclamation text-rose-600" : n.priority === "warning" ? "fa-bullhorn text-amber-600" : "fa-info-circle text-blue-600"}"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-${n.priority === "urgent" ? "rose" : n.priority === "warning" ? "amber" : "blue"}-500 mb-1">${n.priority === "urgent" ? "Urgent Notice" : n.priority === "warning" ? "Important Notice" : "Notice"}</p>
                <p class="text-sm sm:text-base font-bold text-${n.priority === "urgent" ? "rose" : n.priority === "warning" ? "amber" : "blue"}-800 leading-snug">${n.text}</p>
              </div>
            </div>
          `,
          )
          .join("");
        noticesHtml = `<div class="space-y-3 mb-6">${noticesHtml}</div>`;
      }
    } catch (e) {
      console.warn("[notices]", e);
    }

    const dash = byId("tenant-dash");
    // Count tenant notifications (active notices + resolved complaints)
    const resolvedComplaints = (t.complaints || []).filter(
      (c) => c.status === "resolved",
    );
    const tenantNotifCount = fetchedNotices.length + resolvedComplaints.length;

    const hour = new Date().getHours();
    const greeting = hour < 6 ? "Good Night" : hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : hour < 21 ? "Good Evening" : "Good Night";
    const greetIcon = hour < 6 ? "fa-moon" : hour < 12 ? "fa-mug-hot" : hour < 17 ? "fa-sun" : hour < 21 ? "fa-cloud-sun" : "fa-moon";
    const greetGradient = hour < 6 ? "from-indigo-900 via-purple-900 to-slate-900" : hour < 12 ? "from-amber-800 via-orange-900 to-slate-900" : hour < 17 ? "from-sky-800 via-emerald-900 to-slate-900" : hour < 21 ? "from-orange-900 via-rose-900 to-slate-900" : "from-indigo-900 via-purple-900 to-slate-900";

    // Payment streak calculation
    const rentPayments = (t.paymentHistory || []).filter(p => p.type === 'rent').sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    let streak = 0;
    for (const p of rentPayments) {
      const paidDay = new Date(p.paidAt).getDate();
      if (paidDay <= 5) streak++; else break;
    }

    // Days until due
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate();
    const dueProgress = Math.min(100, Math.round((today.getDate() / daysInMonth) * 100));
    const dueColor = dueProgress > 75 ? '#ef4444' : dueProgress > 50 ? '#f59e0b' : '#10b981';

    // DiceBear avatar URL
    const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(t.name || rno)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc&radius=50`;

    dash.innerHTML = `
        <!-- Tenant Notification Bell (floating top-right) -->
        <div class="flex justify-end mb-4">
          <div class="notif-bell" id="tenant-notif-bell" onclick="toggleTenantNotifPanel()">
            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 hover:bg-slate-50 transition">
              <i class="fas fa-bell text-slate-600 text-lg" id="tenant-bell-icon"></i>
            </div>
            <span class="notif-badge" id="tenant-notif-badge" data-count="${tenantNotifCount}">${tenantNotifCount || ""}</span>
            <!-- Tenant Dropdown -->
            <div class="notif-dropdown" id="tenant-notif-dropdown">
              <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p class="font-black text-sm text-slate-800">Notifications</p>
                <button onclick="event.stopPropagation(); clearTenantNotifs()" class="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">Clear</button>
              </div>
              <div class="notif-dropdown-list" id="tenant-notif-list"></div>
            </div>
          </div>
        </div>

        <!-- Animated Notice Marquee -->
        ${fetchedNotices.length > 0 ? `
        <div class="notice-marquee-container mb-6 rounded-2xl overflow-hidden border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 relative">
          <div class="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none"></div>
          <div class="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-orange-50 to-transparent z-10 pointer-events-none"></div>
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 z-20">
              <i class="fas fa-bullhorn text-amber-600 text-xs animate-pulse"></i>
            </div>
            <div class="marquee-track overflow-hidden flex-1">
              <div class="marquee-content">
                ${fetchedNotices.map(n => `<span class="inline-flex items-center gap-2 mr-12 text-sm font-bold ${n.priority === 'urgent' ? 'text-rose-700' : n.priority === 'warning' ? 'text-amber-700' : 'text-blue-700'}"><i class="fas ${n.priority === 'urgent' ? 'fa-circle-exclamation' : 'fa-circle-info'} text-xs"></i> ${n.text}</span>`).join('')}
                ${fetchedNotices.map(n => `<span class="inline-flex items-center gap-2 mr-12 text-sm font-bold ${n.priority === 'urgent' ? 'text-rose-700' : n.priority === 'warning' ? 'text-amber-700' : 'text-blue-700'}"><i class="fas ${n.priority === 'urgent' ? 'fa-circle-exclamation' : 'fa-circle-info'} text-xs"></i> ${n.text}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Rent Due Countdown -->
        ${!t.rentPaid ? renderCountdown("auto") : ""}

        <!-- Welcome Header Card (Dynamic Gradient by Time of Day) -->
        <div class="bg-gradient-to-r ${greetGradient} rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 text-white mb-6 sm:mb-10 relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.2)] tilt-card">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div class="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-60 h-60 bg-amber-400 rounded-full blur-[80px] opacity-10 translate-y-1/2 -translate-x-1/4"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-8">
              <div>
                <div class="flex items-center gap-2 mb-3 flex-wrap">
                  <span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-white/10">${buildings.find((b) => b.id === bid).name}</span>
                  <span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white/70 border border-white/10"><i class="fas ${greetIcon} mr-1"></i>${greeting}</span>
                  ${streak > 0 ? `<span class="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-orange-300 border border-orange-400/20">🔥 ${streak} Month Streak!</span>` : ''}
                </div>
                <h2 class="text-5xl sm:text-7xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Room ${rno}</h2>
              </div>
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden shadow-2xl relative border-2 border-white/20">
                <img src="${avatarUrl}" alt="avatar" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl items-center justify-center hidden">
                  <i class="fas fa-house-chimney-window text-3xl sm:text-4xl text-white drop-shadow-lg"></i>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 relative overflow-hidden group">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
                  <i class="fas fa-user text-sm text-white drop-shadow"></i>
                </div>
                <div class="relative z-10">
                  <p class="text-white/60 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    Resident 
                    ${(t.paymentHistory || []).filter(p => p.type==="rent").length >= 3 ? '<span class="px-1.5 py-0.5 rounded-sm bg-gradient-to-r from-[#C8A24A] to-amber-300 text-slate-900 text-[6px] shadow-[0_0_10px_rgba(200,162,74,0.5)] animate-pulse" title="Super Tenant"><i class="fas fa-crown"></i> SUPER</span>' : ''}
                  </p>
                  <p class="text-white font-bold text-sm sm:text-base">${t.name || "Not Set"}</p>
                </div>
                ${(t.paymentHistory || []).filter(p => p.type==="rent").length >= 3 ? '<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>' : ''}
              </div>
              ${!t.rentPaid ? `
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div class="relative z-10">
                  <p class="text-white/50 text-[8px] font-black uppercase tracking-widest">Due Countdown</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="w-24 sm:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-1000" style="width: ${dueProgress}%; background: ${dueColor}"></div>
                    </div>
                    <span class="text-[10px] font-black" style="color: ${dueColor}">${daysLeft}d left</span>
                  </div>
                </div>
              </div>
              ` : ''}
            </div>
          </div>
          <div class="absolute -right-8 -bottom-8 opacity-[0.06]">
            <i class="fas fa-house-user text-[14rem] sm:text-[18rem]"></i>
          </div>
        </div>

        <!-- Tenant Profile Card -->
        <div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-10 mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-40 h-40 bg-[#C8A24A]/10 rounded-full blur-[60px]"></div>
          
          <div class="flex items-center gap-4 mb-8 relative z-10">
            <div class="w-12 h-12 bg-gradient-to-br from-[#C8A24A] to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <i class="fas fa-id-badge text-white text-lg"></i>
            </div>
            <div>
              <p class="text-sm font-black uppercase tracking-widest text-slate-800">My Profile</p>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Your official registered details</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-6">
            <!-- Photo -->
            <div class="flex-shrink-0 flex justify-center sm:justify-start">
              <div class="w-28 h-36 rounded-xl overflow-hidden shadow-lg border-2 border-slate-100 bg-slate-50 flex items-center justify-center">
                ${t.photoUrl
        ? `<img src="${t.photoUrl}" class="w-full h-full object-cover" alt="Profile Photo">`
        : `<div class="text-center"><i class="fas fa-user-circle text-5xl text-slate-300"></i><p class="text-[8px] font-bold text-slate-300 mt-1 uppercase">No Photo</p></div>`
      }
              </div>
            </div>

            <!-- Details -->
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div class="flex items-center gap-2 mb-1.5">
                  <i class="fas fa-user text-[#C8A24A] text-[10px]"></i>
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Full Name</p>
                </div>
                <p class="text-base font-bold text-slate-800">${t.name || "Not Set"}</p>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div class="flex items-center gap-2 mb-1.5">
                  <i class="fas fa-phone text-emerald-500 text-[10px]"></i>
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Mobile No</p>
                </div>
                <p class="text-base font-bold text-slate-800">${t.phone || "N/A"}</p>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div class="flex items-center gap-2 mb-1.5">
                  <i class="fas fa-id-card text-blue-500 text-[10px]"></i>
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">College ID No</p>
                </div>
                <p class="text-base font-bold text-slate-800">${t.collegeIdNo || "N/A"}</p>
              </div>
              ${t.nationality === "Foreign"
        ? `
              <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div class="flex items-center gap-2 mb-1.5">
                  <i class="fas fa-globe text-amber-600 text-[10px]"></i>
                  <p class="text-[9px] font-black uppercase tracking-widest text-amber-600">Foreign Student</p>
                </div>
                <p class="text-[9px] font-bold text-slate-500 mb-0.5">Passport: <span class="text-slate-800 text-sm">${t.passportNo || "N/A"}</span></p>
                <p class="text-[9px] font-bold text-slate-500">Visa: <span class="text-slate-800 text-sm">${t.visaNo || "N/A"}</span></p>
              </div>
              `
        : `
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div class="flex items-center gap-2 mb-1.5">
                  <i class="fas fa-fingerprint text-purple-500 text-[10px]"></i>
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Aadhaar No</p>
                </div>
                <p class="text-base font-bold text-slate-800">${t.aadhaarNo ? t.aadhaarNo.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3") : "N/A"}</p>
              </div>
              `
      }
            </div>
          </div>

          ${t.secondTenant && t.secondTenant.name
        ? `
          <!-- 2nd Tenant -->
          <div class="mt-6 pt-6 border-t border-slate-100">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-plus text-indigo-500 text-[10px]"></i>
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest text-indigo-500">Roommate</p>
              ${t.secondTenant.nationality === "Foreign" ? '<span class="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">🌍 FOREIGN</span>' : ""}
            </div>
            <div class="flex flex-col sm:flex-row gap-5">
              <div class="flex-shrink-0 flex justify-center sm:justify-start">
                <div class="w-20 h-26 rounded-lg overflow-hidden shadow border border-indigo-100 bg-indigo-50/50 flex items-center justify-center">
                  ${t.secondTenant.photoUrl
          ? `<img src="${t.secondTenant.photoUrl}" class="w-full h-full object-cover" alt="2nd Tenant Photo">`
          : `<i class="fas fa-user-circle text-3xl text-indigo-200"></i>`
        }
                </div>
              </div>
              <div class="flex-1 grid grid-cols-2 gap-3">
                <div class="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <p class="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Name</p>
                  <p class="text-sm font-bold text-slate-800">${t.secondTenant.name || "N/A"}</p>
                </div>
                <div class="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <p class="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Mobile</p>
                  <p class="text-sm font-bold text-slate-800">${t.secondTenant.phone || "N/A"}</p>
                </div>
                <div class="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <p class="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">College ID</p>
                  <p class="text-sm font-bold text-slate-800">${t.secondTenant.collegeIdNo || "N/A"}</p>
                </div>
                ${t.secondTenant.nationality === "Foreign"
          ? `
                <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p class="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Passport / Visa</p>
                  <p class="text-[10px] font-bold text-slate-800">${t.secondTenant.passportNo || "N/A"} / ${t.secondTenant.visaNo || "N/A"}</p>
                </div>
                `
          : `
                <div class="bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <p class="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Aadhaar</p>
                  <p class="text-sm font-bold text-slate-800">${t.secondTenant.aadhaarNo ? t.secondTenant.aadhaarNo.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3") : "N/A"}</p>
                </div>
                `
        }
              </div>
            </div>
          </div>
          `
        : ""
      }
        </div>

        </div>

        <!-- Quick Actions Grid -->
        <div class="grid grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10 fade-in" style="animation-delay: 0.2s;">
          <button onclick="document.getElementById('tenant-payment-status').scrollIntoView({behavior: 'smooth', block: 'start'})" class="magnetic-btn bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-[1.5rem] p-3 sm:p-5 flex flex-col items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 group relative overflow-hidden">
             <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             <i class="fas fa-wallet text-xl sm:text-2xl mb-1 relative z-10 drop-shadow-sm group-hover:scale-110 transition-transform"></i>
             <span class="text-[9px] sm:text-xs font-black uppercase tracking-wider relative z-10">Pay Now</span>
          </button>
          
          <button onclick="const el = document.getElementById('tenant-payment-history'); if(el) el.scrollIntoView({behavior: 'smooth', block: 'start'}); else alert('No payment receipts found yet.');" class="magnetic-btn bg-white/80 backdrop-blur-xl hover:bg-white border border-white text-slate-700 rounded-[1.5rem] p-3 sm:p-5 flex flex-col items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 group relative overflow-hidden">
             <div class="absolute -right-6 -top-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl transition-all group-hover:bg-blue-500/10"></div>
             <i class="fas fa-file-invoice-dollar text-xl sm:text-2xl text-blue-500 mb-1 relative z-10 group-hover:scale-110 transition-transform"></i>
             <span class="text-[9px] sm:text-xs font-black uppercase tracking-wider relative z-10">Receipts</span>
          </button>
          
          <button onclick="window.requestRoomCleaning()" class="magnetic-btn bg-white/80 backdrop-blur-xl hover:bg-white border border-white text-slate-700 rounded-[1.5rem] p-3 sm:p-5 flex flex-col items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 group relative overflow-hidden">
             <div class="absolute -right-6 -top-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl transition-all group-hover:bg-emerald-500/10"></div>
             <i class="fas fa-broom text-xl sm:text-2xl text-emerald-500 mb-1 relative z-10 group-hover:scale-110 transition-transform hover:rotate-12"></i>
             <span class="text-[9px] sm:text-xs font-black uppercase tracking-wider relative z-10">Clean</span>
          </button>

          <button onclick="document.getElementById('tenant-complaint-section').scrollIntoView({behavior: 'smooth', block: 'center'}); setTimeout(() => document.getElementById('tenant-complaint-input').focus(), 600);" class="magnetic-btn bg-white/80 backdrop-blur-xl hover:bg-white border border-white text-slate-700 rounded-[1.5rem] p-3 sm:p-5 flex flex-col items-center justify-center gap-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 group relative overflow-hidden">
             <div class="absolute -right-6 -top-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl transition-all group-hover:bg-rose-500/10"></div>
             <i class="fas fa-screwdriver-wrench text-xl sm:text-2xl text-rose-500 mb-1 relative z-10 group-hover:scale-110 transition-transform"></i>
             <span class="text-[9px] sm:text-xs font-black uppercase tracking-wider relative z-10">Repair</span>
          </button>
        </div>

        <!-- #9: Mini Stats Overview Cards -->
        <div class="grid grid-cols-3 gap-3 mb-6 sm:mb-10 fade-in" style="animation-delay: 0.25s;">
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-12 h-12 bg-rose-500/10 rounded-full blur-[10px] group-hover:bg-rose-500/20 transition-all"></div>
            <p class="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Outstanding Dues</p>
            <p class="text-xl sm:text-2xl font-black ${!t.rentPaid || !t.elecPaid ? 'text-rose-500' : 'text-slate-800'} tracking-tight counter-animate" data-val="${Math.round((!t.rentPaid ? Number(t.rentAmount || 0) : 0) + (!t.elecPaid ? totalElec : 0))}">₹0</p>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-12 h-12 bg-amber-500/10 rounded-full blur-[10px] group-hover:bg-amber-500/20 transition-all"></div>
            <p class="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Complaints</p>
            <p class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight counter-animate" data-val="${(t.complaints || []).length}">0</p>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-4 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-[10px] group-hover:bg-indigo-500/20 transition-all"></div>
            <p class="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Days Lived</p>
            <p class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight counter-animate" data-val="${t.moveInDate ? Math.floor((new Date() - new Date(t.moveInDate)) / (1000 * 60 * 60 * 24)) : 0}">0</p>
          </div>
        </div>

        <!-- Payment Status Cards -->
        <div id="tenant-payment-status" class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10 fade-in" style="animation-delay: 0.35s;">

          <!-- Rent Card -->
          <div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border ${t.rentPaid ? "border-emerald-200" : "border-rose-200"} p-6 sm:p-10 relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-xl">
            <div class="absolute -right-10 -top-10 w-40 h-40 ${t.rentPaid ? "bg-emerald-500/10" : "bg-rose-500/10"} rounded-full blur-[40px] pointer-events-none"></div>
            
            <div class="flex items-start justify-between mb-6 relative z-10">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center ${t.rentPaid ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-emerald-200/50" : "bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 shadow-rose-200/50"} shadow-lg relative">
                <i class="fas ${t.rentPaid ? "fa-circle-check" : "fa-clock"} text-2xl relative z-10"></i>
                <svg class="absolute inset-0 w-14 h-14 progress-ring__circle" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="26" fill="transparent" stroke="${t.rentPaid ? '#10b981' : '#f43f5e'}" stroke-width="4" stroke-dasharray="163.3" stroke-dashoffset="${t.rentPaid ? '0' : '40'}"></circle>
                </svg>
              </div>
              <span class="${t.rentPaid ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"} text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">${t.rentPaid ? "PAID" : "DUE"}</span>
            </div>
            
            <div class="relative z-10">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><i class="fas fa-home"></i> Monthly Rent</p>
              <p class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">₹${Number(t.rentAmount || 0).toLocaleString("en-IN")}</p>
              ${!t.rentPaid
        ? (() => {
            const pendingRent = (t.pendingPayments || []).find(p => p.type === 'rent' && p.status === 'pending');
            return pendingRent
              ? `<div class="mt-6 pt-5 border-t border-amber-100">
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Verification Progress</p>
                  <div class="relative">
                    <div class="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 z-0"></div>
                    <div class="absolute top-3 left-3 w-1/2 h-0.5 bg-gradient-to-r from-emerald-400 to-amber-400 z-0"></div>
                    <div class="flex justify-between relative z-10">
                      <div class="flex flex-col items-center gap-1.5 w-1/3">
                        <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-white shadow-sm"><i class="fas fa-check text-[10px]"></i></div>
                        <p class="text-[8px] font-bold text-slate-500 uppercase">Submitted</p>
                      </div>
                      <div class="flex flex-col items-center gap-1.5 w-1/3">
                        <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center border-2 border-white shadow-sm animate-pulse"><i class="fas fa-eye text-[10px]"></i></div>
                        <p class="text-[8px] font-bold text-amber-600 uppercase">Reviewing</p>
                      </div>
                      <div class="flex flex-col items-center gap-1.5 w-1/3">
                        <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border-2 border-white shadow-sm"><i class="fas fa-shield-check text-[10px]"></i></div>
                        <p class="text-[8px] font-bold text-slate-400 uppercase">Verified</p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 bg-amber-50/50 rounded-lg p-3 w-fit">
                    <p class="text-[9px] text-amber-600 font-semibold"><i class="fas fa-hashtag"></i> UTR: <span class="font-mono text-amber-800">${pendingRent.utrNumber}</span></p>
                  </div>
                </div>`
              : `<div class="mt-6 pt-5 border-t border-rose-100">
                  <button onclick="openUpiPaymentModal('rent', ${Number(t.rentAmount || 0)})"
                    class="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_8px_16px_rgba(225,29,72,0.25)] hover:shadow-lg active:scale-[0.98] group">
                    <i class="fas fa-qrcode"></i> Pay Now via UPI <i class="fas fa-arrow-right transition-transform group-hover:translate-x-1 ml-1 text-xs"></i>
                  </button>
                </div>`;
          })()
        : `
              <div class="mt-6 pt-5 border-t border-emerald-100">
                <p class="text-emerald-600 text-xs font-bold flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center inline-flex"><i class="fas fa-check text-[10px]"></i></div> Payment received successfully</p>
              </div>
            `
      }
            </div>
          </div>

          <!-- Electricity Card -->
          <div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border ${t.elecPaid ? "border-emerald-200" : "border-amber-200"} p-6 sm:p-10 relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-xl">
            <div class="absolute -right-10 -top-10 w-40 h-40 ${t.elecPaid ? "bg-emerald-500/10" : "bg-amber-500/10"} rounded-full blur-[40px] pointer-events-none"></div>

            <div class="flex items-start justify-between mb-6 relative z-10">
              <div class="donut-chart shadow-lg ${t.elecPaid ? 'grayscale-[50%]' : ''}" style="width: 56px; height: 56px; background: conic-gradient(#3b82f6 0% ${totalBill > 0 ? (totalElec/totalBill)*100 : 50}%, #f97316 ${totalBill > 0 ? (totalElec/totalBill)*100 : 50}% 100%);">
                <div class="donut-inner text-[10px] font-black text-slate-700" style="width: 44px; height: 44px;"><i class="fas ${t.elecPaid ? "fa-circle-check text-emerald-500" : "fa-bolt"} text-lg"></i></div>
              </div>
              <span class="${t.elecPaid ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200 animate-pulse"} text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">${t.elecPaid ? "SETTLED" : "DUE"}</span>
            </div>
            
            <div class="relative z-10">
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2"><i class="fas fa-plug"></i> Electricity & Maintenance</p>
              <p class="text-4xl sm:text-5xl font-black ${t.elecPaid ? "text-slate-900 dark:text-slate-100" : "text-amber-500"} tracking-tighter leading-none mb-3">₹${bill.toLocaleString("en-IN")}</p>
              
              <div class="flex items-center gap-2 sm:gap-3 my-4 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100 w-fit">
                <div class="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div> ₹${totalElec.toLocaleString("en-IN")}</div>
                <div class="w-px h-3 bg-slate-300"></div>
                <div class="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-orange-500"></div> ₹${totalMaint.toLocaleString("en-IN")} Maint.</div>
              </div>

              <!-- Split Bill Calculator -->
              <div class="mt-3">
                <button onclick="document.getElementById('split-calc').classList.toggle('hidden')" class="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"><i class="fas fa-calculator"></i> Split Bill</button>
                <div id="split-calc" class="hidden mt-3 bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Your Share</span>
                    <span id="split-pct">50%</span>
                  </div>
                  <input type="range" min="10" max="100" value="50" step="10" class="w-full accent-emerald-500" oninput="const v=this.value; document.getElementById('split-pct').textContent=v+'%'; document.getElementById('split-yours').textContent='₹'+(Math.round(${bill}*v/100)).toLocaleString('en-IN'); document.getElementById('split-mate').textContent='₹'+(Math.round(${bill}*(100-v)/100)).toLocaleString('en-IN');" />
                  <div class="flex justify-between">
                    <div class="text-center"><p class="text-[8px] font-black uppercase text-slate-400">You Pay</p><p id="split-yours" class="text-lg font-black text-emerald-600">₹${Math.round(bill * 0.5).toLocaleString('en-IN')}</p></div>
                    <div class="text-center"><p class="text-[8px] font-black uppercase text-slate-400">Roommate</p><p id="split-mate" class="text-lg font-black text-blue-600">₹${Math.round(bill * 0.5).toLocaleString('en-IN')}</p></div>
                  </div>
                </div>
              </div>

              ${!t.elecPaid
        ? (() => {
            const pendingElec = (t.pendingPayments || []).find(p => p.type === 'electricity' && p.status === 'pending');
            return pendingElec
              ? `<div class="mt-6 pt-5 border-t border-amber-100">
                  <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Verification Progress</p>
                  <div class="relative">
                    <div class="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 z-0"></div>
                    <div class="absolute top-3 left-3 w-1/2 h-0.5 bg-gradient-to-r from-emerald-400 to-amber-400 z-0"></div>
                    <div class="flex justify-between relative z-10">
                      <div class="flex flex-col items-center gap-1.5 w-1/3">
                        <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-white shadow-sm"><i class="fas fa-check text-[10px]"></i></div>
                        <p class="text-[8px] font-bold text-slate-500 uppercase">Submitted</p>
                      </div>
                      <div class="flex flex-col items-center gap-1.5 w-1/3">
                        <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center border-2 border-white shadow-sm animate-pulse"><i class="fas fa-eye text-[10px]"></i></div>
                        <p class="text-[8px] font-bold text-amber-600 uppercase">Reviewing</p>
                      </div>
                      <div class="flex flex-col items-center gap-1.5 w-1/3">
                        <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border-2 border-white shadow-sm"><i class="fas fa-shield-check text-[10px]"></i></div>
                        <p class="text-[8px] font-bold text-slate-400 uppercase">Verified</p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 bg-amber-50/50 rounded-lg p-3 w-fit">
                    <p class="text-[9px] text-amber-600 font-semibold"><i class="fas fa-hashtag"></i> UTR: <span class="font-mono text-amber-800">${pendingElec.utrNumber}</span></p>
                  </div>
                </div>`
              : `<div class="mt-6 pt-5 border-t border-amber-100">
                  <button onclick="openUpiPaymentModal('electricity', ${bill})"
                    class="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_8px_16px_rgba(245,158,11,0.25)] hover:shadow-lg active:scale-[0.98] group">
                    <i class="fas fa-qrcode"></i> Pay Now via UPI <i class="fas fa-arrow-right transition-transform group-hover:translate-x-1 ml-1 text-xs"></i>
                  </button>
                </div>`;
          })()
        : `
              <div class="mt-6 pt-5 border-t border-emerald-100">
                <p class="text-emerald-600 text-xs font-bold flex items-center gap-2"><div class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center inline-flex"><i class="fas fa-check text-[10px]"></i></div> Settled for this month</p>
              </div>
            `
      }
            </div>
          </div>
        </div>

        <!-- Rejected Payments Alert -->
        ${(() => {
          const rejected = (t.pendingPayments || []).filter(p => p.status === 'rejected');
          if (rejected.length === 0) return '';
          return `
          <div class="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 sm:mb-8">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-rose-500 text-sm"></i>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-rose-600">Payment Rejected</p>
                <p class="text-[10px] text-rose-400 font-medium">Please resubmit with correct details</p>
              </div>
            </div>
            <div class="space-y-2">
              ${rejected.map(p => `
                <div class="bg-white rounded-xl p-3 border border-rose-100 flex items-center justify-between">
                  <div>
                    <span class="text-[9px] font-black uppercase tracking-widest ${p.type === 'rent' ? 'text-rose-500' : 'text-amber-500'}">${p.type === 'rent' ? 'Rent' : 'Electricity'}</span>
                    <p class="text-sm font-bold text-slate-700 mt-0.5">₹${Number(p.amount || 0).toLocaleString('en-IN')} • UTR: ${p.utrNumber}</p>
                    <p class="text-[10px] text-slate-400">${new Date(p.submittedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span class="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-1 rounded-lg">Rejected</span>
                </div>
              `).join('')}
            </div>
          </div>`;
        })()}

        <!-- Meter Readings Detail -->
        <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white p-6 sm:p-10 mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div class="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#C8A24A] to-amber-200"></div>
          <div class="flex items-center gap-4 mb-8 pl-4">
            <div class="w-12 h-12 bg-amber-50 border border-amber-100/50 rounded-2xl flex items-center justify-center shadow-inner">
              <i class="fas fa-gauge-high text-amber-500 text-lg"></i>
            </div>
            <div>
              <p class="text-sm font-black uppercase tracking-widest text-slate-800">Meter Readings</p>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Current month's usage breakdown</p>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pl-4">
            <div class="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm">
              <div class="w-8 h-8 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center"><i class="fas fa-history text-slate-400 text-[10px]"></i></div>
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Previous Elec</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">${num(t.elecLast)}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-white border border-blue-100/50 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden">
              <div class="absolute inset-0 bg-blue-500/5"></div>
              <div class="w-8 h-8 rounded-full bg-blue-100 mx-auto mb-3 flex items-center justify-center relative"><i class="fas fa-bolt text-blue-500 text-[10px]"></i></div>
              <p class="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1 relative">Current Elec</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight relative">${num(t.elecCurrent)}</p>
            </div>
            <div class="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-5 text-center shadow-sm">
               <div class="w-8 h-8 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center"><i class="fas fa-history text-slate-400 text-[10px]"></i></div>
               <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Inv Last</p>
               <p class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">${num(t.invLast)}</p>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/50 rounded-2xl p-5 text-center shadow-sm relative overflow-hidden">
              <div class="absolute inset-0 bg-emerald-500/5"></div>
              <div class="w-8 h-8 rounded-full bg-emerald-100 mx-auto mb-3 flex items-center justify-center relative"><i class="fas fa-battery-full text-emerald-500 text-[10px]"></i></div>
              <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1 relative">Inv Current</p>
              <p class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight relative">${num(t.invCurrent)}</p>
            </div>
          </div>
        </div>

        <!-- Quick Info Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-5 text-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-calendar-check text-[#C8A24A] text-[15px]"></i>
            </div>
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Move-in Date</p>
            <p class="text-sm sm:text-base font-black text-slate-800">${t.checkinDate || "Not Set"}</p>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-5 text-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-calendar-xmark text-slate-500 text-[15px]"></i>
            </div>
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lease Ends</p>
            <p class="text-sm sm:text-base font-black text-slate-800">${t.agreementEndDate || "Not Set"}</p>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-5 text-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-piggy-bank text-emerald-500 text-[15px]"></i>
            </div>
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Security Dep.</p>
            <p class="text-sm sm:text-base font-black text-slate-800">₹${Number(t.securityDeposit || 0).toLocaleString("en-IN")}</p>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white p-5 text-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-mobile-screen-button text-blue-500 text-[15px]"></i>
            </div>
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Reg. Phone</p>
            <p class="text-sm sm:text-base font-black text-slate-800">${t.phone || "Not Set"}</p>
          </div>
        </div>

        <!-- Room Amenities -->
        ${(() => {
        const enabledAmenities = (t.amenities || []).filter((a) => a.enabled);
        if (enabledAmenities.length === 0) return "";
        const iconMap = {};
        MASTER_AMENITIES.forEach((a) => {
          iconMap[a.name] = a.icon;
        });
        return `
          <div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-10 mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center shadow-inner">
                <i class="fas fa-concierge-bell text-indigo-500 text-lg"></i>
              </div>
              <div>
                <p class="text-sm font-black uppercase tracking-widest text-slate-800">Your Included Amenities</p>
                <p class="text-xs text-slate-500 font-medium mt-0.5">${enabledAmenities.length} premium amenities actively provided</p>
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              ${enabledAmenities
            .map(
              (a) => `
                <div class="flex items-center gap-3 bg-white border border-slate-100/50 shadow-sm hover:shadow hover:border-indigo-100 rounded-2xl p-4 transition-all hover:-translate-y-1">
                  <div class="w-10 h-10 bg-indigo-50/80 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <i class="fas ${iconMap[a.name] || "fa-check"} text-sm drop-shadow-sm"></i>
                  </div>
                  <span class="text-sm font-bold text-slate-700">${a.name}</span>
                </div>
              `,
            )
            .join("")}
            </div>
          </div>`;
      })()}

        <!-- Action Buttons -->

        <!-- Complaint Form -->
        <div id="tenant-complaint-section" class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-10 mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-rose-500/5 rounded-full blur-[50px]"></div>
          
          <div class="flex items-center gap-4 mb-8 relative z-10">
            <div class="w-12 h-12 bg-rose-50 border border-rose-100/50 rounded-2xl flex items-center justify-center shadow-inner">
              <i class="fas fa-comment-dots text-rose-500 text-lg"></i>
            </div>
            <div>
              <p class="text-sm font-black uppercase tracking-widest text-slate-800">Support & Complaints</p>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Report maintenance or service issues instantly</p>
            </div>
          </div>
          
          <div class="relative z-10">
            <div class="flex flex-col sm:flex-row gap-3 bg-slate-50/80 p-2 sm:p-3 rounded-[1.5rem] border border-slate-100">
              <div class="flex-1 relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fas fa-pen text-slate-400"></i>
                </div>
                <input id="tenant-complaint-input" type="text" placeholder="E.g. AC is not cooling properly..." class="w-full pl-11 pr-4 py-3 sm:py-4 bg-white rounded-xl border-none shadow-sm text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200 placeholder:text-slate-400">
              </div>
              <button onclick="submitTenantComplaint()" class="w-full sm:w-auto px-8 py-3 sm:py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 flex items-center justify-center gap-2 group">
                Submit <i class="fas fa-paper-plane group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform text-xs ml-1"></i>
              </button>
            </div>
            
            ${(t.complaints || []).length
          ? `
              <div class="mt-8">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-px flex-1 bg-slate-200"></div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Support History</p>
                  <div class="h-px flex-1 bg-slate-200"></div>
                </div>
                <div class="space-y-4">
                ${(t.complaints || [])
            .slice()
            .reverse()
            .map(
              (c) => `
                  <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow transition-shadow group relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 ${c.status === "open" ? "bg-amber-400" : "bg-emerald-400"}"></div>
                    <div class="flex items-start justify-between mb-4 pl-3">
                      <div>
                        <p class="text-xs font-black uppercase tracking-widest ${c.status === "open" ? "text-amber-500" : "text-emerald-500"} mb-1 flex items-center gap-1.5"><i class="fas ${c.status === "open" ? "fa-hammer" : "fa-check-double"}"></i> ${c.status === "open" ? "In Progress" : "Resolved"}</p>
                        <p class="text-sm font-bold text-slate-700 leading-snug">${c.text}</p>
                      </div>
                    </div>
                    
                    <!-- Kanban Visual Tracker -->
                    <div class="pl-3 mt-4">
                      <div class="flex items-center gap-0 w-full max-w-sm">
                        <!-- Step 1: Filed -->
                        <div class="flex flex-col items-center flex-1 relative">
                          <div class="w-6 h-6 rounded-full flex items-center justify-center bg-amber-500 text-white z-10 text-[8px] font-black shadow-md shadow-amber-500/20"><i class="fas fa-check"></i></div>
                          <p class="text-[8px] font-bold text-amber-600 mt-1.5 uppercase tracking-wider text-center">Filed</p>
                        </div>
                        
                        <div class="h-[2px] w-full flex-1 -mx-4 z-0 ${c.status === "open" ? "bg-gradient-to-r from-amber-400 to-slate-200" : "bg-emerald-400"} relative -top-3"></div>
                        
                        <!-- Step 2: In Progress -->
                        <div class="flex flex-col items-center flex-1 relative">
                          <div class="w-6 h-6 rounded-full flex items-center justify-center ${c.status === "open" ? "bg-blue-500 text-white shadow-md shadow-blue-500/20 animate-pulse" : "bg-emerald-500 text-white"} z-10 text-[8px] font-black"><i class="fas ${c.status === "open" ? "fa-cog animate-spin-slow" : "fa-check"}"></i></div>
                          <p class="text-[8px] font-bold ${c.status === "open" ? "text-blue-600" : "text-emerald-600"} mt-1.5 uppercase tracking-wider text-center whitespace-nowrap -ml-2">Working On It</p>
                        </div>
                        
                        <div class="h-[2px] w-full flex-1 -mx-2 z-0 ${c.status === "open" ? "bg-slate-200" : "bg-emerald-400"} relative -top-3"></div>
                        
                        <!-- Step 3: Resolved -->
                        <div class="flex flex-col items-center flex-1 relative">
                          <div class="w-6 h-6 rounded-full flex items-center justify-center ${c.status === "open" ? "bg-slate-100 text-slate-300" : "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"} z-10 text-[8px] font-black"><i class="fas fa-flag-checkered"></i></div>
                          <p class="text-[8px] font-bold ${c.status === "open" ? "text-slate-400" : "text-emerald-600"} mt-1.5 uppercase tracking-wider text-center">Resolved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `
            ).join("")}
                </div>
              </div>
            `
          : ""
        }
          </div>
        </div>


        <!-- Payment History -->
        ${(t.paymentHistory || []).length
        ? `
        <div id="tenant-payment-history" class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-10 mb-6 sm:mb-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-center shadow-inner">
              <i class="fas fa-clock-rotate-left text-blue-500 text-lg"></i>
            </div>
            <div>
              <p class="text-sm font-black uppercase tracking-widest text-slate-800">Payment History</p>
              <p class="text-xs text-slate-500 font-medium mt-0.5">${(t.paymentHistory || []).length} transactions recorded</p>
            </div>
          </div>
          <div class="space-y-3">
            ${(t.paymentHistory || [])
          .slice()
          .reverse()
          .slice(0, 10)
          .map(
            (p) => `
              <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 p-4 sm:p-5 rounded-2xl transition-all group">
                <div class="flex items-center gap-4 mb-3 sm:mb-0">
                  <div class="w-10 h-10 ${p.type === "rent" ? "bg-emerald-100/80" : "bg-amber-100/80"} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <i class="fas ${p.type === "rent" ? "fa-indian-rupee-sign text-emerald-600" : "fa-bolt text-amber-600"}"></i>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800 capitalize">${p.type === 'electricity' ? 'Electricity & Maint.' : 'Rent'}</p>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">${p.month || ""} • ${p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : ""}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 border-slate-200/60 sm:border-none pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <div class="text-left sm:text-right">
                     <p class="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Paid</p>
                     <span class="text-lg font-black text-slate-900 tracking-tight">₹${Number(p.amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <button onclick="window.tenantDownloadInvoice('${p.type}', ${p.amount || 0}, '${p.month || ''}', '${p.paidAt || ''}', '${p.utrNumber || ''}')" class="px-4 py-2 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 rounded-xl text-xs font-bold text-slate-600 transition-all shadow-sm flex items-center gap-2 active:scale-95 group-hover:shadow">
                    <i class="fas fa-file-invoice text-emerald-500"></i> <span class="hidden sm:inline">View</span> Invoice
                  </button>
                </div>
              </div>
            `,
          )
          .join("")}
          </div>
        </div>
        `
        : ""
      }

        <!-- Charts Grid: Expense History & Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-10">
          <!-- Expense Mini-Chart -->
          ${(() => {
            const ph = (t.paymentHistory || []).slice(-6);
            if (ph.length === 0) return '';
            const maxAmt = Math.max(...ph.map(x => Number(x.amount || 0)));
            const bars = ph.map((p, i) => {
              const pct = maxAmt > 0 ? (Number(p.amount || 0) / maxAmt) * 100 : 50;
              const color = p.type === 'rent' ? 'from-emerald-400 to-emerald-600' : 'from-blue-400 to-indigo-500';
              const mo = p.month ? p.month.substring(0, 3) : (p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { month: 'short' }) : '');
              return '<div class="flex-1 flex flex-col items-center gap-1 group">' +
                '<p class="text-[8px] sm:text-[9px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">\u20b9' + Number(p.amount || 0).toLocaleString('en-IN') + '</p>' +
                '<div class="w-full bg-gradient-to-t ' + color + ' rounded-t-lg transition-all duration-700 group-hover:opacity-80 relative overflow-hidden" style="height: ' + Math.max(pct, 10) + '%; animation: barGrow 0.8s ease-out ' + (i * 0.1) + 's both;">' +
                '<div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-t-lg"></div></div>' +
                '<p class="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-wider">' + mo + '</p>' +
                '<div class="w-1.5 h-1.5 rounded-full ' + (p.type === 'rent' ? 'bg-emerald-400' : 'bg-blue-400') + '"></div></div>';
            }).join('');
            return '<div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden fade-in h-full" style="animation-delay: 0.6s;">' +
              '<div class="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px]"></div>' +
              '<div class="flex items-center gap-3 mb-6 relative z-10"><div class="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl flex items-center justify-center shadow-inner"><i class="fas fa-chart-column text-blue-500 text-sm"></i></div><div><p class="text-sm font-black uppercase tracking-widest text-slate-800">Expense History</p><p class="text-xs text-slate-500 font-medium mt-0.5">Your recent payments</p></div></div>' +
              '<div class="flex items-end gap-2 h-32 relative z-10 w-full">' + bars + '</div>' +
              '<div class="flex items-center justify-center gap-6 mt-4 relative z-10"><span class="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Rent</span><span class="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase"><span class="w-2 h-2 rounded-full bg-blue-400"></span> Elec. & Maint.</span></div></div>';
          })()}

          <!-- #20: Where Does My Money Go? -->
          ${(() => {
            const rentVal = Number(t.rentAmount || 0);
            const elecVal = totalElec;
            const maintVal = totalMaint;
            const totalSpend = rentVal + elecVal + maintVal;
            if (totalSpend === 0) return '';
            
            const rentPct = Math.round((rentVal / totalSpend) * 100);
            const elecPct = Math.round((elecVal / totalSpend) * 100);
            const maintPct = Math.round((maintVal / totalSpend) * 100);
            
            const conicStr = `conic-gradient(#10b981 0% ${rentPct}%, #3b82f6 ${rentPct}% ${rentPct+elecPct}%, #f59e0b ${rentPct+elecPct}% 100%)`;
            
            return '<div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden fade-in h-full" style="animation-delay: 0.7s;">' +
                   '<div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px]"></div>' +
                   '<div class="flex items-center gap-3 mb-6 relative z-10"><div class="w-10 h-10 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-xl flex items-center justify-center shadow-inner"><i class="fas fa-chart-pie text-emerald-500 text-sm"></i></div><div><p class="text-sm font-black uppercase tracking-widest text-slate-800">Your Spending</p><p class="text-xs text-slate-500 font-medium mt-0.5">This month&apos;s breakdown</p></div></div>' +
                   '<div class="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 relative z-10 h-[160px]">' +
                     '<div class="donut-chart shadow-lg relative flex items-center justify-center flex-shrink-0" style="width: 140px; height: 140px; border-radius: 50%; background: ' + conicStr + ';">' +
                       '<div class="bg-white rounded-full flex flex-col items-center justify-center shadow-inner" style="width: 100px; height: 100px;"><p class="text-[8px] uppercase font-black tracking-widest text-slate-400">Total</p><p class="text-sm font-black text-slate-800 tracking-tighter">₹' + totalSpend.toLocaleString('en-IN') + '</p></div>' +
                     '</div>' +
                     '<div class="space-y-4 w-full sm:w-auto">' +
                       '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div><div><p class="text-[9px] font-black uppercase text-slate-500 tracking-wider">Rent</p><p class="text-xs font-bold text-slate-800">₹' + rentVal.toLocaleString('en-IN') + ' <span class="text-slate-400 font-medium">(' + rentPct + '%)</span></p></div></div>' +
                       '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div><div><p class="text-[9px] font-black uppercase text-slate-500 tracking-wider">Electric</p><p class="text-xs font-bold text-slate-800">₹' + elecVal.toLocaleString('en-IN') + ' <span class="text-slate-400 font-medium">(' + elecPct + '%)</span></p></div></div>' +
                       '<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div><div><p class="text-[9px] font-black uppercase text-slate-500 tracking-wider">Maint.</p><p class="text-xs font-bold text-slate-800">₹' + maintVal.toLocaleString('en-IN') + ' <span class="text-slate-400 font-medium">(' + maintPct + '%)</span></p></div></div>' +
                     '</div>' +
                   '</div>' +
                   '</div>';
          })()}
        </div>

        <!-- Emergency Contacts -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-7 mb-6 sm:mb-8 text-white">
          <div class="flex items-center gap-2 mb-5">
            <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <i class="fas fa-phone-volume text-red-400"></i>
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-white/80">Emergency Contacts</p>
              <p class="text-[10px] text-white/50 font-medium">Available 24/7 for urgent issues</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="tel:+919142272776" class="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-xl p-4 transition">
              <div class="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <i class="fas fa-phone text-emerald-400 text-sm"></i>
              </div>
              <div>
                <p class="text-[9px] font-bold uppercase tracking-wider text-white/50">Phone</p>
                <p class="text-sm font-bold text-white">+91 91422 72776</p>
              </div>
            </a>
            <a href="https://wa.me/919142272776?text=${encodeURIComponent("Hi ANVI STAY,\n\n🏠 PG: " + (buildings.find((b) => b.id === bid)?.name || bid) + "\n🚪 Room: " + rno + "\n👤 Tenant: " + (t.name || "N/A") + "\n\nI need urgent assistance. Please help.")}" target="_blank" class="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-xl p-4 transition">
              <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i class="fab fa-whatsapp text-green-400 text-lg"></i>
              </div>
              <div>
                <p class="text-[9px] font-bold uppercase tracking-wider text-white/50">WhatsApp</p>
                <p class="text-sm font-bold text-white">Message Us</p>
              </div>
            </a>
            <a href="mailto:support@anvistay.com" class="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-xl p-4 transition">
              <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i class="fas fa-envelope text-blue-400 text-sm"></i>
              </div>
              <div>
                <p class="text-[9px] font-bold uppercase tracking-wider text-white/50">Email</p>
                <p class="text-sm font-bold text-white">support@anvistay.com</p>
              </div>
            </a>
          </div>
        </div>
        <!-- Footer Actions -->
        <div class="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white p-3 sm:p-4 mb-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
          <div class="flex flex-col sm:flex-row gap-3">
            <a href="https://wa.me/919142272776?text=${encodeURIComponent("Hello ANVI STAY Support,\n\nI need assistance with the following:\n\n🏠 PG Name: " + (buildings.find((b) => b.id === bid)?.name || bid) + "\n🚪 Room No: " + rno + "\n👤 Tenant: " + (t.name || "N/A") + "\n📱 Phone: " + (t.phone || "N/A") + "\n\nPlease get back to me at the earliest. Thank you!")}" target="_blank" rel="noopener noreferrer"
              class="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-4 rounded-2xl font-bold text-sm text-center transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
              <i class="fab fa-whatsapp text-lg"></i> Contact Support
            </a>
            <a href="tel:+919142272776"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              <i class="fas fa-phone text-sm"></i> Call Us
            </a>
            <button onclick="tenantLogout()"
              class="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-100/50 text-rose-600 py-4 rounded-2xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              <i class="fas fa-power-off text-sm"></i> Logout
            </button>
          </div>
          <div class="mt-4 flex justify-between items-center px-2">
            <span class="session-timer"><i class="fas fa-shield-halved text-emerald-500"></i> Secure Session</span>
            <span class="session-timer" id="session-time-display">00:00</span>
          </div>
        </div>
      `;
    dash.classList.remove("hidden");
    // Hide the login form
    const loginForm = byId("tenant-login-form");
    if (loginForm) loginForm.classList.add("hidden");
    // Cascading reveal animation (Feature #15)
    dash.classList.add("dashboard-enter");
    setTimeout(() => dash.classList.remove("dashboard-enter"), 1200);
    dash.scrollIntoView({ behavior: "smooth", block: "start" });

    // Populate tenant notification dropdown
    renderTenantNotifs(fetchedNotices, t.complaints);

    // ── Feature #2: Interactive 3D Tilt Effect on Cards ──
    document.querySelectorAll('.tilt-card, #tenant-payment-status > div').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
        card.style.transition = 'transform 0.1s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.transition = 'transform 0.4s ease';
      });
    });

    // ── Feature #12: Magnetic Buttons ──
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.3s ease';
      });
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.1s ease';
      });
    });
    // ── Feature #28: Scroll Progress ──
    const dashboardContainer = document.documentElement;
    window.addEventListener('scroll', () => {
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = document.getElementById('scroll-progress');
      if (scrollProgress && scrollTotal > 0) {
        scrollProgress.style.width = `${(window.scrollY / scrollTotal) * 100}%`;
      }
    });

    // ── Feature #39: Session Timer ──
    let sessionSeconds = 0;
    const sessionTimerEl = document.getElementById('session-time-display');
    if (window.tenantSessionInterval) clearInterval(window.tenantSessionInterval);
    if (sessionTimerEl) {
      window.tenantSessionInterval = setInterval(() => {
        sessionSeconds++;
        const m = Math.floor(sessionSeconds / 60).toString().padStart(2, '0');
        const s = (sessionSeconds % 60).toString().padStart(2, '0');
        sessionTimerEl.textContent = `${m}:${s}`;
      }, 1000);
    }

    // ── Feature #22: Animated Number Counters ──
    document.querySelectorAll('.counter-animate').forEach(el => {
      const target = parseFloat(el.getAttribute('data-val') || 0);
      const isCurrency = el.textContent.includes('₹');
      let current = 0;
      const duration = 1500;
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = isCurrency ? '₹' + Math.floor(current).toLocaleString('en-IN') : Math.floor(current);
      }, stepTime);
    });

    // ── Feature #14: Blur Spotlight on Complaint Focus ──
    const complaintInput = byId('tenant-complaint-input');
    if (complaintInput) {
      complaintInput.addEventListener('focus', () => {
        dash.classList.add('spotlight-active');
        const section = byId('tenant-complaint-section');
        if (section) section.classList.add('spotlight-target');
      });
      complaintInput.addEventListener('blur', () => {
        dash.classList.remove('spotlight-active');
        const section = byId('tenant-complaint-section');
        if (section) section.classList.remove('spotlight-target');
      });
    }

    // ── Feature #4: Pull-to-Refresh (Mobile) ──
    let touchStartY = 0;
    let refreshing = false;
    dash.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) touchStartY = e.touches[0].clientY;
    }, { passive: true });
    dash.addEventListener('touchmove', (e) => {
      if (refreshing || window.scrollY > 0) return;
      const diff = e.touches[0].clientY - touchStartY;
      if (diff > 80) {
        refreshing = true;
        toast("🔄 Refreshing your dashboard...", 2000);
        setTimeout(() => { fetchTenantDashboard(); refreshing = false; }, 1500);
      }
    }, { passive: true });
  } catch (err) {
    console.error("[Tenant Login]", err);
    showTenantError("Server unreachable. Make sure the backend is running.");
  }
};

// ═══════════════════════════════════════
// ═══ UPI PAYMENT SYSTEM ═══
// ═══════════════════════════════════════

// ── UPI Configuration ──
const UPI_ID = "anvistay@okicici"; // Change this to your actual Google Pay Business UPI ID
const UPI_QR_IMAGE = "assets/img/upi-qr.png"; // Path to your QR code image

// ── Open UPI Payment Modal (Tenant Side) ──
window.openUpiPaymentModal = (paymentType, amount) => {
  // Remove any existing modal
  const existingModal = byId("upi-payment-modal");
  if (existingModal) existingModal.remove();

  const typeLabel = paymentType === "rent" ? "Monthly Rent" : "Electricity + Maintenance";
  const typeColor = paymentType === "rent" ? "rose" : "amber";
  const monthLabel = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  const modalHTML = `
    <div id="upi-payment-modal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);">
      <div class="bg-white rounded-[2rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up" style="animation: slideUp 0.35s ease-out;">
        
        <!-- Header -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-[2rem] p-6 text-white relative overflow-hidden">
          <div class="absolute -right-6 -top-6 opacity-[0.06]">
            <i class="fas fa-qrcode text-[8rem]"></i>
          </div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <i class="fas fa-qrcode text-white"></i>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-white/50">Pay via UPI</p>
                  <p class="text-sm font-black text-white">${typeLabel}</p>
                </div>
              </div>
              <button onclick="closeUpiPaymentModal()" class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition">
                <i class="fas fa-times text-white/80 text-sm"></i>
              </button>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-xl p-3 flex items-center justify-between">
              <span class="text-white/60 text-xs font-bold">${monthLabel}</span>
              <span class="text-2xl font-black text-white">₹${Number(amount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">

          <!-- Step 1: QR Code -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="w-6 h-6 bg-${typeColor}-100 text-${typeColor}-600 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
              <p class="text-xs font-black uppercase tracking-widest text-slate-500">Scan QR Code to Pay</p>
            </div>
            <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 flex flex-col items-center border border-slate-200">
              <img src="/upi-qr.png" alt="UPI QR Code" class="w-48 h-48 object-contain rounded-xl mb-3 shadow-md" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="w-48 h-48 bg-white rounded-xl border-2 border-dashed border-slate-300 items-center justify-center text-slate-400 text-center p-4" style="display:none;">
                <i class="fas fa-qrcode text-4xl mb-2"></i>
                <p class="text-[10px] font-bold">QR Code</p>
                <p class="text-[9px]">Use UPI ID below</p>
              </div>
              <p class="text-[10px] text-slate-400 font-medium mt-1">Open any UPI app to scan</p>
            </div>
          </div>

          <!-- OR Divider -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">or pay using UPI ID</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          <!-- UPI ID Copy -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p class="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">UPI ID</p>
            <div class="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-200">
              <span class="text-sm font-black text-slate-800 select-all" id="upi-id-text">${UPI_ID}</span>
              <button onclick="copyUpiId()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 flex items-center gap-1.5">
                <i class="fas fa-copy" id="upi-copy-icon"></i> <span id="upi-copy-text">Copy</span>
              </button>
            </div>
            <div class="flex items-center gap-4 mt-3">
              <div class="flex items-center gap-1.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" class="h-4" alt="GPay" onerror="this.style.display='none'">
              </div>
              <div class="flex items-center gap-1.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" class="h-3.5" alt="UPI" onerror="this.style.display='none'">
              </div>
            </div>
          </div>

          <!-- Step 2: UTR Number -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="w-6 h-6 bg-${typeColor}-100 text-${typeColor}-600 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
              <p class="text-xs font-black uppercase tracking-widest text-slate-500">Enter UTR / Transaction ID</p>
            </div>
            <div class="relative">
              <input type="text" id="upi-utr-input" placeholder="e.g. 412345678901" maxlength="25"
                class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-${typeColor}-400 focus:ring-2 focus:ring-${typeColor}-100 transition placeholder:text-slate-300" />
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <i class="fas fa-receipt text-slate-300"></i>
              </div>
            </div>
            <p class="text-[9px] text-slate-400 font-medium mt-1.5 ml-1">
              <i class="fas fa-info-circle mr-1"></i> Find the UTR/Reference number in your UPI app transaction history
            </p>
          </div>

          <!-- Amount Info -->
          <div class="bg-${typeColor}-50 border border-${typeColor}-200 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[9px] font-black uppercase tracking-widest text-${typeColor}-500">Payment Amount</p>
                <p class="text-2xl font-black text-${typeColor}-700 mt-1">₹${Number(amount).toLocaleString("en-IN")}</p>
              </div>
              <div class="w-12 h-12 bg-${typeColor}-100 rounded-xl flex items-center justify-center">
                <i class="fas ${paymentType === 'rent' ? 'fa-home' : 'fa-bolt'} text-${typeColor}-500 text-lg"></i>
              </div>
            </div>
          </div>

          <!-- Error display -->
          <div id="upi-submit-error" class="hidden text-rose-600 text-xs font-bold bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
            <i class="fas fa-exclamation-circle"></i> <span></span>
          </div>

          <!-- Submit Button -->
          <button id="upi-submit-btn" onclick="submitUpiPayment('${paymentType}', ${amount})"
            class="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            style="box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3)">
            <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <i class="fas fa-paper-plane relative z-10"></i>
            <span class="relative z-10">Submit Payment for Verification</span>
          </button>

          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
            <i class="fas fa-shield-halved text-blue-500 mt-0.5 text-sm"></i>
            <div>
              <p class="text-[10px] font-bold text-blue-700">Secure Payment Process</p>
              <p class="text-[9px] text-blue-500 mt-0.5 leading-relaxed">After submitting, our admin team will verify your payment within 1-2 hours. Once approved, your invoice will be generated automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.body.style.overflow = "hidden";
};

// ── Close UPI Modal ──
window.closeUpiPaymentModal = () => {
  const modal = byId("upi-payment-modal");
  if (modal) {
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = "";
    }, 200);
  }
};

// ── Copy UPI ID ──
window.copyUpiId = () => {
  const text = byId("upi-id-text")?.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      const icon = byId("upi-copy-icon");
      const txt = byId("upi-copy-text");
      if (icon) icon.className = "fas fa-check";
      if (txt) txt.textContent = "Copied!";
      setTimeout(() => {
        if (icon) icon.className = "fas fa-copy";
        if (txt) txt.textContent = "Copy";
      }, 2000);
      toast("UPI ID copied to clipboard! ✅");
    });
  }
};

// ── Generic Tenant Download Invoice ──
window.tenantDownloadInvoice = (type, amount, month, paidAt, utrNumber) => {
  if (!state.tenantLogin) return;
  const key = `${state.tenantLogin.bid}-${state.tenantLogin.rno}`;
  const room = state.tenants[key];
  if (!room) {
    toast("Room data not found. Please refresh the page.", 4000);
    return;
  }
  
  const paymentData = {
    type: type,
    amount: amount,
    month: month,
    paidAt: paidAt,
    utrNumber: utrNumber
  };
  
  if (window.triggerConfetti) window.triggerConfetti();
  window.generateUpiInvoice(room, paymentData);
};

// ── Submit UPI Payment (Tenant) ──
window.submitUpiPayment = async (paymentType, amount) => {
  const utr = byId("upi-utr-input")?.value?.trim();
  const errEl = byId("upi-submit-error");
  const btn = byId("upi-submit-btn");

  if (!utr || utr.length < 6) {
    if (errEl) {
      errEl.querySelector("span").textContent = "Please enter a valid UTR/Transaction Reference Number (minimum 6 characters).";
      errEl.classList.remove("hidden");
    }
    return;
  }

  if (!state.tenantLogin) {
    toast("Session expired. Please login again.");
    return;
  }

  const { bid, rno, pass } = state.tenantLogin;

  // Disable button and show loading
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  }

  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}/upi-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: pass,
        type: paymentType,
        amount: amount,
        utrNumber: utr,
      }),
    });

    const result = await res.json();

    if (result.success) {
      closeUpiPaymentModal();
      if (window.triggerConfetti) window.triggerConfetti();
      toast("✅ Payment submitted for verification! You'll be notified once approved.", 5000);
      // Refresh dashboard to show pending status
      fetchTenantDashboard();
    } else {
      if (errEl) {
        errEl.querySelector("span").textContent = result.message || "Failed to submit payment. Please try again.";
        errEl.classList.remove("hidden");
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Submit Payment for Verification</span>';
      }
    }
  } catch (err) {
    console.error("[submitUpiPayment]", err);
    if (errEl) {
      errEl.querySelector("span").textContent = "Server error. Please try again later.";
      errEl.classList.remove("hidden");
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Submit Payment for Verification</span>';
    }
  }
};

// ═══════════════════════════════════════
// ═══ ADMIN: UPI QUEUE ═══
// ═══════════════════════════════════════

window.renderPendingUpiPayments = async () => {
  const container = byId("pending-upi-list");
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-8">
      <div class="flex items-center gap-3 text-slate-400">
        <i class="fas fa-spinner fa-spin text-lg"></i>
        <span class="text-sm font-bold">Loading pending payments...</span>
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/rooms?limit=500`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const result = await res.json();

    if (!result.success) {
      container.innerHTML = '<p class="text-rose-500 text-sm p-4">Failed to load data.</p>';
      return;
    }

    // Collect all pending payments across rooms
    const pendingPayments = [];
    result.data.forEach((room) => {
      (room.pendingPayments || []).forEach((p) => {
        pendingPayments.push({ ...p, room });
      });
    });

    // Separate by status
    const pending = pendingPayments.filter((p) => p.status === "pending");
    const reviewed = pendingPayments.filter((p) => p.status !== "pending");

    if (pending.length === 0 && reviewed.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <i class="fas fa-check-circle text-emerald-400 text-2xl"></i>
          </div>
          <p class="text-slate-500 text-sm font-bold">No pending UPI payments</p>
          <p class="text-slate-400 text-xs mt-1">All payments have been processed</p>
        </div>
      `;
      return;
    }

    // Stats cards
    const approvedCount = reviewed.filter((p) => p.status === "approved").length;
    const rejectedCount = reviewed.filter((p) => p.status === "rejected").length;
    const totalPendingAmount = pending.reduce((s, p) => s + (p.amount || 0), 0);

    let html = `
      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
          <p class="text-2xl font-black text-amber-600">${pending.length}</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-amber-500">Pending</p>
        </div>
        <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <p class="text-2xl font-black text-blue-600">₹${totalPendingAmount.toLocaleString("en-IN")}</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-blue-500">Pending Amount</p>
        </div>
        <div class="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <p class="text-2xl font-black text-emerald-600">${approvedCount}</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Approved</p>
        </div>
        <div class="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
          <p class="text-2xl font-black text-rose-600">${rejectedCount}</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-rose-500">Rejected</p>
        </div>
      </div>
    `;

    // Pending payments list
    if (pending.length > 0) {
      html += `
        <div class="mb-6">
          <h4 class="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
            <i class="fas fa-clock"></i> Awaiting Verification (${pending.length})
          </h4>
          <div class="space-y-3">
      `;

      pending.forEach((p) => {
        const bName = buildings.find((b) => b.id === p.room.buildingId)?.name || p.room.buildingId;
        const pTypeColor = p.type === "rent" ? "rose" : "amber";
        const pTypeIcon = p.type === "rent" ? "fa-home" : "fa-bolt";
        const pTypeLabel = p.type === "rent" ? "Rent" : "Electricity";

        html += `
          <div class="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-${pTypeColor}-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i class="fas ${pTypeIcon} text-${pTypeColor}-500 text-lg"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[9px] font-black uppercase tracking-widest bg-${pTypeColor}-100 text-${pTypeColor}-600 px-2 py-0.5 rounded-full">${pTypeLabel}</span>
                    <span class="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full animate-pulse">PENDING</span>
                  </div>
                  <p class="text-base font-black text-slate-800">${p.room.name || "Tenant"}</p>
                  <p class="text-xs text-slate-400 font-medium">${bName} · Room ${p.room.roomNo}</p>
                  <div class="flex items-center gap-3 mt-2 text-xs">
                    <span class="font-bold text-slate-600"><i class="fas fa-receipt text-slate-400 mr-1"></i> UTR: <span class="text-slate-800 select-all">${p.utrNumber}</span></span>
                    <span class="text-slate-300">|</span>
                    <span class="font-bold text-slate-600"><i class="fas fa-phone text-slate-400 mr-1"></i> ${p.room.phone || "N/A"}</span>
                  </div>
                  <p class="text-[10px] text-slate-400 mt-1"><i class="fas fa-clock mr-1"></i> Submitted ${new Date(p.submittedAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-3">
                <p class="text-2xl font-black text-slate-900">₹${Number(p.amount || 0).toLocaleString("en-IN")}</p>
                <div class="flex gap-2">
                  <button onclick="adminApproveUpiPayment('${p.room.buildingId}', ${p.room.roomNo}, ${p.id})"
                    class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition active:scale-95 flex items-center gap-1.5">
                    <i class="fas fa-check-circle"></i> Approve
                  </button>
                  <button onclick="adminRejectUpiPayment('${p.room.buildingId}', ${p.room.roomNo}, ${p.id})"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition active:scale-95 flex items-center gap-1.5">
                    <i class="fas fa-times-circle"></i> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    }

    // Recently reviewed payments
    if (reviewed.length > 0) {
      html += `
        <div>
          <h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <i class="fas fa-history"></i> Recently Reviewed (${reviewed.length})
          </h4>
          <div class="space-y-2">
      `;

      reviewed
        .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
        .slice(0, 20)
        .forEach((p) => {
          const bName = buildings.find((b) => b.id === p.room.buildingId)?.name || p.room.buildingId;
          const isApproved = p.status === "approved";

          html += `
            <div class="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 ${isApproved ? "bg-emerald-100" : "bg-rose-100"} rounded-lg flex items-center justify-center">
                  <i class="fas ${isApproved ? "fa-check text-emerald-500" : "fa-times text-rose-500"} text-xs"></i>
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-700">${p.room.name || "Tenant"} · ${bName} Room ${p.room.roomNo}</p>
                  <p class="text-[10px] text-slate-400">${p.type === "rent" ? "Rent" : "Electricity"} • UTR: ${p.utrNumber} • ${p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString("en-IN") : ""}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-black text-slate-700">₹${Number(p.amount || 0).toLocaleString("en-IN")}</span>
                <span class="text-[9px] font-black uppercase px-2 py-1 rounded-lg ${isApproved ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}">${p.status}</span>
              </div>
            </div>
          `;
        });

      html += `</div></div>`;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error("[renderPendingUpiPayments]", err);
    container.innerHTML = '<p class="text-rose-500 text-sm p-4">Error loading UPI payments. Check backend connection.</p>';
  }
};

// ── Admin: Approve UPI Payment ──
window.adminApproveUpiPayment = async (buildingId, roomNo, paymentId) => {
  if (!confirm("✅ Approve this payment? This will mark the payment as received and generate an invoice.")) return;

  try {
    const res = await fetch(`${API_BASE}/rooms/${buildingId}/${roomNo}/upi-verify/${paymentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "approved" }),
    });

    const result = await res.json();

    if (result.success) {
      toast("✅ Payment approved! Invoice has been generated.", 4000);

      // Generate & open invoice for the approved payment
      const room = result.data;
      const payment = (room.pendingPayments || []).find((p) => p.id === paymentId);
      if (payment) {
        generateUpiInvoice(room, payment);
      }

      // Refresh the UPI queue
      renderPendingUpiPayments();

      // Also refresh room list if visible
      if (typeof loadRoomsForBuilding === "function") {
        try { loadRoomsForBuilding(); } catch (e) { /* ok */ }
      }
    } else {
      toast(result.message || "Failed to approve payment.", 4000);
    }
  } catch (err) {
    console.error("[adminApproveUpiPayment]", err);
    toast("Server error. Try again.", 4000);
  }
};

// ── Admin: Reject UPI Payment ──
window.adminRejectUpiPayment = async (buildingId, roomNo, paymentId) => {
  if (!confirm("❌ Reject this payment? The tenant will need to resubmit.")) return;

  try {
    const res = await fetch(`${API_BASE}/rooms/${buildingId}/${roomNo}/upi-verify/${paymentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "rejected" }),
    });

    const result = await res.json();

    if (result.success) {
      toast("Payment rejected. Tenant will be notified.", 4000);
      renderPendingUpiPayments();
    } else {
      toast(result.message || "Failed to reject payment.", 4000);
    }
  } catch (err) {
    console.error("[adminRejectUpiPayment]", err);
    toast("Server error. Try again.", 4000);
  }
};

// ── Generate Invoice After Approval ──
window.generateUpiInvoice = (room, payment) => {
  const bName = buildings.find((b) => b.id === room.buildingId)?.name || room.buildingId;
  const now = new Date(payment.paidAt || payment.submittedAt || Date.now());
  const invoiceNo = "INV-" + now.getTime().toString(36).toUpperCase();
  const monthLabel = payment.month || now.toLocaleString("default", { month: "long", year: "numeric" });

  const eu = Math.max(0, (room.elecCurrent || 0) - (room.elecLast || 0)) + Math.max(0, (room.invCurrent || 0) - (room.invLast || 0));
  const eb = eu * (room.elecRate || 13);
  const maintCharge = room.maintCharge || 300;
  const duesAmt = room.otherDues || 0;

  // Determine if this is rent or electricity invoice
  const isRent = payment.type === "rent";
  const invoiceAmount = payment.amount || 0;

  const dateStr = now.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  const dueDateStr = new Date(now.setDate(now.getDate() + 5)).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  const logoUrl = document.querySelector('link[rel="icon"]')?.href || location.origin + '/logo.png';

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoiceNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', -apple-system, sans-serif; }
        body { padding: 40px; background: #f8fafc; color: #1a1a1a; display: flex; justify-content: center; }
        .invoice-box { 
          background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; 
          margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); position: relative; overflow: hidden;
          width: 100%; max-width: 800px;
        }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 100px; font-weight: 900; color: rgba(16, 185, 129, 0.05); text-transform: uppercase; letter-spacing: 15px; pointer-events: none; z-index: 0; }
        .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #c8a24a 0%, #080D1A 100%); }
        .no-print { display: block; text-align: center; margin-top: 24px; margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .no-print button { padding: 14px 40px; background: linear-gradient(to right, #1F3D2B, #2a523a); color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 14px; letter-spacing: 0.5px; transition: transform 0.2s, box-shadow 0.2s; display: inline-flex; align-items: center; gap: 8px;}
        .no-print button:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(31,61,43,0.3); }
        @media print {
          body { padding: 0; background: white; }
          .invoice-box { border: none; box-shadow: none; padding: 20px; max-width: 100%; }
          .no-print { display: none !important; }
        }
      </style>
      <script src="https://kit.fontawesome.com/fd0cfbc1ef.js" crossorigin="anonymous"></script>
    </head>
    <body>
      <div style="width: 100%; max-width: 800px; position: relative;">
        <div class="no-print">
          <button onclick="window.print()">
            <i class="fas fa-print"></i> Download / Print Invoice PDF
          </button>
        </div>
        
        <div class="invoice-box">
          <div class="watermark"><i class="fas fa-check-circle" style="font-size: 80px; margin-right: 20px;"></i> VERIFIED</div>
          <div class="accent-bar"></div>

          <!-- Header -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; padding-top: 10px; position: relative; z-index: 10;">
            <div style="display: flex; gap: 15px; align-items: center;">
              <img src="${logoUrl}" alt="ANVI STAY LOGO" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
              <div>
                <h1 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">ANVI STAY</h1>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Law Gate Road, Near LPU Campus<br>Phagwara, Punjab 144411</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 600;">GSTIN: 03ABCDE1234F1Z5</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 900; color: #e2e8f0; text-transform: uppercase; letter-spacing: 2px;">INVOICE</h2>
              <p style="margin: 0; font-size: 13px; font-weight: bold; color: #334155;"># ${invoiceNo}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Date: ${dateStr}</p>
              <p style="margin: 0; font-size: 13px; color: #f43f5e; font-weight: bold;">Due Date: ${dueDateStr}</p>
            </div>
          </div>

          <!-- Bill To & Property Details -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; position: relative; z-index: 10;">
            <div>
              <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Billed To</h3>
              <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${room.name || "N/A"}</p>
              <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 600;">Room No: <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #0f172a;">${room.roomNo}</span></p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Property</h3>
              <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #b45309;">${bName}</p>
              <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 600;">Billing Cycle: <span style="color: #0f172a;">${monthLabel}</span></p>
            </div>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; position: relative; z-index: 10;">
            <thead>
              <tr>
                <th style="padding: 12px; text-align: left; background: #f8fafc; color: #475569; font-weight: 700; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; border-top-left-radius: 8px;">Description</th>
                <th style="padding: 12px; text-align: right; background: #f8fafc; color: #475569; font-weight: 700; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;">Details</th>
                <th style="padding: 12px; text-align: right; background: #f8fafc; color: #475569; font-weight: 700; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; border-top-right-radius: 8px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${isRent ? `
              <tr>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">Monthly Rent</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">Standard cycle</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold;">₹${(room.rentAmount || 0).toLocaleString("en-IN")}</td>
              </tr>
              ` : `
              <tr>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">
                  Electricity Consumed
                  <div style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 4px;">Main: ${room.elecLast || 0} → ${room.elecCurrent || 0}<br>Inv: ${room.invLast || 0} → ${room.invCurrent || 0}</div>
                </td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b; vertical-align: top;">${eu} units @ ₹${room.elecRate || 13}</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold; vertical-align: top;">₹${eb.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">Maintenance & Service Charge</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">Fixed</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold;">₹${maintCharge.toLocaleString("en-IN")}</td>
              </tr>
              `}
              <tr style="${duesAmt > 0 ? '' : 'display:none;'}">
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">Other Arrears / Dues</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">Previous Balances</td>
                <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold;">₹${duesAmt.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div style="display: flex; justify-content: flex-end; position: relative; z-index: 10;">
            <div style="width: 350px;">
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-weight: bold; color: #334155;">Total Amount</span>
                  <span style="font-size: 24px; font-weight: 900; color: #16a34a;">₹${invoiceAmount.toLocaleString("en-IN")}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 13px; color: #64748b;">Amount Paid</span>
                  <span style="font-size: 14px; font-weight: bold; color: #0f172a;">₹${invoiceAmount.toLocaleString("en-IN")}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #64748b;">Balance Due</span>
                  <span style="font-size: 14px; font-weight: bold; color: #0f172a;">₹0</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Payment Box (Verified) -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-top: 24px; position: relative; z-index: 10;">
            <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #16a34a; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;"><i class="fas fa-shield-check"></i> Payment Verified</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #666;">Method:</span><span style="font-weight: 700; color: #1a1a1a;">UPI Transfer</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #666;">UTR No:</span><span style="font-weight: 700; color: #1a1a1a;">${payment.utrNumber || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #666;">Verified On:</span><span style="font-weight: 700; color: #1a1a1a;">${dateStr}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #666;">Status:</span><span style="display: inline-block; background: #16a34a; color: white; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase;">PAID</span>
              </div>
            </div>
          </div>

          <!-- Footer & Signature -->
          <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #f1f5f9; padding-top: 20px; position: relative; z-index: 10;">
            <div style="font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0; color: #475569; font-weight: bold;">Terms & Conditions</p>
              <p style="margin: 0 0 2px 0;">1. Subject to Phagwara jurisdiction.</p>
              <p style="margin: 0;">2. This is a computer-generated invoice and requires no physical signature.</p>
            </div>
            <div style="text-align: center; margin-right: 20px;">
               <div style="border-bottom: 1px dashed #94a3b8; width: 120px; margin-bottom: 8px; height: 30px; transform: rotate(-5deg);">
                  <!-- Visual placeholder for digital signature -->
                  <span style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #c8a24a; opacity: 0.9;">Anvi Stay</span>
               </div>
               <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open invoice in new tab
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(invoiceHTML);
    win.document.close();
  }
};

// ── Confetti & Premium UX ──
window.triggerConfetti = () => {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 2 + "s";
    confetti.style.backgroundColor = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][Math.floor(Math.random() * 5)];
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
};

window.requestRoomCleaning = () => {
  const lastCleaning = localStorage.getItem("lastCleaningRequest");
  if (lastCleaning) {
    const daysSince = (new Date() - new Date(lastCleaning)) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) {
      toast("🧹 Housekeeping already scheduled. You can request again in " + Math.ceil(7 - daysSince) + " days.", 5000);
      return;
    }
  }
  
  if (!state.tenantLogin) {
    toast("Please login to request housekeeping.", 4000);
    return;
  }
  
  const { bid, rno } = state.tenantLogin;
  const buildingName = buildings.find((b) => b.id === bid)?.name || "ANVI STAY";
  
  const text = encodeURIComponent(`Hello Team,\n\nI need housekeeping services for my room.\n\n🏠 PG: ${buildingName}\n🚪 Room: ${rno}\n\nPlease let me know the scheduled time. Thank you!`);
  window.open(`https://wa.me/919142272776?text=${text}`, "_blank");
  
  localStorage.setItem("lastCleaningRequest", new Date().toISOString());
  toast("✨ Housekeeping request sent via WhatsApp!", 4000);
};

// ---- Landlord Control ----
/* ═══ ADMIN v2 — New Functions ═══ */

// Tab titles for topbar
const adminTabTitles = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  billing: "Billing",
  maintenance: "Maintenance",
  upi: "UPI Queue",
  analytics: "Analytics",
  notices: "Notices",
  guests: "Guest Registry",
  bookings: "Bookings & Waitlist",
  housekeeping: "Housekeeping",
  agreements: "Rental Agreements",
  "owner-reports": "Owner Reports",
};

function updateAdminTopbarDate() {
  const dateEl = byId("admin-topbar-date");
  if (dateEl) {
    const now = new Date();
    const opts = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateEl.textContent = now.toLocaleDateString("en-IN", opts);
  }
}

window.setAdminTab = (tab) => {
  document
    .querySelectorAll(".admin-subview")
    .forEach((v) => v.classList.remove("active"));
  const view = byId(`admin-tab-${tab}`);
  if (view) view.classList.add("active");
  document
    .querySelectorAll(".sidebar-link")
    .forEach((l) => l.classList.remove("active"));
  document
    .querySelector(`.sidebar-link[data-tab="${tab}"]`)
    ?.classList.add("active");
  safeSet("admin-tab-title", "textContent", adminTabTitles[tab] || tab);
  // Sync mobile bottom nav
  document
    .querySelectorAll(".admin-bottom-nav-item")
    .forEach((b) => b.classList.remove("active"));
  const bnavItem = document.querySelector(
    `.admin-bottom-nav-item[data-bnav="${tab}"]`,
  );
  if (bnavItem) bnavItem.classList.add("active");
  // Refresh data for specific tabs
  if (tab === "billing") renderBillingTable();
  if (tab === "maintenance") renderKanbanBoard();
  if (tab === "analytics") {
    typeof renderRevenueChart === "function" && renderRevenueChart();
    typeof renderLeadSources === "function" && renderLeadSources();
  }
  if (tab === "guests") {
    typeof loadGuestRegistry === "function" && loadGuestRegistry();
  }
  if (tab === "upi") {
    typeof renderPendingUpiPayments === "function" &&
      renderPendingUpiPayments();
  }
  // Close mobile sidebar
  byId("admin-sidebar")?.classList.remove("mobile-open");
  byId("admin-mobile-backdrop")?.classList.remove("show");
  // Scroll to top on tab change
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.toggleAdminSidebar = () => {
  const sb = byId("admin-sidebar");
  const icon = byId("sidebar-toggle-icon");
  if (sb) {
    sb.classList.toggle("collapsed");
    if (icon)
      icon.className = sb.classList.contains("collapsed")
        ? "fas fa-chevron-right"
        : "fas fa-chevron-left";
  }
};

window.toggleMobileSidebar = () => {
  byId("admin-sidebar")?.classList.toggle("mobile-open");
  byId("admin-mobile-backdrop")?.classList.toggle("show");
};

window.toggleDrawerSection = (head) => {
  head.closest(".drawer-section")?.classList.toggle("closed");
};

window.closeLModal = () => {
  byId("l-modal")?.classList.remove("open");
  byId("drawer-backdrop")?.classList.remove("open");
};

// Render compact preview tiles on dashboard
window.renderRoomPreview = () => {
  const grid = byId("l-room-grid-preview");
  if (!grid) return;
  grid.innerHTML = "";
  buildings.forEach((b) => {
    const layout = getLayoutForBuilding(b.id);
    layout.forEach((floor) => {
      (
        floor.rooms ||
        Array.from(
          { length: floor.end - floor.start + 1 },
          (_, i) => floor.start + i,
        )
      ).forEach((rNo) => {
        const key = `${b.id}-${rNo}`;
        const t = state.tenants[key];
        const dot = document.createElement("div");
        let bg = "rgba(255, 255, 255, 0.05)"; // vacant
        let tc = "var(--admin-text-dim)"; // vacant text
        if (t?.status === "Occupied") {
          bg =
            t.rentPaid && t.elecPaid
              ? "rgba(52, 211, 153, 0.2)"
              : t.rentPaid
                ? "rgba(251, 191, 36, 0.2)"
                : "rgba(244, 63, 94, 0.2)";
          tc =
            t.rentPaid && t.elecPaid
              ? "#34d399"
              : t.rentPaid
                ? "#fbbf24"
                : "#f43f5e";
        }
        if (t?.status === "Booked") {
          bg = "rgba(96, 165, 250, 0.2)";
          tc = "#60a5fa";
        }
        dot.className =
          "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer hover:scale-110 transition";
        dot.style.background = bg;
        dot.style.color = tc;
        dot.textContent = rNo;
        dot.onclick = () => openLModal(b.id, rNo);
        grid.appendChild(dot);
      });
    });
  });
};

// Billing spreadsheet
window.renderBillingTable = () => {
  const sel = byId("billing-building-select");
  const rows = byId("billing-rows");
  const mobileCards = byId("billing-cards-mobile");
  if (!sel || !rows) return;

  // Populate building select if needed
  if (sel.options.length === 0) {
    buildings.forEach((b) => {
      const o = document.createElement("option");
      o.value = b.id;
      o.textContent = b.name;
      sel.appendChild(o);
    });
  }

  const bid = sel.value || buildings[0]?.id;
  const build = buildings.find((b) => b.id === bid);
  if (!build) return;

  rows.innerHTML = "";
  if (mobileCards) mobileCards.innerHTML = "";
  let hasEntries = false;
  let sumElec = 0,
    sumRent = 0,
    sumTotal = 0,
    sumBalance = 0;

  const monthInput = byId("billing-month");
  if (monthInput && !monthInput.value) {
    const now = new Date();
    monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const layout = getLayoutForBuilding(bid);
  layout.forEach((floor) => {
    (
      floor.rooms ||
      Array.from(
        { length: floor.end - floor.start + 1 },
        (_, i) => floor.start + i,
      )
    ).forEach((rNo) => {
      const key = `${bid}-${rNo}`;
      const t = state.tenants[key] || {};
      const isVacant = t.status !== "Occupied";
      hasEntries = true;

      const eLast = t.elecLast || 0;
      const eCurr = t.elecCurrent || 0;
      const iLast = t.invLast || 0;
      const iCurr = t.invCurrent || 0;
      const rate = t.elecRate || 13;
      const rent = isVacant ? 0 : parseFloat(t.rentAmount || t.rent) || 0;
      const otherDues = parseFloat(t.otherDues) || 0;
      const maintenanceCharge = isVacant
        ? 0
        : t.maintenanceCharge !== undefined && t.maintenanceCharge !== ""
          ? parseFloat(t.maintenanceCharge) || 0
          : 300;
      const amountPaid = parseFloat(t.amountPaid) || 0;
      const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
      const bill = delta * rate;
      const totalDue = bill + rent + otherDues + maintenanceCharge;
      const balance = totalDue - amountPaid;

      // Editable checkboxes for Status
      const rentChecked = t.rentPaid ? "checked" : "";
      const elecChecked = t.elecPaid ? "checked" : "";

      let badgeHtml = "";
      if (isVacant) {
        badgeHtml = `<span class="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 text-slate-500 mb-1 border border-slate-200">VACANT</span>`;
      } else if (balance > 0) {
        badgeHtml = `<span class="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-50 text-rose-600 mb-1 border border-rose-200 balance-badge">OVERDUE</span>`;
      } else {
        badgeHtml = `<span class="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-600 mb-1 border border-emerald-200 balance-badge">CLEARED</span>`;
      }

      const statusHtml = `
        <div class="flex flex-col gap-1 items-start justify-center pl-2 billing-status-overview relative">
          ${badgeHtml}
          <label class="flex items-center gap-1.5 cursor-pointer mt-0.5">
            <input type="checkbox" class="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer billing-rent-paid" ${rentChecked} data-field="rentPaid">
            <span class="text-[9px] font-bold text-slate-600 uppercase">Rent Paid</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" class="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer billing-elec-paid" ${elecChecked} data-field="elecPaid">
            <span class="text-[9px] font-bold text-slate-600 uppercase">Elec Paid</span>
          </label>
        </div>
      `;

      const actionBtn = `<button onclick="sendBillingWA('${bid}', ${rNo}, '${t.name || ""}', ${totalDue}, 'reminder')" class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center transform active:scale-95 shadow-sm border border-amber-100" title="Send Reminder"><i class="fab fa-whatsapp"></i></button>`;

      const tenantDisplay = isVacant
        ? `<span class="text-slate-400 italic">Vacant</span>`
        : t.name || "—";
      const rowOpac = isVacant ? "opacity-75" : "";

      // Desktop table row - Simple and clean styling
      const tr = document.createElement("tr");
      tr.className = `border-b border-slate-100 hover:bg-slate-50 transition-colors ${rowOpac}`;
      tr.dataset.bid = bid;
      tr.dataset.rno = rNo;
      tr.innerHTML = `
            <td class="font-black text-sm text-slate-700 bg-white border-r border-slate-100 text-center">${rNo}</td>
            <td class="text-slate-800 bg-white font-bold border-r border-slate-100 truncate max-w-[120px] px-3" title="${t.name || ""}">${tenantDisplay}</td>
            
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-14 px-1 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none text-center billing-elast focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" value="${eLast}" data-field="elecLast"></td>
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-16 px-1 py-1.5 border border-slate-300 rounded-lg text-xs font-black outline-none text-center billing-ecurr focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-slate-50 transition" value="${eCurr}" data-field="elecCurrent"></td>
            
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-14 px-1 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none text-center billing-ilast focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" value="${iLast}" data-field="invLast"></td>
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-16 px-1 py-1.5 border border-slate-300 rounded-lg text-xs font-black outline-none text-center billing-icurr focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-slate-50 transition" value="${iCurr}" data-field="invCurrent"></td>
            
            <td class="delta-cell font-black text-center text-indigo-600 bg-white border-r border-slate-100">${delta}</td>
            
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-12 px-1 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none text-center billing-rate focus:border-blue-400 transition" value="${rate}" data-field="elecRate"></td>
            
            <td class="bill-cell font-black text-amber-600 bg-white border-r border-slate-100">₹${bill.toLocaleString("en-IN")}</td>
            
            <td class="text-slate-600 font-bold bg-white border-r border-slate-100">₹${rent.toLocaleString("en-IN")}</td>
            
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none text-center billing-maintenance focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" value="${maintenanceCharge}" oninput="calcBillingRow(this)" placeholder="0"></td>
            
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none text-center billing-other-dues focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" value="${otherDues || ""}" oninput="calcBillingRow(this)" placeholder="0"></td>
            
            <td class="delta-cell total-due-cell font-black text-emerald-600 bg-white border-r border-slate-100">₹${totalDue.toLocaleString("en-IN")}</td>
            
            <td class="bg-white border-r border-slate-100"><input type="number" class="w-20 px-2 py-1.5 border border-emerald-300 rounded-lg text-xs font-black outline-none text-center billing-amount-paid focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-emerald-50 text-emerald-800 transition" value="${amountPaid || ""}" oninput="calcBillingRow(this)" placeholder="0"></td>
            
            <td class="delta-cell balance-cell font-black text-rose-600 bg-white border-r border-slate-100">₹${balance.toLocaleString("en-IN")}</td>
            
            <td class="bg-white border-r border-slate-100">${statusHtml}</td>
            <td class="bg-white">
              <div class="flex items-center gap-1.5 justify-center py-2 px-1">
                ${actionBtn}
                <button onclick="generateSingleElecBill('${bid}', ${rNo})" class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center transform active:scale-95 shadow-sm border border-blue-100" title="Generate Elec Bill">
                  <i class="fas fa-file-pdf"></i>
                </button>
              </div>
            </td>
          `;

      // Add live recalculation on meter input changes
      tr.querySelectorAll('input[type="number"][data-field]').forEach((inp) => {
        inp.addEventListener("input", () => recalcBillingRowLive(tr));
      });
      rows.appendChild(tr);
      // Track totals
      sumElec += bill;
      sumRent += rent;
      sumTotal += totalDue;
      sumBalance += balance;

      // Mobile card view — Enhanced responsive design
      if (mobileCards) {
        const card = document.createElement("div");
        card.className = `bg-slate-50 rounded-xl border border-slate-100 p-3${isVacant ? " vacant-card" : ""}`;
        card.dataset.bid = bid;
        card.dataset.rno = rNo;
        card.innerHTML = `
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-3">
                  <span class="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black shadow-sm" style="background:${isVacant ? "#f1f5f9" : "var(--admin-accent)"};color:${isVacant ? "#94a3b8" : "var(--navy)"};">${rNo}</span>
                  <div>
                    <p class="text-sm font-black text-slate-800">${isVacant ? '<span class="italic text-slate-400">Vacant</span>' : (t.name || "—")}</p>
                    <p class="text-[10px] font-bold text-slate-400">${isVacant ? "No tenant assigned" : `Rent: ₹${rent.toLocaleString("en-IN")}`}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xl font-black mobile-bill-total" style="color:${balance > 0 ? '#f43f5e' : 'var(--gold)'};">₹${totalDue.toLocaleString("en-IN")}</p>
                  ${badgeHtml}
                </div>
              </div>

              <!-- Meter Readings Grid -->
              <div class="mobile-card-grid">
                <div class="mobile-card-stat">
                  <p class="stat-label">⚡ Main Meter</p>
                  <p class="stat-value">${eLast} → <span style="color:#e5b84c">${eCurr}</span></p>
                </div>
                <div class="mobile-card-stat">
                  <p class="stat-label">🔌 Inverter</p>
                  <p class="stat-value">${iLast} → <span style="color:#e5b84c">${iCurr}</span></p>
                </div>
              </div>

              <!-- Billing Breakdown -->
              <div class="mobile-card-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                <div class="mobile-card-stat">
                  <p class="stat-label">Elec Bill</p>
                  <p class="stat-value" style="color:#f59e0b;">₹${bill.toLocaleString("en-IN")}</p>
                </div>
                <div class="mobile-card-stat">
                  <p class="stat-label">Maint.</p>
                  <p class="stat-value" style="color:#8b5cf6;">₹${maintenanceCharge.toLocaleString("en-IN")}</p>
                </div>
                <div class="mobile-card-stat">
                  <p class="stat-label">Δ Units</p>
                  <p class="stat-value delta-txt" style="color:#0891b2;">${delta}</p>
                </div>
              </div>

              <!-- Editable Fields -->
              <div class="mobile-card-section">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-[9px] font-bold text-slate-400 uppercase">Other Dues ₹</p>
                  <input type="number" class="w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none text-right billing-other-dues-m" value="${otherDues || ""}" oninput="calcBillingCardMobile(this)" data-bid="${bid}" data-rno="${rNo}" placeholder="0">
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-[9px] font-bold text-emerald-600 uppercase">Paid Now ₹</p>
                  <input type="number" class="w-24 px-2 py-1.5 border border-emerald-200 rounded-lg text-xs font-bold outline-none text-right billing-amount-paid-m bg-emerald-50 text-emerald-700" value="${amountPaid || ""}" oninput="calcBillingCardMobile(this)" data-bid="${bid}" data-rno="${rNo}" placeholder="0">
                </div>
              </div>

              <!-- Balance Summary -->
              <div class="flex items-center justify-between mt-2 px-1">
                <span class="text-[10px] font-bold text-slate-400">Δ ${delta} units @ ₹${rate}/unit</span>
                <span class="text-sm font-black mobile-balance-total ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}">Bal: ₹${balance.toLocaleString("en-IN")}</span>
              </div>

              <!-- Status Checkboxes -->
              ${!isVacant ? `
              <div class="mobile-status-bar">
                <label>
                  <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer billing-rent-paid-m" ${rentChecked} data-bid="${bid}" data-rno="${rNo}">
                  <span>Rent Paid</span>
                </label>
                <label>
                  <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer billing-elec-paid-m" ${elecChecked} data-bid="${bid}" data-rno="${rNo}">
                  <span>Elec Paid</span>
                </label>
              </div>
              ` : ""}

              <!-- Action Buttons -->
              ${!isVacant ? `
              <div class="mobile-action-bar">
                <button onclick="sendBillingWA('${bid}', ${rNo}, '${(t.name || "").replace(/'/g, "\\'")}', ${totalDue}, 'reminder')" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">
                  <i class="fab fa-whatsapp"></i> Remind
                </button>
                <button onclick="generateSingleElecBill('${bid}', ${rNo})" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;">
                  <i class="fas fa-file-pdf"></i> Invoice
                </button>
              </div>
              ` : ""}
            `;
        mobileCards.appendChild(card);
      }
    });
  });

  const tfoot = byId("billing-footer");
  if (tfoot) {
    if (hasEntries) {
      tfoot.innerHTML = `
        <tr>
          <td colspan="8" class="text-right py-3 pr-4 text-slate-400 uppercase tracking-wider">Spreadsheet Totals</td>
          <td class="py-3 text-amber-700">₹${sumElec.toLocaleString("en-IN")}</td>
          <td class="py-3 text-slate-700">₹${sumRent.toLocaleString("en-IN")}</td>
          <td class="py-3"></td>
          <td class="py-3 text-emerald-700">₹${sumTotal.toLocaleString("en-IN")}</td>
          <td colspan="1"></td>
          <td class="py-3 text-rose-700">₹${sumBalance.toLocaleString("en-IN")}</td>
          <td colspan="2"></td>
        </tr>
      `;
    } else {
      tfoot.innerHTML = "";
    }
  }

  // Update Summary Cards
  const selElec = byId("bs-elec-total");
  const selRent = byId("bs-rent-total");
  const selTot = byId("bs-total-due");
  const selBal = byId("bs-balance");
  if (selElec) selElec.textContent = `₹${sumElec.toLocaleString("en-IN")}`;
  if (selRent) selRent.textContent = `₹${sumRent.toLocaleString("en-IN")}`;
  if (selTot) selTot.textContent = `₹${sumTotal.toLocaleString("en-IN")}`;
  if (selBal) selBal.textContent = `₹${sumBalance.toLocaleString("en-IN")}`;

  if (!hasEntries && mobileCards) {
    mobileCards.innerHTML =
      '<p class="text-center text-slate-400 text-xs py-8">No occupied rooms for billing</p>';
  }

  // Feature: Excel-like Keyboard Navigation
  const tableInputs = Array.from(rows.querySelectorAll('input') || []);
  tableInputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
      let jump = 0;
      if (e.key === 'ArrowRight' || e.key === 'Enter') jump = 1;
      else if (e.key === 'ArrowLeft') jump = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const nameClass = Array.from(input.classList).find(c => c.startsWith('billing-'));
        if (nameClass) {
          const colInputs = Array.from(document.querySelectorAll(`.${nameClass}`));
          const myIdx = colInputs.indexOf(input);
          if (e.key === 'ArrowDown' && myIdx >= 0 && myIdx + 1 < colInputs.length) {
            e.preventDefault();
            colInputs[myIdx + 1].focus();
            colInputs[myIdx + 1].select();
          } else if (e.key === 'ArrowUp' && myIdx > 0) {
            e.preventDefault();
            colInputs[myIdx - 1].focus();
            colInputs[myIdx - 1].select();
          }
        }
        return;
      }

      if (jump !== 0) {
        e.preventDefault();
        const nextInput = tableInputs[index + jump];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    });
  });

  window.filterBillingSpreadsheet(); // Re-apply existing filters
};

window.sendBillingWA = (bid, rNo, name, amount, type) => {
  const monthInput = byId("billing-month")?.value;
  let monthStr = "";
  if (monthInput) {
    const d = new Date(monthInput);
    monthStr = d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  } else {
    monthStr = "the current billing cycle";
  }

  const pgName = buildings.find((b) => b.id === bid)?.name || "ANVI STAY";

  let text = "";
  if (type === "reminder") {
    text = `Hello ${name || "Tenant"},\n\nThis is a gentle reminder from ${pgName} (Company Contact: +91 9142272776).\nYour bill for Room No. ${rNo} for ${monthStr} has been generated.\n\nTotal Due: ₹${amount.toLocaleString("en-IN")}\n\nPlease find the detailed PDF invoice shared by your admin separately.\nKindly clear your dues at your earliest convenience.\n\nThank you!`;
    // Attempt to generate the single elec bill when reminder is triggered
    try {
      window.generateSingleElecBill(bid, rNo);
    } catch (e) {
      console.warn("Failed to auto-generate single elec bill UI", e);
    }
  } else {
    text = `Hello ${name || "Tenant"},\n\nThank you! We have received your payment of ₹${amount.toLocaleString("en-IN")} for Room ${rNo} for ${monthStr} at ${pgName}.\n\nRegards,\nANVI STAY`;
  }

  const t = state.tenants[`${bid}-${rNo}`] || {};
  const phone = t.phone || "9142272776";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const finalPhone =
    cleanPhone.startsWith("91") || cleanPhone.length > 10
      ? cleanPhone
      : "91" + cleanPhone;

  // The admin can message 9142272776 if they really want, but let's default to tenant phone
  const targetPhone =
    finalPhone && finalPhone.length >= 10 ? finalPhone : "919142272776";

  const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

window.sendAllWhatsAppReminders = () => {
  const bid = byId("billing-building-select")?.value;
  if (!bid) return;

  const pendingRows = [];
  const layout = getLayoutForBuilding(bid);
  layout.forEach((floor) => {
    (
      floor.rooms ||
      Array.from(
        { length: floor.end - floor.start + 1 },
        (_, i) => floor.start + i,
      )
    ).forEach((rNo) => {
      const t = state.tenants[`${bid}-${rNo}`];
      if (t && t.status === "Occupied" && (!t.elecPaid || !t.rentPaid)) {
        pendingRows.push({ bid, rNo, ...t });
      }
    });
  });

  if (pendingRows.length === 0) {
    toast("No pending dues found for this building.");
    return;
  }

  if (
    confirm(
      `Found ${pendingRows.length} tenants with pending dues. Do you want to open WhatsApp for the very first pending tenant? (You can click remind on individual rows for the others)`,
    )
  ) {
    const t = pendingRows[0];
    const eLast = t.elecLast || 0;
    const eCurr = t.elecCurrent || 0;
    const iLast = t.invLast || 0;
    const iCurr = t.invCurrent || 0;
    const rate = t.elecRate || 13;
    const rent = parseFloat(t.rent) || 0;
    const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
    const totalDue = delta * rate + rent;
    window.sendBillingWA(t.bid, t.rNo, t.name, totalDue, "reminder");
  }
};

// Mobile billing card recalculation
window.calcBillingCardMobile = (input) => {
  const card = input.closest("[data-bid]");
  const bid = card.dataset.bid;
  const rno = parseInt(card.dataset.rno);
  const t = state.tenants[`${bid}-${rno}`] || {};
  const otherDues =
    parseFloat(card.querySelector(".billing-other-dues-m")?.value) || 0;
  const amountPaid =
    parseFloat(card.querySelector(".billing-amount-paid-m")?.value) || 0;

  const eLast = t.elecLast || 0;
  const eCurr = t.elecCurrent || 0;
  const iLast = t.invLast || 0;
  const iCurr = t.invCurrent || 0;
  const rate = t.elecRate || 13;
  const rent = parseFloat(t.rentAmount || t.rent) || 0;
  const maintenanceCharge = t.maintenanceCharge !== undefined && t.maintenanceCharge !== ""
    ? parseFloat(t.maintenanceCharge) || 0
    : 300;
  const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
  const bill = delta * rate;
  const totalDue = bill + rent + otherDues + maintenanceCharge;
  const balance = totalDue - amountPaid;
  const totalEl = card.querySelector(".mobile-bill-total");
  const balanceEl = card.querySelector(".mobile-balance-total");
  const deltaTxt = card.querySelector(".delta-txt");
  if (deltaTxt) deltaTxt.textContent = `${delta}`;
  if (totalEl) {
    totalEl.textContent = `₹${totalDue.toLocaleString("en-IN")}`;
    totalEl.style.color = balance > 0 ? "#f43f5e" : "var(--gold)";
  }
  if (balanceEl) {
    balanceEl.textContent = `Bal: ₹${balance.toLocaleString("en-IN")}`;
    balanceEl.className = `text-sm font-black mobile-balance-total ${balance > 0 ? "text-rose-500" : "text-emerald-500"}`;
  }
};

window.recalcBillingRowLive = (tr) => {
  const eLast = parseFloat(tr.querySelector(".billing-elast")?.value) || 0;
  const eCurr = parseFloat(tr.querySelector(".billing-ecurr")?.value) || 0;
  const iLast = parseFloat(tr.querySelector(".billing-ilast")?.value) || 0;
  const iCurr = parseFloat(tr.querySelector(".billing-icurr")?.value) || 0;
  const rate = parseFloat(tr.querySelector(".billing-rate")?.value) || 13;
  const maintenanceCharge =
    parseFloat(tr.querySelector(".billing-maintenance")?.value) || 0;
  const otherDues =
    parseFloat(tr.querySelector(".billing-other-dues")?.value) || 0;
  const amountPaid =
    parseFloat(tr.querySelector(".billing-amount-paid")?.value) || 0;

  const bid = tr.dataset.bid;
  const rno = parseInt(tr.dataset.rno);
  const t = state.tenants[`${bid}-${rno}`] || {};

  // if tenant is vacant, we ignore rent
  const isVacant = t.status !== "Occupied";
  const rent = isVacant ? 0 : parseFloat(t.rentAmount || t.rent) || 0;

  const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
  const bill = delta * rate;
  const totalDue = bill + rent + maintenanceCharge + otherDues;
  const balance = totalDue - amountPaid;

  const deltaCell = tr.querySelector(".delta-cell");
  const billCell = tr.querySelector(".bill-cell");
  const totalCell = tr.querySelector(".total-due-cell");
  const balanceCell = tr.querySelector(".balance-cell");
  const badgeCell = tr.querySelector(".balance-badge");

  if (deltaCell) deltaCell.textContent = delta;
  if (billCell) billCell.textContent = `₹${bill.toLocaleString("en-IN")}`;
  if (totalCell) totalCell.textContent = `₹${totalDue.toLocaleString("en-IN")}`;

  if (balanceCell) {
    balanceCell.textContent = `₹${balance.toLocaleString("en-IN")}`;
    if (balance > 0) {
      balanceCell.classList.add("text-rose-600", "bg-rose-50");
      balanceCell.classList.remove("text-slate-600", "bg-white");
    } else {
      balanceCell.classList.remove("text-rose-600", "bg-rose-50");
      balanceCell.classList.add("text-slate-600", "bg-white");
    }
  }

  if (badgeCell && !isVacant) {
    if (balance > 0) {
      badgeCell.textContent = "OVERDUE";
      badgeCell.className =
        "px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-50 text-rose-600 mb-1 border border-rose-200 balance-badge";
    } else {
      badgeCell.textContent = "CLEARED";
      badgeCell.className =
        "px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-50 text-emerald-600 mb-1 border border-emerald-200 balance-badge";
    }
  }

  // Feature: Smart Meter Validation (Current < Previous triggers red warning border)
  const eCurrInput = tr.querySelector(".billing-ecurr");
  if (eCurrInput) {
    if (eCurr < eLast) {
      eCurrInput.classList.add("border-rose-500", "bg-rose-50", "text-rose-600");
    } else {
      eCurrInput.classList.remove("border-rose-500", "bg-rose-50", "text-rose-600");
    }
  }

  const iCurrInput = tr.querySelector(".billing-icurr");
  if (iCurrInput) {
    if (iCurr < iLast) {
      iCurrInput.classList.add("border-rose-500", "bg-rose-50", "text-rose-600");
    } else {
      iCurrInput.classList.remove("border-rose-500", "bg-rose-50", "text-rose-600");
    }
  }
};

window.calcBillingRow = (input) => {
  const tr = input.closest("tr");
  window.recalcBillingRowLive(tr);
};

window.saveBillingSpreadsheet = async () => {
  const rows = byId("billing-rows")?.querySelectorAll("tr") || [];
  let updateCount = 0;

  const promises = [];
  const token = localStorage.getItem("adminToken");

  for (const tr of rows) {
    const bid = tr.dataset.bid;
    const rno = parseInt(tr.dataset.rno);
    const key = `${bid}-${rno}`;
    const t = state.tenants[key];
    if (!t) continue;

    const eLast = parseFloat(tr.querySelector(".billing-elast")?.value) || 0;
    const eCurr = parseFloat(tr.querySelector(".billing-ecurr")?.value) || 0;
    const iLast = parseFloat(tr.querySelector(".billing-ilast")?.value) || 0;
    const iCurr = parseFloat(tr.querySelector(".billing-icurr")?.value) || 0;
    const rate = parseFloat(tr.querySelector(".billing-rate")?.value) || 13;
    const maintenanceCharge =
      parseFloat(tr.querySelector(".billing-maintenance")?.value) || 0;
    const otherDues =
      parseFloat(tr.querySelector(".billing-other-dues")?.value) || 0;
    const amountPaid =
      parseFloat(tr.querySelector(".billing-amount-paid")?.value) || 0;

    const rentPaidCb = tr.querySelector(".billing-rent-paid");
    if (rentPaidCb) t.rentPaid = rentPaidCb.checked;

    const elecPaidCb = tr.querySelector(".billing-elec-paid");
    if (elecPaidCb) t.elecPaid = elecPaidCb.checked;

    t.elecLast = eLast;
    t.elecCurrent = eCurr;
    t.invLast = iLast;
    t.invCurrent = iCurr;
    t.elecRate = rate;
    t.maintenanceCharge = maintenanceCharge;
    t.otherDues = otherDues;
    t.amountPaid = amountPaid;

    state.tenants[key] = t;
    updateCount++;

    // Send to backend
    promises.push(
      fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(t),
      }).catch((e) => console.error(e)),
    );
  }

  saveState();
  window.triggerAutoSaveIndicator(true);
  await Promise.all(promises);
  window.triggerAutoSaveIndicator(false);
  renderBillingTable();
};

window.generateAllElecBills = () => {
  const bid = byId("billing-building-select")?.value || buildings[0]?.id;
  if (!bid) return;
  const pgName = buildings.find((b) => b.id === bid)?.name || bid;

  const rows = byId("billing-rows")?.querySelectorAll("tr") || [];
  let billsHtml = "";

  rows.forEach((tr) => {
    const rno = tr.dataset.rno;
    const tname = tr.children[1].textContent;
    const eLast = tr.querySelector(".billing-elast")?.value || 0;
    const eCurr = tr.querySelector(".billing-ecurr")?.value || 0;
    const iLast = tr.querySelector(".billing-ilast")?.value || 0;
    const iCurr = tr.querySelector(".billing-icurr")?.value || 0;
    const delta = tr.querySelector(".delta-cell")?.textContent || 0;
    const rate = tr.querySelector(".billing-rate")?.value || 0;
    const billText = tr.querySelector(".bill-cell")?.textContent || "₹0";

    // New breakdown fields
    const rentText = tr.children[9].textContent || "₹0";
    const maintAmt = tr.querySelector(".billing-maintenance")?.value || 0;
    const duesAmt = tr.querySelector(".billing-other-dues")?.value || 0;
    const totalDueText =
      tr.querySelector(".total-due-cell")?.textContent || "₹0";

    if (
      parseFloat(delta) > 0 ||
      parseFloat(rentText.replace(/[^0-9.]/g, "")) > 0 ||
      parseFloat(maintAmt) > 0 ||
      parseFloat(duesAmt) > 0
    ) {
      billsHtml += buildInvoiceHTML({
        rno, tname, eLast, eCurr, iLast, iCurr, delta, rate, billText,
        rentText, maintAmt, duesAmt, totalDueText, pgName
      });
    }
  });

  if (!billsHtml) {
    toast("No rooms with any billable amounts found.");
    return;
  }

  const printWin = window.open("", "_blank");
  printWin.document.write(`
    <html>
      <head>
        <title>ANVI STAY - Monthly Invoices - ${pgName}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #334155; background: #f8fafc; }
          @media print { 
            body { padding: 0; background: white; } 
            .no-print { display: none !important; } 
            .invoice-box { border: none !important; box-shadow: none !important; page-break-after: always; margin-bottom: 0 !important; border-radius: 0 !important;}
            .invoice-box:last-child { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 20px;" class="no-print">
          <button onclick="window.print()" style="padding: 12px 24px; background: #080D1A; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">🖨️ Print All Invoices</button>
        </div>
        ${billsHtml}
      </body>
    </html>
  `);
  printWin.document.close();
};

window.generateSingleElecBill = (bid, rno) => {
  const tr = byId("billing-rows")?.querySelector(
    `tr[data-bid="${bid}"][data-rno="${rno}"]`,
  );
  if (!tr) return;

  const pgName = buildings.find((b) => b.id === bid)?.name || bid;
  const tname = tr.children[1].textContent;
  const eLast = tr.querySelector(".billing-elast")?.value || 0;
  const eCurr = tr.querySelector(".billing-ecurr")?.value || 0;
  const iLast = tr.querySelector(".billing-ilast")?.value || 0;
  const iCurr = tr.querySelector(".billing-icurr")?.value || 0;
  const delta = tr.querySelector(".delta-cell")?.textContent || 0;
  const rate = tr.querySelector(".billing-rate")?.value || 0;
  const billText = tr.querySelector(".bill-cell")?.textContent || "₹0";

  const rentText = tr.children[9].textContent || "₹0";
  const maintAmt = tr.querySelector(".billing-maintenance")?.value || 0;
  const duesAmt = tr.querySelector(".billing-other-dues")?.value || 0;
  const totalDueText = tr.querySelector(".total-due-cell")?.textContent || "₹0";

  const billsHtml = buildInvoiceHTML({
    rno, tname, eLast, eCurr, iLast, iCurr, delta, rate, billText,
    rentText, maintAmt, duesAmt, totalDueText, pgName
  });

  const printWin = window.open("", "_blank");
  printWin.document.write(`
    <html>
      <head>
        <title>ANVI STAY - Monthly Invoice - Room ${rno}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #334155; background: #f8fafc; }
          @media print { 
            body { padding: 0; background: white; } 
            .no-print { display: none !important; } 
            .invoice-box { border: none !important; box-shadow: none !important; page-break-after: always; margin-bottom: 0 !important; border-radius: 0 !important;}
            .invoice-box:last-child { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 20px;" class="no-print">
          <button onclick="window.print()" style="padding: 12px 24px; background: #080D1A; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">🖨️ Print Invoice</button>
        </div>
        ${billsHtml}
      </body>
    </html>
  `);
  printWin.document.close();
};

window.saveOtherDues = async () => {
  const rows = byId("billing-rows")?.querySelectorAll("tr") || [];
  for (const tr of rows) {
    const bid = tr.dataset.bid;
    const rno = parseInt(tr.dataset.rno);
    const key = `${bid}-${rno}`;
    const t = state.tenants[key];
    if (!t) continue;
    const otherDues = parseFloat(
      tr.querySelector(".billing-other-dues")?.value,
    );
    const amountPaid = parseFloat(
      tr.querySelector(".billing-amount-paid")?.value,
    );
    if (!isNaN(otherDues)) t.otherDues = otherDues;
    if (!isNaN(amountPaid)) t.amountPaid = amountPaid;
    state.tenants[key] = t;
  }

  const cards =
    byId("billing-cards-mobile")?.querySelectorAll("[data-bid]") ||
    [];
  for (const card of cards) {
    const bid = card.dataset.bid;
    const rno = parseInt(card.dataset.rno);
    const key = `${bid}-${rno}`;
    const t = state.tenants[key];
    if (!t) continue;
    const otherDuesM = parseFloat(
      card.querySelector(".billing-other-dues-m")?.value,
    );
    const amountPaidM = parseFloat(
      card.querySelector(".billing-amount-paid-m")?.value,
    );
    if (!isNaN(otherDuesM)) t.otherDues = otherDuesM;
    if (!isNaN(amountPaidM)) t.amountPaid = amountPaidM;

    // Save checkbox states from mobile cards
    const rentPaidM = card.querySelector(".billing-rent-paid-m");
    if (rentPaidM) t.rentPaid = rentPaidM.checked;
    const elecPaidM = card.querySelector(".billing-elec-paid-m");
    if (elecPaidM) t.elecPaid = elecPaidM.checked;

    state.tenants[key] = t;
  }
  saveState();
  window.triggerAutoSaveIndicator(false);
};

// Invoice Generator Helper
function buildInvoiceHTML(data) {
  const { rno, tname, eLast, eCurr, iLast, iCurr, delta, rate, billText, rentText, maintAmt, duesAmt, totalDueText, pgName } = data;
  const monthStr = byId("billing-month")?.value || new Date().toISOString().slice(0, 7);
  const invNumber = `INV-${monthStr.replace('-', '')}-${rno}`;
  const dObj = new Date();
  const dateStr = dObj.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  const dueDateStr = new Date(dObj.setDate(dObj.getDate() + 5)).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

  // Get current logo URL from the document (or fallback)
  const logoUrl = document.querySelector('link[rel="icon"]')?.href || location.origin + '/logo.png';

  return `
    <div class="invoice-box" style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; margin-bottom: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); position: relative; overflow: hidden;">
      
      <!-- Top Accent Bar -->
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #c8a24a 0%, #080D1A 100%);"></div>

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; padding-top: 10px;">
        <div style="display: flex; gap: 15px; align-items: center;">
          <img src="${logoUrl}" alt="ANVI STAY LOGO" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;">
          <div>
            <h1 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">ANVI STAY</h1>
            <p style="margin: 0; font-size: 13px; color: #64748b;">Law Gate Road, Near LPU Campus<br>Phagwara, Punjab 144411</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 600;">GSTIN: 03ABCDE1234F1Z5</p>
          </div>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 900; color: #e2e8f0; text-transform: uppercase; letter-spacing: 2px;">INVOICE</h2>
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #334155;"># ${invNumber}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Date: ${dateStr}</p>
          <p style="margin: 0; font-size: 13px; color: #f43f5e; font-weight: bold;">Due Date: ${dueDateStr}</p>
        </div>
      </div>

      <!-- Bill To & Property Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Billed To</h3>
          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${tname}</p>
          <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 600;">Room No: <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #0f172a;">${rno}</span></p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Property</h3>
          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #b45309;">${pgName}</p>
          <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 600;">Billing Cycle: <span style="color: #0f172a;">${monthStr}</span></p>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
        <thead>
          <tr>
            <th style="padding: 12px; text-align: left; background: #f8fafc; color: #475569; font-weight: 700; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; border-top-left-radius: 8px;">Description</th>
            <th style="padding: 12px; text-align: right; background: #f8fafc; color: #475569; font-weight: 700; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;">Details</th>
            <th style="padding: 12px; text-align: right; background: #f8fafc; color: #475569; font-weight: 700; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; border-top-right-radius: 8px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">Monthly Rent</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">Standard cycle</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold;">${rentText}</td>
          </tr>
          <tr>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">
              Electricity Consumed
              <div style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 4px;">Main: ${eLast} → ${eCurr}<br>Inv: ${iLast} → ${iCurr}</div>
            </td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b; vertical-align: top;">${delta} units @ ₹${rate}</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold; vertical-align: top;">${billText}</td>
          </tr>
          <tr>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">Maintenance & Service Charge</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">Fixed</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold;">₹${parseFloat(maintAmt).toLocaleString("en-IN")}</td>
          </tr>
          <tr style="${parseFloat(duesAmt) > 0 ? '' : 'display:none;'}">
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">Other Arrears / Dues</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">Previous Balances</td>
            <td style="padding: 16px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: bold;">₹${parseFloat(duesAmt).toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals & Payment -->
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 350px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 12px;">
              <span style="font-weight: bold; color: #334155;">Total Amount Payable</span>
              <span style="font-size: 24px; font-weight: 900; color: #16a34a;">${totalDueText}</span>
            </div>
            <p style="margin: 0; font-size: 11px; color: #64748b; text-align: center;">Please pay before ${dueDateStr} to avoid late fees.</p>
          </div>
        </div>
      </div>

      <!-- Footer & Signature -->
      <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #f1f5f9; padding-top: 20px;">
        <div style="font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px 0; color: #475569; font-weight: bold;">Terms & Conditions</p>
          <p style="margin: 0 0 2px 0;">1. Subject to Phagwara jurisdiction.</p>
          <p style="margin: 0;">2. This is a computer-generated invoice and requires no physical signature.</p>
        </div>
        <div style="text-align: center; margin-right: 20px;">
           <div style="border-bottom: 1px dashed #94a3b8; width: 120px; margin-bottom: 8px; height: 30px;">
              <!-- Visual placeholder for digital signature -->
              <span style="font-family: 'Brush Script MT', cursive; font-size: 20px; color: #c8a24a; opacity: 0.8;">Anvi Stay</span>
           </div>
           <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0f172a;">Authorized Signatory</p>
        </div>
      </div>
    </div>
  `;
}

// Global Search and Smart Billing Filter
window.currentBillingFilter = 'all';
window.setBillingFilter = (filterType, btn) => {
  window.currentBillingFilter = filterType;
  // Update button classes
  document.querySelectorAll('#billing-quick-filters .bf-btn').forEach(b => {
    b.classList.remove('bg-[#C8A24A]', 'text-white');
    b.classList.add('bg-slate-100', 'text-slate-600');
  });
  if (btn) {
    btn.classList.add('bg-[#C8A24A]', 'text-white');
    btn.classList.remove('bg-slate-100', 'text-slate-600');
  }
  window.filterBillingSpreadsheet();
};

window.filterBillingSpreadsheet = () => {
  const searchTerm = (byId("billing-search")?.value || "").toLowerCase();
  const rows = byId("billing-rows")?.querySelectorAll("tr") || [];
  const filterType = window.currentBillingFilter || 'all';

  rows.forEach((tr) => {
    const roomText = (tr.children[0]?.textContent || "").toLowerCase();
    const tenantText = (tr.children[1]?.textContent || "").toLowerCase();
    const isVacant = tr.classList.contains("opacity-75");
    const balanceText = tr.querySelector(".balance-cell")?.textContent || "0";
    const balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, "")) || 0;

    let show = (roomText.includes(searchTerm) || tenantText.includes(searchTerm));

    // Apply Smart Filters
    if (show) {
      if (filterType === 'unpaid' && balance <= 0) show = false;
      if (filterType === 'vacant' && !isVacant) show = false;
    }

    tr.style.display = show ? "" : "none";
  });
};

// Feature: Google Sheets Auto-Save Indicator
window.triggerAutoSaveIndicator = (isSaving) => {
  const indicator = document.getElementById("billing-auto-save-indicator");
  if (!indicator) return;
  if (isSaving) {
    indicator.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-500 tracking-wider"></i> <span class="text-amber-600">Saving...</span>`;
    indicator.classList.remove('opacity-0');
  } else {
    indicator.innerHTML = `<i class="fas fa-check-circle text-emerald-500 tracking-wider"></i> <span class="text-emerald-600">All changes saved</span>`;
    indicator.classList.remove('opacity-0');
    setTimeout(() => { indicator.classList.add('opacity-0'); }, 2500);
  }
};
window.rolloverMonth = async () => {
  if (
    !confirm(
      "Are you sure you want to rollover the billing cycle? This will transfer 'Balance' to 'Other Dues' and reset ALL meter readings for the new month. This action updates ALL rooms.",
    )
  ) {
    return;
  }

  let updateCount = 0;
  // Apply rollover to in-memory state
  Object.entries(state.tenants).forEach(([key, t]) => {
    if (t.status === "Occupied") {
      const eLast = t.elecLast || 0;
      const eCurr = t.elecCurrent || 0;
      const iLast = t.invLast || 0;
      const iCurr = t.invCurrent || 0;
      const rate = t.elecRate || 13;
      const rent = parseFloat(t.rentAmount || t.rent) || 0;
      const maintenanceCharge = parseFloat(t.maintenanceCharge) || 0;
      const otherDues = parseFloat(t.otherDues) || 0;
      const amountPaid = parseFloat(t.amountPaid) || 0;

      const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
      const bill = delta * rate;
      const totalDue = bill + rent + maintenanceCharge + otherDues;
      const balance = totalDue - amountPaid;

      // Rollover logic
      t.otherDues = balance > 0 ? balance : 0;
      t.amountPaid = 0;

      t.elecLast = eCurr > 0 ? eCurr : eLast;
      t.elecCurrent = 0;
      t.invLast = iCurr > 0 ? iCurr : iLast;
      t.invCurrent = 0;

      t.rentPaid = balance <= 0 && totalDue > 0;
      t.elecPaid = balance <= 0 && totalDue > 0;

      // Record partial/full payment logically
      if (amountPaid > 0) {
        const monthLabel = new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!t.paymentHistory) t.paymentHistory = [];
        t.paymentHistory.push({
          type: "rent",
          amount: amountPaid,
          paidAt: new Date().toISOString(),
          month: monthLabel,
          utrNumber: "Rollover",
        });
      }

      state.tenants[key] = t;
      updateCount++;
    }
  });

  saveState();

  // Advance the UI Month Input
  const monthInput = byId("billing-month");
  if (monthInput && monthInput.value) {
    let [year, month] = monthInput.value.split("-").map(Number);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    monthInput.value = `${year}-${String(month).padStart(2, "0")}`;
  }

  renderBillingTable();

  toast("Rolled over spaces locally. Syncing to Server...");

  try {
    const promises = Object.entries(state.tenants).map(([key, t]) => {
      if (t.status === "Occupied") {
        const [bid, rno] = key.split("-");
        return fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(t),
        });
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
    toast(`✓ successfully synced ${updateCount} rooms. Next cycle started.`);
  } catch (err) {
    console.error("Rollover Bulk Save Error:", err);
    toast("⚠️ Rollover processed, but failed to sync online.");
  }
};

// Kanban Board
window.renderKanbanBoard = () => {
  const todo = [];
  const progress = [];
  const done = [];
  const filterBid = byId("kanban-building-filter")?.value || "all";

  // Collect all tickets from all tenants
  Object.entries(state.tenants).forEach(([key, t]) => {
    const [bid, rno] = key.split("-");
    if (filterBid !== "all" && bid !== filterBid) return;
    const buildName = buildings.find((b) => b.id === bid)?.name || bid;

    // Tickets
    (t.tickets || []).forEach((tick) => {
      const card = {
        ...tick,
        room: rno,
        building: buildName,
        key,
        type: "ticket",
      };
      if (tick.resolved) done.push(card);
      else if (tick.inProgress) progress.push(card);
      else todo.push(card);
    });

    // Open complaints
    (t.complaints || []).forEach((c) => {
      if (c.status !== "open") return;
      const card = {
        id: c.id || Date.now(),
        text: c.text,
        room: rno,
        building: buildName,
        key,
        type: "complaint",
        date: c.date,
      };
      todo.push(card);
    });
  });

  const renderCards = (arr, containerId) => {
    const el = byId(containerId);
    if (!el) return;
    if (arr.length === 0) {
      el.innerHTML =
        '<p class="text-slate-400 text-xs text-center py-6">No items</p>';
      return;
    }
    el.innerHTML = arr
      .map(
        (c) => `
          <div class="kanban-card">
            <div class="kc-room">${c.building} · Room ${c.room}</div>
            <div class="kc-text">${c.text}</div>
            ${c.date ? `<div class="kc-date">${new Date(c.date).toLocaleDateString()}</div>` : ""}
            <div class="kc-actions">
              ${containerId === "kanban-todo" ? `<button class="kc-btn" style="background:#eff6ff;color:#3b82f6;" onclick="moveKanbanCard('${c.key}',${c.id},'progress')">→ In Progress</button>` : ""}
              ${containerId === "kanban-progress" ? `<button class="kc-btn" style="background:#f0fdf4;color:#22c55e;" onclick="moveKanbanCard('${c.key}',${c.id},'done')">✓ Resolve</button>` : ""}
              ${containerId === "kanban-done" ? `<span class="text-[10px] font-bold text-emerald-500 uppercase">Resolved</span>` : ""}
            </div>
          </div>
        `,
      )
      .join("");
  };

  renderCards(todo, "kanban-todo");
  renderCards(progress, "kanban-progress");
  renderCards(done, "kanban-done");
  safeSet("kanban-count-todo", "textContent", todo.length);
  safeSet("kanban-count-progress", "textContent", progress.length);
  safeSet("kanban-count-done", "textContent", done.length);
};

window.moveKanbanCard = (key, tickId, stage) => {
  const t = state.tenants[key];
  if (!t) return;
  const tick = (t.tickets || []).find((x) => x.id === tickId);
  if (tick) {
    if (stage === "progress") {
      tick.inProgress = true;
      tick.resolved = false;
    }
    if (stage === "done") {
      tick.resolved = true;
      tick.inProgress = false;
    }
  }
  renderKanbanBoard();
};

window.addKanbanTicket = () => {
  const text = byId("kanban-ticket-input")?.value?.trim();
  if (!text) return;
  const bid = byId("kanban-ticket-building")?.value || buildings[0]?.id;
  const rno = byId("kanban-ticket-room")?.value;
  if (!rno) {
    alert("Select a room");
    return;
  }
  const key = `${bid}-${rno}`;
  if (!state.tenants[key]) state.tenants[key] = {};
  if (!state.tenants[key].tickets) state.tenants[key].tickets = [];
  state.tenants[key].tickets.push({
    id: Date.now(),
    text,
    resolved: false,
    inProgress: false,
  });
  byId("kanban-ticket-input").value = "";
  renderKanbanBoard();
};

// Refresh analytics placeholder
window.refreshAnalytics = () => {
  typeof renderRevenueChart === "function" && renderRevenueChart();
  typeof renderLeadSources === "function" && renderLeadSources();
};

function renderLTabs() {
  const wrap = byId("l-building-tabs");
  if (!wrap) return;
  wrap.innerHTML = buildings
    .map(
      (b) => `
        <button onclick="switchLBuild('${b.id}')" class="tab-btn px-8 sm:px-12 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2.5rem] whitespace-nowrap font-black text-[12px] sm:text-[13px] uppercase transition-all shadow-xl ${state.activeBuilding === b.id ? "active" : ""}" style="background:var(--navy-card);color:${state.activeBuilding === b.id ? "var(--gold)" : "var(--admin-text-dim)"};border:1px solid ${state.activeBuilding === b.id ? "rgba(229,184,76,0.3)" : "var(--admin-border)"}">
          ${b.name}
        </button>
      `,
    )
    .join("");
}
window.switchLBuild = (id) => {
  state.activeBuilding = id;
  renderLTabs();
  renderLandlordGrid();
};

window.setLFilter = (f) => {
  state.activeLFilter = f;
  document.querySelectorAll(".l-filt-btn").forEach((b) => {
    b.classList.remove("bg-slate-900", "text-white", "shadow-2xl");
    b.style.color = "var(--admin-text-dim)";
    if (b.dataset.filt === f) {
      b.classList.add("bg-slate-900", "text-white", "shadow-2xl");
      b.style.color = "";
    }
  });
  renderLandlordGrid();
};

function renderLandlordGrid() {
  const grid = byId("l-room-grid");
  if (!grid) return;
  const build = buildings.find((b) => b.id === state.activeBuilding);
  grid.innerHTML = "";
  let layout = getLayoutForBuilding(build.id);
  layout.forEach((floor) => {
    const header = document.createElement("div");
    header.className = "col-span-full mt-6 mb-2 flex items-center gap-2";
    header.innerHTML = `<div class="w-1.5 h-6 rounded-full" style="background:var(--gold)"></div><h3 class="text-xs font-black uppercase tracking-[0.2em]" style="color:var(--admin-text-dim)">${floor.name}</h3>`;
    grid.appendChild(header);

    (
      floor.rooms ||
      Array.from(
        { length: floor.end - floor.start + 1 },
        (_, i) => floor.start + i,
      )
    ).forEach((rNo) => {
      const key = `${state.activeBuilding}-${rNo}`;
      const t = state.tenants[key];
      if (
        state.activeLFilter === "pendingRent" &&
        (!t || (t.rentPaid && t.elecPaid))
      )
        return;
      if (
        state.activeLFilter === "vacant" &&
        t?.status &&
        t.status !== "Available"
      )
        return;

      const card = document.createElement("div");
      let tileClass = "room-tile";
      if (!t || !t.status || t.status === "Available")
        tileClass += " tile-vacant";
      else if (t.status === "Booked") tileClass += " tile-booked";
      else if (t.status === "Occupied" && t.rentPaid && t.elecPaid)
        tileClass += " tile-green";
      else if (t.status === "Occupied") tileClass += " tile-amber";

      card.className = tileClass;
      card.onclick = () => openLModal(state.activeBuilding, rNo);

      const openCCount = (t?.complaints || []).filter(
        (c) => c.status === "open",
      ).length;
      card.innerHTML = `
            ${openCCount > 0 ? `<div class="tile-complaint-dot">${openCCount}</div>` : ""}
            <div class="tile-room-no">${rNo}</div>
            <div class="tile-name">${t?.name || "—"}</div>
            <span class="tile-status" style="color:${t?.status === "Occupied" ? "var(--gold)" : "#94a3b8"}">${t?.status || "Vacant"}</span>
            ${t?.status === "Occupied"
          ? `
              <div class="tile-bars" title="Rent | Electricity">
                <div class="micro-bar"><div class="bar-fill ${t.rentPaid ? "rent-paid" : "rent-due"}"></div></div>
                <div class="micro-bar"><div class="bar-fill ${t.elecPaid ? "elec-paid" : "elec-due"}" style="width:${t.elecPaid ? "100%" : "40%"}"></div></div>
              </div>
            `
          : ""
        }
          `;
      grid.appendChild(card);
    });
  });

  // Also refresh dashboard preview
  typeof renderRoomPreview === "function" && renderRoomPreview();
}

function updateLandlordStats() {
  const list = Object.values(state.tenants);
  const totalCount = buildings.reduce((a, b) => a + b.rooms, 0);
  const activeCount = list.filter(
    (t) => t.status === "Occupied" || t.status === "Booked",
  ).length;
  let rev = 0;
  let pend = 0;
  let openComplaints = 0;
  list.forEach((t) => {
    if (t.rentPaid) rev += Number(t.rentAmount || 0);
    if (!t.elecPaid && t.status === "Occupied") pend++;
    (t.complaints || []).forEach((c) => {
      if (c.status === "open") openComplaints++;
    });
  });

  safeSet("l-stat-occ", "textContent", `${activeCount}/${totalCount}`);
  safeSet("l-stat-rev", "textContent", `₹${rev.toLocaleString("en-IN")}`);
  safeSet("l-stat-pending-elec", "textContent", pend);
  safeSet("l-stat-complaints", "textContent", openComplaints);
  // Show pulsing dot if complaints exist
  const dot = byId("l-stat-complaints-dot");
  if (dot) {
    if (openComplaints > 0) dot.classList.remove("hidden");
    else dot.classList.add("hidden");
  }
  safeSet(
    "l-stat-expiring",
    "textContent",
    list.filter((t) => t.tickets?.length > 0).length,
  );

  // Render occupancy donut chart
  const donutContainer = byId("occ-donut-container");
  if (donutContainer) {
    donutContainer.innerHTML = renderOccupancyDonut(activeCount, totalCount);
  }
}

window.openLModal = (bid, rno) => {
  const t = state.tenants[`${bid}-${rno}`] || {};
  state.selectedRoom = { bid, rno };
  state.rentPaidLocal = t.rentPaid || false;
  state.elecPaidLocal = t.elecPaid || false;

  safeSet("lm-room-id", "textContent", rno);
  safeSet("lm-room-title", "textContent", `Room ${rno}`);
  safeSet(
    "lm-room-subtitle",
    "textContent",
    buildings.find((b) => b.id === bid)?.name || "",
  );
  safeSet("lm-room-status-badge", "textContent", t.status || "Available");

  // Open drawer
  byId("l-modal")?.classList.add("open");
  byId("drawer-backdrop")?.classList.add("open");

  safeSet("lm-status", "value", t.status || "Available");
  safeSet("lm-name", "value", t.name || "");
  safeSet("lm-phone", "value", t.phone || "");
  safeSet("lm-nationality", "value", t.nationality || "Indian");
  safeSet("lm-college-id", "value", t.collegeIdNo || "");
  safeSet("lm-aadhaar-no", "value", t.aadhaarNo || "");
  safeSet("lm-aadhaar-no-foreign", "value", t.aadhaarNo || "");
  safeSet("lm-passport-no", "value", t.passportNo || "");
  safeSet("lm-visa-no", "value", t.visaNo || "");
  safeSet("lm-checkin", "value", t.checkinDate || "");
  safeSet("lm-checkin-foreign", "value", t.checkinDate || "");
  safeSet("lm-student-password", "value", "");
  toggleForeignerFields("lm");

  // Photo preview
  const photoPreview = byId("lm-photo-preview");
  if (photoPreview) {
    photoPreview.innerHTML = t.photoUrl
      ? `<img src="${t.photoUrl}" class="w-full h-full object-cover" alt="Photo">`
      : '<i class="fas fa-camera text-slate-300 text-xl"></i>';
  }
  safeSet("lm-photo-data", "value", t.photoUrl || "");
  const photoUpload = byId("lm-photo-upload");
  if (photoUpload) photoUpload.value = "";

  safeSet(
    "lm-rent",
    "value",
    t.rentAmount || buildings.find((b) => b.id === bid)?.rent || "",
  );
  safeSet("lm-maint", "value", t.maintCharge || "300");
  safeSet("lm-security", "value", t.securityDeposit || "");
  safeSet("lm-agreement-end", "value", t.agreementEndDate || "");
  safeSet("lm-guardian-name", "value", t.guardianName || "");
  safeSet("lm-guardian-phone", "value", t.guardianPhone || "");
  safeSet("lm-guardian-relation", "value", t.guardianRelation || "");
  safeSet("lm-doc1", "value", t.doc1Url || "");
  safeSet("lm-doc2", "value", t.doc2Url || "");
  safeSet("lm-doc1-v", "checked", t.doc1Verified || false);
  safeSet("lm-doc2-v", "checked", t.doc2Verified || false);
  safeSet("lm-aadhaar", "value", t.aadhaarUrl || "");
  safeSet("lm-aadhaar-v", "checked", t.aadhaarVerified || false);
  safeSet("lm-uni-id", "value", t.uniIdUrl || "");
  safeSet("lm-uni-id-v", "checked", t.uniIdVerified || false);
  safeSet("lm-rental-agreement", "value", t.rentalAgreementUrl || "");
  safeSet("lm-rental-signed", "checked", t.rentalSigned || false);
  safeSet("lm-e-last", "value", t.elecLast || "");
  safeSet("lm-e-curr", "value", t.elecCurrent || "");
  safeSet("lm-i-last", "value", t.invLast || "");
  safeSet("lm-i-curr", "value", t.invCurrent || "");
  safeSet("lm-e-rate", "value", t.elecRate || "13");
  safeSet("lm-lead-source", "value", t.leadSource || "");
  safeSet("lm-student-course", "value", t.studentCourse || "");
  safeSet("lm-student-year", "value", t.studentYear || "");
  safeSet("lm-directory-optin", "checked", t.directoryOptIn || false);
  safeSet("lm-rent-paid", "checked", t.rentPaid || false);
  safeSet("lm-elec-paid", "checked", t.elecPaid || false);

  // 2nd Tenant pre-populate
  const t2 = t.secondTenant || {};
  safeSet("lm-t2-name", "value", t2.name || "");
  safeSet("lm-t2-phone", "value", t2.phone || "");
  safeSet("lm-t2-nationality", "value", t2.nationality || "Indian");
  safeSet("lm-t2-college-id", "value", t2.collegeIdNo || "");
  safeSet("lm-t2-aadhaar-no", "value", t2.aadhaarNo || "");
  safeSet("lm-t2-passport-no", "value", t2.passportNo || "");
  safeSet("lm-t2-visa-no", "value", t2.visaNo || "");
  safeSet("lm-t2-photo-data", "value", t2.photoUrl || "");
  toggleForeignerFields("lm-t2");
  const t2PhotoPreview = byId("lm-t2-photo-preview");
  if (t2PhotoPreview) {
    t2PhotoPreview.innerHTML = t2.photoUrl
      ? `<img src="${t2.photoUrl}" class="w-full h-full object-cover" alt="Photo">`
      : '<i class="fas fa-camera text-indigo-300 text-xl"></i>';
  }
  const t2PhotoUpload = byId("lm-t2-photo-upload");
  if (t2PhotoUpload) t2PhotoUpload.value = "";

  calcLiveLM();
  typeof renderLMAmenities === "function" &&
    renderLMAmenities(t.amenities || []);
  typeof renderLMComplaints === "function" &&
    renderLMComplaints(t.complaints || []);
  typeof renderLMPaymentHistory === "function" &&
    renderLMPaymentHistory(t.paymentHistory || []);

  const ticketList = byId("lm-ticket-list");
  if (ticketList) {
    ticketList.innerHTML = (t.tickets || [])
      .map(
        (tick) => `
          <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span class="font-bold text-sm text-slate-800">${tick.text}</span>
            <button onclick="resolveLMTicket(${tick.id})" class="text-emerald-500 font-bold text-[10px] uppercase hover:underline">Done ✓</button>
          </div>
        `,
      )
      .join("");
  }
};

// ── Toggle foreigner fields (Passport No, Visa No) based on nationality ──
window.toggleForeignerFields = (prefix) => {
  const nationality = byId(`${prefix}-nationality`)?.value;
  const foreignFields = byId(`${prefix}-foreign-fields`);
  const indianFields = byId(`${prefix}-indian-fields`);
  if (foreignFields) {
    if (nationality === "Foreign") {
      foreignFields.classList.remove("hidden");
      if (indianFields) indianFields.classList.add("hidden");
    } else {
      foreignFields.classList.add("hidden");
      if (indianFields) indianFields.classList.remove("hidden");
    }
  }
};

// ── Photo upload handler (converts to base64 for storage) ──
window.handlePhotoUpload = (event, previewId, dataId) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.match("image/jpeg") && !file.type.match("image/jpg")) {
    toast("Please upload a JPEG image only.");
    event.target.value = "";
    return;
  }
  if (file.size > 500 * 1024) {
    toast("Image too large. Max 500KB allowed.");
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const preview = byId(previewId);
    if (preview)
      preview.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover" alt="Photo">`;
    const dataInput = byId(dataId);
    if (dataInput) dataInput.value = dataUrl;
  };
  reader.readAsDataURL(file);
};

// ── Generic Document Upload Handler (no strict preview image constraints) ──
window.handleDocumentUpload = (event, dataId) => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast("Document too large. Max 2MB allowed.");
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataInput = byId(dataId);
    if (dataInput) {
      dataInput.value = e.target.result;
      toast("✓ Document securely loaded to local storage.", "success");
    }
  };
  reader.readAsDataURL(file);
};

function calcLiveLM() {
  const eU = Math.max(
    0,
    num(byId("lm-e-curr")?.value) - num(byId("lm-e-last")?.value),
  );
  const iU = Math.max(
    0,
    num(byId("lm-i-curr")?.value) - num(byId("lm-i-last")?.value),
  );
  const total = eU + iU;
  const rate = num(byId("lm-e-rate")?.value, 13);
  const maint = num(byId("lm-maint")?.value, 300);
  safeSet("lm-total-units", "textContent", total.toFixed(1));
  safeSet(
    "lm-total-bill",
    "textContent",
    `₹${(total * rate + maint).toLocaleString("en-IN")}`,
  );
}

function initListeners() {
  [
    "lm-e-last",
    "lm-e-curr",
    "lm-i-last",
    "lm-i-curr",
    "lm-e-rate",
    "lm-maint",
  ].forEach((id) => {
    byId(id)?.addEventListener("input", calcLiveLM);
  });

  byId("lm-checkin")?.addEventListener("change", (e) => {
    const checkin = new Date(e.target.value);
    if (!isNaN(checkin.getTime())) {
      checkin.setMonth(checkin.getMonth() + 6);
      safeSet("lm-agreement-end", "value", checkin.toISOString().split("T")[0]);
    }
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        closeMobileMenu(); // Close mobile menu after clicking a link
      }
    });
  });
}

function getLayoutForBuilding(id) {
  if (id === "sp1")
    return [
      { name: "Ground", start: 101, end: 108 },
      { name: "First", start: 201, end: 208 },
      { name: "Second", start: 301, end: 308 },
      { name: "Third", start: 401, end: 406 },
    ];
  if (id === "sp2" || id === "sp3")
    return [
      { name: "Ground", rooms: [101] },
      { name: "First", rooms: [201] },
      { name: "Second", rooms: [301, 302] },
      { name: "Third", rooms: [401] },
    ];
  if (id === "ambey1")
    return [
      { name: "Ground", rooms: [101, 102, 103] },
      { name: "First", rooms: [201, 202, 203] },
      { name: "Second", rooms: [301, 302, 303] },
      { name: "Third", rooms: [401, 402] },
    ];
  if (id === "ambey2" || id === "skg")
    return [
      { name: "Ground", rooms: [101, 102] },
      { name: "First", rooms: [201, 202] },
      { name: "Second", rooms: [301, 302] },
      { name: "Third", rooms: [401] },
    ];
  if (id === "ns" || id === "blessing")
    return [
      { name: "Ground", rooms: [101, 102] },
      { name: "First", rooms: [201, 202] },
      { name: "Second", rooms: [301, 302] },
    ];
  if (id === "comfort")
    return [
      { name: "Ground", rooms: [101, 102] },
      { name: "First", rooms: [201, 202, 203, 204] },
      { name: "Second", rooms: [301, 302, 303, 304] },
      { name: "Third", rooms: [401, 402] },
    ];
  return [
    {
      name: "Units",
      start: 1,
      end: buildings.find((b) => b.id === id).rooms,
    },
  ];
}

function renderLMToggles() {
  const r = byId("lm-btn-rent");
  const e = byId("lm-btn-elec");
  if (!r || !e) return;
  r.className = `flex-1 py-6 sm:py-8 rounded-[2rem] sm:rounded-[5rem] font-black uppercase text-base sm:text-xl tracking-[0.6em] sm:tracking-[0.8em] transition-all shadow-4xl ${state.rentPaidLocal ? "bg-emerald-500 text-white shadow-emerald-200 border-none" : "bg-slate-50 text-slate-400 border border-slate-200"}`;
  r.textContent = state.rentPaidLocal ? "RENT SETTLED ✓" : "MARK RENT PAID";
  r.onclick = () => {
    state.rentPaidLocal = !state.rentPaidLocal;
    renderLMToggles();
  };
  e.className = `flex-1 py-6 sm:py-8 rounded-[2rem] sm:rounded-[5rem] font-black uppercase text-base sm:text-xl tracking-[0.6em] sm:tracking-[0.8em] transition-all shadow-4xl ${state.elecPaidLocal ? "bg-emerald-500 text-white shadow-emerald-200 border-none" : "bg-slate-50 text-slate-400 border border-slate-200"}`;
  e.textContent = state.elecPaidLocal
    ? "ELECTRICITY CLEARED ✓"
    : "MARK ELECTRICITY PAID";
  e.onclick = () => {
    state.elecPaidLocal = !state.elecPaidLocal;
    renderLMToggles();
  };
}

// ── Render amenities checklist in admin modal ──
function renderLMAmenities(savedAmenities) {
  const wrap = byId("lm-amenities-grid");
  if (!wrap) return;

  const savedMap = {};
  (savedAmenities || []).forEach((a) => {
    savedMap[a.name] = a;
  });

  // 1. Render Check-in Amenities
  wrap.innerHTML = MASTER_AMENITIES.map((a) => {
    const checked = savedMap[a.name]?.enabled === true ? "checked" : "";
    return `
          <label class="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
            <input type="checkbox" class="lm-amenity-cb accent-emerald-500 w-3 h-3" data-amenity="${a.name}" ${checked}>
            <i class="fas ${a.icon} text-slate-400 text-xs w-4 text-center"></i>
            <span class="text-xs font-bold text-slate-600 truncate">${a.name}</span>
          </label>`;
  }).join("");

  // 2. Render Checkout Amenities (Only visible if status is occupied)
  const coutSec = byId("lm-checkout-section");
  const coutList = byId("checkout-amenities-list");
  if (coutSec && coutList) {
    const hasTenant = safeGet("lm-status") === "Occupied";
    coutSec.style.display = hasTenant ? "block" : "none";

    const activeAmenities = (savedAmenities || []).filter((a) => a.enabled);
    coutList.innerHTML = activeAmenities
      .map((a) => {
        const meta = MASTER_AMENITIES.find((m) => m.name === a.name);
        const icon = meta ? meta.icon : "fa-check";
        return `
                <div class="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                  <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" onchange="calcCheckout()" class="cout-amenity-cb accent-emerald-500 w-4 h-4" checked>
                    <i class="fas ${icon} text-slate-400 text-sm w-5 text-center"></i>
                    <span class="text-sm font-bold text-slate-700">${a.name}</span>
                  </label>
                  <input type="number" class="w-20 px-2 py-1 border border-slate-200 rounded-md text-xs font-bold outline-none text-right cout-penalty hidden focus:border-rose-400" placeholder="Penalty ₹" value="500" oninput="calcCheckout()">
                </div>
              `;
      })
      .join("");

    document.querySelectorAll(".cout-amenity-cb").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const input = e.target.closest("div").querySelector(".cout-penalty");
        if (!e.target.checked) {
          input.classList.remove("hidden");
        } else {
          input.classList.add("hidden");
        }
        calcCheckout();
      });
    });
    calcCheckout();
  }
}

window.calcCheckout = () => {
  const secDep = Number(safeGet("lm-security")) || 0;
  byId("check-sec").textContent = `₹${secDep.toLocaleString("en-IN")}`;

  let amenitiesPenalty = 0;
  document.querySelectorAll(".cout-amenity-cb").forEach((cb) => {
    if (!cb.checked) {
      const penaltyInput = cb.closest("div").querySelector(".cout-penalty");
      amenitiesPenalty += Number(penaltyInput.value) || 0;
    }
  });

  byId("check-damages").textContent =
    `- ₹${amenitiesPenalty.toLocaleString("en-IN")}`;

  const finalRefund = secDep - 500 - amenitiesPenalty;
  byId("check-refund").textContent = `₹${finalRefund.toLocaleString("en-IN")}`;
};

window.checkoutTenant = async () => {
  if (
    !confirm(
      "Are you sure you want to process move-out? This will wipe the room data, move it to Available status, and log the checkout computations.",
    )
  )
    return;

  byId("lm-status").value = "Available";
  byId("lm-name").value = "";
  byId("lm-phone").value = "";
  byId("lm-student-course").value = "";
  byId("lm-student-year").value = "";
  byId("lm-student-password").value = "";

  toast(
    "Tenant cleared. Security settled. Switching room to available...",
    2000,
  );
  await saveLMTenant();
};

// ── Collect amenities from checkboxes ──
function getLMAmenities() {
  return Array.from(document.querySelectorAll(".lm-amenity-cb")).map((cb) => ({
    name: cb.dataset.amenity,
    enabled: cb.checked,
  }));
}

// ── Render complaints in admin modal ──
function renderLMComplaints(complaints) {
  const wrap = byId("lm-complaint-list");
  if (!wrap) return;
  if (!complaints.length) {
    wrap.innerHTML = '<p class="text-slate-400 text-sm">No complaints yet.</p>';
    return;
  }
  wrap.innerHTML = complaints
    .map(
      (c) => `
        <div class="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border ${c.status === "open" ? "border-rose-200" : "border-emerald-200"}">
          <div class="flex-1">
            <p class="font-bold text-sm text-slate-800">${c.text}</p>
            <p class="text-[10px] text-slate-400 mt-1">${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</p>
          </div>
          <span class="text-[10px] font-black uppercase px-3 py-1 rounded-lg ${c.status === "open" ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500"}">${c.status}</span>
          ${c.status === "open" ? `<button onclick="resolveComplaint(${c.id})" class="ml-3 text-emerald-500 font-black text-xs hover:scale-110 transition">Resolve ✓</button>` : ""}
        </div>
      `,
    )
    .join("");
}

// ── Resolve complaint from admin ──
window.resolveComplaint = async (cid) => {
  if (!state.selectedRoom) return;
  const bid = state.selectedRoom.bid;
  const rno = state.selectedRoom.rno;
  const key = `${bid}-${rno}`;
  const complaints = (state.tenants[key]?.complaints || []).map((c) =>
    c.id === cid ? { ...c, status: "resolved" } : c,
  );
  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ complaints }),
    });
    const result = await res.json();
    if (result.success) state.tenants[key] = result.data;
  } catch (err) {
    console.error("[resolveComplaint]", err);
  }
  openLModal(bid, rno);
};

// ── Render payment history in admin modal ──
function renderLMPaymentHistory(history) {
  const wrap = byId("lm-payment-history");
  if (!wrap) return;
  if (!history.length) {
    wrap.innerHTML =
      '<p class="text-slate-400 text-sm">No payment records yet.</p>';
    return;
  }
  wrap.innerHTML = history
    .slice()
    .reverse()
    .map(
      (p) => `
        <div class="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 ${p.type === "rent" ? "bg-emerald-100" : "bg-amber-100"} rounded-lg flex items-center justify-center">
              <i class="fas ${p.type === "rent" ? "fa-indian-rupee-sign text-emerald-500" : "fa-bolt text-amber-500"} text-xs"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800 capitalize">${p.type} Payment</p>
              <p class="text-[10px] text-slate-400">${p.month || ""} • ${p.paidAt ? new Date(p.paidAt).toLocaleDateString() : ""}</p>
            </div>
          </div>
          <span class="font-black text-slate-800">₹${Number(p.amount || 0).toLocaleString("en-IN")}</span>
        </div>
      `,
    )
    .join("");
}

// ── Notice Management (Admin) ──
async function loadAdminNotices() {
  if (!adminToken) return;
  try {
    const res = await fetch(`${API_BASE}/notices/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const result = await res.json();
    if (!result.success) return;
    const wrap = byId("admin-notice-list");
    if (!wrap) return;
    if (!result.data.length) {
      wrap.innerHTML =
        '<p class="text-slate-400 text-sm">No notices posted.</p>';
      return;
    }
    wrap.innerHTML = result.data
      .map(
        (n) => `
          <div class="flex items-center justify-between bg-white p-4 rounded-xl border ${n.priority === "urgent" ? "border-rose-200" : n.priority === "warning" ? "border-amber-200" : "border-slate-200"}">
            <div class="flex items-center gap-3 flex-1">
              <span class="text-[10px] font-black uppercase px-2 py-1 rounded-lg ${n.priority === "urgent" ? "bg-rose-100 text-rose-500" : n.priority === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-500"}">${n.priority}</span>
              <p class="text-sm font-semibold text-slate-700">${n.text}</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="toggleNotice('${n._id}', ${!n.active})" class="text-xs font-bold ${n.active ? "text-emerald-500" : "text-slate-400"}">${n.active ? "Active" : "Hidden"}</button>
              <button onclick="deleteNotice('${n._id}')" class="text-rose-400 hover:text-rose-600 text-sm ml-2"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("[loadAdminNotices]", err);
  }
}

window.postNotice = async () => {
  const text = safeGet("notice-text-input");
  const priority = safeGet("notice-priority-input");
  if (!text) {
    toast("Enter notice text.");
    return;
  }
  try {
    await fetch(`${API_BASE}/notices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ text, priority }),
    });
    safeSet("notice-text-input", "value", "");
    toast("Notice posted!");
    loadAdminNotices();
  } catch (err) {
    console.error("[postNotice]", err);
    toast("Failed to post notice.");
  }
};

window.toggleNotice = async (id, active) => {
  try {
    await fetch(`${API_BASE}/notices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ active }),
    });
    loadAdminNotices();
  } catch (err) {
    console.error("[toggleNotice]", err);
  }
};

window.deleteNotice = async (id) => {
  if (!confirm("Delete this notice?")) return;
  try {
    await fetch(`${API_BASE}/notices/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    loadAdminNotices();
    toast("Notice deleted.");
  } catch (err) {
    console.error("[deleteNotice]", err);
  }
};

// ═══════════════════════════════════════════
//  NOTIFICATION SYSTEM
// ═══════════════════════════════════════════

// ── Toggle admin notification dropdown ──
window.toggleAdminNotifPanel = () => {
  const dd = byId("admin-notif-dropdown");
  if (!dd) return;
  dd.classList.toggle("open");
  // Close on outside click
  if (dd.classList.contains("open")) {
    setTimeout(() => {
      document.addEventListener("click", closeAdminNotifOnOutside, {
        once: true,
      });
    }, 10);
  }
};
function closeAdminNotifOnOutside(e) {
  const dd = byId("admin-notif-dropdown");
  const bell = byId("admin-notif-bell");
  if (dd && !bell?.contains(e.target)) dd.classList.remove("open");
}

// ── Toggle tenant notification dropdown ──
window.toggleTenantNotifPanel = () => {
  const dd = byId("tenant-notif-dropdown");
  if (!dd) return;
  dd.classList.toggle("open");
  if (dd.classList.contains("open")) {
    setTimeout(() => {
      document.addEventListener("click", closeTenantNotifOnOutside, {
        once: true,
      });
    }, 10);
  }
};
function closeTenantNotifOnOutside(e) {
  const dd = byId("tenant-notif-dropdown");
  const bell = byId("tenant-notif-bell");
  if (dd && !bell?.contains(e.target)) dd.classList.remove("open");
}

// ── Render admin notifications list ──
function renderAdminNotifs() {
  const list = byId("admin-notif-list");
  const badge = byId("admin-notif-badge");
  if (!list) return;
  const notifs = state.adminNotifs;
  if (badge) {
    badge.textContent = notifs.length || "";
    badge.dataset.count = notifs.length;
  }
  if (!notifs.length) {
    list.innerHTML =
      '<div class="px-5 py-8 text-center text-slate-400 text-sm">No new notifications</div>';
    return;
  }
  list.innerHTML = notifs
    .map(
      (n) => `
        <div class="notif-item">
          <div class="notif-dot bg-${n.color || "rose"}-500"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-800 leading-snug">${n.title}</p>
            <p class="text-xs text-slate-500 mt-0.5 truncate">${n.body}</p>
            <p class="text-[10px] text-slate-400 mt-1">${n.time}</p>
          </div>
          <div class="w-8 h-8 bg-${n.color || "rose"}-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas ${n.icon || "fa-bell"} text-${n.color || "rose"}-500 text-xs"></i>
          </div>
        </div>
      `,
    )
    .join("");
}

// ── Render tenant notifications list ──
function renderTenantNotifs(notices, complaints) {
  const list = byId("tenant-notif-list");
  if (!list) return;
  const items = [];
  // Notices as notifications
  (notices || []).forEach((n) => {
    items.push({
      title:
        n.priority === "urgent"
          ? "🔴 Urgent Notice"
          : n.priority === "warning"
            ? "⚠️ Important"
            : "📢 Notice",
      body: n.text,
      icon: n.priority === "urgent" ? "fa-triangle-exclamation" : "fa-bullhorn",
      color:
        n.priority === "urgent"
          ? "rose"
          : n.priority === "warning"
            ? "amber"
            : "blue",
      time: n.createdAt
        ? new Date(n.createdAt).toLocaleDateString()
        : "Recently",
    });
  });
  // Resolved complaints
  (complaints || [])
    .filter((c) => c.status === "resolved")
    .forEach((c) => {
      items.push({
        title: "✅ Complaint Resolved",
        body: c.text,
        icon: "fa-circle-check",
        color: "emerald",
        time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      });
    });
  if (!items.length) {
    list.innerHTML =
      '<div class="px-5 py-8 text-center text-slate-400 text-sm">No notifications</div>';
    return;
  }
  list.innerHTML = items
    .map(
      (n) => `
        <div class="notif-item">
          <div class="notif-dot bg-${n.color}-500"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-800 leading-snug">${n.title}</p>
            <p class="text-xs text-slate-500 mt-0.5 truncate">${n.body}</p>
            <p class="text-[10px] text-slate-400 mt-1">${n.time}</p>
          </div>
          <div class="w-8 h-8 bg-${n.color}-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="fas ${n.icon} text-${n.color}-500 text-xs"></i>
          </div>
        </div>
      `,
    )
    .join("");
}

// ── Clear notifications ──
window.clearAdminNotifs = () => {
  state.adminNotifs = [];
  renderAdminNotifs();
};
window.clearTenantNotifs = () => {
  state.tenantNotifs = [];
  const badge = byId("tenant-notif-badge");
  if (badge) {
    badge.textContent = "";
    badge.dataset.count = "0";
  }
  const list = byId("tenant-notif-list");
  if (list)
    list.innerHTML =
      '<div class="px-5 py-8 text-center text-slate-400 text-sm">No notifications</div>';
};

// ── Admin notification polling — checks for new complaints ──
function scanAdminNotifications() {
  const allTenants = Object.entries(state.tenants);
  let openComplaints = [];
  let unpaidRent = 0;
  let unpaidElec = 0;
  allTenants.forEach(([key, t]) => {
    if (t.status !== "Occupied" && t.status !== "Booked") return;
    (t.complaints || []).forEach((c) => {
      if (c.status === "open") openComplaints.push({ ...c, room: key });
    });
    if (!t.rentPaid) unpaidRent++;
    if (!t.elecPaid) unpaidElec++;
  });

  const notifs = [];
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // New complaints notification
  if (openComplaints.length > 0) {
    if (
      openComplaints.length > state.prevOpenComplaints &&
      state.prevOpenComplaints > 0
    ) {
      // Ring the bell for truly new complaints
      const bellIcon = byId("admin-bell-icon");
      if (bellIcon) {
        bellIcon.classList.add("bell-ring");
        setTimeout(() => bellIcon.classList.remove("bell-ring"), 1000);
      }
      toast(`🔔 New complaint received!`, 4000);
    }
    openComplaints.forEach((c) => {
      notifs.push({
        title: `Complaint — Room ${c.room.split("-")[1]}`,
        body: c.text,
        icon: "fa-comment-dots",
        color: "rose",
        time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : now,
      });
    });
  }
  state.prevOpenComplaints = openComplaints.length;

  // Unpaid rent notifications
  if (unpaidRent > 0) {
    notifs.push({
      title: `${unpaidRent} Rent Payment${unpaidRent > 1 ? "s" : ""} Pending`,
      body: `${unpaidRent} tenant${unpaidRent > 1 ? "s have" : " has"} unpaid rent this month`,
      icon: "fa-indian-rupee-sign",
      color: "amber",
      time: now,
    });
  }
  // Unpaid electricity notifications
  if (unpaidElec > 0) {
    notifs.push({
      title: `${unpaidElec} Electricity Bill${unpaidElec > 1 ? "s" : ""} Due`,
      body: `${unpaidElec} unit${unpaidElec > 1 ? "s have" : " has"} unsettled electricity bills`,
      icon: "fa-bolt",
      color: "yellow",
      time: now,
    });
  }

  state.adminNotifs = notifs;
  renderAdminNotifs();
}

// ── Admin polling — refetch rooms and check for new complaints ──
async function adminNotifPoll() {
  if (!adminToken) return;
  try {
    const res = await fetch(`${API_BASE}/rooms`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const result = await res.json();
    if (result.success) {
      result.data.forEach((r) => {
        const key = `${r.buildingId}-${r.roomNo}`;
        state.tenants[key] = r;
      });
      scanAdminNotifications();
      updateLandlordStats();
    }
  } catch (err) {
    /* silent */
  }
}

// ── Start/stop notification polling ──
function startNotifPolling() {
  stopNotifPolling();
  // Poll every 30 seconds
  state.notifPollingId = setInterval(() => {
    if (state.view === "landlord" && adminToken) adminNotifPoll();
  }, 30000);
}
function stopNotifPolling() {
  if (state.notifPollingId) {
    clearInterval(state.notifPollingId);
    state.notifPollingId = null;
  }
}

// ── Load all rooms from backend into state.tenants ──
async function loadRoomsFromAPI() {
  if (!adminToken) return;
  try {
    const res = await fetch(`${API_BASE}/rooms`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const result = await res.json();
    if (result.success) {
      state.tenants = {};
      result.data.forEach((r) => {
        const key = `${r.buildingId}-${r.roomNo}`;
        state.tenants[key] = r;
      });
      renderLandlordGrid();
      updateLandlordStats();
      scanAdminNotifications();
    }
  } catch (err) {
    console.error("[loadRooms]", err);
  }
}

window.saveLMTenant = async () => {
  if (!state.selectedRoom) {
    toast("No room selected.", 3000);
    return;
  }
  if (!adminToken) {
    toast("Session expired. Please login again.", 4000);
    return;
  }
  const bid = state.selectedRoom.bid;
  const rno = state.selectedRoom.rno;
  const key = `${bid}-${rno}`;
  const nationality1 = safeGet("lm-nationality") || "Indian";
  const isForeign1 = nationality1 === "Foreign";
  const data = {
    status: safeGet("lm-status"),
    name: safeGet("lm-name"),
    phone: safeGet("lm-phone"),
    nationality: nationality1,
    checkinDate: isForeign1
      ? safeGet("lm-checkin-foreign")
      : safeGet("lm-checkin"),
    collegeIdNo: safeGet("lm-college-id"),
    aadhaarNo: isForeign1
      ? safeGet("lm-aadhaar-no-foreign")
      : safeGet("lm-aadhaar-no"),
    passportNo: isForeign1 ? safeGet("lm-passport-no") : "",
    visaNo: isForeign1 ? safeGet("lm-visa-no") : "",
    photoUrl: safeGet("lm-photo-data"),
    studentPassword: safeGet("lm-student-password"),
    rentAmount: Number(safeGet("lm-rent")) || 0,
    maintCharge: Number(safeGet("lm-maint")) || 300,
    securityDeposit: Number(safeGet("lm-security")) || 0,
    agreementEndDate: safeGet("lm-agreement-end"),
    doc1Url: safeGet("lm-doc1"),
    doc1Verified: byId("lm-doc1-v")?.checked || false,
    doc2Url: safeGet("lm-doc2"),
    doc2Verified: byId("lm-doc2-v")?.checked || false,
    aadhaarUrl: safeGet("lm-aadhaar"),
    aadhaarVerified: byId("lm-aadhaar-v")?.checked || false,
    uniIdUrl: safeGet("lm-uni-id"),
    uniIdVerified: byId("lm-uni-id-v")?.checked || false,
    rentalAgreementUrl: safeGet("lm-rental-agreement"),
    rentalSigned: byId("lm-rental-signed")?.checked || false,
    elecLast: Number(safeGet("lm-e-last")) || 0,
    elecCurrent: Number(safeGet("lm-e-curr")) || 0,
    invLast: Number(safeGet("lm-i-last")) || 0,
    invCurrent: Number(safeGet("lm-i-curr")) || 0,
    elecRate: Number(safeGet("lm-e-rate")) || 13,
    rentPaid: byId("lm-rent-paid")?.checked || false,
    elecPaid: byId("lm-elec-paid")?.checked || false,
    leadSource: safeGet("lm-lead-source"),
    studentCourse: safeGet("lm-student-course"),
    studentYear: safeGet("lm-student-year"),
    directoryOptIn: byId("lm-directory-optin")?.checked || false,
    amenities: typeof getLMAmenities === "function" ? getLMAmenities() : [],
    tickets: state.tenants[key]?.tickets || [],
    guardianName: safeGet("lm-guardian-name"),
    guardianPhone: safeGet("lm-guardian-phone"),
    guardianRelation: safeGet("lm-guardian-relation"),
  };

  // ── Validate foreigner mandatory fields (primary tenant) ──
  if (isForeign1 && data.name) {
    const missing = [];
    if (!data.passportNo) missing.push("Passport No");
    if (!data.visaNo) missing.push("Visa No");
    if (!data.photoUrl) missing.push("Photo");
    if (missing.length > 0) {
      toast(`⚠️ Foreign student: ${missing.join(", ")} required!`, 5000);
      return;
    }
  }

  // 2nd Tenant data
  const t2Name = safeGet("lm-t2-name");
  const t2Phone = safeGet("lm-t2-phone");
  const t2Nationality = safeGet("lm-t2-nationality") || "Indian";
  const t2IsForeign = t2Nationality === "Foreign";
  const t2CollegeId = safeGet("lm-t2-college-id");
  const t2AadhaarNo = safeGet("lm-t2-aadhaar-no");
  const t2PassportNo = t2IsForeign ? safeGet("lm-t2-passport-no") : "";
  const t2VisaNo = t2IsForeign ? safeGet("lm-t2-visa-no") : "";
  const t2PhotoUrl = safeGet("lm-t2-photo-data");
  if (t2Name || t2Phone || t2CollegeId || t2AadhaarNo || t2PhotoUrl) {
    // ── Validate foreigner mandatory fields (2nd tenant) ──
    if (t2IsForeign && t2Name) {
      const missing2 = [];
      if (!t2PassportNo) missing2.push("Passport No");
      if (!t2VisaNo) missing2.push("Visa No");
      if (!t2PhotoUrl) missing2.push("Photo");
      if (missing2.length > 0) {
        toast(
          `⚠️ 2nd Tenant (Foreign): ${missing2.join(", ")} required!`,
          5000,
        );
        return;
      }
    }
    data.secondTenant = {
      name: t2Name,
      phone: t2Phone,
      nationality: t2Nationality,
      collegeIdNo: t2CollegeId,
      aadhaarNo: t2AadhaarNo,
      passportNo: t2PassportNo,
      visaNo: t2VisaNo,
      photoUrl: t2PhotoUrl,
    };
  } else {
    data.secondTenant = null;
  }

  // ── Record payment history when toggling paid status ──
  const prev = state.tenants[key] || {};
  const existingHistory = prev.paymentHistory || [];
  const now = new Date().toISOString();
  const monthLabel = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  let totalNewlyPaid = 0;
  if (data.rentPaid && !prev.rentPaid) {
    existingHistory.push({
      type: "rent",
      amount: data.rentAmount,
      paidAt: now,
      month: monthLabel,
    });
    totalNewlyPaid += data.rentAmount;
  }
  if (data.elecPaid && !prev.elecPaid) {
    const totalUnits =
      Math.max(0, data.elecCurrent - data.elecLast) +
      Math.max(0, data.invCurrent - data.invLast);
    const elecAmount = totalUnits * data.elecRate + data.maintCharge;
    existingHistory.push({
      type: "electricity",
      amount: elecAmount,
      paidAt: now,
      month: monthLabel,
    });
    totalNewlyPaid += elecAmount;
  }
  data.paymentHistory = existingHistory;
  data.complaints = prev.complaints || [];

  // Don't send empty password (avoids re-hashing blank string)
  if (!data.studentPassword) delete data.studentPassword;

  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      state.tenants[key] = result.data;
      toast("Saved.");
      renderLandlordGrid();
      updateLandlordStats();
      if (totalNewlyPaid > 0) {
        window.sendBillingWA(bid, rno, data.name, totalNewlyPaid, "receipt");
      }
    } else {
      toast(result.message || "Save failed.", 4000);
    }
  } catch (err) {
    console.error("[saveLMTenant]", err);
    toast("Server error. Check backend.", 4000);
  }
  closeLModal();
};

window.runClearanceCheck = () => {
  if (!state.selectedRoom) return toast("Select a unit first.");
  const bid = state.selectedRoom.bid;
  const rno = state.selectedRoom.rno;
  const t = state.tenants[`${bid}-${rno}`];
  if (!t) return toast("No data for this unit.", 4000);
  const totalUnits =
    num(t.elecCurrent) - num(t.elecLast) + (num(t.invCurrent) - num(t.invLast));
  const bill = totalUnits * num(t.elecRate, 13) + num(t.maintCharge, 300);
  const refund = num(t.securityDeposit, 0) - bill;
  if (
    confirm(
      `Move-out Summary (Room ${rno}): \n- Unpaid Electricity: ₹${bill.toFixed(2)} \n- Security Deposit: ₹${num(t.securityDeposit, 0).toFixed(2)} \n- Refund Due: ₹${refund.toFixed(2)} \n\nProceed to reset and archive?`,
    )
  ) {
    vacateLMRoom();
  }
};

window.vacateLMRoom = async () => {
  if (!state.selectedRoom) return;
  if (confirm("Archive resident records and mark unit vacant?")) {
    const bid = state.selectedRoom.bid;
    const rno = state.selectedRoom.rno;
    try {
      const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const result = await res.json();
      if (result.success) {
        delete state.tenants[`${bid}-${rno}`];
        toast("Room vacated.");
        renderLandlordGrid();
        updateLandlordStats();
      } else {
        toast(result.message || "Failed to vacate.", 4000);
      }
    } catch (err) {
      console.error("[vacateLMRoom]", err);
      toast("Server error.", 4000);
    }
    closeLModal();
  }
};

window.addLMTicket = async () => {
  if (!state.selectedRoom) return;
  const bid = state.selectedRoom.bid;
  const rno = state.selectedRoom.rno;
  const key = `${bid}-${rno}`;
  const text = safeGet("lm-ticket-in");
  if (!text) return;
  const ticks = state.tenants[key]?.tickets || [];
  ticks.push({ id: Date.now(), text });
  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ tickets: ticks }),
    });
    const result = await res.json();
    if (result.success) state.tenants[key] = result.data;
  } catch (err) {
    console.error("[addLMTicket]", err);
  }
  safeSet("lm-ticket-in", "value", "");
  openLModal(bid, rno);
};

window.resolveLMTicket = async (tid) => {
  if (!state.selectedRoom) return;
  const bid = state.selectedRoom.bid;
  const rno = state.selectedRoom.rno;
  const key = `${bid}-${rno}`;
  const ticks = (state.tenants[key]?.tickets || []).filter((t) => t.id !== tid);
  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ tickets: ticks }),
    });
    const result = await res.json();
    if (result.success) state.tenants[key] = result.data;
  } catch (err) {
    console.error("[resolveLMTicket]", err);
  }
  openLModal(bid, rno);
};

// ═══════════════════════════════════════════
//  NEW FEATURES
// ═══════════════════════════════════════════

// ── Dark Mode ──
function initDarkMode() {
  const saved = localStorage.getItem("anvi-dark-mode");
  if (saved === "true") {
    document.body.classList.add("dark-mode");
    updateDarkIcon(true);
  }
}
window.toggleDarkMode = () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("anvi-dark-mode", isDark);
  updateDarkIcon(isDark);
  toast(isDark ? "🌙 Dark mode enabled" : "☀️ Light mode enabled", 2000);
};
function updateDarkIcon(isDark) {
  const icon = byId("dark-mode-icon");
  if (!icon) return;
  icon.classList.remove("fa-moon", "fa-sun");
  icon.classList.add(isDark ? "fa-sun" : "fa-moon");
}

// ── Testimonials Carousel ──
const testimonialData = [
  {
    name: "Rahul Sharma",
    course: "B.Tech CSE, 3rd Year",
    text: "Best place to stay near LPU! The rooms are spacious, well-maintained, and the management is super responsive. Felt like home away from home.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    course: "MBA, 1st Year",
    text: "Anvi Stay made my transition-colors so smooth. The Wi-Fi is great, rooms are clean, and the 24/7 support is a lifesaver during exams.",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    course: "B.Tech ME, 2nd Year",
    text: "No brokerage, transparent billing, and the rent portal is amazing. I can check everything on my phone. Highly recommend!",
    rating: 5,
  },
  {
    name: "Sneha Gupta",
    course: "BCA, 3rd Year",
    text: "The location is perfect - just 5 minutes from campus. The security and CCTV coverage gives my parents peace of mind.",
    rating: 4,
  },
  {
    name: "Vikash Singh",
    course: "B.Tech ECE, 4th Year",
    text: "Been staying here for 3 years now. The electricity billing system is very fair and transparent. Great value for money!",
    rating: 5,
  },
  {
    name: "Ananya Mishra",
    course: "M.Tech, 1st Year",
    text: "Clean rooms, friendly community, and reliable maintenance. They fixed my geyser the same day I reported it!",
    rating: 5,
  },
  {
    name: "Karan Verma",
    course: "B.Tech IT, 2nd Year",
    text: "The student portal is so convenient - I can see my rent status, electricity bill, and even file complaints online.",
    rating: 4,
  },
  {
    name: "Deepa Nair",
    course: "B.Com, 3rd Year",
    text: "Blessing PG meals are incredible! Home-cooked food and a caring atmosphere. Perfect for first-year students.",
    rating: 5,
  },
];

function renderTestimonials() {
  const track = byId("testimonials-track");
  if (!track) return;
  const cards = testimonialData
    .map(
      (t) => `
        <div class="testimonial-card">
          <div class="testimonial-stars mb-3">${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}</div>
          <p class="text-sm text-slate-600 leading-relaxed mb-5 italic">"${t.text}"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8A24A] to-[#e0c06a] flex items-center justify-center text-white font-black text-sm">${t.name.charAt(0)}</div>
            <div>
              <p class="text-sm font-bold text-slate-800">${t.name}</p>
              <p class="text-[10px] font-semibold text-slate-400">${t.course}</p>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
  // Duplicate for infinite scroll
  track.innerHTML = cards + cards;
}

// ── Stats Counter with Intersection Observer ──
function initStatsCounter() {
  const counters = document.querySelectorAll(".stat-number");
  if (!counters.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counters.forEach((counter) => {
            const target = +counter.dataset.target;
            const increment = target / 60;
            let current = 0;
            const update = () => {
              current += increment;
              if (current < target) {
                counter.textContent = Math.ceil(current) + "+";
                requestAnimationFrame(update);
              } else {
                counter.textContent = target + "+";
              }
            };
            update();
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 },
  );
  const section = counters[0]?.closest("section");
  if (section) observer.observe(section);
}

// ── FAQ Accordion ──
window.toggleFaq = (item) => {
  const wasOpen = item.classList.contains("open");
  // Close all
  document
    .querySelectorAll(".faq-item")
    .forEach((f) => f.classList.remove("open"));
  // Toggle clicked
  if (!wasOpen) item.classList.add("open");
};

// ── Property Search & Filter ──
window.filterProperties = () => {
  const query = (byId("search-property")?.value || "").toLowerCase().trim();
  const priceRange = byId("filter-price")?.value || "all";
  const typeFilter = byId("filter-type")?.value || "all";

  const cards = document.querySelectorAll(
    "#landing-property-list .property-card",
  );
  let visibleCount = 0;

  buildings.forEach((b, idx) => {
    const card = cards[idx];
    if (!card) return;

    let show = true;

    // Name search
    if (query && !b.name.toLowerCase().includes(query)) show = false;

    // Price filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      const rent = +b.rent;
      if (rent < min || rent > max) show = false;
    }

    // Type filter
    if (typeFilter !== "all" && !b.type.includes(typeFilter)) show = false;

    card.style.display = show ? "" : "none";
    if (show) visibleCount++;
  });

  const noResults = byId("no-results-msg");
  if (noResults) noResults.classList.toggle("hidden", visibleCount > 0);
};

window.resetFilters = () => {
  safeSet("search-property", "value", "");
  safeSet("filter-price", "value", "all");
  safeSet("filter-type", "value", "all");
  filterProperties();
  toast("Filters reset", 1500);
};

// ── Rent Due Countdown Timer (for tenant dashboard) ──
function renderCountdown(dueDate) {
  if (!dueDate) return "";
  // Assume rent is due on the 5th of next month
  const now = new Date();
  let due;
  if (dueDate === "auto") {
    due = new Date(now.getFullYear(), now.getMonth() + 1, 5);
  } else {
    due = new Date(dueDate);
  }
  const diff = due - now;
  if (diff <= 0)
    return `
        <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-rose-500"></i>
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-rose-500">Payment Overdue</p>
              <p class="text-sm font-bold text-rose-700">Your rent payment is past due. Please pay immediately.</p>
            </div>
          </div>
        </div>`;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return `
        <div class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-hourglass-half text-amber-500"></i>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Rent Due</p>
                <p class="text-xs font-bold text-slate-600">${due.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
            <div class="countdown-box" id="rent-countdown">
              <div class="countdown-unit"><div class="cd-val">${days}</div><div class="cd-label">Days</div></div>
              <span class="countdown-sep">:</span>
              <div class="countdown-unit"><div class="cd-val">${String(hrs).padStart(2, "0")}</div><div class="cd-label">Hours</div></div>
              <span class="countdown-sep">:</span>
              <div class="countdown-unit"><div class="cd-val">${String(mins).padStart(2, "0")}</div><div class="cd-label">Min</div></div>
              <span class="countdown-sep">:</span>
              <div class="countdown-unit"><div class="cd-val">${String(secs).padStart(2, "0")}</div><div class="cd-label">Sec</div></div>
            </div>
          </div>
        </div>`;
}

// ── Occupancy Donut Chart (SVG) for Admin ──
function renderOccupancyDonut(occupied, total) {
  if (!total || total === 0) return "";
  const pct = Math.round((occupied / total) * 100);
  const circumference = 2 * Math.PI * 45;
  const filled = (pct / 100) * circumference;
  const empty = circumference - filled;
  return `
        <div class="flex items-center gap-6 mb-4">
          <div class="occ-donut">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" stroke-width="12"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#C8A24A" stroke-width="12"
                stroke-dasharray="${filled} ${empty}"
                stroke-dashoffset="${circumference / 4}" stroke-linecap="round"
                style="transition: stroke-dasharray 1s ease;"/>
            </svg>
            <span class="occ-donut-text">${pct}%</span>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Occupancy Rate</p>
            <p class="text-2xl font-black text-slate-800">${occupied} / ${total}</p>
            <p class="text-[10px] text-slate-400 font-semibold mt-1">rooms occupied</p>
          </div>
        </div>`;
}

// ═══════════════════════════════════════════
//  ADD / EDIT PROPERTY SYSTEM
// ═══════════════════════════════════════════

const PRESET_FACILITIES = [
  "Double Bed",
  "Study Table & Chair",
  "Wardrobe",
  "Cupboard",
  "Attached Bathroom",
  "Common Bathroom",
  "Geyser",
  "Fan",
  "AC",
  "Mirror",
  "Curtains",
  "Power Backup",
  "Balcony",
];
const PRESET_AMENITIES = [
  "24/7 Water Supply",
  "High-Speed Wi-Fi",
  "Wi-Fi",
  "CCTV Security",
  "Parking",
  "Common Kitchen",
  "Laundry Area",
  "RO Drinking Water",
  "Daily Housekeeping",
  "Home-cooked Meals",
  "Gym Access",
  "Study Room",
  "Terrace Access",
  "Power Backup",
  "Elevator",
];
const PRESET_RULES = [
  "No smoking inside rooms",
  "Gate closes at 10:30 PM",
  "Gate closes at 10 PM",
  "Gate closes at 9:30 PM",
  "Visitors allowed till 8 PM",
  "Visitors allowed till 7 PM",
  "Keep noise levels low after 10 PM",
  "Keep common areas clean",
  "Meal timings to be followed",
  "No pets allowed",
  "No loud music",
];

let apmFloorCount = 0;
let apmEditMode = null; // null = new, propertyId = editing

// ── Open Add Property Modal ──
window.openAddPropertyModal = () => {
  apmEditMode = null;
  apmFloorCount = 0;
  // Reset form
  safeSet("apm-title", "textContent", "Add New Property");
  safeSet("apm-save-text", "textContent", "Save Property");
  [
    "apm-name",
    "apm-id",
    "apm-rent",
    "apm-desc",
    "apm-image",
    "apm-loc-address",
    "apm-loc-landmark",
    "apm-loc-pincode",
    "apm-loc-map",
  ].forEach((id) => safeSet(id, "value", ""));
  safeSet("apm-loc-city", "value", "Phagwara");
  safeSet("apm-type", "value", "Fully Furnished");
  safeSet("apm-elec-rate", "value", "13");
  safeSet("apm-maint-charge", "value", "300");
  safeSet("apm-security-default", "value", "0");
  const floorsContainer = byId("apm-floors-container");
  if (floorsContainer) floorsContainer.innerHTML = "";
  byId("apm-floor-preview")?.classList.add("hidden");
  safeSet("apm-total-rooms", "textContent", "0");
  safeSet("apm-total-floors", "textContent", "0");
  // ID field should be editable for new property
  const idField = byId("apm-id");
  if (idField) {
    idField.readOnly = false;
    idField.style.opacity = "1";
  }

  renderAPMBadges("apm-facilities-grid", PRESET_FACILITIES, []);
  renderAPMBadges("apm-amenities-grid", PRESET_AMENITIES, []);
  renderAPMBadges("apm-rules-grid", PRESET_RULES, []);

  const modal = byId("add-property-modal");
  if (modal) {
    modal.classList.remove("hidden");
    requestAnimationFrame(() =>
      byId("add-property-modal-content")?.classList.add("modal-open"),
    );
  }
};

// ── Open Edit Property Modal (edit current active building) ──
window.openEditPropertyModal = () => {
  const build = buildings.find((b) => b.id === state.activeBuilding);
  if (!build) return toast("Select a property first.", 3000);

  openAddPropertyModal(); // reuse the modal
  apmEditMode = build.id;

  safeSet("apm-title", "textContent", `Edit: ${build.name}`);
  safeSet("apm-save-text", "textContent", "Update Property");
  safeSet("apm-name", "value", build.name || "");
  safeSet("apm-id", "value", build.id || "");
  // Make ID read-only when editing
  const idField = byId("apm-id");
  if (idField) {
    idField.readOnly = true;
    idField.style.opacity = "0.5";
  }
  safeSet("apm-rent", "value", build.rent || "");
  safeSet("apm-type", "value", build.type || "Fully Furnished");
  safeSet("apm-desc", "value", build.desc || "");
  safeSet("apm-image", "value", build.image || "");

  // Location
  if (build.location) {
    safeSet("apm-loc-address", "value", build.location.address || "");
    safeSet("apm-loc-landmark", "value", build.location.landmark || "");
    safeSet("apm-loc-city", "value", build.location.city || "Phagwara");
    safeSet("apm-loc-pincode", "value", build.location.pincode || "");
    safeSet("apm-loc-map", "value", build.location.mapUrl || "");
  }

  // Billing defaults
  safeSet("apm-elec-rate", "value", build.elecRate || "13");
  safeSet("apm-maint-charge", "value", build.maintCharge || "300");
  safeSet("apm-security-default", "value", build.defaultSecurityDeposit || "0");

  // Badges
  renderAPMBadges(
    "apm-facilities-grid",
    PRESET_FACILITIES,
    build.facilities || [],
  );
  renderAPMBadges(
    "apm-amenities-grid",
    PRESET_AMENITIES,
    build.amenities || [],
  );
  renderAPMBadges("apm-rules-grid", PRESET_RULES, build.rules || []);

  // Floors
  const floorsContainer = byId("apm-floors-container");
  if (floorsContainer) floorsContainer.innerHTML = "";
  apmFloorCount = 0;

  // Load floor data from the current layout
  const layout = getLayoutForBuilding(build.id);
  layout.forEach((floor) => {
    const rooms =
      floor.rooms ||
      Array.from(
        { length: floor.end - floor.start + 1 },
        (_, i) => floor.start + i,
      );
    addFloorRow(floor.name, rooms.join(", "));
  });

  updateFloorPreview();
};

// ── Close Add Property Modal ──
window.closeAddPropertyModal = () => {
  const modal = byId("add-property-modal");
  const panel = byId("add-property-modal-content");
  if (panel) panel.classList.remove("modal-open");
  if (modal) {
    modal.style.transition = "opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1)";
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.style.opacity = "";
      modal.style.transition = "";
    }, 220);
  }
};

// ── Render clickable badge grid ──
function renderAPMBadges(containerId, presets, selected) {
  const container = byId(containerId);
  if (!container) return;
  // Combine presets + any custom selected items not in presets
  const all = [...new Set([...presets, ...selected])];
  container.innerHTML = all
    .map((item) => {
      const isActive = selected.includes(item);
      return `<button type="button" onclick="toggleAPMBadge(this)" data-value="${item}" data-active="${isActive}"
          class="apm-badge px-4 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer
          ${isActive ? "bg-[#C8A24A] text-white border-[#C8A24A]" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#C8A24A]"}">
          ${item}
        </button>`;
    })
    .join("");
}

window.toggleAPMBadge = (btn) => {
  const isActive = btn.dataset.active === "true";
  if (isActive) {
    btn.dataset.active = "false";
    btn.className =
      "apm-badge px-4 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer bg-slate-50 text-slate-500 border-slate-200 hover:border-[#C8A24A]";
  } else {
    btn.dataset.active = "true";
    btn.className =
      "apm-badge px-4 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer bg-[#C8A24A] text-white border-[#C8A24A]";
  }
};

function getSelectedBadges(containerId) {
  return Array.from(
    document.querySelectorAll(`#${containerId} .apm-badge[data-active="true"]`),
  ).map((b) => b.dataset.value);
}

// ── Floor Row Management ──
const FLOOR_NAMES = [
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Fourth Floor",
  "Fifth Floor",
  "Sixth Floor",
  "Seventh Floor",
];

window.addFloorRow = (name, roomsStr) => {
  const container = byId("apm-floors-container");
  if (!container) return;
  const idx = apmFloorCount++;
  const floorName = name || FLOOR_NAMES[idx] || `Floor ${idx + 1}`;
  const rooms = roomsStr || "";

  const row = document.createElement("div");
  row.className =
    "flex items-start gap-3 apm-floor-row bg-slate-50 rounded-2xl p-4 border border-slate-100";
  row.dataset.floorIdx = idx;
  row.innerHTML = `
        <div class="floor-badge flex-shrink-0 w-8 h-8 bg-[#C8A24A] rounded-xl flex items-center justify-center text-white text-xs font-black mt-1">${idx + 1}</div>
        <div class="flex-1 space-y-2">
          <input type="text" class="apm-floor-name input-field py-2 text-sm" value="${floorName}" placeholder="Floor name">
          <input type="text" class="apm-floor-rooms input-field py-2 text-sm" value="${rooms}" placeholder="Room numbers: 101, 102, 103" oninput="updateFloorPreview()">
          <p class="text-[9px] text-slate-400">Comma-separated room numbers. Tip: For range, use 101-108</p>
        </div>
        <button onclick="removeFloorRow(this)" class="w-8 h-8 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-xl transition-colors mt-1">
          <i class="fas fa-trash text-xs"></i>
        </button>
      `;
  container.appendChild(row);
  updateFloorPreview();
};

window.removeFloorRow = (btn) => {
  btn.closest(".apm-floor-row").remove();
  // Re-number
  let idx = 0;
  document.querySelectorAll(".apm-floor-row").forEach((row) => {
    row.dataset.floorIdx = idx;
    const badge = row.querySelector(".floor-badge");
    if (badge) badge.textContent = ++idx;
  });
  apmFloorCount = idx;
  updateFloorPreview();
};

// Parse rooms from string (supports "101, 102" and "101-108" range)
function parseRoomNumbers(str) {
  const rooms = [];
  str.split(",").forEach((part) => {
    part = part.trim();
    if (!part) return;
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) rooms.push(i);
      }
    } else {
      const n = Number(part);
      if (!isNaN(n)) rooms.push(n);
    }
  });
  return rooms;
}

function updateFloorPreview() {
  const preview = byId("apm-floor-preview");
  const content = byId("apm-floor-preview-content");
  if (!preview || !content) return;

  const floors = collectFloorData();
  if (!floors.length) {
    preview.classList.add("hidden");
    safeSet("apm-total-rooms", "textContent", "0");
    safeSet("apm-total-floors", "textContent", "0");
    return;
  }

  preview.classList.remove("hidden");
  let totalRooms = 0;
  content.innerHTML = floors
    .map((f) => {
      totalRooms += f.rooms.length;
      return `
          <div class="flex items-center gap-3 mb-2 last:mb-0">
            <span class="text-xs font-black text-slate-600 w-28 flex-shrink-0">${f.name}</span>
            <div class="flex flex-wrap gap-1.5">
              ${f.rooms.map((r) => `<span class="bg-white px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200">${r}</span>`).join("")}
            </div>
            <span class="text-[10px] text-slate-400 font-bold flex-shrink-0 ml-auto">${f.rooms.length} rooms</span>
          </div>`;
    })
    .join("");

  safeSet("apm-total-rooms", "textContent", totalRooms);
  safeSet("apm-total-floors", "textContent", floors.length);
}

function collectFloorData() {
  const rows = document.querySelectorAll(".apm-floor-row");
  const floors = [];
  rows.forEach((row) => {
    const name = row.querySelector(".apm-floor-name")?.value?.trim() || "Floor";
    const roomsStr = row.querySelector(".apm-floor-rooms")?.value || "";
    const rooms = parseRoomNumbers(roomsStr);
    if (rooms.length > 0) {
      floors.push({ name, rooms });
    }
  });
  return floors;
}

// ── Save Property to API ──
window.saveNewProperty = async () => {
  const name = safeGet("apm-name");
  const propertyId = safeGet("apm-id");

  if (!name || !propertyId) {
    return toast("Property Name and ID are required.", 3000);
  }

  const floors = collectFloorData();
  if (!floors.length) {
    return toast("Please add at least one floor with rooms.", 3000);
  }

  const data = {
    propertyId,
    name,
    rent: safeGet("apm-rent") || "0",
    type: safeGet("apm-type"),
    desc: safeGet("apm-desc"),
    image: safeGet("apm-image") || undefined,
    location: {
      address: safeGet("apm-loc-address"),
      landmark: safeGet("apm-loc-landmark"),
      city: safeGet("apm-loc-city") || "Phagwara",
      state: "Punjab",
      pincode: safeGet("apm-loc-pincode"),
      mapUrl: safeGet("apm-loc-map"),
    },
    floors,
    facilities: getSelectedBadges("apm-facilities-grid"),
    amenities: getSelectedBadges("apm-amenities-grid"),
    rules: getSelectedBadges("apm-rules-grid"),
    elecRate: Number(safeGet("apm-elec-rate")) || 13,
    maintCharge: Number(safeGet("apm-maint-charge")) || 300,
    defaultSecurityDeposit: Number(safeGet("apm-security-default")) || 0,
  };

  safeSet("apm-save-text", "textContent", "Saving...");

  try {
    const isEdit = !!apmEditMode;
    const url = isEdit
      ? `${API_BASE}/properties/${apmEditMode}`
      : `${API_BASE}/properties`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      toast(isEdit ? "Property updated!" : "Property created!");
      closeAddPropertyModal();
      // Reload properties from API
      await loadPropertiesFromAPI();
      renderLTabs();
      renderLandlordGrid();
      renderLandingUI();
    } else {
      toast(result.message || "Failed to save property.", 4000);
    }
  } catch (err) {
    console.error("[saveNewProperty]", err);
    toast("Server error. Check backend.", 4000);
  } finally {
    safeSet(
      "apm-save-text",
      "textContent",
      apmEditMode ? "Update Property" : "Save Property",
    );
  }
};

// ── Load properties from API into buildings array ──
async function loadPropertiesFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/properties`);
    const result = await res.json();
    if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
      // Merge API properties with hardcoded ones (API takes priority if same ID)
      const apiIds = new Set(result.data.map((p) => p.propertyId));
      const hardcodedOnly = buildings.filter((b) => !apiIds.has(b.id));

      const apiBuildings = result.data.map((p) => ({
        id: p.propertyId,
        name: p.name,
        rooms: p.totalRooms,
        rent: p.rent,
        image: p.image,
        type: p.type,
        desc: p.desc,
        facilities: p.facilities || [],
        amenities: p.amenities || [],
        rules: p.rules || [],
        location: p.location || {},
        floors: p.floors || [],
        elecRate: p.elecRate,
        maintCharge: p.maintCharge,
        defaultSecurityDeposit: p.defaultSecurityDeposit,
        _fromAPI: true,
      }));

      // Only clear if we actually have API properties
      if (apiBuildings.length > 0) {
        buildings.length = 0;
        buildings.push(...apiBuildings, ...hardcodedOnly);
      }

      // Ensure activeBuilding is valid
      if (!buildings.find((b) => b.id === state.activeBuilding)) {
        state.activeBuilding = buildings[0]?.id;
      }

      // Update getLayoutForBuilding to handle API properties
      // (already handled via floors data)
    } else {
      console.warn("[loadProperties] API returned no valid properties, keeping hardcoded ones.");
    }
  } catch (err) {
    console.warn(
      "[loadProperties] API request failed, keeping hardcoded properties.",
      err,
    );
  }
}

// Patch getLayoutForBuilding to support API-sourced properties
const _origGetLayout = getLayoutForBuilding;
getLayoutForBuilding = function (id) {
  const build = buildings.find((b) => b.id === id);
  if (build && build._fromAPI && build.floors && build.floors.length > 0) {
    return build.floors.map((f) => ({
      name: f.name,
      rooms: f.rooms,
    }));
  }
  return _origGetLayout(id);
};

// ── Load properties on page load ──
// Called from run() before renderLandingUI
async function initProperties() {
  await loadPropertiesFromAPI();
}

// ═══════════════════════════════════════
// FEATURE: Bookings & Waitlist (7)
// ═══════════════════════════════════════
window.showNewBookingForm = () => {
  const f = byId("new-booking-form");
  if (!f) return;
  f.classList.remove("hidden");
  const sel = byId("bk-building");
  if (sel && sel.options.length <= 1)
    buildings.forEach((b) => {
      const o = document.createElement("option");
      o.value = b.id;
      o.textContent = b.name;
      sel.appendChild(o);
    });
};
window.loadBookings = async () => {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const d = await res.json();
    if (!d.success) return;
    const list = byId("bookings-list");
    if (!list) return;
    const stats = {
      pending: 0,
      confirmed: 0,
      waitlist: 0,
      "checked-in": 0,
      cancelled: 0,
    };
    d.data.forEach((b) => {
      if (stats[b.status] !== undefined) stats[b.status]++;
    });
    safeSet("booking-stat-pending", "textContent", stats.pending);
    safeSet("booking-stat-confirmed", "textContent", stats.confirmed);
    safeSet("booking-stat-waitlist", "textContent", stats.waitlist);
    safeSet("booking-stat-checkedin", "textContent", stats["checked-in"]);
    if (d.data.length === 0) {
      list.innerHTML =
        '<p class="text-slate-400 text-xs text-center py-8">No bookings yet</p>';
      return;
    }
    const statusColors = {
      pending: "amber",
      confirmed: "emerald",
      waitlist: "blue",
      cancelled: "slate",
      "checked-in": "violet",
    };
    list.innerHTML = d.data
      .map((b) => {
        const c = statusColors[b.status] || "slate";
        return `<div class="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1"><p class="text-sm font-black text-slate-800">${b.name} <span class="text-[9px] font-bold uppercase px-2 py-1 rounded-lg bg-${c}-100 text-${c}-600 ml-2">${b.status}</span></p>
            <p class="text-xs text-slate-500 mt-1"><i class="fas fa-phone mr-1"></i>${b.phone || "N/A"} &bull; <i class="fas fa-building mr-1"></i>${b.buildingId || "Any"} &bull; <i class="fas fa-calendar mr-1"></i>${b.moveInDate || "TBD"}</p>
            ${b.notes ? `<p class="text-[10px] text-slate-400 mt-1">${b.notes}</p>` : ""}</div>
            <div class="flex gap-2 flex-shrink-0">
              ${b.status === "pending" ? `<button onclick="updateBookingStatus('${b._id}','confirmed')" class="px-3 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition">✓ Confirm</button><button onclick="updateBookingStatus('${b._id}','waitlist')" class="px-3 py-2 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition">Waitlist</button>` : ""}
              ${b.status === "confirmed" ? `<button onclick="updateBookingStatus('${b._id}','checked-in')" class="px-3 py-2 rounded-lg bg-violet-500 text-white text-[10px] font-bold hover:bg-violet-600 transition">Check In</button>` : ""}
              ${b.status === "waitlist" ? `<button onclick="updateBookingStatus('${b._id}','confirmed')" class="px-3 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition">✓ Confirm</button>` : ""}
              <button onclick="deleteBookingItem('${b._id}')" class="px-3 py-2 rounded-lg bg-rose-100 text-rose-500 text-[10px] font-bold hover:bg-rose-200 transition"><i class="fas fa-trash"></i></button>
            </div></div>`;
      })
      .join("");
  } catch (e) {
    console.error("[loadBookings]", e);
  }
};
window.saveBooking = async () => {
  const data = {
    name: safeGet("bk-name"),
    phone: safeGet("bk-phone"),
    email: safeGet("bk-email"),
    college: safeGet("bk-college"),
    buildingId: safeGet("bk-building"),
    preferredRoomType: safeGet("bk-room-type"),
    moveInDate: safeGet("bk-movein"),
    leadSource: safeGet("bk-source"),
    notes: safeGet("bk-notes"),
  };
  if (!data.name || !data.phone) {
    toast("Name and Phone required");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.success) {
      toast("Booking saved!");
      byId("new-booking-form")?.classList.add("hidden");
      loadBookings();
    } else toast(d.message || "Failed");
  } catch (e) {
    toast("Error saving booking");
  }
};
window.updateBookingStatus = async (id, status) => {
  try {
    await fetch(`${API_BASE}/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status }),
    });
    loadBookings();
    toast(`Booking ${status}`);
  } catch (e) {
    toast("Error");
  }
};
window.deleteBookingItem = async (id) => {
  if (!confirm("Delete this booking?")) return;
  try {
    await fetch(`${API_BASE}/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    loadBookings();
    toast("Deleted");
  } catch (e) {
    toast("Error");
  }
};

// ═══════════════════════════════════════
// FEATURE: Housekeeping (8)
// ═══════════════════════════════════════
window.showNewHkTaskForm = () => {
  byId("new-hk-form")?.classList.remove("hidden");
  const sel = byId("hk-building");
  if (sel && sel.options.length <= 1)
    buildings.forEach((b) => {
      const o = document.createElement("option");
      o.value = b.id;
      o.textContent = b.name;
      sel.appendChild(o);
    });
};
window.loadHousekeeping = async () => {
  try {
    const res = await fetch(`${API_BASE}/housekeeping`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const d = await res.json();
    if (!d.success) return;
    const list = byId("housekeeping-list");
    if (!list) return;
    const stats = { scheduled: 0, "in-progress": 0, completed: 0, overdue: 0 };
    d.data.forEach((t) => {
      if (stats[t.status] !== undefined) stats[t.status]++;
    });
    safeSet("hk-stat-scheduled", "textContent", stats.scheduled);
    safeSet("hk-stat-progress", "textContent", stats["in-progress"]);
    safeSet("hk-stat-completed", "textContent", stats.completed);
    safeSet("hk-stat-overdue", "textContent", stats.overdue);
    if (d.data.length === 0) {
      list.innerHTML =
        '<p class="text-slate-400 text-xs text-center py-8">No tasks</p>';
      return;
    }
    const pColor = {
      low: "slate",
      normal: "blue",
      high: "amber",
      urgent: "rose",
    };
    const sColor = {
      scheduled: "blue",
      "in-progress": "amber",
      completed: "emerald",
      overdue: "rose",
      cancelled: "slate",
    };
    list.innerHTML = d.data
      .map(
        (
          t,
        ) => `<div class="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex-1"><p class="text-sm font-bold text-slate-800"><span class="w-2 h-2 rounded-full bg-${pColor[t.priority]}-500 inline-block mr-2"></span>${t.taskType.replace(/-/g, " ")} <span class="text-[9px] font-bold uppercase px-2 py-1 rounded-lg bg-${sColor[t.status]}-100 text-${sColor[t.status]}-600 ml-2">${t.status}</span></p>
          <p class="text-xs text-slate-500 mt-1">${t.buildingId} ${t.roomNo ? "· Room " + t.roomNo : "· Common"} &bull; ${t.scheduledDate || "Unscheduled"} ${t.assignedTo ? "&bull; " + t.assignedTo : ""}</p>
          ${t.description ? `<p class="text-[10px] text-slate-400 mt-1">${t.description}</p>` : ""}
          ${t.recurring !== "none" ? `<span class="text-[9px] font-bold text-violet-500 mt-1 inline-block"><i class="fas fa-repeat mr-1"></i>${t.recurring}</span>` : ""}</div>
          <div class="flex gap-2 flex-shrink-0">
            ${t.status === "scheduled" ? `<button onclick="updateHkStatus('${t._id}','in-progress')" class="px-3 py-2 rounded-lg bg-amber-500 text-white text-[10px] font-bold transition">Start</button>` : ""}
            ${t.status === "in-progress" ? `<button onclick="updateHkStatus('${t._id}','completed')" class="px-3 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-bold transition">✓ Done</button>` : ""}
            <button onclick="deleteHkTask('${t._id}')" class="px-3 py-2 rounded-lg bg-rose-100 text-rose-500 text-[10px] font-bold transition"><i class="fas fa-trash"></i></button>
          </div></div>`,
      )
      .join("");
  } catch (e) {
    console.error("[loadHousekeeping]", e);
  }
};
window.saveHkTask = async () => {
  const data = {
    buildingId: safeGet("hk-building"),
    roomNo: Number(safeGet("hk-room")) || 0,
    taskType: safeGet("hk-type"),
    priority: safeGet("hk-priority"),
    scheduledDate: safeGet("hk-date"),
    assignedTo: safeGet("hk-assigned"),
    recurring: safeGet("hk-recurring"),
    description: safeGet("hk-desc"),
  };
  if (!data.buildingId) {
    toast("Select a property");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/housekeeping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.success) {
      toast("Task created!");
      byId("new-hk-form")?.classList.add("hidden");
      loadHousekeeping();
    }
  } catch (e) {
    toast("Error");
  }
};
window.updateHkStatus = async (id, status) => {
  try {
    await fetch(`${API_BASE}/housekeeping/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status }),
    });
    loadHousekeeping();
  } catch (e) {
    toast("Error");
  }
};
window.deleteHkTask = async (id) => {
  if (!confirm("Delete?")) return;
  try {
    await fetch(`${API_BASE}/housekeeping/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    loadHousekeeping();
  } catch (e) {
    toast("Error");
  }
};

// ═══════════════════════════════════════
// FEATURE: Agreements (14)
// ═══════════════════════════════════════
window.showNewAgreementForm = () => {
  byId("new-agreement-form")?.classList.remove("hidden");
  const sel = byId("agr-building");
  if (sel && sel.options.length <= 1)
    buildings.forEach((b) => {
      const o = document.createElement("option");
      o.value = b.id;
      o.textContent = b.name;
      sel.appendChild(o);
    });
};
window.loadAgreements = async () => {
  try {
    const res = await fetch(`${API_BASE}/agreements`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const d = await res.json();
    if (!d.success) return;
    const list = byId("agreements-list");
    if (!list) return;
    let drafts = 0,
      pending = 0,
      signed = 0,
      expiring = 0;
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    d.data.forEach((a) => {
      if (a.status === "draft") drafts++;
      if (a.status === "sent" || a.status === "tenant-signed") pending++;
      if (a.status === "fully-signed") {
        signed++;
        if (new Date(a.endDate) <= soon) expiring++;
      }
    });
    safeSet("agr-stat-draft", "textContent", drafts);
    safeSet("agr-stat-pending", "textContent", pending);
    safeSet("agr-stat-signed", "textContent", signed);
    safeSet("agr-stat-expiring", "textContent", expiring);
    if (d.data.length === 0) {
      list.innerHTML =
        '<p class="text-slate-400 text-xs text-center py-8">No agreements</p>';
      return;
    }
    const sc = {
      draft: "slate",
      sent: "amber",
      "tenant-signed": "blue",
      "fully-signed": "emerald",
      expired: "rose",
      terminated: "slate",
    };
    list.innerHTML = d.data
      .map(
        (a) => `<div class="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1"><p class="text-sm font-black text-slate-800">${a.tenantName} — Room ${a.roomNo} <span class="text-[9px] font-bold uppercase px-2 py-1 rounded-lg bg-${sc[a.status] || "slate"}-100 text-${sc[a.status] || "slate"}-600 ml-2">${a.status}</span></p>
            <p class="text-xs text-slate-500 mt-1">${a.buildingId} &bull; ₹${(a.rentAmount || 0).toLocaleString("en-IN")}/mo &bull; ${a.startDate} → ${a.endDate}</p>
            <div class="flex gap-3 mt-2"><span class="text-[10px] ${a.tenantSigned ? "text-emerald-500" : "text-slate-400"}"><i class="fas ${a.tenantSigned ? "fa-check-circle" : "fa-circle"} mr-1"></i>Tenant</span>
            <span class="text-[10px] ${a.landlordSigned ? "text-emerald-500" : "text-slate-400"}"><i class="fas ${a.landlordSigned ? "fa-check-circle" : "fa-circle"} mr-1"></i>Landlord</span></div></div>
            <div class="flex gap-2 flex-shrink-0">
              ${!a.landlordSigned ? `<button onclick="signAgreementAs('${a._id}','landlord')" class="px-3 py-2 rounded-lg bg-violet-500 text-white text-[10px] font-bold transition">Sign as Landlord</button>` : ""}
              <button onclick="deleteAgreementItem('${a._id}')" class="px-3 py-2 rounded-lg bg-rose-100 text-rose-500 text-[10px] font-bold transition"><i class="fas fa-trash"></i></button>
            </div></div></div>`,
      )
      .join("");
  } catch (e) {
    console.error("[loadAgreements]", e);
  }
};
window.saveAgreement = async () => {
  const data = {
    buildingId: safeGet("agr-building"),
    roomNo: Number(safeGet("agr-room")),
    tenantName: safeGet("agr-tenant"),
    tenantPhone: safeGet("agr-phone"),
    startDate: safeGet("agr-start"),
    endDate: safeGet("agr-end"),
    rentAmount: Number(safeGet("agr-rent")),
    securityDeposit: Number(safeGet("agr-deposit")),
    specialConditions: safeGet("agr-special"),
  };
  if (
    !data.tenantName ||
    !data.startDate ||
    !data.endDate ||
    !data.rentAmount
  ) {
    toast("Fill required fields");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/agreements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.success) {
      toast("Agreement created!");
      byId("new-agreement-form")?.classList.add("hidden");
      loadAgreements();
    }
  } catch (e) {
    toast("Error");
  }
};
window.signAgreementAs = async (id, role) => {
  const sig = prompt(`Enter your name to sign as ${role}:`);
  if (!sig) return;
  try {
    await fetch(`${API_BASE}/agreements/${id}/sign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, signature: sig }),
    });
    toast("Signed!");
    loadAgreements();
  } catch (e) {
    toast("Error");
  }
};
window.deleteAgreementItem = async (id) => {
  if (!confirm("Delete?")) return;
  try {
    await fetch(`${API_BASE}/agreements/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    loadAgreements();
  } catch (e) {
    toast("Error");
  }
};

// ═══════════════════════════════════════
// FEATURE: Owner Reports (18) + Advanced Analytics (12)
// ═══════════════════════════════════════
window.generateOwnerReport = async () => {
  try {
    const res = await fetch(`${API_BASE}/rooms/analytics/revenue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const d = await res.json();
    if (!d.success) return;
    const a = d.data;
    // Populate selectors
    const rSel = byId("report-building");
    if (rSel && rSel.options.length <= 1)
      buildings.forEach((b) => {
        const o = document.createElement("option");
        o.value = b.id;
        o.textContent = b.name;
        rSel.appendChild(o);
      });
    // Summary cards
    const totalRev = a.revenueData.reduce((s, r) => s + r.amount, 0);
    safeSet(
      "report-revenue",
      "textContent",
      "₹" + totalRev.toLocaleString("en-IN"),
    );
    safeSet("report-occupancy", "textContent", (a.occupancy?.rate || 0) + "%");
    safeSet(
      "report-dues",
      "textContent",
      "₹" +
      (
        (a.financial?.totalUnpaidRent || 0) +
        (a.financial?.totalUnpaidElec || 0)
      ).toLocaleString("en-IN"),
    );
    // Building breakdown
    const bbEl = byId("report-building-breakdown");
    if (bbEl && a.buildingStats) {
      bbEl.innerHTML = Object.entries(a.buildingStats)
        .map(([bid, s]) => {
          const bName = buildings.find((b) => b.id === bid)?.name || bid;
          const occ =
            s.rooms > 0 ? Math.round((s.occupied / s.rooms) * 100) : 0;
          return `<div class="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between"><div><p class="text-sm font-bold text-slate-800">${bName}</p><p class="text-[10px] text-slate-400">${s.occupied} occupied / ${s.rooms} rooms (${occ}%)</p></div><div class="text-right"><p class="text-lg font-black text-emerald-600">₹${(s.revenue || 0).toLocaleString("en-IN")}</p><p class="text-[9px] text-slate-400">Total Revenue</p></div></div>`;
        })
        .join("");
    }
    // Electricity
    const elEl = byId("report-electricity");
    if (elEl && a.electricityData) {
      elEl.innerHTML = Object.entries(a.electricityData)
        .map(([bid, e]) => {
          const bName = buildings.find((b) => b.id === bid)?.name || bid;
          return `<div class="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between"><div><p class="text-sm font-bold text-slate-800">${bName}</p><p class="text-[10px] text-slate-400">${e.rooms} rooms consuming ${e.totalUnits} units</p></div><div class="text-right"><p class="text-lg font-black text-amber-600">₹${(e.totalCost || 0).toLocaleString("en-IN")}</p><p class="text-[9px] text-slate-400">Electricity Cost</p></div></div>`;
        })
        .join("");
    }
    // Retention
    const rtEl = byId("report-retention");
    if (rtEl && a.tenantRetention) {
      rtEl.innerHTML = `<div class="bg-white rounded-xl p-5 border border-slate-100 text-center"><p class="text-4xl font-black text-blue-600">${a.tenantRetention.avgDurationMonths} mo</p><p class="text-xs text-slate-400 mt-1">Average Tenant Stay Duration</p><p class="text-sm font-bold text-slate-600 mt-2">${a.tenantRetention.totalActive} active tenants</p></div>`;
    }
    // Update advanced analytics tab too
    if (a.financial) {
      safeSet(
        "analytics-monthly-rent",
        "textContent",
        "₹" +
        (a.financial.projectedMonthlyRevenue || 0).toLocaleString("en-IN"),
      );
      safeSet(
        "analytics-annual-proj",
        "textContent",
        "₹" + (a.financial.projectedAnnualRevenue || 0).toLocaleString("en-IN"),
      );
    }
    toast("Report generated!");
  } catch (e) {
    console.error("[generateOwnerReport]", e);
    toast("Error generating report");
  }
};

// ═══════════════════════════════════════
// FEATURE: PDF Invoice/Receipt (4)
// ═══════════════════════════════════════
window.generateInvoicePDF = (bid, rno) => {
  const t = state.tenants[`${bid}-${rno}`];
  if (!t) {
    toast("No tenant data");
    return;
  }
  const bName = buildings.find((b) => b.id === bid)?.name || bid;
  const units =
    Math.max(0, (t.elecCurrent || 0) - (t.elecLast || 0)) +
    Math.max(0, (t.invCurrent || 0) - (t.invLast || 0));
  const elecBill = units * (t.elecRate || 13) + (t.maintCharge || 300);
  const total = (t.rentAmount || 0) + elecBill;
  const month = new Date().toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const invoiceNo = "INV-" + Date.now().toString(36).toUpperCase();
  let html = `<div style="font-family:system-ui;max-width:600px;margin:auto;padding:40px;border:2px solid #c8a24a;border-radius:16px">
        <div style="text-align:center;margin-bottom:30px"><h1 style="color:#1e293b;font-size:28px;margin:0">ANVI STAY</h1><p style="color:#64748b;font-size:12px;margin:4px 0">Student Housing · We Listen, We Care, You Stay</p><hr style="border:1px solid #c8a24a;margin:16px 0"></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:20px"><div><p style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:800;letter-spacing:2px">Invoice To</p><p style="font-size:16px;font-weight:800;color:#1e293b">${t.name || "Tenant"}</p><p style="font-size:12px;color:#64748b">${bName} · Room ${rno}</p><p style="font-size:12px;color:#64748b">${t.phone || ""}</p></div>
        <div style="text-align:right"><p style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:800;letter-spacing:2px">Invoice</p><p style="font-size:14px;font-weight:800;color:#c8a24a">${invoiceNo}</p><p style="font-size:12px;color:#64748b">${month}</p><p style="font-size:12px;color:#64748b">${new Date().toLocaleDateString("en-IN")}</p></div></div>
        <table style="width:100%;border-collapse:collapse;margin:20px 0"><thead><tr style="background:#f8fafc"><th style="padding:10px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Description</th><th style="padding:10px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0">Amount</th></tr></thead><tbody>
        <tr><td style="padding:10px;font-size:13px;border-bottom:1px solid #f1f5f9">Monthly Rent</td><td style="padding:10px;text-align:right;font-weight:700;border-bottom:1px solid #f1f5f9">₹${(t.rentAmount || 0).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:10px;font-size:13px;border-bottom:1px solid #f1f5f9">Electricity (${units} units × ₹${t.elecRate || 13})</td><td style="padding:10px;text-align:right;font-weight:700;border-bottom:1px solid #f1f5f9">₹${(units * (t.elecRate || 13)).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:10px;font-size:13px;border-bottom:1px solid #f1f5f9">Maintenance Charge</td><td style="padding:10px;text-align:right;font-weight:700;border-bottom:1px solid #f1f5f9">₹${(t.maintCharge || 300).toLocaleString("en-IN")}</td></tr>
        <tr style="background:#fefce8"><td style="padding:12px;font-size:15px;font-weight:900">TOTAL</td><td style="padding:12px;text-align:right;font-size:18px;font-weight:900;color:#c8a24a">₹${total.toLocaleString("en-IN")}</td></tr></tbody></table>
        <div style="background:#f0fdf4;padding:12px;border-radius:8px;margin-top:16px"><p style="font-size:10px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1px">Payment Status: ${t.rentPaid && t.elecPaid ? "✓ PAID" : "⏳ PENDING"}</p></div>
        <p style="text-align:center;margin-top:24px;font-size:10px;color:#94a3b8">Thank you for staying with ANVI STAY!</p></div>`;
  const w = window.open("", "_blank");
  w.document.write(
    `<!DOCTYPE html><html><head><title>Invoice ${invoiceNo}</title></head><body style="margin:0;padding:20px;background:#f8fafc">${html}<div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:12px 32px;background:#1e293b;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px">🖨️ Print / Save PDF</button></div></body></html>`,
  );
  w.document.close();
};

// ═══════════════════════════════════════
// FEATURE: QR Code Guest Check-in (3)
// ═══════════════════════════════════════
window.generateQRCheckin = (bid, rno) => {
  const bName = buildings.find((b) => b.id === bid)?.name || bid;
  const qrData = encodeURIComponent(
    `${window.location.origin}${window.location.pathname}?guest=${bid}-${rno}`,
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  const w = window.open("", "_blank");
  w.document
    .write(`<!DOCTYPE html><html><head><title>Guest QR - Room ${rno}</title></head><body style="margin:0;padding:40px;font-family:system-ui;text-align:center;background:#f8fafc">
        <div style="max-width:400px;margin:auto;background:white;padding:40px;border-radius:20px;box-shadow:0 8px 30px rgba(0,0,0,0.08)">
        <h1 style="color:#1e293b;font-size:24px;margin:0 0 4px">ANVI STAY</h1>
        <p style="color:#c8a24a;font-size:12px;font-weight:700;margin:0 0 20px">GUEST CHECK-IN</p>
        <img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;margin:16px auto;display:block;border-radius:12px">
        <p style="font-size:18px;font-weight:800;color:#1e293b;margin:16px 0 4px">${bName}</p>
        <p style="font-size:14px;color:#64748b">Room ${rno}</p>
        <p style="font-size:10px;color:#94a3b8;margin-top:20px">Scan this QR code to register as a visitor</p>
        <button onclick="window.print()" style="margin-top:16px;padding:10px 24px;background:#1e293b;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer">🖨️ Print QR</button>
        </div></body></html>`);
  w.document.close();
};

// ═══════════════════════════════════════
// FEATURE: AI Chatbot (17)
// ═══════════════════════════════════════
(function initChatbot() {
  const chatHTML = `<div id="chatbot-widget" style="position:fixed;bottom:24px;right:24px;z-index:9999">
        <div id="chatbot-window" style="display:none;width:360px;max-width:90vw;height:480px;background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.15);border:1px solid #e2e8f0;overflow:hidden;flex-direction:column;margin-bottom:12px">
          <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:10px"><div style="width:36px;height:36px;background:linear-gradient(135deg,#c8a24a,#e8c94a);border-radius:10px;display:flex;align-items:center;justify-content:center"><i class="fas fa-robot" style="color:white;font-size:16px"></i></div><div><p style="color:white;font-weight:800;font-size:14px;margin:0">ANVI Assistant</p><p style="color:rgba(255,255,255,0.5);font-size:10px;margin:0"><span style="width:6px;height:6px;background:#34d399;border-radius:50%;display:inline-block;margin-right:4px"></span>Online</p></div></div>
            <button onclick="toggleChatbot()" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px"><i class="fas fa-times"></i></button></div>
          <div id="chatbot-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;height:340px"></div>
          <div style="padding:12px 16px;border-top:1px solid #f1f5f9;display:flex;gap:8px"><input id="chatbot-input" type="text" placeholder="Ask me anything..." style="flex:1;padding:10px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')sendChatMessage()"><button onclick="sendChatMessage()" style="width:40px;height:40px;background:#c8a24a;border:none;border-radius:12px;color:white;cursor:pointer"><i class="fas fa-paper-plane"></i></button></div></div>
        <button id="chatbot-fab" onclick="toggleChatbot()" style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#c8a24a,#b8922f);border:none;color:white;font-size:22px;cursor:pointer;box-shadow:0 8px 30px rgba(200,162,74,0.4);transition:transform 0.2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fas fa-comment-dots"></i></button></div>`;
  document.body.insertAdjacentHTML("beforeend", chatHTML);
  // Initial message
  setTimeout(() => {
    addBotMessage(
      "Hi! 👋 I'm the ANVI Stay Assistant. Ask me about rooms, prices, amenities, or anything else!",
    );
  }, 1000);
})();
window.toggleChatbot = () => {
  const w = byId("chatbot-window");
  if (w) {
    w.style.display = w.style.display === "none" ? "flex" : "none";
  }
};
function addBotMessage(text) {
  const c = byId("chatbot-messages");
  if (!c) return;
  c.innerHTML += `<div style="align-self:flex-start;background:#f1f5f9;padding:10px 14px;border-radius:14px 14px 14px 4px;max-width:85%;font-size:13px;color:#334155;line-height:1.5">${text}</div>`;
  c.scrollTop = c.scrollHeight;
}
function addUserMessage(text) {
  const c = byId("chatbot-messages");
  if (!c) return;
  c.innerHTML += `<div style="align-self:flex-end;background:linear-gradient(135deg,#c8a24a,#b8922f);padding:10px 14px;border-radius:14px 14px 4px 14px;max-width:85%;font-size:13px;color:white;line-height:1.5">${text}</div>`;
  c.scrollTop = c.scrollHeight;
}
window.sendChatMessage = () => {
  const input = byId("chatbot-input");
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";
  addUserMessage(msg);
  const lower = msg.toLowerCase();
  let reply = "";
  if (lower.includes("room") || lower.includes("available"))
    reply =
      "We have rooms starting from ₹7,000/month in multiple PG properties near LPU. All rooms come with double beds. WhatsApp us at +91 91422 72776 for current availability! 🏠";
  else if (
    lower.includes("price") ||
    lower.includes("rent") ||
    lower.includes("cost") ||
    lower.includes("fee")
  )
    reply =
      "Our rent ranges from ₹5,000 to ₹12,000/month depending on room type and property. This includes Wi-Fi, water, and basic amenities. Electricity is charged at ₹13/unit. Security deposit is typically 1 month's rent. 💰";
  else if (
    lower.includes("amenity") ||
    lower.includes("facility") ||
    lower.includes("wifi") ||
    lower.includes("food")
  )
    reply =
      "We offer: 🔌 24/7 Power Backup, 📶 High-speed Wi-Fi, 🍽️ Meals (optional), 🏋️ Gym Access, 🧹 Regular Housekeeping, 📹 CCTV Security, 🚿 Geyser/Hot Water, 🪑 Furnished Rooms, 🏪 Common Room, and 👕 Laundry Service!";
  else if (
    lower.includes("location") ||
    lower.includes("where") ||
    lower.includes("address") ||
    lower.includes("lpu")
  )
    reply =
      "We're located just 2-5 minutes from LPU campus in Phagwara, Punjab. Multiple properties available in the LPU vicinity. Contact us for exact locations! 📍";
  else if (
    lower.includes("contact") ||
    lower.includes("phone") ||
    lower.includes("whatsapp") ||
    lower.includes("call")
  )
    reply =
      "📞 Call: +91 91422 72776\n💬 WhatsApp: <a href='https://wa.me/919142272776' target='_blank' style='color:#c8a24a'>Chat Now</a>\n📧 Email: anvistay.official@gmail.com\n📸 Instagram: @anvistay";
  else if (
    lower.includes("book") ||
    lower.includes("reserve") ||
    lower.includes("register")
  )
    reply =
      "You can book a room directly through WhatsApp! Just send us your details (name, course, preferred property, move-in date) at +91 91422 72776. No brokerage! 🎉";
  else if (lower.includes("deposit") || lower.includes("security"))
    reply =
      "Security deposit is typically equal to 1 month's rent. It's fully refundable at the time of move-out after deducting any pending dues. 🔒";
  else if (
    lower.includes("rule") ||
    lower.includes("policy") ||
    lower.includes("regulation")
  )
    reply =
      "Key rules: 🚫 No smoking/alcohol on premises, ⏰ Gate closes at 10:30 PM (extendable with prior notice), 👥 Visitors allowed till 8 PM, 📋 Valid ID required for check-in, 📱 30 days notice before vacating.";
  else if (
    lower.includes("hi") ||
    lower.includes("hello") ||
    lower.includes("hey")
  )
    reply =
      "Hello! 😊 How can I help you today? You can ask about rooms, pricing, amenities, location, or booking process!";
  else if (lower.includes("thank"))
    reply = "You're welcome! 😊 Feel free to ask anything else. Happy to help!";
  else
    reply =
      "I'd be happy to help! For specific queries about availability and pricing, please WhatsApp us at +91 91422 72776. You can also ask me about rooms, amenities, location, rules, or the booking process! 🏠";
  setTimeout(() => addBotMessage(reply), 600);
};

// ═══════════════════════════════════════
// FEATURE: Push Notifications (2)
// ═══════════════════════════════════════
window.requestNotifPermission = async () => {
  if (!("Notification" in window)) {
    toast("Browser does not support notifications");
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    toast("🔔 Notifications enabled!");
    new Notification("ANVI STAY", {
      body: "You will now receive important alerts!",
      icon: "assets/img/logo.png",
    });
  } else toast("Notification permission denied");
};
window.sendLocalNotif = (title, body) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "assets/img/logo.png" });
  }
};

// ═══════════════════════════════════════
// FEATURE: Tenant Analytics (1) - rendered inline in tenant dashboard
// ═══════════════════════════════════════
window.renderTenantAnalytics = (t) => {
  const history = t.paymentHistory || [];
  if (history.length === 0) return "";
  const monthlyTotals = {};
  history.forEach((p) => {
    const m = p.month || "Unknown";
    monthlyTotals[m] = (monthlyTotals[m] || 0) + (p.amount || 0);
  });
  const months = Object.entries(monthlyTotals).slice(-6);
  const maxAmt = Math.max(...months.map((m) => m[1]), 1);
  const totalPaid = history.reduce((s, p) => s + (p.amount || 0), 0);
  return `<div class="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7 mb-6 sm:mb-8">
        <div class="flex items-center gap-2 mb-5"><div class="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center"><i class="fas fa-chart-bar text-violet-500"></i></div><div><p class="text-xs font-black uppercase tracking-widest text-slate-500">Spending Analytics</p><p class="text-[10px] text-slate-400 font-medium">Total paid: ₹${totalPaid.toLocaleString("en-IN")}</p></div></div>
        <div class="flex items-end gap-2 h-32 mb-3">${months.map(([m, a]) => `<div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-lg transition-all" style="height:${Math.max(8, (a / maxAmt) * 100)}%;background:linear-gradient(to top,#c8a24a,#e8c94a)"></div><p class="text-[8px] font-bold text-slate-400 text-center truncate w-full">${m.split(" ")[0]?.substring(0, 3) || m}</p></div>`).join("")}</div>
        <div class="grid grid-cols-3 gap-3 mt-4">
          <div class="bg-slate-50 rounded-xl p-3 text-center"><p class="text-lg font-black text-slate-800">₹${totalPaid.toLocaleString("en-IN")}</p><p class="text-[8px] font-bold text-slate-400 uppercase">Total Paid</p></div>
          <div class="bg-slate-50 rounded-xl p-3 text-center"><p class="text-lg font-black text-slate-800">${history.length}</p><p class="text-[8px] font-bold text-slate-400 uppercase">Payments</p></div>
          <div class="bg-slate-50 rounded-xl p-3 text-center"><p class="text-lg font-black text-slate-800">₹${months.length > 0 ? Math.round(totalPaid / months.length).toLocaleString("en-IN") : "0"}</p><p class="text-[8px] font-bold text-slate-400 uppercase">Avg/Month</p></div>
        </div></div>`;
};

// ═══════════════════════════════════════
// TAB REFRESH HOOKS
// ═══════════════════════════════════════
const _origSetAdminTab = window.setAdminTab;
window.setAdminTab = (tab) => {
  _origSetAdminTab(tab);
  if (tab === "bookings") loadBookings();
  if (tab === "housekeeping") loadHousekeeping();
  if (tab === "agreements") loadAgreements();
  if (tab === "owner-reports") {
    const rSel = byId("report-building");
    if (rSel && rSel.options.length <= 1)
      buildings.forEach((b) => {
        const o = document.createElement("option");
        o.value = b.id;
        o.textContent = b.name;
        rSel.appendChild(o);
      });
  }
};

// ═══════════════════════════════════════
// UI/UX ENHANCEMENTS #6 - #15
// ═══════════════════════════════════════

// ── #6: Welcome Banner with Time-Based Greeting ──
function updateAdminGreeting() {
  const now = new Date();
  const h = now.getHours();
  let greeting = "Good Morning ☀️";
  if (h >= 12 && h < 17) greeting = "Good Afternoon 🌤️";
  else if (h >= 17 && h < 21) greeting = "Good Evening 🌇";
  else if (h >= 21 || h < 5) greeting = "Good Night 🌙";

  const adminName = localStorage.getItem("anvi_admin_name") || "Admin";
  const greetEl = byId("admin-greeting");
  if (greetEl) greetEl.textContent = `${greeting}, ${adminName} 👋`;

  const dateEl = byId("admin-greeting-date");
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const timeEl = byId("admin-greeting-time");
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}
// Update time every second when admin is logged in
let greetingInterval;
function startGreetingClock() {
  updateAdminGreeting();
  if (greetingInterval) clearInterval(greetingInterval);
  greetingInterval = setInterval(updateAdminGreeting, 1000);
}

// ── #7: Pending Actions Widget ──
function updatePendingActions() {
  const container = byId("admin-pending-actions");
  const list = byId("pending-action-list");
  const count = byId("pending-action-count");
  if (!container || !list) return;

  const items = [];
  const allRooms = Object.values(state.tenants || {});

  // Count unpaid rent
  const unpaidCount = allRooms.filter((r) => r && !r.rentPaid && r.name).length;
  if (unpaidCount > 0) {
    items.push(`
      <div class="bg-rose-50 border border-rose-100 rounded-2xl p-4 cursor-pointer hover:bg-rose-100 transition-colors flex items-center gap-3" onclick="setAdminTab('billing')">
        <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <i class="fas fa-indian-rupee-sign text-rose-500 text-sm"></i>
        </div>
        <div>
          <p class="text-rose-800 font-black text-sm">${unpaidCount} Unpaid Dues</p>
          <p class="text-rose-500 text-[10px] font-bold">Tenants with pending rent</p>
        </div>
      </div>
    `);
  }

  // Count open complaints
  let openComplaints = 0;
  allRooms.forEach((r) => {
    if (r && r.complaints) {
      openComplaints += r.complaints.filter(
        (c) => c.status === "open" || c.status === "pending",
      ).length;
    }
  });
  if (openComplaints > 0) {
    items.push(`
      <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 transition-colors flex items-center gap-3" onclick="setAdminTab('maintenance')">
        <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <i class="fas fa-comment-dots text-amber-500 text-sm"></i>
        </div>
        <div>
          <p class="text-amber-800 font-black text-sm">${openComplaints} Open Complaints</p>
          <p class="text-amber-500 text-[10px] font-bold">Require your attention</p>
        </div>
      </div>
    `);
  }

  // Count vacant rooms
  const vacantCount = allRooms.filter((r) => r && !r.name && r.roomNo).length;
  if (vacantCount > 0) {
    items.push(`
      <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-3" onclick="setAdminTab('inventory')">
        <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <i class="fas fa-door-open text-blue-500 text-sm"></i>
        </div>
        <div>
          <p class="text-blue-800 font-black text-sm">${vacantCount} Vacant Rooms</p>
          <p class="text-blue-500 text-[10px] font-bold">Ready for new tenants</p>
        </div>
      </div>
    `);
  }

  if (items.length > 0) {
    container.classList.remove("hidden");
    list.innerHTML = items.join("");
    if (count) count.textContent = items.length;
  } else {
    container.classList.add("hidden");
  }
}

// ── #8: Chart Animation Utility ──
function animateCountUp(el, target, duration = 800) {
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^\d]/g, "")) || 0;
  const diff = target - start;
  if (diff === 0) return;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(start + diff * eased);
    el.textContent = el.dataset.prefix
      ? el.dataset.prefix + current.toLocaleString("en-IN")
      : current.toLocaleString("en-IN");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── #9 & #10: Quick Actions + Payment Timeline for Tenant ──
// These inject into the tenant dashboard render
const _origFetchTenantDashboard = window.fetchTenantDashboard;
window.fetchTenantDashboard = async function () {
  await _origFetchTenantDashboard.apply(this, arguments);

  const dash = byId("tenant-dash");
  if (!dash || dash.classList.contains("hidden")) return;

  // #9: Insert Quick Actions after the welcome card
  const welcomeCard = dash.querySelector(".green-gradient");
  if (welcomeCard && !dash.querySelector("#tenant-quick-actions")) {
    const quickActionsHtml = `
      <div id="tenant-quick-actions" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 sm:mb-8">
        <button onclick="document.querySelector('#tenant-complaint-section')?.scrollIntoView({behavior:'smooth'})"
          class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center group-hover:scale-110 transition">
            <i class="fas fa-wrench text-rose-500"></i>
          </div>
          <p class="text-xs font-black text-slate-700">Request</p>
          <p class="text-[9px] font-bold text-slate-400">Maintenance</p>
        </button>
        <button onclick="document.querySelector('#tenant-billing-section')?.scrollIntoView({behavior:'smooth'})"
          class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition">
            <i class="fas fa-indian-rupee-sign text-emerald-500"></i>
          </div>
          <p class="text-xs font-black text-slate-700">Pay Rent</p>
          <p class="text-[9px] font-bold text-slate-400">View Bills</p>
        </button>
        <button onclick="document.querySelector('#tenant-payment-timeline')?.scrollIntoView({behavior:'smooth'})"
          class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center group-hover:scale-110 transition">
            <i class="fas fa-receipt text-violet-500"></i>
          </div>
          <p class="text-xs font-black text-slate-700">Receipts</p>
          <p class="text-[9px] font-bold text-slate-400">History</p>
        </button>
        <a href="https://wa.me/919142272776" target="_blank" rel="noopener noreferrer"
          class="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all group no-underline">
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 transition">
            <i class="fab fa-whatsapp text-green-500 text-lg"></i>
          </div>
          <p class="text-xs font-black text-slate-700">Support</p>
          <p class="text-[9px] font-bold text-slate-400">WhatsApp</p>
        </a>
      </div>
    `;
    welcomeCard.insertAdjacentHTML("afterend", quickActionsHtml);
  }

  // #10: Add Payment Timeline
  const billingSection = dash
    .querySelector('[class*="Spending Analytics"]')
    ?.closest(".bg-white");
  if (
    billingSection &&
    !dash.querySelector("#tenant-payment-timeline") &&
    state.tenantLogin
  ) {
    try {
      const bid = state.tenantLogin.bid;
      const rno = state.tenantLogin.rno;
      const res = await fetch(`${API_BASE}/rooms/tenant-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: bid,
          roomNo: Number(rno),
          password: state.tenantLogin.pass,
        }),
      });
      const result = await res.json();
      if (
        result.success &&
        result.data.paymentHistory &&
        result.data.paymentHistory.length > 0
      ) {
        const history = result.data.paymentHistory
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);
        const timelineItems = history
          .map((p, i) => {
            const d = new Date(p.date);
            const month = d.toLocaleDateString("en-IN", { month: "short" });
            const day = d.getDate();
            const year = d.getFullYear();
            const isLatest = i === 0;
            return `
            <div class="flex gap-4 ${i < history.length - 1 ? "pb-5" : ""} relative">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLatest ? "bg-emerald-100" : "bg-slate-100"}">
                  <i class="fas fa-check text-sm ${isLatest ? "text-emerald-500" : "text-slate-400"}"></i>
                </div>
                ${i < history.length - 1 ? '<div class="w-px flex-1 bg-slate-200 mt-2"></div>' : ""}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-bold text-slate-800">${p.description || "Rent Payment"}</p>
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-black ${p.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}">${(p.status || "paid").toUpperCase()}</span>
                </div>
                <p class="text-xs text-slate-400 font-semibold mt-0.5">${day} ${month} ${year}</p>
                <p class="text-base font-black text-slate-800 mt-1">₹${(p.amount || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>
          `;
          })
          .join("");

        const timelineHtml = `
          <div id="tenant-payment-timeline" class="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7 mb-6 sm:mb-8">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <i class="fas fa-timeline text-emerald-500"></i>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-widest text-slate-500">Payment Timeline</p>
                <p class="text-[10px] text-slate-400 font-medium">Last ${history.length} transactions</p>
              </div>
            </div>
            ${timelineItems}
          </div>
        `;
        billingSection.insertAdjacentHTML("afterend", timelineHtml);
      }
    } catch (e) {
      console.warn("[timeline]", e);
    }
  }
};

// ── #11: Page Transition Animations ──
let _appLoaded = false;
setTimeout(() => {
  _appLoaded = true;
}, 1500); // Only animate after initial load

const _origSwitchView = window.switchView;
window.switchView = (v, fromPopstate = false) => {
  // Skip transition-colors on initial page load to avoid blocking navigation
  if (!_appLoaded) {
    _origSwitchView(v, fromPopstate);
    if (v === "landlord") {
      startGreetingClock();
      setTimeout(updatePendingActions, 1000);
    }
    return;
  }

  // Get current active view for exit animation
  const currentView = document.querySelector(".view-section.active");
  if (currentView && currentView.id !== `view-${v}`) {
    currentView.style.animation = "viewFadeOut 0.2s ease forwards";
    setTimeout(() => {
      currentView.style.animation = "";
      _origSwitchView(v, fromPopstate);
      const newView = byId(`view-${v}`);
      if (newView) {
        newView.style.animation = "viewFadeIn 0.4s ease forwards";
        setTimeout(() => (newView.style.animation = ""), 500);
      }
      // Start greeting clock when entering admin
      if (v === "landlord") {
        startGreetingClock();
        setTimeout(updatePendingActions, 1000);
      }
    }, 200);
  } else {
    _origSwitchView(v, fromPopstate);
    if (v === "landlord") {
      startGreetingClock();
      setTimeout(updatePendingActions, 1000);
    }
  }
};

// ── #12: Empty State Illustrations ──
window.emptyStateHtml = (title, subtitle, icon = "fa-inbox") => `
  <div class="empty-state flex flex-col items-center justify-center py-12 sm:py-16">
    <div class="w-20 h-20 rounded-full mb-6 flex items-center justify-center" style="background: linear-gradient(135deg, rgba(200,162,74,0.08), rgba(200,162,74,0.15))">
      <i class="fas ${icon} text-3xl" style="color: rgba(200,162,74,0.5)"></i>
    </div>
    <h4 class="text-base font-black text-slate-700 mb-2">${title}</h4>
    <p class="text-sm text-slate-400 font-medium text-center max-w-xs">${subtitle}</p>
  </div>
`;

// ── #13: Toast Notification Variants ──
// Use arrow function to avoid conflicting with original toast declaration
window.toast = (msg, timeoutOrType = 3000, type = "default") => {
  let timeout = 3000;
  if (typeof timeoutOrType === "string") {
    type = timeoutOrType;
  } else {
    timeout = timeoutOrType;
  }

  const t = byId("toast");
  const inner = byId("toast-inner");
  if (!t || !inner) return;

  const variants = {
    success: {
      icon: "✅",
      bg: "linear-gradient(135deg, #065f46, #064e3b)",
      border: "rgba(16,185,129,0.3)",
    },
    error: {
      icon: "❌",
      bg: "linear-gradient(135deg, #7f1d1d, #991b1b)",
      border: "rgba(244,63,94,0.3)",
    },
    warning: {
      icon: "⚠️",
      bg: "linear-gradient(135deg, #78350f, #92400e)",
      border: "rgba(245,158,11,0.3)",
    },
    info: {
      icon: "ℹ️",
      bg: "linear-gradient(135deg, #1e3a5f, #1e40af)",
      border: "rgba(59,130,246,0.3)",
    },
    default: { icon: "", bg: "", border: "" },
  };

  const v = variants[type] || variants.default;

  if (v.bg) {
    inner.style.background = v.bg;
    inner.style.borderColor = v.border;
  } else {
    inner.style.background = "";
    inner.style.borderColor = "";
  }

  inner.textContent = v.icon ? `${v.icon} ${msg}` : msg;
  t.classList.remove("hidden");
  clearTimeout(t._toastTimer);
  t._toastTimer = setTimeout(() => {
    t.classList.add("hidden");
    inner.style.background = "";
    inner.style.borderColor = "";
  }, timeout);
};

// ── #14: Button Loading States ──
window.btnLoading = (btn, loading = true, text = "") => {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.pointerEvents = "none";
    btn.innerHTML = `<span class="btn-spinner"></span> ${text || "Processing..."}`;
  } else {
    btn.disabled = false;
    btn.style.opacity = "";
    btn.style.pointerEvents = "";
    btn.innerHTML = btn.dataset.originalText || text || btn.innerHTML;
  }
};

// ── #15: Keyboard Shortcuts ──
document.addEventListener("keydown", (e) => {
  // Only when admin panel is visible
  const isAdmin = byId("view-landlord")?.classList.contains("active");

  // Escape to close drawers/modals
  if (e.key === "Escape") {
    // Close any open admin drawer
    document.querySelectorAll(".admin-drawer.open").forEach((d) => {
      d.classList.remove("open");
    });
    // Close mobile sidebar
    byId("admin-sidebar")?.classList.remove("mobile-open");
    byId("admin-mobile-backdrop")?.classList.remove("show");
    // Close notification dropdowns
    document
      .querySelectorAll(".notif-dropdown")
      .forEach((d) => d.classList.remove("show"));
    return;
  }

  // Alt + key shortcuts (admin only)
  if (isAdmin && e.altKey && !e.ctrlKey && !e.metaKey) {
    const shortcuts = {
      d: "dashboard",
      b: "billing",
      i: "inventory",
      m: "maintenance",
      n: "notices",
      a: "analytics",
      u: "upi",
      g: "guests",
      k: "bookings",
      h: "housekeeping",
      r: "owner-reports",
      e: "agreements",
      t: "audit-trail",
    };
    const tab = shortcuts[e.key.toLowerCase()];
    if (tab) {
      e.preventDefault();
      window.setAdminTab(tab);
      window.toast(`📌 ${adminTabTitles[tab] || tab}`, 1500);
    }
  }
});

// ── #11 (cont): Scroll Reveal for Admin Cards ──
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  // Observe scroll-reveal elements when DOM is ready
  setTimeout(() => {
    document
      .querySelectorAll(".scroll-reveal")
      .forEach((el) => revealObserver.observe(el));
  }, 1000);
}

// Add audit-trail to tab titles
adminTabTitles["audit-trail"] = "Audit Trail";

// ══════════════════════════════════════════════════════════════
// ══  PHASE 2: NEW UI/UX FEATURES  ══════════════════════════
// ══════════════════════════════════════════════════════════════

// ── #1: Room Image Gallery with Lightbox ──
buildings.forEach((b) => {
  if (!b.gallery) {
    b.gallery = [
      b.image,
      b.image.replace("q=80", "q=75&fit=crop&w=800&h=600"),
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=800",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800",
    ];
  }
});

window.openLightbox = (buildingIdx, imgIdx = 0) => {
  const p = buildings[buildingIdx];
  if (!p || !p.gallery) return;
  let current = imgIdx;
  const overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";
  overlay.className =
    "fixed inset-0 z-[99999] flex items-center justify-center";
  overlay.style.cssText =
    "background:rgba(0,0,0,0.92);animation:viewFadeIn 0.3s ease";

  function renderLB() {
    overlay.innerHTML = `
      <button onclick="document.getElementById('lightbox-overlay')?.remove()" class="absolute top-5 right-5 w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center text-xl hover:bg-white/20 transition-colors z-10" style="backdrop-filter:blur(8px)"><i class="fas fa-xmark"></i></button>
      <button onclick="window._lbPrev()" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center text-lg hover:bg-white/20 transition-colors z-10"><i class="fas fa-chevron-left"></i></button>
      <button onclick="window._lbNext()" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center text-lg hover:bg-white/20 transition-colors z-10"><i class="fas fa-chevron-right"></i></button>
      <img src="${p.gallery[current]}" alt="${p.name}" class="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" style="animation:viewFadeIn 0.3s ease">
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        ${p.gallery.map((_, i) => `<div class="w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-[#C8A24A] scale-125" : "bg-white/30"}" onclick="window._lbGo(${i})"></div>`).join("")}
      </div>
      <p class="absolute bottom-14 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold">${current + 1} / ${p.gallery.length} — ${p.name}</p>
    `;
  }
  window._lbNext = () => {
    current = (current + 1) % p.gallery.length;
    renderLB();
  };
  window._lbPrev = () => {
    current = (current - 1 + p.gallery.length) % p.gallery.length;
    renderLB();
  };
  window._lbGo = (i) => {
    current = i;
    renderLB();
  };
  renderLB();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
};

// ── #2: Rent Calculator Widget ──
window.calcRent = () => {
  const type = byId("calc-room-type")?.value || "12000";
  const units = parseInt(byId("calc-elec-units")?.value) || 0;
  const rent = parseInt(type);
  const elec = units * 13;
  const maint = 300;
  const total = rent + elec + maint;
  const result = byId("calc-result");
  if (result) {
    result.innerHTML = `
      <div class="grid grid-cols-2 gap-3 mt-4">
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-lg font-black text-[#C8A24A]">₹${rent.toLocaleString("en-IN")}</p><p class="text-[9px] font-bold text-slate-400 uppercase">Base Rent</p></div>
        <div class="bg-blue-50 rounded-xl p-3 text-center"><p class="text-lg font-black text-blue-600">₹${elec.toLocaleString("en-IN")}</p><p class="text-[9px] font-bold text-slate-400 uppercase">${units} units × ₹13</p></div>
        <div class="bg-emerald-50 rounded-xl p-3 text-center"><p class="text-lg font-black text-emerald-600">₹${maint}</p><p class="text-[9px] font-bold text-slate-400 uppercase">Maintenance</p></div>
        <div class="rounded-xl p-3 text-center" style="background:linear-gradient(135deg,rgba(200,162,74,0.1),rgba(200,162,74,0.05))"><p class="text-xl font-black text-[#C8A24A]">₹${total.toLocaleString("en-IN")}</p><p class="text-[9px] font-bold text-slate-400 uppercase">Total / Month</p></div>
      </div>
    `;
    result.style.animation = "viewFadeIn 0.4s ease";
  }
};

// Inject calculator HTML after properties section loads
setTimeout(() => {
  const propertiesSection = document.querySelector("#properties");
  if (propertiesSection && !byId("rent-calculator")) {
    const calcHtml = `
    <section id="rent-calculator" class="py-16 sm:py-24" style="background:linear-gradient(180deg,#f1f0ec 0%,#ffffff 100%)">
      <div class="container mx-auto px-6 max-w-2xl">
        <div class="text-center mb-8">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A24A] mb-3"><i class="fas fa-calculator mr-2"></i>Cost Estimator</p>
          <h2 class="text-[clamp(1.75rem,4.5vw,3rem)] font-black tracking-tighter mb-3">Rent Calculator</h2>
          <p class="text-gray-400 text-sm font-medium">Get an instant estimate of your monthly costs</p>
        </div>
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Property</label>
              <select id="calc-room-type" onchange="calcRent()" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#C8A24A] focus:ring-2 focus:ring-[#C8A24A]/20 outline-none transition">
                <option value="12000">SP Bhargav 1 — ₹12,000</option>
                <option value="11500">SP Bhargav 2 / 3 — ₹11,500</option>
                <option value="10000">Comfort Corner — ₹10,000</option>
                <option value="9500">Ambey Apartment 2 — ₹9,500</option>
                <option value="9000">Ambey Apartment 1 — ₹9,000</option>
                <option value="8500">SKG Apartment — ₹8,500</option>
                <option value="7500">NS Pariyal — ₹7,500</option>
                <option value="7000">Blessing PG — ₹7,000</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Electricity Units (est.)</label>
              <input type="number" id="calc-elec-units" value="30" min="0" max="500" oninput="calcRent()" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#C8A24A] focus:ring-2 focus:ring-[#C8A24A]/20 outline-none transition" placeholder="e.g. 30">
            </div>
          </div>
          <div id="calc-result"></div>
        </div>
      </div>
    </section>`;
    propertiesSection.insertAdjacentHTML("afterend", calcHtml);
    calcRent();
  }
}, 2500);

// ── #3: Compare Rooms ──
let compareList = [];
window.toggleCompare = (idx, e) => {
  if (e) e.stopPropagation();
  const i = compareList.indexOf(idx);
  if (i > -1) compareList.splice(i, 1);
  else if (compareList.length < 3) compareList.push(idx);
  else {
    window.toast("Max 3 rooms to compare", "warning");
    return;
  }
  updateCompareBar();
};

function updateCompareBar() {
  let bar = byId("compare-bar");
  if (compareList.length === 0) {
    bar?.remove();
    return;
  }
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "compare-bar";
    bar.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4";
    bar.style.cssText =
      "background:linear-gradient(135deg,#1F3D2B,#2a5438);animation:viewFadeIn 0.3s ease;backdrop-filter:blur(12px)";
    document.body.appendChild(bar);
  }
  bar.innerHTML = `
    <span class="text-white text-sm font-bold"><i class="fas fa-scale-balanced mr-2 text-[#C8A24A]"></i>${compareList.length} selected</span>
    <button onclick="openCompareModal()" class="bg-[#C8A24A] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#b8922a] transition">Compare Now</button>
    <button onclick="compareList=[];updateCompareBar()" class="text-white/60 hover:text-white text-xs"><i class="fas fa-xmark"></i></button>
  `;
}

window.openCompareModal = () => {
  if (compareList.length < 2) {
    window.toast("Select at least 2 properties", "warning");
    return;
  }
  const props = compareList.map((i) => buildings[i]);
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[99999] flex items-center justify-center p-4";
  overlay.style.cssText =
    "background:rgba(0,0,0,0.7);animation:viewFadeIn 0.3s ease";
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[85vh] overflow-auto shadow-2xl" style="animation:viewFadeIn 0.4s ease">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-black"><i class="fas fa-scale-balanced text-[#C8A24A] mr-2"></i>Room Comparison</h3>
        <button onclick="this.closest('.fixed').remove()" class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b"><th class="py-3 px-4 text-left text-xs font-black text-slate-400 uppercase">Feature</th>${props.map((p) => `<th class="py-3 px-4 text-center"><img src="${p.image}" class="w-16 h-12 object-cover rounded-lg mx-auto mb-2"><span class="font-black text-sm">${p.name}</span></th>`).join("")}</tr></thead>
          <tbody>
            <tr class="border-b"><td class="py-3 px-4 font-bold">Rent</td>${props.map((p) => `<td class="py-3 px-4 text-center font-black text-[#C8A24A]">₹${(+p.rent).toLocaleString("en-IN")}/mo</td>`).join("")}</tr>
            <tr class="border-b bg-slate-50"><td class="py-3 px-4 font-bold">Rooms</td>${props.map((p) => `<td class="py-3 px-4 text-center font-bold">${p.rooms}</td>`).join("")}</tr>
            <tr class="border-b"><td class="py-3 px-4 font-bold">Type</td>${props.map((p) => `<td class="py-3 px-4 text-center text-xs">${p.type}</td>`).join("")}</tr>
            <tr class="border-b bg-slate-50"><td class="py-3 px-4 font-bold">Wi-Fi</td>${props.map((p) => `<td class="py-3 px-4 text-center">${p.amenities?.includes("High-Speed Wi-Fi") || p.amenities?.includes("Wi-Fi") ? "✅" : "❌"}</td>`).join("")}</tr>
            <tr class="border-b"><td class="py-3 px-4 font-bold">CCTV</td>${props.map((p) => `<td class="py-3 px-4 text-center">${p.amenities?.includes("CCTV Security") || p.amenities?.includes("CCTV") ? "✅" : "❌"}</td>`).join("")}</tr>
            <tr class="border-b bg-slate-50"><td class="py-3 px-4 font-bold">Kitchen</td>${props.map((p) => `<td class="py-3 px-4 text-center">${p.amenities?.includes("Common Kitchen") ? "✅" : "❌"}</td>`).join("")}</tr>
            <tr class="border-b"><td class="py-3 px-4 font-bold">Parking</td>${props.map((p) => `<td class="py-3 px-4 text-center">${p.amenities?.includes("Parking") ? "✅" : "❌"}</td>`).join("")}</tr>
            <tr><td class="py-3 px-4 font-bold">Facilities</td>${props.map((p) => `<td class="py-3 px-4 text-center text-xs text-slate-500">${(p.facilities || []).join(", ")}</td>`).join("")}</tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
};

// ── #5: PWA Install Prompt ──
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const visits = parseInt(localStorage.getItem("anvi_visits") || "0") + 1;
  localStorage.setItem("anvi_visits", visits);
  if (visits >= 2 && !localStorage.getItem("anvi_pwa_dismissed")) {
    setTimeout(showPWABanner, 3000);
  }
});

function showPWABanner() {
  if (byId("pwa-banner") || !deferredPrompt) return;
  const banner = document.createElement("div");
  banner.id = "pwa-banner";
  banner.className =
    "fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-white rounded-2xl shadow-2xl p-4 sm:p-5 flex items-center gap-4 border border-[#C8A24A]/20 max-w-md mx-4";
  banner.style.cssText = "animation:viewFadeIn 0.5s ease";
  banner.innerHTML = `
    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A24A] to-[#b8922a] flex items-center justify-center flex-shrink-0"><i class="fas fa-mobile-screen text-white text-lg"></i></div>
    <div class="flex-1"><p class="text-sm font-black text-slate-800">Add to Home Screen</p><p class="text-[10px] text-slate-400 font-medium">Quick access to ANVI STAY anytime</p></div>
    <div class="flex gap-2 flex-shrink-0">
      <button onclick="installPWA()" class="bg-[#C8A24A] text-white px-3 py-2 rounded-xl text-xs font-black hover:bg-[#b8922a] transition">Install</button>
      <button onclick="dismissPWA()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-xmark"></i></button>
    </div>
  `;
  document.body.appendChild(banner);
}

window.installPWA = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") window.toast("App installed! 🎉", "success");
  deferredPrompt = null;
  byId("pwa-banner")?.remove();
};

window.dismissPWA = () => {
  localStorage.setItem("anvi_pwa_dismissed", "true");
  byId("pwa-banner")?.remove();
};

// ── #7: PDF Receipt (using simple print window) ──
window.downloadReceipt = (payment, pgName, roomNo) => {
  const win = window.open("", "_blank");
  if (!win) {
    window.toast("Please allow popups", "warning");
    return;
  }
  win.document.write(`
    <!DOCTYPE html><html><head><title>Receipt — ANVI STAY</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:600px;margin:0 auto;color:#333}
      .header{text-align:center;border-bottom:3px solid #C8A24A;padding-bottom:20px;margin-bottom:30px}
      .logo{font-size:28px;font-weight:900;color:#C8A24A;letter-spacing:-1px}
      .tag{font-size:10px;color:#999;letter-spacing:3px;text-transform:uppercase}
      .receipt-box{background:#f9f9f7;border:1px solid #eee;border-radius:12px;padding:24px;margin:20px 0}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #eee}
      .row:last-child{border-bottom:none}
      .label{color:#888;font-size:13px}.value{font-weight:700;font-size:14px}
      .total{background:linear-gradient(135deg,#C8A24A,#b8922a);color:white;padding:16px;border-radius:12px;text-align:center;margin-top:20px}
      .total .amt{font-size:28px;font-weight:900}.total .lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.8}
      .footer{text-align:center;margin-top:30px;color:#999;font-size:10px}
      @media print{body{padding:20px}}
    </style></head>
    <body>
      <div class="header"><div class="logo">ANVI STAY</div><div class="tag">We Listen • We Care • You Stay</div></div>
      <h2 style="text-align:center;font-size:18px;margin-bottom:5px">Payment Receipt</h2>
      <p style="text-align:center;color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div class="receipt-box">
        <div class="row"><span class="label">PG Name</span><span class="value">${pgName || "ANVI STAY"}</span></div>
        <div class="row"><span class="label">Room No</span><span class="value">${roomNo || "N/A"}</span></div>
        <div class="row"><span class="label">Description</span><span class="value">${payment.description || payment.type || "Rent Payment"}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${payment.paidAt || payment.date || "N/A"}</span></div>
        <div class="row"><span class="label">UTR Number</span><span class="value">${payment.utrNumber || "N/A"}</span></div>
        <div class="row"><span class="label">Month</span><span class="value">${payment.month || "N/A"}</span></div>
        <div class="row"><span class="label">Status</span><span class="value" style="color:#10b981">✅ PAID</span></div>
      </div>
      <div class="total"><div class="lbl">Amount Paid</div><div class="amt">₹${(payment.amount || 0).toLocaleString("en-IN")}</div></div>
      <div class="footer"><p>This is a system-generated receipt from ANVI STAY Property Management.</p><p>For queries: +91 91422 72776 | anvistay.official@gmail.com</p></div>
      <script>window.onload=function(){window.print()}</script>
    </body></html>
  `);
  win.document.close();
};

// ── #8: Move-in Checklist ──
window.renderMoveInChecklist = (container) => {
  if (!container) return;
  const room = state.tenantRoom;
  if (!room) return;
  const checks = [
    {
      key: "profile_photo",
      label: "Upload Profile Photo",
      icon: "fa-camera",
      done: !!room.photoUrl,
    },
    {
      key: "aadhaar",
      label: "Upload ID Proof (Aadhaar)",
      icon: "fa-id-card",
      done: !!room.aadhaarUrl,
    },
    {
      key: "agreement",
      label: "Sign Rental Agreement",
      icon: "fa-file-signature",
      done: !!room.rentalAgreementSigned,
    },
    {
      key: "password",
      label: "Set Portal Password",
      icon: "fa-lock",
      done: true,
    },
    {
      key: "emergency",
      label: "Check Room Amenities",
      icon: "fa-clipboard-check",
      done: room.amenities?.length > 0,
    },
  ];
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  if (pct === 100 && localStorage.getItem("anvi_checklist_dismissed")) return;

  container.insertAdjacentHTML(
    "afterbegin",
    `
    <div id="move-in-checklist" class="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-100 mb-6" style="animation:viewFadeIn 0.5s ease">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-black text-slate-800"><i class="fas fa-clipboard-list text-[#C8A24A] mr-2"></i>Move-in Checklist</h3>
        ${pct === 100 ? "<button onclick=\"localStorage.setItem('anvi_checklist_dismissed','true');byId('move-in-checklist')?.remove()\" class=\"text-xs text-slate-400 hover:text-slate-600\"><i class=\"fas fa-xmark\"></i></button>" : `<span class="text-xs font-bold text-[#C8A24A]">${pct}%</span>`}
      </div>
      <div class="w-full bg-slate-100 rounded-full h-2 mb-4"><div class="h-2 rounded-full transition-all duration-700" style="width:${pct}%;background:linear-gradient(90deg,#C8A24A,#10b981)"></div></div>
      <div class="space-y-2">
        ${checks
      .map(
        (c) => `
          <div class="flex items-center gap-3 py-2 px-3 rounded-xl ${c.done ? "bg-emerald-50" : "bg-slate-50"}">
            <i class="fas ${c.done ? "fa-check-circle text-emerald-500" : c.icon + " text-slate-300"} text-sm"></i>
            <span class="text-sm font-semibold ${c.done ? "text-emerald-700 line-through" : "text-slate-600"}">${c.label}</span>
          </div>
        `,
      )
      .join("")}
      </div>
    </div>
  `,
  );
};

// ── #10: Dark Mode Toggle for Tenant Portal ──
setTimeout(() => {
  const tenantView = byId("view-tenant");
  if (tenantView) {
    const existingToggle = tenantView.querySelector(".dark-toggle-tenant");
    if (!existingToggle) {
      const topBar = tenantView.querySelector(
        '.bg-gradient-to-r, [class*="bg-"]',
      );
      if (topBar) {
        const toggle = document.createElement("button");
        toggle.className =
          "dark-toggle-tenant w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10";
        toggle.style.cssText =
          "position:absolute;top:16px;right:60px;z-index:50;color:white";
        toggle.innerHTML = document.body.classList.contains("dark-mode")
          ? '<i class="fas fa-sun text-yellow-300"></i>'
          : '<i class="fas fa-moon"></i>';
        toggle.onclick = () => {
          document.body.classList.toggle("dark-mode");
          localStorage.setItem(
            "darkMode",
            document.body.classList.contains("dark-mode"),
          );
          toggle.innerHTML = document.body.classList.contains("dark-mode")
            ? '<i class="fas fa-sun text-yellow-300"></i>'
            : '<i class="fas fa-moon"></i>';
        };
        topBar.style.position = "relative";
        topBar.appendChild(toggle);
      }
    }
  }
}, 2000);

// ── #11: Bulk Broadcast UI ──
window.openBroadcastModal = () => {
  const rooms = state.rooms || [];
  const bldgs = [...new Set(rooms.map((r) => r.buildingId))];
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[99999] flex items-center justify-center p-4";
  overlay.style.cssText =
    "background:rgba(0,0,0,0.6);animation:viewFadeIn 0.3s ease";
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl" style="animation:viewFadeIn 0.4s ease">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-black"><i class="fab fa-whatsapp text-green-500 mr-2"></i>Broadcast Message</h3>
        <button onclick="this.closest('.fixed').remove()" class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="space-y-4">
        <div>
          <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Send To</label>
          <select id="broadcast-target" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
            <option value="all">All Tenants</option>
            ${bldgs.map((b) => `<option value="${b}">${b}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Template</label>
          <select id="broadcast-template" onchange="byId('broadcast-msg').value=this.value" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
            <option value="">Custom Message</option>
            <option value="Dear Tenant, your rent for this month is due. Please pay at the earliest. — ANVI STAY">Rent Reminder</option>
            <option value="Notice: Maintenance work will be carried out tomorrow. Please cooperate. — ANVI STAY">Maintenance Notice</option>
            <option value="Important: Please ensure gate closes by 10:30 PM. Thank you for cooperating. — ANVI STAY">Gate Timing</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Message</label>
          <textarea id="broadcast-msg" rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none resize-none" placeholder="Type your message..."></textarea>
        </div>
        <button onclick="sendBroadcast()" class="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition" style="background:linear-gradient(135deg,#25d366,#128c7e)">
          <i class="fab fa-whatsapp"></i> Send to All
        </button>
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
};

window.sendBroadcast = () => {
  const target = byId("broadcast-target")?.value;
  const msg = byId("broadcast-msg")?.value;
  if (!msg) {
    window.toast("Please enter a message", "warning");
    return;
  }
  const rooms = state.rooms || [];
  let recipients = rooms.filter((r) => r.status === "Occupied" && r.phone);
  if (target !== "all")
    recipients = recipients.filter((r) => r.buildingId === target);
  const count = recipients.length;
  if (count === 0) {
    window.toast("No tenants found", "warning");
    return;
  }

  recipients.forEach((r, i) => {
    setTimeout(() => {
      const url = `https://wa.me/91${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    }, i * 800);
  });
  window.toast(`Opening ${count} WhatsApp chats...`, "success");
  document
    .querySelector('.fixed[style*="background:rgba(0,0,0,0.6)"]')
    ?.remove();
};

// ── #12: Enhanced Charts (inject Chart.js) ──
if (!document.querySelector('script[src*="chart.js"]')) {
  const chartScript = document.createElement("script");
  chartScript.src =
    "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
  document.head.appendChild(chartScript);
}

window.renderAnalyticsCharts = () => {
  const container = byId("admin-sub-analytics");
  if (!container || typeof Chart === "undefined") return;
  const rooms = state.rooms || [];
  const occupied = rooms.filter((r) => r.status === "Occupied").length;
  const vacant = rooms.filter((r) => r.status === "Vacant").length;
  const booked = rooms.filter((r) => r.status === "Booked").length;
  const totalRent = rooms.reduce(
    (s, r) => s + (r.status === "Occupied" ? r.rentAmount || 0 : 0),
    0,
  );
  const rentPaid = rooms.filter((r) => r.rentPaid).length;
  const rentDue = rooms.filter(
    (r) => r.status === "Occupied" && !r.rentPaid,
  ).length;

  const chartsDiv = container.querySelector("#analytics-charts");
  if (chartsDiv) return; // already rendered

  const html = `
    <div id="analytics-charts" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
        <h4 class="text-sm font-black text-slate-700 mb-4"><i class="fas fa-chart-pie text-[#C8A24A] mr-2"></i>Occupancy</h4>
        <canvas id="chart-occupancy" height="200"></canvas>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
        <h4 class="text-sm font-black text-slate-700 mb-4"><i class="fas fa-chart-bar text-blue-500 mr-2"></i>Rent Collection</h4>
        <canvas id="chart-rent" height="200"></canvas>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);

  setTimeout(() => {
    const ctx1 = byId("chart-occupancy")?.getContext("2d");
    if (ctx1)
      new Chart(ctx1, {
        type: "doughnut",
        data: {
          labels: ["Occupied", "Vacant", "Booked"],
          datasets: [
            {
              data: [occupied, vacant, booked],
              backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: { font: { weight: "bold", size: 11 } },
            },
          },
        },
      });

    const ctx2 = byId("chart-rent")?.getContext("2d");
    if (ctx2)
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: ["Expected", "Collected", "Pending"],
          datasets: [
            {
              data: [
                totalRent,
                rentPaid * (totalRent / (occupied || 1)),
                rentDue * (totalRent / (occupied || 1)),
              ],
              backgroundColor: ["#C8A24A", "#10b981", "#ef4444"],
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => "₹" + (v / 1000).toFixed(0) + "k" },
            },
          },
        },
      });
  }, 500);
};

// ── #13: Expense Tracker UI ──
window.openExpenseTracker = () => {
  const expenses = JSON.parse(localStorage.getItem("anvi_expenses") || "[]");
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[99999] flex items-center justify-center p-4";
  overlay.style.cssText =
    "background:rgba(0,0,0,0.6);animation:viewFadeIn 0.3s ease";
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl" style="animation:viewFadeIn 0.4s ease">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-black"><i class="fas fa-receipt text-[#C8A24A] mr-2"></i>Expense Tracker</h3>
        <button onclick="this.closest('.fixed').remove()" class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="bg-gradient-to-r from-[#1F3D2B] to-[#2a5438] rounded-2xl p-5 mb-6 text-white">
        <p class="text-xs font-bold opacity-60 uppercase tracking-wider">Total Expenses</p>
        <p class="text-3xl font-black">₹${totalExp.toLocaleString("en-IN")}</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <input type="text" id="exp-desc" placeholder="Description" class="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
        <input type="number" id="exp-amount" placeholder="Amount" class="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
        <select id="exp-category" class="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
          <option value="Maintenance">Maintenance</option>
          <option value="Utilities">Utilities</option>
          <option value="Staff">Staff</option>
          <option value="Supplies">Supplies</option>
          <option value="Other">Other</option>
        </select>
        <button onclick="addExpense()" class="bg-[#C8A24A] text-white rounded-xl text-sm font-black hover:bg-[#b8922a] transition">+ Add</button>
      </div>
      <div id="expense-list" class="space-y-2">
        ${expenses.length === 0
      ? '<p class="text-center text-slate-400 text-sm py-8">No expenses recorded yet</p>'
      : expenses
        .slice()
        .reverse()
        .map(
          (e) => `
            <div class="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 border border-slate-100">
              <div><p class="text-sm font-bold text-slate-700">${e.desc}</p><p class="text-[10px] text-slate-400">${e.category} • ${e.date}</p></div>
              <span class="text-sm font-black text-red-500">-₹${(e.amount || 0).toLocaleString("en-IN")}</span>
            </div>
          `,
        )
        .join("")
    }
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
};

window.addExpense = () => {
  const desc = byId("exp-desc")?.value;
  const amount = parseInt(byId("exp-amount")?.value) || 0;
  const category = byId("exp-category")?.value;
  if (!desc || !amount) {
    window.toast("Fill all fields", "warning");
    return;
  }
  const expenses = JSON.parse(localStorage.getItem("anvi_expenses") || "[]");
  expenses.push({
    desc,
    amount,
    category,
    date: new Date().toLocaleDateString("en-IN"),
  });
  localStorage.setItem("anvi_expenses", JSON.stringify(expenses));
  window.toast("Expense added", "success");
  document
    .querySelector('.fixed[style*="background:rgba(0,0,0,0.6)"]')
    ?.remove();
  openExpenseTracker();
};

// ── #14: Activity Timeline ──
window.renderActivityTimeline = () => {
  const container = byId("admin-sub-audit-trail");
  if (!container) return;
  const timelineDiv = container.querySelector("#activity-timeline");
  if (timelineDiv) return;

  const token = localStorage.getItem("adminToken");
  if (!token) return;

  fetch(`${state.API}/api/audit?limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success || !data.data?.length) return;
      const logs = data.data;
      const html = `
        <div id="activity-timeline" class="mt-6">
          <h4 class="text-sm font-black text-slate-700 mb-4"><i class="fas fa-clock-rotate-left text-[#C8A24A] mr-2"></i>Recent Activity</h4>
          <div class="relative pl-6 border-l-2 border-[#C8A24A]/20 space-y-4">
            ${logs
          .map((log) => {
            const colors = {
              billing: "bg-emerald-500",
              maintenance: "bg-amber-500",
              room: "bg-blue-500",
              auth: "bg-purple-500",
            };
            const color = colors[log.category] || "bg-slate-400";
            const time = log.timestamp
              ? new Date(log.timestamp).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
              : "";
            return `
                <div class="relative">
                  <div class="absolute -left-[29px] w-4 h-4 rounded-full ${color} border-2 border-white"></div>
                  <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                    <p class="text-xs font-bold text-slate-700">${log.action || ""}</p>
                    <p class="text-[10px] text-slate-400 mt-1"><span class="font-bold">${log.performedBy || ""}</span> • ${time}</p>
                  </div>
                </div>`;
          })
          .join("")}
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", html);
    })
    .catch(() => { });
};

// ── Admin: Maintenance Work Assignment UI ──
window.openMaintenanceAssignModal = () => {
  const rooms = state.rooms || [];
  const bldgs = [...new Set(rooms.map((r) => r.buildingId))];
  const overlay = document.createElement("div");
  overlay.className =
    "fixed inset-0 z-[99999] flex items-center justify-center p-4";
  overlay.style.cssText =
    "background:rgba(0,0,0,0.6);animation:viewFadeIn 0.3s ease";
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl" style="animation:viewFadeIn 0.4s ease">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-black"><i class="fas fa-wrench text-amber-500 mr-2"></i>Assign Maintenance Work</h3>
        <button onclick="this.closest('.fixed').remove()" class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">PG / Building</label>
            <select id="maint-building" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none" onchange="updateMaintRooms()">
              <option value="">Select PG</option>
              ${bldgs.map((b) => `<option value="${b}">${b}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Room No</label>
            <select id="maint-room" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
              <option value="">Select Room</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Work Description</label>
          <textarea id="maint-desc" rows="3" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none resize-none" placeholder="e.g. Fix bathroom tap leaking..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Priority</label>
            <select id="maint-priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none">
              <option value="low">🟢 Low</option>
              <option value="medium" selected>🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Assigned To</label>
            <input type="text" id="maint-assignee" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none" placeholder="Worker name">
          </div>
        </div>
        <button onclick="submitMaintenanceWork()" id="maint-submit-btn" class="w-full py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition" style="background:linear-gradient(135deg,#C8A24A,#b8922a)">
          <i class="fas fa-wrench"></i> Assign Work
        </button>
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
};

window.updateMaintRooms = () => {
  const bId = byId("maint-building")?.value;
  const roomSelect = byId("maint-room");
  if (!roomSelect || !bId) return;
  const bRooms = (state.rooms || [])
    .filter((r) => r.buildingId === bId)
    .sort((a, b) => a.roomNo - b.roomNo);
  roomSelect.innerHTML =
    '<option value="">Select Room</option>' +
    bRooms
      .map(
        (r) =>
          `<option value="${r.roomNo}">Room ${r.roomNo} ${r.name ? "— " + r.name : ""}</option>`,
      )
      .join("");
};

window.submitMaintenanceWork = async () => {
  const buildingId = byId("maint-building")?.value;
  const roomNo = byId("maint-room")?.value;
  const text = byId("maint-desc")?.value;
  const priority = byId("maint-priority")?.value;
  const assignedTo = byId("maint-assignee")?.value;
  if (!buildingId || !roomNo || !text) {
    window.toast("Fill PG, Room and Description", "warning");
    return;
  }
  const token = localStorage.getItem("adminToken");
  const btn = byId("maint-submit-btn");
  window.btnLoading(btn, true, "Assigning...");
  try {
    const resp = await fetch(
      `${state.API}/api/rooms/${buildingId}/${roomNo}/maintenance`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, priority, assignedTo }),
      },
    );
    const data = await resp.json();
    if (data.success) {
      window.toast("Maintenance work assigned! ✅", "success");
      document
        .querySelector('.fixed[style*="background:rgba(0,0,0,0.6)"]')
        ?.remove();
      loadRoomsFromAPI();
    } else {
      window.toast(data.message || "Failed", "error");
    }
  } catch (e) {
    window.toast("Network error", "error");
  }
  window.btnLoading(btn, false);
};

// ── T2: Global Error Boundary ──
window.addEventListener("error", (e) => {
  console.error("[App Error]", e.message, e.filename, e.lineno);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[Unhandled Promise]", e.reason);
});

// ── T4: Skeleton Loading Screens ──
window.showSkeleton = (container, count = 3) => {
  if (!container) return;
  container.innerHTML = Array(count)
    .fill(
      `
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
      <div class="h-32 bg-slate-100 rounded-xl mb-4"></div>
      <div class="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-slate-100 rounded w-1/2"></div>
    </div>
  `,
    )
    .join("");
};

// ── T5: Form Validation Helpers ──
window.validateField = (input, pattern, msg) => {
  if (!input) return false;
  const val = input.value.trim();
  const valid = pattern.test(val);
  input.style.borderColor = valid ? "#10b981" : "#ef4444";
  const hint = input.nextElementSibling;
  if (hint?.classList.contains("field-hint")) {
    hint.textContent = valid ? "✓" : msg;
    hint.style.color = valid ? "#10b981" : "#ef4444";
  }
  return valid;
};

// ── Hook into admin tab changes to render charts/timeline ──
const _prevSetAdminTab = window.setAdminTab;
if (_prevSetAdminTab) {
  window.setAdminTab = (tab) => {
    _prevSetAdminTab(tab);
    if (tab === "analytics") setTimeout(renderAnalyticsCharts, 800);
    if (tab === "audit-trail") setTimeout(renderActivityTimeline, 500);
  };
}

// ── Inject buttons in admin maintenance tab ──
setTimeout(() => {
  const maintTab = byId("admin-sub-maintenance");
  if (maintTab && !maintTab.querySelector("#maint-assign-btn")) {
    const btnBar = document.createElement("div");
    btnBar.className = "flex flex-wrap gap-3 mb-4";
    btnBar.innerHTML = `
      <button id="maint-assign-btn" onclick="openMaintenanceAssignModal()" class="px-4 py-2 rounded-xl text-xs font-black text-white transition-colors shadow-lg" style="background:linear-gradient(135deg,#C8A24A,#b8922a)">
        <i class="fas fa-plus mr-1"></i> Assign Work
      </button>
      <button onclick="openBroadcastModal()" class="px-4 py-2 rounded-xl text-xs font-black text-white transition-colors shadow-lg" style="background:linear-gradient(135deg,#25d366,#128c7e)">
        <i class="fab fa-whatsapp mr-1"></i> Broadcast
      </button>
      <button onclick="openExpenseTracker()" class="px-4 py-2 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-slate-700 hover:bg-slate-800">
        <i class="fas fa-receipt mr-1"></i> Expenses
      </button>
    `;
    maintTab.prepend(btnBar);
  }
}, 3000);

// ── Also inject buttons in dashboard ──
setTimeout(() => {
  const dashTab = byId("admin-sub-dashboard");
  if (dashTab && !dashTab.querySelector("#dash-quick-actions")) {
    const pending = dashTab.querySelector("#admin-pending-actions");
    const target = pending || dashTab;
    const actionsHtml = `
      <div id="dash-quick-actions" class="flex flex-wrap gap-3 mt-4 mb-4">
        <button onclick="openMaintenanceAssignModal()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg" style="background:linear-gradient(135deg,#C8A24A,#b8922a)"><i class="fas fa-wrench mr-1"></i> Maintenance</button>
        <button onclick="openBroadcastModal()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg" style="background:linear-gradient(135deg,#25d366,#128c7e)"><i class="fab fa-whatsapp mr-1"></i> Broadcast</button>
        <button onclick="openExpenseTracker()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-slate-700 hover:bg-slate-800"><i class="fas fa-receipt mr-1"></i> Expenses</button>
        <button onclick="openRoomSwapModal()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-indigo-600 hover:bg-indigo-700"><i class="fas fa-right-left mr-1"></i> Room Swap</button>
        <button onclick="openBulkPriceModal()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-amber-600 hover:bg-amber-700"><i class="fas fa-tags mr-1"></i> Bulk Price</button>
        <button onclick="openVisitorLog()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-teal-600 hover:bg-teal-700"><i class="fas fa-id-badge mr-1"></i> Visitors</button>
        <button onclick="openRevenueReport()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-emerald-600 hover:bg-emerald-700"><i class="fas fa-chart-line mr-1"></i> Revenue</button>
        <button onclick="loadDocExpiryAlerts()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-rose-600 hover:bg-rose-700"><i class="fas fa-bell mr-1"></i> Doc Alerts</button>
        <button onclick="openIdCardGenerator()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-purple-600 hover:bg-purple-700"><i class="fas fa-address-card mr-1"></i> ID Card</button>
        <button onclick="openPaymentHistory()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-blue-600 hover:bg-blue-700"><i class="fas fa-clock-rotate-left mr-1"></i> Pay History</button>
        <button onclick="openReminderSettings()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-green-700 hover:bg-green-800"><i class="fas fa-clock mr-1"></i> Reminders</button>
        <button onclick="openMaintenanceCalendar()" class="px-4 py-2.5 rounded-xl text-xs font-black text-white transition-colors shadow-lg bg-violet-600 hover:bg-violet-700"><i class="fas fa-calendar-alt mr-1"></i> Calendar</button>
      </div>
    `;
    target.insertAdjacentHTML("afterend", actionsHtml);
  }
}, 3500);

// ═══════════════════════════════════════════
// EMERGENCY CONTACT HELPERS
// ═══════════════════════════════════════════
window.callGuardian = () => {
  const ph = byId("lm-guardian-phone")?.value;
  if (!ph) {
    toast("No guardian phone");
    return;
  }
  window.open(`tel:${ph}`);
};
window.whatsappGuardian = () => {
  const ph = byId("lm-guardian-phone")?.value;
  const name = byId("lm-guardian-name")?.value || "Guardian";
  if (!ph) {
    toast("No guardian phone");
    return;
  }
  const msg = encodeURIComponent(
    `Hello ${name}, this is a message from ANVI STAY regarding your ward.`,
  );
  window.open(`https://wa.me/${ph.replace(/\D/g, "")}?text=${msg}`);
};

// ═══════════════════════════════════════════
// PHASE 3 FEATURES
// ═══════════════════════════════════════════

window.generateInvoicePDF = (room) => {
  if (!room) {
    toast("No room data");
    return;
  }
  const eu =
    Math.max(0, (room.elecCurrent || 0) - (room.elecLast || 0)) +
    Math.max(0, (room.invCurrent || 0) - (room.invLast || 0));
  const eb = eu * (room.elecRate || 13);
  const total = (room.rentAmount || 0) + (room.maintCharge || 0) + eb;
  const now = new Date();
  const ms = now.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const inv = `ANVI-${(room.buildingId || "").toUpperCase()}-${room.roomNo}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const w = window.open("", "_blank");
  w.document.write(
    `<!DOCTYPE html><html><head><title>Invoice ${inv}</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif}body{padding:40px;background:#fff;color:#1a1a1a}.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1F3D2B;padding-bottom:20px;margin-bottom:30px}.logo{font-size:28px;font-weight:900;color:#1F3D2B}.logo span{color:#C8A24A}.meta{text-align:right;font-size:12px;color:#666}.meta h2{font-size:18px;color:#1F3D2B;margin-bottom:5px}table{width:100%;border-collapse:collapse}th,td{padding:10px 15px;text-align:left;border-bottom:1px solid #eee;font-size:13px}th{background:#f8f8f6;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666}.tot{background:#1F3D2B;color:#fff;font-weight:900;font-size:16px}.tot td{border:none;padding:14px 15px}.ft{margin-top:40px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:15px}@media print{body{padding:20px}}</style></head><body><div class="hdr"><div><div class="logo">ANVI<span>STAY</span></div><p style="font-size:11px;color:#999;margin-top:3px">Student Housing • Law Gate, Phagwara</p></div><div class="meta"><h2>INVOICE</h2><p><strong>${inv}</strong></p><p>Date: ${now.toLocaleDateString("en-IN")}</p><p>Period: ${ms}</p></div></div><table><tr><td><b>Name:</b> ${room.name || "N/A"}</td><td><b>Phone:</b> ${room.phone || "N/A"}</td></tr><tr><td><b>PG:</b> ${room.buildingId}</td><td><b>Room:</b> ${room.roomNo}</td></tr></table><br><table><thead><tr><th>Description</th><th>Details</th><th style="text-align:right">Amount</th></tr></thead><tbody><tr><td>Monthly Rent</td><td>—</td><td style="text-align:right;font-weight:700">₹${(room.rentAmount || 0).toLocaleString("en-IN")}</td></tr><tr><td>Maintenance</td><td>Monthly</td><td style="text-align:right;font-weight:700">₹${(room.maintCharge || 0).toLocaleString("en-IN")}</td></tr><tr><td>Electricity</td><td>${eu} units × ₹${room.elecRate || 13}/unit</td><td style="text-align:right;font-weight:700">₹${eb.toLocaleString("en-IN")}</td></tr><tr class="tot"><td colspan="2">TOTAL DUE</td><td style="text-align:right">₹${total.toLocaleString("en-IN")}</td></tr></tbody></table><div style="background:#f8f8f6;padding:15px;border-radius:8px;margin:25px 0"><p style="font-size:11px;color:#666"><b>Payment:</b> ${room.rentPaid ? "✅ Rent Paid" : "❌ Rent Pending"} | ${room.elecPaid ? "✅ Elec Paid" : "❌ Elec Pending"}</p></div><div class="ft"><p>ANVI STAY • Law Gate, Phagwara 144411 • +91 91422 72776</p><p style="margin-top:5px">Computer-generated invoice.</p></div><script>setTimeout(()=>window.print(),500)<\/script></body></html>`,
  );
  w.document.close();
};

window.openPaymentHistory = async () => {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_BASE}/rooms?limit=500`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (!d.success) {
      toast("Failed");
      return;
    }
    const ap = [];
    d.data.forEach((r) => {
      (r.paymentHistory || []).forEach((p) => {
        ap.push({
          ...p,
          buildingId: r.buildingId,
          roomNo: r.roomNo,
          tenantName: r.name,
        });
      });
    });
    ap.sort((a, b) => (b.paidAt || "").localeCompare(a.paidAt || ""));
    const o = document.createElement("div");
    o.className =
      "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
    o.id = "pay-history-modal";
    o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"><div class="p-6 border-b flex justify-between items-center"><h3 class="text-lg font-black"><i class="fas fa-clock-rotate-left mr-2 text-blue-500"></i>Payment History (${ap.length})</h3><button onclick="document.getElementById('pay-history-modal').remove()" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-times text-sm"></i></button></div><div class="flex-1 overflow-y-auto p-6">${ap.length === 0
      ? '<p class="text-slate-400 text-center py-8">No payments yet</p>'
      : `<table class="w-full text-xs"><thead><tr class="text-left"><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Tenant</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">PG/Room</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Type</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Amount</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Date</th></tr></thead><tbody>${ap
        .slice(0, 100)
        .map(
          (p) =>
            `<tr class="border-t border-slate-50"><td class="py-2 font-bold">${p.tenantName || "—"}</td><td class="py-2">${p.buildingId}/${p.roomNo}</td><td class="py-2"><span class="px-2 py-0.5 rounded-full text-[9px] font-black ${p.type === "rent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}">${p.type}</span></td><td class="py-2 font-black">₹${(p.amount || 0).toLocaleString("en-IN")}</td><td class="py-2 text-slate-400">${p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "—"}</td></tr>`,
        )
        .join("")}</tbody></table>`
      }</div></div>`;
    document.body.appendChild(o);
  } catch (e) {
    toast("Error");
  }
};

window.openRoomSwapModal = () => {
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "room-swap-modal";
  const bo = buildings
    .map((b) => `<option value="${b.id}">${b.name}</option>`)
    .join("");
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"><h3 class="text-lg font-black mb-6"><i class="fas fa-right-left mr-2 text-indigo-500"></i>Room Swap / Transfer</h3><div class="space-y-4"><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">From PG</label><select id="swap-from-pg" class="w-full border rounded-xl px-3 py-2 text-sm font-bold">${bo}</select></div><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">From Room No</label><input type="number" id="swap-from-room" class="w-full border rounded-xl px-3 py-2 text-sm font-bold" placeholder="e.g. 101"></div><div class="text-center text-2xl text-indigo-400"><i class="fas fa-arrow-down"></i></div><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">To PG</label><select id="swap-to-pg" class="w-full border rounded-xl px-3 py-2 text-sm font-bold">${bo}</select></div><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">To Room No</label><input type="number" id="swap-to-room" class="w-full border rounded-xl px-3 py-2 text-sm font-bold" placeholder="e.g. 205"></div></div><div class="flex gap-3 mt-6"><button onclick="document.getElementById('room-swap-modal').remove()" class="flex-1 py-3 rounded-xl border font-bold text-sm">Cancel</button><button onclick="executeRoomSwap()" class="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition">Transfer</button></div></div>`;
  document.body.appendChild(o);
};
window.executeRoomSwap = async () => {
  const token = localStorage.getItem("adminToken");
  const data = {
    fromBuildingId: byId("swap-from-pg")?.value,
    fromRoomNo: parseInt(byId("swap-from-room")?.value),
    toBuildingId: byId("swap-to-pg")?.value,
    toRoomNo: parseInt(byId("swap-to-room")?.value),
  };
  if (!data.fromRoomNo || !data.toRoomNo) {
    toast("Enter both room numbers");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/rooms/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.success) {
      toast("Tenant transferred! ✅");
      document.getElementById("room-swap-modal")?.remove();
    } else toast(d.message || "Failed");
  } catch (e) {
    toast("Error");
  }
};

window.submitNoticePeriod = async (buildingId, roomNo, action, reason) => {
  try {
    const res = await fetch(
      `${API_BASE}/rooms/${buildingId}/${roomNo}/notice`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      },
    );
    const d = await res.json();
    if (d.success)
      toast(
        action === "submit" ? "30-day notice submitted ✅" : "Notice cancelled",
      );
    else toast(d.message || "Failed");
  } catch (e) {
    toast("Error");
  }
};

window.openFeedbackModal = (bid, rno) => {
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "feedback-modal";
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"><h3 class="text-lg font-black mb-2"><i class="fas fa-star mr-2 text-amber-500"></i>Rate Your Stay</h3><p class="text-xs text-slate-400 mb-6">How was your experience?</p><div id="fb-stars" class="flex justify-center gap-2 mb-6">${[1, 2, 3, 4, 5].map((i) => `<button onclick="document.querySelectorAll('#fb-stars button').forEach((b,idx)=>{b.classList.toggle('text-amber-400',idx<${i});b.classList.toggle('text-slate-200',idx>=${i})});document.getElementById('fb-rating').value=${i}" class="text-4xl ${i <= 4 ? "text-amber-400" : "text-slate-200"} hover:scale-110 transition"><i class="fas fa-star"></i></button>`).join("")}</div><input type="hidden" id="fb-rating" value="4"><textarea id="fb-review" rows="3" class="w-full border rounded-xl px-4 py-3 text-sm mb-4" placeholder="Share your experience..."></textarea><div class="flex gap-3"><button onclick="document.getElementById('feedback-modal').remove()" class="flex-1 py-3 rounded-xl border font-bold text-sm">Cancel</button><button onclick="submitFeedbackForm('${bid}',${rno})" class="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition">Submit</button></div></div>`;
  document.body.appendChild(o);
};
window.submitFeedbackForm = async (bid, rno) => {
  const rating = parseInt(byId("fb-rating")?.value) || 5;
  const review = byId("fb-review")?.value || "";
  try {
    const res = await fetch(`${API_BASE}/rooms/${bid}/${rno}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, review }),
    });
    const d = await res.json();
    if (d.success) {
      toast("Thank you! ⭐");
      document.getElementById("feedback-modal")?.remove();
    } else toast(d.message);
  } catch (e) {
    toast("Error");
  }
};

window.openVisitorLog = async () => {
  const token = localStorage.getItem("adminToken");
  let visitors = [];
  try {
    const res = await fetch(`${API_BASE}/visitors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.success) visitors = d.data;
  } catch (e) { }
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "visitor-log-modal";
  const bo = buildings
    .map((b) => `<option value="${b.id}">${b.name}</option>`)
    .join("");
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"><div class="p-6 border-b flex justify-between items-center"><h3 class="text-lg font-black"><i class="fas fa-id-badge mr-2 text-teal-500"></i>Visitor Log</h3><button onclick="document.getElementById('visitor-log-modal').remove()" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-times text-sm"></i></button></div><div class="p-4 border-b bg-slate-50"><div class="grid grid-cols-2 sm:grid-cols-5 gap-2"><input type="text" id="vl-name" class="border rounded-lg px-3 py-2 text-xs font-bold" placeholder="Visitor Name *"><input type="text" id="vl-phone" class="border rounded-lg px-3 py-2 text-xs font-bold" placeholder="Phone"><select id="vl-pg" class="border rounded-lg px-3 py-2 text-xs font-bold">${bo}</select><input type="number" id="vl-room" class="border rounded-lg px-3 py-2 text-xs font-bold" placeholder="Room No"><button onclick="addVisitorEntry()" class="bg-teal-600 text-white rounded-lg px-3 py-2 text-xs font-black hover:bg-teal-700">+ Add</button></div></div><div class="flex-1 overflow-y-auto p-6"><table class="w-full text-xs"><thead><tr class="text-left"><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Visitor</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">PG/Room</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">In</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Out</th><th class="pb-2 text-[10px] font-black text-slate-400 uppercase">Action</th></tr></thead><tbody>${visitors.map((v) => `<tr class="border-t border-slate-50"><td class="py-2 font-bold">${v.visitorName}</td><td class="py-2">${v.buildingId}/${v.roomNo}</td><td class="py-2 text-slate-400">${v.inTime ? new Date(v.inTime).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td class="py-2 text-slate-400">${v.outTime ? new Date(v.outTime).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td><td class="py-2">${v.status === "in" ? `<button onclick="checkoutVisitorEntry('${v._id}')" class="text-[10px] font-bold text-rose-500 hover:underline">Checkout</button>` : '<span class="text-[10px] text-slate-300">Done</span>'}</td></tr>`).join("")}</tbody></table></div></div>`;
  document.body.appendChild(o);
};
window.addVisitorEntry = async () => {
  const token = localStorage.getItem("adminToken");
  const data = {
    visitorName: byId("vl-name")?.value,
    visitorPhone: byId("vl-phone")?.value,
    buildingId: byId("vl-pg")?.value,
    roomNo: parseInt(byId("vl-room")?.value) || 0,
    inTime: new Date().toISOString(),
  };
  if (!data.visitorName) {
    toast("Enter visitor name");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/visitors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.success) {
      toast("Visitor logged! ✅");
      document.getElementById("visitor-log-modal")?.remove();
      openVisitorLog();
    } else toast(d.message);
  } catch (e) {
    toast("Error");
  }
};
window.checkoutVisitorEntry = async (id) => {
  const token = localStorage.getItem("adminToken");
  try {
    await fetch(`${API_BASE}/visitors/${id}/checkout`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast("Checked out ✅");
    document.getElementById("visitor-log-modal")?.remove();
    openVisitorLog();
  } catch (e) {
    toast("Error");
  }
};

window.openMaintenanceCalendar = async () => {
  const token = localStorage.getItem("adminToken");
  let tasks = [];
  try {
    const res = await fetch(`${API_BASE}/housekeeping`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (d.success) tasks = d.data;
  } catch (e) { }
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "maint-cal-modal";
  const today = new Date();
  const days = [];
  for (let i = 0; i < 14; i++) {
    const dd = new Date(today);
    dd.setDate(dd.getDate() + i);
    const ds = dd.toISOString().split("T")[0];
    days.push({
      date: dd,
      dateStr: ds,
      tasks: tasks.filter((t) => (t.scheduledDate || "").startsWith(ds)),
    });
  }
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"><div class="p-6 border-b flex justify-between items-center"><h3 class="text-lg font-black"><i class="fas fa-calendar-alt mr-2 text-violet-500"></i>Maintenance Calendar</h3><button onclick="document.getElementById('maint-cal-modal').remove()" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-times text-sm"></i></button></div><div class="flex-1 overflow-y-auto p-6"><div class="grid grid-cols-2 sm:grid-cols-7 gap-3">${days.map((d) => `<div class="border rounded-xl p-3 ${d.dateStr === today.toISOString().split("T")[0] ? "border-violet-400 bg-violet-50" : "border-slate-100"}"><p class="text-[10px] font-black text-slate-400 uppercase">${d.date.toLocaleDateString("en-IN", { weekday: "short" })}</p><p class="text-lg font-black">${d.date.getDate()}</p>${d.tasks.length ? d.tasks.map((t) => `<p class="text-[9px] mt-1 px-1.5 py-0.5 rounded ${t.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} font-bold truncate">${t.task || t.description || "Task"}</p>`).join("") : '<p class="text-[9px] text-slate-300 mt-1">—</p>'}</div>`).join("")}</div></div></div>`;
  document.body.appendChild(o);
};

window.openIdCardGenerator = () => {
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "idcard-modal";
  const bo = buildings
    .map((b) => `<option value="${b.id}">${b.name}</option>`)
    .join("");
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8"><h3 class="text-lg font-black mb-4"><i class="fas fa-address-card mr-2 text-purple-500"></i>Generate ID Card</h3><div class="space-y-3"><select id="idc-pg" class="w-full border rounded-xl px-3 py-2 text-sm font-bold">${bo}</select><input type="number" id="idc-room" class="w-full border rounded-xl px-3 py-2 text-sm font-bold" placeholder="Room Number"></div><div class="flex gap-3 mt-6"><button onclick="document.getElementById('idcard-modal').remove()" class="flex-1 py-3 rounded-xl border font-bold text-sm">Cancel</button><button onclick="generateIdCard()" class="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition">Generate</button></div></div>`;
  document.body.appendChild(o);
};
window.generateIdCard = async () => {
  const token = localStorage.getItem("adminToken");
  const pg = byId("idc-pg")?.value;
  const room = byId("idc-room")?.value;
  if (!room) {
    toast("Enter room number");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/rooms/${pg}/${room}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (!d.success || !d.data) {
      toast("Room not found");
      return;
    }
    const r = d.data;
    const pgName = buildings.find((b) => b.id === pg)?.name || pg;
    const w = window.open("", "_blank");
    w.document.write(
      `<!DOCTYPE html><html><head><title>ID Card - ${r.name}</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0}.card{width:340px;background:linear-gradient(135deg,#1F3D2B,#2a5438);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);color:#fff}.ch{padding:20px;text-align:center;border-bottom:2px solid rgba(200,162,74,0.3)}.ch h1{font-size:22px;font-weight:900}.ch h1 span{color:#C8A24A}.ch p{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-top:4px}.cb{padding:20px;display:flex;gap:15px;align-items:center}.cp{width:80px;height:100px;border-radius:12px;border:3px solid #C8A24A;object-fit:cover;background:#335}.ci{flex:1}.ci .l{font-size:8px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.5);margin-top:8px}.ci .v{font-size:13px;font-weight:700;margin-top:1px}.cf{background:rgba(0,0,0,0.2);padding:12px 20px;text-align:center;font-size:9px;color:rgba(255,255,255,0.5)}@media print{body{background:#fff}.card{box-shadow:none}}</style></head><body><div class="card"><div class="ch"><h1>ANVI<span>STAY</span></h1><p>Student Housing ID Card</p></div><div class="cb">${r.photoUrl ? `<img src="${r.photoUrl}" class="cp">` : '<div class="cp" style="display:flex;align-items:center;justify-content:center;font-size:30px">👤</div>'}<div class="ci"><div class="l">Name</div><div class="v">${r.name || "N/A"}</div><div class="l">PG</div><div class="v">${pgName}</div><div class="l">Room</div><div class="v">${r.roomNo}</div><div class="l">Phone</div><div class="v">${r.phone || "N/A"}</div></div></div><div class="cf">Emergency: +91 91422 72776 • Law Gate, Phagwara</div></div><script>setTimeout(()=>window.print(),500)<\/script></body></html>`,
    );
    w.document.close();
    document.getElementById("idcard-modal")?.remove();
  } catch (e) {
    toast("Error");
  }
};

window.openRevenueReport = async () => {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_BASE}/rooms/revenue-report`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (!d.success) {
      toast("Failed");
      return;
    }
    const { buildings: bldgs, summary } = d.data;
    const o = document.createElement("div");
    o.className =
      "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
    o.id = "revenue-modal";
    o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"><div class="p-6 border-b flex justify-between items-center"><h3 class="text-lg font-black"><i class="fas fa-chart-line mr-2 text-emerald-500"></i>Revenue Report</h3><button onclick="document.getElementById('revenue-modal').remove()" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-times text-sm"></i></button></div><div class="flex-1 overflow-y-auto p-6"><div class="grid grid-cols-3 gap-4 mb-6"><div class="bg-emerald-50 rounded-2xl p-4 text-center"><p class="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Expected</p><p class="text-2xl font-black text-emerald-700">₹${summary.totalExpected.toLocaleString("en-IN")}</p></div><div class="bg-blue-50 rounded-2xl p-4 text-center"><p class="text-[10px] font-black uppercase text-blue-600 tracking-wider">Collected</p><p class="text-2xl font-black text-blue-700">₹${summary.totalCollected.toLocaleString("en-IN")}</p></div><div class="bg-rose-50 rounded-2xl p-4 text-center"><p class="text-[10px] font-black uppercase text-rose-600 tracking-wider">Pending</p><p class="text-2xl font-black text-rose-700">₹${summary.totalPending.toLocaleString("en-IN")}</p></div></div>${Object.entries(
      bldgs,
    )
      .map(([id, b]) => {
        const pgN = buildings.find((x) => x.id === id)?.name || id;
        const pct =
          b.totalRent > 0 ? Math.round((b.collected / b.totalRent) * 100) : 0;
        return `<div class="mb-4 border rounded-2xl p-4"><div class="flex justify-between items-center mb-3"><h4 class="font-black text-sm">${pgN}</h4><span class="text-xs font-bold ${pct >= 80 ? "text-emerald-600" : "text-rose-500"}">${pct}% collected</span></div><div class="h-2 bg-slate-100 rounded-full mb-3"><div class="h-2 rounded-full" style="width:${pct}%;background:${pct >= 80 ? "#10b981" : "#ef4444"}"></div></div><div class="grid grid-cols-3 gap-3 text-center text-xs"><div><p class="text-slate-400 text-[10px]">Rooms</p><p class="font-black">${b.rooms}</p></div><div><p class="text-slate-400 text-[10px]">Expected</p><p class="font-black">₹${b.totalRent.toLocaleString("en-IN")}</p></div><div><p class="text-slate-400 text-[10px]">Pending</p><p class="font-black text-rose-500">₹${b.pending.toLocaleString("en-IN")}</p></div></div></div>`;
      })
      .join("")}</div></div>`;
    document.body.appendChild(o);
  } catch (e) {
    toast("Error");
  }
};

window.openBulkPriceModal = () => {
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "bulk-price-modal";
  const bo = buildings
    .map(
      (b) =>
        `<option value="${b.id}">${b.name} (₹${(+b.rent).toLocaleString("en-IN")})</option>`,
    )
    .join("");
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8"><h3 class="text-lg font-black mb-4"><i class="fas fa-tags mr-2 text-amber-500"></i>Bulk Price Update</h3><p class="text-xs text-slate-400 mb-4">Update rent for ALL rooms in a PG</p><div class="space-y-3"><select id="bp-pg" class="w-full border rounded-xl px-3 py-2 text-sm font-bold">${bo}</select><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">New Rent (₹)</label><input type="number" id="bp-rent" class="w-full border rounded-xl px-3 py-2 text-sm font-bold" placeholder="e.g. 12000"></div><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">New Maintenance (₹)</label><input type="number" id="bp-maint" class="w-full border rounded-xl px-3 py-2 text-sm font-bold" placeholder="e.g. 300"></div></div><div class="flex gap-3 mt-6"><button onclick="document.getElementById('bulk-price-modal').remove()" class="flex-1 py-3 rounded-xl border font-bold text-sm">Cancel</button><button onclick="executeBulkPrice()" class="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition">Update All</button></div></div>`;
  document.body.appendChild(o);
};
window.executeBulkPrice = async () => {
  const token = localStorage.getItem("adminToken");
  const data = {
    buildingId: byId("bp-pg")?.value,
    newRent: parseInt(byId("bp-rent")?.value),
    newMaint: byId("bp-maint")?.value
      ? parseInt(byId("bp-maint").value)
      : undefined,
  };
  if (!data.newRent) {
    toast("Enter new rent");
    return;
  }
  if (
    !confirm(
      `Update rent to ₹${data.newRent.toLocaleString("en-IN")} for ALL rooms in ${data.buildingId}?`,
    )
  )
    return;
  try {
    const res = await fetch(`${API_BASE}/rooms/bulk-price`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (d.success) {
      toast(`Updated ${d.modifiedCount} rooms! 🎉`);
      document.getElementById("bulk-price-modal")?.remove();
    } else toast(d.message);
  } catch (e) {
    toast("Error");
  }
};

window.loadDocExpiryAlerts = async () => {
  const token = localStorage.getItem("adminToken");
  try {
    const res = await fetch(`${API_BASE}/rooms/document-expiry-alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (!d.success) {
      toast("Failed");
      return;
    }
    const { expiringSoon, expired } = d.data;
    const o = document.createElement("div");
    o.className =
      "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
    o.id = "doc-alerts-modal";
    o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"><div class="p-6 border-b flex justify-between items-center"><h3 class="text-lg font-black"><i class="fas fa-bell mr-2 text-rose-500"></i>Document Expiry Alerts</h3><button onclick="document.getElementById('doc-alerts-modal').remove()" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><i class="fas fa-times text-sm"></i></button></div><div class="flex-1 overflow-y-auto p-6">${expired.length ? `<div class="mb-6"><h4 class="text-xs font-black text-rose-600 uppercase tracking-wider mb-3"><i class="fas fa-exclamation-triangle mr-1"></i>Expired (${expired.length})</h4>${expired.map((r) => `<div class="flex justify-between items-center p-3 bg-rose-50 rounded-xl mb-2 border border-rose-100"><div><p class="text-sm font-bold">${r.name || "Unnamed"}</p><p class="text-[10px] text-slate-400">${r.buildingId} / Room ${r.roomNo}</p></div><div class="text-right"><p class="text-xs font-black text-rose-600">${r.agreementEndDate}</p><p class="text-[10px] text-rose-400">EXPIRED</p></div></div>`).join("")}</div>` : ""}${expiringSoon.length
      ? `<div><h4 class="text-xs font-black text-amber-600 uppercase tracking-wider mb-3"><i class="fas fa-clock mr-1"></i>Expiring Soon (${expiringSoon.length})</h4>${expiringSoon
        .map((r) => {
          const days = Math.ceil(
            (new Date(r.agreementEndDate) - new Date()) / 86400000,
          );
          return `<div class="flex justify-between items-center p-3 bg-amber-50 rounded-xl mb-2 border border-amber-100"><div><p class="text-sm font-bold">${r.name || "Unnamed"}</p><p class="text-[10px] text-slate-400">${r.buildingId} / Room ${r.roomNo}</p></div><div class="text-right"><p class="text-xs font-black text-amber-600">${r.agreementEndDate}</p><p class="text-[10px] text-amber-400">${days} days left</p></div></div>`;
        })
        .join("")}</div>`
      : ""
      }${!expired.length && !expiringSoon.length ? '<div class="text-center py-12"><i class="fas fa-check-circle text-4xl text-emerald-400 mb-3 block"></i><p class="text-sm font-bold text-slate-500">All documents up to date! 🎉</p></div>' : ""}</div></div>`;
    document.body.appendChild(o);
  } catch (e) {
    toast("Error");
  }
};

window.openReminderSettings = () => {
  const saved = JSON.parse(
    localStorage.getItem("anvi_reminder_settings") || "{}",
  );
  const o = document.createElement("div");
  o.className =
    "fixed inset-0 bg-slate-900/70 z-[9999] flex items-center justify-center p-4";
  o.id = "reminder-settings-modal";
  o.innerHTML = `<div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"><h3 class="text-lg font-black mb-4"><i class="fas fa-clock mr-2 text-green-600"></i>Reminder Settings</h3><div class="space-y-4"><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Message Template</label><textarea id="rs-template" rows="4" class="w-full border rounded-xl px-3 py-2 text-xs font-bold">${saved.template || "Hi {name}, your rent of ₹{rent} for {pg} Room {room} is due. Please pay at your earliest. Thank you! — ANVI STAY"}</textarea><p class="text-[9px] text-slate-400 mt-1">Variables: {name}, {rent}, {pg}, {room}, {phone}</p></div><div class="grid grid-cols-2 gap-3"><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Time</label><select id="rs-time" class="w-full border rounded-xl px-3 py-2 text-xs font-bold"><option value="08:00" ${saved.time === "08:00" ? "selected" : ""}>08:00 AM</option><option value="10:00" ${saved.time === "10:00" || !saved.time ? "selected" : ""}>10:00 AM</option><option value="12:00" ${saved.time === "12:00" ? "selected" : ""}>12:00 PM</option><option value="18:00" ${saved.time === "18:00" ? "selected" : ""}>06:00 PM</option></select></div><div><label class="text-[10px] font-black uppercase text-slate-400 block mb-1">Frequency</label><select id="rs-freq" class="w-full border rounded-xl px-3 py-2 text-xs font-bold"><option value="daily" ${saved.freq === "daily" ? "selected" : ""}>Daily</option><option value="alt" ${saved.freq === "alt" || !saved.freq ? "selected" : ""}>Alt Days</option><option value="weekly" ${saved.freq === "weekly" ? "selected" : ""}>Weekly</option><option value="1st5th" ${saved.freq === "1st5th" ? "selected" : ""}>1st & 5th</option></select></div></div><label class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl cursor-pointer"><input type="checkbox" id="rs-auto" ${saved.autoSend ? "checked" : ""} class="w-4 h-4 accent-green-500"><span class="text-xs font-bold">Auto-send reminders</span></label></div><div class="flex gap-3 mt-6"><button onclick="document.getElementById('reminder-settings-modal').remove()" class="flex-1 py-3 rounded-xl border font-bold text-sm">Cancel</button><button onclick="saveReminderSettings()" class="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition">Save</button></div></div>`;
  document.body.appendChild(o);
};
window.saveReminderSettings = () => {
  const s = {
    template: byId("rs-template")?.value || "",
    time: byId("rs-time")?.value || "10:00",
    freq: byId("rs-freq")?.value || "alt",
    autoSend: byId("rs-auto")?.checked || false,
  };
  localStorage.setItem("anvi_reminder_settings", JSON.stringify(s));
  toast("Settings saved! ✅");
  document.getElementById("reminder-settings-modal")?.remove();
};

async function loadFeedbackRatings() {
  try {
    const res = await fetch(`${API_BASE}/rooms/feedback-summary`);
    const d = await res.json();
    if (d.success && d.data) {
      document.querySelectorAll(".property-card").forEach((card, idx) => {
        const b = buildings[idx];
        if (!b) return;
        const fb = d.data[b.id];
        if (fb && fb.avgRating > 0) {
          const badge = card.querySelector(".p-5,.p-6");
          if (badge) {
            badge.insertAdjacentHTML(
              "afterbegin",
              `<div class="flex items-center gap-1.5 mb-3"><span class="text-amber-400 text-xs">${"★".repeat(Math.round(fb.avgRating))}${"☆".repeat(5 - Math.round(fb.avgRating))}</span><span class="text-[10px] font-black text-slate-500">${fb.avgRating}/5 (${fb.totalReviews})</span></div>`,
            );
          }
        }
      });
    }
  } catch (e) { }
}
setTimeout(loadFeedbackRatings, 3000);

run();

// Global Search and Smart Billing Filter
window.currentBillingFilter = 'all';
window.setBillingFilter = (filterType, btn) => {
  window.currentBillingFilter = filterType;
  // Update button classes
  document.querySelectorAll('#billing-quick-filters .bf-btn').forEach(b => {
    b.classList.remove('bg-[#C8A24A]', 'text-white');
    b.classList.add('bg-slate-100', 'text-slate-600');
  });
  if (btn) {
    btn.classList.add('bg-[#C8A24A]', 'text-white');
    btn.classList.remove('bg-slate-100', 'text-slate-600');
  }
  window.filterBillingSpreadsheet();
};

window.filterBillingSpreadsheet = () => {
  const searchTerm = (byId("billing-search")?.value || "").toLowerCase();
  const rows = byId("billing-rows")?.querySelectorAll("tr") || [];
  const filterType = window.currentBillingFilter || 'all';

  rows.forEach((tr) => {
    const roomText = (tr.children[0]?.textContent || "").toLowerCase();
    const tenantText = (tr.children[1]?.textContent || "").toLowerCase();
    const isVacant = tr.classList.contains("opacity-75");
    const balanceText = tr.querySelector(".balance-cell")?.textContent || "0";
    const balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, "")) || 0;

    let show = (roomText.includes(searchTerm) || tenantText.includes(searchTerm));

    // Apply Smart Filters
    if (show) {
      if (filterType === 'unpaid' && balance <= 0) show = false;
      if (filterType === 'vacant' && !isVacant) show = false;
    }

    tr.style.display = show ? "" : "none";
  });
};

// Feature: Google Sheets Auto-Save Indicator
window.triggerAutoSaveIndicator = (isSaving) => {
  const indicator = document.getElementById("billing-auto-save-indicator");
  if (!indicator) return;
  if (isSaving) {
    indicator.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-500 tracking-wider"></i> <span class="text-amber-600">Saving...</span>`;
    indicator.classList.remove('opacity-0');
  } else {
    indicator.innerHTML = `<i class="fas fa-check-circle text-emerald-500 tracking-wider"></i> <span class="text-emerald-600">All changes saved</span>`;
    indicator.classList.remove('opacity-0');
    setTimeout(() => { indicator.classList.add('opacity-0'); }, 2500);
  }
};

// Automatically recalculate footer when anything changes
const originalCalcBillingRow = window.recalcBillingRowLive;
window.recalcBillingRowLive = (tr) => {
  if (originalCalcBillingRow) originalCalcBillingRow(tr);
  recalcFooter();
};

window.recalcFooter = () => {
  let sumElec = 0;
  let sumRent = 0;
  let sumTotal = 0;
  let sumBalance = 0;

  // Find spreadsheet totals
  const rows = byId("billing-table-body")?.querySelectorAll("tbody tr") || [];
  rows.forEach((tr) => {
    const isVacant = tr.classList.contains("opacity-75");
    if (isVacant) return;

    const rate = parseFloat(tr.querySelector(".billing-rate")?.value) || 13;
    const eLast = parseFloat(tr.querySelector(".billing-elast")?.value) || 0;
    const eCurr = parseFloat(tr.querySelector(".billing-ecurr")?.value) || 0;
    const iLast = parseFloat(tr.querySelector(".billing-ilast")?.value) || 0;
    const iCurr = parseFloat(tr.querySelector(".billing-icurr")?.value) || 0;

    const delta = Math.max(0, eCurr - eLast) + Math.max(0, iCurr - iLast);
    const bill = delta * rate;

    const rentText = tr.children[9]?.textContent || "0";
    const rent = parseFloat(rentText.replace(/[^0-9.-]+/g, "")) || 0;

    const maintenanceCharge =
      parseFloat(tr.querySelector(".billing-maintenance")?.value) || 0;
    const otherDues =
      parseFloat(tr.querySelector(".billing-other-dues")?.value) || 0;
    const amountPaid =
      parseFloat(tr.querySelector(".billing-amount-paid")?.value) || 0;

    const totalDue = bill + rent + maintenanceCharge + otherDues;
    const balance = totalDue - amountPaid;

    sumElec += bill;
    sumRent += rent;
    sumTotal += totalDue;
    sumBalance += balance;
  });

  // Update spreadsheet footer
  const tfoot = byId("billing-footer");
  if (tfoot) {
    tfoot.innerHTML = `
        <tr>
          <td colspan="8" class="text-right py-3 pr-4 text-slate-400 uppercase tracking-wider">Spreadsheet Totals</td>
          <td class="py-3 text-amber-700">₹${sumElec.toLocaleString("en-IN")}</td>
          <td class="py-3 text-slate-700">₹${sumRent.toLocaleString("en-IN")}</td>
          <td class="py-3"></td>
          <td class="py-3 text-emerald-700">₹${sumTotal.toLocaleString("en-IN")}</td>
          <td colspan="1"></td>
          <td class="py-3 text-rose-700">₹${sumBalance.toLocaleString("en-IN")}</td>
          <td colspan="2"></td>
        </tr>`;
  }
};
