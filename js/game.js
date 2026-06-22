// main game. scene, camera, controls, loop, save/load.
function Game(){
  this.canvas=document.getElementById('game-canvas');
  this.gameState={wood:80, stone:60, food:50, gold:20, pop:0, popMax:8};
  this.brushSize=1;
  this.mode='build';
  this.rallyPlacement=false;
  this.cameraAngle=Math.PI/4;
  this.cameraPitch=Math.PI/4;
  this.cameraDist=60;
  this.cameraTarget=new THREE.Vector3(48,0,48);
  this.keysHeld={};
  this.timeOfDay=10;
  this.autoTime=false;

  // textures need THREE + Sprites loaded. blocks init here.
  initBlocks();
  this._initThree();
  this._initWorld(96, 42, 0.4);
  this._initHeroes();
  this.ui=new UI(this);
  this._initInput();
  this._applyTimeOfDay();

  // start music
  Audio.init();
  Audio.startMusic();
  this.ui._updateNowPlaying();

  // spawn 3 starter heroes
  for(var i=0;i<3;i++){
    var x=48+(i-1)*2, z=48;
    this.heroes.spawn(x, z);
  }
  this.gameState.pop=this.heroes.heroes.length;
  this.ui.refreshHeroList();

  this.lastTime=performance.now();
  this.frameCount=0;
  this.fpsTime=0;
  this.fps=0;
  var self=this;
  this._tick=function(){self._tickInner();};
  requestAnimationFrame(this._tick);
}

Game.prototype._initThree=function(){
  this.renderer=new THREE.WebGLRenderer({canvas:this.canvas, antialias:true, alpha:false});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.scene=new THREE.Scene();
  this.scene.background=new THREE.Color(0x88aacc);
  this.scene.fog=new THREE.Fog(0x88aacc, 80, 160);
  var aspect=window.innerWidth/window.innerHeight;
  this.camera=new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
  this._updateCamera();
  this.ambient=new THREE.AmbientLight(0xffffff, 0.55);
  this.scene.add(this.ambient);
  this.sun=new THREE.DirectionalLight(0xffffff, 0.8);
  this.sun.position.set(30, 50, 20);
  this.scene.add(this.sun);
  this.hemi=new THREE.HemisphereLight(0x88bbff, 0x554433, 0.4);
  this.scene.add(this.hemi);
  var self=this;
  window.addEventListener('resize', function(){self._onResize();});
};

Game.prototype._initWorld=function(size, seed, fol){
  if(this.world){
    for(var k in this.world.meshes)this.scene.remove(this.world.meshes[k]);
  }
  this.world=new World(this.scene, size, seed);
  this.world.generate(fol);
  this._centerCameraOn(size);
};

Game.prototype._centerCameraOn=function(size){
  this.cameraTarget.set(size/2, 0, size/2);
  this.cameraDist=size*0.85;
  this._updateCamera();
};

Game.prototype._initHeroes=function(){
  this.heroes=new HeroManager(this.scene, this.world, this.gameState);
};

Game.prototype._initInput=function(){
  this.pointer={x:0,y:0,down:false,button:-1,dragStartX:0,dragStartY:0,dragging:false};
  var c=this.canvas;
  var self=this;
  c.addEventListener('pointerdown', function(e){self._onPointerDown(e);});
  c.addEventListener('pointermove', function(e){self._onPointerMove(e);});
  c.addEventListener('pointerup', function(e){self._onPointerUp(e);});
  c.addEventListener('pointerleave', function(e){self._onPointerUp(e);});
  c.addEventListener('contextmenu', function(e){e.preventDefault();});
  c.addEventListener('wheel', function(e){self._onWheel(e);}, {passive:false});
  this.previewMesh=this._makePreviewMesh();
  this.scene.add(this.previewMesh);
  this.previewMesh.visible=false;
};

Game.prototype._makePreviewMesh=function(){
  var g=new THREE.Group();
  var geo=new THREE.BoxGeometry(1.02, 1.02, 1.02);
  var mat=new THREE.MeshBasicMaterial({color:0xd33b3b, transparent:true, opacity:0.45, depthWrite:false});
  var m=new THREE.Mesh(geo, mat);
  g.add(m);
  var edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color:0xff5555}));
  g.add(edges);
  return g;
};

Game.prototype._onResize=function(){
  var w=window.innerWidth, h=window.innerHeight;
  this.renderer.setSize(w, h);
  this.camera.aspect=w/h;
  this.camera.updateProjectionMatrix();
};

Game.prototype._updateCamera=function(){
  var r=this.cameraDist;
  var cy=Math.sin(this.cameraPitch)*r;
  var cxz=Math.cos(this.cameraPitch)*r;
  var cx=this.cameraTarget.x+Math.cos(this.cameraAngle)*cxz;
  var cz=this.cameraTarget.z+Math.sin(this.cameraAngle)*cxz;
  this.camera.position.set(cx, cy+this.cameraTarget.y, cz);
  this.camera.lookAt(this.cameraTarget);
};

Game.prototype.rotateCamera=function(dir){
  this.cameraAngle+=dir*Math.PI/12;
  this._updateCamera();
};
Game.prototype.panCamera=function(dx, dz){
  var fwd=new THREE.Vector3(this.cameraTarget.x-this.camera.position.x, 0, this.cameraTarget.z-this.camera.position.z).normalize();
  var right=new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).normalize();
  var step=2;
  this.cameraTarget.addScaledVector(right, dx*step);
  this.cameraTarget.addScaledVector(fwd, dz*step);
  this._updateCamera();
};
Game.prototype._onWheel=function(e){
  e.preventDefault();
  var d=e.deltaY>0?1.1:0.9;
  this.cameraDist=Math.max(8, Math.min(120, this.cameraDist*d));
  this._updateCamera();
};
Game.prototype._onPointerDown=function(e){
  this.pointer.down=true;
  this.pointer.button=e.button;
  this.pointer.dragStartX=e.clientX;
  this.pointer.dragStartY=e.clientY;
  this.pointer.dragging=false;
  this.canvas.setPointerCapture(e.pointerId);
};
Game.prototype._onPointerMove=function(e){
  this.pointer.x=(e.clientX/window.innerWidth)*2-1;
  this.pointer.y=-(e.clientY/window.innerHeight)*2+1;
  if(this.pointer.down){
    var dx=e.clientX-this.pointer.dragStartX;
    var dy=e.clientY-this.pointer.dragStartY;
    if(Math.hypot(dx,dy)>5){
      this.pointer.dragging=true;
      if(this.pointer.button===2){
        this.cameraAngle-=dx*0.005;
        this.cameraPitch=Math.max(0.2, Math.min(Math.PI/2-0.05, this.cameraPitch+dy*0.005));
        this._updateCamera();
        this.pointer.dragStartX=e.clientX;
        this.pointer.dragStartY=e.clientY;
      } else if(this.pointer.button===1||this.keysHeld[' ']){
        var fwd=new THREE.Vector3(this.cameraTarget.x-this.camera.position.x, 0, this.cameraTarget.z-this.camera.position.z).normalize();
        var right=new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0)).normalize();
        this.cameraTarget.addScaledVector(right, -dx*0.05);
        this.cameraTarget.addScaledVector(fwd, dy*0.05);
        this._updateCamera();
        this.pointer.dragStartX=e.clientX;
        this.pointer.dragStartY=e.clientY;
      }
    }
  }
  this._updateHover();
};
Game.prototype._onPointerUp=function(e){
  if(!this.pointer.down)return;
  this.pointer.down=false;
  this.canvas.releasePointerCapture(e.pointerId);
  if(this.pointer.dragging)return;
  if(this.rallyPlacement){
    var hit=this._raycastGround();
    if(hit){
      this.heroes.setRally(hit.x, hit.z);
      this.rallyPlacement=false;
      document.getElementById('mode-text').textContent='Build Mode';
    }
    return;
  }
  if(this.pointer.button===0)this._handleLeftClick();
  else if(this.pointer.button===2)this._handleRightClick();
};

Game.prototype._raycastGround=function(){
  var rc=new THREE.Raycaster();
  rc.setFromCamera({x:this.pointer.x, y:this.pointer.y}, this.camera);
  var meshes=[];
  for(var k in this.world.meshes)meshes.push(this.world.meshes[k]);
  var hits=rc.intersectObjects(meshes, false);
  if(hits.length===0){
    var plane=new THREE.Plane(new THREE.Vector3(0,1,0), 0);
    var pt=new THREE.Vector3();
    rc.ray.intersectPlane(plane, pt);
    if(pt)return {x:Math.floor(pt.x), z:Math.floor(pt.z), y:0, face:null, instanceId:null};
    return null;
  }
  var hit=hits[0];
  var x=Math.floor(hit.point.x), y=Math.floor(hit.point.y), z=Math.floor(hit.point.z);
  var face='top';
  if(hit.face){
    var n=hit.face.normal;
    if(n.y>0.5)face='top';
    else if(n.y<-0.5)face='bottom';
    else if(n.x>0.5)face='px';
    else if(n.x<-0.5)face='nx';
    else if(n.z>0.5)face='pz';
    else if(n.z<-0.5)face='nz';
  }
  return {x:x, y:y, z:z, face:face, instanceId:hit.instanceId, mesh:hit.object, point:hit.point};
};

Game.prototype._updateHover=function(){
  if(this.mode==='hero'){this.previewMesh.visible=false;return;}
  var hit=this._raycastGround();
  if(!hit){
    this.previewMesh.visible=false;
    this.ui.setCoords('-','-','-');
    return;
  }
  var px=hit.x, py=hit.y, pz=hit.z;
  if(this.ui.selectedTool==='build'){
    if(this.ui.selectedTemplate){
      var top=this.world.topY(hit.x, hit.z);
      px=hit.x;py=top+1;pz=hit.z;
    } else {
      var adj=this._faceOffset(hit.face);
      px=hit.x+adj.x;py=hit.y+adj.y;pz=hit.z+adj.z;
    }
  }
  this.previewMesh.position.set(px+0.5, py+0.5, pz+0.5);
  this.previewMesh.visible=true;
  this.ui.setCoords(hit.x, hit.y, hit.z);
};
Game.prototype._faceOffset=function(face){
  switch(face){
    case 'top':return {x:0,y:1,z:0};
    case 'bottom':return {x:0,y:-1,z:0};
    case 'px':return {x:1,y:0,z:0};
    case 'nx':return {x:-1,y:0,z:0};
    case 'pz':return {x:0,y:0,z:1};
    case 'nz':return {x:0,y:0,z:-1};
  }
  return {x:0,y:1,z:0};
};

Game.prototype._handleLeftClick=function(){
  var hero=this.heroes.selectAt({x:this.pointer.x, y:this.pointer.y}, this.camera);
  if(hero){
    this.mode='hero';
    this.setMode('hero');
    Audio.sfx.heroSelect();
    this.ui.refreshHeroList();
    return;
  }
  if(this.mode==='hero'&&this.heroes.selected){
    var hit=this._raycastGround();
    if(hit){
      this.heroes.commandMove(hit.x, hit.z);
      Audio.sfx.heroMove();
      this.ui.refreshHeroList();
    }
    return;
  }
  var hit=this._raycastGround();
  if(!hit)return;
  var tool=this.ui.selectedTool;
  if(tool==='build'){
    if(this.ui.selectedTemplate)this._placeTemplate(hit);
    else{
      var adj=this._faceOffset(hit.face);
      this._placeBrush(hit.x+adj.x, hit.y+adj.y, hit.z+adj.z);
    }
  }
  else if(tool==='remove')this._mineBrush(hit.x, hit.y, hit.z);
  else if(tool==='raise')this._terrainBrush(hit.x, hit.z, 'raise');
  else if(tool==='lower')this._terrainBrush(hit.x, hit.z, 'lower');
  else if(tool==='flatten')this._terrainBrush(hit.x, hit.z, 'flatten');
};
Game.prototype._handleRightClick=function(){
  if(this.mode==='hero'&&this.heroes.selected){
    var hit=this._raycastGround();
    if(hit){
      this.heroes.commandMove(hit.x, hit.z);
      Audio.sfx.heroMove();
      this.ui.refreshHeroList();
    }
    return;
  }
  var hit=this._raycastGround();
  if(!hit)return;
  this._mineBrush(hit.x, hit.y, hit.z);
};

Game.prototype._placeBrush=function(x, y, z){
  var t=this.ui.selectedBlockType;
  var r=this.brushSize-1;
  for(var dx=-r;dx<=r;dx++)for(var dz=-r;dz<=r;dz++){
    if(Math.hypot(dx,dz)>r+0.5)continue;
    if(this.world.get(x+dx, y, z+dz)===0){
      var cost=this._blockCost(t);
      if(this._canAfford(cost)){
        this._spend(cost);
        this.world.set(x+dx, y, z+dz, t);
      }
    }
  }
  this.world.rebuildMesh();
  Audio.sfx.placeBlock();
};
Game.prototype._mineBrush=function(x, y, z){
  var r=this.brushSize-1;
  var any=false;
  for(var dx=-r;dx<=r;dx++)for(var dz=-r;dz<=r;dz++){
    if(Math.hypot(dx,dz)>r+0.5)continue;
    var t=this.world.get(x+dx, y, z+dz);
    if(t!==0&&t!==10){
      this._awardMined(t);
      this.world.set(x+dx, y, z+dz, 0);
      any=true;
    }
  }
  if(any){
    this.world.rebuildMesh();
    Audio.sfx.removeBlock();
  }
};
Game.prototype._terrainBrush=function(x, z, mode){
  var r=this.brushSize-1;
  for(var dx=-r;dx<=r;dx++)for(var dz=-r;dz<=r;dz++){
    if(Math.hypot(dx,dz)>r+0.5)continue;
    if(mode==='raise')this.world.raise(x+dx, z+dz, 1, true);
    else if(mode==='lower')this.world.lower(x+dx, z+dz, true);
    else if(mode==='flatten')this.world.flatten(x+dx, z+dz, true);
  }
  this.world.rebuildMesh();
  if(mode==='raise')Audio.sfx.raise();
  else if(mode==='lower')Audio.sfx.lower();
  else Audio.sfx.flatten();
};
Game.prototype._blockCost=function(t){
  var c={};
  if(t===4||t===6)c.wood=1;
  else if(t===5)c.food=1;
  else if(t===7)c.stone=1;
  else if(t===8)c.stone=2;
  else if(t===12)c.stone=1; // glass
  else if(t===13)c.stone=2; // brick
  else if(t===14)c.gold=1; // gold
  else if(t===15)c.stone=1; // moss
  return c;
};
Game.prototype._canAfford=function(c){
  for(var k in c)if(this.gameState[k]==null||this.gameState[k]<c[k])return false;
  return true;
};
Game.prototype._spend=function(c){
  for(var k in c)this.gameState[k]-=c[k];
};
Game.prototype._awardMined=function(t){
  if(t===4||t===6)this.gameState.wood+=1;
  else if(t===3||t===7)this.gameState.stone+=1;
  else if(t===5)this.gameState.food+=1;
  else if(t===8){this.gameState.stone+=3;this.gameState.food+=2;}
  else if(t===12)this.gameState.stone+=1;
  else if(t===13)this.gameState.stone+=2;
  else if(t===14){this.gameState.gold+=1;this.gameState.stone+=1;}
  else if(t===15)this.gameState.stone+=1;
};

Game.prototype._placeTemplate=function(hit){
  var tpl=this.ui.selectedTemplate;
  if(!tpl)return;
  if(!this._canAfford(tpl.cost)){
    Audio.sfx.error();
    var mt=document.getElementById('mode-text');
    var old=mt.textContent;
    mt.textContent='Not enough resources!';
    setTimeout(function(){mt.textContent=old;}, 1500);
    return;
  }
  var top=this.world.topY(hit.x, hit.z);
  if(top<0)return;
  var baseY=top+1;
  var sx=tpl.size[0], sy=tpl.size[1], sz=tpl.size[2];
  var ox=hit.x-Math.floor(sx/2);
  var oz=hit.z-Math.floor(sz/2);
  var placed=false;
  for(var ly=0;ly<sy;ly++)for(var lz=0;lz<sz;lz++)for(var lx=0;lx<sx;lx++){
    var t=tpl.layout[ly][lz][lx];
    if(t===0)continue;
    var wx=ox+lx, wy=baseY+ly, wz=oz+lz;
    if(this.world.get(wx, wy, wz)===0){
      this.world.set(wx, wy, wz, t);
      placed=true;
    }
  }
  if(placed){
    this._spend(tpl.cost);
    this.world.rebuildMesh();
    Audio.sfx.template();
  }
};

Game.prototype.spawnHeroAtCenter=function(){
  var x=Math.floor(this.cameraTarget.x);
  var z=Math.floor(this.cameraTarget.z);
  var hero=this.heroes.spawn(x, z);
  if(!hero){
    Audio.sfx.error();
    var mt=document.getElementById('mode-text');
    var old=mt.textContent;
    mt.textContent='Need 5 food and housing!';
    setTimeout(function(){mt.textContent=old;}, 1500);
    return;
  }
  Audio.sfx.spawnHero();
  if(this.gameState.pop>=this.gameState.popMax)this.gameState.popMax+=1;
  this.ui.refreshHeroList();
};

Game.prototype.beginRallyPlacement=function(){
  this.rallyPlacement=true;
  document.getElementById('mode-text').textContent='Click to set rally point';
};

Game.prototype.setMode=function(m){
  this.mode=m;
  this.ui.setMode(m);
};

Game.prototype.clearSelection=function(){
  if(this.heroes.selected){
    this.heroes.selected.setSelected(false);
    this.heroes.selected=null;
  }
  this.mode='build';
  this.setMode('build');
  this.ui.refreshHeroList();
};

Game.prototype.regenerateWorld=function(size, seed, fol){
  for(var i=0;i<this.heroes.heroes.length;i++)this.scene.remove(this.heroes.heroes[i].mesh);
  this.heroes.heroes=[];
  this.heroes.selected=null;
  this.gameState.pop=0;
  this._initWorld(size, seed, fol);
  this._initHeroes();
  for(var i=0;i<3;i++)this.heroes.spawn(Math.floor(size/2)+(i-1)*2, Math.floor(size/2));
  this.gameState.pop=this.heroes.heroes.length;
  this.ui.refreshHeroList();
  Audio.sfx.regen();
};

Game.prototype._applyTimeOfDay=function(){
  var h=this.timeOfDay;
  var t=h/24;
  var angle=(t*Math.PI*2)-Math.PI/2;
  var elev=Math.sin(angle);
  var r=60;
  this.sun.position.set(Math.cos(angle)*r, elev*r, Math.sin(angle)*0.3*r);
  this.sun.intensity=Math.max(0, elev*0.9+0.1);
  var sky, fog, amb, hemi;
  if(h>=7&&h<17){sky=new THREE.Color(0x88aacc);fog=sky.clone();amb=0.55;hemi=0.4;}
  else if((h>=6&&h<7)||(h>=17&&h<18)){sky=new THREE.Color(0xe09050);fog=sky.clone();amb=0.35;hemi=0.25;}
  else if((h>=5&&h<6)||(h>=18&&h<19)){sky=new THREE.Color(0x604080);fog=sky.clone();amb=0.22;hemi=0.15;}
  else {
    sky=new THREE.Color(0x08081a);fog=sky.clone();amb=0.12;hemi=0.08;
    this.sun.intensity=0.15;
    this.sun.position.set(20, 40, -10);
    this.sun.color.set(0xb0c4ff);
  }
  if(h>=5&&h<19)this.sun.color.set(0xffffff);
  this.scene.background=sky;
  this.scene.fog.color=fog;
  this.scene.fog.near=80;
  this.scene.fog.far=160;
  this.ambient.intensity=amb;
  this.hemi.intensity=hemi;
};
Game.prototype.setTimeOfDay=function(h){
  this.timeOfDay=h;
  this._applyTimeOfDay();
};

Game.prototype.save=function(){
  try{
    var payload={
      world:this.world.serialize(),
      heroes:this.heroes.heroes.map(function(h){
        return {id:h.id, name:h.name, color:h.color, hp:h.hp, maxHp:h.maxHp, position:h.position, task:h.task};
      }),
      gameState:this.gameState,
      timeOfDay:this.timeOfDay,
      cameraAngle:this.cameraAngle,
      cameraPitch:this.cameraPitch,
      cameraDist:this.cameraDist,
      cameraTarget:{x:this.cameraTarget.x, y:this.cameraTarget.y, z:this.cameraTarget.z}
    };
    localStorage.setItem('rubydung-save', JSON.stringify(payload));
    Audio.sfx.save();
    var mt=document.getElementById('mode-text');
    var old=mt.textContent;
    mt.textContent='World saved!';
    setTimeout(function(){mt.textContent=old;}, 1500);
  } catch(e){
    console.error('save fail', e);
    alert('Save failed: '+e.message);
  }
};
Game.prototype.load=function(){
  try{
    var raw=localStorage.getItem('rubydung-save');
    if(!raw){alert('No saved world found.');return;}
    var payload=JSON.parse(raw);
    for(var i=0;i<this.heroes.heroes.length;i++)this.scene.remove(this.heroes.heroes[i].mesh);
    this.heroes.heroes=[];
    for(var k in this.world.meshes)this.scene.remove(this.world.meshes[k]);
    this.world=World.deserialize(this.scene, payload.world);
    this.heroes.world=this.world;
    var self=this;
    for(var i=0;i<payload.heroes.length;i++){
      var hd=payload.heroes[i];
      var h=new Hero(hd.id, hd.name, hd.color);
      h.hp=hd.hp;h.maxHp=hd.maxHp;
      h.position=hd.position;h.task=hd.task;
      h._onGather=function(hero){
        var r=Math.random();
        if(r<0.40){self.gameState.wood+=1;hero.task='Chopping';Audio.sfx.chop();}
        else if(r<0.75){self.gameState.stone+=1;hero.task='Mining';Audio.sfx.mine();}
        else if(r<0.95){self.gameState.food+=1;hero.task='Foraging';Audio.sfx.gather();}
        else{self.gameState.gold+=1;hero.task='Panning';Audio.sfx.gather();}
      };
      var mesh=h.createMesh();
      mesh.position.copy(h.position);
      this.scene.add(mesh);
      this.heroes.heroes.push(h);
    }
    this.heroes.nextId=this.heroes.heroes.length>0?Math.max.apply(null, this.heroes.heroes.map(function(h){return h.id;}))+1:1;
    this.gameState=payload.gameState;
    this.heroes.gameState=this.gameState;
    this.timeOfDay=payload.timeOfDay;
    this._applyTimeOfDay();
    this.cameraAngle=payload.cameraAngle;
    this.cameraPitch=payload.cameraPitch;
    this.cameraDist=payload.cameraDist;
    this.cameraTarget.set(payload.cameraTarget.x, payload.cameraTarget.y, payload.cameraTarget.z);
    this._updateCamera();
    this.ui.refreshHeroList();
    Audio.sfx.load();
    var mt=document.getElementById('mode-text');
    var old=mt.textContent;
    mt.textContent='World loaded!';
    setTimeout(function(){mt.textContent=old;}, 1500);
  } catch(e){
    console.error('load fail', e);
    alert('Load failed: '+e.message);
  }
};

Game.prototype._tickInner=function(){
  requestAnimationFrame(this._tick);
  var now=performance.now();
  var dt=Math.min(0.1, (now-this.lastTime)/1000);
  this.lastTime=now;
  this.frameCount++;
  this.fpsTime+=dt;
  if(this.fpsTime>=0.5){
    this.fps=Math.round(this.frameCount/this.fpsTime);
    this.frameCount=0;
    this.fpsTime=0;
    this.ui.setFPS(this.fps);
  }
  // auto day/night cycle: 1 game hour per 8 real seconds (full day = ~3 min)
  if(this.autoTime){
    this.timeOfDay=(this.timeOfDay+dt*0.125)%24;
    this._applyTimeOfDay();
    // update slider + label without firing its input event
    var tod=document.getElementById('time-of-day');
    if(tod)tod.value=this.timeOfDay;
    var h=this.timeOfDay;
    var label='Night';
    if(h>=5&&h<8)label='Dawn';
    else if(h>=8&&h<12)label='Morning';
    else if(h>=12&&h<17)label='Afternoon';
    else if(h>=17&&h<20)label='Dusk';
    var tl=document.getElementById('time-label');
    if(tl)tl.textContent=label+' ('+Math.floor(h).toString().padStart(2,'0')+":00)";
  }
  // animate water texture offset for shimmer
  if(this.world.materials[10] && this.world.materials[10].map){
    this.world.materials[10].map.offset.x = (this.world.materials[10].map.offset.x + dt*0.05) % 1;
    this.world.materials[10].map.offset.y = (this.world.materials[10].map.offset.y + dt*0.03) % 1;
  }
  this.heroes.update(dt);
  if(this.keysHeld['w'])this.panCamera(0,-1);
  if(this.keysHeld['a'])this.panCamera(-1,0);
  if(this.keysHeld['s'])this.panCamera(0,1);
  if(this.keysHeld['d'])this.panCamera(1,0);
  if(this.frameCount%12===0)this.ui.update();
  this.renderer.render(this.scene, this.camera);
};

// held keys for camera pan
document.addEventListener('keydown', function(e){
  if(window.__game)window.__game.keysHeld[e.key.toLowerCase()]=true;
});
document.addEventListener('keyup', function(e){
  if(window.__game)window.__game.keysHeld[e.key.toLowerCase()]=false;
});

// boot
window.addEventListener('DOMContentLoaded', function(){
  var progressEl=document.getElementById('loading-progress');
  var loadingText=document.getElementById('loading-text');
  var startBtn=document.getElementById('start-btn');
  var progress=0;
  var steps=['Loading textures...','Carving terrain...','Planting forests...','Summoning heroes...','Ready!'];
  var loader=setInterval(function(){
    progress+=8+Math.random()*12;
    if(progress>=100){
      progress=100;
      clearInterval(loader);
      loadingText.textContent=steps[steps.length-1];
      startBtn.disabled=false;
    } else {
      loadingText.textContent=steps[Math.min(steps.length-2, Math.floor(progress/25))];
    }
    progressEl.style.width=progress+'%';
  }, 120);
  startBtn.addEventListener('click', function(){
    document.getElementById('loading-screen').style.opacity='0';
    setTimeout(function(){
      document.getElementById('loading-screen').style.display='none';
      document.getElementById('game-container').classList.remove('hidden');
      window.__game=new Game();
    }, 600);
  });
});
