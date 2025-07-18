 
export function getPosition(slideXfrmNode: any, pNode: any, slideLayoutXfrmNode?: any, slideMasterXfrmNode?: any, sType?: string): string {
  let x = 0, y = 0;
  
  if (slideXfrmNode?.["a:off"]) {
    x = parseInt(slideXfrmNode["a:off"]["attrs"]?.["x"] || "0");
    y = parseInt(slideXfrmNode["a:off"]["attrs"]?.["y"] || "0");
  }
  
  // Convert EMU to pixels (1 EMU = 1/914400 inch, 1 inch = 96 pixels)
  const pixelX = Math.round(x / 914400 * 96);
  const pixelY = Math.round(y / 914400 * 96);
  
  return `left: ${pixelX}px; top: ${pixelY}px;`;
}

export function getSize(slideXfrmNode: any, slideLayoutXfrmNode?: any, slideMasterXfrmNode?: any): string {
  let width = 0, height = 0;
  
  if (slideXfrmNode?.["a:ext"]) {
    width = parseInt(slideXfrmNode["a:ext"]["attrs"]?.["cx"] || "0");
    height = parseInt(slideXfrmNode["a:ext"]["attrs"]?.["cy"] || "0");
  }
  
  // Convert EMU to pixels
  const pixelWidth = Math.round(width / 914400 * 96);
  const pixelHeight = Math.round(height / 914400 * 96);
  
  return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
}