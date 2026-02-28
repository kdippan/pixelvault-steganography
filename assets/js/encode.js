const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const previewContainer = document.getElementById('previewContainer');
const secretText = document.getElementById('secretText');
const encryptionPassword = document.getElementById('encryptionPassword');
const capacityIndicator = document.getElementById('capacityIndicator');
const encodeBtn = document.getElementById('encodeBtn');

let maxCapacity = 0;
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

const encryptText = async (text, password) => {
    if (!password) return text;
    
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);
    const key = await generateKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedText
    );
    
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    const base64Str = btoa(String.fromCharCode.apply(null, combined));
    return `ENC::${base64Str}`;
};

const textToBinary = (text) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += bytes[i].toString(2).padStart(8, '0');
    }
    return binary;
};

const updateCapacity = () => {
    if (!isImageLoaded) return;
    
    const pixelCount = canvas.width * canvas.height;
    const totalBits = pixelCount * 3; 
    maxCapacity = Math.floor(totalBits / 8) - 1; 
    
    const currentLength = secretText.value.length;
    capacityIndicator.textContent = `${currentLength} / ${maxCapacity} characters (approx)`;
    
    if (currentLength > 0 && currentLength <= maxCapacity && isImageLoaded) {
        encodeBtn.disabled = false;
        capacityIndicator.style.color = 'var(--text-muted)';
    } else {
        encodeBtn.disabled = true;
        if (currentLength > maxCapacity) {
            capacityIndicator.style.color = '#ef4444';
        }
    }
};

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            previewContainer.style.display = 'flex';
            isImageLoaded = true;
            updateCapacity();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

secretText.addEventListener('input', updateCapacity);

encodeBtn.addEventListener('click', async () => {
    if (!isImageLoaded || secretText.value.length === 0) return;

    const originalBtnContent = encodeBtn.innerHTML;
    encodeBtn.disabled = true;
    encodeBtn.innerHTML = 'Processing & Encoding...';

    try {
        const rawText = secretText.value;
        const password = encryptionPassword.value;
        
        const processedText = await encryptText(rawText, password);
        const messageToHide = processedText + '\0';
        const binaryMessage = textToBinary(messageToHide);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        let bitIndex = 0;
        
        for (let i = 0; i < data.length; i++) {
            if ((i + 1) % 4 === 0) continue;
            
            if (bitIndex < binaryMessage.length) {
                data[i] = (data[i] & 254) | parseInt(binaryMessage[bitIndex]);
                bitIndex++;
            } else {
                break;
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        
        const link = document.createElement('a');
        link.download = `pixelvault_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        secretText.value = '';
        encryptionPassword.value = '';
        updateCapacity();
    } catch (error) {
        alert('An error occurred during encryption. Please try again.');
    } finally {
        encodeBtn.disabled = false;
        encodeBtn.innerHTML = originalBtnContent;
    }
});
