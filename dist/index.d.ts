interface SlideData {
    slideNumber: number;
    content: string;
    width: number;
    height: number;
}
interface VideoAsset {
    id: string;
    data: ArrayBuffer;
    mimeType: string;
    fileName: string;
}
interface ImageAsset {
    id: string;
    data: ArrayBuffer;
    mimeType: string;
    fileName: string;
}
interface PptxData {
    slides: any[];
    slideLayouts: any[];
    slideMasters: any[];
    theme: any;
    media: Map<string, VideoAsset | ImageAsset>;
}
interface RenderOptions {
    includeCSS?: boolean;
    extractMedia?: boolean;
    slideWidth?: number;
    slideHeight?: number;
}

declare class PptxProcessor {
    private pptxData;
    private zip;
    private slideCSS;
    constructor();
    loadFile(file: File | ArrayBuffer): Promise<void>;
    getSlideCount(): number;
    getSlideHTML(slideIndex: number, options?: RenderOptions): string;
    getAllSlidesHTML(options?: RenderOptions): string[];
    getSlideCSS(): string;
    getMediaAssets(): Map<string, VideoAsset | ImageAsset>;
    private parsePptxData;
    private extractMedia;
    private getMimeType;
    private parseXML;
    private domToObject;
    private renderSlideToHTML;
    private createTables;
    private processNodesInSlide;
    private processSpNode;
    private processCxnSpNode;
    private processPicNode;
    private processGraphicFrameNode;
    private processGroupSpNode;
    private genShape;
    private genTextBody;
    private genParagraph;
    private genTextRun;
    private genTable;
    private genChart;
    private getTextByPathList;
    private getPosition;
    private getSize;
    private createVideoElement;
    private createImageElement;
    private parseColor;
    private escapeHtml;
}

export { type ImageAsset, type PptxData, PptxProcessor, type RenderOptions, type SlideData, type VideoAsset };
