'use strict';

describe('fixture', () => {
	it('should pass', () => {
		expect(1 + 2).toEqual(3);
	});
});

describe('beforeAll', () => {
	let i = 0;

	beforeAll(() => {
		i++;
	});

	it('should be called first', () => {
		expect(i).toBe(1);
	});

	it('should be called once', () => {
		expect(i).toBe(1);
	});
});

xdescribe('the timeout', () => {
	it('should pass', done => {
		expect(1).toBe(1);
		setTimeout(done, 6000);
	});
});
