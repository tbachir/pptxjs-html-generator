
# PPTX-JS HTML Generator

Une version TypeScript moderne de pptxjs pour générer du HTML à partir de fichiers PowerPoint avec support complet des vidéos.

## Installation

```bash
npm install pptxjs-html-generator
```

## Utilisation de base

```typescript
import { PptxProcessor } from 'pptxjs-html-generator';

const processor = new PptxProcessor();

// Charger un fichier PPTX
await processor.loadFile(pptxFile);

// Obtenir le HTML d'une slide
const slideHTML = processor.getSlideHTML(0);

// Obtenir le CSS requis
const css = processor.getSlideCSS();

// Injecter dans le DOM
document.getElementById('container').innerHTML = slideHTML;

// Ajouter le CSS
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
```

## Fonctionnalités

- ✅ **Support complet des vidéos** - Extraction et intégration HTML5
- ✅ **Génération HTML fidèle** - Reproduction exacte du rendu PowerPoint
- ✅ **CSS maintenu** - Classes CSS identiques à l'original
- ✅ **TypeScript natif** - Types complets et API moderne
- ✅ **Slides individuelles** - Accès et manipulation par slide
- ✅ **Assets médias** - Images et vidéos extraites
- ✅ **Performance** - Traitement optimisé et lazy loading

## API

### PptxProcessor

#### `loadFile(file: File | ArrayBuffer): Promise<void>`
Charge un fichier PPTX.

#### `getSlideCount(): number`
Retourne le nombre de slides.

#### `getSlideHTML(slideIndex: number, options?: RenderOptions): string`
Génère le HTML d'une slide spécifique.

#### `getAllSlidesHTML(options?: RenderOptions): string[]`
Génère le HTML de toutes les slides.

#### `getSlideCSS(): string`
Retourne le CSS requis pour le rendu.

#### `getMediaAssets(): Map<string, VideoAsset | ImageAsset>`
Accède aux assets médias extraits.

### Options de rendu

```typescript
interface RenderOptions {
  includeCSS?: boolean;
  extractMedia?: boolean;
  slideWidth?: number;
  slideHeight?: number;
}
```

## Exemples avancés

### Manipulation du HTML

```typescript
let slideHTML = processor.getSlideHTML(0);

// Modifier les couleurs
slideHTML = slideHTML.replace(/color: #000000/g, 'color: #ff0000');

// Modifier les tailles de police
slideHTML = slideHTML.replace(/font-size: (\d+)pt/g, (match, size) => {
  return `font-size: ${parseInt(size) + 2}pt`;
});
```

### Support React

```typescript
function PptxViewer({ file }: { file: File }) {
  const [slides, setSlides] = useState<string[]>([]);
  
  useEffect(() => {
    const processor = new PptxProcessor();
    processor.loadFile(file).then(() => {
      setSlides(processor.getAllSlidesHTML());
    });
  }, [file]);
  
  return (
    <div>
      {slides.map((html, index) => (
        <div 
          key={index}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </div>
  );
}
```

### Gestion des vidéos

Les vidéos sont automatiquement extraites et intégrées comme éléments HTML5 :

```html
<video controls style="position: absolute; ...">
  <source src="data:video/mp4;base64,..." type="video/mp4">
  Votre navigateur ne supporte pas la lecture de vidéos.
</video>
```

## CSS maintenu

Le CSS original est parfaitement préservé :

```css
.slide {
  position: relative;
  border: 1px solid #333;
  border-radius: 10px;
  overflow: hidden;
}

.slide div.block {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  line-height: 1;
}

/* Toutes les autres classes CSS maintenues... */
```

## Compatibilité

- ✅ Navigateurs modernes (ES2020+)
- ✅ Node.js 16+
- ✅ React 16.8+
- ✅ Vue.js 3+
- ✅ Angular 12+

## Licence

MIT