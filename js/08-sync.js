/* ============================================================
   COLLEGAMENTO AL FOGLIO
   Il foglio è la memoria: si legge all'avvio, si scrive a fine
   sessione. La memoria locale diventa solo una copia di comodo,
   e se sparisce non succede niente.
   Lettura via JSONP (aggira le restrizioni cross-origin di Apps
   Script), scrittura via POST text/plain (richiesta "semplice",
   quindi senza preflight).
   ============================================================ */
var SYNC = {
  busy:false, last:null, state:"", err:"", pending:0, repaired:0, scartate:0, scartatePer:{}, esempioData:"", ver:1,
  cfg(){ return S.sync || {}; },
  on(){ return !!(S.sync && S.sync.url); },

  jsonp(url){
    return new Promise(function(res,rej){
      var cb="rch_"+Math.random().toString(36).slice(2), s=document.createElement("script");
      var t=setTimeout(function(){ done(); rej(new Error("nessuna risposta entro 20s")); },20000);
      function done(){ clearTimeout(t); try{ delete window[cb]; }catch(e){ window[cb]=undefined; }
        if(s.parentNode) s.parentNode.removeChild(s); }
      window[cb]=function(d){ done(); res(d); };
      s.onerror=function(){ done(); rej(new Error("URL non raggiungibile")); };
      s.src=url+(url.indexOf("?")<0?"?":"&")+"callback="+cb;
      document.body.appendChild(s);
    });
  },
  async pull(){
    var c=this.cfg(), u=c.url+"?k="+encodeURIComponent(c.secret||"");
    var d=null, e1="";
    try{ var r=await fetch(u,{redirect:"follow"}); d=JSON.parse(await r.text()); }
    catch(err){ e1=String(err.message||err); }
    if(!d){ try{ d=await this.jsonp(u); }
      catch(err2){ throw new Error(e1? (e1+" · "+(err2.message||err2)) : String(err2.message||err2)); } }
    if(!d || !d.ok) throw new Error(d && d.err ? d.err : "risposta non valida");
    return d;
  },

  /* diagnosi: quale strato si rompe */
  async diagnose(){
    var c=this.cfg(), out=[], u=(c.url||"")+"?k="+encodeURIComponent(c.secret||"");
    var framed = (function(){ try{ return window.self!==window.top; }catch(e){ return true; } })();
    out.push({t:"Dove gira l'app", v: framed? "dentro un contenitore isolato (iframe)" : "pagina propria", bad:framed});
    if(!c.url){ out.push({t:"URL", v:"non configurato", bad:true}); return out; }
    out.push({t:"Forma dell'URL", v: /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(c.url)?
      "corretta" : "sospetta: deve essere /macros/s/.../exec", bad: !/\/exec$/.test(c.url)});
    try{ var r=await fetch(u,{redirect:"follow"}); var txt=await r.text();
      try{ var j=JSON.parse(txt);
        out.push({t:"Lettura via fetch", v: j.ok? "riuscita" : "il foglio risponde: "+j.err, bad:!j.ok});
      }catch(e){ out.push({t:"Lettura via fetch", v:"risposta non è JSON (probabile pagina di login: accesso non impostato su Chiunque)", bad:true}); }
    }catch(e){ out.push({t:"Lettura via fetch", v:"bloccata — "+String(e.message||e), bad:true}); }
    try{ var j2=await this.jsonp(u);
      out.push({t:"Lettura via script", v: (j2&&j2.ok)? "riuscita" : "il foglio risponde: "+((j2&&j2.err)||"esito negativo"), bad: !(j2&&j2.ok)});
    }catch(e){ out.push({t:"Lettura via script", v:"bloccata — "+String(e.message||e), bad:true}); }
    return out;
  },
  /* proposta della settimana: la review della domenica la salva su Drive e lo
     script del foglio la restituisce con azione=proposta. undefined = lo script
     non la conosce ancora (risponde con le schede, senza il campo "proposta"). */
  async proposta(){
    var c=this.cfg(), u=c.url+"?k="+encodeURIComponent(c.secret||"")+"&azione=proposta", d=null;
    try{ var r=await fetch(u,{redirect:"follow"}); d=JSON.parse(await r.text()); }
    catch(e){ try{ d=await this.jsonp(u); }catch(e2){ return undefined; } }
    if(!d || !d.ok || !("proposta" in d)) return undefined;
    return d.proposta || null;
  },
  async push(payload){
    var c=this.cfg();
    payload.secret=c.secret||"";
    var r=await fetch(c.url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(payload), redirect:"follow"});
    var t=await r.text();
    var d=JSON.parse(t);
    if(!d.ok) throw new Error(d.err||"scrittura rifiutata");
    return d;
  },
  /* chiede al foglio di rimuovere righe: {sess:[id…], ben:[data…]} */
  async pushDelete(map){
    var c=this.cfg();
    var r=await fetch(c.url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({secret:c.secret||"", del:map}), redirect:"follow"});
    var d=JSON.parse(await r.text());
    if(!d.ok) throw new Error(d.err||"cancellazione rifiutata");
    return d;
  },

  /* riconosce una riga che Sheets ha convertito in data o durata */
  parseReps(v){
    var s=String(v==null?"":v).trim();
    if(!s) return [];
    if(/[TZ:]/.test(s) || /^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{1,2}\/\d{1,2}\//.test(s)) return null;
    var a=s.split(/[|.,;]/).map(function(x){ return parseInt(x,10); }).filter(function(x){ return !isNaN(x); });
    return a.length ? a : null;
  },
  /* fonde due elenchi: il foglio ha ragione sulle righe che conosce,
     ma quello che è nato in locale e non è ancora salito non si tocca */
  /* una riga con data illeggibile mandava in tilt l'ordinamento e spariva
     dagli elenchi trascinandosi dietro le altre: qui viene scartata e contata */
  dataValida(v){ return dataOk(v); },
  fuse(remote, local, key, etichetta){
    var self=this;
    var buone = remote.filter(function(r){ return self.dataValida(r.date); });
    var perse = remote.length - buone.length;
    if(perse){
      this.scartate += perse;
      if(etichetta){
        this.scartatePer[etichetta] = (this.scartatePer[etichetta]||0) + perse;
        if(!this.esempioData){
          var cattiva = remote.filter(function(r){ return !self.dataValida(r.date); })[0];
          if(cattiva) this.esempioData = String(cattiva.date===""||cattiva.date===undefined ? "(vuota)" : cattiva.date).slice(0,24);
        }
      }
    }
    var seen={}; buone.forEach(function(r){ seen[key(r)]=1; });
    var extra = local.filter(function(r){ return !seen[key(r)]; });
    this.pending += extra.length;
    return ordinaData(buone.concat(extra));
  },
  /* dal foglio allo stato dell'app */
  adopt(d, t0){
    t0 = t0 || 0;
    this.pending = 0; this.repaired = 0; this.scartate = 0;
    this.scartatePer = {}; this.esempioData = "";
    this.ver = +d.ver || 1;   /* 2 = lo script del foglio sa modificare e cancellare */
    var self=this;
    var byId = function(r){ return String(r.id||""); }, byDate = function(r){ return String(r.date||""); };
    var locale = {}; S.log.forEach(function(r){ if(r.id) locale[r.id]=r; });
    if(d.log)  S.log  = this.fuse(d.log.map(function(r){
      var rp = self.parseReps(r.reps);
      var loc = locale[String(r.id||"")];
      /* riga alterata dal foglio: se ho l'originale in locale, tengo quello */
      if(rp===null){ self.repaired++; if(loc) return loc; rp=[]; }
      return {id:r.id||uid("l"), w:+r.w||weekOf(r.date), date:r.date, day:r.day, ex:r.ex, side:r.side||"", band:r.band||"",
        load:+r.load||0, reps:rp,
        rir:(r.rir===""||r.rir==null)?null:+r.rir, top:r.top===true||r.top==="Sì"||r.top===1, note:r.note||"",
        rirs: (r.rirs===undefined||r.rirs===null||r.rirs==="") ? (loc&&loc.rirs? loc.rirs : null) : String(r.rirs).split("|").map(function(x){ return x===""? null : +x; }),
        rec:(r.rec===undefined||r.rec===null||r.rec==="") ? (loc&&loc.rec!=null?loc.rec:null) : num(r.rec),
        duro:(r.duro===undefined||r.duro===null||r.duro==="") ? (loc&&loc.duro?loc.duro:"") : String(r.duro),
        dolz:(r.dolz===undefined||r.dolz===null||r.dolz==="") ? (loc&&loc.dolz?loc.dolz:"") : String(r.dolz)};
    }), S.log, byId, "App_Log");
    var locSess={}; S.sess.forEach(function(r){ if(r.id) locSess[r.id]=r; });
    if(d.sess) S.sess = this.fuse(d.sess.map(function(r){
      var ls=locSess[String(r.id||"")];
      return {id:r.id||uid("s"), w:+r.w||weekOf(r.date), date:r.date, day:r.day, sede:r.sede, mod:r.mod, min:+r.min||0,
        en:+r.en||0, warm:r.warm===true||r.warm==="Sì", sig:r.sig===true||r.sig==="Sì", note:r.note||"",
        dol:(r.dol===undefined||r.dol===null||r.dol==="") ? (ls&&ls.dol!=null? ls.dol : null) : num(r.dol),
        dolz:(r.dolz===undefined||r.dolz===null||r.dolz==="") ? (ls&&ls.dolz? ls.dolz : "") : String(r.dolz)};
    }), S.sess, byId, "App_Sessioni");
    if(d.mis)  S.mis  = this.fuse(d.mis.map(function(r){
      return {w:+r.w||weekOf(r.date), date:r.date, peso:num(r.peso), torace:num(r.torace),
        bic:num(r.bic), coscia:num(r.coscia), vita:num(r.vita), note:r.note||""};
    }), S.mis, byDate, "App_Misure");
    /* difesa: i campi introdotti in v2 possono non esistere ancora sul foglio.
       Se la colonna manca del tutto, il valore locale resta. Se c'è ed è vuota,
       vince il foglio come per tutto il resto. */
    var lben={}; S.ben.forEach(function(b){ lben[b.date]=b; });
    var keep=function(r, loc, k){ return (r[k]===undefined) ? (loc?loc[k]:undefined) : num(r[k]); };
    /* il cibo non si azzera mai da foglio vuoto: una colonna appena creata,
       o una rilettura fatta prima di aver inviato, cancellerebbe la giornata. */
    var keepn=function(r, loc, k){ var v=r[k]; return (v===undefined||v===null||v==="") ? (loc?loc[k]:undefined) : num(v); };
    var keeps=function(r, loc, k){ var v=r[k]; return (v===undefined||v===null||v==="") ? (loc?loc[k]:"") : String(v); };
    var dirty=S.dirtyBen||{}, bts=S.benTs||{};
    if(d.ben)  S.ben  = this.fuse(d.ben.map(function(r){
      var loc=lben[r.date];
      /* giornata cambiata sul telefono e non ancora sul foglio, oppure cambiata
         mentre questa rilettura era in viaggio: vince il telefono */
      if(loc && (dirty[r.date] || (bts[r.date]||0)>=t0)){ self.pending++; return loc; }
      return {date:r.date, w:+r.w||weekOf(r.date), refl:num(r.refl), resp:r.resp===true||r.resp==="Sì",
        camm:num(r.camm), hrv:num(r.hrv), read:num(r.read), sonno:num(r.sonno),
        alc:r.alc===true||r.alc==="Sì", note:r.note||"",
        peso:keep(r,loc,"peso"), rhr:keep(r,loc,"rhr"), stress:keep(r,loc,"stress"),
        mente:keep(r,loc,"mente"), passi:keep(r,loc,"passi"), ipo:keep(r,loc,"ipo"), dolm:keepn(r,loc,"dolm"), dolmz:keeps(r,loc,"dolmz"),
        cibP:keepn(r,loc,"cibP"), cibC:keepn(r,loc,"cibC"), cibG:keepn(r,loc,"cibG"),
        cibJ:keeps(r,loc,"cibJ"), sede:keeps(r,loc,"sede"), citta:keeps(r,loc,"citta")};
    }), S.ben, byDate, "App_Benessere");
    if(d.sim) S.sim = this.fuse(d.sim.map(function(r){
      return {date:r.date, w:+r.w||weekOf(r.date), ex:r.ex||"", q:r.q||"", a:r.a||"", side:r.side||""};
    }), S.sim||[], function(r){ return String(r.date||"")+"|"+String(r.ex||"")+"|"+String(r.q||""); }, "App_Simmetria");
    /* mobilità: se il foglio non ha ancora la scheda, resta il locale. */
    if(d.mob) S.mob = this.fuse(d.mob.map(function(r){
      var out={date:r.date, w:+r.w||weekOf(r.date), note:r.note||""};
      MOB.forEach(function(t){
        if(t.bi){ out[t.k+"_s"]=num(r[t.k+"_s"]); out[t.k+"_d"]=num(r[t.k+"_d"]); }
        else out[t.k]=num(r[t.k]);
      });
      return out;
    }), S.mob||[], byDate, "App_Mobilita");
    this.last=new Date(); this.state="ok";
  },
  benRow(r){
    return {date:r.date,w:r.w,refl:r.refl,resp:r.resp?"Sì":"No",camm:r.camm,hrv:r.hrv,
      read:r.read,sonno:r.sonno,alc:r.alc?"Sì":"No",peso:r.peso,rhr:r.rhr,stress:r.stress,
      mente:r.mente,passi:r.passi,ipo:r.ipo,dolm:(r.dolm==null?"":r.dolm),dolmz:r.dolmz||"",cibP:r.cibP,cibC:r.cibC,cibG:r.cibG,cibJ:r.cibJ,sede:r.sede||"",citta:r.citta||"",note:r.note};
  },
  /* dallo stato dell'app al foglio: solo quello che manca, quindi si può ripetere */
  payloadAll(){
    return {
      log: S.log.map(r=>({id:r.id,w:r.w,date:r.date,day:r.day,ex:r.ex,gruppo:meta(r.ex).g,side:r.side,band:r.band,
        load:r.load,reps:r.reps.join("|"),serie:r.reps.length,tot:r.reps.reduce((a,b)=>a+b,0),
        vol:r.load*r.reps.reduce((a,b)=>a+b,0),rir:r.rir,rirs:(r.rirs||[]).map(function(x){ return x==null?"":x; }).join("|"),top:r.top?"Sì":"No",note:r.note,rec:(r.rec==null?"":r.rec),duro:r.duro||"",dolz:r.dolz||""})),
      sess: S.sess.map(r=>({id:r.id,w:r.w,date:r.date,day:r.day,sede:r.sede,mod:r.mod,min:r.min,en:r.en,
        warm:r.warm?"Sì":"No",sig:r.sig?"Sì":"No",dol:(r.dol==null?"":r.dol),dolz:r.dolz||"",note:r.note})),
      mis: S.mis.map(r=>({w:r.w,date:r.date,peso:r.peso,torace:r.torace,bic:r.bic,coscia:r.coscia,vita:r.vita,note:r.note})),
      ben: S.ben.map(r=>SYNC.benRow(r)),
      sim: (S.sim||[]).map(r=>({date:r.date,w:r.w,ex:r.ex,q:r.q,a:r.a,side:r.side})),
      mob: (S.mob||[]).map(function(r){
        var o={date:r.date,w:r.w};
        MOB.forEach(function(t){
          if(t.bi){ o[t.k+"_s"]=r[t.k+"_s"]; o[t.k+"_d"]=r[t.k+"_d"]; } else o[t.k]=r[t.k];
        });
        o.note=r.note; return o;
      }),
      piano: pianoRows(),
      stato: statoRows()
    };
  }
};
function num(v){ if(v===""||v==null) return null; var n=+String(v).replace(",","."); return isNaN(n)?null:n; }
