// const { Readable } = require('stream');

function Hasher(SEED, MOD) {
  this.SEED = SEED;
  this.MOD = MOD;
}

Hasher.prototype.hash = function(item) {
  const str = JSON.stringify(item);
  let hash = 0;

  // Horner's method
  for (let i = 0; i < str.length; i++) {
    hash = (hash * this.SEED + str.charCodeAt(i)) % this.MOD;
  }

  return hash;
};

Hasher.prototype.djb2Hash = function(item) {
  const str = JSON.stringify(item);
  let hash = 5381;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  // return hash % this.MOD;

  return (hash * this.SEED) % this.MOD;
};

function RandomSeedGenerator() {}

RandomSeedGenerator.prototype.generate = function() {
  return Math.floor(Math.random() * 1000);
};

function CounterMinSketch(epsilon, delta) {
  /*
    * @param {number} - epsilon : This parameter controls the width of the table. Specifically,
    it governs the precision of the frequency estimation.
    A smaller epsilon gives a more accurate estimation but requires more memory (larger table width)

    * @param {number} - delta : This parameter controls the depth of the table. It represents the probability of error in the estimate. 
    A smaller delta reduces the probability of overestimating the true frequency but increases the depth of the table (more hash functions are used).

    For more information, refer to this slides: https://web.stanford.edu/class/archive/cs/cs166/cs166.1206/lectures/10/Slides10.pdf
  */
  if (epsilon <= 0 || epsilon >= 1) {
    throw new Error('Epsilon must be in the range (0, 1)');
  }

  if (delta <= 0 || delta >= 1) {
    throw new Error('Delta must be in the range (0, 1)');
  }

  this.width = Math.ceil(Math.E / epsilon);
  this.depth = Math.ceil(Math.log(1 / delta));

  console.log(`Width: ${this.width}, Depth: ${this.depth}`);

  let seedGenerator = new RandomSeedGenerator();

  this.table = new Array(this.depth).fill(0).map(() => new Array(this.width).fill(0));
  this.hashers = new Array(this.depth).fill(0).map(() => new Hasher(seedGenerator.generate(), this.width));
}

CounterMinSketch.prototype.add = function(item) {
  for (let i = 0; i < this.depth; i++) {
    const hashValue = this.hashers[i].hash(item);
    this.table[i][hashValue] += 1;
  }
};

/*
  * @param {any} - item : The item whose frequency is to be estimated
  * @returns estimated frequency of the item with probability (1 - delta)
*/
CounterMinSketch.prototype.estimate = function(item) {
  let minCount = Infinity;
  for (let i = 0; i < this.depth; i++) {
    const hashValue = this.hashers[i].hash(item);
    minCount = Math.min(minCount, this.table[i][hashValue]);
  }
  return minCount;
};

CounterMinSketch.prototype.processStream = function(stream) {
  stream.forEach((item) => {
    console.log(`Adding item: ${item}`);
    this.add(item);
  });
};

// /*
//   * @param {Readable} - stream : A readable stream that emits data
//   * TODO: @returns a top K list of items with the highest frequency (Heavy Hitters)
// */
// CounterMinSketch.prototype.processStream = function(stream) {
//   stream.on('data', (chunk) => {
//     const items = chunk.toString().split('\n'); //.split(' ');
//     items.forEach((item) => {
//       if (item === '') return;
//       console.log(`Adding item: ${item}`);
//       this.add(item);
//     });
//   });

//   stream.on('end', () => {
//     console.log('Processing stream completed');
//   });
// }
