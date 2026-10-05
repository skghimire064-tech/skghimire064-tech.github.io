import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Scale, 
  X,
  ExternalLink,
  ChevronDown,
  Building,
  HelpCircle
} from 'lucide-react';
import { PROCUREMENT_METHODS } from '../data/procurementData';
import { ProcurementMethod, ProcurementType } from '../types/procurement';

interface ProcurementMethodsViewProps {
  initialSelectedMethodId?: string | null;
  onClearInitialMethod?: () => void;
}

export const ProcurementMethodsView: React.FC<ProcurementMethodsViewProps> = ({
  initialSelectedMethodId,
  onClearInitialMethod,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProcurementType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMethodModal, setActiveMethodModal] = useState<ProcurementMethod | null>(() => {
    if (initialSelectedMethodId) {
      return PROCUREMENT_METHODS.find(m => m.id === initialSelectedMethodId) || null;
    }
    return null;
  });

  // If initial prop changes
  React.useEffect(() => {
    if (initialSelectedMethodId) {
      const found = PROCUREMENT_METHODS.find(m => m.id === initialSelectedMethodId);
      if (found) setActiveMethodModal(found);
    }
  }, [initialSelectedMethodId]);

  const filteredMethods = PROCUREMENT_METHODS.filter((m) => {
    if (selectedCategory !== 'all' && !m.category.includes(selectedCategory)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.nameNepali.toLowerCase().includes(q) ||
        m.nameEnglish.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.legalActSection.toLowerCase().includes(q) ||
        m.legalRuleSection.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const closeModal = () => {
    setActiveMethodModal(null);
    if (onClearInitialMethod) onClearInitialMethod();
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
            <Layers className="w-4 h-4" />
            <span>सार्वजनिक खरिद ऐन दफा ८ र नियमावली</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            खरिदका सम्पूर्ण कानुनी विधिहरू तथा प्रक्रियागत विवरण
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            सार्वजनिक निकायले निर्माण, मालसामान वा सेवा खरिद गर्दा मूल्य, जटिलता र आवश्यकताका आधारमा अवलम्बन गर्नुपर्ने आधिकारिक खरिद विधिहरूको विस्तृत विवरण, सीमा, चरणहरू र कागजातहरू।
          </p>
        </div>

        {/* Search inside methods */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="विधि वा दफा खोज्नुहोस्..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          सबै खरिद विधिहरू ({PROCUREMENT_METHODS.length})
        </button>
        <button
          onClick={() => setSelectedCategory('works')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'works'
              ? 'bg-red-700 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          निर्माण कार्य (Works)
        </button>
        <button
          onClick={() => setSelectedCategory('goods')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'goods'
              ? 'bg-red-700 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          मालसामान आपूर्ति (Goods)
        </button>
        <button
          onClick={() => setSelectedCategory('consulting')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'consulting'
              ? 'bg-red-700 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          परामर्श सेवा (Consulting)
        </button>
        <button
          onClick={() => setSelectedCategory('services')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'services'
              ? 'bg-red-700 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          गैर-परामर्श सेवाहरू (Services)
        </button>
      </div>

      {/* Grid of Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => setActiveMethodModal(method)}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-red-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-sm">
                  {method.badgeTag}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {method.legalActSection}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                {method.nameNepali}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-3">
                {method.nameEnglish}
              </p>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {method.summary}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 shrink-0">आर्थिक सीमा:</span>
                  <span className="font-semibold text-right text-slate-800 line-clamp-1">
                    {method.thresholdText}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">सूचना म्याद:</span>
                  <span className="font-medium text-slate-800">{method.noticePeriodDays}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">कार्यसम्पादन जमानत:</span>
                  <span className="font-medium text-slate-800">{method.performanceSecurityRate}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-red-700 group-hover:translate-x-0.5 transition-transform">
              <span>पूर्ण प्रक्रिया र कागजातहरू</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal for Selected Method */}
      {activeMethodModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-sm">
                    {activeMethodModal.badgeTag}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    ऐन: {activeMethodModal.legalActSection}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-700">
                    नियमावली: {activeMethodModal.legalRuleSection}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {activeMethodModal.nameNepali}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeMethodModal.nameEnglish}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
              {/* Summary & Threshold Metrics */}
              <div className="bg-red-50/40 p-4 rounded-xl border border-red-100">
                <p className="text-slate-800 leading-relaxed font-medium">
                  {activeMethodModal.summary}
                </p>

                <div className="mt-3 pt-3 border-t border-red-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">लागू हुने आर्थिक सीमा</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{activeMethodModal.thresholdText}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">सूचना प्रकाशन म्याद</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{activeMethodModal.noticePeriodDays}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">स्वीकृत गर्ने अख्तियारी</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{activeMethodModal.approvalAuthority}</span>
                  </div>
                </div>
              </div>

              {/* Key Conditions (मुख्य कानुनी सर्तहरू) */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span>मुख्य कानुनी सर्त तथा व्यवस्थाहरू:</span>
                </h4>
                <div className="space-y-2">
                  {activeMethodModal.keyConditions.map((cond, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-slate-700">
                      <span className="text-red-600 font-bold shrink-0">✓</span>
                      <span>{cond}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Procedure (पूर्ण प्रक्रियागत चरणहरू) */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <span>अपनाउनुपर्ने पूर्ण प्रक्रियागत चरणहरू (Procedural Steps):</span>
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {activeMethodModal.steps.map((st) => (
                    <div key={st.stepNo} className="flex items-start gap-3 relative">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 z-10">
                        {st.stepNo}
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {st.title}
                          </h5>
                          <span className="text-[11px] font-mono text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded-sm">
                            {st.legalRef}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>आवश्यक कागजातहरूको चेकलिस्ट (Required Documents):</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeMethodModal.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 text-slate-800 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cautions / What to avoid */}
              {activeMethodModal.cautions.length > 0 && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>विशेष ध्यान दिनुपर्ने कानुनी बन्देजहरू (Cautions):</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    {activeMethodModal.cautions.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>सार्वजनिक खरिद ऐन, २०६३ र नियमावली, २०६४</span>
              <button
                onClick={closeModal}
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
