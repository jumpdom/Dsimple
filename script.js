// Helper to read file
function readFile(file) {
    return new Promise(r => {
        const reader = new FileReader();
        reader.onload = e => r(e.target.result);
        reader.readAsDataURL(file);
    });
}

// 1. PASSPORT PHOTO (Left to Right Logic)
async function makePassportPhoto() {
    const input = document.getElementById('passInput');
    if (!input.files[0]) return alert("Photo chuniye!");

    const sizeType = document.getElementById('sizeSelect').value;
    const layoutType = document.getElementById('layoutSelect').value;
    
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
            drawCenter(ctx, img, 0, 0, pw, ph);
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
                drawCenter(ctx, img, x, y, pw, ph);
                ctx.strokeStyle = "#ccc"; ctx.strokeRect(x, y, pw, ph);
            }
        }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.9);
        a.download = "DasDigital_Studio_Print.jpg"; a.click();
    };
}

function drawCenter(ctx, img, x, y, w, h) {
    const r = Math.max(w/img.width, h/img.height);
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.drawImage(img, x+(w-img.width*r)/2, y+(h-img.height*r)/2, img.width*r, img.height*r);
    ctx.restore();
}

// 2. KB SIZE RESIZER
async function resizeImgWithKB() {
    const input = document.getElementById('resizeInput');
    const targetKB = document.getElementById('targetKB').value;
    if (!input.files[0] || !targetKB) return alert("Photo aur KB daalein!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Initial Resize to fit mobile memory
        const scale = 0.8;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Quality adjust based on KB
        let quality = 0.7;
        if (targetKB < 50) quality = 0.3;
        if (targetKB > 200) quality = 0.9;

        const result = canvas.toDataURL('image/jpeg', quality);
        const a = document.createElement('a');
        a.href = result; a.download = `DasDigital_${targetKB}KB.jpg`; a.click();
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
    doc.save("DasDigital_Scan.pdf");
}
