import React, { useState, useMemo } from 'react';
import {
  Search,
  Scale,
  Bookmark,
  Copy,
  Check,
  BookOpen,
  ArrowUpRight,
  RotateCcw,
  Users,
} from 'lucide-react';
import {
  EnrichedPprcDecision,
  TOPIC_CATEGORIES,
  TopicCategory,
} from '../data/procurementGuideData';

interface PprcDecisionsViewProps {
  decisions: EnrichedPprcDecision[];
  selectedTopic: TopicCategory | 'ALL';
  onSelectTopic: (topic: TopicCategory | 'ALL') => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onInspectDecision: (dec: EnrichedPprcDecision) => void;
  onCompareTopic: (topic: TopicCategory) => void;
}

const OUTCOME_FILTERS: Array<{
  label: string;
  value: 'ALL' | EnrichedPprcDecision['outcomeCategory'];
}> = [
  { label: 'सबै निर्णयहरू', value: 'ALL' },
  { label: 'बदर / पुनर्मूल्याङ्कन आदेश', value: 'बदर / पुनर्मूल्याङ्कन' },
  { label: 'निवेदन खारेज (निकायको निर्णय सदर)', value: 'निवेदन खारेज' },
  { label: 'अन्य आदेश / फिर्ता', value: 'अन्य आदेश / फिर्ता' },
  { label: 'दरपीठ', value: 'दरपीठ' },
];

export const PprcDecisionsView: React.FC<PprcDecisionsViewProps> = ({
  decisions,
  selectedTopic,
  onSelectTopic,
  globalSearch,
  onGlobalSearchChange,
  bookmarkedIds,
  onToggleBookmark,
  onInspectDecision,
  onCompareTopic,
}) => {
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | EnrichedPprcDecision['outcomeCategory']>('ALL');
  const [partyQuery, setPartyQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  const outcomeCounts = useMemo(() => {
    const counts = {
      ALL: decisions.length,
      'बदर / पुनर्मूल्याङ्कन': 0,
      'निवेदन खारेज': 0,
      'अन्य आदेश / फिर्ता': 0,
      दरपीठ: 0,
    };
    decisions.forEach((d) => {
      counts[d.outcomeCategory] = (counts[d.outcomeCategory] || 0) + 1;
    });
    return counts;
  }, [decisions]);

  const filteredDecisions = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    const pq = partyQuery.trim().toLowerCase();

    return decisions.filter((dec) => {
      if (selectedTopic !== 'ALL' && !dec.topics.includes(selectedTopic)) {
        return false;
      }
      if (outcomeFilter !== 'ALL' && dec.outcomeCategory !== outcomeFilter) {
        return false;
      }
      if (
        pq &&
        !dec.app.toLowerCase().includes(pq) &&
        !dec.resp.toLowerCase().includes(pq)
      ) {
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
        dec.use.toLowerCase().includes(q) ||
        String(dec.no).toLowerCase().includes(q)
      );
    });
  }, [decisions, selectedTopic, outcomeFilter, partyQuery, globalSearch]);

  const handleCopy = (dec: EnrichedPprcDecision) => {
    const text = `[PPRC निर्णय नं. #${dec.no} | प्रकार: ${dec.type}]\nनिवेदक: ${dec.app}\nविपक्षी: ${dec.resp}\nविवादको विषय: ${dec.subject}\nकानूनी आधार: ${dec.act} | ${dec.rule}\nनिर्णय: ${dec.decision}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    onSelectTopic('ALL');
    setOutcomeFilter('ALL');
    setPartyQuery('');
    onGlobalSearchChange('');
    setVisibleCount(20);
  };

  const getOutcomeDotClass = (cat: EnrichedPprcDecision['outcomeCategory']) => {
    switch (cat) {
      case 'बदर / पुनर्मूल्याङ्कन':
        return 'bg-emerald-600';
      case 'निवेदन खारेज':
        return 'bg-rose-600';
      case 'दरपीठ':
        return 'bg-amber-500';
      default:
        return 'bg-blue-600';
    }
  };

  const getOutcomeTextClass = (cat: EnrichedPprcDecision['outcomeCategory']) => {
    switch (cat) {
      case 'बदर / पुनर्मूल्याङ्कन':
        return 'text-emerald-800';
      case 'निवेदन खारेज':
        return 'text-rose-800';
      case 'दरपीठ':
        return 'text-amber-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) का निर्णय तथा नजिरहरू
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              खरिद विवादमा बोलपत्रदाताले दायर गरेका पुनरावलोकन निवेदन, प्रयोग भएका ऐन/नियम र PPRC ले स्थापित गरेका नजिरहरू
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
            <span>
              कुल निर्णय: <strong className="text-slate-900">{decisions.length}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              छानिएका: <strong className="text-indigo-700">{filteredDecisions.length}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Primary keyword search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => {
                onGlobalSearchChange(e.target.value);
                setVisibleCount(20);
              }}
              placeholder="विवादको विषय, दफा, नियम वा निर्णयको व्यहोरा खोज्नुहोस्..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          {/* Applicant or Respondent search */}
          <div className="md:col-span-4 relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={partyQuery}
              onChange={(e) => {
                setPartyQuery(e.target.value);
                setVisibleCount(20);
              }}
              placeholder="निवेदक कम्पनी वा विपक्षी सार्वजनिक निकायको नाम..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          {/* Topic dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedTopic}
              onChange={(e) => {
                onSelectTopic(e.target.value as TopicCategory | 'ALL');
                setVisibleCount(20);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
            >
              <option value="ALL">सबै विवादका विषयहरू ({decisions.length})</option>
              {TOPIC_CATEGORIES.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Outcome Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" /> निर्णयको परिणाम:
            </span>
            {OUTCOME_FILTERS.map((item) => {
              const active = outcomeFilter === item.value;
              const count = outcomeCounts[item.value];
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setOutcomeFilter(item.value);
                    setVisibleCount(20);
                  }}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors font-medium ${
                    active
                      ? 'bg-indigo-700 text-white border-indigo-700 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}{' '}
                  <span className="font-mono tabular-nums opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {(selectedTopic !== 'ALL' || outcomeFilter !== 'ALL' || partyQuery || globalSearch) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              फिल्टर हटाउनुहोस्
            </button>
          )}
        </div>
      </div>

      {/* Decisions List */}
      {filteredDecisions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-base font-semibold text-slate-800">
            तपाईंले खोज्नुभएको शर्त अनुसार कुनै PPRC निर्णय फेला परेन।
          </p>
          <p className="text-xs text-slate-500 mt-1">
            कृपया अर्को शब्द प्रयोग गर्नुहोस् वा फिल्टर रिसेट गर्नुहोस्।
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-indigo-700 text-white text-xs font-semibold rounded-md hover:bg-indigo-800"
          >
            सबै निर्णयहरू देखाउनुहोस्
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.slice(0, visibleCount).map((dec) => {
            const isBookmarked = bookmarkedIds.has(dec.id);
            const isCopied = copiedId === dec.id;

            return (
              <article
                key={dec.id}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-400 transition-colors shadow-2xs"
              >
                {/* Top Metadata Row (Zero-pill discipline: semantic dot + text) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-mono font-bold text-indigo-900 tabular-nums">
                      निर्णय नं. #{dec.no}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <span
                        className={`w-2 h-2 rounded-full ${getOutcomeDotClass(
                          dec.outcomeCategory
                        )}`}
                      />
                      <span className={getOutcomeTextClass(dec.outcomeCategory)}>
                        {dec.type}
                      </span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {dec.decisionDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {dec.topics[0] && (
                      <button
                        type="button"
                        onClick={() => onCompareTopic(dec.topics[0])}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                        title="यस विषयमा PPMO का रायहरूसँग तुलना गर्नुहोस्"
                      >
                        <span>{dec.topics[0]}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(dec)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                      title="निर्णय प्रतिलिपि (Copy) गर्नुहोस्"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(dec.id)}
                      className={`p-1.5 rounded transition-colors ${
                        isBookmarked
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="बुकमार्क गर्नुहोस्"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Parties Row: Applicant vs Respondent */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">निवेदक (बोलपत्रदाता): </span>
                    <span className="font-semibold text-slate-900">{dec.app}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">विपक्षी (सार्वजनिक निकाय): </span>
                    <span className="font-semibold text-slate-900">{dec.resp}</span>
                  </div>
                </div>

                {/* Main Dispute & PPRC Ruling Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3.5">
                  {/* Left: Dispute Subject & Legal Basis */}
                  <div className="lg:col-span-5 bg-slate-50/80 rounded-md p-3.5 border-l-2 border-slate-400 space-y-2.5">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        १. विवादको विषय र मुख्य दाबी
                      </div>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {dec.subject}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1">
                      <div>
                        <span className="font-semibold text-slate-700">प्रयोग भएका दफा/नियम: </span>
                        <span className="text-slate-600">
                          {dec.act !== '—' ? `ऐन: ${dec.act}` : ''}{' '}
                          {dec.rule !== '—' ? `| नियम: ${dec.rule}` : ''}
                        </span>
                      </div>
                      {dec.use && dec.use !== '—' && (
                        <div>
                          <span className="font-semibold text-slate-700">प्रयोगको सन्दर्भ: </span>
                          <span className="text-slate-600">{dec.use}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: PPRC Decision */}
                  <div className="lg:col-span-7 bg-indigo-50/35 rounded-md p-3.5 border-l-2 border-indigo-600">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-1">
                      २. सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) को निर्णय र नजिर
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {dec.decision}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      विषयगत क्षेत्र: <strong className="text-slate-700">{dec.topics.join(', ')}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInspectDecision(dec)}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    सम्बन्धित PPMO रायहरूसँग तुलना हेर्नुहोस् →
                  </button>
                </div>
              </article>
            );
          })}

          {filteredDecisions.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 25)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-md shadow-2xs transition-colors"
              >
                थप निर्णयहरू देखाउनुहोस् ({filteredDecisions.length - visibleCount} बाँकी)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
