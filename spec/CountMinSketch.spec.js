describe("Hasher", () => {
    let hasher;
    beforeEach(() => {
        hasher = new Hasher(31, 100);
    });

    it("should compute a hash within the range of 0 and MOD", () => {
        const item = "test";
        const hashValue = hasher.hash(item);
        expect(hashValue).toBeGreaterThanOrEqual(0);
        expect(hashValue).toBeLessThan(100);
    });

    it("should compute a consistent hash for the same input", () => {
        const item = "consistent";
        const hash1 = hasher.hash(item);
        const hash2 = hasher.hash(item);
        expect(hash1).toBe(hash2);
    });

    it("should compute a different hash with a different seed", () => {
        const hasher1 = new Hasher(31, 100);
        const hasher2 = new Hasher(53, 100);
        const item = "differentSeed";
        expect(hasher1.hash(item)).not.toBe(hasher2.hash(item));
    });

    it("should compute a consistent djb2Hash for the same input", () => {
        const item = "djb2hashTest";
        const hash1 = hasher.djb2Hash(item);
        const hash2 = hasher.djb2Hash(item);
        expect(hash1).toBe(hash2);
    });
});

describe("CounterMinSketch", () => {
    let sketch;
    beforeEach(() => {
        sketch = new CounterMinSketch(0.01, 0.001);
    });

    it("should initialize with correct width and depth", () => {
        expect(sketch.width).toBe(Math.ceil(Math.E / 0.01));
        expect(sketch.depth).toBe(Math.ceil(Math.log(1 / 0.001)));
    });

    it("should add an item and increase the frequency count", () => {
        const item = "foo";
        const initialEstimate = sketch.estimate(item);
        sketch.add(item);
        const newEstimate = sketch.estimate(item);
        expect(newEstimate).toBeGreaterThan(initialEstimate);
    });

    it("should estimate a higher frequency for an item added multiple times", () => {
        const item = "bar";
        sketch.add(item);
        sketch.add(item);
        const estimate = sketch.estimate(item);
        expect(estimate).toBe(2);
    });

    it("should process the stream and estimate the frequencies", () => {
        const streamData = ['baz', 'qux', 'baz'];
        sketch.processStream(streamData);


        expect(sketch.estimate('baz')).toBeGreaterThanOrEqual(2);
        expect(sketch.estimate('qux')).toBeGreaterThanOrEqual(1);
    });

    it('should correctly add items and update the table', function () {
        const item = { name: 'Alice', age: 25 };

        sketch.add(item);

        const estimatedFreq = sketch.estimate(item);
        expect(estimatedFreq).toBeGreaterThan(0);
    });

    it('should correctly estimate the frequency of an item added multiple times', function () {
        const item = { name: 'Bob', age: 30 };

        sketch.add(item);
        sketch.add(item);  
        sketch.add(item);
        sketch.add(item);
        sketch.add(item);
        sketch.add(item);

        const estimatedFreq = sketch.estimate(item);
        expect(estimatedFreq).toBeGreaterThanOrEqual(6);
    });

    it('should process a stream of items and add them to the table', function () {
        const stream = ['item1', 'item2', 'item3'];

        spyOn(sketch, 'add');

        sketch.processStream(stream);

        expect(sketch.add).toHaveBeenCalledWith('item1');
        expect(sketch.add).toHaveBeenCalledWith('item2');
        expect(sketch.add).toHaveBeenCalledWith('item3');
    });

    it('should correctly handle edge cases when estimating frequency of unadded items', function () {
        const item = { name: 'Unadded Item' };

        const estimatedFreq = sketch.estimate(item);

        expect(estimatedFreq).toBe(0);
    });

    it('should process a stream of items in order', function () {
        const stream = ['item1', 'item2', 'item3'];

        spyOn(sketch, 'add');

        sketch.processStream(stream);

        expect(sketch.add.calls.allArgs()).toEqual([['item1'], ['item2'], ['item3']]);
    });

    it('should process a very large stream of items', function () {
        const stream = Array.from({ length: 10000 }, (_, i) => `item${i}`);

        sketch.processStream(stream);

        for (let i = 0; i < 10000; i++) {
            expect(sketch.estimate(`item${i}`)).toBeGreaterThanOrEqual(1);
        }
    });
});
