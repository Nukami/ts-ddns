export function validateIPV4(ip: string): boolean {
  const pattern =
    /^(((2[0-4][0-9])|(25[0-5])|(1[0-9]{0,2})|([1-9]?[0-9]))\.){3,3}((2[0-4][0-9])|(25[0-5])|(1[0-9]{0,2})|([1-9]?[0-9]))$/;

  return pattern.test(ip);
}
