import { Menu, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import LogoMark from './LogoMark';

const links = [['Início','#'],['Atlas','#atlas'],['Projeto','#projeto'],['Galeria','#galeria'],['Memórias','#memorias']];
export default function Header({onContribute}:{onContribute:()=>void}) {
  const [open,setOpen]=useState(false); const [scrolled,setScrolled]=useState(false); const [home,setHome]=useState(window.location.hash==='');
  useEffect(()=>{const f=()=>setScrolled(window.scrollY>40); window.addEventListener('scroll',f); return()=>window.removeEventListener('scroll',f)},[]);
  const go=(hash:string)=>{setOpen(false); if(hash==='#') window.location.hash=''; else window.location.hash=hash.slice(1)};
  return <header className={`site-header ${home?'home-header':''} ${scrolled?'scrolled':''}`}>
    <button className="brand" onClick={()=>go('#')} aria-label="Início"><LogoMark/><span className="brand-name">Memórias que<br/>Constroem Democracia</span></button>
    <nav className={`nav ${open?'open':''}`}>{links.map(([label,hash])=><button key={hash} onClick={()=>go(hash)}>{label}</button>)}<button className="search-mini" onClick={()=>go('#memorias')}><Search size={16}/></button><button className="nav-cta" onClick={()=>{setOpen(false);onContribute()}}>Contribua</button></nav>
    <button className="menu-button" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
  </header>
}
