const { Resend } = require('resend');

const resend = new Resend('re_iQUMsdgn_PqYzFPwKvJ9xKMvhZsQrLFFp');

async function testResend() {
    console.log('Testing Resend with VERIFIED domain sender...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'contact@delarys.com',
            to: ['theo.michel2.tm@gmail.com'],
            subject: 'Test Resend Standalone (Verified Domain)',
            html: '<h1>Test Réussi</h1><p>Ceci est un test avec le domaine vérifié delarys.com.</p>'
        });

        if (error) {
            console.error('Resend Error:', error);
        } else {
            console.log('Resend Success:', data);
        }
    } catch (err) {
        console.error('Execution Error:', err);
    }
}

testResend();
