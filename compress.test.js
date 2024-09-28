describe('compress function', () => {
  it('should compress an empty string', () => {
    const compress = require('./compress.js').compress;

    const result = compress([]);

    expect(result).toBe('');
  });

  it('should compress a single number', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1]);

    expect(result).toBe('1');
  });

  it('should compress two numbers', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 2]);

    expect(result).toBe('1,2');
  });

  it('should compress two numbers that are duplicates', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 1]);

    expect(result).toBe('1*2');
  });
  
  it('should compress three numbers', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 2, 10]);

    expect(result).toBe('1,2,10');
  });

  it('should compress a sequence od three numbers', () => {
    const compress = require('./compress.js').compress;

    const result = compress([1, 2, 3]);

    expect(result).toBe('1-3');
  });

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

  it("should compress strings with couple ending at index -3 (from end)", function () {
    const compress = require('./compress.js').compress;

    const result = compress([
      93,  92,  91, 180, 108, 105, 102, 122, 130, 177,
      23, 140, 143, 146, 149,  31,  29,  27,  25,  57,
     154,  20,  20,  20,  20,  20,  23,  14,  11,   8,
       5,   2, 195, 143, 140, 137,  94, 168,  55,  53,
      51,  49, 137,  72, 153,  94, 128,  96,  96,  73,
       0
    ]);

    expect(result)
      .toBe('93-91,180,108-102/3,122,130,177,23,140-149/3,31-25/2,57,154,20*5,23,14-2/3,195,143-137/3,94,168,55-49/2,137,72,153,94,128,96*2,73,0');
  });

  it("should compress string with the last two elements as a couple", function () {
    const compress = require('./compress.js').compress;

    const result = compress([
      196, 105, 107, 109, 197,  4,  53,  61,
      173,   3,   1,  -1,  -3, -5, 131, 108,
       76,  79, 110, 104, 105, 82,  82,  92,
       89,  57,  57
    ]);

    expect(result)
      .toBe('196,105-109/2,197,4,53,61,173,3--5/2,131,108,76,79,110,104,105,82*2,92,89,57*2');
  });

  it("should compress string with last number not in sequence after a long sequence", function () {
    const compress = require('./compress.js').compress;

    const result = compress([
      20,  19, 10, 31, 138, 164,
     193, 161, 32, 79, 76, 73,
      70,  67, 23
   ]);

    expect(result).toBe('20,19,10,31,138,164,193,161,32,79-67/3,23');
  });

  it("should compress string with last two numbers not in sequence after a long sequence", function () {
    const compress = require('./compress.js').compress;

    const result = compress([
      98, 181, 181, 181,  36, 131, 129, 127, 105, 108,
      22,  19,  71, 163, 161, 159, 157, 197,  61,  60,
      41,  68,  65,  62,  59,  56,  37, 179, 119, 116,
     113, 110,  91,  90,  89,  88,  45, 123, 124,  51,
      50,  50,  50,  50, 139, 137, 135, 133, 122, 122,
     122, 131, 132, 133, 184, 197
   ]);

    expect(result).toBe('98,181*3,36,131-127/2,105,108,22,19,71,163-157/2,197,61,60,41,68-56/3,37,179,119-110/3,91-88,45,123,124,51,50*4,139-133/2,122*3,131-133,184,197');
  });

  it("should compress long strings", function () {
    const compress = require('./compress.js').compress;

    const result = compress([
      58,  58,  62,  63,  64,  65,  66,  58,
     148, 148, 170, 169, 168, 167,   8,   5,
       2, 104, 102, 100, 129, 126, 123, 120,
     117,  13, 121,  10,   8,   6
   ]);

    expect(result).toBe('58*2,62-66,58,148*2,170-167,8-2/3,104-100/2,129-117/3,13,121,10-6/2');
  });



})