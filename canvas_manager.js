class CanvasManager {
    constructor() {
        this.currentPage = 0;
        this.pages = [];
        this.container = document.getElementById('canvas-container');
        this.pdfContainer = document.getElementById('pdf-container');
        
        // Créer la première page
        this.addPage();
    }

    addPage() {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'canvas-page';
        pageDiv.style.display = this.currentPage === this.pages.length ? 'block' : 'none';

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        pageDiv.appendChild(canvas);

        this.container.appendChild(pageDiv);
        this.pages.push(pageDiv);
        
        return canvas;
    }

    getCurrentCanvas() {
        return this.pages[this.currentPage].querySelector('canvas');
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.pages[this.currentPage].style.display = 'none';
            this.currentPage++;
            this.pages[this.currentPage].style.display = 'block';
        } else {
            const canvas = this.addPage();
            this.currentPage = this.pages.length - 1;
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.pages[this.currentPage].style.display = 'none';
            this.currentPage--;
            this.pages[this.currentPage].style.display = 'block';
        }
    }

    // Méthode pour charger un PDF
    async loadPDF(file) {
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
