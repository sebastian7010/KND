document.addEventListener("DOMContentLoaded", function() {
    // Variables globales
    let missionText = "";
    let letterMeanings = [];
    let typedIndex = 0;

    // Archivo de audio para el sonido de tipeo (coloca typing.mp3 en la misma carpeta)
    const typingSound = new Audio('typing.mp3');

    // Referencias a los elementos del DOM
    const missionStep = document.getElementById("missionStep");
    const letterStep = document.getElementById("letterStep");
    const displayStep = document.getElementById("displayStep");
    const missionInput = document.getElementById("missionInput");
    const letterForm = document.getElementById("letterForm");
    const typedDisplay = document.getElementById("typedDisplay");
    const verticalDisplay = document.getElementById("verticalDisplay");
    const instruction = document.getElementById("instruction");
    const matrixCanvas = document.getElementById("matrixCanvas");

    let tapCount = 0; // Para medir toques en pantalla para activar Matrix

    // PASO 1: Ingreso de la Misión (en esta parte se puede seguir usando Enter para ingresar texto)
    missionInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            missionText = missionInput.value.trim();
            if (missionText.length > 0) {
                e.preventDefault();
                missionStep.style.display = "none";
                generateLetterInputs();
                letterStep.style.display = "block";
            }
        }
    });

    // Generar inputs para cada letra de la misión
    function generateLetterInputs() {
        letterForm.innerHTML = "";
        for (let i = 0; i < missionText.length; i++) {
            let div = document.createElement("div");
            div.className = "letterInput";

            let label = document.createElement("label");
            label.textContent = missionText[i] + ": ";

            let input = document.createElement("input");
            input.type = "text";
            input.required = true;
            input.dataset.letterIndex = i;
            input.placeholder = "Significado de " + missionText[i];

            // Al presionar Enter (o tocando el botón del teclado), confirmar y pasar al siguiente campo
            input.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    let next = input.parentElement.nextElementSibling;
                    if (next) {
                        next.querySelector("input").focus();
                    } else {
                        collectLetterMeanings();
                    }
                }
            });

            div.appendChild(label);
            div.appendChild(input);
            letterForm.appendChild(div);
        }
    }

    // Recopilar los significados ingresados
    function collectLetterMeanings() {
        const inputs = letterForm.querySelectorAll("input");
        letterMeanings = [];
        inputs.forEach(input => {
            letterMeanings.push(input.value.trim() || "Sin significado");
        });
        letterStep.style.display = "none";
        displayStep.style.display = "block";
        // Inicia el efecto de tipeo horizontal
        startTypedEffect();
    }

    // PASO 3: Efecto de Tipeo horizontal
    function startTypedEffect() {
        typedDisplay.textContent = "";
        typedIndex = 0;
        typeLetter();
    }

    function typeLetter() {
        if (typedIndex < missionText.length) {
            typedDisplay.textContent += missionText[typedIndex];
            // Reproduce el sonido por cada letra escrita
            typingSound.currentTime = 0;
            typingSound.play();
            typedIndex++;
            setTimeout(typeLetter, 300);
        } else {
            // Una vez terminado el efecto horizontal, se agrega un listener para detectar toque (click)
            // En móviles, basta con tocar la pantalla
            document.addEventListener("click", waitForVertical, { once: true });
        }
    }

    // PASO 3.1: Iniciar animación vertical al tocar en pantalla
    function waitForVertical(e) {
        // Oculta el contenedor horizontal y muestra el vertical
        typedDisplay.style.display = "none";
        verticalDisplay.style.display = "flex";
        verticalDisplay.innerHTML = "";
        verticalIndex = 0;
        verticalType();
    }

    // Animación vertical: Escribe cada letra y su significado letra por letra
    let verticalIndex = 0;

    function verticalType() {
        if (verticalIndex < missionText.length) {
            // Crear contenedor para la letra y su tooltip
            let div = document.createElement("div");
            div.className = "letter";

            // Crear span para la letra (inicialmente vacío)
            let letterSpan = document.createElement("span");
            letterSpan.className = "letter-char";
            div.appendChild(letterSpan);

            // Texto completo para la letra
            let fullLetter = missionText[verticalIndex];

            // Animar la escritura de la letra
            animateText(letterSpan, fullLetter, 0, function() {
                // Si hay significado, animarlo
                if (letterMeanings[verticalIndex]) {
                    let tooltipSpan = document.createElement("span");
                    tooltipSpan.className = "tooltip";
                    div.appendChild(tooltipSpan);
                    let fullTooltip = " - " + letterMeanings[verticalIndex];
                    animateText(tooltipSpan, fullTooltip, 0, function() {
                        verticalIndex++;
                        setTimeout(verticalType, 300);
                    });
                } else {
                    verticalIndex++;
                    setTimeout(verticalType, 300);
                }
            });

            verticalDisplay.appendChild(div);
        } else {
            // Finalizada la animación vertical, mostramos la instrucción para activar Matrix
            instruction.style.display = "block";
            // Para activar Matrix, se usará el toque en pantalla (registrando doble tap)
            document.addEventListener("click", matrixActivation, false);
        }
    }

    // Función para animar la escritura de un texto en un elemento (letra por letra)
    function animateText(element, fullText, currentIndex, callback) {
        if (currentIndex < fullText.length) {
            element.textContent += fullText[currentIndex];
            // Reproduce el sonido de tipeo para cada carácter
            typingSound.currentTime = 0;
            typingSound.play();
            setTimeout(function() {
                animateText(element, fullText, currentIndex + 1, callback);
            }, 100); // Retardo entre cada carácter (ajústalo si lo deseas)
        } else {
            callback();
        }
    }

    // PASO 4: Activar el efecto Matrix con doble toque
    let lastTap = 0;

    function matrixActivation(e) {
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            // Si se detecta doble toque (dos taps en menos de 300 ms), se activa Matrix
            document.removeEventListener("click", matrixActivation, false);
            startMatrixEffect();
        } else {
            lastTap = currentTime;
        }
    }

    function startMatrixEffect() {
        // Oculta la interfaz anterior y muestra el canvas con el efecto Matrix
        displayStep.style.display = "none";
        matrixCanvas.style.display = "block";
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixRain(matrixCanvas);
    }

    // Efecto Matrix usando canvas
    function matrixRain(canvas) {
        let ctx = canvas.getContext("2d");
        let width = canvas.width;
        let height = canvas.height;
        let fontSize = 16;
        let columns = Math.floor(width / fontSize);
        let drops = new Array(columns).fill(0);
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%";
        characters = characters.split("");

        function draw() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#0F0";
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                let text = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(draw, 33);
    }
});