import CryptoJS from 'crypto-js';

const secretKey = process.env.NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY;

if (!secretKey) {
    throw new Error("NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY is not defined in .env");
}

/**
 * Encrypts a string using AES.
 * @param text The plaintext string to encrypt.
 * @returns The Base64-encoded ciphertext.
 */
export const encryptData = (text: string): string => {
    const ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
    return ciphertext;
};

/**
 * Decrypts a string using AES.
 * @param ciphertext The Base64-encoded ciphertext to decrypt.
 * @returns The original plaintext string.
 */
export const decryptData = (ciphertext: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    } catch (error) {
        console.error("Decryption failed:", error);
        return "";
    }
};