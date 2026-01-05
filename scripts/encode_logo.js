const fs = require('fs');
const path = require('path');

const logoPath = path.join(process.cwd(), 'public', 'images', 'Logo-NoBG-rogné.png');

try {
    const imageBuffer = fs.readFileSync(logoPath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('Logo encodé en base64 (premiers 100 caractères):', dataUrl.substring(0, 100) + '...');
    console.log('\nTaille totale:', (dataUrl.length / 1024).toFixed(2), 'KB');
    console.log('\nPour utiliser dans le code, copiez cette ligne:');
    console.log('const logoBase64 = "' + dataUrl.substring(0, 200) + '...";');
    
    // Sauvegarder dans un fichier pour faciliter la copie
    fs.writeFileSync(
        path.join(process.cwd(), 'scripts', 'logo_base64.txt'),
        dataUrl
    );
    console.log('\n✓ Logo encodé sauvegardé dans scripts/logo_base64.txt');
} catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
}
