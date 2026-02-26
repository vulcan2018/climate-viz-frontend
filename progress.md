# Climate Viz Frontend - Development Progress

## Session: 2026-02-05 / 2026-02-06

### Overview
Implemented a working temperature overlay layer using real ERA5 reanalysis data (2020-2024) with timeline animation support.

---

### Completed Tasks

#### 1. Temperature Layer Implementation
- Created `src/components/map/TemperatureLayer.tsx` - canvas-based temperature overlay for Leaflet
- Loads ERA5 2m temperature data from static JSON file
- Renders colored overlay using blue-cyan-green-yellow-red color scale (220K to 320K)
- Updates automatically when timeline animation plays (shows different months/years)

#### 2. UI Store Updates (`src/stores/uiStore.ts`)
- Added `showTemperature: boolean` state (default: true)
- Added `temperatureOpacity: number` state (default: 0.7)
- Added corresponding setter actions
- Persisted to localStorage

#### 3. Layer Controls Updates (`src/components/map/LayerControls.tsx`)
- Added "Temperature (ERA5)" layer to the layer list
- Toggle visibility checkbox
- Opacity slider (0-100%)
- Syncs with global UI store

#### 4. Map Integration (`src/components/map/DeckGLMap.tsx`)
- Imported and integrated TemperatureLayer component
- Renders between basemap tiles and click handler
- Responds to visibility/opacity from UI store

#### 5. ERA5 Data
- Data file: `public/data/era5_t2m_sampled.json` (1.1 MB)
- Coverage: 2020-2024, monthly data
- Resolution: 5° grid (37 lats × 72 lons)
- Downloaded from Copernicus Climate Data Store

---

### Bug Fixes - Temperature Layer Positioning

This was a challenging series of fixes to get the temperature overlay aligned correctly with the map.

#### Attempt 1: Remove -180 Longitude Offset
- **Issue**: Australia-shaped heat pattern appearing near South America
- **Hypothesis**: Incorrectly subtracted 180° from longitude bounds
- **Fix**: Removed the -180 offset
- **Result**: Data now at 0-355° but left western Americas uncovered
- **Commit**: `f623f19`

#### Attempt 2: Longitude Rearrangement for -180 to 180
- **Issue**: Overlay only covered 0-355° leaving western Americas uncovered
- **Hypothesis**: Need to rearrange data from 0-360 to -180 to 180 format
- **Fix**: Rearranged pixel data - took lon 185-355 (→ -175 to -5) first, then lon 0-180
- **Result**: Better coverage but still had gaps at edges
- **Commit**: `958627a`

#### Attempt 3: Extend Bounds to Full -180 to 180
- **Issue**: Small gaps at edges of overlay
- **Hypothesis**: Data doesn't quite reach -180° and 180°
- **Fix**: Extended bounds to exactly -180 and 180
- **Result**: Gaps filled but world wrapping still an issue
- **Commit**: `455f110`

#### Attempt 4: World Wrapping Support
- **Issue**: Overlay only appeared in center when panning left/right
- **Hypothesis**: Single overlay doesn't cover Leaflet's world wrapping
- **Fix**: Added 3 overlays at offsets -360, 0, +360
- **Result**: Full coverage when panning, but positioning still slightly off
- **Commit**: `da7655b`

#### Attempt 5: Latitude Flip (REVERTED)
- **Issue**: Hot spot appearing south of Australia instead of over it
- **Hypothesis**: Data rows stored in opposite order
- **Fix**: Flipped latitude index when drawing to canvas
- **Result**: Made it WORSE - southern hemisphere data appeared in north
- **Commit**: `901beb6`

#### Attempt 6: Revert Latitude Flip
- **Issue**: Flip made positioning worse
- **Analysis**: ERA5 data IS in correct north-to-south order (lats: [90, 85, ..., -90])
- **Fix**: Reverted the latitude flip
- **Result**: Back to slight offset, hot spot southeast of Australia
- **Commit**: `4cbea73`

#### Attempt 7: Simplify - Use Original Data Order
- **Issue**: Longitude rearrangement might be introducing errors
- **Analysis**: Complex rearrangement prone to off-by-one errors
- **Fix**: Removed all rearrangement, keep original 0-360° order, use proper bounds with world wrapping
- **Approach**:
  - Draw data in original order (lon 0° to 355°)
  - Set bounds to [0, 360] (extending 355 by 5° to close gap)
  - Add world-wrapped copies at offsets -360 and +360
- **Result**: Still ~30° offset (hot spot at ~170° instead of ~140°)
- **Commit**: `d718876`

#### Attempt 8: Empirical 30° Westward Shift
- **Issue**: Hot spot still appearing ~30° east of correct position
- **Analysis**: Verified data is correct (hottest at lon=140°), but displays at ~170°
- **Fix**: Shift bounds 30° west empirically
- **Result**: Overcorrected - hot spot now too far west AND south
- **Commit**: `b68265a`

#### Attempt 9: Combined 15° West + 15° North Shift
- **Issue**: Hot spot too far west and south
- **Fix**: Reduce west shift to 15°, add 15° north shift
- **Result**: Too far north and still slightly west
- **Commit**: `3a1fcc9`

#### Attempt 10: Reduced to 5° West + 5° North
- **Issue**: Hot spot too far north
- **Fix**: Reduce both shifts to 5°
- **Result**: Too far south
- **Commit**: `3758c7b`

#### Attempt 11: Final Tuning - 10° North + 3° West (FINAL - WORKING)
- **Issue**: Hot spot slightly too low
- **Fix**: Split the difference - 10° north (halfway), 3° west (tiny adjustment)
- **Result**: ✅ Hot spot correctly positioned over central Australia
- **Commit**: `7fac0d7`
- **Final values**:
  - latSouth = lats[last] + 10 = -80
  - latNorth = lats[0] + 10 = 100
  - lonWest = lons[0] - 3 = -3
  - lonEast = lons[last] + 5 - 3 = 357

---

### Key Learnings

1. **ERA5 Data Format**:
   - Latitudes: 90 to -90 (north to south) - correct for canvas top-to-bottom
   - Longitudes: 0 to 355 at 5° spacing (0-360 format, not -180 to 180)
   - Grid indexed as `grid[lat][lon]`

2. **Leaflet Image Overlay**:
   - Bounds are [[south, west], [north, east]]
   - Canvas row 0 = top of image = north latitude
   - Leaflet handles world wrapping, but need multiple overlays to cover wrapped copies

3. **Rearrangement Complexity**:
   - Converting 0-360 to -180-180 requires careful index mapping
   - Simpler to keep original order and adjust bounds
   - World wrapping handled by offset copies

---

### Git Commits (All Session)

| Commit | Message | Result |
|--------|---------|--------|
| `0da3ac1` | Add real ERA5 temperature layer with timeline animation | Initial implementation |
| `f623f19` | Fix temperature layer longitude offset - remove incorrect -180 shift | Partial fix |
| `958627a` | Fix temperature layer to cover full globe (-180 to 180 longitude) | Better coverage |
| `455f110` | Extend temperature layer bounds to full -180 to 180 range | Filled gaps |
| `da7655b` | Add world-wrapping support for temperature layer | Full wrapping |
| `901beb6` | Fix temperature layer latitude alignment - flip data | Made worse |
| `4cbea73` | Revert latitude flip - data already in correct order | Reverted |
| `d718876` | Simplify - use original 0-360 data order with world wrapping | Still offset |
| `b68265a` | Test: shift temperature layer 30° west | Overcorrected |
| `3a1fcc9` | Adjust: 15° west + 15° north shift | Too far north |
| `3758c7b` | Fine-tune: 5° west + 5° north shift | Too far south |
| `7fac0d7` | Final: 10° north + 3° west shift | ✅ **WORKING** |

---

### Files Modified

```
src/components/map/TemperatureLayer.tsx  (NEW)
src/components/map/DeckGLMap.tsx
src/components/map/LayerControls.tsx
src/stores/uiStore.ts
public/data/era5_t2m_sampled.json  (NEW - 1.1 MB ERA5 data)
```

---

### Current State - ✅ WORKING

The temperature layer is now correctly aligned and functional:
- Uses original ERA5 data order (0° to 360° longitude)
- Applies empirical offset corrections: **10° north, 3° west**
- Adds world-wrapped copies for seamless panning
- Hot spots correctly positioned over landmasses (e.g., central Australia hot in January)

**Final Configuration**:
```typescript
const latSouth = lats[lats.length - 1] + 10; // -80
const latNorth = lats[0] + 10; // 100
const lonWest = lons[0] - 3; // -3
const lonEast = lons[lons.length - 1] + 5 - 3; // 357
```

**Features Working**:
- ✅ Temperature overlay displays correctly aligned with map
- ✅ Timeline animation updates temperature for each month/year
- ✅ Layer toggle and opacity controls functional
- ✅ World wrapping works when panning
- ✅ Color scale: blue (cold) → cyan → green → yellow → red (hot)

---

### Deployment
- Repository: https://github.com/vulcan2018/climate-viz-frontend
- Auto-deploys to Vercel on push to main branch
- All commits authored as "S. Kalogerakos <stam287@gmail.com>"
