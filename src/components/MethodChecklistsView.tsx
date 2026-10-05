import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  Printer, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  FileText, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { PROCUREMENT_METHODS } from '../data/procurementData';
import { ProcurementMethod } from '../types/procurement';

interface MethodChecklistsViewProps {
  onNavigateToTemplate?: (templateId: string) => void;
  initialMethodId?: string;
}

export const MethodChecklistsView: React.FC<MethodChecklistsViewProps> = ({
  onNavigateToTemplate,
  initialMethodId,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    initialMethodId || PROCUREMENT_METHODS[0].id
  );
  
  // Persistent check state in localStorage: key = `method_chk_${methodId}`
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const selectedMethod = PROCUREMENT_METHODS.find((m) => m.id === selectedMethodId) || PROCUREMENT_METHODS[0];

  // Load state from localStorage on method change
  useEffect(() => {
    try {
      const savedSteps = localStorage.getItem(`procure_method_steps_${selectedMethodId}`);
      const savedDocs = localStorage.getItem(`procure_method_docs_${selectedMethodId}`);
      setCheckedSteps(savedSteps ? JSON.parse(savedSteps) : {});
      setCheckedDocs(savedDocs ? JSON.parse(savedDocs) : {});
    } catch (e) {
      console.error(e);
    }
  }, [selectedMethodId]);

  const toggleStep = (stepNo: number) => {
    const key = `step_${stepNo}`;
    const updated = { ...checkedSteps, [key]: !checkedSteps[key] };
    setCheckedSteps(updated);
    try {
      localStorage.setItem(`procure_method_steps_${selectedMethodId}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDoc = (docIndex: number) => {
    const key = `doc_${docIndex}`;
    const updated = { ...checkedDocs, [key]: !checkedDocs[key] };
    setCheckedDocs(updated);
    try {
      localStorage.setItem(`procure_method_docs_${selectedMethodId}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const resetMethodChecklist = () => {
    if (window.confirm('के तपाईं यस विधिको सबै चेकलिस्ट रिसेट गर्न चाहनुहुन्छ?')) {
      setCheckedSteps({});
      setCheckedDocs({});
      localStorage.removeItem(`procure_method_steps_${selectedMethodId}`);
      localStorage.removeItem(`procure_method_docs_${selectedMethodId}`);
    }
  };

  // Calculate progress
  const totalItems = selectedMethod.steps.length + selectedMethod.requiredDocuments.length;
  const completedSteps = selectedMethod.steps.filter((s) => checkedSteps[`step_${s.stepNo}`]).length;
  const completedDocs = selectedMethod.requiredDocuments.filter((_, idx) => checkedDocs[`doc_${idx}`]).length;
  const totalCompleted = completedSteps + completedDocs;
  const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            <FileCheck2 className="w-4 h-4" />
            <span>विधिगत अनुपालन तथा कागजात प्रमाणीकरण</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            विधि अनुसारको अन्तरक्रियात्मक चेकलिस्ट (Method-Wise Compliance Checklists)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            सार्वजनिक खरिद ऐन र नियमावलीका प्रत्येक खरिद विधि अनुसार अपनाउनुपर्ने पूर्ण प्रक्रियागत चरणहरू र आवश्यक कागजातहरूको व्याख्यासहितको चेकलिस्ट। काम सम्पन्न भएपछि टिक लगाउनुहोस्।
          </p>
        </div>

        {/* Global Progress & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors no-print"
            title="चेकलिस्ट प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={resetMethodChecklist}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors no-print"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रिसेट</span>
          </button>
        </div>
      </div>

      {/* Method Selector Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 px-1">
          खरिद विधि छनोट गर्नुहोस्:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PROCUREMENT_METHODS.map((m) => {
            const isSelected = m.id === selectedMethodId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMethodId(m.id)}
                className={`p-2.5 rounded-lg text-left transition-all text-xs font-medium flex items-center justify-between gap-2 border ${
                  isSelected
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="truncate">{m.nameNepali}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-sm shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  {m.badgeTag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Method Details Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-400 font-semibold mb-1">
            <span>{selectedMethod.nameEnglish}</span>
            <span>·</span>
            <span className="font-mono text-slate-300">ऐन: {selectedMethod.legalActSection}</span>
            <span>·</span>
            <span className="font-mono text-slate-300">नियमावली: {selectedMethod.legalRuleSection}</span>
          </div>
          <h3 className="text-xl font-bold">{selectedMethod.nameNepali}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">{selectedMethod.summary}</p>
        </div>

        {/* Progress Display */}
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs shrink-0 min-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">अनुपालन सम्पन्न:</span>
            <span className="font-bold text-white tabular-nums">{totalCompleted} / {totalItems}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="mt-1 text-right text-xs font-bold text-emerald-400 tabular-nums">
            {progressPercent}% सम्पन्न
          </div>
        </div>
      </div>

      {/* Two Column Section: 1) Procedural Steps Checklist, 2) Required Documents Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Procedural Steps Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-bold text-slate-900">
                १. प्रक्रियागत चरणहरूको चेकलिस्ट ({completedSteps}/{selectedMethod.steps.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">क्रमबद्ध रूपमा पूरा गर्नुहोस्</span>
          </div>

          <div className="p-4 space-y-3">
            {selectedMethod.steps.map((st) => {
              const isChecked = !!checkedSteps[`step_${st.stepNo}`];
              return (
                <div
                  key={st.stepNo}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300/80'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStep(st.stepNo)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          चरण {st.stepNo}: {st.title}
                        </span>
                        <span className="text-[10px] font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded-sm shrink-0">
                          {st.legalRef}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${isChecked ? 'text-slate-400' : 'text-slate-600'}`}>
                        {st.description}
                      </p>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Required Documents Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                २. आवश्यक कागजातहरूको चेकलिस्ट ({completedDocs}/{selectedMethod.requiredDocuments.length})
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">फाइलमा सुरक्षित राख्नुहोस्</span>
          </div>

          <div className="p-4 space-y-3">
            {selectedMethod.requiredDocuments.map((doc, idx) => {
              const isChecked = !!checkedDocs[`doc_${idx}`];
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300/80'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDoc(idx)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {doc}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        खरिद कानुन अनुसार यो कागजात खरिद सम्झौता फाइलमा सुरक्षित हुनुपर्नेछ (नियम १४९)।
                      </p>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Quick link to template repository */}
          {onNavigateToTemplate && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">यस विधिका कागजात ढाँचा आवश्यक छ?</span>
              <button
                onClick={() => onNavigateToTemplate('tmpl-ifb-ncb')}
                className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 transition-colors"
              >
                <span>कागजात ढाँचा भण्डार हेर्नुहोस्</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
