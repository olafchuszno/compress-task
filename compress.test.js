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

    expect(result).toBe('2-10/2,13,14');
  });

  it('should compress reversed interval values', () => {
    const compress = require('./compress.js').compress;

    const result = compress([10, 8, 6, 4, 2, 13, 14]);

    expect(result).toBe('10-2/2,13,14');
  });

  it('should compress the string with multiple different sequences', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 4, 6, 9, 8, 7, 6, 5, 4, 3, 10, 7, 4, 1]);

    expect(result).toBe('1*2,2-6/2,9-3,10-1/3');
  });

  // CodeWars tests
  it("should compress 2 identical numbers", function () {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 4, 6, 9, 8, 7, 6, 5, 4, 3, 10, 7, 4, 1]);

    expect(compress([1, 2, 2, 3])).toBe('1,2*2,3');
  });

  it("should compress 3 consecutive numbers, ascending", function () {
    
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 4, 6, 9, 8, 7, 6, 5, 4, 3, 10, 7, 4, 1]);

    expect(compress([1,3,4,5,7])).toBe('1,3-5,7');
  });

  it("should compress 3 consecutive numbers, descending", function () {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 4, 6, 9, 8, 7, 6, 5, 4, 3, 10, 7, 4, 1]);

    expect(compress([1,5,4,3,7])).toBe('1,5-3,7');
  });

  it("should compress 3 numbers with same interval, descending", function () {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 4, 6, 9, 8, 7, 6, 5, 4, 3, 10, 7, 4, 1]);

    expect(compress([1,10,8,6,7])).toBe('1,10-6/2,7');
  });

  it("should compress identical + consecutive + same interval", function () {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1, 2, 3, 4, 5, 7, 9, 11]);

    expect(result).toBe('1*2,2-5,7-11/2');
  });
})