// High-Resolution File Reader
function readFile(file) {
    return new Promise(r => {
        const reader = new FileReader();
        reader.onload = e => r(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 1. SMART KB RESIZER (Fixed Logic)
async function resizeKB() {
    const input = document.getElementById('resizeInput');
    const targetKB = parseInt(document.getElementById('targetKB').value);
    
    if(!input.files[0] || !targetKB) return alert("Photo aur Target KB bhariye!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = async function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Quality maintain karne ke liye original dimensions use karenge
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let low = 0.1;
        let high = 1.0;
        let bestResult = null;
        let iterations = 0;

        // Binary Search logic taaki exact target KB ke paas pahunche
        while (iterations < 10) {
            let mid = (low + high) / 2;
            let dataUrl = canvas.toDataURL('image/jpeg', mid);
            let sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);

            if (sizeKB <= targetKB) {
                bestResult = dataUrl;
                low = mid; // Quality badhao
            } else {
                high = mid; // Quality kam karo
            }
            iterations++;
        }

        if (!bestResult) bestResult = canvas.toDataURL('image/jpeg', 0.1);

        const link = document.createElement('a');
        link.href = bestResult;
        link.download = `DasDigital_${targetKB}KB_Result.jpg`;
        link.click();
    };
}

// 2. IMAGE TO PDF
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Photos select karein!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < input.files.length; i++) {
        const data = await readFile(input.files[i]);
        if (i > 0) doc.addPage();
        doc.addImage(data, 'JPEG', 10, 10, 190, 0);
    }
    doc.save("DasDigital_Scan.pdf");
}

// 3. HD PASSPORT STUDIO
async function makePassportHD() {
    const input = document.getElementById('passInput');
    if (!input.files[0]) return alert("Photo choose karein!");
    const sizeType = document.getElementById('sizeSelect').value;
    const layoutType = document.getElementById('layoutSelect').value;
    const data = await readFile(input.files[0]);
    const img = new Image(); img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        let pw = 413, ph = 531; 
        if (sizeType === "stamp") { pw = 236; ph = 295; }

        if (layoutType === "single") {
            canvas.width = pw; canvas.height = ph;
            drawSmart(ctx, img, 0, 0, pw, ph);
            ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeRect(0,0,pw,ph);
        } else {
            canvas.width = 2480; canvas.height = 3508; 
            ctx.fillStyle = "white"; ctx.fillRect(0,0,2480,3508);
            const total = (layoutType === "a4_8") ? 8 : 24;
            const maxCols = 4, gapX = 100, gapY = 120, startX = 250, startY = 250;
            for (let i = 0; i < total; i++) {
                let col = i % maxCols, row = Math.floor(i / maxCols);
                const x = startX + (col * (pw + gapX)), y = startY + (row * (ph + gapY));
                drawSmart(ctx, img, x, y, pw, ph);
                ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeRect(x, y, pw, ph);
            }
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 1.0);
        a.download = `DasDigital_Studio_HD.jpg`; a.click();
    };
}

function drawSmart(ctx, img, x, y, w, h) {
    const ratio = Math.max(w / img.width, h / img.height);
    const shiftX = (w - img.width * ratio) / 2, shiftY = (h - img.height * ratio) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height, x + shiftX, y + shiftY, img.width * ratio, img.height * ratio);
    ctx.restore();
}
