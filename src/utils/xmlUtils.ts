export function getTextByPathList(node: any, path: string[]): any {
  if (!Array.isArray(path)) {
    throw new Error("Error of path type! path is not array.");
  }

  if (node === undefined) {
    return undefined;
  }

  let current = node;
  for (let i = 0; i < path.length; i++) {
    current = current[path[i]];
    if (current === undefined) {
      return undefined;
    }
  }

  return current;
}

export function getTextByPathStr(node: any, pathStr: string): any {
  return getTextByPathList(node, pathStr.trim().split(/\s+/));
}

export function setTextByPathList(node: any, path: string[], value: any): void {
  if (!Array.isArray(path)) {
    throw new Error("Error of path type! path is not array.");
  }

  if (node === undefined) {
    return;
  }

  const setNestedProperty = (obj: any, parts: string[], val: any) => {
    let current = obj;
    const length = parts.length;
    for (let i = 0; i < length; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        if (i === length - 1) {
          current[part] = val;
        } else {
          current[part] = {};
        }
      }
      current = current[part];
    }
    return current;
  };

  setNestedProperty(node, path, value);
}

export function eachElement(node: any, doFunction: (element: any, index: number) => string): string {
  if (node === undefined) {
    return "";
  }
  
  let result = "";
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      result += doFunction(node[i], i);
    }
  } else {
    result += doFunction(node, 0);
  }
  return result;
}