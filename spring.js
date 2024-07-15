// Nature of Code 2011
// Daniel Shiffman
// Chapter 3: Oscillation

// Class to describe an anchor point that can connect to "Bob" objects via a spring
// Thank you: http://www.myphysicslab.com/spring2d.html

class Spring { 

  // Constructor
  // Spring(p5.Vector anchor, p5.Vector position, int restLength, float kCoeff) {
  constructor(anchor, position, restLength, kCoeff) {
    // NOTA: si presuppone che i vettori di origine e posizione siano passati per riferimento e 
    //       aggiornati nei relativi mover, in modo da consentire il calcolo della forza elastica dinamicamente
    //
    // spring origin (vector)
    this.anchor = anchor;
    // position of linked object (vector)
    this.position = position;

    // rest length
    this.restLength = restLength;    
    if(this.restLength === undefined) this.restLength = 10;
    // spring constant (elasticità)
    this.k = kCoeff;
    if(this.k === undefined) this.k = 0.2;
    
    this.maxSpeed = undefined;
  } 
  
  
  // Genera il vettore della forza elastica generata sull'oggetto e la restituisce.
  getSpringForce() {
    
    // Vector pointing from anchor to bob position
    let force = p5.Vector.sub(this.position, this.anchor);
    // What is distance
    let dist = force.mag();        
    // Stretch is difference between current distance and rest length
    let stretch = dist - this.restLength;
        
    // Calculate force according to Hooke's Law
    // F = k * stretch
    force.normalize();
    force.mult(-1 * this.k * stretch);
    //b.applyForce(force);

    // riduce la velocità del vettore se ha superato il limite
    if(!(this.maxSpeed === undefined)) {      
      force.limit(this.maxSpeed);
    } // if(!(this.maxSpeed === undefined)
    
    return force;
  } // getSpringForce
  
    
  // Disegna l'elastico
  displaySpring() {
    stroke(100);
    strokeWeight(2);
    line(this.position.x, this.position.y, this.anchor.x, this.anchor.y);    
  } // displaySpring
  
} // class Spring


