import React, { useState } from 'react';
import { BookOpen, Search, Filter, Scale, ExternalLink, X, FileText } from 'lucide-react';
import { KEY_LEGAL_CLAUSES } from '../data/procurementData';
import { LegalClause } from '../types/procurement';

export const LegalClausesView: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'act' | 'rule'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = Array.from(
    new Set(KEY_LEGAL_CLAUSES.flatMap((c) => c.tags))
  );

  const filteredClauses = KEY_LEGAL_CLAUSES.filter((c) => {
    if (filterType !== 'all' && c.lawType !== filterType) return false;
    if (selectedTag !== 'all' && !c.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.clauseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            <span>कानुनी व्यवस्था तथा दफाहरू (Legal Clauses Index)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            सार्वजनिक खरिद ऐन, २०६३ र नियमावली, २०६४ का प्रमुख दफाहरू
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            १६औँ संशोधनसहितका प्रमुख दफाहरू तथा नियमहरूको सार, व्याख्या र सान्दर्भिक विषयवस्तुहरूको कानुनी निर्देशिका।
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="दफा वा विषय खोज्नुहोस् (उदा: दफा ४क, भेरिएसन)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Filter Chips & Type Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            सबै ({KEY_LEGAL_CLAUSES.length})
          </button>
          <button
            onClick={() => setFilterType('act')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'act'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ऐनका दफाहरू (PPA)
          </button>
          <button
            onClick={() => setFilterType('rule')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'rule'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            नियमावलीका नियमहरू (PPR)
          </button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            सबै विषय
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedTag === t
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClauses.map((clause) => (
          <div
            key={clause.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm">
                  {clause.clauseNumber}
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {clause.lawType === 'act' ? 'सार्वजनिक खरिद ऐन, २०६३' : 'सार्वजनिक खरिद नियमावली, २०६४'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                {clause.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {clause.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                {clause.tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-sm cursor-pointer"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <span className="text-[11px] text-amber-700 font-medium font-mono">
                अख्तियारी / बाध्यकारी
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
