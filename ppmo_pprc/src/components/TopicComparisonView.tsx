import React, { useState, useMemo } from 'react';
import {
  Search,
  Scale,
  FileText,
  Bookmark,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  EnrichedPpmoOpinion,
  EnrichedPprcDecision,
  TOPIC_CATEGORIES,
  TopicCategory,
} from '../data/procurementGuideData';
import { KEY_LEGAL_PRINCIPLES } from '../data/procurementRulesData';

interface TopicComparisonViewProps {
  opinions: EnrichedPpmoOpinion[];
  decisions: EnrichedPprcDecision[];
  selectedTopic: TopicCategory | 'ALL';
  onSelectTopic: (topic: TopicCategory | 'ALL') => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onInspectOpinion: (op: EnrichedPpmoOpinion) => void;
  onInspectDecision: (dec: EnrichedPprcDecision) => void;
}

const QUICK_KEYWORDS = [
  'कर चुक्ता',
  'भेरिएसन',
  'मूल्य समायोजन',
  'बोलपत्र जमानत',
  'एकल बोलपत्र',
  'संयुक्त उपक्रम',
  'अख्तियारनामा',
  'कालोसूची',
  'म्याद थप',
  'परामर्श सेवा',
  'राशन',
  'दफा २६',
  'नियम ४०',
];

export const TopicComparisonView: React.FC<TopicComparisonViewProps> = ({
  opinions,
  decisions,
  selectedTopic,
  onSelectTopic,
  globalSearch,
  onGlobalSearchChange,
  bookmarkedIds,
  onToggleBookmark,
  onInspectOpinion,
  onInspectDecision,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [opsLimit, setOpsLimit] = useState(8);
  const [ppLimit, setPpLimit] = useState(8);
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');

  const filteredOpinions = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return opinions.filter((op) => {
      if (selectedTopic !== 'ALL' && !op.topics.includes(selectedTopic)) {
        return false;
      }
      if (!q) return true;
      return (
        op.subject.toLowerCase().includes(q) ||
        op.opinion.toLowerCase().includes(q) ||
        op.requestingEntity.toLowerCase().includes(q) ||
        op.date.toLowerCase().includes(q) ||
        op.actRefs.some((r) => r.toLowerCase().includes(q)) ||
        op.ruleRefs.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [opinions, selectedTopic, globalSearch]);

  const filteredDecisions = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return decisions.filter((dec) => {
      if (selectedTopic !== 'ALL' && !dec.topics.includes(selectedTopic)) {
        return false;
      }
      if (outcomeFilter !== 'ALL' && dec.outcomeCategory !== outcomeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        dec.subject.toLowerCase().includes(q) ||
        dec.decision.toLowerCase().includes(q) ||
        dec.app.toLowerCase().includes(q) ||
        dec.resp.toLowerCase().includes(q) ||
        dec.act.toLowerCase().includes(q) ||
        dec.rule.toLowerCase().includes(q) ||
        dec.use.toLowerCase().includes(q)
      );
    });
  }, [decisions, selectedTopic, outcomeFilter, globalSearch]);

  const relevantPrinciples = useMemo(() => {
    if (selectedTopic === 'ALL') return KEY_LEGAL_PRINCIPLES.slice(0, 3);
    return KEY_LEGAL_PRINCIPLES.filter((p) => p.topic === selectedTopic);
  }, [selectedTopic]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Search & Topic Selection Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              विषयगत तुलना: कुन विषयमा PPMO को कस्तो राय र PPRC को कस्तो निर्णय?
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              कुनै खरिद विषय छान्नुहोस् वा शब्द खोज्नुहोस् — बायाँपट्टि PPMO का राय परामर्श र दायाँपट्टि PPRC का पुनरावलोकन निर्णयहरू एकैसाथ तुलना गर्नुहोस्।
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums shrink-0">
            <span>PPMO राय: {filteredOpinions.length}</span>
            <span aria-hidden="true">·</span>
            <span>PPRC निर्णय: {filteredDecisions.length}</span>
          </div>
        </div>

        {/* Search Input + Quick Keywords */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => {
                onGlobalSearchChange(e.target.value);
                setOpsLimit(8);
                setPpLimit(8);
              }}
              placeholder="कुनै विषय, दफा, नियम, निकाय वा शब्द खोज्नुहोस् (उदा: कर चुक्ता, भेरिएसन, जमानत, मूल्य समायोजन, JV, दफा ५०, नियम ४०)..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
            />
            {globalSearch && (
              <button
                onClick={() => onGlobalSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                हटाउनुहोस्
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">द्रुत खोज:</span>
            {QUICK_KEYWORDS.map((kw) => {
              const active = globalSearch === kw;
              return (
                <button
                  key={kw}
                  onClick={() => onGlobalSearchChange(active ? '' : kw)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {kw}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Topic Filter Buttons */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                onSelectTopic('ALL');
                setOpsLimit(8);
                setPpLimit(8);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedTopic === 'ALL'
                  ? 'bg-red-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              सबै विषयहरू ({opinions.length + decisions.length})
            </button>
            {TOPIC_CATEGORIES.map((topic) => {
              const opCount = opinions.filter((o) => o.topics.includes(topic)).length;
              const ppCount = decisions.filter((d) => d.topics.includes(topic)).length;
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => {
                    onSelectTopic(topic);
                    setOpsLimit(8);
                    setPpLimit(8);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {topic} ({opCount + ppCount})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Legal Principles Summary Banner (PPMO Stance vs PPRC Stance) */}
      {relevantPrinciples.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                मुख्य कानूनी मार्गदर्शन र स्थापित नजिर सारसंक्षेप
              </h3>
              <p className="text-xs text-slate-500">
                यस विषयमा सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) को राय र पुनरावलोकन समिति (PPRC) को निर्णयको तुलनात्मक निष्कर्ष
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {relevantPrinciples.map((principle, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{principle.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{principle.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{principle.sectionRef}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="pl-3 border-l-2 border-slate-400">
                    <div className="text-xs font-semibold text-slate-700 mb-0.5">
                      PPMO को नीतिगत राय:
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                      {principle.ppmoStance}
                    </p>
                  </div>
                  <div className="pl-3 border-l-2 border-red-700">
                    <div className="text-xs font-semibold text-red-800 mb-0.5">
                      PPRC को स्थापित निर्णय/नजिर:
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                      {principle.pprcStance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid: PPMO Opinions (Left) vs PPRC Decisions (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: PPMO Opinions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-800" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  PPMO सँग माग भएको राय र PPMO ले दिएका रायहरू
                </h3>
                <p className="text-xs text-slate-500">
                  सार्वजनिक खरिद ऐन दफा ६५(१)(ङ) बमोजिम प्रदान गरिएका राय परामर्श
                </p>
              </div>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              {filteredOpinions.length} अभिलेख
            </span>
          </div>

          {filteredOpinions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                यस खोज वा विषयमा कुनै PPMO राय परामर्श फेला परेन।
              </p>
              <button
                onClick={() => {
                  onSelectTopic('ALL');
                  onGlobalSearchChange('');
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                फिल्टर रिसेट गर्नुहोस्
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOpinions.slice(0, opsLimit).map((op) => {
                const isBookmarked = bookmarkedIds.has(op.id);
                return (
                  <article
                    key={op.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors space-y-3"
                  >
                    {/* Unboxed Metadata Line */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 flex-wrap font-mono tabular-nums">
                        <span className="font-semibold text-slate-800">राय नं. {op.no}</span>
                        <span aria-hidden="true">·</span>
                        <span>मिति: {op.date || 'उल्लेख नभएको'}</span>
                        {op.requestingEntity !== 'विभिन्न सार्वजनिक निकाय' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans text-slate-700 font-medium">
                              {op.requestingEntity}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            handleCopy(
                              op.id,
                              `[PPMO राय नं. ${op.no} | मिति: ${op.date}]\nमाग गरिएको विषय: ${op.subject}\nPPMO को राय: ${op.opinion}`
                            )
                          }
                          title="राय कपी गर्नुहोस्"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          {copiedId === op.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onToggleBookmark(op.id)}
                          title="बुकमार्क गर्नुहोस्"
                          className={`p-1.5 rounded transition-colors ${
                            isBookmarked
                              ? 'text-red-600'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <Bookmark
                            className="w-3.5 h-3.5"
                            fill={isBookmarked ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Question / Subject */}
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-500">
                        माग भएको विषय / द्विविधा:
                      </div>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {op.cleanSubject}
                      </p>
                    </div>

                    {/* PPMO Opinion */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-1">
                      <div className="text-xs font-semibold text-emerald-800">
                        PPMO ले दिएको राय परामर्श:
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                        {op.opinion}
                      </p>
                    </div>

                    {/* Footer: Legal Refs + Inspect Button */}
                    <div className="pt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{op.topics[0]}</span>
                        {(op.actRefs.length > 0 || op.ruleRefs.length > 0) && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-700">
                              {[...op.actRefs.slice(0, 2), ...op.ruleRefs.slice(0, 2)].join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => onInspectOpinion(op)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-red-700 whitespace-nowrap shrink-0"
                      >
                        पूर्ण विवरण <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}

              {filteredOpinions.length > opsLimit && (
                <button
                  onClick={() => setOpsLimit((prev) => prev + 12)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  थप PPMO रायहरू हेर्नुहोस् (बाँकी {filteredOpinions.length - opsLimit})
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PPRC Decisions */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-700" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  खरिद विवादमा PPRC ले गरेका पुनरावलोकन निर्णयहरू
                </h3>
                <p className="text-xs text-slate-500">
                  सार्वजनिक खरिद ऐन दफा ५० बमोजिम पुनरावलोकन समितिबाट भएका फैसला
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={outcomeFilter}
                onChange={(e) => {
                  setOutcomeFilter(e.target.value);
                  setPpLimit(8);
                }}
                aria-label="निर्णयको प्रकार छान्नुहोस्"
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-slate-900"
              >
                <option value="ALL">सबै निर्णय ({filteredDecisions.length})</option>
                <option value="बदर / पुनर्मूल्याङ्कन">निकायको निर्णय बदर / पुनर्मूल्याङ्कन</option>
                <option value="निवेदन खारेज">निवेदन खारेज</option>
                <option value="अन्य आदेश / फिर्ता">अन्य आदेश / फिर्ता</option>
                <option value="दरपीठ">दरपीठ</option>
              </select>
            </div>
          </div>

          {filteredDecisions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                यस खोज वा विषयमा कुनै PPRC निर्णय फेला परेन।
              </p>
              <button
                onClick={() => {
                  onSelectTopic('ALL');
                  setOutcomeFilter('ALL');
                  onGlobalSearchChange('');
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                फिल्टर रिसेट गर्नुहोस्
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDecisions.slice(0, ppLimit).map((dec) => {
                const isBookmarked = bookmarkedIds.has(dec.id);
                const isAnnulled = dec.outcomeCategory === 'बदर / पुनर्मूल्याङ्कन';
                return (
                  <article
                    key={dec.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors space-y-3"
                  >
                    {/* Unboxed Metadata Line */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-semibold text-slate-900 tabular-nums">
                          निर्णय नं. {dec.no}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            isAnnulled ? 'text-red-700' : 'text-slate-700'
                          }`}
                        >
                          {dec.type}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-700">
                          {[dec.act !== '—' ? dec.act : '', dec.rule !== '—' ? dec.rule : '']
                            .filter(Boolean)
                            .join(' / ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            handleCopy(
                              dec.id,
                              `[PPRC निर्णय नं. ${dec.no} | ${dec.type} | ${dec.act}]\nनिवेदक: ${dec.app}\nविपक्षी: ${dec.resp}\nविवादको विषय: ${dec.subject}\nPPRC को निर्णय: ${dec.decision}`
                            )
                          }
                          title="निर्णय कपी गर्नुहोस्"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          {copiedId === dec.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onToggleBookmark(dec.id)}
                          title="बुकमार्क गर्नुहोस्"
                          className={`p-1.5 rounded transition-colors ${
                            isBookmarked
                              ? 'text-red-600'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <Bookmark
                            className="w-3.5 h-3.5"
                            fill={isBookmarked ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Parties */}
                    <div className="text-xs text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg">
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">निवेदक:</span> {dec.app}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">सार्वजनिक निकाय:</span>{' '}
                        {dec.resp}
                      </div>
                    </div>

                    {/* Dispute Subject */}
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-500">
                        विवादको विषय र दाबी:
                      </div>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed line-clamp-3">
                        {dec.subject}
                      </p>
                    </div>

                    {/* PPRC Decision */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-1">
                      <div className="text-xs font-semibold text-red-800">
                        PPRC ले गरेको निर्णय र आधार:
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                        {dec.decision}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{dec.topics[0]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{dec.decisionDate}</span>
                      </div>
                      <button
                        onClick={() => onInspectDecision(dec)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-red-700 whitespace-nowrap shrink-0"
                      >
                        पूर्ण फैसला <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}

              {filteredDecisions.length > ppLimit && (
                <button
                  onClick={() => setPpLimit((prev) => prev + 12)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  थप PPRC निर्णयहरू हेर्नुहोस् (बाँकी {filteredDecisions.length - ppLimit})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
