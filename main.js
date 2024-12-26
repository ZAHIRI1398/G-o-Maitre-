import { CanvasManager } from './classes/canvas_manager.js';

// Initialisation du gestionnaire de canvas
const container = document.getElementById('container1');
const canvasManager = new CanvasManager(container);
window.canvasManager = canvasManager;

// Gestion des outils de dessin
document.getElementById('btn-point').addEventListener('click', () => {
  canvasManager.setCurrentTool('point');
});

document.getElementById('btn-milieu').addEventListener('click', () => {
  canvasManager.setCurrentTool('milieu');
});

document.getElementById('btn-segment').addEventListener('click', () => {
  canvasManager.setCurrentTool('segment');
});

document.getElementById('btn-segment-known').addEventListener('click', () => {
  canvasManager.setCurrentTool('segment-known');
});

document.getElementById('btn-droite').addEventListener('click', () => {
  canvasManager.setCurrentTool('droite');
});

document.getElementById('btn-parallele').addEventListener('click', () => {
  canvasManager.setCurrentTool('parallele');
});

document.getElementById('btn-perpendiculaire').addEventListener('click', () => {
  canvasManager.setCurrentTool('perpendiculaire');
});

document.getElementById('btn-compas').addEventListener('click', () => {
  canvasManager.setCurrentTool('compas');
});

document.getElementById('btn-compas-known').addEventListener('click', () => {
  canvasManager.setCurrentTool('compas-known');
});

document.getElementById('btn-text').addEventListener('click', () => {
  canvasManager.setCurrentTool('text');
});

document.getElementById('btn-gomme').addEventListener('click', () => {
  canvasManager.setCurrentTool('gomme');
});

document.getElementById('btn-angle').addEventListener('click', () => {
  canvasManager.setCurrentTool('angle');
});

document.getElementById('btn-polygon').addEventListener('click', () => {
  canvasManager.setCurrentTool('polygon');
});

// Gestion du remplissage
document.getElementById('btn-fill').addEventListener('click', () => {
  canvasManager.setCurrentTool('fill');
});

// Gestion de la couleur
let currentColor = '#000000';
document.getElementById('color-picker').addEventListener('change', (event) => {
  currentColor = event.target.value;
});

// Exposer la couleur courante
window.getCurrentColor = () => currentColor;

// Gestion des pages
document.getElementById('btn-add').addEventListener('click', () => {
  canvasManager.addPage();
});

document.getElementById('btn-remove').addEventListener('click', () => {
  canvasManager.removePage();
});

// Gestion du popup Glisser Nombre
const popup = document.getElementById('glisser-nombre-popup');
document.getElementById('btn-glisser-nombre').addEventListener('click', () => {
  popup.style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
  popup.style.display = 'none';
});

// Gestion de l'input PDF
const pdfInput = document.getElementById('pdf-input');
const fileName = document.getElementById('file-name');

pdfInput.addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (file) {
    fileName.textContent = file.name;
    
    if (file.type === 'application/pdf') {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          const typedarray = new Uint8Array(this.result);
          
          // Chargement du PDF
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          console.log('PDF chargé avec', pdf.numPages, 'pages');
          
          // Pour chaque page du PDF
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Créer un nouveau canvas si nécessaire
            const canvasPage = pageNum === 1 ? canvasManager.getCurrentPage() : canvasManager.addPage();
            if (!canvasPage) continue;
            
            // Ajuster la taille du canvas
            canvasPage.canvas.width = viewport.width;
            canvasPage.canvas.height = viewport.height;
            canvasPage.pdfCanvas.width = viewport.width;
            canvasPage.pdfCanvas.height = viewport.height;
            
            // Dessiner la page du PDF
            await page.render({
              canvasContext: canvasPage.pdfContext,
              viewport: viewport
            }).promise;
            
            // Redessiner tout
            canvasPage.redraw();
            console.log(`Page ${pageNum} rendue`);
          }
        };
        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Erreur lors du chargement du PDF:', error);
      }
    } else if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = function() {
        const canvasPage = canvasManager.getCurrentPage();
        if (!canvasPage) return;
        
        // Ajuster la taille du canvas
        canvasPage.canvas.width = img.width;
        canvasPage.canvas.height = img.height;
        canvasPage.pdfCanvas.width = img.width;
        canvasPage.pdfCanvas.height = img.height;
        
        // Dessiner l'image
        canvasPage.pdfContext.drawImage(img, 0, 0);
        canvasPage.redraw();
      };
      img.src = URL.createObjectURL(file);
    }
  }
});

// Gestion de l'export PDF
document.getElementById('btn-export-pdf').addEventListener('click', () => {
  // Initialiser jsPDF
  const { jsPDF } = window.jspdf;

  // Créer un nouveau document PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [794, 1123] // Format A4 en pixels
  });

  // Pour chaque page du canvas
  canvasManager.pages.forEach((page, index) => {
    // Si ce n'est pas la première page, ajouter une nouvelle page
    if (index > 0) {
      pdf.addPage();
    }

    // Convertir le canvas en image
    const imgData = page.canvas.toDataURL('image/jpeg', 1.0);
    
    // Ajouter l'image au PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
  });

  // Sauvegarder le PDF
  pdf.save('geometrie.pdf');
});
