const { auth } = require('./src/lib/auth');

async function triggerVerification() {
    try {
        const userEmail = 'theo.mcl.pro@gmail.com';
        console.log(`Tentative d'envoi d'email de vérification à ${userEmail}...`);
        
        // On utilise l'API interne de Better Auth pour générer et envoyer l'email
        const result = await auth.api.sendVerificationEmail({
            body: {
                email: userEmail,
                callbackURL: 'http://localhost:3000/compte'
            }
        });
        
        console.log('Résultat:', result);
    } catch (error) {
        console.error('Erreur détaillée:', error);
    }
}

triggerVerification();
