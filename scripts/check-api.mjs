/**
 * Quick API smoke test — run after starting backend
 * node scripts/check-api.mjs
 */
const base = process.env.API_URL || "http://localhost:5000";

const checks = [
  { name: "health", url: `${base}/health` },
  { name: "projects", url: `${base}/api/v1/projects` },
];

let ok = true;
for (const c of checks) {
  try {
    const res = await fetch(c.url);
    const body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    console.log(`✓ ${c.name}`, res.status, c.name === "projects" ? `(${body.projects?.length ?? 0} projects)` : "");
  } catch (e) {
    ok = false;
    console.error(`✗ ${c.name}`, e.message);
  }
}
process.exit(ok ? 0 : 1);
