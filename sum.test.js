import { sum } from "./sum";

test("add two numbers correctly", () => expect(sum(2, 3)).toBe(5));

// test is a function provided for jest