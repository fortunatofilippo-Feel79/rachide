/* ============================================================
   DOLORE — in qualsiasi zona, con un numero da 0 a 10
   Al mattino (residuo), durante la seduta (il massimo) e sul
   singolo esercizio (il «flag» della guida tecnica).
   Regola del pain-monitoring model (Silbernagel 2007): fino a 5
   durante l'attivita' va bene se al mattino dopo e' rientrato e se
   non sale di settimana in settimana.
   Formato sul foglio: "zona:valore;zona:valore", piu' il massimo.
   ============================================================ */
var ZONE=[["collo","Collo"],["dorsale","Tra le scapole"],["costole","Costole / gibbo"],["lombare","Lombare"],
  ["spalla_sx","Spalla sx"],["spalla_dx","Spalla dx"],["gomito_sx","Gomito sx"],["gomito_dx","Gomito dx"],
  ["polso_sx","Polso o mano sx"],["polso_dx","Polso o mano dx"],["anca_sx","Anca sx"],["anca_dx","Anca dx"],
  ["ginocchio_sx","Ginocchio sx"],["ginocchio_dx","Ginocchio dx"],["caviglia_sx","Caviglia o piede sx"],["caviglia_dx","Caviglia o piede dx"],
  ["altro","Altro"]];
var ZONE_GRUPPI=[["Tronco",["collo","dorsale","costole","lombare"]],["Braccia",["spalla_sx","spalla_dx","gomito_sx","gomito_dx","polso_sx","polso_dx"]],
  ["Gambe",["anca_sx","anca_dx","ginocchio_sx","ginocchio_dx","caviglia_sx","caviglia_dx"]],["",["altro"]]];
function zonaNome(z){ var x=ZONE.filter(function(y){ return y[0]===z; })[0]; return x? x[1] : z; }

/* ---------- formato ---------- */
function dolParse(s){
  var m={}; String(s||"").split(";").forEach(function(p){ var a=p.split(":"); var v=+a[1]; if(a[0] && isFinite(v)) m[a[0].trim()]=v; }); return m;
}
function dolStr(m){
  return Object.keys(m||{}).filter(function(z){ return m[z]>0; }).sort(function(a,b){ return m[b]-m[a]; })
    .map(function(z){ return z+":"+m[z]; }).join(";");
}
function dolMax(m){ var v=Object.keys(m||{}).map(function(z){ return m[z]; }); return v.length? Math.max.apply(null, v) : 0; }
function dolTesto(m){ return Object.keys(m||{}).filter(function(z){ return m[z]>0; }).sort(function(a,b){ return m[b]-m[a]; })
  .map(function(z){ return zonaNome(z)+" "+m[z]; }).join(" · "); }
/* le zone di un record; i dati di prima (solo spalla sinistra) si leggono come tali */
function dolDi(rec, campoZ, campoNum){
  if(!rec) return {};
  if(rec[campoZ]) return dolParse(rec[campoZ]);
  var v=rec[campoNum]; if(v!=null && v!=="" && +v>0){ var m={}; m.spalla_sx=+v; return m; }
  return {};
}
/* conversione una volta sola: il vecchio numero della spalla diventa una zona */
function dolMigra(){
  var n=0;
  (S.ben||[]).forEach(function(b){ if(!b.dolmz && b.dolm!=null && b.dolm!=="" && +b.dolm>0){ b.dolmz="spalla_sx:"+(+b.dolm); n++; } });
  (S.sess||[]).forEach(function(s){ if(!s.dolz && s.dol!=null && s.dol!=="" && +s.dol>0){ s.dolz="spalla_sx:"+(+s.dol); n++; } });
  return n;
}

/* ---------- editor: zone + intensita', con la mappa del corpo ---------- */
var DOLED={};
function dolColore(v){ return v>5 ? "var(--alert)" : v>=3 ? "var(--amb)" : "var(--ok)"; }
function dolMappaSVG(pref, m){
  var N="var(--surf2)";
  var corpo=function(cx){ return '<circle cx="'+cx+'" cy="16" r="9" fill="'+N+'"/><rect x="'+(cx-17)+'" y="27" width="34" height="50" rx="10" fill="'+N+'"/>'+
    '<rect x="'+(cx-27)+'" y="29" width="9" height="44" rx="4.5" fill="'+N+'"/><rect x="'+(cx+18)+'" y="29" width="9" height="44" rx="4.5" fill="'+N+'"/>'+
    '<rect x="'+(cx-15)+'" y="76" width="13" height="58" rx="6" fill="'+N+'"/><rect x="'+(cx+2)+'" y="76" width="13" height="58" rx="6" fill="'+N+'"/>'; };
  /* davanti: la tua sinistra e' a destra dell'immagine; dietro: a sinistra */
  var F=60, B=170, P={
    collo:[[B,27]], dorsale:[[B,40]], costole:[[B+9,52]], lombare:[[B,68]],
    spalla_sx:[[F+20,31],[B-20,31]], spalla_dx:[[F-20,31],[B+20,31]], gomito_sx:[[F+23,52]], gomito_dx:[[F-23,52]],
    polso_sx:[[F+23,71]], polso_dx:[[F-23,71]], anca_sx:[[F+9,80]], anca_dx:[[F-9,80]],
    ginocchio_sx:[[F+8,104]], ginocchio_dx:[[F-8,104]], caviglia_sx:[[F+8,130]], caviglia_dx:[[F-8,130]]};
  var s='<svg viewBox="0 0 230 150" class="dolmap" role="img" aria-label="Mappa del dolore">'+corpo(F)+corpo(B);
  Object.keys(P).forEach(function(z){
    var v=m[z], on=v!=null;
    P[z].forEach(function(q){
      s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(on?7:5.5)+'" fill="'+(on? dolColore(v) : "var(--bg)")+'" stroke="'+(on?"var(--bg)":"var(--dim)")+'" stroke-width="1.5" data-a="dz" data-p="'+pref+'" data-z="'+z+'" style="cursor:pointer"/>';
      if(on) s+='<text x="'+q[0]+'" y="'+(q[1]+3)+'" text-anchor="middle" font-size="8" font-weight="800" fill="#0A0F14" pointer-events="none">'+v+'</text>';
    });
  });
  s+='<text x="'+F+'" y="147" text-anchor="middle" class="lb">DAVANTI</text><text x="'+B+'" y="147" text-anchor="middle" class="lb">DIETRO</text></svg>';
  return s;
}
function dolEditorDentro(pref){
  var m=DOLED[pref]||{}, zs=Object.keys(m);
  var h='<div class="dolwrap">'+dolMappaSVG(pref, m)+'<div class="xs mut" style="text-align:center;margin-top:-2px">Tocca il punto, poi scegli quanto. Sinistra e destra sono le tue.</div></div>';
  ZONE_GRUPPI.forEach(function(g){
    h+=(g[0]? '<div class="kar" style="margin-top:8px">'+g[0]+'</div>' : '')+'<div class="pills" style="flex-wrap:wrap;padding:0">'+g[1].map(function(z){
      return '<button class="pill'+(m[z]!=null?" on":"")+'" data-a="dz" data-p="'+pref+'" data-z="'+z+'">'+esc(zonaNome(z))+'</button>'; }).join("")+'</div>';
  });
  zs.forEach(function(z){
    h+='<div class="dolriga"><div class="sm" style="font-weight:650">'+esc(zonaNome(z))+' <span style="color:'+dolColore(m[z])+'">'+m[z]+'/10</span></div><div class="pills scala" style="padding:0">';
    for(var v=1; v<=10; v++) h+='<button class="pill'+(m[z]===v?" on":"")+'" data-a="dv" data-p="'+pref+'" data-z="'+z+'" data-v="'+v+'">'+v+'</button>';
    h+='</div></div>';
  });
  h+= zs.length ? '<button class="btn sm ghost" style="width:100%;margin-top:8px" data-a="dnone" data-p="'+pref+'">Nessun dolore</button>'
                : '<div class="xs" style="margin-top:6px;color:var(--ok)">Nessun dolore segnato.</div>';
  if(dolMax(m)>5) h+='<div class="flag stop" style="margin-top:8px">⚠<div>Sopra 5: se sei in seduta, ferma la serie. Le salite di carico si fermano finché non rientra.</div></div>';
  return h;
}
function dolEditor(pref, mappa, titolo){
  DOLED[pref]=Object.assign({}, mappa||{});
  return '<div class="fld"><span class="eyebrow">'+esc(titolo)+'</span><div id="ded-'+pref+'">'+dolEditorDentro(pref)+'</div></div>';
}
function dolAggiorna(pref){ var c=document.getElementById("ded-"+pref); if(c) c.innerHTML=dolEditorDentro(pref); }
function dolTocca(pref, z){ var m=DOLED[pref]=DOLED[pref]||{}; if(m[z]!=null) delete m[z]; else m[z]=3; dolAggiorna(pref); }
function dolValore(pref, z, v){ var m=DOLED[pref]=DOLED[pref]||{}; m[z]=v; dolAggiorna(pref); }
function dolNessuno(pref){ DOLED[pref]={}; dolAggiorna(pref); }

/* ---------- il flag sull'esercizio ---------- */
function dolEsercizio(i){
  var d=S.draft, e=d && d.ex[i]; if(!e) return;
  sheet('<div class="eyebrow amb">Durante · '+esc(e.n)+'</div><h2 style="margin:4px 0 6px">Dove senti dolore?</h2>'+
    '<div class="sm mut">Resta segnato su questo esercizio e finisce nella chiusura della seduta.</div>'+
    dolEditor("e", e.dol||{}, "Zona e intensità, 0-10")+
    '<button class="btn pri" style="margin-top:14px" data-a="dolesok" data-i="'+i+'">Salva</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="x">Annulla</button>');
}
function dolEsercizioSalva(i){
  var d=S.draft, e=d && d.ex[i]; if(!e) return;
  e.dol=Object.assign({}, DOLED.e||{});
  var mx=dolMax(e.dol);
  save(); closeSheet(); render();
  if(mx>5){ suono("tardi"); toast("Sopra 5: ferma la serie. Annotato sull'esercizio"); }
  else toast(mx? "Dolore annotato: "+dolTesto(e.dol) : "Nessun dolore su questo esercizio");
}
/* dalla seduta: il massimo per zona tra gli esercizi */
function dolDaSeduta(d){
  var m={}; (d.ex||[]).forEach(function(e){ Object.keys(e.dol||{}).forEach(function(z){ m[z]=Math.max(m[z]||0, e.dol[z]); }); });
  return m;
}

/* ---------- analisi ---------- */
function dolGiorni(giorni){
  /* per ogni giorno: massimo al mattino e zone */
  return S.ben.filter(function(b){ return dataOk(b.date) && giorniDa(b.date)>=0 && giorniDa(b.date)<giorni; })
    .map(function(b){ var m=dolDi(b,"dolmz","dolm"); return {date:b.date, m:m, max:dolMax(m), compilato:(b.dolmz!=null&&b.dolmz!=="")||(b.dolm!=null&&b.dolm!=="")}; });
}
function dolZoneFrequenti(giorni, soglia){
  var c={};
  dolGiorni(giorni).forEach(function(g){ Object.keys(g.m).forEach(function(z){ if(g.m[z]>=(soglia||1)) c[z]=(c[z]||0)+1; }); });
  S.sess.filter(function(s){ return dataOk(s.date) && giorniDa(s.date)<giorni; }).forEach(function(s){
    var m=dolDi(s,"dolz","dol"); Object.keys(m).forEach(function(z){ if(m[z]>=(soglia||1)) c[z]=(c[z]||0)+1; }); });
  return Object.keys(c).sort(function(a,b){ return c[b]-c[a]; }).map(function(z){ return {z:z, n:c[z]}; });
}
function dolDiagnosi(){
  var out=[];
  S.sess.filter(function(s){ return dataOk(s.date) && giorniDa(s.date)<=14; }).forEach(function(s){
    var m=dolDi(s,"dolz","dol"), dopo=d2s(new Date(s2d(s.date).getTime()+86400000)), mm=dolDi(benOn(dopo),"dolmz","dolm");
    Object.keys(m).forEach(function(z){
      if(m[z]>5) out.push({k:"segnale", t:"Dolore "+zonaNome(z).toLowerCase()+" "+m[z]+"/10 · "+s.date.slice(0,5),
        m:"Sopra 5 durante la seduta (giorno "+s.day+"). Niente salite di carico sugli esercizi che la caricano finché al mattino non è sotto 3. Se si ripete, al fisioterapista."});
      else if(mm[z]!=null && mm[z]>=3 && mm[z]>=m[z]) out.push({k:"segnale", t:zonaNome(z)+" non rientrata · "+dopo.slice(0,5),
        m:"Il mattino dopo la seduta era "+mm[z]+"/10, non meno di durante ("+m[z]+"). Il carico di quel giorno era troppo: la prossima volta tieni i carichi fermi."});
    });
  });
  dolZoneFrequenti(14, 3).filter(function(x){ return x.n>=3; }).forEach(function(x){
    out.push({k:"segnale", t:"Dolore ricorrente: "+zonaNome(x.z).toLowerCase()+" · "+x.n+" volte in 14 giorni",
      m:"Tre o più rilevazioni da 3/10 in su in due settimane. Non è un dato da compensare da solo: portalo al fisioterapista con le date (sono nel foglio)."});
  });
  return out;
}
