
class Player {
  constructor() {    
        
    // periferica corrente di controllo movimenti e azioni
    this.ctrlDevice = Player.eCtrlDevice.eKeyboard;
    
    // oggetto corrente dei keyCode di controllo da tastiera
    this.keybControls = Player.keybCtrlSets[0];    
    // flag di controllo movimento e azione (tastiera)
    this.keyb = new Player.Controls();
    // flag aggiuntivi per mappatura controlli da tastiera non filtrati (anche non disponibili)
    this.keyb.all = new Player.Controls();
        
    // bitmask di enumerato Player.eMoveActionCmds che rappresenta 
    // i movimenti e le azioni disponibili al giocatore 
    // (per default impostata a tutti i comandi, ovvero: 2^16 - 1 = 65535
    //  per comprendere tutti i possibili valori futuri dell'enumerato)    
    this.availCtrlStat = Math.pow(2, Player.CMDSTATBITS) - 1;
    
  } // constructor
  
  
  // Metodo per il refresh dell'oggetto di controllo per il giocatore.
  update() {
    
    // aggiorna i controlli da tastiera
    this.checkKeyboardControls();
    
    // aggiorna i flag di movimento e azione standard in base alla periferica corrente
    let ctrlFlags = null;    
    switch(this.ctrlDevice) {
      
      case Player.eCtrlDevice.eMouse:
        break;
      case Player.eCtrlDevice.eScript:
        break;
        
      case Player.eCtrlDevice.eKeyboard:
      default:
        ctrlFlags = this.keyb;
        break;
    } // switch(this.ctrlDevice)
    
    // se flag di controllo non disponibili registra un flag set vuoto
    if(!ctrlFlags) ctrlFlags = new Player.Controls();
    //
    Player.updCtrlFlags(this, ctrlFlags);
    // aggiorna (se ci sono) i flag senza filtro di disponibilità
    if(ctrlFlags.all) {
      if(!this.all) this.all = { };
      Player.updCtrlFlags(this.all, ctrlFlags.all);
    } // if(ctrlFlags.all)
              
  } // update
  
  
  // Controlla la tastiera per impostare i flag di controllo del giocatore.
  checkKeyboardControls() {
    // ottiene i keyCode dei tasti da controllare
    let keyUp = this.keybControls.keyUp,
        keyDown = this.keybControls.keyDown,
        keyLeft = this.keybControls.keyLeft,
        keyRight = this.keybControls.keyRight,
        keyButton1 = this.keybControls.keyButton1,
        keyButton2 = this.keybControls.keyButton2;
        
    // tasti movimento premuti
    let bUpKey = keyIsDown(keyUp), bDownKey = keyIsDown(keyDown),
        bLeftKey = keyIsDown(keyLeft), bRightKey = keyIsDown(keyRight),
        bButton1Key = keyIsDown(keyButton1), bButton2Key = keyIsDown(keyButton2);
    
    //    
    // applica ai movimenti/azioni rilevati la bitmask dei controlli disponibili al giocatore:
    // eseguito movimento in alto
    this.keyb.moveUp = bUpKey && this.isCtrlStatAvail(Player.eMoveActionCmds.eMoveUp);
    // nella proprietà all viene conservato il movimento non filtrato
    this.keyb.all.moveUp = bUpKey;    
    // eseguito movimento in basso
    this.keyb.moveDown = bDownKey && this.isCtrlStatAvail(Player.eMoveActionCmds.eMoveDown);
    this.keyb.all.moveDown = bDownKey;
    // eseguito movimento a sinistra
    this.keyb.moveLeft = bLeftKey && this.isCtrlStatAvail(Player.eMoveActionCmds.eMoveLeft);
    this.keyb.all.moveLeft = bLeftKey;
    // eseguito movimento a destra
    this.keyb.moveRight = bRightKey && this.isCtrlStatAvail(Player.eMoveActionCmds.eMoveRight);
    this.keyb.all.moveRight = bRightKey;
    // eseguito movimento in una direzione qualsiasi (flag filtrato e non)
    this.keyb.moveAnyDir = this.keyb.moveUp || this.keyb.moveDown || 
                           this.keyb.moveLeft || this.keyb.moveRight;
    this.keyb.all.moveAnyDir = bUpKey || bDownKey || bLeftKey || bRightKey;
    
    // premuto il pulsante 1
    this.keyb.pressButton1 = bButton1Key && this.isCtrlStatAvail(Player.eMoveActionCmds.eButton1);
    this.keyb.all.pressButton1 = bButton1Key;
    // premuto il pulsante 2
    this.keyb.pressButton2 = bButton2Key && this.isCtrlStatAvail(Player.eMoveActionCmds.eButton2);
    this.keyb.all.pressButton2 = bButton2Key;
    
  } // checkControls
  
  
  // Restituisce un angolo in gradi che rappresenta il movimento negli 8 punti cardinali 
  // possibili, letto dai tasti associati alle relative direzioni.
  // Se il movimento è incoerente (cioè viene rilevato movimento contemporaneo in direzioni opposte) 
  // viene restiutito un angolo pari a -1.
  // Viene restituito -1 anche in caso di immobilità del personaggio di gioco.
  getMoveAngle() {
  // int getMoveAngle()
    
    if((this.moveUp && this.moveDown) || (this.moveLeft && this.moveRight))
      return -1;
    let aRet = -1;
    
    // angolo di movimento verticale
    let aVert = (this.moveUp ? 90 : (this.moveDown ? 270 : -1));
    // angolo di movimento orizzontale
    let aOriz = (this.moveLeft ? 180 : (this.moveRight ? 0 : -1));
    
    if(aVert == -1) {
      aRet = aOriz;
    }
    else {
      let sgn = 0;
      
      if(this.moveLeft) {
        sgn = (this.moveUp ? 1 : -1);
      } // if(this.moveLeft)
      if(this.moveRight) {
        sgn = (this.moveUp ? -1 : 1);        
      } // if(this.moveRight)
      
      aRet = aVert + (sgn * 45);
    } // if(aVert == -1)
    
    return aRet;
  } // getMoveAngle
  
  
  // Restituisce un enumerato di stato che rappresenta la situazione dei controlli correnti. 
  getCtrlStatus() {
    let iStatus = 0;
    
    if(this.moveUp) iStatus |= Player.eMoveActionCmds.eMoveUp;
    if(this.moveDown) iStatus |= Player.eMoveActionCmds.eMoveDown;
    if(this.moveLeft) iStatus |= Player.eMoveActionCmds.eMoveLeft;
    if(this.moveRight) iStatus |= Player.eMoveActionCmds.eMoveRight;
    
    if(this.pressButton1) iStatus |= Player.eMoveActionCmds.eButton1;
    if(this.pressButton2) iStatus |= Player.eMoveActionCmds.eButton2;
    
    return iStatus;
  } // getCtrlStatus
  
  
  // Imposta la disponibilità o meno di uno specifico comando di azione o movimento.
  // E' possibile passare in eCmdToSet più di un comando o azione componendo i flag con un op.re bitwise OR, es:
  // setAvailCtrlStat( (Player.eMoveActionCmds.eMoveUp | Player.eMoveActionCmds.eButton1), false );
  setAvailCtrlStat( eCmdToSet, bValue ) {
  // void setAvailCtrlStat( Player.eMoveActionCmds eCmdToSet, bool bValue )
    
    if(bValue) {
      // abilita il/i flag di stato con l'operatore bitwise OR
      this.availCtrlStat |= eCmdToSet;  
    }
    else {
      // disabilita il/i flag di stato con l'operatore bitwise AND applicato all'op.re di inversione bit
      this.availCtrlStat &= ~eCmdToSet;
    }        
  } // setAvailCtrlStat
    
  
  // Ritorna il valore logico di disponibilità del giocatore ad uno o più comandi/azioni di controllo.
  // Per controllare più valori di enumerato utilizzare l'operatore bitwise OR (come mostrato nella def.ne dell'enumerato).
  isCtrlStatAvail( eStatus ) {
  // bool isCtrlStatAvail( Player.eMoveActionCmds eStatus )
    
    return ( (this.availCtrlStat & eStatus) === eStatus ? true : false );
    
  } // isCtrlStatAvail
  
    
  // Resetta il set di flag di movimento/azione rilevati nell'oggetto (compresi quelli senza filtri).
  resetControls() {    
    // istanzia un set di controlli disattivi
    const ctrlFlagSet = new Player.Controls();
    
    // annulla i flag di movimento/azione rilevati
    Player.updCtrlFlags(this, ctrlFlagSet);
    // annulla gli stessi flag nell'area dei flag non filtrati
    if(!this.all) this.all = { };
    Player.updCtrlFlags(this.all, ctrlFlagSet);
    
  } // resetControls
  
  
  //----------------------------------------
  // Metodi statici
  //----------------------------------------
    
  // Aggiorna lo status dei flag di controllo/movimento a partire da un oggetto dove copiarli.
  static updCtrlFlags(context, ctrlFlagSet) {
    
    for(let flag in ctrlFlagSet) {
      // evita la proprietà all per evitare l'aggiornamento per riferimento
      if(flag != "all") {
        context[flag] = ctrlFlagSet[flag];
      } // if(flag != "all")
    } // for(let flag in ctrlFlagSet)
    
  } // updCtrlFlags
  
  
  // Restituisce un valore logico che informa se lo status bitwise eStatus 
  // verifica o meno il valore di enumerato eCmdToCheck.
  static chkCtrlStatus( eStatus, eCmdToCheck ) {
  // bool chkCtrlStatus( Player.eMoveActionCmds eStatus, Player.eMoveActionCmds eCmdToCheck )
    
    // con l'operatore bitwise & è possibile testare se un valore è verificato nella bitmask
    // applicando l'operatore e ottenendo lo stesso valore che si sta verificando (AND logico)
    return ( (eStatus & eCmdToCheck) === eCmdToCheck ? true : false );
    
  } // chkCtrlStatus
  
    
} // Player



//-----------------------------------------------
// Costanti e membri statici per classe Player
//-----------------------------------------------

// Classe privata che definisce l'insieme dei controlli di movimento/azione disponibili.
Player.Controls = function() {
  
  this.moveUp = false;
  this.moveDown = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.moveAnyDir = false;

  this.pressButton1 = false;
  this.pressButton2 = false;

} // Player.Controls


// Set predefiniti di mappatura tasti per controlli da tastiera
Player.keybCtrlSets = [  
  {
    keyUp: 38,                  // UP_ARROW
    keyDown: 40,                // DOWN_ARROW
    keyLeft: 37,                // LEFT_ARROW
    keyRight: 39,               // RIGHT_ARROW
    keyButton1: 17,             // CONTROL
    keyButton2: 32              // spazio
  },
  {
    keyUp: 87,                  // W
    keyDown: 83,                // S
    keyLeft: 65,                // A
    keyRight: 68,               // D
    keyButton1: 13,             // ENTER
    keyButton2: 8               // BACKSPACE
  }    
]; // keybCtrlSets



// Enumerato che elenca le possibili periferiche di input per il controllo di movimenti e azioni
Player.eCtrlDevice = Object.freeze({
  eKeyboard: 0,
  eMouse: 1,
  eScript: 2
});


// Enumerato bitwise dei comandi di movimento e azioni rilevabili dal giocatore.
// Per impostare più valori di enumerato utilizzare l'operatore bitwise OR, ad es:
// let stat = Player.eMoveActionCmds.eMoveUp | Player.eMoveActionCmds.eButton1;
Player.eMoveActionCmds = Object.freeze({
  eNoAction: 0,
  eMoveUp: 1,
  eMoveDown: 2,
  eMoveLeft: 4,
  eMoveRight: 8,
  eButton1: 16,
  eButton2: 32
});
//
// numero massimo di bit utilizzati per la bitmask dell'enumerato
Player.CMDSTATBITS = 16;


