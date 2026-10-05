import React, { useState, useMemo } from 'react';
import { X, PlusCircle, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { TrackedProject, ProcurementType } from '../types/procurement';
import { PROCUREMENT_METHODS } from '../data/procurementData';
import { analyzeProcurementThreshold, formatNepaliCurrency } from '../utils/procurementUtils';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: TrackedProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
}) => {
  const [title, setTitle] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [procurementType, setProcurementType] = useState<ProcurementType>('works');
  const [estimatedAmount, setEstimatedAmount] = useState<number>(5000000);
  const [budgetSource, setBudgetSource] = useState('नेपाल सरकार (सङ्घीय बजेट)');
  const [methodId, setMethodId] = useState('');
  const [notes, setNotes] = useState('');

  // Analyze threshold dynamically
  const analysis = useMemo(() => {
    return analyzeProcurementThreshold(procurementType, Number(estimatedAmount) || 0);
  }, [procurementType, estimatedAmount]);

  // Set default method when analysis changes if not manually set
  React.useEffect(() => {
    if (analysis.recommendedMethods.length > 0) {
      const primary = analysis.recommendedMethods.find(m => m.isPrimary);
      setMethodId(primary ? primary.id : analysis.recommendedMethods[0].id);
    }
  }, [analysis]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !officeName.trim() || !estimatedAmount) return;

    const newProject: TrackedProject = {
      id: `proj-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      officeName: officeName.trim(),
      procurementType,
      methodId: methodId || (analysis.recommendedMethods[0]?.id || 'ncb-works'),
      estimatedAmount: Number(estimatedAmount),
      currentStageId: 'stage-1',
      progressPercent: 5,
      budgetSource: budgetSource.trim(),
      startDate: new Date().toLocaleDateString('ne-NP'),
      targetCompletionDate: 'आगामी वर्षको अन्त्य',
      checklistStatus: {
        'chk-1-1': true,
      },
      notes: notes.trim(),
    };

    onAddProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-sm">
              +
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                नयाँ खरिद प्रक्रिया / आयोजना थप्नुहोस्
              </h3>
              <p className="text-xs text-slate-500">
                ऐन तथा नियमावली अनुसार उपयुक्त विधि र अनुपालन चेकलिस्ट स्वतः तय हुनेछ।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              आयोजना वा खरिद कार्यको नाम <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा: वडा नं २ कालोपत्रे सडक निर्माण वा कम्प्युटर आपूर्ति..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                सार्वजनिक निकाय / कार्यालयको नाम <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="उदा: काठमाडौं महानगरपालिका, सडक डिभिजन..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                खरिदको प्रकार <span className="text-red-500">*</span>
              </label>
              <select
                value={procurementType}
                onChange={(e) => setProcurementType(e.target.value as ProcurementType)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-900 font-medium"
              >
                <option value="works">निर्माण कार्य (Works)</option>
                <option value="goods">मालसामान आपूर्ति (Goods)</option>
                <option value="consulting">परामर्श सेवा (Consulting Services)</option>
                <option value="services">गैर-परामर्श सेवा (Other Services)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                अनुमानित लागत रकम (रु. भ्याट बाहेक/सहित) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1000}
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-900 font-mono"
              />
              <span className="text-[11px] text-slate-600 mt-1 block">
                {formatNepaliCurrency(Number(estimatedAmount) || 0)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                बजेटको स्रोत
              </label>
              <input
                type="text"
                value={budgetSource}
                onChange={(e) => setBudgetSource(e.target.value)}
                placeholder="उदा: सङ्घीय सशर्त, आन्तरिक कोष, दातृ निकाय..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-900"
              />
            </div>
          </div>

          {/* Auto Recommendation Box */}
          <div className="p-3.5 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>सिफारिस गरिएको खरिद विधि र कानुनी सर्तहरू:</span>
            </div>
            
            <div className="space-y-1.5">
              {analysis.recommendedMethods.map((rec) => (
                <label
                  key={rec.id}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    methodId === rec.id
                      ? 'bg-white border-red-500 shadow-xs ring-1 ring-red-500/20'
                      : 'bg-white/60 border-slate-200 hover:border-red-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="recommendedMethod"
                    value={rec.id}
                    checked={methodId === rec.id}
                    onChange={() => setMethodId(rec.id)}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {rec.name}
                      </span>
                      <span className="font-mono text-[10px] text-red-800 bg-red-50 px-1.5 py-0.5 rounded-sm">
                        {rec.legalClause}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{rec.reason}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-600 grid grid-cols-2 gap-2 border-t border-red-100">
              <div>
                लागत अनुमान स्वीकृतिकर्ता: <span className="font-medium text-slate-800">{analysis.approvingAuthorityCostEstimate.split('(')[0]}</span>
              </div>
              <div>
                बोलपत्र जमानत (२-३%): <span className="font-mono font-medium text-slate-800">{formatNepaliCurrency(analysis.requiredBidSecurityRange.minAmount)} देखि {formatNepaliCurrency(analysis.requiredBidSecurityRange.maxAmount)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              थप टिप्पणी वा कैफियत
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा: वातावरणीय अध्ययन स्वीकृत भइसकेको, टेन्डर डकुमेन्ट तयारीमा..."
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-hidden text-slate-900 text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-xs sm:text-sm transition-colors"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg text-xs sm:text-sm shadow-xs transition-colors"
            >
              खरिद योजना सुरक्षित गर्नुहोस्
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
