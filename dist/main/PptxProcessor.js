import JSZip from 'jszip';
export class PptxProcessor {
    constructor() {
        this.pptxData = null;
        this.zip = null;
        this.slideCSS = `
.slide {
  position: relative;
  border: 1px solid #333;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
}
.slide div.block {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  line-height: 1;
}
.slide div.content {
  display: flex;
  flex-direction: column;
}
.slide div.diagram-content{
  display: flex;
  flex-direction: column;
}
.slide div.content-rtl {
  display: flex;
  flex-direction: column;
  direction: rtl; 
}
.slide .pregraph-rtl{
  direction: rtl; 
}
.slide .pregraph-ltr{
  direction: ltr; 
}
.slide .pregraph-inherit{
  direction: inherit; 
}
.slide .slide-prgrph{
  width: 100%;
}
.slide .line-break-br::before{
  content: "\\A";
  white-space: pre;
}
.slide div.v-up {
  justify-content: flex-start;
}
.slide div.v-mid {
  justify-content: center;
}
.slide div.v-down {
  justify-content: flex-end;
}
.slide div.h-left {
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
}
.slide div.h-left-rtl {
  justify-content: flex-end;
  align-items: flex-end;
  text-align: left;
}
.slide div.h-mid {
  justify-content: center;
  align-items: center;
  text-align: center;
}
.slide div.h-right {
  justify-content: flex-end;
  align-items: flex-end;
  text-align: right;
}
.slide div.h-right-rtl {
  justify-content: flex-start;
  align-items: flex-start;
  text-align: right;
}
.slide div.h-just,
.slide div.h-dist {
  text-align: justify;
}
.slide div.up-left {
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
}
.slide div.up-center {
  justify-content: flex-start;
  align-items: center;
}
.slide div.up-right {
  justify-content: flex-start;
  align-items: flex-end;
}
.slide div.center-left {
  justify-content: center;
  align-items: flex-start;
  text-align: left;
}
.slide div.center-center {
  justify-content: center;
  align-items: center;
}
.slide div.center-right {
  justify-content: center;
  align-items: flex-end;
}
.slide div.down-left {
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
}
.slide div.down-center {
  justify-content: flex-end;
  align-items: center;
}
.slide div.down-right {
  justify-content: flex-end;
  align-items: flex-end;
}
.slide li.slide {
  margin: 10px 0px;
  font-size: 18px;
}
.slide table {
  position: absolute;
}
.slide svg.drawing {
  position: absolute;
  overflow: visible;
}
`;
    }
    async loadFile(file) {
        const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
        this.zip = await JSZip.loadAsync(arrayBuffer);
        this.pptxData = await this.parsePptxData();
    }
    getSlideCount() {
        return this.pptxData?.slides.length || 0;
    }
    getSlideHTML(slideIndex, options = {}) {
        if (!this.pptxData || slideIndex >= this.pptxData.slides.length) {
            throw new Error(`Slide ${slideIndex} not found`);
        }
        const slide = this.pptxData.slides[slideIndex];
        return this.renderSlideToHTML(slide, slideIndex, options);
    }
    getAllSlidesHTML(options = {}) {
        if (!this.pptxData) {
            throw new Error('No PPTX data loaded');
        }
        return this.pptxData.slides.map((slide, index) => this.renderSlideToHTML(slide, index, options));
    }
    getSlideCSS() {
        return this.slideCSS;
    }
    getMediaAssets() {
        return this.pptxData?.media || new Map();
    }
    async parsePptxData() {
        if (!this.zip)
            throw new Error('No ZIP data loaded');
        const slides = [];
        const slideLayouts = [];
        const slideMasters = [];
        const media = new Map();
        // Parse slides
        const slideFiles = Object.keys(this.zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
        for (const slideFile of slideFiles) {
            const slideXml = await this.zip.files[slideFile].async('text');
            const slideData = this.parseXML(slideXml);
            slides.push(slideData);
        }
        // Parse slide layouts
        const layoutFiles = Object.keys(this.zip.files).filter(name => name.startsWith('ppt/slideLayouts/') && name.endsWith('.xml'));
        for (const layoutFile of layoutFiles) {
            const layoutXml = await this.zip.files[layoutFile].async('text');
            const layoutData = this.parseXML(layoutXml);
            slideLayouts.push(layoutData);
        }
        // Parse slide masters
        const masterFiles = Object.keys(this.zip.files).filter(name => name.startsWith('ppt/slideMasters/') && name.endsWith('.xml'));
        for (const masterFile of masterFiles) {
            const masterXml = await this.zip.files[masterFile].async('text');
            const masterData = this.parseXML(masterXml);
            slideMasters.push(masterData);
        }
        // Extract media (images and videos)
        await this.extractMedia(media);
        // Parse theme
        const themeFile = Object.keys(this.zip.files).find(name => name.startsWith('ppt/theme/') && name.endsWith('.xml'));
        let theme = null;
        if (themeFile) {
            const themeXml = await this.zip.files[themeFile].async('text');
            theme = this.parseXML(themeXml);
        }
        return {
            slides,
            slideLayouts,
            slideMasters,
            theme,
            media
        };
    }
    async extractMedia(media) {
        if (!this.zip)
            return;
        const mediaFiles = Object.keys(this.zip.files).filter(name => name.startsWith('ppt/media/'));
        for (const mediaFile of mediaFiles) {
            const fileName = mediaFile.split('/').pop() || '';
            const data = await this.zip.files[mediaFile].async('arraybuffer');
            const mimeType = this.getMimeType(fileName);
            const asset = {
                id: fileName,
                data,
                mimeType,
                fileName
            };
            media.set(fileName, asset);
        }
    }
    getMimeType(fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mimeTypes = {
            mp4: 'video/mp4',
            webm: 'video/webm',
            mov: 'video/quicktime',
            avi: 'video/x-msvideo',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            svg: 'image/svg+xml'
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
    }
    parseXML(xmlString) {
        // Simplified XML parser - we'll enhance this with the original tXml logic
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        return this.domToObject(xmlDoc.documentElement);
    }
    domToObject(node) {
        const result = {};
        // Handle attributes
        if (node.attributes.length > 0) {
            result.attrs = {};
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                result.attrs[attr.name] = attr.value;
            }
        }
        // Handle children
        if (node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const childName = child.tagName;
                const childObject = this.domToObject(child);
                if (result[childName]) {
                    if (!Array.isArray(result[childName])) {
                        result[childName] = [result[childName]];
                    }
                    result[childName].push(childObject);
                }
                else {
                    result[childName] = childObject;
                }
            }
        }
        else if (node.textContent && node.textContent.trim()) {
            return node.textContent.trim();
        }
        return result;
    }
    renderSlideToHTML(slide, slideIndex, options) {
        if (!this.pptxData)
            throw new Error('No PPTX data loaded');
        const width = options.slideWidth || 960;
        const height = options.slideHeight || 720;
        // Create warp object for processing
        const warpObj = {
            slideLayoutTables: this.createTables(this.pptxData.slideLayouts),
            slideMasterTables: this.createTables(this.pptxData.slideMasters),
            theme: this.pptxData.theme,
            media: this.pptxData.media
        };
        let html = `<div class="slide" style="width: ${width}px; height: ${height}px;">`;
        // Process slide content
        const sldData = slide["p:sld"] || slide;
        const cSld = sldData["p:cSld"];
        if (cSld && cSld["p:spTree"]) {
            const spTree = cSld["p:spTree"];
            // Process each element in the slide
            Object.keys(spTree).forEach(nodeKey => {
                if (nodeKey !== "attrs") {
                    const nodeValue = spTree[nodeKey];
                    if (Array.isArray(nodeValue)) {
                        nodeValue.forEach(node => {
                            html += this.processNodesInSlide(nodeKey, node, spTree, warpObj, "slide", "slide");
                        });
                    }
                    else {
                        html += this.processNodesInSlide(nodeKey, nodeValue, spTree, warpObj, "slide", "slide");
                    }
                }
            });
        }
        html += '</div>';
        return html;
    }
    createTables(layouts) {
        const idTable = {};
        const idxTable = {};
        const typeTable = {};
        layouts.forEach(layout => {
            const spTree = layout["p:sldLayout"]?.["p:cSld"]?.["p:spTree"] ||
                layout["p:sldMaster"]?.["p:cSld"]?.["p:spTree"];
            if (spTree) {
                Object.keys(spTree).forEach(key => {
                    if (key === "p:sp" && spTree[key]) {
                        const shapes = Array.isArray(spTree[key]) ? spTree[key] : [spTree[key]];
                        shapes.forEach(shape => {
                            const id = this.getTextByPathList(shape, ["p:nvSpPr", "p:cNvPr", "attrs", "id"]);
                            const idx = this.getTextByPathList(shape, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "idx"]);
                            const type = this.getTextByPathList(shape, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]);
                            if (id !== undefined)
                                idTable[id] = shape;
                            if (idx !== undefined)
                                idxTable[idx] = shape;
                            if (type !== undefined)
                                typeTable[type] = shape;
                        });
                    }
                });
            }
        });
        return { idTable, idxTable, typeTable };
    }
    processNodesInSlide(nodeKey, nodeValue, nodes, warpObj, source, sType) {
        let result = "";
        switch (nodeKey) {
            case "p:sp": // Shape, Text
                result = this.processSpNode(nodeValue, nodes, warpObj, source, sType);
                break;
            case "p:cxnSp": // Shape, Text (with connection)
                result = this.processCxnSpNode(nodeValue, nodes, warpObj, source, sType);
                break;
            case "p:pic": // Picture
                result = this.processPicNode(nodeValue, warpObj, source, sType);
                break;
            case "p:graphicFrame": // Chart, Diagram, Table
                result = this.processGraphicFrameNode(nodeValue, warpObj, source, sType);
                break;
            case "p:grpSp":
                result = this.processGroupSpNode(nodeValue, warpObj, source);
                break;
            case "mc:AlternateContent": // Equations and formulas as Image
                const mcFallbackNode = this.getTextByPathList(nodeValue, ["mc:Fallback", "p:sp"]);
                if (mcFallbackNode !== undefined) {
                    result = this.processSpNode(mcFallbackNode, nodes, warpObj, source, sType);
                }
                break;
            default:
                break;
        }
        return result;
    }
    processSpNode(node, pNode, warpObj, source, sType) {
        const id = this.getTextByPathList(node, ["p:nvSpPr", "p:cNvPr", "attrs", "id"]);
        const name = this.getTextByPathList(node, ["p:nvSpPr", "p:cNvPr", "attrs", "name"]);
        const idx = this.getTextByPathList(node, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "idx"]);
        let type = this.getTextByPathList(node, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]);
        const order = this.getTextByPathList(node, ["attrs", "order"]) || 0;
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
            const txBoxVal = this.getTextByPathList(node, ["p:nvSpPr", "p:cNvSpPr", "attrs", "txBox"]);
            if (txBoxVal === "1") {
                type = "textBox";
            }
            else {
                type = this.getTextByPathList(slideLayoutSpNode, ["p:nvSpPr", "p:nvPr", "p:ph", "attrs", "type"]) || "obj";
            }
        }
        return this.genShape(node, pNode, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj, undefined, sType, source);
    }
    processCxnSpNode(node, pNode, warpObj, source, sType) {
        const id = this.getTextByPathList(node, ["p:nvCxnSpPr", "p:cNvPr", "attrs", "id"]);
        const name = this.getTextByPathList(node, ["p:nvCxnSpPr", "p:cNvPr", "attrs", "name"]);
        const idx = this.getTextByPathList(node, ["p:nvCxnSpPr", "p:nvPr", "p:ph", "attrs", "idx"]);
        const type = this.getTextByPathList(node, ["p:nvCxnSpPr", "p:nvPr", "p:ph", "attrs", "type"]) || "obj";
        const order = this.getTextByPathList(node, ["attrs", "order"]) || 0;
        return this.genShape(node, pNode, undefined, undefined, id, name, idx, type, order, warpObj, undefined, sType, source);
    }
    processPicNode(node, warpObj, source, sType) {
        const id = this.getTextByPathList(node, ["p:nvPicPr", "p:cNvPr", "attrs", "id"]);
        const name = this.getTextByPathList(node, ["p:nvPicPr", "p:cNvPr", "attrs", "name"]);
        const order = this.getTextByPathList(node, ["attrs", "order"]) || 0;
        // Get transform information
        const xfrmNode = this.getTextByPathList(node, ["p:spPr", "a:xfrm"]);
        const position = this.getPosition(xfrmNode, node);
        const size = this.getSize(xfrmNode);
        // Get image reference
        const blipNode = this.getTextByPathList(node, ["p:blipFill", "a:blip"]);
        const rId = this.getTextByPathList(blipNode, ["attrs", "r:embed"]);
        if (rId && warpObj.media) {
            // Find the media asset
            for (const [key, asset] of warpObj.media) {
                if (key.includes(rId) || asset.id === rId) {
                    const style = `${position} ${size} z-index: ${order};`;
                    if (asset.mimeType.startsWith('video/')) {
                        return this.createVideoElement(asset, style);
                    }
                    else {
                        return this.createImageElement(asset, style);
                    }
                }
            }
        }
        return `<div class="block" style="${position} ${size} background: #f0f0f0; z-index: ${order};"></div>`;
    }
    processGraphicFrameNode(node, warpObj, source, sType) {
        const id = this.getTextByPathList(node, ["p:nvGraphicFramePr", "p:cNvPr", "attrs", "id"]);
        const order = this.getTextByPathList(node, ["attrs", "order"]) || 0;
        // Get transform information
        const xfrmNode = this.getTextByPathList(node, ["p:xfrm"]);
        const position = this.getPosition(xfrmNode, node);
        const size = this.getSize(xfrmNode);
        // Check if it's a table
        const tableNode = this.getTextByPathList(node, ["a:graphic", "a:graphicData", "a:tbl"]);
        if (tableNode) {
            return this.genTable(tableNode, node, warpObj);
        }
        // Check if it's a chart
        const chartNode = this.getTextByPathList(node, ["a:graphic", "a:graphicData", "c:chart"]);
        if (chartNode) {
            return this.genChart(chartNode, node, warpObj);
        }
        return `<div class="block" style="${position} ${size} z-index: ${order};"></div>`;
    }
    processGroupSpNode(node, warpObj, source) {
        let result = "";
        const spTree = this.getTextByPathList(node, ["p:spTree"]);
        if (spTree) {
            Object.keys(spTree).forEach(key => {
                if (key !== "attrs") {
                    const nodeValue = spTree[key];
                    result += this.processNodesInSlide(key, nodeValue, node, warpObj, source, "");
                }
            });
        }
        return result;
    }
    genShape(node, pNode, slideLayoutSpNode, slideMasterSpNode, id, name, idx, type, order, warpObj, isUserDrawnBg, sType, source) {
        const slideXfrmNode = this.getTextByPathList(node, ["p:spPr", "a:xfrm"]);
        const position = this.getPosition(slideXfrmNode, pNode);
        const size = this.getSize(slideXfrmNode);
        let result = `<div class='block content' ` +
            `_id='${id}' _idx='${idx}' _type='${type}' _name='${name}' ` +
            `style='${position} ${size} z-index: ${order};'>`;
        // TextBody
        if (node["p:txBody"] !== undefined) {
            result += this.genTextBody(node["p:txBody"], node, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj);
        }
        result += "</div>";
        return result;
    }
    genTextBody(txBodyNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj) {
        let result = "";
        const paragraphs = txBodyNode["a:p"];
        if (paragraphs) {
            const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
            pArray.forEach(pNode => {
                result += this.genParagraph(pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj);
            });
        }
        return result;
    }
    genParagraph(pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj) {
        let result = "";
        const pPr = pNode["a:pPr"];
        const runs = pNode["a:r"];
        const algn = this.getTextByPathList(pPr, ["attrs", "algn"]) || "left";
        const lvl = parseInt(this.getTextByPathList(pPr, ["attrs", "lvl"]) || "0");
        result += `<div class="slide-prgrph" style="text-align: ${algn}; margin-left: ${lvl * 20}px;">`;
        if (runs) {
            const rArray = Array.isArray(runs) ? runs : [runs];
            rArray.forEach(rNode => {
                result += this.genTextRun(rNode, pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj);
            });
        }
        result += "</div>";
        return result;
    }
    genTextRun(rNode, pNode, spNode, slideLayoutSpNode, slideMasterSpNode, type, idx, warpObj) {
        const text = this.getTextByPathList(rNode, ["a:t"]) || "";
        const rPr = rNode["a:rPr"];
        if (!text)
            return "";
        let style = "";
        // Font size
        const sz = this.getTextByPathList(rPr, ["attrs", "sz"]);
        if (sz) {
            style += `font-size: ${parseInt(sz) / 100}pt;`;
        }
        // Font family
        const typeface = this.getTextByPathList(rPr, ["a:latin", "attrs", "typeface"]);
        if (typeface) {
            style += `font-family: "${typeface}";`;
        }
        // Bold
        const b = this.getTextByPathList(rPr, ["attrs", "b"]);
        if (b === "1") {
            style += "font-weight: bold;";
        }
        // Italic
        const i = this.getTextByPathList(rPr, ["attrs", "i"]);
        if (i === "1") {
            style += "font-style: italic;";
        }
        // Underline
        const u = this.getTextByPathList(rPr, ["attrs", "u"]);
        if (u && u !== "none") {
            style += "text-decoration: underline;";
        }
        // Color
        const solidFill = this.getTextByPathList(rPr, ["a:solidFill"]);
        if (solidFill) {
            const color = this.parseColor(solidFill, warpObj);
            if (color) {
                style += `color: ${color};`;
            }
        }
        return `<span style="${style}">${this.escapeHtml(text)}</span>`;
    }
    genTable(tableNode, graphicFrameNode, warpObj) {
        const rows = this.getTextByPathList(tableNode, ["a:tr"]);
        if (!rows)
            return "";
        const xfrmNode = this.getTextByPathList(graphicFrameNode, ["p:xfrm"]);
        const position = this.getPosition(xfrmNode, graphicFrameNode);
        const size = this.getSize(xfrmNode);
        let result = `<table class="slide" style="${position} ${size}">`;
        const rowArray = Array.isArray(rows) ? rows : [rows];
        rowArray.forEach(rowNode => {
            let rowResult = "<tr>";
            const cells = this.getTextByPathList(rowNode, ["a:tc"]);
            if (cells) {
                const cellArray = Array.isArray(cells) ? cells : [cells];
                cellArray.forEach(cellNode => {
                    const cellText = this.getTextByPathList(cellNode, ["a:txBody", "a:p", "a:r", "a:t"]) || "";
                    rowResult += `<td>${this.escapeHtml(cellText)}</td>`;
                });
            }
            rowResult += "</tr>";
            result += rowResult;
        });
        result += "</table>";
        return result;
    }
    genChart(chartNode, graphicFrameNode, warpObj) {
        const xfrmNode = this.getTextByPathList(graphicFrameNode, ["p:xfrm"]);
        const position = this.getPosition(xfrmNode, graphicFrameNode);
        const size = this.getSize(xfrmNode);
        return `<div class="block chart-placeholder" style="${position} ${size} background: #f5f5f5; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
      <span>Graphique</span>
    </div>`;
    }
    // Utility methods used by processors
    getTextByPathList(node, path) {
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
    getPosition(xfrmNode, parentNode) {
        let x = 0, y = 0;
        if (xfrmNode?.["a:off"]) {
            x = parseInt(xfrmNode["a:off"]["attrs"]?.["x"] || "0");
            y = parseInt(xfrmNode["a:off"]["attrs"]?.["y"] || "0");
        }
        // Convert EMU to pixels (1 EMU = 1/914400 inch, 1 inch = 96 pixels)
        const pixelX = Math.round(x / 914400 * 96);
        const pixelY = Math.round(y / 914400 * 96);
        return `left: ${pixelX}px; top: ${pixelY}px;`;
    }
    getSize(xfrmNode) {
        let width = 0, height = 0;
        if (xfrmNode?.["a:ext"]) {
            width = parseInt(xfrmNode["a:ext"]["attrs"]?.["cx"] || "0");
            height = parseInt(xfrmNode["a:ext"]["attrs"]?.["cy"] || "0");
        }
        // Convert EMU to pixels
        const pixelWidth = Math.round(width / 914400 * 96);
        const pixelHeight = Math.round(height / 914400 * 96);
        return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
    }
    createVideoElement(videoAsset, style) {
        const videoData = btoa(String.fromCharCode(...new Uint8Array(videoAsset.data)));
        return `<video 
      controls 
      style="${style}"
      src="data:${videoAsset.mimeType};base64,${videoData}"
    >
      Votre navigateur ne supporte pas la lecture de vidéos.
    </video>`;
    }
    createImageElement(imageAsset, style) {
        const imageData = btoa(String.fromCharCode(...new Uint8Array(imageAsset.data)));
        return `<img 
      style="${style}"
      src="data:${imageAsset.mimeType};base64,${imageData}"
      alt="Slide image"
    />`;
    }
    parseColor(solidFill, warpObj) {
        const srgbClr = this.getTextByPathList(solidFill, ["a:srgbClr", "attrs", "val"]);
        if (srgbClr) {
            return `#${srgbClr}`;
        }
        const schemeClr = this.getTextByPathList(solidFill, ["a:schemeClr", "attrs", "val"]);
        if (schemeClr) {
            // Map scheme colors to actual colors from theme
            const colorMap = {
                'bg1': '#FFFFFF',
                'tx1': '#000000',
                'bg2': '#F2F2F2',
                'tx2': '#1F497D',
                'accent1': '#4F81BD',
                'accent2': '#F79646',
                'accent3': '#9BBB59',
                'accent4': '#8064A2',
                'accent5': '#4BACC6',
                'accent6': '#F596AA'
            };
            return colorMap[schemeClr] || '#000000';
        }
        return null;
    }
    escapeHtml(text) {
        const escapeChars = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, (char) => escapeChars[char]);
    }
}
//# sourceMappingURL=PptxProcessor.js.map