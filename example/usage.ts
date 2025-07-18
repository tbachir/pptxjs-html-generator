import { PptxProcessor } from 'pptxjs-html-generator';

// Exemple d'utilisation basique
async function basicUsage() {
    const processor = new PptxProcessor();

    // Charger un fichier PPTX
    const fileInput = document.getElementById('pptx-file') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
        await processor.loadFile(file);

        // Obtenir le nombre de slides
        const slideCount = processor.getSlideCount();
        console.log(`Présentation contient ${slideCount} slides`);

        // Générer le HTML d'une slide spécifique
        const slideHTML = processor.getSlideHTML(0); // Première slide

        // Injecter dans le DOM
        const container = document.getElementById('slide-container');
        if (container) {
            container.innerHTML = slideHTML;
        }

        // Ajouter le CSS requis
        const style = document.createElement('style');
        style.textContent = processor.getSlideCSS();
        document.head.appendChild(style);
    }
}

// Exemple avec toutes les slides
async function getAllSlides() {
    const processor = new PptxProcessor();
    const file = await fetch('/path/to/presentation.pptx').then(r => r.arrayBuffer());

    await processor.loadFile(file);

    // Obtenir toutes les slides
    const allSlidesHTML = processor.getAllSlidesHTML();

    // Créer un container pour chaque slide
    const mainContainer = document.getElementById('all-slides-container');
    if (mainContainer) {
        allSlidesHTML.forEach((slideHTML, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide-wrapper';
            slideDiv.innerHTML = `
        <h3>Slide ${index + 1}</h3>
        ${slideHTML}
      `;
            mainContainer.appendChild(slideDiv);
        });
    }

    // Ajouter le CSS
    const style = document.createElement('style');
    style.textContent = processor.getSlideCSS();
    document.head.appendChild(style);
}

// Exemple avec manipulation du HTML généré
async function manipulateSlideHTML() {
    const processor = new PptxProcessor();
    const file = document.querySelector('input[type="file"]')?.files?.[0];

    if (file) {
        await processor.loadFile(file);

        // Obtenir le HTML brut
        let slideHTML = processor.getSlideHTML(0);

        // Manipulation personnalisée
        slideHTML = slideHTML.replace(/color: #000000/g, 'color: #ff0000'); // Changer couleur du texte
        slideHTML = slideHTML.replace(/font-size: (\d+)pt/g, (match, size) => {
            return `font-size: ${parseInt(size) + 2}pt`; // Augmenter taille police
        });

        // Ajouter des attributs personnalisés
        slideHTML = slideHTML.replace(/<div class="slide"/g, '<div class="slide custom-slide"');

        // Injecter le HTML modifié
        document.getElementById('custom-slide-container')!.innerHTML = slideHTML;
    }
}

// Exemple avec gestion des médias
async function handleMediaAssets() {
    const processor = new PptxProcessor();
    const file = await fetch('/presentation-with-videos.pptx').then(r => r.arrayBuffer());

    await processor.loadFile(file);

    // Obtenir les assets médias
    const mediaAssets = processor.getMediaAssets();

    console.log('Assets trouvés:');
    mediaAssets.forEach((asset, key) => {
        console.log(`- ${key}: ${asset.mimeType} (${asset.data.byteLength} bytes)`);
    });

    // Générer les slides avec support vidéo
    const slideWithVideo = processor.getSlideHTML(0);
    document.getElementById('video-slide-container')!.innerHTML = slideWithVideo;

    // Les vidéos seront automatiquement intégrées comme éléments HTML5 <video>
}

// Exemple React Hook
function usePptxProcessor() {
    const [processor] = useState(() => new PptxProcessor());
    const [slides, setSlides] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPresentation = useCallback(async (file: File | ArrayBuffer) => {
        setLoading(true);
        setError(null);

        try {
            await processor.loadFile(file);
            const allSlides = processor.getAllSlidesHTML();
            setSlides(allSlides);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [processor]);

    return {
        processor,
        slides,
        loading,
        error,
        loadPresentation,
        slideCount: processor.getSlideCount(),
        css: processor.getSlideCSS()
    };
}

// Composant React
function PptxViewer({ file }: { file: File }) {
    const { slides, loading, error, loadPresentation, css } = usePptxProcessor();

    useEffect(() => {
        if (file) {
            loadPresentation(file);
        }
    }, [file, loadPresentation]);

    useEffect(() => {
        // Injecter le CSS
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        return () => document.head.removeChild(style);
    }, [css]);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: { error } </div>;

    return (
        <div className= "pptx-viewer" >
        {
            slides.map((slideHTML, index) => (
                <div 
          key= { index }
          className = "slide-container"
          dangerouslySetInnerHTML = {{ __html: slideHTML }}
        />
      ))
}
</div>
  );
}

// Exemple de configuration avancée
async function advancedConfiguration() {
    const processor = new PptxProcessor();
    const file = await fetch('/complex-presentation.pptx').then(r => r.arrayBuffer());

    await processor.loadFile(file);

    // Options personnalisées
    const options = {
        slideWidth: 1200,
        slideHeight: 900,
        includeCSS: true,
        extractMedia: true
    };

    // Générer avec options
    const slideHTML = processor.getSlideHTML(0, options);

    // CSS personnalisé en plus du CSS de base
    const customCSS = `
    ${processor.getSlideCSS()}
    
    .slide {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      margin: 20px;
    }
    
    .slide video {
      border-radius: 8px;
    }
    
    .slide-container {
      padding: 20px;
      background: #f5f5f5;
    }
  `;

    const style = document.createElement('style');
    style.textContent = customCSS;
    document.head.appendChild(style);

    document.getElementById('advanced-container')!.innerHTML = slideHTML;
}

export {
    basicUsage,
    getAllSlides,
    manipulateSlideHTML,
    handleMediaAssets,
    usePptxProcessor,
    PptxViewer,
    advancedConfiguration
};