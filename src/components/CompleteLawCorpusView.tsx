import React, { useRef, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  Scale, 
  ShieldAlert, 
  Lightbulb, 
  Layers, 
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';
import { ACT_CHAPTERS } from '../data/completeLawData';
import { RULES_BY_ACT_PROVISION } from '../data/lawProvisionIndex';
import {
  ACT_PROVISION_TEXT,
  RULE_PROVISION_TEXT,
} from '../data/lawProvisionText';

type LawType = 'act' | 'rules';

const normalizeProvisionNumber = (number: string) =>
  number.replace(/[०-९]/g, (digit) => String('०१२३४५६७८९'.indexOf(digit)));
const getProvisionText = (text: Record<string, string>, number: string) =>
  text[number] ??
  Object.entries(text).find(
    ([provisionNumber]) =>
      normalizeProvisionNumber(provisionNumber) === normalizeProvisionNumber(number)
  )?.[1];
const formatProvisionNumber = (number: string) =>
  number.replace(/[0-9]/g, (digit) => '०१२३४५६७८९'[Number(digit)]);
const getProvisions = (text: Record<string, string>) =>
  Object.keys(text)
    .map((number) => ({ number }))
    .sort((left, right) =>
      normalizeProvisionNumber(left.number).localeCompare(
        normalizeProvisionNumber(right.number),
        'ne',
        { numeric: true }
      )
    );

const ACT_PROVISIONS = getProvisions(ACT_PROVISION_TEXT);
const RULE_PROVISIONS = getProvisions(RULE_PROVISION_TEXT);

export const CompleteLawCorpusView: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [activeLaw, setActiveLaw] = useState<LawType>('act');
  const [selectedSourceNumber, setSelectedSourceNumber] = useState<string>(ACT_PROVISIONS[0].number);
  const provisionViewRef = useRef<HTMLDivElement>(null);

  // Collect all unique tags
  const allTags = Array.from(
    new Set(ACT_CHAPTERS.flatMap((ch) => ch.sections.flatMap((s) => s.tags)))
  );

  const provisions = activeLaw === 'act' ? ACT_PROVISIONS : RULE_PROVISIONS;
  const selectedSource = provisions.find(
    (provision) => normalizeProvisionNumber(provision.number) === normalizeProvisionNumber(selectedSourceNumber)
  ) ?? provisions[0];
  const selectedRelatedRules = activeLaw === 'act'
    ? RULES_BY_ACT_PROVISION[normalizeProvisionNumber(selectedSource.number)] ?? []
    : [];
  const selectedProvisionText = getProvisionText(
    activeLaw === 'act' ? ACT_PROVISION_TEXT : RULE_PROVISION_TEXT,
    selectedSource.number
  );
  const filteredProvisions = provisions.filter((provision) => {
    if (!searchQuery.trim()) return true;
    const query = normalizeProvisionNumber(searchQuery.trim().replace(/^(दफा|नियम)\s*/, ''));
    return normalizeProvisionNumber(provision.number).includes(query);
  });
  const selectLaw = (law: LawType) => {
    setActiveLaw(law);
    setSelectedSourceNumber((law === 'act' ? ACT_PROVISIONS : RULE_PROVISIONS)[0].number);
  };

  const openRuleProvision = (number: string) => {
    setActiveLaw('rules');
    setSelectedSourceNumber(number);
    provisionViewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredChapters = ACT_CHAPTERS.map((ch) => {
    if (selectedChapterId !== 'all' && ch.id !== selectedChapterId) {
      return null;
    }

    const matchedSections = ch.sections.filter((sec) => {
      if (activeTag !== 'all' && !sec.tags.includes(activeTag)) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        sec.sectionNo.toLowerCase().includes(q) ||
        sec.title.toLowerCase().includes(q) ||
        sec.officialSummary.toLowerCase().includes(q) ||
        sec.simpleExplanation.toLowerCase().includes(q) ||
        sec.complianceRule.toLowerCase().includes(q) ||
        sec.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    if (matchedSections.length === 0) return null;

    return {
      ...ch,
      sections: matchedSections,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            <span>सार्वजनिक खरिद ऐन तथा नियमावलीको पूर्ण कानुनी संग्रह</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            ऐनका दफा र नियमावलीका नियम
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            ऐनका सबै दफा र नियमावलीका सबै नियम पेजमै पढ्नुहोस्। सम्बन्धित दफाबाट नियमावलीको व्यवस्था सिधै खोल्न सकिन्छ।
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="दफा, नियम वा विषय खोज्नुहोस् (उदा: दफा ४क, भेरिएसन)..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-red-600 text-slate-900"
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

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="कानुनी स्रोत छान्नुहोस्">
        <button
          type="button"
          role="tab"
          aria-selected={activeLaw === 'act'}
          onClick={() => selectLaw('act')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeLaw === 'act'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ऐनका सबै दफा ({ACT_PROVISIONS.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeLaw === 'rules'}
          onClick={() => selectLaw('rules')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeLaw === 'rules'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          नियमावलीका सबै नियम ({RULE_PROVISIONS.length})
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeLaw === 'act' ? 'ऐनका दफा' : 'नियमावलीका नियम'} को सूची
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                व्यवस्था छान्दा त्यसको पूरा पाठ यही पेजमा देखिन्छ।
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {activeLaw === 'act' ? 'सार्वजनिक खरिद ऐन, २०६३' : 'सार्वजनिक खरिद नियमावली, २०६४'}
            </span>
          </div>
          <div className="mt-4 max-h-44 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {filteredProvisions.map((provision) => {
                const isSelected =
                  normalizeProvisionNumber(provision.number) === normalizeProvisionNumber(selectedSource.number);
                return (
                  <button
                    key={provision.number}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedSourceNumber(provision.number);
                      provisionViewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-red-700 border-red-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-800'
                    }`}
                  >
                    {activeLaw === 'act' ? 'दफा' : 'नियम'} {formatProvisionNumber(provision.number)}
                  </button>
                );
              })}
              {filteredProvisions.length === 0 && (
                <p className="text-xs text-slate-500 py-2">खोजसँग मिल्ने व्यवस्था भेटिएन।</p>
              )}
            </div>
          </div>
        </div>
        <div ref={provisionViewRef} className="scroll-mt-4 bg-slate-100 p-2 sm:p-3">
          <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {activeLaw === 'act' ? 'दफा' : 'नियम'} {formatProvisionNumber(selectedSource.number)}
              </h4>
              <span className="text-xs text-slate-500">
                {activeLaw === 'act' ? 'ऐनको व्यवस्था' : 'नियमावलीको व्यवस्था'}
              </span>
            </div>
            {selectedProvisionText ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-800">
                {selectedProvisionText}
              </p>
            ) : (
              <p role="alert" className="text-sm text-red-700">
                यस व्यवस्थाको पाठ उपलब्ध भएन।
              </p>
            )}
          </article>
          {selectedRelatedRules.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <span className="text-xs font-semibold text-slate-700">नियमावलीमा भएको व्यवस्था हेर्नुहोस्:</span>
              {selectedRelatedRules.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => openRuleProvision(number)}
                  className="px-2 py-1 rounded-md bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                >
                  नियम {formatProvisionNumber(number)} हेर्नुहोस्
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chapter Filter Tabs */}
      {activeLaw === 'act' && (
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <button
          onClick={() => setSelectedChapterId('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedChapterId === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          सबै परिच्छेदहरू
        </button>
        {ACT_CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChapterId(ch.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedChapterId === ch.id
                ? 'bg-red-700 text-white font-semibold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {ch.chapterTitleNepali.split(':')[0]} ({ch.sectionsCount})
          </button>
        ))}
      </div>
      )}

      {/* Quick Tag Pills */}
      {activeLaw === 'act' && (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
        <span className="text-slate-500 font-medium whitespace-nowrap mr-1">मुख्य विषयवस्तु:</span>
        <button
          onClick={() => setActiveTag('all')}
          className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap ${
            activeTag === 'all' ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          सबै
        </button>
        {allTags.slice(0, 12).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap ${
              activeTag === t ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            #{t}
          </button>
        ))}
      </div>
      )}

      {/* Chapters & Sections List */}
      {activeLaw === 'act' && <div className="space-y-6">
        {filteredChapters.map((ch: any) => (
          <div key={ch.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Chapter Header */}
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-sm">
                    {ch.sectionsCount}
                  </span>
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    {ch.chapterTitleEnglish}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  {ch.chapterTitleNepali}
                </h3>
              </div>
              <p className="text-xs text-slate-600 sm:max-w-md sm:text-right">
                {ch.summary}
              </p>
            </div>

            {/* Sections in this chapter */}
            <div className="divide-y divide-slate-100">
              {ch.sections.map((sec: any) => (
                <div key={sec.sectionNo} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors text-left space-y-3">
                  {/* Title & Section Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-sm font-mono">
                          {sec.sectionNo}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {sec.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap shrink-0">
                      {sec.tags.map((t: string) => (
                        <span key={t} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1. Official Summary */}
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">कानुनी व्यवस्था (Legal Provision):</span>
                    {sec.officialSummary}
                  </div>

                  {/* 2. Plain Language Breakdown (सरल व्याख्या) */}
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs sm:text-sm text-blue-950 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-900 block mb-0.5">सरल जानकारी (What this means in plain words):</span>
                      <p className="leading-relaxed">{sec.simpleExplanation}</p>
                    </div>
                  </div>

                  {/* 3. Mandatory Rule / Caution */}
                  <div className="p-3 bg-red-50/40 rounded-xl border border-red-100 text-xs text-red-950 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-red-900 block mb-0.5">अनिवार्य पालना गर्नुपर्ने कानुनी सर्त (Compliance Rule):</span>
                      <p>{sec.complianceRule}</p>
                    </div>
                  </div>

                  {sec.practicalTip && (
                    <div className="text-[11px] text-slate-600 italic pl-1 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">सुझाव:</span>
                      <span>{sec.practicalTip}</span>
                    </div>
                  )}

                  {(() => {
                    const actNumbers = sec.sectionNo.match(/[०-९0-9]+[क-ह]?/g) ?? [];
                    const relatedRules = Array.from(new Set<string>(
                      actNumbers.flatMap((number: string) =>
                        RULES_BY_ACT_PROVISION[normalizeProvisionNumber(number)] ?? []
                      )
                    ));
                    if (relatedRules.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs font-semibold text-slate-600">नियमावलीको व्यवस्था हेर्नुहोस्:</span>
                        {relatedRules.map((number) => (
                          <button
                            key={number}
                            type="button"
                            onClick={() => openRuleProvision(number)}
                            className="px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                          >
                            नियम {formatProvisionNumber(number)} हेर्नुहोस्
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
};
