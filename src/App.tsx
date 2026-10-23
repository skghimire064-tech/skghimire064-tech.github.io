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
import { LoginPage } from './components/LoginPage';
import { UserManagementView } from './components/UserManagementView';
import { TrackedProject } from './types/procurement';
import { AppUser, ManagedUserInput } from './types/auth';
import {
  createManagedUser,
  createProject,
  deleteManagedUser,
  listManagedUsers,
  listProjects,
  restoreSessionUser,
  signUpWithEmail,
  signInWithUsername,
  signOut,
  updateManagedUser,
  updateProject,
} from './lib/supabaseApi';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const PpmoPprcGuide = lazy(() => import('../ppmo_pprc/src/App'));

function ProcurementApp({
  currentUser,
  onLogout,
  authError,
}: {
  currentUser: AppUser;
  onLogout: () => void;
  authError: string;
}) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [userManagementError, setUserManagementError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setIsProjectsLoading(true);
    setDataError('');
    void listProjects()
      .then((loadedProjects) => {
        if (isCurrent) setProjects(loadedProjects);
      })
      .catch((error: unknown) => {
        if (isCurrent) setDataError(error instanceof Error ? error.message : 'आयोजना विवरण लोड गर्न सकिएन।');
      })
      .finally(() => {
        if (isCurrent) setIsProjectsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (currentUser.role !== 'admin' || activeTab !== 'user-management') return;
    let isCurrent = true;
    setIsUsersLoading(true);
    setUserManagementError('');
    void listManagedUsers()
      .then((loadedUsers) => {
        if (isCurrent) setUsers(loadedUsers);
      })
      .catch((error: unknown) => {
        if (isCurrent) setUserManagementError(error instanceof Error ? error.message : 'प्रयोगकर्ता सूची लोड गर्न सकिएन।');
      })
      .finally(() => {
        if (isCurrent) setIsUsersLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [activeTab, currentUser.role]);

  useEffect(() => {
    if (currentUser.role !== 'admin' && activeTab === 'user-management') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser.role]);

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

  const handleUpdateProject = async (updated: TrackedProject) => {
    setDataError('');
    try {
      const savedProject = await updateProject(updated);
      setProjects((previous) => previous.map((project) => (
        project.id === savedProject.id ? savedProject : project
      )));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'आयोजना परिवर्तन सुरक्षित गर्न सकिएन।');
    }
  };

  const handleAddProject = async (newProject: TrackedProject) => {
    setDataError('');
    try {
      const savedProject = await createProject(newProject, currentUser.id);
      setProjects((previous) => [savedProject, ...previous]);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'नयाँ आयोजना सुरक्षित गर्न सकिएन।');
      throw error;
    }
  };

  const handleAddUser = async (input: ManagedUserInput) => {
    const createdUser = await createManagedUser(input);
    setUsers((previous) => [...previous, createdUser]);
    return createdUser;
  };

  const handleUpdateUser = async (id: string, input: ManagedUserInput) => {
    const updatedUser = await updateManagedUser(id, input);
    setUsers((previous) => previous.map((user) => (user.id === id ? updatedUser : user)));
    return updatedUser;
  };

  const handleDeleteUser = async (id: string) => {
    await deleteManagedUser(id);
    setUsers((previous) => previous.filter((user) => user.id !== id));
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
        userRole={currentUser.role}
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
          onLogout={onLogout}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {authError && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {authError}
            </p>
          )}

          {dataError && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {dataError}
            </p>
          )}

          {isProjectsLoading && activeTab === 'dashboard' && (
            <p role="status" className="mb-4 text-sm text-slate-600">आयोजना विवरण लोड हुँदैछ...</p>
          )}

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

          {activeTab === 'user-management' && currentUser.role === 'admin' && (
            isUsersLoading
              ? <p role="status" className="text-sm text-slate-600">प्रयोगकर्ता सूची लोड हुँदैछ...</p>
              : (
                <UserManagementView
                  users={users}
                  currentUser={currentUser}
                  error={userManagementError}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                />
              )
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
              <span className="font-semibold text-slate-800">सार्वजनिक खरिद सहयोगी</span>
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    let isCurrent = true;
    void restoreSessionUser()
      .then((user) => {
        if (isCurrent) setCurrentUser(user);
      })
      .catch((error: unknown) => {
        if (isCurrent) setAuthError(error instanceof Error ? error.message : 'लगइन सत्र पुनःस्थापना गर्न सकिएन।');
      })
      .finally(() => {
        if (isCurrent) setIsAuthLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setCurrentUser(null);
    });

    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!currentUser) {
    if (!isSupabaseConfigured) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <section className="max-w-xl rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Supabase configuration आवश्यक छ</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Build गर्दा <code>VITE_SUPABASE_URL</code> र <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> उपलब्ध गराउनुहोस्।
              Database schema र पहिलो admin setup का लागि <code>supabase/SETUP.md</code> हेर्नुहोस्।
            </p>
          </section>
        </main>
      );
    }
    if (isAuthLoading) {
      return <main role="status" className="flex min-h-screen items-center justify-center text-sm text-slate-600">लगइन जाँच हुँदैछ...</main>;
    }
    return (
      <LoginPage
        errorMessage={authError}
        onLogin={async (username, password) => {
          setAuthError('');
          const user = await signInWithUsername(username, password);
          setCurrentUser(user);
        }}
        onSignUp={async (username, email, password) => {
          setAuthError('');
          const user = await signUpWithEmail(username, email, password);
          if (user) {
            setCurrentUser(user);
            return false;
          }
          return true;
        }}
      />
    );
  }

  return (
    <ProcurementApp
      currentUser={currentUser}
      authError={authError}
      onLogout={() => {
        void signOut()
          .then(() => {
            setCurrentUser(null);
            setAuthError('');
          })
          .catch((error: unknown) => {
            setAuthError(error instanceof Error ? error.message : 'लगआउट गर्न सकिएन।');
          });
      }}
    />
  );
}
