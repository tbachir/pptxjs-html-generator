import { getTextByPathList } from "./xmlUtils";
export function getDingbatToUnicode(typefaceNode, buChar) {
    // Port of the original dingbat character conversion
    switch (buChar) {
        case "§":
            return "&#9632;"; // Black square
        case "q":
            return "&#10065;"; // Lower right shadowed white square
        case "v":
            return "&#10070;"; // Black diamond minus white X
        case "Ø":
            return "&#11162;"; // Three-D top-lighted rightwards equilateral arrowhead
        case "ü":
            return "&#10004;"; // Heavy check mark
        default:
            if (typefaceNode === "Wingdings 2" || typefaceNode === "Wingdings 3") {
                // TODO: Implement full wingdings mapping
                return "&#" + buChar.charCodeAt(0) + ";";
            }
            return "&#" + buChar.charCodeAt(0) + ";";
    }
}
export function getVerticalAlign(node, slideLayoutSpNode, slideMasterSpNode, type) {
    // Port of the original vertical alignment logic
    const anchor = getTextByPathList(node, ["p:txBody", "a:bodyPr", "attrs", "anchor"]);
    switch (anchor) {
        case "t":
            return "v-up";
        case "ctr":
            return "v-mid";
        case "b":
            return "v-down";
        default:
            return "v-up";
    }
}
export function getContentDir(node, type, warpObj) {
    // Port of content direction logic
    const rtl = getTextByPathList(node, ["p:txBody", "a:bodyPr", "attrs", "rtl"]);
    if (rtl === "1") {
        return "content-rtl";
    }
    return "content";
}
//# sourceMappingURL=textUtils.js.map