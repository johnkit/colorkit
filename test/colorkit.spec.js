import { assert, expect } from 'chai';

import { ColorMap, ColorFormat } from '../src/index.js';

const smallSeries = [
  [0.0, [0.0, 0.6, 0.55]],
  [0.2, [0.2, 0.4, 0.54]],
  [0.4, [0.4, 0.2, 0.53]],
  [0.5, [0.6, 0.2, 0.52]],
  [0.6, [0.8, 0.4, 0.51]],
  [1.0, [1.0, 0.6, 0.50]],
];
const tol = 0.000001;  // tolerance

describe('chai testbed', () => {
  it('is ready', () => {
    assert(true);
    expect(true).to.equal(true);
  });
});

describe('ColorMap', () => {
  it('should return a list of colorseries', () => {
    let seriesList = ColorMap.listColorSeries();
    expect(seriesList.length).to.be.above(0);
    expect(seriesList.indexOf('rainbow') >= 0).to.be.true;
  });

  it('should interpolate a rainbow series', () => {
    let colormap = new ColorMap();
    expect(colormap).to.exist;
    colormap.useColorSeries('rainbow');

    let doubleVal = colormap.interpolateColor(0.5, ColorFormat.DOUBLE);
    expect(doubleVal).to.have.lengthOf(3);
    //console.log(doubleVal);
    expect(doubleVal[0]).to.be.closeTo(0.500, tol);
    expect(doubleVal[1]).to.be.closeTo(1.000, tol);
    expect(doubleVal[2]).to.be.closeTo(0.707, tol);
  });

  it('should handle x values outside [0,1]', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);

    let lowVal = colormap.interpolateColor(-0.1, ColorFormat.DOUBLE);
    expect(lowVal[0]).to.be.closeTo(0.0, tol);
    expect(lowVal[1]).to.be.closeTo(0.6, tol);
    expect(lowVal[2]).to.be.closeTo(0.55, 0.0001);

    let hiVal = colormap.interpolateColor(1.1, ColorFormat.DOUBLE);
    expect(hiVal[0]).to.be.closeTo(1.0, tol);
    expect(hiVal[1]).to.be.closeTo(0.6, tol);
    expect(hiVal[2]).to.be.closeTo(0.5, tol);
  });

  it('should handle exact values', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);

    let val = colormap.interpolateColor(0.5, ColorFormat.DOUBLE);
    expect(val[0]).to.be.closeTo(0.6, tol);
    expect(val[1]).to.be.closeTo(0.2, tol);
    expect(val[2]).to.be.closeTo(0.52, tol);
  });

  it('should interpolate values', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);

    let lowVal = colormap.interpolateColor(0.3, ColorFormat.DOUBLE);
    expect(lowVal[0]).to.be.closeTo(0.3, tol);
    expect(lowVal[1]).to.be.closeTo(0.3, tol);
    expect(lowVal[2]).to.be.closeTo(0.535, tol);

    let hiVal = colormap.interpolateColor(0.9, ColorFormat.DOUBLE);
    expect(hiVal[0]).to.be.closeTo(0.95, tol);
    expect(hiVal[1]).to.be.closeTo(0.55, tol);
    expect(hiVal[2]).to.be.closeTo(0.5025, tol);
  });

  it('should produce RGB output', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);

    let rgbVal = colormap.interpolateColor(0.3, ColorFormat.RGB);
    //console.log(rgbVal);
    expect(rgbVal).to.have.lengthOf(3);
    expect(rgbVal[0]).to.be.closeTo(77, 1);
    expect(rgbVal[1]).to.be.closeTo(77, 1);
    expect(rgbVal[2]).to.be.closeTo(136, 1);
  });

  it('should produce hex output', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);

    let hexVal = colormap.interpolateColor(0.549, ColorFormat.HEX);
    // Should produce just under [0.7, 0.3, 0.515]
    //console.log(hexVal);
    expect(hexVal).to.be.equal('#b24c83');
  });

  it('should work with ranges not scaled [0-1]', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);
    colormap.setInputRange([-40.0, 160.0]);

    // Scales to 0.1
    let lowVal = colormap.interpolateColor(-20.0, ColorFormat.DOUBLE);
    expect(lowVal[0]).to.be.closeTo(0.1, tol);
    expect(lowVal[1]).to.be.closeTo(0.5, tol);
    expect(lowVal[2]).to.be.closeTo(0.545, tol);

    // Scales to 0.7
    let hiVal = colormap.interpolateColor(100.0, ColorFormat.DOUBLE);
    expect(hiVal[0]).to.be.closeTo(0.85, tol);
    expect(hiVal[1]).to.be.closeTo(0.45, tol);
    expect(hiVal[2]).to.be.closeTo(0.5075, tol);
  });

});
