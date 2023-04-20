import { validateIPV4 } from "../../src/utils/validator";

const legalIPV4 = [
  "0.0.0.0",
  "114.114.114.114",
  "255.255.255.255",
  "192.168.1.1",
  "1.99.233.45",
  "113.103.51.195",
];
const illegalIPV4 = [
  "",
  "a.b.c.d",
  "a b c d",
  "0.0.0.0.",
  ".0.0.0.0",
  "0.0.0",
  "0",
  "0..0.0",
  "192.168.01.1",
  "333.22.132.5",
  "213.262.1.1",
  "192 168 1 1",
  "192.168.1111.1",
  "0.0.0.0.0",
];

describe("Validate legal IPV4", () => {
  legalIPV4.forEach((ip) => {
    test(`ip: ${ip}`, () => {
      expect(validateIPV4(ip)).toBe(true);
    });
  });
});

describe("Validate illegal IPV4", () => {
  illegalIPV4.forEach((ip) => {
    test(`ip: ${ip}`, () => {
      expect(validateIPV4(ip)).toBe(false);
    });
  });
});
