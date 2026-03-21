const fs = require('fs');

let code = fs.readFileSync('js/app.js', 'utf8');

// The dash.innerHTML assignment starts at 'dash.innerHTML = `' right after avatarUrl.
// It ends at:
// `;
// 
//     dash.classList.remove("hidden");
//     const bottomNav = byId("mobile-bottom-nav");

const splitRegex = /dash\.innerHTML = `([\s\S]*?)`;\s*dash\.classList\.remove\("hidden"\);/;

const match = code.match(splitRegex);
if (!match) {
    console.log("Could not find dash.innerHTML assignment block.");
    process.exit(1);
}

const fullHtml = match[1];

// We need to parse out the Profile Card and Payment sections.
// Profile Card starts at <!-- Tenant Profile Card -->
const profileStart = fullHtml.indexOf('<!-- Tenant Profile Card -->');
const profileEnd = fullHtml.indexOf('<!-- Quick Actions Grid -->'); // Actually we removed Quick Actions, let's check what's there

