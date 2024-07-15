
class Sprite {
  // timeout in millisecondi prima di considerare eliminabile un record 
  // che conserva riferimenti a callback di animazione
  CALLBACK_TIMEOUT = 60000;

  
  // il costruttore accetta come parametro un oggetto con le seguenti proprietà:
  // name: nome interno dello sprite
  // x, y: coordinate cartesiane di posizionamento e di riferimento per le animazioni
  // width, height: larghezza e altezza in pixel dell'oggetto (frame di riferimento)
  // animRef: codice dell'animazione di riferimento (default: prima animazione trovvata)
  // frameRef: indice del frame di animazione di riferimento (default: 0)
  // mass: massa dell'oggetto, per le interazioni fisiche dell'oggetto (default: 1.0)
  // damping: coefficiente di frizione nel movimento dell'oggetto (1.0: nessuna frizione, default: 0.98)
  // maxSpeed: velocità massima, in pixel, di movimento dello sprite (default: undefined)
  constructor(settings) {  
  // void constructor( object settings )
    // ID dello sprite (verrà estratto dopo)
    this.id = 0;
    // nome interno dello sprite    
    this.name = (settings.name ? settings.name : "");
    
    // animazione di riferimento per la definizione delle dimensioni di riferim. dello sprite
    // (default: prima animazione presente, selezionata in fase di aggiornamento)
    this.animRef = (settings.animRef ? settings.animRef : undefined);
    // indice del frame di riferimento relativo all'animazione di riferim. (default: 0)
    this.frameRef = (settings.frameRef ? settings.frameRef : 0);
    // larghezza e altezza di riferimento dello sprite (quelle riferite al frame di riferimento)
    this.widthRef = (settings.width ? settings.width : 0);
    this.heightRef = (settings.height ? settings.height : 0);
    // larghezza e altezza attuali del frame corrente (per ora presunte)
    this.width = this.widthRef;
    this.height = this.heightRef;
                
    // vettore di posizione che definisce la posizione di riferimento 
    // (posizione dell'angolo in alto a sx del frame di riferimento)
    this.position = createVector(settings.x, settings.y);
    // vettore di posizione che puntava allo sprite nel precedente frame (utilizzato per capire se lo sprite è in movimento)
    this.prevPos = this.position.copy();
    // vettore di posizione che definisce l'offset di posizionamento del frame corrente
    // rispetto alla posizione di riferimento (per visualizzazione di frame di diverse dimensioni)
    this.offsetPos = createVector(0, 0);
    // vettore di posizione risultante da this.position + this.offsetPos, che punta alle coordinate
    // del frame correntemente visualizzato (calcolato dal metodo updActPos, chiamato in update)
    this.actualPos = this.position.copy();
    
    // oggetto Rect che definisce l'area di rilevamento delle collisioni attorno al centro dello sprite:
    // se hitDelta = 1.0 esso corrisponde al rettangolo che inscrive il frame corrente di animazione,
    // altrimenti ne definisce una porzione percentuale che si stringe via via verso il centro
    // (viene definito nel metodo updActPos)
    this.hitBox = null;
    // delta percentuale dell'area del frame considerata nel rettangolo della hitbox
    this.hitDelta = 1.0;
    // oggetto Rect che definisce i confini del frame corrente dello sprite
    this.boundBox = null;
    
    // vettore di velocità di movimento
    this.velocity = createVector(0, 0);
    // vettore di accelerazione di velocità
    this.acceleration = createVector(0, 0);
    
    // versore di direzione di orientamento (default: nessuna)
    this.direction = createVector(0, 0);
    // angolo in gradi di orientamento dello sprite (alternativo a direction)
    this.dirAngle = undefined;
    
    // vettore della gravità (nessuno per default)
    this.gravity = null;        
    // massa dell'oggetto per le interazioni fisiche
    this.mass = (settings.mass ? settings.mass : 1.0);
    // frizione al movimento (1.0 = movimento senza frizione)
    this.damping = (settings.damping ? settings.damping : 0.98);
    // magnitudine della velocità massima (default nessuna)
    this.maxSpeed = (settings.maxSpeed ? settings.maxSpeed : undefined);
    
    // riferimento all'oggetto Player, nel caso lo sprite rappresenti il giocatore
    this.player = null;
    
    // ----
    
    // oggetti Spring a cui l'oggetto è collegato
    this.springs = [];    
    // oggetto SpriteSheet di riferimento
    this.spriteSheet = null;    
    // oggetto delle animazioni definite per lo sprite (costruiti dall'oggetto SpriteSheet)
    this.anim = { };
    // array che presenta la lista delle animazioni presenti nello sprite (costruito dallo SpriteSheet)
    this.animList = [];
    
    // lo sprite sta eseguendo un'animazione? 
    this.inAnimation = false;
    // indica se l'animazione è in esecuzione oppure è stata sospesa
    this.runningAnim = false;
    // durante un'animazione informa sul nome dell'animazione in esecuzione (membro di anim)
    this.currAnim = undefined;
    // durante un'animazione informa sull'indice di frame mostrato dell'animazione corrente
    this.currFrame = undefined;
    // durante un'animazione conserva il momento in cui è stato mostrato l'ultimo frame (in millisecondi, rispetto all'avvio dello sketch)
    this.milliFrame = 0.0;
    // semaforo che consente di riprodurre un eventuale suono collegato al frame di animazione corrente
    // (questo perchè i frame si ridisegnano più volte e il suono potrebbe essere riprodotto più di una volta)
    this.soundTime = false;

    // conserva il puntatore alla funzione di callback da lanciare durante l'esecuzione dell'animazione (opzionale)
    this.callPlayAnim = null
    // conserva il puntatore alla funzione di callback da lanciare al termine dell'animazione (opzionale)
    this.callEndAnim = null;
    // conserva i riferimenti agli oggetti dei callback utilizzati per le diverse animazioni dello sprite
    // (per evitare che escano fuori di scope prima di concludersi a seguito del lancio di nuove animazioni)
    this.callbacks = [];
    // ultimo ID di oggetto definito per memorizzare riferimenti a callback di animazione
    this.lastCallbackID = undefined;
    
    // stato di visibilità dello sprite
    this.visible = true;
    // lo sprite si sta muovendo, ovvero ha una velocità di spostamento attiva e sopra una certa soglia
    this.moving = false;
    // indica che lo sprite, in caso sia soggetto a forza di gravità, sta precipitando o meno
    this.falling = false;
    // indica che lo sprite, in caso sia soggetto a forza di gravità, sta volando o meno (ovvero si oppone alla forza di gravità)
    this.flying = false;
    // lo sprite non può essere controllato dall'utente per qualche motivo (es. sta eseguendo l'animazione di salto) (lettura/scrittura)
    this.blocked = false;
    
    // array che rappresenta i nomi delle animazioni connesse agli angoli di rotazione dello sprite
    // per il movimento direzionato (vedi setDirAnim e getDirAnim)
    this.dirAnim = [];
    // array dei nomi delle animazioni di default per lo stato di idle, 
    // organizzati in base agli angoli di rotazione dello stesso (come dirAnim)
    this.idleAnim = [];
    // array opzionale che contiene un insieme di array di animazioni extra che necessitano 
    // direzionamento angolare (ad es. l'animazione di salto)
    this.extraAnim = [];
    
    // oggetto che definisce le trasformazioni geometriche da eseguire durante la visualizzazione 
    // delle animazioni dello sprite (per le animazioni/frame che non hanno il medesimo oggetto definito)
    // (lettura/scrittura, opzionale e definito esternamente)
    this.transf = undefined;
    // proprietà stringa che definisce uno o più effetti grafici opzionali da applicare durante il 
    // rendering dello sprite (https://developer.mozilla.org/en-US/docs/Web/CSS/filter)
    this.filter = undefined;
    
    
    // ----
    
    // estrae l'ID dell'istanza corrente
    this.id = Sprite.getNewId();    

    // contenitore per salvataggio proprietà transitorie
    this._savedProps = { };        
    // aggiorna le coordinate attuali dello sprite e la sua hitbox
    this.updActPos();
    
  } // constructor

    
  
  // Aggiunge un oggetto Spring all'insieme di quelli a cui lo sprite è connesso.
  //
  // Spring sprng
  addSpring(spring) {
  // void addSpring( Spring spring )
    this.springs.push(spring);
  } // addSpring
  
  
  // Applica un vettore di gravità allo sprite. 
  // L'attrazione gravitazionale è persistente, finchè non viene rimossa.
  // Passare null per annullare la forza di gravità.
  //
  // p5.Vector force
  applyGravity(force) {
  // void applyGravity( p5.Vector force ) 
    this.gravity = force;
  } // applyGravity
  
  
  // Applica una forza vettoriale di accelerazione allo sprite.
  // Seconda legge di Newton:  F = M * A  or  A = F / M
  //
  // p5.Vector force
  applyForce(force) {
  // void applyForce( p5.Vector force ) {
    // Divide by mass 
    let forceMass = p5.Vector.div(force, this.mass);
    
    // Accumulate all forces in acceleration
    this.acceleration.add(forceMass);
  }

  
  // Assegna allo sprite delle animazioni di movimento basate su direzioni angolari. 
  // Viene passato un array che rappresenta i nomi delle animazioni assegnate agli angoli di movimento dello sprite, 
  // espressi in gradi e a partire dall'angolo di grado 0 (che rappresenta l'est, ovvero la direzione a destra).
  // L'array può essere di 4 elementi (0°: destra, 90°: alto, 180°: sinistra, 270°: basso), a 8 elementi con le diagonali
  // (0°: destra, 45°: alto/dx, 90°: alto, 135°: alto/sx, 180°: sx, 225°: basso/sx, 270°: basso, 315°: basso/dx)
  // oppure anche un numero superiore che rappresenta ulteriori gradi di rotazione dello sprite. 
  // Tuttavia non è consigliabile passare array con meno di 4 elementi, per evitare errori di approssimazione.
  // La routine di gestione del movimento dovrà preoccuparsi di rilevare il comando utente di direzione associato,
  // chiamando poi il metodo getDirAnim() per ottenere l'animazione per l'angolo passato.
  setDirAnim( aAnim ) {
  // void setDirAnim( string[] aAnim )
    // assegna l'array con i nomi di animazione divisi per angoli di movimento
    this.dirAnim = aAnim;
  } // setDirAnim
    
  // Restituisce il nome dell'animazione di movimento più prossima all'angolo di direzione passato.
  // Se questo non viene passato l'angolo verrà ottenuto dall'attuale direzione in cui è rivolto lo sprite.
  // Allo scopo viene utilizzato l'array dirAnim discusso nel metodo setDirAnim. 
  // L'animazione restituita è quella collegata all'angolo di rotazione più vicino.
  // Ritorna undefined se l'array è vuoto o l'angolo passato non è valido.
  //
  // iAngle: angolo di orientamento dello sprite espresso in gradi (da 0 a 359)
  getDirAnim( iAngle ) {
  // string getDirAnim( int iAngle )
    if(!this.dirAnim) return undefined;
    
    // se l'angolo non è passato viene ricavato dal vettore di direzione corrente dello sprite
    if( !iAngle ) {    
      // utilizza la proprietà dirAngle, se definita, altrimenti ricorre al versore direction
      // (per velocizzare i calcoli)
      if( this.dirAngle )
        iAngle = this.dirAngle;
      else
        iAngle = VectUtils.vectorAngle( this.direction );      
    } // if(!iAngle)
    
    // recupera l'indice dell'array da considerare
    // (viene aggiunto 0.9999 per aumentare la precisione della funzione map)
    let idx = floor( map(iAngle, 0, 359, 0, this.dirAnim.length + 0.9999) );
    if(idx > this.dirAnim.length - 1) idx = 0;
    return this.dirAnim[idx];
  } // getDirAnim
  
  
  // Assegna allo sprite delle animazioni di idle basate su direzioni angolari. 
  // Vedere metodo setDirAnim per i dettagli.
  setIdleAnim( aAnim ) {    
  // void setIdleAnim( string[] aAnim )
    // assegna l'array con i nomi di animazione divisi per angoli di movimento
    this.idleAnim = aAnim;
  } // setIdleAnim
  
  
  // Restituisce il nome dell'animazione di idle più prossima all'angolo di direzione passato.
  // Vedere metodo getDirAnim per i dettagli.
  getIdleAnim( iAngle ) {
  // string getIdleAnim( int iAngle )
    if(!this.idleAnim) return undefined;

    // se l'angolo non è passato viene ricavato dal vettore di direzione corrente dello sprite
    if( !iAngle ) { 
      // utilizza la proprietà dirAngle, se definita, altrimenti ricorre al versore direction
      // (per velocizzare i calcoli)
      if( this.dirAngle )
        iAngle = this.dirAngle;
      else      
        iAngle = VectUtils.vectorAngle(this.direction);
    } // if(!iAngle)
    
    // recupera l'indice dell'array da considerare
    // (viene aggiunto 0.9999 per aumentare la precisione della funzione map)
    let idx = floor( map(iAngle, 0, 359, 0, this.idleAnim.length + 0.99999999) );
    if(idx > this.idleAnim.length - 1) idx = 0;
    return this.idleAnim[idx];    
  } // getIdleAnim

  
  // Assegna allo sprite delle animazioni extra basate su direzioni angolari e indicizzate in set. 
  // Il parametro idx specifica l'indice dell'array direzionale delle animazioni extra.
  // Vedere metodo setDirAnim per gli altri dettagli. 
  setExtraAnim( idxSet, aAnim ) {    
  // void setExtraAnim( int idxSet, string[] aAnim )
    // assegna l'array con i nomi di animazione divisi per angoli di movimento
    this.extraAnim[idxSet] = aAnim;
  } // setExtraAnim
  
  
  // Restituisce il nome dell'animazione extra più prossima all'angolo di direzione passato,
  // dato un indice che determina il numero di set di animazione scelto.
  // Vedere metodo getDirAnim per gli altri dettagli.
  getExtraAnim( idxSet, iAngle ) {
  // string getExtraAnim( int idxSet, int iAngle )
    if(!this.extraAnim) return undefined;
    if(!this.extraAnim[idxSet]) return undefined;

    // se l'angolo non è passato viene ricavato dal vettore di direzione corrente dello sprite
    if(!iAngle) {      
      // utilizza la proprietà dirAngle, se definita, altrimenti ricorre al versore direction
      // (per velocizzare i calcoli)
      if( this.dirAngle )
        iAngle = this.dirAngle;
      else      
        iAngle = VectUtils.vectorAngle(this.direction);
    } // if(!iAngle)
    
    // recupera l'indice dell'array da considerare
    // (viene aggiunto 0.9999 per aumentare la precisione della funzione map)
    let idx = floor( map(iAngle, 0, 359, 0, this.extraAnim[idxSet].length + 0.99999999) );
    if(idx > this.extraAnim[idxSet].length - 1) idx = 0;
    return this.extraAnim[idxSet][idx];    
  } // getExtraAnim
  
  
  // Ritorna se l'animazione corrente dello sprite è un'animazione di direzione.
  isDirAnim() {
    if(!this.currAnim || !this.dirAnim) 
      return false;
    const currSprite = this;
    const sAnim = this.dirAnim.find(a => { return a == currSprite.currAnim; });
    return (sAnim ? true : false);
  } // isDirAnim

  // Ritorna se l'animazione corrente dello sprite è un'animazione di idle.
  isIdleAnim() {
    if(!this.currAnim || !this.idleAnim) 
      return false;
    const currSprite = this;
    const sAnim = this.idleAnim.find(a => { return a == currSprite.currAnim; });
    return (sAnim ? true : false);
  } // isIdleAnim

  // Ritorna se l'animazione corrente dello sprite è un'animazione extra di set specificato.
  isExtraAnim( idxSet ) {
    if(!this.currAnim || !this.extraAnim || !this.extraAnim[idxSet]) 
      return false;
    const currSprite = this;
    const sAnim = this.extraAnim[idxSet].find(a => { return a == currSprite.currAnim; });
    return (sAnim ? true : false);
  } // isExtraAnim
  
  
  //
  // Applica le animazioni allo sprite per aggiornare il frame corrente.
  // Si presume che sia già stata assegnata un'animazione di riferimento prima di chiamare questo metodo (metodo setAnimRef).
  // In caso contrario l'animazione di riferimento verrà impostata alla prima animazione trovata in lista.
  updateFrame() {
  // void updateFrame()
    let millisecs = millis();
    
    // animazione/frame di riferimento (se non esiste viene impostata alla prima animazione trovata)
    if(!this.animRef) this.animRef = this.animList[0];
    if(this.frameRef === undefined) this.frameRef = 0;
    // larghezza/altezza di riferimento
    if(this.widthRef == 0 || this.heightRef == 0 && this.currAnim) {
      this.widthRef = this.anim[this.animRef].frames[this.frameRef].width;
      this.heightRef = this.anim[this.animRef].frames[this.frameRef].height;
    } // if((this.widthRef == 0 || this.heightRef ...
        
    
    // AGGIORNAMENTO FRAME DI ANIMAZIONE
    //
    // verifica se lo sprite è in animazione e, nel caso, aggiorna il frame corrente
    if(this.inAnimation) {
      if(!this.currAnim) this.currAnim = this.animRef;
      if(this.currFrame === undefined) this.currFrame = this.frameRef;
      
      // verifica se l'animazione va riprodotta al rovescio
      const bReverse = this.anim[this.currAnim].reverse ? true : false;
      // verifica se è tempo di far avanzare il prossimo frame
      //console.log(millisecs);
      // numero di millisecondi da testare (globalmente rispetto all'animazione)
      let iMilliCheck = this.anim[this.currAnim].millis;
      // se la proprietà millis è definita anche a livello frame usa quella come controllo
      if(this.anim[this.currAnim].frames[this.currFrame].millis)
        iMilliCheck = this.anim[this.currAnim].frames[this.currFrame].millis;
      //console.log(iMilliCheck);
      
      if(this.runningAnim && 
         millisecs - this.milliFrame > iMilliCheck) {
        //console.log("> " + millisecs);
        const iOldF = this.currFrame;
        if(!bReverse) {
          this.currFrame++;
          this.currFrame %= this.anim[this.currAnim].frames.length;          
        }
        else {
          this.currFrame--;
          if(this.currFrame < 0) 
            this.currFrame = this.anim[this.currAnim].frames.length - 1;
        } // if(!bReverse)

        // aggiorna il misuratore di millisecondi attuale per l'attesa del prossimo frame
        this.milliFrame = millisecs;
        // accende il semaforo che consente di riprodurre un suono eventuale
        this.soundTime = true;
        
        // se l'animazione non prevede loop e risulta terminata chiama lo stop
        // (il secondo blocco di condizione serve per le animazioni che hanno 1 solo frame)
        let bBypass = (!bReverse ? (this.currFrame < iOldF) : (this.currFrame > iOldF));
        if(!this.anim[this.currAnim].loop && 
           (bBypass || this.anim[this.currAnim].frames.length == 1)) {
          
          // ripristina l'ultimo frame visualizzato, in caso l'animazione dovesse fermarsi con quest'ultimo
          this.currFrame = iOldF;          
          // controlla nel metodo di stop se è necessario o meno uscire dall'animazione
          this.stopAnimation(true, false); 
          
        } // if(!this.anim[this.currAnim].loop && ...
        else {
          // se è presente un callback di esecuzione animazione lo chiama,
          // passando il codice dell'animazione e il frame appena scattato
          if(this.callPlayAnim)
            this.callPlayAnim(this.currAnim, this.currFrame);
          
          //const callRec = this.getCallbackData();
          //if(callRec && callRec.callPlayAnim) 
          //  callRec.callPlayAnim(this.currAnim, this.currFrame);          
          
        } // if(!this.anim[this.currAnim].loop && ...

      } // this.runningAnim && ...                  
    } // if(this.inAnimation)

    //
    // se lo sprite non è in animazione estrae il frame di riferimento
    let currAnim = null, currFrame = null;
    if(!this.currAnim || this.currFrame === undefined) {
      currAnim = this.anim[this.animRef];
      currFrame = this.anim[this.animRef].frames[this.frameRef];
    }
    else {
      currAnim = this.anim[this.currAnim];
      currFrame = this.anim[this.currAnim].frames[this.currFrame];
    }
    //console.log(currFrame);
    
    // imposta larghezza e altezza dello sprite prendendole dal frame corrente
    this.width = currFrame.width;
    this.height = currFrame.height;
                
  } // updateFrame

  
  //
  // Aggiorna l'accelerazione e la posizione dello sprite, chiamando opzionalmente i callback di rilevamento 
  // del movimento da tastiera e/o di risoluzione delle collisioni dopo il movimento.
  // Si presume che il frame corrente dello sprite sia già stato aggiornato prima di chiamare questo metodo.
  //
  // elapsedTime: esprime il delta, espresso in secondi, tra la visualizzazione di questo frame rispetto al precedente;
  //              se non viene passato sarà ricavato dalla variabile di ambiente deltaTime.  
  // ctrlCallback(sprite): callback che, se passato, viene chiamato prima dell'aggiornamento del vettore di posizione 
  //                       dello sprite. Questo aggiornerà il vettore di accelerazione o la velocità dello sprite,
  // in base al movimento impresso dai controlli da tastiera, interrogando allo scopo l'oggetto sprite.player.
  // collCallback(sprite): callback chiamato immediatamente dopo l'aggiornamento dei vettori di accelerazione, velocità
  //                       e posizione dello sprite. La sua funzione sarà verificare eventuali collisioni dello sprite
  // con gli oggetti dell'ambiente di gioco effettuando, nel caso di sovrapposizione con zone di schermo non consentite,  
  // uno spostamento forzato delle coordinate dello sprite (vettore sprite.position).   
  updatePosition(elapsedTime, ctrlCallback, collCallback) {
  // void updatePosition( float elapsedTime, Function ctrlCallback, Function collCallback )
    if( !elapsedTime ) {
      elapsedTime = deltaTime / 1000.0;
      // percentualizza l'elapsed, nel caso sia passato troppo tempo dall'ultimo frame
      if(elapsedTime > 1.0) elapsedTime = 1.0;
    } // if( !elapsedTime )
        
    let currAnim = null;
    if(!this.currAnim || this.currFrame === undefined) {
      currAnim = this.anim[this.animRef];
    }
    else {
      currAnim = this.anim[this.currAnim];
    }
    
    //
    // imposta il vettore di offset di posizionamento del frame corrente 
    // rispetto a quello di riferimento, in base alle proprietà di allineamento 
    //
    this.offsetPos.set(0, 0);
    // allineamento orizzontale del frame attuale rispetto a quello di riferimento
    switch( currAnim.align ) {
      case SpriteFrameAlign.Left:
        // lascia inalterata la coordinata x del vettore di posizione del frame di riferimento
        this.offsetPos.x = 0;
        break;
        
      case SpriteFrameAlign.Right:
        this.offsetPos.x = this.widthRef - this.width;
        break;
        
      case SpriteFrameAlign.Center:        
      default:
        this.offsetPos.x = (this.widthRef - this.width) / 2;
        break;
    } // switch currAnim.align
    //
    // allineamento verticale del frame attuale rispetto a quello di riferimento
    switch( currAnim.valign ) {
      case SpriteFrameVAlign.Top:
        // lascia inalterata la coordinata y del vettore di posizione del frame di riferimento
        this.offsetPos.y = 0;
        break;
        
      case SpriteFrameVAlign.Middle:
        this.offsetPos.y = (this.heightRef - this.height) / 2;
        break;
        
      case SpriteFrameVAlign.Bottom:
      default:
        this.offsetPos.y = this.heightRef - this.height;
        break;
    } // switch currAnim.align
    
    
    // RILEVAZIONE MOVIMENTO DA TASTIERA E APPLICAZIONE IN ACCELERAZIONE 
    // (se movimento abilitato e sprite non bloccato)
        
    // se callback presente applica allo sprite lo spostamento eventuale che 
    // arriva dai controlli del giocatore
    if(this.player && !this.blocked && ctrlCallback) {      
      // aggiorna i controlli del giocatore
      this.player.update();
      
      // chiama la funzione di callback per applicare allo sprite i controlli 
      // di movimento che arrivano dalla tastiera (incrementando la sua accelerazione)
      ctrlCallback(this);
      
    } // if(this.player && !this.blocked && ctrlCallback)
    
    
    //
    // APPLICAZIONE ALTRI VETTORI DI ACCELERAZIONE ALLA VELOCITA'    
    // Applicazione forze vettoriali all'accelerazione:
    
    // applica allo sprite la forza di gravità, se esiste
    if( this.gravity )
      this.applyForce(this.gravity);
    
    // applica le forze elastiche a cui lo sprite è connesso
    let springForce = null;
    for(let spring of this.springs) {
      springForce = spring.getSpringForce();
      // applica la forza elastica all'accelerazione
      this.applyForce(springForce);
    } // for(let spring of springs)
    
    //
    // Velocity changes according to acceleration
    this.velocity.add( this.acceleration );
    // we must clear acceleration each frame
    // annulla l'accelerazione applicata alla velocità
    this.acceleration.mult(0);
    
    // applica il limite di velocità se c'è
    if(!(this.maxSpeed === undefined))
      this.velocity.limit( this.maxSpeed );
    
    
    // AGGIORNAMENTO POSIZIONE DA VETTORE DI VELOCITA'
    
    // salva il vettore di posizione precedente 
    this.prevPos.set(this.position.x, this.position.y);
    
    // attiva il movimento solo se la velocità dello sprite supera quella di un versore
    // (uso magSq perchè è più veloce e perchè nel caso dei versori la somma dei quadrati delle 
    // coordinate corrisponde alla lunghezza, cioè 1)
    if(!(this.velocity.magSq() <= 1.0)) {
    
      // position changes by velocity
      this.position.add( p5.Vector.mult(this.velocity, elapsedTime) );
      // applica la percentuale di frizione alla velocità
      this.velocity.mult( this.damping );
      
    } // if(!(this.velocity.magSq() <= 1.0))

    // aggiorna la posizione attuale dello sprite rispetto al frame  
    // corrente e ridefinisce la hitbox
    this.updActPos();  
    
    // se la lunghezza percorsa dall'ultima posizione supera quella di un versore
    // desume che lo sprite sia in movimento
    const vOffsMov = p5.Vector.sub(this.position, this.prevPos);
    this.moving = ( vOffsMov.magSq() > 1.0 );
    // se è deciso che lo sprite sia fermo annulla la velocità residua
    //if( !this.moving ) this.velocity.setMag(0.0);
    
    // se lo sprite è in movimento ed è soggetto a gravità cerca di capire 
    // se stia o meno precipitando nel vuoto oppure volando
    this.falling = false;
    this.flying = false;
    if(this.moving && this.gravity) {
      
      // considera il solo vettore di gravità (che avrà tipicamente una componente x = 0 
      // e una componente y > 0) in relazione a quello di velocità, applicando un prodotto scalare 
      // (dot product) tra i due una volta normalizzati;
      // questo produce uno scalare dp compreso tra -1 e 1 che indica la somiglianza dei 
      // due vettori originari: se dp = 0 i due vettori sono ortogonali (cioè lo sprite procede 
      // con moto lungo l'asse X oppure è fermo), se dp > 0 entrambi vanno nella stessa direzione 
      // (cioè lo sprite sta cadendo), se invece dp < 0 lo sprite procede in direzione opposta 
      // rispetto alla gravità (quindi probabilmente sta volando)
      let dp = this.velocity.copy().normalize()
                   .dot( this.gravity.copy().normalize() );
      //console.log("dp = " + dp + " => " + round(dp));
      dp = round(dp);
      
      this.falling = (dp > 0.0);
      this.flying = (dp < 0.0);
      
    } // if(this.moving && this.gravity)

    
    // CONTROLLI DI COLLISIONE E RISOLUZIONE DEI CONFLITTI
    // eseguiti rispetto alla dimensione e posizione del frame precedente.
    // Il callback esegue lo spostamento dello sprite in caso di conflitti di collisione.
    //
    if(collCallback)
      collCallback(this);
            
  } // updatePosition
  
  
  // Aggiorna il vettore della posizione attuale del frame di visualizzazione dello sprite.
  // E' necessario chiamarlo ogni volta che viene alterato il vettore position (posizione di riferimento).
  // Considerando questa posizione e le dimensioni del frame corrente (width/height) aggiorna anche la hitbox,
  // ovvero il rettangolo immaginario inscritto dal frame corrente, considerando la porzione percentuale
  // di area coperta dalla proprietà hitDelta.
  updActPos() {
  // void updActPos()    
    
    // allinea la posizione del del frame attuale dello sprite utilizzando il vettore di offset
    this.actualPos = p5.Vector.add(this.position, this.offsetPos);        
    
    // definisce il rettangolo di hitbox in posizione centrale rispetto alla posizione del frame corrente:
    // la hitbox cioè si definisce all'interno del rettangolo immaginario del frame corrente, 
    // come un sotto-rettangolo di area proporzionale a quella definita dalla proprietà hitDelta
    if(isNaN(this.hitDelta) || this.hitDelta > 1.0) this.hitDelta = 1.0;
    else if(this.hitDelta < 0.01) this.hitDelta = 0.1;
    let wd = (this.width - (this.width * this.hitDelta)), hd = (this.height - (this.height * this.hitDelta));
    let x = this.actualPos.x + (wd / 2), 
        y = this.actualPos.y + (hd / 2), 
        w = this.width * this.hitDelta, h = this.height * this.hitDelta;
    
    if( !this.hitBox ) {
      this.hitBox = new Rect(x, y, w, h);
    }
    else {
      this.hitBox.position.x = x;
      this.hitBox.position.y = y;
      this.hitBox.width = w;
      this.hitBox.height = h;
      // aggiorna la posizione del punto centrale nel rettangolo della hitbox (vettore posCenter)
      this.hitBox.updateCenter();
    } // if( !this.hitBox )
    
    // definisce il rettangolo boundBox attorno al frame corrente dello sprite
    this.boundBox = new Rect(this.actualPos.x, this.actualPos.y, this.width, this.height);
    
  } // updActPos
    
  
  // Metodo chiamato prima dell'aggiornamento del movimento dello sprite e che intende fornire una procedura 
  // standard di gestione del movimento tramite tastiera e delle animazioni relative dello sprite.
  // Il movimento viene applicato attraverso il vettore di accelerazione dello sprite.
  // Prevede che le proprietà/array dirAnim e idleAnim siano già popolate, che la proprietà player punti ad
  // un oggetto Player di gestione della tastiera aggiornato e che lo sprite non sia bloccato.
  // keyVel: oggetto che definisce la velocità in pixel che può essere applicata a ciascun asse di movimento 
  //         agendo sul vettore di accelerazione (in base alla direzione). Formato: { x: N, y: M }
  // playCallBack: riferimento opzionale alla funzione di callback da richiamare durante la 
  //               riproduzione dell'animazione di movimento o di idle (ad ogni cambio di frame).
  // endCallBack: riferimento opzionale alla funzione di callback da chiamare al termine delle animazioni.
  updPlayMove( keyVel, playCallback, endCallback ) {
    // esce se lo sprite è bloccato e quindi non può muoversi oppure 
    // non esiste un gestore dei controlli di movimento
    if(this.blocked || !this.player) return;

    const currSprite = this;
    // lo sprite sta eseguendo un'animazione di movimento?
    const bInMovAnim = (this.inAnimation && this.currAnim && 
                       (this.dirAnim.find(a => { return a == currSprite.currAnim; }) ? true : false));
        
    //this.dirAngle = undefined;
    //this.direction.set(0, 0);    
    // ottiene l'angolo espresso dal controllo di movimento
    let iAngle = this.player.getMoveAngle();
    // se è presente un movimento e se questo è coerente (le direzioni di verso opposto danno angolo -1)
    if(iAngle > -1) {     
      
      //--- GESTIONE ANIMAZIONE DI MOVIMENTO
      
      // recupera l'animazione connessa alla direzione di movimento
      const sDirAnim = this.getDirAnim(iAngle);
      const sIdleAnim = this.getIdleAnim(iAngle);  
      
      // imposta l'angolo di movimento e il vettore di direzione
      this.dirAngle = iAngle;
      this.direction.x = (this.player.moveLeft ? -1 : (this.player.moveRight ? 1 : 0));
      this.direction.y = (this.player.moveUp ? -1 : (this.player.moveDown ? 1 : 0));              
      const dirCopy = this.direction.copy();
      
      // se c'era già un'animazione di movimento in corso controlla se non sia la stessa 
      // di quella rilevata nella direzione
      if(!(bInMovAnim && this.currAnim == sDirAnim)) {        
        //console.log(iAngle + ": " + sDirAnim + " - " + sIdleAnim);
        
        // imposta l'animazione idle di direzione come animazione di riferimento
        // per consentire alla procedura di impostarla come corrente al termine del movimento
        this.setAnimRef(sIdleAnim, 0);
                
        // a questo punto va attivata la nuova animazione di movimento
        //console.log("play: " + sDirAnim);
        this.playAnimation(sDirAnim, (playCallback ?
          // playCallBack
          function(playAnim, playFrame) {
            //console.log("> " + playAnim + ": " + playFrame);
          
            // se è presente un callback di esecuzione animazione lo chiama
            // passando il codice dell'animazione e il frame corrente
            if(playCallback)
              playCallback(playAnim, playFrame);      

          } : undefined), 
          // endCallBack
          function(endAnim) {
            // questo callback viene lanciato dopo una a chiamata a stopAnimation,
            // quindi qui lo sprite si è sicuramente fermato
            //console.log("- " + endAnim);

            // ribadisce la direzione in cui lo sprite è girato ora che questo è fermo 
            // (che per convenzione è la stessa in cui si rivolgeva durante il movimento)
            currSprite.direction.set(dirCopy.x, dirCopy.y);
            currSprite.dirAngle = iAngle;            
          
            // se è presente un callback di termine animazione lo chiama
            // passando il codice dell'animazione finale
            if(endCallback)
              endCallback(endAnim);                    
                    
            // manda in riproduzione l'animazione di riferimento
            //console.log("play: " + this.animRef);
            //this.playAnimation(this.animRef);
            //
            // l'animazione idle di riferimento è stata memorizzata prima dell'avvio 
            // dell'animazione, il cui primo frame verrà utilizzato come frame di uscita
            // dal metodo draw
          
          }); // playAnimation
                                
      } // if(!(bInMovAnim && ...

      
      // --- APPLICAZIONE MOVIMENTO ALL'ACCELERAZIONE
      
      // applica un vettore di movimento a quello dell'accelerazione, 
      // che poi contribuirà alla velocità dello sprite
      this.acceleration.x += (this.direction.x * keyVel.x);
      this.acceleration.y += (this.direction.y * keyVel.y);
      
      
    } // if(iAngle > -1)
    else {
      // in questo caso c'è assenza di movimento da parte del giocatore
      
      // ferma l'animazione corrente se connessa al movimento e se in esecuzione
      if(bInMovAnim && this.runningAnim) 
        this.stopAnimation(true);
        
    } // if(iAngle > -1)
            
  } // updPlayMove
  
  
  // Imposta le coordinate di posizionamento dello sprite in relazione al frame di riferimento.
  // Allinea la posizione precedente per evitare il rilevamento di movimento.
  setPosition(x, y) {
    
    this.position.set(x, y);
    this.prevPos.set(x, y);    
    // ricalcola le coordinate attuali e la hitbox
    this.updActPos();
    
  } // setPosition
  
  
  // Riproduce l'animazione di codice passato.
  // playCallBack: riferimento opzionale alla funzione di callback da richiamare durante la 
  // riproduzione dell'animazione (ad ogni cambio di frame).
  // endCallBack: riferimento opzionale alla funzione di callback da chiamare al termine 
  // dell'animazione, che può terminare naturalmente (se animazioni senza loop) oppure 
  // interrompersi proceduralmente.  
  playAnimation( sAnim, playCallBack, endCallBack ) {
  // void playAnimation( string sAnim, Function playCallBack, Function endCallBack )
    // se c'è già un'altra animazione in corso la ferma
    if(this.inAnimation && this.currAnim != sAnim)
      this.stopAnimation(true);

    if(this.currAnim != sAnim) {
      this.currAnim = undefined;
      this.currFrame = undefined;      
    } // if(this.currAnim != sAnim)
    
    this.inAnimation = true;
    this.runningAnim = true;   
    // salva la proprietà blocked nell'oggetto transitorio
    // (ma solo se l'animazione non era stata messa in pausa)
    if( this._savedProps.blocked === undefined )
      this._savedProps.blocked = this.blocked;
    
    // se l'animazione prosegue dopo una pausa currAnim sarà diverso da undefined
    if(!this.currAnim) {
      // verifica l'esistenza dell'animazione
      if(!this.anim[sAnim]) {
        this.inAnimation = false;
        this.runningAnim = false;
        this.soundTime = false;
        this._savedProps.blocked = undefined;
        return;
      }
      // verifica se l'animazione va riprodotta al rovescio
      const bReverse = this.anim[sAnim].reverse ? true : false;

      this.currAnim = sAnim;
      this.currFrame = (!bReverse ? 0 : this.anim[this.currAnim].frames.length - 1);
      //this.milliFrame = millis() + this.anim[sAnim].millis;
      this.milliFrame = millis();
      //console.log("^ " + millis());
      this.soundTime = true;
      
      // blocca i movimenti dello sprite durante l'animazione, se richiesto,
      // altrimenti lascia lo stato di blocco dello sprite a come era prima
      // (per permettere blocchi esterni in relazione ad altri eventi)
      if ( this.anim[this.currAnim].blocking ) 
        this.blocked = true;
      
      // se è stato passato un callback di esecuzione animazione lo conserva, altrimenti annulla il rif.to a quello precedente
      this.callPlayAnim = (playCallBack ? playCallBack : null);
      // se è stato passato un callback di termine animazione lo conserva, altrimenti annulla il rif.to a quello precedente
      this.callEndAnim = (endCallBack ? endCallBack : null);
      //
      // conserva i riferimenti ai callback di esecuzione e di fine animazione, per evitare che vadano fuori scope dopo 
      // il termine; inoltre conserva l'ID all'ultimo record di callback appena memorizzato, se c'è stato
      this.lastCallbackID =
        this.storeCallbackData(playCallBack, endCallBack);
      
      // se è presente un callback di esecuzione animazione lo chiama (per l'esecuzione del primo frame),
      // passando il codice dell'animazione e il frame appena scattato
      if(playCallBack)
        playCallBack(this.currAnim, this.currFrame);      
      
      
    } // if(!this.currAnim)
  } // playAnimation
    
  // Ferma provvisioriamente l'animazione corrente.
  pauseAnimation() {
    this.stopAnimation( false );
  } // pauseAnimation
  
  // Riprende l'animazione messa in pausa.
  resumeAnimation() {
    if(this.currAnim && this.inAnimation && !this.runningAnim)
      _agent.playAnimation( this.currAnim );
  } // resumeAnimation
  
  // Ferma provvisoriamente o arresta l'animazione corrente.
  // bReset: se true arresta l'animazione, altrimenti la mette in pausa.
  // bForceExit: se true esce dall'animazione facendo ripristinare il frame di riferimento al metodo update,
  // altrimenti controlla il flag exit dell'animazione per capire se lasciare o meno l'ultimo frame visualizzato
  // dall'animazione come prossimo frame da visualizzare.
  stopAnimation( bReset, bForceExit = true ) {
  // void stopAnimation( bool bReset )
        
    this.runningAnim = false;
    if( bReset ) {
      //console.log("- " + millis());
      // animazione che sta per essere terminata
      const sAnim = this.currAnim;

      this.inAnimation = false;
      this.milliFrame = 0.0;
      this.soundTime = false;
      // se la proprietà exit è assente vale true per default
      if( bForceExit || (this.anim[sAnim] && 
                         (this.anim[sAnim].exit === undefined || this.anim[sAnim].exit)) ) {
        this.currAnim = undefined;
        this.currFrame = undefined;        
      } // if( bForceExit || ... )

      // ripristina lo stato di blocco precedente
      if( this._savedProps.blocked != undefined )
        this.blocked = this._savedProps.blocked;
      // rimuove la proprietà salvata
      this._savedProps.blocked = undefined;
      
      //
      // se è presente un callback di termine animazione lo chiama,
      // passando il codice dell'animazione appena terminata
      let callRec = this.getCallbackData();
      //if(callRec && callRec.callEndAnim) 
      //  callRec.callEndAnim(sAnim);

      if(this.callEndAnim) {
        this.callEndAnim(sAnim);
      }
                                          
      // lancia la procedura di eliminazione di vecchi record di callback
      this.wipeCallbackData();      
      // dichiara l'ultimo record di callback eliminabile all'arresto della prossima animazione
      if(callRec)
        callRec.disposable = true;

      // annulla riferimenti ad ultimi callback utilizzati
      // NOTA: commentato perchè inspiegabilmente, nel caso di animazioni ad un solo frame,
      // il callback di chiusura veniva eliminato mentre era in esecuzione (??)
      // NOTA 2: l'introduzione dell'array callbacks dovrebbe evitare questo problema
      this.callPlayAnim = null;
      this.callEndAnim = null;
      
    } // if( bReset )
    
  } // stopAnimation
  
  
  // Memorizza un record di dati che conservano i riferimenti ai callback di animazione passati.
  // Restituisce l'ID del record di dati memorizzato oppure undefined.
  storeCallbackData(playCallBack = null, endCallBack = null) {
    // esce se i callback sono nulli
    if(!playCallBack && !endCallBack) 
      return undefined;
    
    // istanzia un'area di memorizzazione per i callback che abbia un ID univoco
    let callRec = new Sprite.CallbackData();
    do {
      callRec.id = Sprite.getNewId();
    } 
    while( this.callbacks.some(callback => callback.id === callRec.id ) );
    
    // memorizza nel record i riferimenti dei callback passati
    callRec.callPlayAnim = playCallBack;
    callRec.callEndAnim = endCallBack;
    
    // memorizza il record di dati nell'array dei set di callback
    this.callbacks.push(callRec);
    return callRec.id;
  } // storeCallbackData
  
  // Tenta il recupero dell'ultimo record di riferimenti a callback memorizzato, altrimenti restituisce undefined.
  getCallbackData() {
    const sprite = this;
    // per il recupero utilizza la proprietà apposita
    let callRec = this.callbacks.find(
      function(rec) {
        return (rec.id === sprite.lastCallbackID);
      });
    return callRec;
  } // getCallbackData
  
  // Elimina i record di dati che conservano riferimenti ai callback di animazione, basandosi sul
  // flag di eliminazione e sul timeout di residenza in memoria.
  wipeCallbackData() {
    const sprite = this;
    // estrae il filtro degli oggetti di callback non scaduti
    let callFlt = this.callbacks.filter(
      function(calldta) { 
        if(!calldta.disposable && millis() - calldta.millis < sprite.CALLBACK_TIMEOUT) 
          return calldta; 
      });
    
    // sostituisce l'attuale array dei dati di callback con il filtro
    this.callbacks = callFlt;
  } // wipeCallbackData

  
  // Imposta l'animazione di riferimento dello sprite, definendo un frame opzionale (default: 0).
  // L'animazione di riferimento è utile al sistema di animazione per avere un riferimento
  // per l'allineamento dei frame dell'animazione corrente e opzionalmente per disporre di un'animazione 
  // da eseguire al termine dell'animazione stessa.
  setAnimRef( sAnimRef, iFrameRef = 0 ) {
    let oAnim = null;
    //if(this.animRef != sAnimRef) {
      oAnim = this.anim[sAnimRef];
      this.animRef = sAnimRef;
      this.frameRef = iFrameRef;
      this.widthRef = oAnim.frames[0].width;
      this.heightRef = oAnim.frames[0].height;        
    //} // if(this.animRef != sAnimRef)    
  } // setAnimRef
  
  
  // Imposta il frame corrente dello sprite senza avviare l'animazione relativa.
  // Non esegue alcuna modifica se lo sprite è correntemente in stato di animazione.
  // sAnim: nome dell'animazione in cui trovare il frame da mostrare.
  // iFrame: indice del frame da mostrare.
  // startAnimation: avvia contestualmente lo stato di animazione, mettendo in pausa sul frame specificato.
  setStaticFrame( sAnim, iFrame, startAnimation = false ) {
    // se lo sprite è correntemente in animazione esce senza eseguire nulla
    if(this.inAnimation)
      return;
    
    // per default resetta il frame corrente
    this.currAnim = undefined;
    this.currFrame = undefined;
    
    if( !this.anim[sAnim] ) 
      return;
    if( !this.anim[sAnim].frames[iFrame] ) 
      return;
    
    this.currAnim = sAnim;
    this.currFrame = iFrame;
    
    if(startAnimation) {
      this.inAnimation = true;
      this.runningAnim = false;
    }    
  } // setStaticFrame


  // Imposta le proprietà che indicano la direzione in cui è rivolto lo sprite, in base al versore passato (.
  setDirection( x, y ) {
  // void setDirection( int x, int y )
    
    if((x === 0 || !x) && (y === 0 || !y)) {
      this.dirAngle = undefined;
      this.direction.set(0, 0);
    }
    else {
      if(x > 0) x = 1;
      else 
        if(x < 0) x = -1;
      if(y > 0) y = 1;
      else 
        if(y < 0) y = -1;
      
      this.dirAngle = VectUtils.vectorAngle(createVector(x, y));
      this.direction.set(x, y);
      
    } // if((x === 0 || !x) && (y === 0 || !y))    
  } // setDirection


  // Imposta come corrente un numero di frame passato dell'animazione in corso.
  // Se lo sprite non è in fase di animazione non viene eseguita alcuna azione.
  // iFrame: indice del frame da mostrare (se non valido non viene eseguito alcun cambiamento).
  // pauseAnimation: mette contestualmente in pausa l'animazione.
  setCurrFrame( iFrame, pauseAnimation = false ) {
    // se lo sprite non è correntemente in animazione esce senza eseguire nulla
    if(!this.inAnimation)
      return;
    
    // esce anche se l'indice di frame non è coerente con l'animazione corrente
    const currAnim = this.anim[this.currAnim];
    if(iFrame < 0 || iFrame >= currAnim.frames.length)
      return;
    
    this.currFrame = iFrame;
    
    if(pauseAnimation)
      this.pauseAnimation();
  } // setCurrFrame

  
  // Imposta a true il flag di blocco dello sprite, che può essere usato per impedire il controllo dei suoi movimenti.
  // Prima di eseguire il blocco registra il valore precedente in una proprietà temporanea.
  //block() {
  //  // salva la proprietà blocked precedente in modo da ripristinarla dopo lo sblocco
  //  this._savedProps.blocked = this.blocked;
  //  // abilita la proprietà di blocco
  //  this.blocked = true;
  //} // block
  
  // Recupera il flag di blocco precedente dalle proprietà salvate per ripristinare il controllo dei movimenti dello sprite.
  //unBlock() {
  //  // recupera la proprietà dal repository delle proprietà salvate
  //  this.blocked = this._savedProps.blocked;
  //  // se non esiste un valore precedente presuppone che lo sprite non sia bloccato
  //  if(this.blocked === undefined) this.blocked = false;
  //  // annulla il valore salvato per impedire un suo uso successivo
  //  this._savedProps.blocked = undefined;
  //} // unBlock
  
  
  // Salva una proprietà temporanea nel repository apposito.
  setSavedProp(propName, propValue) {
    this._savedProps[propName] = propValue;
  } // setSavedProp
  
  // Recupera il valore di una proprietà temporanea precedentemente salvata nel repository apposito.
  getSavedProp(propName) {
    return this._savedProps[propName];
  } // getSavedProp
  
  
  // Restituisce il rettangolo che inscrive il frame corrente o di riferimento dello sprite.
  // Se actualFrame = true verrà restituito il rettangolo puntato dalle coordinate attuali che inscrive il frame corrente,
  // altrimenti verrà restituito il rettangolo puntato dalla posizione del frame di riferimento.
  getBoundRect( actualFrame = true ) {
  // Rect getBoundRect( bool actualFrame = true )
    let retRect = null;
    if(actualFrame) {
      retRect = new Rect(this.actualPos.x, this.actualPos.y, this.width, this.height);
    }
    else {
      retRect = new Rect(this.position.x, this.position.y, this.widthRef, this.heightRef);
    } // if(actualFrame)
    
    return retRect;
  } // getBoundRect
  
  
  // Applica una rotazione alla visualizzazione dello sprite, agendo sulla sua proprietà transf
  // (che è in priorità inferiore rispetto alla medesima posta a livello animazione o frame).
  // L'angolo di rotazione è espresso in radianti.
  rotate( iAngle ) {
    if(this.transf === undefined)
      this.transf = { };
    
    this.transf.rotate = iAngle;
    
  } // rotate
  
  
  // Applica una scala alla visualizzazione dello sprite, agendo sulla sua proprietà transf
  // (che è in priorità inferiore rispetto alla medesima posta a livello animazione o frame).
  // La scala è percentuale a base 1 ed è proporzionale per entrambi gli assi X e Y.
  scale( iScaleP ) {
    if(this.transf === undefined)
      this.transf = { };
    
    this.transf.scaleX = iScaleP;
    this.transf.scaleY = iScaleP;
    
  } // scale
  
  
  // Visualizza lo sprite nel canvas.
  // updActPos: se true (default) ricalcola la posizione del frame attuale e il rettangolo centrale 
  // di hitbox prima del rendering.
  draw( updActPos = true ) {
  // void draw()
    
    // esce subito se lo sprite non è visibile
    if(!this.visible) return;
    
    // estrae il frame di animazione corrente
    let frame = null;
    if( this.inAnimation || 
       (this.anim[this.currAnim] && this.anim[this.currAnim].frames[this.currFrame]) ) 
      frame = this.anim[this.currAnim].frames[this.currFrame];
    // se il frame è invalido usa il frame di riferimento
    if( !frame && this.anim[this.animRef] )
      frame = this.anim[this.animRef].frames[this.frameRef];

    // esce se non riesce a definire un frame valido da visualizzare
    if(!frame || !frame.image) return;
    
    push();
    //imageMode(CORNER);
    imageMode(CENTER);    
    
    // definisce le coordinate attuali (applicando il vettore di posizione
    // di riferimento a quello di offset) e il rettangolo di hitbox centrale
    //let vpos = p5.Vector.add(this.position, this.offsetPos);
    if( updActPos )
      this.updActPos();
        
    //
    // determina se applicare o meno delle trasformazioni geometriche sul frame da visualizzare
    let bInTranslate = false;
    // in prima analisi controlla se esiste un oggetto di definizione delle trasformazioni a livello frame
    let transf = frame.transf;
    // se non esiste controlla se esiste a livello animazione
    if(transf === undefined && this.anim[this.currAnim]) 
      transf = this.anim[this.currAnim].transf;
    // in terza analisi controlla se esiste una proprietà analoga a livello sprite
    if(transf === undefined) transf = this.transf;    
    // se esiste una qualche trasformazione definita la processa
    if(transf) {
      // applica la traslazione di assi per spostare l'origine nel punto centrale dello sprite
      translate(this.hitBox.posCenter.x, this.hitBox.posCenter.y);
      bInTranslate = true;
      
      // trasformazione: scaleX, scaleY
      let app1 = transf.scaleX, app2 = transf.scaleY;
      if(app1 === undefined || !app1) app1 = 1.0;
      if(app2 === undefined || !app2) app2 = 1.0;
      if(app1 != 1.0 || app2 != 1.0)
        scale(app1, app2);
      
      // trasformazione: rotate
      app1 = transf.rotate;
      if(app1 === undefined || !app1) app1 = 0.0;
      if(app1 != 0.0)
        rotate(app1);
      
      // trasformazione: shearX
      app1 = transf.shearX;
      if(app1 === undefined || !app1) app1 = 0.0;
      if(app1 != 0.0)
        shearX(app1);      
      // trasformazione: shearY
      app1 = transf.shearY;
      if(app1 === undefined || !app1) app1 = 0.0;
      if(app1 != 0.0)
        shearY(app1);
      
    } // if(transf)
        
    // applica un filtro di rendering grafico, se presente
    // (https://developer.mozilla.org/en-US/docs/Web/CSS/filter)
    if(!(this.filter === undefined))
      drawingContext.filter = this.filter;
    
    // disegna il frame dello sprite alle coordinate attuali del frame
    //image(frame.image, this.actualPos.x, this.actualPos.y);
    // usa le coordinate della posizione centrale della hitbox, nel centro del frame attuale
    let posX = this.hitBox.posCenter.x, posY = this.hitBox.posCenter.y;
    if(bInTranslate) [posX, posY] = [0, 0];
    image(frame.image, posX, posY);
    
    if(!(this.filter === undefined))
      drawingContext.filter = "none";
    
    pop();
    
    // se il frame corrente prevede un suono e c'è un'animazione in esecuzione 
    if(!(frame.sound === undefined) && this.inAnimation && this.runningAnim && this.soundTime) {      
      //frame.sound.play();
      const sndAnim = this.snd[frame.sound].sound;
      
      if( sndAnim.isPlaying() ) sndAnim.stop();
      sndAnim.play();
      
      // disattiva la riproduzione molteplice del suono durante la visualizzazione dello stesso frame
      this.soundTime = false;      
    } // if(frame.sound && ...
              
  } // draw
  
  
  
  //////////////////////////////////////////////////////////
  
  // Estrae un nuovo ID casuale per l'istanza dello sprite.
  static getNewId() {
  // int getNewId()
    return int((new Date()).getTime() / millis() * random(0.0, 1.0));
  } // getNewId
  
  
} // Sprite


// Classe che rappresenta i dati utilizzati per conservare lo scope dei callback 
// eventualmente passati durante l'avvio di un'animazione.
Sprite.CallbackData = function() {
  
  // identificativo per il set di callback
  this.id = Sprite.getNewId();
  // millisecondo dall'inizio dell'esecuzione in cui viene inizializzato questo set di callback
  this.millis = int(millis());
  
  // riferimenti ai callback di svolgimento e termine animazione
  this.callPlayAnim = null;
  this.callEndAnim = null;
  
  // indica che è possibile rimuovere questo set di callback
  this.disposable = false;
} // Sprite.CallbackData



