# PixelVault 🔐

**PixelVault** is a secure, 100% client-side web application that allows users to hide and encrypt secret text messages inside PNG images using advanced Least Significant Bit (LSB) steganography and military-grade AES-256 encryption.

**[Live Demo](https://pixelvault-io.vercel.app/)**

## ✨ Features

* **LSB Steganography:** Hides text data within the least significant bits of an image's pixel colors, leaving the image visually unaltered.
* **Military-Grade Encryption:** Integrates the native Web Crypto API to wrap text in AES-GCM 256-bit encryption before embedding.
* **100% Client-Side:** Built using the HTML5 Canvas API. Zero server uploads. Your images, messages, and passwords never leave your browser.
* **System-Aware Dark Mode:** Automatically adapts to your OS theme preferences with a manual toggle.
* **Fully SEO Optimized:** Includes JSON-LD Schema markup, Open Graph tags, and structured data for maximum visibility.
* **Responsive UI:** Modern, lightweight interface optimized for desktop, tablet, and mobile devices.

## 🚀 How It Works

### Encoding (Hiding a Message)
1. Select a source image (JPEG or PNG).
2. Enter the secret message you wish to hide.
3. *(Optional)* Enter a password to encrypt the message using AES-256.
4. Click "Encode" to process and download the new `.png` file containing your hidden data.

### Decoding (Extracting a Message)
1. Upload a previously encoded `.png` image.
2. If the message was encrypted, enter the correct decryption password.
3. Click "Extract Message" to decrypt and reveal the hidden text.

*Note: The encoded image must be saved and shared as a lossless `.png`. Sending via messaging apps that compress images (like WhatsApp) or converting to `.jpeg` will apply lossy compression and permanently destroy the hidden data.*

## 🛠️ Technology Stack

* **Frontend Core:** HTML5, CSS3, Vanilla JavaScript
* **Browser APIs:** HTML5 Canvas API, Web Crypto API, FileReader API
* **Deployment:** Vercel

## 👨‍💻 About the Developer

Engineered and maintained by **Dippan Bhusal**, a Full-Stack Web Developer dedicated to building secure, performant, and accessible utilities for the modern web.

* **Portfolio:** [dippanbhusal.tech](https://dippanbhusal.tech)
* **GitHub:** [@kdippan](https://github.com/kdippan)
* **LinkedIn:** [Dippan Bhusal](https://linkedin.com/in/dippan-bhusal)
* **Twitter / X:** [@dippanbhusal](https://x.com/dippanbhusal)

## ☕ Support the Project

If you found this tool helpful or use it regularly, consider supporting the development and server costs:

<a href="https://buymeacoffee.com/dippanbhusal" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>

## 📄 License

This project is open-source and available under the MIT License.
