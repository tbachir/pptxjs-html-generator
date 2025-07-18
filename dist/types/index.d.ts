export interface SlideData {
    slideNumber: number;
    content: string;
    width: number;
    height: number;
}
export interface VideoAsset {
    id: string;
    data: ArrayBuffer;
    mimeType: string;
    fileName: string;
}
export interface ImageAsset {
    id: string;
    data: ArrayBuffer;
    mimeType: string;
    fileName: string;
}
export interface PptxData {
    slides: any[];
    slideLayouts: any[];
    slideMasters: any[];
    theme: any;
    media: Map<string, VideoAsset | ImageAsset>;
}
export interface RenderOptions {
    includeCSS?: boolean;
    extractMedia?: boolean;
    slideWidth?: number;
    slideHeight?: number;
}
//# sourceMappingURL=index.d.ts.map