// Simple color map class
// Adapted from https://github.com/timothygebhard/js-colormaps

import rainbow from './rainbow.js';

let ColorSeriesTable = {
  'rainbow': rainbow,
};

const ColorFormat = Object.freeze({
    DOUBLE: Symbol('double'),  // 3-tuple with double values 0.0-1.0
    HEX:    Symbol('hex'),     // standard hex string "#ddddd"
    RGB:    Symbol('rgb'),     // 3-tuple with unsigned values 0-255
});

class ColorMap {
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

  // Lists available colormaps
  static
  listColorSeries() {
    return Object.keys(ColorSeriesTable);
  }

  setInputRange(range) {
    this.x_range = range;
  }

  // Select color series by name
  useColorSeries(name) {
    if (!(name in ColorSeriesTable)) {
      throw Error(`Unrecognized colormap name ${name}`);
    }
    let values = ColorSeriesTable[name];
    this.inputColorSeries(values);
    console.log(`Using color series ${name}`);
  }

  // Color series defined as:
  //  * Array of [x, [r, g, b]] values
  //  * x[0] must be 0.0
  //  * x[last] must be 1.0
  //  * x values must increase monotonically from 0.0 to 1.0
  //  * rgb values must all be in range [0.0, 1.0]
  // Note: This method does NOT validate the input data
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

    // Find nearest values in the color series
    // Use linear estimate to get a starting value
    // Find first color below x
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

  enforceBounds(x) {
      if (x < 0) {
          return 0;
      } else if (x > 1){
          return 1;
      } else {
          return x;
      }
  }  // enforceBounds()

  lookupColor(i, format) {
    let doubleVal = [this.r_values[i], this.g_values[i], this.b_values[i]];
    return this.formatColor(doubleVal, format);
  }

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
