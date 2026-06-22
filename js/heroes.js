// heroes. dwarf-fortressy units. select + move + auto gather.
function Hero(id, name, color){
  this.id=id;this.name=name;this.color=color||0xffcc66;
  this.hp=100;this.maxHp=100;this.task='Idle';
  this.position={x:0,y:0,z:0};
  this.target=null;this.speed=2.5;
  this.mesh=null;this.selected=false;
  this.gatherCooldown=0;
  this._onGather=null;
}
Hero.prototype.createMesh=function(){
  var g=new THREE.Group();
  var bg=new THREE.CapsuleGeometry(0.25,0.5,4,8);
  var bm=new THREE.MeshLambertMaterial({color:0x553322});
  var b=new THREE.Mesh(bg,bm);b.position.y=0.5;g.add(b);
  var hg=new THREE.SphereGeometry(0.22,12,12);
  var hm=new THREE.MeshLambertMaterial({color:this.color});
  var h=new THREE.Mesh(hg,hm);h.position.y=1.15;g.add(h);
  // selection ring
  var rg=new THREE.RingGeometry(0.4,0.55,24);
  var rm=new THREE.MeshBasicMaterial({color:0xd33b3b,transparent:true,opacity:0.8,side:THREE.DoubleSide});
  var ring=new THREE.Mesh(rg,rm);
  ring.rotation.x=-Math.PI/2;ring.position.y=0.05;ring.visible=false;
  g.add(ring);
  this.mesh=g;this.selectionRing=ring;
  return g;
};
Hero.prototype.setTarget=function(x,z){this.target={x:x,z:z};this.task='Moving';};
Hero.prototype.setSelected=function(s){this.selected=s;if(this.selectionRing)this.selectionRing.visible=s;};
Hero.prototype.update=function(dt, world){
  if(this.target){
    var tx=this.target.x+0.5, tz=this.target.z+0.5;
    var dx=tx-this.position.x, dz=tz-this.position.z;
    var dist=Math.hypot(dx,dz);
    if(dist<0.15){this.target=null;this.task='Idle';}
    else{
      var step=Math.min(dist, this.speed*dt);
      var nx=this.position.x+(dx/dist)*step;
      var nz=this.position.z+(dz/dist)*step;
      var gx=Math.floor(nx), gz=Math.floor(nz);
      var ty=world.topY(gx,gz);
      if(ty>=0){this.position.x=nx;this.position.z=nz;this.position.y=ty+1;}
      else{this.target=null;this.task='Idle';}
    }
  }
  this.gatherCooldown-=dt;
  if(this.gatherCooldown<=0&&!this.target){
    this.gatherCooldown=4+Math.random()*4;
    this.task='Gathering';
    if(this._onGather)this._onGather(this);
    var self=this;
    setTimeout(function(){if(!self.target)self.task='Idle';},1000);
  }
  if(this.mesh){
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    if(this.target){
      var angle=Math.atan2(this.target.x+0.5-this.position.x, this.target.z+0.5-this.position.z);
      this.mesh.rotation.y=angle;
    }
  }
};

function HeroManager(scene, world, gs){
  this.scene=scene;this.world=world;this.gameState=gs;
  this.heroes=[];this.selected=null;this.rallyPoint=null;
  this.nextId=1;
  this.heroNames=['Urist','Brodgar','Thumpa','Gimli','Durin','Bifur','Bofur','Bombur','Dwalin','Balin','Kili','Fili','Dori','Nori','Ori','Oin','Gloin'];
}
HeroManager.prototype.spawn=function(x,z){
  if(this.heroes.length>=this.gameState.popMax)return null;
  if(this.gameState.food<5)return null;
  // find land if water
  var lx=x, lz=z;
  if(this.world.topY(x,z)<0||this.world.get(x,this.world.topY(x,z),z)===10){
    var found=false;
    for(var r=1;r<8&&!found;r++){
      for(var dx=-r;dx<=r&&!found;dx++)for(var dz=-r;dz<=r&&!found;dz++){
        if(Math.abs(dx)!==r&&Math.abs(dz)!==r)continue;
        var t=this.world.topY(x+dx,z+dz);
        if(t>=0&&this.world.get(x+dx,t,z+dz)!==10){lx=x+dx;lz=z+dz;found=true;}
      }
    }
    if(!found)return null;
  }
  var top=this.world.topY(lx,lz);
  if(top<0)return null;
  var name=this.heroNames[Math.floor(Math.random()*this.heroNames.length)]+' '+String(this.nextId).padStart(2,'0');
  var colors=[0xffcc66,0xd4a849,0x8b6239,0xc0c0c0,0xb08050,0xa05a2c];
  var color=colors[this.heroes.length%colors.length];
  var h=new Hero(this.nextId++, name, color);
  h.position={x:lx+0.5, y:top+1, z:lz+0.5};
  var self=this;
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
  this.heroes.push(h);
  this.gameState.food-=5;
  this.gameState.pop=this.heroes.length;
  return h;
};
HeroManager.prototype.selectAt=function(sp, cam){
  var rc=new THREE.Raycaster();
  rc.setFromCamera(sp, cam);
  var best=null, bd=Infinity;
  for(var i=0;i<this.heroes.length;i++){
    var h=this.heroes[i];
    if(!h.mesh)continue;
    var hits=rc.intersectObject(h.mesh, true);
    if(hits.length>0&&hits[0].distance<bd){bd=hits[0].distance;best=h;}
  }
  if(this.selected)this.selected.setSelected(false);
  this.selected=best;
  if(best)best.setSelected(true);
  return best;
};
HeroManager.prototype.commandMove=function(x,z){
  if(!this.selected)return false;
  var top=this.world.topY(x,z);
  if(top<0)return false;
  this.selected.setTarget(x,z);
  return true;
};
HeroManager.prototype.update=function(dt){
  for(var i=0;i<this.heroes.length;i++)this.heroes[i].update(dt, this.world);
};
HeroManager.prototype.setRally=function(x,z){
  var top=this.world.topY(x,z);
  if(top<0)return false;
  this.rallyPoint={x:x,z:z};
  return true;
};
HeroManager.prototype.removeSelected=function(){
  if(!this.selected)return;
  var i=this.heroes.indexOf(this.selected);
  if(i>=0){
    this.scene.remove(this.selected.mesh);
    this.heroes.splice(i,1);
    this.gameState.pop=this.heroes.length;
    this.selected=null;
  }
};

window.Hero=Hero;
window.HeroManager=HeroManager;
