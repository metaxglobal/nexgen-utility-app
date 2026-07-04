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
      try {
        const [p, e] = await Promise.all([
          api.getProjects(),
          api.getEntries()
        ]);
        if (p) setProjects(p);
        if (e) setEntries(e);
      } catch (err) {
        console.error("Failed to load from Google Sheets", err);
      }
      setIsLoaded(true);
    }
    loadData();
  }, []);

  const saveEntries = (newEntries: Entry[]) => {
    setEntries(newEntries);
  };

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
  };

  if (!isLoaded) return null;

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
