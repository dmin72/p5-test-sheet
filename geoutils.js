
////////////////////////////////////////////////////////////////////////////////////////////////////

// Classe statica utilizzata per l'implementazione di funzioni helper di natura geometrica/trigonometrica.
var _GeoUtils = function() {

  // costante utilizzata per i controlli di uguaglianza tra variabili numeriche decimali
  this.EquityTolerance = 0.000000001;
    
  
} // GeoUtils
//
_GeoUtils.prototype = {

  // Valore logico di uguaglianza geometrica dei due numeri in virgola mobile passati,
  // in base alla soglia di tolleranza standard definita nella costante EquityTolerance.
  dblEqual: function(d1, d2) {
  // public double IsEqual(double d1, double d2)
    //console.log(this.EquityTolerance);
    return Math.abs(d1 - d2) <= this.EquityTolerance;
  }, // dblEqual
  
  
  // Calcola e restituisce il punto di intersezione tra due rette rappresentate entrambe da due punti 
  // (l1p1, l1p2) per la retta l1 e (l2p1, l2p2) per la retta l2.
  // Restituisce null se non esiste un punto di intersezione.
  //
  getIntersectPoint: function(l1p1, l1p2, l2p1, l2p2) {  
  // public Point2D getIntersectPoint(Point2D l1p1, Point2D l1p2, Point2D l2p1, Point2D l2p2)

    // Basato su "Intersection of Convex Polygons Algorithm", di Sinan Oz (3/12/2018)
    // https://www.swtestacademy.com/intersection-convex-polygons-algorithm/ 
    // math logic from http://www.wyrmtale.com/blog/2013/115/2d-line-intersection-in-c

    const A1 = l1p2.y - l1p1.y;
    const B1 = l1p1.x - l1p2.x;
    const C1 = A1 * l1p1.x + B1 * l1p1.y;
    const A2 = l2p2.y - l2p1.y;
    const B2 = l2p1.x - l2p2.x;
    const C2 = A2 * l2p1.x + B2 * l2p1.y;  
    //console.log("A1="+A1+", B1="+B1+", C1="+C1+", A2="+A2+", B2="+B2+", C2="+C2);

    // lines are parallel
    const det = A1 * B2 - A2 * B1;
    //console.log("det="+det);
    if (this.dblEqual(det, 0.0)) {
      // parallel lines
      return null; 
    }
    else {
      const x = (B2 * C1 - B1 * C2) / det;
      const y = (A1 * C2 - A2 * C1) / det;
      //console.log("x="+x+", y="+y);

      let minX = Math.min(l1p1.x, l1p2.x), maxX = Math.max(l1p1.x, l1p2.x);
      let minY = Math.min(l1p1.y, l1p2.y), maxY = Math.max(l1p1.y, l1p2.y);
      const online1 = ((minX < x || this.dblEqual(minX, x))
          && (maxX > x || this.dblEqual(maxX, x))
          && (minY < y || this.dblEqual(minY, y))
          && (maxY > y || this.dblEqual(maxY, y))
          );
      //console.log("minX="+minX+", maxX="+maxX+", minY="+minY+", maxY="+maxY);
      //console.log("online1="+online1);

      minX = Math.min(l2p1.x, l2p2.x); maxX = Math.max(l2p1.x, l2p2.x);
      minY = Math.min(l2p1.y, l2p2.y); maxY = Math.max(l2p1.y, l2p2.y);
      const online2 = ((minX < x || this.dblEqual(minX, x))
          && (maxX > x || this.dblEqual(maxX, x))
          && (minY < y || this.dblEqual(minY, y))
          && (maxY > y || this.dblEqual(maxY, y))
          );
      //console.log("minX="+minX+", maxX="+maxX+", minY="+minY+", maxY="+maxY);
      //console.log("online2="+online2);

      if (online1 && online2)
        return new Point2D(x, y);
    }

    // intersection is at out of at least one segment.
    return null;  
  }, // getIntersectPoint


  // Ritorna il punto di intersezione del raggio proiettato dal punto pt0 nella direzione applicata
  // dal versore vect, sulla retta definita dai due punti (lpt1, lpt2).
  // Si consiglia di passare un vettore normalizzato in vect, in quanto questo verrà sommato 
  // a pt0 per definire la retta in cui giace la direzione del raggio.
  // Restituisce null se non esiste un punto di intersezione.
  getIntersectRayPoint: function(pt0, vect, lpt1, lpt2) {
  // Point2D getIntersectRayPoint(Point2D pt0, p5.Vector vect, Point2D lpt1, Point2D lpt2)

    // Codice ispirato da Daniel Shiffman, The Coding Train (2D Visibility, Ray Casting)
    const x1 = lpt1.x;
    const y1 = lpt1.y;
    const x2 = lpt2.x;
    const y2 = lpt2.y;

    // esegue una copia del vettore per trasformarlo in versore di direzione
    // (nel caso non lo fosse)
    //let vdir = vect.copy();
    //vdir.normalize();
    const x3 = pt0.x;
    const y3 = pt0.y;
    const x4 = pt0.x + vect.x;
    const y4 = pt0.y + vect.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // nessun punto di intersezione tra il raggio e la retta
    if (den == 0) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      // ritorna il punto di intersezione proiettato dal raggio
      return new Point2D(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    } 
    else {
      // nessun punto di intersezione tra il raggio e la retta
      return null;
    }
  }, // getIntersectRayPoint


  // Elimina i punti duplicati dell'array passato, ritornando un nuovo array.
  // Il confronto di uguaglianza viene eseguito con il margine di tolleranza geometrica prevista.
  removeDuplPoints: function(aPts) {
  // function Point2D[] removeDuplPoints( Point2D[] aPts )

    let pool = [];  
    for(let npt of aPts) {
      let found = false;

      for(let pt of pool) {
        if(this.dblEqual(pt.x, npt.x) && this.dblEqual(pt.y, npt.y)) {
          found = true;
          break;
        }
      } // for(let pt of pool)

      if(!found) pool.push(npt);
    } // for(let npt of aPts)

    return pool;
  }, // removeDuplPoints

  
  // Ordina l'array di punti passato in senso orario, per facilitare il disegno di un eventuale poligono.
  orderPtsClockwise: function( aPts ) {
  // function Point2D[] orderPtsClockwise( Point2D[] aPts )
    
    // Basato su "Intersection of Convex Polygons Algorithm", di Sinan Oz (3/12/2018)
    // https://www.swtestacademy.com/intersection-convex-polygons-algorithm/ 
    //
    // "... all we need to order them to be able to draw it properly. This can be done, by calculating 
    //  the center point first and then sorting them against the arcTan values of between the center point, 
    //  corner and a horizontal line."

    let aPts2 = [];
    let mX = 0;
    let my = 0;
    for (let p of aPts) {
      mX += p.x;
      my += p.y;
      // mentre esegue la somma per il calcolo della media
      // provvede anche ad eseguire una copia dell'array di origine
      aPts2.push(new Point2D(p.x, p.y));
    }
    mX /= aPts.length;
    my /= aPts.length;

    // ordina e ritorna l'array copiato, per non modificare quello sorgente
    return aPts2.sort((p1, p2) => {
      const at1 = Math.atan2(p1.y - my, p1.x - mX);
      const at2 = Math.atan2(p2.y - my, p2.x - mX);
      // confronto: -1: primo el < secondo, 1: primo el > secondo, 0: el uguali
      return(at1 < at2 ? -1 : (at1 > at2 ? 1 : 0));        
    });
  }, // orderPtsClockwise
  
  
} // GeoUtils.prototype

// entry point della classe statica _GeoUtils
var GeoUtils = new _GeoUtils();


////////////////////////////////////////////////////////////////////////////////////////////////////






