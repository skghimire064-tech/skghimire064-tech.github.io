import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Layers, 
  ShieldCheck, 
  Clock, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { ProcurementType } from '../types/procurement';
import { analyzeProcurementThreshold, formatNepaliCurrency } from '../utils/procurementUtils';

interface CalculatorViewProps {
  onSelectMethod?: (methodId: string) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ onSelectMethod }) => {
  const [procurementType, setProcurementType] = useState<ProcurementType>('works');
  const [amount, setAmount] = useState<number>(45000000); // Default 4.5 crore

  // Additional low bid calculator for Performance Security check
  const [biddedAmount, setBiddedAmount] = useState<number>(36000000); // 3.6 crore (20% below estimate)

  const quickAmounts = [
    { label: 'रु ५ लाख', value: 500000 },
    { label: 'रु १५ लाख', value: 1500000 },
    { label: 'रु २० लाख', value: 2000000 },
    { label: 'रु १ करोड', value: 10000000 },
    { label: 'रु ५ करोड', value: 50000000 },
    { label: 'रु २० करोड', value: 200000000 },
    { label: 'रु १ अर्ब', value: 1000000000 },
    { label: 'रु ५ अर्ब', value: 5000000000 },
  ];

  const analysis = useMemo(() => {
    return analyzeProcurementThreshold(procurementType, Number(amount) || 0);
  }, [procurementType, amount]);

  // Performance Security & Low Bid Analysis
  const lowBidAnalysis = useMemo(() => {
    const est = Number(amount) || 0;
    const bid = Number(biddedAmount) || 0;
    if (est <= 0 || bid <= 0) return null;

    const diffPercent = ((est - bid) / est) * 100;
    const isOver30PercentBelow = diffPercent > 30; // Rule 65cha / Act Sec 25(7kh)
    const isOver15PercentBelow = diffPercent > 15;

    // Standard 5%
    const basePerfSec = bid * 0.05;
    let additionalPerfSec = 0;

    if (isOver15PercentBelow) {
      // 15% threshold amount
      const fifteenPercentVal = est * 0.85;
      const lowerDiff = fifteenPercentVal - bid;
      additionalPerfSec = lowerDiff * 0.50; // 50% of the difference below 15%
    }

    const totalPerfSec = basePerfSec + additionalPerfSec;

    return {
      diffPercent: diffPercent.toFixed(2),
      isBelowEstimate: diffPercent > 0,
      isOver15PercentBelow,
      isOver30PercentBelow,
      basePerfSec,
      additionalPerfSec,
      totalPerfSec,
    };
  }, [amount, biddedAmount]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
          <Calculator className="w-4 h-4" />
          <span>आर्थिक सीमा तथा अख्तियारी क्याल्कुलेटर</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          खरिद विधि, अख्तियारी तथा धरौटी गणना यन्त्र
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          सार्वजनिक खरिद ऐन र नियमावली (१६औँ संशोधनसहित) अनुसार खरिदको प्रकार र रकम प्रविष्ट गरी कुन विधि अपनाउने, कसले लागत अनुमान स्वीकृत गर्ने, कति धरौटी माग्ने र कति दिनको सूचना प्रकाशन गर्ने तुरुन्तै गणना गर्नुहोस्।
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* 1. Procurement Type */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              १. खरिदको प्रकार छनोट गर्नुहोस्:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProcurementType('works')}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left ${
                  procurementType === 'works'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                निर्माण कार्य (Works)
              </button>
              <button
                type="button"
                onClick={() => setProcurementType('goods')}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left ${
                  procurementType === 'goods'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                मालसामान आपूर्ति (Goods)
              </button>
              <button
                type="button"
                onClick={() => setProcurementType('consulting')}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left ${
                  procurementType === 'consulting'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                परामर्श सेवा (Consulting)
              </button>
              <button
                type="button"
                onClick={() => setProcurementType('services')}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left ${
                  procurementType === 'services'
                    ? 'bg-red-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                गैर-परामर्श सेवा (Services)
              </button>
            </div>
          </div>

          {/* 2. Estimated Amount Input */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              २. लागत अनुमान रकम (नेपाली रुपैयाँमा):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                रु.
              </span>
              <input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base sm:text-lg font-bold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-hidden"
              />
            </div>
            <div className="mt-1.5 text-xs text-slate-600 font-semibold">
              शब्दमा: {formatNepaliCurrency(Number(amount) || 0)}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              <span className="text-[11px] text-slate-500 mr-1">द्रुत छनोट:</span>
              {quickAmounts.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setAmount(q.value)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                    amount === q.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Output Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recommended Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" />
              <span>लागू हुने वैधानिक खरिद विधिहरू (Permissible Methods):</span>
            </h3>

            <div className="space-y-3">
              {analysis.recommendedMethods.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    rec.isPrimary
                      ? 'border-red-400 bg-red-50/30 ring-1 ring-red-400/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{rec.name}</span>
                        {rec.isPrimary && (
                          <span className="text-[10px] bg-red-700 text-white font-semibold px-2 py-0.2 rounded-full">
                            प्राथमिक विधि
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-red-800 bg-red-50 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                        {rec.legalClause}
                      </span>
                    </div>

                    {onSelectMethod && (
                      <button
                        onClick={() => onSelectMethod(rec.id)}
                        className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 shrink-0"
                      >
                        <span>विवरण</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Compliance Parameters Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>प्रक्रियागत कानुनी मापदण्डहरू (Mandatory Parameters):</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">सूचना प्रकाशन म्याद</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  कम्तीमा {analysis.minimumNoticeDays} दिन
                </span>
                <span className="text-[11px] text-slate-600">e-GP प्रणाली अनिवार्य</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">बोलपत्र मान्य अवधि</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  {analysis.bidValidityDays} दिन (जमानत {analysis.bidSecurityValidityDays} दिन)
                </span>
                <span className="text-[11px] text-slate-600">बोलपत्र पेश गर्ने दिनदेखि</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">दुई खाम प्रणाली (Two-Envelope)</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {analysis.isTwoEnvelopeRequired ? 'अनिवार्य' : 'लागू नहुने'}
                </span>
                <span className="text-[11px] text-slate-600">२ करोड माथिको निर्माण</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">उपभोक्ता समितिबाट गराउन सकिने?</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {analysis.canUseUserCommittee ? 'सकिन्छ (१ करोड भित्र)' : 'मिल्दैन (१ करोड नाघेको)'}
                </span>
                <span className="text-[11px] text-slate-600">ऐन दफा ४४, नियम ९७</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Authorities & Low Bid Security Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Approval Authorities Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>स्वीकृत गर्ने अख्तियारी (Approval Authority):</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-blue-900 font-semibold block">लागत अनुमान स्वीकृतिकर्ता:</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {analysis.approvingAuthorityCostEstimate}
                </span>
                <span className="text-[11px] text-slate-600 font-mono">सार्वजनिक खरिद नियमावली नियम १४</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-700 font-semibold block">बोलपत्र / दरभाउपत्र स्वीकृतिकर्ता:</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {analysis.approvingAuthorityBidAcceptance}
                </span>
                <span className="text-[11px] text-slate-600 font-mono">नियमावली नियम ६७ (१६औँ संशोधन)</span>
              </div>
            </div>
          </div>

          {/* Bid Security & Performance Security */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              धरौटी तथा जमानत रकम गणना
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">बोलपत्र जमानत (२% देखि ३%)</span>
                  <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
                    {formatNepaliCurrency(analysis.requiredBidSecurityRange.minAmount)} ~ {formatNepaliCurrency(analysis.requiredBidSecurityRange.maxAmount)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">नियम ५३</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">कार्यसम्पादन जमानत (सामान्य ५%)</span>
                  <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
                    {formatNepaliCurrency(analysis.minimumPerformanceSecurity)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">दफा २७(४)</span>
              </div>
            </div>
          </div>

          {/* Interactive Low Bid Calculator (१५% भन्दा बढी घटेको थप जमानत र ३०% घटेको खारेजी परीक्षण) */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span>घटी कबोल तथा थप जमानत परीक्षण</span>
              </h3>
              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-sm font-semibold">
                १६औँ संशोधन
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  बोलपत्रदाताले कबोल गरेको रकम (रु.):
                </label>
                <input
                  type="number"
                  value={biddedAmount}
                  onChange={(e) => setBiddedAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                />
              </div>

              {lowBidAnalysis && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>लागत अनुमान भन्दा घटी दर:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {lowBidAnalysis.diffPercent}% घटेको
                    </span>
                  </div>

                  {lowBidAnalysis.isOver30PercentBelow && (
                    <div className="p-2 bg-red-100 text-red-900 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                      <span>
                        सावधान! ३०% भन्दा बढी घटेको हुँदा ऐन दफा २५(७ख) बमोजिम यो बोलपत्र मूल्याङ्कन प्रक्रियाबाट स्वतः हट्नेछ।
                      </span>
                    </div>
                  )}

                  {lowBidAnalysis.isOver15PercentBelow && !lowBidAnalysis.isOver30PercentBelow && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>सामान्य कार्यसम्पादन जमानत (५%):</span>
                        <span className="font-mono">{formatNepaliCurrency(lowBidAnalysis.basePerfSec)}</span>
                      </div>
                      <div className="flex items-center justify-between text-red-700 font-semibold">
                        <span>अतिरिक्त थप जमानत (१५% भन्दा घटेको ५०%):</span>
                        <span className="font-mono">+{formatNepaliCurrency(lowBidAnalysis.additionalPerfSec)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                        <span>दाखिला गर्नुपर्ने कुल कार्यसम्पादन जमानत:</span>
                        <span className="font-mono text-red-700">{formatNepaliCurrency(lowBidAnalysis.totalPerfSec)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        सार्वजनिक खरिद ऐन दफा १३(ढ१) तथा दफा २७(४) बमोजिम गणना गरिएको।
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
