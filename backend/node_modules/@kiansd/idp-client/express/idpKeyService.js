export async function getPublicKeyFromIdp(idpUrl) {
    try {
        const response = await fetch(`${idpUrl}/public-key`);
        if (!response.ok) {
            throw new Error(`Failed to fetch public key: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched public key from IdP:', data);
        return data;
    } catch (error) {
        console.error('Error fetching public key:', error);
        throw error;
    }
}