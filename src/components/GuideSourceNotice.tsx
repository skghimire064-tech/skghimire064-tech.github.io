import React from 'react';
import { Info } from 'lucide-react';

export const GuideSourceNotice: React.FC = () => (
  <aside className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-xs leading-relaxed text-blue-950">
    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
    <p>
      <strong>स्रोत र प्रयोगको सीमा:</strong> guide.docx का सावधानीहरू PPMO का राय र PPRC का निर्णयमा आधारित मार्गदर्शन हुन्; ती आफैंमा बाध्यकारी नजिर वा कानुनी सल्लाह होइनन्। निर्णय गर्नुअघि सम्बन्धित मितिमा लागू ऐन/नियम, पछिल्लो SBD तथा संशोधन, e-GP निर्देशिका र दाता वा सम्झौताका विशेष सर्तसँग रुजु गर्नुहोस्।
    </p>
  </aside>
);
