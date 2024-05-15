const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

// Ajustamos la altura y el ancho del canvas para que ocupe la mitad de la pantalla
canvas.height = window_height / 2;
canvas.width = window_width;

canvas.style.background = "#ff8";

// Elemento HTML para mostrar las coordenadas del cursor
const coordinatesDisplay = document.createElement("div");
coordinatesDisplay.style.position = "fixed";
coordinatesDisplay.style.top = "10px";
coordinatesDisplay.style.left = "10px";
coordinatesDisplay.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
coordinatesDisplay.style.padding = "5px";
coordinatesDisplay.style.borderRadius = "5px";
coordinatesDisplay.style.fontFamily = "Arial";
document.body.appendChild(coordinatesDisplay);

// Elemento HTML para mostrar el contador de círculos eliminados
const counterDisplay = document.createElement("div");
counterDisplay.style.position = "fixed";
counterDisplay.style.top = "10px";
counterDisplay.style.right = "10px";
counterDisplay.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
counterDisplay.style.padding = "5px";
counterDisplay.style.borderRadius = "5px";
counterDisplay.style.fontFamily = "Arial";
document.body.appendChild(counterDisplay);

let circlesDeleted = 0;

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context, otherCircles) {
        this.draw(context);
        let collision = false;

        // Verificar colisión con otros círculos
        for (let i = 0; i < otherCircles.length; i++) {
            if (this !== otherCircles[i]) {
                let dx = this.posX - otherCircles[i].posX;
                let dy = this.posY - otherCircles[i].posY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.radius + otherCircles[i].radius) {
                    // Colisión detectada con al menos un círculo, cambiar color a rojo
                    this.color = "red";
                    otherCircles[i].color = "red";
                    // Calcular la nueva dirección (dx, dy) para el rebote
                    let normalX = dx / distance; // Componente x del vector normal
                    let normalY = dy / distance; // Componente y del vector normal
                    let dotProduct = this.dx * normalX + this.dy * normalY; // Producto punto
                    this.dx = this.dx - 2 * dotProduct * normalX; // Componente x de la nueva dirección
                    this.dy = this.dy - 2 * dotProduct * normalY; // Componente y de la nueva dirección
                    // Ajustar posiciones para evitar que los círculos se queden pegados
                    let overlap = this.radius + otherCircles[i].radius - distance;
                    let adjustX = overlap * normalX * 0.5;
                    let adjustY = overlap * normalY * 0.5;
                    this.posX += adjustX;
                    this.posY += adjustY;
                    otherCircles[i].posX -= adjustX;
                    otherCircles[i].posY -= adjustY;
                    collision = true;
                }
            }
        }

        if (!collision) {
            // No hay colisión, restaurar color azul
            this.color = "blue";
        }

        // Verificar y ajustar posición si el círculo está a punto de salir de la pantalla
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
            if (this.posX + this.radius > window_width) {
                this.posX = window_width - this.radius;
            }
            if (this.posX - this.radius < 0) {
                this.posX = this.radius;
            }
        }

        if ((this.posY - this.radius) < -this.radius) {
            // Eliminar el círculo si toca el borde superior
            circlesDeleted++;
            counterDisplay.textContent = `Círculos eliminados: ${circlesDeleted}`;
            let index = otherCircles.indexOf(this);
            otherCircles.splice(index, 1);
        }

        if ((this.posY + this.radius) > window_height) {
            this.dy = -this.dy;
            this.posY = window_height - this.radius;
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }
}

let circles = [];

// Generar n círculos aleatorios
let n = 15; // Puedes cambiar este valor al número deseado de círculos
for (let i = 0; i < n; i++) {
    let randomX = Math.random() * window_width;
    let randomY = window_height + Math.random() * (window_height / 2) + 50; // Generar círculos por debajo del margen inferior
    let randomRadius = Math.floor(Math.random() * 100 + 30);
    let speed = 1.5;
    circles.push(new Circle(randomX, randomY, randomRadius, "blue", `${i + 1}`, speed));
}

let updateCircles = function () {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);
    for (let i = 0; i < circles.length; i++) {
        circles[i].update(ctx, circles);
    }
};

// Evento de clic para eliminar círculos
canvas.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    for (let i = 0; i < circles.length; i++) {
        let dx = circles[i].posX - mouseX;
        let dy = circles[i].posY - mouseY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < circles[i].radius) {
            // Eliminar el círculo si se hace clic dentro de él
            circlesDeleted++;
            counterDisplay.textContent = `Círculos eliminados: ${circlesDeleted}`;
            circles.splice(i, 1);
            break; // Salir del bucle una vez que se elimine un círculo
        }
    }
});

// Evento de escucha para el movimiento del mouse en el canvas
canvas.addEventListener("mousemove", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    coordinatesDisplay.textContent = `X: ${mouseX.toFixed(2)}, Y: ${mouseY.toFixed(2)}`;
});

updateCircles();
