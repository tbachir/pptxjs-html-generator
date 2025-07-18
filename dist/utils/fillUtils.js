export function getShapeFill(node, pNode, isSvgMode, warpObj, source) {
    // Port of shape fill logic
    const spPr = node["p:spPr"];
    if (!spPr)
        return "";
    // Check for solid fill
    const solidFill = spPr["a:solidFill"];
    if (solidFill) {
        // TODO: Implement full color parsing
        return "background-color: #cccccc;";
    }
    // Check for gradient fill
    const gradFill = spPr["a:gradFill"];
    if (gradFill) {
        // TODO: Implement gradient parsing
        return "background: linear-gradient(45deg, #cccccc, #ffffff);";
    }
    return "";
}
//# sourceMappingURL=fillUtils.js.map