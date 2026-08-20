export interface ModelStatus {
  providerId: string;
  displayName: string;
  modelName: string;
  configured: boolean;
  active: boolean;
}

export interface AiIssueRequest {
  issueType: string;
  fileName: string;
  codeSnippet: string;
  description: string;
  preferredProvider?: string;
}

export interface AiIssueResponse {
  explanation?: string;
  impact?: string;
  recommendation?: string;
  modelName?: string;
  activeProvider?: string;
  fallbackTriggered?: boolean;
  primaryModel?: string;
  fallbackReason?: string;
}
