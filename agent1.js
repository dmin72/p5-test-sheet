// viewport canvas calcolata in base alla finestra del browser (runtime)
let CVS_WIDTH = 0, CVS_HEIGHT = 0;  
// numero tile totali definiti su ascisse e ordinate (calcolati)
let TILE_X = 0, TILE_Y = 0;

// riferimento a oggetto canvas
let _cnv = null;  

// oggetto per i controlli da tastiera del personaggio principale 
let _player = null;

// riferimenti a spritesheet e istanza dello sprite del giocatore
let _agent_json = null, _agent_img = null, _agent_sheet = null;
let _agent = null;

// mappa tile corrente
let _tileMap = null;
// array rettangoli piattaforme (da mappa tile)
let _aPlat = [];

// array dei suoni precaricati del gioco
let _game_sounds = [];



// Carica la mappa dei tile in base ad un ID di stanza.
function loadTileMap( roomId ) {
  switch( roomId ) {
      
    case 0:
    default:
      
      _tileMap = [
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        " "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ",
        " "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ",
        " "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ",
        " "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ",
        " "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ",
        "0","0","0","0"," "," "," ","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"," "," "," ","0","0","0","0",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","0","0","0","0","0","0","0","0"," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," ","0","0","0","0","0","0","0","0","0"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","0","0","0"," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","0","0","0","0","0"," "," "," "," "," ","0","0","0","0"," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1","0","0","0"," "," "," ","0","0","0","0","0","0","0"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","0","0","0","0","0"," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","0","0","0","0","0","0","0","0","0"," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1","0"," "," "," ","0","0","0","0","0","0","0","0","0","0"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","0","0","0"," "," ","0","0","0","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","1","1",
        "1","0","0","0","0","0","0","0","0","0","0","0"," "," "," "," "," "," "," "," "," "," ","0","0","0","0","0","0","0","0","0","0"," "," "," "," "," "," "," ","1","1"
      ];

      break;
                  
  } // switch          
} // loadTileMap
    
    
// Disegna sul canvas la mappa dei tile.
function drawTileMap() { 
  // FILL_COL = color("tan"),
  const STROKE_COL = color("#FFFF99"),
        FILL_COL = color("slategray"),
        STROKE_COL2 = color("#EF");
    
  push();
  strokeWeight(4);
  //noFill();
  
  let app0 = 0, app1 = 0;
  let idx = 0, x = 0, y = 0;
  for(let iy=0; iy < TILE_Y; iy++) {
    //idx = iy * TILE_X;
    x = 0;    
    for(let ix=0; ix < TILE_X; ix++) {
      //idx += ix;
            
      switch( _tileMap[idx] ) {
          
        // blocco piattaforma orizzontale
        case "0":
          stroke(STROKE_COL);
          fill(FILL_COL);
          rect(x, y, TILE_WIDTH, TILE_HEIGHT);   
          
          if( ix % 2 == 0 ) 
            app0 = x + TILE_WIDTH;
          else 
            app0 = x;                
          app1 = y + 2;
          stroke(FILL_COL);
          line(app0, app1, app0, app1 + TILE_HEIGHT - 4);
          
          stroke(STROKE_COL2);
          fill(STROKE_COL2);
          app0 = x;
          app1 = y - 2;
          rect(app0, app1, TILE_WIDTH, 5);
          break;
          
        // blocco piattaforma verticale
        case "1":
          stroke(STROKE_COL);
          fill(FILL_COL);
          rect(x, y, TILE_WIDTH, TILE_HEIGHT);        
          
          //app0 = y - 3;
          //line(x - 2, app0, x + TILE_WIDTH + 2, app0);
          break;
          
        default:
          break;
      } // switch(_tileMap[idx])
      
      x += TILE_WIDTH;
      idx++;
    } // for(let ix=0; ix < TILE_X; ix++)
    y += TILE_HEIGHT;
  } // for(let iy=0; iy < TILE_Y; iy++)
  
  pop();
} // drawTileMap


// Costruisce la lista dei rettangoli di piattaforma, basata sulla mappa dei tile.
function buildPlatLst() {
  _aPlat = [];
  
  // crea una copia della mappa tile, in modo da poterla modificare
  let tileMap = _tileMap.concat([]);
  // numero celle di piattaforma presenti ("0" o "1")
  let iNP = tileMap.reduce((acc, cur) => { return (cur == "0" || cur == "1" ? acc + 1 : acc); }, 0);
  
  let idx = 0, idx1 = 0;
  let sPlat = "";
  while( iNP > 0 ) {
    // trova la prima cella di piattaforma disponibile
    sPlat = "0";
    idx = tileMap.indexOf(sPlat);
    if(idx == -1) {
      sPlat = "1";
      idx = tileMap.indexOf(sPlat);
    }
    
    if(idx > -1) {
      //debugger;
      // indice riga/colonna di mappa della cella in alto a sx del rettangolo
      const iRow0 = int(idx / TILE_X), iCol0 = idx % TILE_X;
      // coordinate di inizio rettangolo
      const iY = iRow0 * TILE_HEIGHT, iX = iCol0 * TILE_WIDTH;
      // indici di confine della prima riga
      const idx0S = iRow0 * TILE_X, idx0F = idx0S + TILE_X - 1;
      
      // prima passata: scansione celle in orizzontale (da sx verso dx) su prima riga
      // per definire la larghezza del rettangolo da inserire
      idx1 = idx;
      while( idx1 <= idx0F && tileMap[idx1] == sPlat ) {
        // annulla la cella per evitare di riconsiderarla successivamente
        //tileMap[idx1] = " ";
        idx1++;
      } // while( idx1 < idx0F && ...
      idx1--;
      
      // numero celle in orizzontale del rettangolo
      const iNC = (idx1 - idx) + 1;
      // pixel di larghezza del rettangolo
      const iWidth = iNC * TILE_WIDTH;
      
      // seconda passata: si parte dalla stessa colonna ma in riga successiva,
      // scansionando le celle in verticale (dall'alto verso il basso) 
      // per definire l'altezza del rettangolo da inserire
      idx1 = idx + TILE_X;
      let iNR = 2;
      while( idx1 < tileMap.length && tileMap[idx1] == sPlat ) {
        //tileMap[idx1] = " ";
        idx1 += TILE_X;
        iNR++;
      } // while( idx1 < tileMap.length && ...
      idx1 -= TILE_X;
      iNR--;
      
      // indice riga/colonna di mappa della cella in basso a dx del rettangolo
      const iRow1 = int(idx1 / TILE_X), iCol1 = (idx1 % TILE_X) + iNC - 1;
      // pixel di altezza del rettangolo
      const iHeight = iNR * TILE_HEIGHT;

      // memorizza il rettangolo identificato
      const rect = new Rect(iX, iY, iWidth, iHeight);
      _aPlat.push(rect);
      rect.index = _aPlat.length - 1;
      
      // terza passata: annulla le celle dell'area del rettangolo
      // per non considerarle successivamente
      for(let i = 0; i < iNR; i++) {
        idx1 = ((iRow0 + i) * TILE_X) + iCol0;        
        for(let k = 0; k < iNC; k++) {
          tileMap[ idx1 + k ] = " ";                    
        } // for(let k = 0; k < iNC ...
      } // for(let i = iRow0; ...
            
    } // if(idx > -1)
    
    // rinumera le celle di piattaforma ancora da aggregare
    iNP = tileMap.reduce((acc, cur) => { return (cur == "0" || cur == "1" ? acc + 1 : acc); }, 0);
  } // while( iNP > 0 ...
      
} // buildPlatLst


// Ricerca e restituisce, se esite, la piattaforma su cui lo sprite si trova attualmente.
function getPlatform( sprite ) {
  
  const sprRect = _agent.getBoundRect();
  const pntLT = sprRect.startPoint();
  const pntRT = sprRect.startRPoint(), pntRB = sprRect.endPoint();
    
  // ascissa della prima e ultima colonna di pixel dello sprite
  const x0 = int(pntLT.x), x1 = int(pntRT.x);  
  // ordinata in cui giace l'ultima riga di pixel dello sprite  
  const y1 = int(pntRB.y);
  // 
  // riferimento a oggetto rettangolo che rappresenta la piattaforma 
  let platform = _aPlat.find(
    function(plat) {
      // verifica se l'ordinata in cui si poggia lo sprite dell'agente corrisponde all'ordinata 
      // immediatamente precedente o compresa nel rettangolo della piattaforma;
      // inoltre lo sprite non potrà essere in una zona orizzontale non compresa 
      // nella piattaforma stessa
      return (
        ((y1 + 1 >= plat.position.y) && (y1 < plat.position.y + plat.height)) && 
        ((x1 > plat.position.x) && (x0 < plat.position.x + plat.width))
      );
    });
  
  return platform;
} // getPlatform


// Esegue un controllo di collisione tra lo sprite passato e le piattaforme dell'area di gioco
// risolvendo i conflitti di sovrapposizione mediante lo spostamento dello sprite.
// Restituisce l'ultimo oggetto piattaforma in cui è stata rilevata una sovrapposizione (oppure null).
// bResolve: specifica se tentare o meno la risoluzione dei conflitti.
function platfSpriteCollisionCheck( sprite, bResolve = true ) {
  let platColl = null;
  let bFree = true;  
  let sprRect = sprite.getBoundRect();
  
  for(const platF of _aPlat) {        
    // controlla se il rettangolo dello sprite e quello della piattaforma sono sovrapposti
    if(sprRect.overlapsWith(platF, false)) {
      platColl = platF;
      bFree = false;
      
      if(bResolve) {
        // ottiene informazioni sulla collisione e un vettore di uscita 
        // dalla sovrapposizione nel rettangolo di piattaforma
        let collInfo = Rect.collisionResolve(sprRect, platF, null, sprite.freePos, sprite.velocity, "APV");
        // collInfo ritorna { dirvect, pushvect, collvect }, ovvero:
        // dirvect: vettore dei lati di collisione in entrata
        // pushvect: vettore di spinta in uscita
        // collvect: vettore dei lati in contatto dopo l'uscita
        if(collInfo != null) {
          // estrae i vettori di spinta e di collisione dall'oggetto
          const pushVect = collInfo.pushvect, 
                collVect = collInfo.collvect;

          // applica il vettore di spinta allo sprite per consentire l'uscita dalla collisione
          sprite.position.add(pushVect);
          //sprite.prevPos.set(sprite.position.x, sprite.position.y);
          
          // aggiusta le coordinate attuali basate sul frame corrente
          //sprite.actualPos = p5.Vector.add(sprite.position, sprite.offsetPos);            
          sprite.updActPos();
          // punta al riferimento del rettangolo di confine dello sprite appena costruito
          sprRect = sprite.boundBox;
                    
          // analizza il vettore di collisione per definire quale componente 
          // della velocità è necessario smorzare
          //sprite.velocity.set(0, 0);
          if(collVect.y == 1 || collVect.y == -1) sprite.velocity.y = 0;
          if(collVect.x == 1 || collVect.x == -1) sprite.velocity.x = 0;
          // nel caso di collisione in uno degli spigoli annulla tutta la velocità
          if(collVect.x == 0 && collVect.y == 0) sprite.velocity.set(0, 0);
          
          // lo sprite ora si presume libero da collisioni
          bFree = true;          
        } // if(collInfo != null) 
        
        // se il conflitto non è stato risolto esce dal ciclo di ricerca
        if(!bFree) break;
      } // if(bResolve)      
      
    } // if(sprRect.overlapsWith(platF, false))        
  } // for(let plat of _aPlat)
    
  // se la posizione dello sprite è priva di conflitti la salva come ultima posizione libera
  if(bFree) {
    // aggiorna l'ultima posizione libera da collisioni
    if(!sprite.freePos)
      sprite.freePos = createVector(sprite.position.x, sprite.position.y);
    else
      sprite.freePos.set(sprite.position.x, sprite.position.y);    
  } // if(bFree)
  
  // se è stato chiesto di risolvere le collisioni e lo sprite risulta in una collisione 
  // non risolvibile verifica se esiste l'ultima posizione libera e riposiziona lo sprite su quella
  if(bResolve && !bFree) {
    if(sprite.freePos && !(sprite.freePos.x == 0 && sprite.freePos.y == 0)) {
      sprite.position.set(sprite.freePos.x, sprite.freePos.y);
      sprite.updActPos();
    }      
  } // if(bResolve && !bFree)
  
  // restituisce l'ultima piattaforma in cui è stata rilevata una collisione
  return platColl;
} // platfSpriteCollisionCheck


// Salva le proprietà che indicano la direzione di movimento dello sprite nell'area delle prop.tà temporanee.
function saveDirection( sprite ) {
  sprite.setSavedProp("dirAngle", sprite.dirAngle);
  sprite.setSavedProp("direction", sprite.direction);  
} // saveDirection

// Recupera le proprietà che indicano la direzione di movimento dello sprite dall'area delle prop.tà temporanee.
function loadDirection( sprite ) {
  sprite.dirAngle = sprite.getSavedProp("dirAngle");
  if(!sprite.dirAngle) sprite.dirAngle = 0;
  sprite.direction = sprite.getSavedProp("direction");
  if(!sprite.direction) sprite.direction.set(1, 0);  
} // saveDirection


// Provvede a caricare nell'array globale apposito i descrittori di suono come da array di URL specificato.
function loadGameSounds(soundURLs = []) {

  _game_sounds = [];
  let sheet = new SpriteSheet();
  
  for(let i=0; i < soundURLs.length; i++) {    
    let sndRec = sheet.getEmptySound();
    sndRec.index = _game_sounds.length;
    sndRec.urlFile = soundURLs[i];
    
    // carica la clip audio in un oggetto p5.SoundFile
    sndRec.sound = 
      loadSound(sndRec.urlFile, 
        // successCallback
        function(loadedSnd) {
          //console.log(loadedSnd);
          sndRec.sound.playMode("restart");
        }, 
        // errorCallback
        function() {
          sndRec.sound = undefined;
        });
    
    _game_sounds.push(sndRec);
  } // for(let i=0; i < soundURLs.length; i++)      
} // loadGameSounds


// Avvia la riproduzione di un suono di gioco, dato il suo indice di descrittore.
function playGameSound( index ) {
  const sndRec = _game_sounds[index];
  let snd = null;
  if(sndRec) snd = sndRec.sound;
  
  if( snd && !snd.isPlaying() ) {
    snd.play();    
  } // if(snd)
} // playGameSound

// Interrompe la riproduzione di un suono di gioco, dato il suo indice di descrittore.
function stopGameSound( index ) {
  const sndRec = _game_sounds[index];
  let snd = null;
  if(sndRec) snd = sndRec.sound;
  
  if( snd && snd.isPlaying() ) 
    snd.stop();
} // stopGameSound


/////////////////////////////////////////////////////////

function drawGrid() {
  push();

  stroke("lightsteelblue");
  for(let x = 0; x < CVS_WIDTH; x += TILE_WIDTH) {
    line(x, 0, x, CVS_HEIGHT);
  } // for(let x = 0 ...
  for(let y = 0; y < CVS_HEIGHT; y += TILE_HEIGHT) {
    line(0, y, CVS_WIDTH, y);
    //stroke("steelblue");
    //for(let x = 0; x < CVS_WIDTH; x += TILE_WIDTH) {
    //  point(x, y);          
    //}
    //stroke("lightsteelblue");
  } // for(let y = 0 ...

  pop();
} // draw_grid
    

function drawPlat() {
  for(let rect of _aPlat) {
    rect.draw();
  }
} // drawPlat

