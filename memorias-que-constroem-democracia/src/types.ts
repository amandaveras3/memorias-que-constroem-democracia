export type Category = 'Memória' | 'Patrimônio' | 'História' | 'Cultura' | 'Comunidade' | 'Fotografia' | 'Vídeo' | 'Educação';
export type ModerationStatus = 'Pendente' | 'Em análise' | 'Aprovado' | 'Recusado';

export type City = {
  id: number;
  name: string;
  ibgeCode: string;
  description: string;
  center: [number, number];
  zoom: number;
  neighborhoods: string[];
  localities: string[];
  color: string;
};

export type Place = {
  id: number;
  cityId: number;
  name: string;
  kind: 'Bairro' | 'Localidade' | 'Lugar de memória';
  lat: number;
  lng: number;
  description?: string;
};

export type Memory = {
  id: number;
  title: string;
  cityId: number;
  neighborhood: string;
  category: Category;
  period: string;
  story: string;
  contributor: string;
  lat: number;
  lng: number;
  image?: string;
  media?: string[];
  status: ModerationStatus;
  demo?: boolean;
  featured?: boolean;
  createdAt?: string;
};

export type Contribution = Memory & {
  email?: string;
  submittedAt: string;
  authorization: boolean;
  files?: { name: string; url: string; mime: string }[];
};

export type Stats = { cities: number; memories: number; places: number; interviews: number; contributions: number; };
