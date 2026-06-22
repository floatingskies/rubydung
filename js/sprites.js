// sprites. all textures are canvas-drawn so no file loading bs.
var Sprites = {
  TS: 32,
  rng: function(s){var x=s>>>0;return function(){x=(x*1664525+1013904223)>>>0;return x/4294967296;};},
  px: function(ctx,x,y,c){ctx.fillStyle=c;ctx.fillRect(x,y,1,1);},
  toTex: function(canvas, transparent){
    var t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.LinearMipMapNearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    if(transparent) t.premultiplyAlpha = false;
    return t;
  },
  grass: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(1337);
    var g=['#4a7a2a','#5a8a3a','#6a9a4a','#3a6a1a','#53802d','#7aa84a'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,g[Math.floor(r()*g.length)]);
    for(var x=0;x<this.TS;x++){
      if(r()<0.5){var h=2+Math.floor(r()*3);for(var y=0;y<h;y++)this.px(ctx,x,y,r()<0.5?'#8bc34a':'#6dae35');}
    }
    for(var i=0;i<8;i++)this.px(ctx,Math.floor(r()*this.TS),Math.floor(r()*this.TS),'#3a5a1a');
    for(var i=0;i<3;i++){
      var x=Math.floor(r()*this.TS),y=Math.floor(r()*this.TS);
      var cc=['#ffd54a','#ff6b9d','#ffffff'][Math.floor(r()*3)];
      this.px(ctx,x,y,cc);this.px(ctx,x-1,y,cc);this.px(ctx,x+1,y,cc);
      this.px(ctx,x,y-1,cc);this.px(ctx,x,y+1,cc);this.px(ctx,x,y,'#ffeb3b');
    }
    return this.toTex(c);
  },
  dirt: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(4242);
    var b=['#5a3a1a','#6b4a2a','#4a2a0a','#7b5a3a','#3a1a00','#62381c'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,b[Math.floor(r()*b.length)]);
    for(var i=0;i<12;i++){
      var x=Math.floor(r()*this.TS),y=Math.floor(r()*this.TS);
      this.px(ctx,x,y,'#8a6a4a');if(r()<0.5)this.px(ctx,x+1,y,'#7a5a3a');
    }
    return this.toTex(c);
  },
  stone: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(7777);
    var g=['#7a7a7a','#8a8a8a','#6a6a6a','#9a9a9a','#5a5a5a','#707070'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,g[Math.floor(r()*g.length)]);
    for(var i=0;i<5;i++){
      var x=Math.floor(r()*this.TS),y=Math.floor(r()*this.TS);
      var len=4+Math.floor(r()*8),dx=r()<0.5?1:-1,dy=r()<0.5?1:-1;
      for(var j=0;j<len;j++)this.px(ctx,x+j*dx,y+j*dy,'#3a3a3a');
    }
    return this.toTex(c);
  },
  cobble: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(8888);
    ctx.fillStyle='#2a2a2a';ctx.fillRect(0,0,this.TS,this.TS);
    for(var i=0;i<20;i++){
      var x=Math.floor(r()*(this.TS-4)),y=Math.floor(r()*(this.TS-4));
      var w=3+Math.floor(r()*4),h=3+Math.floor(r()*4);
      var sh=0x55+Math.floor(r()*0x55);
      ctx.fillStyle='rgb('+sh+','+sh+','+sh+')';ctx.fillRect(x,y,w,h);
      ctx.fillStyle='rgb('+(sh+30)+','+(sh+30)+','+(sh+30)+')';ctx.fillRect(x,y,w,1);ctx.fillRect(x,y,1,h);
      ctx.fillStyle='rgb('+Math.max(0,sh-30)+','+Math.max(0,sh-30)+','+Math.max(0,sh-30)+')';ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x+w-1,y,1,h);
    }
    return this.toTex(c);
  },
  wood: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(5555);
    for(var x=0;x<this.TS;x++){
      var base=0x6b+Math.floor(r()*0x20)-0x10;
      for(var y=0;y<this.TS;y++){
        var wave=Math.sin(y*0.4+x*0.1)*6;
        var sh=Math.max(0x30,Math.min(0xa0,base+wave+(r()-0.5)*10));
        this.px(ctx,x,y,'rgb('+Math.floor(sh*0.7)+','+Math.floor(sh)+','+Math.floor(sh*0.4)+')');
      }
    }
    for(var i=0;i<2;i++){
      var cx=6+Math.floor(r()*20),cy=6+Math.floor(r()*20),rad=2+Math.floor(r()*2);
      ctx.fillStyle='#3a1f0a';ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();
    }
    for(var y=0;y<this.TS;y++){this.px(ctx,0,y,'#2a1a0a');this.px(ctx,this.TS-1,y,'#2a1a0a');}
    return this.toTex(c);
  },
  planks: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(6464);
    var sh=['#a87040','#b88050','#986038','#c08858'];
    for(var p=0;p<4;p++){
      var ys=p*8;ctx.fillStyle=sh[p];ctx.fillRect(0,ys,this.TS,8);
      for(var x=0;x<this.TS;x++)for(var y=0;y<8;y++){
        if(r()<0.15)this.px(ctx,x,ys+y,r()<0.5?'#8a5a30':'#c89468');
      }
      ctx.fillStyle='#3a2010';ctx.fillRect(0,ys,this.TS,1);
      this.px(ctx,2,ys+2,'#5a4030');this.px(ctx,this.TS-3,ys+2,'#5a4030');
    }
    return this.toTex(c);
  },
  leaves: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(91011);
    ctx.clearRect(0,0,this.TS,this.TS);
    var g=['#2a4a1a','#3a5e2a','#4a7e3a','#1a3a0a','#5a8a4a','#3a6a2a'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++){
      if(r()<0.78)this.px(ctx,x,y,g[Math.floor(r()*g.length)]);
    }
    for(var i=0;i<20;i++)this.px(ctx,Math.floor(r()*this.TS),Math.floor(r()*this.TS),'#8bc34a');
    return this.toTex(c,true);
  },
  sand: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(12121);
    var s=['#d4c180','#c4b070','#e4d190','#b4a060','#d8c888','#c0a868'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,s[Math.floor(r()*s.length)]);
    for(var i=0;i<5;i++){var y=Math.floor(r()*this.TS);ctx.fillStyle='#a09060';ctx.fillRect(0,y,this.TS,1);}
    return this.toTex(c);
  },
  water: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(31415);
    var b=['#1a4a8a','#2a5a9a','#3a6aaa','#1a3a7a','#2a6aaa'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,b[Math.floor(r()*b.length)]);
    for(var i=0;i<6;i++){
      var y=Math.floor(r()*this.TS),xs=Math.floor(r()*this.TS),len=4+Math.floor(r()*8);
      for(var x=0;x<len;x++)this.px(ctx,(xs+x)%this.TS,y,'#5a9ada');
    }
    return this.toTex(c);
  },
  snow: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(27182);
    var w=['#ffffff','#f0f0f5','#e0e0e8','#d8d8e0','#f8f8ff'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,w[Math.floor(r()*w.length)]);
    for(var i=0;i<8;i++)this.px(ctx,Math.floor(r()*this.TS),Math.floor(r()*this.TS),'#a0c0ff');
    return this.toTex(c);
  },
  ruby: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(8675309);
    ctx.fillStyle='#3a0a0a';ctx.fillRect(0,0,this.TS,this.TS);
    var facets=[
      {x:16,y:4,color:'#d33b3b'},{x:4,y:16,color:'#b02020'},{x:28,y:16,color:'#b02020'},
      {x:16,y:28,color:'#8a1010'},{x:16,y:16,color:'#ff5555'},{x:10,y:10,color:'#e04040'},
      {x:22,y:10,color:'#e04040'},{x:10,y:22,color:'#a02020'},{x:22,y:22,color:'#a02020'}
    ];
    for(var i=0;i<facets.length;i++){
      var f=facets[i];ctx.fillStyle=f.color;
      ctx.beginPath();ctx.moveTo(f.x,f.y-5);ctx.lineTo(f.x+5,f.y);ctx.lineTo(f.x,f.y+5);ctx.lineTo(f.x-5,f.y);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,200,200,0.6)';ctx.fillRect(f.x-1,f.y-2,1,1);
    }
    return this.toTex(c);
  },
  glass: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(20202);
    // transparent base
    ctx.clearRect(0,0,this.TS,this.TS);
    var b=['#aaddff','#88ccee','#bbeeff','#99ddff'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++){
      this.px(ctx,x,y,b[Math.floor(r()*b.length)]);
    }
    // frame edges
    for(var i=0;i<this.TS;i++){
      this.px(ctx,i,0,'#446688');this.px(ctx,i,this.TS-1,'#446688');
      this.px(ctx,0,i,'#446688');this.px(ctx,this.TS-1,i,'#446688');
    }
    // diagonal highlight crack
    for(var i=4;i<14;i++)this.px(ctx,i,i,'#ffffff');
    return this.toTex(c,true);
  },
  brick: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(30303);
    // mortar base
    ctx.fillStyle='#604030';ctx.fillRect(0,0,this.TS,this.TS);
    // bricks
    var rows=[0,8,16,24];
    for(var ri=0;ri<rows.length;ri++){
      var yStart=rows[ri];
      var offset = (ri%2)*4; // stagger
      for(var bx=-offset;bx<this.TS;bx+=8){
        var sh=0x80+Math.floor(r()*0x30);
        ctx.fillStyle='rgb('+Math.floor(sh*0.9)+','+Math.floor(sh*0.4)+','+Math.floor(sh*0.3)+')';
        ctx.fillRect(bx+1, yStart+1, 6, 6);
      }
    }
    return this.toTex(c);
  },
  gold: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(40404);
    var g=['#d4a849','#e4b859','#c49839','#f4d070','#b48829'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,g[Math.floor(r()*g.length)]);
    // shiny specks
    for(var i=0;i<15;i++)this.px(ctx,Math.floor(r()*this.TS),Math.floor(r()*this.TS),'#fff8c0');
    // vein lines
    for(var i=0;i<4;i++){
      var x=Math.floor(r()*this.TS),y=Math.floor(r()*this.TS);
      var len=3+Math.floor(r()*5);
      for(var j=0;j<len;j++)this.px(ctx,x+j,y+j,'#8a6818');
    }
    return this.toTex(c);
  },
  moss: function(){
    var c=document.createElement('canvas');c.width=c.height=this.TS;
    var ctx=c.getContext('2d');var r=this.rng(50505);
    // start from stone base
    var g=['#7a7a7a','#8a8a8a','#6a6a6a','#9a9a9a'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++)this.px(ctx,x,y,g[Math.floor(r()*g.length)]);
    // mossy overlay
    var m=['#3a5e2a','#4a7e3a','#2a4a1a','#5a8a4a'];
    for(var y=0;y<this.TS;y++)for(var x=0;x<this.TS;x++){
      if(r()<0.55)this.px(ctx,x,y,m[Math.floor(r()*m.length)]);
    }
    // dark spots
    for(var i=0;i<6;i++)this.px(ctx,Math.floor(r()*this.TS),Math.floor(r()*this.TS),'#1a3a0a');
    return this.toTex(c);
  },
  // ui icons, 16px art scaled up. returns data url
  icon: function(name, size){
    size=size||32;
    var c=document.createElement('canvas');c.width=c.height=size;
    var ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
    var P={
      wood:'#a87040',woodDark:'#5a3a1a',woodLight:'#c89060',
      stone:'#8a8a8a',stoneDark:'#4a4a4a',stoneLight:'#b0b0b0',
      gold:'#d4a849',goldDark:'#8a6818',goldLight:'#f4d070',
      ruby:'#d33b3b',rubyDark:'#8a1010',rubyLight:'#ff5555',
      leaf:'#3a5e2a',leafLight:'#6a9e4a',leafDark:'#1a3a0a',
      water:'#3a6aaa',waterLight:'#5a9ada',
      bone:'#e0d8b0',boneDark:'#9a8868',
      red:'#d33b3b',white:'#ffffff',black:'#1a1a1a',
      skin:'#e0b080',hair:'#5a3a1a',
      blue:'#4a6aaa',blueDark:'#2a3a6a',green:'#4a8a3a'
    };
    var s=size/16;
    function p(x,y,col){ctx.fillStyle=col;ctx.fillRect(Math.floor(x*s),Math.floor(y*s),Math.ceil(s),Math.ceil(s));}
    function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.floor(x*s),Math.floor(y*s),Math.ceil(w*s),Math.ceil(h*s));}
    switch(name){
      case 'wood':rect(2,4,12,8,P.wood);rect(2,4,12,1,P.woodDark);rect(2,11,12,1,P.woodDark);for(var i=0;i<4;i++)p(3+i*3,6+(i%2),P.woodDark);break;
      case 'stone':rect(3,5,10,8,P.stone);rect(3,5,10,1,P.stoneLight);rect(3,12,10,1,P.stoneDark);p(5,7,P.stoneDark);p(9,9,P.stoneDark);p(7,10,P.stoneLight);break;
      case 'food':rect(7,3,2,10,P.goldDark);p(5,4,P.gold);p(6,4,P.goldLight);p(9,4,P.gold);p(10,4,P.goldLight);p(4,6,P.gold);p(5,6,P.goldLight);p(10,6,P.gold);p(11,6,P.goldLight);p(4,8,P.gold);p(5,8,P.goldLight);p(10,8,P.gold);p(11,8,P.goldLight);p(5,10,P.gold);p(10,10,P.gold);break;
      case 'pop':rect(7,2,2,2,P.skin);rect(6,4,4,4,P.blue);rect(6,8,1,3,P.blueDark);rect(9,8,1,3,P.blueDark);p(7,1,P.hair);p(8,1,P.hair);p(7,2,P.hair);p(8,2,P.skin);break;
      case 'help':rect(2,2,12,12,P.goldDark);rect(3,3,10,10,P.gold);rect(6,5,4,1,P.black);rect(5,6,1,1,P.black);rect(9,6,1,1,P.black);rect(9,7,1,1,P.black);rect(8,8,1,1,P.black);rect(7,9,1,1,P.black);rect(7,11,1,1,P.black);break;
      case 'save':rect(2,2,12,12,P.black);rect(3,3,10,4,P.stoneLight);rect(9,4,3,2,P.black);rect(3,8,10,5,P.white);rect(4,9,8,3,P.stoneLight);break;
      case 'load':rect(2,5,12,8,P.gold);rect(2,4,5,2,P.gold);rect(2,4,12,1,P.goldDark);rect(2,12,12,1,P.goldDark);rect(4,7,8,4,P.goldLight);break;
      case 'reset':rect(4,4,6,2,P.white);rect(3,5,1,4,P.white);rect(9,5,1,4,P.white);rect(4,9,4,2,P.white);rect(6,11,3,1,P.white);rect(8,10,3,2,P.green);rect(9,9,2,1,P.green);break;
      case 'build':rect(3,3,6,3,P.stone);rect(4,2,4,1,P.stoneLight);rect(3,5,6,1,P.stoneDark);rect(6,6,2,7,P.woodDark);rect(7,6,1,7,P.wood);break;
      case 'remove':rect(2,3,12,1,P.stone);rect(2,4,12,1,P.stoneDark);rect(7,4,2,9,P.woodDark);rect(8,4,1,9,P.wood);p(2,2,P.stoneLight);p(13,2,P.stoneLight);break;
      case 'raise':rect(7,2,2,12,P.green);rect(4,5,8,2,P.green);rect(5,4,6,1,P.green);rect(6,3,4,1,P.green);break;
      case 'lower':rect(7,2,2,12,P.rubyDark);rect(4,9,8,2,P.rubyDark);rect(5,10,6,1,P.rubyDark);rect(6,11,4,1,P.rubyDark);break;
      case 'flatten':rect(2,7,12,2,P.gold);p(2,6,P.goldLight);p(13,6,P.goldLight);p(2,9,P.goldDark);p(13,9,P.goldDark);break;
      case 'house':rect(3,7,10,6,P.wood);rect(3,7,10,1,P.woodDark);rect(2,5,12,2,P.ruby);rect(3,4,10,1,P.ruby);rect(4,3,8,1,P.ruby);rect(5,2,6,1,P.ruby);rect(6,1,4,1,P.rubyDark);rect(7,10,2,3,P.woodDark);rect(4,9,2,2,P.waterLight);rect(10,9,2,2,P.waterLight);break;
      case 'tower':rect(5,3,6,10,P.stone);rect(5,3,6,1,P.stoneLight);rect(5,12,6,1,P.stoneDark);rect(4,4,1,8,P.stone);rect(11,4,1,8,P.stone);p(5,2,P.stone);p(7,2,P.stone);p(9,2,P.stone);rect(7,6,2,2,P.black);p(7,9,P.ruby);p(8,9,P.rubyLight);break;
      case 'wall':rect(2,6,12,6,P.stone);rect(2,6,12,1,P.stoneLight);rect(2,11,12,1,P.stoneDark);for(var i=0;i<4;i++)rect(2+i*3,8,1,2,P.stoneDark);for(var i=0;i<3;i++)rect(3+i*3,9,1,2,P.stoneDark);p(2,4,P.stone);p(5,4,P.stone);p(8,4,P.stone);p(11,4,P.stone);p(3,5,P.stone);p(6,5,P.stone);p(9,5,P.stone);p(12,5,P.stone);break;
      case 'tree':rect(7,9,2,5,P.woodDark);rect(4,3,8,7,P.leaf);rect(3,5,10,4,P.leaf);rect(5,2,6,1,P.leafLight);rect(4,4,1,1,P.leafLight);rect(10,5,1,1,P.leafLight);rect(7,6,1,1,P.leafDark);break;
      case 'farm':rect(2,5,12,8,P.goldDark);rect(2,5,12,1,P.gold);for(var i=0;i<4;i++){rect(3+i*3,6,1,6,P.gold);rect(4+i*3,7,1,4,P.goldLight);}rect(2,4,12,1,P.woodDark);break;
      case 'pylon':rect(7,2,2,12,P.rubyDark);rect(7,2,1,12,P.ruby);rect(7,2,2,1,P.rubyLight);p(7,5,P.rubyLight);p(8,8,P.rubyLight);p(7,11,P.rubyLight);rect(5,13,6,1,P.ruby);break;
      case 'bridge':rect(2,7,12,3,P.wood);rect(2,7,12,1,P.woodDark);rect(2,9,12,1,P.woodDark);for(var i=0;i<6;i++)rect(2+i*2,7,1,3,P.woodDark);rect(2,5,12,1,P.bone);rect(2,10,12,1,P.bone);rect(2,4,1,8,P.woodDark);rect(13,4,1,8,P.woodDark);break;
      case 'barracks':rect(2,6,12,7,P.stone);rect(2,6,12,1,P.stoneLight);rect(2,12,12,1,P.stoneDark);rect(2,4,12,2,P.rubyDark);rect(3,3,10,1,P.rubyDark);rect(7,9,2,4,P.woodDark);rect(4,8,2,2,P.waterLight);rect(10,8,2,2,P.waterLight);rect(7,1,1,3,P.woodDark);rect(8,1,3,2,P.ruby);break;
      case 'warehouse':rect(2,5,12,8,P.wood);rect(2,5,12,1,P.woodDark);rect(2,12,12,1,P.woodDark);rect(2,4,12,1,P.stone);rect(6,7,4,5,P.woodDark);rect(6,7,4,1,P.stoneLight);rect(3,9,2,2,P.gold);rect(11,9,2,2,P.gold);break;
      case 'sawmill':rect(2,7,9,6,P.wood);rect(2,7,9,1,P.woodDark);ctx.fillStyle=P.stoneLight;ctx.beginPath();ctx.arc(12,8,3*s,0,Math.PI*2);ctx.fill();ctx.fillStyle=P.stoneDark;ctx.beginPath();ctx.arc(12,8,1*s,0,Math.PI*2);ctx.fill();rect(2,5,9,2,P.leaf);rect(3,4,7,1,P.leaf);rect(2,11,4,2,P.woodDark);p(3,11,P.wood);p(5,11,P.wood);break;
      case 'mine':rect(2,8,12,5,P.stone);rect(3,6,10,2,P.stone);rect(5,4,6,2,P.stone);rect(7,3,2,1,P.stoneLight);rect(6,9,4,4,P.black);rect(7,10,2,3,P.stoneDark);p(6,13,P.woodDark);p(9,13,P.woodDark);break;
      case 'lighthouse':rect(6,4,4,9,P.white);rect(6,4,1,9,P.ruby);rect(9,4,1,9,P.ruby);rect(6,6,4,1,P.ruby);rect(6,9,4,1,P.ruby);rect(6,12,4,1,P.ruby);rect(5,3,6,1,P.stoneDark);rect(7,1,2,2,P.goldLight);p(2,4,P.goldLight);p(3,4,P.gold);p(12,4,P.goldLight);p(13,4,P.gold);break;
      case 'fountain':rect(3,9,10,4,P.stone);rect(3,9,10,1,P.stoneLight);rect(3,12,10,1,P.stoneDark);rect(4,10,8,2,P.water);p(5,10,P.waterLight);p(10,10,P.waterLight);rect(7,5,2,5,P.stone);rect(7,4,2,1,P.stoneLight);p(7,2,P.waterLight);p(8,2,P.waterLight);p(6,3,P.water);p(9,3,P.water);break;
      case 'glass':rect(3,3,10,10,P.water);rect(3,3,10,1,P.stoneDark);rect(3,12,10,1,P.stoneDark);rect(3,3,1,10,P.stoneDark);rect(12,3,1,10,P.stoneDark);for(var i=4;i<12;i++)p(i,i,P.white);break;
      case 'brick':ctx.fillStyle='#604030';ctx.fillRect(0,0,16*s,16*s);for(var ri=0;ri<4;ri++){var ys=ri*4;var off=(ri%2)*2;for(var bx=-off;bx<16;bx+=4){ctx.fillStyle='#a04030';ctx.fillRect((bx+1)*s,(ys+1)*s,2*s,2*s);}}break;
      case 'gold':rect(2,2,12,12,P.gold);rect(2,2,12,1,P.goldLight);for(var i=0;i<6;i++)p(3+Math.floor(i*1.6),4+i,P.white);for(var i=0;i<4;i++)p(8+i,8+i,P.goldDark);break;
      case 'moss':rect(2,2,12,12,P.stone);for(var y=3;y<13;y++)for(var x=3;x<13;x++){if(Math.random()<0.6)p(x,y,P.leaf);}p(4,5,P.leafLight);p(9,8,P.leafLight);p(6,11,P.leafDark);break;
      case 'castle':rect(2,5,12,8,P.stone);rect(2,5,12,1,P.stoneLight);rect(2,12,12,1,P.stoneDark);rect(2,3,2,2,P.stone);rect(6,3,2,2,P.stone);rect(10,3,2,2,P.stone);rect(12,3,2,2,P.stone);rect(7,8,2,5,P.woodDark);rect(4,7,2,2,P.water);rect(10,7,2,2,P.water);rect(7,1,1,3,P.woodDark);rect(8,1,3,2,P.ruby);break;
      case 'gatehouse':rect(2,5,12,8,P.stone);rect(2,5,12,1,P.stoneLight);rect(2,12,12,1,P.stoneDark);rect(2,3,2,2,P.stone);rect(12,3,2,2,P.stone);rect(6,8,4,5,P.black);rect(7,9,2,4,P.woodDark);p(7,5,P.ruby);p(8,5,P.rubyLight);break;
      case 'market':rect(2,7,12,6,P.wood);rect(2,7,12,1,P.woodDark);rect(2,12,12,1,P.woodDark);rect(2,4,12,3,P.gold);rect(3,3,10,1,P.goldDark);rect(2,3,1,4,P.woodDark);rect(13,3,1,4,P.woodDark);rect(5,8,3,3,P.gold);rect(8,8,3,3,P.ruby);break;
      case 'well':rect(6,3,4,3,P.stone);rect(6,3,4,1,P.stoneLight);rect(6,5,4,1,P.stoneDark);rect(5,6,6,4,P.stone);rect(5,6,6,1,P.stoneLight);rect(5,9,6,1,P.stoneDark);rect(6,7,4,2,P.water);p(7,7,P.waterLight);p(9,7,P.waterLight);rect(5,2,1,5,P.woodDark);rect(10,2,1,5,P.woodDark);rect(5,2,6,1,P.woodDark);break;
      case 'temple':rect(3,7,10,6,P.stone);rect(3,7,10,1,P.stoneLight);rect(3,12,10,1,P.stoneDark);rect(2,5,12,2,P.stoneLight);rect(3,4,10,1,P.stone);rect(7,2,2,3,P.gold);p(7,1,P.goldLight);p(8,1,P.goldLight);rect(7,9,2,4,P.black);rect(5,9,1,1,P.ruby);rect(10,9,1,1,P.ruby);break;
      case 'watchtower':rect(6,3,4,11,P.stone);rect(6,3,4,1,P.stoneLight);rect(6,13,4,1,P.stoneDark);rect(5,4,1,9,P.stone);rect(10,4,1,9,P.stone);p(5,3,P.stone);p(7,3,P.stone);p(9,3,P.stone);rect(7,7,2,2,P.black);rect(7,10,2,2,P.black);p(7,1,P.rubyLight);rect(6,1,4,2,P.ruby);break;
      case 'windmill':rect(7,8,2,5,P.woodDark);rect(7,8,1,5,P.wood);rect(4,4,8,4,P.planks||P.wood);rect(4,4,8,1,P.woodDark);ctx.fillStyle=P.stoneLight;ctx.beginPath();ctx.arc(8,5,2*s,0,Math.PI*2);ctx.fill();ctx.fillStyle=P.stoneDark;ctx.beginPath();ctx.arc(8,5,1*s,0,Math.PI*2);ctx.fill();// blades
        rect(7,1,2,4,P.white);rect(7,6,2,4,P.white);rect(3,4,4,2,P.white);rect(9,4,4,2,P.white);break;
      case 'chapel':rect(3,7,10,6,P.stone);rect(3,7,10,1,P.stoneLight);rect(3,12,10,1,P.stoneDark);rect(2,5,12,2,P.gold);rect(7,2,2,4,P.gold);p(7,1,P.goldLight);p(8,1,P.goldLight);rect(7,9,2,4,P.woodDark);rect(5,9,1,1,P.water);rect(10,9,1,1,P.water);break;
      case 'inn':rect(2,7,12,6,P.wood);rect(2,7,12,1,P.woodDark);rect(2,12,12,1,P.woodDark);rect(2,4,12,3,P.ruby);rect(3,3,10,1,P.ruby);rect(7,1,1,3,P.woodDark);rect(8,1,3,2,P.gold);rect(5,9,2,3,P.woodDark);rect(9,9,2,2,P.waterLight);rect(7,9,2,2,P.gold);break;
      default:rect(0,0,16,16,P.stoneDark);rect(1,1,14,14,P.stone);
    }
    return c.toDataURL();
  }
};
window.Sprites = Sprites;
