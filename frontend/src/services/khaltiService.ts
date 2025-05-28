// Khalti payment integration for frontend (sandbox mode)
// Usage: Import and use the payWithKhalti function in your React component

export function payWithKhalti({amount, productIdentity, productName, productUrl, onSuccess, onError, onClose}) {
    if (!window.KhaltiCheckout) {
        alert('KhaltiCheckout script not loaded!');
        return;
    }
    const config = {
        publicKey: 'test_public_key_dc74b7b3a6e34b7c8e1e5b7e3e3e3e3e', // Replace with your Khalti test public key
        productIdentity: productIdentity || '1234567890',
        productName: productName || 'Test Product',
        productUrl: productUrl || 'http://localhost:3000/product',
        eventHandler: {
            onSuccess: onSuccess || function(payload) { console.log('Khalti Success', payload); },
            onError: onError || function(error) { console.error('Khalti Error', error); },
            onClose: onClose || function() { console.log('Khalti widget closed'); }
        }
    };
    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: amount }); // amount in paisa
}
