/**
 * A simple color mapping module
 * Adapted from https://github.com/timothygebhard/js-colormaps
 * @module colorkit
 */

import rainbow from './rainbow.js';

let ColorSeriesTable = {
  'rainbow': rainbow,
};

/**
 * Enum represent the format for an RGB color
 * @readonly
 * @enum {string}
 */
const ColorFormat = Object.freeze({
    /** The value for selecting a triplet of double values between 0-1 */
    DOUBLE: Symbol('double'),  // 3-tuple with double values 0.0-1.0

    /** The value for selecting a string in hex format (e.g., #cc0033) */
    HEX:    Symbol('hex'),     // standard hex string "#ddddd"

    /** The value for selecting a triplet of int values between 0-1255 */
    RGB:    Symbol('rgb'),     // 3-tuple with unsigned values 0-255
});


/** Class representing a mapping of scalar values to colors */
class ColorMap {
  /**
   * Create a ColorMap instance
   * @constructor
   * @param {string} [colorSeriesName] - predefined color series name.
   * Currently only 'rainbow' is supported.
   */
  constructor(colorSeriesName) {
    this.x_values = null;
    this.r_values = null;
    this.g_values = null;
    this.b_values = null;
    this.x_range = [0.0, 1.0];  // default

    if (colorSeriesName) {
      this.useColorSeries(colorSeriesName);
    }
  }  // constructor

  /**
   * Returns a list available color series names
   * @static
   * @returns {string[]}
   */
  static
  listColorSeries() {
    return Object.keys(ColorSeriesTable);
  }

  /**
   * Sets the scalar range for mapping the color series.
   * The first value in the range maps to the first color in the
   * series, and the second value in the range maps to the last
   * color in the series.
   * @param {number[]} range - an array of size 2 storing
   * the min and max scalar values
   */
  setInputRange(range) {
    this.x_range = range;
  }

  /**
   * Sets the color series to use by name
   * @param {string} name - the color series name.
   * You can obtain a list of available color series names
   * by calling listColorSeries()
   */
  useColorSeries(name) {
    if (!(name in ColorSeriesTable)) {
      throw Error(`Unrecognized colormap name ${name}`);
    }
    let values = ColorSeriesTable[name];
    this.inputColorSeries(values);
    console.log(`Using color series ${name}`);
  }

  /**
   * Loads a color series
   * @param {array} values - the values making up a color series.
   * A color series is defined as an array of [x, [r, g, b]] values
   * with these requirements:
   *   x[0] must be 0.0;
   *   x[last] must be 1.0;
   *   x values must increase monotonically from 0.0 to 1.0;
   *   each component in the rgb values must be in range [0.0, 1.0].
   * Note that this method does NOT validate the input.
   */
  inputColorSeries(values) {
    // Split values into four lists
    this.x_values = [];
    this.r_values = [];
    this.g_values = [];
    this.b_values = [];
    for (let i in values) {
        this.x_values.push(values[i][0]);
        this.r_values.push(values[i][1][0]);
        this.g_values.push(values[i][1][1]);
        this.b_values.push(values[i][1][2]);
    }  // for (i)
  }  // inputColorSeries()

  /**
   * Calculates the color for an input scalar.
   * @param {number} val - the input value to color
   * @param {ColorFormat} [format=ColorFormat.RGB] - the format
   * to use for returning the color value.
   * @returns {number[]|string} - the color expressed
   * in the specified format.
   */
  interpolateColor(val, format=ColorFormat.RGB) {
    if (!this.x_values) {
      //throw Error('color map not initialized');
      // Use rainbow as default color series
      this.inputColorSeries(rainbow);
    }

    // Scale input value
    const x = (val - this.x_range[0]) / (this.x_range[1] - this.x_range[0]);
    //console.debug(`x: ${x}`);

    // Check min/max edge cases
    if (x <= 0.0) {
      return this.lookupColor(0, format);
    }

    const iMax = this.x_values.length - 1;
    if (x >= 1.0) {
      return this.lookupColor(iMax, format);
    }

    // Find nearest values in the color series.
    // Use linear estimate to get a starting value.
    // Could use binary search instead.
    // Find first color below x.
    let iLo = Math.ceil(x * iMax);
    //console.log(`Starting x ${x}, length ${this.x_values.length}, iLo ${iLo}`);
    while ((this.x_values[iLo]) > x && (iLo > 0)) {
        iLo--;
    }
    //console.debug(`iLo: ${iLo}`);

    // Find first color above x
    let iHi = iLo;
    while ((this.x_values[iHi] < x) && (iHi < iMax)) {
        iHi++;
    }
    //console.debug(`iHi: ${iHi}`);

    // If match is dead nuts...
    if (iLo === iHi) {
      return this.lookupColor(iLo, format);
    }

    // Check that iHi = iLo + 1
    console.assert(iHi = iLo + 1);

    // Get the new color values though interpolation
    let colorLo = this.lookupColor(iLo, ColorFormat.DOUBLE);
    let colorHi = this.lookupColor(iHi, ColorFormat.DOUBLE);

    let width = Math.abs(this.x_values[iHi] - this.x_values[iLo]);
    let scaling_factor = (x - this.x_values[iLo]) / width;

    const r = this.r_values[iLo] + scaling_factor * (this.r_values[iHi] - this.r_values[iLo]);
    const g = this.g_values[iLo] + scaling_factor * (this.g_values[iHi] - this.g_values[iLo]);
    const b = this.b_values[iLo] + scaling_factor * (this.b_values[iHi] - this.b_values[iLo]);

    const doubleResult = [this.enforceBounds(r), this.enforceBounds(g), this.enforceBounds(b)];
    //console.log(`doubleResult ${doubleResult}`);
    return this.formatColor(doubleResult, format);
  }  // interpolateColor()

  /**
   * Constrains input to the range [0-1]
   * @private
   * @param {number} x - the input value.
   * @returns {number} - the bounded value.
   */
  enforceBounds(x) {
      if (x < 0) {
          return 0;
      } else if (x > 1){
          return 1;
      } else {
          return x;
      }
  }  // enforceBounds()

  /**
   * Returns one element (color) from the color series
   * @private
   * @param {number} i - the index into the color series
   * @param {ColorFormat} [format=ColorFormat.RGB] - the format
   * to use for returning the color value.
   * @returns {number[]|string} - the color expressed
   * in the specified format.
   */
  lookupColor(i, format) {
    let doubleVal = [this.r_values[i], this.g_values[i], this.b_values[i]];
    return this.formatColor(doubleVal, format);
  }

  /**
   * Converts a color to a specified format
   * @private
   * @param {number[]} - the color as a triplet of doubles
   * @param {ColorFormat} [format=ColorFormat.RGB] - the format
   * to use for returning the color value.
   * @returns {number[]|string} - the color expressed
   * in the specified format.
   */
  formatColor(doubleVal, format) {
    if (format == ColorFormat.DOUBLE) {
      return doubleVal;
    }

    // Convert to rgb (0-255)
    let rgbVal = doubleVal.map(val => Math.round(255.0 * val));
    //console.log(`rgbResult ${rgbResult}`);
    if (format == ColorFormat.RGB) {
      return rgbVal;
    }

    if (format == ColorFormat.HEX) {
      // Convert to hex string array
      let hexVal = rgbVal.map(val => ('0' + val.toString(16)).slice(-2));
      //console.log(`hexResult ${hexResult}`);
      return '#' + hexVal.join('');
    }

    // (else) Some format we missed
    throw Error(`Unrecognized ColorFormat ${format}`);
  }

}  // Colormap

export { ColorFormat, ColorMap };
