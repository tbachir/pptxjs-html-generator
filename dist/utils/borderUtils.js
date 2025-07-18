export function getBorder(node, pNode, isSvgMode, shapeType, warpObj) {
    // Port of border generation logic
    const spPr = node["p:spPr"];
    if (!spPr)
        return "";
    const ln = spPr["a:ln"];
    if (!ln)
        return "";
    const width = ln["attrs"]?.["w"] ? Math.round(parseInt(ln["attrs"]["w"]) / 914400 * 96) : 1;
    // TODO: Implement full border logic including colors, patterns, etc.
    return `border: ${width}px solid #000000;`;
}
//# sourceMappingURL=borderUtils.js.map