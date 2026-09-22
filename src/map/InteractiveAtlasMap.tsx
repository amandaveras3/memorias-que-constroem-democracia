import { useEffect, useMemo, useState } from 'react'
import { GeoJSON, LayersControl, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

export type AtlasPoint = {
  id: string
  dbId?: string
  title: string
  municipality: string
  category: string
  recordType: string
  latitude: number
  longitude: number
  status: 'draft' | 'pending' | 'published' | 'rejected'
  story: string
  period?: string
  contributor?: string
  source?: string
  rating: number
  reviewCount: number
  attachmentCount?: number
}

export type MapDraft = { latitude: number; longitude: number }
export type MapSearchTarget = { latitude: number; longitude: number; label?: string; nonce: number }

type Props = {
  points: AtlasPoint[]
  selectedId?: string
  draft?: MapDraft | null
  searchTarget?: MapSearchTarget | null
  onPin: (latitude: number, longitude: number) => void
  onSelect: (point: AtlasPoint) => void
}

const TARGET = ['Acopiara', 'Catarina', 'Deputado Irapuan Pinheiro', 'Piquet Carneiro']
const GEOJSON_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-23-mun.json'

const icon = L.divIcon({
  className: 'atlas-pin-icon',
  html: '<span></span>',
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -34],
})

const publishedIcon = L.divIcon({
  className: 'atlas-published-pin',
  html: '<span></span>',
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -38],
})

const selectedIcon = L.divIcon({
  className: 'atlas-selected-pin',
  html: '<span></span>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -42],
})

function MapClick({ onPin }: { onPin: Props['onPin'] }) {
  useMapEvents({
    click(event) {
      onPin(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function FitBounds({ geo }: { geo: any }) {
  const map = useMap()

  useEffect(() => {
    if (!geo) return

    const bounds = L.geoJSON(geo).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.08), { animate: false })
    }
  }, [geo, map])

  return null
}

function SearchTarget({ target }: { target: MapSearchTarget | null | undefined }) {
  const map = useMap()
  const [marker, setMarker] = useState<L.LatLngExpression | null>(null)

  useEffect(() => {
    if (!target) return

    const lat = Number(target.latitude)
    const lng = Number(target.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    const point: [number, number] = [lat, lng]
    setMarker(point)
    map.flyTo(point, Math.max(map.getZoom(), 15), { animate: true, duration: 0.8 })
  }, [target?.nonce, map])

  return marker ? (
    <Marker position={marker} icon={selectedIcon}>
      <Popup>
        {target?.label ? (
          <>
            <strong>{target.label}</strong>
            <br />
            <small>Localização encontrada</small>
          </>
        ) : (
          'Localização encontrada'
        )}
      </Popup>
    </Marker>
  ) : null
}

function Boundaries({ geo, onLoaded }: { geo: any; onLoaded: (g: any) => void }) {
  const data = useMemo(() => {
    if (!geo) return null

    const features = geo.features.filter((f: any) => TARGET.includes(f.properties?.name))
    return { type: 'FeatureCollection', features }
  }, [geo])

  useEffect(() => {
    if (data) onLoaded(data)
  }, [data, onLoaded])

  if (!data) return null

  return (
    <GeoJSON
      data={data as any}
      style={(feature: any) => ({
        color: feature?.properties?.name === 'Acopiara' ? '#ff5705' : '#8d1d81',
        weight: 2.2,
        fillColor: '#ffab2d',
        fillOpacity: 0.08,
        dashArray: '6 5',
      })}
      onEachFeature={(feature: any, layer: any) => {
        layer.bindTooltip(feature.properties?.name, {
          sticky: true,
          direction: 'center',
          className: 'municipality-tooltip',
        })
      }}
    />
  )
}

export default function InteractiveAtlasMap({
  points,
  selectedId,
  draft,
  searchTarget,
  onPin,
  onSelect,
}: Props) {
  const [geo, setGeo] = useState<any>(null)
  const [error, setError] = useState(false)
  const visible = useMemo(() => points.filter((p) => p.status === 'published'), [points])

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error('geojson')
        return r.json()
      })
      .then(setGeo)
      .catch(() => setError(true))
  }, [])

  const center: LatLngExpression = [-5.98, -39.48]
  const bounds: LatLngBoundsExpression = [[-6.55, -40.15], [-5.45, -38.85]]

  return (
    <div className="map-stack">
      <MapContainer
        center={center}
        zoom={9}
        minZoom={8}
        maxZoom={17}
        maxBounds={bounds}
        maxBoundsViscosity={0.8}
        scrollWheelZoom
        className="leaflet-atlas-map"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Ruas · OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapClick onPin={onPin} />
        <SearchTarget target={searchTarget} />
        <Boundaries geo={geo} onLoaded={() => {}} />

        {geo && (
          <FitBounds
            geo={{
              type: 'FeatureCollection',
              features: geo.features.filter((f: any) => TARGET.includes(f.properties?.name)),
            }}
          />
        )}

        {visible.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={selectedId === point.id ? selectedIcon : publishedIcon}
            eventHandlers={{ click: () => onSelect(point) }}
          >
            <Popup>
              <strong>{point.title}</strong>
              <br />
              <small>
                {point.municipality} · {point.category}
              </small>
            </Popup>
          </Marker>
        ))}

        {draft && (
          <Marker position={[draft.latitude, draft.longitude]} icon={icon}>
            <Popup>Local marcado. Preencha o formulário para enviar a memória.</Popup>
          </Marker>
        )}
      </MapContainer>

      {error && (
        <div className="map-warning">
          <MapPin /> Os limites municipais não carregaram. Algumas localizações podem ficar fora do território.
        </div>
      )}
    </div>
  )
}
