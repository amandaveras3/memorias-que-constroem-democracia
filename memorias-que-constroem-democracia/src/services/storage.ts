import type { Contribution, ModerationStatus } from '../types';
const KEY = 'mqcd_local_contributions_v2';
export function getLocalContributions(): Contribution[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
export function saveLocalContribution(c: Contribution) { localStorage.setItem(KEY, JSON.stringify([c, ...getLocalContributions()])); }
export function updateLocalContributionStatus(id:number,status:ModerationStatus) { localStorage.setItem(KEY, JSON.stringify(getLocalContributions().map(c=>c.id===id?{...c,status}:c))); }
