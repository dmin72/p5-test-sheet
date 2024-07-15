
//----------------------------------------------------------------------------------------------------------------------
// - Classe statica Math2 (estensione dei metodi della classe Math)
// - Classe Vector2D (definizione di un vettore bidimensionale)
//----------------------------------------------------------------------------------------------------------------------
// porting in javascript da package Actionscript 2.0: 
// com.wordpress.kahshiu.utils - autore: Kah Shiu Chong
// https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
//----------------------------------------------------------------------------------------------------------------------

/**
 * Math2 
 * -Provide additional Math functionality
 * @author shiu
 * @version 1.0	 
 * Date written:	9 August 2011
 */
class Math2 {

  /**
   * Convert given degree into radian
   * @param	deg Angle in degree
   * @return Angle in radian
   */
  //public static function radianOf (deg:Number):Number
  static radianOf( deg )
  {
    return deg / 180 * Math.PI;
  }

  /**
   * Convert given radian into degree
   * @param	rad	Angle in radian
   * @return Angle in degree
   */
  //public static function degreeOf (rad:Number):Number
  static degreeOf( rad )
  {
    return rad / Math.PI * 180;
  }

  /**
   * Perform Pyhtagoras' Theorem on lengths
   * @param	xDist
   * @param	yDist
   * @return
   */
  //public static function Pythagoras(xDist:Number, yDist:Number):Number
  static Pythagoras( xDist, yDist )
  {
    return Math.sqrt( xDist*xDist + yDist*yDist );
  }

  /**
   * Perform cosine rule to calculate the angle between b and c
   * @param	a	Side of triangle
   * @param	b	Side of triangle
   * @param	c	Side of triangle
   * @return	angle sandwiched between b and c
   */
  //public static function cosineRule(a:Number, b:Number, c:Number):Number
  static cosineRule( a, b, c )
  {
    const angle = (b * b + c * c - a * a) / (2 * b * c);
    return Math.cos(angle);
  }

  /**
   * Bound input value between range
   * @param	lowerBound Minimum value allowed
   * @param	upperBound Maximum value allowed
   * @param	input Current value to bound
   * @return A value within boundaries
   */
  //public static function implementBound(lowerBound:Number, upperBound:Number, input:Number):Number
  static implementBound( lowerBound, upperBound, input )
  {
    return Math.min( Math.max( lowerBound, input ), upperBound );
  }
  
} // class Math2



/**
 * ...
 * @author Shiu
 */
class Vector2D
{
  x = 0;
  y = 0;

  /**
   * Constructor of Vector2D
   * @param	x	horizontal length of vector
   * @param	y	vertical length of vector
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  } // constructor


  /**** Class functions ****/


  //public function get magnitude():Number {
  magnitude() {
    return Math2.Pythagoras( this.x, this.y );
  }

  //public function set magnitude(value:Number):void {
  setMagnitude( value ) {
    const curr_angle = this.angle();
    this.x = value * Math.cos(curr_angle);
    this.y = value * Math.sin(curr_angle);
    return this;
  }


  //public function get angle():Number {
  angle() {
    return Math.atan2( this.y, this.x );
  }

  //public function set angle(value:Number):void {
  setAngle( value ) {
    const current_magnitude = this.magnitude();
    this.x = current_magnitude * Math.cos(value);
    this.y = current_magnitude * Math.sin(value);
    return this;
  }


  //public function get normR():Vector2d {
  normR() {
    return new Vector2D(-1 * this.y, this.x);
  }

  //public function get normL():Vector2d {
  normL() {
    return new Vector2D(this.y, -1 * this.x);
  }


  //public function get unitVector():Vector2d {
  unitVector() {
    const current_magnitude = this.magnitude();
    if(current_magnitude !== 0)
      return new Vector2D(this.x / current_magnitude, this.y / current_magnitude);
    else
      return new Vector2D(0, 0);
  }

  // presa da P5.js
  normalize() {
    const len = this.magnitude();
    // here we multiply by the reciprocal instead of calling 'div()'
    // since div duplicates this zero check.
    //if (len !== 0) this.mult(1 / len);
    if (len !== 0) this.scale(1 / len);
    return this;    
  }

  // presa da P5.js
  set( x, y ) {
    this.x = x;
    this.y = y;
  }


  /**
   * Create a copy of current vector
   * @return Copied vector
   */
  //public function clone ():Vector2d{
  clone() {
    return new Vector2D(this.x, this.y);
  }


  /**
   * Trace current vector for debugging purposes
   * @param	type 
   * "xy"	[x, y]
   * "ma"	[magnitude, angle]
   * @return
   * an array of vector values
   */
  //public function trace(type:String):Vector.<Number> {
  trace( type ) {
    let output = null;

    if (type == "xy")		
      output = [this.x, this.y];
    else if (type == "ma")	
      output = [this.magnitude(), this.angle()];

    return output;
  }


  /**
   * Scale current vector
   * @param	factor
   * Original is 1, half is 0.5;
   */
  //public function scale (factor:Number):void{
  scale( factor ) {
    this.x *= factor;
    this.y *= factor;
    return this;
  }


  /**
   * Invert current vector
   * @param	type
      * input parameters: "x" or "y" or "xy"
      * "x"	invert x only
      * "y"	invert y only
      * "xy" invert both
   * 
   */
  //public function invert(type:String):void{
  invert( type ) {
    if (type.charAt(0) == "x") 							
      this.x *= -1;
    if (type.charAt(0) == "y" || type.charAt(1) == "y") 
      this.y *= -1;
    return this;
  }


  /**
   * Add current vector by B, self+B
   * @param	B	to minus B
   */
  //public function add(B:Vector2d):void{
  add( B ) {
    this.x += B.x;
    this.y += B.y;
    return this;
  }


  /**
   * Minus current vector by B, self-B
   * @param	B	to minus B
   */
  //public function minus(B:Vector2d):void{
  minus( B ) {
    this.x -= B.x;
    this.y -= B.y;
    return this;
  }


  /**
   * Rotate current vector by angle
   * @param	value	angle in radians
   */
  //public function rotate(value:Number):void{
  rotate( value ) {
    //this.x = this.x * Math.cos(value) - this.y * Math.sin(value);
    const x = this.x * Math.cos(value) - this.y * Math.sin(value);
    //this.y = this.x * Math.sin(value) + this.y * Math.cos(value);
    const y = this.x * Math.sin(value) + this.y * Math.cos(value);
    
    this.set(x, y);
    return this;
  }


  /**
   * Calculate the dot product between current vector and B
   * @param	B	Input vector
   * @return	dot product, a scalar value
   */
  //public function dotProduct(B:Vector2d):Number {
  dotProduct( B ) {
    return this.x * B.x + this.y * B.y;
  }


  /**
   * Calculate the perpendicular product between current vector and B
   * @param	B	Input vector
   * @return	perpendicular product, a scalar value
   */
  //public function perpProduct(B:Vector2d):Number {
  perpProduct( B ) {
    return this.y * B.x + this.x * -B.y;
  }


  /**
   * Calculate cross product of current vector and input, self x B
   * @param	B	Input vector
   * @return
   */
  //public function crossProduct(B:Vector2d):Number {
  crossProduct( B ) {
    return this.x * B.y - this.y * B.x;
  }


  /**
   * Calculate whether current vector is equivalent to input
   * @param	B
   * @return
   */
  //public function equivalent(B:Vector2d):Boolean {
  equivalent( B ) {
    const diff = Math.pow(4, -10);
    return (this.x - B.x < diff && this.y - B.y < diff)
  }


  /**** Static functions ****/


  /**
   * Performs operation A+B
   * @param	A	Vector2d to add
   * @param	B	Vector2d
   * @return	A+B
   */
  //public static function add(A:Vector2d, B:Vector2d):Vector2d {
  static add( A, B ) {
    return new Vector2D(A.x + B.x, A.x + B.y);
  }


  /**
   * Performs operation A-B
   * @param	A	Vector2d to minus
   * @param	B	Vector2d
   * @return	A-B
   */
  //public static function minus(A:Vector2d, B:Vector2d):Vector2d {
  static minus( A, B ) {
    return new Vector2D(A.x - B.x, A.y - B.y);
  }


  //public static function rotate(A:Vector2d, angle:Number):Vector2d {
  static rotate( A, angle ) {
    let B = A.clone();
    B.rotate(angle);
    return B;
  }


  /**
   * Calculate the angle to rotate from vector A to B
   * @param	A	Vector2d to start rotating
   * @param	B	Vector2d to end
   * @return	angle from A to B
   */
  //public static function angleBetween(A:Vector2d, B:Vector2d):Number {
  static angleBetween( A, B ) {
    let A_unitVector = A.unitVector();
    var B_unitVector = B.unitVector();
    return Math.acos( A.dotProduct(B) );
  }


  /**
   * Interpolate input vector to value
   * @param	A	Vector2d to interpolate
   * @param	value	interpolation value between 0 and 1
   * @return	new Vector2d interpolated
   */
  //public static function interpolate(A:Vector2d, value:Number):Vector2d {
  static interpolate( A, value ) {

    return new Vector2D(A.x * value, A.y * value);
  }


} // Vector2D
    
    
    

