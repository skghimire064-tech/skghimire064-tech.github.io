import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Scale,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import {
  EnrichedPpmoOpinion,
  EnrichedPprcDecision,
  TopicCategory,
} from '../data/procurementGuideData';
import {
  PROCUREMENT_METHODS,
  KEY_LEGAL_PRINCIPLES,
} from '../data/procurementRulesData';

interface LegalCrossReferenceViewProps {
  opinions: EnrichedPpmoOpinion[];
  decisions: EnrichedPprcDecision[];
  onInspectOpinion: (op: EnrichedPpmoOpinion) => void;
  onInspectDecision: (dec: EnrichedPprcDecision) => void;
  onCompareTopic: (topic: TopicCategory) => void;
}

const KEY_ACT_SECTIONS = [
  { code: 'दफा १०', title: 'योग्यताका आधार (Qualification Criteria)' },
  { code: 'दफा १३', title: 'बोलपत्र कागजात र स्पेसिफिकेशन' },
  { code: 'दफा २३', title: 'बोलपत्र परीक्षण र स्पष्टीकरण' },
  { code: 'दफा २५', title: 'बोलपत्रको मूल्याङ्कन (Bid Evaluation)' },
  { code: 'दफा २६', title: 'सबै बोलपत्र अस्वीकृत वा कार्यविधि रद्द' },
  { code: 'दफा २७', title: 'बोलपत्र स्वीकृति र आशयको सूचना' },
  { code: 'दफा ४०', title: 'सिलबन्दी दरभाउपत्र (Sealed Quotation)' },
  { code: 'दफा ४१', title: 'सोझै खरिद (Direct Purchase)' },
  { code: 'दफा ४७', title: 'सार्वजनिक निकाय प्रमुखसमक्ष पुनरावलोकन' },
  { code: 'दफा ५०', title: 'पुनरावलोकन समितिसमक्ष निवेदन र अधिकार' },
  { code: 'दफा ५२', title: 'खरिद सम्झौता र शर्तहरू' },
  { code: 'दफा ५४', title: 'भेरिएसन आदेश (Variation Order)' },
  { code: 'दफा ५५', title: 'मूल्य समायोजन (Price Adjustment)' },
  { code: 'दफा ५९', title: 'सम्झौताको अन्त्य र उपचार' },
  { code: 'दफा ६३', title: 'कालोसूचीमा राख्ने र फुकुवा गर्ने' },
];

const KEY_REGULATION_RULES = [
  { code: 'नियम २०', title: 'लागत अनुमान अद्यावधिक र स्वीकृति' },
  { code: 'नियम २६', title: 'बोलपत्रदाताको योग्यता र अनुभव' },
  { code: 'नियम ३१ङ', title: '२ करोडसम्म र २ करोडमाथिको बोलपत्र कार्यविधि' },
  { code: 'नियम ४०', title: 'बोलपत्रसाथ पेश गर्नुपर्ने कर चुक्ता र कागजात' },
  { code: 'नियम ५३', title: 'बोलपत्र जमानत (Bid Security) र मान्य अवधि' },
  { code: 'नियम ६५', title: 'प्राविधिक मूल्याङ्कन र ५ वटा ठेक्काको सीमा' },
  { code: 'नियम ८४', title: 'सिलबन्दी दरभाउपत्र सम्बन्धी कार्यविधि' },
  { code: 'नियम ८५', title: 'सोझै खरिदको सीमा र शर्तहरू' },
  { code: 'नियम ९७', title: 'उपभोक्ता समिति मार्फत काम गराउने कार्यविधि' },
  { code: 'नियम ११८', title: 'भेरिएसन आदेश जारी गर्ने अधिकारी र सीमा' },
  { code: 'नियम १२०', title: 'खरिद सम्झौताको म्याद थप' },
  { code: 'नियम १२१', title: 'पूर्व निर्धारित क्षतिपूर्ति (Liquidated Damages)' },
  { code: 'नियम १४५ख', title: 'बोलपत्र वा प्रस्ताव सच्याउन वा फिर्ता लिन नपाइने' },
];

export const LegalCrossReferenceView: React.FC<LegalCrossReferenceViewProps> = ({
  opinions,
  decisions,
  onInspectOpinion,
  onInspectDecision,
  onCompareTopic,
}) => {
  const [selectedRef, setSelectedRef] = useState<string>('दफा २५');
  const [activeSubTab, setActiveSubTab] = useState<'SECTIONS' | 'METHODS'>('SECTIONS');

  const matchedOpinions = useMemo(() => {
    const q = selectedRef.toLowerCase();
    return opinions.filter(
      (op) =>
        op.subject.toLowerCase().includes(q) ||
        op.opinion.toLowerCase().includes(q) ||
        op.actRefs.some((r) => r.toLowerCase().includes(q)) ||
        op.ruleRefs.some((r) => r.toLowerCase().includes(q))
    );
  }, [opinions, selectedRef]);

  const matchedDecisions = useMemo(() => {
    const q = selectedRef.toLowerCase();
    return decisions.filter(
      (dec) =>
        dec.act.toLowerCase().includes(q) ||
        dec.rule.toLowerCase().includes(q) ||
        dec.subject.toLowerCase().includes(q) ||
        dec.decision.toLowerCase().includes(q) ||
        dec.use.toLowerCase().includes(q)
    );
  }, [decisions, selectedRef]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation between Legal Sections Explorer & Procurement Methods */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              ऐन/नियमावली दफावार खोज तथा खरिद विधि दिग्दर्शन
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              सार्वजनिक खरिद ऐन, २०६३ का दफा र नियमावली, २०६४ का नियमहरू छनोट गरी सो व्यवस्थामा PPMO को राय र PPRC को निर्णय एकैठाउँमा हेर्नुहोस्
            </p>
          </div>

          <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-1 self-start">
            <button
              type="button"
              onClick={() => setActiveSubTab('SECTIONS')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeSubTab === 'SECTIONS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ऐन र नियमावली दफावार खोज
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('METHODS')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeSubTab === 'METHODS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              खरिद विधि, सीमा र कागजातहरू
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'SECTIONS' ? (
        <div className="space-y-6">
          {/* Interactive Section & Rule Selector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Act 2063 Sections */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  सार्वजनिक खरिद ऐन, २०६३ का प्रमुख दफाहरू
                </h3>
                <span className="text-xs text-slate-500">दफा छान्नुहोस्</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KEY_ACT_SECTIONS.map((sec) => {
                  const active = selectedRef === sec.code;
                  return (
                    <button
                      key={sec.code}
                      type="button"
                      onClick={() => setSelectedRef(sec.code)}
                      className={`text-left px-3 py-2 rounded border transition-colors ${
                        active
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{sec.code}</div>
                      <div
                        className={`text-[11px] truncate ${
                          active ? 'text-blue-100' : 'text-slate-600'
                        }`}
                      >
                        {sec.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Regulation 2064 Rules */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-700" />
                  सार्वजनिक खरिद नियमावली, २०६४ का प्रमुख नियमहरू
                </h3>
                <span className="text-xs text-slate-500">नियम छान्नुहोस्</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {KEY_REGULATION_RULES.map((rl) => {
                  const active = selectedRef === rl.code;
                  return (
                    <button
                      key={rl.code}
                      type="button"
                      onClick={() => setSelectedRef(rl.code)}
                      className={`text-left px-3 py-2 rounded border transition-colors ${
                        active
                          ? 'bg-indigo-700 text-white border-indigo-700'
                          : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{rl.code}</div>
                      <div
                        className={`text-[11px] truncate ${
                          active ? 'text-indigo-100' : 'text-slate-600'
                        }`}
                      >
                        {rl.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Legal Provision Side-by-Side Results */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  छानिएको कानूनी व्यवस्था
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  “{selectedRef}” सँग सम्बन्धित PPMO का राय र PPRC का निर्णयहरू
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                <span className="text-blue-800 font-semibold">
                  PPMO राय: {matchedOpinions.length}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-indigo-800 font-semibold">
                  PPRC निर्णय: {matchedDecisions.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: PPMO Opinions on this Section/Rule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-blue-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <h4 className="text-sm font-bold text-slate-900">
                      {selectedRef} मा PPMO ले दिएका रायहरू ({matchedOpinions.length})
                    </h4>
                  </div>
                </div>

                {matchedOpinions.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-500 text-center">
                    यस दफा/नियमको प्रत्यक्ष उल्लेख भएको PPMO राय फेला परेन।
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
                    {matchedOpinions.map((op) => (
                      <div
                        key={op.id}
                        className="p-4 rounded-md border border-slate-200 hover:border-blue-400 bg-white transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                          <span className="font-bold text-blue-800">राय #{op.no}</span>
                          <span>मिति: {op.date}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          निकाय: {op.requestingEntity}
                        </div>
                        <div className="text-xs bg-slate-50 p-2.5 rounded border-l-2 border-slate-400 text-slate-900 font-medium">
                          <span className="text-slate-500 font-bold">माग भएको विषय: </span>
                          {op.cleanSubject}
                        </div>
                        <div className="text-xs bg-blue-50/40 p-2.5 rounded border-l-2 border-blue-600 text-slate-800 leading-relaxed">
                          <span className="text-blue-900 font-bold">PPMO को राय: </span>
                          {op.opinion}
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => onInspectOpinion(op)}
                            className="text-xs font-semibold text-blue-700 hover:underline"
                          >
                            विस्तृत विवरण हेर्नुहोस् →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: PPRC Decisions on this Section/Rule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-600">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-700" />
                    <h4 className="text-sm font-bold text-slate-900">
                      {selectedRef} मा PPRC ले गरेका निर्णयहरू ({matchedDecisions.length})
                    </h4>
                  </div>
                </div>

                {matchedDecisions.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-500 text-center">
                    यस दफा/नियमको प्रत्यक्ष उल्लेख भएको PPRC निर्णय फेला परेन।
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
                    {matchedDecisions.map((dec) => (
                      <div
                        key={dec.id}
                        className="p-4 rounded-md border border-slate-200 hover:border-indigo-400 bg-white transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-indigo-900">
                            निर्णय #{dec.no}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {dec.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong>निवेदक:</strong> {dec.app} <span className="text-slate-300">|</span>{' '}
                          <strong>विपक्षी:</strong> {dec.resp}
                        </div>
                        <div className="text-xs bg-slate-50 p-2.5 rounded border-l-2 border-slate-400 text-slate-900 font-medium">
                          <span className="text-slate-500 font-bold">विवादको विषय: </span>
                          {dec.subject}
                        </div>
                        <div className="text-xs bg-indigo-50/40 p-2.5 rounded border-l-2 border-indigo-600 text-slate-800 leading-relaxed">
                          <span className="text-indigo-900 font-bold">PPRC को निर्णय: </span>
                          {dec.decision}
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <span>प्रयोग: {dec.use}</span>
                          <button
                            type="button"
                            onClick={() => onInspectDecision(dec)}
                            className="text-xs font-semibold text-indigo-700 hover:underline"
                          >
                            विस्तृत विवरण हेर्नुहोस् →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Core Legal Principles Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                प्रमुख खरिद विषयमा PPMO को व्याख्या र PPRC को नजिरको तुलनात्मक सारांश
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                दैनिक खरिद कारबाहीमा बारम्बार उठ्ने ७ मुख्य कानूनी प्रश्नमा दुवै निकायको स्थापित दृष्टिकोण
              </p>
            </div>

            <div className="space-y-4">
              {KEY_LEGAL_PRINCIPLES.map((item, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-800">
                        {item.sectionRef}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCompareTopic(item.topic)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      <span>यस विषयका सबै राय र निर्णय हेर्नुहोस्</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-3.5 rounded border-l-2 border-blue-600 border border-slate-200">
                      <div className="font-bold text-blue-900 mb-1">
                        PPMO को राय परामर्शको सार:
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.ppmoStance}</p>
                    </div>
                    <div className="bg-white p-3.5 rounded border-l-2 border-indigo-600 border border-slate-200">
                      <div className="font-bold text-indigo-900 mb-1">
                        PPRC को पुनरावलोकन निर्णयको नजिर:
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.pprcStance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Procurement Methods & Thresholds Reference */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {PROCUREMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-xs font-mono text-blue-700 font-semibold">
                      {method.actSection} · {method.ruleNumber}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {method.name}
                    </h3>
                    <p className="text-xs text-slate-500">{method.englishName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 block font-medium">रकमको सीमा (Threshold):</span>
                    <span className="font-semibold text-slate-900">{method.thresholdLimit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">न्यूनतम सूचना अवधि:</span>
                    <span className="font-semibold text-slate-900">{method.minNoticeDays}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">बोलपत्र जमानत (Bid Security):</span>
                    <span className="font-semibold text-slate-900">{method.bidSecurity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">कार्यसम्पादन जमानत:</span>
                    <span className="font-semibold text-slate-900">{method.performanceSecurity}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    प्रमुख कानूनी शर्तहरू:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                    {method.keyConditions.map((cond, i) => (
                      <li key={i} className="leading-relaxed">
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                    अनिवार्य कागजातहरूको चेकलिस्ट:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                    {method.requiredDocs.map((doc, i) => (
                      <li key={i} className="leading-relaxed">
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => onCompareTopic(method.relatedTopic)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  <span>यस खरिद विधिका PPMO राय र PPRC निर्णय हेर्नुहोस्</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
