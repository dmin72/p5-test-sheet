// -------------------------------------------
// -- Funzioni helper per P5
// -------------------------------------------

// conserva l'ultima rilevazione del tempo in millisecondi (getTime)
var _fLastTime = 0;

// conserva l'impostazione della funzione angleMode per consentire di leggerla, se serve
var _angleMode2 = undefined;

// Restituisce l'angleMode corrente utilizzato da P5.
function getAngleMode() {
  // la prima volta recupera l'angleMode corrente dalla variabile globale
  // (la variabile globale P5 non viene usata perchè non sembra essere aggiornata 
  // ai successivi cambi di modalità)
  if(_angleMode2 === undefined) _angleMode2 = window._angleMode;
  return _angleMode2;
} // getAngleMode

// Imposta l'angleMode corrente utilizzato da P5.
// Utilizzare questa funzione al posto di angleMode altrimenti la variabile tornata 
// da getAngleMode non sarà aggiornata.
function setAngleMode(mode) {
  _angleMode2 = mode;
  angleMode(mode);
} // setAngleMode


// conserva l'impostazione della funzione imageMode per consentire di leggerla, se serve
var _imageMode2 = undefined;

// Restituisce l'imageMode corrente utilizzato da P5.
function getImageMode() {
  // la prima volta recupera l'imageMode corrente dalla variabile globale
  // (la variabile globale P5 non viene usata perchè non sembra essere aggiornata 
  // ai successivi cambi di modalità)
  //if(_imageMode2 === undefined) _imageMode2 = window._imageMode;
  if(_imageMode2 === undefined) _imageMode2 = CORNER;
  return _imageMode2;
} // getImageMode

// Imposta l'imageMode corrente utilizzato da P5.
// Utilizzare questa funzione al posto di imageMode altrimenti la variabile tornata 
// da getImageMode non sarà aggiornata.
function setImageMode(mode) {
  _imageMode2 = mode;
  imageMode(mode);
} // setImageMode


// conserva l'impostazione della funzione rectMode per consentire di leggerla, se serve
var _rectMode2 = undefined;

// Restituisce il rectMode corrente utilizzato da P5.
function getRectMode() {
  // la prima volta che viene interrogata restituisce l'impostazione di default
  if(_rectMode2 === undefined) _rectMode2 = CORNER;
  return _rectMode2;
} // getRectMode

// Imposta il rectMode corrente utilizzato da P5.
// Utilizzare questa funzione al posto di rectMode altrimenti la variabile tornata 
// da getRectMode non sarà aggiornata.
function setRectMode(mode) {
  _rectMode2 = mode;
  rectMode(mode);
} // setRectMode


// Aggiorna la rilevazione dell'ultimo tempo in millisecondi restituendo 
// il delta time in secondi rispetto all'ultima rilevazione.
function getDeltaTime() {
  
  // millisecondi correnti
  var currTime = new Date().getTime();
  // secondi passati dall'ultimo frame
  var elapsedTime = (currTime - _fLastTime) / 1000;
  // millisecondi passati
  _fLastTime = currTime;
  if (elapsedTime > 1)
    elapsedTime = 1;  
  
  return elapsedTime;
} // getDeltaTime




