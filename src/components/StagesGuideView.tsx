import React, { useState } from 'react';
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
  Scale
} from 'lucide-react';
import { PROCUREMENT_STAGES } from '../data/procurementData';
import { ProcurementStage } from '../types/procurement';

interface StagesGuideViewProps {
  onSelectMethod?: (methodId: string) => void;
}

export const StagesGuideView: React.FC<StagesGuideViewProps> = ({ onSelectMethod }) => {
  const [activeStage, setActiveStage] = useState<ProcurementStage>(PROCUREMENT_STAGES[0]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
          <ClipboardList className="w-4 h-4" />
          <span>सार्वजनिक खरिद चक्र (Procurement Lifecycle)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          सार्वजनिक खरिदका ७ मुख्य प्रक्रियागत चरणहरू
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          सार्वजनिक निकायले कुनै पनि खरिद कार्य सम्पन्न गर्दा अपनाउनुपर्ने पूर्वतयारीदेखि सम्झौता कार्यान्वयन, म्याद थप र अन्तिम फरफारकसम्मको विस्तृत कानुनी प्रक्रिया।
        </p>
      </div>

      {/* Horizontal Stepper Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PROCUREMENT_STAGES.map((stg) => {
          const isActive = activeStage.id === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => setActiveStage(stg)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isActive
                  ? 'bg-red-700 text-white border-red-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-mono font-bold ${isActive ? 'text-red-200' : 'text-red-700'}`}>
                  चरण {stg.stageNo}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
              </div>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">
                {stg.titleNepali.split('.')[1]?.trim()}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Stage Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
              <span>चरण {activeStage.stageNo} को विस्तृत विवरण</span>
              <span>·</span>
              <span className="font-mono text-slate-600">{activeStage.titleEnglish}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {activeStage.titleNepali}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
              {activeStage.description}
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shrink-0 text-xs space-y-1">
            <div>
              <span className="text-slate-500">जिम्मेवार अधिकारी:</span>
              <span className="font-bold text-slate-900 block">{activeStage.responsibleOfficial}</span>
            </div>
            <div>
              <span className="text-slate-500">समयावधि:</span>
              <span className="font-medium text-slate-800 block">{activeStage.timeframeNotes}</span>
            </div>
          </div>
        </div>

        {/* Stage Content */}
        <div className="p-6 space-y-6">
          {/* Legal Basis Banner */}
          <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200/80 flex items-start gap-3">
            <Scale className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-red-900 uppercase">कानुनी आधार (Legal Basis):</span>
              <p className="text-xs sm:text-sm font-semibold text-red-800 mt-0.5">
                {activeStage.legalBasis}
              </p>
            </div>
          </div>

          {/* Key Activities */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span>यस चरणमा सम्पादन गर्नुपर्ने मुख्य कार्यहरू:</span>
            </h4>
            <div className="space-y-2.5">
              {activeStage.keyActivities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs sm:text-sm text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents in this stage */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>यस चरणमा अनिवार्य रहने कागजात तथा प्रमाणहरू:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeStage.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs text-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Compliance Cautions */}
          <div>
            <h4 className="text-sm font-bold text-amber-900 mb-2.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>कानुनी जोखिम तथा कडाइका साथ पालना गर्नुपर्ने विषयहरू:</span>
            </h4>
            <div className="space-y-2">
              {activeStage.criticalComplianceNotes.map((note, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
                  <span className="text-amber-700 font-bold">!</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            disabled={activeStage.stageNo <= 1}
            onClick={() => setActiveStage(PROCUREMENT_STAGES[activeStage.stageNo - 2])}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-medium rounded-lg transition-colors"
          >
            ← अघिल्लो चरण
          </button>
          <span className="font-mono text-slate-500 font-medium">
            चरण {activeStage.stageNo} / {PROCUREMENT_STAGES.length}
          </span>
          <button
            disabled={activeStage.stageNo >= PROCUREMENT_STAGES.length}
            onClick={() => setActiveStage(PROCUREMENT_STAGES[activeStage.stageNo])}
            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-medium rounded-lg transition-colors"
          >
            अर्को चरण →
          </button>
        </div>
      </div>
    </div>
  );
};
