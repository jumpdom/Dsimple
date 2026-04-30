async function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(async function makePassportPhoto() {
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

        let pw = 413, ph = 531; // Passport Size
        if (sizeType === "stamp") { pw = 236; ph = 295; }

        if (layoutType === "single") {
            canvas.width = pw; canvas.height = ph;
            drawCenter(ctx, img, 0, 0, pw, ph);
        } else {
            // A4 Canvas (Standard Print Size)
            canvas.width = 2480; 
            canvas.height = 3508;
            ctx.fillStyle = "white"; 
            ctx.fillRect(0, 0, 2480, 3508);

            // Left to Right Logic
            let maxCols = 5; // Ek line mein 5 photos
            let totalPhotos = (layoutType === "a4_8") ? 8 : 25;
            
            const startX = 150; // Left margin
            const startY = 150; // Top margin
            const gapX = 50;    // Photos ke beech ka gap (Left-Right)
            const gapY = 70;    // Photos ke beech ka gap (Up-Down)

            for (let i = 0; i < totalPhotos; i++) {
                // Ye line decide karti hai ki photo kaunse column aur row mein jayegi
                let col = i % maxCols; // 0, 1, 2, 3, 4
                let row = Math.floor(i / maxCols); // 0, 0, 0, 0, 0 phir 1, 1...

                const x = startX + (col * (pw + gapX));
                const y = startY + (row * (ph + gapY));

                drawCenter(ctx, img, x, y, pw, ph);
                
                // Cutting ke liye halki border
                ctx.strokeStyle = "#e0e0e0";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, pw, ph);
            }
        }
        downloadCanvas(canvas, "DasDigital_Print_Ready.jpg");
    };
}

}

// --- 1. FIXED PASSPORT LOGIC ---

function drawCenter(ctx, img, x, y, w, h) {
    const r = Math.max(w/img.width, h/img.height);
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.drawImage(img, x+(w-img.width*r)/2, y+(h-img.height*r)/2, img.width*r, img.height*r);
    ctx.restore();
}

// --- 2. NEW RESIZER WITH KB CONTROL ---
async function resizeImgWithKB() {
    const input = document.getElementById('resizeInput');
    const targetKB = document.getElementById('targetKB').value;
    if (!input.files[0] || !targetKB) return alert("Photo aur Target KB daalein!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Quality adjustment logic
        let quality = 0.9;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let result = canvas.toDataURL('image/jpeg', quality);
        let sizeInKB = Math.round((result.length * 3/4) / 1024);

        // Agar size bada hai toh quality aur pixels kam karo
        if (sizeInKB > targetKB) {
            canvas.width = img.width * 0.7; 
            canvas.height = img.height * 0.7;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            quality = 0.5; // Kam quality
            result = canvas.toDataURL('image/jpeg', quality);
        }

        const a = document.createElement('a');
        a.href = result;
        a.download = `Resized_${targetKB}KB_DasDigital.jpg`;
        a.click();
    };
}

function downloadCanvas(canvas, name) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', 0.9);
    a.download = name;
    a.click();
}
