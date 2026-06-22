// world. terrain gen + block storage + meshing. instanced per type.
function World(scene, size, seed){
  this.scene=scene;
  this.size=size||96;
  this.seed=seed||42;
  this.noise=new Noise(this.seed);
  this.WORLD_HEIGHT=48;
  this.data=new Uint8Array(this.size*this.size*this.WORLD_HEIGHT);
  this.heightMap=new Int16Array(this.size*this.size);
  this.meshes={};
  this.materials={};
  this._buildMats();
  this.generate();
}
World.prototype.idx=function(x,y,z){
  if(x<0||x>=this.size||z<0||z>=this.size||y<0||y>=this.WORLD_HEIGHT)return -1;
  return (y*this.size+z)*this.size+x;
};
World.prototype.get=function(x,y,z){
  var i=this.idx(x,y,z);
  if(i<0)return 0;
  return this.data[i];
};
World.prototype.set=function(x,y,z,t){
  var i=this.idx(x,y,z);
  if(i<0)return false;
  this.data[i]=t;
  var col=z*this.size+x;
  if(t!==0){if(y>this.heightMap[col])this.heightMap[col]=y;}
  else if(y===this.heightMap[col]){
    var top=y-1;
    while(top>=0&&this.get(x,top,z)===0)top--;
    this.heightMap[col]=top;
  }
  return true;
};
World.prototype.topY=function(x,z){
  if(x<0||x>=this.size||z<0||z>=this.size)return -1;
  return this.heightMap[z*this.size+x];
};

World.prototype.generate=function(fol){
  fol = fol==null?0.4:fol;
  this.data.fill(0);
  this.heightMap.fill(-1);
  var n=this.noise, sz=this.size;
  var SEA=5, SNOW=24, MOUNT=18;

  // heightmap w/ domain warp. curvy mountains.
  var heights=new Float32Array(sz*sz);
  for(var x=0;x<sz;x++)for(var z=0;z<sz;z++){
    var wx=(n.fbm2(x/24,z/24,3,0.5,2.0)-0.5)*18;
    var wz=(n.fbm2(x/24+100,z/24+100,3,0.5,2.0)-0.5)*18;
    var cx=sz/2, cz=sz/2;
    var dx=(x-cx)/cx, dz=(z-cz)/cz;
    var dist=Math.sqrt(dx*dx+dz*dz);
    var cont=Math.max(0,1-dist*0.85);
    var ridgeRaw=n.fbm2((x+wx)/22,(z+wz)/22,5,0.55,2.1);
    var ridge=1-Math.abs(ridgeRaw*2-1);
    ridge=Math.pow(ridge,1.6);
    var hills=n.fbm2((x+wx)/50,(z+wz)/50,3,0.5,2.0);
    var detail=n.fbm2((x+wx)/6,(z+wz)/6,2,0.4,2.0);
    var base=cont*(hills*8+ridge*28+detail*2);
    var h=Math.floor(base);
    if(h<0)h=0;
    heights[z*sz+x]=h;
  }

  // winding river
  for(var x=0;x<sz;x++){
    var rz=Math.floor(sz/2+Math.sin(x*0.08)*8+(n.value2(x*0.1,0)-0.5)*10);
    var rw=2+Math.floor(n.value2(x*0.2,100)*2);
    for(var dz=-rw;dz<=rw;dz++){
      var z=rz+dz;
      if(z<0||z>=sz)continue;
      heights[z*sz+x]=Math.min(heights[z*sz+x],SEA-1);
    }
  }

  // place blocks by biome
  for(var x=0;x<sz;x++)for(var z=0;z<sz;z++){
    var h=Math.floor(heights[z*sz+x]);
    if(h<0)continue;
    var topB=1, subB=2;
    if(h<=SEA){topB=9;subB=9;}
    else if(h>=SNOW){topB=11;subB=3;}
    else if(h>=MOUNT){topB=3;subB=3;}
    var dry=n.value2(x/30+500,z/30+500);
    if(h>SEA&&h<MOUNT&&dry>0.7){topB=9;subB=9;}
    for(var y=0;y<=h;y++){
      var t=3;
      if(y===h)t=topB;
      else if(y>h-3)t=subB;
      this.set(x,y,z,t);
    }
    if(h<SEA)for(var y=h+1;y<=SEA;y++)this.set(x,y,z,10);
  }

  // trees, bushes, cacti
  var tc=fol*0.05, bc=fol*0.07, cc=fol*0.03;
  for(var x=2;x<sz-2;x++)for(var z=2;z<sz-2;z++){
    var top=this.topY(x,z);
    if(top<0)continue;
    var surf=this.get(x,top,z);
    var r=n.value2(x*7.3,z*11.7);
    if(surf===1){
      if(r<tc)this._plantTree(x,top+1,z,'oak');
      else if(r<tc+bc)this.set(x,top+1,z,5);
    } else if(surf===9&&top>SEA){
      if(r<cc){var ch=2+Math.floor(n.value2(x,z)*2);for(var i=0;i<ch;i++)this.set(x,top+1+i,z,4);}
    } else if(surf===11&&top>SNOW-2&&r<tc*0.6){
      this._plantTree(x,top+1,z,'pine');
    }
  }

  // ruby ore clusters
  var oreCount=Math.floor(sz*sz*0.002);
  for(var i=0;i<oreCount;i++){
    var x=Math.floor(n.value2(i+1,0)*sz);
    var z=Math.floor(n.value2(0,i+1)*sz);
    var top=this.topY(x,z);
    if(top>6){
      var y=Math.max(1,top-5-Math.floor(n.value2(i,i)*4));
      this.set(x,y,z,8);
      if(n.value2(i+100,i)>0.5)this.set(x+1,y,z,8);
      if(n.value2(i+200,i)>0.5)this.set(x,y+1,z,8);
      if(n.value2(i+300,i)>0.5)this.set(x,y,z+1,8);
    }
  }

  this.rebuildMesh();
};

World.prototype._plantTree=function(x,y,z,kind){
  kind=kind||'oak';
  var h, cs, cstart;
  if(kind==='pine'){h=4+Math.floor(this.noise.value2(x*3.1,z*3.1)*3);cs=1;cstart=1;}
  else{h=3+Math.floor(this.noise.value2(x*3.1,z*3.1)*2);cs=2;cstart=h-1;}
  for(var i=0;i<h;i++)this.set(x,y+i,z,4);
  var cy=y+cstart;
  for(var dx=-cs;dx<=cs;dx++)for(var dz=-cs;dz<=cs;dz++)for(var dy=0;dy<=(kind==='pine'?0:2);dy++){
    if(Math.abs(dx)+Math.abs(dz)+dy>cs+1)continue;
    if(dx===0&&dz===0&&dy<(kind==='pine'?1:2))continue;
    var lx=x+dx, ly=cy+dy, lz=z+dz;
    if(this.get(lx,ly,lz)===0)this.set(lx,ly,lz,5);
  }
  if(kind==='pine'){
    for(var layer=1;layer<h-1;layer++){
      var ly=y+layer;
      for(var dx=-1;dx<=1;dx++)for(var dz=-1;dz<=1;dz++){
        if(Math.abs(dx)+Math.abs(dz)>1)continue;
        if(dx===0&&dz===0)continue;
        if(this.get(x+dx,ly,z+dz)===0)this.set(x+dx,ly,z+dz,5);
      }
    }
  }
};

World.prototype._buildMats=function(){
  this.unitGeo=new THREE.BoxGeometry(1,1,1);
  for(var idStr in BLOCKS){
    var id=Number(idStr);
    if(id===0)continue;
    var def=BLOCKS[id];
    var opts={transparent:!!def.transparent, opacity:def.opacity==null?1.0:def.opacity};
    if(def.texture){opts.map=def.texture();}
    else{opts.color=def.color;}
    if(def.emissive){
      opts.emissive=def.emissive;
      opts.emissiveIntensity=0.5;
      if(def.texture)opts.emissiveMap=def.texture();
    }
    this.materials[id]=new THREE.MeshLambertMaterial(opts);
  }
};

World.prototype.rebuildMesh=function(){
  var counts={}, pos={};
  for(var y=0;y<this.WORLD_HEIGHT;y++)for(var z=0;z<this.size;z++)for(var x=0;x<this.size;x++){
    var t=this.data[this.idx(x,y,z)];
    if(t===0)continue;
    if(this._hidden(x,y,z))continue;
    if(!counts[t]){counts[t]=0;pos[t]=[];}
    counts[t]++;pos[t].push([x,y,z]);
  }
  for(var k in this.meshes){
    this.scene.remove(this.meshes[k]);
    this.meshes[k].geometry.dispose();
    delete this.meshes[k];
  }
  var dummy=new THREE.Object3D();
  for(var idStr in pos){
    var id=Number(idStr);
    var arr=pos[id];
    var mesh=new THREE.InstancedMesh(this.unitGeo, this.materials[id], arr.length);
    mesh.castShadow=false;
    mesh.receiveShadow=true;
    for(var i=0;i<arr.length;i++){
      var p=arr[i];
      dummy.position.set(p[0]+0.5, p[1]+0.5, p[2]+0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
    mesh.userData.blockType=id;
    this.meshes[id]=mesh;
    this.scene.add(mesh);
  }
};

World.prototype._hidden=function(x,y,z){
  var ns=[this.get(x+1,y,z),this.get(x-1,y,z),this.get(x,y+1,z),this.get(x,y-1,z),this.get(x,y,z+1),this.get(x,y,z-1)];
  for(var i=0;i<ns.length;i++){
    var d=BLOCKS[ns[i]];
    if(!d||!d.solid||d.transparent)return false;
  }
  return true;
};

World.prototype.placeBlock=function(x,y,z,t){
  if(this.get(x,y,z)!==0)return false;
  this.set(x,y,z,t);this.rebuildMesh();return true;
};
World.prototype.removeBlock=function(x,y,z){
  if(this.get(x,y,z)===0)return false;
  this.set(x,y,z,0);this.rebuildMesh();return true;
};
World.prototype.raise=function(x,z,t,skip){
  t=t||1;
  var top=this.topY(x,z);
  if(top+1>=this.WORLD_HEIGHT)return false;
  this.set(x,top+1,z,t);
  if(!skip)this.rebuildMesh();
  return true;
};
World.prototype.lower=function(x,z,skip){
  var top=this.topY(x,z);
  if(top<0)return false;
  this.set(x,top,z,0);
  if(!skip)this.rebuildMesh();
  return true;
};
World.prototype.flatten=function(x,z,skip){
  var sum=0, count=0;
  for(var dx=-1;dx<=1;dx++)for(var dz=-1;dz<=1;dz++){
    var t=this.topY(x+dx,z+dz);
    if(t>=0){sum+=t;count++;}
  }
  if(count===0)return false;
  var avg=Math.round(sum/count);
  var top=this.topY(x,z);
  if(top<avg){for(var y=top+1;y<=avg;y++)this.set(x,y,z,2);this.set(x,avg,z,1);}
  else if(top>avg){for(var y=avg+1;y<=top;y++)this.set(x,y,z,0);if(avg>=0)this.set(x,avg,z,1);}
  if(!skip)this.rebuildMesh();
  return true;
};

World.prototype.serialize=function(){
  return {size:this.size, seed:this.seed, WORLD_HEIGHT:this.WORLD_HEIGHT, data:Array.from(this.data), heightMap:Array.from(this.heightMap)};
};
World.deserialize=function(scene, payload){
  var w=new World(scene, payload.size, payload.seed);
  w.WORLD_HEIGHT=payload.WORLD_HEIGHT;
  w.data=Uint8Array.from(payload.data);
  w.heightMap=Int16Array.from(payload.heightMap);
  w.rebuildMesh();
  return w;
};

window.World=World;
