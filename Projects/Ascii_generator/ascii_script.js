const ASCII_CHARS = ".:-=+*#%@░▒▓█";

// Handle Theme Switching
document.getElementById('themeSelect').addEventListener('change', function() {
    document.body.className = this.value === 'light' ? 'light-mode' : '';
});

function generateArt() {
    const fileInput = document.getElementById('imageInput');
    const widthInput = document.getElementById('widthInput');
    const colorToggle = document.getElementById('colorToggle');
    const themeSelect = document.getElementById('themeSelect');
    const output = document.getElementById('ascii-output');

    if (!fileInput.files[0]) {
        alert("Please select an image first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 1. Resize logic
            const maxWidth = 1080;
            let targetWidth = Math.min(parseInt(widthInput.value), maxWidth);
            const ratio = img.height / img.width;
            const targetHeight = Math.floor(targetWidth * ratio * 0.55);

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // 2. Image Enhancements
            // contrast(1.3) + saturate(1.6)
            ctx.filter = 'contrast(130%) saturate(160%) brightness(110%)';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
            const mode = themeSelect.value;
            const chars = mode === "light" ? [...ASCII_CHARS].reverse().join("") : ASCII_CHARS;
            const useColor = colorToggle.checked;

            let asciiStr = "";

            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const offset = (y * targetWidth + x) * 4;
                    const r = imageData[offset];
                    const g = imageData[offset + 1];
                    const b = imageData[offset + 2];

                    // 3. Gray scale & Gamma Correction
                    let gray = (0.299 * r + 0.587 * g + 0.114 * b);
                    gray = Math.pow(gray / 255, 0.8) * 255;

                    const charIndex = Math.floor((gray / 256) * chars.length);
                    const char = chars[charIndex];

                    if (useColor) {
                        asciiStr += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
                    } else {
                        asciiStr += char;
                    }
                }
                asciiStr += "\n";
            }
            output.innerHTML = asciiStr;
            output.style.display = "block";
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
}