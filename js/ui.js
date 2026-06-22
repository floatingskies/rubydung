// ui wiring. talks to game + audio.
function UI(game){
  this.game=game;
  this.selectedBlockType=1; // grass
  this.selectedTool='build';
  this.selectedTemplate=null;
  this.activeTab='build';
  this._setResIcons();
  this._buildBlockPalette();
  this._buildToolPalette();
  this._buildTemplateGrid();
  this._wireEvents();
  this._refreshResources();
}
UI.prototype._setResIcons=function(){
  document.getElementById('icon-wood').src=Sprites.icon('wood');
  document.getElementById('icon-stone').src=Sprites.icon('stone');
  document.getElementById('icon-food').src=Sprites.icon('food');
  document.getElementById('icon-gold').src=Sprites.icon('gold');
  document.getElementById('icon-pop').src=Sprites.icon('pop');
};
UI.prototype._buildBlockPalette=function(){
  var c=document.getElementById('block-palette');c.innerHTML='';
  for(var i=0;i<PALETTE_BLOCKS.length;i++){
    (function(b){
      var def=BLOCKS[b.type];
      var it=document.createElement('div');
      it.className='palette-item'+(b.type===this.selectedBlockType?' active':'');
      it.dataset.type=b.type;it.title=def.name;
      if(def.texture){
        var tex=def.texture();
        if(tex.image){
          var sw=document.createElement('div');sw.className='swatch';
          sw.style.backgroundImage='url('+tex.image.toDataURL()+')';
          sw.style.backgroundSize='cover';
          it.appendChild(sw);
        }
      } else {
        var sw=document.createElement('div');sw.className='swatch';
        sw.style.background='#'+def.color.toString(16).padStart(6,'0');
        it.appendChild(sw);
      }
      var lbl=document.createElement('div');lbl.className='label';lbl.textContent=def.name;it.appendChild(lbl);
      var hk=document.createElement('div');hk.className='hotkey';hk.textContent=b.hotkey;it.appendChild(hk);
      var self=this;
      it.addEventListener('click', function(){self.selectBlock(b.type);});
      c.appendChild(it);
    }).call(this, PALETTE_BLOCKS[i]);
  }
};
UI.prototype._buildToolPalette=function(){
  var c=document.getElementById('tool-palette');c.innerHTML='';
  for(var i=0;i<TOOLS.length;i++){
    (function(t){
      var it=document.createElement('div');
      it.className='palette-item'+(t.id===this.selectedTool?' active':'');
      it.dataset.tool=t.id;it.title=t.name+' ('+t.hotkey+')';
      var sw=document.createElement('img');sw.className='swatch';sw.src=Sprites.icon(t.icon);
      sw.style.width='100%';sw.style.height='100%';sw.style.objectFit='contain';
      sw.style.padding='4px';sw.style.imageRendering='pixelated';
      it.appendChild(sw);
      var lbl=document.createElement('div');lbl.className='label';lbl.textContent=t.name;it.appendChild(lbl);
      var hk=document.createElement('div');hk.className='hotkey';hk.textContent=t.hotkey;it.appendChild(hk);
      var self=this;
      it.addEventListener('click', function(){self.selectTool(t.id);});
      c.appendChild(it);
    }).call(this, TOOLS[i]);
  }
};
UI.prototype._buildTemplateGrid=function(){
  var c=document.getElementById('build-grid');c.innerHTML='';
  for(var i=0;i<TEMPLATES.length;i++){
    (function(t){
      var it=document.createElement('div');it.className='build-template';it.dataset.id=t.id;
      var ico=document.createElement('img');ico.className='ico';ico.src=Sprites.icon(t.icon);
      ico.style.width='32px';ico.style.height='32px';ico.style.imageRendering='pixelated';
      ico.style.display='block';ico.style.margin='0 auto 4px';
      it.appendChild(ico);
      var nm=document.createElement('span');nm.className='name';nm.textContent=t.name;it.appendChild(nm);
      var cost=document.createElement('span');cost.className='cost';
      var parts=[];
      if(t.cost.wood)parts.push('W'+t.cost.wood);
      if(t.cost.stone)parts.push('S'+t.cost.stone);
      if(t.cost.food)parts.push('F'+t.cost.food);
      cost.textContent=parts.join(' ');
      it.appendChild(cost);
      var self=this;
      it.addEventListener('click', function(){self.selectTemplate(t.id);});
      c.appendChild(it);
    }).call(this, TEMPLATES[i]);
  }
};
UI.prototype.selectBlock=function(t){
  this.selectedBlockType=t;this.selectedTemplate=null;
  var items=document.querySelectorAll('#block-palette .palette-item');
  items.forEach(function(i){i.classList.toggle('active', Number(i.dataset.type)===t);});
  document.querySelectorAll('.build-template').forEach(function(x){x.classList.remove('active');});
  document.getElementById('selected-block').textContent=BLOCKS[t].name;
  this.game.setMode('build');this.selectTool('build', true);
  Audio.sfx.click();
};
UI.prototype.selectTool=function(id, silent){
  this.selectedTool=id;
  var items=document.querySelectorAll('#tool-palette .palette-item');
  items.forEach(function(i){i.classList.toggle('active', i.dataset.tool===id);});
  var tool=TOOLS.find(function(t){return t.id===id;});
  if(tool&&!silent){
    var mm={build:'Build',remove:'Mine',raise:'Raise',lower:'Lower',flatten:'Flatten'};
    document.getElementById('mode-text').textContent=(mm[id]||id)+' Mode';
    Audio.sfx.click();
  }
};
UI.prototype.selectTemplate=function(id){
  this.selectedTemplate=TEMPLATES.find(function(t){return t.id===id;});
  document.querySelectorAll('.build-template').forEach(function(t){t.classList.toggle('active', t.dataset.id===id);});
  document.querySelectorAll('#block-palette .palette-item').forEach(function(i){i.classList.remove('active');});
  document.getElementById('selected-block').textContent=this.selectedTemplate.name;
  this.selectTool('build');
  Audio.sfx.click();
};
UI.prototype.setMode=function(m){
  if(m==='build')document.getElementById('mode-text').textContent='Build Mode';
  else if(m==='hero')document.getElementById('mode-text').textContent='Command Mode';
};
UI.prototype._wireEvents=function(){
  var self=this;
  // tabs
  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click', function(){
      var tabId=t.dataset.tab;
      document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('active', x===t);});
      document.querySelectorAll('.tab-content').forEach(function(c){c.classList.toggle('active', c.id==='tab-'+tabId);});
      self.activeTab=tabId;
    });
  });
  // brush
  var brush=document.getElementById('brush-size');
  var brushLabel=document.getElementById('brush-size-label');
  brush.addEventListener('input', function(){
    brushLabel.textContent=brush.value;
    self.game.brushSize=Number(brush.value);
  });
  // time of day
  var tod=document.getElementById('time-of-day');
  var todLabel=document.getElementById('time-label');
  function updTOD(){
    var h=Number(tod.value);
    self.game.setTimeOfDay(h);
    var label='Night';
    if(h>=5&&h<8)label='Dawn';
    else if(h>=8&&h<12)label='Morning';
    else if(h>=12&&h<17)label='Afternoon';
    else if(h>=17&&h<20)label='Dusk';
    else if(h>=20||h<5)label='Night';
    todLabel.textContent=label+' ('+Math.floor(h).toString().padStart(2,'0')+":00)";
  }
  tod.addEventListener('input', function(){
    // manual change disables auto cycle
    document.getElementById('auto-time').checked=false;
    self.game.autoTime=false;
    updTOD();
  });
  updTOD();
  document.getElementById('auto-time').addEventListener('change', function(e){
    self.game.autoTime=e.target.checked;
  });
  // regen
  document.getElementById('btn-regen').addEventListener('click', function(){
    var size=Number(document.getElementById('world-size').value);
    var seed=Number(document.getElementById('seed-input').value)||42;
    var fol=Number(document.getElementById('foliage-density').value)/100;
    self.game.regenerateWorld(size, seed, fol);
  });
  // top buttons
  document.getElementById('btn-help').addEventListener('click', function(){
    document.getElementById('help-modal').classList.remove('hidden');
    Audio.sfx.click();
  });
  document.getElementById('close-help').addEventListener('click', function(){
    document.getElementById('help-modal').classList.add('hidden');
    Audio.sfx.click();
  });
  document.getElementById('help-modal').addEventListener('click', function(e){
    if(e.target.id==='help-modal')document.getElementById('help-modal').classList.add('hidden');
  });
  document.getElementById('btn-music').addEventListener('click', function(){
    var on=!Audio.isMusicEnabled();
    Audio.setMusicEnabled(on);
    document.getElementById('btn-music').classList.toggle('muted', !on);
    if(on)self._updateNowPlaying();
    else document.getElementById('now-playing').textContent='♪ -';
  });
  document.getElementById('btn-sfx').addEventListener('click', function(){
    var on=!Audio.isSfxEnabled();
    Audio.setSfxEnabled(on);
    document.getElementById('btn-sfx').classList.toggle('muted', !on);
    if(on)Audio.sfx.click();
  });
  document.getElementById('btn-save').addEventListener('click', function(){self.game.save();});
  document.getElementById('btn-load').addEventListener('click', function(){self.game.load();});
  document.getElementById('btn-reset').addEventListener('click', function(){
    if(confirm('Generate a new world? Unsaved changes will be lost.')){
      var seed=Math.floor(Math.random()*100000);
      document.getElementById('seed-input').value=seed;
      self.game.regenerateWorld(Number(document.getElementById('world-size').value), seed, Number(document.getElementById('foliage-density').value)/100);
    }
  });
  document.getElementById('btn-spawn-hero').addEventListener('click', function(){self.game.spawnHeroAtCenter();});
  document.getElementById('btn-rally').addEventListener('click', function(){self.game.beginRallyPlacement();});
  // keyboard
  document.addEventListener('keydown', function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;
    if(e.key>='1'&&e.key<='9'){
      var idx=Number(e.key)-1;
      if(PALETTE_BLOCKS[idx])self.selectBlock(PALETTE_BLOCKS[idx].type);
      return;
    }
    if(e.key==='0'){
      // snow is at index 9
      if(PALETTE_BLOCKS[9])self.selectBlock(PALETTE_BLOCKS[9].type);
      return;
    }
    var k=e.key.toLowerCase();
    if(k==='b')self.selectTool('build');
    else if(k==='x')self.selectTool('remove');
    else if(k==='r')self.selectTool('raise');
    else if(k==='l')self.selectTool('lower');
    else if(k==='f')self.selectTool('flatten');
    else if(k==='h')document.getElementById('help-modal').classList.toggle('hidden');
    else if(k==='escape'){
      document.getElementById('help-modal').classList.add('hidden');
      self.game.clearSelection();
    }
    else if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();self.game.save();}
    else if((e.ctrlKey||e.metaKey)&&k==='l'){e.preventDefault();self.game.load();}
    else if(k==='q')self.game.rotateCamera(-1);
    else if(k==='e')self.game.rotateCamera(1);
    else if(k==='w')self.game.panCamera(0,-1);
    else if(k==='a')self.game.panCamera(-1,0);
    else if(k==='s'&&!e.ctrlKey&&!e.metaKey)self.game.panCamera(0,1);
    else if(k==='d')self.game.panCamera(1,0);
  });
};
UI.prototype._refreshResources=function(){
  var gs=this.game.gameState;
  document.getElementById('res-wood').textContent=gs.wood;
  document.getElementById('res-stone').textContent=gs.stone;
  document.getElementById('res-food').textContent=gs.food;
  var goldEl=document.getElementById('res-gold');
  if(goldEl&&gs.gold!=null)goldEl.textContent=gs.gold;
  document.getElementById('res-pop').textContent=gs.pop;
  document.getElementById('res-pop-max').textContent=gs.popMax;
};
UI.prototype.refreshHeroList=function(){
  var list=document.getElementById('hero-list');list.innerHTML='';
  if(this.game.heroes.heroes.length===0){
    list.innerHTML='<p class="hint">No heroes yet. Spawn one to start commanding units.</p>';
    return;
  }
  for(var i=0;i<this.game.heroes.heroes.length;i++){
    var h=this.game.heroes.heroes[i];
    var card=document.createElement('div');
    card.className='hero-card'+(h.selected?' selected':'');
    var av=document.createElement('div');av.className='hero-avatar';
    av.style.background='#'+h.color.toString(16).padStart(6,'0');
    av.textContent=h.name[0];
    var info=document.createElement('div');info.className='hero-info';
    info.innerHTML='<div class="hero-name">'+h.name+'</div><div class="hero-task">'+h.task+'</div>';
    var hpb=document.createElement('div');hpb.className='hero-hp-bar';
    var hpf=document.createElement('div');hpf.className='hero-hp-fill';
    hpf.style.width=(h.hp/h.maxHp*100)+'%';
    hpb.appendChild(hpf);info.appendChild(hpb);
    card.appendChild(av);card.appendChild(info);
    var self=this;
    (function(hero){
      card.addEventListener('click', function(){
        self.game.heroes.selected=hero;
        self.game.heroes.heroes.forEach(function(o){o.setSelected(false);});
        hero.setSelected(true);
        Audio.sfx.heroSelect();
        self.refreshHeroList();
      });
    })(h);
    list.appendChild(card);
  }
};
UI.prototype.update=function(){
  this._refreshResources();
  this._heroListCounter=(this._heroListCounter||0)+1;
  if(this._heroListCounter>=5){this._heroListCounter=0;this.refreshHeroList();}
  this._npCounter=(this._npCounter||0)+1;
  if(this._npCounter>=30){this._npCounter=0;this._updateNowPlaying();}
};
UI.prototype._updateNowPlaying=function(){
  var np=document.getElementById('now-playing');
  if(!np)return;
  if(Audio.isMusicEnabled())np.textContent='♪ '+Audio.getCurrentTrackName();
  else np.textContent='♪ -';
};
UI.prototype.setCoords=function(x,y,z){
  document.getElementById('coords').textContent='X:'+x+' Y:'+y+' Z:'+z;
};
UI.prototype.setFPS=function(fps){
  document.getElementById('fps').textContent=fps+' FPS';
};

window.UI=UI;
