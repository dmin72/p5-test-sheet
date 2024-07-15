// costanti di allineamento orizzontale/verticale dei frame nelle animazioni
var SpriteFrameAlign = { Left: 0, Center: 1, Right: 2 };
var SpriteFrameVAlign = { Top: 0, Middle: 1, Bottom: 2 };


// Classe utilizzata per costruire il modello dati dinamico a partire da un oggetto spritesheet statico
// (vedi istuzioni in "formato_json.json"). 
// NOTA: definire un solo oggetto SpriteSheet per ciascun spritesheet statico caricato e assegnargli uno scope globale.
var SpriteSheet = function() {

  // membri definiti in fase di costruzione a partire dall'oggetto spritesheet importato
  this.file = "";
  this.frames = [];
  this.anim = {};
  this.animList = [];

  // membri privati:
  // oggetto p5.Graphics di servizio ai metodi di manipolazione grafica
  this._graph = null;
    
} // SpriteSheet

SpriteSheet.prototype = {
  
  // Restituisce un oggetto animazione vuoto.
  getEmptyAnim: function() {
    let ret = {
      name: "",
      descr: "",
      millis: 20,
      loop: true,
      blocking: false,
      align: SpriteFrameAlign.Center,
      valign: SpriteFrameVAlign.Bottom,
      frames: [],
      transf: undefined
    };
    return ret;
  },
  
  // Restituisce un oggetto frame vuoto.
  getEmptyFrame: function() {
    let ret = {
      index: -1,
      name: "",
      width: 0,
      height: 0,
      image: null,
      sound: undefined,
      millis: undefined,
      transf: undefined
    };
    return ret;
  },
  
  // Restituisce un oggetto descrittore di un suono associato ad un frame.
  getEmptySound: function() {
    let ret = {
      index: -1,
      urlFile: "",
      sound: undefined
    };
    return ret;
  },
  
  // Restituisce un oggetto che imposta le possibili tasformazioni geometriche
  // di un frame di animazione, eseguibili dallo sprite in fase di esecuzione.
  getEmptyTransf: function() {
    let ret = {
      scaleX: 1.0,
      scaleY: 1.0,
      rotate: 0.0,
      shearX: 0.0,
      shearY: 0.0
    };
    return ret;
  },
  
  // Metodo per la costruzione del modello dati dinamico a partire da un oggetto spritesheet letto staticamente 
  // da un file json (sprSheet) e da un'immagine p5.Image usata per conservare i frame (sprImage).
  // fmeSnds: array opzionale che elenca i descrittori dei suoni precaricati e utilizzati nei frame delle animazioni. 
  //          Il modello del descrittore è quello ritornato dal metodo getEmptySound.
  createSheet: function(sprSheet, sprImage, fmeSnds = [] ) {
    setImageMode(CORNER);    
    
    // copia il rif.to al file statico utilizzato per il caricamento delle informazioni
    this.file = sprSheet.file;
    // copia il riferimento all'immagine utilizzata dallo spritesheet per mappare i frame
    // (non implementata per risparmiare memoria)
    //this.sheetImg = sprImage;
    
    // definisce il membro anim dello spritesheet (opzionale)
    this.anim = sprSheet.anim;
    this.animList = [];
    if(this.anim === undefined) this.anim = {};
    // isola l'oggetto di animazione, se presente
    let anim = this.anim;
    
    // definisce il membro snd dello spritesheet (procedurale)
    //this.snd = [];
    this.snd = fmeSnds;
    // isola l'array in un riferimento
    let snd = this.snd;
    
    //
    // definisce ed elabora il membro frames
    //let graph = null;
    let iFmeSrc;
    let i = 0;
    for(const frame of sprSheet.frames) {
      if(frame.name === undefined || frame.name == "") 
        frame.name = ("anim0/" + i);
      // aggiunge il frame all'array dei frame dello spritesheet
      this.frames.push(frame);
      
      // divide il nome dell'animazione dal numero di identificazione del frame
      // (vedi "formato_json.json")
      let aFName = frame.name.split('/');
      // codice animazione e numero frame
      let sCodAnim = aFName[0], sFNum = aFName[1];
      // assegna un nome arbitrario all'animazione, nel caso non ci sia
      if(sCodAnim === undefined || sCodAnim == "") sCodAnim = "anim0";
      if(sFNum === undefined || sFNum == "") sFNum = "0";
      let iFNum = parseFloat(sFNum);
      if(isNaN(iFNum)) iFNum = 0;
      
      // cerca l'animazione corrente nell'oggetto anim
      let currAnim = anim[sCodAnim];
      // se l'oggetto dell'animazione corrente non esiste lo crea in modo arbitrario
      if(currAnim === undefined) {
        anim[sCodAnim] = this.getEmptyAnim();
        currAnim = anim[sCodAnim];
      } // if(currAnim === undefined)
      currAnim.name = sCodAnim;
            
      // definisce i membri necessari all'oggetto anim
      if(currAnim.frames === undefined) currAnim.frames = [];
      
      // aggiunge il codice di animazione corrente nell'array di indice
      let bAnimInLst = this.animList.some((el) => { return el == sCodAnim; });
      if(!bAnimInLst)
        this.animList.push(sCodAnim);
      
      // costruzione frame animazione da inserire in uno degli array di anim
      let animFrame = {
        index: i,
        name: frame.name,
        // immagine raster del frame (costruita successivamente)
        image: null,
        // indice dell'array "snd" relativo all'effetto sonoro 
        // associato al frame (caricato successivamente)
        sound: undefined,
        millis: (frame.millis ? frame.millis : undefined),
        transf: (frame.transf ? frame.transf : undefined)
      };
      
      // caricamento effetto sonoro del frame (se richiesto)
      if(!(frame.sound === undefined || frame.sound == "")) {
        //
        // cerca nell'array membro "snd" se il file è stato già caricato
        let sndItm = snd.find(s => { return s.urlFile == frame.sound; });
        //console.log(sndItm);        
        if( sndItm ) {
          // collega il suono del frame corrente all'indice in cui questo oggetto è inserito nell'array "snd"
          animFrame.sound = sndItm.index;
        }
        else {          
          // lancia caricamento asincrono dell'effetto sonoro
          //animFrame.soundLoading = true;
          
          // il riferimento viene posto subito ad undefined, in modo da impedirne
          // la riproduzione prima del suo caricamento
          animFrame.sound = undefined;

          // crea l'oggetto da inserire nell'array "snd"
          let sndItem = this.getEmptySound();
          let idx = snd.length;
          sndItem.index = idx;
          sndItem.urlFile = frame.sound;
          // inserisce il descrittore nell'array
          snd.push(sndItem);

          // lancia il caricamento asincrono
          let frameSound =
            loadSound(frame.sound, 
                      // successCallback
                      function(loadedSnd) {
                        //console.log(loadedSnd);
                        //animFrame.soundLoading = false;                      
                        
                        // ora in frameSound è stato caricato l'oggetto del suono,
                        // e va aggiornato il descrittore e l'indice di array nella 
                        // relativa proprietà del frame
                        frameSound.playMode("restart");
                        snd[idx].sound = frameSound;
                        animFrame.sound = idx;
                            
                      }, 
                      // errorCallback
                      function() {
                        animFrame.sound = undefined;
                        //animFrame.soundLoading = false;                    
                      });        
                              
        } // if(sndItm)                
      } // if(!(frame.sound === undefined || frame.sound == ""))
                  
      //
      // elaborazione frame corrente (parte grafica)
      if(frame.type == "raster") {
        // posiziona l'immagine al frame di copia (se proprietà presente)
        iFmeSrc = frame.frame;
        if(iFmeSrc === undefined || isNaN(iFmeSrc) || iFmeSrc < 0)
          iFmeSrc = -1;
        // se arriva qui con un numero valido vuol dire che il frame è presente e va quindi estratto
        if(iFmeSrc > -1)
          sprImage.setFrame(iFmeSrc);
          
        // frame estratto dall'immagine dello spritesheet
        let imgFrame = sprImage.get(frame.position.x, frame.position.y, frame.position.w, frame.position.h);
        
        animFrame.image = imgFrame;        
        animFrame.width = (imgFrame ? imgFrame.width : 0);
        animFrame.height = (imgFrame ? imgFrame.height : 0);
        
      } // if(frame.type == "raster")
      else {        
        // frame elaborato a partire da un altro frame già estratto dallo spritesheet
        //console.log(frame.name);
        //
        // cerca il frame di riferimento nello speritesheet di origine
        let frameRef = sprSheet.frames.find(
          function(el) { return el.name == frame.refer; }); 
        //console.log(frameRef);
        
        // tenta di recuperare l'immagine elaborata dal frame di riferimento precedentemente
        // (se esiste l'una o l'altro)
        let sCodAnimRef = frame.refer.split('/')[0];
        let animFrameRef = (frameRef && anim[sCodAnimRef] ? 
                            anim[sCodAnimRef].frames.find(
                              function(el) { return el.name == frame.refer; }
                            ) : null);
        let imgFrameRef = (animFrameRef && animFrameRef.image ? animFrameRef.image : null);
        //console.log(imgFrameRef);
        
        // se non viene trovata un'immagine elaborata dal frame di riferimento
        // risale la catena dei riferimenti fino a raggiungere il frame raster, 
        // ovvero quello con i dati di posizione dell'immagine da estrarre
        while(!imgFrameRef && frameRef && !frameRef.position) {
          frameRef = sprSheet.frames.find(
            function(el) { return el.name == frameRef.refer; });
          //console.log(frameRef);
        } // while(!imgFrameRef && frameRef && !frameRef.position)
        
        if(!(frameRef === undefined)) {
          // se è stata recuperata un'immagine elaborata dal frame di riferimento utilizza quella,
          // altrimenti cattura l'immagine dalle coordinate di posizione del frame di riferimento
          let imgFrame = (imgFrameRef ? imgFrameRef :
                          sprImage.get(frameRef.position.x, frameRef.position.y, frameRef.position.w, frameRef.position.h));
          
          let imgFrame2 = null;
          
          // definisce l'immagine per il frame corrente come copia di quella di riferimento
          //let imgFrame = createImage(imgFrameRef.width, imgFrameRef.height);
          //imgFrame.copy(imgFrameRef, 0, 0, imgFrameRef.width, imgFrameRef.height, 0, 0, imgFrame.width, imgFrame.height);
          
          // applica trasformazioni sull'immagine del frame di riferimento
          switch(frame.type) {
            
            // scalatura in base a dei fattori percentuali
            case "scale":
              //console.log(frame.name + ": " + frame.scaleX + "," + frame.scaleY);
              imgFrame2 = this.scale(imgFrame, frame.scaleX, frame.scaleY);
              
              break;
              
            // copia speculare rispetto all'asse Y
            case "flip-x":
              
              imgFrame2 = this.flipX(imgFrame);
              
              break;
              
            // copia speculare rispetto all'asse X
            case "flip-y":
              
              imgFrame2 = this.flipY(imgFrame);
              
              break;
              
            // rotazione rispetto all'asse Z e un angolo specificato
            case "rotate":
              //// ridimensiona l'immagine come un quadrato per evitare di perdere porzioni di immagine dopo la rotazione
              //let iOldW = imgFrame.width, iOldH = imgFrame.height,
              //    iApp = max(imgFrame.width, imgFrame.height);
              //imgFrame.resize(iApp, iApp);
              //// centra la posizione dell'immagine ruotata nello spazio della nuova immagine
              //let iX = floor(abs(iApp - iOldW) / 2), iY = floor(abs(iApp - iOldH) / 2);
              
              // angolo di rotazione da applicare, in gradi o radianti
              if(frame.angleMode === undefined) frame.angleMode = "degrees";
              if(isNaN(frame.angle)) frame.angle = 0;

              imgFrame2 = this.rotate(imgFrame, frame.angle, frame.angleMode);
              
              break;
              
            // in questo caso l'immagine va già bene così com'è
            case "link":
              imgFrame2 = imgFrame;
              break;
              
            default:
              break;
          } // switch(frame.type)
          
          animFrame.image = imgFrame2;
          animFrame.width = (imgFrame2 ? imgFrame2.width : 0);
          animFrame.height = (imgFrame2 ? imgFrame2.height : 0);
          
        } // if(frameRef !=== undefined)                        
      } // if(frame.type == "raster")
      
      // inserimento del frame di animazione nell'array dei frame dell'animazione
      currAnim.frames.push(animFrame);      
      
      i++;
    } // for(const frame of sprSheet.frames)
    
    //
    // filtra le animazioni che presentano una proprietà "refer" e che quindi
    // rimappano i frame a partire da quelli di un'altra animazione già definita prima
    let animRefer = [];
    for(const sAnim in anim) {
      if(anim[sAnim].refer)
        animRefer.push(sAnim);
    } // for(const sAnim in anim)
    //const animRefer = this.animList.filter(sAnim => (anim[sAnim].refer ? true : false));
    //console.log(animRefer);
    
    // cicla le animazioni che definiscono una proprietà "refer"
    for(const sAnim of animRefer) {
      // ottiene il codice di animazione da cui prelevare i frame
      const sRefer = anim[sAnim].refer;
      // sostituisce la definizione dell'array frames con un collegamento 
      // a quello dell'animazione di riferimento
      if(anim[sRefer]) {
        anim[sAnim].frames = anim[sRefer].frames;  
      }
      // se la lista delle animazioni è sprovvista dell'animazione corrente
      // provvede ad aggiornarla
      if(this.animList.indexOf(sAnim) == -1)
        this.animList.push(sAnim);
    } // for(const sAnim of animRefer)
    
    // ordina in modo alfanumerico la lista dei codici animazione presenti     
    this.animList.sort( (a1, a2) => (a1 < a2 ? -1 : (a2 > a1 ? 1 : 0)) );
    
    
  }, // this.createSheet
  
  
  // Crea un oggetto Sprite a partire dalle elaborazioni eseguite dal metodo createSheet.
  // Da chiamare solo dopo l'esecuzione di quest'ultimo.
  //
  // sName: nome dello sprite (opzionale).
  createSprite: function( sName ) {
    
    // crea un nuovo oggetto sprite da restituire
    let oSprite = new Sprite({
      name: (sName ? sName : "newSprite")
    });
    
    // assegna le informazioni elaborate e legate allo spritesheet
    oSprite.spriteSheet = this;
    oSprite.anim = this.anim;
    oSprite.animList = this.animList;
    oSprite.snd = this.snd;
    
    return oSprite;
  }, // createSprite
    
  // Applica una trasformazione speculare orizzontale all'immagine passata.
  // imgFrame: immagine da speculare (oggetto p5.Image)
  flipX: function(imgFrame) {
    setImageMode(CORNER);
    
    //let graph = createGraphics(imgFrame.width, imgFrame.height);
    if(this._graph == null) {
      this._graph = createGraphics(imgFrame.width, imgFrame.height);
    }
    else {      
      this._graph.resizeCanvas(imgFrame.width, imgFrame.height);
      this._graph.clear();
    }
    
    this._graph.push();
    this._graph.translate(imgFrame.width, 0);
    this._graph.scale(-1.0, 1.0);
    this._graph.image(imgFrame, 0, 0);
    this._graph.pop();
    
    let imgFrame2 = createImage(imgFrame.width, imgFrame.height);
    imgFrame2.copy(this._graph, 0, 0, this._graph.width, this._graph.height, 0, 0, imgFrame.width, imgFrame.height);              
    
    return imgFrame2;
  },
  
  // Applica una trasformazione speculare verticale all'immagine passata.
  // imgFrame: immagine da speculare (oggetto p5.Image)
  flipY: function(imgFrame) {
    setImageMode(CORNER);
    
    //let graph = createGraphics(imgFrame.width, imgFrame.height);
    if(this._graph == null) {
      this._graph = createGraphics(imgFrame.width, imgFrame.height);
    }
    else {      
      this._graph.resizeCanvas(imgFrame.width, imgFrame.height);
      this._graph.clear();
    }
    
    this._graph.push();
    this._graph.translate(0, imgFrame.height);
    this._graph.scale(1.0, -1.0);
    this._graph.image(imgFrame, 0, 0);
    this._graph.pop();
    
    let imgFrame2 = createImage(imgFrame.width, imgFrame.height);
    imgFrame2.copy(this._graph, 0, 0, this._graph.width, this._graph.height, 0, 0, imgFrame.width, imgFrame.height);              
    
    return imgFrame2;
  },
  
  // Applica una trasformazione generica di scala all'immagine passata.
  // imgFrame: immagine da trasformare (oggetto p5.Image)
  // iScaleX: fattore di scala orizzontale (percentuale)
  // iScaleY: fattore di scala verticale (percentuale)
  scale: function(imgFrame, iScaleX, iScaleY) {
    setImageMode(CORNER);
    
    const dw = imgFrame.width * iScaleX, dy = imgFrame.height * iScaleY;
    
    //let graph = createGraphics(imgFrame.width, imgFrame.height);
    if(this._graph == null) {
      this._graph = createGraphics(dw, dy);
    }
    else {      
      this._graph.resizeCanvas(dw, dy);
      this._graph.clear();
    }
    
    this._graph.push();
    this._graph.scale(iScaleX, iScaleY);
    this._graph.image(imgFrame, 0, 0);
    this._graph.pop();
    
    let imgFrame2 = createImage(dw, dy);
    imgFrame2.copy(this._graph, 0, 0, this._graph.width, this._graph.height, 
                                0, 0, dw, dy);              
    
    return imgFrame2;    
  }, // scale
  
  // Applica una rotazione all'immagine passata di un certo numero di gradi o radianti.
  // imgFrame: immagine da ruotare (oggetto p5.Image)
  // angle: angolo di rotazione in gradi o radianti
  // mode: vale "degrees" o "radians" in base alla modalità di rotazione 
  //       (possono essere usate le costanti DEGREES e RADIANS di P5 che corrispondono agli stessi valori)
  rotate: function(imgFrame, angle, mode) {
    
    // Algoritmo di rotazione: dal centro del rettangolo che racchiude lo sprite si traccia una linea immaginaria
    // verso il vertice sinistro del rettangolo stesso; si calcola poi la distanza tra il centro del rettangolo
    // e il vertice e si moltiplica per 2. In questo modo si ottiene il diametro del cerchio che inscrive il
    // rettangolo dello sprite, che sarà anche la lunghezza del lato del quadrato dell'area che diventerà la 
    // superficie in cui verrà ruotato lo sprite (questo per evitare di perdere porzioni dello sprite
    // durante la rotazione)
    setImageMode(CORNER);
    //
    // calcola punto centrale dello sprite
    let ixC = imgFrame.width / 2, iyC = imgFrame.height / 2;
    // diametro del cerchio che inscrive il rettangolo dello sprite, 
    // che diventa anche il lato del quadrato della superficie di rotazione
    let iD = ceil(dist(0, 0, ixC, iyC) * 2);
    
    //let graph = createGraphics(iD, iD);
    if(this._graph == null) {
      this._graph = createGraphics(iD, iD);
    }
    else {      
      this._graph.resizeCanvas(iD, iD);
      this._graph.clear();
    }
    
    // calcola il centro dell'area di disegno che diventerà l'origine del sistema coordinate di rotazione
    ixC = round(iD / 2);
    iyC = ixC;
    // centra la posizione dell'immagine da ruotare nello spazio dell'area di disegno,
    // traslando le coordinate in base al nuovo sistema di assi per la rotazione
    let iX = floor(abs(iD - imgFrame.width) / 2) - ixC, 
        iY = floor(abs(iD - imgFrame.height) / 2) - iyC;

    // salva lo stato del canvas e trasla l'origine degli assi nella superficie di disegno
    this._graph.push();
    this._graph.translate(ixC, iyC);
    // esegue la rotazione del piano di disegno
    this._graph.angleMode((mode == "degrees" ? DEGREES : (mode == "radians" ? RADIANS : DEGREES)));
    this._graph.rotate(angle);
    // disegna lo sprite ruotato
    this._graph.image(imgFrame, iX, iY);              
    // ripristina il sistema di coordinate iniziali
    this._graph.pop();

    // crea la nuova immagine copiandola dalla superficie grafica utilizzata per il disegno
    let imgFrame2 = this._graph.createImage(iD, iD);
    imgFrame2.copy(this._graph, 0, 0, this._graph.width, this._graph.height, 0, 0, imgFrame2.width, imgFrame2.height);
    
    // elimina l'area di pixel trasparenti intorno al soggetto ruotato
    let imgFrame3 = this.trim(imgFrame2);
    
    return imgFrame3;
  }, // rotate
  
  
  // Processa l'immagine passata eliminando l'eventuale area di pixel transparenti 
  // intorno al soggetto inscritto nel centro di essa. 
  // Restituisce la nuova immagine elaborata.
  // img: immagine da elaborare (oggetto p5.Image)
  trim: function( img ) {
    // rappresenta i punti di delimitazione dell'analisi (coordinate relative all'immagine):
    // coordinata in alto a sx
    let pnt0 = { x: 0, y: 0 };
    // coordinata in basso a dx
    let pnt1 = { x: img.width - 1, y: img.height - 1 };
    
    colorMode(RGB);
    pixelDensity(1);    
    img.loadPixels();
    
    let yS = pnt0.y, yF = pnt1.y;
    let xS = pnt0.x, xF = pnt1.x;        
    let iRet = yS;

    // scansione segmenti orizzontali di immagine variando le ordinate:
    // da pnt0.y verso pnt1.y
    //console.log("yS: " + yS);
    let bExit = false;
    for(let y = yS; y < yF && !bExit; y++) {
      for(let x = xS; x < xF; x++) {

        // posizionamento al pixel di riferimento
        const i = (y * img.width + x) * 4;
        // estrazione delle componenti di colore del pixel
        const c = [ img.pixels[i], img.pixels[i + 1],
                    img.pixels[i + 2], img.pixels[i + 3] ];
        //console.log(c);

        // testa la la componente alpha del colore per verificare che sia trasparente
        if( c[3] !== 0 ) {
          // in questo caso interrompe i cicli presupponendo che la riga precedente
          // sia l'ultima a contenere solo pixel trasparenti
          bExit = true;
          break;
        } // if( c[3] !== 0 )

      } // for(let x = _pt0.x; x < _pt1.x; x++)

      //if( !bExit ) iRet = y;
      iRet = y;
    } // for(let y = yS; y < yF; y++)

    //console.log("iRet: " + iRet);
    pnt0.y = iRet;
    yS = pnt0.y;
    
    iRet = yF;
      
    // scansione segmenti orizzontali di immagine variando le ordinate:
    // da pnt1.y verso pnt0.y
    //console.log("yF: " + yF);
    bExit = false;
    for(let y = yF; y > yS && !bExit; y--) {
      for(let x = xS; x < xF; x++) {

        // posizionamento al pixel di riferimento
        const i = (y * img.width + x) * 4;
        // estrazione delle componenti di colore del pixel
        const c = [ img.pixels[i], img.pixels[i + 1],
                    img.pixels[i + 2], img.pixels[i + 3] ];
        //console.log(c);

        // testa la la componente alpha del colore per verificare che sia trasparente
        if( c[3] !== 0 ) {
          // in questo caso interrompe i cicli presupponendo che la riga precedente
          // sia l'ultima a contenere solo pixel trasparenti
          bExit = true;
          break;
        } // if( c[3] !== 0 )

      } // for(let x = _pt0.x; x < _pt1.x; x++)

      //if( !bExit ) iRet = y;
      iRet = y;
    } // for(let y = yF; y > yS && !bExit; y--)

    //console.log("iRet: " + iRet);    
    pnt1.y = iRet;
    yF = pnt1.y;
    
    iRet = xS;

    // scansione segmenti vericali di immagine variando le ascisse:
    // da pnt0.x verso pnt1.x
    //console.log("xS: " + xS);
    bExit = false;
    for(let x = xS; x < xF && !bExit; x++) {
      for(let y = yS; y < yF; y++) {

        // posizionamento al pixel di riferimento
        const i = (y * img.width + x) * 4;
        // estrazione delle componenti di colore del pixel
        const c = [ img.pixels[i], img.pixels[i + 1],
                    img.pixels[i + 2], img.pixels[i + 3] ];
        //console.log(c);

        // testa la la componente alpha del colore per verificare che sia trasparente
        if( c[3] !== 0 ) {
          // in questo caso interrompe i cicli presupponendo che la riga precedente
          // sia l'ultima a contenere solo pixel trasparenti
          bExit = true;
          break;
        } // if( c[3] !== 0 )

      } // for(let y = yS; y < yF; y++)

      //if( !bExit ) iRet = x;
      iRet = x;
    } // for(let x = xS; x < xF && !bExit; x++)

    //console.log("iRet: " + iRet);
    pnt0.x = iRet;
    xS = pnt0.x;
    
    iRet = xF;

    // scansione segmenti vericali di immagine variando le ascisse:
    // da pnt1.x verso pnt0.x
    //console.log("xF: " + xF);
    bExit = false;
    for(let x = xF; x > xS && !bExit; x--) {
      for(let y = yS; y < yF; y++) {

        // posizionamento al pixel di riferimento
        const i = (y * img.width + x) * 4;
        // estrazione delle componenti di colore del pixel
        const c = [ img.pixels[i], img.pixels[i + 1],
                    img.pixels[i + 2], img.pixels[i + 3] ];
        //console.log(c);

        // testa la la componente alpha del colore per verificare che sia trasparente
        if( c[3] !== 0 ) {
          // in questo caso interrompe i cicli presupponendo che la riga precedente
          // sia l'ultima a contenere solo pixel trasparenti
          bExit = true;
          break;
        } // if( c[3] !== 0 )

      } // for(let y = yS; y < yF; y++)

      //if( !bExit ) iRet = x;
      iRet = x;
    } // for(let x = xF; x > xS && !bExit; x--)

    //console.log("iRet: " + iRet);    
    pnt1.x = iRet;
    xF = pnt1.x;
    
    // costruisce l'immagine delimitata dai nuovi punti
    const w = (pnt1.x - pnt0.x) + 1, 
          h = (pnt1.y - pnt0.y) + 1;
    let img2 = null;
    // procede alla copia solo se l'immagine da estrarre differisce da quella di partenza
    if(w < img.width || h < img.height) {
      
      img2 = createImage(w, h);
      img2.copy(img, pnt0.x, pnt0.y, w, h, 0, 0, w, h);
      
    } // if(w < img.width || h < img.height)
    else
      img2 = img;
    
    return img2;
  }, // trim

  
  // Modifica l'immagine passata convertendo la componente alpha del colore specificato come trasparente.
  // Il colorMode viene impostato ad RGB.
  // img: oggetto P5.Image da elaborare.
  // col: oggetto P5.Color che conserva il colore da rendere trasparente.
  setTransparent: function(img, col) {
    colorMode(RGB);
    // carica la matrice dei pixel dell'immagine
    img.loadPixels();

    // array dei livelli di colore da analizzare
    const colLev = col.levels;
    
    for(let y = 0; y < img.height; y++) {
      for(let x = 0; x < img.width; x++) {
        
        // posizionamento al pixel di riferimento
        const i = (y * img.width + x) * 4;
        // estrazione delle componenti di colore del pixel
        const c = [ img.pixels[i], img.pixels[i + 1],
                    img.pixels[i + 2], img.pixels[i + 3] ];

        // colore trasparente?
        if(c[0] == colLev[0] && c[1] == colLev[1] && c[2] == colLev[2]) {
          // rende trasparente la componente alpha del colore
          c[3] = 0;
          // aggiorna il colore del pixel corrente
          img.set(x, y, c);
        } // if(c[0] == colLev[0] && c[1] == colLev[1] && c[2] == colLev[2])
        
      } // for(let x = 0; x < img.width; x++)
    } // for(let y = 0; y < img.height; y++)
    
    // rende persistenti le modifiche effettuate
    img.updatePixels();  
    
  }, // setTransparent
    
  
  // Rimuove dalla memoria l'oggetto p5.Graphics di servizio, se è stato istanziato.
  clearGraph() {
    if(this._graph) {
      this._graph.remove();
      // annulla il riferimento, in modo da poter essere istanziato nuovamente quando servirà di nuovo
      this._graph = null;
    } // if(this._graph)
  } // clearGraph
  
}; // SpriteSheet.prototype

