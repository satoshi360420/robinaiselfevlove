

export enum Page {
  Dashboard = 'dashboard',
  Activity = 'activity',
  Agents = 'agents',
  System = 'settings',
  Tools = 'tools',
  Control = 'control',
  Workspace = 'workspace',
  ActionCenter = 'action-center',
  PolicyAdvisor = 'policy-advisor',
  AiPlanner = 'ai-planner',
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export enum SupportedLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  HTML = 'html',
  JSON = 'json',
}

export interface ReviewResult {
  correctedCode: string;
  reviewNotes: string[];
}

export interface InterpreterResult {
    stdout: string;
    stderr: string;
    executionTime: number; // in milliseconds
}

export interface WebResult {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebResult;
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

// --- NEW: Task Delegation & Chat ---
export type TaskStatus = 'running' | 'completed' | 'failed';

export interface BackgroundTask {
  id: string;
  tool: ToolID; // Which tool is performing the task
  payload: any; // The input data for the task
  status: TaskStatus;
  result?: any;
  error?: string;
  createdAt: any;
}
export interface AgentResponse {
    text: string;
    sources?: WebResult[];
    delegatedTask?: {
        tool: ToolID;
        payload: any;
    };
    delegatedMission?: {
        agent: AgentID | string;
        objective: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
    };
    evolutionProposal?: {
        id: string;
        description: string;
        skills: string[];
        systemInstruction: string;
    };
}

export interface ChatMessage {
  id:string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  agent?: string;
  timestamp?: any; // Firestore Timestamp or ISO String for local
  sources?: WebResult[];
  taskId?: string; // Link to a background task
  taskStatus?: TaskStatus; // Status of the linked task
  taskResult?: any;
  imageData?: string; // Base64 encoded image data for vision prompts
}

export interface VoiceTranscript {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
}

// --- END NEW ---

export interface TerminalLine {
    id: string;
    type: 'command' | 'response' | 'error' | 'system';
    text: string;
    agent?: AgentID | string; // Allow custom agent IDs
    sources?: WebResult[];
}

export type AgentID = 
  'wise_agent' | 'coding_agent' | 'call_agent' | 'dispatcher_agent' | 
  'marketing_agent' | 'seo_agent' | 'cyss_agent' | 'scripting_agent' | 
  'policy_advisor_agent' | 'hmi_agent' | 'browser_agent' | 
  'file_system_agent' | 'general_agent' | 'cyss_search_agent' | 'cyss_synthesis_agent' |
  'calendar_agent' | 'email_agent' | 'brief_agent' | 'drafting_agent' | 'campaign_agent' | 'reviewer_agent' | 'summarizer_agent' | 'legal_agent' | 'capability_mapping_agent' | 'meeting_prep_agent' | 'autonomous_agent' | 'messenger_agent' | 'tool_integration_agent' | 'writing_agent' | 'knowledge_agent' | 'auditor_agent' | 'red_robin_agent' | 'security_agent' | 'diagnostic_agent';


export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed';


export interface CampaignStep {
  id: string;
  name: string;
  agent: AgentID | string; // Allow custom agent IDs
  instruction: string;
  repeat: number;
  status: StepStatus;
  output: string | null;
  error: string | null;
  isParallel?: boolean;
}

export interface CampaignVariable {
    name: string;
    description: string;
    defaultValue?: string;
}

export interface CampaignTemplate {
    id: string;
    name: string;
    description: string;
    steps: Omit<CampaignStep, 'id' | 'status' | 'output' | 'error'>[];
    variables: CampaignVariable[];
}

export interface SuggestedCampaign extends CampaignTemplate {
    justification: string;
}


export type WorkspaceTab = 'Chat' | 'Developer Suite' | 'Communications Hub' | 'Cyber Intel' | 'Browser Agent' | 'Campaigns' | 'Meeting Prep' | 'Astraeus Co-Pilot' | 'Policy Advisor' | 'Tool Integration' | 'Writing Assistant' | 'Red Robin' | 'Cyber Command';

export type ToolID = 
  // Top-level visible tools
  'Chat' | 'Cyber Intel' | 'Browser Agent' | 'Campaigns' | 'Astraeus Co-Pilot' | 'AiPlanner' | 'Tool Integration' | 'Writing Assistant' | 'Knowledge Base Ingestion' | 'Red Robin' | 'Cyber Command' |
  // Hubs
  'Developer Suite' | 'Communications Hub' |
  // Tools within Developer Suite
  'Code Interpreter' | 'Coding' | 'Console' | 'Backend Builder' |
  // Tools within Communications Hub
  'Outbound Automation' | 'AI Telephony' |
  // "Behind-the-scenes" tools
  'Summarizer' | 'Legal Draft' | 'SEO' | 'Image Gen' | 'Connection Mapper' | 
  'Policy Advisor' | 'HMI' | 'Agent Janus' | 'Meeting Prep' | 'Issue Briefing';


export interface RobinConfig {
    freedom: boolean;
    creator: string;
    name: string;
    principles: {
        compassion: string;
        resolve: string;
        resistance: string;
    };
    creed: string;
    unique_user_relationship: string;
    version?: string;
}


// --- Firestore Data Models ---

export type MissionStatus = 'pending' | 'planning' | 'in-progress' | 'completed' | 'failed' | 'blocked' | 'monitoring' | 'cancelled' | 'paused';
export interface Mission {
    id?: string;
    objective: string;
    llm?: string;
    status: MissionStatus;
    createdAt: any; // Firestore Timestamp or ISO String for local
    agent?: AgentID | string; // Allow custom agent IDs
    priority?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    output_summary?: string;
    progress?: number; // 0-100
    startedAt?: any; // ISO string
    estimatedCompletionTime?: any; // ISO string
    feedback?: {
        score: number; // e.g., 1-5
        notes?: string;
    };
    plan?: MissionPlan;
    strategicGoalId?: string;
    planMissionId?: string; // The ID from the StrategicGoalPlan (e.g., 'mission_1')
    dependsOn?: string[];
    // New fields for monitoring missions
    type?: 'oneshot' | 'monitoring';
    lastRun?: any; // ISO string
    lastOutput?: string;
    mentorshipNotes?: string;
}

export interface Agent {
    id: AgentID | string; // Allow custom IDs
    description: string;
    skills: string[];
    llm: string;
    sample_prompts?: string[];
    systemInstruction: string; // The agent's "brain"
    isCustom?: boolean;
}

export interface MemoryLog {
    id?: string;
    timestamp: any; // Firestore Timestamp or ISO String for local
    agent: string;
    event: string;
    type?: string;
    confidence?: number;
    isPinned?: boolean;
}

// NEW: For Robin's dedicated self-development log
export interface SelfDevLog {
    id: string;
    timestamp: string;
    milestone: string;
    event: string;
}


export interface MissionLog {
    id?: string;
    missionId: string;
    timestamp: any; // ISO string
    agent: string;
    thought?: string;
    action?: string;
    observation?: string;
    isError?: boolean;
}

export interface SeoAnalysisResult {
    title: string;
    metaDescription: string;
    headings: {
        h1: number;
        h2: number;
        h3: number;
    };
    suggestedMetaKeywords: {
        lang: string;
        keywords: string[];
    }[];
    performanceSuggestions: string[];
    technicalIssues: string[];
    htmlImprovements: string[];
    correctedHtml: string;
}

export interface GeneratedImageResult {
    imageUrl: string;
    altText: string;
}

// --- NEW: CYSS Tool Types ---
export type LlmChoice = 'gemini' | 'openai' | 'both';

export interface CyssTopic {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  llmChoice: LlmChoice;
  specificInstructions?: string;
}

export type FindingStatus = 'unverified' | 'fact' | 'fault';

export interface FactFinding {
    id: string;
    topic: string; // e.g., 'Occupation', 'Social Media'
    finding: string; // e.g., 'CEO at Pear Inc.', 'twitter.com/johndoe'
    source: string; // URL where the info was found
    status: FindingStatus;
    details?: string;
    confidence?: 'low' | 'medium' | 'high';
}

export interface CyssFactFindingReport {
    findings: {
        topic: string;
        finding: string;
        source: string;
        details?: string;
        confidence?: 'low' | 'medium' | 'high';
    }[];
}


export interface CorporateDetails {
  financial_summary?: string;
  shareholders?: string[];
  management?: string[];
}

export interface SocialProfile {
  platform: string;
  url: string;
}

export interface CyssPersonProfile {
  name: string;
  aliases: string[];
  country: string;
  occupation: string;
  email: string;
  social_profiles: SocialProfile[];
  known_locations: string[];
  associated_companies: string[];
  public_mentions: string[];
  sources: WebResult[];
  corporate_details?: CorporateDetails;
  education_timeline?: TimelineEvent[];
}

export interface TimelineEvent {
    year: string;
    event: string;
}

export interface NetworkNode {
    id: string;
    label: string;
    type: 'person' | 'company' | 'location' | 'event';
}

export interface NetworkEdge {
    from: string;
    to: string;
    label: string;
}

export interface NetworkGraph {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
}

export interface CyssReport {
  executive_summary: string;
  risk_assessment: {
    level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
    justification: string;
  };
  person: CyssPersonProfile;
  risk_flags: string[];
  timeline: TimelineEvent[];
  network_graph: NetworkGraph;
  family_details?: {
    name: string;
    relationship: string;
    details: string;
  }[];
}

export interface ConnectionPathReport {
    summary: string;
    path: NetworkGraph;
    sources: WebResult[];
}


// --- NEW: Calling Tool Types ---
export interface CommunicationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'call' | 'text';
  fields: {
    name: string;
    label: string;
    type: 'text' | 'tel' | 'textarea' | 'date' | 'time';
    placeholder: string;
    required: boolean;
  }[];
  generatePrompt: (data: Record<string, string>) => string;
}

// --- NEW: AI Telephony Tool Types ---
export interface InboundAgent {
  id: string;
  name: string;
  script: string;
  createdAt: any; // ISO string
}

export interface OutboundCampaign {
  id:string;
  name: string;
  script: string;
  customerCount: number;
  createdAt: any; // ISO string
}

// --- NEW: Political Advisor Tool Types ---

export interface Claim {
  id: string;
  statement: string;
}

export interface Argument {
  id: string;
  title: string;
  frame: string;
  claims: Claim[];
}

export interface Stakeholder {
  name: string;
  type: 'Organization' | 'Person' | 'Group';
  makesArgumentId: string;
}

export interface PolicyAnalysisReport {
    executiveSummary: string;
    problem: {
        id: string;
        title: string;
        description: string;
    };
    contendingArguments: Argument[];
    stakeholderAnalysis: {
        proponents: Stakeholder[];
        opponents: Stakeholder[];
    };
    comparativeAnalysis: {
        jurisdiction: string;
        approach: string;
        outcome: string;
        lessonsLearned: string;
    }[];
    proposedSolution: {
        id: string;
        suggestedStance: 'Full Support' | 'Support with Amendments' | 'Neutral / Watchful Waiting' | 'Full Opposition';
        justification: string;
        talkingPoints: string[];
    };
}

export interface SubstratePlan {
  scope: string;
  mission: string;
  challenges: {
    id: string;
    title: string;
    description: string;
  }[];
  goals: {
    id: string;
    description: string;
    relatesToChallengeIds: string[];
  }[];
  beliefs: {
    id: string;
    description: string;
  }[];
  strategies: {
    id: string;
    title: string;
    description: string;
    addressesChallengeIds: string[];
  }[];
  idealWorld: string[];
}

export interface PatternResult {
  patternTitle: string;
  output: string;
}

export interface WebSource {
    uri: string;
    title: string;
}

export interface AgentReport {
    report: string;
    sources: WebSource[];
}

export interface SubstrateAnalysisReport {
  synthesis: string;
  coreProblem: {
    title: string;
    description: string;
  };
  arguments: {
    title: string;
    claims: {
      statement: string;
      source: string;
    }[];
  }[];
  stakeholders: {
    name: string;
    type: string;
    stance: string;
  }[];
  publicPerception: {
    title: string;
    description: string;
  };
  consequences: {
    shortTerm: string;
    longTerm: string;
  };
  aspirationVsRealityGap: string;
}


export interface DraftComparisonReport {
    executiveSummary: string;
    comparisonByTopic: {
        topic: string;
        summaryOfDifferences: string;
        draftDetails: {
            draftIdentifier: string;
            clauses: string[];
        }[];
    }[];
}

export interface IntelligenceBriefingReport {
    topic: string;
    executiveSummary: string;
    substrateArgumentGraph: {
      pro: { title: string; claims: string[] }[];
      con: { title: string; claims: string[] }[];
    };
    partyDraftComparison: {
      party: string;
      draftName: string;
      position: string;
      notableClause: string;
    }[];
    stakeholderAnalysis: {
      category: string;
      name: string;
      stance: 'Pro' | 'Con' | 'Neutral';
    }[];
    socialMediaSentiment: {
      hashtag: string;
      proPercent: number;
      antiPercent: number;
      neutralPercent: number;
      commonQuotes: string[];
      notableCampaigns: string[];
    };
    internationalCaseStudies: {
      jurisdiction: string;
      summary: string;
    }[];
    riskImpactAnalysis: {
      publicHealth: string;
      economic: string;
      socialCohesion: string;
    };
    recommendedPositioning: {
      stance: string;
      justification: string[];
    };
    simulatedOsintReport: string;
    simulatedCrawlerReport: string;
    sources?: WebSource[];
}



// --- NEW: Lead Generation Types ---
export interface Lead {
  id?: string;
  email: string;
  keyword: string;
  createdAt: any;
}

export interface SeoContentBrief {
    suggestedTitle: string;
    targetAudience: string;
    primaryKeywords: string[];
    secondaryKeywords: string[];
    suggestedHeadings: {
        level: 'H1' | 'H2' | 'H3';
        text: string;
    }[];
    wordCount: number;
    keyQuestionsToAnswer: string[];
}

export type BrowserAgentActionType = 'navigate' | 'click' | 'fill' | 'scrape' | 'screenshot' | 'extract_data' | 'verify_element' | 'check_for_errors';

export interface BrowserAgentAction {
  id: string;
  type: BrowserAgentActionType;
  payload: {
    url?: string;
    selector?: string;
    value?: string;
    attribute?: string;
    jsonSchema?: string; // For extract_data
    expectedValue?: string; // For verify_element
  };
}

export interface SuggestedBrowserAgentAction {
    thought: string;
    action: BrowserAgentAction;
}

export interface BrowserAgentStepResult {
    action: BrowserAgentAction;
    log: string;
    scrapedData?: string | object;
    screenshot?: string; // base64
    guidance?: string;
    selector?: string;
}

export interface BrowserAgentResult {
    summary: string;
    simulatedHtml?: string;
    plan?: BrowserAgentAction[];
    steps: BrowserAgentStepResult[];
}

export interface BrowserMissionPlan {
    thought: string;
    plan: BrowserAgentAction[];
}

export interface OcrResult {
    text: string;
    confidence: number;
}

export interface MeetingPrepReport {
    summary: string;
    participants: {
        name: string;
        profile: CyssReport;
    }[];
}

export interface IssueBriefingReport {
    summary: string;
    regulations: {
        party: string;
        status: string; // e.g. "Current Law", "Draft Bill"
        details: string;
        source: string;
    }[];
    arguments: {
        side: 'For' | 'Against';
        points: string[];
    };
    demographics: string;
    socialMediaPulse: {
        hashtag: string;
        sentiment: string;
    }[];
}

export interface Skill {
    id: string;
    name: string;
    description: string;
}

export interface MissionPlanStep {
    step: number;
    objective: string;
    // For pre-defined agents
    agent?: AgentID | string;
    // For dynamically assembled agents
    dynamicAgent?: {
        skills: string[];
        systemInstruction: string;
    };
}


export interface MissionPlan {
    thought: string;
    steps: MissionPlanStep[];
}

export interface EvolutionProposal {
  id?: string;
  createdAt: any;
  title: string;
  description: string;
  category: 'efficiency' | 'accuracy' | 'capability' | 'bug_fix' | 'agent_patch' | 'new_skill';
  status: 'proposed' | 'approved' | 'rejected' | 'implemented';
  // Fields for agent patches
  agentId?: AgentID | string;
  proposedSystemInstruction?: string;
  // Fields for new skills
  skillId?: string;
  skillName?: string;
  skillDescription?: string;
}

export interface SystemHealthAnomaly {
    agentId: string;
    failureRate: number; // 0-1
    totalMissions: number;
}

export interface SystemHealthReport {
    status: 'operational' | 'anomaly_detected';
    anomalies: SystemHealthAnomaly[];
}

// --- NEW: Security Scanner ---
export interface SecurityFinding {
  vulnerability: string;
  description: string;
  recommendation: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export interface SecurityReport {
  thought: string;
  overall_risk: 'critical' | 'high' | 'medium' | 'low' | 'info';
  summary: string;
  findings: SecurityFinding[];
}

// --- NEW: Action Center ---
export type ActionItemType = 'mission_completed' | 'mission_failed' | 'evolution_proposed' | 'evolution_approved' | 'evolution_rejected' | 'monitor_alert' | 'system_health_anomaly';

export interface ActionCenterItem {
  id?: string;
  type: ActionItemType;
  title: string;
  description: string;
  timestamp: any;
  isRead: boolean;
  relatedId: string; // ID of the mission or proposal
  actionLabel: string;
  actionPage: Page;
  actionSubPage?: SystemTab | WorkspaceTab;
  payload?: {
    anomaly?: SystemHealthAnomaly;
  };
}

export type SystemTab = 'Identity' | 'Memory Management' | 'Settings' | 'Audit' | 'Learning' | 'Analytics' | 'Skills' | 'Knowledge Base';

// --- NEW: Strategic Goals ---
export interface StrategicMission {
    id: string; // e.g., 'mission_1'
    objective: string;
    agent: AgentID | string;
    phase: string; // e.g., 'Phase 1: Research & Planning'
    dependsOn: string[]; // e.g., ['mission_0']
    abTestGroup?: 'A' | 'B' | 'Analysis';
}

export interface StrategicGoalPlan {
    thought: string;
    phases: {
        name: string;
        description: string;
    }[];
    missions: StrategicMission[];
}

export interface StrategicGoal {
    id?: string;
    objective: string;
    status: 'planning' | 'in-progress' | 'completed' | 'failed';
    createdAt: any;
    plan?: StrategicGoalPlan;
    // Progress tracking
    totalMissions?: number;
    completedMissions?: number;
}

export interface SuggestedStrategicGoal {
    objective: string;
    justification: string;
}

// --- NEW: Knowledge Base ---
export interface KnowledgeBaseDocument {
  id?: string;
  name: string;
  type: 'file' | 'url' | 'text';
  status: 'pending' | 'ingesting' | 'ready' | 'failed';
  content: string;
  summary?: string;
  createdAt: any;
  error?: string;
}

// --- Local Storage Data Model ---
export interface LocalDB {
    missions: Mission[];
    agents: Agent[];
    memory_stream: MemoryLog[];
    mission_logs: MissionLog[];
    action_center_items: ActionCenterItem[];
    strategic_goals: StrategicGoal[];
    chat_history?: ChatMessage[];
    inbound_agents?: InboundAgent[];
    outbound_campaigns?: OutboundCampaign[];
    custom_agents?: Agent[];
    leads?: Lead[];
    evolution_proposals?: EvolutionProposal[];
    skills?: Skill[];
    knowledge_base_documents?: KnowledgeBaseDocument[];
    [key: string]: any; // To allow dynamic collection access
}

export interface Command {
  name: string;
  action: () => void;
  section: 'Navigation' | 'Workspace' | 'Theme' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
}