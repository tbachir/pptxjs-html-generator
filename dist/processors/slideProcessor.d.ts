export interface WarpObj {
    slideLayoutTables: any;
    slideMasterTables: any;
    theme: any;
    media: Map<string, any>;
}
export declare function processNodesInSlide(nodeKey: string, nodeValue: any, nodes: any, warpObj: WarpObj, source: string, sType: string): string;
export declare function processSpNode(node: any, pNode: any, warpObj: WarpObj, source: string, sType: string): string;
export declare function processCxnSpNode(node: any, pNode: any, warpObj: WarpObj, source: string, sType: string): string;
export declare function processPicNode(node: any, warpObj: WarpObj, source: string, sType: string): string;
export declare function processGraphicFrameNode(node: any, warpObj: WarpObj, source: string, sType: string): string;
export declare function processGroupSpNode(node: any, warpObj: WarpObj, source: string): string;
export declare function genShape(node: any, pNode: any, slideLayoutSpNode: any, slideMasterSpNode: any, id: string, name: string, idx: string, type: string, order: number, warpObj: WarpObj, isUserDrawnBg?: boolean, sType?: string, source?: string): string;
export declare function genTextBody(txBodyNode: any, spNode: any, slideLayoutSpNode: any, slideMasterSpNode: any, type: string, idx: string, warpObj: WarpObj): string;
export declare function genParagraph(pNode: any, spNode: any, slideLayoutSpNode: any, slideMasterSpNode: any, type: string, idx: string, warpObj: WarpObj): string;
export declare function genTextRun(rNode: any, pNode: any, spNode: any, slideLayoutSpNode: any, slideMasterSpNode: any, type: string, idx: string, warpObj: WarpObj): string;
export declare function genTable(tableNode: any, graphicFrameNode: any, warpObj: WarpObj): string;
export declare function genChart(chartNode: any, graphicFrameNode: any, warpObj: WarpObj): string;
export declare function genDiagram(diagramNode: any, warpObj: WarpObj, source: string, sType: string): string;
export declare function genCustomShape(node: any, pNode: any, slideLayoutSpNode: any, slideMasterSpNode: any, id: string, name: string, idx: string, type: string, order: number, warpObj: WarpObj, source?: string): string;
//# sourceMappingURL=slideProcessor.d.ts.map