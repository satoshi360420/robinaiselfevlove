import React, { useMemo } from 'react';
import { Page, Mission, ActionCenterItem } from '../types';
import { useHashNavigation } from '../hooks/useHashNavigation';
import { useLocalDB } from '../hooks/useLocalDB';
import { 
    DashboardIcon, MissionsIcon, AutomationIcon, InboxIcon, CogIcon, AgentsIcon
} from './icons';
import { useTasks } from '../contexts/TaskContext';

interface BottomNavProps {
  currentPage: Page;
}

const navItems = [
  { page: Page.Dashboard, label: 'Dashboard', icon: DashboardIcon },
  { page: Page.Activity, label: 'Activity', icon: AutomationIcon },
  { page: Page.Agents, label: 'Agents', icon: AgentsIcon },
  { page: Page.System, label: 'System', icon: CogIcon },
];

const BottomNav = ({ currentPage }: BottomNavProps) => {
  const { navigate } = useHashNavigation();
  const { data: actionItems } = useLocalDB<ActionCenterItem>('action_center_items');
  const { tasks } = useTasks();
  const { data: missions } = useLocalDB<Mission>('missions');

  const unreadActionItemsCount = useMemo(() =>
    actionItems?.filter(item => !item.isRead).length || 0,
    [actionItems]
  );
  
  const runningTasksCount = useMemo(() => tasks.filter(t => t.status === 'running').length, [tasks]);
  
  const activeMissionsCount = useMemo(() => 
    missions?.filter(m => ['pending', 'in-progress', 'in_progress'].includes(m.status.toLowerCase())).length || 0,
    [missions]
  );

  const totalActivityCount = unreadActionItemsCount + runningTasksCount + activeMissionsCount;

  return (
    // Added padding-bottom to account for the iPhone home bar (safe area)
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-30 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.page)}
              // The group utility is used to style children on hover/focus of the button
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 group focus:outline-none"
            >
              <div
                className={`flex items-center justify-center h-8 w-16 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-primary/20' : 'bg-transparent'
                }`}
              >
                <item.icon
                  className={`h-6 w-6 transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'
                  }`}
                />
              </div>
              <span
                className={`text-xs transition-colors duration-300 ${
                  isActive ? 'font-semibold text-primary' : 'font-medium text-text-muted group-hover:text-primary'
                }`}
              >
                {item.label}
              </span>
              {item.page === Page.Activity && totalActivityCount > 0 && (
                <span className="absolute top-2 right-1/2 translate-x-6 bg-danger text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {totalActivityCount > 9 ? '9+' : totalActivityCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
