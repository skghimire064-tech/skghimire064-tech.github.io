import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Copy, 
  Check, 
  Filter, 
  ExternalLink,
  Edit3,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { PROCUREMENT_TEMPLATES, ProcurementTemplate } from '../data/templatesData';
import { PROCUREMENT_METHODS } from '../data/procurementData';

interface TemplatesViewProps {
  onSelectMethod?: (methodId: string) => void;
  initialTemplateId?: string | null;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onSelectMethod,
  initialTemplateId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<ProcurementTemplate>(() => {
    if (initialTemplateId) {
      const found = PROCUREMENT_TEMPLATES.find(t => t.id === initialTemplateId);
      if (found) return found;
    }
    return PROCUREMENT_TEMPLATES[0];
  });
  const [copied, setCopied] = useState(false);

  // Customization fields for the active template
  const [customOffice, setCustomOffice] = useState('शहरी विकास तथा भवन निर्माण डिभिजन कार्यालय');
  const [customProject, setCustomProject] = useState('स्वास्थ्य चौकी भवन तथा कम्पाउण्ड वाल निर्माण');
  const [customAmount, setCustomAmount] = useState('४५,००,०००/-');
  const [customDate, setCustomDate] = useState('२०८१/०७/१५');
  const [customContractNo, setCustomContractNo] = useState('UDBC/NCB/WORKS/02-081/82');

  const filteredTemplates = PROCUREMENT_TEMPLATES.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.titleNepali.toLowerCase().includes(q) ||
        t.titleEnglish.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.legalReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Generate customized content
  const compiledContent = React.useMemo(() => {
    let text = activeTemplate.contentTemplate;
    text = text.replace(/\[सार्वजनिक निकायको नाम\]/g, customOffice || '[सार्वजनिक निकायको नाम]');
    text = text.replace(/\[कार्यालयको नाम\]/g, customOffice || '[कार्यालयको नाम]');
    text = text.replace(/\[कामको विवरण\]/g, customProject || '[कामको विवरण]');
    text = text.replace(/\[आयोजनाको नाम\]/g, customProject || '[आयोजनाको नाम]');
    text = text.replace(/\[कामको नाम\]/g, customProject || '[कामको नाम]');
    text = text.replace(/\[लागत अनुमान\]/g, customAmount || '[लागत रकम]');
    text = text.replace(/\[लागत रकम\]/g, customAmount || '[लागत रकम]');
    text = text.replace(/\[मिति\]/g, customDate || '[मिति]');
    text = text.replace(/\[ठेक्का नं\.\]/g, customContractNo || '[ठेक्का नं.]');
    text = text.replace(/\[ठेक्का नं\]/g, customContractNo || '[ठेक्का नं]');
    return text;
  }, [activeTemplate, customOffice, customProject, customAmount, customDate, customContractNo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
      "xmlns:w='urn:schemas-microsoft-com:office:word' "+
      "xmlns='http://www.w3.org/TR/REC-html40'>"+
      "<head><meta charset='utf-8'><title>"+activeTemplate.titleNepali+"</title></head><body style='font-family: Arial, sans-serif; line-height: 1.6;'>";
    const footer = "</body></html>";
    const sourceHTML = header + `<pre style="font-family: inherit; white-space: pre-wrap;">${compiledContent}</pre>` + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.id}_${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([compiledContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wide">
            <FileText className="w-4 h-4" />
            <span>कानुनी कागजात तथा फारामहरूको भण्डार</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            सार्वजनिक खरिद आधिकारिक कागजात ढाँचा (Templates Repository)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            बोलपत्र आह्वानको सूचना, दरभाउपत्र फाराम, खोल्ने मुचुल्का, आशयको सूचना (LOI), स्वीकृति पत्र (LOA), खरिद सम्झौता, बैंक जमानत र कार्य सम्पन्न प्रमाणपत्रका आधिकारिक कानूनी ढाँचाहरू डाउनलोड वा प्रिन्ट गर्नुहोस्।
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="फाराम वा ढाँचा खोज्नुहोस्..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          सबै ढाँचाहरू ({PROCUREMENT_TEMPLATES.length})
        </button>
        <button
          onClick={() => setSelectedCategory('notice')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'notice'
              ? 'bg-red-700 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          सूचना ढाँचाहरू (Notices)
        </button>
        <button
          onClick={() => setSelectedCategory('contract')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'contract'
              ? 'bg-red-700 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          सम्झौता र LOI/LOA
        </button>
        <button
          onClick={() => setSelectedCategory('guarantee')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'guarantee'
              ? 'bg-red-700 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          बैंक जमानत (Guarantees)
        </button>
        <button
          onClick={() => setSelectedCategory('administrative')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'administrative'
              ? 'bg-red-700 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          मुचुल्का र सूचना पाटी
        </button>
        <button
          onClick={() => setSelectedCategory('completion')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === 'completion'
              ? 'bg-red-700 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          कार्य सम्पन्न प्रमाणपत्र
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
          {filteredTemplates.map((tmpl) => {
            const isSelected = activeTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setActiveTemplate(tmpl)}
                className={`p-3.5 transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-red-50/70 border-l-4 border-l-red-700'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-mono text-red-800 font-semibold">{tmpl.legalReference.split(',')[0]}</span>
                  <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-sm text-slate-600">
                    {tmpl.formatTypes.join(', ')}
                  </span>
                </div>
                <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-red-900' : 'text-slate-900'}`}>
                  {tmpl.titleNepali}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {tmpl.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Customization and Live Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Customization Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-red-600" />
                <span>फाराम अनुकूलन (Custom Fields):</span>
              </span>
              <span className="text-[11px] text-slate-500">
                यहाँ विवरण परिवर्तन गर्दा तलको ढाँचामा तुरुन्तै अद्यावधिक हुनेछ।
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">सार्वजनिक निकायको नाम:</label>
                <input
                  type="text"
                  value={customOffice}
                  onChange={(e) => setCustomOffice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">काम वा आयोजनाको नाम:</label>
                <input
                  type="text"
                  value={customProject}
                  onChange={(e) => setCustomProject(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">ठेक्का वा सूचना नं:</label>
                <input
                  type="text"
                  value={customContractNo}
                  onChange={(e) => setCustomContractNo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Document Preview Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Toolbar for the active template */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {activeTemplate.titleNepali}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  कानुनी आधार: {activeTemplate.legalReference}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  title="क्लिपबोर्डमा प्रतिलिपि गर्नुहोस्"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'कपी गरियो' : 'कपी'}</span>
                </button>

                <button
                  onClick={handleDownloadDoc}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Word (.doc) ढाँचामा डाउनलोड"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Word (.doc) डाउनलोड</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Text (.txt) डाउनलोड"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.TXT</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                  title="प्रिन्ट / PDF सेभ गर्नुहोस्"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Content Viewport */}
            <div className="p-6 bg-white overflow-x-auto min-h-[450px]">
              <pre className="text-xs sm:text-sm font-sans text-slate-900 whitespace-pre-wrap leading-relaxed">
                {compiledContent}
              </pre>
            </div>

            {/* Related Methods Footer */}
            {activeTemplate.relatedMethods.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                <span className="font-medium text-slate-700">सम्बन्धित खरिद विधिहरू:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeTemplate.relatedMethods.map((mid) => {
                    const method = PROCUREMENT_METHODS.find(m => m.id === mid);
                    return (
                      <span
                        key={mid}
                        className="px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-700 font-medium"
                      >
                        {method?.nameNepali || mid}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
