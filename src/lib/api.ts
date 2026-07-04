export const WEB_URL = "https://script.google.com/macros/s/AKfycbymvxpomXf6Pyvj609uO49R5mnLIKEmcp_2W34XDCwcGMnNZcpxxe_NQ791teHOP0zf2g/exec";

export const api = {
  getProjects: async () => {
    try {
      const res = await fetch(`${WEB_URL}?action=getProjects`, { cache: 'no-store' });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  getEntries: async () => {
    try {
      const res = await fetch(`${WEB_URL}?action=getEntries`, { cache: 'no-store' });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  saveProject: async (project: any) => {
    await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveProject', data: project }) });
  },
  saveEntry: async (entry: any) => {
    await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveEntry', data: entry }) });
  },
  deleteProject: async (id: string) => {
    await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteProject', id }) });
  },
  updateProject: async (project: any) => {
    await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateProject', data: project }) });
  },
  deleteEntry: async (id: string) => {
    await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'deleteEntry', id }) });
  },
  updateEntry: async (entry: any) => {
    await fetch(WEB_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'updateEntry', data: entry }) });
  }
};
