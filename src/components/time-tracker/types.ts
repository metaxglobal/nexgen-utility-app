export interface Entry {
  id: number;
  staff: string;
  date: string;
  start: string;
  end: string;
  hours: number;
  projectId: string;
  projectName: string;
  stage: string;
  desc: string;
  loggedAt: string;
}

export interface Project {
  id: string;
  name: string;
  client?: string;
  status?: string;
  hours?: number[];
  utilization?: number;
  margin?: number;
  finalPrice?: number;
  estimatedCost?: number;
  staffRates?: number[];
}

export const STAFF_NAMES = ['Sanjana','Senith','Sandun','Dasuni','Prageeth'];
export const STAGES = [
  'Discovery & Planning', 'UI/UX Design', 'Frontend Development', 'Backend Development',
  'CMS Development', 'Database & API', 'Testing & QA', 'Bug Fixing', 'Client Review & Revisions',
  'Deployment & Launch', 'Project Management', 'Client Communication', 'Documentation', 'Other'
];
export const STAGE_COLORS: Record<string, string> = {
  'Discovery & Planning':'#3b82f6',
  'UI/UX Design':'#22c55e',
  'Frontend Development':'#7F77DD',
  'Backend Development':'#534AB7',
  'CMS Development':'#eab308',
  'Database & API':'#ef4444',
  'Testing & QA':'#D4537E',
  'Bug Fixing':'#ef4444',
  'Client Review & Revisions':'#BA7517',
  'Deployment & Launch':'#22c55e',
  'Project Management':'#a1a1aa',
  'Client Communication':'#a1a1aa',
  'Documentation':'#71717a',
  'Other':'#71717a'
};
