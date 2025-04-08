document.addEventListener("DOMContentLoaded", function() {
    // Variables globales
    let missionText = "";
    let letterMeanings = [];
    let typedIndex = 0;

    // Archivo de audio para el sonido de tipeo (colócalo en la misma carpeta: typing.mp3)
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

    let enterCount = 0;
    let matrixTriggerReady = false;

    // PASO 1: Ingreso de la Misión
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

            // Al presionar Enter en cada campo, confirmar y pasar al siguiente
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

    // PASO 3: Efecto de Tipeo horizontal (escribe el mensaje completo en typedDisplay)
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
            // Una vez terminado, esperar que el usuario presione Enter para iniciar la animación vertical
            document.addEventListener("keydown", waitForVertical, { once: true });
        }
    }

    // Al presionar Enter, se inicia la animación vertical
    function waitForVertical(e) {
        if (e.key === "Enter") {
            // Oculta el contenedor horizontal y muestra el vertical
            typedDisplay.style.display = "none";
            verticalDisplay.style.display = "flex";
            verticalDisplay.innerHTML = "";
            verticalIndex = 0;
            verticalType();
        } else {
            document.addEventListener("keydown", waitForVertical, { once: true });
        }
    }

    // PASO 3.1: Animación vertical: escribe cada letra y su significado letra por letra
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

            // Texto completo para la letra (usualmente 1 carácter)
            let fullLetter = missionText[verticalIndex];

            // Animar la escritura de la letra
            animateText(letterSpan, fullLetter, 0, function() {
                // Si existe significado, animarlo
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
            // Una vez finalizada la animación vertical, se muestra la instrucción para activar el efecto Matrix
            instruction.style.display = "block";
            matrixTriggerReady = true;
        }
    }

    // Función que anima la escritura de un texto en un elemento
    function animateText(element, fullText, currentIndex, callback) {
        if (currentIndex < fullText.length) {
            element.textContent += fullText[currentIndex];
            // Reproduce el sonido por cada carácter
            typingSound.currentTime = 0;
            typingSound.play();
            setTimeout(function() {
                animateText(element, fullText, currentIndex + 1, callback);
            }, 100); // Ajusta el retardo entre caracteres
        } else {
            callback();
        }
    }

    // PASO 4: Activar el efecto Matrix al presionar Enter dos veces
    document.addEventListener("keydown", function(e) {
        if (matrixTriggerReady && e.key === "Enter") {
            enterCount++;
            if (enterCount >= 2) {
                startMatrixEffect();
            }
        }
    });

    function startMatrixEffect() {
        // Oculta la interfaz anterior y muestra el canvas
        displayStep.style.display = "none";
        matrixCanvas.style.display = "block";
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixRain(matrixCanvas);
    }

    // Función que crea el efecto "Matrix Rain" en un canvas
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