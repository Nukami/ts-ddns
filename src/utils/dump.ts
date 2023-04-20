function setNode(root: any, path: (string | number)[], node: any): any {
  if (path.length === 0) return node.toString();
  const pathBuffer: (string | number)[] = Array.from(path);
  if (root === undefined) root = typeof pathBuffer[0] === "number" ? [] : {};
  let current = root;

  while (pathBuffer.length > 1) {
    const key = pathBuffer.shift();
    if (key === undefined) throw new Error("Unexpected undefined key");
    if (typeof current !== "object")
      throw new Error("A non-object node can not has any child node");

    if (!current.hasOwnProperty(key)) {
      current[key] = typeof pathBuffer[0] === "number" ? [] : {};
    }
    current = current[key];
  }
  current[pathBuffer[0]] = node.toString();
  return root;
}

function getInstanceID(
  obj: any,
  cache: { [className in string]: any[] }
): string | undefined {
  if (typeof obj !== "object") return undefined;
  if (obj === null) return undefined;
  if (Array.isArray(obj)) return undefined;
  if (obj instanceof Map) return undefined;
  if (obj instanceof Set) return undefined;
  if (obj.constructor.name === "Object") return undefined;
  const className = obj.constructor.name;
  if (!cache[className]) return undefined;
  for (let i = 0; i < cache[className].length; i++) {
    if (obj === cache[className][i]) return `${className}#${i}`;
  }
  return undefined;
}

export function dump(obj: any): { [hash in string]: any } {
  const pending: any[] = [obj];
  const cache: { [className in string]: any[] } = {};
  pending.push(obj);
  let allDumpedInstances: { [hash in string]: any } = {};

  while (pending.length > 0) {
    const buffer: Map<(string | number)[], any> = new Map();
    let dumpedInstance: any = undefined;
    const root: any = pending.shift();
    if (root === undefined) continue;
    buffer.set([], root);

    do {
      const path: string[] = buffer.keys().next().value;
      const value: any = buffer.get(path);
      buffer.delete(path);
      switch (typeof value) {
        case "object":
          if (value === null) {
            dumpedInstance = setNode(dumpedInstance, path, "null");
            break;
          } else if (Array.isArray(value)) {
            Object.getOwnPropertyNames(value).forEach((index) => {
              if (index === "length") return;
              buffer.set([...path, Number(index)], value[Number(index)]);
            });
          } else if (value instanceof Map) {
            dumpedInstance = setNode(dumpedInstance, path, "Map");
          } else if (value instanceof Set) {
            dumpedInstance = setNode(dumpedInstance, path, "Set");
          } else if (
            !value?.constructor?.name ||
            value.constructor.name === "Object" ||
            value === root
          ) {
            Object.getOwnPropertyNames(value).forEach((key) => {
              buffer.set([...path, key], value[key]);
            });
          } else {
            const className = value.constructor.name;
            const instanceId = getInstanceID(value, cache);
            if (instanceId) {
              dumpedInstance = setNode(dumpedInstance, path, `@${instanceId}`);
              break;
            }
            if (!cache[className]) cache[className] = [];
            cache[className].push(value);
            pending.push(value);
            dumpedInstance = setNode(
              dumpedInstance,
              path,
              `@${className}#${cache[className].length - 1}`
            );
          }
          break;
        case "undefined":
          dumpedInstance = setNode(dumpedInstance, path, "undefined");
          break;
        case "function":
        case "number":
        case "bigint":
        case "boolean":
        case "string":
        case "symbol":
        default:
          dumpedInstance = setNode(dumpedInstance, path, value.toString());
          break;
      }
    } while (buffer.size > 0);

    const rootHash = getInstanceID(root, cache) ?? "root";
    allDumpedInstances[rootHash] = dumpedInstance;
  }
  return allDumpedInstances;
}
