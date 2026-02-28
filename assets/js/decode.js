const decodeImageInput = document.getElementById('decodeImageInput');
const decodeCanvas = document.getElementById('decodeCanvas');
const ctx = decodeCanvas.getContext('2d', { willReadFrequently: true });
const decodePreviewContainer = document.getElementById('decodePreviewContainer');
const extractedText = document.getElementById('extractedText');
const decryptionPassword = document.getElementById('decryptionPassword');
const decodeBtn = document.getElementById('decodeBtn');

let isImageLoaded = false;

const generateKey = async (password) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('stego-salt-v1'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

const decryptText = async (encryptedData, password) => {
    try {
        const binaryString = atob(encryptedData);
        const combined = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            combined[i] = binaryString.charCodeAt(i);
        }

        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);
        const key = await generateKey(password);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        throw new Error('Invalid password');
    }
};

decodeImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            decodeCanvas.width = img.width;
            decodeCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            decodePreviewContainer.style.display = 'flex';
            isImageLoaded = true;
            decodeBtn.disabled = false;
            extractedText.value = '';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

decodeBtn.addEventListener('click', async () => {
    if (!isImageLoaded) return;

    const originalBtnContent = decodeBtn.innerHTML;
    decodeBtn.disabled = true;
    decodeBtn.innerHTML = 'Extracting...';
    extractedText.value = '';

    try {
        const imgData = ctx.getImageData(0, 0, decodeCanvas.width, decodeCanvas.height);
        const data = imgData.data;

        let binaryMessage = '';
        let extractedString = '';
        let isNullFound = false;

        for (let i = 0; i < data.length; i++) {
            if ((i + 1) % 4 === 0) continue;

            binaryMessage += (data[i] & 1).toString();

            if (binaryMessage.length === 8) {
                const charCode = parseInt(binaryMessage, 2);
                
                if (charCode === 0) {
                    isNullFound = true;
                    break;
                }

                extractedString += String.fromCharCode(charCode);
                binaryMessage = '';
            }
        }

        if (!isNullFound && extractedString.length === 0) {
            extractedText.value = "No hidden message found or the image format is corrupted.";
            return;
        }

        if (extractedString.startsWith('ENC::')) {
            const password = decryptionPassword.value;
            if (!password) {
                extractedText.value = "Error: This message is password protected. Please enter the decryption password above.";
                return;
            }
            
            const encryptedPayload = extractedString.substring(5);
            const decryptedStr = await decryptText(encryptedPayload, password);
            extractedText.value = decryptedStr;
        } else {
            extractedText.value = extractedString;
        }
    } catch (error) {
        extractedText.value = "Decryption failed: Incorrect password or corrupted image data.";
    } finally {
        decodeBtn.disabled = false;
        decodeBtn.innerHTML = originalBtnContent;
    }
});
