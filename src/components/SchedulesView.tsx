import React, { useState } from 'react';
import { ClipboardList, Printer, Copy, Check, FileText } from 'lucide-react';
import { OFFICIAL_SCHEDULES } from '../data/procurementData';
import { ScheduleItem } from '../types/procurement';

export const SchedulesView: React.FC = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem>(OFFICIAL_SCHEDULES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${selectedSchedule.scheduleNumber}: ${selectedSchedule.title}\n${selectedSchedule.ruleReference}\n\nविवरण:\n${selectedSchedule.fields.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wide">
            <ClipboardList className="w-4 h-4" />
            <span>सार्वजनिक खरिद नियमावलीका अनुसूचीहरू</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            आधिकारिक अनुसूची तथा फाराम संरचना (Official Schedules)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            निर्माण तथा परामर्श सेवाको लागत अनुमान ढाँचा, मौजुदा सूची फाराम, खरिद सम्झौताका प्रकारहरू तथा कार्यस्थल नागरिक सूचना पाटीको वैधानिक संरचना।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कपी गरियो' : 'विवरण कपी'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Schedule Nav (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {OFFICIAL_SCHEDULES.map((sch) => {
            const isSelected = selectedSchedule.id === sch.id;
            return (
              <div
                key={sch.id}
                onClick={() => setSelectedSchedule(sch)}
                className={`p-4 transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-50/70 border-l-4 border-l-blue-700'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded-sm">
                    {sch.scheduleNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{sch.ruleReference}</span>
                </div>
                <h4 className={`text-sm font-bold mt-1 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                  {sch.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {sch.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Schedule Details (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <span className="bg-blue-50 px-2 py-0.5 rounded-sm">{selectedSchedule.scheduleNumber}</span>
              <span>·</span>
              <span className="font-mono">{selectedSchedule.ruleReference}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">
              {selectedSchedule.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {selectedSchedule.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              अनुसूचीका मुख्य अङ्गहरू तथा ढाँचा विवरण:
            </h4>
            <div className="space-y-2">
              {selectedSchedule.fields.map((field, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-800 flex items-start gap-2.5"
                >
                  <span className="font-mono font-bold text-blue-700 text-xs shrink-0 mt-0.5">
                    {idx + 1}.
                  </span>
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedSchedule.sampleNotes && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900">
              <span className="font-bold block mb-0.5">कानुनी निर्देशन:</span>
              <span>{selectedSchedule.sampleNotes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
