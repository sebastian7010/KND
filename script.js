document.addEventListener("DOMContentLoaded", function() {
    // Variables globales
    let missionText = "";
    let letterMeanings = [];
    let typedIndex = 0;
    let currentPhase = 0; // 0: antes del efecto, 1: efecto horizontal terminado, 2: efecto vertical terminado
    let verticalIndex = 0;
    // Archivo de audio para el sonido de tipeo (coloca el archivo "typing.mp3" en la misma carpeta)
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

    // Función para reproducir texto usando ResponsiveVoice
    function speakText(text) {
        console.log("ResponsiveVoice speakText called with text:", text);
        // Se usa "Spanish Female", pero puedes cambiarlo según prefieras.
        responsiveVoice.speak(text, "Spanish Female", {
            rate: 1,
            pitch: 1,
            volume: 1,
            onstart: function() {
                console.log("ResponsiveVoice: Speech started");
            },
            onend: function() {
                console.log("ResponsiveVoice: Speech ended");
            },
            onerror: function(e) {
                console.error("ResponsiveVoice error:", e);
            }
        });
    }

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

            div.appendChild(label);
            div.appendChild(input);
            letterForm.appendChild(div);
            console.log("Generated input for letter:", missionText[i]);
        }
    }

    // Recopila los significados ingresados y pasa al siguiente paso
    function collectLetterMeanings() {
        const inputs = letterForm.querySelectorAll("input");
        letterMeanings = [];
        inputs.forEach(input => {
            const meaning = input.value.trim() || "Sin significado";
            letterMeanings.push(meaning);
            console.log("Collected meaning for letter:", input.placeholder, "->", meaning);
        });
        letterStep.style.display = "none";
        displayStep.style.display = "block";
        // Inicia el efecto horizontal de tipeo
        startTypedEffect();
    }

    // PASO 3: Efecto horizontal de tipeo (se muestra el nombre de la misión)
    function startTypedEffect() {
        console.log("startTypedEffect called");
        typedDisplay.textContent = "";
        typedIndex = 0;
        typeLetter();
    }

    function typeLetter() {
        if (typedIndex < missionText.length) {
            typedDisplay.textContent += missionText[typedIndex];
            console.log("typeLetter: adding letter:", missionText[typedIndex]);
            typingSound.currentTime = 0;
            typingSound.play();
            typedIndex++;
            setTimeout(typeLetter, 300);
        } else {
            console.log("Completed typeLetter");
            currentPhase = 1; // Efecto horizontal terminado
            controlButton.style.display = "inline-block";
            controlButton.textContent = "Ejecutar";
        }
    }

    /* PASO 3 (continuación): Animación vertical
       Se muestra cada letra de la misión de forma vertical (una debajo de la otra) 
       y para cada una se despliega su significado (con efecto typing y sonido).
       En este paso la voz no leerá nada.
    */
    function verticalType() {
        console.log("verticalType called at index:", verticalIndex);
        if (verticalIndex < missionText.length) {
            let div = document.createElement("div");
            div.className = "letter";

            // Se crea el span que mostrará la letra
            let letterSpan = document.createElement("span");
            letterSpan.className = "letter-char";
            div.appendChild(letterSpan);

            let fullLetter = missionText[verticalIndex];
            console.log("Animating letter:", fullLetter);
            // Efecto de typing para la letra
            animateText(letterSpan, fullLetter, 0, function() {
                // Una vez mostrada la letra, se añade el significado en forma de tooltip
                if (letterMeanings[verticalIndex]) {
                    let tooltipSpan = document.createElement("span");
                    tooltipSpan.className = "tooltip";
                    div.appendChild(tooltipSpan);
                    let fullTooltip = letterMeanings[verticalIndex];
                    console.log("Animating tooltip (meaning):", fullTooltip);
                    animateText(tooltipSpan, fullTooltip, 0, function() {
                        // En este paso no se reproduce voz por cada letra
                        verticalIndex++;
                        setTimeout(verticalType, 300);
                    });
                } else {
                    console.log("No meaning provided for letter", fullLetter, "- skipping voice.");
                    verticalIndex++;
                    setTimeout(verticalType, 300);
                }
            });
            verticalDisplay.appendChild(div);
        } else {
            console.log("Finished verticalType animation");
            currentPhase = 2;
            // Se muestra el botón de ejecutar Matrix (se reubica en CSS para mayor visibilidad)
            controlButton.style.display = "inline-block";
            controlButton.textContent = "Ejecutar Matrix";
        }
    }

    // Función auxiliar: anima la escritura de un texto, carácter por carácter, con sonido de tipeo
    function animateText(element, fullText, currentIndex, callback) {
        if (currentIndex < fullText.length) {
            element.textContent += fullText[currentIndex];
            console.log("animateText: added letter:", fullText[currentIndex]);
            typingSound.currentTime = 0;
            typingSound.play();
            setTimeout(function() {
                animateText(element, fullText, currentIndex + 1, callback);
            }, 100);
        } else {
            console.log("animateText complete for text:", fullText);
            callback();
        }
    }

    // PASO 4: Efecto Matrix mediante canvas (sin sonido)
    function startMatrixEffect() {
        console.log("startMatrixEffect called");
        displayStep.style.display = "none";
        matrixCanvas.style.display = "block";
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixRain(matrixCanvas);
        // Lanza el efecto de imagen después de 2 segundos (ajusta el tiempo según tu necesidad)
        setTimeout(startImageEffect, 2000);
    }


    // Efecto Matrix: se muestra el canvas con efecto "Matrix"
    function matrixRain(canvas) {
        let ctx = canvas.getContext("2d");
        let width = canvas.width;
        let height = canvas.height;
        let fontSize = 16;
        let columns = Math.floor(width / fontSize);
        let drops = new Array(columns).fill(0);
        let characters = "!@#$%^&経済的費用なしで提供されるGoogleのサービスは、単語、フレーズ、およびWebページを100を超える言語に即座に変換します。*()_+-=[]{}|;:',.<>/?".split("");

        function draw() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#0F0"; // Texto en verde
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

    /* EVENT LISTENERS */

    // Paso 1: Ingreso de la misión
    document.getElementById("missionButton").addEventListener("click", function() {
        missionText = missionInput.value.trim();
        console.log("Mission text entered:", missionText);
        if (missionText.length > 0) {
            missionStep.style.display = "none";
            generateLetterInputs();
            letterStep.style.display = "block";
        }
    });

    // Paso 2: Ingreso de significados
    document.getElementById("letterButton").addEventListener("click", function() {
        console.log("Collecting letter meanings");
        collectLetterMeanings();
    });


    controlButton.addEventListener("click", function() {
        console.log("Control button clicked, currentPhase:", currentPhase);
        if (currentPhase === 1) {
            controlButton.style.display = "none";
            typedDisplay.style.display = "none";
            verticalDisplay.style.display = "flex"; // Se muestra con alineación vertical
            verticalDisplay.innerHTML = "";
            verticalIndex = 0;
            verticalType();
        } else if (currentPhase === 2) {
            controlButton.style.display = "none";
            // Agregamos un retraso de 1 segundo antes de iniciar la lectura y efecto Matrix
            setTimeout(function() {
                let fullMissionText = "Misión " + missionText + ". Significados: " + letterMeanings.join(", ");
                console.log("Reading full mission and meanings:", fullMissionText);
                responsiveVoice.speak(fullMissionText, "Spanish Female", {
                    rate: 1,
                    pitch: 1,
                    volume: 1,
                    onstart: function() {
                        console.log("ResponsiveVoice: Speech started for full mission");
                    },
                    onend: function() {
                        console.log("ResponsiveVoice: Speech ended for full mission, starting Matrix effect");
                        startMatrixEffect();
                    },
                    onerror: function(e) {
                        console.error("ResponsiveVoice error:", e);
                        startMatrixEffect();
                    }
                });
            }, 1000);
        }
    });


    // Función para iniciar el efecto de imagen en el centro de la Matrix
    function startImageEffect() {
        console.log("Starting image effect");
        // Creamos el elemento imagen
        let img = document.createElement("img");
        img.id = "centerImage";
        // Ajusta esta ruta al nombre y ubicación de tu imagen
        img.src = "assets/WhatsApp Image 2025-04-09 at 10.29.13 AM.jpeg";
        // Se establece el alt para accesibilidad
        img.alt = "Imagen del Final";

        // Se agrega la imagen al body o sobre el canvas
        document.body.appendChild(img);

        // Opcional: Si deseas que la imagen se retire después de cierto tiempo, podrías
        // usar un setTimeout para removerla, ej.:
        // setTimeout(() => { img.remove(); }, 10000);
    }
})