function readFile(file) {
    return new Promise(r => {
        const reader = new FileReader();
        reader.onload = e => r(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 1. PASSPORT MAKER PRO (HD Quality + Optimized Grid)
async function makePassportPhoto() {
    const input = document.getElementById('passInput');
    if (!input.files[0]) return alert("Please upload a photo!");

    const sizeType = document.getElementById('sizeSelect').value;
    const layoutType = document.getElementById('layoutSelect').value;
    const bright = document.getElementById('brightness').value;
    const cont = document.getElementById('contrast').value;
    
    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // High Quality Settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let pw = 413, ph = 531; // Passport
        if (sizeType === "stamp") { pw = 236; ph = 295; }

        if (layoutType === "single") {
            canvas.width = pw; canvas.height = ph;
            ctx.filter = `brightness(${bright}%) contrast(${cont}%)`;
            drawPhoto(ctx, img, 0, 0, pw, ph);
            ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeRect(0, 0, pw, ph);
        } else {
            canvas.width = 2480; canvas.height = 3508; // HD A4
            ctx.fillStyle = "white"; ctx.fillRect(0, 0, 2480, 3508);

            const maxCols = 5; 
            const total = (layoutType === "a4_8") ? 8 : 25;
            const gap = 60; const startX = 180; const startY = 180;

            for (let i = 0; i < total; i++) {
                let col = i % maxCols; 
                let row = Math.floor(i / maxCols);
                const x = startX + (col * (pw + gap));
                const y = startY + (row * (ph + gap));
                
                ctx.save();
                ctx.filter = `brightness(${bright}%) contrast(${cont}%)`;
                drawPhoto(ctx, img, x, y, pw, ph);
                ctx.restore();

                // Professional Cutting Border
                ctx.strokeStyle = "#000000"; ctx.lineWidth = 4;
                ctx.strokeRect(x, y, pw, ph);
            }
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 1.0);
        a.download = `DasDigital_Studio_Print.jpg`; a.click();
    };
}

function drawPhoto(ctx, img, x, y, w, h) {
    const r = Math.max(w/img.width, h/img.height);
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.drawImage(img, x+(w-img.width*r)/2, y+(h-img.height*r)/2, img.width*r, img.height*r);
    ctx.restore();
}

// 2. SMART KB RESIZER
async function resizeImgWithKB() {
    const input = document.getElementById('resizeInput');
    const targetKB = document.getElementById('targetKB').value;
    if (!input.files[0] || !targetKB) return alert("Details bhariye!");
    const data = await readFile(input.files[0]);
    const img = new Image(); img.src = data;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const result = canvas.toDataURL('image/jpeg', 0.5); 
        const a = document.createElement('a');
        a.href = result; a.download = `Resized_${targetKB}KB.jpg`; a.click();
    };
}

// 3. PRO PDF
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Select Photos!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    for (let i = 0; i < input.files.length; i++) {
        const data = await readFile(input.files[i]);
        const img = new Image(); img.src = data;
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
    doc.save("DasDigital_Scan.pdf");
}
