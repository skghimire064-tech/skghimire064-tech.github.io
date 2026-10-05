import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  Layers, 
  FileCheck2, 
  Calculator, 
  BookOpen, 
  ClipboardList, 
  Briefcase,
  Printer,
  FileText,
  ShieldCheck,
  Scale,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenNewProject,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryNavItems = [
    { id: 'dashboard', label: 'ड्यासबोर्ड', icon: Briefcase },
    { id: 'advisor', label: 'खरिद सल्लाहकार', icon: Sparkles, badge: 'नयाँ' },
    { id: 'methods', label: 'खरिद विधिहरू', icon: Layers },
    { id: 'method-checklists', label: 'विधिगत चेकलिस्ट', icon: FileCheck2 },
    { id: 'law-corpus', label: 'ऐन/नियम संग्रह', icon: BookOpen, badge: 'पूर्ण' },
    { id: 'amendments', label: '१६औँ संशोधन', icon: ShieldCheck },
    { id: 'templates', label: 'कागजात ढाँचा', icon: FileText },
    { id: 'calculator', label: 'सीमा क्याल्कुलेटर', icon: Calculator },
  ];

  const secondaryNavItems = [
    { id: 'stages', label: '७ प्रक्रियागत चरणहरू', icon: ClipboardList },
    { id: 'checklists', label: 'एकीकृत चेकलिस्ट', icon: FileCheck2 },
    { id: 'clauses', label: 'महत्वपूर्ण दफाहरू', icon: BookOpen },
    { id: 'schedules', label: 'अनुसूचीहरू (१–८)', icon: Scale },
  ];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-red-800 transition-colors">
                ख
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-red-700 transition-colors">
                  सार्वजनिक खरिद सहयोगी
                </span>
                <span className="text-[11px] font-medium text-slate-700 hidden sm:block">
                  ऐन २०६३ र नियमावली २०६४ (१६औँ संशोधनसहित पूर्ण जानकारी)
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors relative ${
                    isActive
                      ? 'text-red-800 bg-red-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-red-600 text-white px-1 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Dropdown for More Items */}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  isSecondaryActive
                    ? 'text-red-800 bg-red-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>थप</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs">
                  {secondaryNavItems.map((sec) => {
                    const Icon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => { setActiveTab(sec.id); setIsMoreOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 font-medium ${
                          activeTab === sec.id ? 'text-red-700 bg-red-50/50 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="खोज तथा फिल्टर (Ctrl + K वा /)"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">खोज तथा फिल्टर</span>
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
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">नयाँ खरिद प्रक्रिया</span>
              <span className="sm:hidden">नयाँ</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {[...primaryNavItems, ...secondaryNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-red-700 bg-red-50 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
