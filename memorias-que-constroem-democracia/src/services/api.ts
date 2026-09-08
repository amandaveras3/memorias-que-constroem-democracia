import type { City, Contribution, Memory, Place, Stats, ModerationStatus } from '../types';

const json = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const r = await fetch(url, options);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
  return r.json();
};

export const api = {
  health: () => json<{ok:boolean; database:string}>('/api/health'),
  cities: () => json<City[]>('/api/cities'),
  places: (cityId?: number) => json<Place[]>(`/api/places${cityId ? `?city_id=${cityId}` : ''}`),
  memories: (params?: {cityId?: number; category?: string; q?: string}) => {
    const p = new URLSearchParams(); if (params?.cityId) p.set('city_id', String(params.cityId)); if (params?.category) p.set('category', params.category); if (params?.q) p.set('q', params.q);
    return json<Memory[]>(`/api/memories?${p.toString()}`);
  },
  stats: () => json<Stats>('/api/stats'),
  contribute: (data: FormData) => json<{id:number;status:ModerationStatus}>('/api/contributions', { method:'POST', body:data }),
  adminLogin: (email:string, password:string) => json<{token:string;user:{email:string;name:string}}>('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})}),
  adminContributions: (token:string) => json<Contribution[]>('/api/admin/contributions', {headers:{'x-admin-key':token}}),
  setContributionStatus: (id:number, status:ModerationStatus, token:string) => json<Contribution>(`/api/admin/contributions/${id}`, {method:'PATCH', headers:{'Content-Type':'application/json','x-admin-key':token}, body:JSON.stringify({status})})
};
