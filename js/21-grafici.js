/* ============================================================
   GRAFICI — gli andamenti, in SVG puro (nessuna libreria)
   Funzioni di disegno: linea con fascia bersaglio, barre (anche
   impilate), miniatura, calendario a colori. Poi le serie storiche:
   una per ogni KPI, per le forze stimate, il recupero, il dolore.
   ============================================================ */
var GC={line:"var(--glow)", ok:"var(--ok)", amb:"var(--amb)", dim:"var(--dim)", grid:"var(--line)"};
function gnum(n,d){ return (Math.round(n*Math.pow(10,d||0))/Math.pow(10,d||0)); }
function gfmt(v,o){ if(v==null||isNaN(v)) return "–"; var d=(o&&o.dec!=null)? o.dec : (Math.abs(v)>=100? 0 : Math.abs(v)>=10? 1 : 2); return String(gnum(v,d)).replace(".",","); }
function gvuoto(t){ return '<div class="gvuoto">'+esc(t||"Servono più rilevazioni per disegnare l'andamento.")+'</div>'; }

/* linea: pts [{x,y,l}] con y null = buco; o.band [lo,hi] fascia bersaglio; o.ref [{y,t}] righe tratteggiate */
function gLine(pts, o){
  o=o||{};
  var ok=pts.filter(function(p){ return p.y!=null && !isNaN(p.y); });
  if(ok.length<2) return gvuoto(o.vuoto);
  var W=o.w||320, H=o.h||116, L=34, R=14, T=14, B=20;
  var x0=Math.min.apply(null,ok.map(function(p){return p.x;})), x1=Math.max.apply(null,ok.map(function(p){return p.x;})); if(x1===x0) x1=x0+1;
  var ys=ok.map(function(p){return p.y;}); if(o.band){ ys.push(o.band[0], o.band[1]); } (o.ref||[]).forEach(function(r){ ys.push(r.y); });
  var lo=Math.min.apply(null,ys), hi=Math.max.apply(null,ys); if(o.min!=null) lo=Math.min(lo,o.min); if(o.max!=null) hi=Math.max(hi,o.max);
  var pad=(hi-lo)*0.12 || Math.abs(hi)*0.05 || 1; lo-=pad; hi+=pad; if(o.zero && lo>0) lo=0;
  var X=function(x){ return L+(x-x0)/(x1-x0)*(W-L-R); }, Y=function(y){ return T+(hi-y)/(hi-lo)*(H-T-B); };
  var s='<svg viewBox="0 0 '+W+' '+H+'" class="gch" role="img" aria-label="'+esc(o.alt||"Andamento")+': da '+gfmt(ok[0].y)+' a '+gfmt(ok[ok.length-1].y)+'">';
  [lo+pad, (lo+hi)/2, hi-pad].forEach(function(v){ s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+r1(Y(v))+'" y2="'+r1(Y(v))+'" class="gg"/><text x="'+(L-5)+'" y="'+r1(Y(v)+3)+'" text-anchor="end" class="gt">'+gfmt(v,o.dec)+'</text>'; });
  if(o.band) s+='<rect x="'+L+'" y="'+r1(Y(o.band[1]))+'" width="'+(W-L-R)+'" height="'+r1(Math.max(1,Y(o.band[0])-Y(o.band[1])))+'" class="gband"/>';
  (o.ref||[]).forEach(function(r){ s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+r1(Y(r.y))+'" y2="'+r1(Y(r.y))+'" class="gref"/><text x="'+(W-R)+'" y="'+r1(Y(r.y)-3)+'" text-anchor="end" class="gt amb">'+esc(r.t||"")+'</text>'; });
  var seg=[], cur=[]; pts.forEach(function(p){ if(p.y==null||isNaN(p.y)){ if(cur.length) seg.push(cur); cur=[]; } else cur.push(p); }); if(cur.length) seg.push(cur);
  var col=o.color||GC.line;
  seg.forEach(function(sg){
    if(sg.length>1){
      if(o.area) s+='<path d="M'+r1(X(sg[0].x))+','+r1(Y(lo+pad*0.2))+sg.map(function(p){ return 'L'+r1(X(p.x))+','+r1(Y(p.y)); }).join("")+'L'+r1(X(sg[sg.length-1].x))+','+r1(Y(lo+pad*0.2))+'Z" fill="'+col+'" opacity=".12"/>';
      s+='<polyline points="'+sg.map(function(p){ return r1(X(p.x))+","+r1(Y(p.y)); }).join(" ")+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    }
  });
  if(o.dots!==false && ok.length<=40) ok.forEach(function(p,i){ s+='<circle cx="'+r1(X(p.x))+'" cy="'+r1(Y(p.y))+'" r="'+(i===ok.length-1?3.6:2)+'" fill="'+(i===ok.length-1?col:"var(--bg)")+'" stroke="'+col+'" stroke-width="1.5"/>'; });
  else { var q=ok[ok.length-1]; s+='<circle cx="'+r1(X(q.x))+'" cy="'+r1(Y(q.y))+'" r="3.6" fill="'+col+'"/>'; }
  var q2=ok[ok.length-1], tx=Math.min(W-R, Math.max(L+14, X(q2.x)));
  s+='<text x="'+r1(tx)+'" y="'+r1(Y(q2.y)-7)+'" text-anchor="middle" class="gv">'+gfmt(q2.y,o.dec)+(o.unit||"")+'</text>';
  var xl=o.xl||[ok[0], ok[ok.length-1]];
  xl.forEach(function(p,i){ if(p.l) s+='<text x="'+r1(X(p.x))+'" y="'+(H-5)+'" text-anchor="'+(i===0?"start":(i===xl.length-1?"end":"middle"))+'" class="gt">'+esc(p.l)+'</text>'; });
  return s+'</svg>';
}
/* barre: items [{l,v,parts:[{v,c}]}] */
function gBars(items, o){
  o=o||{};
  if(!items.length || !items.some(function(i){ return (i.v||0)>0; })) return gvuoto(o.vuoto);
  var W=o.w||320, H=o.h||116, L=26, R=6, T=16, B=18, n=items.length, g=4, bw=(W-L-R-(n-1)*g)/n;
  var mx=Math.max.apply(null, items.map(function(i){ return i.v||0; }).concat([o.line||0, o.max||0]))*1.12||1;
  var Y=function(v){ return T+(1-v/mx)*(H-T-B); };
  var s='<svg viewBox="0 0 '+W+' '+H+'" class="gch" role="img" aria-label="'+esc(o.alt||"Andamento")+'">';
  [0, mx/2].forEach(function(v){ s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+r1(Y(v))+'" y2="'+r1(Y(v))+'" class="gg"/><text x="'+(L-4)+'" y="'+r1(Y(v)+3)+'" text-anchor="end" class="gt">'+gfmt(v,o.dec!=null?o.dec:0)+'</text>'; });
  if(o.band) s+='<rect x="'+L+'" y="'+r1(Y(o.band[1]))+'" width="'+(W-L-R)+'" height="'+r1(Math.max(1,Y(o.band[0])-Y(o.band[1])))+'" class="gband"/>';
  items.forEach(function(it,i){
    var x=L+i*(bw+g), last=(i===n-1);
    if(it.parts){ var acc=0; it.parts.forEach(function(p){ if(!p.v) return; var y0=Y(acc), y1=Y(acc+p.v); s+='<rect x="'+r1(x)+'" y="'+r1(y1)+'" width="'+r1(bw)+'" height="'+r1(Math.max(0.5,y0-y1))+'" fill="'+p.c+'"/>'; acc+=p.v; }); }
    else { var y=Y(it.v||0); s+='<rect x="'+r1(x)+'" y="'+r1(y)+'" width="'+r1(bw)+'" height="'+r1(Math.max(1,Y(0)-y))+'" rx="2" fill="'+(it.c||(last?GC.amb:GC.line))+'"'+(last?'':' opacity=".85"')+'/>'; }
    if(it.v!=null && (n<=9 || last)) s+='<text x="'+r1(x+bw/2)+'" y="'+r1(Y(it.v||0)-3)+'" text-anchor="middle" class="gt'+(last?' hi':'')+'">'+gfmt(it.v,o.dec!=null?o.dec:0)+'</text>';
    s+='<text x="'+r1(x+bw/2)+'" y="'+(H-5)+'" text-anchor="middle" class="gt'+(last?' amb':'')+'">'+esc(it.l||"")+'</text>';
  });
  if(o.line!=null) s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+r1(Y(o.line))+'" y2="'+r1(Y(o.line))+'" class="gref"/><text x="'+(W-R)+'" y="'+r1(Y(o.line)-3)+'" text-anchor="end" class="gt amb">'+esc(o.lineT||"")+'</text>';
  return s+'</svg>';
}
/* miniatura: vals con null per i buchi, fascia opzionale */
function gSpark(vals, o){
  o=o||{}; var ok=vals.filter(function(v){ return v!=null && !isNaN(v); });
  if(ok.length<2) return '<svg viewBox="0 0 64 22" class="gsp" aria-hidden="true"></svg>';
  var W=64,H=22,P=3, lo=Math.min.apply(null,ok), hi=Math.max.apply(null,ok);
  if(o.band){ lo=Math.min(lo,o.band[0]); hi=Math.max(hi,o.band[1]); } if(hi===lo){ hi+=1; lo-=1; }
  var n=vals.length, X=function(i){ return P+i/(n-1||1)*(W-2*P); }, Y=function(v){ return P+(hi-v)/(hi-lo)*(H-2*P); };
  var s='<svg viewBox="0 0 '+W+' '+H+'" class="gsp" aria-hidden="true">';
  if(o.band) s+='<rect x="0" y="'+r1(Y(o.band[1]))+'" width="'+W+'" height="'+r1(Math.max(1,Y(o.band[0])-Y(o.band[1])))+'" class="gband"/>';
  var pts=[]; vals.forEach(function(v,i){ if(v!=null && !isNaN(v)) pts.push(r1(X(i))+","+r1(Y(v))); });
  s+='<polyline points="'+pts.join(" ")+'" fill="none" stroke="'+(o.color||GC.line)+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>';
  var li=vals.length-1; while(li>0 && (vals[li]==null||isNaN(vals[li]))) li--;
  return s+'<circle cx="'+r1(X(li))+'" cy="'+r1(Y(vals[li]))+'" r="2.2" fill="'+(o.color||GC.line)+'"/></svg>';
}
/* calendario a colori: celle {c:colore, t:titolo}, righe = giorni, colonne = settimane */
function gHeat(cols, o){
  o=o||{}; var cw=o.cw||13, gap=3, n=cols.length, W=n*(cw+gap), H=7*(cw+gap)+16;
  var s='<svg viewBox="0 0 '+(W+22)+' '+H+'" class="gch heat" style="max-width:'+Math.round((W+22)*1.75)+'px" role="img" aria-label="'+esc(o.alt||"Calendario")+'">';
  ["L","M","M","G","V","S","D"].forEach(function(g,r){ s+='<text x="0" y="'+(r*(cw+gap)+cw-2)+'" class="gt">'+g+'</text>'; });
  cols.forEach(function(col,i){
    col.cells.forEach(function(c,r){ s+='<rect x="'+(22+i*(cw+gap))+'" y="'+(r*(cw+gap))+'" width="'+cw+'" height="'+cw+'" rx="3" fill="'+(c? c.c : "var(--surf2)")+'">'+(c&&c.t?'<title>'+esc(c.t)+'</title>':'')+'</rect>'; });
    if(col.l) s+='<text x="'+(22+i*(cw+gap)+cw/2)+'" y="'+(H-3)+'" text-anchor="middle" class="gt'+(col.cur?' amb':'')+'">'+esc(col.l)+'</text>';
  });
  return s+'</svg>';
}

/* ---------- serie storiche ---------- */
function settimaneN(n){
  var w=weekOf(today()), out=[], primo=Math.min.apply(null, weeks().concat([w]));
  for(var i=n-1;i>=0;i--){ if(w-i>=Math.max(24,primo)) out.push(w-i); }
  return out;
}
var _KS={};
function kpiW(w){ var c=_KS[w]; if(!c || c.t!==_KSV){ c=_KS[w]={t:_KSV, v:kpi(w)}; } return c.v; }
var _KSV=0; function kpiCacheReset(){ _KSV++; }
function giorniN(n){ var out=[]; for(var i=n-1;i>=0;i--){ var d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-i); out.push(d2s(d)); } return out; }
/* media mobile a 7 giorni di un campo del benessere, per ogni giorno (usa i giorni con dato nei 7 precedenti) */
function mm7(campo, giorni, minimo){
  return giorni.map(function(d){ var v=benFinestra(campo, d, 7, true); return v.length>=(minimo||2)? media(v) : null; });
}
function lblData(d){ return d.slice(0,5); }
function ptsDaily(giorni, vals){ return giorni.map(function(d,i){ return {x:i, y:vals[i], l:lblData(d)}; }); }

/* e1RM: carico x (1 + ripetizioni/30), la serie migliore del giorno. Attendibile fino a ~10-12 ripetizioni. */
var LIFT_CHIAVE=["Box Squat","Floor Press manubri","Rematore manubri","Shoulder Press manubri","Bulgarian Split Squat manubri","Split-stance RDL"];
function e1rmStoria(ex){
  var per={};
  S.log.forEach(function(r){ if(r.ex!==ex || !(r.load>0) || !dataOk(r.date)) return;
    (r.reps||[]).forEach(function(x){ if(x<1||x>15) return; var e=r.load*(1+x/30); if(!per[r.date] || e>per[r.date]) per[r.date]=e; }); });
  return Object.keys(per).sort(function(a,b){ return s2d(a)-s2d(b); }).map(function(d){ return {d:d, y:per[d]}; });
}

/* una serie per ogni KPI: {pts, tipo, band, ref, unit, nota} */
function kpiStoria(id){
  var ws=settimaneN(12), K=ws.map(kpiW), lab=function(w){ return String(w); }, nota="";
  var pw=function(f){ return ws.map(function(w,i){ return {x:i, y:f(K[i],w), l:"s"+w}; }); };
  var bw=function(f,c){ return ws.map(function(w,i){ return {l:String(w), v:f(K[i],w)}; }); };
  var T={
    aderenza:function(){ return {tipo:"bar", items:bw(function(k){ return k.target? Math.round(k.n/k.target*100) : 0; }), line:100, lineT:"100%", unit:"%", nota:"Sedute fatte sul bersaglio della settimana."}; },
    serie_gruppo:function(){ return {tipo:"bar", items:bw(function(k){ var n=0; Object.keys(TGT).forEach(function(g){ var v=k.grp[g]||0; if(v>=TGT[g][0]&&v<=TGT[g][1]) n++; }); return n; }), line:7, lineT:"7", nota:"Quanti gruppi su 7 sono nel range di serie."}; },
    serie_dure:function(){ return {tipo:"line", pts:pw(function(k){ return k.dure.pct; }), band:[85,100], unit:"%", min:50, max:100, nota:"Percentuale di serie dure: la fascia verde è il bersaglio."}; },
    top_range:function(){ return {tipo:"line", pts:pw(function(k){ return k.top; }), ref:[{y:70,t:"70%"}], unit:"%", nota:"Serie chiuse al massimo del range."}; },
    cedimenti:function(){ return {tipo:"bar", items:bw(function(k){ return k.rir0; }), nota:"Composti chiusi a RIR 0: meno è meglio."}; },
    record:function(){ var m={}; prBoard().forEach(function(x){ var w=weekOf(x.date); m[w]=(m[w]||0)+1; }); return {tipo:"bar", items:ws.map(function(w){ return {l:String(w), v:m[w]||0}; }), nota:"Nuovi record per settimana."}; },
    durata:function(){ return {tipo:"line", pts:pw(function(k){ return k.dur; }), ref:[{y:70,t:"70′"}], unit:"′", nota:"Durata media delle sedute."}; },
    asimmetria:function(){ return {tipo:"line", pts:pw(function(k){ return k.n? k.asim : null; }), ref:[{y:10,t:"10%"}], unit:"%", min:0, nota:"Differenza fra ripetizioni sinistra e destra."}; },
    pendenza:function(){ return {tipo:"peso"}; },
    proteine:function(){ var g=giorniN(56), v=g.map(function(d){ var b=benOn(d); var pe=ultimoPeso(); return (b&&b.cibP&&pe)? b.cibP/pe : null; });
      var m=g.map(function(d,i){ var w=v.slice(Math.max(0,i-6),i+1).filter(function(x){ return x!=null; }); return w.length>=2? media(w) : null; });
      return {tipo:"line", pts:ptsDaily(g,m), ref:[{y:1.6,t:"1,6 g/kg"}], unit:"", dec:2, nota:"Media mobile a 7 giorni, grammi per kg."}; },
    kcal:function(){ var tg=cibTarget().kcal, g=giorniN(56), v=g.map(function(d){ var b=benOn(d); return (b&&(b.cibP||b.cibC||b.cibG))? 4*b.cibP+4*b.cibC+9*b.cibG : null; });
      var m=g.map(function(d,i){ var w=v.slice(Math.max(0,i-6),i+1).filter(function(x){ return x!=null; }); return w.length>=3? media(w) : null; });
      return {tipo:"line", pts:ptsDaily(g,m), band:[tg*0.9,tg*1.1], dec:0, nota:"Media mobile a 7 giorni; la fascia è ±10% del target ("+tg+" kcal)."}; },
    giorni_cibo:function(){ return {tipo:"bar", items:ws.map(function(w){ var n=S.ben.filter(function(b){ return b.w===w && (b.cibP||b.cibC||b.cibG); }).length; return {l:String(w), v:n}; }), line:5, lineT:"5", nota:"Giorni con almeno un pasto registrato."}; },
    vita_altezza:function(){ var al=S.profilo&&+S.profilo.altezza; if(!al) return {tipo:"vuoto", t:"Inserisci l'altezza dal profilo."};
      var p=S.mis.filter(function(m){ return m.vita && dataOk(m.date); }).sort(function(a,b){ return s2d(a.date)-s2d(b.date); }).map(function(m,i){ return {x:s2d(m.date).getTime()/86400000, y:m.vita/al, l:lblData(m.date)}; });
      return {tipo:"line", pts:p, ref:[{y:0.5,t:"0,5"}], dec:3, nota:"Vita / altezza a ogni misura."}; },
    hrv7:function(){ var g=giorniN(60), m=mm7("hrv",g,3), h=hrvStato(today());
      return {tipo:"line", pts:ptsDaily(g,m), band:h? [h.basso,h.alto] : null, dec:0, nota:"Media a 7 giorni; fascia verde = la tua norma (60 giorni, ±½ DS)."}; },
    fc7:function(){ var g=giorniN(60), m=mm7("rhr",g,3), n=rhrNorma(today());
      return {tipo:"line", pts:ptsDaily(g,m), band:n? [n*0.97,n*1.05] : null, dec:0, nota:"Media a 7 giorni; fascia = norma da -3% a +5%."}; },
    sonno7:function(){ var g=giorniN(60), m=mm7("sonno",g,3); return {tipo:"line", pts:ptsDaily(g,m), ref:[{y:7,t:"7 h"}], dec:1, unit:" h", nota:"Media a 7 giorni delle ore di sonno."}; },
    stress7:function(){ var g=giorniN(60), m=mm7("stress",g,3); return {tipo:"line", pts:ptsDaily(g,m), ref:[{y:1.5,t:"1,5"}], dec:1, min:0, nota:"Media a 7 giorni dello stress percepito (0-3)."}; },
    reflusso7:function(){ var g=giorniN(60), m=mm7("refl",g,3); return {tipo:"line", pts:ptsDaily(g,m), ref:[{y:0.5,t:"0,5"}], dec:1, min:0, nota:"Media a 7 giorni del reflusso (0-3)."}; },
    dolore:function(){ return {tipo:"dolore"}; },
    passi:function(){ var p=S.ben.filter(function(b){ return b.passi && dataOk(b.date); }).sort(function(a,b){ return s2d(a.date)-s2d(b.date); }).slice(-14).map(function(b,i){ return {x:i, y:+b.passi, l:lblData(b.date)}; });
      return {tipo:"line", pts:p, ref:[{y:8000,t:"8.000"}], dec:0, nota:"Media giornaliera della settimana (da Zepp)."}; },
    ipopnea:function(){ var p=S.ben.filter(function(b){ return b.ipo!=null && b.ipo!=="" && dataOk(b.date); }).sort(function(a,b){ return s2d(a.date)-s2d(b.date); }).slice(-14).map(function(b,i){ return {x:i, y:+b.ipo, l:lblData(b.date)}; });
      return {tipo:"line", pts:p, ref:[{y:5,t:"5/h"}], dec:1, min:0, nota:"Indice settimanale: un andamento da mostrare al medico, non una diagnosi."}; },
    mobilita:function(){ var p=(S.mob||[]).filter(function(m){ return dataOk(m.date); }).map(function(m,i){ var mx=null; MOB.filter(function(t){ return t.bi; }).forEach(function(t){ var d=mobAsym(m,t.k); if(d!==null) mx=Math.max(mx||0, Math.abs(d)); }); return {x:i, y:mx, l:lblData(m.date)}; });
      return {tipo:"line", pts:p, ref:[{y:2,t:"2"}], dec:1, min:0, nota:"Massima differenza sinistra-destra ad ogni rilevazione."}; },
    completezza:function(){ return {tipo:"bar", items:ws.map(function(w){ var n=S.ben.filter(function(b){ return b.w===w && mattinaFatta(b); }).length; return {l:String(w), v:n}; }), line:5, lineT:"5", nota:"Mattine registrate per settimana."}; },
    camminate:function(){ var g=giorniN(56), m=mm7("camm",g,3); return {tipo:"line", pts:ptsDaily(g,m), ref:[{y:1.5,t:"1,5"}], dec:1, min:0, nota:"Media a 7 giorni delle camminate dopo i pasti."}; }
  };
  var f=T[id]; return f? f() : {tipo:"vuoto", t:"Nessuna storia per questo indicatore."};
}
/* serie breve per la miniatura nel cruscotto */
function kpiSpark(id){
  var s; try{ s=kpiStoria(id); }catch(e){ return ""; }
  if(s.tipo==="line"){ var v=s.pts.map(function(p){ return p.y; }); if(v.length>26){ var st=Math.ceil(v.length/26); v=v.filter(function(x,i){ return i%st===(v.length-1)%st; }); } return gSpark(v,{band:s.band}); }
  if(s.tipo==="bar") return gSpark(s.items.map(function(i){ return i.v; }),{});
  return "";
}
function kpiGrafico(id){
  var s=kpiStoria(id), h="";
  if(s.tipo==="line") h=gLine(s.pts,{band:s.band, ref:s.ref, unit:s.unit, dec:s.dec, min:s.min, max:s.max, alt:id});
  else if(s.tipo==="bar") h=gBars(s.items,{line:s.line, lineT:s.lineT, band:s.band, dec:s.dec, alt:id});
  else if(s.tipo==="peso"){ var sl=weightSlope(); h= sl.ok? pesoChart(sl) : gvuoto("Servono 6 pesate valide."); }
  else if(s.tipo==="dolore") h=dolStrip();
  else h=gvuoto(s.t);
  return '<div class="gwrap">'+h+'</div>'+(s.nota?'<div class="xs mut" style="margin-top:4px">'+esc(s.nota)+'</div>':'');
}

/* ---------- dolore: calendario delle ultime sei settimane ---------- */
function dolStrip(){
  var n=6, w=weekOf(today()), cols=[];
  for(var i=n-1;i>=0;i--){
    var ww=w-i, date=dateSettimana(ww), cells=date.map(function(d){
      if(giorniFa(d)<0) return null;
      var b=benOn(d), m=dolDi(b,"dolmz","dolm"), s=S.sess.filter(function(x){ return x.date===d; }).map(function(x){ return dolDi(x,"dolz","dol"); });
      var mx=dolMax(m); s.forEach(function(x){ mx=Math.max(mx, dolMax(x)); });
      var reg=!!(b && ((b.dolmz!=null&&b.dolmz!=="")||(b.dolm!=null&&b.dolm!==""))) || s.length;
      if(!reg) return {c:"var(--surf2)", t:d.slice(0,5)+": non registrato"};
      var z=Object.keys(m).concat(s.map(function(x){ return Object.keys(x).join(","); })).filter(Boolean).join(", ");
      return {c: mx>5? "var(--alert)" : mx>=3? "var(--amb)" : mx>0? "#9DB86A" : "var(--ok)", t:d.slice(0,5)+": "+(mx? mx+"/10 "+z : "nessun dolore")};
    });
    cols.push({cells:cells, l:String(ww), cur:i===0});
  }
  return gHeat(cols,{alt:"Dolore degli ultimi 42 giorni"})+'<div class="mmleg" style="margin-top:6px"><span><i style="background:var(--ok)"></i>nessuno</span><span><i style="background:#9DB86A"></i>1-2</span><span><i style="background:var(--amb)"></i>3-5</span><span><i style="background:var(--alert)"></i>6+</span><span><i style="background:var(--surf2)"></i>non registrato</span></div>';
}
/* costanza: ogni cella e' un giorno, colorato se ti sei allenato */
function costanzaStrip(){
  var n=12, w=weekOf(today()), cols=[];
  for(var i=n-1;i>=0;i--){ var ww=w-i; if(ww<24) continue;
    var date=dateSettimana(ww), cells=date.map(function(d){
      if(giorniFa(d)<0) return null;
      var s=S.sess.filter(function(x){ return x.date===d; })[0];
      if(!s) return {c:"var(--surf2)", t:d.slice(0,5)};
      var c = isRest(s)? "var(--amb)" : (s.mod==="Pesi"? "var(--glow)" : (s.mod==="Bande"||s.mod==="Corpo libero"||s.mod==="Ridotta"||s.mod==="Essenziale")? "#7FB8C8" : "var(--ok)");
      return {c:c, t:d.slice(0,5)+": "+s.day+" "+(s.mod||"")};
    });
    cols.push({cells:cells, l:String(ww), cur:i===0}); }
  return gHeat(cols,{alt:"Allenamenti delle ultime settimane"})+'<div class="mmleg" style="margin-top:6px"><span><i style="background:var(--glow)"></i>pesi</span><span><i style="background:#7FB8C8"></i>bande · corpo · ridotta</span><span><i style="background:var(--amb)"></i>riposo</span></div>';
}
