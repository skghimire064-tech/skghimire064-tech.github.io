import React, { useState } from 'react';
import { 
  PlusCircle, 
  Briefcase, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  ChevronRight,
  Filter,
  Layers,
  Calendar,
  X,
  Printer,
  Edit3,
  ShieldCheck,
  Check
} from 'lucide-react';
import { TrackedProject, ProcurementType } from '../types/procurement';
import { 
  PROCUREMENT_METHODS, 
  PROCUREMENT_STAGES, 
  COMPLIANCE_CHECKLIST_MASTER 
} from '../data/procurementData';
import { 
  formatNepaliCurrency, 
  formatCompactCurrency, 
  analyzeProcurementThreshold 
} from '../utils/procurementUtils';

interface DashboardViewProps {
  projects: TrackedProject[];
  onUpdateProject: (project: TrackedProject) => void;
  onOpenNewProjectModal: () => void;
  onSelectMethod: (methodId: string) => void;
  onSelectStage: (stageId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onUpdateProject,
  onOpenNewProjectModal,
  onSelectMethod,
  onSelectStage,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<TrackedProject | null>(null);
  const [activeTabInDrawer, setActiveTabInDrawer] = useState<'timeline' | 'checklist' | 'info'>('timeline');

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (selectedTypeFilter !== 'all' && p.procurementType !== selectedTypeFilter) return false;
    return true;
  });

  // Calculate Metrics
  const totalBudget = projects.reduce((acc, p) => acc + p.estimatedAmount, 0);
  const preparationCount = projects.filter((p) => p.currentStageId === 'stage-1' || p.currentStageId === 'stage-2').length;
  const biddingCount = projects.filter((p) => p.currentStageId === 'stage-3' || p.currentStageId === 'stage-4').length;
  const evaluationCount = projects.filter((p) => p.currentStageId === 'stage-5' || p.currentStageId === 'stage-6').length;
  const executionCount = projects.filter((p) => p.currentStageId === 'stage-7').length;

  const toggleChecklist = (projectId: string, checkId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const newStatus = {
      ...proj.checklistStatus,
      [checkId]: !proj.checklistStatus[checkId],
    };

    // calculate new progress percent based on completed items
    const relevantChecks = COMPLIANCE_CHECKLIST_MASTER.filter(c => c.procurementTypes.includes(proj.procurementType));
    const completedCount = relevantChecks.filter(c => newStatus[c.id]).length;
    const newProgress = Math.round((completedCount / relevantChecks.length) * 100);

    const updated = {
      ...proj,
      checklistStatus: newStatus,
      progressPercent: newProgress,
    };

    onUpdateProject(updated);
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(updated);
    }
  };

  const advanceStage = (projectId: string, nextStageId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const updated = {
      ...proj,
      currentStageId: nextStageId,
    };
    onUpdateProject(updated);
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Action */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="text-red-400 font-semibold text-xs tracking-wider uppercase block mb-1">
            सार्वजनिक निकायको खरिद सहयोगी ड्यासबोर्ड
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            खरिद प्रक्रिया गाइड ड्यासबोर्ड
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            सार्वजनिक खरिद ऐन, २०६३ र सार्वजनिक खरिद नियमावली, २०६४ (१६औँ संशोधन) बमोजिम निर्माण, मालसामान वा सेवा खरिद गर्दा अपनाउनुपर्ने कानुनी प्रक्रिया, अख्तियारी, आवश्यक कागजात र चेकलिस्ट।
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenNewProjectModal}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              नयाँ खरिद आयोजना थप्नुहोस्
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>१६औँ संशोधनका नयाँ प्रावधानहरू (औसत अङ्क, ५ ठेक्का सीमा, SSF) समावेश</span>
            </div>
          </div>
        </div>

        {/* Decorative subtle background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Layers className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>कुल चालू योजना</span>
            <Briefcase className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{projects.length}</span>
            <span className="text-xs text-slate-500">आयोजना</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-600 font-mono">
            {formatCompactCurrency(totalBudget)} बजेट
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>पूर्वतयारी/लागत</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{preparationCount}</span>
            <span className="text-xs text-slate-500">योजना</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            चरण १ र २ मा
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>बोलपत्र आह्वान</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{biddingCount}</span>
            <span className="text-xs text-slate-500">योजना</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-700 font-medium">
            म्याद जारी (चरण ३-४)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>मूल्याङ्कन/आशय</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{evaluationCount}</span>
            <span className="text-xs text-slate-500">योजना</span>
          </div>
          <div className="mt-1 text-[11px] text-purple-700 font-medium">
            समितिमा विचाराधीन
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>सम्झौता कार्यान्वयन</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{executionCount}</span>
            <span className="text-xs text-slate-500">योजना</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            कार्य प्रगतिमा (चरण ७)
          </div>
        </div>
      </div>

      {/* Projects Management Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              खरिद आयोजनाहरूको सूची तथा चरणबद्ध स्थिति
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक आयोजनामा क्लिक गरी विस्तृत प्रक्रियागत चरण र अनिवार्य कानुनी चेकलिस्ट हेर्नुहोस् र सम्पादन गर्नुहोस्।
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सबै ({projects.length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('works')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedTypeFilter === 'works'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                निर्माण
              </button>
              <button
                onClick={() => setSelectedTypeFilter('goods')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedTypeFilter === 'goods'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मालसामान
              </button>
              <button
                onClick={() => setSelectedTypeFilter('consulting')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedTypeFilter === 'consulting'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                परामर्श
              </button>
            </div>
          </div>
        </div>

        {/* Project Table List */}
        <div className="divide-y divide-slate-100">
          {filteredProjects.map((project) => {
            const method = PROCUREMENT_METHODS.find((m) => m.id === project.methodId);
            const stage = PROCUREMENT_STAGES.find((s) => s.id === project.currentStageId);
            const totalChecks = COMPLIANCE_CHECKLIST_MASTER.filter(c => c.procurementTypes.includes(project.procurementType)).length;
            const completedChecks = Object.keys(project.checklistStatus).filter(k => project.checklistStatus[k]).length;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Project title & metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-slate-800">{project.officeName}</span>
                      <span>·</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-medium">
                        {project.procurementType === 'works' ? 'निर्माण कार्य' : project.procurementType === 'goods' ? 'मालसामान' : 'परामर्श सेवा'}
                      </span>
                      <span>·</span>
                      <span className="text-slate-600">{method?.nameNepali || 'खुला बोलपत्र'}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                      {project.title}
                    </h3>

                    {project.notes && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                        टिप्पणी: {project.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Stage, Amount & Progress */}
                  <div className="flex items-center gap-6 shrink-0 justify-between lg:justify-end">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-500">लागत अनुमान</div>
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatNepaliCurrency(project.estimatedAmount)}
                      </div>
                    </div>

                    <div className="text-left lg:text-right min-w-[130px]">
                      <div className="text-xs font-medium text-slate-700">
                        {stage?.titleNepali.split('.')[1] || 'कार्यान्वयन'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 tabular-nums">
                          {project.progressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="p-2 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Micro Stage Steps Visual Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-7 gap-1">
                  {PROCUREMENT_STAGES.map((stg) => {
                    const isCurrent = project.currentStageId === stg.id;
                    const isPassed = stg.stageNo < (stage?.stageNo || 1);
                    return (
                      <div
                        key={stg.id}
                        className="flex flex-col items-center text-center"
                        title={`${stg.titleNepali}`}
                      >
                        <div
                          className={`h-1.5 w-full rounded-full transition-colors ${
                            isPassed
                              ? 'bg-emerald-500'
                              : isCurrent
                              ? 'bg-red-600 ring-2 ring-red-200'
                              : 'bg-slate-200'
                          }`}
                        ></div>
                        <span className="text-[10px] text-slate-500 mt-1 hidden sm:block truncate w-full">
                          {stg.stageNo}. {stg.titleNepali.split('.')[1]?.trim().slice(0, 8)}...
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Project Drawer / Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-800">{selectedProject.officeName}</span>
                  <span>·</span>
                  <span>बजेट: {formatNepaliCurrency(selectedProject.estimatedAmount)}</span>
                  <span>·</span>
                  <span>स्रोत: {selectedProject.budgetSource}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedProject.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors no-print"
                  title="प्रिन्ट सारांश"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-nav inside Drawer */}
            <div className="px-5 pt-3 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTabInDrawer('timeline')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    activeTabInDrawer === 'timeline'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  प्रक्रियागत चरण तथा टाइमलाइन
                </button>
                <button
                  onClick={() => setActiveTabInDrawer('checklist')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    activeTabInDrawer === 'checklist'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  अनुपालन चेकलिस्ट ({Object.keys(selectedProject.checklistStatus).filter(k => selectedProject.checklistStatus[k]).length} सम्पन्न)
                </button>
                <button
                  onClick={() => setActiveTabInDrawer('info')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    activeTabInDrawer === 'info'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  कानुनी सर्त तथा अख्तियारी
                </button>
              </div>

              {/* Quick stage advance selector */}
              <div className="flex items-center gap-2 py-1">
                <span className="text-slate-500 font-medium">हालको चरण:</span>
                <select
                  value={selectedProject.currentStageId}
                  onChange={(e) => advanceStage(selectedProject.id, e.target.value)}
                  className="text-xs bg-slate-100 border border-slate-300 rounded-md py-1 px-2 font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                >
                  {PROCUREMENT_STAGES.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.titleNepali}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              {activeTabInDrawer === 'timeline' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                    <div>
                      खरिद विधि: <span className="font-semibold text-slate-900">{PROCUREMENT_METHODS.find(m => m.id === selectedProject.methodId)?.nameNepali}</span>
                    </div>
                    <div>
                      समग्र प्रगति: <span className="font-bold text-red-700 tabular-nums">{selectedProject.progressPercent}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {PROCUREMENT_STAGES.map((stg) => {
                      const isCurrent = selectedProject.currentStageId === stg.id;
                      const currentStageObj = PROCUREMENT_STAGES.find(s => s.id === selectedProject.currentStageId);
                      const isCompleted = stg.stageNo < (currentStageObj?.stageNo || 1);

                      return (
                        <div
                          key={stg.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? 'border-red-500 bg-red-50/20 shadow-xs ring-1 ring-red-500/20'
                              : isCompleted
                              ? 'border-slate-200 bg-white'
                              : 'border-slate-200/60 bg-slate-50/50 opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                  isCompleted
                                    ? 'bg-emerald-600 text-white'
                                    : isCurrent
                                    ? 'bg-red-700 text-white animate-pulse'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isCompleted ? <Check className="w-4 h-4" /> : stg.stageNo}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  {stg.titleNepali}
                                </h4>
                                <p className="text-xs text-slate-600 mt-1">{stg.description}</p>
                                <div className="text-[11px] text-slate-600 font-mono mt-1">
                                  कानुनी आधार: {stg.legalBasis}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => advanceStage(selectedProject.id, stg.id)}
                              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                                isCurrent
                                  ? 'bg-red-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isCurrent ? 'सक्रिय चरण' : 'यस चरणमा सार्नुहोस्'}
                            </button>
                          </div>

                          {/* Quick stage activities preview */}
                          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">प्रमुख कार्यहरू:</span>
                            <ul className="list-disc pl-5 mt-1 space-y-0.5">
                              {stg.keyActivities.slice(0, 3).map((act, idx) => (
                                <li key={idx}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTabInDrawer === 'checklist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                    <span>
                      यस आयोजनाका लागि लागू हुने अनिवार्य कानुनी मापदण्डहरू टिक लगाउनुहोस्।
                    </span>
                    <span className="font-semibold text-slate-900">
                      प्रगति: {selectedProject.progressPercent}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    {PROCUREMENT_STAGES.map((stg) => {
                      const stageChecks = COMPLIANCE_CHECKLIST_MASTER.filter(
                        c => c.stageId === stg.id && c.procurementTypes.includes(selectedProject.procurementType)
                      );
                      if (stageChecks.length === 0) return null;

                      return (
                        <div key={stg.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                          <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide flex items-center justify-between">
                            <span>{stg.titleNepali}</span>
                            <span className="text-[11px] text-slate-600 font-normal">
                              ({stageChecks.filter(c => selectedProject.checklistStatus[c.id]).length} / {stageChecks.length} सम्पन्न)
                            </span>
                          </h4>

                          <div className="space-y-2">
                            {stageChecks.map((chk) => {
                              const isChecked = !!selectedProject.checklistStatus[chk.id];
                              return (
                                <label
                                  key={chk.id}
                                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer text-left bg-white/70 border border-slate-200/60"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleChecklist(selectedProject.id, chk.id)}
                                    className="mt-0.5 w-4 h-4 text-red-600 rounded-sm border-slate-300 focus:ring-red-500 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                      {chk.text}
                                    </span>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                                      <span className="font-mono text-emerald-800">{chk.legalRef}</span>
                                      {chk.notes && <span>· {chk.notes}</span>}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTabInDrawer === 'info' && (
                <div className="space-y-4">
                  {/* Analysis of threshold for this project */}
                  {(() => {
                    const analysis = analyzeProcurementThreshold(selectedProject.procurementType, selectedProject.estimatedAmount);
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">
                            कानुनी अख्तियारी तथा सीमा विवरण
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">लागत अनुमान स्वीकृत गर्ने अधिकारी</span>
                              <span className="font-bold text-slate-900 mt-0.5 block">{analysis.approvingAuthorityCostEstimate}</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">बोलपत्र स्वीकृत गर्ने अधिकारी</span>
                              <span className="font-bold text-slate-900 mt-0.5 block">{analysis.approvingAuthorityBidAcceptance}</span>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">बोलपत्र जमानत (Bid Security २-३%)</span>
                              <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                                {formatNepaliCurrency(analysis.requiredBidSecurityRange.minAmount)} देखि {formatNepaliCurrency(analysis.requiredBidSecurityRange.maxAmount)}
                              </span>
                            </div>
                            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                              <span className="text-slate-500 block">कार्यसम्पादन जमानत (५%)</span>
                              <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                                {formatNepaliCurrency(analysis.minimumPerformanceSecurity)} (+१५% बढी घटेमा थप)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                          <h4 className="font-bold text-slate-900 text-sm">यस आयोजनाका मुख्य कानुनी सर्तहरू:</h4>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">बोलपत्र मान्य अवधि:</span>
                            <span className="font-mono">{analysis.bidValidityDays} दिन (जमानत अवधि {analysis.bidSecurityValidityDays} दिन)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">सूचना प्रकाशन म्याद:</span>
                            <span className="font-mono">कम्तीमा {analysis.minimumNoticeDays} दिन (e-GP अनिवार्य)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">दुई खाम प्रणाली:</span>
                            <span className="font-mono">{analysis.isTwoEnvelopeRequired ? 'अनिवार्य (लागत रु २ करोड माथि)' : 'ऐच्छिक/लागू नहुने'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">सामाजिक सुरक्षा कोष (SSF):</span>
                            <span>ऐनको दफा ५२ख अनुसार कामदारहरूको SSF आबद्धता र बैंक खाता भुक्तानी अनिवार्य</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">मोबिलाइजेसन पेश्की:</span>
                            <span>अधिकतम २०% (पहिलो पटक १०% सम्म) बैंक ग्यारेन्टी विरुद्ध</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono text-slate-500">आयोजना ID: {selectedProject.id}</span>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
