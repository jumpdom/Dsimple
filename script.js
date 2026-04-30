/**
 * DASDIGITAL - Official Utility Script
 * Includes: Image to PDF, AI Background Remover, Image Resizer
 */

// --- 1. IMAGE TO PDF (Mobile Screenshot Friendly) ---
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) return alert("Pehle photos select karein!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const data = await readFile(file);
        const img = new Image();
        img.src = data;

        await new Promise(resolve => {
            img.onload = () => {
                if (i > 0) doc.addPage();
                
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Screenshot ka ratio bigadne se rokne ke liye logic
                const ratio = img.width / img.height;
                let imgWidth = pageWidth - 20; 
                let imgHeight = imgWidth / ratio;

                if (imgHeight > pageHeight - 20) {
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * ratio;
                }

                // Image ko page ke beech mein center karna
                const xOffset = (pageWidth - imgWidth) / 2;
                doc.addImage(data, 'JPEG', xOffset, 10, imgWidth, imgHeight);
                resolve();
            };
        });
    }
    doc.save("DasDigital_Converted.pdf");
}

// --- 2. AI BACKGROUND REMOVER (Stable & Cloud-Ready) ---
async function removeBG() {
    const input = document.getElementById('bgInput');
    const btn = document.getElementById('bgBtn');
    
    if (input.files.length === 0) return alert("Pehle photo upload karein!");

    btn.innerText = "AI Processing... (Wait 10-15s)";
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");

    try {
        const imageFile = input.files[0];

        // Configuration taaki GitHub Pages par files mil sakein
        const config = {
            publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@latest/dist/",
            debug: true,
            device: 'cpu' // Mobile par stable rehne ke liye
        };

        const blob = await imglyRemoveBackground(imageFile, config);
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "DasDigital_NoBG.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        btn.innerText = "Done! Downloaded";
    } catch (error) {
        console.error("AI Error:", error);
        alert("Pehli baar AI model download hone mein net slow hone ki wajah se error aa sakta hai. Ek baar Page Refresh karke dobara try karein.");
    } finally {
        setTimeout(() => {
            btn.innerText = "Remove BG";
            btn.disabled = false;
            btn.classList.remove("opacity-50", "cursor-not-allowed");
        }, 3000);
    }
}

// --- 3. IMAGE RESIZER (50% Compression) ---
async function resizeImg() {
    const input = document.getElementById('resizeInput');
    if (input.files.length === 0) return alert("Photo select karein!");

    const data = await readFile(input.files[0]);
    const img = new Image();
    img.src = data;

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Quality maintain karke size aadha karna
        canvas.width = img.width / 2;
        canvas.height = img.height / 2;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
        a.download = "DasDigital_Resized.jpg";
        a.click();
    };
}

// Helper: File ko readable format mein badalna
function readFile(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}
