export default class Line {
    constructor(ctx, point1, point2) {
        this.ctx = ctx;
        this.point1 = point1;
        this.point2 = point2;
        this.x1 = point1.x;
        this.y1 = point1.y;
        this.x2 = point2.x;
        this.y2 = point2.y;
    }

    calcSlope() {
        return (this.y2 - this.y1) / (this.x2 - this.x1);
    }

    draw() {
        // Calculer la direction de la ligne
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Si les points sont trop proches, ne rien tracer
        if (length < 1) return;
        
        // Normaliser le vecteur de direction
        const dirX = dx / length;
        const dirY = dy / length;
        
        // Extension de la droite (en pixels) de chaque côté
        const extension = 300;
        
        // Calculer les points étendus
        const startX = this.x1 - dirX * extension;
        const startY = this.y1 - dirY * extension;
        const endX = this.x2 + dirX * extension;
        const endY = this.y2 + dirY * extension;
        
        // Tracer la ligne étendue
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = 'blue';
        this.ctx.stroke();
    }

    isPointNear(x, y, tolerance = 5) {
        // Pour une droite infinie, on utilise la distance point-droite
        const A = this.y2 - this.y1;
        const B = this.x1 - this.x2;
        const C = this.x2 * this.y1 - this.x1 * this.y2;
        
        // Distance = |Ax + By + C| / sqrt(A² + B²)
        const distance = Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B);
        
        return distance < tolerance;
    }

    distanceToPoint(point) {
        // Calculer la distance d'un point à une droite
        const x0 = point.x;
        const y0 = point.y;
        const x1 = this.point1.x;
        const y1 = this.point1.y;
        const x2 = this.point2.x;
        const y2 = this.point2.y;

        const numerator = Math.abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1);
        const denominator = Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
        
        return numerator / denominator;
    }

    isNear(point) {
        return this.distanceToPoint(point) < 20;
    }
}