export function createVideoElement(videoAsset, style) {
    const videoData = btoa(String.fromCharCode(...new Uint8Array(videoAsset.data)));
    return `<video 
    controls 
    style="${style}"
    src="data:${videoAsset.mimeType};base64,${videoData}"
  >
    Votre navigateur ne supporte pas la lecture de vidéos.
  </video>`;
}
export function createImageElement(imageAsset, style) {
    const imageData = btoa(String.fromCharCode(...new Uint8Array(imageAsset.data)));
    return `<img 
    style="${style}"
    src="data:${imageAsset.mimeType};base64,${imageData}"
    alt="Slide image"
  />`;
}
//# sourceMappingURL=mediaUtils.js.map