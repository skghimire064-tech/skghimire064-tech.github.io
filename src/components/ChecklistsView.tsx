import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Filter, 
  Search, 
  RotateCcw, 
  Printer, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Check
} from 'lucide-react';
import { COMPLIANCE_CHECKLIST_MASTER, PROCUREMENT_STAGES } from '../data/procurementData';
import { ProcurementType } from '../types/procurement';

interface ChecklistsViewProps {
  onNavigateToMethodChecklists?: () => void;
}

export const ChecklistsView: React.FC<ChecklistsViewProps> = ({
  onNavigateToMethodChecklists,
}) => {
  const [selectedType, setSelectedType] = useState<ProcurementType | 'all'>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mandatoryOnly, setMandatoryOnly] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('master_compliance_checklist');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleItem = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    try {
      localStorage.setItem('master_compliance_checklist', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    if (window.confirm('के तपाईं सबै चेकलिस्ट बुँदाहरू रिसेट गर्न चाहनुहुन्छ?')) {
      setCheckedItems({});
      localStorage.removeItem('master_compliance_checklist');
    }
  };

  // Filter checklist items
  const filteredItems = COMPLIANCE_CHECKLIST_MASTER.filter((item) => {
    if (selectedType !== 'all' && !item.procurementTypes.includes(selectedType)) return false;
    if (selectedStage !== 'all' && item.stageId !== selectedStage) return false;
    if (mandatoryOnly && !item.isMandatory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.text.toLowerCase().includes(q) ||
        item.legalRef.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalFiltered = filteredItems.length;
  const completedFiltered = filteredItems.filter((i) => checkedItems[i.id]).length;
  const progressPercent = totalFiltered > 0 ? Math.round((completedFiltered / totalFiltered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
            <FileCheck2 className="w-4 h-4" />
            <span>कानुनी अनुपालन प्रमाणीकरण</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            सार्वजनिक खरिद एकीकृत अनुपालन चेकलिस्ट (Master Compliance Checklist)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            ऐन र नियमावलीका सातै चरणमा पूरा गर्नुपर्ने वैधानिक कार्य तथा कागजातहरूको आधिकारिक चेकसूची। अडिट र अनुगमनमा बेरुजुबाट बच्न प्रत्येक बुँदा रुजु गर्नुहोस्।
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 no-print">
          {onNavigateToMethodChecklists && (
            <button
              onClick={onNavigateToMethodChecklists}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>विधि अनुसारको चेकलिस्ट</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="चेकलिस्ट प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
            title="रिसेट गर्नुहोस्"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-lg border border-red-100">
            {progressPercent}%
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              कुल रुजु स्थिति: {completedFiltered} / {totalFiltered} सम्पन्न
            </div>
            <p className="text-xs text-slate-500">
              {totalFiltered - completedFiltered} वटा अनुपालन बुँदाहरू बाँकी छन्
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Procurement Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-red-600"
          >
            <option value="all">सबै खरिद प्रकार (Works, Goods, Cons.)</option>
            <option value="works">निर्माण कार्य (Works)</option>
            <option value="goods">मालसामान (Goods)</option>
            <option value="consulting">परामर्श सेवा (Consulting)</option>
            <option value="services">गैर-परामर्श सेवा (Services)</option>
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-red-600"
          >
            <option value="all">सबै ७ चरणहरू</option>
            {PROCUREMENT_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titleNepali}
              </option>
            ))}
          </select>

          {/* Mandatory Checkbox */}
          <label className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={mandatoryOnly}
              onChange={(e) => setMandatoryOnly(e.target.checked)}
              className="text-red-600 rounded-sm focus:ring-red-500"
            />
            <span>अनिवार्य मात्र (Mandatory)</span>
          </label>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="चेकलिस्टमा खोज्नुहोस्..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Grouped Checklist by Stages */}
      <div className="space-y-4">
        {PROCUREMENT_STAGES.map((stg) => {
          const itemsInThisStage = filteredItems.filter((i) => i.stageId === stg.id);
          if (itemsInThisStage.length === 0) return null;

          const stageCompleted = itemsInThisStage.filter((i) => checkedItems[i.id]).length;

          return (
            <div key={stg.id} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 sm:px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center">
                    {stg.stageNo}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {stg.titleNepali}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-600 tabular-nums">
                  {stageCompleted} / {itemsInThisStage.length} सम्पन्न
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {itemsInThisStage.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:px-5 flex items-start gap-3 transition-colors ${
                        isChecked ? 'bg-emerald-50/20' : 'hover:bg-slate-50'
                      }`}
                    >
                      <label className="flex items-start gap-3 w-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {item.text}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                            <span className="font-mono text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-sm">
                              {item.legalRef}
                            </span>
                            {item.notes && <span className="text-slate-600">· {item.notes}</span>}
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
