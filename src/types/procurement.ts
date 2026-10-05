export type ProcurementType = 'works' | 'goods' | 'consulting' | 'services';

export interface ProcurementMethod {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: ProcurementType[];
  thresholdText: string;
  minAmount?: number;
  maxAmount?: number;
  legalActSection: string;
  legalRuleSection: string;
  noticePeriodDays: string;
  approvalAuthority: string;
  bidSecurityRate: string;
  bidValidityDays: string;
  performanceSecurityRate: string;
  summary: string;
  keyConditions: string[];
  steps: {
    stepNo: number;
    title: string;
    description: string;
    legalRef: string;
    timeline?: string;
  }[];
  requiredDocuments: string[];
  cautions: string[];
  badgeTag: string;
}

export interface ProcurementStage {
  id: string;
  stageNo: number;
  titleNepali: string;
  titleEnglish: string;
  description: string;
  legalBasis: string;
  keyActivities: string[];
  requiredDocuments: string[];
  timeframeNotes: string;
  responsibleOfficial: string;
  criticalComplianceNotes: string[];
}

export interface ChecklistItem {
  id: string;
  stageId: string;
  text: string;
  legalRef: string;
  procurementTypes: ProcurementType[];
  isMandatory: boolean;
  notes?: string;
}

export interface TrackedProject {
  id: string;
  title: string;
  officeName: string;
  procurementType: ProcurementType;
  methodId: string;
  estimatedAmount: number;
  currentStageId: string;
  progressPercent: number;
  budgetSource: string;
  startDate: string;
  targetCompletionDate: string;
  contractorName?: string;
  contractAmount?: number;
  checklistStatus: Record<string, boolean>; // checklist item id -> checked
  notes?: string;
}

export interface LegalClause {
  id: string;
  lawType: 'act' | 'rule';
  clauseNumber: string;
  title: string;
  summary: string;
  category: ProcurementType[] | 'general';
  tags: string[];
}

export interface ScheduleItem {
  id: string;
  scheduleNumber: string;
  ruleReference: string;
  title: string;
  description: string;
  fields: string[];
  sampleNotes?: string;
}
