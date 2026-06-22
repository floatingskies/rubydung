// audio. web audio synth. no samples, all generated.
var Audio = (function(){
  var ctx=null,mg=null,mug=null,sg=null;
  var musOn=true, sfxOn=true;
  var curTrack=null, timer=null, playing=false;

  function init(){
    if(ctx)return;
    try{
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      mg=ctx.createGain();mg.gain.value=0.6;mg.connect(ctx.destination);
      mug=ctx.createGain();mug.gain.value=0.35;mug.connect(mg);
      sg=ctx.createGain();sg.gain.value=0.5;sg.connect(mg);
    }catch(e){console.warn('no audio',e);}
  }

  function tone(f,d,type,vol,atk,rel){
    if(!ctx||!sfxOn)return;
    type=type||'square';vol=vol||0.3;atk=atk||0.005;rel=rel||0.05;
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.value=f;
    var n=ctx.currentTime;
    g.gain.setValueAtTime(0,n);
    g.gain.linearRampToValueAtTime(vol,n+atk);
    g.gain.linearRampToValueAtTime(vol*0.7,n+d*0.6);
    g.gain.linearRampToValueAtTime(0,n+d);
    o.connect(g);g.connect(sg);
    o.start(n);o.stop(n+d+rel);
  }

  function noise(d,vol,freq,ft){
    if(!ctx||!sfxOn)return;
    vol=vol||0.2;freq=freq||1000;ft=ft||'lowpass';
    var sz=ctx.sampleRate*d;
    var buf=ctx.createBuffer(1,sz,ctx.sampleRate);
    var dat=buf.getChannelData(0);
    for(var i=0;i<sz;i++)dat[i]=Math.random()*2-1;
    var src=ctx.createBufferSource();src.buffer=buf;
    var filt=ctx.createBiquadFilter();filt.type=ft;filt.frequency.value=freq;
    var g=ctx.createGain();
    var n=ctx.currentTime;
    g.gain.setValueAtTime(vol,n);
    g.gain.linearRampToValueAtTime(0,n+d);
    src.connect(filt);filt.connect(g);g.connect(sg);
    src.start(n);src.stop(n+d);
  }

  var sfx = {
    placeBlock:function(){tone(440,0.08,'square',0.15);setTimeout(function(){tone(660,0.06,'square',0.12);},30);noise(0.05,0.08,2000,'highpass');},
    removeBlock:function(){noise(0.15,0.2,800,'lowpass');tone(220,0.1,'sawtooth',0.1);},
    raise:function(){tone(330,0.1,'triangle',0.18);setTimeout(function(){tone(440,0.1,'triangle',0.16);},60);setTimeout(function(){tone(550,0.12,'triangle',0.14);},120);},
    lower:function(){tone(550,0.1,'triangle',0.16);setTimeout(function(){tone(440,0.1,'triangle',0.14);},60);setTimeout(function(){tone(330,0.12,'triangle',0.12);},120);},
    flatten:function(){noise(0.2,0.15,600,'lowpass');tone(440,0.15,'sine',0.1);},
    template:function(){tone(523,0.08,'square',0.15);setTimeout(function(){tone(659,0.08,'square',0.15);},60);setTimeout(function(){tone(784,0.12,'square',0.15);},120);setTimeout(function(){tone(1047,0.2,'square',0.18);},200);},
    click:function(){tone(880,0.03,'square',0.1);},
    heroSelect:function(){tone(660,0.05,'triangle',0.15);setTimeout(function(){tone(880,0.08,'triangle',0.12);},40);},
    heroMove:function(){tone(440,0.05,'sine',0.1);setTimeout(function(){tone(550,0.08,'sine',0.1);},50);},
    spawnHero:function(){var n=[261,329,392,523,659,784];for(var i=0;i<n.length;i++)setTimeout(function(f){return function(){tone(f,0.1,'triangle',0.15);};}(n[i]),i*50);},
    save:function(){tone(880,0.05,'square',0.1);setTimeout(function(){tone(1320,0.1,'square',0.12);},50);},
    load:function(){tone(1320,0.05,'square',0.1);setTimeout(function(){tone(880,0.1,'square',0.12);},50);},
    error:function(){tone(200,0.15,'sawtooth',0.2);setTimeout(function(){tone(150,0.15,'sawtooth',0.2);},100);},
    regen:function(){noise(0.3,0.15,400,'lowpass');setTimeout(function(){tone(220,0.2,'sine',0.15);},100);setTimeout(function(){tone(440,0.2,'sine',0.12);},300);},
    chop:function(){noise(0.05,0.25,1500,'bandpass');tone(180,0.1,'sawtooth',0.1);},
    mine:function(){noise(0.08,0.2,800,'bandpass');tone(120,0.1,'square',0.08);},
    gather:function(){tone(880,0.05,'triangle',0.1);setTimeout(function(){tone(1100,0.08,'triangle',0.1);},40);}
  };

  var N={
    C2:65.41,D2:73.42,E2:82.41,F2:87.31,G2:98.00,A2:110.00,B2:123.47,
    C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196.00,A3:220.00,B3:246.94,
    C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.00,A4:440.00,B4:493.88,
    C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880.00
  };
  var R=0;

  var TRACKS=[
    {name:'Rubylands Dawn',mood:'explore',bpm:90,
     melody:[{n:N.E4,d:1},{n:N.G4,d:1},{n:N.A4,d:1.5},{n:N.G4,d:0.5},{n:N.E4,d:1},{n:N.D4,d:1},{n:N.C4,d:2},{n:N.D4,d:1},{n:N.E4,d:1},{n:N.G4,d:1.5},{n:N.E4,d:0.5},{n:N.D4,d:2},{n:R,d:2}],
     bass:[{n:N.A2,d:2},{n:N.A2,d:2},{n:N.F2,d:2},{n:N.G2,d:2}],
     pad:[N.A3,N.C4,N.E4]},
    {name:'Builders Forge',mood:'build',bpm:110,
     melody:[{n:N.A4,d:0.5},{n:N.C5,d:0.5},{n:N.E5,d:0.5},{n:N.A4,d:0.5},{n:N.G4,d:1},{n:N.E4,d:1},{n:N.A4,d:0.5},{n:N.C5,d:0.5},{n:N.E5,d:0.5},{n:N.G4,d:0.5},{n:N.A4,d:2},{n:N.D4,d:0.5},{n:N.E4,d:0.5},{n:N.G4,d:0.5},{n:N.A4,d:0.5},{n:N.G4,d:1},{n:N.E4,d:1},{n:N.D4,d:2}],
     bass:[{n:N.A2,d:1},{n:N.A2,d:1},{n:N.E3,d:1},{n:N.A2,d:1},{n:N.A2,d:1},{n:N.A2,d:1},{n:N.E3,d:1},{n:N.D3,d:1},{n:N.D3,d:1},{n:N.D3,d:1},{n:N.A3,d:1},{n:N.D3,d:1},{n:N.D3,d:1},{n:N.A2,d:1},{n:N.A2,d:2}],
     pad:[N.A3,N.E4]},
    {name:'Nightfall in the Depths',mood:'night',bpm:70,
     melody:[{n:N.E4,d:2},{n:N.F4,d:1},{n:N.E4,d:1},{n:N.D4,d:2},{n:N.C4,d:2},{n:N.D4,d:1},{n:N.E4,d:1},{n:N.F4,d:2},{n:N.E4,d:2},{n:R,d:2}],
     bass:[{n:N.C2,d:4},{n:N.G2,d:4},{n:N.C2,d:4},{n:N.F2,d:4}],
     pad:[N.C3,N.E3,N.G3]},
    {name:'Mountain Winds',mood:'adventure',bpm:80,
     melody:[{n:N.G4,d:1},{n:N.A4,d:0.5},{n:N.G4,d:0.5},{n:N.E4,d:1},{n:N.G4,d:0.5},{n:N.A4,d:0.5},{n:N.C5,d:1},{n:N.A4,d:1},{n:N.G4,d:1},{n:N.E4,d:1},{n:N.D4,d:1},{n:N.E4,d:1},{n:N.G4,d:2},{n:R,d:2}],
     bass:[{n:N.C2,d:2},{n:N.G2,d:2},{n:N.C2,d:2},{n:N.F2,d:2},{n:N.G2,d:2},{n:N.C2,d:2},{n:N.G2,d:2},{n:N.G2,d:2}],
     pad:[N.C3,N.G3]},
    {name:'Goblin Siege',mood:'tension',bpm:130,
     melody:[{n:N.A4,d:0.5},{n:N.A4,d:0.5},{n:N.A4,d:0.5},{n:N.E4,d:0.5},{n:N.A4,d:0.5},{n:N.G4,d:0.5},{n:N.A4,d:1},{n:N.A4,d:0.5},{n:N.A4,d:0.5},{n:N.A4,d:0.5},{n:N.E4,d:0.5},{n:N.G4,d:0.5},{n:N.F4,d:0.5},{n:N.E4,d:1},{n:N.D4,d:0.5},{n:N.E4,d:0.5},{n:N.F4,d:0.5},{n:N.G4,d:0.5},{n:N.A4,d:2}],
     bass:[{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.A2,d:0.5},{n:N.E2,d:0.5},{n:N.E2,d:0.5},{n:N.E2,d:0.5},{n:N.E2,d:0.5},{n:N.F2,d:0.5},{n:N.F2,d:0.5},{n:N.E2,d:0.5},{n:N.D2,d:0.5},{n:N.A2,d:1},{n:N.A2,d:1}],
     pad:[N.A3]}
  ];

  function mnote(f,d,type,vol){
    if(!ctx||!musOn)return;
    type=type||'triangle';vol=vol||0.15;
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.value=f;
    var n=ctx.currentTime;
    g.gain.setValueAtTime(0,n);
    g.gain.linearRampToValueAtTime(vol,n+0.02);
    g.gain.linearRampToValueAtTime(vol*0.8,n+d*0.7);
    g.gain.linearRampToValueAtTime(0,n+d);
    o.connect(g);g.connect(mug);
    o.start(n);o.stop(n+d+0.05);
  }

  function mpad(freqs,d){
    if(!ctx||!musOn)return;
    for(var i=0;i<freqs.length;i++){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.value=freqs[i];
      var n=ctx.currentTime;
      g.gain.setValueAtTime(0,n);
      g.gain.linearRampToValueAtTime(0.06,n+0.5);
      g.gain.linearRampToValueAtTime(0.04,n+d-0.5);
      g.gain.linearRampToValueAtTime(0,n+d);
      o.connect(g);g.connect(mug);
      o.start(n);o.stop(n+d);
    }
  }

  function mdrum(beats){
    if(!ctx||!musOn||!beats)return;
    var kicks=[0,beats/2];
    for(var i=0;i<kicks.length;i++){
      var t=kicks[i];
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';
      var n=ctx.currentTime+t;
      o.frequency.setValueAtTime(120,n);
      o.frequency.exponentialRampToValueAtTime(40,n+0.1);
      g.gain.setValueAtTime(0.3,n);
      g.gain.exponentialRampToValueAtTime(0.01,n+0.15);
      o.connect(g);g.connect(mug);
      o.start(n);o.stop(n+0.2);
    }
  }

  function startMusic(){ if(!ctx||playing)return; playing=true; nextTrack(); }
  function stopMusic(){ playing=false; if(timer){clearTimeout(timer);timer=null;} }

  function nextTrack(){
    if(!playing)return;
    var cands;
    var h = window.__game ? window.__game.timeOfDay : 10;
    if(h>=19||h<5) cands=TRACKS.filter(function(t){return t.mood==='night'||t.mood==='adventure';});
    else cands=TRACKS.filter(function(t){return t.mood==='explore'||t.mood==='build'||t.mood==='adventure';});
    curTrack=cands[Math.floor(Math.random()*cands.length)];
    playTrack();
  }

  function playTrack(){
    if(!playing||!curTrack)return;
    var t=curTrack;
    var beat=60/t.bpm;
    var off=0;
    for(var i=0;i<t.melody.length;i++){
      var n=t.melody[i];
      var d=n.d*beat;
      if(n.n!==R){
        (function(nn,dd){setTimeout(function(){mnote(nn,dd*0.9,'triangle',0.12);},off*1000);})(n.n,d);
      }
      off+=d;
    }
    var boff=0;
    for(var i=0;i<t.bass.length;i++){
      var n=t.bass[i];
      var d=n.d*beat;
      if(n.n!==R){
        (function(nn,dd){setTimeout(function(){mnote(nn,dd*0.9,'sawtooth',0.08);},boff*1000);})(n.n,d);
      }
      boff+=d;
    }
    if(t.pad) mpad(t.pad,Math.max(off,boff));
    mdrum(Math.max(off,boff));
    var tot=Math.max(off,boff)+1.0;
    timer=setTimeout(function(){
      if(playing){
        if(Math.random()<0.5)nextTrack();
        else playTrack();
      }
    },tot*1000);
  }

  function setMusicEnabled(on){ musOn=on; if(on&&!playing)startMusic(); else if(!on)stopMusic(); }
  function setSfxEnabled(on){ sfxOn=on; }
  function getCurrentTrackName(){ return curTrack?curTrack.name:'None'; }
  function isMusicEnabled(){ return musOn; }
  function isSfxEnabled(){ return sfxOn; }

  return {
    init:init, sfx:sfx,
    startMusic:startMusic, stopMusic:stopMusic,
    setMusicEnabled:setMusicEnabled, setSfxEnabled:setSfxEnabled,
    getCurrentTrackName:getCurrentTrackName,
    isMusicEnabled:isMusicEnabled, isSfxEnabled:isSfxEnabled
  };
})();
window.Audio = Audio;
