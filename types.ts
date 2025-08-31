import type { IconType } from 'react-icons';

export interface StatsCardData {
  title: string;
  value: string;
  icon: IconType;
  progress: number;
  progressColor: string;
  onClick?: () => void;
}

export type IncidenceStatus = 'Pending' | 'Resolved' | 'Urgent' | 'Escalated';

export interface Incidence {
  id: number;
  time: string;
  type: string;
  pollingUnit: string;
  status: IncidenceStatus;
  imageUrl?: string;
}

export type SubmissionStatus = 'Approved' | 'Pending' | 'Issue';

export interface Submission {
  pollingUnit: string;
  agent: string;
  time: string;
  status: SubmissionStatus;
}

export interface VoteDistributionData {
  name: string;
  votes: number;
}

export interface ReportingStatusData {
  name: string;
  value: number;
}

export interface LiveFeedEvent {
  icon: IconType;
  message: string;
  time: string;
  color: string;
}

export interface VoteStats {
    registered: number;
    accredited: number;
    cast: number;
    cancelled: number;
}

export interface NotificationData {
  id: number;
  message: string;
  icon: IconType;
  color: string;
  time: string;
}

export interface ElectionReportData {
  voteStats: VoteStats;
  pollingStats: StatsCardData[];
  totalIncidents: number;
  totalSubmissions: number;
}

// New Types for Advanced Features
export interface Agent {
    id: string;
    name: string;
    username: string;
    password: string;
    phone: string;
    pollingUnit: string;
    lastLogin: string;
    submissions: number;
}

export interface Result {
    id: string;
    pollingUnit: string;
    ward: string;
    lga: string;
    registeredVoters: number;
    accreditedVoters: number;
    votesCast: number;
    votesCancelled: number;
    agentName: string;
    candidateScores: { candidateId: string; score: number }[];
    resultSheetUrl: string;
    status: 'Pending' | 'Verified' | 'Disputed' | 'Cancelled';
    timestamp: string;
}

export interface Candidate {
    id: string;
    name: string;
    party: string;
}

export interface Settings {
    userRoles: string[];
    electionDate: string;
    candidates: Candidate[];
}

export interface CancelledVote {
  id: string;
  pollingUnit: string;
  reason: 'Over-voting' | 'Ballot Snatching' | 'Violence' | 'Invalid Markings' | 'Admin Action';
  votesCancelled: number;
  timestamp: string;
}

export interface AdminUser {
    id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    accessLevel: 'full' | 'partial';
}

export interface OverVotingIncident {
  pollingUnit: string;
  votesCast: number;
  accreditedVoters: number;
}

export interface Message {
  id: string;
  agentId: string;
  sender: 'Admin' | string; // Admin or Agent Name
  text: string;
  imageUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface PollingUnit {
    name: string;
    lga: string;
    ward: string;
}