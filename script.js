// Utility: File to DataURL
const readFile = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
});

// --- 1. IMAGE TO PDF ---
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (!input.files.length) return alert("Select images!");
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    for (let i = 0; i < input.files.length; i++) {
        const data = await readFile(input.files[i]);
        if (i > 0) doc.addPage();
        doc.addImage(data, 'JPEG', 10, 10, 190, 0);
    }
    doc.save("DasDigital_Doc.pdf");
}

// --- 2. SMART KB RESIZER ---
async function resizeKB() {
    const file = document.getElementById('resizeInput').files[0];
    const target = parseInt(document.getElementById('targetKB').value);
    if (!file || !target) return alert("File & KB required!");

    const data = await readFile(file);
    const img = new Image();
    img.src = data;

    img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let scale = 1;
        let finalData = "";

        // Try different scales and qualities to hit target KB
        for (let s = 0; s < 4; s++) {
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            for (let q = 0.95; q > 0.1; q -= 0.1) {
                finalData = canvas.toDataURL("image/jpeg", q);
                let size = (finalData.length * 3) / 4 / 1024;
                if (size <= target && size > target * 0.8) break;
            }
            scale += 0.5;
        }

        const link = document.createElement('a');
        link.href = finalData;
        link.download = `Resized_${target}KB.jpg`;
        link.click();
    };
}

// --- 3. PASSPORT STUDIO (FIXED) ---
async function makePassportHD() {
    const file = document.getElementById('passInput').files[0];
    const qty = parseInt(document.getElementById('photoQty').value) || 1;
    const sizeType = document.getElementById('sizeSelect').value;
    const btn = document.getElementById('passBtn');

    if (!file) return alert("Please select a photo first!");

    btn.innerText = "PROCESSING...";
    btn.disabled = true;

    try {
        const data = await readFile(file);
        const img = new Image();
        img.src = data;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let pw = 413, ph = 531; // Passport Size in px (300 DPI)
            if (sizeType === "stamp") { pw = 236; ph = 295; }

            if (qty === 1) {
                canvas.width = pw; canvas.height = ph;
                drawPhoto(ctx, img, 0, 0, pw, ph);
                ctx.strokeStyle = "black"; ctx.lineWidth = 2; ctx.strokeRect(0,0,pw,ph);
            } else {
                canvas.width = 2480; canvas.height = 3508; // A4 Sheet
                ctx.fillStyle = "white"; ctx.fillRect(0, 0, 2480, 3508);
                
                let cols = 5;
                let gap = 50;
                let startX = 100, startY = 100;

                for (let i = 0; i < qty; i++) {
                    let r = Math.floor(i / cols);
                    let c = i % cols;
                    let x = startX + (c * (pw + gap));
                    let y = startY + (r * (ph + gap));
                    drawPhoto(ctx, img, x, y, pw, ph);
                    ctx.strokeStyle = "black"; ctx.lineWidth = 2; ctx.strokeRect(x, y, pw, ph);
                }
            }

            const link = document.createElement('a');
            link.href = canvas.toDataURL("image/jpeg", 1.0);
            link.download = "DasDigital_Passport.jpg";
            link.click();
            
            btn.innerText = "DOWNLOAD STUDIO PRINT";
            btn.disabled = false;
        };
    } catch (err) {
        alert("Error: " + err);
        btn.disabled = false;
    }
}

function drawPhoto(ctx, img, x, y, w, h) {
    const ratio = Math.max(w / img.width, h / img.height);
    const sw = img.width * ratio;
    const sh = img.height * ratio;
    const sx = x + (w - sw) / 2;
    const sy = y + (h - sh) / 2;
    
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.restore();
}
