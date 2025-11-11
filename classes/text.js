export class Text {
    constructor(canvas, context, redrawCallback) {
        this.canvas = canvas;
        this.context = context;
        this.isEditing = false;
        this.currentInput = null;
        this.texts = [];
        this.isDragging = false;
        this.draggedTextIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
        this.redrawCallback = redrawCallback || null;
    }

    handleClick(event) {
        if (this.isEditing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Créer un input temporaire
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = (event.clientX) + 'px';
        input.style.top = (event.clientY) + 'px';
        input.style.zIndex = '1000';
        input.style.font = '20px Arial';
        input.style.border = '1px solid black';
        input.style.padding = '2px';
        input.style.backgroundColor = 'white';

        document.body.appendChild(input);
        input.focus();

        this.isEditing = true;
        this.currentInput = input;

        // Gérer la validation du texte
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = input.value;
                if (text) {
                    this.context.font = '20px Arial';
                    this.context.fillStyle = 'black';
                    this.context.fillText(text, x, y);
                    
                    // Sauvegarder le texte
                    this.texts.push({
                        x: x,
                        y: y,
                        text: text
                    });
                }
                document.body.removeChild(input);
                this.isEditing = false;
                this.currentInput = null;
            }
        });

        // Gérer la perte de focus
        input.addEventListener('blur', () => {
            if (this.isEditing) {
                document.body.removeChild(input);
                this.isEditing = false;
                this.currentInput = null;
            }
        });
    }

    // Méthode pour vérifier si un point est près d'un texte
    isPointNear(x, y, tolerance = 30) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const text = this.texts[i];
            // Mesurer la largeur approximative du texte
            this.context.font = '20px Arial';
            const textWidth = this.context.measureText(text.text).width;
            const textHeight = 20; // Hauteur approximative
            
            // Vérifier si le point est dans la boîte du texte
            if (x >= text.x - 5 && x <= text.x + textWidth + 5 &&
                y >= text.y - textHeight && y <= text.y + 5) {
                return i; // Retourne l'index du texte trouvé
            }
        }
        return -1; // Retourne -1 si aucun texte n'est trouvé
    }

    // Nouvelle méthode pour supprimer un texte
    removeText(index) {
        if (index >= 0 && index < this.texts.length) {
            this.texts.splice(index, 1);
            return true;
        }
        return false;
    }

    handleMouseDown(event) {
        if (this.isEditing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Vérifier si on clique sur un texte existant
        const textIndex = this.isPointNear(x, y, 30);
        if (textIndex !== -1) {
            this.isDragging = true;
            this.draggedTextIndex = textIndex;
            this.dragOffset.x = x - this.texts[textIndex].x;
            this.dragOffset.y = y - this.texts[textIndex].y;
            this.canvas.style.cursor = 'move';
        }
    }

    handleMouseMove(event) {
        if (this.currentInput) {
            const rect = this.canvas.getBoundingClientRect();
            this.currentInput.style.left = (event.clientX) + 'px';
            this.currentInput.style.top = (event.clientY) + 'px';
            return;
        }
        
        if (this.isDragging && this.draggedTextIndex !== -1) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Déplacer le texte
            this.texts[this.draggedTextIndex].x = x - this.dragOffset.x;
            this.texts[this.draggedTextIndex].y = y - this.dragOffset.y;
            
            // Redessiner
            if (this.redrawCallback) {
                this.redrawCallback();
            }
        } else {
            // Changer le curseur si on survole un texte
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const textIndex = this.isPointNear(x, y, 30);
            this.canvas.style.cursor = textIndex !== -1 ? 'pointer' : 'crosshair';
        }
    }

    handleMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedTextIndex = -1;
            this.canvas.style.cursor = 'crosshair';
        }
    }
    

    // Pour redessiner tous les textes
    draw() {
        this.texts.forEach(text => {
            this.context.font = '20px Arial';
            this.context.fillStyle = 'black';
            this.context.fillText(text.text, text.x, text.y);
        });
    }
}