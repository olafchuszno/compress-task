describe('compress function', () => {
  it('should compress duplicates', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 1, 2, 5, 6, 9, 10]);

    expect(result).toBe('1*3,2,5,6,9,10');
  });

  it('should compress consecutive values', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 2, 3, 4, 5, 8, 20, 21, 25]);

    expect(result).toBe('1-5,8,20,21,25');
  });

  it('should compress reversed consecutive values', () => {
    const compress = require('./compress.js').compress;

    const result = compress([5, 4, 3, 2, 1, 8, 20, 21, 25]);

    expect(result).toBe('5-1,8,20,21,25');
  });

  it('should compress interval values', () => {
    const compress = require('./compress.js').compress;

    const result = compress([2, 4, 6, 8, 10, 13, 14]);

    expect(result).toBe('2-8/2,10,13,14');
  });

  it('should compress the string with multiple different sequences', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 4, 6, 9, 8, 7, 10, 7, 4, 1]);

    expect(result).toBe('1*2,2-6/2,5,6,9-7,10-1/3');
  });
})