// --------------------------------------------
// -- Funzioni helper di uso generale
// --------------------------------------------


function winGlobals() {
  //x = {};
  //var iframe = document.createElement('iframe');
  //iframe.onload = function () {
  //  var standardGlobals = Object.keys(iframe.contentWindow);
  //  for (var b in window) {
  //    const prop = window[b];
  //    if (window.hasOwnProperty(b) && prop && !prop.toString().includes('native code') && !standardGlobals.includes(b)) {
  //      x[b] = prop;
  //    }
  //  }
  //  console.log(x);
  //};
  //iframe.src = 'about:blank';
  //document.body.appendChild(iframe);

  var fx = function () {
    var standardGlobals = ["top", "window", "location", "external", "chrome", "document", "inlineCSS", "target", "width", "height", "canvas", "data", "DOMURL", "img", "svg", "ctx", "url", "w", "a", "speechSynthesis", "webkitNotifications", "localStorage", "sessionStorage", "applicationCache", "webkitStorageInfo", "indexedDB", "webkitIndexedDB", "crypto", "CSS", "performance", "console", "devicePixelRatio", "styleMedia", "parent", "opener", "frames", "self", "defaultstatus", "defaultStatus", "status", "name", "length", "closed", "pageYOffset", "pageXOffset", "scrollY", "scrollX", "screenTop", "screenLeft", "screenY", "screenX", "innerWidth", "innerHeight", "outerWidth", "outerHeight", "offscreenBuffering", "frameElement", "clientInformation", "navigator", "toolbar", "statusbar", "scrollbars", "personalbar", "menubar", "locationbar", "history", "screen", "postMessage", "close", "blur", "focus", "ondeviceorientation", "ondevicemotion", "onunload", "onstorage", "onresize", "onpopstate", "onpageshow", "onpagehide", "ononline", "onoffline", "onmessage", "onhashchange", "onbeforeunload", "onwaiting", "onvolumechange", "ontimeupdate", "onsuspend", "onsubmit", "onstalled", "onshow", "onselect", "onseeking", "onseeked", "onscroll", "onreset", "onratechange", "onprogress", "onplaying", "onplay", "onpause", "onmousewheel", "onmouseup", "onmouseover", "onmouseout", "onmousemove", "onmouseleave", "onmouseenter", "onmousedown", "onloadstart", "onloadedmetadata", "onloadeddata", "onload", "onkeyup", "onkeypress", "onkeydown", "oninvalid", "oninput", "onfocus", "onerror", "onended", "onemptied", "ondurationchange", "ondrop", "ondragstart", "ondragover", "ondragleave", "ondragenter", "ondragend", "ondrag", "ondblclick", "oncuechange", "oncontextmenu", "onclose", "onclick", "onchange", "oncanplaythrough", "oncanplay", "oncancel", "onblur", "onabort", "onwheel", "onwebkittransitionend", "onwebkitanimationstart", "onwebkitanimationiteration", "onwebkitanimationend", "ontransitionend", "onsearch", "onafterprint", "onanimationend", "onanimationiteration", "onanimationstart", "onappinstalled", "onauxclick", "onbeforeinstallprompt", "onbeforeprint", "ondeviceorientationabsolute", "ongotpointercapture", "onlanguagechange", "onlostpointercapture", "onmessageerror", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerup", "onrejectionhandled", "ontoggle", "onunhandledrejection", "getSelection", "print", "stop", "open", "showModalDialog", "alert", "confirm", "prompt", "find", "scrollBy", "scrollTo", "scroll", "moveBy", "moveTo", "resizeBy", "resizeTo", "matchMedia", "requestAnimationFrame", "cancelAnimationFrame", "webkitRequestAnimationFrame", "webkitCancelAnimationFrame", "webkitCancelRequestAnimationFrame", "captureEvents", "releaseEvents", "atob", "btoa", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "TEMPORARY", "PERSISTENT", "getComputedStyle", "getMatchedCSSRules", "webkitConvertPointFromPageToNode", "webkitConvertPointFromNodeToPage", "webkitRequestFileSystem", "webkitResolveLocalFileSystemURL", "openDatabase", "addEventListener", "removeEventListener", "dispatchEvent"];
    var appSpecificGlobals = {};
    for (var w in window) {
      if (standardGlobals.indexOf(w) == -1) appSpecificGlobals[w] = window[w];
    }
    return appSpecificGlobals;
  }
  return fx();
} // winGlobals

// Ritorna la lista delle variabili globali definite nella pagina e in tutte le sue dipendenze.
function winGlobalVars() {
  var aGlobalRet = {};
  // ottiene la lista dei riferimenti globali (funzioni e variabili)
  var aGlobals = winGlobals();
  for (var sKey in aGlobals) {
    if (typeof (aGlobals[sKey]) != "function") {
      aGlobalRet[sKey] = aGlobals[sKey];
    } // if (typeof (aGlobals[sKey]) != "function")
  } // for (var sKey in aGlobals)

  return aGlobalRet;
} // winGlobalVars

// Ritorna la lista delle funzioni globali definite nella pagina e in tutte le sue dipendenze.
function winGlobalFx() {
  var aGlobalRet = {};
  // ottiene la lista dei riferimenti globali (funzioni e variabili)
  var aGlobals = winGlobals();
  for (var sKey in aGlobals) {
    if (typeof (aGlobals[sKey]) == "function") {
      aGlobalRet[sKey]= aGlobals[sKey];
    } // if (typeof (aGlobals[sKey]) == "function")
  } // for (var sKey in aGlobals)

  return aGlobalRet;
} // winGlobalFx



// Costruisce un elenco di descrittori discendenti di un elemento passato, filtrati da un selettore jQuery.
// oElemFrom: elemento da cui partire (BODY se non specificato).
// sExpr: espressione jQuery di filtro.
function docFind(oElemFrom, sExpr) {
  var jElem = (oElemFrom === undefined ? $(document.body) : $(oElemFrom));
  if (oElemFrom === undefined) oElemFrom = jElem.get(0);
  if (sExpr === undefined) sExpr = "*";
  var attr = null;

  // definisce l'array della lista da ritornare
  var oaRet = [];
  // filtra gli elementi discendenti da quello di riferimento
  jElem.find(sExpr).each(function (i, item) {
    //console.log(item.tagName);

    // definisce un descrittore dell'elemento
    var oRet = {
      id: item.id,
      tagName: item.tagName
    };

    // cicla gli attributi dell'elemento per allegarli al descrittore
    //console.log(item.attributes);
    attr = null;
    for (var i = 0; i < item.attributes.length; i++) {
      attr = item.attributes[i];
      // salta gli attributi non espressamente specificati nel codice HTML
      if (attr.specified) {
        oRet[attr.name] = attr.value;
      } // if (attr.specified)
    } // for (var i = 0; i < item.attributes.length; i++)

    // aggiunge il descrittore alla lista
    oaRet.push(oRet);

  }); // jElem.find(sExpr).each ...

  // restituisce la lista di tag trovati
  return oaRet;
} // docFind



// --------------------------------------------
// -- Classi di uso generale
// --------------------------------------------


class ArrayList {  
  
  // Costruttore della classe.
  // Se passato utilizza l'array items come inizializzatore dell'ArrayList.
  //
  // object[] items
  constructor( items ) {
    
    if(items)
      this.items = items;
    else
      this.items = [];
    
  } // constructor
  
  
  push( obj ) {
    this.items.push(obj);
  } // push

  pop() {
    return this.items.pop(); 
  } // pop
  
  get( idx ) {
    return this.items[idx];
  } // get

  remove( idx ) {
    this.items.splice(idx, 1);
  } // remove
  
  count() {
    return this.items.length;
  } // count
  
  clear() {
    this.items = [];
  } // clear
  
} // ArrayList



