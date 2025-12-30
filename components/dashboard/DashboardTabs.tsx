// ============================================================================
// FILE: components/dashboard/DashboardTabs.tsx
// ============================================================================

import React from 'react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ id: string; label: string } | string>;
}

export function DashboardTabs({ activeTab, onTabChange, tabs }: DashboardTabsProps) {
  const tabLabels: Record<string, string> = {
    overview: 'Vista General',
    sessions: 'Mis Sesiones',
    progress: 'Mi Progreso',
    resources: 'Recursos',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const tabId = typeof tab === 'string' ? tab : tab.id;
          const tabLabel = typeof tab === 'string' ? tabLabels[tab] || tab : tab.label;
          
          return (
            <button
              key={tabId}
              onClick={() => onTabChange(tabId)}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === tabId
                  ? 'text-[#FF6B9D] border-b-2 border-[#FF6B9D]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}




