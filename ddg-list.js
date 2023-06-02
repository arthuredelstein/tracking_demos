const duckduckgoDataUrl = "https://raw.githubusercontent.com/duckduckgo/tracker-blocklists/main/app/android-tds.json";

const getDuckDuckGoData = async () => {
  const response = await fetch(duckduckgoDataUrl);
  return response.json();
};

async function fetchWithTimeout(timeout, resource, options = {}) {
  // Borrowed from https://dmitripavlutin.com/timeout-fetch-request/
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
};

const testTrackers = async (trackers) => {
  let results = [];
  for (const [domain, { "default": def, owner: {name, displayName}}] of Object.entries(trackers)) {
    if (def === "block") {
      console.log(`attempting to connect to ${domain}`);
      let result = "", reason = "";
      try {
        const response = await fetchWithTimeout(5000, `https://${domain}`, {mode: "no-cors"});
        result = "loaded";
      } catch (e) {
        result = "failed";
        reason = e.message;
      }
      console.log({domain, def, name, displayName, result, reason});
      results.push({domain, def, name, displayName, result, reason});
    }
  }
  return results;
};

const run = async () => {
  const { trackers } = await getDuckDuckGoData();
  const results = await testTrackers(trackers);
  console.log("Loaded:", results.filter(r => r.result === "loaded").map(r=>([r.domain, trackers[r.domain].owner.name])));
  console.log("Failed:", results.filter(r => r.result === "failed").map(r=>([r.domain, trackers[r.domain].owner.name])));
};

await run();
