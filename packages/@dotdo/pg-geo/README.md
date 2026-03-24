---
name: "@dotdo/pg-geo"
version: 0.1.1
description: "PostGIS-like geospatial capabilities with Turf.js + R-tree + PGlite + Cap'n Web RPC"
license: MIT
keywords:
  - geospatial
  - gis
  - postgis
  - turf
  - pglite
  - cloudflare
  - durable-objects
  - workers
  - edge
  - rpc
  - capnweb
downloads:
  monthly: 682
published: "2026-01-22T15:58:49.867Z"
updated: "2026-01-24T15:49:10.103Z"
---

# @dotdo/pg-geo

[![npm version](https://img.shields.io/npm/v/@dotdo/pg-geo.svg)](https://www.npmjs.com/package/@dotdo/pg-geo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

PostGIS-like geospatial capabilities for edge computing using Turf.js + R-tree + PGlite + Cap'n Web RPC.

## Features

- **GeoStorage**: GeoJSON storage backed by PGlite with optional R-tree spatial indexing
- **GeoStore**: Unified geospatial operations using Turf.js for spatial computations
- **GeoDO**: Cloudflare Durable Object wrapper with Cap'n Web RPC support
- **SpatialIndex**: R-tree based spatial indexing for fast bounding box queries
- **Memory Efficient**: Selective Turf.js imports reduce bundle size from 500KB to ~150KB
- **Edge-Ready**: Designed for Cloudflare Workers with 128MB memory constraints

## Installation

```bash
npm install @dotdo/pg-geo
# or
pnpm add @dotdo/pg-geo
# or
yarn add @dotdo/pg-geo
```

## Quick Start

### GeoStorage (PGlite + R-tree)

```typescript
import { GeoStorage } from '@dotdo/pg-geo/storage'

// Create storage with spatial indexing
const storage = await GeoStorage.create({
  tableName: 'locations',
  enableSpatialIndex: true
})

// Insert a location
await storage.insert('store-1', {
  type: 'Point',
  coordinates: [-122.4194, 37.7749]
}, {
  name: 'San Francisco Store',
  category: 'retail'
})

// Find locations within radius
const nearby = await storage.findWithin(
  { type: 'Point', coordinates: [-122.4194, 37.7749] },
  5, // 5km radius
  { sortByDistance: true, limit: 10 }
)
```

### GeoStore (Turf.js Operations)

```typescript
import { createGeoStore } from '@dotdo/pg-geo/geo-store'

const geo = createGeoStore()

// Distance calculation
const dist = geo.distance(
  { type: 'Point', coordinates: [-122.4194, 37.7749] },
  { type: 'Point', coordinates: [-118.2437, 34.0522] },
  'kilometers'
)

// Point-in-polygon test
const polygon = geo.polygon([[
  [-122.5, 37.7],
  [-122.3, 37.7],
  [-122.3, 37.8],
  [-122.5, 37.8],
  [-122.5, 37.7]
]])

const point = geo.point([-122.4194, 37.7749])
const isInside = geo.within(point, polygon)

// Buffer operation
const buffered = geo.buffer(point, 1, { steps: 32 }) // 1km buffer

// Union of polygons
const union = geo.union(polygon1, polygon2)

// Intersection
const intersection = geo.intersection(polygon1, polygon2)

// Coordinate transformations
const mercator = geo.toWebMercator(point.geometry)
const wgs84 = geo.toWGS84(mercator)
```

---

## Spatial Query Examples

### Point-in-Polygon

Check if a point lies within a polygon boundary:

```typescript
import { GeoStore } from '@dotdo/pg-geo'

const geo = new GeoStore()

// Define a city boundary
const sfBoundary = {
  type: 'Polygon' as const,
  coordinates: [[
    [-122.5, 37.7],
    [-122.3, 37.7],
    [-122.3, 37.85],
    [-122.5, 37.85],
    [-122.5, 37.7]
  ]]
}

// Check if a point is in San Francisco
const location = { type: 'Point' as const, coordinates: [-122.4194, 37.7749] }
const isInSF = geo.contains(sfBoundary, location) // true

// Alternative: check if point is within polygon
const isWithin = geo.within(location, sfBoundary) // true

// Check multiple points
const points = [
  { type: 'Point' as const, coordinates: [-122.4194, 37.7749] }, // SF
  { type: 'Point' as const, coordinates: [-118.2437, 34.0522] }, // LA
]

const inSF = points.filter(p => geo.contains(sfBoundary, p))
```

### Distance Calculations

Calculate distances using the Haversine formula (geodesic distance on a sphere):

```typescript
import { GeoStore } from '@dotdo/pg-geo'

const geo = new GeoStore()

const sf = { type: 'Point' as const, coordinates: [-122.4194, 37.7749] }
const la = { type: 'Point' as const, coordinates: [-118.2437, 34.0522] }
const nyc = { type: 'Point' as const, coordinates: [-74.006, 40.7128] }

// Distance in kilometers (default)
const sfToLA = geo.distance(sf, la) // ~559 km

// Distance in different units
const sfToLAMiles = geo.distance(sf, la, 'miles') // ~347 miles
const sfToLAMeters = geo.distance(sf, la, 'meters') // ~559,120 m

// Find bearing (direction) between points
const bearing = geo.bearing(sf, la) // ~135 degrees (southeast)

// Calculate destination point from origin + bearing + distance
const destination = geo.destination(sf, 100, 90, { units: 'kilometers' })
// Point 100km due east of SF

// Calculate midpoint
const midpoint = geo.midpoint(sf, la)
```

### Bounding Box Queries

Query geometries within a rectangular area:

```typescript
import { GeoStorage } from '@dotdo/pg-geo'

const storage = await GeoStorage.create()

// Seed some data
await storage.insertMany([
  { id: 'sf', geometry: { type: 'Point', coordinates: [-122.4, 37.8] } },
  { id: 'oakland', geometry: { type: 'Point', coordinates: [-122.2, 37.8] } },
  { id: 'la', geometry: { type: 'Point', coordinates: [-118.2, 34.1] } },
])

// BBox format: [minLng, minLat, maxLng, maxLat]
const bayAreaBBox = [-123, 37, -121, 38]

// Find all locations in the Bay Area
const bayAreaLocations = await storage.findInBBox(bayAreaBBox)
// Returns: sf, oakland

// With options
const limited = await storage.findInBBox(bayAreaBBox, {
  limit: 10,
  properties: { category: 'restaurant' }
})
```

### GeoJSON Support

Full support for GeoJSON types (Point, LineString, Polygon, MultiPolygon, etc.):

```typescript
import { GeoStorage, GeoStore } from '@dotdo/pg-geo'

const storage = await GeoStorage.create()
const geo = new GeoStore()

// Store different geometry types
await storage.insert('point', {
  type: 'Point',
  coordinates: [-122.4, 37.8]
})

await storage.insert('line', {
  type: 'LineString',
  coordinates: [[-122.5, 37.7], [-122.3, 37.9]]
})

await storage.insert('polygon', {
  type: 'Polygon',
  coordinates: [[[-122.5, 37.7], [-122.3, 37.7], [-122.3, 37.9], [-122.5, 37.9], [-122.5, 37.7]]]
})

// Store GeoJSON Features with properties
await storage.insertFeature('sf-feature', {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-122.4, 37.8] },
  properties: { name: 'San Francisco', population: 874961 }
})

// Calculate area of a polygon (in square meters)
const polygon = { type: 'Polygon', coordinates: [[...]] }
const areaSqM = geo.area(polygon)
const areaSqKm = areaSqM / 1_000_000

// Calculate length of a line (in kilometers)
const line = { type: 'LineString', coordinates: [[...]] }
const lengthKm = geo.length(line, 'kilometers')

// Calculate centroid
const centroid = geo.centroid(polygon) // Returns Feature<Point>

// Get bounding box
const bbox = geo.bbox(polygon) // [minLng, minLat, maxLng, maxLat]
```

### Spatial Relationships

Query based on spatial relationships:

```typescript
import { GeoStorage, GeoStore } from '@dotdo/pg-geo'

const storage = await GeoStorage.create()
const geo = new GeoStore()

// Find intersecting geometries
const searchPolygon = {
  type: 'Polygon',
  coordinates: [[[-122.5, 37.7], [-122.3, 37.7], [-122.3, 37.9], [-122.5, 37.9], [-122.5, 37.7]]]
}
const intersecting = await storage.findIntersecting(searchPolygon)

// Find geometries contained within a polygon
const contained = await storage.findContainedIn(searchPolygon)

// Check spatial predicates
const poly1 = geo.polygon([[[-122.5, 37.7], [-122.3, 37.7], [-122.3, 37.9], [-122.5, 37.9], [-122.5, 37.7]]])
const poly2 = geo.polygon([[[-122.4, 37.75], [-122.2, 37.75], [-122.2, 37.85], [-122.4, 37.85], [-122.4, 37.75]]])

geo.intersects(poly1, poly2) // true - they overlap
geo.disjoint(poly1, poly2) // false - they touch/overlap
geo.overlaps(poly1, poly2) // true - partial overlap
geo.equals(poly1, poly1) // true - same geometry
```

---

## Turf.js Function Reference

This package uses **selective imports** to minimize bundle size. Only the following Turf.js functions are included:

### Measurement Functions

| Function | Import | Description |
|----------|--------|-------------|
| `area` | `@turf/area` | Calculate polygon area in square meters |
| `distance` | `@turf/distance` | Calculate distance between two points (Haversine) |
| `length` | `@turf/length` | Calculate length of a line |
| `bearing` | `@turf/bearing` | Calculate bearing between two points |

### Spatial Predicates (Boolean Operations)

| Function | Import | Description |
|----------|--------|-------------|
| `booleanContains` | `@turf/boolean-contains` | Check if geometry A contains geometry B |
| `booleanWithin` | `@turf/boolean-within` | Check if geometry A is within geometry B |
| `booleanIntersects` | `@turf/boolean-intersects` | Check if two geometries intersect |
| `booleanDisjoint` | `@turf/boolean-disjoint` | Check if two geometries are disjoint |
| `booleanOverlap` | `@turf/boolean-overlap` | Check if two geometries overlap |
| `booleanEqual` | `@turf/boolean-equal` | Check if two geometries are equal |

### Geometry Construction

| Function | Import | Description |
|----------|--------|-------------|
| `point` | `@turf/helpers` | Create a point feature |
| `polygon` | `@turf/helpers` | Create a polygon feature |
| `feature` | `@turf/helpers` | Create a feature from geometry |
| `featureCollection` | `@turf/helpers` | Create a feature collection |
| `bbox` | `@turf/bbox` | Calculate bounding box of geometry |
| `bboxPolygon` | `@turf/bbox-polygon` | Create polygon from bounding box |
| `centroid` | `@turf/centroid` | Calculate geometric centroid |
| `centerOfMass` | `@turf/center-of-mass` | Calculate center of mass |
| `circle` | `@turf/circle` | Create circle polygon (approximated) |

### Spatial Analysis

| Function | Import | Description |
|----------|--------|-------------|
| `nearestPoint` | `@turf/nearest-point` | Find nearest point in collection |
| `destination` | `@turf/destination` | Calculate destination point from bearing/distance |
| `midpoint` | `@turf/midpoint` | Calculate midpoint between two points |

### Geometry Operations (Set Operations)

| Function | Import | Description | Bundle Impact |
|----------|--------|-------------|---------------|
| `buffer` | `@turf/buffer` | Create buffer around geometry | **Heavy** (~50KB, includes JSTS) |
| `union` | `@turf/union` | Union of two polygons | **Heavy** (~50KB, includes JSTS) |
| `intersect` | `@turf/intersect` | Intersection of two geometries | **Heavy** (~50KB, includes JSTS) |
| `difference` | `@turf/difference` | Difference between two geometries | **Heavy** (~50KB, includes JSTS) |
| `simplify` | `@turf/simplify` | Simplify geometry (Douglas-Peucker) | Lightweight |
| `convex` | `@turf/convex` | Compute convex hull | Lightweight |

### Validation

| Function | Import | Description |
|----------|--------|-------------|
| `kinks` | `@turf/kinks` | Find self-intersections in polygon |

---

## Map Visualization Examples

### Leaflet Integration

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    #map { height: 500px; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="module">
    // Initialize map
    const map = L.map('map').setView([37.8, -122.4], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // Fetch features from pg-geo API
    async function loadFeatures() {
      const response = await fetch('/api/features')
      const { data } = await response.json()

      data.forEach(location => {
        if (location.geometry.type === 'Point') {
          const [lng, lat] = location.geometry.coordinates
          L.marker([lat, lng])
            .bindPopup(`<b>${location.properties?.name || location.id}</b>`)
            .addTo(map)
        } else if (location.geometry.type === 'Polygon') {
          // Leaflet expects [lat, lng], GeoJSON is [lng, lat]
          const coords = location.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
          L.polygon(coords, { color: 'blue' }).addTo(map)
        }
      })
    }

    // Draw search radius circle
    function showSearchRadius(lat, lng, radiusKm) {
      L.circle([lat, lng], {
        radius: radiusKm * 1000, // Leaflet uses meters
        color: 'red',
        fillOpacity: 0.1
      }).addTo(map)
    }

    // Query nearby on map click
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      const radiusKm = 10

      showSearchRadius(lat, lng, radiusKm)

      const response = await fetch('/api/query/within', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center: { type: 'Point', coordinates: [lng, lat] },
          radiusKm
        })
      })

      const { data } = await response.json()
      console.log('Nearby locations:', data)
    })

    loadFeatures()
  </script>
</body>
</html>
```

### Mapbox GL JS Integration

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css" rel="stylesheet">
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js"></script>
  <style>
    #map { height: 500px; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="module">
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4, 37.8],
      zoom: 10
    })

    map.on('load', async () => {
      // Fetch features from pg-geo API
      const response = await fetch('/api/features')
      const { data } = await response.json()

      // Convert to GeoJSON FeatureCollection
      const geojson = {
        type: 'FeatureCollection',
        features: data.map(loc => ({
          type: 'Feature',
          geometry: loc.geometry,
          properties: { ...loc.properties, id: loc.id }
        }))
      }

      // Add as source
      map.addSource('locations', {
        type: 'geojson',
        data: geojson
      })

      // Add circle layer for points
      map.addLayer({
        id: 'locations-layer',
        type: 'circle',
        source: 'locations',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 8,
          'circle-color': '#2563eb',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      })

      // Add fill layer for polygons
      map.addLayer({
        id: 'locations-fill',
        type: 'fill',
        source: 'locations',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': '#2563eb',
          'fill-opacity': 0.3
        }
      })

      // Click handler for popups
      map.on('click', 'locations-layer', (e) => {
        const props = e.features[0].properties
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<h3>${props.name || props.id}</h3>`)
          .addTo(map)
      })

      // Change cursor on hover
      map.on('mouseenter', 'locations-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'locations-layer', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    // Draw bounding box for queries
    function drawBBox(bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox

      map.addSource('query-bbox', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [minLng, minLat],
              [maxLng, minLat],
              [maxLng, maxLat],
              [minLng, maxLat],
              [minLng, minLat]
            ]]
          }
        }
      })

      map.addLayer({
        id: 'query-bbox-layer',
        type: 'line',
        source: 'query-bbox',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      })
    }
  </script>
</body>
</html>
```

### React + react-leaflet Example

```tsx
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

interface Location {
  id: string
  geometry: { type: string; coordinates: number[] }
  properties: Record<string, unknown>
  distance?: number
}

function LocationMarkers({ locations }: { locations: Location[] }) {
  return (
    <>
      {locations.map(loc => {
        if (loc.geometry.type === 'Point') {
          const [lng, lat] = loc.geometry.coordinates
          return (
            <Marker key={loc.id} position={[lat, lng]}>
              <Popup>
                <strong>{loc.properties?.name as string || loc.id}</strong>
                {loc.distance && <p>Distance: {loc.distance.toFixed(2)} km</p>}
              </Popup>
            </Marker>
          )
        }
        return null
      })}
    </>
  )
}

function QueryHandler({ onQuery }: { onQuery: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onQuery(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

export default function GeoMap() {
  const [locations, setLocations] = useState<Location[]>([])
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null)
  const [searchRadius, setSearchRadius] = useState(10)

  useEffect(() => {
    fetch('/api/features')
      .then(res => res.json())
      .then(({ data }) => setLocations(data))
  }, [])

  const handleQuery = async (lat: number, lng: number) => {
    setSearchCenter([lat, lng])

    const response = await fetch('/api/query/within', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center: { type: 'Point', coordinates: [lng, lat] },
        radiusKm: searchRadius
      })
    })

    const { data } = await response.json()
    setLocations(data)
  }

  return (
    <MapContainer center={[37.8, -122.4]} zoom={10} style={{ height: '500px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <LocationMarkers locations={locations} />
      <QueryHandler onQuery={handleQuery} />
      {searchCenter && (
        <Circle
          center={searchCenter}
          radius={searchRadius * 1000}
          pathOptions={{ color: 'red', fillOpacity: 0.1 }}
        />
      )}
    </MapContainer>
  )
}
```

---

## PostGIS Compatibility Notes

`@dotdo/pg-geo` provides PostGIS-like functionality without requiring a full PostgreSQL + PostGIS installation. Here's how it compares:

### Equivalent Functions

| PostGIS Function | pg-geo Method | Notes |
|-----------------|---------------|-------|
| `ST_Distance(geog, geog)` | `geo.distance(point, point)` | Uses Haversine formula |
| `ST_Contains(geom, geom)` | `geo.contains(polygon, point)` | Turf.js boolean-contains |
| `ST_Within(geom, geom)` | `geo.within(point, polygon)` | Turf.js boolean-within |
| `ST_Intersects(geom, geom)` | `geo.intersects(geom, geom)` | Turf.js boolean-intersects |
| `ST_Buffer(geom, dist)` | `geo.buffer(geom, km)` | Distance in kilometers |
| `ST_Union(geom, geom)` | `geo.union(poly, poly)` | Turf.js union |
| `ST_Intersection(geom, geom)` | `geo.intersection(geom, geom)` | Turf.js intersect |
| `ST_Difference(geom, geom)` | `geo.difference(geom, geom)` | Turf.js difference |
| `ST_Area(geom)` | `geo.area(polygon)` | Returns square meters |
| `ST_Length(geom)` | `geo.length(line)` | Returns kilometers |
| `ST_Centroid(geom)` | `geo.centroid(geom)` | Returns Feature<Point> |
| `ST_Envelope(geom)` / `ST_Extent` | `geo.bbox(geom)` | Returns [minX, minY, maxX, maxY] |
| `ST_Transform(geom, srid)` | `geo.transform(geom, from, to)` | Uses proj4 |
| `ST_MakePoint(x, y)` | `geo.point([x, y])` | Creates Feature<Point> |
| `ST_MakeValid(geom)` | `geo.makeValid(geom)` | Fixes invalid geometries |
| `ST_IsValid(geom)` | `geo.isValid(geom)` | Checks for self-intersections |
| `ST_Simplify(geom, tol)` | `geo.simplify(geom, tol)` | Douglas-Peucker algorithm |
| `ST_ConvexHull(geom)` | `geo.convexHull(geom)` | Computes convex hull |

### Key Differences

1. **Storage Format**: PostGIS uses WKB (Well-Known Binary) in PostgreSQL columns. pg-geo stores GeoJSON as JSONB.

2. **Coordinate Systems**: PostGIS handles SRID transformations automatically. pg-geo defaults to WGS84 (EPSG:4326) and requires explicit transformation via `geo.transform()`.

3. **Spatial Indexing**: PostGIS uses GiST/SP-GiST indexes. pg-geo uses an in-memory R-tree (rbush).

4. **Precision**: PostGIS uses GEOS (C++ library) for precise geometric operations. pg-geo uses Turf.js (JSTS for complex ops), which is JavaScript-based.

5. **Geography vs Geometry**: PostGIS distinguishes between `geometry` (planar) and `geography` (spherical). pg-geo always uses spherical calculations for distance.

### Migration Example

```sql
-- PostGIS query
SELECT name, ST_Distance(
  location::geography,
  ST_MakePoint(-122.4, 37.8)::geography
) / 1000 as distance_km
FROM stores
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(-122.4, 37.8)::geography,
  10000  -- 10km in meters
)
ORDER BY distance_km;
```

```typescript
// pg-geo equivalent
const results = await storage.findWithin(
  { type: 'Point', coordinates: [-122.4, 37.8] },
  10, // 10km
  { sortByDistance: { type: 'Point', coordinates: [-122.4, 37.8] } }
)

results.forEach(r => console.log(r.properties.name, r.distance))
```

---

## Performance Tips

### Use Spatial Indexing

The R-tree index provides O(log n) query performance for bounding box queries:

```typescript
// Always enable spatial indexing for production use
const storage = await GeoStorage.create({
  enableSpatialIndex: true  // Default: true
})
```

### Batch Operations

Use batch operations to reduce overhead:

```typescript
// Efficient: single transaction
await storage.insertMany([
  { id: 'loc1', geometry: point1 },
  { id: 'loc2', geometry: point2 },
  { id: 'loc3', geometry: point3 },
])

// Or use GeoDO batch for complex operations
const results = await geo.batch([
  { op: 'insert', id: 'loc1', geometry: point1 },
  { op: 'insert', id: 'loc2', geometry: point2 },
  { op: 'findWithin', center: point1, radiusKm: 10 }
])
```

### Limit Result Sets

Always use limits for large datasets:

```typescript
const nearby = await storage.findWithin(center, 100, {
  limit: 50,  // Return max 50 results
  sortByDistance: center  // Get closest first
})
```

### Simplify Complex Geometries

Reduce precision for faster operations:

```typescript
// Simplify before storage
const simplified = geo.simplify(complexPolygon, 0.001) // 0.001 degrees tolerance
await storage.insert('region', simplified)
```

### Avoid Heavy Operations in Hot Paths

Buffer, union, intersection, and difference operations pull in JSTS (~50KB) and are computationally expensive:

```typescript
// Cache computed buffers instead of recalculating
const cachedBuffer = geo.buffer(point, 5)
// Reuse cachedBuffer for multiple queries
```

---

## Bundle Size Considerations

### Current Bundle Size

| Component | Size (gzipped) | Notes |
|-----------|----------------|-------|
| Core Turf functions | ~30KB | Distance, centroid, bbox, predicates |
| JSTS (topology ops) | ~50KB | Buffer, union, intersect, difference |
| R-tree (rbush) | ~5KB | Spatial indexing |
| PGlite client | ~10KB | Database operations |
| proj4 | ~25KB | Coordinate transformations |
| **Total** | **~120KB** | Full bundle with all features |

### Heavy Dependencies

These Turf.js functions pull in JSTS (~50KB gzipped):

- `@turf/buffer` - Creates buffers around geometries
- `@turf/union` - Union of polygons
- `@turf/intersect` - Intersection of geometries
- `@turf/difference` - Difference between geometries

### Lightweight Alternative

If you only need simple operations, import selectively:

```typescript
// Import only what you need
import { SpatialIndex } from '@dotdo/pg-geo/rtree'
import distance from '@turf/distance'
import booleanContains from '@turf/boolean-contains'

// ~10KB total vs ~120KB for full package
```

---

## Coordinate Reference Systems

The package includes proj4 for coordinate transformations:

```typescript
import { createGeoStore } from '@dotdo/pg-geo/geo-store'

const geo = createGeoStore()

// WGS84 (EPSG:4326) to Web Mercator (EPSG:3857)
const mercator = geo.toWebMercator(geometry)

// Web Mercator to WGS84
const wgs84 = geo.toWGS84(mercator)

// Custom transformations
const transform = geo.createTransform('EPSG:4326', 'EPSG:3857')
const transformed = transform([longitude, latitude])
```

---

## API Reference

### GeoStorage

```typescript
class GeoStorage {
  constructor(db: PGlite, options?: GeoStorageOptions)
  static create(options?: GeoStorageOptions): Promise<GeoStorage>

  // CRUD operations
  insert(id: string, geometry: Geometry, properties?: GeoJsonProperties): Promise<Location>
  insertFeature(id: string, feature: Feature): Promise<Location>
  insertMany(locations: Array<{ id: string; geometry: Geometry; properties?: GeoJsonProperties }>): Promise<void>
  get(id: string): Promise<Location | null>
  updateProperties(id: string, properties: GeoJsonProperties): Promise<Location | null>
  updateGeometry(id: string, geometry: Geometry): Promise<Location | null>
  delete(id: string): Promise<boolean>
  getAll(options?: SpatialQueryOptions): Promise<Location[]>

  // Spatial queries
  findWithin(center: Point | Feature<Point>, radiusKm: number, options?: SpatialQueryOptions): Promise<LocationWithDistance[]>
  findInBBox(bbox: BBox, options?: SpatialQueryOptions): Promise<Location[]>
  findIntersecting(geometry: Geometry | Feature, options?: SpatialQueryOptions): Promise<Location[]>
  findContainedIn(polygon: Geometry | Feature, options?: SpatialQueryOptions): Promise<Location[]>
  findNearest(center: Point | Feature<Point>, k?: number, maxDistanceKm?: number): Promise<LocationWithDistance[]>

  // Utilities
  count(): Promise<number>
  clear(): Promise<void>
  rebuildSpatialIndex(): Promise<void>
  close(): Promise<void>
}
```

### GeoStore

```typescript
class GeoStore {
  constructor(options?: GeoOperationsOptions)

  // Distance & Measurement
  distance(from: Point | Feature<Point>, to: Point | Feature<Point>, units?: DistanceUnits): number
  area(polygon: Polygon | MultiPolygon | Feature): number
  length(line: LineString | Feature<LineString>, units?: DistanceUnits): number

  // Spatial Predicates
  contains(polygon: Polygon | MultiPolygon | Feature, point: Point | Feature<Point>): boolean
  within(point: Point | Feature<Point>, polygon: Polygon | MultiPolygon | Feature): boolean
  intersects(geom1: Geometry | Feature, geom2: Geometry | Feature): boolean
  disjoint(geom1: Geometry | Feature, geom2: Geometry | Feature): boolean
  overlaps(geom1: Polygon | MultiPolygon | Feature, geom2: Polygon | MultiPolygon | Feature): boolean
  equals(geom1: Geometry | Feature, geom2: Geometry | Feature): boolean

  // Geometry Construction
  point(coordinates: Position, properties?: Record<string, unknown>): Feature<Point>
  polygon(coordinates: Position[][], properties?: Record<string, unknown>): Feature<Polygon>
  circle(center: Point | Feature<Point>, radius: number, options?: CircleOptions): Feature<Polygon>
  centroid(geometry: Geometry | Feature): Feature<Point>
  centerOfMass(geometry: Geometry | Feature): Feature<Point>
  bbox(geometry: Geometry | Feature): BBox
  bboxPolygon(bbox: BBox): Feature<Polygon>

  // Spatial Analysis
  nearestPoint(targetPoint: Point | Feature<Point>, points: Feature<Point>[]): Feature<Point>
  bearing(from: Point | Feature<Point>, to: Point | Feature<Point>): number
  destination(origin: Point | Feature<Point>, distance: number, bearing: number, options?: DestinationOptions): Feature<Point>
  midpoint(from: Point | Feature<Point>, to: Point | Feature<Point>): Feature<Point>

  // Geometry Operations
  buffer(geometry: Geometry | Feature, distance: number, options?: BufferOptions): Polygon | MultiPolygon
  union(a: Polygon | MultiPolygon | Feature, b: Polygon | MultiPolygon | Feature): Polygon | MultiPolygon
  intersection(a: Geometry | Feature, b: Geometry | Feature): Geometry | null
  difference(a: Geometry | Feature, b: Geometry | Feature): Geometry | null
  symmetricDifference(a: Geometry | Feature, b: Geometry | Feature): Geometry | null
  simplify(geometry: Geometry | Feature, tolerance: number, preserveTopology?: boolean): Geometry
  convexHull(geometry: Geometry | Feature): Polygon

  // Validation
  isValid(geometry: Geometry | Feature): boolean
  makeValid(geometry: Geometry | Feature): Geometry

  // Coordinate Transformation
  transform(geometry: Geometry, fromCRS: CRS, toCRS: CRS): Geometry
  toWebMercator(geometry: Geometry): Geometry
  toWGS84(geometry: Geometry): Geometry
}
```

### SpatialIndex (R-tree)

```typescript
class SpatialIndex {
  constructor(maxEntries?: number)

  insert(id: string, bbox: BBox): void
  insertMany(items: Array<{ id: string; bbox: BBox }>): void
  remove(id: string): boolean
  search(bbox: BBox): string[]
  searchItems(bbox: BBox): BBoxItem[]
  knn(x: number, y: number, k: number, maxDistance?: number): Array<{ id: string; distance: number }>
  has(id: string): boolean
  get(id: string): BBox | null
  all(): string[]
  clear(): void
  toBBox(): BBox | null
  toJSON(): Array<{ id: string; bbox: BBox }>
  fromJSON(data: Array<{ id: string; bbox: BBox }>): void

  readonly size: number
}
```

---

## Cloudflare Workers Integration

### Durable Object with RPC

```typescript
import { GeoDO } from '@dotdo/pg-geo/geo-do'

// In your worker
export class MyGeoDO extends GeoDO {
  constructor(state: DurableObjectState, env: Env) {
    super(state, {
      tableName: 'my_locations',
      enableSpatialIndex: true
    })
  }
}

// Client usage with Cap'n Web RPC
import { createClient } from 'capnweb'

const stub = env.MY_GEO_DO.get(id)
const client = createClient(stub)

const nearby = await client.findWithin(
  { type: 'Point', coordinates: [-122.4194, 37.7749] },
  5
)
```

### wrangler.toml Configuration

```toml
[[durable_objects.bindings]]
name = "GEO_DO"
class_name = "GeoDO"

[[migrations]]
tag = "v1"
new_classes = ["GeoDO"]
```

---

## Troubleshooting

### "Module not found" Errors

Ensure you're using the correct import path:

```typescript
// Full package
import { GeoStorage, GeoStore, GeoDO } from '@dotdo/pg-geo'

// Subpath imports
import { GeoStorage } from '@dotdo/pg-geo/storage'
import { GeoStore } from '@dotdo/pg-geo/geo-store'
import { SpatialIndex } from '@dotdo/pg-geo/rtree'
import { GeoDO } from '@dotdo/pg-geo/geo-do'
```

### PGlite Initialization Fails

If PGlite fails to initialize in Cloudflare Workers:

1. Ensure WASM files are bundled correctly in `wrangler.toml`:

```toml
[[rules]]
type = "CompiledWasm"
globs = ["**/*.wasm"]

[[rules]]
type = "Data"
globs = ["**/*.data"]
```

2. Use static imports for WASM assets:

```typescript
import pgliteWasm from './pglite.wasm'
import pgliteData from './pglite.data'

const pg = await PGlite.create({
  wasmModule: pgliteWasm,
  fsBundle: new Blob([pgliteData])
})
```

### Memory Issues in Workers

Cloudflare Workers have a 128MB memory limit. If you encounter OOM errors:

1. Limit query result sets
2. Avoid loading large geometries in memory
3. Use pagination for large datasets
4. Consider using simplified geometries

### Invalid Geometry Errors

If spatial predicates throw errors:

```typescript
// Check if geometry is valid
if (!geo.isValid(geometry)) {
  geometry = geo.makeValid(geometry)
}

// Ensure polygon rings are closed
const coords = polygon.coordinates[0]
if (coords[0] !== coords[coords.length - 1]) {
  coords.push(coords[0])
}
```

### Coordinate Order Issues

GeoJSON uses `[longitude, latitude]` order, but some libraries (like Leaflet) use `[latitude, longitude]`:

```typescript
// GeoJSON (pg-geo)
const point = { type: 'Point', coordinates: [-122.4, 37.8] } // [lng, lat]

// Leaflet
L.marker([37.8, -122.4]) // [lat, lng]

// Convert
const [lng, lat] = point.coordinates
L.marker([lat, lng])
```

---

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## License

MIT
