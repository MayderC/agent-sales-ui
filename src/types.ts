export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  context: string;
  status: 'new' | 'contacted' | 'interested' | 'not_interested';
  // Dynamic Variables
  COMPANY_NAME?: string;
  CHURCH_NAME?: string;
  CITY_STATE?: string;
  DENOMINATION?: string;
  ATTENDANCE?: number;
  PASTOR_NAME?: string;
  ADDITIONAL_RESEARCH_NOTES?: string;
  MULTI_CAMPUS?: boolean;
  ATTEMPT?: number;
  VOICE_MESSAGE?: string;
}

export interface Agent {
  id: string;
  name: string;
  versions: Version[];
}

export interface Version {
  id: string;
  name: string;
}

export type ActionType = 'search' | 'add' | 'call' | 'batch';
