import React, { useMemo } from 'react';
import { Page, Mission, ActionCenterItem } from '../types';
import { DashboardIcon, MissionsIcon, AgentsIcon, ToolsIcon, CogIcon, InboxIcon, BalanceIcon, AutomationIcon } from './icons';
import { useHashNavigation } from '../hooks/useHashNavigation';
import { Button } from './ui/Button';
import { useLocalDB } from '../hooks/useLocalDB';
import { useTasks } from '../contexts/TaskContext';

interface SidebarProps {
  currentPage: Page;
}

const navItems = [
  { page: Page.Dashboard, label: 'Dashboard', icon: DashboardIcon },
  { page: Page.Activity, label: 'Activity', icon: AutomationIcon },
  { page: Page.Agents, label: 'Agents', icon: AgentsIcon },
  { page: Page.Tools, label: 'Tools', icon: ToolsIcon },
  { page: Page.PolicyAdvisor, label: 'Policy Advisor', icon: BalanceIcon },
  { page: Page.System, label: 'Settings', icon: CogIcon },
];

export const Sidebar = ({ currentPage }: SidebarProps) => {
  const { navigate } = useHashNavigation();
  const { data: missions } = useLocalDB<Mission>('missions');
  const { data: actionItems } = useLocalDB<ActionCenterItem>('action_center_items');
  const { tasks } = useTasks();

  const activeMissionsCount = useMemo(() => 
    missions?.filter(m => ['pending', 'in-progress', 'in_progress'].includes(m.status.toLowerCase())).length || 0,
    [missions]
  );
  
  const unreadActionItemsCount = useMemo(() =>
    actionItems?.filter(item => !item.isRead).length || 0,
    [actionItems]
  );

  const runningTasksCount = useMemo(() => tasks.filter(t => t.status === 'running').length, [tasks]);

  const totalActivityCount = activeMissionsCount + unreadActionItemsCount + runningTasksCount;

  return (
    <aside className="w-64 bg-card/50 border-r border-border flex-shrink-0 p-4 hidden md:flex flex-col justify-between">
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Button
              key={item.label}
              onClick={() => navigate(item.page)}
              variant={isActive ? 'primary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
              {item.page === Page.Activity && totalActivityCount > 0 && (
                <span className="ml-auto bg-primary text-btn-text text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {totalActivityCount > 9 ? '9+' : totalActivityCount}
                </span>
              )}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};