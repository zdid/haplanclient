const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du build avec Vite...');

try {
  // Nettoyer le dossier dist
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  // Créer le dossier dist
  fs.mkdirSync(distPath, { recursive: true });

  // Exécuter Vite build
  console.log('📦 Exécution de Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Copier le fichier HTML depuis public vers dist
  console.log('📄 Copie du fichier HTML...');
  fs.copyFileSync(
    path.join(__dirname, 'public', 'index.html'),
    path.join(__dirname, 'dist', 'index.html')
  );

  // Mettre à jour l'HTML pour inclure le CSS généré
  console.log('🔧 Mise à jour des références CSS/JS dans HTML...');
  let htmlContent = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
  
  // Vérifier si le CSS a été généré dans assets/main.css (comportement par défaut de Vite)
  const mainCssPath = path.join(__dirname, 'dist', 'assets', 'main.css');
  const bundleCssPath = path.join(__dirname, 'dist', 'bundle.css');
  
  let cssPath = null;
  if (fs.existsSync(mainCssPath)) {
    cssPath = mainCssPath;
  } else if (fs.existsSync(bundleCssPath)) {
    cssPath = bundleCssPath;
  }
  
  // Ajouter la référence CSS si elle existe
  if (cssPath) {
    const cssFileName = path.basename(cssPath);
    const cssLink = `<link rel="stylesheet" href="/${path.relative('dist', cssPath)}">`;
    if (!htmlContent.includes(cssLink)) {
      htmlContent = htmlContent.replace(
        '</head>',
        `  ${cssLink}\n</head>`
      );
      console.log(`🎨 CSS trouvé et référencé: /${path.relative('dist', cssPath)}`);
    }
  }
  
  fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), htmlContent);

  console.log('✅ Build terminé avec succès !');
  console.log('📁 Fichiers générés dans dist/');
  
  // Afficher les tailles des fichiers
  const jsStats = fs.statSync(path.join(__dirname, 'dist', 'bundle.js'));
  console.log(`📊 Taille JS: ${(jsStats.size / 1024).toFixed(2)} KB`);
  
  if (fs.existsSync(cssPath)) {
    const cssStats = fs.statSync(cssPath);
    console.log(`🎨 Taille CSS: ${(cssStats.size / 1024).toFixed(2)} KB`);
  }
  
} catch (error) {
  console.error('❌ Erreur lors du build:', error);
  process.exit(1);
}