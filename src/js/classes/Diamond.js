export default class Diamond {
    constructor(p5, startX, startY, hueOrColour, maxSize, opacity = 1, speed = 1) {
        this.p = p5;
        this.x = startX;
        this.y = startY;
        this.colour = this.isObject(hueOrColour) ? hueOrColour : this.p.color(hueOrColour, 100, 100);
        this.hue = this.colour._getHue();
        this.size = speed > 1 ? 0 : maxSize / 16;
        this.maxSize = speed > 1 ? maxSize / 2 : maxSize / 2 * 0.7; 
        this.opacity = opacity;
        this.speed = speed;
    }

    isObject(variable) {
        return typeof variable === 'object' &&
            variable !== null &&
            !Array.isArray(variable);
    }    

    update() {
        if(this.size < this.maxSize) {
            this.size = this.size + this.speed;
        }
    }

    draw() {
        let xDist = this.size / 4 * 3, 
            yDist = this.size, 
            hue = this.hue,
            sat = 100, 
            bright = 100,
            loops = this.speed > 1 ? 1 : 20; 
        this.p.stroke(this.hue, 0, 100, this.opacity);
        this.p.fill(hue, sat, bright, this.opacity);
        for (let i = 0; i < loops; i++) {
            this.p.quad(
                this.x, 
                this.y  - yDist, 
                this.x + (xDist / 2), 
                this.y, 
                this.x,
                this.y + yDist, 
                this.x - (xDist / 2), 
                this.y, 
            );
            xDist = xDist - (xDist / 10);
            yDist = yDist - (yDist / 10);
            hue = hue - 15 < 0 ? hue + 345 : hue - 15;
            sat = sat - 10;
            bright = bright - 10;
            this.p.stroke(hue, sat, bright, this.opacity);
            this.p.noFill();
        }
    }
}