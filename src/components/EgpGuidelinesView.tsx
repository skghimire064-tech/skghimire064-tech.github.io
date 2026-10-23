import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, ExternalLink, FileCheck2, Search, ShieldCheck } from 'lucide-react';
import directivePdf from '../../EGP_guidelines.pdf?url';
import { EGP_GUIDELINE_SECTIONS } from '../data/egpGuidelines';
import { PROCUREMENT_STAGES } from '../data/procurementData';

export const EgpGuidelinesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const query = searchQuery.trim().toLocaleLowerCase();

  const sections = useMemo(
    () => EGP_GUIDELINE_SECTIONS.filter((section) => (
      !query
      || section.title.toLocaleLowerCase().includes(query)
      || section.summary.toLocaleLowerCase().includes(query)
      || section.legalReference.toLocaleLowerCase().includes(query)
      || section.actions.some((action) => action.toLocaleLowerCase().includes(query))
    )),
    [query],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-800">
              <FileCheck2 className="h-4 w-4" />
              <span>e-GP कानूनी कार्यप्रवाह</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              विद्युतीय खरिद प्रणाली सञ्चालन निर्देशिका, २०८०
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              निर्देशिकाका उपयोगी प्रावधानलाई खरिदका सात चरणमा मिलाइएको छ। प्रत्येक शीर्षकसँग सम्बन्धित दफा र व्यवहारिक रुजु बुँदा हेर्नुहोस्।
            </p>
          </div>
          <a
            href={directivePdf}
            download="EGP_guidelines.pdf"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            मूल निर्देशिका PDF
          </a>
        </div>

        <div role="note" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="leading-relaxed">
            <strong>यो एप e-GP पोर्टल होइन।</strong> यहाँका सामग्री कानूनी मार्गदर्शन र आन्तरिक रुजुका लागि हुन्; बोलपत्र दर्ता/खोल्ने, सूचना प्रकाशन, जमानत वा भुक्तानीका आधिकारिक काम PPMO को e-GP प्रणालीमा गर्नुहोस्। निर्देशिका, लागू ऐन/नियम, बोलपत्र कागजात र PPMO ले प्रकाशित गरेको अद्यावधिक प्रयोगकर्ता पुस्तिकालाई प्राथमिकता दिनुहोस्।
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            राजपत्रमा प्रकाशित: २०८०।०३।२१
          </span>
          <span>·</span>
          <span>लागू: २०८० साउन १ देखि (दफा १)</span>
          <a
            href="https://www.bolpatra.gov.np/egp/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
          >
            PPMO e-GP पोर्टल
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm leading-relaxed text-blue-950">
        <h3 className="font-bold">अनिवार्य र वैकल्पिक e-GP प्रयोग छुट्याउनुहोस्</h3>
        <p className="mt-1">
          दफा ५(१) अनुसार खुला बोलपत्र, पूर्वयोग्यता वा प्रस्ताव आह्वानका प्रक्रिया e-GP बाट गर्नुपर्ने हुन्छ। सिलबन्दी दरभाउपत्र र सोझै खरिदजस्ता अन्य विधिमा दफा ५(२) ले e-GP प्रयोग गर्न सकिने व्यवस्था गर्छ। लागू प्रक्रिया बोलपत्र कागजातको Bid Data Sheet मा उल्लेख गर्नुहोस्।
        </p>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="विषय वा दफा खोज्नुहोस्..."
          aria-label="e-GP निर्देशिका खोज्नुहोस्"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {sections.length === 0 ? (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          खोजिएको विषयसँग मिल्ने निर्देशिका बुँदा भेटिएन।
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => {
            const stage = PROCUREMENT_STAGES.find((item) => item.id === section.stageId);
            return (
              <article key={section.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                  {stage && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800">
                      चरण {stage.stageNo}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{section.summary}</p>
                <ul className="mt-3 space-y-2">
                  {section.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
                {section.note && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                    {section.note}
                  </p>
                )}
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-semibold text-blue-900">
                  कानूनी आधार: {section.legalReference}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
