async function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// --- 1. FIXED PASSPORT LOGIC ---
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

        let pw = 413, ph = 531; // Standard Passport
        if (sizeType === "stamp") { pw = 236; ph = 295; }

        if (layoutType === "single") {
            canvas.width = pw; canvas.height = ph;
            drawCenter(ctx, img, 0, 0, pw, ph);
        } else {
            canvas.width = 2480; canvas.height = 3508; // A4
            ctx.fillStyle = "white"; ctx.fillRect(0,0,2480,3508);
            for(let r=0; r<4; r++) {
                for(let c=0; c<2; c++) {
                    const x = 200 + (c * (pw + 100));
                    const y = 200 + (r * (ph + 100));
                    drawCenter(ctx, img, x, y, pw, ph);
                    ctx.strokeStyle = "#ccc"; ctx.strokeRect(x,y,pw,ph);
                }
            }
        }
        downloadCanvas(canvas, "Passport_DasDigital.jpg");
    };
}

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
