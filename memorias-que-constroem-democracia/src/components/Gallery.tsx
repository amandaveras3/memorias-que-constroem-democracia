import { Image as ImageIcon, MapPin, Play } from 'lucide-react';
import { useState } from 'react';
const filters=['Todos','Trabalho de campo','Patrimônio','Cartografia','Paisagens','Memórias'];
const items=[
 {id:1,title:'Monte Mor',city:'Acopiara',category:'Trabalho de campo',caption:'Registro editorial de campo.',image:'/assets/Fundo.png'},
 {id:2,title:'Território vivido',city:'Acopiara',category:'Paisagens',caption:'Área para fotografia documental.',image:'/assets/Fundo.png'},
 {id:3,title:'Cartografia social',city:'Catarina',category:'Cartografia',caption:'Registros das oficinas participativas.',image:'/assets/Fundo.png'},
 {id:4,title:'Trilha dos Caldeirões',city:'Deputado Irapuan Pinheiro',category:'Trabalho de campo',caption:'Paisagem e patrimônio em campo.',image:'/assets/Fundo.png'},
 {id:5,title:'Memória e patrimônio',city:'Piquet Carneiro',category:'Patrimônio',caption:'Arquitetura e lugares de memória.',image:'/assets/Fundo.png'},
 {id:6,title:'Vozes do território',city:'Quatro cidades',category:'Memórias',caption:'Espaço reservado para entrevistas.',image:'/assets/Fundo.png'}
];
export default function Gallery(){const [filter,setFilter]=useState('Todos');const visible=items.filter(i=>filter==='Todos'||i.category===filter);return <section className="gallery-page" id="galeria"><div className="section-title"><span className="eyebrow">ARQUIVO VISUAL</span><h2>Galeria do território.</h2><p>Fotografias, cartografias, registros de campo e materiais que ajudam a contar a história das quatro cidades.</p></div><div className="gallery-filters">{filters.map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="gallery-masonry">{visible.map((item,i)=><article className={`gallery-item gallery-${i%4}`} key={item.id}><img src={item.image} alt=""/><div className="gallery-overlay"><span>{item.category}</span><h3>{item.title}</h3><p><MapPin size={12}/> {item.city}</p><small>{item.caption}</small>{item.category==='Memórias'?<Play/>:<ImageIcon/>}</div></article>)}</div></section>}
