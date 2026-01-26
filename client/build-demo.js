const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Configuration du build pour la démonstration
const buildOptions = {
  entryPoints: ['src/demo-entry.ts'],
  bundle: true,
  outfile: 'public/demo-bundle.js',
  minify: false,  // Pas de minification pour le débogage
  sourcemap: true,
  platform: 'browser',
  target: 'es6',
  format: 'esm',  // Format ES Module pour les imports
  loader: {
    '.ts': 'ts',
    '.js': 'js',
  },
};

// Exécuter le build
esbuild.build(buildOptions)
  .then(() => {
    console.log('✅ Build de démonstration terminé avec succès !');
    console.log('📁 Fichier généré: public/demo-bundle.js');
    
    // Afficher la taille du fichier
    const stats = fs.statSync(path.join(__dirname, 'public', 'demo-bundle.js'));
    console.log(`📊 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
  })
  .catch((error) => {
    console.error('❌ Erreur lors du build de démonstration:', error);
    process.exit(1);
  });