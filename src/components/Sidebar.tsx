import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Layers, 
  FileCheck2, 
  ClipboardList, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Calculator, 
  Scale, 
  MessageSquareText,
  Search, 
  PlusCircle, 
  X,
  ChevronRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSearch: () => void;
  onOpenNewProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenSearch,
  onOpenNewProject,
}) => {
  const navGroups = [
    {
      groupTitle: 'व्यवस्थापन तथा सल्लाह',
      items: [
        { id: 'dashboard', label: 'ड्यासबोर्ड', icon: Briefcase, desc: 'चालु योजना तथा प्रगति' },
        { id: 'advisor', label: 'खरिद सल्लाहकार', icon: Sparkles, desc: '३ चरणमा कानूनी मार्गनिर्देशन', badge: 'नयाँ' },
      ],
    },
    {
      groupTitle: 'राय तथा पुनरावलोकन',
      items: [
        { id: 'ppmo-pprc', label: 'PPMO राय र PPRC निर्णय', icon: MessageSquareText, desc: 'विषयगत खोज तथा तुलना' },
      ],
    },
    {
      groupTitle: 'खरिद विधि तथा अनुपालन',
      items: [
        { id: 'methods', label: 'खरिद विधिहरू', icon: Layers, desc: '१६+ खरिद विधिहरू' },
        { id: 'method-checklists', label: 'विधिगत चेकलिस्ट', icon: FileCheck2, desc: 'हरेक विधिको रुजु सूची' },
        { id: 'stages', label: 'प्रक्रियागत ७ चरणहरू', icon: ClipboardList, desc: 'तयारीदेखि फरफारकसम्म' },
        { id: 'checklists', label: 'एकीकृत चेकलिस्ट', icon: ShieldCheck, desc: 'मास्टर अडिट चेकलिष्ट' },
      ],
    },
    {
      groupTitle: 'कानूनी संग्रह तथा संशोधन',
      items: [
        { id: 'law-corpus', label: 'ऐन/नियमका व्यवस्थाहरु', icon: BookOpen, desc: 'दफा १ देखि ७६ र नियमहरू', badge: 'पूर्ण' },
        { id: 'amendments', label: '१६औँ संशोधनका विशेषता', icon: ShieldCheck, desc: 'नयाँ परिवर्तन तथा तुलना' },
        { id: 'clauses', label: 'महत्वपूर्ण दफाहरू', icon: BookOpen, desc: 'प्रमुख कानूनी व्यवस्थाहरू' },
        { id: 'schedules', label: 'अनुसूचीहरू (१–८)', icon: Scale, desc: 'लागत र सूचना ढाँचा' },
      ],
    },
    {
      groupTitle: 'नमूना कागजात',
      items: [
        { id: 'templates', label: 'कागजात ढाँचाहरु', icon: FileText, desc: 'सूचना, सम्झौता र फारामहरू (Word)' },
        { id: 'calculator', label: 'थ्रेसहोल्ड क्याल्कुलेटर', icon: Calculator, desc: 'अख्तियारी र धरौटी गणना' },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding & Close button for mobile */}
        <div>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-red-800 transition-colors">
                ख
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-red-700 transition-colors">
                  सार्वजनिक खरिद सहयोगी
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  सार्वजनिक खरिद ऐन २०६३ र नियमावली २०६४
                </span>
              </div>
            </button>

            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg lg:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button: New Project */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <button
              onClick={() => { onOpenNewProject(); onCloseMobile(); }}
              className="w-full py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नयाँ खरिद आयोजना थप्नुहोस्</span>
            </button>
          </div>

          {/* Quick Search Trigger inside sidebar */}
          <div className="px-3 pt-2.5">
            <button
              onClick={() => { onOpenSearch(); onCloseMobile(); }}
              className="w-full flex items-center justify-between p-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>खोज तथा फिल्टर...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">
                /
              </kbd>
            </button>
          </div>
        </div>

        {/* Middle: Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-left text-xs">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.groupTitle}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-red-50 text-red-900 font-bold border-l-4 border-red-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-red-700' : 'text-slate-400 group-hover:text-slate-700'}`} />
                        <div className="truncate">
                          <span className="block truncate text-xs font-semibold">{item.label}</span>
                          <span className={`block text-[10px] truncate ${isActive ? 'text-red-700/80 font-normal' : 'text-slate-400 font-normal'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>१६औँ संशोधन प्रमाणीकृत</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-tight">
            सार्वजनिक निकायहरूका लागि आधिकारिक खरिद अनुपालन प्रणाली
          </p>
        </div>
      </aside>
    </>
  );
};
