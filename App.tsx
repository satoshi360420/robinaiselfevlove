


import React from 'react';
import { Header } from './components/pages/dashboard/Header';
import { Page, Mission, BackgroundTask, MissionLog, CampaignStep, SeoContentBrief, Lead, StrategicGoal, KnowledgeBaseDocument, SystemHealthReport, EvolutionProposal } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNav from './components/BottomNav';
import { useHashNavigation } from './hooks/useHashNavigation';
import { useTasks } from './contexts/TaskContext';
import * as geminiService from './services/geminiService';
import { useLocalDB, addToLocalDB, getDB } from './hooks/useLocalDB';
import { useCommandPalette } from './contexts/CommandPaletteContext';
import CommandPalette from './components/CommandPalette';


// Page imports
import DashboardPage from './components/pages/DashboardPage';
import AgentsPage from './components/pages/AgentsPage';
import WorkspacePage from './components/pages/WorkspacePage';
import SystemPage from './components/pages/SystemPage';
import ToolsPage from './components/pages/ToolsPage';
import PolicyAdvisorPage from './components/pages/PolicyAdvisorPage';
import { ToastContainer } from './components/ui/ToastContainer';
import MissionDetailModal from './components/pages/MissionDetailModal';
import ApiKeyModal from './components/ApiKeyModal';
import { AiPlannerPage } from './components/pages/AiPlannerPage';
import CyberCommandPage from './components/pages/CyberCommandPage';

export const App = () => {
  const { page, navigate } = useHashNavigation();
  const [missionForModal, setMissionForModal] = React.useState<Mission | null>(null);
  const { tasks, updateTask } = useTasks();
  const { data: missions, update: updateMission } = useLocalDB<Mission>('missions');
  const { update: updateStrategicGoal } = useLocalDB<StrategicGoal>('strategic_goals');
  const { update: updateKnowledgeDoc } = useLocalDB<KnowledgeBaseDocument>('knowledge_base_documents');
  const { openPalette } = useCommandPalette();
  const [isApiKeyMissing, setIsApiKeyMissing] = React.useState(false);

  const runningTaskIds = React.useRef(new Set<string>());
  const runningMissionIds = React.useRef(new Set<string>());

  React.useEffect(() => {
    // Proactively check if the API key is missing to show the modal.
    const key = process.env.API_KEY || sessionStorage.getItem('gemini_api_key');
    if (!key) {
      setIsApiKeyMissing(true);
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        openPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPalette]);


  // --- Background Task Runner ---
  React.useEffect(() => {
    const runTask = async (task: BackgroundTask) => {
      try {
        let result;

        switch (task.tool) {
          case 'SEO':
            result = await geminiService.analyzeSeo(task.payload.url, task.payload.htmlContent, task.payload.businessContext);
            break;
          case 'Image Gen':
            result = await geminiService.generateImages(task.payload.prompt, task.payload.numberOfImages, task.payload.aspectRatio);
            break;
          case 'Agent Janus':
            result = await geminiService.generateSeoContentBrief(task.payload.keyword);
            addToLocalDB('memory_stream', {
                agent: 'system',
                event: `Simulated email with brief for '${task.payload.keyword}' sent to ${task.payload.email}.`,
                type: 'execution',
                timestamp: new Date().toISOString()
            });
            break;
          case 'Knowledge Base Ingestion': {
            const { documentId, content } = task.payload;
            try {
                updateKnowledgeDoc(documentId, { status: 'ingesting' });
                const response = await geminiService.runAgent('knowledge_agent', content);
                const summary = response.text.trim();
                updateKnowledgeDoc(documentId, { status: 'ready', summary });
                result = { summary };
            } catch (e: any) {
                const errorMessage = e instanceof Error ? e.message : 'Ingestion failed.';
                updateKnowledgeDoc(documentId, { status: 'failed', error: errorMessage });
                throw e; // This will be caught by the outer try/catch
            }
            break;
          }
          case 'Campaigns': {
            const { steps: initialSteps, variableValues } = task.payload;
            const steps = JSON.parse(JSON.stringify(initialSteps)) as CampaignStep[];
            const stepOutputs: Record<string, string> = {};

            let finalOutput: string | null = null;
        
            const updateLocalStep = (id: string, updates: Partial<CampaignStep>) => {
                const stepIndex = steps.findIndex(s => s.id === id);
                if (stepIndex !== -1) {
                    steps[stepIndex] = { ...steps[stepIndex], ...updates };
                }
            };

            const substituteVariables = (text: string): string => {
                let substitutedText = text;
                // Substitute global workflow variables: {{variable_name}}
                for (const key in variableValues) {
                    substitutedText = substitutedText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), variableValues[key]);
                }
                // Substitute step outputs: {{step_1.output}}
                for (const stepId in stepOutputs) {
                    const stepIndex = initialSteps.findIndex(s => s.id === stepId) + 1;
                    substitutedText = substitutedText.replace(new RegExp(`\\{\\{step_${stepIndex}\\.output\\}\\}`, 'g'), stepOutputs[stepId]);
                }
                return substitutedText;
            };
        
            for (const currentStep of steps) {
                try {
                    updateLocalStep(currentStep.id, { status: 'in-progress', error: null, output: null });
                    addToLocalDB('memory_stream', { agent: 'system', event: `[Campaign] Step '${currentStep.name}' running with agent '${currentStep.agent}'.`, type: 'automation_step', timestamp: new Date().toISOString() });
                    
                    const processedInstruction = substituteVariables(currentStep.instruction);
                    
                    const response = await geminiService.runAgent(currentStep.agent, processedInstruction);
                    const output = response.text.trim();

                    stepOutputs[currentStep.id] = output;
                    finalOutput = output;
                    updateLocalStep(currentStep.id, { status: 'completed', output });

                } catch (e: any) {
                    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
                    updateLocalStep(currentStep.id, { status: 'failed', error: errorMessage });
                    addToLocalDB('memory_stream', { agent: 'system', event: `[Campaign] failed: ${errorMessage}`, type: 'automation_failure', timestamp: new Date().toISOString() });
                    throw e; // Stop the whole workflow on failure
                }
            }
          
            result = { finalOutput, steps };
            break;
        }
          default:
            throw new Error(`Tool "${task.tool}" is not implemented for background tasks.`);
        }

        updateTask(task.id, { status: 'completed', result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        updateTask(task.id, { status: 'failed', error: errorMessage });
      }
    };
    
    const tasksToRun = tasks.filter(t => t.status === 'running' && !runningTaskIds.current.has(t.id));

    if (tasksToRun.length > 0) {
      tasksToRun.forEach(task => {
        runningTaskIds.current.add(task.id);
        runTask(task).finally(() => {
          runningTaskIds.current.delete(task.id);
        });
      });
    }

  }, [tasks, updateTask, updateKnowledgeDoc]);
  
  // --- Mission Runner ---
  React.useEffect(() => {
    const runMission = async (mission: Mission) => {
        if (!mission.id) return;

        const logProgress = (log: { thought?: string; action?: string; observation?: string, isError?: boolean, agent?: string }) => {
            if (!mission.id) return;
            const newLog: Omit<MissionLog, 'id'> = {
                missionId: mission.id,
                agent: log.agent || mission.agent || 'unknown',
                timestamp: new Date().toISOString(),
                ...log
            };
            addToLocalDB('mission_logs', newLog);
        };
        
        let finalOutput = '';

        try {
            // --- PHASE 1: PLANNING ---
            updateMission(mission.id, { status: 'planning', progress: 5 });
            logProgress({ agent: 'system', thought: `Mission received. Initiating planning phase for objective: "${mission.objective}"`});
            
            const plan = await geminiService.planMission(mission);
            updateMission(mission.id, { plan, status: 'in-progress', startedAt: new Date().toISOString(), progress: 10 });
            logProgress({ agent: 'system', thought: `Planning complete. ${plan.steps.length} steps generated. Starting execution.` });

            // --- PHASE 2: EXECUTION ---
            const stepOutputs: Record<number, string> = {};
            const totalSteps = plan.steps.length;

            for (const step of plan.steps.sort((a,b) => a.step - b.step)) {
                logProgress({ 
                    agent: step.agent || 'dynamic_agent', 
                    thought: `Executing Step ${step.step}: ${step.objective}`
                });

                // This is a simple context mechanism. A real implementation might be more complex.
                const contextFromPreviousSteps = Object.entries(stepOutputs)
                    .map(([stepNum, output]) => `[Output from Step ${stepNum}]:\n${output}`)
                    .join('\n\n');

                const stepPrompt = `CONTEXT FROM PREVIOUS STEPS:\n${contextFromPreviousSteps || 'This is the first step.'}\n\nCURRENT OBJECTIVE FOR THIS STEP:\n${step.objective}`;
                
                const agentToRun = step.agent || step.dynamicAgent;
                if (!agentToRun) {
                    throw new Error(`Step ${step.step} has no agent defined.`);
                }
                
                const response = await geminiService.runAgent(agentToRun, stepPrompt, logProgress);
                
                const stepResult = typeof response.text === 'string'
                    ? response.text.trim()
                    : JSON.stringify(response, null, 2);

                stepOutputs[step.step] = stepResult;
                finalOutput = stepResult;

                logProgress({
                    agent: step.agent || 'dynamic_agent',
                    observation: `Step ${step.step} completed. Result: ${stepResult.slice(0, 200)}...`
                });

                const progress = 10 + (step.step / totalSteps) * 85;
                updateMission(mission.id, { progress });
            }
            
            // --- PHASE 3: COMPLETION ---
            logProgress({ agent: 'system', thought: `All ${totalSteps} steps completed. Finalizing mission.`});
            
            if (mission.agent === 'diagnostic_agent' && finalOutput) {
                try {
                    const proposalData = geminiService.safeJsonParse(finalOutput);
                    if (proposalData.title && proposalData.description && proposalData.category) {
                        const newProposal = addToLocalDB('evolution_proposals', {
                            ...proposalData,
                            createdAt: new Date().toISOString(),
                            status: 'proposed',
                        } as EvolutionProposal);
                        addToLocalDB('action_center_items', {
                            type: 'evolution_proposed',
                            title: `Diagnostic Agent Proposal: ${proposalData.title}`,
                            description: `The diagnostic agent proposed a fix: "${proposalData.description.slice(0, 100)}..."`,
                            timestamp: new Date().toISOString(),
                            isRead: false,
                            relatedId: newProposal.id!,
                            actionLabel: 'View Proposal',
                            actionPage: Page.System,
                            actionSubPage: 'Learning',
                        });
                        logProgress({ agent: 'system', observation: `Diagnostic agent successfully generated a new evolution proposal: ${proposalData.title}` });
                    }
                } catch(e) {
                    logProgress({ agent: 'system', observation: `Diagnostic agent did not return a valid JSON proposal. Raw output: ${finalOutput.slice(0, 200)}`, isError: true });
                }
            } else if (mission.objective === "System Health Monitor") {
                const healthReport = JSON.parse(finalOutput) as SystemHealthReport;
                if (healthReport.status === 'anomaly_detected' && healthReport.anomalies.length > 0) {
                    const anomaly = healthReport.anomalies[0];
                    addToLocalDB('action_center_items', {
                        type: 'system_health_anomaly',
                        title: `Performance Anomaly Detected: ${anomaly.agentId}`,
                        description: `${anomaly.agentId} has a failure rate of ${(anomaly.failureRate * 100).toFixed(0)}% over the last ${anomaly.totalMissions} missions.`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        relatedId: 'system_health_check',
                        actionLabel: 'View Analytics',
                        actionPage: Page.System,
                        actionSubPage: 'Analytics',
                        payload: { anomaly }
                    });
                    
                    // AUTONOMOUS SELF-CORRECTION: Create a new mission to fix the issue
                    const selfCorrectionMission: Omit<Mission, 'id'> = {
                        objective: `The auditor_agent has detected that ${anomaly.agentId} is underperforming with a ${(anomaly.failureRate * 100).toFixed(0)}% failure rate. Analyze the failed mission logs for this agent and propose an 'agent_patch' evolution to fix the root cause.`,
                        agent: 'diagnostic_agent',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        priority: 'high',
                        tags: ['self-correction', `fix-${anomaly.agentId}`],
                    };
                    addToLocalDB('missions', selfCorrectionMission as Mission);
                }
            }

            if (mission.type === 'monitoring') {
                if (mission.lastOutput && mission.lastOutput !== finalOutput) {
                    addToLocalDB('action_center_items', {
                        type: 'monitor_alert',
                        title: `Monitor Alert: Change Detected`,
                        description: `The monitor for "${mission.objective.slice(0, 50)}..." detected a change in output.`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        relatedId: mission.id,
                        actionLabel: 'View Mission Log',
                        actionPage: Page.AiPlanner,
                    });
                }
                updateMission(mission.id, {
                    status: 'monitoring',
                    progress: 100,
                    output_summary: finalOutput,
                    lastRun: new Date().toISOString(),
                    lastOutput: finalOutput,
                });
            } else { // Handle 'oneshot' missions
                updateMission(mission.id, {
                    status: 'completed',
                    output_summary: finalOutput,
                    progress: 100,
                });

                // Strategic Goal and Dependency logic only for 'oneshot' missions for now
                const completedMissionId = mission.id;
                const strategicGoalId = mission.strategicGoalId;

                if (completedMissionId && strategicGoalId) {
                    const db = getDB();
                    const allMissions = db.missions || [];
                    const relatedBlockedMissions = allMissions.filter(m =>
                        m.strategicGoalId === strategicGoalId && m.status === 'blocked'
                    );

                    for (const blockedMission of relatedBlockedMissions) {
                        if (blockedMission.id && blockedMission.dependsOn) {
                            const newDependsOn = blockedMission.dependsOn.filter(depId => depId !== completedMissionId);
                            if (newDependsOn.length === 0) {
                                updateMission(blockedMission.id, { status: 'pending', dependsOn: [] });
                            } else {
                                updateMission(blockedMission.id, { dependsOn: newDependsOn });
                            }
                        }
                    }
                    
                    const goal = db.strategic_goals.find(g => g.id === strategicGoalId);
                    if (goal && goal.id) {
                        const updatedCompletedMissions = (goal.completedMissions || 0) + 1;
                        updateStrategicGoal(goal.id, { completedMissions: updatedCompletedMissions });
                        if (updatedCompletedMissions === goal.totalMissions) {
                            updateStrategicGoal(goal.id, { status: 'completed' });
                        }
                    }
                }

                addToLocalDB('memory_stream', {
                    agent: 'system',
                    event: `Mission [${mission.id}] completed successfully.`,
                    type: 'execution',
                    timestamp: new Date().toISOString()
                });
                
                addToLocalDB('action_center_items', {
                    type: 'mission_completed',
                    title: `Mission Completed: ${(mission.objective || '[Untitled Mission]').slice(0, 40)}...`,
                    description: `The mission assigned to ${mission.agent} has completed successfully.`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    relatedId: mission.id,
                    actionLabel: 'View Result',
                    actionPage: Page.AiPlanner,
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            if (mission.id) {
                updateMission(mission.id, { 
                    status: 'failed',
                    output_summary: errorMessage,
                    progress: 100,
                    lastRun: new Date().toISOString(), // Log run time even on failure
                });
                if (mission.strategicGoalId) {
                    updateStrategicGoal(mission.strategicGoalId, { status: 'failed' });
                }
            }
             addToLocalDB('memory_stream', {
                agent: 'system',
                event: `Mission [${mission.id}] failed. Error: ${errorMessage}`,
                type: 'system_error',
                timestamp: new Date().toISOString()
            });
             logProgress({ agent: 'system', observation: `Mission failed: ${errorMessage}`, isError: true });
             
             addToLocalDB('action_center_items', {
                type: 'mission_failed',
                title: `Mission Failed: ${(mission.objective || '[Untitled Mission]').slice(0, 40)}...`,
                description: `The mission encountered an error: ${errorMessage.slice(0, 100)}...`,
                timestamp: new Date().toISOString(),
                isRead: false,
                relatedId: mission.id,
                actionLabel: 'View Details',
                actionPage: Page.AiPlanner,
            });
        }
    };

    const missionsToRun = missions
      ?.filter(m => m.status === 'pending' && m.id && !runningMissionIds.current.has(m.id))
      .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityA = priorityOrder[a.priority || 'medium'];
          const priorityB = priorityOrder[b.priority || 'medium'];
          return priorityB - priorityA;
      });

    if (missionsToRun && missionsToRun.length > 0) {
        missionsToRun.forEach(mission => {
            if (!mission.id) return;
            runningMissionIds.current.add(mission.id);
            runMission(mission).finally(() => {
                 if (mission.id) {
                    runningMissionIds.current.delete(mission.id);
                 }
            });
        });
    }

  }, [missions, updateMission, updateStrategicGoal]);

  // --- Monitoring Mission Re-Queuer ---
  React.useEffect(() => {
    const MONITOR_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
    const RERUN_THRESHOLD_MS = 60 * 60 * 1000; // Re-run every 1 hour

    const intervalId = setInterval(() => {
        const db = getDB();
        const monitorsToRequeue = (db.missions || []).filter(m =>
            m.type === 'monitoring' &&
            m.status === 'monitoring' &&
            m.id &&
            !runningMissionIds.current.has(m.id) &&
            m.lastRun &&
            (new Date().getTime() - new Date(m.lastRun).getTime() > RERUN_THRESHOLD_MS)
        );

        if (monitorsToRequeue.length > 0) {
            monitorsToRequeue.forEach(m => {
                if (m.id) {
                    updateMission(m.id, { status: 'pending' });
                }
            });
        }
    }, MONITOR_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [updateMission]);

  const handleApiKeySaved = () => {
    setIsApiKeyMissing(false);
    window.location.reload();
  };

  const renderPage = () => {
    switch(page) {
      case Page.Dashboard: return <DashboardPage navigate={navigate} onMissionSelect={setMissionForModal} />;
      case Page.Agents: return <AgentsPage />;
      case Page.Tools: return <ToolsPage />;
      case Page.Workspace:
        const initialTab = sessionStorage.getItem('initialWorkspaceTab');
        if(initialTab === 'Cyber Command') return <CyberCommandPage />;
        if(initialTab === 'Policy Advisor') return <PolicyAdvisorPage />;
        return <WorkspacePage />;
      case Page.AiPlanner: return <AiPlannerPage onMissionSelect={setMissionForModal} />;
      case Page.System: return <SystemPage />;
      case Page.PolicyAdvisor: return <PolicyAdvisorPage />;
      default: return <DashboardPage navigate={navigate} onMissionSelect={setMissionForModal} />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary/30">
      <CommandPalette />
      <Header />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24">
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>
      <BottomNav currentPage={page} />
      <ToastContainer />
       {missionForModal && (
        <MissionDetailModal 
          mission={missionForModal} 
          onClose={() => setMissionForModal(null)}
          onUpdateMission={updateMission}
        />
      )}
      <ApiKeyModal isOpen={isApiKeyMissing} onSave={handleApiKeySaved} />
    </div>
  );
};