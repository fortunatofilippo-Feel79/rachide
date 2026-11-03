/* ============================================================
   ANIMAZIONI SCHEMATICHE
   Solo dove l'errore è una GEOMETRIA visibile, non una sensazione.
   Le lunghezze dei segmenti restano costanti: dove serve, il
   ginocchio è calcolato dalla posizione dell'anca, non disegnato.
   ============================================================ */
function r1(n){ return Math.round(n*10)/10; }
function ln(x1,y1,x2,y2,o){ return '<line x1="'+r1(x1)+'" y1="'+r1(y1)+'" x2="'+r1(x2)+'" y2="'+r1(y2)+'" '+(o||"")+'/>'; }
function pl(p,o){ return '<polyline points="'+p.map(q=>r1(q[0])+","+r1(q[1])).join(" ")+'" '+(o||"")+'/>'; }
function ci(x,y,r,o){ return '<circle cx="'+r1(x)+'" cy="'+r1(y)+'" r="'+r+'" '+(o||"")+'/>'; }
function rc(x,y,w,h,o){ return '<rect x="'+r1(x)+'" y="'+r1(y)+'" width="'+r1(w)+'" height="'+r1(h)+'" rx="2" '+(o||"")+'/>'; }
function pa(d,o){ return '<path d="'+d+'" '+(o||"")+'/>'; }
var DBF='fill="currentColor" stroke="none"', HEADF='fill="var(--bg)"';
var GH='stroke="var(--dim)" stroke-width="1" stroke-dasharray="3 4" fill="none"';

/* ginocchio da caviglia e anca, lunghezze fisse */
function knee(ax,ay,hx,hy,l1,l2){
  var dx=hx-ax, dy=hy-ay, dd=Math.sqrt(dx*dx+dy*dy), ux=dx/dd, uy=dy/dd;
  var d=Math.min(dd, l1+l2-0.5);
  var a=(l1*l1-l2*l2+d*d)/(2*d), h=Math.sqrt(Math.max(0,l1*l1-a*a));
  return {x: ax+a*ux + h*uy, y: ay+a*uy - h*ux};
}
function db(x,y){ return rc(x-7.5,y-3,15,6,DBF); }

/* 1. Split-stance RDL — hinge contro squat */
function aHinge(ox,t,w){
  var ay=152, S=44, T=46, TO=54, AR=30, hx,hy,th;
  if(!w){ hx=ox+4+34*t; hy=ay-88+12*t; th=(8+58*t)*Math.PI/180; }
  else  { hx=ox+4+4*t;  hy=ay-88+40*t; th=(8+14*t)*Math.PI/180; }
  var k=knee(ox,ay,hx,hy,S,T);
  var sx=hx-Math.sin(th)*TO, sy=hy-Math.cos(th)*TO;
  return ln(hx,hy,ox+44,ay,'stroke-width="2.4" opacity=".5"')+
    pl([[ox,ay],[k.x,k.y],[hx,hy]])+ ln(hx,hy,sx,sy)+ ln(sx,sy,sx,sy+AR,'stroke-width="2.6"')+
    ci(sx-Math.sin(th)*13, sy-Math.cos(th)*13, 9, HEADF)+ db(sx,sy+AR);
}
/* 2. Box Squat — anca indietro contro ginocchio avanti e tallone che si alza */
function aBox(ox,t,w){
  var ay=152, S=44, T=46, TO=52, hx,hy,th,heel=0;
  if(!w){ hx=ox+8+30*t; hy=ay-88+40*t; th=(10+32*t)*Math.PI/180; }
  else  { hx=ox+6+2*t;  hy=ay-88+40*t; th=(10+10*t)*Math.PI/180; heel=6*t; }
  var k=knee(ox,ay-heel,hx,hy,S,T);
  var sx=hx-Math.sin(th)*TO, sy=hy-Math.cos(th)*TO;
  return rc(ox+24,112,40,40,'fill="var(--surf2)" stroke="var(--dim)" stroke-width="1.5"')+
    ln(ox-18,ay,ox+8,ay-heel,'stroke-width="2.6"')+
    pl([[ox,ay-heel],[k.x,k.y],[hx,hy]])+ ln(hx,hy,sx,sy)+
    ln(sx,sy,sx+6,sy+28,'stroke-width="2.4"')+
    ci(sx-Math.sin(th)*13, sy-Math.cos(th)*13, 9, HEADF)+ db(sx+6,sy+28);
}
/* 3. Floor Press — gomiti a 45° contro 90°, vista dall'alto */
function aPress(ox,t,w){
  var cy=64, UA=30, FA=26, ang=(w? 18+72*t : 18+27*t)*Math.PI/180, o="";
  o+=ln(ox,cy+6,ox,cy+78,'stroke-width="9" opacity=".8" stroke-linecap="butt"');
  o+=ci(ox,cy-6,10,HEADF);
  o+=ln(ox,cy+22,ox,cy+96,GH);
  [-1,1].forEach(function(s){
    var shx=ox+s*8, shy=cy+18;
    var ex=shx+s*Math.sin(ang)*UA, ey=shy+Math.cos(ang)*UA;
    var hx=ex-s*0.24*FA, hy=ey-0.97*FA;
    o+=ln(shx,shy,ex,ey)+ln(ex,ey,hx,hy,'stroke-width="3"')+db(hx,hy);
    o+=ci(ex,ey,3.2,'fill="currentColor" stroke="none"');
  });
  return o;
}
/* colonna supina: piatta a terra oppure inarcata */
function spine(px,py,sx,sy,lift){
  var mx=(px+sx)/2, my=(py+sy)/2-lift*2;
  return pa("M"+r1(px)+","+r1(py)+" Q"+r1(mx)+","+r1(my)+" "+r1(sx)+","+r1(sy));
}
/* 4. Pullover — costole basse contro lombare che si stacca */
function aPullover(ox,t,w){
  var fl=152, lift=w? 13*t : 0;
  var px=ox+26, py=fl-11, sx=ox-14, sy=fl-11;
  var ph=(6+96*t)*Math.PI/180, ah=38;
  var hx=sx-Math.sin(ph)*ah, hy=sy-Math.cos(ph)*ah;
  var o=ln(ox-30,fl,ox+66,fl,'stroke="var(--line)" stroke-width="1.5"')+
    spine(px,py,sx,sy,lift)+ pl([[px,py],[ox+50,fl-34],[ox+62,fl]])+
    ln(sx,sy,hx,hy)+ db(hx,hy)+ ci(sx-15,sy-5,9,HEADF);
  if(lift>3) o+=pa("M"+r1(ox+2)+","+r1(fl-3)+" q11,-"+r1(lift+3)+" 22,0",
    'stroke="var(--alert)" stroke-width="1.6" stroke-dasharray="2 3" fill="none"');
  return o;
}
/* 5. Dead bug — lombare a terra contro lombare che si alza */
function aDead(ox,t,w){
  var fl=152, lift=w? 14*t : 0;
  var px=ox+22, py=fl-11, sx=ox-18, sy=fl-11;
  var kx=px-6+10*t, ky=py-40+16*t, fx=kx-14-20*t, fy=ky+34+4*t;
  var ph=(4+92*t)*Math.PI/180, ah=34;
  var hx=sx-Math.sin(ph)*ah, hy=sy-Math.cos(ph)*ah;
  var o=ln(ox-34,fl,ox+56,fl,'stroke="var(--line)" stroke-width="1.5"')+
    spine(px,py,sx,sy,lift)+
    ln(px,py,px+15,py-37,'stroke-width="2.4" opacity=".45"')+
    pl([[px,py],[kx,ky],[fx,fy]])+
    ln(sx,sy,hx,hy)+ ci(sx-15,sy-4,9,HEADF);
  if(lift>3) o+=pa("M"+r1(ox-2)+","+r1(fl-3)+" q11,-"+r1(lift+3)+" 22,0",
    'stroke="var(--alert)" stroke-width="1.6" stroke-dasharray="2 3" fill="none"');
  return o;
}
/* 6. Hip thrust — sale il bacino contro si inarca la lombare */
function aThrust(ox,t,w){
  var fl=152, shx=ox-30, shy=118, kx=ox+30, ky=116, fx=ox+36;
  var px=ox+2, py = w ? fl-10-16*t : fl-10-30*t;
  var arch = w ? 13*t : 0;
  var mx=(shx+px)/2, my=(shy+py)/2-arch;
  return ln(ox-6,fl,ox+46,fl,'stroke="var(--line)" stroke-width="1.5"')+
    rc(ox-58,118,30,34,'fill="var(--surf2)" stroke="var(--dim)" stroke-width="1.5"')+
    ln(shx,shy,kx,ky,GH)+
    pa("M"+r1(shx)+","+r1(shy)+" Q"+r1(mx)+","+r1(my)+" "+r1(px)+","+r1(py))+
    pl([[px,py],[kx,ky],[fx,fl]])+
    ci(shx-13,shy-4,9,HEADF);
}
/* 7. Side plank — linea retta contro bacino che cala */
function aPlank(ox,t,w){
  var elx=ox-36, ely=150, shx=ox-32, shy=112, ax=ox+54, ay=146;
  var sag = w ? 20*t : 0;
  var hx=(shx+ax)/2+4, hy=(shy+ay)/2+sag;
  return ln(ox-50,152,ox+62,152,'stroke="var(--line)" stroke-width="1.5"')+
    ln(shx,shy,ax,ay,GH)+
    ln(elx,ely,shx,shy,'stroke-width="3"')+ ln(elx-13,ely,elx+6,ely,'stroke-width="3"')+
    pl([[shx,shy],[hx,hy],[ax,ay]])+
    ci(shx-11,shy-7,9,HEADF);
}
/* 8. Bird-dog — piede all'altezza dell'anca contro piede più alto */
function aBird(ox,t,w){
  var sh=[ox-34,114], hip=[ox+26,114];
  var sag = w ? 9*t : 0, lg = w ? -17*t : 0;
  var mx=(sh[0]+hip[0])/2, my=114+sag;
  return ln(ox-46,152,ox+46,152,'stroke="var(--line)" stroke-width="1.5"')+
    ln(ox+20,114,ox+72,114,GH)+
    pa("M"+r1(sh[0])+","+r1(sh[1])+" Q"+r1(mx)+","+r1(my)+" "+r1(hip[0])+","+r1(hip[1]))+
    ln(sh[0],sh[1],ox-34,152)+ ln(hip[0],hip[1],ox+26,152)+
    ln(ox+26,152,ox+40,152,'stroke-width="2.4" opacity=".5"')+
    ln(sh[0],sh[1],sh[0]-32-6*t,sh[1]-2)+
    ln(hip[0],hip[1],hip[0]+42,hip[1]+lg)+
    ci(sh[0]-14,sh[1]+6,8.5,HEADF);
}

var ANIM = {
 "Split-stance RDL":{f:aHinge, a:"Hinge · corretto", b:"Squat · sbagliato",
   a2:"il bacino va indietro", b2:"il ginocchio va avanti"},
 "Box Squat":{f:aBox, a:"Corretto", b:"Sbagliato",
   a2:"anca indietro, tallone a terra", b2:"ginocchio avanti, tallone che si alza"},
 "Floor Press manubri":{f:aPress, a:"Gomiti a 45°", b:"Gomiti a 90°",
   a2:"vista dall'alto · protegge la spalla", b2:"lavora la spalla al posto del petto"},
 "Floor Press (volume)":{f:aPress, a:"Gomiti a 45°", b:"Gomiti a 90°",
   a2:"vista dall'alto · protegge la spalla", b2:"lavora la spalla al posto del petto"},
 "Pullover manubrio":{f:aPullover, a:"Costole basse", b:"Lombare che si stacca",
   a2:"espira portando il peso dietro", b2:"l'arco toglie il lavoro al dorso"},
 "Dead bug":{f:aDead, a:"Lombare a terra", b:"Lombare che si alza",
   a2:"è l'unica cosa che conta", b2:"qui l'esercizio ha smesso di funzionare"},
 "Hip thrust con banda":{f:aThrust, a:"Sale il bacino", b:"Si inarca la lombare",
   a2:"linea retta spalle-ginocchia", b2:"da protettivo diventa a rischio"},
 "Side plank":{f:aPlank, a:"Linea retta", b:"Bacino che cala",
   a2:"40s perfetti valgono più di 60", b2:"l'errore che rende inutile la tenuta"},
 "Bird-dog con pausa 3s":{f:aBird, a:"Piede all'altezza dell'anca", b:"Piede più alto",
   a2:"schiena neutra, bacino fermo", b2:"il lavoro passa alla lombare"}
};

var animRAF=null, animT0=0, animKey=null, animLast=0;
/* ---------- grafico della pendenza del peso ----------
   Punti pieni = pesate che entrano nel calcolo. Cerchi vuoti = rientri
   da trasferta, esclusi. La fascia verde e' il corridoio 150-250 g/sett
   ancorato alla prima pesata utile: se la retta ci sta dentro, la spinta
   e' quella giusta. */
function pesoChart(sl){
  var W=320,H=112,L=34,R=6,T=10,B=20;
  var win=sl.win||28, now=new Date().setHours(23,59,59,999);
  var pts=(sl.all||[]).filter(function(p){ return (now-p.t)/86400000<=win; });
  if(pts.length<2) return "";
  var t0=pts[0].t, t1=pts[pts.length-1].t;
  if(t1<=t0) return "";
  var vals=pts.map(function(p){ return p.kg; });
  var fit=sl.fit;
  if(fit){ [t0,t1].forEach(function(t){ vals.push(fit.q+fit.m*(t-fit.t0)/86400000); }); }
  var lo=Math.min.apply(null,vals), hi=Math.max.apply(null,vals), sp=hi-lo;
  if(sp<0.6){ var c=(hi+lo)/2; lo=c-0.35; hi=c+0.35; sp=0.7; }
  else { lo-=sp*0.18; hi+=sp*0.18; sp=hi-lo; }
  var X=function(t){ return L+(t-t0)/(t1-t0)*(W-L-R); };
  var Y=function(v){ return T+(hi-v)/sp*(H-T-B); };
  var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img">';
  if(fit){
    var used=sl.sel||[], a0=used.length?used[0].t:t0;
    var base=fit.q+fit.m*(a0-fit.t0)/86400000;
    var dd=(t1-a0)/86400000;
    if(dd>0){
      var loK=PESO_TGT[0]/1000/7, hiK=PESO_TGT[1]/1000/7;
      g+='<polygon class="zone" points="'+
         [[X(a0),Y(base)],[X(t1),Y(base+hiK*dd)],[X(t1),Y(base+loK*dd)]]
           .map(function(q){ return r1(q[0])+","+r1(q[1]); }).join(" ")+'"/>';
    }
  }
  g+='<text class="lab" x="2" y="'+r1(Y(hi)+4)+'">'+hi.toFixed(1)+'</text>';
  g+='<text class="lab" x="2" y="'+r1(Y(lo)+4)+'">'+lo.toFixed(1)+'</text>';
  if(fit){
    var col = sl.stato==="dentro" ? "var(--ok)" : "var(--amb)";
    g+=ln(X(t0),Y(fit.q+fit.m*(t0-fit.t0)/86400000),X(t1),Y(fit.q+fit.m*(t1-fit.t0)/86400000),
          'class="fit" stroke="'+col+'"');
  }
  pts.forEach(function(pt){
    g+=ci(X(pt.t),Y(pt.kg),3.2,'class="pt'+(pt.skip?" out":"")+'"');
  });
  g+='<text class="lab" x="'+L+'" y="'+(H-5)+'">'+pts[0].date.slice(0,5)+'</text>';
  g+='<text class="lab" x="'+(W-R)+'" y="'+(H-5)+'" text-anchor="end">'+pts[pts.length-1].date.slice(0,5)+'</text>';
  return g+'</svg>';
}
function animBlock(n){
  if(!ANIM[n]) return "";
  return '<div class="card" id="animBox" style="margin-top:14px;padding:10px 10px 4px"></div>';
}
function animDraw(n,t){
  var k=ANIM[n], box=document.getElementById("animBox"); if(!box||!k) return;
  box.innerHTML='<svg viewBox="0 0 340 200" style="width:100%;height:auto;display:block">'+
    '<line x1="170" y1="14" x2="170" y2="166" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 6"/>'+
    '<g stroke="var(--glow)" color="var(--glow)" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round">'+k.f(88,t,false)+'</g>'+
    '<g stroke="var(--alert)" color="var(--alert)" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round">'+k.f(252,t,true)+'</g>'+
    '<text x="88" y="180" fill="var(--glow)" font-size="11" font-weight="700" text-anchor="middle">'+esc(k.a)+'</text>'+
    '<text x="88" y="194" fill="var(--mut)" font-size="9.5" text-anchor="middle">'+esc(k.a2)+'</text>'+
    '<text x="252" y="180" fill="var(--alert)" font-size="11" font-weight="700" text-anchor="middle">'+esc(k.b)+'</text>'+
    '<text x="252" y="194" fill="var(--mut)" font-size="9.5" text-anchor="middle">'+esc(k.b2)+'</text>'+
    '</svg>';
}
function startAnim(n){
  stopAnim(); animKey=n;
  var red = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(red){ animDraw(n,0.9); return; }
  animT0=Date.now(); animLast=0;
  (function loop(){
    var now=Date.now();
    if(now-animLast>42){ animLast=now;
      animDraw(animKey,(1-Math.cos(((now-animT0)%3400)/3400*2*Math.PI))/2); }
    animRAF=requestAnimationFrame(loop);
  })();
}
function stopAnim(){ if(animRAF){ cancelAnimationFrame(animRAF); animRAF=null; } animKey=null; }
