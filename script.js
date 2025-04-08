document.addEventListener("DOMContentLoaded", function() {
    // Variables globales
    let missionText = "";
    let letterMeanings = [];
    let typedIndex = 0;
    // Archivo de audio para el sonido de tipeo (colócalo en la misma carpeta, e.g., "typing.mp3")
    const typingSound = new Audio('typing.mp3');

    // Variables de fase: 1 = horizontal terminado, esperando para iniciar vertical; 2 = vertical terminado, esperando Matrix.
    let currentPhase = 0;

    // Referencias a elementos del DOM
    const missionStep = document.getElementById("missionStep");
    const letterStep = document.getElementById("letterStep");
    const displayStep = document.getElementById("displayStep");
    const missionInput = document.getElementById("missionInput");
    const letterForm = document.getElementById("letterForm");
    const typedDisplay = document.getElementById("typedDisplay");
    const verticalDisplay = document.getElementById("verticalDisplay");
    const controlButton = document.getElementById("controlButton");
    const matrixCanvas = document.getElementById("matrixCanvas");

    // Contador para la animación vertical
    let verticalIndex = 0;

    // Evento para ingresar la misión
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

    // Generar formulario de significados (cada letra de la misión)
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

            // Permitir confirmar con Enter en cada campo
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

    // Recopila los significados ingresados
    function collectLetterMeanings() {
        const inputs = letterForm.querySelectorAll("input");
        letterMeanings = [];
        inputs.forEach(input => {
            letterMeanings.push(input.value.trim() || "Sin significado");
        });
        letterStep.style.display = "none";
        displayStep.style.display = "block";
        // Inicia el efecto horizontal de tipeo
        startTypedEffect();
    }

    // Efecto de tipeo horizontal (escribe todo el mensaje en typedDisplay)
    function startTypedEffect() {
        typedDisplay.textContent = "";
        typedIndex = 0;
        typeLetter();
    }

    function typeLetter() {
        if (typedIndex < missionText.length) {
            typedDisplay.textContent += missionText[typedIndex];
            // Reproduce el sonido por cada letra
            typingSound.currentTime = 0;
            typingSound.play();
            typedIndex++;
            setTimeout(typeLetter, 300);
        } else {
            // Finalizado el efecto horizontal, actualizamos la fase
            currentPhase = 1;
            // Mostramos el botón de control
            controlButton.style.display = "inline-block";
            controlButton.textContent = "Ejecutar";
        }
    }

    // Botón de control para avanzar entre fases
    controlButton.addEventListener("click", function() {
        if (currentPhase === 1) {
            // Fase 1: Iniciar animación vertical
            controlButton.style.display = "none";
            typedDisplay.style.display = "none";
            verticalDisplay.style.display = "flex";
            verticalDisplay.innerHTML = "";
            verticalIndex = 0;
            verticalType();
        } else if (currentPhase === 2) {
            // Fase 2: Iniciar efecto Matrix
            controlButton.style.display = "none";
            startMatrixEffect();
        }
    });

    // Animación vertical: se escribe letra por letra (cada línea contendrá la letra y su significado)
    function verticalType() {
        if (verticalIndex < missionText.length) {
            let div = document.createElement("div");
            div.className = "letter";

            // Span para la letra
            let letterSpan = document.createElement("span");
            letterSpan.className = "letter-char";
            div.appendChild(letterSpan);

            // Texto completo (normalmente 1 carácter)
            let fullLetter = missionText[verticalIndex];

            // Animar la escritura de la letra
            animateText(letterSpan, fullLetter, 0, function() {
                // Si hay significado, animarlo también
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
            // Finalizada la animación vertical, actualizamos la fase y mostramos el botón para Matrix
            currentPhase = 2;
            controlButton.style.display = "inline-block";
            controlButton.textContent = "Ejecutar"; // vuelve a decir "Ejecutar"
        }
    }

    // Función para animar la escritura letra por letra en un elemento
    function animateText(element, fullText, currentIndex, callback) {
        if (currentIndex < fullText.length) {
            element.textContent += fullText[currentIndex];
            // Sonido por cada carácter
            typingSound.currentTime = 0;
            typingSound.play();
            setTimeout(function() {
                animateText(element, fullText, currentIndex + 1, callback);
            }, 100); // Retardo entre cada carácter (ajústalo según prefieras)
        } else {
            callback();
        }
    }

    // Efecto Matrix: se activa al pulsar el botón en fase 2
    function startMatrixEffect() {
        displayStep.style.display = "none";
        matrixCanvas.style.display = "block";
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixRain(matrixCanvas);
    }

    // Efecto "Matrix Rain" en canvas
    function matrixRain(canvas) {
        let ctx = canvas.getContext("2d");
        let width = canvas.width;
        let height = canvas.height;
        let fontSize = 16;
        let columns = Math.floor(width / fontSize);
        let drops = new Array(columns).fill(0);
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%".split("");

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