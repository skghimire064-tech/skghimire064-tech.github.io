import React, { useMemo, useState } from 'react';
import {
  X,
  FileText,
  Scale,
  Copy,
  Check,
  Bookmark,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  EnrichedPpmoOpinion,
  EnrichedPprcDecision,
  TopicCategory,
} from '../data/procurementGuideData';

interface CaseDetailDrawerProps {
  selectedOpinion: EnrichedPpmoOpinion | null;
  selectedDecision: EnrichedPprcDecision | null;
  allOpinions: EnrichedPpmoOpinion[];
  allDecisions: EnrichedPprcDecision[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
  onSelectOpinion: (op: EnrichedPpmoOpinion) => void;
  onSelectDecision: (dec: EnrichedPprcDecision) => void;
  onJumpToTopic: (topic: TopicCategory) => void;
}

export const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({
  selectedOpinion,
  selectedDecision,
  allOpinions,
  allDecisions,
  bookmarkedIds,
  onToggleBookmark,
  onClose,
  onSelectOpinion,
  onSelectDecision,
  onJumpToTopic,
}) => {
  const [copied, setCopied] = useState(false);

  const relatedCounterparts = useMemo(() => {
    if (selectedOpinion) {
      const primaryTopic = selectedOpinion.topics[0];
      const actRefs = selectedOpinion.actRefs;
      const ruleRefs = selectedOpinion.ruleRefs;

      const scored = allDecisions
        .map((dec) => {
          let score = 0;
          if (dec.topics.includes(primaryTopic)) score += 3;
          selectedOpinion.topics.forEach((t) => {
            if (dec.topics.includes(t)) score += 2;
          });
          actRefs.forEach((a) => {
            if (dec.act.includes(a) || dec.decision.includes(a)) score += 4;
          });
          ruleRefs.forEach((r) => {
            if (dec.rule.includes(r) || dec.decision.includes(r)) score += 4;
          });
          return { dec, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.dec);

      return { opinions: [] as EnrichedPpmoOpinion[], decisions: scored };
    }

    if (selectedDecision) {
      const primaryTopic = selectedDecision.topics[0];
      const actRefs = selectedDecision.actRefs;
      const ruleRefs = selectedDecision.ruleRefs;

      const scored = allOpinions
        .map((op) => {
          let score = 0;
          if (op.topics.includes(primaryTopic)) score += 3;
          selectedDecision.topics.forEach((t) => {
            if (op.topics.includes(t)) score += 2;
          });
          actRefs.forEach((a) => {
            if (op.opinion.includes(a) || op.subject.includes(a)) score += 4;
          });
          ruleRefs.forEach((r) => {
            if (op.opinion.includes(r) || op.subject.includes(r)) score += 4;
          });
          return { op, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.op);

      return { opinions: scored, decisions: [] as EnrichedPprcDecision[] };
    }

    return { opinions: [], decisions: [] };
  }, [selectedOpinion, selectedDecision, allOpinions, allDecisions]);

  if (!selectedOpinion && !selectedDecision) return null;

  const handleCopyFull = () => {
    if (selectedOpinion) {
      const text = `[PPMO राय परामर्श #${selectedOpinion.no} | मिति: ${selectedOpinion.date}]\nमाग गर्ने निकाय: ${selectedOpinion.requestingEntity}\nमाग भएको विषय: ${selectedOpinion.cleanSubject}\nPPMO को राय: ${selectedOpinion.opinion}`;
      navigator.clipboard.writeText(text);
    } else if (selectedDecision) {
      const text = `[PPRC निर्णय नं. #${selectedDecision.no} | प्रकार: ${selectedDecision.type}]\nनिवेदक: ${selectedDecision.app}\nविपक्षी: ${selectedDecision.resp}\nविवादको विषय: ${selectedDecision.subject}\nकानूनी आधार: ${selectedDecision.act} | ${selectedDecision.rule}\nनिर्णय: ${selectedDecision.decision}`;
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentId = selectedOpinion ? selectedOpinion.id : selectedDecision!.id;
  const isBookmarked = bookmarkedIds.has(currentId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {selectedOpinion ? (
              <>
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
                    सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) राय परामर्श
                  </div>
                  <h3 className="text-base font-bold">
                    राय क्र.सं. #{selectedOpinion.no} · मिति: {selectedOpinion.date}
                  </h3>
                </div>
              </>
            ) : (
              <>
                <Scale className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">
                    सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) निर्णय
                  </div>
                  <h3 className="text-base font-bold">
                    निर्णय नं. #{selectedDecision!.no} · {selectedDecision!.type}
                  </h3>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>प्रतिलिपि भयो</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>उद्धरण कपी</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(currentId)}
              className={`p-2 rounded transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="बुकमार्क गर्नुहोस्"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {selectedOpinion ? (
            /* PPMO Opinion Full View */
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-500 font-medium">माग गर्ने निकाय: </span>
                    <span className="font-bold text-slate-900">
                      {selectedOpinion.requestingEntity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">पत्र/राय मिति: </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedOpinion.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-slate-500 font-medium">विषयगत क्षेत्र:</span>
                  {selectedOpinion.topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        onJumpToTopic(t);
                        onClose();
                      }}
                      className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
                {selectedOpinion.src === 'raya_2080.docx' && (
                  <div className="pt-1 text-[11px] text-slate-500">
                    स्रोत: राय परामर्शहरूको संग्रह (२०८०)
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border-l-4 border-slate-500 p-4 rounded-r-lg space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  १. सार्वजनिक निकायबाट राय माग भएको विषय / प्रश्न
                </div>
                <p className="text-base font-medium text-slate-900 leading-relaxed">
                  {selectedOpinion.cleanSubject}
                </p>
              </div>

              <div className="bg-blue-50/50 border-l-4 border-blue-700 p-5 rounded-r-lg space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  २. सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) ले दिएको राय परामर्श
                </div>
                <p className="text-base text-slate-900 leading-relaxed whitespace-pre-line">
                  {selectedOpinion.opinion}
                </p>
              </div>

              {(selectedOpinion.actRefs.length > 0 || selectedOpinion.ruleRefs.length > 0) && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-4 py-2.5 rounded-md">
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    <strong>उल्लेखित ऐन/नियम:</strong>{' '}
                    {[...selectedOpinion.actRefs, ...selectedOpinion.ruleRefs].join(' · ')}
                  </span>
                </div>
              )}

              {/* Counterpart PPRC Decisions on the same issue */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-700" />
                    यसै विषय र कानूनी दफामा PPRC ले गरेका सम्बन्धित निर्णयहरू
                  </h4>
                  <span className="text-xs text-slate-500">
                    ({relatedCounterparts.decisions.length} सम्बन्धित नजिर)
                  </span>
                </div>

                {relatedCounterparts.decisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-4 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-900">
                        PPRC निर्णय #{dec.no} ({dec.type})
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectDecision(dec)}
                        className="text-indigo-700 font-semibold hover:underline"
                      >
                        यो निर्णय खोल्नुहोस् →
                      </button>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>पक्षहरू:</strong> {dec.app} बनाम {dec.resp}
                    </div>
                    <p className="text-xs font-medium text-slate-900">{dec.subject}</p>
                    <p className="text-xs text-slate-700 bg-indigo-50/40 p-2.5 rounded border-l-2 border-indigo-600">
                      <strong>निर्णयको सार:</strong> {dec.decision}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PPRC Decision Full View */
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block font-medium">
                      निवेदक (पुनरावलोकन माग गर्ने बोलपत्रदाता):
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedDecision!.app}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">
                      विपक्षी (सार्वजनिक निकाय):
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedDecision!.resp}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium">निर्णयको प्रकार: </span>
                    <span className="font-bold text-indigo-900">{selectedDecision!.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">निर्णय मिति: </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedDecision!.decisionDate}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-slate-500 font-medium">विषयगत क्षेत्र:</span>
                  {selectedDecision!.topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        onJumpToTopic(t);
                        onClose();
                      }}
                      className="text-indigo-700 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border-l-4 border-slate-500 p-4 rounded-r-lg space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  १. खरिद विवादको विषय र निवेदकको मुख्य दाबी
                </div>
                <p className="text-base font-medium text-slate-900 leading-relaxed">
                  {selectedDecision!.subject}
                </p>
              </div>

              <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-lg space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800">आकर्षित ऐनको दफा: </span>
                  <span className="text-slate-700">{selectedDecision!.act}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">आकर्षित नियमावलीको नियम: </span>
                  <span className="text-slate-700">{selectedDecision!.rule}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">कानूनी व्यवस्थाको प्रयोग: </span>
                  <span className="text-slate-700">{selectedDecision!.use}</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 border-l-4 border-indigo-700 p-5 rounded-r-lg space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  २. सार्वजनिक खरिद पुनरावलोकन समिति (PPRC) को निर्णय र स्थापित नजिर
                </div>
                <p className="text-base text-slate-900 leading-relaxed whitespace-pre-line">
                  {selectedDecision!.decision}
                </p>
              </div>

              {/* Counterpart PPMO Opinions on the same issue */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    यसै विषयमा सार्वजनिक खरिद अनुगमन कार्यालय (PPMO) ले दिएका सम्बन्धित रायहरू
                  </h4>
                  <span className="text-xs text-slate-500">
                    ({relatedCounterparts.opinions.length} सम्बन्धित राय)
                  </span>
                </div>

                {relatedCounterparts.opinions.map((op) => (
                  <div
                    key={op.id}
                    className="p-4 rounded-lg border border-slate-200 hover:border-blue-400 bg-white transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-800">
                        PPMO राय #{op.no} · मिति: {op.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectOpinion(op)}
                        className="text-blue-700 font-semibold hover:underline"
                      >
                        यो राय खोल्नुहोस् →
                      </button>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>माग गर्ने निकाय:</strong> {op.requestingEntity}
                    </div>
                    <p className="text-xs font-medium text-slate-900">{op.cleanSubject}</p>
                    <p className="text-xs text-slate-700 bg-blue-50/40 p-2.5 rounded border-l-2 border-blue-600">
                      <strong>PPMO को राय:</strong> {op.opinion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
