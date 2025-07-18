#!/bin/bash
# deploy.sh - Script pour automatiser le déploiement dev → main

set -e

echo "🚀 Démarrage du déploiement dev → main"

# 1. Vérification que nous sommes sur dev
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "❌ Erreur: Vous devez être sur la branche dev"
    exit 1
fi

# 2. Vérification que tout est commité
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non commités"
    exit 1
fi

# 3. Build du projet
echo "🔨 Build du projet..."
npm run build

# 4. Vérification que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'existe pas"
    exit 1
fi

# 5. Switch vers main
echo "🔄 Basculement vers la branche main..."
git checkout main

# 6. Nettoyage de main (garder seulement .git)
echo "🧹 Nettoyage de la branche main..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# 7. Copie des fichiers de production depuis dev
echo "📋 Copie des fichiers de production..."
git checkout dev -- dist/
cp dist/* . 2>/dev/null || true
git checkout dev -- README.md
git checkout dev -- package.json

# 8. Remplacement du package.json par la version production
cat > package.json << 'EOF'
{
  "name": "pptxjs-html-generator",
  "version": "1.0.0",
  "description": "Modern TypeScript port of pptxjs for generating HTML from PowerPoint slides with video support",
  "main": "index.js",
  "types": "index.d.ts",
  "scripts": {
    "postinstall": "echo \"Package installed successfully\""
  },
  "keywords": [
    "powerpoint",
    "pptx",
    "html",
    "typescript",
    "slide",
    "presentation",
    "video"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/yourusername/pptxjs-html-generator#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/pptxjs-html-generator.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/pptxjs-html-generator/issues"
  },
  "dependencies": {
    "jszip": "^3.10.1"
  },
  "files": [
    "index.js",
    "index.d.ts",
    "*.js",
    "*.d.ts",
    "README.md"
  ],
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# 9. Copie des fichiers TypeScript compilés à la racine
echo "📁 Organisation des fichiers..."
cp dist/*.js . 2>/dev/null || true
cp dist/*.d.ts . 2>/dev/null || true
cp dist/*.map . 2>/dev/null || true

# 10. Commit des changements
echo "💾 Commit des changements..."
git add .
git commit -m "Deploy: Update production build $(date '+%Y-%m-%d %H:%M:%S')"

# 11. Push vers main
echo "⬆️ Push vers main..."
git push origin main

# 12. Retour sur dev
echo "🔄 Retour sur la branche dev..."
git checkout dev

echo "✅ Déploiement terminé avec succès!"
echo "📦 La branche main contient maintenant le package prêt pour npm"