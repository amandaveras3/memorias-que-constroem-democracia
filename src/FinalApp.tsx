import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Archive,
  BookOpen,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Heart,
  History,
  Landmark,
  LockKeyhole,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Star,
  Sun,
  Users,
  X,
  ExternalLink,
  Mail,
  Phone,
  FileCheck,
  BookMarked,
  Accessibility,
  Volume2,
  VolumeX,
  Contrast,
  Trash2,
  Upload,
} from "lucide-react";
import InteractiveAtlasMap, {
  type AtlasPoint,
  type MapDraft,
  type MapSearchTarget,
} from "./map/InteractiveAtlasMap";
import acopiaraImage from "./assets/municipios/acopiara.jpeg";
import catarinaImage from "./assets/municipios/catarina.jpeg";
import irapuanImage from "./assets/municipios/irapuan.jpeg";
import piquetImage from "./assets/municipios/piquet.jpeg";
import logoImage from "./assets/identity/logo.svg";
import "./final.css";
import { supabase, supabaseConfigured } from "./supabase";

declare global {
  interface Window {
    VLibras?: any;
    VLibrasWidget?: any;
  }
}

type Contribution = {
  id: string;
  title: string;
  municipality: string;
  text: string;
  status: "pending" | "published";
  created: string;
  latitude?: number;
  longitude?: number;
  attachmentCount?: number;
};
type ArchiveItem = {
  id: string;
  title: string;
  type: string;
  description: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  created: string;
  updatedAt?: string;
};

type Review = {
  id: string;
  pointId: string;
  name: string;
  text: string;
  rating: number;
  created: string;
};
export type AttachmentMeta = { name: string; type: string; size: number };

const towns = [
  ["Acopiara", acopiaraImage],
  ["Catarina", catarinaImage],
  ["Deputado Irapuan Pinheiro", irapuanImage],
  ["Piquet Carneiro", piquetImage],
] as const;
const townNames = towns.map((t) => t[0]);
const municipalityData: Record<
  string,
  {
    slug: string;
    population: string;
    estimated: string;
    area: string;
    density: string;
    idhm: string;
    schooling: string;
    gentilico: string;
    code: string;
    created: string;
    origin: string;
    history: string;
    source: string;
  }
> = {
  Acopiara: {
    slug: "acopiara",
    population: "44.962",
    estimated: "—",
    area: "2.254,279 km²",
    density: "19,95 hab./km²",
    idhm: "0,595",
    schooling: "—",
    gentilico: "acopiarense",
    code: "2300309",
    created: "1921",
    origin: "Iguatu",
    history:
      "A formação de Acopiara remonta à antiga povoação de Lages, com registros de ocupação desde o século XVIII. O território passou por transformações administrativas e recebeu impulso com a chegada da Estrada de Ferro Fortaleza–Crato. Em 1921, foi elevado à categoria de município, consolidando sua trajetória política e urbana.",
    source: "IBGE — Histórico de Acopiara e Censo 2022",
  },
  Catarina: {
    slug: "catarina",
    population: "10.243",
    estimated: "9.110",
    area: "488,153 km²",
    density: "20,98 hab./km²",
    idhm: "0,618",
    schooling: "99,52%",
    gentilico: "catarinense",
    code: "2303600",
    created: "1958",
    origin: "Tauá",
    history:
      "Catarina integra o Sertão cearense e apresenta uma trajetória marcada pela ocupação rural, pelas relações comunitárias e pela formação de núcleos locais que estruturaram o município. Esta página reúne os dados estatísticos e será ampliada com as memórias e registros produzidos pela pesquisa de campo do Atlas.",
    source:
      "IBGE — Cidades e Estados; dados históricos a ampliar com a pesquisa local",
  },
  "Deputado Irapuan Pinheiro": {
    slug: "deputado-irapuan-pinheiro",
    population: "8.932",
    estimated: "9.173",
    area: "471,134 km²",
    density: "18,96 hab./km²",
    idhm: "0,609",
    schooling: "98,51%",
    gentilico: "irapuense",
    code: "2304269",
    created: "1988",
    origin: "Solonópole",
    history:
      "O território teve diferentes denominações ao longo de sua formação: São Bernardo, Tataíra e São Bernardo do Ceará. O município de Deputado Irapuan Pinheiro foi criado em 1988, desmembrado de Solonópole, recebendo o nome em homenagem ao deputado que representou o município na Assembleia Legislativa do Ceará.",
    source: "IBGE/IPECE — Histórico e Perfil Municipal",
  },
  "Piquet Carneiro": {
    slug: "piquet-carneiro",
    population: "16.616",
    estimated: "17.285",
    area: "589,601 km²",
    density: "28,18 hab./km²",
    idhm: "0,600",
    schooling: "99,65%",
    gentilico: "piquet-carneirense",
    code: "2310902",
    created: "1957",
    origin: "Senador Pompeu",
    history:
      "A antiga povoação de Jiran tornou-se distrito de Senador Pompeu e, posteriormente, recebeu a denominação Piquet Carneiro em homenagem ao engenheiro Bernardo Piquet Carneiro. O município foi criado em 1957, desmembrado de Senador Pompeu.",
    source: "IBGE/IPECE — Histórico e Cidades e Estados",
  },
};

const nav = [
  ["Início", "/"],
  ["Atlas", "/atlas"],
  ["Municípios", "/municipios"],
  ["Memórias", "/memorias"],
  ["Acervo", "/acervo"],
  ["Participe", "/participe"],
  ["Pesquisa", "/pesquisa"],
  ["Ceará Científico", "/ceara-cientifico"],
  ["Admin", "/admin"],
];
const categories = [
  "Lugar de memória",
  "Patrimônio cultural",
  "Patrimônio natural",
  "Paisagem",
  "Educação",
  "Vida comunitária",
  "Religiosidade",
  "História local",
  "Outro",
  "Ferrovia",
  "Formação urbana",
  "Memória urbana",
  "Convivência",
  "Comércio",
  "Bairro",
  "Agricultura",
  "Comunidade",
  "Água",
  "Urbanização",
  "Memória rural",
  "Juventude",
  "Patrimônio",
  "Mobilidade",
  "Toponímia",
  "Política",
  "Democracia",
  "Distrito",
  "Patrimônio religioso",
  "Arquitetura",
  "Patrimônio arqueológico",
  "Identidade",
  "Memória",
  "Comunidade rural",
  "Memória comunitária",
];
const recordTypes = [
  "Memória / narrativa",
  "Memória comunitária",
  "Fotografia",
  "Documento",
  "Entrevista",
  "Áudio",
  "Vídeo",
  "Mapa",
  "Pesquisa de campo",
];
const go = (path: string) => {
  location.hash = path;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

type ProjectAlertDetail = {
  message: string;
  type?: "success" | "error" | "info";
  title?: string;
};

const projectAlert = (
  message: string,
  type: ProjectAlertDetail["type"] = "info",
  title?: string,
) => {
  window.dispatchEvent(
    new CustomEvent<ProjectAlertDetail>("mcd-project-alert", {
      detail: { message, type, title },
    }),
  );
};
const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) =>
  localStorage.setItem(key, JSON.stringify(value));
const loadAtlasPoints = (): AtlasPoint[] => {
  try {
    const stored = JSON.parse(localStorage.getItem("atlas-points") || "null");
    if (!Array.isArray(stored)) {
      save("atlas-points", demoPoints);
      return demoPoints;
    }
    const seededIds = new Set(demoPoints.map((p) => p.id));
    const userPoints = stored.filter(
      (p: any) => !seededIds.has(p.id),
    ) as AtlasPoint[];
    const merged = [...demoPoints, ...userPoints];
    save("atlas-points", merged);
    return merged;
  } catch {
    save("atlas-points", demoPoints);
    return demoPoints;
  }
};
async function fetchPublishedPoints(): Promise<AtlasPoint[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("atlas_points")
    .select(
      "id,project_id,title,municipality,category,record_type,latitude,longitude,story,period,contributor,source,status,rating,review_count,attachment_count,created_at",
    )
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.project_id || p.id,
    dbId: p.id,
    title: p.title,
    municipality: p.municipality,
    category: p.category,
    recordType: p.record_type,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    status: "published",
    story: p.story,
    period: p.period || "",
    contributor: p.contributor || "",
    source: p.source || "",
    rating: Number(p.rating || 0),
    reviewCount: Number(p.review_count || 0),
    attachmentCount: Number(p.attachment_count || 0),
  }));
}

async function getAtlasPointDbId(projectId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("atlas_points")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

async function insertAtlasPoint(point: AtlasPoint) {
  if (!supabase)
    throw new Error("Supabase não está configurado neste navegador.");
  // O Atlas trabalha com dois estados de entrada: pending (fila) e draft
  // (compatibilidade com bancos antigos). O primeiro é sempre tentado.
  // Se o projeto ainda tiver o CHECK antigo que aceita somente draft/published,
  // fazemos uma segunda tentativa como draft — que também aparece no Admin
  // como item aguardando revisão. Assim, um banco legado não quebra o envio.
  const payload = {
    id: point.id,
    project_id: point.id,
    title: point.title,
    municipality: point.municipality,
    category: point.category,
    record_type: point.recordType,
    latitude: point.latitude,
    longitude: point.longitude,
    story: point.story,
    period: point.period || null,
    contributor: point.contributor || null,
    source: point.source || null,
    status: "pending",
    rating: 0,
    review_count: 0,
    attachment_count: 0,
  };
  const first = await supabase.from("atlas_points").insert(payload);
  if (!first.error) return { id: point.id, status: "pending" as const };
  const message = first.error.message || "";
  if (!/status_check|check constraint|violates check constraint/i.test(message))
    throw first.error;
  const fallback = await supabase
    .from("atlas_points")
    .insert({ ...payload, status: "draft" });
  if (fallback.error) throw fallback.error;
  return { id: point.id, status: "draft" as const };
}

async function insertContribution(item: {
  id: string;
  title: string;
  municipality: string;
  locality?: string;
  story: string;
  period?: string;
  category?: string;
  recordType?: string;
  contributorName?: string;
  contributorEmail?: string;
  contributorPhone?: string;
  source?: string;
  latitude?: number;
  longitude?: number;
}) {
  if (!supabase) return null;
  const { error } = await supabase
    .from("contributions")
    .insert({
      id: item.id,
      title: item.title,
      municipality: item.municipality,
      locality: item.locality || null,
      story: item.story,
      category: item.category || "Memória",
      record_type: item.recordType || "memoria",
      period: item.period || null,
      contributor_name: item.contributorName || null,
      contributor_email: item.contributorEmail || null,
      contributor_phone: item.contributorPhone || null,
      source: item.source || null,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      status: "pending",
    });
  if (error) throw error;
  return { id: item.id };
}

async function fetchArchiveItems(): Promise<ArchiveItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("archive_items")
    .select("id,title,type,description,public_url,file_path,file_name,mime_type,file_size,created_at,updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    description: item.description || "",
    url:
      item.public_url ||
      supabase!.storage.from("atlas-archive").getPublicUrl(item.file_path).data.publicUrl,
    fileName: item.file_name,
    mimeType: item.mime_type || "",
    fileSize: Number(item.file_size || 0),
    created: new Date(item.created_at).toLocaleDateString("pt-BR"),
    updatedAt: item.updated_at || item.created_at,
  }));
}


async function uploadArchiveItem(
  file: File,
  title: string,
  type: string,
  description: string,
) {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.user_metadata?.role !== "admin") {
    throw new Error("Apenas administradores podem publicar itens no Acervo.");
  }
  const safeName =
    file.name
      .normalize("NFKD")
      .replace(/[^\w.\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(-120) || "arquivo";
  const path = `archive/${crypto.randomUUID()}-${safeName}`;

  // O bucket dedicado "atlas-archive" é criado pela migração v9.
  // Para instalações que ainda não executaram a migração, usamos
  // temporariamente o bucket público já existente "atlas-attachments".
  // Assim, o Acervo não quebra com "Bucket not found".
  let bucket = "atlas-archive";
  let { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (
    uploadError &&
    /bucket not found|not found|does not exist/i.test(uploadError.message || "")
  ) {
    bucket = "atlas-attachments";
    const fallback = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
    uploadError = fallback.error;
  }

  if (uploadError) {
    const message = uploadError.message || "";
    if (/bucket not found|not found|does not exist/i.test(message)) {
      throw new Error(
        'O armazenamento do Acervo não está configurado. Execute o arquivo "supabase-fix-v9-final.sql" no SQL Editor do Supabase.',
      );
    }
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  const { error } = await supabase.from("archive_items").insert({
    title,
    type,
    description: description || null,
    file_name: file.name,
    file_path: path,
    public_url: urlData.publicUrl,
    mime_type: file.type || null,
    file_size: file.size,
    status: "published",
    created_by: sessionData.session.user.id,
  });

  if (error) {
    await supabase.storage.from(bucket).remove([path]).catch(() => {});
    throw error;
  }
}

async function updateArchiveItem(
  id: string,
  values: { title: string; type: string; description: string },
  replacementFile?: File | null,
) {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.user_metadata?.role !== "admin") {
    throw new Error("Apenas administradores podem editar o Acervo.");
  }

  const { data: current, error: currentError } = await supabase
    .from("archive_items")
    .select("id,title,type,description,public_url,file_path,file_name,mime_type,file_size,status")
    .eq("id", id)
    .single();
  if (currentError) throw currentError;

  let nextFile: any = null;
  let oldPath: string | null = null;
  if (replacementFile) {
    const safeName = replacementFile.name
      .normalize("NFKD")
      .replace(/[^\w.\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(-120) || "arquivo";
    const path = `archive/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("atlas-archive")
      .upload(path, replacementFile, {
        upsert: false,
        contentType: replacementFile.type || undefined,
      });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage
      .from("atlas-archive")
      .getPublicUrl(path);
    nextFile = {
      file_name: replacementFile.name,
      file_path: path,
      public_url: urlData.publicUrl,
      mime_type: replacementFile.type || null,
      file_size: replacementFile.size,
    };
    oldPath = current.file_path;
  }

  const { error } = await supabase
    .from("archive_items")
    .update({
      title: values.title,
      type: values.type,
      description: values.description || null,
      ...(nextFile || {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (nextFile?.file_path) {
      await supabase.storage.from("atlas-archive").remove([nextFile.file_path]).catch(() => {});
    }
    throw error;
  }

  if (oldPath && nextFile) {
    await Promise.all([
      supabase.storage.from("atlas-archive").remove([oldPath]).catch(() => {}),
      supabase.storage.from("atlas-attachments").remove([oldPath]).catch(() => {}),
    ]);
  }
}

async function updateAtlasPoint(
  point: AtlasPoint,
  values: Partial<Pick<AtlasPoint, "title" | "municipality" | "category" | "recordType" | "latitude" | "longitude" | "story" | "period" | "contributor" | "source">>,
) {
  if (!supabase) throw new Error("Supabase não está configurado.");
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.user_metadata?.role !== "admin") {
    throw new Error("Apenas administradores podem editar pontos.");
  }
  const dbId = point.dbId || (await getAtlasPointDbId(point.id));
  if (!dbId) throw new Error("O ponto não foi encontrado no banco de dados.");
  const { error } = await supabase
    .from("atlas_points")
    .update({
      ...(values.title !== undefined ? { title: values.title } : {}),
      ...(values.municipality !== undefined ? { municipality: values.municipality } : {}),
      ...(values.category !== undefined ? { category: values.category } : {}),
      ...(values.recordType !== undefined ? { record_type: values.recordType } : {}),
      ...(values.latitude !== undefined ? { latitude: values.latitude } : {}),
      ...(values.longitude !== undefined ? { longitude: values.longitude } : {}),
      ...(values.story !== undefined ? { story: values.story } : {}),
      ...(values.period !== undefined ? { period: values.period || null } : {}),
      ...(values.contributor !== undefined ? { contributor: values.contributor || null } : {}),
      ...(values.source !== undefined ? { source: values.source || null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", dbId);
  if (error) throw error;
}

async function uploadSupabaseAttachments(
  files: File[],
  options: { atlasPointDbId?: string | null; contributionId?: string | null },
) {
  if (!supabase || !files.length) return [];
  const uploaded: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    path: string;
  }[] = [];
  for (const file of files) {
    const safeName =
      file.name
        .normalize("NFKD")
        .replace(/[^\w.\- ]+/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(-120) || "arquivo";
    const parent = options.atlasPointDbId
      ? `points/${options.atlasPointDbId}`
      : `contributions/${options.contributionId}`;
    const path = `${parent}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("atlas-attachments")
      .upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage
      .from("atlas-attachments")
      .getPublicUrl(path);
    const { data: row, error: rowError } = await supabase
      .from("attachments")
      .insert({
        atlas_point_id: options.atlasPointDbId || null,
        contribution_id: options.contributionId || null,
        file_name: file.name,
        file_path: path,
        public_url: urlData.publicUrl,
        mime_type: file.type || null,
        file_size: file.size,
      })
      .select()
      .single();
    if (rowError) throw rowError;
    uploaded.push({
      id: row.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: urlData.publicUrl,
      path,
    });
  }
  if (options.atlasPointDbId) {
    const { count } = await supabase
      .from("attachments")
      .select("id", { count: "exact", head: true })
      .eq("atlas_point_id", options.atlasPointDbId);
    await supabase
      .from("atlas_points")
      .update({ attachment_count: count || 0 })
      .eq("id", options.atlasPointDbId);
  }
  return uploaded;
}

async function fetchSupabaseAttachments(projectId: string) {
  const client = supabase;
  if (!client) return [] as Array<AttachmentMeta & { id: string; url: string }>;
  const dbId = await getAtlasPointDbId(projectId);
  if (!dbId) return [];
  const { data, error } = await client
    .from("attachments")
    .select("id,file_name,mime_type,file_size,public_url,file_path")
    .eq("atlas_point_id", dbId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((a: any) => ({
    id: a.id,
    name: a.file_name,
    type: a.mime_type || "",
    size: Number(a.file_size || 0),
    url:
      a.public_url ||
      client.storage.from("atlas-attachments").getPublicUrl(a.file_path).data
        .publicUrl,
  }));
}

async function fetchReviews(pointId: string): Promise<Review[]> {
  if (!supabase) return [];
  const dbId = await getAtlasPointDbId(pointId);
  if (!dbId) return [];
  const { data, error } = await supabase
    .from("point_reviews")
    .select("id,atlas_point_id,reviewer_name,rating,comment,created_at")
    .eq("atlas_point_id", dbId)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    pointId: pointId,
    name: r.reviewer_name,
    text: r.comment,
    rating: r.rating,
    created: new Date(r.created_at).toLocaleDateString("pt-BR"),
  }));
}

async function insertReview(pointId: string, review: Review) {
  if (!supabase) return;
  const dbId = await getAtlasPointDbId(pointId);
  if (!dbId) throw new Error("Ponto não encontrado no Supabase.");
  const { error } = await supabase
    .from("point_reviews")
    .insert({
      id: review.id,
      atlas_point_id: dbId,
      reviewer_name: review.name,
      rating: review.rating,
      comment: review.text,
    });
  if (error) throw error;
  const { data: reviewRows } = await supabase
    .from("point_reviews")
    .select("rating")
    .eq("atlas_point_id", dbId)
    .eq("approved", true);
  const rows = reviewRows || [];
  const avg = rows.length
    ? Number(
        (
          rows.reduce((sum: number, r: any) => sum + Number(r.rating), 0) /
          rows.length
        ).toFixed(1),
      )
    : 0;
  await supabase
    .from("atlas_points")
    .update({ rating: avg, review_count: rows.length })
    .eq("id", dbId);
}

async function fetchPublishedContributions(): Promise<Contribution[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("contributions")
    .select(
      "id,project_id,title,municipality,category,record_type,latitude,longitude,story,period,contributor,source,status,rating,review_count,attachment_count,created_at",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data || [];
  const ids = rows.map((c: any) => c.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: files } = await supabase
      .from("attachments")
      .select("id,contribution_id")
      .in("contribution_id", ids);
    (files || []).forEach((f: any) => {
      counts[f.contribution_id] = (counts[f.contribution_id] || 0) + 1;
    });
  }
  return rows.map((c: any) => ({
    id: c.id,
    title: c.title,
    municipality: c.municipality,
    text: c.story,
    status: "published",
    created: new Date(c.created_at).toLocaleDateString("pt-BR"),
    latitude: c.latitude ?? undefined,
    longitude: c.longitude ?? undefined,
    attachmentCount: counts[c.id] || 0,
  }));
}

const demoPoints: AtlasPoint[] = [
  {
    id: "A01",
    title: "Estação Ferroviária de Acopiara",
    municipality: "Acopiara",
    category: "Ferrovia",
    recordType: "Memória / narrativa",
    latitude: -6.0919,
    longitude: -39.4518,
    status: "published",
    story:
      "A estação lembra o período em que a ferrovia passou a fazer parte da vida da cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A02",
    title: "Antiga área de Lages",
    municipality: "Acopiara",
    category: "Formação urbana",
    recordType: "Memória / narrativa",
    latitude: -6.092,
    longitude: -39.452,
    status: "published",
    story:
      "Antes de ser conhecida como Acopiara, a povoação era chamada Lages.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A03",
    title: "Centro de Acopiara",
    municipality: "Acopiara",
    category: "Memória urbana",
    recordType: "Memória / narrativa",
    latitude: -6.0915,
    longitude: -39.4525,
    status: "published",
    story:
      "Caminhar pelo centro é perceber como as antigas ruas continuam fazendo parte da vida cotidiana.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A04",
    title: "Igreja Matriz",
    municipality: "Acopiara",
    category: "Religiosidade",
    recordType: "Memória / narrativa",
    latitude: -6.0921,
    longitude: -39.4529,
    status: "published",
    story:
      "As festas religiosas sempre foram momentos importantes de encontro entre famílias.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A05",
    title: "Praça central",
    municipality: "Acopiara",
    category: "Convivência",
    recordType: "Memória / narrativa",
    latitude: -6.0917,
    longitude: -39.4521,
    status: "published",
    story:
      "A praça era um lugar onde gerações diferentes se encontravam para conversar.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A06",
    title: "Mercado Público",
    municipality: "Acopiara",
    category: "Comércio",
    recordType: "Memória / narrativa",
    latitude: -6.0924,
    longitude: -39.4517,
    status: "published",
    story:
      "A feira reunia produtores, comerciantes e moradores das comunidades rurais.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A07",
    title: "Bairro Moreiras",
    municipality: "Acopiara",
    category: "Bairro",
    recordType: "Memória / narrativa",
    latitude: -6.0878,
    longitude: -39.446,
    status: "published",
    story:
      "Muitos moradores acompanharam a transformação de espaços antes pouco ocupados em novas áreas da cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A08",
    title: "Área rural de Acopiara",
    municipality: "Acopiara",
    category: "Agricultura",
    recordType: "Memória / narrativa",
    latitude: -6.145,
    longitude: -39.5,
    status: "published",
    story:
      "Quando chegam as chuvas, a paisagem do sertão muda e a esperança de uma boa colheita aumenta.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A09",
    title: "Zona rural — comunidade",
    municipality: "Acopiara",
    category: "Comunidade",
    recordType: "Memória / narrativa",
    latitude: -6.12,
    longitude: -39.52,
    status: "published",
    story: "Os mutirões ajudavam famílias e vizinhos nas tarefas do campo.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A10",
    title: "Açude/localidade rural",
    municipality: "Acopiara",
    category: "Água",
    recordType: "Memória / narrativa",
    latitude: -6.115,
    longitude: -39.475,
    status: "published",
    story: "A água sempre teve importância especial para quem vive no sertão.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A11",
    title: "Antigo caminho ferroviário",
    municipality: "Acopiara",
    category: "Ferrovia",
    recordType: "Memória / narrativa",
    latitude: -6.095,
    longitude: -39.46,
    status: "published",
    story:
      "Os trilhos modificaram a circulação de pessoas e mercadorias pela região.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A12",
    title: "Área urbana próxima à ferrovia",
    municipality: "Acopiara",
    category: "Urbanização",
    recordType: "Memória / narrativa",
    latitude: -6.094,
    longitude: -39.455,
    status: "published",
    story:
      "A presença da ferrovia contribuiu para novos movimentos e atividades na povoação.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A13",
    title: "Comunidade rural",
    municipality: "Acopiara",
    category: "Memória rural",
    recordType: "Memória / narrativa",
    latitude: -6.13,
    longitude: -39.48,
    status: "published",
    story:
      "As histórias das famílias do campo ajudam a compreender a formação do território.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A14",
    title: "Praça / espaço de convivência",
    municipality: "Acopiara",
    category: "Juventude",
    recordType: "Memória / narrativa",
    latitude: -6.0908,
    longitude: -39.453,
    status: "published",
    story:
      "Muitos jovens transformaram as praças em pontos de encontro depois da escola.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A15",
    title: "Escola pública",
    municipality: "Acopiara",
    category: "Educação",
    recordType: "Memória / narrativa",
    latitude: -6.09,
    longitude: -39.45,
    status: "published",
    story:
      "A escola aparece nas lembranças de várias gerações como espaço de aprendizado e convivência.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A16",
    title: "Centro comercial",
    municipality: "Acopiara",
    category: "Comércio",
    recordType: "Memória / narrativa",
    latitude: -6.092,
    longitude: -39.4505,
    status: "published",
    story: "O comércio ajuda a contar a história cotidiana da cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A17",
    title: "Área de antigas residências",
    municipality: "Acopiara",
    category: "Patrimônio",
    recordType: "Memória / narrativa",
    latitude: -6.093,
    longitude: -39.454,
    status: "published",
    story: "As casas antigas guardam marcas de diferentes períodos da cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A18",
    title: "Zona rural",
    municipality: "Acopiara",
    category: "Agricultura",
    recordType: "Memória / narrativa",
    latitude: -6.16,
    longitude: -39.51,
    status: "published",
    story:
      "O trabalho agrícola continua sendo parte importante das relações entre famílias e território.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A19",
    title: "Estrada rural",
    municipality: "Acopiara",
    category: "Mobilidade",
    recordType: "Memória / narrativa",
    latitude: -6.11,
    longitude: -39.49,
    status: "published",
    story: "As estradas conectam comunidades rurais ao centro urbano.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "A20",
    title: "Paisagem sertaneja",
    municipality: "Acopiara",
    category: "Paisagem",
    recordType: "Memória / narrativa",
    latitude: -6.14,
    longitude: -39.46,
    status: "published",
    story:
      "A caatinga, os açudes e as áreas agrícolas compõem uma paisagem que também é memória.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C01",
    title: "Centro de Catarina",
    municipality: "Catarina",
    category: "Formação urbana",
    recordType: "Memória / narrativa",
    latitude: -6.1229,
    longitude: -39.8736,
    status: "published",
    story:
      "O centro reúne espaços que atravessaram diferentes fases da história municipal.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C02",
    title: "Igreja de São José",
    municipality: "Catarina",
    category: "Religiosidade",
    recordType: "Memória / narrativa",
    latitude: -6.1232,
    longitude: -39.8739,
    status: "published",
    story:
      "A construção da capela de São José, em 1913, está ligada à formação histórica da localidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C03",
    title: "Antigo Sítio Santa Catarina",
    municipality: "Catarina",
    category: "Origem",
    recordType: "Memória / narrativa",
    latitude: -6.124,
    longitude: -39.875,
    status: "published",
    story:
      "O nome Santa Catarina aparece na própria história de formação da localidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C04",
    title: "Praça central",
    municipality: "Catarina",
    category: "Convivência",
    recordType: "Memória / narrativa",
    latitude: -6.1225,
    longitude: -39.8732,
    status: "published",
    story:
      "A praça reúne lembranças de encontros, festas e conversas entre moradores.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C05",
    title: "Mercado/feira",
    municipality: "Catarina",
    category: "Comércio",
    recordType: "Memória / narrativa",
    latitude: -6.1226,
    longitude: -39.8728,
    status: "published",
    story: "A feira aproxima a produção rural e a vida urbana.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C06",
    title: "Centro histórico",
    municipality: "Catarina",
    category: "Patrimônio",
    recordType: "Memória / narrativa",
    latitude: -6.123,
    longitude: -39.874,
    status: "published",
    story: "Cada rua pode guardar lembranças de antigas famílias e atividades.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C07",
    title: "Bairro urbano",
    municipality: "Catarina",
    category: "Expansão urbana",
    recordType: "Memória / narrativa",
    latitude: -6.119,
    longitude: -39.8685,
    status: "published",
    story:
      "A cidade cresceu e novos bairros passaram a fazer parte da paisagem.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C08",
    title: "Área rural",
    municipality: "Catarina",
    category: "Agricultura",
    recordType: "Memória / narrativa",
    latitude: -6.15,
    longitude: -39.9,
    status: "published",
    story:
      "O ciclo das chuvas interfere diretamente na vida e no trabalho das famílias rurais.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C09",
    title: "Comunidade rural",
    municipality: "Catarina",
    category: "Comunidade",
    recordType: "Memória / narrativa",
    latitude: -6.145,
    longitude: -39.885,
    status: "published",
    story:
      "As comunidades guardam histórias que nem sempre aparecem nos livros.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C10",
    title: "Estrada rural",
    municipality: "Catarina",
    category: "Mobilidade",
    recordType: "Memória / narrativa",
    latitude: -6.135,
    longitude: -39.86,
    status: "published",
    story:
      "Durante décadas, as estradas foram fundamentais para ligar comunidades e sede municipal.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C11",
    title: "Escola antiga",
    municipality: "Catarina",
    category: "Educação",
    recordType: "Memória / narrativa",
    latitude: -6.121,
    longitude: -39.875,
    status: "published",
    story:
      "A escola aparece na memória de várias gerações como espaço de encontro.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C12",
    title: "Praça de convivência",
    municipality: "Catarina",
    category: "Juventude",
    recordType: "Memória / narrativa",
    latitude: -6.124,
    longitude: -39.872,
    status: "published",
    story:
      "Os jovens encontravam na praça um dos principais lugares para conversar e conviver.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C13",
    title: "Área agrícola",
    municipality: "Catarina",
    category: "Agricultura",
    recordType: "Memória / narrativa",
    latitude: -6.16,
    longitude: -39.88,
    status: "published",
    story:
      "O trabalho da terra conecta famílias, território e conhecimento tradicional.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C14",
    title: "Igreja / entorno",
    municipality: "Catarina",
    category: "Patrimônio religioso",
    recordType: "Memória / narrativa",
    latitude: -6.1235,
    longitude: -39.8742,
    status: "published",
    story:
      "As festas religiosas funcionavam também como momentos de encontro comunitário.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C15",
    title: "Centro comercial",
    municipality: "Catarina",
    category: "Comércio",
    recordType: "Memória / narrativa",
    latitude: -6.1218,
    longitude: -39.8725,
    status: "published",
    story:
      "O comércio registra mudanças no modo de viver e circular pela cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C16",
    title: "Antigas casas",
    municipality: "Catarina",
    category: "Arquitetura",
    recordType: "Memória / narrativa",
    latitude: -6.1245,
    longitude: -39.875,
    status: "published",
    story:
      "Casas antigas podem revelar diferentes momentos da formação urbana.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C17",
    title: "Zona rural",
    municipality: "Catarina",
    category: "Paisagem",
    recordType: "Memória / narrativa",
    latitude: -6.175,
    longitude: -39.91,
    status: "published",
    story:
      "A paisagem rural preserva práticas e conhecimentos transmitidos entre gerações.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C18",
    title: "Açude / área hídrica",
    municipality: "Catarina",
    category: "Água",
    recordType: "Memória / narrativa",
    latitude: -6.14,
    longitude: -39.89,
    status: "published",
    story: "A água é uma das memórias mais presentes na vida sertaneja.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C19",
    title: "Estrada de acesso",
    municipality: "Catarina",
    category: "Mobilidade",
    recordType: "Memória / narrativa",
    latitude: -6.11,
    longitude: -39.85,
    status: "published",
    story: "As estradas conectam Catarina a outras cidades e comunidades.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "C20",
    title: "Paisagem rural",
    municipality: "Catarina",
    category: "Identidade",
    recordType: "Memória / narrativa",
    latitude: -6.155,
    longitude: -39.92,
    status: "published",
    story:
      "O território rural também participa da construção da identidade catarinense.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I01",
    title: "Centro de Deputado Irapuan Pinheiro",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Formação urbana",
    recordType: "Memória / narrativa",
    latitude: -5.9009,
    longitude: -39.2044,
    status: "published",
    story:
      "A cidade atual carrega diferentes nomes e momentos de sua história administrativa.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I02",
    title: "Antiga Tataíra",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Toponímia",
    recordType: "Memória / narrativa",
    latitude: -5.9009,
    longitude: -39.2044,
    status: "published",
    story: "Tataíra foi uma das denominações históricas da atual cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I03",
    title: "Antigo São Bernardo",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Toponímia",
    recordType: "Memória / narrativa",
    latitude: -5.901,
    longitude: -39.205,
    status: "published",
    story: "Antes de Tataíra, a localidade era conhecida como São Bernardo.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I04",
    title: "Praça central",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Convivência",
    recordType: "Memória / narrativa",
    latitude: -5.9013,
    longitude: -39.2048,
    status: "published",
    story: "A praça representa um espaço cotidiano de encontro entre gerações.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I05",
    title: "Igreja / área central",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Religiosidade",
    recordType: "Memória / narrativa",
    latitude: -5.901,
    longitude: -39.205,
    status: "published",
    story:
      "As celebrações religiosas integram as memórias coletivas da comunidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I06",
    title: "Centro administrativo",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Política",
    recordType: "Memória / narrativa",
    latitude: -5.9007,
    longitude: -39.204,
    status: "published",
    story:
      "A emancipação municipal transformou a relação da comunidade com a administração pública.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I07",
    title: "Câmara Municipal",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Democracia",
    recordType: "Memória / narrativa",
    latitude: -5.9015,
    longitude: -39.2038,
    status: "published",
    story:
      "A Câmara representa um espaço institucional relacionado à participação política local.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I08",
    title: "Rua dos Três Poderes",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Democracia",
    recordType: "Memória / narrativa",
    latitude: -5.9014,
    longitude: -39.2038,
    status: "published",
    story:
      "Os espaços públicos ajudam a visualizar como a cidade organiza sua vida política.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I09",
    title: "Bairro Centro",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Urbanização",
    recordType: "Memória / narrativa",
    latitude: -5.8998,
    longitude: -39.2035,
    status: "published",
    story:
      "As ruas do centro preservam lembranças das transformações da cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I10",
    title: "Betânia",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Distrito",
    recordType: "Memória / narrativa",
    latitude: -5.95,
    longitude: -39.23,
    status: "published",
    story:
      "As comunidades e distritos também fazem parte da construção da identidade municipal.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I11",
    title: "Baixio",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Distrito",
    recordType: "Memória / narrativa",
    latitude: -5.88,
    longitude: -39.18,
    status: "published",
    story:
      "As localidades rurais preservam histórias próprias dentro do município.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I12",
    title: "Aurora",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Distrito",
    recordType: "Memória / narrativa",
    latitude: -5.93,
    longitude: -39.19,
    status: "published",
    story:
      "Cada comunidade possui memórias que ajudam a construir uma história municipal plural.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I13",
    title: "Maratoã",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Distrito",
    recordType: "Memória / narrativa",
    latitude: -5.92,
    longitude: -39.17,
    status: "published",
    story:
      "As memórias das localidades ajudam a ampliar a história para além da sede.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I14",
    title: "Velame",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Distrito",
    recordType: "Memória / narrativa",
    latitude: -5.88,
    longitude: -39.25,
    status: "published",
    story:
      "O cotidiano das comunidades rurais revela outras formas de viver o território.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I15",
    title: "Zona rural",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Agricultura",
    recordType: "Memória / narrativa",
    latitude: -5.93,
    longitude: -39.23,
    status: "published",
    story:
      "Agricultura e convivência com o semiárido fazem parte das experiências locais.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I16",
    title: "Comunidade rural",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Comunidade",
    recordType: "Memória / narrativa",
    latitude: -5.915,
    longitude: -39.22,
    status: "published",
    story:
      "O conhecimento transmitido entre famílias também é patrimônio cultural.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I17",
    title: "Estrada rural",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Mobilidade",
    recordType: "Memória / narrativa",
    latitude: -5.91,
    longitude: -39.25,
    status: "published",
    story:
      "As estradas ligam a sede às comunidades e fazem parte da rotina dos moradores.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I18",
    title: "Área de açude",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Água",
    recordType: "Memória / narrativa",
    latitude: -5.925,
    longitude: -39.21,
    status: "published",
    story:
      "A memória da água aparece associada à sobrevivência, agricultura e convivência.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I19",
    title: "Escola",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Educação",
    recordType: "Memória / narrativa",
    latitude: -5.9,
    longitude: -39.206,
    status: "published",
    story:
      "A escola é um dos lugares onde diferentes gerações constroem memórias.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "I20",
    title: "Área de convivência",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Juventude",
    recordType: "Memória / narrativa",
    latitude: -5.902,
    longitude: -39.202,
    status: "published",
    story:
      "Os espaços de convivência também fazem parte das memórias dos jovens.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P01",
    title: "Estação Ferroviária",
    municipality: "Piquet Carneiro",
    category: "Ferrovia",
    recordType: "Memória / narrativa",
    latitude: -5.8033,
    longitude: -39.4171,
    status: "published",
    story: "A estação está diretamente ligada às origens de Piquet Carneiro.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P02",
    title: "Antiga povoação de Jirau",
    municipality: "Piquet Carneiro",
    category: "Formação urbana",
    recordType: "Memória / narrativa",
    latitude: -5.8033,
    longitude: -39.4171,
    status: "published",
    story: "Antes do atual nome, a antiga povoação era conhecida como Jirau.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P03",
    title: "Praça da Matriz",
    municipality: "Piquet Carneiro",
    category: "Convivência",
    recordType: "Memória / narrativa",
    latitude: -5.8035,
    longitude: -39.4176,
    status: "published",
    story: "A praça é lembrada como espaço de encontro e convivência.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P04",
    title: "Igreja Matriz do Sagrado Coração de Jesus",
    municipality: "Piquet Carneiro",
    category: "Religiosidade",
    recordType: "Memória / narrativa",
    latitude: -5.8038,
    longitude: -39.4175,
    status: "published",
    story: "A igreja integra a paisagem e a memória religiosa da cidade.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P05",
    title: "Monumento do Cruzeiro",
    municipality: "Piquet Carneiro",
    category: "Patrimônio",
    recordType: "Memória / narrativa",
    latitude: -5.805,
    longitude: -39.4185,
    status: "published",
    story:
      "O Cruzeiro é um dos marcos que ajudam a preservar referências da memória local.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P06",
    title: "Memorial J. da Penha",
    municipality: "Piquet Carneiro",
    category: "Memória",
    recordType: "Memória / narrativa",
    latitude: -5.92,
    longitude: -39.39,
    status: "published",
    story:
      "O memorial amplia a possibilidade de conhecer histórias além da sede municipal.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P07",
    title: "Ibicuã",
    municipality: "Piquet Carneiro",
    category: "Patrimônio arqueológico",
    recordType: "Memória / narrativa",
    latitude: -5.9,
    longitude: -39.39,
    status: "published",
    story:
      "Ibicuã aparece em registros de sítios históricos associados à ferrovia.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P08",
    title: "Monte Sinai",
    municipality: "Piquet Carneiro",
    category: "Patrimônio arqueológico",
    recordType: "Memória / narrativa",
    latitude: -5.88,
    longitude: -39.38,
    status: "published",
    story:
      "Monte Sinai integra os registros de sítios históricos relacionados ao trecho ferroviário.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P09",
    title: "Piquet Carneiro I",
    municipality: "Piquet Carneiro",
    category: "Patrimônio arqueológico",
    recordType: "Memória / narrativa",
    latitude: -5.85,
    longitude: -39.41,
    status: "published",
    story:
      "O sítio Piquet Carneiro I aparece em documentação arqueológica ligada à ferrovia.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_verificado",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P10",
    title: "Centro histórico",
    municipality: "Piquet Carneiro",
    category: "Formação urbana",
    recordType: "Memória / narrativa",
    latitude: -5.8038,
    longitude: -39.417,
    status: "published",
    story:
      "O centro preserva referências do crescimento da cidade associado à ferrovia.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P11",
    title: "Antigo trecho ferroviário",
    municipality: "Piquet Carneiro",
    category: "Ferrovia",
    recordType: "Memória / narrativa",
    latitude: -5.81,
    longitude: -39.425,
    status: "published",
    story:
      "Os trilhos ajudaram a conectar a população local a outros pontos do Ceará.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P12",
    title: "Área próxima à estação",
    municipality: "Piquet Carneiro",
    category: "Urbanização",
    recordType: "Memória / narrativa",
    latitude: -5.804,
    longitude: -39.416,
    status: "published",
    story:
      "A estação funcionava como ponto de circulação de pessoas e mercadorias.",
    period: "",
    contributor: "",
    source:
      "Base inicial do Atlas · status editorial: memoria_historica_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P13",
    title: "Ibicuã",
    municipality: "Piquet Carneiro",
    category: "Comunidade",
    recordType: "Memória / narrativa",
    latitude: -5.92,
    longitude: -39.39,
    status: "published",
    story: "As localidades do município também preservam memórias próprias.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P14",
    title: "Zona rural",
    municipality: "Piquet Carneiro",
    category: "Agricultura",
    recordType: "Memória / narrativa",
    latitude: -5.84,
    longitude: -39.45,
    status: "published",
    story:
      "A agricultura faz parte das experiências e estratégias de sobrevivência no território sertanejo.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P15",
    title: "Estrada rural",
    municipality: "Piquet Carneiro",
    category: "Mobilidade",
    recordType: "Memória / narrativa",
    latitude: -5.83,
    longitude: -39.44,
    status: "published",
    story:
      "As estradas complementam as antigas rotas de circulação criadas pela ferrovia.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P16",
    title: "Área de convivência",
    municipality: "Piquet Carneiro",
    category: "Juventude",
    recordType: "Memória / narrativa",
    latitude: -5.802,
    longitude: -39.416,
    status: "published",
    story:
      "Os espaços públicos continuam funcionando como lugares de encontro.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P17",
    title: "Mercado / comércio",
    municipality: "Piquet Carneiro",
    category: "Comércio",
    recordType: "Memória / narrativa",
    latitude: -5.8035,
    longitude: -39.4165,
    status: "published",
    story:
      "A circulação provocada pela ferrovia também ajuda a compreender a dinâmica comercial local.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: historico_contextual",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P18",
    title: "Área residencial antiga",
    municipality: "Piquet Carneiro",
    category: "Arquitetura",
    recordType: "Memória / narrativa",
    latitude: -5.805,
    longitude: -39.415,
    status: "published",
    story:
      "As construções antigas podem revelar diferentes momentos do crescimento urbano.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P19",
    title: "Comunidade rural",
    municipality: "Piquet Carneiro",
    category: "Memória comunitária",
    recordType: "Memória / narrativa",
    latitude: -5.87,
    longitude: -39.43,
    status: "published",
    story:
      "As histórias das comunidades complementam a história oficial do município.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: campo_pendente",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
  {
    id: "P20",
    title: "Paisagem sertaneja",
    municipality: "Piquet Carneiro",
    category: "Identidade",
    recordType: "Memória / narrativa",
    latitude: -5.85,
    longitude: -39.46,
    status: "published",
    story:
      "A paisagem do sertão é parte da identidade construída pelos moradores.",
    period: "",
    contributor: "",
    source: "Base inicial do Atlas · status editorial: memoria_ilustrativa",
    rating: 0,
    reviewCount: 0,
    attachmentCount: 0,
  },
];

const DB_NAME = "memorias-atlas-db";
const DB_VERSION = 1;
const STORE = "attachments";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveFiles(
  ownerId: string,
  files: File[],
): Promise<AttachmentMeta[]> {
  if (!files.length) return [];
  const db = await openDB();
  const metas: AttachmentMeta[] = [];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    files.forEach((file) => {
      const id = crypto.randomUUID();
      store.put({
        id,
        ownerId,
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
      });
      metas.push({ name: file.name, type: file.type, size: file.size });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return metas;
}
async function getFiles(
  ownerId: string,
): Promise<Array<AttachmentMeta & { id: string; url: string }>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result || [])
        .filter((r: any) => r.ownerId === ownerId)
        .map((r: any) => ({ ...r, url: URL.createObjectURL(r.blob) }));
      resolve(rows);
      db.close();
    };
    req.onerror = () => {
      reject(req.error);
      db.close();
    };
  });
}
async function deleteFiles(ownerId: string) {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      (req.result || [])
        .filter((r: any) => r.ownerId === ownerId)
        .forEach((r: any) => store.delete(r.id));
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function openLibrasWidget() {
  const clickWidget = () => {
    try {
      const button = window.VLibrasWidget?.initBtn;
      if (button) {
        button.click();
        return true;
      }
    } catch {}
    return false;
  };
  if (clickWidget()) return;
  const existing = document.querySelector(
    "script[data-mcd-vlibras]",
  ) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener("load", () => setTimeout(clickWidget, 500), {
      once: true,
    });
    return;
  }
  const script = document.createElement("script");
  script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  script.async = true;
  script.dataset.mcdVlibras = "true";
  script.onload = () => setTimeout(clickWidget, 700);
  document.body.appendChild(script);
}

function App() {
  useEffect(() => {
    console.info(
      "[MCD] Supabase v4 — envio sem consulta à tabela municipalities",
    );
  }, []);
  const [path, setPath] = useState(location.hash.slice(1) || "/");
  const [projectAlertState, setProjectAlertState] =
    useState<ProjectAlertDetail | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("atlas-theme") === "dark" ? "dark" : "light",
  );
  const [menu, setMenu] = useState(false);
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem("atlas-high-contrast") === "true",
  );
  const [hoverSpeech, setHoverSpeech] = useState(
    () => localStorage.getItem("atlas-hover-speech") === "true",
  );
  useEffect(() => {
    if (document.querySelector("script[data-mcd-vlibras]")) return;
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.dataset.mcdVlibras = "true";
    document.body.appendChild(script);
    return () => {};
  }, []);
  useEffect(() => {
    const onProjectAlert = (event: Event) => {
      const custom = event as CustomEvent<ProjectAlertDetail>;
      setProjectAlertState(custom.detail);
    };
    window.addEventListener("mcd-project-alert", onProjectAlert);
    return () => window.removeEventListener("mcd-project-alert", onProjectAlert);
  }, []);
  useEffect(() => {
    const update = () => {
      setPath(location.hash.slice(1) || "/");
      setMenu(false);
    };
    addEventListener("hashchange", update);
    return () => removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("atlas-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast
      ? "high"
      : "normal";
    localStorage.setItem("atlas-high-contrast", String(highContrast));
  }, [highContrast]);
  useEffect(() => {
    document.documentElement.dataset.speech = hoverSpeech ? "on" : "off";
    localStorage.setItem("atlas-hover-speech", String(hoverSpeech));
    if (!hoverSpeech) window.speechSynthesis?.cancel();
    if (!hoverSpeech) return;
    let timer: number | undefined;
    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "h1,h2,h3,h4,h5,h6,p,a,button,label,li,dt,dd,blockquote,figcaption",
      );
      if (!target || target.closest("[data-no-speech],.leaflet-container"))
        return;
      const text = (target.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length < 3 || text.length > 320) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 0.96;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }, 90);
    };
    document.addEventListener("mouseover", onOver);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseover", onOver);
      window.speechSynthesis?.cancel();
    };
  }, [hoverSpeech]);
  const pages: Record<string, ReactNode> = {
    "/": <Home />,
    "/atlas": <Atlas />,
    "/municipios": <Municipalities />,
    "/memorias": <Memories />,
    "/acervo": <ArchivePage />,
    "/participe": <Participate />,
    "/pesquisa": <Research />,
    "/ceara-cientifico": <CearaCientifico />,
    "/admin": <Admin />,
    "/privacidade": <LegalPage kind="privacy" />,
    "/termos": <LegalPage kind="terms" />,
  };
  const municipalityPath = path.startsWith("/municipios/")
    ? path.split("/")[2]
    : "";
  return (
    <>
      {projectAlertState && (
        <ProjectAlert
          detail={projectAlertState}
          onClose={() => setProjectAlertState(null)}
        />
      )}
      <Header
        path={path}
        menu={menu}
        setMenu={setMenu}
        theme={theme}
        setTheme={setTheme}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        hoverSpeech={hoverSpeech}
        setHoverSpeech={setHoverSpeech}
        onLibras={openLibrasWidget}
      />
      <div key={path} className="route-transition">
        {municipalityPath &&
        municipalityData[
          Object.keys(municipalityData).find(
            (k) => municipalityData[k].slug === municipalityPath,
          ) || ""
        ] ? (
          <MunicipalityDetail
            data={
              municipalityData[
                Object.keys(municipalityData).find(
                  (k) => municipalityData[k].slug === municipalityPath,
                ) || ""
              ]
            }
          />
        ) : (
          pages[path] || <Home />
        )}
      </div>
      <Footer />
    </>
  );
}

function Header({
  path,
  menu,
  setMenu,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  hoverSpeech,
  setHoverSpeech,
  onLibras,
}: {
  path: string;
  menu: boolean;
  setMenu: (open: boolean) => void;
  theme: string;
  setTheme: (theme: "light" | "dark") => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  hoverSpeech: boolean;
  setHoverSpeech: (value: boolean) => void;
  onLibras: () => void;
}) {
  const [term, setTerm] = useState(
  () => localStorage.getItem("atlas-global-search") || "",
);

const [accessOpen, setAccessOpen] = useState(false);

const searchSuggestions = useMemo(() => {
  const query = term.trim().toLowerCase();

  if (!query) return [];

  const items = [
    ...demoPoints.map((point) => ({
      label: point.title,
      detail: `${point.municipality} · ${point.category}`,
      value: point.title,
    })),

    ...townNames.map((town) => ({
      label: town,
      detail: "Município",
      value: town,
    })),

    ...categories.map((category) => ({
      label: category,
      detail: "Categoria",
      value: category,
    })),

    ...recordTypes.map((type) => ({
      label: type,
      detail: "Tipo de registro",
      value: type,
    })),
  ];

  const unique = items.filter(
    (item, index, array) =>
      array.findIndex(
        (other) =>
          other.label.toLowerCase() === item.label.toLowerCase(),
      ) === index,
  );

  return unique
    .filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.detail.toLowerCase().includes(query),
    )
    .slice(0, 7);
}, [term]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("atlas-global-search", term.trim());
    go("/atlas");
  };
  return (
    <header className="final-header">
      <a className="final-brand" href="#/">
        <img
          className="brand-logo-image"
          src={logoImage}
          alt="Memórias que Constroem Democracia"
        />
        <span>
          MEMÓRIAS<small>atlas participativo</small>
        </span>
      </a>
      <nav className={menu ? "open" : ""}>
        {nav.map(([label, to]) => (
          <a key={to} className={path === to ? "active" : ""} href={"#" + to}>
            {label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <form className="header-search" onSubmit={submit}>
  <Search />

  <input
    value={term}
    onChange={(e) => setTerm(e.target.value)}
    placeholder="Buscar no Atlas"
    aria-label="Buscar no Atlas"
    autoComplete="off"
  />

  {searchSuggestions.length > 0 && (
    <div
      className="header-search-suggestions"
      role="listbox"
      aria-label="Sugestões de pesquisa"
    >
      {searchSuggestions.map((suggestion) => (
        <button
          key={`${suggestion.detail}-${suggestion.label}`}
          type="button"
          className="search-suggestion"
          onClick={() => {
            setTerm(suggestion.value);
            localStorage.setItem(
              "atlas-global-search",
              suggestion.value,
            );
            go("/atlas");
          }}
        >
          <span className="search-suggestion-icon">
            <Search />
          </span>

          <span className="search-suggestion-text">
            <strong>{suggestion.label}</strong>
            <small>{suggestion.detail}</small>
          </span>

          <ChevronRight />
        </button>
      ))}
    </div>
  )}
</form>
        <div className="accessibility-wrap">
          <button
            className={
              accessOpen
                ? "accessibility-toggle active"
                : "accessibility-toggle"
            }
            onClick={() => setAccessOpen(!accessOpen)}
            aria-label="Abrir recursos de acessibilidade"
            aria-expanded={accessOpen}
          >
            <Accessibility />
          </button>
          {accessOpen && (
            <div
              className="accessibility-panel"
              role="dialog"
              aria-label="Recursos de acessibilidade"
            >
              <div className="accessibility-title">
                <Accessibility />
                <div>
                  <strong>Acessibilidade</strong>
                  <small>Personalize a leitura do Atlas</small>
                </div>
              </div>
              <label className="access-option">
                <span>
                  <Contrast />
                  <span>
                    <b>Alto contraste</b>
                    <small>Maior diferença entre texto e fundo</small>
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                />
              </label>
              <label className="access-option">
                <span>
                  {hoverSpeech ? <Volume2 /> : <VolumeX />}
                  <span>
                    <b>Leitura ao passar o cursor</b>
                    <small>O texto sob o cursor será lido em voz alta</small>
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={hoverSpeech}
                  onChange={(e) => setHoverSpeech(e.target.checked)}
                />
              </label>
              <p className="accessibility-note">
                A leitura usa a síntese de voz disponível no seu navegador.
                Recomendamos ativá-la quando quiser ouvir o conteúdo.
              </p>
            </div>
          )}
        </div>
        <button
          className="libras-toggle"
          onClick={onLibras}
          aria-label="Ativar tradução em Libras"
          title="Traduzir o conteúdo para Libras"
          type="button"
        >
          <svg
            className="libras-icon"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M14.5 24.5V13.8C14.5 12.25 15.7 11 17.25 11C18.8 11 20 12.25 20 13.8V23"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 23V10.8C20 9.25 21.2 8 22.75 8C24.3 8 25.5 9.25 25.5 10.8V23"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25.5 23V12.8C25.5 11.25 26.7 10 28.25 10C29.8 10 31 11.25 31 12.8V25"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M31 25V17.2C31 15.7 32.2 14.5 33.75 14.5C35.3 14.5 36.5 15.7 36.5 17.2V29.5C36.5 35.3 32.1 40 26.5 40H23C19.5 40 16.7 38.3 15 35.4L11.2 28.8C10.45 27.5 10.9 25.85 12.2 25.1C13.5 24.35 15.15 24.8 15.9 26.1L18.2 30"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 18.5C10.8 20.2 9.2 22.7 8.7 25.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M35.8 10.8C38 12.5 39.6 15 40.1 17.8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={
            theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"
          }
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
        <button
          className="mobile-menu"
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
        >
          <Menu />
        </button>
      </div>
    </header>
  );
}
function Home() {
  return (
    <main>
      <section className="final-hero">
        <div>
          <p className="kicker">MEMÓRIA · TERRITÓRIO · PARTICIPAÇÃO</p>
          <h1>
            Memórias que
            <br />
            <em>constroem</em> democracia.
          </h1>
          <p>
            Um Atlas Histórico-Geográfico Participativo do Sertão Cearense,
            construído a partir das histórias, memórias e experiências de quem
            vive o território.
          </p>
          <div className="action-row">
            <button className="cta" onClick={() => go("/atlas")}>
              Explorar o Atlas <ArrowRight />
            </button>
            <button className="secondary" onClick={() => go("/pesquisa")}>
              Conhecer o projeto
            </button>
          </div>
        </div>
        <aside>
          <span>4</span>
          <small>
            MUNICÍPIOS
            <br />
            PESQUISADOS
          </small>
        </aside>
      </section>
      <section className="final-shell purpose">
        <div>
          <p className="kicker">O PROJETO ATLAS</p>
          <h2>
            Quatro cidades,
            <br />
            <em>um mesmo território.</em>
          </h2>
        </div>
        <p>
          Explore o mapa, conheça bairros e localidades e descubra as histórias
          que fazem parte de Acopiara, Catarina, Deputado Irapuan Pinheiro e
          Piquet Carneiro.
        </p>
      </section>
      <MunicipalCards />
      <section className="final-shell pathway">
        <div>
          <MapPin />
          <h2>
            O mapa mostra onde.
            <br />
            <em>As pessoas contam por quê.</em>
          </h2>
        </div>
        <ol>
          <li>
            <b>01</b> Explore os quatro municípios no mapa real
          </li>
          <li>
            <b>02</b> Clique em um ponto e consulte sua memória e fontes
          </li>
          <li>
            <b>03</b> Fixe um novo local e envie texto, fotos, documentos, áudio
            ou vídeo
          </li>
        </ol>
        <button className="cta" onClick={() => go("/atlas")}>
          Abrir Atlas <ArrowRight />
        </button>
      </section>
    </main>
  );
}

function MunicipalCards() {
  return (
    <section className="final-shell municipal-section">
      <div className="title-row">
        <div>
          <p className="kicker">QUATRO MUNICÍPIOS</p>
          <h2>
            Um território.
            <br />
            Muitas histórias.
          </h2>
        </div>
        <button className="link-button" onClick={() => go("/municipios")}>
          Ver todos <ArrowRight />
        </button>
      </div>
      <div className="final-town-grid">
        {towns.map(([name, image]) => {
          const d = municipalityData[name];
          return (
            <article
              key={name}
              className="town-card-click"
              role="button"
              tabIndex={0}
              onClick={() => go("/municipios/" + d.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter") go("/municipios/" + d.slug);
              }}
            >
              <img src={image} alt={"Fotografia de " + name} />
              <div />
              <section>
                <small>CEARÁ · SERTÃO</small>
                <h3>{name}</h3>
                <span>
                  Conhecer município <ArrowRight />
                </span>
              </section>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function Atlas() {
  const [allPoints, setAllPoints] = useState<AtlasPoint[]>(() =>
    loadAtlasPoints(),
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    load("atlas-reviews", []),
  );
  const [municipality, setMunicipality] = useState("Todos");
  const [category, setCategory] = useState("Todos");
  const [recordType, setRecordType] = useState("Todos");
  const [term, setTerm] = useState(
    () => localStorage.getItem("atlas-global-search") || "",
  );
  const [draft, setDraft] = useState<MapDraft | null>(null);
  const [selected, setSelected] = useState<AtlasPoint | null>(null);
  const [attachments, setAttachments] = useState<
    Array<AttachmentMeta & { id: string; url: string }>
  >([]);
  const [confirmPoint, setConfirmPoint] = useState<AtlasPoint | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [dbMessage, setDbMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mapSearchTarget, setMapSearchTarget] = useState<MapSearchTarget | null>(null);
  const [locationSearchActive, setLocationSearchActive] = useState(false);
  const [locationSearching, setLocationSearching] = useState(false);

  const refresh = async () => {
    if (!supabase) return;
    try {
      const dbPoints = await fetchPublishedPoints();
      setAllPoints(dbPoints);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(data.session?.user?.user_metadata?.role === "admin");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.user_metadata?.role === "admin");
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("atlas-points-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "atlas_points" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    if (!selected) return;
    if (supabase) {
      fetchReviews(selected.id)
        .then(setReviews)
        .catch(() => setReviews([]));
      fetchSupabaseAttachments(selected.id)
        .then(setAttachments)
        .catch(() => setAttachments([]));
    } else {
      getFiles(selected.id)
        .then(setAttachments)
        .catch(() => setAttachments([]));
    }
  }, [selected?.id]);

  const visible = useMemo(
    () =>
      allPoints.filter(
        (p) =>
          (municipality === "Todos" || p.municipality === municipality) &&
          (category === "Todos" || p.category === category) &&
          (recordType === "Todos" || p.recordType === recordType) &&
          (locationSearchActive || `${p.title} ${p.story}`.toLowerCase().includes(term.toLowerCase())),
      ),
    [allPoints, municipality, category, recordType, term, locationSearchActive],
  );

  const focusPoint = (point: AtlasPoint) => {
    setSelected(point);
    setMapSearchTarget({
      latitude: point.latitude,
      longitude: point.longitude,
      label: point.title,
      nonce: Date.now(),
    });
  };

  const searchLocation = async (query: string) => {
    const normalized = query.toLowerCase();
    const localMatch = allPoints.find((point) =>
      point.status === "published" &&
      `${point.title} ${point.municipality} ${point.category} ${point.story}`
        .toLowerCase()
        .includes(normalized),
    );

    if (localMatch) {
      setLocationSearchActive(false);
      focusPoint(localMatch);
      return;
    }

    setLocationSearching(true);
    try {
      const params = new URLSearchParams({
        q: `${query}, Ceará, Brasil`,
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
        countrycodes: "br",
        viewbox: "-40.15,-5.45,-38.85,-6.55",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { "Accept-Language": "pt-BR,pt;q=0.9" },
      });
      if (!response.ok) throw new Error("Não foi possível consultar o serviço de localização.");
      const results = await response.json();
      if (!Array.isArray(results) || !results.length) {
        throw new Error(`Não encontramos “${query}” na área pesquisada. Tente incluir o município ou uma localidade próxima.`);
      }
      const result = results[0];
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("A localização retornada não possui coordenadas válidas.");
      setLocationSearchActive(true);
      setSelected(null);
      setMapSearchTarget({ latitude, longitude, label: result.display_name || query, nonce: Date.now() });
    } catch (error) {
      console.error("Erro na busca de localização:", error);
      const detail = error instanceof Error ? error.message : String(error);
      projectAlert(detail, "error", "Local não encontrado");
    } finally {
      setLocationSearching(false);
    }
  };

  const handleLocationSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    await searchLocation(query);
  };

  useEffect(() => {
    if (loading || !term.trim()) return;
    const pending = localStorage.getItem("atlas-global-search");
    if (!pending || pending.trim() !== term.trim()) return;
    localStorage.removeItem("atlas-global-search");
    void searchLocation(pending.trim());
  }, [loading]);

  const addPoint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = crypto.randomUUID();
    const files = Array.from(
      (form.elements.namedItem("attachments") as HTMLInputElement)?.files || [],
    );
    const point: AtlasPoint = {
      id,
      title: String(data.get("title") || "").trim(),
      municipality: String(data.get("municipality") || ""),
      category: String(data.get("category") || ""),
      recordType: String(data.get("recordType") || ""),
      latitude: draft.latitude,
      longitude: draft.longitude,
      status: "draft",
      story: String(data.get("story") || "").trim(),
      period: String(data.get("period") || ""),
      contributor: String(data.get("contributor") || ""),
      source: String(data.get("source") || ""),
      rating: 0,
      reviewCount: 0,
      attachmentCount: files.length,
    };
    try {
      if (supabase) {
        const inserted = await insertAtlasPoint(point);
        let attachmentWarning = "";
        if (files.length) {
          try {
            await uploadSupabaseAttachments(files, {
              atlasPointDbId: inserted.id,
            });
          } catch (attachmentError) {
            console.error(
              "Ponto salvo, mas houve erro ao enviar anexos:",
              attachmentError,
            );
            attachmentWarning =
              " Os anexos não foram enviados, mas o ponto já está na fila de moderação.";
          }
        }
        projectAlert(
          `Ponto enviado para moderação. Ele ficará visível no Atlas após a aprovação da equipe.${attachmentWarning}`,
          "success",
          "Ponto enviado",
        );
      } else {
        await saveFiles(id, files);
        const updated = [...allPoints, point];
        setAllPoints(updated);
        save("atlas-points", updated);
      }
      setDraft(null);
      form.reset();
      await refresh();
    } catch (error) {
      console.error("Erro ao enviar ponto para o Supabase:", error);
      const detail =
        error instanceof Error
          ? error.message
          : String((error as any)?.message || error || "Erro desconhecido");
      projectAlert(
        `Não foi possível enviar o ponto para a moderação. ${detail}`,
        "error",
        "Não foi possível enviar",
      );
    }
  };

  const addReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const d = new FormData(event.currentTarget);
    const review: Review = {
      id: crypto.randomUUID(),
      pointId: selected.id,
      name: String(d.get("name") || "Visitante").trim() || "Visitante",
      text: String(d.get("text") || "").trim(),
      rating: Number(d.get("rating") || 5),
      created: new Date().toLocaleDateString("pt-BR"),
    };
    try {
      if (supabase) {
        await insertReview(selected.id, review);
        const fresh = await fetchReviews(selected.id);
        setReviews(fresh);
      } else {
        const updated = [review, ...reviews];
        setReviews(updated);
        save("atlas-reviews", updated);
      }
      event.currentTarget.reset();
      if (supabase) {
        const freshPoints = await fetchPublishedPoints();
        setAllPoints(freshPoints);
        setSelected(freshPoints.find((p) => p.id === selected.id) || selected);
      } else {
        const target = allPoints.map((p) =>
          p.id === selected.id
            ? {
                ...p,
                rating: Number(
                  (
                    (p.rating * p.reviewCount + review.rating) /
                    (p.reviewCount + 1)
                  ).toFixed(1),
                ),
                reviewCount: p.reviewCount + 1,
              }
            : p,
        );
        setAllPoints(target);
        save("atlas-points", target);
        setSelected(target.find((p) => p.id === selected.id) || null);
      }
    } catch (error) {
      console.error(error);
      projectAlert(
        "Não foi possível registrar a avaliação. Tente novamente.",
        "error",
        "Não foi possível registrar",
      );
    }
  };

  const removePoint = async (pointId: string) => {
    const point = allPoints.find((p) => p.id === pointId);
    if (!point) return;
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.user_metadata?.role !== "admin") {
        projectAlert(
          "A remoção de pontos publicados é uma ação exclusiva da equipe de administração.",
          "info",
          "Ação administrativa",
        );
        setConfirmPoint(null);
        return;
      }

      try {
        // O Atlas exibe project_id como id público. Em bancos antigos,
        // project_id e a PK uuid "id" podem ser diferentes. Excluir usando
        // diretamente point.id pode não apagar nenhuma linha e ainda assim
        // retornar "sem erro" ao cliente. Primeiro resolvemos a PK real.
        let dbPointId: string | null = point.dbId || null;
        const byProject = await supabase
          .from("atlas_points")
          .select("id")
          .eq("project_id", pointId)
          .maybeSingle();

        if (byProject.error && !dbPointId) throw byProject.error;
        if (!dbPointId) dbPointId = byProject.data?.id || null;

        if (!dbPointId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pointId)) {
          const byId = await supabase
            .from("atlas_points")
            .select("id")
            .eq("id", pointId)
            .maybeSingle();
          if (byId.error) throw byId.error;
          dbPointId = byId.data?.id || null;
        }

        if (!dbPointId) {
          throw new Error("O ponto não foi encontrado no banco de dados.");
        }

        const { data: files } = await supabase
          .from("attachments")
          .select("file_path")
          .eq("atlas_point_id", dbPointId);

        const paths = (files || [])
          .map((file: any) => file.file_path)
          .filter(Boolean);

        const { error } = await supabase
          .from("atlas_points")
          .delete()
          .eq("id", dbPointId);

        if (error) throw error;

        // Primeiro removemos o registro do banco. Só depois limpamos os
        // arquivos do Storage, evitando apagar anexos caso a exclusão do
        // ponto seja recusada pelo RLS.
        if (paths.length) {
          const { error: storageError } = await supabase.storage
            .from("atlas-attachments")
            .remove(paths);
          if (storageError) {
            console.warn("Ponto removido, mas alguns anexos não foram apagados do Storage:", storageError);
          }
        }

        setAllPoints((current) => current.filter((p) => p.id !== pointId));
        setReviews((current) => current.filter((r) => r.pointId !== pointId));
        setConfirmPoint(null);
        setSelected(null);
        setAttachments([]);
        await refresh();
        projectAlert(
          "O ponto foi removido do Atlas e seus vínculos foram apagados.",
          "success",
          "Ponto removido",
        );
      } catch (error) {
        console.error("Erro ao remover ponto:", error);
        const detail =
          error instanceof Error
            ? error.message
            : String((error as any)?.message || error || "Erro desconhecido");
        projectAlert(
          `Não foi possível remover o ponto. ${detail}`,
          "error",
          "Não foi possível remover",
        );
      }
      return;
    }
    const nextPoints = allPoints.filter((p) => p.id !== pointId);
    const nextReviews = reviews.filter((r) => r.pointId !== pointId);
    setAllPoints(nextPoints);
    setReviews(nextReviews);
    save("atlas-points", nextPoints);
    save("atlas-reviews", nextReviews);
    await deleteFiles(pointId).catch(() => {});
    setConfirmPoint(null);
    setSelected(null);
  };

  return (
    <main className="atlas-final">
      <section className="final-shell atlas-title">
        <div>
          <p className="kicker">ATLAS INTERATIVO · 4 MUNICÍPIOS</p>
          <h1>
            Explorar, registrar
            <br />e <em>conectar.</em>
          </h1>
        </div>
        <p>
          Clique no mapa para fixar um local. O ponto recebe coordenadas reais e
          entra em análise antes de ser publicado.
        </p>
      </section>
      <section className="atlas-layout">
        <aside className="filter-panel">
          <form className="filter-search" onSubmit={handleLocationSearch}>
            <Search />
            <input
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setLocationSearchActive(false);
              }}
              placeholder="Buscar lugar ou localidade"
              aria-label="Buscar lugar ou localidade no Atlas"
            />
            <button type="submit" disabled={locationSearching || !term.trim()} aria-label="Localizar no mapa" title="Localizar no mapa">
              {locationSearching ? "…" : <Search />}
            </button>
          </form>
          {locationSearchActive && (
            <div className="atlas-search-hint">
              <MapPin /> Localização encontrada no mapa. Você pode continuar explorando os registros.
            </div>
          )}
          <Filter
            title="Município"
            value={municipality}
            onChange={setMunicipality}
            options={["Todos", ...townNames]}
          />
          <Filter
            title="Categoria"
            value={category}
            onChange={setCategory}
            options={["Todos", ...categories]}
          />
          <Filter
            title="Tipo de registro"
            value={recordType}
            onChange={setRecordType}
            options={["Todos", ...recordTypes]}
          />
          <button
            onClick={() => {
              setTerm("");
              setLocationSearchActive(false);
              setMapSearchTarget(null);
              setMunicipality("Todos");
              setCategory("Todos");
              setRecordType("Todos");
            }}
          >
            Limpar filtros
          </button>
          <div className="filter-tip">
            <ShieldCheck /> Limites municipais, mapa de ruas e satélite são
            exibidos como apoio à cartografia participativa. Novos conteúdos
            ficam em moderação.
          </div>
        </aside>
        <section className="real-map">
          <div className="map-caption">
            <span>
              <MapPin /> Clique no mapa para fixar um local
            </span>
            <b>
              {loading
                ? "…"
                : visible.filter((p) => p.status === "published").length}{" "}
              publicados
            </b>
          </div>
          <InteractiveAtlasMap
            points={visible}
            selectedId={selected?.id}
            draft={draft}
            onPin={(latitude, longitude) => setDraft({ latitude, longitude })}
            searchTarget={mapSearchTarget}
            onSelect={focusPoint}
          />
        </section>
        <aside className="place-list">
          <header>
            <span>REGISTROS DO ATLAS</span>
            <b>{visible.filter((p) => p.status === "published").length}</b>
          </header>
          {visible
            .filter((p) => p.status === "published")
            .map((point) => (
              <button key={point.id} onClick={() => focusPoint(point)}>
                <MapPin />
                <span>
                  <strong>{point.title}</strong>
                  <small>
                    {point.municipality} · {point.category}
                    {point.attachmentCount
                      ? ` · ${point.attachmentCount} anexo(s)`
                      : ""}
                  </small>
                </span>
                <ChevronRight />
              </button>
            ))}
          {!visible.filter((p) => p.status === "published").length && (
            <p>
              {loading
                ? "Carregando registros…"
                : "Nenhum ponto corresponde aos filtros."}
            </p>
          )}
        </aside>
      </section>
      {draft && (
        <Modal close={() => setDraft(null)}>
          <p className="kicker">NOVO PONTO · COORDENADAS REAIS</p>
          <h2>Indique um lugar</h2>
          <p className="modal-note">
            Você marcou{" "}
            <strong>
              {draft.latitude.toFixed(6)}, {draft.longitude.toFixed(6)}
            </strong>
            . Preencha o registro e envie suas fontes. A equipe poderá revisar
            tudo antes da publicação.
          </p>
          <form onSubmit={addPoint}>
            <Input name="title" label="Nome do lugar" required />
            <Select name="municipality" label="Município" options={townNames} />
            <Select name="category" label="Categoria" options={categories} />
            <Select
              name="recordType"
              label="Tipo de registro"
              options={recordTypes}
            />
            <Input name="period" label="Data, período ou época (opcional)" />
            <Input
              name="contributor"
              label="Autor / pessoa entrevistada (opcional)"
            />
            <TextArea
              name="story"
              label="Memória / descrição do lugar"
              required
            />
            <TextArea
              name="source"
              label="Fonte, referência ou contexto (opcional)"
            />
            <label className="field">
              <span>Documentos e outros arquivos</span>
              <input
                name="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,audio/*,video/*"
              />
              <small className="file-help">
                Os arquivos serão armazenados no Supabase Storage junto ao
                registro, quando a conexão estiver ativa.
              </small>
            </label>
            <p className="coordinates">
              Coordenadas: {draft.latitude.toFixed(6)},{" "}
              {draft.longitude.toFixed(6)}
            </p>
            <button className="cta" type="submit">
              Enviar para moderação <Send />
            </button>
          </form>
        </Modal>
      )}
      {selected && (
        <PlaceDetail
          point={selected}
          reviews={reviews.filter((r) => r.pointId === selected.id)}
          attachments={attachments}
          addReview={addReview}
          canRemove={isAdmin}
          onRemove={() => setConfirmPoint(selected)}
          close={() => setSelected(null)}
        />
      )}
      {confirmPoint && (
        <ConfirmRemove
          point={confirmPoint}
          onCancel={() => setConfirmPoint(null)}
          onConfirm={() => removePoint(confirmPoint.id)}
        />
      )}
      {dbMessage && (
        <AtlasNotice
          message={dbMessage}
          onClose={() => setDbMessage("")}
        />
      )}
    </main>
  );
}

function ProjectAlert({
  detail,
  onClose,
}: {
  detail: ProjectAlertDetail;
  onClose: () => void;
}) {
  const type = detail.type || "info";
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? X : ShieldCheck;
  return (
    <div className="project-alert-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`project-alert project-alert-${type}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="project-alert-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="project-alert-icon">
          <Icon />
        </div>
        <div className="project-alert-content">
          <p className="kicker">MEMÓRIAS QUE CONSTROEM DEMOCRACIA</p>
          <h2 id="project-alert-title">
            {detail.title || (type === "success" ? "Tudo certo" : "Atenção")}
          </h2>
          <p>{detail.message}</p>
          <button className="cta project-alert-button" type="button" onClick={onClose}>
            Continuar <ArrowRight />
          </button>
        </div>
        <button
          className="project-alert-close"
          type="button"
          aria-label="Fechar mensagem"
          onClick={onClose}
        >
          <X />
        </button>
      </section>
    </div>
  );
}

function ConfirmRemove({
  point,
  onCancel,
  onConfirm,
}: {
  point: AtlasPoint;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onMouseDown={onCancel}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon">
          <Trash2 />
        </div>
        <div className="confirm-copy">
          <p className="kicker">REMOVER PONTO</p>
          <h2 id="confirm-title">Tem certeza que deseja remover este ponto?</h2>
          <p>
            Você está prestes a remover <strong>“{point.title}”</strong>. Esta
            ação também removerá as avaliações e arquivos associados a este
            registro neste navegador.
          </p>
        </div>
        <div className="confirm-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            <Trash2 /> Remover ponto
          </button>
        </div>
      </section>
    </div>
  );
}
function Filter({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="filter">
      <span>{title}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function PlaceDetail({
  point,
  reviews,
  attachments,
  addReview,
  canRemove,
  onRemove,
  close,
}: {
  point: AtlasPoint;
  reviews: Review[];
  attachments: Array<AttachmentMeta & { id: string; url: string }>;
  addReview: (e: FormEvent<HTMLFormElement>) => void;
  canRemove: boolean;
  onRemove: () => void;
  close: () => void;
}) {
  return (
    <Modal close={close}>
      <div className="place-detail-actions">
        <span
          className={
            point.status === "published" ? "published-badge" : "pending-badge"
          }
        >
          {point.status === "published" ? "PUBLICADO" : "EM ANÁLISE"}
        </span>
        {canRemove && (
          <button type="button" className="remove-point" onClick={onRemove}>
            <Trash2 /> Remover ponto
          </button>
        )}
      </div>
      <p className="kicker">
        {point.municipality} · {point.category}
      </p>
      <h2>{point.title}</h2>
      <p>{point.story}</p>
      <div className="metadata-grid">
        {point.period && (
          <div>
            <small>PERÍODO</small>
            <b>{point.period}</b>
          </div>
        )}
        {point.contributor && (
          <div>
            <small>PARTICIPAÇÃO</small>
            <b>{point.contributor}</b>
          </div>
        )}
        {point.source && (
          <div>
            <small>FONTE</small>
            <b>{point.source}</b>
          </div>
        )}
        <div>
          <small>COORDENADAS</small>
          <b>
            {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
          </b>
        </div>
      </div>
      <div className="rating">
        <Star fill="currentColor" />{" "}
        <b>{point.rating ? point.rating.toFixed(1) : "—"}</b>
        <small>
          {point.reviewCount
            ? `${point.reviewCount} avaliação(ões)`
            : "Ainda sem avaliações"}
        </small>
      </div>
      <section className="detail-section">
        <h3>
          <History /> História e memória
        </h3>
        <p>{point.story}</p>
      </section>
      {attachments.length > 0 && (
        <section className="detail-section">
          <h3>
            <Archive /> Fontes e anexos
          </h3>
          <div className="attachment-list">
            {attachments.map((a) => (
              <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                <FileText />
                <span>
                  <b>{a.name}</b>
                  <small>
                    {a.type || "arquivo"} · {formatBytes(a.size)}
                  </small>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
      <section className="detail-section">
        <h3>
          <MessageCircle /> Avaliações da comunidade
        </h3>
        {reviews.map((review) => (
          <article className="review" key={review.id}>
            <b>{review.name}</b>
            <span>
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </span>
            <small>{review.created}</small>
            <p>{review.text}</p>
          </article>
        ))}
        <form className="review-form" onSubmit={addReview}>
          <Input name="name" label="Seu nome (opcional)" />
          <Select
            name="rating"
            label="Sua avaliação"
            options={["5", "4", "3", "2", "1"]}
          />
          <TextArea name="text" label="Seu comentário" required />
          <button className="secondary" type="submit">
            Enviar avaliação
          </button>
        </form>
      </section>
    </Modal>
  );
}
function Modal({
  children,
  close,
}: {
  children: ReactNode;
  close: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      document.querySelector<HTMLElement>(".final-modal")?.focus({ preventScroll: true });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="final-modal-backdrop" onMouseDown={close}>
      <section className="final-modal" tabIndex={-1} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close}>
          <X />
        </button>
        {children}
      </section>
    </div>
  );
}
function AtlasNotice({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

  const success =
    message.toLowerCase().includes("enviado") ||
    message.toLowerCase().includes("aprovação") ||
    message.toLowerCase().includes("sucesso");

  return (
    <div
      className="atlas-notice-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="atlas-notice-title"
      onMouseDown={onClose}
    >
      <section
        className={`atlas-notice ${success ? "atlas-notice-success" : "atlas-notice-error"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="atlas-notice-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar mensagem"
        >
          <X />
        </button>

        <div className="atlas-notice-icon">
          {success ? <CheckCircle2 /> : <ShieldCheck />}
        </div>

        <div className="atlas-notice-content">
          <p className="kicker">
            {success ? "MEMÓRIA · TERRITÓRIO · PARTICIPAÇÃO" : "ATENÇÃO"}
          </p>

          <h2 id="atlas-notice-title">
            {success ? "Registro enviado." : "Não foi possível concluir."}
          </h2>

          <p>{message}</p>

          <button
            className="cta atlas-notice-button"
            type="button"
            onClick={onClose}
          >
            CONTINUAR
            <ArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}
function Input({
  name,
  label,
  required = false,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} required={required} defaultValue={defaultValue} />
    </label>
  );
}
function TextArea({
  name,
  label,
  required = false,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea name={name} required={required} rows={4} defaultValue={defaultValue} />
    </label>
  );
}
function Select({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Municipalities() {
  return (
    <main className="final-page final-shell">
      <PageHead
        kicker="QUATRO CIDADES"
        title={
          <>
            Um mesmo território,
            <br />
            <em>muitas memórias.</em>
          </>
        }
        text="Conheça os quatro municípios do Atlas por meio de dados demográficos, história, território e registros construídos pela pesquisa."
      />
      <MunicipalCards />
      <section className="municipality-note">
        <MapPin />
        <div>
          <b>Cartografia participativa</b>
          <p>
            Os cards acima abrem uma página própria de cada município, com dados
            oficiais, contexto histórico e acesso direto aos registros do Atlas.
          </p>
        </div>
      </section>
    </main>
  );
}
function MunicipalityDetail({
  data,
}: {
  data: (typeof municipalityData)[string];
}) {
  const municipalityName =
    Object.keys(municipalityData).find(
      (k) => municipalityData[k].slug === data.slug,
    ) || "";
  const [points, setPoints] = useState<AtlasPoint[]>(() =>
    loadAtlasPoints().filter(
      (p) => p.municipality === municipalityName && p.status === "published",
    ),
  );
  useEffect(() => {
    if (!supabase) return;
    fetchPublishedPoints()
      .then((all) =>
        setPoints(all.filter((p) => p.municipality === municipalityName)),
      )
      .catch(() => {});
  }, [municipalityName]);
  return (
    <main className="final-page municipality-detail">
      <section className="municipality-hero final-shell">
        <div>
          <p className="kicker">MUNICÍPIO · CEARÁ</p>
          <h1>
            {Object.keys(municipalityData).find(
              (k) => municipalityData[k].slug === data.slug,
            )}
          </h1>
          <p>{data.history}</p>
          <div className="action-row">
            <button className="cta" onClick={() => go("/atlas")}>
              Explorar no mapa <MapPin />
            </button>
            <button className="secondary" onClick={() => go("/participe")}>
              Adicionar memória <Heart />
            </button>
          </div>
        </div>
        <img
          src={
            towns.find(
              (t) =>
                t[0] ===
                Object.keys(municipalityData).find(
                  (k) => municipalityData[k].slug === data.slug,
                ),
            )?.[1]
          }
          alt=""
        />
      </section>
      <section className="final-shell municipality-facts">
        <article>
          <small>POPULAÇÃO · CENSO 2022</small>
          <b>{data.population}</b>
          <span>habitantes</span>
        </article>
        <article>
          <small>ÁREA TERRITORIAL</small>
          <b>{data.area}</b>
          <span>território municipal</span>
        </article>
        <article>
          <small>DENSIDADE</small>
          <b>{data.density}</b>
          <span>hab./km²</span>
        </article>
        <article>
          <small>IDHM · 2010</small>
          <b>{data.idhm}</b>
          <span>índice municipal</span>
        </article>
      </section>
      <section className="final-shell municipality-content">
        <div>
          <p className="kicker">HISTÓRIA E TERRITÓRIO</p>
          <h2>
            Uma cidade também é feita de <em>memórias.</em>
          </h2>
          <p>{data.history}</p>
          <p className="source-note">
            Fonte: {data.source}. Os dados estatísticos são apresentados
            conforme as fontes indicadas; novos resultados da pesquisa de campo
            serão incorporados ao Atlas.
          </p>
        </div>
        <aside>
          <h3>Dados básicos</h3>
          <dl>
            <div>
              <dt>Código IBGE</dt>
              <dd>{data.code}</dd>
            </div>
            <div>
              <dt>Gentílico</dt>
              <dd>{data.gentilico}</dd>
            </div>
            <div>
              <dt>Ano de criação</dt>
              <dd>{data.created}</dd>
            </div>
            <div>
              <dt>Município de origem</dt>
              <dd>{data.origin}</dd>
            </div>
            <div>
              <dt>Escolarização 6–14 anos</dt>
              <dd>{data.schooling}</dd>
            </div>
            <div>
              <dt>População estimada</dt>
              <dd>{data.estimated}</dd>
            </div>
          </dl>
        </aside>
      </section>
      <section className="final-shell municipality-points">
        <div className="title-row">
          <div>
            <p className="kicker">REGISTROS DO ATLAS</p>
            <h2>Memórias localizadas neste município</h2>
          </div>
          <button className="link-button" onClick={() => go("/atlas")}>
            Abrir mapa <ArrowRight />
          </button>
        </div>
        {points.length ? (
          <div className="municipality-point-grid">
            {points.map((p) => (
              <button key={p.id} onClick={() => go("/atlas")}>
                <MapPin />
                <span>
                  <b>{p.title}</b>
                  <small>
                    {p.category} · {p.recordType}
                  </small>
                </span>
                <ChevronRight />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-final small-empty">
            <MapPin />
            <h2>Os próximos lugares pesquisados aparecerão aqui.</h2>
            <button className="cta" onClick={() => go("/participe")}>
              Contribuir <ArrowRight />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Memories() {
  const [contributions, setContributions] = useState<Contribution[]>(() =>
    load("atlas-contributions", []).filter(
      (c: Contribution) => c.status === "published",
    ),
  );
  const [points, setPoints] = useState<AtlasPoint[]>(() =>
    loadAtlasPoints().filter((p) => p.status === "published"),
  );
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const refresh = async () => {
      try {
        const [c, p] = await Promise.all([
          fetchPublishedContributions(),
          fetchPublishedPoints(),
        ]);
        setContributions(c);
        setPoints(p);
      } catch (error) {
        console.error(error);
      }
    };
    refresh();
    const channel = client
      .channel("memories-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contributions" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "atlas_points" },
        refresh,
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);
  return (
    <main className="final-page final-shell">
      <PageHead
        kicker="MEMÓRIAS DO TERRITÓRIO"
        title={
          <>
            Histórias que
            <br />
            <em>merecem permanecer.</em>
          </>
        }
        text="Registros publicados após moderação, associados a lugares, pessoas, fontes e experiências do território."
      />
      {contributions.length ? (
        <div className="memory-grid">
          {contributions.map((c) => (
            <article key={c.id}>
              <Heart />
              <small>
                {c.municipality} · {c.created}
              </small>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
              {c.attachmentCount ? (
                <span className="attachment-count">
                  {c.attachmentCount} anexo(s)
                </span>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <Empty
          icon={<Heart />}
          title="O acervo público está aguardando novas memórias validadas."
          action="Conte sua memória"
        />
      )}
      <section className="public-place-summary">
        <p className="kicker">LUGARES PUBLICADOS</p>
        <h2>{points.length} pontos estão disponíveis no mapa.</h2>
        <button className="cta" onClick={() => go("/atlas")}>
          Explorar os lugares <ArrowRight />
        </button>
      </section>
    </main>
  );
}

function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [session, setSession] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<ArchiveItem | null>(null);

  const loadArchive = async () => {
    if (!supabase) return;
    try {
      setItems(await fetchPublishedArchiveItemsSafe());
    } catch (error) {
      console.error("Erro ao carregar o Acervo:", error);
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    loadArchive();
    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) =>
      setSession(nextSession),
    );
    const channel = client
      .channel("archive-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "archive_items" },
        loadArchive,
      )
      .subscribe();
    return () => {
      data.subscription.unsubscribe();
      client.removeChannel(channel);
    };
  }, []);

  const isAdmin = session?.user?.user_metadata?.role === "admin";

  const submitArchive = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = (form.elements.namedItem("archiveFile") as HTMLInputElement)?.files?.[0];
    if (!file) {
      projectAlert("Selecione um arquivo para adicionar ao Acervo.", "info", "Arquivo necessário");
      return;
    }
    const title = String(data.get("archiveTitle") || "").trim();
    if (!title) return;
    setBusy(true);
    try {
      await uploadArchiveItem(
        file,
        title,
        String(data.get("archiveType") || "Documento"),
        String(data.get("archiveDescription") || "").trim(),
      );
      form.reset();
      await loadArchive();
      projectAlert("O material foi publicado no Acervo e já está disponível para consulta.", "success", "Material publicado");
    } catch (error) {
      console.error("Erro ao publicar material no Acervo:", error);
      const detail = error instanceof Error ? error.message : String((error as any)?.message || error || "Erro desconhecido");
      projectAlert(`Não foi possível publicar o material. ${detail}`, "error", "Não foi possível publicar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="final-page final-shell">
      <PageHead
        kicker="ACERVO DIGITAL"
        title={<>Documentos, imagens<br />e <em>registros de campo.</em></>}
        text="O acervo reúne fotografias, documentos, mapas, entrevistas, áudios e vídeos enviados pela equipe e vinculados à pesquisa."
      />

      {isAdmin && (
        <section className="archive-admin-panel">
          <div>
            <p className="kicker">ÁREA DA EQUIPE</p>
            <h2>Adicionar material ao Acervo</h2>
            <p>Administradores podem publicar e editar entrevistas, mapas, fotografias e documentos diretamente no acervo público.</p>
          </div>
          <form className="archive-upload-form" onSubmit={submitArchive}>
            <Input name="archiveTitle" label="Título do material" required />
            <Select name="archiveType" label="Tipo de material" options={["Entrevista", "Mapa", "Fotografia", "Documento", "Áudio", "Vídeo", "Outro"]} />
            <TextArea name="archiveDescription" label="Descrição / contexto (opcional)" />
            <label className="field">
              <span>Arquivo</span>
              <input name="archiveFile" type="file" required accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,audio/*,video/*" />
              <small className="file-help">O arquivo será armazenado no Supabase Storage.</small>
            </label>
            <button className="cta" type="submit" disabled={busy}>
              {busy ? "Publicando…" : "Publicar no Acervo"} <Upload />
            </button>
          </form>
        </section>
      )}

      <div className="collection-grid">
        {[
          ["Fotografias", Archive],
          ["Documentos", FileText],
          ["Entrevistas", MessageCircle],
          ["Mapas", MapPin],
        ].map(([name, Icon]) => {
          const C = Icon as typeof Archive;
          const archiveType = name === "Fotografias" ? "Fotografia" : name === "Documentos" ? "Documento" : name === "Entrevistas" ? "Entrevista" : "Mapa";
          const count = items.filter((item) => item.type === archiveType).length;
          return (
            <article key={name as string}>
              <C />
              <h2>{name as string}</h2>
              <p>{count ? `${count} material(is) publicado(s) no Acervo.` : "Ainda não há materiais desta categoria publicados."}</p>
            </article>
          );
        })}
      </div>

      <section className="archive-library">
        <div className="archive-library-head">
          <div><p className="kicker">MATERIAIS PUBLICADOS</p><h2>Acervo da pesquisa</h2></div>
          <span>{items.length} item(ns)</span>
        </div>
        {items.length ? (
          <div className="archive-items">
            {items.map((item) => (
              <article className="archive-item" key={item.id}>
                <div className="archive-item-icon"><Archive /></div>
                <div>
                  <span className="archive-type">{item.type}</span>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                  <small>{item.fileName} · {formatBytes(item.fileSize)} · {item.created}</small>
                </div>
                <div className="archive-item-actions">
                  <a className="secondary" href={item.url} target="_blank" rel="noreferrer">Abrir <ExternalLink /></a>
                  {isAdmin && <button className="secondary" type="button" onClick={() => setEditing(item)}>Editar <FileText /></button>}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="none">Os materiais publicados pela equipe aparecerão aqui.</p>}
      </section>

      {editing && (
        <Modal close={() => !busy && setEditing(null)}>
          <p className="kicker">ADMINISTRAÇÃO · ACERVO</p>
          <h2>Editar material</h2>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const title = String(data.get("editArchiveTitle") || "").trim();
            if (!title) return;
            const file = (form.elements.namedItem("editArchiveFile") as HTMLInputElement)?.files?.[0] || null;
            setBusy(true);
            try {
              await updateArchiveItem(editing.id, {
                title,
                type: String(data.get("editArchiveType") || editing.type),
                description: String(data.get("editArchiveDescription") || "").trim(),
              }, file);
              setEditing(null);
              await loadArchive();
              projectAlert("A edição foi salva e o Acervo público foi atualizado automaticamente.", "success", "Material atualizado");
            } catch (error) {
              const detail = error instanceof Error ? error.message : String((error as any)?.message || error || "Erro desconhecido");
              projectAlert(`Não foi possível salvar a edição. ${detail}`, "error", "Não foi possível salvar");
            } finally {
              setBusy(false);
            }
          }}>
            <Input name="editArchiveTitle" label="Título" required defaultValue={editing.title} />
            <Select name="editArchiveType" label="Tipo" options={["Entrevista", "Mapa", "Fotografia", "Documento", "Áudio", "Vídeo", "Outro"]} defaultValue={editing.type} />
            <TextArea name="editArchiveDescription" label="Descrição / contexto" defaultValue={editing.description} />
            <label className="field"><span>Substituir arquivo (opcional)</span><input name="editArchiveFile" type="file" accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,audio/*,video/*" /><small className="file-help">Se você não escolher um arquivo, o arquivo atual será mantido.</small></label>
            <div className="admin-edit-actions"><button className="secondary" type="button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button className="cta" type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar edição"} <CheckCircle2 /></button></div>
          </form>
        </Modal>
      )}
    </main>
  );
}

async function fetchPublishedArchiveItemsSafe() {
  return fetchArchiveItems();
}

function Participate() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>(() =>
    load("atlas-contributions", []),
  );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = crypto.randomUUID();
    const item = {
      id,
      title: String(data.get("title") || "").trim(),
      municipality: String(data.get("municipality") || ""),
      locality: String(data.get("locality") || ""),
      story: String(data.get("memory") || "").trim(),
      period: String(data.get("period") || ""),
      category: "Memória comunitária",
      recordType: "memoria",
    };
    const files = Array.from(
      (form.elements.namedItem("attachments") as HTMLInputElement)?.files || [],
    );
    setBusy(true);
    try {
      if (supabase) {
        await insertContribution(item);
        if (files.length) {
          try {
            await uploadSupabaseAttachments(files, { contributionId: id });
          } catch (attachmentError) {
            console.error(
              "Memória salva, mas houve erro ao enviar anexos:",
              attachmentError,
            );
          }
        }
      } else {
        const record: Contribution = {
          id,
          title: item.title,
          municipality: item.municipality,
          text: item.story,
          status: "pending",
          created: new Date().toLocaleDateString("pt-BR"),
          attachmentCount: files.length,
        };
        await saveFiles(id, files);
        const updated = [record, ...contributions];
        setContributions(updated);
        save("atlas-contributions", updated);
      }
      setSent(true);
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar memória para o Supabase:", error);
      const detail =
        error instanceof Error
          ? error.message
          : String((error as any)?.message || error || "Erro desconhecido");
      projectAlert(
        `Não foi possível enviar sua memória. ${detail}`,
        "error",
        "Não foi possível enviar",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="join">
      <section>
        <p className="kicker">PARTICIPE DO PROJETO</p>
        <h1>
          Conte uma memória.
          <br />
          <em>Indique um lugar.</em>
        </h1>
        <p>
          O projeto é coletivo: cada história ajuda a preservar a memória e
          fortalecer a cidadania. Você pode registrar um relato aqui ou abrir o
          Atlas para marcar a localização exata.
        </p>
        <div className="flow">
          <b>ENVIADA</b>
          <ArrowRight />
          <b>EM ANÁLISE</b>
          <ArrowRight />
          <b>PUBLICADA</b>
        </div>
        <button
          className="secondary join-map-button"
          onClick={() => go("/atlas")}
        >
          Marcar no mapa primeiro <MapPin />
        </button>
      </section>
      <article>
        {sent ? (
          <div className="success">
            <CheckCircle2 />
            <h2>Contribuição enviada.</h2>
            <p>
              Ela foi registrada no sistema e entrou na fila de moderação. Só
              aparecerá publicamente após a aprovação da equipe.
            </p>
            <button className="secondary" onClick={() => setSent(false)}>
              Enviar outra
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="kicker">MEMÓRIA COMUNITÁRIA</p>
            <h2>Seu relato tem lugar aqui.</h2>
            <Input name="title" label="Título da memória" required />
            <Select name="municipality" label="Município" options={townNames} />
            <Input name="locality" label="Bairro ou localidade" />
            <Input name="period" label="Período (opcional)" />
            <TextArea name="memory" label="Sua memória" required />
            <label className="field">
              <span>Fotos, documentos, áudios ou vídeos</span>
              <input
                name="attachments"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,audio/*,video/*"
              />
              <small className="file-help">
                Os arquivos serão enviados para o Supabase Storage e associados
                à contribuição.
              </small>
            </label>
            <label className="consent-final">
              <input type="checkbox" required /> Autorizo a análise e possível
              publicação deste conteúdo.
            </label>
            <button className="cta" type="submit" disabled={busy}>
              {busy ? "Enviando…" : "Enviar para moderação"} <Send />
            </button>
          </form>
        )}
        {contributions.length > 0 && !sent && (
          <p className="draft-count">
            <Clock3 size={15} /> {contributions.length} contribuição(ões)
            local(is) nesta instalação.
          </p>
        )}
      </article>
    </main>
  );
}

function Research() {
  const topics = [
    [
      "01",
      "Contexto e problema",
      "O projeto parte da relação entre memória, território, identidade cultural, participação coletiva e formação cidadã.",
    ],
    [
      "02",
      "Fundamentação teórica",
      "A pesquisa dialoga com Maurice Halbwachs, Milton Santos, Paulo Freire e Hannah Arendt para pensar memória coletiva, território, educação e ação cidadã.",
    ],
    [
      "03",
      "Metodologia",
      "Pesquisa bibliográfica, entrevistas, história oral, trabalho de campo, cartografia participativa, registros históricos e organização digital do acervo.",
    ],
    [
      "04",
      "Produto final",
      "Um Atlas Histórico-Geográfico Participativo dos quatro municípios, reunindo mapas, lugares, memórias, documentos, imagens e narrativas.",
    ],
    [
      "05",
      "Participação comunitária",
      "Moradores, estudantes e pesquisadores podem contribuir com histórias, documentos e registros de lugares significativos, sujeitos à moderação.",
    ],
    [
      "06",
      "Democracia e cidadania",
      "O projeto transforma conhecimentos locais em patrimônio compartilhado e cria um espaço digital de escuta, registro e participação.",
    ],
  ];
  return (
    <main className="final-page final-shell">
      <PageHead
        kicker="PESQUISA · PROJETO"
        title={
          <>
            Conhecimento que nasce
            <br />
            do <em>diálogo.</em>
          </>
        }
        text="Conheça o percurso da pesquisa e consulte cada parte do projeto. O sumário abaixo é interativo: clique em um tema para abrir seu conteúdo."
      />
      <section className="research-index">
        <div>
          <p className="kicker">SUMÁRIO DA PESQUISA</p>
          <h2>Explore o projeto por capítulos.</h2>
          <nav>
            {topics.map(([n, t]) => (
              <a key={n} href={"#research-" + n}>
                <b>{n}</b>
                <span>{t}</span>
                <ChevronRight />
              </a>
            ))}
          </nav>
        </div>
        <aside>
          <Landmark />
          <h3>Atlas como produto científico</h3>
          <p>
            O sistema conecta pesquisa, cartografia social, memória e tecnologia
            digital em um produto navegável e participativo.
          </p>
        </aside>
      </section>
      <section className="research-chapters">
        {topics.map(([n, t, body]) => (
          <article id={"research-" + n} key={n}>
            <span>{n}</span>
            <div>
              <p className="kicker">CAPÍTULO {n}</p>
              <h2>{t}</h2>
              <p>{body}</p>
              {n === "02" && (
                <div className="theory-chips">
                  <span>Halbwachs · memória coletiva</span>
                  <span>Milton Santos · território</span>
                  <span>Freire · participação e educação</span>
                  <span>Arendt · ação e espaço público</span>
                </div>
              )}
              {n === "03" && (
                <ol>
                  {[
                    "Pesquisa bibliográfica",
                    "Entrevistas e história oral",
                    "Trabalho de campo",
                    "Cartografia participativa",
                    "Registros históricos e documentais",
                    "Organização do acervo digital",
                    "Moderação das contribuições",
                    "Construção e atualização do Atlas",
                  ].map((item, i) => (
                    <li key={item}>
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </article>
        ))}
      </section>
      <section className="team-section">
        <div>
          <p className="kicker">CONHEÇA A EQUIPE</p>
          <h2>O Atlas é construído por pessoas.</h2>
          <p>
            Espaço para apresentar estudantes, professores, colaboradores,
            entrevistados e parceiros que participam da pesquisa, da cartografia
            e da construção do produto final.
          </p>
        </div>
        <div className="team-grid">
          <article>
            <Users />
            <b>Estudantes pesquisadores</b>
            <span>
              Pesquisa, entrevistas, registros e desenvolvimento do Atlas.
            </span>
          </article>
          <article>
            <BookOpen />
            <b>Orientação e escola</b>
            <span>
              Acompanhamento pedagógico e articulação das etapas do projeto.
            </span>
          </article>
          <article>
            <MapPin />
            <b>Comunidade</b>
            <span>
              Moradores e colaboradores que compartilham memórias e documentos.
            </span>
          </article>
        </div>
      </section>
    </main>
  );
}
function CearaCientifico() {
  return (
    <main className="cc-page">
      <section className="cc-hero">
        <div className="cc-hero-inner">
          <div className="cc-hero-copy">
            <span className="cc-badge">CEARÁ CIENTÍFICO · 2026</span>
            <p className="kicker">
              CIÊNCIA · CIDADANIA · CONVIVÊNCIA DEMOCRÁTICA
            </p>
            <h1>
              Ciência que escuta
              <br />
              <em>o território.</em>
            </h1>
            <p className="cc-lead">
              O <strong>Memórias que Constroem Democracia</strong> integra o
              Ceará Científico 2026 como uma experiência de pesquisa,
              participação e tecnologia voltada à valorização das memórias do
              Sertão Cearense.
            </p>
            <div className="action-row">
              <button className="cta" onClick={() => go("/atlas")}>
                Explorar o Atlas <ArrowRight />
              </button>
              <button className="secondary" onClick={() => go("/pesquisa")}>
                Ver a pesquisa
              </button>
            </div>
          </div>
          <div className="cc-hero-mark">
            <div className="cc-ring">
              <span>CC</span>
              <small>2026</small>
            </div>
            <p>
              Mais Solidário,
              <br />
              <strong>Mais Cooperativo</strong>
            </p>
          </div>
        </div>
      </section>
      <section className="cc-shell cc-intro">
        <div>
          <p className="kicker">O CONTEXTO</p>
          <h2>
            Do território vivido
            <br />
            ao <em>conhecimento compartilhado.</em>
          </h2>
        </div>
        <div>
          <p>
            O projeto parte de uma pergunta simples:{" "}
            <strong>
              como preservar e democratizar as histórias que dão sentido aos
              lugares?
            </strong>{" "}
            A resposta é construída com pesquisa, entrevistas, trabalho de
            campo, cartografia participativa e tecnologias digitais.
          </p>
          <p>
            O Atlas reúne registros de{" "}
            <strong>
              Acopiara, Catarina, Deputado Irapuan Pinheiro e Piquet Carneiro
            </strong>
            , aproximando escola, comunidade e território em uma produção
            científica acessível e colaborativa.
          </p>
        </div>
      </section>
      <section className="cc-shell cc-pillars">
        <div className="cc-section-head">
          <p className="kicker">POR QUE ESTE PROJETO?</p>
          <h2>
            O Ceará Científico como espaço de <em>participação.</em>
          </h2>
        </div>
        <div className="cc-pillar-grid">
          <article>
            <span>01</span>
            <MapPin />
            <h3>Território</h3>
            <p>
              O mapa deixa de ser apenas representação e passa a registrar
              lugares, trajetórias e significados atribuídos pela comunidade.
            </p>
          </article>
          <article>
            <span>02</span>
            <Heart />
            <h3>Memória</h3>
            <p>
              Histórias orais, fotografias, documentos e experiências ajudam a
              preservar referências culturais e identidades locais.
            </p>
          </article>
          <article>
            <span>03</span>
            <Users />
            <h3>Participação</h3>
            <p>
              Estudantes, moradores e pesquisadores contribuem para construir
              conhecimento sobre o território que vivem.
            </p>
          </article>
          <article>
            <span>04</span>
            <Landmark />
            <h3>Ciência</h3>
            <p>
              A pesquisa transforma investigação, organização de dados e
              tecnologia em um produto científico aberto e navegável.
            </p>
          </article>
        </div>
      </section>
      <section className="cc-shell cc-theme">
        <div className="cc-theme-card">
          <div>
            <p className="kicker">TEMA 2026</p>
            <blockquote>
              “Ciência, Cidadania e Convivência Democrática: o conhecimento a
              serviço da vida coletiva.”
            </blockquote>
            <p>
              A proposta dialoga diretamente com a ideia de que produzir ciência
              também é criar condições para ouvir, registrar, compartilhar e
              reconhecer diferentes saberes.
            </p>
          </div>
          <aside>
            <small>PROJETO</small>
            <b>Categoria I</b>
            <span>Ensino Médio</span>
            <small>ÁREA</small>
            <b>CH</b>
            <span>Ciências Humanas e Sociais Aplicadas</span>
            <small>ESCOLA</small>
            <b>EEEP Alfredo Nunes de Melo</b>
          </aside>
        </div>
      </section>
      <section className="cc-shell cc-journey">
        <div className="cc-section-head">
          <p className="kicker">DA PESQUISA AO PRODUTO</p>
          <h2>
            Um percurso feito em <em>camadas.</em>
          </h2>
        </div>
        <div className="cc-timeline">
          <article>
            <b>01</b>
            <div>
              <h3>Investigar</h3>
              <p>
                Levantamento bibliográfico, definição do problema e diálogo com
                autores que fundamentam memória, território, educação e
                cidadania.
              </p>
            </div>
          </article>
          <article>
            <b>02</b>
            <div>
              <h3>Ir ao território</h3>
              <p>
                Entrevistas, observação, visitas de campo e cartografia
                participativa aproximam a pesquisa das experiências locais.
              </p>
            </div>
          </article>
          <article>
            <b>03</b>
            <div>
              <h3>Registrar</h3>
              <p>
                Memórias, imagens, documentos, áudios e referências espaciais
                são organizados em uma base digital.
              </p>
            </div>
          </article>
          <article>
            <b>04</b>
            <div>
              <h3>Compartilhar</h3>
              <p>
                O Atlas transforma os registros em uma experiência pública de
                consulta, participação e preservação da história local.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="cc-shell cc-final">
        <div>
          <p className="kicker">PRODUTO FINAL</p>
          <h2>
            Um Atlas para conhecer o Sertão <em>a partir de quem o vive.</em>
          </h2>
          <p>
            O site é parte do resultado da pesquisa: uma plataforma que articula
            cartografia, memória e cidadania e que pode continuar crescendo com
            novos registros validados.
          </p>
        </div>
        <div className="cc-final-actions">
          <button className="cta" onClick={() => go("/atlas")}>
            Entrar no Atlas <ArrowRight />
          </button>
          <button className="secondary" onClick={() => go("/participe")}>
            Participar da construção <Users />
          </button>
        </div>
      </section>
    </main>
  );
}
function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState<AtlasPoint[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [editingPoint, setEditingPoint] = useState<AtlasPoint | null>(null);
  const [editingArchive, setEditingArchive] = useState<ArchiveItem | null>(null);

  useEffect(() => {
    if (!editingPoint && !editingArchive) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    const timer = window.setTimeout(() => {
      const modal = document.querySelector<HTMLElement>(".final-modal");
      modal?.focus({ preventScroll: true });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [editingPoint, editingArchive]);

  const loadAdmin = async () => {
    if (!supabase || !session) return;
    const p = await supabase
      .from("atlas_points")
      .select("id,project_id,title,municipality,category,record_type,latitude,longitude,story,period,contributor,source,status,rating,review_count,attachment_count,created_at,updated_at")
      .in("status", ["pending", "draft", "published", "rejected"])
      .order("created_at", { ascending: true });
    const c = await supabase
      .from("contributions")
      .select("id,title,municipality,locality,story,period,category,record_type,contributor_name,contributor_email,contributor_phone,source,latitude,longitude,status,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    const pub = await supabase.from("atlas_points").select("id", { count: "exact", head: true }).eq("status", "published");
    const a = await supabase
      .from("archive_items")
      .select("id,title,type,description,public_url,file_path,file_name,mime_type,file_size,status,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (p.error) console.error(p.error);
    if (c.error) console.error(c.error);
    if (pub.error) console.error(pub.error);
    if (a.error) console.error(a.error);
    setPublishedCount(pub.count || 0);
    setPoints((p.data || []).map((x: any) => ({
      id: x.project_id || x.id,
      dbId: x.id,
      title: x.title,
      municipality: x.municipality,
      category: x.category,
      recordType: x.record_type,
      latitude: Number(x.latitude),
      longitude: Number(x.longitude),
      status: x.status,
      story: x.story,
      period: x.period || "",
      contributor: x.contributor || "",
      source: x.source || "",
      rating: Number(x.rating || 0),
      reviewCount: Number(x.review_count || 0),
      attachmentCount: Number(x.attachment_count || 0),
    })));
    const rows = c.data || [];
    const ids = rows.map((x: any) => x.id);
    const counts: Record<string, number> = {};
    if (ids.length) {
      const { data: files } = await supabase.from("attachments").select("id,contribution_id").in("contribution_id", ids);
      (files || []).forEach((f: any) => { counts[f.contribution_id] = (counts[f.contribution_id] || 0) + 1; });
    }
    setContributions(rows.map((x: any) => ({ id: x.id, title: x.title, municipality: x.municipality, text: x.story, status: "pending", created: new Date(x.created_at).toLocaleDateString("pt-BR"), attachmentCount: counts[x.id] || 0 })));
    setArchiveItems((a.data || []).map((item: any) => ({
      id: item.id, title: item.title, type: item.type, description: item.description || "",
      url: item.public_url || supabase!.storage.from("atlas-archive").getPublicUrl(item.file_path).data.publicUrl,
      fileName: item.file_name, mimeType: item.mime_type || "", fileSize: Number(item.file_size || 0),
      created: new Date(item.created_at).toLocaleDateString("pt-BR"), updatedAt: item.updated_at || item.created_at,
    })));
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    loadAdmin();
    const client = supabase;
    if (!client || !session) return;
    const channel = client
      .channel("admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "atlas_points" }, () => loadAdmin())
      .on("postgres_changes", { event: "*", schema: "public", table: "contributions" }, () => loadAdmin())
      .on("postgres_changes", { event: "*", schema: "public", table: "archive_items" }, () => loadAdmin())
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [session]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage("Login não autorizado. Confira o e-mail e a senha."); setBusy(false); return; }
    if (data.user?.user_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setMessage("Esta conta não tem permissão de administrador. No Supabase, defina user_metadata.role como admin para a conta da equipe.");
      setBusy(false); return;
    }
    setPassword(""); setBusy(false);
  };

  const moderate = async (kind: "point" | "contribution", id: string, status: "published" | "rejected") => {
    if (!supabase) return;
    setBusy(true); setMessage("");
    const now = new Date().toISOString();
    const result = kind === "point"
      ? await supabase.from("atlas_points").update({ status, updated_at: now, ...(status === "published" ? { approved_at: now } : {}) }).eq("id", id)
      : await supabase.from("contributions").update({ status, reviewed_at: now }).eq("id", id);
    if (result.error) { console.error(result.error); setMessage("Não foi possível atualizar a moderação. Verifique as políticas RLS."); setBusy(false); return; }
    await loadAdmin(); setBusy(false);
  };

  const savePointEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPoint) return;
    const data = new FormData(event.currentTarget);
    const latitude = Number(data.get("editLatitude"));
    const longitude = Number(data.get("editLongitude"));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) { setMessage("Latitude e longitude precisam ser números válidos."); return; }
    setBusy(true); setMessage("");
    try {
      await updateAtlasPoint(editingPoint, {
        title: String(data.get("editTitle") || "").trim(),
        municipality: String(data.get("editMunicipality") || ""),
        category: String(data.get("editCategory") || ""),
        recordType: String(data.get("editRecordType") || ""),
        latitude, longitude,
        period: String(data.get("editPeriod") || "").trim(),
        contributor: String(data.get("editContributor") || "").trim(),
        story: String(data.get("editStory") || "").trim(),
        source: String(data.get("editSource") || "").trim(),
      });
      setEditingPoint(null); await loadAdmin();
      projectAlert("O ponto foi editado e a versão publicada do Atlas foi atualizada automaticamente.", "success", "Ponto atualizado");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String((error as any)?.message || error || "Erro desconhecido");
      setMessage(`Não foi possível editar o ponto. ${detail}`);
    } finally { setBusy(false); }
  };

  const saveArchiveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingArchive) return;
    const data = new FormData(event.currentTarget);
    const title = String(data.get("adminArchiveTitle") || "").trim();
    if (!title) return;
    const file = (event.currentTarget.elements.namedItem("adminArchiveFile") as HTMLInputElement)?.files?.[0] || null;
    setBusy(true); setMessage("");
    try {
      await updateArchiveItem(editingArchive.id, { title, type: String(data.get("adminArchiveType") || editingArchive.type), description: String(data.get("adminArchiveDescription") || "").trim() }, file);
      setEditingArchive(null); await loadAdmin();
      projectAlert("O item do Acervo foi editado e o conteúdo público foi atualizado automaticamente.", "success", "Acervo atualizado");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String((error as any)?.message || error || "Erro desconhecido");
      setMessage(`Não foi possível editar o item do Acervo. ${detail}`);
    } finally { setBusy(false); }
  };

  if (!supabaseConfigured) return <main className="admin-page final-shell"><header><div><p className="kicker">ÁREA ADMINISTRATIVA</p><h1>Central de <em>moderação.</em></h1></div></header><p>Configure as credenciais do Supabase no arquivo <code>.env.local</code>.</p></main>;
  if (!session) return <main className="admin-page final-shell"><section className="admin-login"><p className="kicker">ÁREA ADMINISTRATIVA</p><h1>Acesso à <em>moderação.</em></h1><p>Entre com a conta da equipe autorizada no Supabase Auth.</p>{message && <div className="admin-message">{message}</div>}<form onSubmit={login}><label className="field"><span>E-mail</span><input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label><label className="field"><span>Senha</span><input name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="cta" disabled={busy}>{busy ? "Entrando…" : "Entrar"} <LockKeyhole /></button></form></section></main>;

  const pendingPoints = points.filter((p) => p.status === "pending" || p.status === "draft");
  const publishedPoints = points.filter((p) => p.status === "published");
  return (
    <main className="admin-page final-shell">
      <header><div><p className="kicker">ÁREA ADMINISTRATIVA</p><h1>Central de <em>moderação e edição.</em></h1><p>Gerencie pontos, memórias e itens do Acervo. As alterações salvas são refletidas automaticamente nas páginas públicas.</p></div><button className="secondary" onClick={() => supabase?.auth.signOut()}>Sair</button></header>
      {message && <div className="admin-message">{message}</div>}
      <section className="admin-stats">
        <article><ClipboardCheck /><b>{pendingPoints.length + contributions.length}</b><span>pendentes</span></article>
        <article><MapPin /><b>{publishedCount}</b><span>pontos publicados</span></article>
        <article><Heart /><b>{contributions.length}</b><span>memórias em análise</span></article>
        <article><Archive /><b>{archiveItems.length}</b><span>itens no Acervo</span></article>
      </section>

      <div className="admin-section-stack">
        <section className="admin-management-section"><div className="admin-section-head"><div><p className="kicker">PONTOS DO ATLAS</p><h2>Visualizar e editar pontos</h2><p>Todos os pontos já registrados aparecem aqui. Edite título, município, categoria, narrativa e coordenadas sem criar um novo pin.</p></div><span>{points.length} registro(s)</span></div>
          {points.length ? <div className="admin-record-list">{points.map((point) => <article className="admin-record-card" key={point.dbId || point.id}><div className="admin-record-icon"><MapPin /></div><div className="admin-record-body"><div className="admin-record-meta"><span className={`status-badge status-${point.status}`}>{point.status === "published" ? "Publicado" : point.status === "pending" || point.status === "draft" ? "Em análise" : "Rejeitado"}</span><small>{point.municipality} · {point.category}</small></div><h3>{point.title}</h3><p>{point.story}</p><small>{point.latitude.toFixed(6)}, {point.longitude.toFixed(6)} · {point.attachmentCount || 0} anexo(s)</small></div><div className="admin-actions"><button className="secondary" type="button" disabled={busy} onClick={() => setEditingPoint(point)}>Editar <FileText /></button>{point.status !== "published" && <button className="cta" disabled={busy} onClick={() => moderate("point", point.dbId || point.id, "published")}>Publicar</button>}{point.status === "published" && <button className="danger-button" disabled={busy} onClick={() => moderate("point", point.dbId || point.id, "rejected")}>Retirar</button>}</div></article>)}</div> : <p className="none">Nenhum ponto registrado.</p>}
        </section>

        <section className="admin-management-section"><div className="admin-section-head"><div><p className="kicker">ACERVO DIGITAL</p><h2>Visualizar e editar itens do Acervo</h2><p>Edite título, tipo, descrição ou substitua o arquivo. Ao salvar, o item público é atualizado automaticamente.</p></div><span>{archiveItems.length} item(ns)</span></div>
          {archiveItems.length ? <div className="admin-record-list">{archiveItems.map((item) => <article className="admin-record-card" key={item.id}><div className="admin-record-icon"><Archive /></div><div className="admin-record-body"><div className="admin-record-meta"><span className="status-badge status-published">Publicado</span><small>{item.type}</small></div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<small>{item.fileName} · {formatBytes(item.fileSize)} · {item.created}</small></div><div className="admin-actions"><a className="secondary" href={item.url} target="_blank" rel="noreferrer">Visualizar <ExternalLink /></a><button className="secondary" type="button" disabled={busy} onClick={() => setEditingArchive(item)}>Editar <FileText /></button></div></article>)}</div> : <p className="none">Nenhum item publicado no Acervo.</p>}
        </section>

        <div className="moderation-grid">
          <section><h2>Locais aguardando revisão</h2>{pendingPoints.length ? pendingPoints.map((point) => <article className="admin-item" key={point.dbId || point.id}><MapPin /><div><b>{point.title}</b><small>{point.municipality} · {point.category}</small><p>{point.story}</p></div><div className="admin-actions"><button className="cta" disabled={busy} onClick={() => moderate("point", point.dbId || point.id, "published")}>Publicar</button><button className="secondary" disabled={busy} onClick={() => setEditingPoint(point)}>Editar</button></div></article>) : <p className="none">Nenhum local pendente.</p>}</section>
          <section><h2>Memórias aguardando revisão</h2>{contributions.length ? contributions.map((item) => <article className="admin-item" key={item.id}><Heart /><div><b>{item.title}</b><small>{item.municipality} · {item.created}</small><p>{item.text}</p><span>{item.attachmentCount || 0} anexo(s)</span></div><div className="admin-actions"><button className="cta" disabled={busy} onClick={() => moderate("contribution", item.id, "published")}>Publicar</button><button className="danger-button" disabled={busy} onClick={() => moderate("contribution", item.id, "rejected")}>Rejeitar</button></div></article>) : <p className="none">Nenhuma memória pendente.</p>}</section>
        </div>
      </div>

      {editingPoint && <Modal close={() => !busy && setEditingPoint(null)}><p className="kicker">ADMINISTRAÇÃO · ATLAS</p><h2>Editar ponto</h2><form onSubmit={savePointEdit}><Input name="editTitle" label="Nome do lugar" required defaultValue={editingPoint.title} /><Select name="editMunicipality" label="Município" options={townNames} defaultValue={editingPoint.municipality} /><Select name="editCategory" label="Categoria" options={categories} defaultValue={editingPoint.category} /><Select name="editRecordType" label="Tipo de registro" options={recordTypes} defaultValue={editingPoint.recordType} /><Input name="editPeriod" label="Data, período ou época" defaultValue={editingPoint.period || ""} /><Input name="editContributor" label="Autor / pessoa entrevistada" defaultValue={editingPoint.contributor || ""} /><TextArea name="editStory" label="Memória / descrição" required defaultValue={editingPoint.story} /><TextArea name="editSource" label="Fonte / referência" defaultValue={editingPoint.source || ""} /><div className="admin-edit-coordinates"><Input name="editLatitude" label="Latitude" required defaultValue={editingPoint.latitude} /><Input name="editLongitude" label="Longitude" required defaultValue={editingPoint.longitude} /></div><p className="file-help">ID do banco: {editingPoint.dbId || editingPoint.id}</p><div className="admin-edit-actions"><button className="secondary" type="button" disabled={busy} onClick={() => setEditingPoint(null)}>Cancelar</button><button className="cta" type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar edição"} <CheckCircle2 /></button></div></form></Modal>}
      {editingArchive && <Modal close={() => !busy && setEditingArchive(null)}><p className="kicker">ADMINISTRAÇÃO · ACERVO</p><h2>Editar material</h2><form onSubmit={saveArchiveEdit}><Input name="adminArchiveTitle" label="Título" required defaultValue={editingArchive.title} /><Select name="adminArchiveType" label="Tipo" options={["Entrevista", "Mapa", "Fotografia", "Documento", "Áudio", "Vídeo", "Outro"]} defaultValue={editingArchive.type} /><TextArea name="adminArchiveDescription" label="Descrição / contexto" defaultValue={editingArchive.description} /><label className="field"><span>Substituir arquivo (opcional)</span><input name="adminArchiveFile" type="file" accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,audio/*,video/*" /><small className="file-help">Sem novo arquivo, o arquivo atual permanece.</small></label><div className="admin-edit-actions"><button className="secondary" type="button" disabled={busy} onClick={() => setEditingArchive(null)}>Cancelar</button><button className="cta" type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar edição"} <CheckCircle2 /></button></div></form></Modal>}
    </main>
  );
}

function PageHead({
  kicker,
  title,
  text,
}: {
  kicker: string;
  title: ReactNode;
  text: string;
}) {
  return (
    <section className="page-head">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
function Empty({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action: string;
}) {
  return (
    <section className="empty-final">
      {icon}
      <h2>{title}</h2>
      <button className="cta" onClick={() => go("/participe")}>
        {action} <ArrowRight />
      </button>
    </section>
  );
}
function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  return (
    <main className="final-page final-shell">
      <PageHead
        kicker={privacy ? "PRIVACIDADE" : "PARTICIPAÇÃO"}
        title={
          privacy ? (
            <>
              Privacidade e <em>proteção.</em>
            </>
          ) : (
            <>
              Termos de <em>participação.</em>
            </>
          )
        }
        text={
          privacy
            ? "Informações sobre o armazenamento das contribuições, arquivos e dados necessários ao funcionamento do Atlas."
            : "Orientações para envio, análise e publicação de memórias, documentos e registros no Atlas."
        }
      />
      <section className="legal-page">
        <article>
          <FileCheck />
          <h2>{privacy ? "Como os dados funcionam" : "Antes de enviar"}</h2>
          <p>
            {privacy
              ? "As contribuições enviadas com a conexão ativa são armazenadas no Supabase, e os arquivos autorizados são guardados no Supabase Storage. Registros enviados entram em moderação e só conteúdos aprovados são disponibilizados publicamente."
              : "Envie apenas materiais que você tenha autorização para compartilhar. Evite dados pessoais sensíveis de terceiros e respeite direitos autorais, privacidade e consentimentos de entrevistas e imagens."}
          </p>
        </article>
        <article>
          <ShieldCheck />
          <h2>{privacy ? "Uso responsável" : "Moderação"}</h2>
          <p>
            {privacy
              ? "O projeto utiliza os registros para fins educacionais, de pesquisa e preservação da memória local. O acesso público é limitado ao conteúdo publicado; a área de administração exige autenticação e permissão de equipe."
              : "Todo conteúdo enviado pode permanecer como “Em análise” até ser revisado pela equipe. A publicação deve considerar contexto, fonte, autorização e relevância histórica ou comunitária."}
          </p>
        </article>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="final-footer">
      <div>
        <a className="final-brand" href="#/">
          <img
            className="brand-logo-image"
            src={logoImage}
            alt="Memórias que Constroem Democracia"
          />
          <span>
            MEMÓRIAS<small>atlas participativo</small>
          </span>
        </a>
        <p>Atlas Histórico-Geográfico Participativo do Sertão Cearense.</p>
      </div>
      <div className="footer-links">
        <b>EXPLORAR</b>
        {nav
          .filter(([label]) => label !== "Admin")
          .slice(1)
          .map(([label, to]) => (
            <a key={to} href={"#" + to}>
              {label}
            </a>
          ))}
      </div>
      <div className="footer-contact">
        <b>CONTATO</b>
        <a href="mailto:memoriasdemocracia.ce@gmail.com">
          <Mail /> memoriasdemocracia.ce@gmail.com
        </a>
        <span>
          <Phone /> EEEP Alfredo Nunes de Melo
        </span>
        <div className="footer-legal">
          <a href="#/privacidade">Privacidade</a>
          <a href="#/termos">Termos de participação</a>
          <a href="#/acervo">Acervo</a>
        </div>
      </div>
      <p className="footer-credit" aria-label="Crédito do projeto">
        <ShieldCheck />{" "}
        <span>
          Projeto educacional desenvolvido por estudantes da rede pública do
          Ceará · © 2026.
        </span>
      </p>
    </footer>
  );
}
export default App;
