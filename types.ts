
export enum AnalysisCategory {
  FUNNEL = 'FUNNEL',
  RETENTION = 'RETENTION',
  FINANCIAL = 'FINANCIAL',
  SENTIMENT = 'SENTIMENT',
  NETWORK = 'NETWORK'
}

export interface SchoolBranch {
  id: string;
  name: string;
  location: string;
  studentCount: number;
  status: 'active' | 'underperforming' | 'exceeding';
}

export interface MetricCardData {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export interface FunnelData {
  stage: string;
  count: number;
  conversion: number;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface AdmissionFile {
  name: string;
  content: string;
  type: string;
  category: AnalysisCategory;
}
