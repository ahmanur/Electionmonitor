import { FaBell } from 'react-icons/fa';
import type { Incidence, Submission, VoteDistributionData, ReportingStatusData, LiveFeedEvent, Agent, Result, Candidate, CancelledVote, AdminUser, Message, PollingUnit } from './types';

// =================================================================
// Canonical Data Source for Polling Units - REMAINS UNCHANGED
// =================================================================
export const allPollingUnits: PollingUnit[] = [
    // Dutse LGA
    { name: 'PU 001, Kofar Fada', lga: 'Dutse', ward: 'Limawa' },
    { name: 'PU 002, Gidan Bera', lga: 'Dutse', ward: 'Limawa' },
    { name: 'PU 003, Sakwaya', lga: 'Dutse', ward: 'Sakwaya' },
    { name: 'PU 004, Madobi', lga: 'Dutse', ward: 'Madobi' },
    // Hadejia LGA
    { name: 'PU 005, Kofar Arewa', lga: 'Hadejia', ward: 'Kasuwa' },
    { name: 'PU 006, Gidan Sarki', lga: 'Hadejia', ward: 'Kasuwa' },
    { name: 'PU 007, Dubantu', lga: 'Hadejia', ward: 'Dubantu' },
    // Kiyawa LGA
    { name: 'PU 008, Andaza', lga: 'Kiyawa', ward: 'Andaza' },
    { name: 'PU 009, Balago', lga: 'Kiyawa', ward: 'Balago' },
    { name: 'PU 010, Fake', lga: 'Kiyawa', ward: 'Fake' },
    // Kachi LGA
    { name: 'PU 011, Kachi Central', lga: 'Kachi', ward: 'Kachi Cikin Gari' },
    { name: 'PU 012, Yalawa', lga: 'Kachi', ward: 'Yalawa' },
    // Unreported PUs for testing
    { name: 'PU 013, Galamawa', lga: 'Dutse', ward: 'Galamawa' },
    { name: 'PU 014, Jigirya', lga: 'Dutse', ward: 'Jigirya' },
    { name: 'PU 015, Kofar Gabas', lga: 'Hadejia', ward: 'Kasuwa' },
];

// =================================================================
// Initial Data - Cleared of mock entries
// =================================================================

export const incidences: Incidence[] = [];

// Note: This is deprecated and only used for a preview table on the dashboard.
export const submissions: Submission[] = [];

// Note: This static data is used for chart dropdowns and some legacy calculations.
// The structure is kept for filter functionality, but votes are initialized to 0.
export const lgaVoteData: VoteDistributionData[] = [
    { name: 'Dutse', votes: 0 },
    { name: 'Hadejia', votes: 0 },
    { name: 'Kiyawa', votes: 0 },
    { name: 'Kachi', votes: 0 },
];

export const reportingStatusData: ReportingStatusData[] = [];

export const lgaTurnoutData = [];

export const votingProgressData = [];

// A single event to show the system is running.
export const initialLiveFeedEvents: LiveFeedEvent[] = [];

export const agentsData: Agent[] = [];

// Candidate data should be added by an admin.
export const candidatesData: Candidate[] = [];

export const resultsData: Result[] = [];

// This is deprecated and derived from resultsData.
export const cancelledVotesData: CancelledVote[] = [];

// Keep one admin user to allow login.
export const adminsData: AdminUser[] = [
    { id: 'ADM001', name: 'Ahmanur Admin', username: 'Ahmanur', email: 'admin@electionmonitor.com', password: 'Election@3528', accessLevel: 'full' }
];

export const initialMessages: Message[] = [];