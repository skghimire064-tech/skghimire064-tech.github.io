import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Circle, 
  Printer, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Scale, 
  ArrowRight, 
  RotateCcw,
  Building,
  Check,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Filter,
  Download
} from 'lucide-react';
import { PROCUREMENT_METHODS } from '../data/procurementData';
import { PROCUREMENT_TEMPLATES, ProcurementTemplate } from '../data/templatesData';
import { formatNepaliCurrency } from '../utils/procurementUtils';
import { GuideSourceNotice } from './GuideSourceNotice';
import { 
  WORKFLOW_PRESETS, 
  METHOD_WORKFLOWS, 
  DEFAULT_MILESTONES,
  WorkflowMilestone, 
  MilestoneTask, 
  WorkflowPreset 
} from '../data/workflowWizardData';

// Re-export types and presets for backwards compatibility
export type { WorkflowMilestone, MilestoneTask, WorkflowPreset };
export { WORKFLOW_PRESETS };

// Export default milestones as fallback for any legacy consumers
export const MILESTONES_DATA: WorkflowMilestone[] = DEFAULT_MILESTONES;

interface ProcurementWorkflowWizardProps {
  onNavigateToTemplate?: (templateId: string) => void;
  onNavigateToClause?: (clauseNo: string) => void;
}

export const ProcurementWorkflowWizard: React.FC<ProcurementWorkflowWizardProps> = ({
  onNavigateToTemplate,
  onNavigateToClause,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('workflow_preset_id');
      if (saved && WORKFLOW_PRESETS.some(p => p.id === saved)) return saved;
    } catch {}
    return 'ncb-works';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('workflow_selected_category');
      if (saved) return saved;
    } catch {}
    return 'all';
  });
  const [customProjectTitle, setCustomProjectTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('workflow_project_title');
      if (saved) return saved;
    } catch {}
    return 'रु ३ करोडको भवन/सडक निर्माण (NCB Works - राष्ट्रिय खुला बोलपत्र)';
  });
  const [customOfficeName, setCustomOfficeName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('workflow_office_name');
      if (saved) return saved;
    } catch {}
    return 'शहरी विकास तथा भवन निर्माण विभाग';
  });
  const [customContractNo, setCustomContractNo] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('workflow_contract_no');
      if (saved) return saved;
    } catch {}
    return 'OFFICE/WORKS/01-083/84';
  });
  const [customAmount, setCustomAmount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('workflow_custom_amount');
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return 30000000;
  });

  // Completed task ids
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('workflow_completed_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [activeStepNo, setActiveStepNo] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('workflow_active_step_no');
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 1) return num;
      }
    } catch {}
    return 1;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('workflow_preset_id', selectedPresetId);
      localStorage.setItem('workflow_selected_category', selectedCategory);
      localStorage.setItem('workflow_active_step_no', String(activeStepNo));
      localStorage.setItem('workflow_project_title', customProjectTitle);
      localStorage.setItem('workflow_office_name', customOfficeName);
      localStorage.setItem('workflow_contract_no', customContractNo);
      localStorage.setItem('workflow_custom_amount', String(customAmount));
      localStorage.setItem('workflow_completed_tasks', JSON.stringify(completedTaskIds));
    } catch {}
  }, [
    selectedPresetId,
    selectedCategory,
    activeStepNo,
    customProjectTitle,
    customOfficeName,
    customContractNo,
    customAmount,
    completedTaskIds,
  ]);

  // Active preset
  const activePreset = useMemo(() => {
    return WORKFLOW_PRESETS.find(p => p.id === selectedPresetId) || WORKFLOW_PRESETS[0];
  }, [selectedPresetId]);

  // Current method details from procurementData
  const activeMethod = useMemo(() => {
    const methodId = activePreset.methodId || selectedPresetId;
    return PROCUREMENT_METHODS.find(m => m.id === methodId) || PROCUREMENT_METHODS[0];
  }, [activePreset, selectedPresetId]);

  // Active Milestones specific to the selected procurement method
  const activeMilestones = useMemo<WorkflowMilestone[]>(() => {
    const methodId = activePreset.methodId || selectedPresetId;
    return METHOD_WORKFLOWS[methodId] || DEFAULT_MILESTONES;
  }, [activePreset, selectedPresetId]);

  // Handle Preset selection
  const handleSelectPreset = (preset: WorkflowPreset) => {
    setSelectedPresetId(preset.id);
    setCustomProjectTitle(preset.title);
    setCustomAmount(preset.defaultAmount);
    setCustomContractNo(`OFFICE/${preset.category.toUpperCase()}/01-083/84`);
    setActiveStepNo(1);
  };

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Progress calculation
  const totalTasks = useMemo(() => {
    return activeMilestones.reduce((acc, m) => acc + m.tasks.length, 0);
  }, [activeMilestones]);

  const completedCount = useMemo(() => {
    return Object.values(completedTaskIds).filter(Boolean).length;
  }, [completedTaskIds]);

  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Active Milestone object
  const activeMilestone = useMemo(() => {
    return activeMilestones.find(m => m.stepNo === activeStepNo) || activeMilestones[0];
  }, [activeMilestones, activeStepNo]);

  const activeStepCompletedCount = activeMilestone ? activeMilestone.tasks.filter(t => completedTaskIds[t.id]).length : 0;
  const isActiveStepFullyDone = activeMilestone && activeMilestone.tasks.length > 0 && activeStepCompletedCount === activeMilestone.tasks.length;

  // Filtered Presets by Category Tab
  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'all') return WORKFLOW_PRESETS;
    return WORKFLOW_PRESETS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  // Related Templates for this method
  const methodTemplates = useMemo(() => {
    const methodId = activePreset.methodId || selectedPresetId;
    return PROCUREMENT_TEMPLATES.filter(tmpl => 
      tmpl.relatedMethods.includes(methodId) || 
      tmpl.relatedMethods.includes('all')
    );
  }, [activePreset, selectedPresetId]);

  const handlePrint = () => {
    window.print();
  };

  const resetAllProgress = () => {
    if (window.confirm('के तपाईं सम्पूर्ण कार्यप्रवाहको चेकलिस्ट सुरुदेखि पुनः रिसेट गर्न चाहनुहुन्छ?')) {
      setCompletedTaskIds({});
      setActiveStepNo(1);
      try {
        localStorage.removeItem('workflow_completed_tasks');
        localStorage.setItem('workflow_active_step_no', '1');
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      <GuideSourceNotice />
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>अन्तरक्रियात्मक खरिद कार्यप्रवाह विजार्ड (Interactive Procurement Workflow Wizard)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            चरणबद्ध खरिद प्रक्रिया तथा विधिगत माइलस्टोन गाइड
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            'खरिद विधिहरू' मेनुमा रहेका १३ वटै आधिकारिक खरिद विधिहरू मध्ये आफ्नो आयोजनाको प्रकृति अनुसार विधि छान्नुहोस्। सोही खरिद प्रकृतिका विशिष्ट कानूनी चरणहरू, कार्य चेकलिस्ट, आवश्यक सरकारी कागजातहरू र ढाँचा (Templates) क्रमैसँग पछ्याउनुहोस्।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetAllProgress}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रिसेट</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>A4 प्रिन्ट / PDF एक्सपोर्ट</span>
          </button>
        </div>
      </div>

      {/* Printable Official Header (Shown Only on Print) */}
      <div className="hidden print-only text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold text-black">{customOfficeName}</h1>
        <h2 className="text-base font-semibold text-gray-800 mt-1">
          सार्वजनिक खरिद प्रक्रियागत माइलस्टोन तथा अनुपालन चेकलिस्ट
        </h2>
        <div className="text-xs text-gray-700 font-medium mt-1">
          खरिद विधि: <strong>{activePreset.methodName}</strong> (कानूनी आधार: {activeMethod.legalActSection}, {activeMethod.legalRuleSection})
        </div>
        <div className="flex justify-between text-xs mt-3 text-gray-700 px-4">
          <span><strong>आयोजना:</strong> {customProjectTitle}</span>
          <span><strong>ठेक्का नं:</strong> {customContractNo}</span>
          <span><strong>लागत अनुमान:</strong> {formatNepaliCurrency(customAmount)}</span>
        </div>
      </div>

      {/* 1. Preset Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <label className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-700" />
            <span>१. खरिद विधि वा आयोजनाको नमूना छान्नुहोस् ({WORKFLOW_PRESETS.length} विधिहरू उपलब्ध):</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">
            हाल छानिएको: <strong className="text-red-700">{activePreset.methodName}</strong>
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            सबै खरिद विधिहरू ({WORKFLOW_PRESETS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('works')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'works'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            निर्माण कार्य ({WORKFLOW_PRESETS.filter(p => p.category === 'works').length})
          </button>
          <button
            onClick={() => setSelectedCategory('goods')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'goods'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            मालसामान आपूर्ति ({WORKFLOW_PRESETS.filter(p => p.category === 'goods').length})
          </button>
          <button
            onClick={() => setSelectedCategory('consulting')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'consulting'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            परामर्श सेवा ({WORKFLOW_PRESETS.filter(p => p.category === 'consulting').length})
          </button>
          <button
            onClick={() => setSelectedCategory('user-committee')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'user-committee'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            उपभोक्ता समिति ({WORKFLOW_PRESETS.filter(p => p.category === 'user-committee').length})
          </button>
          <button
            onClick={() => setSelectedCategory('services')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'services'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            सेवा तथा अन्य ({WORKFLOW_PRESETS.filter(p => p.category === 'services').length})
          </button>
        </div>

        {/* Grid of All 13 Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
          {filteredPresets.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-red-50/90 border-red-600 shadow-xs ring-1 ring-red-600'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-red-700' : 'text-slate-700'}`}>
                    {preset.methodName}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-700 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {preset.shortDesc}
                </p>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>प्रारम्भिक रकम: {formatNepaliCurrency(preset.defaultAmount)}</span>
                  <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">
                    {METHOD_WORKFLOWS[preset.methodId]?.length || 5} चरणहरू
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Project Customization Metadata */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">कार्यालयको नाम:</label>
            <input
              type="text"
              value={customOfficeName}
              onChange={(e) => setCustomOfficeName(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-red-600 focus:outline-hidden text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-600 block mb-1">आयोजनाको नाम:</label>
            <input
              type="text"
              value={customProjectTitle}
              onChange={(e) => setCustomProjectTitle(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-red-600 focus:outline-hidden text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">ठेक्का नं:</label>
            <input
              type="text"
              value={customContractNo}
              onChange={(e) => setCustomContractNo(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-red-600 focus:outline-hidden text-xs"
            />
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="w-full sm:w-auto">
          <span className="text-xs text-slate-500">यस विधिको कुल प्रक्रियागत प्रगति:</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{progressPercentage}%</span>
            <span className="text-xs text-slate-600">
              ({completedCount}/{totalTasks} अनिवार्य कार्य सम्पन्न)
            </span>
          </div>
        </div>

        <div className="w-full sm:flex-1 max-w-md">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-red-600 to-emerald-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {progressPercentage === 100 ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>सम्पूर्ण खरिद चक्र सम्पन्न!</span>
            </span>
          ) : (
            <span>चालु माइलस्टोन: चरण {activeStepNo}/{activeMilestones.length}</span>
          )}
        </div>
      </div>

      {/* Stepper Navigation: Dynamic Horizontal Steps based on Selected Procurement Method */}
      <div className="flex flex-wrap gap-2 no-print">
        {activeMilestones.map((milestone) => {
          const isActive = activeStepNo === milestone.stepNo;
          const stepDoneTasks = milestone.tasks.filter(t => completedTaskIds[t.id]).length;
          const isStepDone = stepDoneTasks === milestone.tasks.length;

          return (
            <button
              key={milestone.stepNo}
              onClick={() => setActiveStepNo(milestone.stepNo)}
              className={`p-3 rounded-xl border text-left transition-all relative flex-1 min-w-[140px] cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white border-blue-700 shadow-md ring-2 ring-blue-700/20'
                  : isStepDone
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-mono font-bold ${isActive ? 'text-red-200' : isStepDone ? 'text-emerald-700' : 'text-slate-500'}`}>
                  चरण {milestone.stepNo}
                </span>
                {isStepDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className={`text-[10px] font-mono ${isActive ? 'text-red-200' : 'text-slate-400'}`}>
                    {stepDoneTasks}/{milestone.tasks.length}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">
                {milestone.titleNepali}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Milestone Deep-Dive Box */}
      {activeMilestone && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Milestone Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
                <span>माइलस्टोन {activeMilestone.stepNo} / {activeMilestones.length}</span>
                <span>·</span>
                <span className="text-slate-500 font-normal">{activeMilestone.targetTimeline}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {activeMilestone.titleNepali}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono mt-1">
                <span>कानूनी आधार: {activeMilestone.legalBasis}</span>
                <span>·</span>
                <span className="text-slate-700 font-semibold">{activePreset.methodName}</span>
              </div>
            </div>

            {/* Quick template button */}
            {activeMilestone.templateId && onNavigateToTemplate && (
              <button
                onClick={() => onNavigateToTemplate(activeMilestone.templateId!)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>{activeMilestone.templateLabel || 'सम्बन्धित टिप्पणी ढाँचा खोल्नुहोस्'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Milestone Body */}
          <div className="p-6 space-y-6">
            {/* 1. Action Checklist Tasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>यस चरणमा गर्नैपर्ने अनिवार्य कार्यहरू (Step Tasks Checklist):</span>
                </h4>
                <span className="text-xs text-slate-500">
                  सम्पन्न भएका बुँदामा टिक लगाउनुहोस् ({activeStepCompletedCount}/{activeMilestone.tasks.length})
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {activeMilestone.tasks.map((task) => {
                  const isChecked = !!completedTaskIds[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 text-xs sm:text-sm">
                        <p className={`font-medium ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.label}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded-sm">
                          {task.clauseRef}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Mandatory Documents & Red Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Required Documents */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-700" />
                  <span>यस चरणका सरकारी कागजातहरू (Required Documents):</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeMilestone.requiredDocs.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags & Fatal Mistakes */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2.5">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>सावधानी तथा बेरुजु जोखिम (Fatal Mistakes & Red Flags):</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-900/90 leading-relaxed">
                  {activeMilestone.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 no-print">
              <button
                disabled={activeStepNo === 1}
                onClick={() => setActiveStepNo(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                अघिल्लो माइलस्टोन
              </button>

              <span className="text-xs text-slate-500 font-medium">
                चरण {activeStepNo} / {activeMilestones.length}
              </span>

              <button
                disabled={activeStepNo === activeMilestones.length}
                onClick={() => setActiveStepNo(prev => Math.min(activeMilestones.length, prev + 1))}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>पछिल्लो माइलस्टोन</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Section: All Templates & Documents for This Specific Method */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
              <FileText className="w-4 h-4" />
              <span>कागजात ढाँचा तथा कानूनी दस्तावेज (Official Documents & Templates)</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              '{activePreset.methodName}' का लागि उपलब्ध कागजात ढाँचाहरू तथा अभिलेख
            </h3>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            कुल ढाँचाहरू: <strong>{methodTemplates.length}</strong>
          </span>
        </div>

        {/* Templates Grid for this method */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {methodTemplates.map((template) => (
            <div 
              key={template.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-red-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-mono text-red-700 font-semibold">{template.legalReference}</span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                    {template.category}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {template.titleNepali}
                </h5>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {onNavigateToTemplate && (
                <button
                  onClick={() => onNavigateToTemplate(template.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-red-50 text-red-700 border border-slate-200 hover:border-red-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>यो कागजात ढाँचा खोल्नुहोस्</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Method Statutory Summary Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">कानूनी दफा र नियम:</span>
            <span className="font-semibold text-slate-900">ऐन {activeMethod.legalActSection}, नियम {activeMethod.legalRuleSection}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">सूचना प्रकाशन म्याद:</span>
            <span className="font-semibold text-slate-900">{activeMethod.noticePeriodDays}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">धरौटी / जमानत दर:</span>
            <span className="font-semibold text-slate-900">{activeMethod.bidSecurityRate}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">स्वीकृत गर्ने अधिकारी:</span>
            <span className="font-semibold text-slate-900">{activeMethod.approvalAuthority}</span>
          </div>
        </div>
      </div>

      {/* Complete Printable Summary (Shown Only during Print) */}
      <div className="hidden print-only space-y-6 pt-4">
        <h3 className="text-sm font-bold border-b pb-1 text-black">
          सम्पूर्ण प्रक्रियागत {activeMilestones.length} माइलस्टोन चेकलिस्ट - {activePreset.methodName} (Procurement Audit Roadmap):
        </h3>
        <table className="w-full text-[11px] border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left w-12">चरण</th>
              <th className="border border-gray-400 p-2 text-left">माइलस्टोन तथा कानुनी आधार</th>
              <th className="border border-gray-400 p-2 text-left">अनिवार्य सरकारी कागजातहरू</th>
              <th className="border border-gray-400 p-2 text-center w-24">स्थिति</th>
            </tr>
          </thead>
          <tbody>
            {activeMilestones.map((m) => {
              const doneTasks = m.tasks.filter(t => completedTaskIds[t.id]).length;
              const isDone = doneTasks === m.tasks.length;
              return (
                <tr key={m.stepNo}>
                  <td className="border border-gray-400 p-2 font-bold text-center">{m.stepNo}</td>
                  <td className="border border-gray-400 p-2">
                    <p className="font-bold text-black">{m.titleNepali}</p>
                    <p className="text-[10px] text-gray-600">{m.legalBasis}</p>
                    <p className="text-[10px] text-gray-500 italic mt-0.5">{m.targetTimeline}</p>
                  </td>
                  <td className="border border-gray-400 p-2">
                    <ul className="list-disc pl-3">
                      {m.requiredDocs.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-400 p-2 text-center font-bold">
                    {isDone ? '✓ सम्पन्न' : `${doneTasks}/${m.tasks.length} सम्पन्न`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Official Signatures Section for Print */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs text-black">
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold">पेस गर्ने (योजना/खरिद अधिकृत)</p>
              <p>मिति: ........................</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold">जाँच गर्ने (लेखा अधिकृत)</p>
              <p>मिति: ........................</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-1">
              <p className="font-bold">स्वीकृत गर्ने (कार्यालय प्रमुख)</p>
              <p>मिति: ........................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
