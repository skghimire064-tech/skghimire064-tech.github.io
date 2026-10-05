import React, { useState, useMemo } from 'react';
import {
  Search,
  Bookmark,
  Copy,
  Check,
  Building2,
  Calendar,
  BookOpen,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import {
  EnrichedPpmoOpinion,
  TOPIC_CATEGORIES,
  TopicCategory,
} from '../data/procurementGuideData';

interface PpmoOpinionsViewProps {
  opinions: EnrichedPpmoOpinion[];
  selectedTopic: TopicCategory | 'ALL';
  onSelectTopic: (topic: TopicCategory | 'ALL') => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onInspectOpinion: (op: EnrichedPpmoOpinion) => void;
  onCompareTopic: (topic: TopicCategory) => void;
}

export const PpmoOpinionsView: React.FC<PpmoOpinionsViewProps> = ({
  opinions,
  selectedTopic,
  onSelectTopic,
  globalSearch,
  onGlobalSearchChange,
  bookmarkedIds,
  onToggleBookmark,
  onInspectOpinion,
  onCompareTopic,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [entityQuery, setEntityQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  const yearFilters = useMemo(
    () => [
      'ALL',
      ...Array.from(new Set(opinions.map((opinion) => opinion.year))).sort().reverse(),
    ],
    [opinions]
  );

  const filteredOpinions = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    const eq = entityQuery.trim().toLowerCase();

    return opinions.filter((op) => {
      if (selectedTopic !== 'ALL' && !op.topics.includes(selectedTopic)) {
        return false;
      }
      if (selectedYear !== 'ALL' && op.year !== selectedYear) {
        return false;
      }
      if (eq && !op.requestingEntity.toLowerCase().includes(eq) && !op.subject.toLowerCase().includes(eq)) {
        return false;
      }
      if (!q) return true;
      return (
        op.subject.toLowerCase().includes(q) ||
        op.opinion.toLowerCase().includes(q) ||
        op.requestingEntity.toLowerCase().includes(q) ||
        op.date.toLowerCase().includes(q) ||
        String(op.no).includes(q) ||
        op.actRefs.some((r) => r.toLowerCase().includes(q)) ||
        op.ruleRefs.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [opinions, selectedTopic, selectedYear, entityQuery, globalSearch]);

  const handleCopy = (op: EnrichedPpmoOpinion) => {
    const text = `[PPMO राय परामर्श #${op.no} | मिति: ${op.date}]\nमाग गर्ने निकाय: ${op.requestingEntity}\nमाग भएको विषय: ${op.cleanSubject}\nPPMO को राय: ${op.opinion}`;
    navigator.clipboard.writeText(text);
    setCopiedId(op.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    onSelectTopic('ALL');
    setSelectedYear('ALL');
    setEntityQuery('');
    onGlobalSearchChange('');
    setVisibleCount(20);
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) का राय परामर्शहरू
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              विभिन्न सार्वजनिक निकायहरूले खरिद कारबाहीका द्विविधामा माग गरेका राय र PPMO ले दिएका आधिकारिक जवाफहरूको पूर्ण विवरण
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
            <span>
              कुल राय: <strong className="text-slate-900">{opinions.length}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              छानिएका: <strong className="text-blue-700">{filteredOpinions.length}</strong>
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
              placeholder="विषय, रायको व्यहोरा, दफा वा नियम खोज्नुहोस्..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          {/* Requesting Entity search */}
          <div className="md:col-span-4 relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={entityQuery}
              onChange={(e) => {
                setEntityQuery(e.target.value);
                setVisibleCount(20);
              }}
              placeholder="माग गर्ने कार्यालय/निकायको नाम (जस्तै: सडक, नगरपालिका, अस्पताल)..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
            >
              <option value="ALL">सबै खरिद विषयहरू ({opinions.length})</option>
              {TOPIC_CATEGORIES.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> वर्ष अनुसार:
            </span>
            {yearFilters.map((yr) => {
              const active = selectedYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setSelectedYear(yr);
                    setVisibleCount(20);
                  }}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    active
                      ? 'bg-blue-700 text-white border-blue-700 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {yr === 'ALL' ? 'सबै वर्ष' : `वि.सं. ${yr}`}
                </button>
              );
            })}
          </div>

          {(selectedTopic !== 'ALL' || selectedYear !== 'ALL' || entityQuery || globalSearch) && (
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

      {/* Results List */}
      {filteredOpinions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-base font-semibold text-slate-800">
            तपाईंले खोज्नुभएको शर्त अनुसार कुनै PPMO राय फेला परेन।
          </p>
          <p className="text-xs text-slate-500 mt-1">
            कृपया अर्को शब्द प्रयोग गर्नुहोस् वा फिल्टर रिसेट गर्नुहोस्।
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-md hover:bg-blue-800"
          >
            सबै रायहरू देखाउनुहोस्
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOpinions.slice(0, visibleCount).map((op) => {
            const isBookmarked = bookmarkedIds.has(op.id);
            const isCopied = copiedId === op.id;

            return (
              <article
                key={op.id}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-400 transition-colors shadow-2xs"
              >
                {/* Header metadata line */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-mono font-bold text-blue-800 tabular-nums">
                      राय क्र.सं. #{op.no}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      मिति: {op.date}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800">
                      माग गर्ने निकाय: {op.requestingEntity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {op.topics[0] && (
                      <button
                        type="button"
                        onClick={() => onCompareTopic(op.topics[0])}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                        title="यस विषयमा PPRC का निर्णयहरूसँग तुलना गर्नुहोस्"
                      >
                        <span>{op.topics[0]}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(op)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                      title="राय प्रतिलिपि (Copy) गर्नुहोस्"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleBookmark(op.id)}
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

                {/* Two-column or stacked Question -> Opinion layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3.5">
                  {/* Left: Question asked */}
                  <div className="lg:col-span-5 bg-slate-50/80 rounded-md p-3.5 border-l-2 border-slate-400">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      १. माग भएको विषय / खरिद द्विविधा
                    </div>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {op.cleanSubject}
                    </p>
                  </div>

                  {/* Right: PPMO Opinion given */}
                  <div className="lg:col-span-7 bg-blue-50/35 rounded-md p-3.5 border-l-2 border-blue-600">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                      २. सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) को राय
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {op.opinion}
                    </p>
                  </div>
                </div>

                {/* Footer Legal Refs & Inspect Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {(op.actRefs.length > 0 || op.ruleRefs.length > 0) ? (
                      <>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          कानूनी आधार:
                        </span>
                        <span className="text-slate-600">
                          {[...op.actRefs, ...op.ruleRefs].join(' · ')}
                        </span>
                      </>
                    ) : (
                      <span>सार्वजनिक खरिद ऐन, २०६३ तथा नियमावली, २०६४</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onInspectOpinion(op)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    सम्बन्धित PPRC निर्णयहरूसँग तुलना हेर्नुहोस् →
                  </button>
                </div>
              </article>
            );
          })}

          {filteredOpinions.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 25)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-md shadow-2xs transition-colors"
              >
                थप रायहरू देखाउनुहोस् ({filteredOpinions.length - visibleCount} बाँकी)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
