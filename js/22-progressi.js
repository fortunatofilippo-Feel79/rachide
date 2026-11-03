/* ============================================================
   PROGRESSI — le schede: serie per gruppo, forza, recupero, costanza
   ============================================================ */
var PAL_M={sh:"fg-mapb", sk:"fg-mapb", pt:"fg-mapb", so:"fg-mapb"};
var PROG_OFF=0;   /* 0 = settimana in corso, 1 = la scorsa */

/* dirette e indirette separate, stesso conteggio di serieGruppo (RIR 4+ vale mezza) */
function serieGruppoSplit(righe){
  var d={}, ind={};
  righe.forEach(function(r){
    var g=meta(r.ex).g, n=serieRiga(r);
    d[g]=(d[g]||0)+n;
    (IND[r.ex]||[]).forEach(function(g2){ ind[g2]=(ind[g2]||0)+n*0.5; });
  });
  var out={};
  Object.keys(TGT).forEach(function(g){ out[g]={dir:Math.round((d[g]||0)*2)/2, ind:Math.round((ind[g]||0)*2)/2}; });
  return out;
}
/* stato di un gruppo: settimana chiusa = quello che hai fatto; in corso = dove stai andando */
function statoGruppo(g, fatte, proj, inCorso){
  var r=TGT[g];
  if(!inCorso) return fatte<r[0]? "sotto" : fatte>r[1]? "sopra" : "ok";
  if(proj==null) proj=fatte;
  if(proj>r[1]) return "sopra";
  if(proj<r[0]) return "buco";
  return fatte>=r[0]? "ok" : "rotta";
}
var STATO_G={ok:{c:"var(--ok)", t:"nel range"}, rotta:{c:"var(--glow)", t:"in rotta"}, buco:{c:"var(--amb)", t:"serve altro"},
  sopra:{c:"var(--amb)", t:"sopra"}, sotto:{c:"var(--alert)", t:"sotto"}};

/* ---------- il corpo, davanti e dietro, con i gruppi colorati ---------- */
function mappaCorpo(st){
  var p=pFronte({hn:[12,33], hf:[-12,33], tn:75, tf:105}), P=fgPosa(p);
  var dx=72, s='<svg viewBox="70 14 152 128" class="mappa" role="img" aria-label="Serie dure per gruppo muscolare, davanti e dietro">';
  var Z=function(g, vista){
    var c=(st[g]&&STATO_G[st[g].stato])? STATO_G[st[g].stato].c : "var(--dim)", o='', add=function(cx,cy,rx,ry,ang){ o+='<ellipse cx="'+fgR(cx)+'" cy="'+fgR(cy)+'" rx="'+fgR(rx)+'" ry="'+fgR(ry)+'" transform="rotate('+fgR(ang||0)+' '+fgR(cx)+' '+fgR(cy)+')" fill="'+c+'" opacity=".92"/>'; };
    var B=P.braccia, G=P.gambe, seg=function(a,b){ return Math.atan2(b[1]-a[1], b[0]-a[0])*180/Math.PI; }, mid=function(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; };
    ["n","f"].forEach(function(l){
      if(g==="Spalle") add(B[l].s[0], B[l].s[1]+1, 5.4, 5.6, 0);
      if(g==="Bicipiti" && vista==="f"){ var m=mid(B[l].s,B[l].e,0.55); add(m[0],m[1],3.4,8.4,seg(B[l].s,B[l].e)-90); }
      if(g==="Tricipiti" && vista==="b"){ var m2=mid(B[l].s,B[l].e,0.55); add(m2[0],m2[1],3.6,8.4,seg(B[l].s,B[l].e)-90); }
      if(g==="Gambe"){ var q=mid(G[l].h,G[l].k,0.5);
        if(vista==="f") add(q[0],q[1],4.9,11.5,seg(G[l].h,G[l].k)-90);
        else { add(q[0],q[1]+1,4.6,11,seg(G[l].h,G[l].k)-90); var cf=mid(G[l].k,G[l].a,0.35); add(cf[0],cf[1],3.4,7.5,seg(G[l].k,G[l].a)-90); add(G[l].h[0]+(l==="n"?2.8:-2.8), G[l].h[1]-2.5, 5.6, 5, 0); } }
    });
    var sp=function(t){ return fgSpina(P,t).q; };
    if(g==="Petto" && vista==="f"){ var c0=sp(0.8); add(c0[0]-5.8,c0[1],6,4.8,0); add(c0[0]+5.8,c0[1],6,4.8,0); }
    if(g==="Core" && vista==="f"){ var c1=sp(0.33); add(c1[0],c1[1]+1,7.4,9,0); }
    if(g==="Dorso" && vista==="b"){ var c2=sp(0.72); add(c2[0],c2[1],12.5,7.5,0); var c3=sp(0.46); add(c3[0],c3[1],9.5,8.5,0); }
    return o;
  };
  var disegna=function(vista, ox){
    var q='<g transform="translate('+ox+' 0)">'+fgCorpo(P, p, null, PAL_M);
    ["Petto","Core","Bicipiti","Spalle","Dorso","Tricipiti","Gambe"].forEach(function(g){ q+=Z(g, vista); });
    /* il numero sul gruppo principale */
    var num=function(g,x,y){ if(!st[g]) return ""; return '<text x="'+fgR(x)+'" y="'+fgR(y+3.1)+'" text-anchor="middle" font-size="9" font-weight="800" fill="#0A0F14" pointer-events="none">'+gfmt(st[g].v,1)+'</text>'; };
    /* il numero solo sulle zone grandi: i piccoli (spalle, braccia) si leggono nelle barre */
    if(vista==="f"){ var cc=fgSpina(P,0.8).q; q+=num("Petto",cc[0],cc[1]); var cd=fgSpina(P,0.33).q; q+=num("Core",cd[0],cd[1]+1);
      q+=num("Gambe",(P.gambe.n.h[0]+P.gambe.n.k[0])/2+1,(P.gambe.n.h[1]+P.gambe.n.k[1])/2); }
    else { var dd=fgSpina(P,0.72).q; q+=num("Dorso",dd[0],dd[1]); }
    return q+'</g>';
  };
  s+=disegna("f",0)+disegna("b",dx);
  s+='<text x="'+fgR(P.hip[0])+'" y="140" text-anchor="middle" class="lb">DAVANTI</text><text x="'+fgR(P.hip[0]+dx)+'" y="140" text-anchor="middle" class="lb">DIETRO</text></svg>';
  return s;
}

/* ---------- la scheda ---------- */
function cardGruppi(){
  var w=weekOf(today())-PROG_OFF, ws=weeks(), k=kpiW(w), righe=S.log.filter(function(r){ return r.w===w; }), sp=serieGruppoSplit(righe);
  var inCorso=(PROG_OFF===0) && !weekDone(w).ok, bil=null;
  if(inCorso){
    var sed=seduteDelPiano(w).filter(function(e){ return e.stato==="oggi"||e.stato==="futura"; });
    if(!sed.length) sed=generaSettimana(w).sedute;
    bil=bilancio(w, sed); bil.w=w;
  }
  var st={}, nOk=0, buchi=[];
  Object.keys(TGT).forEach(function(g){
    var v=(sp[g].dir+sp[g].ind), proj=bil? bil.gruppi[g].tot : null, s=statoGruppo(g, v, proj, inCorso);
    st[g]={v:v, proj:proj, stato:s}; if(s==="ok"||s==="rotta") nOk++; if(s==="buco"||s==="sotto") buchi.push(g);
  });
  var h='<div class="card"><div class="between"><div class="eyebrow">Serie dure per gruppo</div>'+
    '<div class="pills mini" style="padding:0"><button class="pill'+(PROG_OFF===0?" on":"")+'" data-a="progoff" data-v="0">Questa</button><button class="pill'+(PROG_OFF===1?" on":"")+'" data-a="progoff" data-v="1">Scorsa</button></div></div>'+
    '<div class="xs mut" style="margin-top:4px">Settimana '+w+(inCorso? ' · in corso: il colore dice dove stai andando' : (PROG_OFF===0? ' · '+STATO_SETT[weekDone(w).stato].t : ' · conclusa'))+'</div>'+
    mappaCorpo(st);
  h+='<div class="gruppi">';
  Object.keys(TGT).forEach(function(g){
    var r=TGT[g], x=st[g], sg=sp[g], max=Math.max(r[1]*1.25, x.v, x.proj||0, 1), S_=STATO_G[x.stato];
    var pct=function(n){ return r1(Math.min(100,n/max*100)); };
    h+='<div class="gru"><div class="gh"><b>'+g+'</b><span style="color:'+S_.c+'">'+S_.t+'</span></div>'+
      '<div class="gb"><div class="zn" style="left:'+pct(r[0])+'%;width:'+r1(pct(r[1])-pct(r[0]))+'%"></div>'+
      '<i class="d" style="width:'+pct(sg.dir)+'%;background:'+S_.c+'"></i>'+
      '<i class="n" style="left:'+pct(sg.dir)+'%;width:'+r1(pct(sg.dir+sg.ind)-pct(sg.dir))+'%;background:'+S_.c+'"></i>'+
      (inCorso && x.proj>x.v? '<i class="p" style="left:'+pct(x.v)+'%;width:'+r1(pct(x.proj)-pct(x.v))+'%;border-color:'+S_.c+'"></i>' : '')+
      '</div><div class="gv2"><b style="color:'+S_.c+'">'+gfmt(x.v,1)+'</b><span>/'+r[0]+'–'+r[1]+'</span></div></div>';
  });
  h+='</div>';
  h+='<div class="mmleg" style="margin-top:8px"><span><i style="background:var(--ok)"></i>nel range</span>'+(inCorso?'<span><i style="background:var(--glow)"></i>in rotta</span><span><i style="background:var(--amb)"></i>serve altro</span>':'<span><i style="background:var(--alert)"></i>sotto</span><span><i style="background:var(--amb)"></i>sopra</span>')+'</div>';
  h+='<div class="xs mut" style="margin-top:8px">Barra piena = serie dirette, più chiara = indirette (valgono metà: la panca conta per tricipiti e spalle)'+(inCorso?', tratteggiata = previste dal piano':'')+'. Una serie comoda (RIR 4+) vale mezza. Fascia = 10-20 serie, core 6-12.</div>';
  if(inCorso){
    h+= buchi.length? '<div class="flag info" style="margin-top:8px"><b>'+buchi.length+'</b><div>'+buchi.map(function(g){ return g; }).join(", ")+' rischiano di restare sotto. <button data-a="piano" style="color:inherit;text-decoration:underline;font-weight:700;padding:0">Adatta la settimana</button> per vedere come recuperarle.</div></div>'
       : '<div class="xs" style="margin-top:8px;color:var(--ok);font-weight:700">Con il piano attuale tutti i gruppi chiudono nel range.</div>';
  }
  return h+'</div>';
}

/* ---------- forza stimata ---------- */
function cardForza(){
  var liste=LIFT_CHIAVE.map(function(n){ return {n:n, s:e1rmStoria(n)}; }).filter(function(x){ return x.s.length>=2; });
  if(!liste.length) return "";
  var h='<div class="card"><div class="between"><div class="eyebrow">Forza stimata</div><div class="xs mut">per manubrio, kg</div></div>';
  liste.forEach(function(x){
    var a=x.s[0].y, b=x.s[x.s.length-1].y, d=b-a, vals=x.s.map(function(p){ return p.y; });
    h+='<button class="forza" data-a="lift" data-n="'+esc(x.n)+'"><span class="fn">'+esc(x.n.replace(" manubri","").replace(" manubrio",""))+'</span>'+gSpark(vals.slice(-14),{})+
      '<span class="fv"><b>'+gfmt(b,1)+'</b><small style="color:'+(d>0.05?"var(--ok)":d<-0.05?"var(--amb)":"var(--dim)")+'">'+(d>0.05?"▲ +":d<-0.05?"▼ ":"= ")+gfmt(d,1)+'</small></span></button>';
  });
  return h+'<div class="xs mut" style="margin-top:8px">Stima con la formula di Epley, carico × (1 + ripetizioni/30), sulla serie migliore di ogni seduta. Attendibile fino a circa 10-12 ripetizioni. Tocca una riga per l\'andamento.</div></div>';
}
function liftSheet(n){
  var s=e1rmStoria(n); if(s.length<2) return;
  var pts=s.map(function(p,i){ return {x:i, y:p.y, l:p.d.slice(0,5)}; });
  sheet('<div class="eyebrow glow">Forza stimata</div><h2 style="margin:4px 0 8px;font-size:19px">'+esc(n)+'</h2>'+
    '<div class="gwrap">'+gLine(pts,{unit:" kg", dec:1, alt:"Forza stimata di "+n, area:true})+'</div>'+
    '<div class="xs mut" style="margin-top:6px">Ogni punto è una seduta. Il carico cambia per scelta del piano, quindi guarda la tendenza, non il singolo punto.</div>'+
    '<button class="btn" style="margin-top:14px" data-a="x">Chiudi</button>');
}

/* ---------- recupero, costanza, dolore ---------- */
function cardRecuperoGrafico(){
  var g=giorniN(60), m=mm7("hrv",g,3), h=hrvStato(today());
  var out='<div class="card"><div class="between"><div class="eyebrow">Recupero · HRV</div><div class="xs mut">media a 7 giorni</div></div><div class="gwrap">'+
    gLine(ptsDaily(g,m),{band:h? [h.basso,h.alto] : null, dec:0, alt:"HRV, media a 7 giorni", vuoto:"Servono almeno 3 notti con HRV in una settimana."})+'</div>';
  out+='<div class="xs mut" style="margin-top:4px">'+(h? 'Fascia verde = la tua norma ('+h.basso+'-'+h.alto+'): '+(h.trend==="sotto"?'ora sei sotto, tieni i carichi fermi.':h.trend==="sopra"?'ora sei sopra la norma.':'ora sei dentro.') : 'La norma si calcola dopo 14 notti.')+'</div>';
  ["sonno7","fc7","stress7"].forEach(function(id){
    var d=KPI.filter(function(x){ return x.id===id; })[0], v=kpiValori()[id];
    out+='<button class="krow" data-a="kpi" data-v="'+id+'"><i style="background:'+STATO_COL[v.stato]+'"></i><span class="kn">'+esc(d.nome.replace(", media 7 giorni",""))+'</span>'+kpiSpark(id)+'<span class="kv">'+esc(kpiBreve(d,v))+'</span></button>';
  });
  return out+'</div>';
}
function cardCostanza(){
  return '<div class="card"><div class="eyebrow">Costanza · ultime settimane</div><div class="gwrap" style="margin-top:8px">'+costanzaStrip()+'</div></div>';
}
function cardDolore(){
  return '<div class="card"><div class="between"><div class="eyebrow">Dolore · ultime 6 settimane</div><button class="btn sm ghost" data-a="kpi" data-v="dolore">Dettagli</button></div><div class="gwrap" style="margin-top:8px">'+dolStrip()+'</div></div>';
}

/* ---------- Progressi in cinque schede: prima quello che serve ogni settimana ---------- */
var PROG_TAB="sett";
try{ PROG_TAB=localStorage.getItem("rachide:progtab")||"sett"; }catch(e){}
function progTabs(dg){
  var gravi=(dg||[]).filter(function(x){ return DIAG_GRAVE.indexOf(x.k)>=0; }).length;
  var T=[["sett","Settimana"],["forza","Forza"],["salute","Salute"],["diag","Diagnosi"],["kpi","KPI"]];
  return '<div class="ptabs" role="tablist" aria-label="Sezioni di Progressi">'+T.map(function(t){
    return '<button role="tab" aria-selected="'+(PROG_TAB===t[0])+'" class="'+(PROG_TAB===t[0]?"on":"")+'" data-a="ptab" data-v="'+t[0]+'">'+t[1]+
      (t[0]==="diag" && dg && dg.length? '<i class="'+(gravi?"g":"")+'" aria-label="'+dg.length+' da leggere"></i>' : '')+'</button>'; }).join("")+'</div>';
}
function progTab(v){ PROG_TAB=v; try{ localStorage.setItem("rachide:progtab", v); }catch(e){} window._sy=0; render(); window.scrollTo(0,0); }

/* ---------- diagnosi raggruppata: prima i segnali che chiedono di fermarsi ---------- */
var DIAG_GRAVE=["segnale","stallo","crollo","dolore"];
var DIAG_GRUPPI=[
  {t:"Da guardare subito", k:["segnale","dolore","crollo","stallo"]},
  {t:"Volume e carichi", k:["volume","leggero","rir","durata","warm","attesa"]},
  {t:"Lati e mobilità", k:["asim","mob"]},
  {t:"Recupero, peso e cibo", k:["spinta","comp","stress"]}
];
function cardDiagnosi(dg){
  var h='<div class="between" style="margin:16px 0 6px"><div class="eyebrow">Diagnosi</div>'+
    '<div class="xs" style="font-weight:700;color:'+(dg.length?"var(--amb)":"var(--ok)")+'">'+(dg.length? dg.length+" da leggere" : "nulla da segnalare")+'</div></div>';
  var usati={};
  DIAG_GRUPPI.forEach(function(G){
    var xs=dg.filter(function(x){ return G.k.indexOf(x.k)>=0; }); if(!xs.length) return;
    xs.forEach(function(x){ usati[dg.indexOf(x)]=1; });
    h+=gruppoDiag(G.t, xs);
  });
  var altri=dg.filter(function(x,i){ return !usati[i]; });
  if(altri.length) h+=gruppoDiag("Altro", altri);
  return h+'<div class="xs mut" style="margin:12px 0 0">La diagnosi legge solo i numeri. Cambiare esercizio o ridistribuire il volume è una decisione da portare al coach.</div>';
}
function gruppoDiag(titolo, xs){
  var cls=function(x){ return (x.k==="segnale"||x.k==="stallo"||x.k==="crollo"||x.k==="dolore") ? "stop" : (x.k==="leggero"||x.k==="volume"||x.k==="rir") ? "disc" : "info"; };
  var riga=function(x){ return '<div class="flag '+cls(x)+'"><b>'+esc(x.t)+'</b><div>'+esc(x.m)+'</div></div>'; };
  var h='<div class="dgr"><div class="eyebrow" style="margin:12px 0 6px">'+esc(titolo)+' · '+xs.length+'</div>';
  h+=xs.slice(0,3).map(riga).join("");
  if(xs.length>3) h+='<details class="altro"><summary>Altre '+(xs.length-3)+'</summary>'+xs.slice(3).map(riga).join("")+'</details>';
  return h+'</div>';
}
