// --- 1. IMAGE TO PDF LOGIC (Professional Scaling) ---
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Select Images!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const data = await readFile(file);
        const img = new Image();
        img.src = data;

        await new Promise(r => img.onload = () => {
            if (i > 0) doc.addPage();
            const pw = doc.internal.pageSize.getWidth();
            const ph = doc.internal.pageSize.getHeight();
            const ratio = img.width / img.height;
            let w = pw - 20;
            let h = w / ratio;
            if (h > ph - 20) { h = ph - 20; w = h * ratio; }
            doc.addImage(data, 'JPEG', 10, 10, w, h);
            r();
        });
    }
    doc.save("DasDigital_Document.pdf");
}

// --- 2. AI BACKGROUND REMOVER LOGIC ---
async function removeBG() {
    const input = document.getElementById('bgInput');
    const btn = document.getElementById('bgBtn');
    if (input.files.length === 0) return alert("Select Photo!");

    btn.innerText = "AI Processing...";
    btn.disabled = true;

    try {
        const blob = await imglyRemoveBackground(input.files[0]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = "No_BG_DasDigital.png";
        a.click();
    } catch (e) { alert("Error in AI processing"); }
    btn.innerText = "Remove BG"; btn.disabled = false;
}

// --- 3. IMAGE RESIZER LOGIC ---
async function resizeImg() {
    const input = document.getElementById('resizeInput');
    if (input.files.length === 0) return alert("Select Photo!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width / 2; // Resize to 50%
        canvas.height = img.height / 2;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement('a');
        a.href = canvas.toDataURL(); a.download = "Resized_DasDigital.png";
        a.click();
    };
}

function readFile(file) {
    return new Promise(r => {
        const rd = new FileReader();
        rd.onload = e => r(e.target.result);
        rd.readAsDataURL(file);
    });
}
