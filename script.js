document.addEventListener("DOMContentLoaded", function() {
    // Variables globales
    let missionText = "";
    let letterMeanings = [];
    let typedIndex = 0;
    // Archivo de audio para el sonido de tipeo (colócalo en la misma carpeta, por ejemplo, "typing.mp3")
    const typingSound = new Audio('typing.mp3');

    // Referencias a los elementos del DOM
    const missionStep = document.getElementById("missionStep");
    const letterStep = document.getElementById("letterStep");
    const displayStep = document.getElementById("displayStep");
    const missionInput = document.getElementById("missionInput");
    const letterForm = document.getElementById("letterForm");
    const typedDisplay = document.getElementById("typedDisplay");
    const verticalDisplay = document.getElementById("verticalDisplay");
    const controlButton = document.getElementById("controlButton");
    const matrixCanvas = document.getElementById("matrixCanvas");

    // Variables para fases del proyecto
    let currentPhase = 0; // 0 = antes de horizontal, 1 = horizontal terminado, 2 = vertical terminado
    let verticalIndex = 0;

    // PASO 1: Ingreso de la Misión mediante input (se sigue usando Enter para este paso)
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

    // Genera el formulario para ingresar el significado de cada letra
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

    // PASO 2: Efecto horizontal de tipeo (escribe el mensaje completo en typedDisplay)
    function startTypedEffect() {
        typedDisplay.textContent = "";
        typedIndex = 0;
        typeLetter();
    }

    function typeLetter() {
        if (typedIndex < missionText.length) {
            typedDisplay.textContent += missionText[typedIndex];
            typingSound.currentTime = 0;
            typingSound.play();
            typedIndex++;
            setTimeout(typeLetter, 300);
        } else {
            currentPhase = 1; // Efecto horizontal terminado
            // Si se ha finalizado el efecto horizontal, se procede a la animación vertical (para avanzar, se usa el botón "Ejecutar")
            controlButton.style.display = "inline-block";
            controlButton.textContent = "Ejecutar";
        }
    }

    // Botón de control para avanzar de la fase horizontal a la vertical o pasar al Matrix
    controlButton.addEventListener("click", function() {
        if (currentPhase === 1) {
            // Oculta el contenedor horizontal y muestra el vertical
            controlButton.style.display = "none";
            typedDisplay.style.display = "none";
            verticalDisplay.style.display = "flex"; // Asegura que se muestre y se alinee verticalmente
            verticalDisplay.innerHTML = "";
            verticalIndex = 0;
            verticalType();
        } else if (currentPhase === 2) {
            // Pasar al efecto Matrix
            controlButton.style.display = "none";
            startMatrixEffect();
        }
    });

    // PASO 3: Animación vertical: escribe cada letra (en color blanco) y su significado, carácter por carácter, reproduciendo sonido en cada letra
    function verticalType() {
        if (verticalIndex < missionText.length) {
            let div = document.createElement("div");
            div.className = "letter";

            // Creamos el span para la letra, inicialmente vacío
            let letterSpan = document.createElement("span");
            letterSpan.className = "letter-char";
            div.appendChild(letterSpan);

            let fullLetter = missionText[verticalIndex];
            // Animamos la escritura de la letra en el span
            animateText(letterSpan, fullLetter, 0, function() {
                // Una vez escrito el carácter, si existe el significado se anima también
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
            // Una vez finalizada la animación vertical, actualizamos la fase
            currentPhase = 2;
            controlButton.style.display = "inline-block";
            controlButton.textContent = "Ejecutar Matrix";
        }
    }

    // Función auxiliar: anima la escritura de un texto en un elemento, carácter por carácter
    function animateText(element, fullText, currentIndex, callback) {
        if (currentIndex < fullText.length) {
            element.textContent += fullText[currentIndex];
            // Reproduce el sonido para cada carácter añadido
            typingSound.currentTime = 0;
            typingSound.play();
            setTimeout(function() {
                animateText(element, fullText, currentIndex + 1, callback);
            }, 100); // Ajusta este retardo a tu gusto (100 ms por carácter)
        } else {
            callback();
        }
    }

    // PASO 4: Efecto Matrix mediante canvas
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
            ctx.fillStyle = "#FFF"; // Letras en blanco para el efecto Matrix
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