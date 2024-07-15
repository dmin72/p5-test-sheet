
////////////////////////////////////////////////////////////////////////////////////////////////////

// Classe statica utilizzata per l'implementazione di funzioni helper di natura vettoriale.
var _VectUtils = function() {

      
} // GeoUtils
//
_VectUtils.prototype = {

  // Ottiene l'angolo in gradi in cui è orientato il vettore passato.
  vectorAngle: function( vecTest ) {  
  // double vectorAngle(p5.Vector vecTest)
    let prevMode = getAngleMode();
    setAngleMode(RADIANS);

    // gli angoli vettoriali non seguono l'odine antiorario 0/45/90/135/180/225/270/315
    // ma bensì 0/45/90/135/180/-135/-90/-45
    let iAngle = degrees(vecTest.heading());
    //let iAngle = (Math.atan2(vecTest.y, vecTest.x) / Math.PI) * 180

    // se l'angolo è positivo basta restituire l'angolo così com'è
    // [quadranti I (alto/dx) e II (alto/sx)]
    if(iAngle < 0) {
      // in caso di angoli negativi basta aggiungere 360 all'angolo stesso
      // [quadranti III (basso/sx) e IV (basso/dx)]
      iAngle += 360;
    } // if(iAngle < 0)
    //console.log(iAngle);

    // ripristina la precedente modalità di lettura degli angoli
    setAngleMode(prevMode);
    return iAngle;
  }, // vectorAngle
  
  
  // Calcola il prodotto scalare dei due vettori passati.
  // Il prodotto scalare di due vettori normalizzati restiuisce un valore che può essere usato 
  // per verificare se i due vettori hanno una direzione concorde, perpendicolare o opposta:
  // - se è > 0 i versori puntano più o meno nella medesima direzione
  // - se è 0 i versori sono ortogonali 
  // - se è < 0 i versori sono divergenti o opposti
  dotProd: function(v1, v2) {
  // p5.Vector v1, p5.Vector v2
    return (v1.x * v2.x) + (v1.y * v2.y);
  }, // dotProd
  
  
  // Restituisce un'array contenente i vettori normali della retta che passa per due punti 
  // (ovvero i vettori perpendicolari alla retta).
  // Il primo elemento presenta la normale sinistra, il secondo quella destra.
  normalVect: function(x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    return [ createVector(-dy, dx), createVector(dy, -dx) ];    
  }, // normalVect
  

  // Renders a vector object 'v' as an arrow and a position 'pos'
  //function drawVector(PVector v, PVector pos, float scale) {
  drawVector: function(v, pos, scale) {
    if(!scale) scale = 1.0;
    push();
    let arrowsize = 6.0;
    // Translate to position to render vector
    translate(pos.x, pos.y);
    stroke(0);
    strokeWeight(1);
    // Call vector heading function to get direction (pointing up is a heading of 0)
    rotate( v.heading() );
    // Calculate length of vector & scale it to be bigger or smaller if necessary
    let len = v.mag() * scale;
    // Draw three lines to make an arrow 
    line(0, 0, len, 0);
    line(len, 0, len - arrowsize, +arrowsize / 2);
    line(len, 0, len - arrowsize, -arrowsize / 2);
    pop();
  } // drawVector

  
  
} // GeoUtils.prototype

// entry point della classe statica _VecUtils
var VectUtils = new _VectUtils();

////////////////////////////////////////////////////////////////////////////////////////////////////


