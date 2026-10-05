import React from 'react';
import { 
  Menu, 
  Search, 
  PlusCircle, 
  Printer, 
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface TopHeaderProps {
  activeTab: string;
  onToggleSidebarMobile: () => void;
  onOpenSearch: () => void;
  onOpenNewProject: () => void;
}

const TAB_TITLES: Record<string, { title: string; category: string }> = {
  dashboard: { title: 'ड्यासबोर्ड तथा आयोजना अनुगमन', category: 'व्यवस्थापन' },
  advisor: { title: 'खरिद सल्लाहकार (Wizard)', category: 'सल्लाहकार' },
  methods: { title: 'खरिदका सम्पूर्ण विधिहरू', category: 'विधिहरू' },
  'method-checklists': { title: 'विधि अनुसारको चेकलिस्ट', category: 'अनुपालन' },
  'law-corpus': { title: 'ऐन तथा नियमावली संग्रह', category: 'कानुनी संग्रह' },
  amendments: { title: '१६औँ संशोधनका विशेषताहरू', category: 'संशोधन' },
  stages: { title: 'प्रक्रियागत ७ चरणहरू', category: 'चरणहरू' },
  templates: { title: 'कागजात ढाँचा भण्डार', category: 'ढाँचाहरू' },
  checklists: { title: 'एकीकृत अनुपालन चेकलिस्ट', category: 'चेकलिस्ट' },
  calculator: { title: 'सीमा तथा अख्तियारी क्याल्कुलेटर', category: 'उपकरण' },
  clauses: { title: 'महत्वपूर्ण कानुनी दफाहरू', category: 'दफाहरू' },
  schedules: { title: 'आधिकारिक अनुसूचीहरू (१–८)', category: 'अनुसूचीहरू' },
  'ppmo-pprc': { title: 'PPMO राय तथा PPRC पुनरावलोकन निर्णय', category: 'राय तथा नजिर' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onToggleSidebarMobile,
  onOpenSearch,
  onOpenNewProject,
}) => {
  const current = TAB_TITLES[activeTab] || { title: 'सार्वजनिक खरिद सहयोगी', category: 'प्रणाली' };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      {/* Left: Mobile hamburger menu toggle + Breadcrumb trail */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          title="मेनु खोल्नुहोस्"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
          <span className="hidden sm:inline hover:text-slate-800 transition-colors">खरिद निर्देशिका</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <span className="text-slate-500 hidden md:inline">{current.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
          <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">{current.title}</span>
        </div>
      </div>

      {/* Right: Search, Print & Primary Action */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          title="खोज तथा फिल्टर (Ctrl + K वा /)"
        >
          <Search className="w-4 h-4 text-slate-500" />
          <span className="hidden md:inline">खोज्नुहोस्</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded-sm text-slate-500">
            /
          </kbd>
        </button>

        <button
          onClick={() => window.print()}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors no-print"
          title="प्रिन्ट गर्नुहोस्"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">नयाँ खरिद प्रक्रिया</span>
          <span className="sm:hidden">नयाँ</span>
        </button>
      </div>
    </header>
  );
};
