#!/bin/bash

echo "🧪 Test du build final"

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
  echo "❌ Le dossier dist n'existe pas"
  exit 1
fi

# Vérifier que le bundle existe
if [ ! -f "dist/bundle.js" ]; then
  echo "❌ Le fichier bundle.js n'existe pas"
  exit 1
fi

# Vérifier que le HTML existe
if [ ! -f "dist/index.html" ]; then
  echo "❌ Le fichier index.html n'existe pas"
  exit 1
fi

# Afficher les informations sur le build
echo "✅ Build vérifié avec succès !"
echo ""
echo "📊 Informations sur le build :"
ls -lh dist/bundle.js
echo ""
echo "📁 Contenu du dossier dist :"
ls -lh dist/
echo ""
echo "🚀 Pour tester l'application :"
echo "1. npm run start"
echo "2. Ouvrir http://localhost:8080 dans un navigateur"
echo ""
echo "🎉 Build prêt pour le déploiement !"