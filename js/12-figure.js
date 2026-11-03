/* ============================================================
   FIGURE — come si fa ogni esercizio, disegnato e animato
   Un manichino visto di lato (o di fronte, dove il movimento e'
   laterale). Ogni posa dice dove stanno bacino, busto, mani e
   piedi; gomiti e ginocchia li calcola la cinematica inversa,
   cosi' braccia e gambe non cambiano mai lunghezza.
   Angoli in gradi: 0 = giu', 90 = avanti (destra), 180 = su,
   -90 = indietro. Il manichino guarda a destra.
   ============================================================ */
var FL={tr:36, nk:5, hd:7.5, ua:19, fa:18, th:25, sh:24, ft:9};
var FG_ANK=133, FG_PAV=136;
var FG_BANDA={gialla:"#E8C547", blu:"#4F95DE", verde:"#5DB36A", nera:"#A3ADB8", rossa:"#E26464", asciugamano:"#D8CFC0"};

function fgDir(a){ var r=a*Math.PI/180; return [Math.sin(r), Math.cos(r)]; }
function fgAng(v){ return Math.atan2(v[0], v[1])*180/Math.PI; }
function fgSom(a,b,k){ k=(k==null)?1:k; return [a[0]+b[0]*k, a[1]+b[1]*k]; }
function fgM(a,b){ var r={}, k; for(k in a) r[k]=a[k]; for(k in (b||{})) r[k]=b[k]; return r; }
function fgR(n){ return Math.round(n*10)/10; }

/* due segmenti dalla base al bersaglio: giuntura in mezzo, piegata dal lato s */
function fgIK(b, t, l1, l2, s){
  var dx=t[0]-b[0], dy=t[1]-b[1], d=Math.sqrt(dx*dx+dy*dy)||0.001;
  var dd=Math.max(Math.abs(l1-l2)+0.01, Math.min(d, l1+l2-0.01));
  var ux=dx/d, uy=dy/d, a=(l1*l1-l2*l2+dd*dd)/(2*dd), h=Math.sqrt(Math.max(0, l1*l1-a*a));
  return { j:[b[0]+ux*a-uy*h*s, b[1]+uy*a+ux*h*s], e:[b[0]+ux*dd, b[1]+uy*dd] };
}

/* corpo dritto dalla caviglia alla spalla (plank, push-up): bacino e busto */
function fgLinea(ank, shY, verso){
  verso=verso||1;
  var L=FL.th+FL.sh+FL.tr-1, s=Math.max(-1, Math.min(1, (ank[1]-shY)/L)), c=Math.sqrt(1-s*s);
  var v=[c*verso, -s], g=FL.th+FL.sh-0.6;
  return {hip:[ank[0]+v[0]*g, ank[1]+v[1]*g], t:fgAng(v)};
}
/* corpo inclinato all'indietro di b gradi, piedi fermi (rematore al telaio) */
function fgInclinato(ank, b){
  var v=fgDir(180+b), g=FL.th+FL.sh-0.6;
  return {hip:[ank[0]+v[0]*g, ank[1]+v[1]*g], t:180+b};
}

/* una posa diventa punti sul piano */
function fgPosa(p){
  var t=(p.t==null)?180:p.t, u=fgDir(t), sh=fgSom(p.hip, u, FL.tr*(p.tl||1));
  var perp=[-u[1], u[0]], back=[u[1], -u[0]];
  var sw=p.sw||0, hw=p.hw||0, abs=p.abs||"", rf=p.rf||"";
  var S={n:fgSom(sh, perp, sw), f:fgSom(sh, perp, -sw)}, Hp={n:fgSom(p.hip, perp, hw), f:fgSom(p.hip, perp, -hw)};
  var out={hip:p.hip, sh:sh, t:t, u:u, back:back, perp:perp, sp:p.sp||0, br:p.br||0, tw:p.tw||9.5, front:!!(sw||p.vf),
    hc:fgSom(sh, fgDir(t+(p.nk||0)), (FL.nk+FL.hd*(p.hs||1))*(p.hk==null?1:p.hk)), braccia:{}, gambe:{}};
  ["n","f"].forEach(function(lato){
    var hv=p["h"+lato]||[0,FL.ua+FL.fa-1], tg=abs.indexOf(lato)>=0 ? hv : fgSom(S[lato], hv);
    var eb=(p.eb&&p.eb[lato]!=null)? p.eb[lato] : 1;
    var fk=p["a"+lato];
    if(fk){   /* angoli di braccio e avambraccio: il gomito resta fermo, l'avambraccio ruota ad arco */
      var e1=fgSom(S[lato], fgDir(fk[0]), FL.ua);
      out.braccia[lato]={s:S[lato], e:e1, h:fgSom(e1, fgDir(fk[1]), FL.fa)};
    } else if((p.av||"").indexOf(lato)>=0){   /* avambraccio verso chi guarda: si vede solo il gomito a terra */
      var dd=[tg[0]-S[lato][0], tg[1]-S[lato][1]], LL=Math.sqrt(dd[0]*dd[0]+dd[1]*dd[1])||1;
      var ee=[S[lato][0]+dd[0]/LL*FL.ua, S[lato][1]+dd[1]/LL*FL.ua];
      out.braccia[lato]={s:S[lato], e:ee, h:ee, av:true};
    } else {
      var a=fgIK(S[lato], tg, FL.ua, FL.fa, eb);
      out.braccia[lato]={s:S[lato], e:a.j, h:a.e};
    }
    var fv=p["f"+lato]||[p.hip[0], FG_ANK], ft=rf.indexOf(lato)>=0 ? fgSom(Hp[lato], fv) : fv;
    var kb=(p.kb&&p.kb[lato]!=null)? p.kb[lato] : -1;
    var g=fgIK(Hp[lato], ft, FL.th, FL.sh, kb);
    var ta=p["t"+lato]; if(ta==null) ta=90;
    out.gambe[lato]={h:Hp[lato], k:g.j, a:g.e, toe:fgSom(g.e, fgDir(ta), FL.ft)};
  });
  return out;
}

/* bersagli di mani e piedi in coordinate assolute, per mischiare pose relative e assolute */
function fgAssoluto(p, chiave){
  var P=fgPosa(p), lato=chiave.charAt(1);
  return chiave.charAt(0)==="h" ? P.braccia[lato].h : P.gambe[lato].a;
}
function fgLerp(p0, p1, x){
  var r={}, k;
  for(k in p0) r[k]=p0[k];
  for(k in p1){
    var a=p0[k], b=p1[k];
    if(typeof b==="number" && typeof a==="number") r[k]=a+(b-a)*x;
    else if(Array.isArray(b) && Array.isArray(a) && typeof b[0]==="number") r[k]=[a[0]+(b[0]-a[0])*x, a[1]+(b[1]-a[1])*x];
    else if(a===undefined) r[k]=b;
  }
  /* mani e piedi: se una posa li vuole relativi e l'altra assoluti, si passa per l'assoluto */
  var absR="", rfR="";
  ["n","f"].forEach(function(l){
    var a0=(p0.abs||"").indexOf(l)>=0, a1=(p1.abs||"").indexOf(l)>=0;
    if(a0!==a1){ var A=fgAssoluto(p0,"h"+l), B=fgAssoluto(p1,"h"+l); r["h"+l]=[A[0]+(B[0]-A[0])*x, A[1]+(B[1]-A[1])*x]; absR+=l; }
    else if(a0) absR+=l;
    var f0=(p0.rf||"").indexOf(l)>=0, f1=(p1.rf||"").indexOf(l)>=0;
    if(f0!==f1){ var C=fgAssoluto(p0,"f"+l), D=fgAssoluto(p1,"f"+l); r["f"+l]=[C[0]+(D[0]-C[0])*x, C[1]+(D[1]-C[1])*x]; }
    else if(f0) rfR+=l;
  });
  r.abs=absR; r.rf=rfR;
  return r;
}
function fgEase(x){ return (1-Math.cos(Math.PI*x))/2; }

/* ---------- tempo: dove siamo nel ciclo ---------- */
function fgDurata(def){ return def.k.reduce(function(s,k){ return s+(k.h||0)+(k.d||1); }, 0); }
function fgAl(def, sec){
  var tot=fgDurata(def), t=((sec%tot)+tot)%tot, n=def.k.length;
  for(var i=0;i<n;i++){
    var k=def.k[i], h=k.h||0, d=k.d||1;
    if(t<h) return {p:k.p, c:k.c||"", i:i, x:0, fase:"h", el:t, dur:h};
    t-=h;
    if(t<d){ var x=fgEase(t/d); return {p:fgLerp(k.p, def.k[(i+1)%n].p, x), c:k.c||"", i:i, x:x, fase:"d", el:t, dur:d}; }
    t-=d;
  }
  return {p:def.k[0].p, c:def.k[0].c||"", i:0, x:0};
}

/* ---------- disegno ---------- */
function fgPunto(P, ref){
  if(Array.isArray(ref)) return ref;
  switch(ref){
    case "hn": return P.braccia.n.h; case "hf": return P.braccia.f.h;
    case "en": return P.braccia.n.e; case "ef": return P.braccia.f.e;
    case "an": return P.gambe.n.a; case "af": return P.gambe.f.a;
    case "tn": return P.gambe.n.toe; case "tf": return P.gambe.f.toe;
    case "kn": return P.gambe.n.k; case "kf": return P.gambe.f.k;
    case "sh": return P.sh; case "hip": return P.hip; case "head": return P.hc;
    case "back": return fgSom(fgSpina(P,0.55).q, fgSpina(P,0.55).nf, -7);
    case "lomb": return fgSom(fgSpina(P,0.15).q, fgSpina(P,0.15).nf, -7);
    case "chest": return fgSom(fgSpina(P,0.8).q, fgSpina(P,0.8).nf, 6);
    case "belly": return fgSom(fgSpina(P,0.3).q, fgSpina(P,0.3).nf, 6);
    case "bk": return fgSom(P.sh, P.back, 6);
    case "bkh": return fgSom(fgSom(P.hip, P.u, 8), P.back, 7);
  }
  return P.hip;
}
function fgL(a,b,cl,w){ return '<line x1="'+fgR(a[0])+'" y1="'+fgR(a[1])+'" x2="'+fgR(b[0])+'" y2="'+fgR(b[1])+'" class="'+cl+'"'+(w?' stroke-width="'+w+'"':'')+'/>'; }
function fgProp(o){
  var c=' class="fg-prop"';
  if(o.k==="box") return '<rect x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+(o.h||(FG_PAV-o.y))+'" rx="'+(o.r==null?3:o.r)+'"'+c+'/>';
  if(o.k==="sedia") return '<rect x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+(FG_PAV-o.y)+'" rx="3"'+c+'/>'+
    (o.schienale? '<rect x="'+(o.x-5)+'" y="'+(o.y-38)+'" width="6" height="'+(FG_PAV-o.y+38)+'" rx="2"'+c+'/>' : '');
  if(o.k==="muro") return '<rect x="'+o.x+'" y="6" width="10" height="'+(FG_PAV-6)+'"'+c+'/>';
  if(o.k==="porta") return '<rect x="'+o.x+'" y="10" width="7" height="'+(FG_PAV-10)+'" rx="2"'+c+'/>';
  if(o.k==="tappetino") return '<rect x="'+o.x+'" y="'+(FG_PAV-2)+'" width="'+o.w+'" height="3" rx="1.5" class="fg-mat"/>';
  return "";
}
function fgManubrio(p, front){
  if(front) return '<g class="fg-db"><rect x="'+fgR(p[0]-7)+'" y="'+fgR(p[1]-1.3)+'" width="14" height="2.6" rx="1"/>'+
    '<rect x="'+fgR(p[0]-8.5)+'" y="'+fgR(p[1]-4.5)+'" width="4" height="9" rx="1.5"/><rect x="'+fgR(p[0]+4.5)+'" y="'+fgR(p[1]-4.5)+'" width="4" height="9" rx="1.5"/></g>';
  return '<circle cx="'+fgR(p[0])+'" cy="'+fgR(p[1])+'" r="5.6" class="fg-db"/><circle cx="'+fgR(p[0])+'" cy="'+fgR(p[1])+'" r="1.8" class="fg-dbc"/>';
}
/* ---------- disegno con volumi ----------
   Arti come capsule affusolate, busto che segue la curva della colonna
   (petto davanti, glutei e scapole dietro), testa col naso: si capisce
   da che parte guarda. Il lato lontano e' piu' scuro, non trasparente. */
function fgPt(q){ return fgR(q[0])+","+fgR(q[1]); }
function fgCaps(a,b,r1,r2){
  var dx=b[0]-a[0], dy=b[1]-a[1], L=Math.sqrt(dx*dx+dy*dy)||0.001, nx=-dy/L, ny=dx/L;
  var p1=[a[0]+nx*r1,a[1]+ny*r1], p2=[b[0]+nx*r2,b[1]+ny*r2], p3=[b[0]-nx*r2,b[1]-ny*r2], p4=[a[0]-nx*r1,a[1]-ny*r1];
  return 'M'+fgPt(p1)+'L'+fgPt(p2)+'A'+fgR(r2)+' '+fgR(r2)+' 0 0 0 '+fgPt(p3)+'L'+fgPt(p4)+'A'+fgR(r1)+' '+fgR(r1)+' 0 0 0 '+fgPt(p1)+'Z';
}
function fgPath(d, cl){ return '<path d="'+d+'" class="'+cl+'"/>'; }
/* colori: maglia, pelle, pantaloni, scarpe. Cosi' le braccia si leggono anche davanti al busto. */
var PAL_N={sh:"fg-shirt", sk:"fg-skin", pt:"fg-pants", so:"fg-shoe"};
var PAL_F={sh:"fg-shirt fg-far", sk:"fg-skin fg-far", pt:"fg-pants fg-far", so:"fg-shoe fg-far"};
var PAL_OK={sh:"fg-okg", sk:"fg-okg", pt:"fg-okg", so:"fg-okg"};
function fgBraccio(A, c){
  var cl=c.sk, o=fgPath(fgCaps(A.s, A.e, 3.7, 2.9), (c.sh===PAL_OK.sh)? cl : c.sh.replace("fg-shirt","fg-shirt")+" fg-sleeve");
  if(A.av) return o+'<ellipse cx="'+fgR(A.e[0])+'" cy="'+fgR(A.e[1]+0.8)+'" rx="7" ry="2.9" class="'+cl+'"/>';
  return o+fgPath(fgCaps(A.e, A.h, 2.9, 2.2), cl)+'<circle cx="'+fgR(A.h[0])+'" cy="'+fgR(A.h[1])+'" r="3.1" class="'+cl+'"/>';
}
function fgGamba(G, c){
  return fgPath(fgCaps(G.h, G.k, 5.4, 3.8), c.pt)+fgPath(fgCaps(G.k, G.a, 3.8, 2.5), c.pt)+fgPath(fgCaps(G.a, G.toe, 2.7, 1.7), c.so);
}
/* punto della colonna (curva quadratica) a frazione s, con la normale verso la pancia */
function fgSpina(P, s){
  var mid=[(P.hip[0]+P.sh[0])/2, (P.hip[1]+P.sh[1])/2], C=fgSom(mid, P.back, P.sp), A=P.hip, B=P.sh;
  var q=[(1-s)*(1-s)*A[0]+2*(1-s)*s*C[0]+s*s*B[0], (1-s)*(1-s)*A[1]+2*(1-s)*s*C[1]+s*s*B[1]];
  var tx=2*(1-s)*(C[0]-A[0])+2*s*(B[0]-C[0]), ty=2*(1-s)*(C[1]-A[1])+2*s*(B[1]-C[1]), L=Math.sqrt(tx*tx+ty*ty)||1;
  return {q:q, nf:[-ty/L, tx/L], ang:Math.atan2(ty, tx)*180/Math.PI};
}
var FG_TF=[[0,5.4,6.8],[0.3,4.8,5.4],[0.55,5.3,5.1],[0.8,6.6,5.8],[1,5.3,5.3]];   /* [s, davanti, dietro] */
function fgBusto(P){
  var dav=[], die=[];
  FG_TF.forEach(function(r){ var k=fgSpina(P, r[0]); dav.push(fgSom(k.q, k.nf, r[1])); die.push(fgSom(k.q, k.nf, -r[2])); });
  var rT=fgR((FG_TF[4][1]+FG_TF[4][2])/2), rB=fgR((FG_TF[0][1]+FG_TF[0][2])/2), d='M'+fgPt(dav[0]);
  for(var i=1;i<dav.length;i++) d+='L'+fgPt(dav[i]);
  d+='A'+rT+' '+rT+' 0 0 0 '+fgPt(die[die.length-1]);
  for(i=die.length-2;i>=0;i--) d+='L'+fgPt(die[i]);
  return d+'A'+rB+' '+rB+' 0 0 0 '+fgPt(dav[0])+'Z';
}
function fgBustoFronte(P){
  var w=fgSpina(P, 0.45).q;
  var pts=[fgSom(P.gambe.n.h, P.perp, 4.5), fgSom(w, P.perp, P.tw), fgSom(P.braccia.n.s, P.perp, 3.2),
           fgSom(P.braccia.f.s, P.perp, -3.2), fgSom(w, P.perp, -P.tw), fgSom(P.gambe.f.h, P.perp, -4.5)];
  return 'M'+pts.map(fgPt).join('L')+'Z';
}
function fgTesta(P, p, cl){
  var r=FL.hd*(p.hs||1), d=fgDir(P.t+(p.nk||0)), o='';
  o+=fgPath(fgCaps(P.sh, fgSom(P.hc, d, -r*0.55), 2.7, 2.5), cl);
  o+='<circle cx="'+fgR(P.hc[0])+'" cy="'+fgR(P.hc[1])+'" r="'+fgR(r)+'" class="'+cl+'"/>';
  if(!P.front){ var f=[-d[1], d[0]], na=fgSom(fgSom(P.hc, f, r*0.9), d, -r*0.15);
    o+='<circle cx="'+fgR(na[0])+'" cy="'+fgR(na[1])+'" r="'+fgR(r*0.32)+'" class="'+cl+'"/>'; }
  return o;
}
/* il corpo intero, nell'ordine giusto: lontano, busto, testa, vicino */
function fgCorpo(P, p, def, ghost){
  var fr=P.front, o='', db=(def&&def.db)||"", cn=ghost? PAL_OK : PAL_N, cf=ghost? PAL_OK : (fr? PAL_N : PAL_F);
  if(!ghost && !fr && db.indexOf("f")>=0) o+=fgManubrio(P.braccia.f.h);
  o+=fgGamba(P.gambe.f, cf)+fgBraccio(P.braccia.f, cf);
  o+= fr ? '<path d="'+fgBustoFronte(P)+'" class="'+cn.sh+' fg-tf"/>' : fgPath(fgBusto(P), cn.sh);
  o+=fgTesta(P, p, cn.sk);
  if(!ghost && fr && db.indexOf("f")>=0) o+=fgManubrio(P.braccia.f.h, true);
  o+=fgGamba(P.gambe.n, cn);
  if(!ghost && db==="2"){ var m2=[(P.braccia.n.h[0]+P.braccia.f.h[0])/2, (P.braccia.n.h[1]+P.braccia.f.h[1])/2]; o+=fgManubrio(m2, fr); }
  o+=fgBraccio(P.braccia.n, cn);
  if(!ghost && db.indexOf("n")>=0) o+=fgManubrio(P.braccia.n.h, fr);
  return o;
}

/* ---------- il muscolo che lavora ---------- */
var MU={
  "Floor Press manubri":["petto","tricipiti","deltoidi"], "Floor Press (volume)":["petto","tricipiti"],
  "Push-up":["petto","tricipiti"], "Push-up piedi rialzati":["petto","deltoidi"], "Push-up piedi rialzati con banda":["petto","tricipiti"],
  "Push-up stretti":["tricipiti","petto"], "Pike push-up":["deltoidi","tricipiti"],
  "Rematore manubri":["dorso","bicipiti"], "Rematore manubri (volume)":["dorso","bicipiti"], "Band row seduto":["dorso","bicipiti"],
  "Band row un braccio":["dorso","bicipiti"], "Rematore al telaio della porta":["dorso","bicipiti"], "Pullover manubrio":["dorso"], "Band pull-down":["dorso"],
  "Shoulder Press manubri":["deltoidi","tricipiti"], "Shoulder press con banda":["deltoidi","tricipiti"],
  "French Press":["tricipiti"], "Band tricep extension":["tricipiti"], "Overhead extension 1 braccio":["tricipiti"],
  "Curl bicipiti manubri":["bicipiti"], "Hammer Curl":["bicipiti"], "Band curl bicipiti":["bicipiti"], "Hammer curl con banda":["bicipiti"], "Curl isometrico asciugamano":["bicipiti"],
  "Alzate laterali":["deltoidi"], "Alzate laterali con banda":["deltoidi"],
  "Face pull":["deltoidi","dorso"], "Reverse Fly":["deltoidi","dorso"], "Band pull-apart":["deltoidi","dorso"], "Y-T-W a busto inclinato":["deltoidi","dorso"],
  "Box Squat":["quadricipiti","glutei"], "Box squat alla sedia 3s":["quadricipiti","glutei"], "Bulgarian Split Squat manubri":["quadricipiti","glutei"],
  "Bulgarian split squat 3s":["quadricipiti","glutei"], "Affondi indietro manubri":["quadricipiti","glutei"], "Affondi indietro":["quadricipiti","glutei"],
  "Calf raise monopodalico":["polpacci"], "Hip thrust con banda":["glutei","femorali"], "Hip thrust a una gamba":["glutei","femorali"], "Glute bridge":["glutei"],
  "Split-stance RDL":["femorali","glutei"], "Hip hinge una gamba":["femorali","glutei"],
  "Plank":["addome"], "Dead bug":["addome"], "Side plank":["obliqui"], "Bird-dog con pausa 3s":["glutei","addome"],
  "Rotazioni toraciche":["dorso"], "Cat-cow":["lombari"]
};
var MU_NOME={petto:"petto", dorso:"dorso", deltoidi:"spalle", bicipiti:"bicipiti", tricipiti:"tricipiti", addome:"addome", obliqui:"obliqui",
  lombari:"lombari", glutei:"glutei", quadricipiti:"quadricipiti", femorali:"femorali", polpacci:"polpacci"};
function fgEll(c, rx, ry, ang, op){
  return '<ellipse cx="'+fgR(c[0])+'" cy="'+fgR(c[1])+'" rx="'+fgR(rx)+'" ry="'+fgR(ry)+'" transform="rotate('+fgR(ang)+' '+fgR(c[0])+' '+fgR(c[1])+')" class="fg-mu" opacity="'+fgR(op)+'"/>';
}
function fgAngSeg(a,b){ return Math.atan2(b[1]-a[1], b[0]-a[0])*180/Math.PI; }
function fgMezzo(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
/* normale del segmento a-b dal lato verso cui si piega l'estremo c; se l'arto e' dritto, dal lato "riposo" */
function fgPiega(a,b,c,riposo){
  var dx=b[0]-a[0], dy=b[1]-a[1], L=Math.sqrt(dx*dx+dy*dy)||1, n=[-dy/L, dx/L];
  var m=fgMezzo(a,b,0.5), s=(c[0]-m[0])*n[0]+(c[1]-m[1])*n[1];
  if(Math.abs(s)<2.5) s=n[0]*riposo[0]+n[1]*riposo[1];
  return s>=0? n : [-n[0], -n[1]];
}
function fgMuscoli(P, mu, op){
  var o="", fr=P.front;
  (mu||[]).forEach(function(m){
    var tronco=["petto","dorso","addome","obliqui","lombari","glutei"].indexOf(m)>=0;
    (fr && !tronco ? ["n","f"] : ["n"]).forEach(function(l){
      var B=P.braccia[l], G=P.gambe[l], k;
      if(m==="petto"){ if(fr){ var c0=fgSpina(P,0.82); o+=fgEll(fgSom(c0.q,P.perp,5.5),5,3.6,c0.ang+90,op)+fgEll(fgSom(c0.q,P.perp,-5.5),5,3.6,c0.ang+90,op); }
                       else { k=fgSpina(P,0.8); o+=fgEll(fgSom(k.q,k.nf,3.6),5.6,3.4,k.ang,op); } }
      else if(m==="dorso"){ k=fgSpina(P,0.64); if(fr) o+=fgEll(fgSom(k.q,P.perp,7.5),3.4,7,k.ang+90,op*0.8)+fgEll(fgSom(k.q,P.perp,-7.5),3.4,7,k.ang+90,op*0.8);
                            else o+=fgEll(fgSom(k.q,k.nf,-3.8),9.5,3.4,k.ang,op); }
      else if(m==="addome"){ k=fgSpina(P,0.33); o+= fr ? fgEll(k.q,7,4.2,k.ang,op) : fgEll(fgSom(k.q,k.nf,3.1),6.4,2.8,k.ang,op); }
      else if(m==="obliqui"){ k=fgSpina(P,0.42); o+=fgEll(k.q,8.5,3.8,k.ang,op); }
      else if(m==="lombari"){ k=fgSpina(P,0.18); o+=fgEll(fgSom(k.q,k.nf,-3.6),5.4,2.8,k.ang,op); }
      else if(m==="glutei"){ k=fgSpina(P,0.04); var gk=fgSom(fgSom(k.q,k.nf,-4.4),[P.gambe.n.k[0]-P.hip[0],P.gambe.n.k[1]-P.hip[1]],0.1);
                             o+=fgEll(gk,5.8,4.8,k.ang,op); }
      else if(m==="quadricipiti"){ var nq=fgPiega(G.h,G.k,G.a,P.back); o+=fgEll(fgSom(fgMezzo(G.h,G.k,0.5),nq,-2.8),9.5,3.3,fgAngSeg(G.h,G.k),op); }
      else if(m==="femorali"){ var nh=fgPiega(G.h,G.k,G.a,P.back); o+=fgEll(fgSom(fgMezzo(G.h,G.k,0.5),nh,2.8),9,3,fgAngSeg(G.h,G.k),op); }
      else if(m==="polpacci"){ var nt=fgPiega(G.k,G.a,G.toe,P.perp); o+=fgEll(fgSom(fgMezzo(G.k,G.a,0.35),nt,-2.4),7,2.7,fgAngSeg(G.k,G.a),op); }
      else if(m==="deltoidi"){ o+=fgEll(fgMezzo(B.s,B.e,0.16),5,4.2,fgAngSeg(B.s,B.e),op); }
      else if(m==="bicipiti" && !B.av){ var nb=fgPiega(B.s,B.e,B.h,P.perp); o+=fgEll(fgSom(fgMezzo(B.s,B.e,0.55),nb,1.9),5.8,2.4,fgAngSeg(B.s,B.e),op); }
      else if(m==="tricipiti"){ var ntr=fgPiega(B.s,B.e,B.h,P.perp); o+=fgEll(fgSom(fgMezzo(B.s,B.e,0.55),ntr,-1.9),6,2.4,fgAngSeg(B.s,B.e),op); }
    });
  });
  return o;
}
/* ombra a terra sotto i punti d'appoggio */
function fgOmbra(P){
  var xs=[];
  [P.gambe.n.a, P.gambe.f.a, P.gambe.n.toe, P.gambe.f.toe, P.braccia.n.h, P.braccia.f.h, P.braccia.n.e, P.hip, P.sh, P.hc].forEach(function(q){ if(q[1]>FG_PAV-13) xs.push(q[0]); });
  if(!xs.length) return "";
  var a=Math.min.apply(null,xs), b=Math.max.apply(null,xs);
  return '<ellipse cx="'+fgR((a+b)/2)+'" cy="'+(FG_PAV+0.5)+'" rx="'+fgR((b-a)/2+7)+'" ry="2.4" class="fg-ombra"/>';
}
/* freccia nel verso del movimento, sul punto che si muove */
function fgFreccia(def, sec){
  if(!def.tr) return "";
  var a=fgPunto(fgPosa(fgAl(def, sec).p), def.tr), b=fgPunto(fgPosa(fgAl(def, sec+0.14).p), def.tr);
  var vx=b[0]-a[0], vy=b[1]-a[1], L=Math.sqrt(vx*vx+vy*vy); if(L<0.5) return "";
  var u=[vx/L, vy/L], n=[-u[1], u[0]], base=fgSom(a,u,7), tip=fgSom(a,u,13);
  return '<path d="M'+fgPt(tip)+'L'+fgPt(fgSom(base,n,3.6))+'L'+fgPt(fgSom(base,n,-3.6))+'Z" class="fg-dir"/>';
}
/* miniatura "di lato" per gli esercizi visti di fronte: mostra l'inclinazione del busto */
function fgInset(def, vb){
  if(!def.inset || !vb) return "";
  var Pi=fgPosa(def.inset.p), pts=[Pi.hc,Pi.sh,Pi.hip,Pi.gambe.n.a,Pi.gambe.n.toe,Pi.gambe.f.a,Pi.braccia.n.h,Pi.braccia.f.h,Pi.gambe.n.k];
  var x0=Math.min.apply(null,pts.map(function(q){return q[0];}))-9, x1=Math.max.apply(null,pts.map(function(q){return q[0];}))+9;
  var y0=Math.min.apply(null,pts.map(function(q){return q[1];}))-9, y1=FG_PAV+2;
  var w=vb.w*0.26, k=w/(x1-x0), h=(y1-y0)*k, X=vb.x+3, Y=vb.y+3;
  return '<g class="fg-inset"><rect x="'+fgR(X)+'" y="'+fgR(Y)+'" width="'+fgR(w)+'" height="'+fgR(h+vb.w*0.055)+'" rx="'+fgR(vb.w*0.02)+'" class="fg-insbg"/>'+
    '<g transform="translate('+fgR(X)+' '+fgR(Y)+') scale('+k.toFixed(3)+') translate('+fgR(-x0)+' '+fgR(-y0)+')">'+
    '<line x1="'+fgR(x0)+'" y1="'+FG_PAV+'" x2="'+fgR(x1)+'" y2="'+FG_PAV+'" class="fg-floor"/>'+fgCorpo(Pi, def.inset.p, {db:def.db})+'</g>'+
    '<text x="'+fgR(X+w/2)+'" y="'+fgR(Y+h+vb.w*0.042)+'" text-anchor="middle" class="fg-instx" font-size="'+fgR(vb.w*0.044)+'">'+esc(def.inset.t||"di lato")+'</text></g>';
}
function fgDisegna(def, p, opt){
  opt=opt||{};
  var P=fgPosa(p), o="", bande=def.band||[];
  o+='<line x1="-300" y1="'+FG_PAV+'" x2="520" y2="'+FG_PAV+'" class="fg-floor"/>';
  (def.props||[]).forEach(function(pr){ o+=fgProp(pr); });
  o+=fgOmbra(P);
  if(opt.traccia) o+=opt.traccia;
  if(opt.ghost){ var Pg=fgPosa(opt.ghost); o+='<g opacity=".42">'+fgCorpo(Pg, opt.ghost, def, true)+'</g>'; }
  if(opt.pre) o+=opt.pre(P);
  o+= opt.ghost ? '<g class="fg-errg">'+fgCorpo(P, p, def)+'</g>' : fgCorpo(P, p, def);
  if(P.br){ /* respiro: le costole si allargano */
    var rc=fgSom(fgSom(P.hip, P.u, FL.tr*0.62), P.perp, 2);
    o+='<ellipse cx="'+fgR(rc[0])+'" cy="'+fgR(rc[1])+'" rx="'+fgR(8+6*P.br)+'" ry="'+fgR(10+3*P.br)+'" class="fg-breath" opacity="'+fgR(0.25+0.6*P.br)+'"/>';
  }
  var op = opt.sec==null ? 0.8 : 0.62+0.3*Math.sin(opt.sec*Math.PI*1.4);
  o+=fgMuscoli(P, def.mu, op);
  bande.forEach(function(b){
    var col=FG_BANDA[b.c]||FG_BANDA.verde;
    if(b.ring){ var q=fgPunto(P, b.ring); o+='<ellipse cx="'+fgR(q[0])+'" cy="'+fgR(q[1])+'" rx="3.8" ry="6.5" fill="none" stroke="'+col+'" stroke-width="2.8"/>'; return; }
    var pts=b.p.map(function(r){ return fgPunto(P, r); });
    o+='<polyline points="'+pts.map(fgPt).join(" ")+'" fill="none" stroke="'+col+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" opacity=".95"/>';
  });
  if(opt.sec!=null && opt.nome) o+=fgFreccia(def, opt.sec);
  o+=fgInset(def, opt.vb);
  if(opt.post) o+=opt.post(P);
  return o;
}
/* traiettoria del punto chiave lungo un ciclo intero, tratteggiata */
var _FGTR={};
function fgTraccia(nome, def){
  if(!def.tr) return "";
  if(_FGTR[nome]!=null) return _FGTR[nome];
  var tot=fgDurata(def), pts=[];
  for(var i=0;i<=36;i++){ var P=fgPosa(fgAl(def, tot*i/36).p); pts.push(fgPunto(P, def.tr)); }
  return (_FGTR[nome]='<polyline points="'+pts.map(function(q){ return fgR(q[0])+","+fgR(q[1]); }).join(" ")+'" class="fg-tr"/>');
}

/* ---------- catalogo delle figure ---------- */
function pIn(o){ return fgM({hip:[110,85], t:180, hn:[3,35], hf:[-3,35], fn:[113,FG_ANK], ff:[106,FG_ANK]}, o); }
function pSeduto(o){ return fgM({hip:[98,100], t:180, hn:[16,30], hf:[12,31], fn:[128,FG_ANK], ff:[122,FG_ANK]}, o); }
function pSupino(o){ return fgM({hip:[100,127], t:-90, hn:[2,-35], hf:[1,-35], fn:[126,FG_ANK], ff:[122,FG_ANK]}, o); }
function pQuattro(o){ return fgM({hip:[82,108], t:109, abs:"nf", hn:[117,FG_ANK], hf:[113,FG_ANK], fn:[58,FG_ANK], ff:[55,FG_ANK], tn:-90, tf:-90}, o); }
function pPiegato(o){ return fgM({hip:[96,87], t:128, hn:[2,35], hf:[-1,35], fn:[112,FG_ANK], ff:[106,FG_ANK]}, o); }
function pFronte(o){ return fgM({hip:[110,85], t:180, sw:10, hw:6, hn:[4,35], hf:[-4,35], fn:[117,FG_ANK], ff:[103,FG_ANK], tn:60, tf:120, eb:{n:1,f:-1}, kb:{n:-1,f:1}}, o); }
function pChino(o){ /* di fronte, busto inclinato: il busto appare accorciato */
  return pFronte(fgM({hip:[110,86], tl:0.56, hs:0.95, hk:0.3, fn:[116,FG_ANK], ff:[104,FG_ANK]}, o));
}
function pPlank(ank, shY, o){ var L=fgLinea(ank, shY); return fgM({hip:L.hip, t:L.t, fn:ank, ff:[ank[0]-3, ank[1]], tn:35, tf:35}, o); }

var SEDIA={k:"sedia", x:80, y:104, w:30, schienale:true};
var SGABELLO={k:"sedia", x:84, y:104, w:28};

var FIG={
 /* ---------- riscaldamento ---------- */
 "Cat-cow":{fx:"trunk", k:[
   {p:pQuattro({sp:-7, nk:30}), h:0.4, d:3, c:"Inspira: lo sterno va avanti, la schiena si inarca"},
   {p:pQuattro({sp:9, nk:-45}), h:0.4, d:3, c:"Espira: arrotonda vertebra dopo vertebra, mento al petto"}]},
 "Rotazioni toraciche":{fx:"arm", props:[{k:"tappetino", x:40, w:110}], k:[
   {p:pQuattro({hip:[80,119], t:112, abs:"f", hn:[-10,30], hf:[126,FG_ANK], fn:[80,FG_ANK], ff:[77,FG_ANK], nk:-20}), h:0.3, d:2.2, c:"Seduto sui talloni, il braccio passa sotto il corpo"},
   {p:pQuattro({hip:[80,119], t:112, abs:"f", hn:[2,-36], hf:[126,FG_ANK], fn:[80,FG_ANK], ff:[77,FG_ANK], nk:60}), h:1.2, d:2.2, c:"Apri verso il soffitto e segui la mano con lo sguardo"}]},
 "Bird-dog con pausa 3s":{fx:"core", tr:"hn", k:[
   {p:pQuattro(), h:0.5, d:1.5, c:"A quattro zampe, schiena neutra"},
   {p:pQuattro({abs:"f", hn:[36,-3], ff:[36,104]}), h:3, d:1.5, c:"Braccio e gamba opposti in linea: fermo 3 secondi, bacino che non ruota"}]},
 "Respirazione costale asimmetrica":{fx:"", props:[SGABELLO], k:[
   {p:pSeduto({hn:[3,18], hf:[-9,12], eb:{n:1,f:-1}, br:0}), h:0.3, d:4, c:"Inspira 4 secondi: le costole di sinistra spingono contro la mano"},
   {p:pSeduto({hn:[3,18], hf:[-9,12], eb:{n:1,f:-1}, br:1}), h:0.3, d:6.5, c:"Espira 6-7 secondi, lento: a destra il torace si sgonfia verso il centro"}]},
 "Glute bridge":{fx:"leg", tr:"hip", k:[
   {p:pSupino({hn:[22,5], hf:[20,5]}), h:0.3, d:1.2, c:"Piedi a terra, ginocchia piegate"},
   {p:pSupino({hip:[101,111], t:-66, hn:[22,7], hf:[20,7]}), h:1, d:1.6, c:"Spingi coi talloni e stringi i glutei: linea spalle-ginocchia"}]},

 /* ---------- giorno A ---------- */
 "Floor Press manubri":{fx:"trunk", db:"nf", tr:"hn", k:[
   {p:pSupino({hn:[1,-36], hf:[0,-36]}), h:0.4, d:3, c:"Scendi in 3 secondi: gomiti a 45° dal busto"},
   {p:pSupino({hn:[9,-13], hf:[8,-13]}), h:0.3, d:1, c:"I gomiti sfiorano il pavimento, poi spingi senza bloccarli"}]},
 "Rematore manubri":{fx:"trunk", db:"nf", tr:"hn", k:[
   {p:pPiegato(), h:0.3, d:1, c:"Busto a 45°, schiena dritta, manubri che pendono"},
   {p:pPiegato({hn:[-22,20], hf:[-24,20]}), h:0.6, d:2, c:"Gomiti verso le tasche posteriori, scapole strette. Giù in 2 secondi"}]},
 "Shoulder Press manubri":{fx:"arm", db:"nf", props:[SEDIA], tr:"hn", k:[
   {p:pSeduto({hn:[6,-4], hf:[4,-4]}), h:0.3, d:1, c:"Seduto, schiena appoggiata: spingi espirando"},
   {p:pSeduto({hn:[3,-36], hf:[2,-36]}), h:0.3, d:2, c:"Scendi controllato fino all'altezza del mento"}]},
 "Push-up piedi rialzati con banda":{fx:"trunk", props:[{k:"box", x:16, y:122, w:34}], band:[{c:"gialla", p:["hn","bk","hf"]}], k:[
   {p:pPlank([40,118], 96, {abs:"nf", hn:[120,FG_ANK], hf:[117,FG_ANK], tn:40, tf:40}), h:0.3, d:2, c:"Banda sulle scapole, piedi sul rialzo: corpo in linea"},
   {p:pPlank([40,118], 117, {abs:"nf", hn:[120,FG_ANK], hf:[117,FG_ANK], tn:40, tf:40}), h:0.2, d:1, c:"Scendi in blocco, poi spingi: la banda tira di più in alto"}]},
 "French Press":{fx:"arm", db:"2", props:[SEDIA], k:[
   {p:pSeduto({an:[172,176], af:[170,176]}), h:0.3, d:2, c:"Gomiti puntati avanti e fermi: il manubrio scende dietro la nuca"},
   {p:pSeduto({an:[172,326], af:[170,326]}), h:0.2, d:1, c:"Distendi senza aprire i gomiti"}]},
 "Plank":{fx:"core", k:[
   {p:pPlank([37,128], 114, {abs:"nf", hn:[139,FG_ANK], hf:[136,FG_ANK]}), h:0.5, d:2.5, c:"Avambracci sotto le spalle, corpo in linea da testa a talloni"},
   {p:pPlank([37,128], 113.4, {abs:"nf", hn:[139,FG_ANK], hf:[136,FG_ANK]}), h:0.5, d:2.5, c:"Conta i secondi a voce: non puoi contare in apnea"}]},

 /* ---------- giorno B ---------- */
 "Box Squat":{fx:"leg", db:"2", props:[{k:"box", x:64, y:103, w:32}], tr:"hip", k:[
   {p:pIn({hip:[108,85], hn:[12,10], hf:[10,10], fn:[113,FG_ANK], ff:[108,FG_ANK]}), h:0.3, d:2, c:"Spingi i fianchi indietro, talloni a terra"},
   {p:pIn({hip:[89,98], t:142, hn:[12,10], hf:[10,10], fn:[113,FG_ANK], ff:[108,FG_ANK]}), h:0.3, d:1, c:"Sfiora il box senza sederti, poi risali coi talloni"}]},
 "Bulgarian Split Squat manubri":{fx:"leg", db:"nf", props:[{k:"box", x:28, y:108, w:34}], tr:"hip", k:[
   {p:pIn({hip:[102,88], t:176, fn:[118,FG_ANK], ff:[57,103], tf:-100}), h:0.3, d:2, c:"Piede dietro sul rialzo, piede davanti avanzato"},
   {p:pIn({hip:[94,108], t:172, fn:[118,FG_ANK], ff:[57,103], tf:-100}), h:0.2, d:1, c:"Scendi a 90°, ginocchio sopra la caviglia. Spingi col piede davanti"}]},
 "Calf raise monopodalico":{fx:"leg", props:[{k:"box", x:124, y:120, w:40}, {k:"muro", x:178}], k:[
   {p:pIn({hip:[118,76], abs:"n", hn:[176,46], hf:[-2,34], rf:"f", fn:[120,124], ff:[-12,34], tn:120, kb:{n:-1,f:1}}), h:0.2, d:1, c:"Sali sulla punta: una mano al muro solo per l'equilibrio"},
   {p:pIn({hip:[120,66], abs:"n", hn:[176,40], hf:[-2,34], rf:"f", fn:[121,114], ff:[-12,34], tn:50, kb:{n:-1,f:1}}), h:1, d:2, c:"Pausa di 1 secondo in alto, poi scendi lento sotto il bordo"}]},
 "Band tricep extension":{fx:"arm", band:[{c:"rossa", p:["an","bkh","hn"]}], k:[
   {p:pIn({an:[172,326], af:[170,326]}), h:0.3, d:1, c:"Banda sotto il piede, mani dietro la testa, gomiti in alto"},
   {p:pIn({an:[172,176], af:[170,176]}), h:0.2, d:2, c:"Distendi le braccia senza aprire i gomiti, ritorno in 2 secondi"}]},
 "Side plank":{fx:"core", k:[
   {p:fgM(fgLinea([156,129], 112, -1), {vf:1, tw:6.5, av:"n", abs:"nf", hn:[73,FG_ANK], hf:[74,76], fn:[156,129], ff:[159,126], tn:10, tf:10, eb:{n:1,f:1}}), h:0.5, d:2.5, c:"Gomito sotto la spalla, bacino alto: linea retta spalla-caviglia"},
   {p:fgM(fgLinea([156,129], 111.2, -1), {vf:1, tw:6.5, av:"n", abs:"nf", hn:[73,FG_ANK], hf:[74,76], fn:[156,129], ff:[159,126], tn:10, tf:10, eb:{n:1,f:1}}), h:0.5, d:2.5, c:"Sinistra 60 s, destra 40 s: la convessità lombare è a sinistra"}]},

 /* ---------- giorno C ---------- */
 "Pullover manubrio":{fx:"trunk", db:"2", tr:"hn", k:[
   {p:pSupino({hn:[1,-36], hf:[0,-36]}), h:0.3, d:2.5, c:"Espira mentre porti il peso dietro: le costole restano basse"},
   {p:pSupino({hn:[-33,-10], hf:[-34,-10]}), h:0.3, d:1.5, c:"Fermati dove la schiena resta a terra, poi torna sopra il petto"}]},
 "Push-up":{fx:"trunk", k:[
   {p:pPlank([34,128], 97, {abs:"nf", hn:[114,FG_ANK], hf:[111,FG_ANK]}), h:0.3, d:2, c:"Mani poco più larghe delle spalle, glutei stretti"},
   {p:pPlank([34,128], 119, {abs:"nf", hn:[114,FG_ANK], hf:[111,FG_ANK]}), h:0.2, d:1, c:"Scendi in blocco con i gomiti a 45°, poi spingi via il pavimento"}]},
 "Curl bicipiti manubri":{fx:"arm", db:"nf", tr:"hn", k:[
   {p:pIn({an:[3,8], af:[2,8]}), h:0.2, d:1, c:"Gomiti accanto al busto, fermi"},
   {p:pIn({an:[3,152], af:[2,150]}), h:0.3, d:2, c:"Scendi in 2 secondi: la discesa è metà dello stimolo"}]},
 "Alzate laterali":{fx:"arm", db:"nf", k:[
   {p:pFronte(), h:0.2, d:1.2, c:"Gomiti appena piegati e fissi"},
   {p:pFronte({hn:[33,3], hf:[-33,3]}), h:0.2, d:2, c:"Fino all'altezza delle spalle, non oltre. Le spalle non salgono"}]},
 "Face pull":{fx:"arm", db:"nf", tr:"hn", k:[
   {p:pPiegato({eb:{n:-1,f:-1}}), h:0.2, d:1.2, c:"Busto a 45°, un manubrio per mano"},
   {p:pPiegato({hn:[8,-3], hf:[6,-3], eb:{n:-1,f:-1}}), h:0.6, d:2, c:"Tira verso il viso con i gomiti ALTI, apri a fine corsa"}]},

 /* ---------- giorno D ---------- */
 "Hip thrust con banda":{fx:"leg", props:[{k:"box", x:30, y:106, w:42}], band:[{c:"rossa", ring:"kn"}], tr:"hip", k:[
   {p:fgM({hip:[92,124], t:-134, hn:[16,10], hf:[14,10], fn:[124,FG_ANK], ff:[120,FG_ANK], nk:-10}), h:0.3, d:1, c:"Scapole sul divano, banda sopra le ginocchia"},
   {p:fgM({hip:[96,103], t:-97, hn:[20,6], hf:[18,6], fn:[124,FG_ANK], ff:[120,FG_ANK], nk:-35}), h:1, d:2, c:"Contrai i glutei e sali fino alla linea retta: pausa 1 secondo"}]},
 "Split-stance RDL":{fx:"leg", db:"nf", tr:"hip", k:[
   {p:pIn({hip:[106,86], t:178, fn:[118,FG_ANK], ff:[90,128], tf:40, hn:[2,35], hf:[0,35]}), h:0.3, d:2.5, c:"80% del peso sul piede davanti, l'altro solo in punta"},
   {p:pIn({hip:[93,90], t:104, fn:[118,FG_ANK], ff:[90,128], tf:40, hn:[1,34], hf:[-1,34]}), h:0.3, d:1.2, c:"Bacino INDIETRO, non in basso: schiena neutra, manubri vicino alla gamba"}]},
 "Affondi indietro manubri":{fx:"leg", db:"nf", tr:"hip", k:[
   {p:pIn({fn:[116,FG_ANK], ff:[108,FG_ANK]}), h:0.3, d:0.7, c:"In piedi, manubri lungo i fianchi"},
   {p:pIn({hip:[107,92], fn:[116,FG_ANK], ff:[92,122], tf:60}), h:0, d:1.3, c:"Passo INDIETRO"},
   {p:pIn({hip:[96,108], t:176, fn:[118,FG_ANK], ff:[72,130], tf:40}), h:0.2, d:1, c:"Scendi con le ginocchia a 90°, poi spingi con la gamba davanti"},
   {p:pIn({hip:[107,92], fn:[116,FG_ANK], ff:[92,122], tf:60}), h:0, d:0.7, c:"Torna su"}]},
 "Reverse Fly":{fx:"arm", db:"nf", inset:{p:pPiegato({hn:[2,35], hf:[-1,35]}), t:"busto a 45°"}, k:[
   {p:pChino(), h:0.2, d:1.3, c:"Visto di fronte, busto a 45°: manubri che pendono"},
   {p:pChino({hn:[33,2], hf:[-33,2]}), h:0.5, d:2, c:"Apri fino all'altezza delle spalle stringendo le scapole. 6 kg è il tetto"}]},

 /* ---------- trasferta ---------- */
 "Pike push-up":{fx:"arm", k:[
   {p:fgM({hip:[90,86], t:fgAng([32,17]), abs:"nf", hn:[128,FG_ANK], hf:[125,FG_ANK], fn:[66,128], ff:[63,128], tn:40, tf:40, nk:-20}), h:0.3, d:2, c:"V rovesciata: bacino alto, testa fra le braccia"},
   {p:fgM({hip:[92,88], t:fgAng([30,26]), abs:"nf", hn:[128,FG_ANK], hf:[125,FG_ANK], fn:[66,128], ff:[63,128], tn:40, tf:40, nk:-20}), h:0.2, d:1, c:"La testa scende in verticale verso il pavimento, poi spingi"}]},
 "Hip hinge una gamba":{fx:"leg", tr:"hip", k:[
   {p:pIn({hip:[108,85], fn:[112,FG_ANK], ff:[102,124], tf:60}), h:0.3, d:2.5, c:"In piedi su una gamba, l'altra appena dietro"},
   {p:pIn({hip:[103,88], t:96, fn:[112,FG_ANK], ff:[56,84], tf:-90, hn:[1,34], hf:[-1,34]}), h:0.4, d:1.5, c:"Bacino indietro: busto e gamba formano una linea. Risali col gluteo"}]},
 "Band row seduto":{fx:"trunk", band:[{c:"rossa", p:["tn","hn"]}], props:[{k:"tappetino", x:56, w:90}], k:[
   {p:fgM({hip:[78,126], t:176, hn:[33,10], hf:[31,10], fn:[126,131], ff:[122,131], tn:170, tf:170}), h:0.2, d:1, c:"Seduto, banda attorno ai piedi, busto eretto"},
   {p:fgM({hip:[78,126], t:178, hn:[-8,17], hf:[-9,17], fn:[126,131], ff:[122,131], tn:170, tf:170}), h:0.5, d:2, c:"Gomiti indietro, scapole strette. Ritorno lento"}]},
 "Band row un braccio":{fx:"trunk", band:[{c:"nera", p:["tn","hn"]}], props:[{k:"tappetino", x:56, w:90}], k:[
   {p:fgM({hip:[78,126], t:176, hn:[33,10], hf:[24,22], fn:[126,131], ff:[122,131], tn:170, tf:170}), h:0.2, d:1, c:"Un braccio alla volta: il busto non ruota"},
   {p:fgM({hip:[78,126], t:178, hn:[-8,17], hf:[24,22], fn:[126,131], ff:[122,131], tn:170, tf:170}), h:0.5, d:2, c:"Tira verso il fianco. Parti dal lato debole e pareggia"}]},
 "Band pull-apart":{fx:"trunk", band:[{c:"verde", p:["hn","hf"]}], k:[
   {p:pFronte({hn:[-6,7], hf:[6,7]}), h:0.2, d:1, c:"Braccia tese davanti al petto"},
   {p:pFronte({hn:[32,3], hf:[-32,3]}), h:0.4, d:3, c:"Apri fino a sfiorare il petto, ritorno lento in 3 secondi"}]},
 "Band curl bicipiti":{fx:"arm", band:[{c:"nera", p:["an","hn"]}], tr:"hn", k:[
   {p:pIn({an:[3,8], af:[2,8]}), h:0.2, d:1, c:"Banda sotto i piedi, gomiti fermi"},
   {p:pIn({an:[3,152], af:[2,150]}), h:0.3, d:3, c:"Il ritorno è la parte importante: 3 secondi"}]},
 "Dead bug":{fx:"core", k:[
   {p:pSupino({hn:[1,-36], hf:[0,-36], rf:"nf", fn:[24,-25], ff:[22,-25]}), h:0.4, d:2, c:"Lombare schiacciata a terra, anche e ginocchia a 90°"},
   {p:pSupino({hn:[-34,-8], hf:[0,-36], rf:"nf", fn:[24,-25], ff:[47,-7]}), h:0.6, d:1.5, c:"Allunga braccio e gamba opposti espirando: la lombare non si stacca"},
   {p:pSupino({hn:[1,-36], hf:[0,-36], rf:"nf", fn:[24,-25], ff:[22,-25]}), h:0.4, d:2, c:"Torna e cambia lato"},
   {p:pSupino({hn:[1,-36], hf:[-34,-8], rf:"nf", fn:[47,-7], ff:[22,-25]}), h:0.6, d:1.5, c:"Allunga braccio e gamba opposti espirando: la lombare non si stacca"}]},
 "Overhead extension 1 braccio":{fx:"arm", db:"n", props:[SGABELLO], k:[
   {p:pSeduto({an:[172,176], hf:[4,-17]}), h:0.3, d:3, c:"Seduto senza schienale: scendi dietro la testa in 3 secondi"},
   {p:pSeduto({an:[172,326], hf:[4,-17]}), h:0.2, d:1, c:"L'altra mano sostiene il gomito. Risali espirando"}]},

 /* ---------- alternative a corpo libero e con bande ---------- */
 "Rematore al telaio della porta":{fx:"trunk", props:[{k:"porta", x:148}], k:[
   {p:fgM(fgInclinato([137,FG_ANK], 18), {abs:"n", hn:[147,56], hf:[-4,34], fn:[137,FG_ANK], ff:[132,FG_ANK]}), h:0.3, d:1, c:"Una mano sul telaio, piedi vicini, corpo dritto inclinato indietro"},
   {p:fgM(fgInclinato([137,FG_ANK], 5), {abs:"n", hn:[147,56], hf:[-4,34], fn:[137,FG_ANK], ff:[132,FG_ANK]}), h:0.5, d:2, c:"Porta il petto verso la porta, gomito vicino al busto. Giù lento"}]},
 "Shoulder press con banda":{fx:"arm", band:[{c:"verde", p:["an","hn"]}], k:[
   {p:pIn({hn:[6,-4], hf:[4,-4]}), h:0.3, d:1, c:"Banda sotto i piedi, mani all'altezza delle spalle"},
   {p:pIn({hn:[3,-36], hf:[2,-36]}), h:0.3, d:2, c:"Spingi in alto espirando, scendi controllato"}]},
 "Box squat alla sedia 3s":{fx:"leg", props:[SEDIA], tr:"hip", k:[
   {p:pIn({hip:[108,85], hn:[30,6], hf:[28,6], fn:[118,FG_ANK], ff:[113,FG_ANK]}), h:0.3, d:3, c:"Braccia avanti per l'equilibrio: scendi in 3 secondi"},
   {p:pIn({hip:[96,99], t:146, hn:[30,6], hf:[28,6], fn:[118,FG_ANK], ff:[113,FG_ANK]}), h:1, d:1, c:"Sfiora la sedia, pausa 1 secondo, risali spingendo coi talloni"}]},
 "Curl isometrico asciugamano":{fx:"arm", band:[{c:"asciugamano", p:["an","hn"]}], k:[
   {p:pIn({an:[2,92], af:[1,92]}), h:0.2, d:2.5, c:"Asciugamano sotto il piede, gomiti a 90° accanto al busto"},
   {p:pIn({an:[2,96], af:[1,96]}), h:0.2, d:2.5, c:"Tira verso l'alto con tutta la forza e tieni 20-30 secondi respirando"}]},
 "Alzate laterali con banda":{fx:"arm", band:[{c:"gialla", p:["an","hn"]}, {c:"gialla", p:["af","hf"]}], k:[
   {p:pFronte(), h:0.2, d:1.2, c:"Banda sotto i piedi, gomiti appena piegati"},
   {p:pFronte({hn:[33,3], hf:[-33,3]}), h:0.3, d:2, c:"Fino all'altezza delle spalle, ritorno lento"}]},
 "Y-T-W a busto inclinato":{fx:"arm", inset:{p:pPiegato({hn:[22,-24], hf:[20,-24]}), t:"busto a 45°"}, k:[
   {p:pChino({hn:[22,-27], hf:[-22,-27]}), h:0.8, d:1.2, c:"Y: braccia in alto a V, pollici in su"},
   {p:pChino({hn:[33,2], hf:[-33,2]}), h:0.8, d:1.2, c:"T: braccia aperte all'altezza delle spalle"},
   {p:pChino({hn:[12,-10], hf:[-12,-10]}), h:0.8, d:1.2, c:"W: gomiti indietro e in basso, scapole strette"}]},
 "Hip thrust a una gamba":{fx:"leg", props:[{k:"box", x:30, y:106, w:42}], tr:"hip", k:[
   {p:fgM({hip:[92,124], t:-134, hn:[16,10], hf:[14,10], fn:[124,FG_ANK], rf:"f", ff:[40,-12], nk:-10}), h:0.3, d:1, c:"Una gamba a terra, l'altra distesa"},
   {p:fgM({hip:[96,103], t:-97, hn:[20,6], hf:[18,6], fn:[124,FG_ANK], rf:"f", ff:[46,-6], nk:-35}), h:1, d:2, c:"Sali col gluteo della gamba a terra, bacino che non ruota"}]},
 "Band pull-down":{fx:"trunk", props:[{k:"porta", x:150}], band:[{c:"verde", p:[[152,12],"hn"]}], k:[
   {p:pIn({hn:[12,-34], hf:[10,-34]}), h:0.2, d:1, c:"Banda fissata in alto, braccia tese verso l'ancoraggio"},
   {p:pIn({hn:[14,3], hf:[12,3]}), h:0.5, d:2, c:"Tira i gomiti verso i fianchi, scapole giù"}]}
};
/* varianti che si muovono come un'altra figura */
function fgCopia(base, mod){ var d=fgM(FIG[base], mod||{}); return d; }
FIG["Floor Press (volume)"]=fgCopia("Floor Press manubri", {k:[
  {p:FIG["Floor Press manubri"].k[0].p, h:0.3, d:1.5, c:"Stessa tecnica, senza i 3 secondi: l'obiettivo è il volume"},
  {p:FIG["Floor Press manubri"].k[1].p, h:0.2, d:1, c:"Pulito fino alla dodicesima: se i gomiti sbattono, fermati a 10"}]});
FIG["Rematore manubri (volume)"]=fgCopia("Rematore manubri", {k:[
  {p:FIG["Rematore manubri"].k[0].p, h:0.3, d:1, c:"Stessa tecnica del rematore"},
  {p:FIG["Rematore manubri"].k[1].p, h:0.5, d:2, c:"Dalla 9ª in poi il busto non deve raddrizzarsi"}]});
FIG["Hammer Curl"]=fgCopia("Curl bicipiti manubri", {k:[
  {p:FIG["Curl bicipiti manubri"].k[0].p, h:0.2, d:1, c:"Presa neutra: i palmi si guardano"},
  {p:FIG["Curl bicipiti manubri"].k[1].p, h:0.3, d:3, c:"Il polso non ruota. Scendi in 3 secondi"}]});
FIG["Hammer curl con banda"]=fgCopia("Band curl bicipiti", {k:[
  {p:FIG["Band curl bicipiti"].k[0].p, h:0.2, d:1, c:"Presa neutra, banda sotto i piedi"},
  {p:FIG["Band curl bicipiti"].k[1].p, h:0.3, d:3, c:"Ritorno in 3 secondi, gomiti fermi"}]});
FIG["Push-up stretti"]=fgCopia("Push-up", {fx:"arm", k:[
  {p:FIG["Push-up"].k[0].p, h:0.3, d:2, c:"Mani sotto le spalle"},
  {p:FIG["Push-up"].k[1].p, h:0.2, d:1, c:"Gomiti lungo i fianchi, non aperti a T"}]});
FIG["Push-up piedi rialzati"]=fgCopia("Push-up piedi rialzati con banda", {band:[]});
FIG["Bulgarian split squat 3s"]=fgCopia("Bulgarian Split Squat manubri", {db:"", k:[
  {p:fgM(FIG["Bulgarian Split Squat manubri"].k[0].p, {hn:[8,26], hf:[6,26]}), h:0.3, d:3, c:"Senza manubri lo stimolo viene dalla durata: 3 secondi in discesa"},
  {p:fgM(FIG["Bulgarian Split Squat manubri"].k[1].p, {hn:[8,26], hf:[6,26]}), h:0.3, d:1, c:"Il lato che scende meno decide la profondità di entrambi"}]});
FIG["Affondi indietro"]=fgCopia("Affondi indietro manubri", {db:"", k:FIG["Affondi indietro manubri"].k.map(function(k){ return fgM(k, {p:fgM(k.p, {hn:[8,26], hf:[6,26]})}); })});
Object.keys(FIG).forEach(function(n){ FIG[n].mu = MU[n] || FIG[n].mu || []; });
var FIG_ALIAS={"Reverse Fly manubri":"Reverse Fly", "Reverse Fly leggero":"Reverse Fly", "Rematore un braccio manubrio":"Rematore manubri",
  "Calf raise":"Calf raise monopodalico", "Calf raise (BW)":"Calf raise monopodalico", "Bulgarian split squat (BW)":"Bulgarian split squat 3s",
  "Face pull con banda":"Face pull", "Push-up piedi rialzati o deficit":"Push-up piedi rialzati", "Isometria push-up":"Push-up",
  "Plank braccia avanzate":"Plank", "Plank con braccio avanti alternato":"Plank", "Push-up stretti piedi rialzati":"Push-up stretti",
  "Pike push-up piedi rialzati":"Pike push-up", "Bulgarian split squat 3s con pausa":"Bulgarian split squat 3s",
  "Hip hinge una gamba con banda":"Hip hinge una gamba", "Dead bug con pausa 3 s":"Dead bug", "Chest Press manubri":"Floor Press manubri"};

function fgDef(n){ return FIG[n] || FIG[FIG_ALIAS[n]] || null; }
function fgNome(n){ return FIG[n]? n : FIG_ALIAS[n]; }
/* inquadratura: il riquadro che contiene tutto il movimento, pavimento in basso */
var _FGBOX={};
function fgInquadra(n){
  var nome=fgNome(n), def=fgDef(n); if(!def) return {x:0,y:0,w:220,h:150};
  if(_FGBOX[nome]) return _FGBOX[nome];
  var x0=1e9, y0=1e9, x1=-1e9, y1=-1e9;
  var add=function(q, r){ r=r||0; x0=Math.min(x0,q[0]-r); y0=Math.min(y0,q[1]-r); x1=Math.max(x1,q[0]+r); y1=Math.max(y1,q[1]+r); };
  var tot=fgDurata(def);
  for(var i=0;i<24;i++){
    var P=fgPosa(fgAl(def, tot*i/24).p);
    add(P.hc, FL.hd+1); add(P.hip, 7); add(P.sh, 7);
    ["n","f"].forEach(function(l){ var b=P.braccia[l], g=P.gambe[l]; add(b.e,4); add(b.h, def.db?7:4); add(g.k,5); add(g.a,4); add(g.toe,3); });
  }
  (def.props||[]).forEach(function(pr){
    if(pr.k==="box"||pr.k==="sedia"){ add([pr.x-(pr.schienale?6:0), pr.y-(pr.schienale?38:0)]); add([pr.x+pr.w, FG_PAV]); }
    else if(pr.k==="muro"||pr.k==="porta"){ add([pr.x, y0<1e8? y0 : 60]); add([pr.x+10, FG_PAV]); }
    else if(pr.k==="tappetino"){ add([pr.x, FG_PAV]); add([pr.x+pr.w, FG_PAV]); }
  });
  (def.band||[]).forEach(function(b){ (b.p||[]).forEach(function(r){ if(Array.isArray(r)) add(r); }); });
  y1=Math.max(y1, FG_PAV)+4; x0-=9; x1+=9; y0-=7;
  if(def.inset) x0-=(x1-x0)*0.42;   /* spazio a sinistra per la miniatura di lato */
  var w=x1-x0, h=y1-y0, R=220/150;
  if(w/h<R){ var nw=h*R; x0-=(nw-w)/2; w=nw; } else { var nh=w/R; y0-=(nh-h); h=nh; }
  if(w<128){ var cx=x0+w/2; w=128; h=w/R; x0=cx-w/2; y0=y1-h; }
  return (_FGBOX[nome]={x:fgR(x0), y:fgR(y0), w:fgR(w), h:fgR(h)});
}
function fgVB(n){ var b=fgInquadra(n); return b.x+" "+b.y+" "+b.w+" "+b.h; }
function figHas(n){ return !!fgDef(n); }
/* il fotogramma che spiega meglio: la posa di lavoro, a meta' del primo movimento */
function figSVG(n, sec, opt){
  var def=fgDef(n); if(!def) return "";
  opt=opt||{};
  var fr=(sec==null)? fgAl(def, (def.k[0].h||0)+(def.k[0].d||1)*0.85) : fgAl(def, sec);
  var nome=FIG[n]? n : FIG_ALIAS[n];
  return '<svg viewBox="'+fgVB(n)+'" class="fg'+(opt.cls?" "+opt.cls:"")+'" role="img" aria-label="'+esc(n)+'">'+FG_DEFS+
    fgDisegna(def, fr.p, {traccia: opt.traccia===false? "" : fgTraccia(nome, def), vb:fgInquadra(n)})+'</svg>';
}
function figMuscoli(n){ var d=fgDef(n); return d && d.mu ? d.mu.map(function(m){ return MU_NOME[m]||m; }) : []; }
function figDidascalia(n, sec){ var def=fgDef(n); return def? fgAl(def, sec).c : ""; }

/* ---------- animazione: un solo ciclo per tutte le figure visibili ---------- */
var FG_DEFS='<defs><radialGradient id="fgMu"><stop offset="0" stop-color="#FF7A5C" stop-opacity="1"/><stop offset=".6" stop-color="#FF6B57" stop-opacity=".7"/><stop offset="1" stop-color="#FF6B57" stop-opacity="0"/></radialGradient></defs>';
/* contatore dei secondi nelle fasi lente e nelle pause */
function fgTempo(fr){
  if(!fr || fr.dur==null) return "";
  if(fr.fase==="d" && fr.dur>=1.9) return Math.min(Math.floor(fr.el)+1, Math.round(fr.dur))+"″ di "+Math.round(fr.dur);
  if(fr.fase==="h" && fr.dur>=0.9) return "fermo "+Math.min(Math.floor(fr.el)+1, Math.round(fr.dur))+"″";
  return "";
}
var Fig={ raf:null, t0:0, last:0, vel:1, pausa:false,
  mount:function(){
    var els=document.querySelectorAll(".figbox[data-fig]");
    if(!els.length){ this.stop(); return; }
    var red=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(red){ [].forEach.call(els, function(el){ Fig.frame(el, null); }); return; }
    if(!this.raf){ this.t0=performance.now(); this.loop(); }
  },
  frame:function(el, sec){
    var n=el.dataset.fig, def=fgDef(n); if(!def) return;
    var fr=(sec==null)? fgAl(def, (def.k[0].h||0)+(def.k[0].d||1)*0.85) : fgAl(def, sec);
    var g=el.querySelector("g.fgc"); if(g) g.innerHTML=fgDisegna(def, fr.p, {traccia:fgTraccia(fgNome(n), def), vb:fgInquadra(n), sec:sec, nome:n});
    var tm=el.querySelector(".figtempo"); if(tm){ var tt=sec==null? "" : fgTempo(fr); if(tm.textContent!==tt) tm.textContent=tt; }
    var c=el.parentNode && el.parentNode.querySelector(".figcap");
    if(c && c.textContent!==fr.c) c.textContent=fr.c;
    var b=el.parentNode && el.parentNode.querySelector(".figbar i");
    if(b){ var tot=fgDurata(def), x=((sec%tot)+tot)%tot/tot; b.style.width=(x*100).toFixed(1)+"%"; }
  },
  loop:function(){
    var self=Fig;
    self.raf=requestAnimationFrame(function(ts){
      var els=document.querySelectorAll(".figbox[data-fig]");
      if(!els.length){ self.stop(); return; }
      if(ts-self.last>33 && !self.pausa && document.visibilityState!=="hidden"){
        self.last=ts;
        var sec=(ts-self.t0)/1000*self.vel;
        [].forEach.call(els, function(el){ self.frame(el, sec+(+el.dataset.off||0)); });
      }
      self.loop();
    });
  },
  stop:function(){ if(this.raf){ cancelAnimationFrame(this.raf); this.raf=null; } },
  riparti:function(){ this.t0=performance.now(); }
};
/* riquadro animato: figura, barra del ciclo, didascalia */
function figBox(n, opt){
  opt=opt||{};
  if(!figHas(n)) return "";
  return '<div class="figwrap'+(opt.cls?" "+opt.cls:"")+'">'+
    '<div class="figbox" data-fig="'+esc(n)+'"><svg viewBox="'+fgVB(n)+'" class="fg" role="img" aria-label="'+esc(n)+'">'+FG_DEFS+'<g class="fgc">'+
    fgDisegna(fgDef(n), fgAl(fgDef(n), 0).p, {vb:fgInquadra(n)})+'</g></svg><div class="figtempo"></div></div>'+
    (opt.cap===false? "" : '<div class="figbar"><i></i></div><div class="figcap">'+esc(figDidascalia(n,0))+'</div>')+'</div>';
}
/* miniatura ferma, per elenchi e anteprime */
function figMini(n){ return figHas(n)? '<div class="figmini">'+figSVG(n, null, {traccia:false})+'</div>' : '<div class="figmini vuota"></div>'; }
