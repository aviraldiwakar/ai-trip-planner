export interface User {
  userId: number;
  name: string;
  email: string;
}

export interface Group {
  groupId: number;
  groupName: string;
  createdBy: number;
}

export interface GroupMember {
  userId: number;
  name: string;
  email: string;
}

export interface Preference {
  prefId: number;
  groupId: number;
  userId: number;
  userName?: string;
  destinationName: string;
  fromDate: string;
  toDate: string;
  priorityScore: number;
}

export interface Recommendation {
  name: string;
  terrain: string;
  region: string;
  budget: string;
  similarity_score: number;
}

export interface TripResult {
  winningDestination: string;
  commonStartDate: string;
  commonEndDate: string;
  dateOverlapValid: boolean;
  userProposals: Preference[];
  aiSuggestions: Recommendation[];
}
