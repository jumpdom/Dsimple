// Helper: File reader
function readFile(file) {
    return new Promise(r => {
        const reader = new FileReader();
        reader.onload = e => r(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 1. IMAGE TO PDF
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Select Images!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    for (let i = 0; i < input.files.length; i++) {
        const data = await readFile(input.files[i]);
        const img = new Image();
        img.src = data;
        await new Promise(r => img.onload = () => {
            if (i > 0) doc.addPage();
            const pw = doc.internal.pageSize.getWidth();
            const ph = doc.internal.pageSize.getHeight();
            const ratio = img.width / img.height;
            let w = pw - 20; let h = w / ratio;
            if (h > ph - 20) { h = ph - 20; w = h * ratio; }
            doc.addImage(data, 'JPEG', (pw-w)/2, 10, w, h);
            r();
        });
    }
    doc.save("DasDigital_Document.pdf");
}

// 2. PASSPORT SIZE MAKER (Single + A4 Layout)
async function makePassportPhoto() {
    const input = document.getElementById('passInput');
    const sizeType = document.getElementById('sizeSelect').value;
    const layoutType = document.getElementById('layoutSelect').value;

    if (input.files.length === 0) return alert("Select a Photo!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Sizes in pixels (300 DPI)
        let pWidth = 413; let pHeight = 531; // Passport
        if (sizeType === "stamp") { pWidth = 236; pHeight = 295; }
        if (sizeType === "visa") { pWidth = 600; pHeight = 600; }

        if (layoutType === "single") {
            canvas.width = pWidth; canvas.height = pHeight;
            drawPhoto(ctx, img, 0, 0, pWidth, pHeight);
        } else {
            canvas.width = 2480; canvas.height = 3508; // A4 size
            ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            let rows = 4, cols = 2;
            if (layoutType === "a4_24") { rows = 6; cols = 4; }
            const gap = 60; const startX = 180; const startY = 180;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = startX + (c * (pWidth + gap));
                    const y = startY + (r * (pHeight + gap));
                    drawPhoto(ctx, img, x, y, pWidth, pHeight);
                    ctx.strokeStyle = "#ddd"; ctx.strokeRect(x, y, pWidth, pHeight);
                }
            }
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.95);
        a.download = `DasDigital_Passport_${layoutType}.jpg`;
        a.click();
    };
}

// Helper to draw centered photo
function drawPhoto(ctx, img, x, y, w, h) {
    const ratio = Math.max(w / img.width, h / img.height);
    const sw = img.width * ratio; const sh = img.height * ratio;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
    ctx.restore();
}

// 3. IMAGE RESIZER
async function resizeImg() {
    const input = document.getElementById('resizeInput');
    if (input.files.length === 0) return alert("Select Photo!");
    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * 0.7; canvas.height = img.height * 0.7; // 30% reduction
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.8);
        a.download = "DasDigital_Resized.jpg"; a.click();
    };
}
