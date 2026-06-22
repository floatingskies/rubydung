# RubyDung

3D isometric base-builder inspired by Notch's old abandoned RubyDung prototype (the thing that became Minecraft), with hero units like Dwarf Fortress and template buildings like 0 AD.

Plain HTML/CSS/JS with Three.js. No build step, no framework, no npm install. Just open the file.

## what's in it

- 3D isometric camera you can rotate, pan, zoom
- procedurally generated terrain with domain-warped mountains, winding rivers, beaches, deserts, snow caps
- 15 block types: grass, dirt, stone, wood, leaves, planks, cobble, ruby, sand, water, snow, glass, brick, gold, moss. all textures drawn on canvas at runtime
- 5 tools: build, mine, raise, lower, flatten
- brush size 1 to 5 for batch ops
- 22 building templates: house, tower, wall, tree, farm, pylon, bridge, barracks, warehouse, sawmill, mine shaft, lighthouse, fountain, castle, gatehouse, market, well, temple, watchtower, windmill, chapel, inn
- hero units you can spawn, select, move. they auto gather wood/stone/food/gold when idle
- 4 resources: wood, stone, food, gold
- day/night cycle with 4 phases (day, golden hour, twilight, night with moonlight)
- optional auto day/night cycle toggle (full day cycle in ~3 minutes)
- animated water (texture offset shimmer)
- procedural music: 5 tracks that pick based on time of day (exploration, building, adventure, night, tension)
- procedural sound effects for everything (place, mine, raise, lower, hero select, etc)
- music and sfx toggle buttons in the top bar
- save/load to localStorage
- world regen with custom seed, size (64/96/128), and foliage density

## controls

- left click: place block or template
- right click: remove block (or move selected hero)
- Q / E or right-drag: rotate camera
- W A S D or middle-drag: pan
- mouse wheel: zoom
- 1 to 0, -, =, g, m: pick block type
- B X R L F: switch tools (build, mine, raise, lower, flatten)
- H: help
- Ctrl+S / Ctrl+L: save / load

## run it

open index.html in a browser. that's it.

if textures look weird when opening via file://, run a quick local server:
```
python3 -m http.server
```
then go to http://localhost:8000

## put it on github pages

1. make a new repo on github (call it whatever, like rubydung)
2. drop all the files from this folder into the repo root
3. push to github
4. repo settings -> pages
5. source: deploy from a branch
6. branch: main, folder: / (root)
7. save. wait a minute.
8. live at https://YOURNAME.github.io/REPONAME/

the .nojekyll file is important, it tells github to skip jekyll processing and serve everything as-is.

## file layout

```
index.html
css/style.css
js/sprites.js     procedural pixel-art textures and icons
js/audio.js       procedural music and sfx
js/blocks.js      block defs + building templates
js/noise.js       value noise + fbm
js/world.js       terrain gen, meshing, block ops
js/heroes.js      hero + hero manager
js/ui.js          ui wiring
js/game.js        main game loop, scene, camera
textures/         uploaded source textures (game uses procedural ones at runtime)
.nojekyll
LICENSE
README.md
```

## tech

- Three.js r160 from CDN
- custom value noise + fbm for terrain
- instanced meshes per block type so it doesn't choke
- plain DOM for UI, no framework
- Web Audio API for all sound, everything synthesized

## license

MIT, see LICENSE. RubyDung was Notch's 2009 prototype. This is a fan tribute, not affiliated with or endorsed by Notch or Mojang.

## credits

- original RubyDung concept: Markus "Notch" Persson, 2009
- Dwarf Fortress: Tarn and Zach Adams
- 0 AD: Wildfire Games
- Three.js: Mr.doob and contributors
- fonts: VT323 and Press Start 2P from Google Fonts
