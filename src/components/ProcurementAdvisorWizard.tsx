import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Building,
  Check
} from 'lucide-react';
import { ProcurementType } from '../types/procurement';
import { PROCUREMENT_METHODS } from '../data/procurementData';
import { analyzeProcurementThreshold, formatNepaliCurrency } from '../utils/procurementUtils';

interface ProcurementAdvisorWizardProps {
  onSelectMethod?: (methodId: string) => void;
  onNavigateToTemplate?: (templateId: string) => void;
}

export const ProcurementAdvisorWizard: React.FC<ProcurementAdvisorWizardProps> = ({
  onSelectMethod,
  onNavigateToTemplate,
}) => {
  const [step, setStep] = useState<number>(1);
  const [procurementType, setProcurementType] = useState<ProcurementType>('works');
  const [amount, setAmount] = useState<number>(3500000); // 35 Lakhs default
  const [specialCondition, setSpecialCondition] = useState<string>('normal');

  // Quick budget range choices
  const budgetPresets = [
    { label: 'रु १ लाख सम्म', value: 100000 },
    { label: 'रु १५ लाख सम्म (फुटकर/सोझै)', value: 1500000 },
    { label: 'रु २० लाख सम्म (दरभाउपत्र)', value: 2000000 },
    { label: 'रु १ करोड सम्म (उपभोक्ता समिति)', value: 10000000 },
    { label: 'रु २ करोड सम्म (१ खाम खुला)', value: 20000000 },
    { label: 'रु ५ करोड (२ खाम खुला बोलपत्र)', value: 50000000 },
    { label: 'रु २५ करोड (ठूला निर्माण)', value: 250000000 },
    { label: 'रु १ अर्ब सम्म', value: 1000000000 },
    { label: 'रु ५ अर्ब भन्दा बढी (ICB)', value: 6000000000 },
  ];

  const analysis = useMemo(() => {
    return analyzeProcurementThreshold(procurementType, Number(amount) || 0);
  }, [procurementType, amount]);

  // Derived recommendation based on special condition and analysis
  const finalRecommendation = useMemo(() => {
    if (specialCondition === 'emergency') {
      return {
        methodName: 'विशेष परिस्थितिमा खरिद (Emergency Procurement)',
        legalBasis: 'सार्वजनिक खरिद ऐन दफा ६६, नियमावली नियम १४५',
        summary: 'प्राकृतिक विपद्, महामारी वा आकस्मिक संकट आइपरेमा तत्काल हानि नोक्सानी रोक्न प्रतिस्पर्धा गराई वा एउटा मात्र व्यवसायीसँग लिखित दरभाउ लिई वार्ताबाट खरिद गर्न सकिन्छ।',
        authority: 'कार्यालय प्रमुख (१ तह माथिको अधिकारीलाई तुरुन्त विस्तृत जानकारी गराउनुपर्ने)',
        noticeDays: 'तत्काल / आवश्यकता अनुसार छोटो समय',
        caution: '१० लाख भन्दा बढी रकमको खरिद गरेमा सार्वजनिक सूचना प्रकाशन गरी PPMO मा अनिवार्य जानकारी पठाउनुपर्छ (नियम १४५(३))।',
      };
    }

    if (specialCondition === 'single-source') {
      return {
        methodName: 'एक मात्र आपूर्तिकर्ता/प्रोप्राइट्री खरिद (Single Source / Proprietary)',
        legalBasis: 'सार्वजनिक खरिद ऐन दफा ४१(१)(ग, घ), नियम ८५(३, ५)',
        summary: 'वस्तु आपूर्ति गर्ने अधिकार एउटा मात्र आपूर्तिकर्तासँग भएको वा जडित मेशिनरीको पाटपूर्जा साविककै आपूर्तिकर्ताबाट मात्र लिनुपर्ने प्रमाणित भएमा सोझै खरिद गर्न सकिन्छ।',
        authority: 'कार्यालय प्रमुख (प्रोप्राइट्री मालसामान भए साविक सम्झौताको ३०% मूल्य सम्म, १ तह माथिको सहमति)',
        noticeDays: 'सूचना आवश्यक नपर्ने',
        caution: 'उद्योगको उत्पादन लागत अस्वाभाविक देखिएमा अनुगमन कार्यालयले परीक्षण गरी कालोसूचीमा राख्न सक्नेछ।',
      };
    }

    if (specialCondition === 'heavy-vehicle' && procurementType === 'goods') {
      return {
        methodName: 'उत्पादक/अधिकृत विक्रेता दरमा खरिद (क्याटलग सपिङ - Catalog Shopping)',
        legalBasis: 'सार्वजनिक खरिद ऐन दफा ८(१)(८), नियमावली नियम ३१ख',
        summary: 'सवारी साधन, हेभी इक्विपमेन्ट, एक्सरे वा स्वास्थ्य उपकरणको उत्पादकले ब्रोसर वा वेबसाइटमा सार्वजनिक गरेको दररेटमा छुट र सुविधामा प्रतिस्पर्धा गराई खरिद गर्ने।',
        authority: 'स्वीकृत लागत अनुमान अनुसारको अधिकारी',
        noticeDays: 'कम्तीमा ७ दिन देखि बढीमा १५ दिनको लिखित सूचना',
        caution: 'बोलपत्र जमानत आवश्यक पर्दैन (नियम ३१ख(२)); बहुवर्षीय ठेक्कामा यो विधि प्रयोग गर्न पाइँदैन।',
      };
    }

    if (specialCondition === 'user-committee' && procurementType === 'works' && amount <= 10000000) {
      return {
        methodName: 'उपभोक्ता समितिबाट निर्माण कार्य (User Committee)',
        legalBasis: 'सार्वजनिक खरिद ऐन दफा ४४, नियमावली नियम ९७',
        summary: 'स्थानीय बासिन्दा प्रत्यक्ष लाभग्राही हुने र जटिल प्रविधि नचाहिने रु १ करोड सम्मको निर्माण कार्य।',
        authority: 'स्थानीय तह वा सार्वजनिक निकायको प्रमुख',
        noticeDays: 'कम्तीमा ७ दिनको सूचना / आम भेला',
        caution: 'डोजर/एक्साभेटर जस्ता हेभी मेसिन प्रयोग गर्न र ठेकेदारलाई काम दिन सख्त प्रतिबन्ध छ।',
      };
    }

    // Default primary method from threshold analysis
    const primary = analysis.recommendedMethods.find(m => m.isPrimary) || analysis.recommendedMethods[0];
    return {
      methodName: primary?.name || 'खुला बोलपत्र (Open Bidding)',
      legalBasis: primary?.legalClause || 'सार्वजनिक खरिद ऐन दफा ११',
      summary: primary?.reason || 'नियम अनुसार खुला प्रतिस्पर्धा गराउनुपर्ने।',
      authority: analysis.approvingAuthorityCostEstimate,
      noticeDays: `कम्तीमा ${analysis.minimumNoticeDays} दिन`,
      caution: analysis.isTwoEnvelopeRequired
        ? 'रु २ करोड माथिको निर्माण भएकाले अनिवार्य दुई खाम प्रणाली (Two-Envelope) अवलम्बन गर्नुपर्छ।'
        : 'लागत अनुमान भन्दा ३०% भन्दा बढी घटेर आउने बोलपत्र स्वतः खारेज हुनेछ।',
    };
  }, [specialCondition, procurementType, amount, analysis]);

  const handleReset = () => {
    setStep(1);
    setProcurementType('works');
    setAmount(3500000);
    setSpecialCondition('normal');
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>सजिलो खरिद सल्लाहकार (Procurement Decision Assistant)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            "मलाई के खरिद गर्नु छ?" - ३ चरणमा उपयुक्त कानुनी मार्गनिर्देशन
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            तपाईंले गर्न लाग्नुभएको कामको प्रकार, बजेट र अवस्था प्रविष्ट गर्नासाथ कानुन सम्मत खरिद विधि, स्वीकृति गर्ने अधिकारी, सूचना म्याद, धरौटी र आवश्यक कागजातको तुरुन्तै मार्गदर्शन पाउनुहोस्।
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>सुरुबाट रोज्नुहोस्</span>
        </button>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className={`p-3 rounded-xl border text-center transition-all ${step === 1 ? 'bg-red-700 text-white font-bold' : step > 1 ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' : 'bg-white text-slate-500'}`}>
          १. खरिदको प्रकार
        </div>
        <div className={`p-3 rounded-xl border text-center transition-all ${step === 2 ? 'bg-red-700 text-white font-bold' : step > 2 ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' : 'bg-white text-slate-500'}`}>
          २. बजेट र अवस्था
        </div>
        <div className={`p-3 rounded-xl border text-center transition-all ${step === 3 ? 'bg-red-700 text-white font-bold' : 'bg-white text-slate-500'}`}>
          ३. सिफारिस र कार्ययोजना
        </div>
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-left">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              चरण १: तपाईं कुन प्रकृतिको खरिद गर्दै हुनुहुन्छ?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              खरिद ऐन अनुसार प्रत्येक प्रकृतिको लागि फरक कानुनी कार्यविधि र सीमा तोकिएको छ।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => { setProcurementType('works'); setStep(2); }}
              className="p-5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-red-700">
                  निर्माण कार्य (Works)
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                  सडक, भवन, पुल, कुलो
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                नयाँ संरचना निर्माण, पुनर्निर्माण, मर्मत सम्भार वा जिर्णोद्धार। यसमा सामग्री जडान र आनुषङ्गिक कामहरू समेत पर्छन्।
              </p>
            </button>

            <button
              onClick={() => { setProcurementType('goods'); setStep(2); }}
              className="p-5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-red-700">
                  मालसामान आपूर्ति (Goods)
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                  गाडी, उपकरण, औषधि
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                चल वा अचल, सजीव वा निर्जीव वस्तुहरू—जस्तै कार्यालय मसलन्द, फर्निचर, गाडी, स्वास्थ्य यन्त्र, पाइप, औषधि आदि।
              </p>
            </button>

            <button
              onClick={() => { setProcurementType('consulting'); setStep(2); }}
              className="p-5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-red-700">
                  परामर्श सेवा (Consulting)
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                  DPR, सर्भे, सफ्टवेयर
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                अध्ययन, अनुसन्धान, सम्भाव्यता अध्ययन, विस्तृत इन्जिनियरिङ डिजाइन, सुपरभिजन तथा सफ्टवेयर निर्माण जस्ता बौद्धिक सेवाहरू।
              </p>
            </button>

            <button
              onClick={() => { setProcurementType('services'); setStep(2); }}
              className="p-5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 group-hover:text-red-700">
                  अन्य गैर-परामर्श सेवा (Other Services)
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                  सुरक्षा, सरसफाइ, ढुवानी
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                सवारी वा उपकरण भाडा, ढुवानी, सरसफाइ सेवा, सुरक्षा गार्ड, मर्मत सम्भार र हवाई टिकट लगायतका भौतिक सेवाहरू।
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Amount & Special Conditions */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                चरण २: अनुमानित बजेट रकम र विशेष अवस्था
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                प्रकार: <span className="font-semibold text-slate-800">{procurementType === 'works' ? 'निर्माण कार्य' : procurementType === 'goods' ? 'मालसामान' : procurementType === 'consulting' ? 'परामर्श सेवा' : 'अन्य सेवा'}</span>
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-600 hover:text-red-700 font-medium"
            >
              ← प्रकार बदल्नुहोस्
            </button>
          </div>

          {/* Amount Input & Presets */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              अनुमानित लागत रकम (रु.):
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
            <div className="text-xs font-semibold text-red-800">
              {formatNepaliCurrency(Number(amount) || 0)}
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 mr-1">द्रुत सीमा:</span>
              {budgetPresets.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setAmount(b.value)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                    amount === b.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special conditions selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              के कुनै विशेष परिस्थिति वा सर्त छ?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${specialCondition === 'normal' ? 'bg-red-50/50 border-red-500 ring-1 ring-red-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="condition"
                  value="normal"
                  checked={specialCondition === 'normal'}
                  onChange={() => setSpecialCondition('normal')}
                  className="mt-0.5 text-red-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">सामान्य नियमित खरिद (Normal)</span>
                  <span className="text-[11px] text-slate-500">कानुन बमोजिमको खुला वा नियमित विधि</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${specialCondition === 'emergency' ? 'bg-red-50/50 border-red-500 ring-1 ring-red-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="condition"
                  value="emergency"
                  checked={specialCondition === 'emergency'}
                  onChange={() => setSpecialCondition('emergency')}
                  className="mt-0.5 text-red-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">आपतकालीन वा विपद् (Emergency)</span>
                  <span className="text-[11px] text-slate-500">बाढी, पहिरो, महामारी वा विशेष परिस्थिति (दफा ६६)</span>
                </div>
              </label>

              {procurementType === 'goods' && (
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${specialCondition === 'heavy-vehicle' ? 'bg-red-50/50 border-red-500 ring-1 ring-red-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <input
                    type="radio"
                    name="condition"
                    value="heavy-vehicle"
                    checked={specialCondition === 'heavy-vehicle'}
                    onChange={() => setSpecialCondition('heavy-vehicle')}
                    className="mt-0.5 text-red-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">सवारी साधन वा हेभी मेसिनरी</span>
                    <span className="text-[11px] text-slate-500">उत्पादकको क्याटलग सपिङ गर्न मिल्ने (नियम ३१ख)</span>
                  </div>
                </label>
              )}

              {procurementType === 'works' && amount <= 10000000 && (
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${specialCondition === 'user-committee' ? 'bg-red-50/50 border-red-500 ring-1 ring-red-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <input
                    type="radio"
                    name="condition"
                    value="user-committee"
                    checked={specialCondition === 'user-committee'}
                    onChange={() => setSpecialCondition('user-committee')}
                    className="mt-0.5 text-red-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">स्थानीय उपभोक्ता समितिबाट गराउनुपर्ने</span>
                    <span className="text-[11px] text-slate-500">लाभग्राही जनसहभागितामूलक काम (दफा ४४)</span>
                  </div>
                </label>
              )}

              <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${specialCondition === 'single-source' ? 'bg-red-50/50 border-red-500 ring-1 ring-red-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <input
                  type="radio"
                  name="condition"
                  value="single-source"
                  checked={specialCondition === 'single-source'}
                  onChange={() => setSpecialCondition('single-source')}
                  className="mt-0.5 text-red-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">एक मात्र उत्पादक / प्रोप्राइट्री पाटपूर्जा</span>
                  <span className="text-[11px] text-slate-500">नेपालमा अर्को विकल्प नभएको प्रमाणित वस्तु (दफा ४१)</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs flex items-center gap-2 transition-colors"
            >
              <span>कार्ययोजना हेर्नुहोस्</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Comprehensive Tailored Roadmap & Output */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left space-y-6">
          {/* Recommendation Banner */}
          <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-red-400 font-semibold mb-1">
                <span>तपाईंका लागि सिफारिस गरिएको खरिद विधि</span>
                <span>·</span>
                <span className="font-mono text-slate-300">{finalRecommendation.legalBasis}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {finalRecommendation.methodName}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {finalRecommendation.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setStep(2)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors"
              >
                ← परिमार्जन गर्नुहोस्
              </button>
            </div>
          </div>

          {/* Key Parameters Cards */}
          <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">लागत अनुमान स्वीकृतिकर्ता:</span>
              <span className="font-bold text-slate-900 text-sm block">{finalRecommendation.authority}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">सूचना म्याद:</span>
              <span className="font-bold text-slate-900 text-sm block">{finalRecommendation.noticeDays}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">बोलपत्र जमानत (२-३%):</span>
              <span className="font-bold text-slate-900 text-sm block font-mono">
                {formatNepaliCurrency(analysis.requiredBidSecurityRange.minAmount)} ~ {formatNepaliCurrency(analysis.requiredBidSecurityRange.maxAmount)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-0.5">कार्यसम्पादन जमानत (५%):</span>
              <span className="font-bold text-slate-900 text-sm block font-mono">
                {formatNepaliCurrency(analysis.minimumPerformanceSecurity)}
              </span>
            </div>
          </div>

          {/* Warning / Caution Callout */}
          <div className="mx-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">सावधानी तथा अनिवार्य कानुनी बन्देज:</span>
              <p>{finalRecommendation.caution}</p>
            </div>
          </div>

          {/* Actionable Steps Roadmap */}
          <div className="px-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span>अब तपाईंले चाल्नुपर्ने चरणबद्ध कदमहरू (Next Steps):</span>
            </h4>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center shrink-0">१</span>
                <div>
                  <span className="font-bold text-slate-900 block">पूर्वतयारी र बजेट सुनिश्चितता:</span>
                  <p className="text-slate-600 mt-0.5">साइट उपलब्ध गराउने, रुख कटान सहमति र वातावरणीय प्रतिवेदन स्वीकृत भएको सुनिश्चित गर्ने (ऐन दफा ४क)।</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center shrink-0">२</span>
                <div>
                  <span className="font-bold text-slate-900 block">लागत अनुमान र स्पेसिफिकेसन स्वीकृति:</span>
                  <p className="text-slate-600 mt-0.5">जिल्ला दररेट र सरकारी नर्म्स अनुसार दर विश्लेषण गरी अधिकार प्राप्त अधिकारीबाट लागत अनुमान स्वीकृत गराउने (नियम १४)।</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center shrink-0">३</span>
                <div>
                  <span className="font-bold text-slate-900 block">कागजात तयारी र सूचना आह्वान:</span>
                  <p className="text-slate-600 mt-0.5">PPMO को स्वीकृत नमूना बोलपत्र कागजात प्रयोग गरी {finalRecommendation.noticeDays} को म्याद दिई e-GP पोर्टल र राष्ट्रिय दैनिकमा सूचना प्रकाशन गर्ने।</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold flex items-center justify-center shrink-0">४</span>
                <div>
                  <span className="font-bold text-slate-900 block">मूल्याङ्कन, LOI र सम्झौता:</span>
                  <p className="text-slate-600 mt-0.5">मूल्याङ्कन समितिबाट ३०% घटेको खारेजी र औसत अङ्क नजिकको बोलपत्र छनोट गरी ७ दिनको LOI दिएर १५ दिनभित्र सम्झौता सम्पन्न गर्ने।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Links to Templates & Checklists */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">यस प्रक्रियाका लागि आवश्यक कागजात ढाँचा डाउनलोड गर्नुहोस्:</span>
            <div className="flex items-center gap-2">
              {onNavigateToTemplate && (
                <button
                  onClick={() => onNavigateToTemplate('tmpl-ifb-ncb')}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>बोलपत्र सूचना / सम्झौता ढाँचा</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
