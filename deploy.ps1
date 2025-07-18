# deploy.ps1 - Script PowerShell pour automatiser le déploiement dev → main

param(
    [switch]$Force = $false
)

# Configuration des couleurs
$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🚀 Démarrage du déploiement dev → main" "Green"

try {
    # 1. Vérification que nous sommes sur dev
    Write-ColorOutput "🔍 Vérification de la branche courante..." "Yellow"
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "dev") {
        Write-ColorOutput "❌ Erreur: Vous devez être sur la branche dev (actuellement sur: $currentBranch)" "Red"
        exit 1
    }

    # 2. Vérification que tout est commité
    Write-ColorOutput "🔍 Vérification des changements non commités..." "Yellow"
    $gitStatus = git status --porcelain
    if ($gitStatus -and -not $Force) {
        Write-ColorOutput "❌ Erreur: Il y a des changements non commités. Utilisez -Force pour ignorer." "Red"
        Write-ColorOutput "Changements détectés:" "Red"
        git status --short
        exit 1
    }

    # 3. Build du projet
    Write-ColorOutput "🔨 Build du projet..." "Yellow"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Erreur lors du build" "Red"
        exit 1
    }

    # 4. Vérification que le build a réussi
    Write-ColorOutput "🔍 Vérification du dossier dist..." "Yellow"
    if (-not (Test-Path "dist")) {
        Write-ColorOutput "❌ Erreur: Le dossier dist n'existe pas" "Red"
        exit 1
    }

    # 5. Switch vers main
    Write-ColorOutput "🔄 Basculement vers la branche main..." "Yellow"
    git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Erreur lors du checkout vers main" "Red"
        exit 1
    }

    # 6. Nettoyage de main (garder seulement .git)
    Write-ColorOutput "🧹 Nettoyage de la branche main..." "Yellow"
    Get-ChildItem -Path . -Exclude ".git" | Remove-Item -Recurse -Force

    # 7. Copie des fichiers de production depuis dev
    Write-ColorOutput "📋 Copie des fichiers de production..." "Yellow"
    git checkout dev -- dist/
    git checkout dev -- README.md
    
    # Copie des fichiers compilés à la racine
    if (Test-Path "dist") {
        Copy-Item "dist\*" -Destination "." -Force -ErrorAction SilentlyContinue
        Remove-Item "dist" -Recurse -Force
    }

    # 8. Création du package.json de production
    Write-ColorOutput "📝 Création du package.json de production..." "Yellow"
    $packageJson = @{
        name = "pptxjs-html-generator"
        version = "1.0.0"
        description = "Modern TypeScript port of pptxjs for generating HTML from PowerPoint slides with video support"
        main = "index.js"
        types = "index.d.ts"
        scripts = @{
            postinstall = "echo Package installed successfully"
        }
        keywords = @(
            "powerpoint",
            "pptx", 
            "html",
            "typescript",
            "slide",
            "presentation",
            "video"
        )
        author = "Your Name <your.email@example.com>"
        license = "MIT"
        homepage = "https://github.com/yourusername/pptxjs-html-generator#readme"
        repository = @{
            type = "git"
            url = "https://github.com/yourusername/pptxjs-html-generator.git"
        }
        bugs = @{
            url = "https://github.com/yourusername/pptxjs-html-generator/issues"
        }
        dependencies = @{
            jszip = "^3.10.1"
        }
        files = @(
            "*.js",
            "*.d.ts",
            "README.md"
        )
        engines = @{
            node = ">=16.0.0"
        }
    }

    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8

    # 9. Commit des changements
    Write-ColorOutput "💾 Commit des changements..." "Yellow"
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploy: Update production build $timestamp"
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Erreur lors du commit" "Red"
        exit 1
    }

    # 10. Push vers main
    Write-ColorOutput "⬆️ Push vers main..." "Yellow"
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Erreur lors du push" "Red"
        exit 1
    }

    # 11. Retour sur dev
    Write-ColorOutput "🔄 Retour sur la branche dev..." "Yellow"
    git checkout dev

    Write-ColorOutput "✅ Déploiement terminé avec succès!" "Green"
    Write-ColorOutput "📦 La branche main contient maintenant le package prêt pour npm" "Green"

} catch {
    Write-ColorOutput "❌ Erreur inattendue: $($_.Exception.Message)" "Red"
    
    # Tentative de retour sur dev en cas d'erreur
    try {
        git checkout dev
        Write-ColorOutput "🔄 Retour sur la branche dev après erreur" "Yellow"
    } catch {
        Write-ColorOutput "⚠️ Impossible de retourner sur dev. Vérifiez manuellement votre branche." "Red"
    }
    
    exit 1
}