import { CanvasPage } from './canvas.js';

export class CanvasManager {
  constructor(container) {
    this.currentPage = 0;
    this.pages = [];
    this.container = container;
    this.pdfContainer = null;
    this.currentTool = null;
    
    // Créer la première page
    this.addPage();
  }

  addPage() {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'canvas-page';
    pageDiv.style.display = this.currentPage === this.pages.length ? 'block' : 'none';

    const canvas = document.createElement('canvas');
    canvas.width = 794;  // Format A4 en pixels (21cm * 37.795)
    canvas.height = 1123; // Format A4 en pixels (29.7cm * 37.795)
    canvas.style.border = '1px solid black';
    canvas.style.margin = '10px';
    canvas.style.backgroundColor = 'white';
    pageDiv.appendChild(canvas);

    if (this.container) {
      this.container.appendChild(pageDiv);
      this.pages.push(pageDiv);
      
      try {
        const ctx = canvas.getContext('2d');
        const page = new CanvasPage(canvas, ctx);
        // Appliquer l'outil courant à la nouvelle page
        if (this.currentTool) {
          page.setActiveTool(this.currentTool);
        }
      } catch (error) {
        console.error('Erreur lors de la création de la page:', error);
      }
      return canvas;
    } else {
      console.error("Le conteneur de canvas n'est pas trouvé");
      return null;
    }
  }

  getCurrentCanvas() {
    if (this.pages[this.currentPage]) {
      return this.pages[this.currentPage].querySelector('canvas');
    }
    return null;
  }

  nextPage() {
    if (this.currentPage < this.pages.length - 1) {
      this.pages[this.currentPage].style.display = 'none';
      this.currentPage++;
      this.pages[this.currentPage].style.display = 'block';
    } else {
      const canvas = this.addPage();
      if (canvas) {
        this.currentPage = this.pages.length - 1;
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.pages[this.currentPage].style.display = 'none';
      this.currentPage--;
      this.pages[this.currentPage].style.display = 'block';
    }
  }

  setCurrentTool(tool) {
    console.log('Changement d\'outil vers:', tool);
    this.currentTool = tool;
    // Mettre à jour l'interface utilisateur si nécessaire
    // Mettre à jour l'outil actif sur la page courante
    if (this.pages[this.currentPage]) {
      const canvas = this.pages[this.currentPage].querySelector('canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const page = new CanvasPage(canvas, ctx);
        page.setActiveTool(tool);
      }
    }
  }

  // Méthode pour charger un PDF
  async loadPDF(file) {
    if (!this.pdfContainer) {
      console.error("Le conteneur PDF n'est pas trouvé");
      return;
    }

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        const loadingTask = pdfjsLib.getDocument(typedarray);
        const pdf = await loadingTask.promise;

        // Vider le conteneur PDF
        this.pdfContainer.innerHTML = '';

        // Charger chaque page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1.5 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          await page.render(renderContext).promise;
          this.pdfContainer.appendChild(canvas);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erreur lors du chargement du PDF:', error);
    }
  }
}
