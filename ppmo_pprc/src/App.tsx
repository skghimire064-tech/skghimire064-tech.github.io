/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scale,
  FileText,
  Columns,
  BookOpen,
  Search,
  Bookmark,
  Printer,
  Download,
  Menu,
  X,
  Trash2,
} from 'lucide-react';
import {
  enrichedPpmoOpinions,
  enrichedPprcDecisions,
  TOPIC_CATEGORIES,
  TopicCategory,
  EnrichedPpmoOpinion,
  EnrichedPprcDecision,
  rawPpmoOpinions,
  rawPprcDecisions,
} from './data/procurementGuideData';
import { TopicComparisonView } from './components/TopicComparisonView';
import { PpmoOpinionsView } from './components/PpmoOpinionsView';
import { PprcDecisionsView } from './components/PprcDecisionsView';
import { LegalCrossReferenceView } from './components/LegalCrossReferenceView';
import { CaseDetailDrawer } from './components/CaseDetailDrawer';

type ActiveTab = 'COMPARISON' | 'PPMO_OPINIONS' | 'PPRC_DECISIONS' | 'LEGAL_REFERENCE';

export default function App({ embedded = false }: { embedded?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('COMPARISON');
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory | 'ALL'>('ALL');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ppmo_pprc_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [showBookmarksModal, setShowBookmarksModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Detail Drawer state
  const [inspectedOpinion, setInspectedOpinion] = useState<EnrichedPpmoOpinion | null>(null);
  const [inspectedDecision, setInspectedDecision] = useState<EnrichedPprcDecision | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ppmo_pprc_bookmarks', JSON.stringify(Array.from(bookmarkedIds)));
    } catch {
      // ignore storage errors
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Topic counts for sidebar navigation
  const topicCounts = useMemo(() => {
    const map = new Map<TopicCategory, { ops: number; pp: number }>();
    TOPIC_CATEGORIES.forEach((t) => map.set(t, { ops: 0, pp: 0 }));

    enrichedPpmoOpinions.forEach((op) => {
      op.topics.forEach((t) => {
        const entry = map.get(t);
        if (entry) entry.ops += 1;
      });
    });

    enrichedPprcDecisions.forEach((dec) => {
      dec.topics.forEach((t) => {
        const entry = map.get(t);
        if (entry) entry.pp += 1;
      });
    });

    return map;
  }, []);

  const bookmarkedOpinions = useMemo(
    () => enrichedPpmoOpinions.filter((op) => bookmarkedIds.has(op.id)),
    [bookmarkedIds]
  );

  const bookmarkedDecisions = useMemo(
    () => enrichedPprcDecisions.filter((dec) => bookmarkedIds.has(dec.id)),
    [bookmarkedIds]
  );

  const handleDownloadJson = () => {
    const payload = JSON.stringify(
      { ops: rawPpmoOpinions, pp: rawPprcDecisions },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'procurement-guide-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompareTopic = (topic: TopicCategory) => {
    setSelectedTopic(topic);
    setActiveTab('COMPARISON');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-[#F8FAFC] text-[#0F172A] flex flex-col`}>
      {/* Sticky 56px Top Bar (3-Zone Contract) */}
      {!embedded && (
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 no-print">
        {/* Zone 1: Brand & Mobile Menu Trigger */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="मेनु खोल्नुहोस्"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              खरिद
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 truncate">
                सार्वजनिक खरिद राय तथा पुनरावलोकन निर्णय दिग्दर्शन
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                PPMO राय परामर्श ({enrichedPpmoOpinions.length}) र PPRC निर्णय नजिर ({enrichedPprcDecisions.length}) को एकीकृत विश्लेषण
              </p>
            </div>
          </div>
        </div>

        {/* Zone 2: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="खरिद विषय, दफा, नियम, निकाय वा मुद्दा खोज्नुहोस् (Ctrl+K)..."
              className="w-full pl-9 pr-14 py-1.5 bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-blue-600 rounded-md text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {globalSearch ? (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 hover:text-slate-800"
              >
                हटाउनुहोस्
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                Ctrl+K
              </kbd>
            )}
          </div>
        </div>

        {/* Zone 3: Global Actions (Bookmarks, JSON Download, Print) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowBookmarksModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
              bookmarkedIds.size > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                bookmarkedIds.size > 0 ? 'fill-amber-500 text-amber-600' : 'text-slate-500'
              }`}
            />
            <span className="hidden sm:inline">संग्रहित</span>
            <span className="font-mono tabular-nums">({bookmarkedIds.size})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            title="procurement-guide-data.json डाउनलोड गर्नुहोस्"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline">JSON डाटा</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            title="यो पृष्ठ प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline">प्रिन्ट</span>
          </button>
        </div>
      </header>
      )}

      {/* Main Workspace Container */}
      <div className="flex-1 flex relative">
        {/* Left Navigation Sidebar (260px fixed on desktop) */}
        {!embedded && (
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-14 left-0 z-40 block' : 'hidden'
          } lg:block w-64 bg-white border-r border-slate-200 shrink-0 no-print overflow-y-auto custom-scrollbar`}
        >
          <div className="p-4 space-y-6">
            {/* Primary View Modes */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5 mb-2">
                मुख्य अध्ययन मोडहरू
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('COMPARISON');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'COMPARISON'
                      ? 'bg-blue-50 text-blue-800 border-l-3 border-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Columns className="w-4 h-4 shrink-0" />
                    <span>विषयगत तुलना (PPMO र PPRC)</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('PPMO_OPINIONS');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'PPMO_OPINIONS'
                      ? 'bg-blue-50 text-blue-800 border-l-3 border-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>PPMO का राय परामर्श</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {enrichedPpmoOpinions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('PPRC_DECISIONS');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'PPRC_DECISIONS'
                      ? 'bg-indigo-50 text-indigo-800 border-l-3 border-indigo-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Scale className="w-4 h-4 shrink-0" />
                    <span>PPRC पुनरावलोकन निर्णय</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {enrichedPprcDecisions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LEGAL_REFERENCE');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === 'LEGAL_REFERENCE'
                      ? 'bg-blue-50 text-blue-800 border-l-3 border-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>दफावार खोज र खरिद विधि</span>
                  </span>
                </button>
              </nav>
            </div>

            {/* Topic Filter Directory */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between px-2.5 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  खरिदका १० मुख्य विषयहरू
                </span>
                {selectedTopic !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedTopic('ALL')}
                    className="text-[11px] text-blue-700 hover:underline font-medium"
                  >
                    सबै हेर्नुहोस्
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic('ALL');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex items-center justify-between ${
                    selectedTopic === 'ALL'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>सबै खरिद विषयहरू</span>
                  <span className="font-mono text-[10px] opacity-80 tabular-nums">
                    {enrichedPpmoOpinions.length} / {enrichedPprcDecisions.length}
                  </span>
                </button>

                {TOPIC_CATEGORIES.map((topic) => {
                  const counts = topicCounts.get(topic) || { ops: 0, pp: 0 };
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(topic);
                        if (activeTab === 'LEGAL_REFERENCE') {
                          setActiveTab('COMPARISON');
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{topic}</span>
                      <span
                        className={`font-mono text-[10px] shrink-0 tabular-nums ${
                          active ? 'text-slate-200' : 'text-slate-400'
                        }`}
                        title={`PPMO राय: ${counts.ops} | PPRC निर्णय: ${counts.pp}`}
                      >
                        {counts.ops}/{counts.pp}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 px-2.5 mt-2">
                * दायाँको अंकले (PPMO राय संख्या / PPRC निर्णय संख्या) जनाउँछ।
              </p>
            </div>
          </div>
        </aside>
        )}

        {/* Main Content Canvas */}
        <main className={embedded ? 'flex-1 min-w-0 w-full' : 'flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full'}>
          {embedded && (
            <nav aria-label="PPMO तथा PPRC सामग्री" className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3 no-print">
              {([
                ['COMPARISON', 'विषयगत तुलना'],
                ['PPMO_OPINIONS', 'PPMO राय परामर्श'],
                ['PPRC_DECISIONS', 'PPRC निर्णय'],
                ['LEGAL_REFERENCE', 'दफावार खोज'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-current={activeTab === tab ? 'page' : undefined}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {label}
                  {tab === 'PPMO_OPINIONS' && <span className="ml-1.5 opacity-80">({enrichedPpmoOpinions.length})</span>}
                  {tab === 'PPRC_DECISIONS' && <span className="ml-1.5 opacity-80">({enrichedPprcDecisions.length})</span>}
                </button>
              ))}
            </nav>
          )}
          {activeTab === 'COMPARISON' && (
            <TopicComparisonView
              opinions={enrichedPpmoOpinions}
              decisions={enrichedPprcDecisions}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              onInspectOpinion={(op) => {
                setInspectedDecision(null);
                setInspectedOpinion(op);
              }}
              onInspectDecision={(dec) => {
                setInspectedOpinion(null);
                setInspectedDecision(dec);
              }}
            />
          )}

          {activeTab === 'PPMO_OPINIONS' && (
            <PpmoOpinionsView
              opinions={enrichedPpmoOpinions}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              onInspectOpinion={(op) => {
                setInspectedDecision(null);
                setInspectedOpinion(op);
              }}
              onCompareTopic={handleCompareTopic}
            />
          )}

          {activeTab === 'PPRC_DECISIONS' && (
            <PprcDecisionsView
              decisions={enrichedPprcDecisions}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              onInspectDecision={(dec) => {
                setInspectedOpinion(null);
                setInspectedDecision(dec);
              }}
              onCompareTopic={handleCompareTopic}
            />
          )}

          {activeTab === 'LEGAL_REFERENCE' && (
            <LegalCrossReferenceView
              opinions={enrichedPpmoOpinions}
              decisions={enrichedPprcDecisions}
              onInspectOpinion={(op) => {
                setInspectedDecision(null);
                setInspectedOpinion(op);
              }}
              onInspectDecision={(dec) => {
                setInspectedOpinion(null);
                setInspectedDecision(dec);
              }}
              onCompareTopic={handleCompareTopic}
            />
          )}
        </main>
      </div>

      {/* Case / Opinion Detail Slide-over Drawer */}
      <CaseDetailDrawer
        selectedOpinion={inspectedOpinion}
        selectedDecision={inspectedDecision}
        allOpinions={enrichedPpmoOpinions}
        allDecisions={enrichedPprcDecisions}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={toggleBookmark}
        onClose={() => {
          setInspectedOpinion(null);
          setInspectedDecision(null);
        }}
        onSelectOpinion={(op) => {
          setInspectedDecision(null);
          setInspectedOpinion(op);
        }}
        onSelectDecision={(dec) => {
          setInspectedOpinion(null);
          setInspectedDecision(dec);
        }}
        onJumpToTopic={handleCompareTopic}
      />

      {/* Saved Bookmarks Modal */}
      {showBookmarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h3 className="text-base font-bold">
                  तपाईंले बुकमार्क गर्नुभएका PPMO राय र PPRC निर्णयहरू ({bookmarkedIds.size})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {bookmarkedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setBookmarkedIds(new Set())}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>सबै हटाउनुहोस्</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBookmarksModal(false)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {bookmarkedIds.size === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    हालसम्म कुनै पनि राय वा निर्णय बुकमार्क गरिएको छैन।
                  </p>
                  <p className="text-xs text-slate-500">
                    कुनै पनि PPMO राय वा PPRC निर्णयको माथि दायाँपट्टि रहेको बुकमार्क आइकनमा क्लिक गरी यहाँ संग्रह गर्न सक्नुहुन्छ।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bookmarked PPMO Opinions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-blue-900 pb-2 border-b border-blue-200">
                      संग्रहित PPMO रायहरू ({bookmarkedOpinions.length})
                    </h4>
                    {bookmarkedOpinions.length === 0 ? (
                      <p className="text-xs text-slate-500">कुनै PPMO राय संग्रहित छैन।</p>
                    ) : (
                      bookmarkedOpinions.map((op) => (
                        <div
                          key={op.id}
                          className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-slate-500">
                            <span className="font-bold text-blue-800">राय #{op.no}</span>
                            <span>{op.date}</span>
                          </div>
                          <p className="font-semibold text-slate-900">{op.cleanSubject}</p>
                          <p className="text-slate-700 line-clamp-3">{op.opinion}</p>
                          <div className="flex justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => toggleBookmark(op.id)}
                              className="text-rose-600 hover:underline"
                            >
                              हटाउनुहोस्
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowBookmarksModal(false);
                                setInspectedDecision(null);
                                setInspectedOpinion(op);
                              }}
                              className="text-blue-700 font-semibold hover:underline"
                            >
                              पूरा हेर्नुहोस् →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bookmarked PPRC Decisions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-indigo-900 pb-2 border-b border-indigo-200">
                      संग्रहित PPRC निर्णयहरू ({bookmarkedDecisions.length})
                    </h4>
                    {bookmarkedDecisions.length === 0 ? (
                      <p className="text-xs text-slate-500">कुनै PPRC निर्णय संग्रहित छैन।</p>
                    ) : (
                      bookmarkedDecisions.map((dec) => (
                        <div
                          key={dec.id}
                          className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-indigo-900">
                              निर्णय #{dec.no}
                            </span>
                            <span className="font-semibold text-slate-700">{dec.type}</span>
                          </div>
                          <p className="font-semibold text-slate-900">{dec.subject}</p>
                          <p className="text-slate-700 line-clamp-3">{dec.decision}</p>
                          <div className="flex justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => toggleBookmark(dec.id)}
                              className="text-rose-600 hover:underline"
                            >
                              हटाउनुहोस्
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowBookmarksModal(false);
                                setInspectedOpinion(null);
                                setInspectedDecision(dec);
                              }}
                              className="text-indigo-700 font-semibold hover:underline"
                            >
                              पूरा हेर्नुहोस् →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
