const CVS_WIDTH = 800;
const CVS_HEIGHT = 370;
//
let VIEW_WIDTH = 280;
let VIEW_HEIGHT = 280;
const WT_CORNICE = 7;

let VIEW_WIDTH2 = VIEW_WIDTH * 1.3;
let VIEW_CTRL_X = VIEW_WIDTH2 + 25;
const VIEW_CTRL_Y = 35;


let _cnv = null;

let _perlinX = 0;



function setup() {
  
  _cnv = createCanvas(CVS_WIDTH, CVS_HEIGHT);
  
}



function draw() {
  
  background("powderblue");

  VIEW_WIDTH2 = VIEW_WIDTH * 2.3;  
  VIEW_HEIGHT = min(height, windowHeight) - WT_CORNICE;
  
  strokeWeight(1);
  stroke("royalblue");

  //
  // aggiorna il playground, se attivo
  let xoff = 0;
  //if( bPlayG ) {
    
    xoff = _perlinX;          

    push();
    beginShape();
    for(let i = 10; i <= VIEW_WIDTH2; i++) {
      //console.log(xoff);
      const n = noise(xoff);
      const ny = map(n, 0.0, 1.0, 10 + (VIEW_HEIGHT / 3), 10 + (VIEW_HEIGHT * 0.667));
      const ny2 = map(n, 0.0, 1.0, VIEW_HEIGHT - 33, VIEW_HEIGHT - 39);


      // vertici del rilievo montuoso
      vertex(i, ny);
      // colorazione monte
      stroke(245, 245, 220, 155);
      strokeWeight(1);
      noFill();
      //stroke("beige")
      line(i, VIEW_HEIGHT, i, ny);

      // nuvole
      if(round(xoff, 2) == 4.22) {
        disegnaNuvola(i, 50);
      }          
      if(round(xoff, 2) == 8.46) {
        disegnaNuvola(i, 50);
      }

      // manto erboso
      stroke(0, 238, 0, 100 + (155 * n));
      line(i, VIEW_HEIGHT, i, ny2);

      // ridisegna cornice per nascondere il passaggio delle nuvole
      strokeWeight(WT_CORNICE);
      stroke("steelblue");
      rect(5, 5, VIEW_WIDTH2, VIEW_HEIGHT);

      
      xoff += 0.02;
    } // for(let i = 10; i <= VIEW_WIDTH2; i += 5)

    // colore contorno montagne
    stroke(205, 205, 76);
    strokeWeight(1);
    endShape();
    pop();
  
  
    _perlinX += 0.01;


  
  //} // if( bPlayG )    

  //
  // visualizza il frame corrente dello sprite    
  //_sprite.display();

    
  
}

function disegnaNuvola( x, y ) {  
  stroke(200);
  fill(255);
  
  //rect(x, y, 100, 50);
  
  arc(x, y, 50, 50, PI, 0, PIE);
  arc(x - 35, y, 50, 30, PI, 0, PIE);
  arc(x + 45, y, 70, 30, PI, 0, PIE);
  arc(x + 10, y - 1, 140, 35, 0, PI, OPEN);
  
  noFill();  
} // disegnaNuvola






