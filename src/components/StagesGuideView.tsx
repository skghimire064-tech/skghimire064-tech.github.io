import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Scale,
  ExternalLink,
  Building2,
  Gavel,
  FileCheck,
  Search,
  Filter,
  BookOpen,
  AlertOctagon,
  ThumbsUp,
  ThumbsDown,
  Check,
  Printer,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { PROCUREMENT_STAGES } from '../data/procurementData';
import { EGP_GUIDELINE_SECTIONS } from '../data/egpGuidelines';
import { GuideSourceNotice } from './GuideSourceNotice';
import {
  ProcurementStage,
  StatutoryRule,
  PpmoOpinionItem,
  PprcPrecedentItem,
  AuditRiskItem,
  StageChecklistItem
} from '../types/procurement';

type StageSubTab = 'overview' | 'statutory' | 'ppmo' | 'pprc' | 'audit' | 'checklist' | 'dos-donts';

interface StagesGuideViewProps {
  onSelectMethod?: (methodId: string) => void;
  onNavigateToEgpGuide?: () => void;
}

export const StagesGuideView: React.FC<StagesGuideViewProps> = ({
  onSelectMethod,
  onNavigateToEgpGuide,
}) => {
  const [activeStage, setActiveStage] = useState<ProcurementStage>(() => PROCUREMENT_STAGES[0]);
  const [activeSubTab, setActiveSubTab] = useState<StageSubTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pe_stage_checklist_states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save checked items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pe_stage_checklist_states', JSON.stringify(checkedItems));
    } catch { }
  }, [checkedItems]);

  const egpSections = useMemo(() => {
    return EGP_GUIDELINE_SECTIONS.filter((section) => section.stageId === activeStage.id);
  }, [activeStage.id]);

  // Handle stage checklist toggling
  const handleToggleChecklist = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleResetStageChecklist = () => {
    if (!activeStage.entityChecklist) return;
    setCheckedItems((prev) => {
      const next = { ...prev };
      activeStage.entityChecklist?.forEach((item) => {
        delete next[item.id];
      });
      return next;
    });
  };

  const handleCheckAllStageChecklist = () => {
    if (!activeStage.entityChecklist) return;
    setCheckedItems((prev) => {
      const next = { ...prev };
      activeStage.entityChecklist?.forEach((item) => {
        next[item.id] = true;
      });
      return next;
    });
  };

  // Checklist completion count for active stage
  const checklistProgress = useMemo(() => {
    const list = activeStage.entityChecklist || [];
    if (list.length === 0) return { total: 0, checked: 0, percent: 0 };
    const checked = list.filter((i) => checkedItems[i.id]).length;
    return {
      total: list.length,
      checked,
      percent: Math.round((checked / list.length) * 100),
    };
  }, [activeStage, checkedItems]);

  // Filtered Items based on search query
  const filteredStatutoryRules = useMemo(() => {
    const list = activeStage.statutoryRules || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.clauseOrRule.toLowerCase().includes(q) ||
        r.provision.toLowerCase().includes(q) ||
        r.mandatoryAction.toLowerCase().includes(q)
    );
  }, [activeStage.statutoryRules, searchQuery]);

  const filteredPpmoOpinions = useMemo(() => {
    const list = activeStage.ppmoOpinions || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (op) =>
        op.topic.toLowerCase().includes(q) ||
        op.directive.toLowerCase().includes(q) ||
        op.questionOrContext.toLowerCase().includes(q) ||
        (op.dateOrRef && op.dateOrRef.toLowerCase().includes(q))
    );
  }, [activeStage.ppmoOpinions, searchQuery]);

  const filteredPprcDecisions = useMemo(() => {
    const list = activeStage.pprcDecisions || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.disputedIssue.toLowerCase().includes(q) ||
        p.rulingOrPrecedent.toLowerCase().includes(q) ||
        p.entityLesson.toLowerCase().includes(q) ||
        p.caseNoOrRef.toLowerCase().includes(q)
    );
  }, [activeStage.pprcDecisions, searchQuery]);

  const filteredAuditRisks = useMemo(() => {
    const list = activeStage.auditRisks || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.riskTitle.toLowerCase().includes(q) ||
        a.commonIrregularity.toLowerCase().includes(q) ||
        a.preventiveMeasure.toLowerCase().includes(q)
    );
  }, [activeStage.auditRisks, searchQuery]);

  return (
    <div className="space-y-6">
      <GuideSourceNotice />
      {/* View Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-semibold rounded-full backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                सार्वजनिक निकाय विशेष मार्गदर्शन (Procuring Entity Guide)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[11px] rounded-md font-mono border border-blue-400/30">
                PPA २०६३ + १६औँ नियमावली + PPMO राय + PPRC नजिर
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              सार्वजनिक खरिदका ७ प्रक्रियागत चरण र सार्वजनिक निकायले पुर्‍याउनुपर्ने सजगता
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              सार्वजनिक निकायले खरिद प्रक्रिया सुरु गर्नु पूर्वतयारीदेखि बोलपत्र आह्वान, मूल्यांकन, आशयको सूचना, पुनरावलोकन, रनिङ बिल भुक्तानी, म्याद थप र अन्तिम फरफारकसम्म कानूनी जोखिम, PPMO राय तथा PPRC का स्थापित नजिरहरूको विस्तृत मार्गचित्र।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 no-print">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-all backdrop-blur-xs"
              title="यो मार्गदर्शन प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिन्ट / PDF</span>
            </button>
          </div>
        </div>

        {/* Global Key Highlights Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">ऐन तथा नियमावली:</span>
            <span className="text-white font-bold">PPA २०६३ & PPR २०६४</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">नवीनतम संशोधन:</span>
            <span className="text-amber-300 font-bold">१६औँ संशोधन (२०८१)</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">अख्तियार र महालेखा:</span>
            <span className="text-emerald-300 font-bold">बेरुजु र जोखिम रोकथाम</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[10px]">डिजिटल चेकलिस्ट:</span>
            <span className="text-blue-300 font-bold">हरेक चरणको अनिवार्य रुजु</span>
          </div>
        </div>
      </div>

      {/* Horizontal Stepper Nav (7 Stages) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PROCUREMENT_STAGES.map((stg) => {
          const isActive = activeStage.id === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => {
                setActiveStage(stg);
                setSearchQuery('');
              }}
              className={`p-3 rounded-xl border text-left transition-all relative ${isActive
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm ring-2 ring-red-400/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-mono font-bold ${isActive ? 'text-red-200' : 'text-red-700'}`}>
                  चरण {stg.stageNo}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </div>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">
                {stg.titleNepali.split('.')[1]?.trim() || stg.titleNepali}
              </h4>
              <span className={`text-[10px] block mt-1 line-clamp-1 ${isActive ? 'text-red-100' : 'text-slate-500'}`}>
                {stg.titleEnglish}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Stage Title Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
              <span>चरण {activeStage.stageNo} को विस्तृत विवरण</span>
              <span>·</span>
              <span className="font-mono text-slate-600">{activeStage.titleEnglish}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {activeStage.titleNepali}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {activeStage.description}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 p-3 bg-white rounded-xl border border-slate-200 shrink-0 text-xs shadow-2xs">
            <div>
              <span className="text-slate-500 text-[11px] block">जिम्मेवार अधिकारी:</span>
              <span className="font-bold text-slate-900">{activeStage.responsibleOfficial}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">कानूनी समयावधि:</span>
              <span className="font-medium text-slate-800">{activeStage.timeframeNotes}</span>
            </div>
            {checklistProgress.total > 0 && (
              <div className="pt-1 border-t border-slate-100">
                <span className="text-slate-500 text-[10px] block">चेकलिस्ट प्रगति:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${checklistProgress.percent === 100 ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      style={{ width: `${checklistProgress.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {checklistProgress.checked}/{checklistProgress.total}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legal Basis Banner */}
        <div className="px-6 py-3 bg-red-50/80 border-b border-red-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-red-700 shrink-0" />
            <span className="font-bold text-red-950 uppercase tracking-wide">कानूनी आधार (Legal Basis):</span>
            <span className="font-semibold text-red-800">{activeStage.legalBasis}</span>
          </div>
          {egpSections.length > 0 && onNavigateToEgpGuide && (
            <button
              onClick={onNavigateToEgpGuide}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs shrink-0"
            >
              <span>e-GP निर्देशिका हेर्नुहोस्</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'overview'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>१. प्रक्रिया तथा कार्यहरू</span>
            </button>

            <button
              onClick={() => setActiveSubTab('statutory')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'statutory'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>२. ऐन/नियमका प्रावधानहरू</span>
              {activeStage.statutoryRules && (
                <span className="px-1.5 py-0.2 bg-red-100 text-red-800 rounded-full text-[10px] font-bold">
                  {activeStage.statutoryRules.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('ppmo')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'ppmo'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>३. PPMO राय तथा परिपत्र</span>
              {activeStage.ppmoOpinions && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                  {activeStage.ppmoOpinions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('pprc')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'pprc'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>४. PPRC निर्णय र नजिर</span>
              {activeStage.pprcDecisions && (
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
                  {activeStage.pprcDecisions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'audit'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>५. महालेखा/अख्तियार सजगता</span>
              {activeStage.auditRisks && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                  {activeStage.auditRisks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('checklist')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'checklist'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>६. डिजिटल चेकलिस्ट</span>
              {checklistProgress.total > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${checklistProgress.percent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                  {checklistProgress.checked}/{checklistProgress.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('dos-donts')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${activeSubTab === 'dos-donts'
                  ? 'border-blue-700 text-red-700 bg-red-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>७. के गर्ने / के नगर्ने</span>
            </button>
          </div>

          {/* Search Bar in Active Stage */}
          {activeSubTab !== 'overview' && activeSubTab !== 'dos-donts' && (
            <div className="relative mb-2 shrink-0 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="यस चरणमा खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Content Display Area */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW & KEY ACTIVITIES */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Activities */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>यस चरणमा सम्पादन गर्नुपर्ने मुख्य प्रक्रियागत कार्यहरू:</span>
                </h3>
                <div className="space-y-2.5">
                  {activeStage.keyActivities.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed hover:bg-slate-100/70 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>यस चरणमा अनिवार्य रहने कागजात तथा प्रमाणहरू:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeStage.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-800 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Compliance Cautions */}
              <div>
                <h3 className="text-sm font-bold text-amber-900 mb-2.5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>कानूनी जोखिम तथा अनिवार्य पालना गर्नुपर्ने विषयहरू:</span>
                </h3>
                <div className="space-y-2">
                  {activeStage.criticalComplianceNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        !
                      </span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* e-GP Section integration */}
              {egpSections.length > 0 && (
                <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-blue-950">यस चरणका e-GP निर्देशिका बुँदा</h4>
                      <p className="mt-1 text-xs text-blue-900">
                        निर्देशिका, २०८० का सम्बन्धित कार्यप्रवाह र दफा:
                      </p>
                    </div>
                    {onNavigateToEgpGuide && (
                      <button
                        type="button"
                        onClick={onNavigateToEgpGuide}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 shadow-2xs"
                      >
                        विस्तृत निर्देशिका
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    {egpSections.map((section) => (
                      <div key={section.id} className="rounded-lg border border-blue-100 bg-white p-3 shadow-2xs">
                        <h5 className="text-xs font-bold text-slate-900">{section.title}</h5>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">{section.summary}</p>
                        <p className="mt-2 text-[11px] font-semibold text-blue-900">{section.legalReference}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: STATUTORY RULES (ऐन तथा नियमावलीका बाध्यकारी व्यवस्थाहरू) */}
          {activeSubTab === 'statutory' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-xs text-red-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-red-700 shrink-0" />
                <span>
                  सार्वजनिक खरिद ऐन २०६३ र नियमावली २०६४ (१६औँ संशोधन समेत) अनुसार सार्वजनिक निकायले यस चरणमा अक्षरसः पालना गर्नैपर्ने कडा कानूनी व्यवस्थाहरू:
                </span>
              </div>

              {filteredStatutoryRules.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  खोजिएको विषयमा कुनै कानूनी व्यवस्था फेला परेन।
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStatutoryRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[11px] font-bold rounded-md font-mono border border-red-200">
                            {rule.clauseOrRule}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900">{rule.title}</h4>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                          बाध्यकारी व्यवस्था
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong className="text-slate-900 block mb-1">कानूनी प्रावधान:</strong>
                        {rule.provision}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
                          <strong className="text-emerald-900 flex items-center gap-1.5 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            सार्वजनिक निकायले गर्नुपर्ने काम:
                          </strong>
                          <span>{rule.mandatoryAction}</span>
                        </div>

                        {rule.penaltyOrRisk && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950">
                            <strong className="text-amber-900 flex items-center gap-1.5 mb-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                              उल्लङ्घन भएमा हुने कानूनी जोखिम:
                            </strong>
                            <span>{rule.penaltyOrRisk}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PPMO OPINIONS & CIRCULARS (PPMO राय तथा परिपत्रहरू) */}
          {activeSubTab === 'ppmo' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) बाट विभिन्न समयमा जारी भएका आधिकारिक राय, परिपत्र तथा स्पष्टीकरणहरू:
                </span>
              </div>

              {filteredPpmoOpinions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  खोजिएको विषयमा PPMO को कुनै राय फेला परेन।
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPpmoOpinions.map((op) => (
                    <div
                      key={op.id}
                      className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-md font-mono border border-blue-200">
                            {op.dateOrRef || 'PPMO राय'}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900">{op.topic}</h4>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block mb-0.5">राय मागिएको सन्दर्भ / द्विविधा:</strong>
                        {op.questionOrContext}
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs sm:text-sm text-blue-950 leading-relaxed">
                        <strong className="text-blue-900 block mb-1 flex items-center gap-1.5 font-bold">
                          <Building2 className="w-3.5 h-3.5 text-blue-700" />
                          PPMO को स्पष्ट राय / निर्देशन:
                        </strong>
                        {op.directive}
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950">
                        <strong className="text-emerald-900 flex items-center gap-1 mb-1 font-bold">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          सार्वजनिक निकायले लिनुपर्ने सावधानी:
                        </strong>
                        {op.entityAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PPRC PRECEDENTS & RULINGS (PPRC निर्णय तथा स्थापित नजिरहरू) */}
          {activeSubTab === 'pprc' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-purple-700 shrink-0" />
                <span>
                  सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) ले विभिन्न उजुरीहरूमा कायम गरेका स्थापित नजिर, बदर गरेका निर्णयहरू र सार्वजनिक निकायलाई दिएका आदेशहरू:
                </span>
              </div>

              {filteredPprcDecisions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  खोजिएको विषयमा PPRC को कुनै निर्णय फेला परेन।
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPprcDecisions.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs hover:border-purple-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-md font-mono border border-purple-200">
                            {p.caseNoOrRef}
                          </span>
                          {p.appellantVsResp && (
                            <span className="text-xs font-semibold text-slate-700">
                              ({p.appellantVsResp})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block mb-0.5">विवादको मुख्य विषय:</strong>
                        {p.disputedIssue}
                      </div>

                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs sm:text-sm text-purple-950 leading-relaxed">
                        <strong className="text-purple-900 block mb-1 flex items-center gap-1.5 font-bold">
                          <Gavel className="w-3.5 h-3.5 text-purple-700" />
                          PPRC को स्थापित निर्णय तथा कानूनी नजिर:
                        </strong>
                        {p.rulingOrPrecedent}
                      </div>

                      <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-xs text-amber-950">
                        <strong className="text-amber-900 flex items-center gap-1 mb-1 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          सार्वजनिक निकायले सिक्नुपर्ने पाठ (Entity Key Takeaway):
                        </strong>
                        {p.entityLesson}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT & CIAA RED FLAGS (महालेखा र अख्तियारका सजगता) */}
          {activeSubTab === 'audit' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  महालेखा परीक्षक (OAG) बाट औंल्याइने नियमित बेरुजु र अख्तियार दुरुपयोग अनुसन्धान आयोग (CIAA) को छानबिन जोखिमबाट बच्ने उपायहरू:
                </span>
              </div>

              {filteredAuditRisks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  खोजिएको विषयमा कुनै जोखिम विवरण फेला परेन।
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAuditRisks.map((audit, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          {audit.riskTitle}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${audit.authority === 'CIAA'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : audit.authority === 'OAG'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                        >
                          {audit.authority === 'BOTH' ? 'अख्तियार + महालेखा' : audit.authority === 'CIAA' ? 'अख्तियार (CIAA)' : 'महालेखा (OAG)'}
                        </span>
                      </div>

                      <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 text-xs text-red-950">
                        <strong className="text-red-900 block mb-1">बारम्बार देखिने बेरुजु वा कैफियत:</strong>
                        {audit.commonIrregularity}
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950">
                        <strong className="text-emerald-900 flex items-center gap-1.5 mb-1 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          सुरक्षित रहने र कानूनसम्मत कार्य गर्ने उपाय:
                        </strong>
                        {audit.preventiveMeasure}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DIGITAL CHECKLIST FOR PUBLIC OFFICIALS */}
          {activeSubTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    यस चरणको सार्वजनिक निकाय अनिवार्य पूर्व-जाँच सूची (Pre-Checklist)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    कार्यालय प्रमुख, खरिद अधिकृत वा लेखा प्रमुखले निर्णय गर्नुपूर्व कम्प्युटरमै टिक लगाएर रुजु गर्न सक्नुहुन्छ।
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs">
                  <button
                    onClick={handleCheckAllStageChecklist}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-700 shadow-2xs"
                  >
                    सबै छान्नुहोस्
                  </button>
                  <button
                    onClick={handleResetStageChecklist}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-medium text-slate-700 shadow-2xs inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>रिसेट</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar Banner */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">सम्पन्न जाँच:</span>
                    <span className={checklistProgress.percent === 100 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {checklistProgress.checked} / {checklistProgress.total} ({checklistProgress.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${checklistProgress.percent === 100 ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      style={{ width: `${checklistProgress.percent}%` }}
                    />
                  </div>
                </div>

                {checklistProgress.percent === 100 && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1 shrink-0 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    सबै शर्त पूरा!
                  </span>
                )}
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {activeStage.entityChecklist?.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                          }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h5 className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-emerald-950 line-through opacity-85' : 'text-slate-900'
                            }`}>
                            {item.title}
                          </h5>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-mono font-bold">
                            {item.legalBasis}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.tip}
                        </p>
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          <span className="font-semibold text-slate-700">जिम्मेवार पद:</span> {item.responsibleRole}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: DO'S AND DON'TS (के गर्ने र के नगर्ने) */}
          {activeSubTab === 'dos-donts' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  यस चरणमा सार्वजनिक निकायका पदाधिकारीले अनिवार्य गर्नुपर्ने (Do's) र कहिल्यै गर्न नहुने (Don'ts) व्यवहारिक बुँदाहरू:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DO's */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm border-b border-emerald-200 pb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </div>
                    <span>अनिवार्य गर्नुपर्ने कुराहरू (DO's):</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-emerald-950">
                    {activeStage.dosAndDonts?.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DON'Ts */}
                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-red-900 font-extrabold text-sm border-b border-red-200 pb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-2xs">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </div>
                    <span>कहिल्यै गर्न नहुने कुराहरू (DON'Ts):</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-red-950">
                    {activeStage.dosAndDonts?.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation (Prev/Next) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            disabled={activeStage.stageNo <= 1}
            onClick={() => {
              const prev = PROCUREMENT_STAGES[activeStage.stageNo - 2];
              if (prev) {
                setActiveStage(prev);
                setSearchQuery('');
              }
            }}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-medium rounded-lg transition-colors shadow-2xs"
          >
            ← अघिल्लो चरण ({activeStage.stageNo > 1 ? `चरण ${activeStage.stageNo - 1}` : ''})
          </button>

          <span className="font-mono text-slate-500 font-medium">
            चरण {activeStage.stageNo} / {PROCUREMENT_STAGES.length}
          </span>

          <button
            disabled={activeStage.stageNo >= PROCUREMENT_STAGES.length}
            onClick={() => {
              const next = PROCUREMENT_STAGES[activeStage.stageNo];
              if (next) {
                setActiveStage(next);
                setSearchQuery('');
              }
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-medium rounded-lg transition-colors shadow-2xs"
          >
            अर्को चरण ({activeStage.stageNo < PROCUREMENT_STAGES.length ? `चरण ${activeStage.stageNo + 1}` : ''}) →
          </button>
        </div>
      </div>
    </div>
  );
};
