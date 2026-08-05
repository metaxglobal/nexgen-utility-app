"use client";
import React, { useState, useEffect } from 'react';
import { Entry, Project } from './types';
import { NavigationTabs } from './ui/NavigationTabs';
import { LogTimePanel } from './sections/LogTimePanel';
import { TodayPanel } from './sections/TodayPanel';
import { ProjectsPanel } from './sections/ProjectsPanel';
import { TeamPanel } from './sections/TeamPanel';
import { TaskAnalysisPanel } from './sections/TaskAnalysisPanel';
import { Clock01Icon } from "hugeicons-react";

const STORAGE_KEY = 'ngl_time_entries';
const PROJECTS_KEY = 'ngl_projects';

import { api } from '@/lib/api';

export function TimeTracker() {
  const [activeTab, setActiveTab] = useState('log');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      // 1. Instant load from local cache
      const cachedProjects = localStorage.getItem('ngl_cache_projects');
      const cachedEntries = localStorage.getItem('ngl_cache_entries');
      
      if (cachedProjects && cachedEntries) {
        setProjects(JSON.parse(cachedProjects));
        setEntries(JSON.parse(cachedEntries));
        setIsLoaded(true); // Instant render!
      }

      // 2. Background sync with Google Sheets (1 request instead of 2)
      try {
        const data = await api.getAllData();
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
          localStorage.setItem('ngl_cache_projects', JSON.stringify(data.projects));
        }
        if (data.entries && Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
          localStorage.setItem('ngl_cache_entries', JSON.stringify(data.entries));
        }
      } catch (err) {
        console.error("Failed to load from Google Sheets", err);
      }
      
      if (!isLoaded) setIsLoaded(true);
    }
    loadData();
  }, []);

  const saveEntries = (newEntries: Entry[]) => {
    setEntries(newEntries);
    localStorage.setItem('ngl_cache_entries', JSON.stringify(newEntries));
  };

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('ngl_cache_projects', JSON.stringify(newProjects));
  };

  if (!isLoaded) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-[#CCFF33] rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-medium">Syncing with Google Sheets...</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-12 pb-24 font-sans text-white">
      <div className="flex items-center space-x-4 pb-2">
        <Clock01Icon className="w-10 h-10 text-[#CCFF33]" />
        <h2 className="text-3xl md:text-4xl font-black tracking-wide text-white uppercase">Time Tracker</h2>
      </div>

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-8">
        {activeTab === 'log' && <LogTimePanel entries={entries} projects={projects} saveEntries={saveEntries} />}
        {activeTab === 'today' && <TodayPanel entries={entries} />}
        {activeTab === 'projects' && <ProjectsPanel entries={entries} projects={projects} saveProjects={saveProjects} />}
        {activeTab === 'team' && <TeamPanel entries={entries} />}
        {activeTab === 'tasks' && <TaskAnalysisPanel entries={entries} />}
      </div>
    </div>
  );
}
