import { assert, expect } from 'chai';

import { ColorMap, ColorFormat } from '../src/index.js';

const smallSeries = [
  [0.0, [0.0, 0.6, 0.55]],
  [0.2, [0.2, 0.4, 0.54]],
  [0.4, [0.4, 0.2, 0.53]],
  [0.6, [0.6, 0.2, 0.52]],
  [0.8, [0.8, 0.4, 0.51]],
  [1.0, [1.0, 0.6, 0.50]],
];

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
    expect(doubleVal[0]).to.be.closeTo(0.500, 0.001);
    expect(doubleVal[1]).to.be.closeTo(1.000, 0.001);
    expect(doubleVal[2]).to.be.closeTo(0.707, 0.001);
  });

  it('should interpolate a small series', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);

    let lowVal = colormap.interpolateColor(-0.1, ColorFormat.DOUBLE);
    expect(lowVal[0]).to.be.closeTo(0.00, 0.001);
    expect(lowVal[1]).to.be.closeTo(0.60, 0.001);
    expect(lowVal[2]).to.be.closeTo(0.55, 0.001);

    let midVal = colormap.interpolateColor(0.5, ColorFormat.DOUBLE);
    expect(midVal[0]).to.be.closeTo(0.5, 0.001);
    expect(midVal[1]).to.be.closeTo(0.2, 0.001);
    expect(midVal[2]).to.be.closeTo(0.525, 0.001);

    let hiVal = colormap.interpolateColor(1.1, ColorFormat.DOUBLE);
    expect(hiVal[0]).to.be.closeTo(1.0, 0.001);
    expect(hiVal[1]).to.be.closeTo(0.6, 0.001);
    expect(hiVal[2]).to.be.closeTo(0.5, 0.001);
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

    let hexVal = colormap.interpolateColor(0.6, ColorFormat.HEX);
    //console.log(hexVal);
    expect(hexVal).to.be.equal('#993385');
  });

  it('should work with ranges outside [0-1]', () => {
    let colormap = new ColorMap();
    colormap.inputColorSeries(smallSeries);
    colormap.setInputRange([-40.0, 160.0]);

    let lowVal = colormap.interpolateColor(-20.0, ColorFormat.DOUBLE);
    expect(lowVal[0]).to.be.closeTo(0.1, 0.001);
    expect(lowVal[1]).to.be.closeTo(0.5, 0.001);
    expect(lowVal[2]).to.be.closeTo(0.545, 0.001);

    let hiVal = colormap.interpolateColor(100.0, ColorFormat.DOUBLE);
    expect(hiVal[0]).to.be.closeTo(0.7, 0.001);
    expect(hiVal[1]).to.be.closeTo(0.3, 0.001);
    expect(hiVal[2]).to.be.closeTo(0.515, 0.001);
  });

});
