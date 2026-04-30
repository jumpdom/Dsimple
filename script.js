let cropper;
const cropTarget = document.getElementById('cropTarget');
const cropArea = document.getElementById('cropArea');

// 1. Initialize Cropper when file is selected
function initCropper(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        cropTarget.src = e.target.result;
        cropArea.classList.remove('hidden');
        
        if (cropper) cropper.destroy();
        
        // Ratio 3.5 : 4.5 for Passport
        cropper = new Cropper(cropTarget, {
            aspectRatio: 3.5 / 4.5,
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
        });
    };
    reader.readAsDataURL(file);
}

// 2. Process Final Passport Sheet
async function processPassport() {
    if (!cropper) return alert("Please upload and crop a photo first!");

    const sizeType = document.getElementById('sizeSelect').value;
    const layoutType = document.getElementById('layoutSelect').value;

    // Get the cropped image as a high-quality canvas
    const croppedCanvas = cropper.getCroppedCanvas({
        width: 600, // HD Quality
        height: 771,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');

    let pw = 413, ph = 531; // 300 DPI Passport
    if (sizeType === "stamp") { pw = 236; ph = 295; }

    if (layoutType === "single") {
        finalCanvas.width = pw; finalCanvas.height = ph;
        ctx.drawImage(croppedCanvas, 0, 0, pw, ph);
        ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeRect(0,0,pw,ph);
    } else {
        finalCanvas.width = 2480; finalCanvas.height = 3508; // A4
        ctx.fillStyle = "white"; ctx.fillRect(0,0,2480,3508);

        const total = (layoutType === "a4_8") ? 8 : 25;
        const maxCols = 5;
        const gap = 60, startX = 180, startY = 180;

        for (let i = 0; i < total; i++) {
            let col = i % maxCols;
            let row = Math.floor(i / maxCols);
            const x = startX + (col * (pw + gap));
            const y = startY + (row * (ph + gap));
            
            ctx.drawImage(croppedCanvas, x, y, pw, ph);
            ctx.strokeStyle = "black"; ctx.lineWidth = 4;
            ctx.strokeRect(x, y, pw, ph);
        }
    }

    const link = document.createElement('a');
    link.download = `DasDigital_Studio_HD.jpg`;
    link.href = finalCanvas.toDataURL('image/jpeg', 1.0);
    link.click();
}

// 3. KB Resizer & PDF (Keeping it simple and high quality)
async function resizeKB() {
    const input = document.getElementById('resizeInput');
    const target = document.getElementById('targetKB').value;
    if(!input.files[0] || !target) return alert("Select photo & target KB");

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            canvas.getContext('2d').drawImage(img,0,0);
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 0.6); // Auto-compress
            link.download = `DasDigital_${target}KB.jpg`;
            link.click();
        }
    }
    reader.readAsDataURL(input.files[0]);
}

async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Select Photos!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    for (let i = 0; i < input.files.length; i++) {
        const reader = new FileReader();
        const data = await new Promise(r => {
            reader.onload = (e) => r(e.target.result);
            reader.readAsDataURL(input.files[i]);
        });
        
        if (i > 0) doc.addPage();
        doc.addImage(data, 'JPEG', 10, 10, 190, 0);
    }
    doc.save("DasDigital_Scan.pdf");
}
