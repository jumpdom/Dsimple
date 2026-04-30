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
        
        const img = new Image();
        img.src = imageData;

        // Image load hone ka intezar karein taaki sahi size mile
        await new Promise((resolve) => {
            img.onload = function() {
                if (i > 0) doc.addPage();
                
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Image ki asli bunto (ratio) nikalna
                const ratio = img.width / img.height;
                let imgWidth = pageWidth - 20; // Side margins
                let imgHeight = imgWidth / ratio;

                // Agar height page se bahar ja rahi ho
                if (imgHeight > pageHeight - 20) {
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * ratio;
                }

                doc.addImage(imageData, 'PNG', 10, 10, imgWidth, imgHeight);
                resolve();
            };
        });
    }

    doc.save("Professional_Scan.pdf");
}

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}
