// Image to PDF function
async function makePDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length === 0) {
        alert("Pehle image select karein!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const imageData = await readFileAsDataURL(file);
        
        if (i > 0) doc.addPage();
        // Image ko page size ke hisab se set karna
        doc.addImage(imageData, 'JPEG', 10, 10, 190, 150);
    }

    doc.save("SmartTool_Converted.pdf");
}

// Image Resizer function (50% reduce)
async function resizeImage() {
    const input = document.getElementById('resizeInput');
    if (input.files.length === 0) {
        alert("Pehle photo select karein!");
        return;
    }

    const file = input.files[0];
    const imageData = await readFileAsDataURL(file);
    const img = new Image();
    img.src = imageData;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Naya size (Aadha kar diya)
        canvas.width = img.width / 2;
        canvas.height = img.height / 2;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = 'SmartTool_Resized.png';
        link.href = canvas.toDataURL();
        link.click();
    };
}

// File read karne ka function
function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}
