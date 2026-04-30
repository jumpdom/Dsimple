// High-Resolution File Reader
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
    if (input.files.length === 0) return alert("Pehle photos choose karein!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < input.files.length; i++) {
        const data = await readFile(input.files[i]);
        const img = new Image();
        img.src = data;
        await new Promise(resolve => {
            img.onload = () => {
                if (i > 0) doc.addPage();
                const pw = doc.internal.pageSize.getWidth();
                const ph = doc.internal.pageSize.getHeight();
                const ratio = img.width / img.height;
                let w = pw - 20, h = w / ratio;
                if (h > ph - 20) { h = ph - 20; w = h * ratio; }
                doc.addImage(data, 'JPEG', (pw - w) / 2, 10, w, h, undefined, 'FAST');
                resolve();
            };
        });
    }
    doc.save("DasDigital_Document.pdf");
}

// 2. KB RESIZER (The Accurate Version)
async function resizeKB() {
    const input = document.getElementById('resizeInput');
    const targetKB = parseInt(document.getElementById('targetKB').value);
    if(!input.files[0] || !targetKB) return alert("Photo aur KB choose karein!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let bestResult = null;
        let scale = 1;

        // Iterative Logic for Precision
        for (let i = 0; i < 5; i++) {
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            for (let q = 0.95; q >= 0.1; q -= 0.05) {
                let dataUrl = canvas.toDataURL('image/jpeg', q);
                let sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
                if (sizeKB <= targetKB) {
                    bestResult = dataUrl;
                    if (sizeKB > targetKB * 0.92) break; 
                }
            }
            if (bestResult && Math.round((bestResult.length * 3) / 4 / 1024) > targetKB * 0.85) break;
            scale += 0.4;
        }

        const link = document.createElement('a');
        link.href = bestResult || canvas.toDataURL('image/jpeg', 0.1);
        link.download = `DasDigital_${targetKB}KB.jpg`;
        link.click();
    };
}

// 3. HD PASSPORT STUDIO (Manual Quantity Fixed)
async function makePassportHD() {
    const input = document.getElementById('passInput');
    const qty = parseInt(document.getElementById('photoQty').value);
    const sizeType = document.getElementById('sizeSelect').value;

    if (!input.files[0]) return alert("Pehle photo choose karein!");
    if (isNaN(qty) || qty < 1) return alert("Sahi quantity likhein (Min: 1)");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let pw = 413, ph = 531; // 300 DPI Standard Passport
        if (sizeType === "stamp") { pw = 236; ph = 295; }

        if (qty === 1) {
            // Single Photo Download
            canvas.width = pw; canvas.height = ph;
            drawSmart(ctx, img, 0, 0, pw, ph);
            ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeRect(0,0,pw,ph);
        } else {
            // A4 Sheet Logic
            canvas.width = 2480; canvas.height = 3508; 
            ctx.fillStyle = "white"; ctx.fillRect(0,0,2480,3508);

            const maxCols = 5; // A4 Width par 5 passport photos best aati hain
            const gapX = 60, gapY = 80, startX = 150, startY = 150;

            for (let i = 0; i < qty; i++) {
                if (i >= 30) break; // A4 ki capacity limit
                let col = i % maxCols;
                let row = Math.floor(i / maxCols);
                const x = startX + (col * (pw + gapX));
                const y = startY + (row * (ph + gapY));
                
                drawSmart(ctx, img, x, y, pw, ph);
                ctx.strokeStyle = "black"; ctx.lineWidth = 3;
                ctx.strokeRect(x, y, pw, ph);
            }
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 1.0);
        a.download = qty === 1 ? `Passport_HD.jpg` : `Passport_A4_Sheet.jpg`;
        a.click();
    };
}

function drawSmart(ctx, img, x, y, w, h) {
    const ratio = Math.max(w / img.width, h / img.height);
    const shiftX = (w - img.width * ratio) / 2, shiftY = (h - img.height * ratio) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height, x + shiftX, y + shiftY, img.width * ratio, img.height * ratio);
    ctx.restore();
}
