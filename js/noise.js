// noise junk. value noise + fbm. seeded.
function Noise(seed){
  this.seed=seed||42;
  this.p=new Uint8Array(512);
  var perm=[];
  for(var i=0;i<256;i++)perm[i]=i;
  var s=seed>>>0;
  var rng=function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  for(var i=255;i>0;i--){
    var j=Math.floor(rng()*(i+1));
    var t=perm[i];perm[i]=perm[j];perm[j]=t;
  }
  for(var i=0;i<512;i++)this.p[i]=perm[i&255];
}
Noise.prototype.value2=function(x,y){
  var xi=Math.floor(x)&255,yi=Math.floor(y)&255;
  var xf=x-Math.floor(x),yf=y-Math.floor(y);
  var fade=function(t){return t*t*(3-2*t);};
  var u=fade(xf),v=fade(yf);
  var aa=this.p[this.p[xi]+yi],ab=this.p[this.p[xi]+yi+1];
  var ba=this.p[this.p[xi+1]+yi],bb=this.p[this.p[xi+1]+yi+1];
  var r=function(h){return (h&255)/255;};
  var x1=r(aa)*(1-u)+r(ba)*u;
  var x2=r(ab)*(1-u)+r(bb)*u;
  return x1*(1-v)+x2*v;
};
Noise.prototype.fbm2=function(x,y,oct,persist,lac){
  oct=oct||4;persist=persist||0.5;lac=lac||2;
  var amp=1,freq=1,sum=0,max=0;
  for(var i=0;i<oct;i++){
    sum+=amp*this.value2(x*freq,y*freq);
    max+=amp;amp*=persist;freq*=lac;
  }
  return sum/max;
};
Noise.prototype.value3=function(x,y,z){
  var xi=Math.floor(x)&255,yi=Math.floor(y)&255,zi=Math.floor(z)&255;
  var xf=x-Math.floor(x),yf=y-Math.floor(y),zf=z-Math.floor(z);
  var fade=function(t){return t*t*(3-2*t);};
  var u=fade(xf),v=fade(yf),w=fade(zf);
  var r=function(h){return (h&255)/255;};
  var a=this.p[this.p[xi]+yi]+zi,b=this.p[this.p[xi]+yi+1]+zi;
  var c=this.p[this.p[xi+1]+yi]+zi,d=this.p[this.p[xi+1]+yi+1]+zi;
  var a1=this.p[this.p[xi]+yi]+zi+1,b1=this.p[this.p[xi]+yi+1]+zi+1;
  var c1=this.p[this.p[xi+1]+yi]+zi+1,d1=this.p[this.p[xi+1]+yi+1]+zi+1;
  var x1a=r(a)*(1-u)+r(c)*u,x2a=r(b)*(1-u)+r(d)*u;
  var y1=x1a*(1-v)+x2a*v;
  var x1b=r(a1)*(1-u)+r(c1)*u,x2b=r(b1)*(1-u)+r(d1)*u;
  var y2=x1b*(1-v)+x2b*v;
  return y1*(1-w)+y2*w;
};
window.Noise=Noise;
