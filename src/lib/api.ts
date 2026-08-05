export const WEB_URL = "https://script.google.com/macros/s/AKfycbymvxpomXf6Pyvj609uO49R5mnLIKEmcp_2W34XDCwcGMnNZcpxxe_NQ791teHOP0zf2g/exec";

export const api = {
  getAllData: async () => {
    try {
      const res = await fetch(`${WEB_URL}?action=getAllData`, { cache: 'no-store' });
      const data = await res.json();
      return {
        projects: Array.isArray(data.projects) ? data.projects.reverse() : [],
        entries: Array.isArray(data.entries) ? data.entries.reverse() : []
      };
    } catch (e) {
      console.warn("Network sync failed, relying on local cache.");
      return { projects: [], entries: [] };
    }
  },
  getProjects: async () => {
    try {
      const res = await fetch(`${WEB_URL}?action=getProjects`, { cache: 'no-store' });
      const data = await res.json();
      return Array.isArray(data) ? data.reverse() : [];
    } catch (e) {
      console.warn("Network sync failed, relying on local cache.");
      return [];
    }
  },
  getEntries: async () => {
    try {
      const res = await fetch(`${WEB_URL}?action=getEntries`, { cache: 'no-store' });
      const data = await res.json();
      return Array.isArray(data) ? data.reverse() : [];
    } catch (e) {
      console.warn("Network sync failed, relying on local cache.");
      return [];
    }
  },
  saveProject: async (project: any) => {
    try {
      await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveProject', data: project }) });
    } catch (e) { console.warn("Failed to push to server, saved locally."); }
  },
  saveEntry: async (entry: any) => {
    try {
      await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveEntry', data: entry }) });
    } catch (e) { console.warn("Failed to push to server, saved locally."); }
  },
  deleteProject: async (id: string) => {
    try {
      await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteProject', id }) });
    } catch (e) { console.warn("Failed to push to server, saved locally."); }
  },
  updateProject: async (project: any) => {
    try {
      await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateProject', data: project }) });
    } catch (e) { console.warn("Failed to push to server, saved locally."); }
  },
  deleteEntry: async (id: string) => {
    try {
      await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteEntry', id }) });
    } catch (e) { console.warn("Failed to push to server, saved locally."); }
  },
  updateEntry: async (entry: any) => {
    try {
      await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateEntry', data: entry }) });
    } catch (e) { console.warn("Failed to push to server, saved locally."); }
  }
};
