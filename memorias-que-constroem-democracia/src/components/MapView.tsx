import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import L from 'leaflet';
import type { City, Memory, Place } from '../types';

const IBGE_MESH_URL = 'https://servicodados.ibge.gov.br/api/v3/malhas/estados/23?intrarregiao=municipios&formato=application/vnd.geo+json&qualidade=maxima&periodo=2025';
const IBGE_CITIES_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/23/municipios';

const iconCache=new Map<string,L.DivIcon>();
function pinIcon(color:string){if(!iconCache.has(color))iconCache.set(color,L.divIcon({className:'custom-pin-wrap',html:`<div class="custom-pin" style="--pin:${color}"><span></span></div>`,iconSize:[34,42],iconAnchor:[17,40],popupAnchor:[0,-35]}));return iconCache.get(color)!}
function labelIcon(color:string,name:string){return L.divIcon({className:'city-label-wrap',html:`<div class="city-label" style="--city:${color}">${name}</div>`,iconSize:[180,30],iconAnchor:[90,15]})}
function Recenter({center,zoom}:{center:[number,number];zoom:number}){const map=useMap();useEffect(()=>{map.flyTo(center,zoom,{duration:.7})},[center,zoom,map]);return null}
function MapClick({onAdd}:{onAdd:(lat:number,lng:number)=>void}){const map=useMap();useEffect(()=>{const h=(e:L.LeafletMouseEvent)=>onAdd(e.latlng.lat,e.latlng.lng);map.on('click',h);return()=>{map.off('click',h)}},[map,onAdd]);return null}

type MeshFeature = Feature<Geometry, { codarea?: string; nome?: string }>;
type Mesh = FeatureCollection<Geometry, { codarea?: string; nome?: string }>;
type IbgeCity = { id:number; nome:string };

export default function MapView({cities,memories,places,selectedCity,onSelectMemory,onAddAt}:{cities:City[];memories:Memory[];places:Place[];selectedCity:number|'all';onSelectMemory:(m:Memory)=>void;onAddAt:(lat:number,lng:number)=>void}){
 const [mesh,setMesh]=useState<Mesh|null>(null);
 const [ibgeCities,setIbgeCities]=useState<Map<string,string>>(new Map());
 const [meshStatus,setMeshStatus]=useState<'loading'|'ready'|'error'>('loading');
 const allCenter:[number,number]=[-5.97,-39.55];
 const selected=selectedCity==='all'?undefined:cities.find(c=>c.id===selectedCity);
 const visibleMem=memories.filter(m=>selectedCity==='all'||m.cityId===selectedCity);
 const visiblePlaces=places.filter(p=>selectedCity==='all'||p.cityId===selectedCity);
 const selectedCodes=useMemo(()=>new Set(cities.map(c=>c.ibgeCode)),[cities]);
 const cityByCode=useMemo(()=>new Map(cities.map(c=>[c.ibgeCode,c])),[cities]);

 useEffect(()=>{
   let cancelled=false;
   async function load(){
     setMeshStatus('loading');
     try{
       const [meshResponse,citiesResponse]=await Promise.all([fetch(IBGE_MESH_URL),fetch(IBGE_CITIES_URL)]);
       if(!meshResponse.ok) throw new Error(`Malha IBGE: ${meshResponse.status}`);
       const data=await meshResponse.json() as Mesh;
       const names=await citiesResponse.json() as IbgeCity[];
       if(!cancelled){
         setMesh(data);
         setIbgeCities(new Map(names.map(c=>[String(c.id),c.nome])));
         setMeshStatus('ready');
       }
     }catch(error){
       console.error('Não foi possível carregar a malha municipal do IBGE.',error);
       if(!cancelled) setMeshStatus('error');
     }
   }
   load();
   return()=>{cancelled=true};
 },[]);

 const meshStyle=(feature?:MeshFeature)=>{
   const code=String(feature?.properties?.codarea??'');
   const city=cityByCode.get(code);
   const isSelected=selectedCity!=='all' && city?.id===selectedCity;
   const isAtlasCity=selectedCodes.has(code);
   return {
     color:isAtlasCity ? city?.color ?? '#B9A990' : '#9C927F',
     weight:isSelected?3.4:isAtlasCity?2.4:0.8,
     opacity:isAtlasCity?1:0.65,
     fillColor:isAtlasCity?city?.color ?? '#E8DFD0':'#E9E2D6',
     fillOpacity:isSelected?0.24:isAtlasCity?0.16:0.035,
   };
 };

 const onEachMunicipality=(feature:MeshFeature,layer:L.Layer)=>{
   const code=String(feature.properties?.codarea??'');
   const name=ibgeCities.get(code)??feature.properties?.nome??code;
   const city=cityByCode.get(code);
   layer.bindTooltip(name,{sticky:true,direction:'top',className:city?'atlas-municipality-label':'neighbor-label'});
   layer.on({
     click:()=>{
       const popup=document.createElement('div');
       if(city){
         popup.innerHTML=`<strong>${city.name}</strong><br/><span>Município do recorte do Atlas</span><br/><small>Código IBGE ${city.ibgeCode}</small>`;
       }else{
         popup.innerHTML=`<strong>${name}</strong><br/><span>Município limítrofe / entorno</span><br/><small>Fora do recorte principal do Atlas</small>`;
       }
       (layer as L.Path).bindPopup(popup).openPopup();
     }
   });
 };

 return <div className="map-shell">
   <MapContainer center={selected?.center??allCenter} zoom={selected?.zoom??9} scrollWheelZoom className="map">
    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    {selected&&<Recenter center={selected.center} zoom={selected.zoom}/>} 
    {mesh&&<GeoJSON key={`ibge-mesh-${selectedCity}`} data={mesh} style={meshStyle} onEachFeature={onEachMunicipality}/>} 
    {selectedCity==='all'&&cities.map(c=><Marker key={`label-${c.id}`} position={c.center} icon={labelIcon(c.color,c.name)}/>)}
    {visiblePlaces.map(p=><Marker key={`place-${p.id}`} position={[p.lat,p.lng]} icon={pinIcon(cities.find(c=>c.id===p.cityId)?.color||'#FE5300')}><Popup><strong>{p.name}</strong><br/>{p.kind}{p.description&&<><br/><small>{p.description}</small></>}</Popup></Marker>)}
    {visibleMem.map(m=><Marker key={`mem-${m.id}`} position={[m.lat,m.lng]} icon={pinIcon(cities.find(c=>c.id===m.cityId)?.color||'#FE5300')} eventHandlers={{click:()=>onSelectMemory(m)}}><Popup><strong>{m.title}</strong><br/>{m.category} · {m.neighborhood}<br/><button className="map-popup-link" onClick={()=>onSelectMemory(m)}>Abrir memória</button></Popup></Marker>)}
    <MapClick onAdd={onAddAt}/>
   </MapContainer>
   <div className="map-legend"><strong>LIMITES MUNICIPAIS</strong><span>● cidades do Atlas</span><span>— limites oficiais da malha IBGE</span><span>· municípios do entorno / limítrofes</span></div>
   <div className="map-action">⊕ Clique no mapa para registrar uma memória</div>
   <div className={`map-source ${meshStatus}`}>{meshStatus==='loading'?'Carregando malha municipal oficial…':meshStatus==='error'?'Malha oficial indisponível — verifique sua conexão.':'Malha Municipal Digital IBGE · 2025 · SIRGAS 2000'}</div>
 </div>
}
