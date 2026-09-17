import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Headphones,
  Landmark,
  Map,
  MapPin,
  Maximize2,
  Menu,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sun,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import acopiaraImage from "./assets/municipios/acopiara.jpeg";
import catarinaImage from "./assets/municipios/catarina.jpeg";
import irapuanImage from "./assets/municipios/irapuan.jpeg";
import piquetImage from "./assets/municipios/piquet.jpeg";

type Municipality =
  | "Acopiara"
  | "Catarina"
  | "Deputado Irapuan Pinheiro"
  | "Piquet Carneiro";
type Place = {
  id: number;
  title: string;
  municipality: Municipality;
  category: string;
  recordType: string;
  x: number;
  y: number;
  excerpt: string;
  source: string;
};
type Contribution = {
  id: number;
  title: string;
  municipality: string;
  text: string;
  createdAt: string;
  status: "Em análise";
};
const towns: {
  name: Municipality;
  image: string;
  initials: string;
  description: string;
}[] = [
  {
    name: "Acopiara",
    image: acopiaraImage,
    initials: "AC",
    description: "Registros, paisagens e memórias em construção.",
  },
  {
    name: "Catarina",
    image: catarinaImage,
    initials: "CA",
    description: "Registros, paisagens e memórias em construção.",
  },
  {
    name: "Deputado Irapuan Pinheiro",
    image: irapuanImage,
    initials: "DI",
    description: "Registros, paisagens e memórias em construção.",
  },
  {
    name: "Piquet Carneiro",
    image: piquetImage,
    initials: "PC",
    description: "Registros, paisagens e memórias em construção.",
  },
];
const places: Place[] = [
  {
    id: 1,
    title: "Ponto de escuta comunitária",
    municipality: "Acopiara",
    category: "Memória afetiva",
    recordType: "Memória comunitária",
    x: 28,
    y: 37,
    excerpt:
      "Espaço demonstrativo aguardando o primeiro relato validado pela equipe.",
    source: "Registro comunitário",
  },
  {
    id: 2,
    title: "Registro de paisagem",
    municipality: "Catarina",
    category: "Paisagem",
    recordType: "Pesquisa de campo",
    x: 68,
    y: 30,
    excerpt:
      "Ficha demonstrativa preparada para receber observações de campo e fontes.",
    source: "Pesquisa de campo",
  },
  {
    id: 3,
    title: "Mapa da oficina",
    municipality: "Deputado Irapuan Pinheiro",
    category: "Educação",
    recordType: "Mapa",
    x: 40,
    y: 71,
    excerpt:
      "Espaço destinado aos mapas produzidos por estudantes nas oficinas.",
    source: "Pesquisa de campo",
  },
  {
    id: 4,
    title: "Acervo de memória local",
    municipality: "Piquet Carneiro",
    category: "Lugar de memória",
    recordType: "Fotografia",
    x: 77,
    y: 67,
    excerpt:
      "Ficha demonstrativa sem conteúdo histórico publicado nesta versão.",
    source: "Fonte documental",
  },
];
const categories = [
  "Todos",
  "Patrimônio histórico",
  "Patrimônio cultural",
  "Patrimônio natural",
  "Lugar de memória",
  "Memória afetiva",
  "Cultura",
  "Religiosidade",
  "Educação",
  "Vida comunitária",
  "Paisagem",
  "Outros",
];
const recordTypes = [
  "Todos",
  "Fotografia",
  "Documento",
  "Entrevista",
  "Áudio",
  "Vídeo",
  "Mapa",
  "Memória comunitária",
  "Pesquisa de campo",
];
const nav = [
  ["Início", "/"],
  ["Atlas", "/atlas"],
  ["Municípios", "/municipios"],
  ["Memórias", "/memorias"],
  ["Pesquisa", "/pesquisa"],
  ["Participe", "/participe"],
  ["Educação", "/educacao"],
];
const route = (to: string) => {
  location.hash = to;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function App() {
  const [path, setPath] = useState(location.hash.slice(1) || "/");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("atlas-theme") === "dark" ? "dark" : "light",
  );
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onHash = () => {
      setPath(location.hash.slice(1) || "/");
      setMenu(false);
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("atlas-theme", theme);
  }, [theme]);
  const page =
    path === "/atlas" ? (
      <Atlas />
    ) : path === "/municipios" ? (
      <Municipalities />
    ) : path === "/participe" ? (
      <Participate />
    ) : path === "/memorias" ? (
      <Memories />
    ) : path === "/pesquisa" ? (
      <Research />
    ) : path === "/educacao" ? (
      <Education />
    ) : (
      <Home />
    );
  return (
    <>
      <Header
        path={path}
        menu={menu}
        setMenu={setMenu}
        theme={theme}
        setTheme={setTheme}
        openSearch={() => setSearchOpen(true)}
      />
      {page}
      <Footer />
      {searchOpen && <GlobalSearch close={() => setSearchOpen(false)} />}
    </>
  );
}
function Header({
  path,
  menu,
  setMenu,
  theme,
  setTheme,
  openSearch,
}: {
  path: string;
  menu: boolean;
  setMenu: (v: boolean) => void;
  theme: string;
  setTheme: (v: "light" | "dark") => void;
  openSearch: () => void;
}) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#/"
        onClick={() => route("/")}
        aria-label="Ir para início"
      >
        <span className="brand-mark">m.</span>
        <span>
          MEMÓRIAS <i>atlas participativo</i>
        </span>
      </a>
      <nav className={menu ? "nav open" : "nav"}>
        {nav.map(([label, to]) => (
          <a
            className={path === to ? "active" : ""}
            key={to}
            href={"#" + to}
            onClick={() => route(to)}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-tools">
        <button onClick={openSearch} aria-label="Abrir busca">
          <Search size={18} />
        </button>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Alternar tema"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          className="menu-button"
          onClick={() => setMenu(!menu)}
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </button>
      </div>
    </header>
  );
}
function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-noise" />
        <div className="hero-copy">
          <p className="eyebrow on-image">
            ATLAS HISTÓRICO-GEOGRÁFICO PARTICIPATIVO
          </p>
          <h1>
            Memórias que
            <br />
            <em>constroem</em> democracia.
          </h1>
          <p>
            Cada lugar guarda uma memória. Cada memória constrói nossa história.
          </p>
          <div className="button-row">
            <button className="button primary" onClick={() => route("/atlas")}>
              Explorar o Atlas <ArrowRight />
            </button>
            <button className="button glass" onClick={() => route("/pesquisa")}>
              Conhecer o projeto
            </button>
          </div>
        </div>
        <div className="hero-meta">
          <span>CEARÁ · BRASIL</span>
          <span className="hero-line" />
          <span>4 MUNICÍPIOS · 1 ATLAS COLETIVO</span>
        </div>
      </section>
      <section className="statement shell">
        <div>
          <p className="eyebrow">O TERRITÓRIO FALA</p>
          <h2>
            O mapa mostra onde.
            <br />
            As pessoas contam <em>por quê.</em>
          </h2>
        </div>
        <div className="statement-text">
          <p>
            Um território não é apenas um espaço no mapa. Ele também é feito de
            histórias, memórias, relações, identidades e experiências de quem o
            vive.
          </p>
          <button className="arrow-link" onClick={() => route("/participe")}>
            Compartilhar uma memória <ArrowRight size={18} />
          </button>
        </div>
      </section>
      <section className="shell stats">
        <div>
          <strong>4</strong>
          <span>municípios</span>
        </div>
        <div>
          <strong>01</strong>
          <span>atlas coletivo</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>contribuições moderadas</span>
        </div>
        <div>
          <strong>∞</strong>
          <span>memórias por preservar</span>
        </div>
      </section>
      <TownGrid title="Quatro territórios, muitas histórias" />
      <section className="shell invitation">
        <div className="invitation-map">
          <Map />
          <span>
            O SEU LUGAR
            <br />
            TAMBÉM PODE
            <br />
            ESTAR AQUI.
          </span>
        </div>
        <div>
          <p className="eyebrow">PARTICIPAÇÃO COMUNITÁRIA</p>
          <h2>O Atlas cresce com a comunidade.</h2>
          <p>
            Registre uma memória, indique um lugar ou envie um documento. Todo
            conteúdo passa por análise antes de ser publicado.
          </p>
          <button
            className="button primary"
            onClick={() => route("/participe")}
          >
            Conte sua memória <ArrowRight />
          </button>
        </div>
      </section>
    </main>
  );
}
function TownGrid({ title }: { title: string }) {
  return (
    <section className="town-section shell">
      <div className="section-title">
        <div>
          <p className="eyebrow">RECORTE DA PESQUISA</p>
          <h2>{title}</h2>
        </div>
        <button className="arrow-link" onClick={() => route("/municipios")}>
          Ver municípios <ArrowRight size={18} />
        </button>
      </div>
      <div className="town-grid">
        {towns.map((t) => (
          <article className="town-card" key={t.name}>
            <img src={t.image} alt={"Fotografia de " + t.name} />
            <div className="town-overlay" />
            <div className="town-card-content">
              <span>{t.initials} · CEARÁ</span>
              <h3>{t.name}</h3>
              <p>{t.description}</p>
              <div>
                <button onClick={() => route("/municipios")}>
                  Conhecer <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => route("/atlas")}
                  aria-label={"Ver " + t.name + " no Atlas"}
                >
                  <MapPin size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function Atlas() {
  const [municipality, setMunicipality] = useState("Todos"),
    [category, setCategory] = useState("Todos"),
    [recordType, setRecordType] = useState("Todos"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Place | null>(null),
    [zoom, setZoom] = useState(1),
    [full, setFull] = useState(false);
  const results = useMemo(
    () =>
      places.filter(
        (p) =>
          (municipality === "Todos" || p.municipality === municipality) &&
          (category === "Todos" || p.category === category) &&
          (recordType === "Todos" || p.recordType === recordType) &&
          p.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [municipality, category, recordType, query],
  );
  return (
    <main className={"atlas-view " + (full ? "atlas-full" : "")}>
      <div className="shell atlas-heading">
        <div>
          <p className="eyebrow">EXPLORAR O ATLAS</p>
          <h1>
            Território em <em>camadas.</em>
          </h1>
          <p>Filtre os registros e descubra lugares, fontes e histórias.</p>
        </div>
        <button className="button soft" onClick={() => route("/participe")}>
          <Plus size={17} /> Adicionar memória
        </button>
      </div>
      <div className="atlas-workspace">
        <aside className="atlas-sidebar">
          <label className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no território"
            />
          </label>
          <Select
            label="Município"
            value={municipality}
            set={setMunicipality}
            options={["Todos", ...towns.map((t) => t.name)]}
          />
          <Select
            label="Categoria"
            value={category}
            set={setCategory}
            options={categories}
          />
          <Select
            label="Tipo de registro"
            value={recordType}
            set={setRecordType}
            options={recordTypes}
          />
          <div className="atlas-result">
            <span>{results.length} registros visíveis</span>
            <small>Dados demonstrativos</small>
          </div>
          <button
            className="reset"
            onClick={() => {
              setMunicipality("Todos");
              setCategory("Todos");
              setRecordType("Todos");
              setQuery("");
            }}
          >
            Limpar filtros
          </button>
        </aside>
        <section className="map-panel">
          <div className="map-top">
            <span>
              <MapPin size={16} /> Recorte atual: quatro municípios
            </span>
            <div>
              <button
                onClick={() => setZoom(Math.max(0.8, zoom - 0.1))}
                aria-label="Diminuir zoom"
              >
                <ZoomOut />
              </button>
              <button
                onClick={() => setZoom(Math.min(1.25, zoom + 0.1))}
                aria-label="Aumentar zoom"
              >
                <ZoomIn />
              </button>
              <button
                onClick={() => setFull(!full)}
                aria-label="Alternar tela ampla"
              >
                <Maximize2 />
              </button>
            </div>
          </div>
          <div
            className="map-canvas"
            style={{ "--map-zoom": zoom } as CSSProperties}
          >
            <div className="topography" />
            {towns.map((t, i) => (
              <div className={"map-region region-" + i} key={t.name}>
                <span>{t.name}</span>
              </div>
            ))}
            {results.map((p) => (
              <button
                style={{ left: p.x + "%", top: p.y + "%" }}
                key={p.id}
                className="map-marker"
                onClick={() => setSelected(p)}
                aria-label={"Abrir " + p.title}
              >
                <i />
              </button>
            ))}
            <div className="map-disclaimer">
              Visual demonstrativo. Coordenadas e camadas oficiais serão
              inseridas após validação da pesquisa.
            </div>
          </div>
          <div className="map-bottom">
            <span>
              <i className="legend-dot" /> Registro do Atlas
            </span>
            <span>Use os filtros para refinar a exploração.</span>
          </div>
        </section>
        <aside className="record-list">
          <div className="record-list-title">
            <span>REGISTROS</span>
            <b>{results.length}</b>
          </div>
          {results.map((p) => (
            <button
              className="record-row"
              key={p.id}
              onClick={() => setSelected(p)}
            >
              <span className="record-icon">
                <MapPin size={15} />
              </span>
              <span>
                <b>{p.title}</b>
                <small>
                  {p.municipality} · {p.category}
                </small>
              </span>
              <ArrowRight size={15} />
            </button>
          ))}
          {!results.length && (
            <p className="no-results">
              Nenhum registro encontrado para estes filtros.
            </p>
          )}
        </aside>
      </div>
      {selected && (
        <PlaceModal place={selected} close={() => setSelected(null)} />
      )}
    </main>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(e) => set(e.target.value)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  );
}
function PlaceModal({ place, close }: { place: Place; close: () => void }) {
  const town = towns.find((t) => t.name === place.municipality)!;
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <article className="place-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="icon-close" onClick={close} aria-label="Fechar">
          <X />
        </button>
        <img src={town.image} alt="" />
        <div className="modal-content">
          <span className="data-badge">DADO DEMONSTRATIVO</span>
          <p className="eyebrow">
            {place.municipality} · {place.category}
          </p>
          <h2>{place.title}</h2>
          <p>{place.excerpt}</p>
          <div className="source-info">
            <span>Origem do registro</span>
            <b>{place.source}</b>
            <span>Tipo</span>
            <b>{place.recordType}</b>
          </div>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => route("/memorias")}
            >
              Ver memórias <ArrowRight />
            </button>
            <button className="button outline" onClick={close}>
              Voltar ao mapa
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
function Municipalities() {
  return (
    <main className="page shell">
      <PageIntro
        eyebrow="MUNICÍPIOS"
        title={
          <>
            Quatro municípios.
            <br />
            <em>Um território conectado.</em>
          </>
        }
        text="Cada acervo reunirá memórias, lugares, fotografias, documentos, mapas e vozes da comunidade."
      />
      <TownGrid title="Conheça os municípios pesquisados" />
    </main>
  );
}
function Memories() {
  return (
    <main className="page shell">
      <PageIntro
        eyebrow="MEMÓRIAS DO TERRITÓRIO"
        title={
          <>
            Histórias contadas por
            <br />
            <em>quem vive o Sertão.</em>
          </>
        }
        text="Os relatos aprovados pela equipe de pesquisa serão organizados aqui, sempre identificando sua origem e contexto."
      />
      <section className="empty-state">
        <Headphones />
        <h2>O acervo de memórias está sendo preparado.</h2>
        <p>Você pode ajudar a iniciar esta coleção coletiva.</p>
        <button className="button primary" onClick={() => route("/participe")}>
          Conte sua memória <ArrowRight />
        </button>
      </section>
    </main>
  );
}
function Research() {
  const phases = [
    "Pesquisa bibliográfica",
    "Pesquisa documental",
    "História oral",
    "Trabalho de campo",
    "Cartografia participativa",
    "Análise de conteúdo",
    "Organização de dados",
    "Construção do Atlas",
  ];
  return (
    <main className="page shell">
      <PageIntro
        eyebrow="SOBRE A PESQUISA"
        title={
          <>
            Ciência feita
            <br />
            com o <em>território.</em>
          </>
        }
        text="O projeto aproxima escola, comunidade e pesquisa para preservar e democratizar conhecimentos sobre os municípios."
      />
      <section className="research-grid">
        <article>
          <Landmark />
          <h2>Por que memória é democracia?</h2>
          <p>
            Preservar diferentes experiências e permitir participação social
            democratiza o conhecimento sobre o território.
          </p>
        </article>
        <div className="method">
          <p className="eyebrow">METODOLOGIA</p>
          {phases.map((phase, index) => (
            <div key={phase}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{phase}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
function Education() {
  const items = [
    "Investigue um lugar de memória da sua comunidade.",
    "Compare uma fotografia antiga e atual.",
    "Crie um mapa afetivo.",
    "Entreviste um morador.",
  ];
  return (
    <main className="page shell">
      <PageIntro
        eyebrow="APRENDA COM O ATLAS"
        title={
          <>
            Conhecer o território
            <br />é aprender a <em>pertencer.</em>
          </>
        }
        text="Propostas e materiais para professores e estudantes iniciarem suas próprias investigações."
      />
      <section className="learning-grid">
        {items.map((item, i) => (
          <article key={item}>
            <BookOpen />
            <span>ATIVIDADE {String(i + 1).padStart(2, "0")}</span>
            <h2>{item}</h2>
            <button className="arrow-link">
              Em breve <ArrowRight size={17} />
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: ReactNode;
  text: string;
}) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
function Participate() {
  const [sent, setSent] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("atlas-contributions") || "[]");
    } catch {
      return [];
    }
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const record: Contribution = {
      id: Date.now(),
      title: String(data.get("title")),
      municipality: String(data.get("municipality")),
      text: String(data.get("memory")),
      createdAt: new Date().toLocaleDateString("pt-BR"),
      status: "Em análise",
    };
    const updated = [record, ...contributions];
    setContributions(updated);
    localStorage.setItem("atlas-contributions", JSON.stringify(updated));
    setSent(true);
  };
  return (
    <main className="participation">
      <section className="participation-copy">
        <p className="eyebrow on-image">PARTICIPAÇÃO COMUNITÁRIA</p>
        <h1>
          Qual lugar guarda uma <em>memória sua?</em>
        </h1>
        <p>
          Toda comunidade possui histórias que merecem ser preservadas.
          Compartilhe uma memória, um lugar ou uma história importante para
          você.
        </p>
        <div className="approval-flow">
          <span>
            <b>01</b> Enviada
          </span>
          <ArrowRight />
          <span>
            <b>02</b> Em análise
          </span>
          <ArrowRight />
          <span>
            <b>03</b> Publicada
          </span>
        </div>
        <p className="privacy-note">
          <ShieldCheck size={16} /> Nenhuma contribuição é publicada
          automaticamente.
        </p>
      </section>
      <section className="form-wrap">
        {sent ? (
          <div className="confirmation">
            <div className="confirm-icon">
              <Check />
            </div>
            <p className="eyebrow">CONTRIBUIÇÃO RECEBIDA</p>
            <h2>Sua memória entrou no Atlas.</h2>
            <p>
              Ela está em análise e será publicada apenas depois da revisão da
              equipe de pesquisa.
            </p>
            <button className="button outline" onClick={() => setSent(false)}>
              Enviar outra memória
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="eyebrow">CONTE SUA MEMÓRIA</p>
            <h2>Seu relato tem lugar aqui.</h2>
            <div className="form-grid">
              <FormLabel label="Título da memória">
                <input
                  name="title"
                  required
                  placeholder="Como você chamaria essa história?"
                />
              </FormLabel>
              <FormLabel label="Município">
                <select name="municipality" required defaultValue="">
                  <option value="" disabled>
                    Selecione um município
                  </option>
                  {towns.map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                </select>
              </FormLabel>
              <FormLabel label="Bairro ou localidade">
                <input name="locality" placeholder="Onde aconteceu?" />
              </FormLabel>
              <FormLabel label="Período">
                <input name="period" placeholder="Ex.: década de 1990" />
              </FormLabel>
            </div>
            <FormLabel label="Sua memória">
              <textarea
                name="memory"
                required
                rows={5}
                placeholder="Conte a história que deseja preservar..."
              />
            </FormLabel>
            <label className="consent">
              <input type="checkbox" required />
              <span>
                Li e aceito os termos de publicação e a Política de Privacidade.
              </span>
            </label>
            <button className="button primary" type="submit">
              Enviar para moderação <Send />
            </button>
          </form>
        )}
        {contributions.length > 0 && !sent && (
          <p className="draft-count">
            <Clock3 size={15} /> {contributions.length} contribuição(ões)
            salva(s) neste navegador.
          </p>
        )}
      </section>
    </main>
  );
}
function FormLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="form-label">
      <span>{label}</span>
      {children}
    </label>
  );
}
function GlobalSearch({ close }: { close: () => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(
    () =>
      [
        ...towns.map((t) => ({
          type: "Município",
          title: t.name,
          action: "/municipios",
        })),
        ...places.map((p) => ({
          type: p.category,
          title: p.title,
          action: "/atlas",
        })),
      ].filter((i) => i.title.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  return (
    <div className="search-overlay" onMouseDown={close}>
      <section onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-dialog-input">
          <Search />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="O que você procura no território?"
          />
          <button onClick={close} aria-label="Fechar busca">
            <X />
          </button>
        </div>
        <p>RESULTADOS {q && `· ${results.length}`}</p>
        <div className="search-results">
          {q ? (
            results.map((item) => (
              <button
                key={item.type + item.title}
                onClick={() => {
                  route(item.action);
                  close();
                }}
              >
                <span>{item.type}</span>
                <b>{item.title}</b>
                <ArrowRight size={16} />
              </button>
            ))
          ) : (
            <div className="search-hint">
              Procure por municípios, lugares, memórias e registros.
            </div>
          )}
          {q && !results.length && (
            <div className="search-hint">Nenhum resultado encontrado.</div>
          )}
        </div>
      </section>
    </div>
  );
}
function Footer() {
  return (
    <footer>
      <div>
        <a className="brand" href="#/">
          <span className="brand-mark">m.</span>
          <span>
            MEMÓRIAS <i>atlas participativo</i>
          </span>
        </a>
        <p>Atlas Histórico-Geográfico Participativo do Sertão Cearense.</p>
        <small>EEEP Alfredo Nunes de Melo · Ceará Científico 2026</small>
      </div>
      <div className="footer-links">
        {nav.slice(1).map(([label, to]) => (
          <a key={to} href={"#" + to}>
            {label}
          </a>
        ))}
      </div>
      <div className="footer-note">
        <ShieldCheck size={18} />
        <span>
          Dados demonstrativos não representam fatos históricos ou registros
          oficiais.
        </span>
      </div>
    </footer>
  );
}
export default App;
