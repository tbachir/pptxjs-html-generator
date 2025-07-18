"use strict";var L=Object.create;var m=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var B=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,$=Object.prototype.hasOwnProperty;var w=(h,t)=>{for(var e in t)m(h,e,{get:t[e],enumerable:!0})},T=(h,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of B(t))!$.call(h,i)&&i!==e&&m(h,i,{get:()=>t[i],enumerable:!(s=S(t,i))||s.enumerable});return h};var N=(h,t,e)=>(e=h!=null?L(A(h)):{},T(t||!h||!h.__esModule?m(e,"default",{value:h,enumerable:!0}):e,h)),M=h=>T(m({},"__esModule",{value:!0}),h);var D={};w(D,{PptxProcessor:()=>v});module.exports=M(D);var b=N(require("jszip")),v=class{pptxData=null;zip=null;slideCSS=`
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
`;constructor(){}async loadFile(t){let e=t instanceof File?await t.arrayBuffer():t;this.zip=await b.default.loadAsync(e),this.pptxData=await this.parsePptxData()}getSlideCount(){return this.pptxData?.slides.length||0}getSlideHTML(t,e={}){if(!this.pptxData||t>=this.pptxData.slides.length)throw new Error(`Slide ${t} not found`);let s=this.pptxData.slides[t];return this.renderSlideToHTML(s,t,e)}getAllSlidesHTML(t={}){if(!this.pptxData)throw new Error("No PPTX data loaded");return this.pptxData.slides.map((e,s)=>this.renderSlideToHTML(e,s,t))}getSlideCSS(){return this.slideCSS}getMediaAssets(){return this.pptxData?.media||new Map}async parsePptxData(){if(!this.zip)throw new Error("No ZIP data loaded");let t=[],e=[],s=[],i=new Map,a=Object.keys(this.zip.files).filter(r=>r.startsWith("ppt/slides/slide")&&r.endsWith(".xml"));for(let r of a){let p=await this.zip.files[r].async("text"),d=this.parseXML(p);t.push(d)}let n=Object.keys(this.zip.files).filter(r=>r.startsWith("ppt/slideLayouts/")&&r.endsWith(".xml"));for(let r of n){let p=await this.zip.files[r].async("text"),d=this.parseXML(p);e.push(d)}let l=Object.keys(this.zip.files).filter(r=>r.startsWith("ppt/slideMasters/")&&r.endsWith(".xml"));for(let r of l){let p=await this.zip.files[r].async("text"),d=this.parseXML(p);s.push(d)}await this.extractMedia(i);let c=Object.keys(this.zip.files).find(r=>r.startsWith("ppt/theme/")&&r.endsWith(".xml")),o=null;if(c){let r=await this.zip.files[c].async("text");o=this.parseXML(r)}return{slides:t,slideLayouts:e,slideMasters:s,theme:o,media:i}}async extractMedia(t){if(!this.zip)return;let e=Object.keys(this.zip.files).filter(s=>s.startsWith("ppt/media/"));for(let s of e){let i=s.split("/").pop()||"",a=await this.zip.files[s].async("arraybuffer"),n=this.getMimeType(i),l={id:i,data:a,mimeType:n,fileName:i};t.set(i,l)}}getMimeType(t){let e=t.split(".").pop()?.toLowerCase();return{mp4:"video/mp4",webm:"video/webm",mov:"video/quicktime",avi:"video/x-msvideo",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",gif:"image/gif",svg:"image/svg+xml"}[e||""]||"application/octet-stream"}parseXML(t){let s=new DOMParser().parseFromString(t,"text/xml");return this.domToObject(s.documentElement)}domToObject(t){let e={};if(t.attributes.length>0){e.attrs={};for(let s=0;s<t.attributes.length;s++){let i=t.attributes[s];e.attrs[i.name]=i.value}}if(t.children.length>0)for(let s=0;s<t.children.length;s++){let i=t.children[s],a=i.tagName,n=this.domToObject(i);e[a]?(Array.isArray(e[a])||(e[a]=[e[a]]),e[a].push(n)):e[a]=n}else if(t.textContent&&t.textContent.trim())return t.textContent.trim();return e}renderSlideToHTML(t,e,s){if(!this.pptxData)throw new Error("No PPTX data loaded");let i=s.slideWidth||960,a=s.slideHeight||720,n={slideLayoutTables:this.createTables(this.pptxData.slideLayouts),slideMasterTables:this.createTables(this.pptxData.slideMasters),theme:this.pptxData.theme,media:this.pptxData.media},l=`<div class="slide" style="width: ${i}px; height: ${a}px;">`,o=(t["p:sld"]||t)["p:cSld"];if(o&&o["p:spTree"]){let r=o["p:spTree"];Object.keys(r).forEach(p=>{if(p!=="attrs"){let d=r[p];Array.isArray(d)?d.forEach(y=>{l+=this.processNodesInSlide(p,y,r,n,"slide","slide")}):l+=this.processNodesInSlide(p,d,r,n,"slide","slide")}})}return l+="</div>",l}createTables(t){let e={},s={},i={};return t.forEach(a=>{let n=a["p:sldLayout"]?.["p:cSld"]?.["p:spTree"]||a["p:sldMaster"]?.["p:cSld"]?.["p:spTree"];n&&Object.keys(n).forEach(l=>{l==="p:sp"&&n[l]&&(Array.isArray(n[l])?n[l]:[n[l]]).forEach(o=>{let r=this.getTextByPathList(o,["p:nvSpPr","p:cNvPr","attrs","id"]),p=this.getTextByPathList(o,["p:nvSpPr","p:nvPr","p:ph","attrs","idx"]),d=this.getTextByPathList(o,["p:nvSpPr","p:nvPr","p:ph","attrs","type"]);r!==void 0&&(e[r]=o),p!==void 0&&(s[p]=o),d!==void 0&&(i[d]=o)})})}),{idTable:e,idxTable:s,typeTable:i}}processNodesInSlide(t,e,s,i,a,n){let l="";switch(t){case"p:sp":l=this.processSpNode(e,s,i,a,n);break;case"p:cxnSp":l=this.processCxnSpNode(e,s,i,a,n);break;case"p:pic":l=this.processPicNode(e,i,a,n);break;case"p:graphicFrame":l=this.processGraphicFrameNode(e,i,a,n);break;case"p:grpSp":l=this.processGroupSpNode(e,i,a);break;case"mc:AlternateContent":let c=this.getTextByPathList(e,["mc:Fallback","p:sp"]);c!==void 0&&(l=this.processSpNode(c,s,i,a,n));break;default:break}return l}processSpNode(t,e,s,i,a){let n=this.getTextByPathList(t,["p:nvSpPr","p:cNvPr","attrs","id"]),l=this.getTextByPathList(t,["p:nvSpPr","p:cNvPr","attrs","name"]),c=this.getTextByPathList(t,["p:nvSpPr","p:nvPr","p:ph","attrs","idx"]),o=this.getTextByPathList(t,["p:nvSpPr","p:nvPr","p:ph","attrs","type"]),r=this.getTextByPathList(t,["attrs","order"])||0,p,d;return c!==void 0?(p=s.slideLayoutTables?.idxTable?.[c],d=s.slideMasterTables?.typeTable?.[o]||s.slideMasterTables?.idxTable?.[c]):o!==void 0&&(p=s.slideLayoutTables?.typeTable?.[o],d=s.slideMasterTables?.typeTable?.[o]),o===void 0&&(this.getTextByPathList(t,["p:nvSpPr","p:cNvSpPr","attrs","txBox"])==="1"?o="textBox":o=this.getTextByPathList(p,["p:nvSpPr","p:nvPr","p:ph","attrs","type"])||"obj"),this.genShape(t,e,p,d,n,l,c,o,r,s,void 0,a,i)}processCxnSpNode(t,e,s,i,a){let n=this.getTextByPathList(t,["p:nvCxnSpPr","p:cNvPr","attrs","id"]),l=this.getTextByPathList(t,["p:nvCxnSpPr","p:cNvPr","attrs","name"]),c=this.getTextByPathList(t,["p:nvCxnSpPr","p:nvPr","p:ph","attrs","idx"]),o=this.getTextByPathList(t,["p:nvCxnSpPr","p:nvPr","p:ph","attrs","type"])||"obj",r=this.getTextByPathList(t,["attrs","order"])||0;return this.genShape(t,e,void 0,void 0,n,l,c,o,r,s,void 0,a,i)}processPicNode(t,e,s,i){let a=this.getTextByPathList(t,["p:nvPicPr","p:cNvPr","attrs","id"]),n=this.getTextByPathList(t,["p:nvPicPr","p:cNvPr","attrs","name"]),l=this.getTextByPathList(t,["attrs","order"])||0,c=this.getTextByPathList(t,["p:spPr","a:xfrm"]),o=this.getPosition(c,t),r=this.getSize(c),p=this.getTextByPathList(t,["p:blipFill","a:blip"]),d=this.getTextByPathList(p,["attrs","r:embed"]);if(d&&e.media){for(let[y,g]of e.media)if(y.includes(d)||g.id===d){let f=`${o} ${r} z-index: ${l};`;return g.mimeType.startsWith("video/")?this.createVideoElement(g,f):this.createImageElement(g,f)}}return`<div class="block" style="${o} ${r} background: #f0f0f0; z-index: ${l};"></div>`}processGraphicFrameNode(t,e,s,i){let a=this.getTextByPathList(t,["p:nvGraphicFramePr","p:cNvPr","attrs","id"]),n=this.getTextByPathList(t,["attrs","order"])||0,l=this.getTextByPathList(t,["p:xfrm"]),c=this.getPosition(l,t),o=this.getSize(l),r=this.getTextByPathList(t,["a:graphic","a:graphicData","a:tbl"]);if(r)return this.genTable(r,t,e);let p=this.getTextByPathList(t,["a:graphic","a:graphicData","c:chart"]);return p?this.genChart(p,t,e):`<div class="block" style="${c} ${o} z-index: ${n};"></div>`}processGroupSpNode(t,e,s){let i="",a=this.getTextByPathList(t,["p:spTree"]);return a&&Object.keys(a).forEach(n=>{if(n!=="attrs"){let l=a[n];i+=this.processNodesInSlide(n,l,t,e,s,"")}}),i}genShape(t,e,s,i,a,n,l,c,o,r,p,d,y){let g=this.getTextByPathList(t,["p:spPr","a:xfrm"]),f=this.getPosition(g,e),u=this.getSize(g),x=`<div class='block content' _id='${a}' _idx='${l}' _type='${c}' _name='${n}' style='${f} ${u} z-index: ${o};'>`;return t["p:txBody"]!==void 0&&(x+=this.genTextBody(t["p:txBody"],t,s,i,c,l,r)),x+="</div>",x}genTextBody(t,e,s,i,a,n,l){let c="",o=t["a:p"];return o&&(Array.isArray(o)?o:[o]).forEach(p=>{c+=this.genParagraph(p,e,s,i,a,n,l)}),c}genParagraph(t,e,s,i,a,n,l){let c="",o=t["a:pPr"],r=t["a:r"],p=this.getTextByPathList(o,["attrs","algn"])||"left",d=parseInt(this.getTextByPathList(o,["attrs","lvl"])||"0");return c+=`<div class="slide-prgrph" style="text-align: ${p}; margin-left: ${d*20}px;">`,r&&(Array.isArray(r)?r:[r]).forEach(g=>{c+=this.genTextRun(g,t,e,s,i,a,n,l)}),c+="</div>",c}genTextRun(t,e,s,i,a,n,l,c){let o=this.getTextByPathList(t,["a:t"])||"",r=t["a:rPr"];if(!o)return"";let p="",d=this.getTextByPathList(r,["attrs","sz"]);d&&(p+=`font-size: ${parseInt(d)/100}pt;`);let y=this.getTextByPathList(r,["a:latin","attrs","typeface"]);y&&(p+=`font-family: "${y}";`),this.getTextByPathList(r,["attrs","b"])==="1"&&(p+="font-weight: bold;"),this.getTextByPathList(r,["attrs","i"])==="1"&&(p+="font-style: italic;");let u=this.getTextByPathList(r,["attrs","u"]);u&&u!=="none"&&(p+="text-decoration: underline;");let x=this.getTextByPathList(r,["a:solidFill"]);if(x){let P=this.parseColor(x,c);P&&(p+=`color: ${P};`)}return`<span style="${p}">${this.escapeHtml(o)}</span>`}genTable(t,e,s){let i=this.getTextByPathList(t,["a:tr"]);if(!i)return"";let a=this.getTextByPathList(e,["p:xfrm"]),n=this.getPosition(a,e),l=this.getSize(a),c=`<table class="slide" style="${n} ${l}">`;return(Array.isArray(i)?i:[i]).forEach(r=>{let p="<tr>",d=this.getTextByPathList(r,["a:tc"]);d&&(Array.isArray(d)?d:[d]).forEach(g=>{let f=this.getTextByPathList(g,["a:txBody","a:p","a:r","a:t"])||"";p+=`<td>${this.escapeHtml(f)}</td>`}),p+="</tr>",c+=p}),c+="</table>",c}genChart(t,e,s){let i=this.getTextByPathList(e,["p:xfrm"]),a=this.getPosition(i,e),n=this.getSize(i);return`<div class="block chart-placeholder" style="${a} ${n} background: #f5f5f5; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center;">
      <span>Graphique</span>
    </div>`}getTextByPathList(t,e){if(!Array.isArray(e))throw new Error("Error of path type! path is not array.");if(t===void 0)return;let s=t;for(let i=0;i<e.length;i++)if(s=s[e[i]],s===void 0)return;return s}getPosition(t,e){let s=0,i=0;t?.["a:off"]&&(s=parseInt(t["a:off"].attrs?.x||"0"),i=parseInt(t["a:off"].attrs?.y||"0"));let a=Math.round(s/914400*96),n=Math.round(i/914400*96);return`left: ${a}px; top: ${n}px;`}getSize(t){let e=0,s=0;t?.["a:ext"]&&(e=parseInt(t["a:ext"].attrs?.cx||"0"),s=parseInt(t["a:ext"].attrs?.cy||"0"));let i=Math.round(e/914400*96),a=Math.round(s/914400*96);return`width: ${i}px; height: ${a}px;`}createVideoElement(t,e){let s=btoa(String.fromCharCode(...new Uint8Array(t.data)));return`<video 
      controls 
      style="${e}"
      src="data:${t.mimeType};base64,${s}"
    >
      Votre navigateur ne supporte pas la lecture de vid\xE9os.
    </video>`}createImageElement(t,e){let s=btoa(String.fromCharCode(...new Uint8Array(t.data)));return`<img 
      style="${e}"
      src="data:${t.mimeType};base64,${s}"
      alt="Slide image"
    />`}parseColor(t,e){let s=this.getTextByPathList(t,["a:srgbClr","attrs","val"]);if(s)return`#${s}`;let i=this.getTextByPathList(t,["a:schemeClr","attrs","val"]);return i?{bg1:"#FFFFFF",tx1:"#000000",bg2:"#F2F2F2",tx2:"#1F497D",accent1:"#4F81BD",accent2:"#F79646",accent3:"#9BBB59",accent4:"#8064A2",accent5:"#4BACC6",accent6:"#F596AA"}[i]||"#000000":null}escapeHtml(t){let e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};return t.replace(/[&<>"']/g,s=>e[s])}};0&&(module.exports={PptxProcessor});
//# sourceMappingURL=index.js.map