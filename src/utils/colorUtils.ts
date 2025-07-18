 
export function applyShade(rgbStr: string, shadeValue: number, isAlpha: boolean = false): string {
  // Using a simplified color manipulation - in production, use a color library like tinycolor2
  if (shadeValue >= 1) {
    shadeValue = 1;
  }
  
  // Simple RGB manipulation for now
  const hex = rgbStr.replace('#', '');
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  
  const newR = Math.floor(r * shadeValue);
  const newG = Math.floor(g * shadeValue);
  const newB = Math.floor(b * shadeValue);
  
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

export function applyTint(rgbStr: string, tintValue: number): string {
  const hex = rgbStr.replace('#', '');
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  
  const newR = Math.floor(r + (255 - r) * tintValue);
  const newG = Math.floor(g + (255 - g) * tintValue);
  const newB = Math.floor(b + (255 - b) * tintValue);
  
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}
