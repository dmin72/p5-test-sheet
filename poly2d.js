//--------------------------------------------------------------------------------
// Definizione di entità poligonali in uno spazio vettoriale bidimensionale.
//--------------------------------------------------------------------------------
// Richiede geoutils.js e p5.js


// Classe che rappresenta un punto in uno spazio bidimensionale.
class Point2D
{
  x = 0;
  y = 0;
  
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  // Imposta le coordinate del punto.
  set(x, y) {
    this.x = x;
    this.y = y;
  } // set

  // Ritorna un oggetto copia del punto.
  copy() {
    return new Point2D(this.x, this.y);
  }
  
} // Point2D



//---------------------------------------------------------------------------------------------
// Rect v2.0
// Definisce un poligono rettangolare ortogonale in uno spazio vettoriale bidimensionale.
// x, y: coordinate del punto che delimita l'area in alto a sinistra.
// recWidth, recHeight: larghezza e altezza dell'area.
class Rect {
  
  position = createVector(0, 0);
  posCenter = createVector(0, 0);
  width = 0;
  height = 0;
  
  constructor(x, y, recWidth, recHeight) {
        
    // vettore delle coordinate di origine
    this.position = createVector(x, y);

    // larghezza e altezza
    this.width = recWidth;
    this.height = recHeight;
    
    // aggiorna la posizione del centro
    this.updateCenter();
    
  } // constructor


  // Restituisce l'oggetto che rappresenta il punto iniziale del rettangolo (quello in alto a sx).
  startPoint() {
    return new Point2D(this.position.x, this.position.y);
  }
  
  // Restituisce l'oggetto che rappresenta il punto in alto a dx del rettangolo.
  startRPoint() {
    return new Point2D(this.position.x + this.width, this.position.y);
  }

  // Restituisce l'oggetto che rappresenta il punto finale del rettangolo (quello in basso a dx).
  endPoint() {
    return new Point2D(this.position.x + this.width, this.position.y + this.height);
  }

  // Restituisce l'oggetto che rappresenta il punto in basso a sx del rettangolo.
  endLPoint() {
    return new Point2D(this.position.x, this.position.y + this.height);
  }

  
  // Ritorna la minore coordinata X del rettangolo.
  minX() {
    return this.position.x;
  } // minX

  // Ritorna la minore coordinata Y del rettangolo.
  minY() {
    return this.position.y;
  } // minY

  // Ritorna la maggiore coordinata X del rettangolo.
  maxX() {
    return this.position.x + this.width;
  } // maxX

  // Ritorna la minore coordinata Y del rettangolo.
  maxY() {
    return this.position.y + this.height;
  } // maxY


  // Aggiorna la posizione del punto centrale del rettangolo prendendo come riferimento il punto iniziale.
  updateCenter() {
    this.posCenter.set(this.position.x + (this.width / 2.0), 
                       this.position.y + (this.height / 2.0));
    //console.log(this.posCenter);
  } // updateCenter

  // Aggiorna la posizione del punto di inizio del rettangolo prendendo come riferimento il punto centrale.
  updateCorner() {
    this.position.set(this.posCenter.x - (this.width / 2),
                      this.posCenter.y - (this.height / 2));
  } // updateCorner


  // Sposta il rettangolo alle coordinate passate, prendendo come riferimento suo punto iniziale.
  moveToPos(x, y) {
  // void MoveToPos( float x, float y )    
    this.position.set(x, y);
    this.updateCenter();    
  } // moveToPos

  // Sposta il rettangolo alle coordinate passate, prendendo come riferimento suo punto centrale.
  moveToCenter(x, y) {
  // void MoveToCenter( float x, float y )    
    this.posCenter.set(x, y);
    this.updateCorner();
  } // moveToCenter


  calcArea() {
    return this.width * this.height;
  }
  

  // Ritorna un booleano che indica se il punto passato è nell'area rettangolare.
  containsPoint( pnt ) {
  // bool containsPoint(Point2D pnt)
    
    return (pnt.x >= this.position.x && pnt.y >= this.position.y && 
            pnt.x < (this.position.x + this.width) && pnt.y < (this.position.y + this.height));
    
  } // containsPoint
    

  // Ritorna un booleano che indica se il rettangolo passato si sovrappone a quello corrente.
  // includeCollisions: se presente e vale true viene considerata sovrapposizione anche la collisione 
  // (ovvero il contatto adiacente tra i due rettangoli)
  overlapsWith( rect, includeCollisions = false ) {    
    if(includeCollisions === undefined) 
      includeCollisions = false;
    
    // si parte dal presupposto che se il rettangolo passato giace esternamente ai settori 
    // orizzontali e verticali adiacenti al rettangolo corrente questo non può sovrapporsi,
    // altrimenti si presume che lo faccia in qualche punto non ben identificato
    let thisPos = new Point2D(), thisEndPos = new Point2D();
    let endPos = this.endPoint();
    thisPos.set(includeCollisions ? this.position.x - 1 : this.position.x,
                includeCollisions ? this.position.y - 1 : this.position.y);
    thisEndPos.set(includeCollisions ? endPos.x + 1 : endPos.x,
                   includeCollisions ? endPos.y + 1 : endPos.y);
    
    // se il rettangolo passato è nel settore orizzontale sinistro o destro 
    // rispetto al rettangolo corrente di certo non viene a sovrapporsi a quest'ultimo
    let rectEndPos = rect.endPoint();
    if(rectEndPos.x < thisPos.x || rect.position.x > thisEndPos.x)
      return false;    
    // stessa cosa se il rettangolo passato giace nel settore superiore o inferiore
    if(rectEndPos.y < thisPos.y || rect.position.y > thisEndPos.y)
      return false;
        
    // in tutti gli altri casi i due rettangoli dovrebbero sovrapporsi
    return true;
  } // overlapsWith
  

/* NOTA: NON FUNZIONA
  // Pensando al rettangolo corrente come il contenitore di quello analizzato,
  // ritorna uno status combinato dell'enumerato Rect.eboundCollideStatus che evidenzia i lati
  // che il rettangolo passato interseca rispetto al rettangolo corrente.
  boundCollideStatus( rect ) {
  // Rect.eboundCollideStatus boundCollideStatus( Rect rect )
    let status = Rect.eboundCollideStatus.eOutside;
    
    if(this.overlapsWith(rect, false)) {
      if(rect.minX() < this.minX())
        status |= Rect.eboundCollideStatus.eCollideLeft;
      if(rect.maxX() > this.maxX())
        status |= Rect.eboundCollideStatus.eCollideRight;
      if(rect.minY() < this.minY())
        status |= Rect.eboundCollideStatus.eCollideBottom;
      if (rect.maxY() > this.maxY()) 
        status |= Rect.eboundCollideStatus.eCollideTop;
      // if the bounds intersects and yet none of the sides overlaps
      // "rect" is completely inside this instance of Rect
      if (status === Rect.eboundCollideStatus.eOutside) 
          status = Rect.eboundCollideStatus.eInside;
    } // if(this.overlapsWith(rect, false))
    
    return status;
  } // boundCollideStatus
*/


  // Ritorna il punto di intersezione del raggio proiettato dal punto/vettore rayOrigin nella direzione applicata
  // dal versore rayDir, sul rettangolo. rayDir deve essere un vettore normalizzato.
  // Restituisce un oggetto che contiene un campo value che indica se esiste o meno un punto di intersezione.
  // in contactPoint viene restituito l'oggetto Point2D con le coordinate del punto di intersezione,
  // in contactNormal il vettore normale rispetto al punto di intersezione, in tHitNear/tHitFar i parametri
  // t di intersezione considerando il vettore raggio di direzione.
  getIntersectRayPoint(rayOrigin, rayDir) {
  // Point2D getIntersectRayPoint([p5.Vector][Point2D] rayOrigin, p5.Vector rayDir)
    
    // Codice ispirato da One Lone Coder (javidx9)
    // Arbitrary Rectangle Collision Detection & Resolution
    // https://www.youtube.com/watch?v=8JJ-4JgR7Dg
    let target = this;
    let ret = { 
          value: false, 
          contactPoint: null,
          contactNormal: createVector(0, 0),
          tHitNear: 0,
          tHitFar: 0
        };
    
    // punto più vicino o lontano di intersezione (se esiste)
    // olc::vf2d t_near = (target.pos - ray_origin) / ray_dir;
    let appX = (target.position.x - rayOrigin.x) / rayDir.x,
        appY = (target.position.y - rayOrigin.y) / rayDir.y;
    if(isNaN(appX) || isNaN(appY)) {      
      ret.value = false;
      return ret;    
    }
    let t_near = createVector(appX, appY);  

    // olc::vf2d t_far = (target.pos + target.size - ray_origin) / ray_dir;
    appX = (target.position.x + target.width - rayOrigin.x) / rayDir.x;
    appY = (target.position.y + target.height - rayOrigin.y) / rayDir.y;
    if(isNaN(appX) || isNaN(appY)) {
      ret.value = false;
      return ret;    
    }  
    let t_far = createVector(appX, appY);
    
    // scambio coordinate dei punti di collisione più vicino/lontano, per renderli coerenti con la direzione del raggio
    let app = 0;
    if(t_near.x > t_far.x) {
      app = t_near.x;
      t_near.x = t_far.x;
      t_far.x = app;
    }
    if(t_near.y > t_far.y) {
      app = t_near.y;
      t_near.y = t_far.y;
      t_far.y = app;
    }

    // controllo di collisione del raggio con il rettangolo
    if(t_near.x > t_far.y || t_near.y > t_far.x) {
      ret.value = false;
      return ret;
    }

    // parametro in output che indica l'offset t di intersezione del punto di collisione più vicino
    ret.tHitNear = max(t_near.x, t_near.y);
    ret.tHitFar = min(t_far.x, t_far.y);

    // il punto di collisione si trova prima di P, quindi scarta a priori la collisione
    if(ret.t_hit_far < 0) {
      ret.value = false;
      return ret;    
    }

    // punto di collisione
    // P(t) = P + D*t
    ret.contactPoint = new Point2D(0, 0);
    ret.contactPoint.x = rayOrigin.x + ret.tHitNear * rayDir.x;
    ret.contactPoint.y = rayOrigin.y + ret.tHitNear * rayDir.y;

    // calcolo del vettore normale alla superficie di collisione
    if(t_near.x > t_near.y) {
      if(rayDir.x < 0)
        ret.contactNormal.set(1, 0);
      else
        ret.contactNormal.set(-1, 0);
    }
    else {
      if(t_near.x < t_near.y) {
        if(rayDir.y < 0)
          ret.contactNormal.set(0, 1);
        else
          ret.contactNormal.set(0, -1);
      }    
    }

    ret.value = true;  
    return ret;        
  } // getIntersectRayPoint


  // Esegue una copia del rettangolo corrente e la restituisce.
  copy() {
    let retRect = new Rect(this.position.x, this.position.y, this.width, this.height);
    //retRect.posCenter.set(this.posCenter.x, this.posCenter.y);
    return retRect;
  } // copy
  

  // Disegna il rettangolo corrente sul canvas.
  draw() {
    rect(this.position.x, this.position.y, this.width, this.height);    
  } // draw
  

  toString() {
    return `Rect: (${round(this.position.x, 2)}, ${round(this.position.y, 2)})-` +
                 `(${round(this.position.x + this.width, 2)}, ${round(this.position.y + this.height, 2)}) ` +
                 `[${round(this.width, 2)}, ${round(this.height, 2)}]`;
  } // toString


  //--- METODI STATICI ----------------------//


  // Algoritmo di risoluzione della collisione tra un rettangolo in movimento (movingRect)
  // in un rettangolo statico (collidedRect). I rettangoli devono essere allineati agli assi X e Y (non ruotati).
  // dirVect: versore di direzione di uscita da applicare per risolvere la collisione (null se ignoto e quindi da calcolare).
  //          Attenzione: se passato deve essere normalizzato dalla procedura chiamante.
  // prevPos: coordinate dell'ultima posizione di movingRect libera da conflitti di sovrapposizione (null o undefined se non disponibile).
  // velocity: vettore di velocità con cui movingRect procedeva poco prima della collisione (null o undefined se non disponibile).
  // method: stringa che descrive il metodo di ottenimento della direzione di uscita dalla collisione. Combinazione di una o più 
  // delle seguenti lettere: A (algoritmo di direzionamento della collisione), P (direzione calcolata dall'ultima posizione libera), 
  // V (direzione opposta al vettore di velocità corrente). L'ordine in cui appaiono le lettere determina la priorità di un 
  // metodo rispetto agli altri. Se un metodo non rende possibile determinare la direzione verrà provato il successivo, in ordine.
  // Ritorna null se non è possibile risolvere la collisione.
  // pushDelta: delta di spinta unitario da applicare al vettore di uscita per risolvere la collisione.
  //
  // static object collisionResolve( Rect movingRect, Rect collidedRect, P5.Vector dirVect, P5.Vector prevPos,
  //                                 P5.Vector velocity, string method = "AVP", double pushDelta = 0.15 )
  static collisionResolve( movingRect, collidedRect, dirVect, prevPos, velocity,
                           method = "AVP", pushDelta = 0.15 ) {
        
    // copia del rettangolo in movimento
    let movingRect2 = movingRect.copy();
    //movingRect2.position.name = "position";
    //let movingRect2 = movingRect;
    
    // ricava il vettore inverso della direzione di movimento desunta 
    // dalla posizione precedente del rettangolo in movimento (se passata)
    let invpos = createVector(0, 0);
    if(prevPos) {
      try { invpos = p5.Vector.sub(prevPos, movingRect.position); }
      catch(e) { }    
      // normalizza il vettore inverso
      invpos.normalize();  
      // normalizza a 1 le componenti sotto l'unità
      invpos.set((invpos.x < 0 ? -1 : (invpos.x > 0 ? 1 : 0)), 
                 (invpos.y < 0 ? -1 : (invpos.y > 0 ? 1 : 0)));
    } // if(prevPos)
    
    // ricava il vettore inverso della velocità del rettangolo che ha colliso (se passata)
    let invel = createVector(0, 0);
    if(velocity) {
      try { invel = p5.Vector.mult(velocity, -1); }
      catch(e) { }
      //invel.name = "invel";
      // normalizza il vettore inverso
      invel.normalize();      
      // normalizza a 1 le componenti sotto l'unità
      invel.set((invel.x < 0 ? -1 : (invel.x > 0 ? 1 : 0)), 
                (invel.y < 0 ? -1 : (invel.y > 0 ? 1 : 0)));
    } // if(velocity)

    //
    // ottiene invproc, ovvero il versore procedurale di direzione di collisione rispetto 
    // al rettangolo colliso, che informa da quale direzione il rettangolo in collisione 
    // è penetrato in quello colliso:
    // l'algoritmo usato è descritto da: test-rect-coll\img\collisione.png
    let r1P = movingRect2.startPoint(), r1Q = movingRect2.endPoint();
    let r2P = collidedRect.startPoint(), r2Q = collidedRect.endPoint();

    // vettore di collisione inverso, calcolato algoritmicamente 
    // in base alla posizione dei rettangoli sovrapposti
    let invproc = createVector(0, 0);
    // controlli su ascisse (ingresso da lato O: x = -1; lato E: x = +1)
    if(r1P.x < r2P.x && r1Q.x > r2P.x 
                     && r1Q.x < r2Q.x) {
      //console.log("ovest");
      invproc.x = -1;
    }
    else {
      if(r1Q.x > r2Q.x && r1P.x < r2Q.x 
                       && r1P.x > r2P.x) {
        //console.log("est");
        invproc.x = 1;
      }
    } // controlli su ascisse
    //
    // controlli su ordinate (ingresso da lato N: y = -1; lato S: y = +1)
    if(r1P.y < r2P.y && r1Q.y > r2P.y 
                     && r1Q.y < r2Q.y) {
      //console.log("nord");
      invproc.y = -1;
    }
    else {
      if(r1Q.y > r2Q.y && r1P.y < r2Q.y 
                       && r1P.y > r2P.y) {
        //console.log("sud");
        invproc.y = 1;
      }
    } // controlli su ordinate
        
    
    // determina il vettore di direzione di uscita dalla collisione in base all'ordine di priorità passato:
    // se il vettore relativo al metodo è in stato di indeterminazione (vettore a 0) si passa agli altri
    // (NOTA: è stato osservato che in casi particolari il vettore di velocità potrebbe risultare 
    //  in opposizione rispetto alla direzione di collisione)
    let dirvect = (dirVect ? createVector(dirVect.x, dirVect.y) : createVector(0, 0));
    //dirvect.name = "dirvect";    

    for(let k=0; k < method.length; k++) {
      // se il vettore è a coordinate nulle tenta di usare un altro metodo, altrimenti esce
      if(!(dirvect.x === 0 && dirvect.y === 0)) {
        break;
      }      
      switch(method[k].toUpperCase()) {
        // vettore inverso della velocità del rettangolo
        case "V":
          dirvect.set(invel.x, invel.y);
          break;
        // vettore di direzione verso ultima posizione libera
        case "P":
          dirvect.set(invpos.x, invpos.y);
          break;
        // vettore di uscita procedurale, ottenuto in base alla sovrapposizione del rettangolo entrante:
        // l'algoritmo è sempre disponibile, quindi è anche il metodo di default
        case "A":
        default:
          dirvect.set(invproc.x, invproc.y);
          break;
      } // switch(method[...]
      
    } // for(let k=0; k < method.length; k++)
    
    let sOut = "";    
    sOut = `method: ${method}\n` +
           `movingRect: (${round(movingRect.position.x,2)},${round(movingRect.position.y,2)})-(${round(movingRect.endPoint().x,2)},${round(movingRect.endPoint().y,2)}) [${movingRect.width}x${movingRect.height}] ; ` +
           `collidedRect: (${collidedRect.position.x},${collidedRect.position.y})-(${collidedRect.endPoint().x},${collidedRect.endPoint().y}) [${collidedRect.width}x${collidedRect.height}] \n` +
           `dirVect: ` + (dirVect ? `(${round(dirVect.x,2)},${round(dirVect.y,2)})` : `undefined`) + ` ; ` +
           `prevPos: ` + (prevPos ? `(${round(prevPos.x,2)},${round(prevPos.y,2)})` : `undefined`) + ` ; ` +
           `velocity: ` + (velocity ? `(${round(velocity.x,2)},${round(velocity.y,2)})` : `undefined`) + `\n`;
    sOut += (`invproc: (${round(invproc.x,2)},${round(invproc.y,2)}) - ` +
             `invpos: (${round(invpos.x,2)},${round(invpos.y,2)}) - ` +
             `invel: (${round(invel.x,2)},${round(invel.y,2)}) > ` +
             `dirvect: (${round(dirvect.x,2)},${round(dirvect.y,2)}) \n`);    
        
    // testa se si è verificato un caso di indeterminazione
    // (es: in modalità algoritmo se R1 è entrato in R2 oppure uno dei due lati è uscito in senso orizzontale o verticale;
    //  se invel presente capita se le componenti x e y del vettore sono 0, ovvero se non c'è stato movimento)
    //
    // se il versore è senza direzione si esce senza una soluzione
    if(dirvect.x == 0 && dirvect.y == 0) {
      sOut += "no resolution\n\n"
      //$("#txtOut").text($("#txtOut").text() + sOut);
      console.log(sOut);
      return null;
    }      

    //console.log(movingRect2.position);
    //velocity.name = "velocity";
    //console.log(velocity);  
    //console.log(invel);
    //console.log(dirvect);

    // vettore di spinta in uscita
    let pushvect = createVector(0, 0);
    // delta di spinta unitario per coordinata (ora passato come parametro)
    //const pushDelta = 0.15;
    let deltapvect = createVector(dirvect.x * pushDelta, dirvect.y * pushDelta);
    // contatore per evitare situazioni di stallo del ciclo (esce dopo 1000 spostamenti)
    let i = 0, bOverlap = true;

    // sposta indietro il rettangolo che ha colliso finchè la collisione non cessa  
    while( bOverlap && i++ < 1000 ) {
      bOverlap = movingRect2.overlapsWith(collidedRect, false);
      if(bOverlap) {
        //movingRect2.position.add(invel);
        movingRect2.position.add(deltapvect);      
        // somma algebricamente la componente di posizione al vettore di spinta
        //pushvect.add(invel);   
        pushvect.add(deltapvect);
      } // if(bOverlap)
    } // while( movingRect.overlapsWith(collidedRect, false) )

    // se la collisione non si è risolta esce
    if(bOverlap) {
      sOut += "no resolution\n\n"
      //$("#txtOut").text($("#txtOut").text() + sOut);
      console.log(sOut);
      return null;    
    }

    sOut += `movingRect2: (${round(movingRect2.position.x,2)},${round(movingRect2.position.y,2)})-(${round(movingRect2.endPoint().x,2)},${round(movingRect2.endPoint().y,2)}) [${movingRect2.width}x${movingRect2.height}] ; ` +
            `pushvect: (${round(pushvect.x,2)},${round(pushvect.y,2)}) \n\n`;    
    //$("#txtOut").text($("#txtOut").text() + sOut);
    console.log(sOut);
    
    // versore di direzione di post collisione, rispetto al rettangolo colliso 
    // (vedi img\post_collisione.png)
    let collvect = createVector(0, 0);
    // valore di pixel di tolleranza che consente di definire un lato di un rettangolo in contatto con l'altro
    const iPixTColl = 1;
    r1P = movingRect2.startPoint(); r1Q = movingRect2.endPoint();
    r2P = collidedRect.startPoint(); r2Q = collidedRect.endPoint();

    // contatto su lato nord
    if(abs(r2P.y - r1Q.y) <= iPixTColl) collvect.y = -1;
    // contatto su lato sud
    if(abs(r1P.y - r2Q.y) <= iPixTColl) collvect.y = 1;
    // contatto su lato est (con esclusione di caso anomalo est/ovest in congiunzione)
    if(abs(r1P.x - r2Q.x) <= iPixTColl && (collvect.y == 0)) collvect.x = 1;
    // contatto su lato ovest (con esclusione di caso anomalo nord/sud in congiunzione)
    if(abs(r2P.x - r1Q.x) <= iPixTColl && (collvect.y == 0)) collvect.x = -1;

    //
    // restituisce un oggetto che presenta:
    // versore di spinta in entrata (dirvect): indica quali lati del rettangolo colliso risultavano 
    //   penetrati dal rettangolo in collisione, ovvero:
    //   (-1, 0): lato ovest; (0, -1): lato nord, (1, 0) : lato est, (0, 1): lato sud;
    //   incidentalmente indica anche la direzione del vettore in uscita (passato o calcolato)
    // vettore di spinta in uscita (pushvect): misura la direzione di spinta in risposta alla collisione e 
    //   nella magnitudine quanto il rettangolo in collisione è penetrato in quello colliso:
    //   va aggiunto al vettore di posizione per far uscire il rettangolo dalla collisione
    // versore di collisione (collvect): indica quale lato del rettangolo colliso risulta in contatto con il 
    //   rettangolo in collisione dopo la risoluzione della stessa (per valori vedi versore di spinta in entrata):
    //   utile per capire quale componente della velocità smorzare dopo la risoluzione della collisione
    return {
      dirvect, pushvect, collvect
    };
  } // collisionResolve



  // Costruisce il rettangolo di intesezione tra i due rettangoli passati.
  // Se i due rettangoli non si sovrappongono verrà restituito null.
  static getIntersectRect( rect1, rect2 ) {
    let rectOut = null;
    
    if(rect1.overlapsWith(rect2)) {      
      // trasforma i rettangoli in poligoni a 4 lati, 
      // per sfruttare il metodo omonimo della classe Polygon2D
      let polyRect1 = new Polygon2D(), polyRect2 = new Polygon2D();
      polyRect1.importRect(rect1);
      polyRect2.importRect(rect2);
      
      let poly = Polygon2D.getIntersectPolygon(polyRect1, polyRect2, false);
      // se il poligono è vuoto non continua
      if(poly.vertices.length > 0) {
        
        // crea due aree per registrare le coordinate x e y minime e massime dei vertici
        let valC = { minX: Infinity, maxX: -Infinity,
                     minY: Infinity, maxY: -Infinity };
        
        // poly.getAbsoluteVerts(true) andrebbe utilizzato in caso di poligono con trasformazioni geometriche,
        // ma a quel punto questo metodo di calcolo della larghezza e altezza del rettangolo non funzionerebbe
        valC = poly.vertices.reduce(
          function(acc, cur) {
            acc.minX = Math.min(acc.minX, cur.x);
            acc.maxX = Math.max(acc.maxX, cur.x);
            acc.minY = Math.min(acc.minY, cur.y);
            acc.maxY = Math.max(acc.maxY, cur.y);
            return acc;
          }, valC);        
        //console.log(valC);
        
        // costruzione dell'oggetto Rect definitivo
        rectOut = new Rect(valC.minX, valC.minY, valC.maxX - valC.minX, valC.maxY - valC.minY);
                
      } // if(poly.vertices.length > 0)
    } // if(rect1.overlapsWith(rect2))
    
    return rectOut;
  } // getIntersectRect


} // class Rect


// Enumerato con valori utilizzati per identificare i lati in collisione tra due rettangoli
//Rect.eboundCollideStatus = Object.freeze({
//  eCollideLeft: 1,
//  eCollideRight: 2,
//  eCollideTop: 4,
//  eCollideBottom: 8,
//  eInside: 16,
//  eOutside: 0
//});

//---------------------------------------------------------------------------------------------


// Classe che rappresenta una circonferenza in uno spazio bidimensionale.
class Circle
{
  position = createVector(0, 0);
  radius = 100;
  scale = 0;
  rotation = 0;

  constructor(radius) {
    this.position = createVector(0, 0);
    this.scale = 0;    
    this.rotation = 0;
    this.radius = (radius ? radius : 100);
  } // constructor


  copy() {
    let clone = new Circle();
    clone.position.set(this.position.x, this.position.y);
    clone.radius = this.radius;
    clone.scale = this.scale;
    clone.rotation = this.rotation;
    return clone;
  }


  getTransformedRadius() {    
    return this.radius * (this.scale > 0 ? this.scale : 1);
  }


  // Aggiunge il vettore/punto passato alla posizione della circonferenza.
  addVectToPos( vect ) {
  // void addVectToPos( p5.Vector vect )
    this.position.add(vect);
  } // addVectToPos


  // Sposta la posizione della circonferenza alle coordinate specificate.
  moveToPos(x, y) {
  // void moveToPos( int x, int y )
    this.position.set(x, y);
  } // moveToPos


  // Restituisce un valore booleano che indica se il punto di test è interno alla circonferenza corrente.
  containsPoint(test, bTransformed = true) {
  // bool containsPoint( Point2D test, bool bTransformed = true )
    const thisRadius = (bTransformed ? this.getTransformedRadius() : this.radius);
        
    // calcola le distanze quadratiche per evitare l'uso delle radici quadrate
    const dx = test.x - this.position.x, dy = test.y - this.position.y;
    const iDistSq = dx * dx + dy * dy;
    
    // considera il punto interno alla circonferenza se la sua distanza dal centro è <= a quella del raggio:
    return (iDistSq <= (thisRadius * thisRadius));
  } // containsPoint


  // Ritorna un booleano che indica se la circonferenza passata si sovrappone a quella corrente.
  overlapsWith( circle, bTransformed = true ) {
  // bool overlapsWith( Circle circle, bool bTransformed = true )
    const thisRadius = (bTransformed ? this.getTransformedRadius() : this.radius),
          otherRadius = (bTransformed ? circle.getTransformedRadius() : circle.radius);
    
    // c'è sovrapposizione se la distanza tra il centro delle due circonferenze
    // non supera la somma dei raggi delle stesse
    //const iDist = dist(this.position.x, this.position.y, circle.position.x, circle.position.y);
    const dx = circle.position.x - this.position.x, dy = circle.position.y - this.position.y;
    const iDistSq = dx * dx + dy * dy;
  
    // confronta le distanze al quadrato per evitare la radice quadrata
    const iDistR = thisRadius + otherRadius;
    //return (iDist <= thisRadius + otherRadius);
    return (iDistSq <= (iDistR * iDistR));
  } // overlapsWith


  // Ritorna un booleano che indica se il poligono passato si sovrappone alla circonferenza corrente.
  // nDeltaT: nel caso sia necessario ricorrere all'interpolazione lineare, indica l'incremento  
  // percentuale di spazio tra un punto di test e il successivo.
  // bIncludePos: specifica se controllare l'inclusione del centro della circonferenza nel poligono
  // (per includere il caso della circonferenza inscritta)
  overlapsWithPoly( poly, bTransformed = true, nDeltaT = 0.02, bIncludePos = false ) {
  // bool overlapsWithPoly( Polygon2D poly, bool bTransformed = true, float nDeltaT = 0.02, bool bIncludePos = false )
    
    // array dei vertici del poligono con le sue trasformazioni di rotazione e scala, se richiesto
    const vertices = (bTransformed ? poly.getAbsoluteVerts(true) : poly.vertices);
    
    // step 1: controlla se almeno un vertice del poligono è incluso nella circonferenza e in tal caso 
    // considera subito vera l'intersezione
    let bOverlap = false;
    for(let i = 0; i < vertices.length && !bOverlap; i++)
      bOverlap = this.containsPoint(vertices[i], bTransformed);
        
    // continua solo se nessun vertice è interno allo spazio della circonferenza
    if( !bOverlap ) {
      
      // step 2: isola tutti i lati del poligono e, per ciascuno di questi, 
      // esegue un'interpolazione linerare alla ricerca di un punto lungo il segmento
      // di lato che sia interno alla circonferenza      
      for (let i = 0, j = vertices.length - 1; i < vertices.length && !bOverlap; j = i++) {
        // punto di origine dell'interpolazione
        const pt0 = new Point2D(vertices[i].x, vertices[i].y);
        // direzione verso il punto finale
        const ptDir = new Point2D(vertices[j].x - vertices[i].x, vertices[j].y - vertices[i].y);
        
        // testa i punti tra pt0 e pt0 + (1.0 * ptDir)
        //console.log(nDeltaT);     
        let pt1 = new Point2D(0, 0);
        for(let t = 0; t < 1.0 && !bOverlap; t += nDeltaT) {
          
          // punto da testare
          pt1.set(pt0.x + ptDir.x * t, pt0.y + ptDir.y * t);
          bOverlap = this.containsPoint(pt1, bTransformed);
          
        } // for(let t = 0; t <= 1.0; t += nDeltaT)   
        
      } // for (i = 0, j = vertices.length - 1; i < vertices.length; j = i++)      
    } // if( !bOverlap )
    
    // aggiunge anche il centro della circonferenza ai casi di test, ma chiamando il metodo dal poligono 
    // (nel caso di una circonferenza inscritta nel poligono)
    if(!bOverlap && bIncludePos)
      bOverlap = poly.containsPoint(this.position, bTransformed);
    
    return bOverlap;
  } // overlapsWidthPoly


  // Disegna il poligono nel canvas applicando o meno le trasformazioni di rotazione e scalatura.
  draw( bTransformed = true ) {    
    let radius = this.radius;
    if(bTransformed && this.scale != 0) 
      radius = this.getTransformedRadius();
    
    ellipse(this.position.x, this.position.y, 2 * radius, 2 * radius);    
  } // draw

} // class Circle



// Classe che rappresenta un generico poligono a due dimensioni.
class Polygon2D
{   
  vertices = [];
  relVertices = [];
  position = createVector(0, 0);
  rotation = 0;
  scale = 0;
  
  constructor(aVerts) {
  // constructor( object[] aVerts )
            
    this.vertices = [];
    this.relVertices = [];
    this.position = createVector(0, 0);
    this.rotation = 0;
    this.scale = 0;
    
    // definisce l'array dei vertici da un array di punti (vedi metodo importPoints)
    //this.vertices = (vertices ? vertices : []);
    if( aVerts )
      this.importPoints( aVerts );
    
  } // constructor
  
    
  // Aggiunge un punto ai vertici del poligono.
  //addVert(pt) {
  // addVert( Point2D pt )
  //  this.vertices.push(pt);
  //} // addVert

  
  // Importa i vertici del poligono da un array di punti assoluti. 
  // Ciascun elemento dell'array sarà un punto Point2D/p5.Vector oppure un array [x, y] con le coordinate del punto 
  // da definire per il vertice. I punti, espressi in coordinate assolute, vengono convertiti in coordinate relative 
  // rispetto al centro del poligono. Questo viene traslato in accordo con le coordinate passate per i vertici.
  // L'array dei punti deve essere ordinato in senso orario o antiorario.
  importPoints( aVerts ) {
  // importPoints( object[] aVerts )
    
    // resetta l'array dei vertici
    this.vertices = [];
    this.relVertices = [];
    for(let vert of aVerts) {
      if(vert instanceof Array) {
        this.vertices.push( new Point2D(vert[0], vert[1]) );
      }
      else {
        // a questo punto presuppone che l'elemento sia un oggetto che dispone delle proprietà x e y
        // (può essere un oggetto Point2D ma anche un p5.Vector o un oggetto diverso)
        this.vertices.push( new Point2D(vert.x, vert.y) );
      } // if(vert instanceof Array)          
    } // for(let vert of aVerts)
        
    // aggiorna la posizione centrale del poligono dai suoi vertici espressi in coordinate assolute
    let pntC = Polygon2D.getCenterPos(this.vertices);
    this.position = createVector(pntC.x, pntC.y);
    
    // trasforma le coordinate assolute dei vertici in relative alla posizione centrale
    for(let vert of this.vertices) {
      this.relVertices.push(
        new Point2D(vert.x - pntC.x, vert.y - pntC.y)
      );      
    } // for(let vert of this.vertices)
    
  } // importPoints
  

  // Importa i vertici del poligono da un rettangolo.
  importRect( rect ) {
  // importRect( Rect rect )
    
    // costruisce l'array dei vertici
    let aVerts = [];
    let p0 = rect.startPoint(), p1 = rect.endPoint();
    aVerts.push([p0.x, p0.y]);
    aVerts.push([p1.x, p0.y]);
    aVerts.push([p1.x, p1.y]);
    aVerts.push([p0.x, p1.y]);
    
    // importa il poligono con il metodo importPoints
    this.importPoints(aVerts);
  } // importRect
  

  // Restituisce un valore booleano che indica se il punto di test è interno al poligono convesso corrente.
  // Il poligono deve essere semplice, cioè privo di punti di intersezione con sè stesso.
  // Non è garantito il funzionamento dell'algoritmo per i poligoni concavi (quelli cioè che hanno angoli 
  // interni maggori di 180° e che formano dei buchi o conche nel poligono stesso).
  containsPoint(test, bTransformed = true) {
  //public bool containsPoint(Point2D test, bool bTransformed = true)  
    const poly = this;
    const vertices = bTransformed ? this.getAbsoluteVerts() : this.vertices;
    
    // Basato su "Intersection of Convex Polygons Algorithm", di Sinan Oz (3/12/2018)
    // https://www.swtestacademy.com/intersection-convex-polygons-algorithm/ 
    // taken from https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
    let i, j;
    let result = false;
    for (i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      if ((vertices[i].y > test.y) != (vertices[j].y > test.y) &&
          (test.x < (vertices[j].x - vertices[i].x) * 
                    (test.y - vertices[i].y) / 
                    (vertices[j].y - vertices[i].y) + vertices[i].x)) {
        result = !result;
      }
    } // for (i = 0, j = vertices.length - 1; ...
    return result;
  }
  
  
  // Ritorna l'array dei punti appartenenti ai lati del poligono che intersecano 
  // il segmento di linea delimitato dai due punti passati.
  getIntersectPoints(lpt1, lpt2, bTransformed = true) {
  // Point2D[] getIntersectPoints( Point2D lpt1, Point2D lpt2, bool bTransformed = true )
    const vertices = bTransformed ? this.getAbsoluteVerts() : this.vertices;
    
    let interPoints = [];
    for (let i = 0; i < vertices.length; i++) {
      // estrae i vertici che identificano il successivo lato del poligono da confrontare
      // (l'ultimo vertice viene connesso al primo per considerare l'eventuale lato aperto)
      const next = (i + 1 == vertices.length) ? 0 : i + 1;
      
      let ip = GeoUtils.getIntersectPoint(lpt1, lpt2, vertices[i], vertices[next]);
      if (ip != null) interPoints.push(ip);
    } // for (let i = 0; i < vertices.length; i++)
    
    return interPoints;    
  } // getIntersectPoints
  
  
  // Ritorna un booleano che indica se il poligono convesso passato si sovrappone a quello corrente.
  // I poligoni devono essere semplici, cioè privi di punti di intersezione con sè stessi.
  // Non è garantito il funzionamento dell'algoritmo per i poligoni concavi (quelli cioè che hanno angoli 
  // interni maggori di 180° e che formano dei buchi o conche nel poligono stesso).
  overlapsWith( poly, bTransformed = true ) {
  // function overlaps( Polygon2D poly, bool bTransformed = true )
    const vertices = bTransformed ? poly.getAbsoluteVerts() : poly.vertices;
    
    // Basato su "Intersection of Convex Polygons Algorithm", di Sinan Oz (3/12/2018)
    // https://www.swtestacademy.com/intersection-convex-polygons-algorithm/ 
    // taken from https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
    
    // Cerca i punti di intersezione del poligono passato tra i lati del poligono corrente
    let clippedCorners = [];
    for (let i = 0, next = 1; i < vertices.length; i++, next = (i + 1 == vertices.length ? 0 : i + 1)) {
      // estrae l'array dei punti di intersezione
      let aIntPts = this.getIntersectPoints( vertices[i], vertices[next], bTransformed );
      // aggiunge i punti all'array dei punti da includere per il nuovo poligono
      for(const pt of aIntPts) {
        clippedCorners.push( pt );  
      } // for(const pt of aIntPts)      
    } // for (let i = 0, next = 1; ...
  
    // i due poligoni si intersecano se hanno almeno un punto di intersezione in comune
    return (clippedCorners.length > 0);
  } // overlapsWith
  

  // Genera un'istanza di copia del poligono e la restituisce.
  copy() {
    
    let poly = new Polygon2D();
    poly.vertices = this.vertices.map(p => p.copy());
    poly.relVertices = this.relVertices.map(p => p.copy());
    poly.position = this.position.copy();
    poly.rotation = this.rotation;
    poly.scale = this.scale;
    
    return poly;         
  } // copy

  
  // Aggiunge il vettore/punto passato alla posizione del poligono.
  addVectToPos( vect ) {
  // void addVectToPos( p5.Vector vect )
    
    // aggiorna l'array dei vertici assoluti
    //console.log(this.vertices);
    for(let vert of this.vertices) {
      //console.log(vert);
      vert.x += vect.x;
      vert.y += vect.y;
    } // for(let vert in this.vertices)
    
    // aggiorna la posizione centrale del poligono
    //this.updatePosition();
    let pntC = Polygon2D.getCenterPos(this.vertices);
    this.position.set(pntC.x, pntC.y);
    
  } // addVectToPos
  
  
  // Sposta la posizione del poligono alle coordinate specificate.
  moveToPos(x, y) {
  // void moveToPos( int x, int y )
    
    ////this.updatePosition();
    //let pntC = Polygon2D.getCenterPos(this.vertices);
    //this.position.set(pntC.x, pntC.y);
    
    // costruisce uno pseudo vettore differenza verso la coordinata di spostamento
    let vect = new Point2D(x - this.position.x, y - this.position.y);    
    //console.log(vect);
    this.addVectToPos(vect);
    
  } // moveToPos


  // Ottiene i vertici relativi del poligono a cui vengono applicati gli angoli di rotazione e il fattore di scala.
  getTransformedVerts() {
    // Codice ispirato da "Separating Axis Theorem (SAT) Explanation", di Andrew Sevenson (2009)
    // https://www.sevenson.com.au/programming/sat/
    return this.relVertices.map(vert => {
      var newVert = vert.copy();
      
      if (this.rotation != 0) {
        //let hyp = Math.sqrt(Math.pow(vert.x, 2) + Math.pow(vert.y,2));
        let hyp = Math.sqrt(vert.x * vert.x + vert.y * vert.y);
        let angle = Math.atan2(vert.y, vert.x);
        
        // angoli in radianti
        //angle += this.rotation * (Math.PI / 180);
        angle += this.rotation;

        newVert.x = Math.cos(angle) * hyp;
        newVert.y = Math.sin(angle) * hyp;
      }
      
      if (this.scale != 0) {
        newVert.x *= this.scale;
        newVert.y *= this.scale;
      }

      return newVert;
    });
  } // getTransformedVerts


  // Ottiene i vertici assoluti del poligono, risultanti dalla somma del vettore di posizione corrente 
  // alla lista dei vertici relativi, applicando o meno le trasformazioni di rotazione e scalatura.
  getAbsoluteVerts( bTransformed = true ) {
    let aVerts = (bTransformed ? this.getTransformedVerts() : this.relVertices);
    
    return aVerts.map(vert => {
      var newVert = vert.copy();
      
      newVert.x += this.position.x;
      newVert.y += this.position.y;
      
      return newVert;
    });
  } // getAbsoluteVerts

    
  // Disegna il poligono nel canvas applicando o meno le trasformazioni di rotazione e scalatura.
  draw( bTransformed = true ) {    
    
    // determina se graficare o meno i vertici trasformati (cioè ruotati e scalati)
    let aVerts = (bTransformed ? this.getTransformedVerts() : this.relVertices);
    
    beginShape();
    for(let pt of aVerts) {
      vertex(this.position.x + pt.x, this.position.y + pt.y);
    }
    endShape(CLOSE);
    
  } // draw
  


  //--- METODI STATICI ----------------------//


  // Costruisce il poligono di intesezione tra i due poligoni convessi passati.
  // I poligoni devono essere semplici, cioè privi di punti di intersezione con sè stessi.
  // Non è garantito il funzionamento dell'algoritmo per i poligoni concavi (quelli cioè che hanno angoli 
  // interni maggori di 180° e che formano dei buchi o conche nel poligono stesso).
  static getIntersectPolygon( poly1, poly2, bTransformed = true ) {
  // function Polygon2D getIntersectPolygon( Polygon2D poly1, Polygon2D poly2, bool bTransformed )

    // Basato su "Intersection of Convex Polygons Algorithm", di Sinan Oz (3/12/2018)
    // https://www.swtestacademy.com/intersection-convex-polygons-algorithm/     
    const vertices1 = bTransformed ? poly1.getAbsoluteVerts() : poly1.vertices;
    const vertices2 = bTransformed ? poly2.getAbsoluteVerts() : poly2.vertices;
    let clippedCorners = [];
    
    // Add the corners of poly1 which are inside poly2       
    for (let i = 0; i < vertices1.length; i++) {
      if ( poly2.containsPoint( vertices1[i], bTransformed ))
        clippedCorners.push( new Point2D( vertices1[i].x, vertices1[i].y ) );
    }    
    // Add the corners of poly2 which are inside poly1
    for (let i = 0; i < vertices2.length; i++) {
      if ( poly1.containsPoint( vertices2[i], bTransformed ))               
        clippedCorners.push( new Point2D(vertices2[i].x, vertices2[i].y) );
    }

    // Add the intersection points 
    for (let i = 0, next = 1; i < vertices1.length; i++, next = (i + 1 == vertices1.length ? 0 : i + 1)) {
      //console.log("i="+i+", next="+next);
      //console.log(vertices1[i]);
      //console.log(vertices1[next]);

      // estrae l'array dei punti di intersezione
      let aIntPts = poly2.getIntersectPoints( vertices1[i], vertices1[next], bTransformed );
      // aggiunge i punti all'array dei punti da includere per il nuovo poligono
      for(const pt of aIntPts) {
        clippedCorners.push( pt );  
      } // for(const pt of aIntPts)      
    } // for (let i = 0, next = 1; ...
            
    // elimina i punti ripetuti dall'array sommato
    clippedCorners = GeoUtils.removeDuplPoints(clippedCorners);
    //console.log(clippedCorners);
    
    // crea un nuovo poligono ordinando in senso orario i punti del poligono intersecato
    let newPoly = new Polygon2D();
    //newPoly.vertices = this.orderPtsClockwise(clippedCorners);
    newPoly.importPoints( GeoUtils.orderPtsClockwise(clippedCorners) );
    
    return newPoly;
  } // getIntersectPolygon 


  // Crea e restituisce un poligono standard con il numero di lati specificati.
  static CreatePolygon(numOfSides = 3, radius = 100.0)
  // static Polygon2D CreatePolygon( int numOfSides = 3, double radius = 100.0 )
  {
    // Codice ispirato da "Separating Axis Theorem (SAT) Explanation", di Andrew Sevenson (2009)
    // https://www.sevenson.com.au/programming/sat/
    
    numOfSides = Math.round(numOfSides);
    if (numOfSides < 3)
      throw "You need at least 3 sides for a polygon";

    var poly = new Polygon2D();
    
    // figure out the angles required
    var rotangle = (Math.PI * 2) / numOfSides;
    var angle = 0;
    // loop through and generate each point
    for (var i = 0; i < numOfSides; i++) {
      angle = (i * rotangle) + ((Math.PI - rotangle) * 0.5);
      let pt = new Point2D(Math.cos(angle) * radius,
                           Math.sin(angle) * radius);
      poly.relVertices.push(pt);
      // copia il punto relativo anche nell'array dei vertici assoluti,
      // considerando che in fase di creazione le coordinate del centro sono (0, 0)
      poly.vertices.push(pt.copy());
    }
        
    return poly;
  } // CreatePolygon


  // Restituisce il punto centrale da un array di punti di vertice espressi in coordinate assolute. 
  static getCenterPos( aVerts ) {
  // static Point2D getCenterPos( Point2D[] aVerts )
    //const aVerts = poly.vertices;
    
    // calcola i punti medi delle componenti X e Y dei vertici
    let xC = 0, yC = 0;    
    for(let vert of aVerts) {
      xC += vert.x;
      yC += vert.y;
    } // for(let vert in this.vertices)
    
    //console.log(xC + ", " + yC);
    return new Point2D(xC / aVerts.length, yC / aVerts.length);
  } // getCenterPos


} // Polygon2D





