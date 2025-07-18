// processors/slideProcessor.ts
import { getTextByPathList, eachElement } from '../utils/xmlUtils';
import { getPosition, getSize } from '../utils/geometryUtils';
import { getShapeFill } from '../utils/fillUtils';
import { getVerticalAlign, getContentDir } from '../utils/textUtils';
import { createVideoElement, createImageElement } from '../utils/mediaUtils';
import { getBorder } from '../utils/borderUtils';
export function processNodesInSlide(nodeKey, nodeValue, nodes, warpObj, source, sType) {
    let result = "";
    switch (nodeKey) {
        case "p:sp": // Shape, Text
            result = processSpNode(nodeValue, nodes, warpObj, source, sType);
            break;
        case "p:cxnSp": // Shape, Text (with connection)
            result = processCxnSpNode(nodeValue, nodes, warpObj, source, sType);
            break;
        case "p:pic": // Picture
            result = processPicNode(nodeValue, warpObj, source, sType);
            break;
        case "p:graphicFrame": // Chart, Diagram, Table
            result = processGraphicFrameNode(nodeValue, warpObj, source, sType);
            break;
        case "p:grpSp":
            result = processGroupSpNode(nodeValue, warpObj, source);
            break;
        case "mc:AlternateContent": // Equations and formulas as Image
            const mcFallbackNode = getTextByPathList(nodeValue, ["mc:Fallback", "p:sp"]);
            if (mcFallbackNode !== undefined) {
                result = processSpNode(mcFallbackNode, nodes, warpObj, source, sType);
            }
            break;
        default:
            break;
    }
    return result;
}
export function processSpNode(node, pNode, warpObj, source, sType) {
    const id = getTextByPathList(node, ["p:nvSpPr", "p:cNvPr", "attrs", "id"]);
    const name = getTextByPathList(node, ["p:nvSpPr", "p:cNvPr", "attrs", "name"]);
    const idx = getTextByPathList(node, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "idx"]);
    let type = getTextByPathList(node, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]);
    const order = getTextByPathList(node, ["attrs", "order"]) || 0;
    let isUserDrawnBg;
    if (source === "slideLayoutBg" || source === "slideMasterBg") {
        const userDrawn = getTextByPathList(node, ["p:nvSpPr", "p:nvPr", "attrs", "userDrawn"]);
        isUserDrawnBg = userDrawn === "1";
    }
    // Determine layout and master nodes
    let slideLayoutSpNode, slideMasterSpNode;
    if (idx !== undefined) {
        slideLayoutSpNode = warpObj.slideLayoutTables?.idxTable?.[idx];
        slideMasterSpNode = warpObj.slideMasterTables?.typeTable?.[type] ||
            warpObj.slideMasterTables?.idxTable?.[idx];
    }
    else if (type !== undefined) {
        slideLayoutSpNode = warpObj.slideLayoutTables?.typeTable?.[type];
        slideMasterSpNode = warpObj.slideMasterTables?.typeTable?.[type];
    }
    // Determine type if undefined
    if (type === undefined) {
        const txBoxVal = getTextByPathList(node, ["p:nvSpPr", "p:cNvSpPr", "attrs", "txBox"]);
        if (txBoxVal === "1") {
            type = "textBox";
        }
        else {
            type = getTextByPathList(slideLayoutSpNode, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]) || "obj";
        }
    }
    return genShape(node, pNode, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj, isUserDrawnBg, sType, source);
}
export function processCxnSpNode(node, pNode, warpObj, source, sType) {
    const id = getTextByPathList(node, ["p:nvCxnSpPr", "p:cNvPr", "attrs", "id"]);
    const name = getTextByPathList(node, ["p:nvCxnSpPr", "p:cNvPr", "attrs", "name"]);
    const idx = getTextByPathList(node, ["p:nvCxnSpPr", "p:nvPr", "p:ph", "attrs", "idx"]);
    const type = getTextByPathList(node, ["p:nvCxnSpPr", "p:nvPr", "p:ph", "attrs", "type"]) || "obj";
    const order = getTextByPathList(node, ["attrs", "order"]) || 0;
    return genShape(node, pNode, undefined, undefined, id, name, idx, type, order, warpObj, undefined, sType, source);
}
export function processPicNode(node, warpObj, source, sType) {
    const id = getTextByPathList(node, ["p:nvPicPr", "p:cNvPr", "attrs", "id"]);
    const name = getTextByPathList(node, ["p:nvPicPr", "p:cNvPr", "attrs", "name"]);
    const order = getTextByPathList(node, ["attrs", "order"]) || 0;
    // Get transform information
    const xfrmNode = getTextByPathList(node, ["p:spPr", "a:xfrm"]);
    const position = getPosition(xfrmNode, node);
    const size = getSize(xfrmNode);
    // Get image reference
    const blipNode = getTextByPathList(node, ["p:blipFill", "a:blip"]);
    const rId = getTextByPathList(blipNode, ["attrs", "r:embed"]);
    if (rId && warpObj.media) {
        // Find the media asset
        for (const [key, asset] of warpObj.media) {
            if (key.includes(rId) || asset.id === rId) {
                const style = `${position} ${size} z-index: ${order};`;
                if (asset.mimeType.startsWith('video/')) {
                    return createVideoElement(asset, style);
                }
                else {
                    return createImageElement(asset, style);
                }
            }
        }
    }
    return `<div class="block" style="${position} ${size} background: #f0f0f0; z-index: ${order};"></div>`;
}
export function processGraphicFrameNode(node, warpObj, source, sType) {
    const id = getTextByPathList(node, ["p:nvGraphicFramePr", "p:cNvPr", "attrs", "id"]);
    const name = getTextByPathList(node, ["p:nvGraphicFramePr", "p:cNvPr", "attrs", "name"]);
    const order = getTextByPathList(node, ["attrs", "order"]) || 0;
    // Get transform information
    const xfrmNode = getTextByPathList(node, ["a:graphic", "a:graphicData", "a:tbl", "a:tblPr", "a:tableStyleId"]) ||
        getTextByPathList(node, ["p:xfrm"]);
    const position = getPosition(xfrmNode, node);
    const size = getSize(xfrmNode);
    // Check if it's a table
    const tableNode = getTextByPathList(node, ["a:graphic", "a:graphicData", "a:tbl"]);
    if (tableNode) {
        return genTable(tableNode, node, warpObj);
    }
    // Check if it's a chart
    const chartNode = getTextByPathList(node, ["a:graphic", "a:graphicData", "c:chart"]);
    if (chartNode) {
        return genChart(chartNode, node, warpObj);
    }
    // Check if it's a diagram
    const diagramNode = getTextByPathList(node, ["a:graphic", "a:graphicData", "dgm:relIds"]);
    if (diagramNode) {
        return genDiagram(diagramNode, warpObj, source, sType);
    }
    return `<div class="block" style="${position} ${size} z-index: ${order};"></div>`;
}
export function processGroupSpNode(node, warpObj, source) {
    let result = "";
    const grpSpPr = getTextByPathList(node, ["p:grpSpPr"]);
    const spTree = getTextByPathList(node, ["p:spTree"]);
    if (spTree) {
        // Process each element in the group
        Object.keys(spTree).forEach(key => {
            if (key !== "attrs") {
                const nodeValue = spTree[key];
                result += processNodesInSlide(key, nodeValue, node, warpObj, source, "");
            }
        });
    }
    return result;
}
export function genShape(node, pNode, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj, isUserDrawnBg, sType, source) {
    const slideXfrmNode = getTextByPathList(node, ["p:spPr", "a:xfrm"]);
    const slideLayoutXfrmNode = getTextByPathList(slideLayoutSpNode, ["p:spPr", "a:xfrm"]);
    const slideMasterXfrmNode = getTextByPathList(slideMasterSpNode, ["p:spPr", "a:xfrm"]);
    // Get rotation
    const rot = getTextByPathList(slideXfrmNode, ["attrs", "rot"]);
    const txtRotate = rot ? parseInt(rot) / 60000 : 0;
    let result = "";
    // Check for custom shape geometry
    const custGeom = getTextByPathList(node, ["p:spPr", "a:custGeom"]);
    if (custGeom) {
        result += genCustomShape(node, pNode, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj, source);
    }
    else {
        result += `<div class='block ${getVerticalAlign(node, slideLayoutSpNode, slideMasterSpNode, type)} ${getContentDir(node, type, warpObj)}' ` +
            `_id='${id}' _idx='${idx}' _type='${type}' _name='${name}' ` +
            `style='${getPosition(slideXfrmNode, pNode, slideLayoutXfrmNode, slideMasterXfrmNode, sType)}` +
            `${getSize(slideXfrmNode, slideLayoutXfrmNode, slideMasterXfrmNode)}` +
            `${getBorder(node, pNode, false, "shape", warpObj)}` +
            `${getShapeFill(node, pNode, false, warpObj, source || "")}` +
            ` z-index: ${order};` +
            `transform: rotate(${txtRotate}deg);'>`;
        // TextBody
        if (node["p:txBody"] !== undefined && (isUserDrawnBg === undefined || isUserDrawnBg === true)) {
            if (type !== "diagram" && type !== "textBox") {
                type = "shape";
            }
            result += genTextBody(node["p:txBody"], node, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj);
        }
        result += "</div>";
    }
    return result;
}
export function genTextBody(txBodyNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj) {
    let result = "";
    const paragraphs = txBodyNode["a:p"];
    if (paragraphs) {
        result += eachElement(paragraphs, (pNode, index) => {
            return genParagraph(pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj);
        });
    }
    return result;
}
export function genParagraph(pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj) {
    let result = "";
    const pPr = pNode["a:pPr"];
    const runs = pNode["a:r"];
    // Get paragraph properties
    const algn = getTextByPathList(pPr, ["attrs", "algn"]) || "left";
    const lvl = parseInt(getTextByPathList(pPr, ["attrs", "lvl"]) || "0");
    result += `<div class="slide-prgrph pregraph-${getTextDirection(pPr)}" style="text-align: ${algn}; margin-left: ${lvl * 20}px;">`;
    if (runs) {
        result += eachElement(runs, (rNode, index) => {
            return genTextRun(rNode, pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj);
        });
    }
    result += "</div>";
    return result;
}
export function genTextRun(rNode, pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj) {
    const text = getTextByPathList(rNode, ["a:t"]) || "";
    const rPr = rNode["a:rPr"];
    if (!text)
        return "";
    let style = "";
    // Font size
    const sz = getTextByPathList(rPr, ["attrs", "sz"]);
    if (sz) {
        style += `font-size: ${parseInt(sz) / 100}pt;`;
    }
    // Font family
    const typeface = getTextByPathList(rPr, ["a:latin", "attrs", "typeface"]) ||
        getTextByPathList(rPr, ["a:ea", "attrs", "typeface"]);
    if (typeface) {
        style += `font-family: "${typeface}";`;
    }
    // Bold
    const b = getTextByPathList(rPr, ["attrs", "b"]);
    if (b === "1") {
        style += "font-weight: bold;";
    }
    // Italic
    const i = getTextByPathList(rPr, ["attrs", "i"]);
    if (i === "1") {
        style += "font-style: italic;";
    }
    // Underline
    const u = getTextByPathList(rPr, ["attrs", "u"]);
    if (u && u !== "none") {
        style += "text-decoration: underline;";
    }
    // Color
    const solidFill = getTextByPathList(rPr, ["a:solidFill"]);
    if (solidFill) {
        const color = parseColor(solidFill, warpObj);
        if (color) {
            style += `color: ${color};`;
        }
    }
    return `<span style="${style}">${escapeHtml(text)}</span>`;
}
export function genTable(tableNode, graphicFrameNode, warpObj) {
    const rows = getTextByPathList(tableNode, ["a:tr"]);
    if (!rows)
        return "";
    const xfrmNode = getTextByPathList(graphicFrameNode, ["p:xfrm"]);
    const position = getPosition(xfrmNode, graphicFrameNode);
    const size = getSize(xfrmNode);
    let result = `<table class="slide" style="${position} ${size}">`;
    result += eachElement(rows, (rowNode, rowIndex) => {
        let rowResult = "<tr>";
        const cells = getTextByPathList(rowNode, ["a:tc"]);
        if (cells) {
            rowResult += eachElement(cells, (cellNode, cellIndex) => {
                const cellText = getTextByPathList(cellNode, ["a:txBody", "a:p", "a:r", "a:t"]) || "";
                return `<td>${escapeHtml(cellText)}</td>`;
            });
        }
        rowResult += "</tr>";
        return rowResult;
    });
    result += "</table>";
    return result;
}
export function genChart(chartNode, graphicFrameNode, warpObj) {
    const xfrmNode = getTextByPathList(graphicFrameNode, ["p:xfrm"]);
    const position = getPosition(xfrmNode, graphicFrameNode);
    const size = getSize(xfrmNode);
    // For now, return a placeholder for charts
    // TODO: Implement full chart rendering with Chart.js or similar
    return `<div class="block chart-placeholder" style="${position} ${size} background: #f5f5f5; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
    <span>Graphique</span>
  </div>`;
}
export function genDiagram(diagramNode, warpObj, source, sType) {
    // TODO: Implement diagram rendering
    return `<div class="block diagram-placeholder" style="background: #f5f5f5; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
    <span>Diagramme</span>
  </div>`;
}
export function genCustomShape(node, pNode, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj, source) {
    // TODO: Implement custom shape rendering with SVG
    const slideXfrmNode = getTextByPathList(node, ["p:spPr", "a:xfrm"]);
    const position = getPosition(slideXfrmNode, pNode);
    const size = getSize(slideXfrmNode);
    return `<div class="block custom-shape" style="${position} ${size} z-index: ${order};">
    <svg class="drawing" style="width: 100%; height: 100%;">
      <!-- Custom shape SVG would go here -->
    </svg>
  </div>`;
}
// Helper functions
function getTextDirection(pPr) {
    const rtl = getTextByPathList(pPr, ["attrs", "rtl"]);
    return rtl === "1" ? "rtl" : "ltr";
}
function parseColor(solidFill, warpObj) {
    // TODO: Implement full color parsing including theme colors, RGB, etc.
    const srgbClr = getTextByPathList(solidFill, ["a:srgbClr", "attrs", "val"]);
    if (srgbClr) {
        return `#${srgbClr}`;
    }
    const schemeClr = getTextByPathList(solidFill, ["a:schemeClr", "attrs", "val"]);
    if (schemeClr) {
        // TODO: Map scheme colors to actual colors from theme
        return "#000000";
    }
    return null;
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
//# sourceMappingURL=slideProcessor.js.map