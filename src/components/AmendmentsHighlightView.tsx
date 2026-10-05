import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2,
  TrendingDown,
  Building
} from 'lucide-react';
import { AMENDMENT_16_HIGHLIGHTS } from '../data/completeLawData';

export const AmendmentsHighlightView: React.FC = () => {
  const comparisonItems = [
    {
      topic: 'बोलपत्र छनोटको विधि (Bid Selection)',
      oldProvision: 'सारभूत रूपमा प्रभावग्राही बोलपत्रहरू मध्ये सबैभन्दा न्यूनतम अङ्क कबोल गर्ने (Lowest Evaluated Substantially Responsive Bidder) छनोट हुने।',
      newProvision: '३०% भन्दा बढी घटेकालाई हटाएपछि सारभूत रूपमा प्रभावग्राही बोलपत्रहरूको औसत अङ्क (Average Price) निकालिने र सो औसत अङ्कसँग सबैभन्दा नजिक भएको बोलपत्र छनोट हुने।',
      legalRef: 'ऐन दफा २५(५क/७क), नियम ३१ज, ६५च',
      impact: 'अत्यधिक घटेर काम अलपत्र पार्ने र न्यून बिडिङको विकृति पूर्ण रूपमा अन्त्य हुने।',
    },
    {
      topic: 'अत्यधिक घटेको बोलपत्र खारेजी (30% Cut-off)',
      oldProvision: 'जतिसुकै कम कबोल गरे पनि थप कार्यसम्पादन जमानत लिई ठेक्का सम्झौता गर्नुपर्ने बाध्यता।',
      newProvision: 'स्वीकृत लागत अनुमान भन्दा ३० प्रतिशत भन्दा बढी घटेर कबोल गर्ने बोलपत्रदातालाई मूल्याङ्कन प्रक्रियाबाटै स्वतः हटाइने (Disqualified)।',
      legalRef: 'ऐन दफा २५(७ख), नियम ६५च(४क)',
      impact: 'अवास्तविक र गुणस्तरहीन कम दरमा ठेक्का हाल्ने प्रवृत्ति स्वतः रोकिने।',
    },
    {
      topic: 'निर्माण व्यवसायीको चालू ठेक्का सीमा (5 Contracts Cap)',
      oldProvision: 'कुनै पनि निर्माण व्यवसायीले जतिसुकै संख्यामा पनि चालू ठेक्का लिन पाउने।',
      newProvision: 'एकल वा संयुक्त उपक्रम (JV) मा ५ वटा भन्दा बढी चालू खरिद सम्झौता सम्पन्न गर्न बाँकी रहेका निर्माण व्यवसायीले नयाँ बोलपत्रमा भाग लिन नपाउने। स्वघोषणा अनिवार्य।',
      legalRef: 'नियम ६५(४घ१), नियम ६५(४घ३)',
      impact: 'एकै ठेकेदारले देशैभरिका ठेक्का ओगट्ने र काम समयमा सम्पन्न नगर्ने समस्या समाधान हुने।',
    },
    {
      topic: 'सोझै खरिदको आर्थिक सीमा (Direct Purchase)',
      oldProvision: 'निर्माण वा मालसामान खरिदमा रु ५ लाख वा १० लाख सम्म मात्र सोझै खरिद गर्न सकिने।',
      newProvision: 'निर्माण कार्य वा मालसामान खरिदमा सोझै खरिद गर्न सकिने आर्थिक सीमा वृद्धि गरी रु १५ लाख सम्म पुर्‍याइएको (१ लाख माथि ३ वटा कोटेसन अनिवार्य)।',
      legalRef: 'ऐन दफा ४१(१क), नियम ८५(१क)',
      impact: 'साना पूर्वाधार र आकस्मिक मर्मत कार्य छिटो र छरितो रूपमा सम्पन्न गर्न सकिने।',
    },
    {
      topic: 'लागत अनुमान स्वीकृत गर्ने अख्तियारी (Approval Authority)',
      oldProvision: 'रा.प. तृतीयलाई रु ५ करोड र द्वितीयलाई रु १५ करोड सम्मको मात्र अख्तियारी।',
      newProvision: 'रा.प. तृतीय श्रेणीलाई रु १५ करोड सम्म, रा.प. द्वितीय श्रेणीलाई रु ५० करोड सम्म, रा.प. प्रथम श्रेणीलाई रु १ अर्ब सम्म र १ अर्ब माथि विभागीय प्रमुख।',
      legalRef: 'नियम १४(१), नियम ६७(१)',
      impact: 'विभागीय प्रमुख र मन्त्रालयमा फाइल पठाउनुपर्ने झन्झट हटी तल्लो तहबाटै शीघ्र निर्णय हुने।',
    },
    {
      topic: 'सामाजिक सुरक्षा कोष (SSF) मा आबद्धता',
      oldProvision: 'सम्झौतामा कामदारहरूको सामाजिक सुरक्षा कोष आबद्धताको स्पष्ट बाध्यकारी व्यवस्था नभएको।',
      newProvision: 'खरिद सम्झौता अनुसार काम गर्ने श्रमिक तथा कर्मचारीलाई अनिवार्य सामाजिक सुरक्षा कोषमा आबद्ध गराई पारिश्रमिक बैंक खाता मार्फत भुक्तानी गर्नुपर्ने।',
      legalRef: 'ऐन दफा ५२ख',
      impact: 'श्रमिकको सामाजिक सुरक्षा, दुर्घटना जोखिम र पारिश्रमिकको ग्यारेन्टी हुने।',
    },
    {
      topic: 'स्वदेशी व्यवसायी बीच मात्र प्रतिस्पर्धा (NCB Scope)',
      oldProvision: 'रु २ करोड देखि रु ३ अर्ब सम्मका निर्माण कार्यमा मात्र स्वदेशी व्यवसायीको प्रतिस्पर्धा।',
      newProvision: 'रु २ करोड देखि रु ५ अर्ब सम्म लागत अनुमान भएका निर्माण कार्यमा नेपाली निर्माण व्यवसायीहरू बीच मात्र प्रतिस्पर्धा हुने (५ अर्ब माथि मात्र विदेशी)।',
      legalRef: 'नियम ३१ङ(१)',
      impact: 'स्वदेशी निर्माण व्यवसायीको क्षमता विकास र ठूला राष्ट्रिय पूर्वाधारमा नेपाली सहभागिता।',
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* View Header */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>ऐन तथा नियमावलीका नयाँ प्रावधानहरू</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white">
          सार्वजनिक खरिद १६औँ संशोधन तथा ऐनको दोस्रो संशोधनका मुख्य विशेषताहरू
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          सार्वजनिक खरिद ऐन र नियमावलीमा हालसालै भएका ऐतिहासिक संशोधनहरू—जसले न्यून बिडिङको समस्या, ठेक्का ओगट्ने प्रवृत्ति र प्रक्रियागत ढिलासुस्तीलाई अन्त्य गरी खरिद प्रक्रियालाई नतिजामुखी बनाएका छन्।
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AMENDMENT_16_HIGHLIGHTS.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-red-400 transition-all flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-sm inline-block mb-2">
                {item.legalRef}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.summary}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>१६औँ संशोधनद्वारा लागू</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Table: Old vs New */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-red-600" />
            <span>साविकको व्यवस्था र हालको संशोधित व्यवस्था बीच तुलनात्मक तालिका</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            खरिद कार्य गर्दा पुराना प्रावधानका आधारमा निर्णय नगर्नुहोस्; तल उल्लिखित नयाँ संशोधन अनुसार मात्र अघि बढ्नुहोस्।
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 sm:px-5">विषय</th>
                <th className="p-3.5 sm:px-5">साविकको कानुनी व्यवस्था</th>
                <th className="p-3.5 sm:px-5 text-red-800">हालको संशोधित व्यवस्था (१६औँ संशोधन)</th>
                <th className="p-3.5 sm:px-5">कानुनी धारा र प्रभाव</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonItems.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 sm:px-5 font-bold text-slate-900 align-top whitespace-nowrap">
                    {comp.topic}
                  </td>
                  <td className="p-3.5 sm:px-5 text-slate-500 align-top leading-relaxed line-through decoration-slate-300">
                    {comp.oldProvision}
                  </td>
                  <td className="p-3.5 sm:px-5 text-slate-900 font-semibold bg-red-50/20 align-top leading-relaxed">
                    {comp.newProvision}
                  </td>
                  <td className="p-3.5 sm:px-5 align-top space-y-1">
                    <span className="font-mono text-[11px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-sm block">
                      {comp.legalRef}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {comp.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
