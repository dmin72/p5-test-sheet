
const CVS_WIDTH = 800;
const CVS_HEIGHT = 370;
// coordinate di pan scan dell'immagine dello spritesheet
let CVS_PANX = 0; 
let CVS_PANY = 0;
//
let VIEW_WIDTH = 280;
let VIEW_HEIGHT = 280;
const WT_CORNICE = 7;

let VIEW_WIDTH2 = VIEW_WIDTH * 1.3;
let VIEW_CTRL_X = VIEW_WIDTH2 + 25;
const VIEW_CTRL_Y = 35;


let _cnv = null;
// immagine spritesheet
let _imgSheet = null;
let _imgLoaded;
let _imgFrame;
let _graphZoom = null;
let _bZoom = false;
let _iPrevZoom = 1.0;

// oggetto sheet vuoto
let _txtSheet = { 
  file: "", 
  frames: [],
  anim: {}
};

let _sBackG = "color(\"ghostwhite\")";
let _lineMode;
let _lineCols = ["black", "blue", "gray", "silver", "white", "silver", "gray", "blue"];
let _idxCol;
let _dtLine;
let _elapsedTime;

let _iScale;
let _pnt0, _pnt1;
let _bSelArea;
let _lastKeyTime;
let _bDragging = false;
let _fDragX = 0.0, _fDragY = 0.0;
let _iWidthSel = 0, _iHeightSel = 0;

let _sheet = null;
let _sprite = null;
let _sAnim = "";

let _perlinX = 0;
let _scrollVel = 0.04;

// array dei rettangoli di frame mostrati nella vista relativa
let _aFrame = [];
let _frameSel = null;


function setup() {
  'use strict';
  // put setup code here
  _cnv = createCanvas(CVS_WIDTH, CVS_HEIGHT);
    
  //background("lightsteelblue");
  //background("ghostwhite");
  background(eval(_sBackG));
  //frameRate(30);
  
  noSmooth();
  
  //let txt = select("#txt1");
  //console.log(txt.value());
  //txt.value("pippo");
  
  _imgLoaded = false;
  _imgFrame = 0;
  
  _lineMode = "";
  _idxCol = 0;
  _dtLine = 0;
  _elapsedTime = 0;
  
  _iScale = 1.0;
  _pnt0 = new Punto();
  _pnt1 = new Punto();
  _bSelArea = false;
  _lastKeyTime = 0;
  
  
  // background canvas
  select("#txtBackG").value(_sBackG);
  
  let perc = floor(_iScale * 100);
  $("#lblZoom").text(perc + "%");
  
  // textarea codice JSON dello spritesheet
  select("#txtSheetJSON").value(JSON.stringify(_txtSheet, null, 2));
  
  let sel = select("#cmbAnim");
  sel.changed(cmbAnim_Changed);
  
  //////
  
  // elementi grafici gestore animazioni
  let el = createSpan("Animazione selezionata");
  el.id("frameSep0");
  el.style("font-size:10px; background-color:white;color:dimgray;font-weight:bold; text-align:center;");
  el.hide();
  el = createSpan("Tutti i frame");
  el.id("frameSep1");
  el.style("font-size:10px; background-color:white;color:dimgray;font-weight:bold; text-align:center;");
  el.hide();
  el = createSlider(0, 100, 0, 1);
  el.id("slideFrame0");
  el.size(100);
  el.hide();
  el = createSlider(0, 100, 0, 1);
  el.id("slideFrame1");
  el.size(100);
  el.hide();
  
    
  
  /// DEBUG /////////////////////////////////////////
  /*
  _sheet = new SpriteSheet();
  let img = null;
  let json = loadJSON("json/agent.json", "json", 
    function(e) {
      console.log(json);

      img = loadImage("pix/agente_sprite2.png", 
        function(e) {
          
          _sheet.setTransparent(img, color(192, 220, 192));
                  
          _sheet.createSheet(json, img);
          _sprite = _sheet.createSprite("AGENT");
        
          _sprite.setDirAnim([ "ag00U", "ag01R", "ag00U", "ag01L" ]);
          _sprite.setIdleAnim([ "ag00U", "ag00R", "ag00U", "ag00L" ]);
        
          console.log(_sheet);
          console.log(_sprite);
      
        }
      );

    });
  */
  /// DEBUG /////////////////////////////////////////
  
}


function draw() {
  'use strict';
  // put drawing code here   
  let txtImg = select("#txtImg");
  let bGIF = (txtImg.value().toLowerCase().indexOf(".gif") > -1);    
  
  //background("ghostwhite");
  background(eval(_sBackG));
  strokeWeight(1);
  
  // secondi passati dalla visualizzazione del frame precedente
  _elapsedTime = deltaTime / 1000.0;
  if(_elapsedTime > 1.0) _elapsedTime = 1.0;
  //console.log(_elapsedTime);
  
  let currTime = millis();
  let fillCol = "";
  
  let app = 0;
  
  // fattore zoom  
  //push();
  //if(_iScale != 1.0) {    
  //  scale(_iScale);
  //}  
  
  //
  // caricamento immagine
  if(_imgLoaded) {
    if(bGIF)
      _imgSheet.pause();
    
    // elimina l'effetto antialiasing per vedere bene i pixel
    noSmooth();
    
    //image(_imgSheet, 0, 0);
    image(_imgSheet, CVS_PANX, CVS_PANY);

    push();
    strokeWeight(1);
    stroke("black");
    noFill();
    rect(CVS_PANX - 1, CVS_PANY - 1, _imgSheet.width + 1, _imgSheet.height + 1);
    pop();
    
    if(bGIF) {
      //console.log("_imgFrame: " + _imgFrame + " / " + _imgSheet.numFrames());
      _imgSheet.setFrame(_imgFrame); 
    }    
  } // if(_imgLoaded)
  //pop();


  //
  // gestione altre funzioni esterne attivabili da toolbar
  //
  switch(_lineMode) {
    // editor animazioni
    case "A":
      if( _imgLoaded ) {

        p5_editorAnimazioni();  
        
        // esce dalla draw
        return;
        
      } // if( _imgLoaded )            
      break;

    default:
      // nasconde elementi potenzialmente visualizzati nell'editor di animazioni
      select("#frameSep0").hide();
      select("#frameSep1").hide();
      select("#slideFrame0").hide();
      select("#slideFrame1").hide();
      
      break;
  } // switch(_lineMode)
  
  
  //
  // tracciamento aree frame da sheet corrente
  strokeWeight(1);
  if(_txtSheet.frames) {  
    stroke("steelblue");
    fillCol = color("lemonchiffon");
    fillCol.setAlpha(50);
    fill(fillCol);

    for(const frame of _txtSheet.frames) {
      if(frame.type == "raster") {
        
        rect(frame.position.x + CVS_PANX, frame.position.y + CVS_PANY, frame.position.w, frame.position.h);  
        
      } // if(frame.type == "raster")            
    } // for(const frame of _txtSheet.frames)    
  } // if(_txtSheet.frames)
  
  
  //
  // marcatori punti  
  if(_imgLoaded && !_pnt0.indef) {
    stroke("steelblue");  
    line(_pnt0.x, 0, _pnt0.x, height);
    line(0, _pnt0.y, width, _pnt0.y);
    
    fill("black");
    noStroke();
    circle(_pnt0.x, _pnt0.y, 4);
    fill("steelblue");
    noStroke();
    circle(_pnt0.x, height - 9, 18);
    textSize(12);
    textAlign(CENTER, BASELINE);
    fill("white");
    text("1", _pnt0.x, height - 5);
  } // if(!_pnt0.indef)
  //
  if(_imgLoaded && !_pnt1.indef) {
    stroke("steelblue");  
    line(_pnt1.x, 0, _pnt1.x, height);
    line(0, _pnt1.y, width, _pnt1.y);
    
    fill("black");
    noStroke();
    circle(_pnt1.x, _pnt1.y, 4);
    fill("steelblue");
    circle(_pnt1.x, height - 9, 18);
    textSize(12);
    textAlign(CENTER, BASELINE);
    fill("white");
    text("2", _pnt1.x, height - 5);
  } // if(!_pnt0.indef)
  
  
  //
  // attivazione colore lampeggiante delle linee
  //console.log(currTime);
  if(currTime - _dtLine > 100.0) {
    _idxCol = ++_idxCol % 8;
    _dtLine = currTime;
  }  
  let lampCol = _lineCols[_idxCol];
  stroke(lampCol);
  //if(_iScale > 1.0) strokeWeight(ceil(_iScale));
  
  //
  // attivazione modalità linee
  let lblCoord = select("#lblCoord");
  lblCoord.html("&nbsp;");
  if(_imgLoaded) {
    //console.log(mouseX + ", " + mouseY);
    
    if(_lineMode == "1") {
      //iApp = mouseY;
      //if(_iScale != 1.0) {
      //  iApp = map(mouseY, 0, height, 0, _imgSheet.height * _iScale);
      //}

      line(mouseX, 0, mouseX, height);
      line(0, mouseY, width, mouseY);
      
      //lblCoord.html("X = " + ceil(mouseX * _iScale) + "; Y = " + ceil(mouseY * _iScale));
      lblCoord.html("m: (" + (mouseX - ceil(CVS_PANX)) + ", " + (mouseY - ceil(CVS_PANY)) + ")");
    }
    else if(_lineMode == "2") {

      line(mouseX, 0, mouseX, height);
      line(0, mouseY, width, mouseY);
      
      //lblCoord.html("X = " + ceil(mouseX * _iScale) + "; Y = " + ceil(mouseY * _iScale));
      lblCoord.html("m: (" + (mouseX - ceil(CVS_PANX)) + ", " + (mouseY - ceil(CVS_PANY)) + ")");
    } // _lineMode     
    
    strokeWeight(1);
    
    //
    // fa lampeggiare la zona selezionata dai punti, se c'è 
    // (se _pnt0 è in alto a sx rispetto a _pnt1)
    if(!_pnt0.indef && !_pnt1.indef && 
       _pnt0.x < _pnt1.x && _pnt0.y < _pnt1.y) {
      // registra che c'è un'area di selezione
      _bSelArea = true;
      
      fillCol = color(lampCol);
      fillCol.setAlpha(20);
      noStroke();
      fill(fillCol);
      rect(_pnt0.x + 1, _pnt0.y + 1, _pnt1.x - _pnt0.x, _pnt1.y - _pnt0.y)
    }
    else {
      _bSelArea = false;
    }
          

    // gestione altre funzioni attivabili da toolbar
    //
    switch(_lineMode) {
        
      default:
        // in questo caso siamo nell'ambiente standard
        // (_lineMode "1" e "2" sono stati già testati più su, 
        //  il "3" viene testato in mousePressed più sotto)        
        break;
    } // switch(_lineMode)
    
        
    //image(_imgSheet, mouseX + (mouseX * (1.0 - _iScale)), mouseY + (mouseY * (1.0 - _iScale)));
    //image(_imgSheet, mouseX, mouseY);
  } // if(_imgLoaded)
  else {
    _bSelArea = false;
  }
      
  // da questo punto in poi il sistema è informato dell'esistenza o della perdita di un'area di selezione
  // ------------------------------------------------------------------------------------------------------
      
  if(_bSelArea && !_pnt0.indef && !_pnt1.indef) {
    select("#lblSelArea").html("(" + (_pnt0.x - ceil(CVS_PANX)) + ", " + (_pnt0.y - ceil(CVS_PANY)) + ") - (" + 
                               (_pnt1.x - ceil(CVS_PANX)) + ", " + (_pnt1.y - ceil(CVS_PANY)) + ")");  
    
    app = int($("#txtSelNord").val());
    if( isNaN(app) ) $("#txtSelNord").val(_pnt0.y - ceil(CVS_PANY));
    app = int($("#txtSelSud").val());
    if( isNaN(app) ) $("#txtSelSud").val(_pnt1.y - ceil(CVS_PANY));
    app = int($("#txtSelOvest").val());
    if( isNaN(app) ) $("#txtSelOvest").val(_pnt0.x - ceil(CVS_PANX));
    app = int($("#txtSelEst").val());
    if( isNaN(app) ) $("#txtSelEst").val(_pnt1.x - ceil(CVS_PANX));
    
  } // if(_bSelArea)
  else {
    select("#lblSelArea").html("&nbsp;");
    
    $("#txtSelNord").val("");
    $("#txtSelSud").val("");
    $("#txtSelOvest").val("");
    $("#txtSelEst").val("");
  } // if(_bSelArea)
  
  
  //
  // riquadro zoom attivo?
  if(_iScale != 1.0) {    
    // determina se ci sono le scrollbar orizzontali
    let bScrollingX = (windowWidth < $(document).width());
    let scrollX = $(document).scrollLeft();
    
    //let iX1 = mouseX - (VIEW_WIDTH / 2), iY1 = mouseY + 28;
    let iX1 = min(width, windowWidth) - VIEW_WIDTH - WT_CORNICE + 3 + 
              (bScrollingX ? (scrollX > 0 ? scrollX - 22 : -22) : 0), 
        iY1 = 5;
    
    // ridimensiona altezza del riquadro, in base all'altezza dell'immagine
    VIEW_HEIGHT = min(height, windowHeight) - WT_CORNICE;
    
    // se il puntatore del mouse è nell'area di zoom sposta il riquadro a sx
    if(mouseX >= iX1 && mouseX < iX1 + VIEW_WIDTH && 
       mouseY >= iY1 && mouseY < iY1 + VIEW_HEIGHT && _lineMode != "A") 
      iX1 = 5;
    
    // disegno del riquadro di zoom    
    push();
    // disegno area di zoom
    strokeWeight(WT_CORNICE);
    stroke("steelblue");
    fill(eval(_sBackG));
    rect(iX1, iY1, VIEW_WIDTH, VIEW_HEIGHT);    
    pop();
    
    strokeWeight(1);
    stroke("black");
    
    if(_imgLoaded) {
      if(mouseX > 0 && mouseX < _imgSheet.width && mouseY > 0 
         && mouseY < _imgSheet.height) {
        setImageMode(CORNER);
        
        let sx = mouseX - (VIEW_WIDTH / 2), sy = mouseY - (VIEW_HEIGHT / 2);
        //if(sx < 0) sx = 0;
        //if(sy < 0) sy = 0;
        let sw = VIEW_WIDTH, sh = VIEW_HEIGHT;
        //if(sw > _imgSheet.width) sw = _imgSheet.width;
        //if(sh > _imgSheet.height) sh = _imgSheet.height;
        let sw2 = sw / _iScale, sh2 = sh / _iScale;
        let sx2 = sx + ((sw - sw2) / 2), sy2 = sy + ((sh - sh2) / 2)
        //console.log(sw + " x " + sh + " - " + sw2 + " x " + sh2);
        //console.log(sx + ", " + sy + " - " + sx2 + ", " + sy2);
        
        //let iCorW2 = ceil(WT_CORNICE / 2);
        //let imgView = _imgSheet.get(sx, sy, sw - WT_CORNICE, sh - WT_CORNICE);
        //image(imgView, (iX1 + iCorW2), (iY1 + iCorW2));
        
        // cattura lo snapshot dell'area intorno al mouse        
        let imgSnap = get(sx2, sy2, sw2, sh2);
        //let imgSnap = get(sx, sy, sw, sh);
        image(imgSnap, iX1 + 5, iY1 + 5, sw - 10, sh - 10);
        //console.log(imgSnap.width + ", " + imgSnap.height);
                              
        /*
        // crea un canvas in cui zommare l'area attorno al mouse
        if (_graphZoom === null) {
          _graphZoom = createGraphics(sw2, sh2);
          _graphZoom.noSmooth();
        }
        else {
          _graphZoom.resizeCanvas(sw2, sh2);
          _graphZoom.clear();
        }
                
        _graphZoom.push();        
        _graphZoom.scale(_iScale);
        _graphZoom.image(imgSnap, 0, 0, sw2, sh2, (sw - sw2) / 2, (sh - sh2) / 2);
        //_graphZoom.image(imgSnap, 0, 0);
        
        let imgSnap2 = _graphZoom.get(0, 0, sw2, sh2);        
        _graphZoom.pop();
        
        // posizionamento nel riquadro della porzione centrata dell'immagine zoomata 
        // image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [sHeight])
        //image(imgSnap2, iX1 + 5, iY1 + 5, (sw - 10) * _iScale, (sh - 10) * _iScale, 
        //      (imgSnap2.width - sw) / 2, (imgSnap2.height - sh) / 2);
        //imgSnap.copy(imgSnap2, (imgSnap2.width - sw) / 2, (imgSnap2.height - sh) / 2, 
        //             sw - 10, sh - 10, 0, 0, sw - 10, sh - 10);
                  
        image(imgSnap2, iX1 + 5, iY1 + 5);
        */
        
      } // if(mouseX > 0 &&      
    } // if(_imgLoaded)    
    
  } // if(_iScale != 1.0)
  

  //
  // tasti freccia premuti
  let bUpKey = keyIsDown(UP_ARROW), bDownKey = keyIsDown(DOWN_ARROW),
      bLeftKey = keyIsDown(LEFT_ARROW), bRightKey = keyIsDown(RIGHT_ARROW);
  // è stato premuto uno dei tasti freccia?
  let bArrowPressed = (bUpKey || bDownKey || bLeftKey || bRightKey);

  //if(keyIsDown(32)) ;
  
  // controllo tastiera per movimento punti
  if(currTime - _lastKeyTime > 100.0 && keyIsPressed ) {
    //console.log("key: " + key + ", " + keyCode);
    
    // lo spostamento fine è abilitato se le modalità 1 o 2 sono attive
    //
    // punto 1
    if(_lineMode == "1" && !_pnt0.indef && bArrowPressed) {
      if(bUpKey) _pnt0.y--;
      if(bDownKey) _pnt0.y++;
      if(bLeftKey) _pnt0.x--;
      if(bRightKey) _pnt0.x++;
    } // if(_lineMode == "1" &&
    //
    if(_lineMode == "2" && !_pnt1.indef && bArrowPressed) {
      if(bUpKey) _pnt1.y--;
      if(bDownKey) _pnt1.y++;
      if(bLeftKey) _pnt1.x--;
      if(bRightKey) _pnt1.x++;
    } // if(_lineMode == "2" &&
    //
    // spostamento selezione attivo solo su selezione impostata
    if(_lineMode == "3" && _bSelArea) {
      if(bUpKey) {
        _pnt0.y--;
        _pnt1.y--;
      }
      if(bDownKey) {
        _pnt0.y++;
        _pnt1.y++;
      }
      if(bLeftKey) {
        _pnt0.x--;
        _pnt1.x--;
      }
      if(bRightKey) {
        _pnt0.x++;
        _pnt1.x++;
      }
    } // if(_lineMode == "3")
    
    // aggiorna text delle coordinate di selezione alla pressione dei tasti freccia
    if(bArrowPressed) aggiornaTxtSel();
    
    // registra ultima rilevazione della tastiera
    _lastKeyTime = currTime;
    
  } // if( keyIsPressed )
//  else {
//
//  } // if( keyIsPressed )
  
  
  // controllo tastiera per movimento pan scan immagine dello spritesheet
  if(keyIsPressed) {
    
    // tasto SHIFT + UP
    //if(keyIsDown(87) && CVS_PANY > 0.0) {
    if(keyIsDown(SHIFT) && keyIsDown(UP_ARROW)) {
      CVS_PANY -= (100 * _elapsedTime);
    }
    // tasto SHIFT + SX
    //if(keyIsDown(65) && CVS_PANX > 0.0) {
    if(keyIsDown(SHIFT) && keyIsDown(LEFT_ARROW)) {
      CVS_PANX -= (100 * _elapsedTime);
    }
    // tasto SHIFT + DOWN
    if(keyIsDown(SHIFT) && keyIsDown(DOWN_ARROW)) {
      CVS_PANY += (100 * _elapsedTime);
    }
    // tasto SHIFT + DX
    if(keyIsDown(SHIFT) && keyIsDown(RIGHT_ARROW)) {
      CVS_PANX += (100 * _elapsedTime);
    }
    
    // aggiorna text delle coordinate di selezione alla pressione dei tasti freccia
    if(bArrowPressed) aggiornaTxtSel();
    
  } // if(keyIsPressed)
  
  
} // draw


function mousePressed() {
  
  // determina se il click è avvenuto all'interno del canvas
  //let pos = _cnv.position();
  if(mouseX < 0 || mouseX > width ||
     mouseY < 0 || mouseY > height)
    return;
  
  //
  // registra le coordinate dei punti
  switch(_lineMode) {
    case "1":
      _pnt0.x = mouseX;
      _pnt0.y = mouseY;
      _pnt0.indef = false;   
      //console.log(_pnt0);
      
      // aggiorna text delle coordinate di selezione
      aggiornaTxtSel();
      
      break;
    case "2":
      _pnt1.x = mouseX;
      _pnt1.y = mouseY;
      _pnt1.indef = false;      
      
      // aggiorna text delle coordinate di selezione
      aggiornaTxtSel();
      
      break;
    case "3":
      
      // se esiste un'area selezionata e si clicca in quella zona
      // il tool si attiva per lo spostamento
      if(_bSelArea && ((mouseX > _pnt0.x && mouseY > _pnt0.y) && 
                       (mouseX < _pnt1.x && mouseY < _pnt1.y))) {      
        
        // se il dragging è stato già avviato non lo riavvia di nuovo
        if(!_bDragging) {
          // salva l'attuale posizione del mouse, la dimensione della selezione 
          // e avvia l'operazione di dragging selezione
          _fDragX = mouseX - _pnt0.x;
          _fDragY = mouseY - _pnt0.y;
          _iWidthSel = _pnt1.x - _pnt0.x,
          _iHeightSel = _pnt1.y - _pnt0.y;          
          
          _bDragging = true;
        } // if(!_bDragging)
        //console.log("dragging: _fDragX=" + _fDragX + ", _fDragY=" + _fDragY);
                
      } // if(_bSelArea &&...
      
      break;
    default:            
      break;
  }
  
  // modalità frame (editor di animazioni)
  if(_aFrame && _aFrame instanceof Array) {
    // se c'è un frame evidenziato
    if(_frameSel) {
      console.log(_frameSel);
      
      // localizza la posizione del frame nello sheet
      const sJSON = $("#txtSheetJSON").val();
      let iP0 = sJSON.indexOf('"' + _frameSel.name + '"');
      if(iP0 > -1) {        
        //console.log(iP0 + "-" + (iP0 + _frameSel.name.length));
        
        //triggerEvent("click", $("#txtSheetJSON")[0]);
        //$("#txtSheetJSON")[0].setSelectionRange(iP0, iP0 + _frameSel.name.length);
        
        $("#txtSheetJSON").focus();
        setSelectionRange($("#txtSheetJSON")[0], iP0, iP0 + _frameSel.name.length + 2);
        $("#txtSheetJSON").focus();
        //$("#txtSheetJSON").select();
        
      } // if(iP0 > -1)
      
      
    } // if(_frameSel)        
  } // if(_aFrame && ...
      
} // mousePressed

function mouseDragged() {
  
  // se è in corso un'operazione di dragging della selezione dei punti
  if(_bDragging) {
    //console.log("dragging");
    
    // effettua lo spostamento dei punti
    _pnt0.x = mouseX - _fDragX;
    _pnt0.y = mouseY - _fDragY;
    _pnt1.x = _pnt0.x + _iWidthSel;
    _pnt1.y = _pnt0.y + _iHeightSel;
        
    // aggiorna text delle coordinate di selezione
    aggiornaTxtSel();
    
  } // if(_bDragging)
  
} // mouseDragged

function mouseReleased() {
  
  // se è in corso un'operazione di dragging della selezione dei punti
  if(_bDragging) {
    //console.log("dropping");
    
    // ferma operazione di dragging selezione
    _bDragging = false;
    
  } // if(_bDragging)
  
} // mouseReleased


function mouseMoved(event) {
  //console.log("mouseMoved");
  
  if(_aFrame && _aFrame instanceof Array) {    
  //  for(let rec of _aFrame) {
  //    if(rec.containsPoint( { x: mouseX, y: mouseY } )) {
  //      console.log(rec);
  //      push();
  //      fill(255, 125);
  //      rect(rec.position.x, rec.position.y, rec.width, rec.height);
  //      pop();
  //    } // if(rec.containsPoint
  //  } // for(let rec of _aFrame)  
  } // if(_aFrame && ...  
} // mouseMoved


function p5_apriImmagine(sImg) {  
  console.log(sImg);
  
  _imgSheet = loadImage(sImg, 
    function(e) {
      console.log(_imgSheet);          
      //image(_imgSheet, 0, 0);
      //redraw();
    
      resizeCanvas((_imgSheet.width > CVS_WIDTH ? _imgSheet.width : CVS_WIDTH), CVS_HEIGHT);
      //console.log(width + " x " + height);
    
      // aggiorna numero frame presenti (se file GIF)
      let sApp = _imgSheet.numFrames();
      if(sApp === undefined) sApp = "1";
      select("#lblNFrame").html(sApp);
    
      // aggiorna il riferimento al nome del file nell'oggetto dello sheet
      _txtSheet.file = sImg;
      select("#txtSheetJSON").value(JSON.stringify(_txtSheet, null, 2));

      p5_resetAnimazioni();
    
      _imgLoaded = true;
    },
    function(e) {
      console.log(e);    
      alert("Errore durante il caricamento dell'immagine!");

      p5_resetAnimazioni();
    
      _imgLoaded = false;     
    }
  );
  
}

function p5_ridimCanvas() {
  if(_imgSheet !== null) {
    resizeCanvas((_imgSheet.width > CVS_WIDTH ? _imgSheet.width : CVS_WIDTH) * _iScale, 
                 (_imgSheet.height > CVS_HEIGHT ? _imgSheet.height : CVS_HEIGHT) * _iScale);
    //console.log(width + " x " + height);    
  }
}


// Provvede ad eliminare i frame di animazione potenzialmente generati dal metodo createSheet
// dello spritesheet, per evitare duplicazioni
function p5_resetAnimazioni() {
  if(_txtSheet && _txtSheet.anim) {
    //try {
      for(let sAnim in _txtSheet.anim) {
        _txtSheet.anim[sAnim].frames = [];
      } // for(let anim of _txtSheet.anim)
    //}
    //catch(e) { }
  } // if(_txtSheet && _txtSheet.anim)

  // elimina gli oggetti globali generati dal metodo
  // (verranno ricreati al prossimo accesso al modulo di animazione)
  _sprite = null;
  _sheet = null;
} // p5_resetAnimazioni


// entry point editor animazioni attivato
function p5_editorAnimazioni() {
  const posEl = select("#defaultCanvas0").position();
  let iApp = 0;
  let el = null;
  if(_imgLoaded) {    
    // se lo sheet globale è stato già caricato usa quello 
    if(!_sheet) {
      // crea uno spritesheet a partire dall'immagine e dallo script corrente
      _sheet = new SpriteSheet();
      _sheet.createSheet(_txtSheet, _imgSheet);
      
      // genera uno sprite a partire dallo spritesheet
      _sprite = _sheet.createSprite();
      
      // alimenta picklist animazioni
      $("#cmbAnim").html("");
      let sel = select("#cmbAnim");      
      for(let i=0; i < _sheet.animList.length; i++)
        sel.option(_sheet.animList[i] + " - " + _sheet.anim[_sheet.animList[i]].descr,
                   _sheet.animList[i]);
      
      if(_sAnim != "") {
        sel.selected(_sAnim);
        // se la selezione è stata accettata
        if(sel.value() == _sAnim) {    
          
          
        } // if(sel.value() == _sAnim)
      } // if(_sAnim != "")     
    } // if(!_sheet)
    
    background(eval(_sBackG));
    // ridimensiona altezza del riquadro, in base all'altezza dell'immagine
    VIEW_HEIGHT = min(height, windowHeight) - WT_CORNICE;
    
    // disegno del riquadro di animazione
    let bPlayG = $("#chkPlayG").is(":checked");
    let bGrav = $("#chkGrav").is(":checked");
    let bScroll = $("#chkScroll").is(":checked");
    // lo sprite sta eseguendo un'animazione di movimento?
    const bInMovAnim = (_sprite.inAnimation && 
                        _sprite.dirAnim.find(a => { return a == _sprite.currAnim; }));
    // sezione frame (solo se playground disattivo)
    let bSezFrame = $("#cmdFrame").hasClass("ico-sel") && !bPlayG;
    
    if(!bPlayG) {
      VIEW_WIDTH2 = VIEW_WIDTH * 1.3;
    }
    else {
      VIEW_WIDTH2 = VIEW_WIDTH * 2.3;
    }
    VIEW_CTRL_X = VIEW_WIDTH2 + 25;
    
    // disegno area di disegno
    push();    
    stroke("steelblue");
    fill(eval(_sBackG));
    // area animazione sprite
    if(!bSezFrame) {
      strokeWeight(WT_CORNICE);
      rect(5, 5, VIEW_WIDTH2, VIEW_HEIGHT); 
            
      _aFrame = [];
      _frameSel = null;
      el = select("#frameSep0");
      el.hide();
      el = select("#frameSep1");
      el.hide();
      el = select("#slideFrame0");
      el.value(0);
      el.hide();
      el = select("#slideFrame1");
      el.value(0);
      el.hide();
    }        
    // visualizzatore frame
    else {
      strokeWeight(1);
      rect(0, 0, VIEW_WIDTH2 + WT_CORNICE + 10, VIEW_HEIGHT + WT_CORNICE); 
      line(0, VIEW_HEIGHT / 2, VIEW_WIDTH2 + WT_CORNICE + 10, VIEW_HEIGHT / 2);
            
      el = select("#frameSep0");
      el.size(VIEW_WIDTH2 + WT_CORNICE + 10);
      el.position(posEl.x, posEl.y);
      el.show();    
      el = select("#slideFrame0");
      el.position(posEl.x + VIEW_WIDTH2 + WT_CORNICE + 5 - el.size().width, 
                  posEl.y - 3);
      el.show();
      el = select("#frameSep1");
      el.size(VIEW_WIDTH2 + WT_CORNICE + 10);
      el.position(posEl.x, posEl.y + VIEW_HEIGHT / 2);
      el.show();
      el = select("#slideFrame1");
      el.position(posEl.x + VIEW_WIDTH2 + WT_CORNICE + 5 - el.size().width, 
                  posEl.y - 4 + VIEW_HEIGHT / 2);
      el.show();
    }
    pop();
    
    // posiziona pannello comandi
    //let sel = createSelect();
    let div = select("#divAnim");
    div.position(VIEW_CTRL_X, VIEW_CTRL_Y);
    // se è aperto lo zoom il pannello comandi deve scomparire
    if(bPlayG && _bZoom)
      $("#divAnim").hide();
    else
      $("#divAnim").show();
    
    if( _bZoom || bPlayG ) {
      $("#divAnim").css("width", "220px");
      $("#tdAnimDx").hide();
    }      
    else {
      $("#divAnim").css("width", "505px");
      $("#tdAnimDx").show();
    }
          
    // esce se non esiste una selezione valida nella picklist delle animazioni
    if(select("#cmbAnim").value() == "" || _sprite.animList.length == 0)
      return;
    
    // se non esiste ancora una larghezza/altezza di riferimento aggiorna lo sprite
    // in modo da riempire le proprietà con i default
    if(_sprite.widthRef == 0 || _sprite.heightRef == 0) {
      _sprite.updateFrame();
      _sprite.updatePosition();
    }
    
    // posiziona lo sprite al centro dell'area di animazione (coordinate di riferimento)
    let x = (VIEW_WIDTH2 - _sprite.widthRef) / 2;
    let y = (VIEW_HEIGHT - _sprite.heightRef) / 2;    
    if( !bPlayG ) {
      _sprite.position.set(x, y);
      _sprite.updActPos();
    }
          
    // playground?
    if(bPlayG && _sprite.position.x == 0 && _sprite.position.y == 0) {
      //console.log("playG: " + VIEW_WIDTH2);
      
      // impostazioni di default per lo sprite nel playground
      _sprite.position.x = 10 + (VIEW_WIDTH2 / 10);
      _sprite.position.y = VIEW_HEIGHT - 34 - _sprite.height;  
      _sprite.updActPos();
      
      // impostazioni di default dei parametri fisici (da rivedere)
      $("#chkGrav")[0].checked = true;
      _sprite.gravity = createVector(0, 2);
      _sprite.damping = 0.65;
      _sprite.maxSpeed = 6.0;      
      
      // offset di partenza per Perlin noise
      _perlinX = 0.1;
    }    
    
    
    // routine di gestione della tastiera per attivazione animazioni/direzione movimento
    if($("#chkKeyb").is(":checked")) {

      p5_AnimTastiera(VIEW_WIDTH2);
      
    } // if($("#chkKeyb").is(":checked"))
    

    //
    // controlli di confinamento dello sprite rispetto all'area di animazione
    //
    // impedisce allo sprite di andare fuori orbita
    if(_sprite.position.y < -_sprite.height - 10) {
      _sprite.position.y = -_sprite.height - 10;
      _sprite.velocity.y = 0.0;
    }      
    // impedisce allo sprite di andare sottoterra
    iApp = VIEW_HEIGHT - 34 - _sprite.height;
    if(_sprite.position.y > iApp) {
      _sprite.position.y = iApp;
      _sprite.velocity.y = 0;
      // definisce una collisione con il terreno
      //console.log("atterraggio");
      bRet = true;
    }
    //    
    // controlli orizzontali (in caso di mancanza di scrolling)
    if(!bScroll) {
      if(_sprite.position.x > VIEW_WIDTH2 - _sprite.width) {
        _sprite.position.x = 10;
        //_sprite.velocity.x *= -1;
      }        
      if(_sprite.position.x < 5) {
        _sprite.position.x = VIEW_WIDTH2 - _sprite.width - 5;
        //_sprite.velocity.x *= -1;
      }        

    } // if(!bScroll)

    
    // chiama l'aggiornamento delle coordinate attuali dello sprite
    _sprite.updActPos();
    //
    // aggiorna stato corrente/animazioni dello sprite     
    _sprite.updateFrame();  
    _sprite.updatePosition();


    // applica la velocità di scrolling, basata sul movimento dello sprite
    // (modalità playground)
    if(bScroll) {
      _scrollVel = 0.0;
      
      // se la posizione dello sprite supera i 4/5 dell'area visibile scrolla a dx
      if(bInMovAnim && _sprite.direction.x == 1 && 
         _sprite.actualPos.x + _sprite.width > VIEW_WIDTH2 * 0.8) {
        // ferma il moto reale dello sprite
        _sprite.velocity.set(0, 0);
        _scrollVel = 0.04;        
      } // if(_sprite.actualPos.x + _sprite.width > ...
      
      // se la posizione dello sprite è inferiore ad 1/5 dell'area visibile scrolla a sx
      if(bInMovAnim && _sprite.direction.x == -1 &&
         _sprite.actualPos.x < (VIEW_WIDTH2 / 5)) {
        // ferma il moto reale dello sprite
        _sprite.velocity.set(0, 0);
        _scrollVel = -0.04;
      } // if(_sprite.actualPos.x <
            
    } // if(bScroll)
    else {
      _scrollVel = 0.0;
      // resetta l'offset Perlin di partenza a quello iniziale
      //_perlinX = 0.1;      
    } // // if(bScroll)
    
    
    // aggiorna ripetutamente il pannello di controllo animazione, ma solo se 
    // non siamo in modalità di editing delle impostazioni
    if( !$("#cmdEditAnim").hasClass("ico-sel") )
      anim_AggiornaPannello();            
    
    //
    // visualizza elementi grafici dell'editor
    //
    push();    
    strokeWeight(1);
    stroke("royalblue");
    
    // griglia di confinamento frame di riferimento
    if($("#chkGrid").is(":checked")) {
      
      // linee orizzontali superiori e inferiori
      for(let i = _sprite.position.x - 5; i < _sprite.position.x + _sprite.widthRef + 5; i += 8) {
        line(i, _sprite.position.y - 1, i + 5, _sprite.position.y - 1);
      }
      for(let i = _sprite.position.x - 5; i < _sprite.position.x + _sprite.widthRef + 5; i += 8) {
        line(i, _sprite.position.y + _sprite.heightRef + 1, i + 5, _sprite.position.y + _sprite.heightRef + 1);
      }
      // linee verticali sinistra e destra
      for(let i = _sprite.position.y - 5; i < _sprite.position.y + _sprite.heightRef + 5; i += 8) {
        line(_sprite.position.x - 1, i, _sprite.position.x - 1, i + 5);
      }
      for(let i = _sprite.position.y - 5; i < _sprite.position.y + _sprite.heightRef + 5; i += 8) {
        line(_sprite.position.x + _sprite.widthRef + 1, i, _sprite.position.x + _sprite.widthRef + 1, i + 5);
      }

      noStroke();
      fill("royalblue");
      textSize(8);
      textStyle(NORMAL);
      textAlign(LEFT, BOTTOM);
      text(`(${int(_sprite.position.x)}, ${int(_sprite.position.y)})`, 
           _sprite.position.x, _sprite.position.y - 6);      
                  
      // griglia di confinamento frame corrente
      let col = color("orange");
      col.setAlpha(200);
      stroke(col);

      for(let i = _sprite.actualPos.x - 5; i < _sprite.actualPos.x + _sprite.width + 5; i += 8) {
        line(i, _sprite.actualPos.y - 1, i + 5, _sprite.actualPos.y - 1);
      }
      for(let i = _sprite.actualPos.x - 5; i < _sprite.actualPos.x + _sprite.width + 5; i += 8) {
        line(i, _sprite.actualPos.y + _sprite.height + 1, i + 5, _sprite.actualPos.y + _sprite.height + 1);
      }
      // linee verticali sinistra e destra
      for(let i = _sprite.actualPos.y - 5; i < _sprite.actualPos.y + _sprite.height + 5; i += 8) {
        line(_sprite.actualPos.x - 1, i, _sprite.actualPos.x - 1, i + 5);
      }
      for(let i = _sprite.actualPos.y - 5; i < _sprite.actualPos.y + _sprite.height + 5; i += 8) {
        line(_sprite.actualPos.x + _sprite.width + 1, i, _sprite.actualPos.x + _sprite.width + 1, i + 5);
      }
      
      noStroke();
      fill("darkorange");
      textSize(10);
      textStyle(NORMAL);
      textAlign(RIGHT, BOTTOM);
      text(`(${int(_sprite.actualPos.x)}, ${int(_sprite.actualPos.y)})`, 
           _sprite.actualPos.x - 6, _sprite.actualPos.y - 6);      
      
    } // if($("#chkGrid").is(":checked"))              
    
    //
    // aggiorna il playground, se attivo
    let xoff = 0, xinc = 0;
    if( bPlayG ) {
            
      xoff = _perlinX;
      xinc = 0.01;
      
      beginShape();
      for(let i = 10; i <= VIEW_WIDTH2; i++) {
        //console.log(xoff);
        const n = noise(xoff);
        const ny = map(n, 0.0, 1.0, 10 + (VIEW_HEIGHT / 3), 10 + (VIEW_HEIGHT * 0.667));
        const ny2 = map(n, 0.0, 1.0, 40, 10 + (VIEW_HEIGHT / 3));
        
        // nuvole
        if(round(xoff * 100) % 400 == 0) {
          disegnaNuvola(i, ny2);
        }          
                
        // vertici del rilievo montuoso
        vertex(i, ny);
        // colorazione monte
        strokeWeight(1);
        stroke(245, 245, 220, 155);
        noFill();
        //stroke("beige")
        line(i, VIEW_HEIGHT, i, ny);
        
        xoff += xinc;        
      } // for(let i = 10; i <= VIEW_WIDTH2; i += 5)
      
      // colore contorno montagne
      stroke(205, 205, 76);
      strokeWeight(1);
      endShape();
                
    } // if( bPlayG )

    
    // visualizza il frame corrente dello sprite    
    _sprite.visible = !bSezFrame;
    _sprite.draw();
    
    
    // playground?
    if( bPlayG ) {            
      xoff = _perlinX;
      
      // disegno manto erboso da sovrapporre allo sprite
      for(let i = 10; i <= VIEW_WIDTH2; i++) {
        const n = noise(xoff);
        const ny = map(n, 0.0, 1.0, VIEW_HEIGHT - 33, VIEW_HEIGHT - 39);

        // manto erboso
        strokeWeight(1);
        stroke(0, 238, 0, 100 + (155 * n));
        line(i, VIEW_HEIGHT, i, ny);
        
        // ridisegna cornice per nascondere il passaggio delle nuvole
        strokeWeight(WT_CORNICE);
        stroke("steelblue");
        rect(5, 5, VIEW_WIDTH2, VIEW_HEIGHT);
        
        xoff += xinc;
      } // for(let i = 10; i <= VIEW_WIDTH2; i += 5)

      
      // ATTENZIONE!
      // incrementi offset dispari (es: 0.01, 0.03, ecc.) generano l'effetto flickering delle nuvole!!!
      // Gli incrementi pari invece generano un'animazione fluida!!! (ma perchè???)
      //_perlinX += 0.02;
      //_perlinX += 0.06;
      //_perlinX += 0.12;
      _perlinX += _scrollVel;
      
    } // if( bPlayG )
        
    
    // visualizzatore di frame attivo?
    if(bSezFrame) {
      //console.log("refresh");
      // animazione selezionata
      const sAnim = select("#cmbAnim").value();
      
      const xFine = 4 + VIEW_WIDTH2 + WT_CORNICE + 3;
      let   yFine = (VIEW_HEIGHT / 2);
            //yFine = 15 + (VIEW_HEIGHT / 2);
      let yF = 15, xF = 4, hF = 0;
      let bMouseOn = false, bChanged = false;
      
      // crea un nuovo array per unire i frame dell'animazione corrente con tutti quelli disponibili
      let aFrames = _sprite.anim[sAnim].frames.concat([]);
      for(let sAnim0 in _sprite.anim)
        if( sAnim0.split("/")[0] != sAnim )
          aFrames = aFrames.concat( _sprite.anim[sAnim0].frames );
      el = select("#slideFrame0");
      el.attribute("max", _sprite.anim[sAnim].frames.length - 1);
      el = select("#slideFrame1");
      el.attribute("max", (aFrames.length - _sprite.anim[sAnim].frames.length) - 1);
      
      _aFrame = [];
      _frameSel = null;
      //for(let i = 0; i < _sprite.anim[sAnim].frames.length; i++) {
      //for(let i = 0; i < aFrames.length; i++) {
      for(let i = select("#slideFrame0").value(); i < aFrames.length; i++) {
        if(i >= _sprite.anim[sAnim].frames.length && !bChanged) {
          xF = 4; yF = 15 + (VIEW_HEIGHT / 2);
          yFine = yF + (VIEW_HEIGHT / 2) - 10;
          
          i += select("#slideFrame1").value();
          bChanged = true;
          //console.log("yFine:" + yFine);
        } // if(i == _sprite.anim[sAnim].frames.length)
        
        const rec = new Rect(xF, yF, aFrames[i].width + 3,
                                     aFrames[i].height + 3);
        
        //rec.anim = (i < _sprite.anim[sAnim].frames.length ? sAnim : undefined);
        rec.anim = aFrames[i].name.split("/")[0];
        rec.frame = aFrames[i]; 
        bMouseOn = rec.containsPoint( { x: mouseX, y: mouseY } );
        if(bMouseOn) {
          fill(255, 255, 0, 125); 
          // frame evidenziato
          _frameSel = aFrames[i];
        }          
        rect(xF, yF, rec.width, rec.height);
        image(aFrames[i].image, xF + 1, yF + 1);
        if(bMouseOn) {
          fill("steelblue");
          rect(xF, yF + rec.height - 15, textWidth(_frameSel.name), 15);
          textSize(10);
          fill(255);
          text(_frameSel.name, rec.position.x + 3, rec.endPoint().y - 5);
        }
        hF = max(hF, aFrames[i].height);
        noFill();
        
        _aFrame.push(rec);
        
        xF += aFrames[i].width + 6;
        iApp = 0;
        if(i + 1 < aFrames.length)
          iApp = aFrames[i + 1].width;
        if(xF + iApp > xFine) {
          xF = 4;
          yF += (hF + 6);
          hF = 0;          
        } // if(xF + iApp > xFine)
        //
        if(yF + aFrames[i].height > yFine) {
          if(i < _sprite.anim[sAnim].frames.length) {
            i = _sprite.anim[sAnim].frames.length - 1;                
            continue;
          }
          else
            break;
        } // if(yF + aFrames[i].height > yFine)            
         
      } // for(let i = select("#slideFrame0").value(); i < aFrames.length; i++)
            
    } // if(bSezFrame)
    
    pop();
    
        
  } // if(_imgLoaded)
} // p5_editorAnimazioni

function disegnaNuvola( x, y ) {  
  stroke(200);
  strokeWeight(1);
  fill(255);
  
  arc(x, y, 50, 50, PI, 0, PIE);
  arc(x - 35, y, 50, 30, PI, 0, PIE);
  arc(x + 45, y, 70, 30, PI, 0, PIE);
  arc(x + 10, y - 1, 140, 35, 0, PI, OPEN);
  
  noFill();  
} // disegnaNuvola



// Routine di animazione pilotata dalla tastiera.
// Funziona se sono stati poplati gli array di direzionamento (_sprite.dirAnim e _sprite.idleAnim).
function p5_AnimTastiera( VIEW_WIDTH2 ) {
  let sDirAnim = "", sIdleAnim = "", sExtraAnim = "";
  let oAnim = null;
  let currTime = millis();
  
  // tasti freccia premuti
  const bUpKey = keyIsDown(UP_ARROW), bDownKey = keyIsDown(DOWN_ARROW),
        bLeftKey = keyIsDown(LEFT_ARROW), bRightKey = keyIsDown(RIGHT_ARROW);
  // è stato premuto uno dei tasti freccia?
  const bArrowPressed = (bUpKey || bDownKey || bLeftKey || bRightKey);
  // è stato premuto CTRL?
  const bCtrlPressed = keyIsDown(CONTROL);
  // è stato premuto ALT?
  const bAltPressed = keyIsDown(ALT);
  
  let bScroll = $("#chkScroll").is(":checked");
  
  // lo sprite sta eseguendo un'animazione di movimento?
  const bInMovAnim = (_sprite.inAnimation && 
                      _sprite.dirAnim.find(a => { return a == _sprite.currAnim; }));
    
  
  // keyIsPressed si impalla quando si premono troppi tasti insieme, quindi è preferibile eseguire
  // il test su tutti i tasti previsti, applicati in OR
  //if( keyIsPressed ) {
  if(bArrowPressed || bCtrlPressed) {
    //console.log(keyCode + ", " + key + ", " + bCtrlPressed);

    // attiva il rilevamento della tastiera in un intervallo stabilito
    if(currTime - _lastKeyTime > 20.0) {      
      //
      // se si sta premendo uno dei tasti freccia e lo sprite è controllabile dall'utente
      if(bArrowPressed && !_sprite.blocked) {

        // resetta e imposta il versore di direzione movimento (coordinate cartesiane):
        // controlla eventuali movimenti non possibili, es: freccia su + freccia giù
        _sprite.direction.set(0, 0);
        if( bUpKey )
          _sprite.direction.y = 1;
        else
          if( bDownKey )
            _sprite.direction.y = -1;

        if( bLeftKey )
          _sprite.direction.x = -1;
        else
          if( bRightKey )
            _sprite.direction.x = 1;

        
        // costruisce il vettore da applicare a quello di accelerazione dello sprite
        let vAcc = createVector(_sprite.direction.x, -1 * _sprite.direction.y);
        // applica la magnitudine al vettore di accelerazione
        vAcc.setMag( float($("#txtVel").val()) );

        if(!bScroll) {
          // applica l'accelerazione
          _sprite.applyForce(vAcc);
        }
        else {
          
          if(((_sprite.actualPos.x + _sprite.width < VIEW_WIDTH2 * 0.8) &&
              (_sprite.actualPos.x > (VIEW_WIDTH2 / 5))) ||
              ((_sprite.actualPos.x + _sprite.width > VIEW_WIDTH2 * 0.8) && _sprite.direction.x == -1) ||
              ((_sprite.actualPos.x < (VIEW_WIDTH2 / 5)) && _sprite.direction.x == 1))
            _sprite.applyForce(vAcc);
          
        } // if(!bScroll)
        
        
        // estrae l'animazione di movimento e di idle collegate alla direzione attuale
        sDirAnim = _sprite.getDirAnim();
        sIdleAnim = _sprite.getIdleAnim();
        //console.log(sDirAnim);

        // se una delle due non è presente esce dalla routine
        if(!sDirAnim || !sIdleAnim || sDirAnim == "" || sIdleAnim == "") {
          if(_sprite.inAnimation) _sprite.stopAnimation(true);
          return;
        }

        // imposta l'animazione idle di direzione come animazione di riferimento
        // per consentire al manager degli sprite di visualizzarla al termine del movimento
        if(_sprite.animRef != sIdleAnim) {
          oAnim = _sprite.anim[sIdleAnim];
          _sprite.animRef = sIdleAnim;
          _sprite.frameRef = 0;
          _sprite.widthRef = oAnim.frames[0].width;
          _sprite.heightRef = oAnim.frames[0].height;        
        } // if(_sprite.animRef != sIdleRef)

        //
        // se c'era già un'animazione di movimento in corso controlla se non sia la stessa 
        // di quella rilevata nella direzione
        if(!(bInMovAnim && _sprite.currAnim == sDirAnim)) {

          // in questo caso va attivata la nuova animazione di movimento
          console.log("play: " + sDirAnim);
          _sprite.playAnimation(sDirAnim, 
            // playCallBack
            function(playAnim, playFrame) {
              //console.log("> " + playAnim + ": " + playFrame);
            },
            // endCallBack
            function(endAnim) {
              console.log("- " + endAnim);
              // manda in riproduzione l'animazione di riferimento
              console.log("play: " + _sprite.animRef);
              _sprite.playAnimation( _sprite.animRef, 
                  function(playAnim, playFrame) {
                    //console.log("> " + playAnim + ": " + playFrame);
                  }, 
                  function(endAnim) { 
                    console.log("- " + endAnim);
                  } );
            }); // playAnimation

        } // if(!(bInMovAnim && _sprite.currAnim == sDirAnim))

      } // if(bArrowPressed)

      //
      // se si sta premendo CTRL, indipendentemente se lo sprite si stia muovendo o no, esegue 
      // l'animazione extra associata che però bloccherà lo sprite da altre animazioni di movimento
      if(bCtrlPressed) {            
        // estrae l'animazione extra collegata alla direzione attuale
        // (il set 0 è quello dedicato all'animazione legata alla pressione del tasto CTRL)
        sExtraAnim = _sprite.getExtraAnim(0);
        // se l'animazione non è presente esce dalla routine
        if(!sExtraAnim || sExtraAnim == "") {
          if(_sprite.inAnimation) _sprite.stopAnimation(true);
          return;
        }      
        // toglie l'eventuale loop dall'animazione (ne viene prevista una sola alla volta)
        _sprite.anim[sExtraAnim].loop = false;

        // se è già in esecuzione la stessa animazione non viene lanciata di nuovo
        if(_sprite.currAnim != sExtraAnim) {                
          console.log("play: " + sExtraAnim);

          //
          // costruisce il vettore da applicare a quello di accelerazione dello sprite
          let vAcc = createVector(_sprite.direction.x, -1 * _sprite.direction.y);
          let vAcc2 = createVector(int($("#txtVelAzX").val()), int($("#txtVelAzY").val()));
          // applica la magnitudine al vettore di accelerazione
          vAcc.setMag( vAcc2.mag() );
          // applica l'accelerazione
          _sprite.applyForce(vAcc);
            
          
          _sprite.blocked = true;
          _sprite.playAnimation(sExtraAnim, 
            // playCallBack
            function(playAnim, playFrame) {
              //console.log("> " + playAnim + ": " + playFrame);
            },
            // endCallBack
            function( endAnim ) {
              console.log("- " + endAnim);
              // riattiva lo sprite per i movimenti
              _sprite.blocked = false;
              // manda in riproduzione l'animazione di riferimento
              console.log("play: " + _sprite.animRef);
              _sprite.playAnimation( _sprite.animRef, 
                  function(playAnim, playFrame) {
                    //console.log("> " + playAnim + ": " + playFrame);
                  }, 
                  function(endAnim) {
                    console.log("- " + endAnim);
                  });            
            }); // playAnimation

        } // if(_sprite.currAnim != sExtraAnim)
      } // if(bCtrlPressed)
      
      // registra ultima rilevazione della tastiera
      _lastKeyTime = currTime;      
    } // if(currTime - _lastKeyTime >
                    
  } // if( keyIsPressed )
  else {

    // se è attiva un'animazione basata sui tasti freccia (movimento) la ferma
    if(bInMovAnim) {
      
      _sprite.stopAnimation(true);
      
    } // if(bInMovAnim)
    
    // non essendoci tasti di controllo premuti non c'è motivo 
    // per cui lo sprite dovrebbe essere bloccato da altri movimenti/azioni
    _sprite.blocked = false;
  } // // if( keyIsPressed )  
} // p5_AnimTastiera


function cmbAnim_Changed(e) {
  //console.log(e);
  
  // animazione selezionata
  let item = this.value();
  _sAnim = item;
  //_sAnim = item.split(" ")[0];
  console.log(item);  
  
  let currAnim = _sprite.anim[item];
  let currFrame = currAnim.frames[0];
  
  //_sprite.currAnim = item;
  //_sprite.currFrame = 0;
  //_sprite.deltaFrame = 0;
  //_sprite.inAnimation = true;
  
}

function anim_AggiornaPannello() {
  
  const sAnim = $("#cmbAnim").val();
  let currAnim = _sprite.anim[sAnim];
  
  $("#txtMillis").val(currAnim.millis);
  $("#chkLoop")[0].checked = (currAnim.loop);
  $("#chkExit")[0].checked = (currAnim.exit);

  let sApp = currAnim.align;
//  switch(sApp) {  
//    case 0:
//      sApp = "Left";
//      break;
//    case 2:
//      sApp = "Right";
//      break;
//    case 1:
//    default:
//      sApp = "Center";
//      break;
//  }
  $("#cmbAlign").val(sApp);
  
  sApp = currAnim.valign;
//  switch(sApp) {  
//    case 0:
//      sApp = "Top";
//      break;
//    case 1:
//      sApp = "Middle";
//      break;
//    case 2:
//    default:
//      sApp = "Bottom";
//      break;
//  }
  $("#cmbVAlign").val(sApp);  
  
  $("#chkRunning")[0].checked = _sprite.runningAnim;  
  $("#chkBlocked")[0].checked = _sprite.blocked;  
  
  let dir = VectUtils.vectorAngle(_sprite.direction);
  $("#txtDir").val(int(dir));
  
  $("#txtCurrAnim").val(_sprite.currAnim);
  $("#txtCurrFrame").val(_sprite.currFrame);
  $("#txtWidth").val(_sprite.width);
  $("#txtHeight").val(_sprite.height);  
  
  $("#txtAnimRef").val(_sprite.animRef);
  $("#txtFrameRef").val(_sprite.frameRef);
  $("#txtWidthRef").val(_sprite.widthRef);
  $("#txtHeightRef").val(_sprite.heightRef);

  // array animazioni direzionali
  let aDir = _sprite.dirAnim;
  if(!aDir) aDir = [];
  sApp = JSON.stringify(aDir);

  $("#txtDirJSON").val(sApp);
  sApp = (!aDir[0] ? "" : aDir[0]);
  $("#txtDirE").val(sApp);
  sApp = (!aDir[1] ? "" : aDir[1]);
  $("#txtDirNE").val(sApp);
  sApp = (!aDir[2] ? "" : aDir[2]);
  $("#txtDirN").val(sApp);
  sApp = (!aDir[3] ? "" : aDir[3]);
  $("#txtDirNW").val(sApp);
  sApp = (!aDir[4] ? "" : aDir[4]);
  $("#txtDirW").val(sApp);
  sApp = (!aDir[5] ? "" : aDir[5]);
  $("#txtDirSW").val(sApp);
  sApp = (!aDir[6] ? "" : aDir[6]);
  $("#txtDirS").val(sApp);
  sApp = (!aDir[7] ? "" : aDir[7]);
  $("#txtDirSE").val(sApp);

  // array direzioni idle
  aDir = _sprite.idleAnim;
  if(!aDir) aDir = [];
  sApp = JSON.stringify(aDir);

  $("#txtIdleJSON").val(sApp);
  sApp = (!aDir[0] ? "" : aDir[0]);
  $("#txtIdleE").val(sApp);
  sApp = (!aDir[1] ? "" : aDir[1]);
  $("#txtIdleNE").val(sApp);
  sApp = (!aDir[2] ? "" : aDir[2]);
  $("#txtIdleN").val(sApp);
  sApp = (!aDir[3] ? "" : aDir[3]);
  $("#txtIdleNW").val(sApp);
  sApp = (!aDir[4] ? "" : aDir[4]);
  $("#txtIdleW").val(sApp);
  sApp = (!aDir[5] ? "" : aDir[5]);
  $("#txtIdleSW").val(sApp);
  sApp = (!aDir[6] ? "" : aDir[6]);
  $("#txtIdleS").val(sApp);
  sApp = (!aDir[7] ? "" : aDir[7]);
  $("#txtIdleSE").val(sApp);

  // array direzioni extra (utilizza il primo array extra per l'animazione del tasto CTRL)
  aDir = null;
  try { aDir = _sprite.extraAnim[0]; }
  catch(e) { }
  if(!aDir) aDir = [];
  sApp = JSON.stringify(aDir);

  $("#txtExtraJSON").val(sApp);
  sApp = (!aDir[0] ? "" : aDir[0]);
  $("#txtExtraE").val(sApp);
  sApp = (!aDir[1] ? "" : aDir[1]);
  $("#txtExtraNE").val(sApp);
  sApp = (!aDir[2] ? "" : aDir[2]);
  $("#txtExtraN").val(sApp);
  sApp = (!aDir[3] ? "" : aDir[3]);
  $("#txtExtraNW").val(sApp);
  sApp = (!aDir[4] ? "" : aDir[4]);
  $("#txtExtraW").val(sApp);
  sApp = (!aDir[5] ? "" : aDir[5]);
  $("#txtExtraSW").val(sApp);
  sApp = (!aDir[6] ? "" : aDir[6]);
  $("#txtExtraS").val(sApp);
  sApp = (!aDir[7] ? "" : aDir[7]);
  $("#txtExtraSE").val(sApp);
  
  // ------
  
  if(!$("#chkGrav").is(":checked")) 
    _sprite.gravity = null;
  else
    if(_sprite.gravity == null)
      _sprite.gravity = createVector(0, 2);
  
  $("#txtGrav").val(_sprite.gravity ? _sprite.gravity.y : "");
  $("#txtMass").val(_sprite.mass);
  $("#txtDamp").val(_sprite.damping);
  $("#txtVelMax").val(_sprite.maxSpeed ? _sprite.maxSpeed : "");
  $("#chkInMov")[0].checked = _sprite.moving;
  
  // vettori
  $("#txtPosVX").val(_sprite.position.x); 
  $("#txtPosVY").val(_sprite.position.y);
  $("#txtActPosVX").val(_sprite.actualPos.x); 
  $("#txtActPosVY").val(_sprite.actualPos.y);
  $("#txtVelVX").val(_sprite.velocity.x); 
  $("#txtVelVY").val(_sprite.velocity.y);  
  $("#txtAccVX").val(_sprite.acceleration.x); 
  $("#txtAccVY").val(_sprite.acceleration.x); 
  
} // anim_AggiornaPannello


function anim_Play() {
  const sAnim = $("#cmbAnim").val();
    
  _sprite.playAnimation(sAnim, null,
    function(sOldAnim) {
      console.log("fine: " + sOldAnim);
    });
}

function anim_Stop( bReset ) {
  
  _sprite.stopAnimation(bReset);
}


// Ferma lo sketch per consentire di apportare modifiche allo sprite corrente.
function anim_Edit() {
  let cmdEdit = $("#cmdEditAnim");
  let cmdUpdAnim = $("#cmdUpdAnim");
  
  if(cmdEdit.hasClass("ico-sel")) {
    
    //loop();
    cmdEdit.removeClass("ico-sel");
    cmdUpdAnim.attr("disabled", "disabled");
    
  } // if(cmdEdit.hasClass("ico-sel"))
  else {
    // ferma lo sketch
    //noLoop();
    
    cmdEdit.addClass("ico-sel");
    cmdUpdAnim.removeAttr("disabled");
    
    //alert("Lo sketch è stato arrestato per consentire l'applicazione delle modifiche.\n" +
    //      "Aggiornare lo sprite o chiudere la modalità di edit per riavviare lo sketch.")
    
  } // if(cmdEdit.hasClass("ico-sel"))    
} // anim_Edit

// Applica nello sprite corrente le modifiche presenti nei controlli di animazione,
// chiudendo poi la modalità di edit.
function anim_Update() {
  let bApp = false;
  
  let sAnim = $("#cmbAnim").val();
  let currAnim = _sprite.anim[sAnim];
  console.log(currAnim);
  
  let sApp = $("#txtMillis").val();
  let iApp = int(sApp);
  currAnim.millis = iApp;
  
  currAnim.loop = $("#chkLoop")[0].checked;
  currAnim.exit = $("#chkExit")[0].checked;
  
  sApp = $("#cmbAlign").val();
  iApp = int(sApp);
  currAnim.align = iApp;
  sApp = $("#cmbVAlign").val();
  iApp = int(sApp);
  currAnim.valign = iApp;
  
  sApp = $("#txtAnimRef").val();
  _sprite.animRef = sApp;
  sApp = $("#txtFrameRef").val();
  iApp = int(sApp);
  _sprite.frameRef = iApp;
  
  sApp = $("#txtWidthRef").val();
  iApp = int(sApp);
  _sprite.widthRef = iApp;
  sApp = $("#txtHeightRef").val();
  iApp = int(sApp);
  _sprite.heightRef = iApp;

  // per l'array direzioni prima parsa il JSON e poi estrae le singole celle
  if(!(_sprite.dirAnim && (_sprite.dirAnim instanceof Array)))
    _sprite.dirAnim = [];
  sApp = $("#txtDirJSON").val();
  let aTmp = [];
  try { aTmp = JSON.parse(sApp); }
  catch(e) { }
  if(!(aTmp && (aTmp instanceof Array)))
    aTmp = [];
  // in caso di sovrapposizioni tra JSON e celle dà la priorità al JSON
  sApp = $("#txtDirE").val();
  if(!aTmp[0]) aTmp[0] = sApp;
  sApp = $("#txtDirNE").val();
  if(!aTmp[1]) aTmp[1] = sApp;
  sApp = $("#txtDirN").val();
  if(!aTmp[2]) aTmp[2] = sApp;
  sApp = $("#txtDirNW").val();
  if(!aTmp[3]) aTmp[3] = sApp;
  sApp = $("#txtDirW").val();
  if(!aTmp[4]) aTmp[4] = sApp;
  sApp = $("#txtDirSW").val();
  if(!aTmp[5]) aTmp[5] = sApp;
  sApp = $("#txtDirS").val();
  if(!aTmp[6]) aTmp[6] = sApp;
  sApp = $("#txtDirSE").val();
  if(!aTmp[7]) aTmp[7] = sApp;
  // copia dell'array temporaneo in quello dello sprite
  for(let i=0; i < aTmp.length; i++)
    _sprite.dirAnim[i] = aTmp[i];

  // array direzioni idle 
  if(!(_sprite.idleAnim && (_sprite.idleAnim instanceof Array)))
    _sprite.idleAnim = [];
  sApp = $("#txtIdleJSON").val();
  aTmp = [];
  try { aTmp = JSON.parse(sApp); }
  catch(e) { }
  if(!(aTmp && (aTmp instanceof Array)))
    aTmp = [];
  // in caso di sovrapposizioni tra JSON e celle dà la priorità al JSON
  sApp = $("#txtIdleE").val();
  if(!aTmp[0]) aTmp[0] = sApp;
  sApp = $("#txtIdleNE").val();
  if(!aTmp[1]) aTmp[1] = sApp;
  sApp = $("#txtIdleN").val();
  if(!aTmp[2]) aTmp[2] = sApp;
  sApp = $("#txtIdleNW").val();
  if(!aTmp[3]) aTmp[3] = sApp;
  sApp = $("#txtIdleW").val();
  if(!aTmp[4]) aTmp[4] = sApp;
  sApp = $("#txtIdleSW").val();
  if(!aTmp[5]) aTmp[5] = sApp;
  sApp = $("#txtIdleS").val();
  if(!aTmp[6]) aTmp[6] = sApp;
  sApp = $("#txtIdleSE").val();
  if(!aTmp[7]) aTmp[7] = sApp;
  // copia dell'array temporaneo in quello dello sprite
  for(let i=0; i < aTmp.length; i++)
    _sprite.idleAnim[i] = aTmp[i];
  
  // array direzioni animazione extra (tasto CTRL)
  if(!(_sprite.extraAnim && (_sprite.extraAnim instanceof Array)))
    _sprite.extraAnim = [];
  if(!(_sprite.extraAnim[0] && (_sprite.extraAnim[0] instanceof Array)))
    _sprite.extraAnim[0] = [];
  
  sApp = $("#txtExtraJSON").val();
  aTmp = [];
  try { aTmp = JSON.parse(sApp); }
  catch(e) { }
  if(!(aTmp && (aTmp instanceof Array)))
    aTmp = [];
  // in caso di sovrapposizioni tra JSON e celle dà la priorità al JSON
  sApp = $("#txtExtraE").val();
  if(!aTmp[0]) aTmp[0] = sApp;
  sApp = $("#txtExtraNE").val();
  if(!aTmp[1]) aTmp[1] = sApp;
  sApp = $("#txtExtraN").val();
  if(!aTmp[2]) aTmp[2] = sApp;
  sApp = $("#txtExtraNW").val();
  if(!aTmp[3]) aTmp[3] = sApp;
  sApp = $("#txtExtraW").val();
  if(!aTmp[4]) aTmp[4] = sApp;
  sApp = $("#txtExtraSW").val();
  if(!aTmp[5]) aTmp[5] = sApp;
  sApp = $("#txtExtraS").val();
  if(!aTmp[6]) aTmp[6] = sApp;
  sApp = $("#txtExtraSE").val();
  if(!aTmp[7]) aTmp[7] = sApp;
  // copia dell'array temporaneo in quello dello sprite
  for(let i=0; i < aTmp.length; i++)
    _sprite.extraAnim[0][i] = aTmp[i];
  
  //console.log(_sprite.dirAnim);

  // ------
  
  bApp = $("#chkGrav").is(":checked");
  sApp = $("#txtGrav").val();
  if(sApp == "" || !bApp)
    _sprite.gravity = null;
  else
    if(_sprite.gravity)
      _sprite.gravity.y = int(sApp);
    else
      _sprite.gravity = createVector(0, int(sApp));
      
  sApp = $("#txtMass").val();
  _sprite.mass = float(sApp);
  sApp = $("#txtDamp").val();
  _sprite.damping = float(sApp);
  sApp = $("#txtVelMax").val();
  _sprite.maxSpeed = (sApp == "" ? undefined : int(sApp));

  //_sprite.position.x = float($("#txtPosVX").val());
  //_sprite.position.y = float($("#txtPosVY").val());
  //_sprite.velocity.x = float($("#txtVelVX").val());
  //_sprite.velocity.y = float($("#txtVelVY").val());
  //_sprite.acceleration.x = (isNaN($("#txtAccVX").val()) ? 0 : $("#txtAccVX").val());
  //_sprite.acceleration.y = (isNaN($("#txtAccVY").val()) ? 0 : $("#txtAccVY").val());

  
  // chiude la modalità di edit
  if($("#cmdEditAnim").hasClass("ico-sel"))
    anim_Edit();
  
} // anim_Update



// ---------------------------------------------


function Punto() {
  this.x = 0;
  this.y = 0;  
  
  this.indef = true;
}




