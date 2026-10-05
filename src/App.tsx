/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ProcurementAdvisorWizard } from './components/ProcurementAdvisorWizard';
import { ProcurementMethodsView } from './components/ProcurementMethodsView';
import { MethodChecklistsView } from './components/MethodChecklistsView';
import { CompleteLawCorpusView } from './components/CompleteLawCorpusView';
import { AmendmentsHighlightView } from './components/AmendmentsHighlightView';
import { StagesGuideView } from './components/StagesGuideView';
import { ChecklistsView } from './components/ChecklistsView';
import { TemplatesView } from './components/TemplatesView';
import { CalculatorView } from './components/CalculatorView';
import { LegalClausesView } from './components/LegalClausesView';
import { SchedulesView } from './components/SchedulesView';
import { SearchAndFilterModal } from './components/SearchAndFilterModal';
import { NewProjectModal } from './components/NewProjectModal';
import { INITIAL_TRACKED_PROJECTS } from './data/procurementData';
import { TrackedProject } from './types/procurement';

const PpmoPprcGuide = lazy(() => import('../ppmo_pprc/src/App'));

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Projects state persistent in localStorage
  const [projects, setProjects] = useState<TrackedProject[]>(() => {
    try {
      const saved = localStorage.getItem('tracked_procurement_projects');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRACKED_PROJECTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tracked_procurement_projects', JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Global keyboard shortcut: "/" or "Ctrl+K" to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !isSearchOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleUpdateProject = (updated: TrackedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddProject = (newProject: TrackedProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleSelectSearchResult = (category: 'method' | 'stage' | 'checklist' | 'clause' | 'schedule', id: string) => {
    if (category === 'method') {
      setSelectedMethodId(id);
      setActiveTab('methods');
    } else if (category === 'stage') {
      setActiveTab('stages');
    } else if (category === 'checklist') {
      setActiveTab('checklists');
    } else if (category === 'clause') {
      setActiveTab('clauses');
    } else if (category === 'schedule') {
      setActiveTab('schedules');
    }
  };

  const navigateToMethodWithId = (methodId: string) => {
    setSelectedMethodId(methodId);
    setActiveTab('methods');
  };

  const navigateToTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setActiveTab('templates');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
      />

      {/* Main Content Area (offset by Sidebar width on desktop) */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header with Breadcrumbs & Actions */}
        <TopHeader
          activeTab={activeTab}
          onToggleSidebarMobile={() => setIsSidebarMobileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
              onSelectMethod={navigateToMethodWithId}
              onSelectStage={() => setActiveTab('stages')}
            />
          )}

          {activeTab === 'advisor' && (
            <ProcurementAdvisorWizard
              onSelectMethod={navigateToMethodWithId}
              onNavigateToTemplate={navigateToTemplate}
            />
          )}

          {activeTab === 'methods' && (
            <ProcurementMethodsView
              initialSelectedMethodId={selectedMethodId}
              onClearInitialMethod={() => setSelectedMethodId(null)}
            />
          )}

          {activeTab === 'method-checklists' && (
            <MethodChecklistsView
              initialMethodId={selectedMethodId || undefined}
              onNavigateToTemplate={navigateToTemplate}
            />
          )}

          {activeTab === 'law-corpus' && (
            <CompleteLawCorpusView />
          )}

          {activeTab === 'amendments' && (
            <AmendmentsHighlightView />
          )}

          {activeTab === 'stages' && (
            <StagesGuideView
              onSelectMethod={navigateToMethodWithId}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              initialTemplateId={selectedTemplateId}
              onSelectMethod={navigateToMethodWithId}
            />
          )}

          {activeTab === 'checklists' && (
            <ChecklistsView
              onNavigateToMethodChecklists={() => setActiveTab('method-checklists')}
            />
          )}

          {activeTab === 'calculator' && (
            <CalculatorView
              onSelectMethod={navigateToMethodWithId}
            />
          )}

          {activeTab === 'clauses' && (
            <LegalClausesView />
          )}

          {activeTab === 'schedules' && (
            <SchedulesView />
          )}

          {activeTab === 'ppmo-pprc' && (
            <Suspense fallback={<div role="status" className="py-8 text-center text-sm text-slate-500">PPMO राय र PPRC निर्णय लोड हुँदैछ...</div>}>
              <PpmoPprcGuide embedded />
            </Suspense>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-8 no-print text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-red-700 text-white flex items-center justify-center font-bold text-[10px]">
                ख
              </div>
              <span className="font-semibold text-slate-800">सार्वजनिक खरिद सहयोगी - नेपाल</span>
              <span>·</span>
              <span className="text-[11px] text-slate-500">
                सार्वजनिक खरिद ऐन २०६३ (दोस्रो संशोधनसहित) र नियमावली २०६४ (१६औँ संशोधन) मा आधारित
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <button onClick={() => setActiveTab('advisor')} className="hover:text-red-700 transition-colors">
                खरिद सल्लाहकार
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('law-corpus')} className="hover:text-red-700 transition-colors">
                ऐन/नियम संग्रह
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('templates')} className="hover:text-red-700 transition-colors">
                कागजात ढाँचा
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('calculator')} className="hover:text-red-700 transition-colors">
                क्याल्कुलेटर
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Universal Search & Multi-facet Filter Modal */}
      <SearchAndFilterModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Add New Procurement Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}
