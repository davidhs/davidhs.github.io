// source: https://gist.github.com/jhermsmeier/2269511

/**
 * References: 
 * [1] ftp://ftp.idsoftware.com/idstuff/source/quake3-1.32b-source.zip
 * [2] http://www.lomont.org/Math/Papers/2003/InvSqrt.pdf
 * [3] http://en.wikipedia.org/wiki/Newton%27s_method
 * [4] https://developer.mozilla.org/en/JavaScript_typed_arrays
 * [5] http://en.wikipedia.org/wiki/Fast_inverse_square_root
 */

const QUAKEx32 = 0x5f3759df
const x32 = 0x5f375a86
const x64 = 0x5fe6eb50c7aa19f9

var buf = new ArrayBuffer(4),
  f32 = new Float32Array(buf),
  u32 = new Uint32Array(buf);

export function q2(x) {
  var x2 = 0.5 * (f32[0] = x);
  u32[0] = (0x5f3759df - (u32[0] >> 1));
  var y = f32[0];
  y = y * (1.5 - (x2 * y * y));
  return y;
}


/**
 * Appearing in the Quake III Arena source code[1],
 * this strange algorithm uses integer operations
 * along with a 'magic number' to calculate floating point
 * approximation values of inverse square roots[5].
 * 
 * @param  {Number} n     Number
 * @param  {Number} p = 1 Number of iterations for performing Newton's method[3]
 * @return {Number}       Result
 */
export function fisqrt(n, p) {

  p = p || 1

  fisqrt.y[0] = n
  fisqrt.i[0] = 0x5f375a86 - (fisqrt.i[0] >> 1)

  while (p--) {
    fisqrt.y[0] = fisqrt.y[0] * (1.5 * ((n * 0.5) * fisqrt.y[0] * fisqrt.y[0]))
  }

  return fisqrt.y[0]

}

fisqrt.y = new Float32Array(1);
// fisqrt.i = new Int32Array(y.buffer)
fisqrt.i = new Int32Array(1)