// Helper: File reader
function readFile(file) {
    return new Promise(r => {
        const reader = new FileReader();
        reader.onload = e => r(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 1. PASSPORT PHOTO (Filters + Border + Left-to-Right)
async function makePassportPhoto() {
    const input = document.getElementById('passInput');
    if (!input.files[0]) return alert("Photo chuniye!");

    const sizeType = document.getElementById('sizeSelect').value;
    const layoutType = document.getElementById('layoutSelect').value;
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    
    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let pw = 413, ph = 531; 
        if (sizeType === "stamp") { pw = 236; ph = 295; }

        if (layoutType === "single") {
            canvas.width = pw; canvas.height = ph;
            applyFilters(ctx, brightness, contrast);
            drawCenter(ctx, img, 0, 0, pw, ph);
            // Single photo border
            ctx.strokeStyle = "black"; ctx.lineWidth = 2; ctx.strokeRect(0, 0, pw, ph);
        } else {
            canvas.width = 2480; canvas.height = 3508; // A4
            ctx.fillStyle = "white"; ctx.fillRect(0, 0, 2480, 3508);

            const maxCols = 5; 
            const total = (layoutType === "a4_8") ? 8 : 25;
            const gap = 60; const startX = 150; const startY = 150;

            for (let i = 0; i < total; i++) {
                let col = i % maxCols; 
                let row = Math.floor(i / maxCols);
                const x = startX + (col * (pw + gap));
                const y = startY + (row * (ph + gap));
                
                ctx.save();
                applyFilters(ctx, brightness, contrast);
                drawCenter(ctx, img, x, y, pw, ph);
                ctx.restore();

                // Professional Black Border for cutting
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, pw, ph);
            }
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.95);
        a.download = `DasDigital_Studio_Print.jpg`; a.click();
    };
}

function applyFilters(ctx, b, c) {
    ctx.filter = `brightness(${b}%) contrast(${c}%)`;
}

function drawCenter(ctx, img, x, y, w, h) {
    const r = Math.max(w/img.width, h/img.height);
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.drawImage(img, x+(w-img.width*r)/2, y+(h-img.height*r)/2, img.width*r, img.height*r);
    ctx.restore();
}

// 2. KB RESIZER
async function resizeImgWithKB() {
    const input = document.getElementById('resizeInput');
    const targetKB = document.getElementById('targetKB').value;
    if (!input.files[0] || !targetKB) return alert("Details bhariye!");
    const data = await readFile(input.files[0]);
    const img = new Image(); img.src = data;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width * 0.7; canvas.height = img.height * 0.7;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.5); a.download = "Resized.jpg"; a.click();
    };
}

// 3. IMAGE TO PDF
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Select Photos!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
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
    doc.save("DasDigital_Document.pdf");
}
