/* ============================================================
   CODICE A BARRE — un prodotto confezionato in tre tocchi
   Lettura: BarcodeDetector del sistema dove c'e' (Chrome, Android),
   altrimenti ZXing (Apache 2.0, js/vendor), caricato solo quando
   apri il lettore. Anche da foto o scrivendo il numero.
   Valori: Open Food Facts (licenza ODbL), cercati una volta sola e
   poi tenuti in S.prodotti (e sul foglio, con lo script v3).
   Se il prodotto non c'e' o mancano i valori, si copiano
   dall'etichetta: 4 numeri per 100 g.
   ============================================================ */
var ZX_SRC="js/vendor/zxing-0.23.0.min.js";
var OFF_URL="https://world.openfoodfacts.org/api/v2/product/";
var OFF_CAMPI="code,product_name,product_name_it,generic_name,brands,quantity,serving_size,serving_quantity,nutriments";
var SCAN={stream:null, reader:null, timer:null, mk:"col", attivo:false, letto:false};

/* ---------- codici: EAN-13, EAN-8, UPC-A (12 cifre) ---------- */
function eanValido(c){
  c=String(c||"").replace(/\D/g,"");
  if([8,12,13].indexOf(c.length)<0) return false;
  var cifre=c.split("").map(Number), ctrl=cifre.pop(), s=0;
  cifre.reverse().forEach(function(d,i){ s+= d*(i%2===0?3:1); });
  return (10-(s%10))%10===ctrl;
}
function eanNorm(c){ c=String(c||"").replace(/\D/g,""); return c.length===12 ? "0"+c : c; }   /* UPC-A = EAN-13 con lo zero davanti */

/* ---------- Open Food Facts ---------- */
function numero(v){ if(v==null||v==="") return null; var n=typeof v==="string"? parseFloat(v.replace(",",".")) : +v; return isFinite(n)? n : null; }
function offProdotto(code, p){
  var n=(p&&p.nutriments)||{}, g=function(k){ return numero(n[k]); };
  var kcal=g("energy-kcal_100g");
  if(kcal==null){ var kj=g("energy-kj_100g"); if(kj==null) kj=g("energy_100g"); if(kj!=null) kcal=kj/4.184; }
  var nome=String(p.product_name_it||p.product_name||p.generic_name||"").trim();
  var marca=String(p.brands||"").split(",")[0].trim();
  var serv=numero(p.serving_quantity);
  return {code:code, n:nome||("Prodotto "+code), marca:marca, q:String(p.quantity||""), serv:(serv&&serv>0&&serv<2000)? serv : null,
    servTxt:String(p.serving_size||""), p100:g("proteins_100g"), c100:g("carbohydrates_100g"), g100:g("fat_100g"),
    kcal100: kcal==null? null : Math.round(kcal), fonte:"off", ts:today()};
}
function prodottoCompleto(x){ return !!x && x.p100!=null && x.c100!=null && x.g100!=null; }
async function offCerca(code){
  var r=await fetch(OFF_URL+code+".json?fields="+OFF_CAMPI, {headers:{"Accept":"application/json"}});
  if(r.status===404) return null;
  if(!r.ok) throw new Error("Open Food Facts risponde "+r.status);
  var d=await r.json();
  if(!d || d.status===0 || d.status==="failure" || !d.product) return null;
  return offProdotto(code, d.product);
}
/* grammi -> voce del pasto, nello stesso formato del catalogo */
function voceDaProdotto(x, grammi){
  var k=grammi/100, nome=x.n+(x.marca && x.n.indexOf(x.marca)<0? " · "+x.marca : "");
  return {n:nome, d:Math.round(grammi)+" g", p:Math.round((x.p100||0)*k*10)/10, c:Math.round((x.c100||0)*k*10)/10,
    g:Math.round((x.g100||0)*k*10)/10, bc:x.code};
}
function prodottoSalva(x){
  S.prodotti=S.prodotti||{}; S.prodotti[x.code]=x; cfgTocca("prodotti");
}
function prodottiRecenti(){
  var P=S.prodotti||{};
  return Object.keys(P).map(function(k){ return P[k]; }).sort(function(a,b){ return String(b.uso||b.ts).localeCompare(String(a.uso||a.ts)); });
}

/* ---------- lettore ---------- */
function zxCarica(){
  return new Promise(function(ok, ko){
    if(window.ZXing) return ok(window.ZXing);
    var s=document.createElement("script"); s.src=ZX_SRC;
    s.onload=function(){ window.ZXing? ok(window.ZXing) : ko(new Error("lettore non disponibile")); };
    s.onerror=function(){ ko(new Error("lettore non scaricato")); };
    document.head.appendChild(s);
  });
}
function zxLettore(Z){
  var h=new Map();
  h.set(Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]);
  h.set(Z.DecodeHintType.TRY_HARDER, true);
  return new Z.BrowserMultiFormatReader(h);
}
async function nativoOk(){
  try{ if(!("BarcodeDetector" in window)) return false; var f=await window.BarcodeDetector.getSupportedFormats(); return f.indexOf("ean_13")>=0; }catch(e){ return false; }
}
function scanApri(mk){
  SCAN.mk=mk||"col"; SCAN.letto=false;
  sheet('<div class="eyebrow glow">Codice a barre · '+esc(meal(SCAN.mk).n)+'</div><h2 style="margin:4px 0 10px">Inquadra il codice</h2>'+
    '<div class="scanbox"><video id="scanv" playsinline muted autoplay></video><div class="scanmira"></div><div class="scanmsg" id="scanmsg">Accendo la fotocamera…</div></div>'+
    '<div class="xs mut" style="margin-top:8px">Tieni il codice orizzontale dentro il riquadro, a 10-15 cm. Il primo prodotto si cerca online, poi resta sul telefono.</div>'+
    '<div class="grid2" style="margin-top:12px"><label class="btn" style="cursor:pointer">Da una foto<input type="file" accept="image/*" capture="environment" id="scanf" style="display:none"></label>'+
    '<button class="btn" data-a="scanman">Scrivi il numero</button></div>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="pasto" data-m="'+SCAN.mk+'">Indietro</button>');
  scanVideo();
}
function scanMsg(t){ var m=document.getElementById("scanmsg"); if(m) m.textContent=t; }
async function scanVideo(){
  var v=document.getElementById("scanv"); if(!v) return;
  SCAN.attivo=true;
  try{
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("fotocamera non disponibile");
    if(await nativoOk()){
      SCAN.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}, audio:false});
      v.srcObject=SCAN.stream; await v.play(); scanMsg("");
      var det=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});
      SCAN.timer=setInterval(function(){
        if(!SCAN.attivo || v.readyState<2) return;
        det.detect(v).then(function(cs){ if(cs && cs.length) scanTrovato(cs[0].rawValue); }).catch(function(){});
      }, 250);
    } else {
      var Z=await zxCarica();
      SCAN.reader=zxLettore(Z);
      scanMsg("");
      await SCAN.reader.decodeFromConstraints({video:{facingMode:"environment"}, audio:false}, v, function(res){
        if(res && SCAN.attivo) scanTrovato(res.getText());
      });
    }
  }catch(e){
    scanMsg("Fotocamera non disponibile ("+(e && e.name==="NotAllowedError" ? "permesso negato" : (e.message||e))+"). Usa «Da una foto» o scrivi il numero.");
  }
}
function scanStop(){
  SCAN.attivo=false;
  if(SCAN.timer){ clearInterval(SCAN.timer); SCAN.timer=null; }
  try{ if(SCAN.reader) SCAN.reader.reset(); }catch(e){}
  SCAN.reader=null;
  if(SCAN.stream){ SCAN.stream.getTracks().forEach(function(t){ t.stop(); }); SCAN.stream=null; }
}
/* da una foto: utile se la fotocamera dal vivo non parte (alcune app sulla Home) */
async function scanFoto(file){
  if(!file) return;
  scanMsg("Leggo la foto…");
  var url=URL.createObjectURL(file);
  try{ var code=await decodificaImmagine(url); if(code) scanTrovato(code); else scanMsg("Nessun codice nella foto: riprova più vicino, con il codice orizzontale."); }
  finally{ setTimeout(function(){ URL.revokeObjectURL(url); }, 2000); }
}
async function decodificaImmagine(url){
  if(await nativoOk()){
    try{ var img=new Image(); img.src=url; await img.decode(); var cs=await new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]}).detect(img); if(cs && cs.length) return cs[0].rawValue; }catch(e){}
  }
  try{ var Z=await zxCarica(); var r=await zxLettore(Z).decodeFromImageUrl(url); return r? r.getText() : null; }
  catch(e){ return null; }
}
function scanManuale(){
  scanStop();
  sheet('<div class="eyebrow glow">Codice a barre · '+esc(meal(SCAN.mk).n)+'</div><h2 style="margin:4px 0 10px">Scrivi il numero</h2>'+
    '<label class="fld"><span class="eyebrow">Le cifre sotto le barre (8 o 13)</span><input type="text" inputmode="numeric" id="scann" autocomplete="off" placeholder="8001234567890"></label>'+
    '<button class="btn pri" style="margin-top:12px" data-a="scanmanok">Cerca</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="scan" data-m="'+SCAN.mk+'">Torna alla fotocamera</button>');
  setTimeout(function(){ var i=document.getElementById("scann"); if(i) i.focus(); }, 60);
}
async function scanTrovato(raw){
  var code=eanNorm(raw);
  if(SCAN.letto) return;
  if(!eanValido(code)){ scanMsg("Letto "+raw+", ma il codice non torna: riprova."); return; }
  SCAN.letto=true; scanStop(); suono("serie");
  var x=(S.prodotti||{})[code];
  if(x && prodottoCompleto(x)) return formProdotto(code);
  sheet('<div class="eyebrow glow">Codice '+esc(code)+'</div><h2 style="margin:4px 0 10px">Cerco il prodotto…</h2><div class="sm mut">Open Food Facts, il database libero dei prodotti alimentari.</div>');
  try{
    var y=await offCerca(code);
    if(y){ y.uso=today(); prodottoSalva(y); save(); }
    if(y && prodottoCompleto(y)) return formProdotto(code);
    formEtichetta(code, y, y? "Il prodotto c'è, ma mancano dei valori: copiali dall'etichetta." : "Prodotto non trovato: copia i valori dall'etichetta, la prossima volta lo riconosco subito.");
  }catch(e){
    formEtichetta(code, null, "Non riesco a raggiungere Open Food Facts ("+(e.message||e)+"). Copia i valori dall'etichetta: restano sul telefono.");
  }
}

/* ---------- prodotto: quanto ne hai mangiato ---------- */
var PROD_G=null;
function formProdotto(code, grammi){
  var x=(S.prodotti||{})[code]; if(!x) return;
  var g = grammi || PROD_G || x.serv || 100; PROD_G=g;
  var v=voceDaProdotto(x, g), opz=[];
  if(x.serv) opz.push([x.serv, "1 porzione ("+Math.round(x.serv)+" g)"]);
  [30,50,100,150,200].forEach(function(n){ if(!x.serv || Math.abs(n-x.serv)>2) opz.push([n, n+" g"]); });
  sheet('<div class="eyebrow glow">'+esc(meal(SCAN.mk).n)+' · codice '+esc(code)+'</div>'+
    '<h2 style="margin:4px 0 2px;font-size:18px">'+esc(x.n)+'</h2>'+
    '<div class="xs mut">'+esc([x.marca, x.q].filter(Boolean).join(" · "))+'</div>'+
    '<div class="prod100"><div><b>'+dec(x.p100)+'</b><span>proteine</span></div><div><b>'+dec(x.c100)+'</b><span>carboidrati</span></div><div><b>'+dec(x.g100)+'</b><span>grassi</span></div><div><b>'+(x.kcal100==null?"–":x.kcal100)+'</b><span>kcal</span></div></div>'+
    '<div class="xs mut" style="margin-top:2px">per 100 g'+(x.fonte==="etichetta"?" · dall'etichetta":"")+'</div>'+
    '<div class="eyebrow" style="margin:14px 0 6px">Quanto ne hai mangiato</div>'+
    '<div class="pills" style="flex-wrap:wrap">'+opz.map(function(o){ return '<button class="pill'+(Math.abs(o[0]-g)<0.5?" on":"")+'" data-a="prodg" data-v="'+o[0]+'" data-n="'+code+'">'+esc(o[1])+'</button>'; }).join("")+'</div>'+
    '<label class="fld"><span class="eyebrow">Oppure i grammi esatti</span><input type="number" inputmode="decimal" id="prodgr" data-n="'+code+'" value="'+Math.round(g)+'"></label>'+
    '<div class="card" style="margin:12px 0 0;padding:10px 12px"><div class="between"><div class="sm" style="font-weight:700">'+Math.round(g)+' g</div>'+
      '<div class="sm" style="font-weight:700;color:var(--glow)">'+dec(v.p)+' P · '+dec(v.c)+' C · '+dec(v.g)+' G</div></div>'+
      '<div class="xs mut">≈ '+Math.round(4*v.p+4*v.c+9*v.g)+' kcal · '+b1(v.p/BLK.p)+'P '+b1(v.c/BLK.c)+'C '+b1(v.g/BLK.g)+'G in blocchi</div></div>'+
    '<button class="btn pri" style="margin-top:12px" data-a="prodadd" data-n="'+code+'">Aggiungi a '+esc(meal(SCAN.mk).n.toLowerCase())+'</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="prodedit" data-n="'+code+'">Correggi i valori</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="pasto" data-m="'+SCAN.mk+'">Indietro</button>'+
    (x.fonte==="off"? '<div class="xs mut" style="margin-top:10px">Dati: <a href="https://world.openfoodfacts.org/product/'+esc(code)+'" target="_blank" rel="noopener" style="color:var(--glow)">Open Food Facts</a>, licenza ODbL. Controlla l\'etichetta se un valore ti sembra strano.</div>' : ''));
}
async function prodottoAggiungi(code){
  var x=(S.prodotti||{})[code]; if(!x) return;
  var inp=document.getElementById("prodgr"), g=inp? numero(inp.value) : PROD_G;
  if(!g || g<=0 || g>3000){ toast("Scrivi i grammi"); return; }
  x.uso=today(); prodottoSalva(x);
  await cibAddVoce(SCAN.mk, voceDaProdotto(x, g));
  PROD_G=null; render(); formPasto(SCAN.mk);
  toast(Math.round(g)+" g aggiunti");
}
/* valori dall'etichetta: per 100 g */
function formEtichetta(code, x, msg){
  x=x||{};
  var f=function(id, lab, v){ return '<label class="fld" style="margin:0"><span class="eyebrow">'+lab+'</span><input type="number" step="0.1" inputmode="decimal" id="'+id+'" value="'+(v==null?"":v)+'"></label>'; };
  sheet('<div class="eyebrow amb">Codice '+esc(code)+'</div><h2 style="margin:4px 0 6px">Valori dall\'etichetta</h2>'+
    (msg? '<div class="sm mut">'+esc(msg)+'</div>' : '')+
    '<label class="fld"><span class="eyebrow">Nome</span><input type="text" id="etn" value="'+esc(x.n&&x.n.indexOf("Prodotto ")!==0? x.n : "")+'" placeholder="es. Yogurt greco 0%"></label>'+
    '<div class="eyebrow" style="margin:12px 0 4px">Per 100 g</div>'+
    '<div class="grid2">'+f("etp","Proteine g",x.p100)+f("etc","Carboidrati g",x.c100)+'</div><div class="grid2" style="margin-top:8px">'+f("etg","Grassi g",x.g100)+f("etk","Kcal (facoltativo)",x.kcal100)+'</div>'+
    '<label class="fld"><span class="eyebrow">Una porzione, in grammi (facoltativo)</span><input type="number" inputmode="decimal" id="ets" value="'+(x.serv||"")+'"></label>'+
    '<button class="btn pri" style="margin-top:12px" data-a="etsave" data-n="'+code+'">Salva il prodotto</button>'+
    '<button class="btn ghost" style="margin-top:8px" data-a="pasto" data-m="'+SCAN.mk+'">Annulla</button>');
}
function etichettaSalva(code){
  var v=function(id){ var e=document.getElementById(id); return e? numero(e.value) : null; };
  var n=(document.getElementById("etn")||{}).value||"";
  var p=v("etp"), c=v("etc"), g=v("etg");
  if(!n.trim()){ toast("Scrivi il nome del prodotto"); return; }
  if(p==null||c==null||g==null){ toast("Servono proteine, carboidrati e grassi per 100 g"); return; }
  if(p+c+g>100.5){ toast("Per 100 g la somma non può superare 100: controlla i valori"); return; }
  var old=(S.prodotti||{})[code]||{};
  var x={code:code, n:n.trim(), marca:old.marca||"", q:old.q||"", serv:v("ets"), servTxt:old.servTxt||"", p100:p, c100:c, g100:g,
    kcal100: v("etk")!=null? Math.round(v("etk")) : Math.round(4*p+4*c+9*g), fonte:"etichetta", ts:today(), uso:today()};
  prodottoSalva(x); save();
  formProdotto(code);
}
/* i prodotti gia' letti, per non riprendere la fotocamera ogni volta */
function prodottiCard(mk){
  var l=prodottiRecenti().filter(prodottoCompleto).slice(0,6);
  if(!l.length) return "";
  return '<div class="eyebrow" style="margin-bottom:6px">Prodotti letti col codice</div><div class="card" style="padding:2px 12px;margin-bottom:14px">'+
    l.map(function(x){ return '<button class="item" data-a="prodapri" data-n="'+esc(x.code)+'" data-m="'+mk+'"><div class="t"><b>'+esc(x.n)+'</b><span class="xs mut">'+
      esc([x.marca, (x.serv? Math.round(x.serv)+" g a porzione" : "")].filter(Boolean).join(" · "))+'</span></div>'+
      '<div class="xs" style="font-weight:700;color:var(--glow);white-space:nowrap">'+dec(x.p100)+'P · '+dec(x.c100)+'C · '+dec(x.g100)+'G</div></button>'; }).join("")+
    '</div>';
}
