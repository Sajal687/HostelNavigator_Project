// Read-only post-deploy checks. Makes GET/OPTIONS requests only - never writes data.
// Usage (Node 18+):
//   API_URL=https://hostelnavigatorbackend.onrender.com SITE_URL=https://hostelnavigator.online node scripts/smoke-test.mjs
const API_URL = (process.env.API_URL || "http://localhost:8080").replace(/\/+$/, "");
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
const TIMEOUT_MS = 90_000; // Render free instances can take ~60s to wake up.

let failures = 0;
let warnings = 0;
const pass = (msg) => console.log(`PASS  ${msg}`);
const fail = (msg) => { failures++; console.log(`FAIL  ${msg}`); };
const warn = (msg) => { warnings++; console.log(`WARN  ${msg}`); };

const get = (url, options = {}) => fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), ...options });
const json = async (res) => { try { return await res.json(); } catch { return null; } };

console.log(`API:  ${API_URL}\nSite: ${SITE_URL || "(skipped - set SITE_URL)"}\n`);

// --- API
const started = Date.now();
try {
  const res = await get(`${API_URL}/api/health`);
  const body = await json(res);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (res.ok && body?.status === "ok") pass(`health check (${seconds}s${seconds > 5 ? ", cold start" : ""})`);
  else fail(`health check returned ${res.status}`);
  if (body?.db === "connected") pass("database connected");
  else fail(`database status: ${body?.db ?? "unknown"} - check MONGODB_URI and Atlas network access`);
} catch (error) {
  fail(`health check unreachable: ${error.message}`);
}

let hostelId = null;
const search = await get(`${API_URL}/api/hostels/search?limit=1`);
const searchBody = await json(search);
if (search.ok && searchBody?.success) {
  pass(`search works (${searchBody.pagination.total} published listings)`);
  hostelId = searchBody.data[0]?._id || null;
} else fail(`search returned ${search.status}`);

if (hostelId) {
  const detail = await get(`${API_URL}/api/hostels/${hostelId}`);
  detail.ok ? pass("public hostel detail") : fail(`hostel detail returned ${detail.status}`);
  const reviews = await get(`${API_URL}/api/hostels/${hostelId}/reviews`);
  reviews.ok ? pass("reviews endpoint") : fail(`reviews returned ${reviews.status}`);
} else {
  warn("no published listings yet - detail/reviews checks skipped");
}

const ai = await json(await get(`${API_URL}/api/ai/status`));
ai?.data?.enabled ? pass("AI features enabled") : warn("AI features disabled - set ANTHROPIC_API_KEY on Render to enable");

const contactStatus = await json(await get(`${API_URL}/api/contact/status`));
contactStatus?.data?.enabled
  ? pass(`email configured (contact form -> ${contactStatus.data.email})`)
  : warn("email not configured - set SMTP_* (or EMAIL_USER/EMAIL_PASS) on Render; the contact form falls back to a mailto link");

for (const path of ["/api/env", "/api"]) {
  const res = await get(`${API_URL}${path}`);
  res.status === 404 ? pass(`legacy key-leak route ${path} is gone`) : fail(`${path} returned ${res.status} (should be 404)`);
}

// --- CORS
if (SITE_URL) {
  const origin = new URL(SITE_URL).origin;
  const preflight = await get(`${API_URL}/api/hostels/search`, {
    method: "OPTIONS",
    headers: { Origin: origin, "Access-Control-Request-Method": "GET" },
  });
  preflight.headers.get("access-control-allow-origin") === origin
    ? pass(`CORS allows ${origin}`)
    : fail(`CORS does not allow ${origin} - check CORS_ORIGIN on Render`);
}
const evil = await get(`${API_URL}/api/health`, { headers: { Origin: "https://example.invalid" } });
!evil.headers.get("access-control-allow-origin") ? pass("CORS blocks unknown origins") : fail("CORS allows an unknown origin");

// --- Frontend
if (SITE_URL) {
  const home = await get(SITE_URL);
  home.ok && (await home.text()).includes('id="root"') ? pass("site serves the React app") : fail(`site returned ${home.status}`);

  for (const path of ["/hostellist", "/hosteldetails?id=test", "/ownerdashboard"]) {
    const res = await get(`${SITE_URL}${path}`);
    res.ok ? pass(`deep link ${path} (SPA redirect rule)`) : fail(`deep link ${path} returned ${res.status} - check public/_redirects`);
  }

  const url = new URL(SITE_URL);
  if (url.protocol === "https:") {
    const insecure = await get(`http://${url.host}/`, { redirect: "manual" });
    const location = insecure.headers.get("location") || "";
    [301, 302, 308].includes(insecure.status) && location.startsWith("https://")
      ? pass("HTTP redirects to HTTPS")
      : fail(`HTTP did not redirect to HTTPS (status ${insecure.status})`);

    if (!url.host.startsWith("www.")) {
      try {
        const www = await get(`https://www.${url.host}/`, { redirect: "manual" });
        [200, 301, 302, 308].includes(www.status)
          ? pass(`www.${url.host} responds over HTTPS (${www.status})`)
          : fail(`www.${url.host} returned ${www.status}`);
      } catch (error) {
        fail(`www.${url.host} unreachable (DNS or certificate): ${error.message}`);
      }
    }
  } else {
    warn("SITE_URL is not https - skipping TLS checks");
  }
}

console.log(`\n${failures} failed, ${warnings} warnings`);
process.exit(failures ? 1 : 0);
