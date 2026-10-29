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
  ChevronLeft,
  ExternalLink,
  HelpCircle,
  Users,
  FileCheck,
  BookA,
  Clock,
  HardHat,
  Globe,
} from 'lucide-react';
import { UserRole } from '../types/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSearch: () => void;
  onOpenNewProject: () => void;
  userRole: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userMode?: 'entity' | 'bidder';
  onToggleUserMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenSearch,
  onOpenNewProject,
  userRole,
  isCollapsed = false,
  onToggleCollapse,
  userMode = 'entity',
  onToggleUserMode,
}) => {
  const navGroups = [
    ...(userMode === 'bidder'
      ? [
          {
            groupTitle: 'बोलपत्रदाता कर्नर (Bidder Hub)',
            items: [
              { id: 'bidder-hub', label: 'बोलपत्रदाता ड्यासबोर्ड', icon: HardHat, desc: ' ' },
              { id: 'bidding-forms', label: 'बोलपत्र फाराम जेनेरेटर', icon: FileText, desc: ' ' },
            ],
          },
        ]
      : [
          {
            groupTitle: 'बोलपत्रदाता सहयोगी',
            items: [
              { id: 'bidder-hub', label: 'बोलपत्रदाता कर्नर (Bidder)', icon: HardHat, desc: ' ' },
            ],
          },
        ]),
    {
      groupTitle: 'व्यवस्थापन तथा सल्लाह',
      items: [
        { id: 'dashboard', label: 'ड्यासबोर्ड', icon: Briefcase, desc: ' ' },
        { id: 'advisor', label: 'खरिद सल्लाहकार', icon: Sparkles, desc: ' ' },
        { id: 'workflow-wizard', label: 'चरणबद्ध गाइड (Wizard)', icon: ClipboardList, desc: ' ' },
        { id: 'dilemma-solver', label: 'समस्या समाधान (FAQ)', icon: HelpCircle, desc: ' ' },
        ...(userRole === 'admin'
          ? [{ id: 'user-management', label: 'प्रयोगकर्ता व्यवस्थापन', icon: Users, desc: ' ' }]
          : []),
      ],
    },
    {
      groupTitle: 'राय तथा पुनरावलोकन',
      items: [
        { id: 'ppmo-pprc', label: 'PPMO राय र PPRC निर्णय', icon: MessageSquareText, desc: ' ' },
      ],
    },
    {
      groupTitle: 'खरिद विधि तथा अनुपालन',
      items: [
        { id: 'methods', label: 'खरिद विधिहरू', icon: Layers, desc: ' ' },
        { id: 'icb-guide', label: 'अन्तर्राष्ट्रिय बोलपत्र (ICB)', icon: Globe, desc: ' ' },
        { id: 'method-checklists', label: 'विधिगत चेकलिस्ट', icon: FileCheck2, desc: ' ' },
        { id: 'stages', label: 'प्रक्रियागत ७ चरणहरू', icon: ClipboardList, desc: ' ' },
        { id: 'egp-guidelines', label: 'e-GP निर्देशिका, २०८०', icon: FileCheck, desc: ' ' },
        { id: 'checklists', label: 'एकीकृत चेकलिस्ट', icon: ShieldCheck, desc: ' ' },
      ],
    },
    {
      groupTitle: 'कानूनी संग्रह तथा संशोधन',
      items: [
        { id: 'law-corpus', label: 'ऐन/नियमका व्यवस्थाहरु', icon: BookOpen, desc: ' ' },
        { id: 'amendments', label: '१६औँ संशोधनका विशेषता', icon: ShieldCheck, desc:' ' },
        { id: 'glossary', label: 'शब्दावली कोष (Glossary)', icon: BookA, desc: ' ' },
        { id: 'clauses', label: 'महत्वपूर्ण दफाहरू', icon: BookOpen, desc: ' ' },
        { id: 'schedules', label: 'अनुसूचीहरू (१–८)', icon: Scale, desc: ' ' },
      ],
    },
    {
      groupTitle: 'नमूना कागजात तथा क्याल्कुलेटर',
      items: [
        { id: 'templates', label: 'कागजात ढाँचाहरु', icon: FileText, desc: ' ' },
        { id: 'timeline-calculator', label: 'कानूनी म्याद क्याल्कुलेटर', icon: Clock, desc: ' ' },
        { id: 'calculator', label: 'थ्रेसहोल्ड क्याल्कुलेटर', icon: Calculator, desc: ' ' },
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
        className={`fixed top-0 bottom-0 left-0 z-50 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } w-72 bg-[#173b63] text-blue-50 border-r border-[#31577b] flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding & Close button for mobile / Collapse button for desktop */}
        <div>
          <div className={`p-4 border-b border-[#31577b] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} bg-[#214f83]`}>
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  title="सार्वजनिक खरिद सहयोगी - ड्यासबोर्ड"
                  aria-label="ड्यासबोर्डमा जानुहोस्"
                  className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm hover:bg-blue-800 transition-colors"
                >
                  ख
                </button>
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    title="साइडबार खोल्नुहोस् (Expand)"
                    aria-label="साइडबार खोल्नुहोस्"
                    className="hidden lg:flex p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2.5 text-left group focus:outline-hidden min-w-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-800 transition-colors shrink-0">
                    ख
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold tracking-tight text-white group-hover:text-blue-100 transition-colors truncate">
                      सार्वजनिक खरिद सहयोगी
                    </span>
                    <span className="text-[11px] font-medium text-blue-100/80 truncate">
                      सार्वजनिक खरिद ऐन २०६३ र नियमावली २०६४
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  {onToggleCollapse && (
                    <button
                      onClick={onToggleCollapse}
                      title="साइडबार संकुचित गर्नुहोस् (Collapse)"
                      aria-label="साइडबार संकुचित गर्नुहोस्"
                      className="hidden lg:flex p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onCloseMobile}
                    className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg lg:hidden transition-colors shrink-0"
                    title="बन्द गर्नुहोस्"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mode Switcher inside Sidebar */}
          {onToggleUserMode && (
            <div className={`p-2.5 border-b border-[#31577b] bg-[#1a426e] ${isCollapsed ? 'flex justify-center' : ''}`}>
              {isCollapsed ? (
                <button
                  type="button"
                  onClick={onToggleUserMode}
                  title={userMode === 'bidder' ? 'सार्वजनिक निकाय मोडमा जानुहोस्' : 'बोलपत्रदाता मोडमा जानुहोस्'}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shadow-2xs cursor-pointer ${
                    userMode === 'bidder'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-blue-800 hover:bg-blue-700 text-blue-100'
                  }`}
                >
                  {userMode === 'bidder' ? '👷' : '🏛️'}
                </button>
              ) : (
                <div className="flex items-center bg-[#143355] p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => { if (userMode !== 'entity') onToggleUserMode(); }}
                    className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      userMode === 'entity'
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'text-blue-200 hover:text-white'
                    }`}
                  >
                    <span>🏛️ सार्वजनिक निकाय</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (userMode !== 'bidder') onToggleUserMode(); }}
                    className={`flex-1 py-1 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      userMode === 'bidder'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-blue-200 hover:text-white'
                    }`}
                  >
                    <span>👷 बोलपत्रदाता</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Action Button: New Project */}
          <div className={`p-3 border-b border-[#31577b] bg-[#173b63] ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <button
                onClick={() => { onOpenNewProject(); onCloseMobile(); }}
                title="नयाँ खरिद आयोजना थप्नुहोस्"
                aria-label="नयाँ खरिद आयोजना थप्नुहोस्"
                className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center shadow-xs transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => { onOpenNewProject(); onCloseMobile(); }}
                className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>नयाँ खरिद आयोजना थप्नुहोस्</span>
              </button>
            )}
          </div>

          {/* Quick Search Trigger inside sidebar */}
          <div className={`pt-2.5 ${isCollapsed ? 'px-2 flex justify-center' : 'px-3'}`}>
            {isCollapsed ? (
              <button
                onClick={() => { onOpenSearch(); onCloseMobile(); }}
                title="खोज तथा फिल्टर (/)"
                aria-label="खोज तथा फिल्टर"
                className="w-10 h-10 flex items-center justify-center text-blue-100 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 transition-colors"
              >
                <Search className="w-4 h-4 text-blue-200" />
              </button>
            ) : (
              <button
                onClick={() => { onOpenSearch(); onCloseMobile(); }}
                className="w-full flex items-center justify-between p-2 text-xs text-blue-100 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-blue-200" />
                  <span>खोज तथा फिल्टर...</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 border border-white/20 rounded text-blue-100">
                  /
                </kbd>
              </button>
            )}
          </div>
        </div>

        {/* Middle: Scrollable Navigation Groups */}
        <div className={`flex-1 overflow-y-auto py-3 space-y-4 text-left text-xs ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed ? (
                <h3 className="px-2 text-[10px] font-bold text-blue-200/70 uppercase tracking-wider">
                  {group.groupTitle}
                </h3>
              ) : (
                gIdx > 0 && <div className="h-px bg-white/10 my-2 mx-1" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center rounded-lg transition-all group ${
                        isCollapsed
                          ? `justify-center p-2.5 ${
                              isActive
                                ? 'bg-blue-100 text-blue-950 font-bold shadow-2xs'
                                : 'text-blue-100 hover:text-white hover:bg-white/10'
                            }`
                          : `justify-between p-2 ${
                              isActive
                                ? 'bg-blue-100 text-blue-950 font-bold border-l-4 border-blue-400 shadow-2xs'
                                : 'text-blue-100 hover:text-white hover:bg-white/10'
                            }`
                      }`}
                    >
                      {isCollapsed ? (
                        <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-blue-700' : 'text-blue-300 group-hover:text-white'}`} />
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-700' : 'text-blue-300 group-hover:text-white'}`} />
                          <div className="truncate">
                            <span className="block truncate text-xs font-semibold">{item.label}</span>
                            <span className={`block text-[10px] truncate ${isActive ? 'text-blue-700/80 font-normal' : 'text-blue-200/75 font-normal'}`}>
                              {item.desc}
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar Footer */}
        {isCollapsed ? (
          <div className="p-3 border-t border-[#31577b] bg-[#143553] flex justify-center">
            <span
              title="१६औँ संशोधन समावेश — सार्वजनिक खरिदका लागि सहयोगी प्रणाली"
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30"
            />
          </div>
        ) : (
          <div className="p-3 border-t border-[#31577b] bg-[#143553] text-[11px] text-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>१६औँ संशोधन समावेश</span>
            </div>
            <p className="text-[10px] text-blue-200/80 leading-tight">
              सार्वजनिक खरिदका लागि सहयोगी प्रणाली
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
