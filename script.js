/**
 * Asistente AI Premium - Motor de Inferencia & UX Clinica Avanzada
 * Diagnóstico de patologías específicas, Triage Avanzado e Historial Persistente
 */

// Variable global para almacenar el triage activo actual
let currentTriageColor = "var(--primary-color)";
let currentTriageText = "PRIORIDAD V - VERDE";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Vincular los event handlers de las Option Cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        // Hacer focusable por teclado para accesibilidad
        card.setAttribute('tabindex', '0');
        
        const selectCard = () => {
            const group = card.closest('.option-cards-group');
            const inputId = group.getAttribute('data-input-id');
            const hiddenInput = document.getElementById(inputId);
            
            // Remover selección de hermanos
            group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            
            // Añadir selección a esta tarjeta
            card.classList.add('selected');
            
            // Asignar valor al input oculto
            hiddenInput.value = card.getAttribute('data-value');
            
            // Limpiar estilos de error si estaban activos
            group.classList.remove('invalid-shake');
            group.style.outline = 'none';
        };

        // Click físico
        card.addEventListener('click', selectCard);
        
        // Teclado (Accesibilidad WCAG)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCard();
            }
        });
    });

    // 2. Inicializar la Base de Datos Local (Historial)
    updateHistoryBadge();
    renderHistory();

    // 3. Inicializar el botón de cambio de tema
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
        const isLight = document.documentElement.classList.contains('light-theme');
        toggleBtn.querySelector('.toggle-icon').textContent = isLight ? '☀️' : '🌙';
        toggleBtn.addEventListener('click', toggleTheme);
    }
});

/**
 * Controla el flujo paso a paso del Wizard con validación avanzada y feedback háptico/visual
 */
function nextStep(current, next) {
    // Si retrocedemos, no hay validación
    if (next < current) {
        document.getElementById(`step-${current}`).classList.remove('active');
        document.getElementById(`step-${next}`).classList.add('active');
        
        const progress = document.getElementById('progress');
        progress.style.width = `${((next) / 3) * 100}%`;
        return;
    }

    const currentStepDiv = document.getElementById(`step-${current}`);
    let allValid = true;

    // A. Validar inputs de texto (Nombre del Paciente, solo en el paso 1)
    const textInputs = currentStepDiv.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        const wrapper = input.closest('.input-wrapper') || input;
        if (!input.value.trim()) {
            allValid = false;
            wrapper.classList.add('invalid-shake');
            input.focus();
            
            // Feedback háptico en móviles (si el navegador lo soporta)
            if (navigator.vibrate) navigator.vibrate(100);
            
            setTimeout(() => {
                wrapper.classList.remove('invalid-shake');
            }, 400);
        } else {
            wrapper.classList.remove('invalid-shake');
        }
    });

    // B. Validar inputs ocultos que corresponden a las Option Cards
    const hiddenInputs = currentStepDiv.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => {
        const group = currentStepDiv.querySelector(`.option-cards-group[data-input-id="${input.id}"]`);
        if (!input.value) {
            allValid = false;
            if (group) {
                group.classList.add('invalid-shake');
                group.style.outline = '2px solid var(--triage-red)';
                
                if (navigator.vibrate) navigator.vibrate(100);
                
                setTimeout(() => {
                    group.classList.remove('invalid-shake');
                }, 400);
            }
        } else {
            if (group) {
                group.style.outline = 'none';
            }
        }
    });

    if (!allValid) {
        return; // Interrumpe el avance si hay errores
    }

    // Transición de pasos
    document.getElementById(`step-${current}`).classList.remove('active');
    document.getElementById(`step-${next}`).classList.add('active');

    // Actualizar barra de progreso
    const progress = document.getElementById('progress');
    progress.style.width = `${(next / 3) * 100}%`;
}

/**
 * Corre el Motor de Inferencia Avanzado y genera el diagnóstico y prioridad de Triage
 */
function evaluateTriage() {
    // 1. Recolección de hechos desde las Option Cards (inputs ocultos)
    const patientName = document.getElementById('paciente-nombre').value.trim() || "Paciente Anónimo";
    const facts = {
        conciencia: document.getElementById('conciencia').value,
        equilibrio: document.getElementById('equilibrio').value,
        respiracion: document.getElementById('respiracion').value,
        temperatura: document.getElementById('temperatura').value,
        presion: document.getElementById('presion').value,
        dolor_pecho: document.getElementById('dolor_pecho').value,
        tos: document.getElementById('tos').value,
        digestivo: document.getElementById('digestivo').value
    };

    // Validar el paso 3 antes de evaluar
    if (!facts.tos || !facts.digestivo) {
        nextStep(3, 3); // Activa el feedback visual de campos faltantes en el paso 3
        return;
    }

    // 2. Variables de Conclusión
    let resultLevel = "";
    let resultColor = "";
    let glowColor = "";
    let diagnosis = "";
    let ruleApplied = "";

    // --- REGLAS DEL SISTEMA EXPERTO (Encadenamiento hacia adelante con priorización crítica) ---

    // REGLA 1: Accidente Cerebrovascular (ACV) - Código ICTUS (Rojo)
    if (facts.equilibrio === "perdida" && (facts.conciencia === "confuso" || facts.conciencia === "inconsciente")) {
        resultLevel = "PRIORIDAD I - ROJO";
        resultColor = "var(--triage-red)";
        glowColor = "var(--triage-red-glow)";
        diagnosis = "⚠️ ALERTA CÓDIGO ICTUS: Posible Accidente Cerebrovascular (ACV). Daño neurológico agudo en curso. Requiere tomografía y trombolisis inmediata.";
        ruleApplied = 'IF (equilibrio == "perdida" AND conciencia IN ["confuso", "inconsciente"])\nTHEN triage = "ROJO (PRIORIDAD I)" AND diagnostico = "ACV AGUDO"';
    }
    // REGLA 2: Infarto Agudo de Miocardio - Código Infarto (Rojo)
    else if (facts.dolor_pecho === "si" && (facts.respiracion === "si" || facts.presion === "baja" || facts.conciencia === "inconsciente")) {
        resultLevel = "PRIORIDAD I - ROJO";
        resultColor = "var(--triage-red)";
        glowColor = "var(--triage-red-glow)";
        diagnosis = "⚠️ ALERTA CÓDIGO INFARTO: Posible Infarto Agudo de Miocardio (IAM). Compromiso cardíaco mayor. Tomar ECG en menos de 10 minutos.";
        ruleApplied = 'IF (dolor_pecho == "si" AND (respiracion == "si" OR presion == "baja" OR conciencia == "inconsciente"))\nTHEN triage = "ROJO (PRIORIDAD I)" AND diagnostico = "IAM / CRISIS CORONARIA"';
    }
    // REGLA 3: Infección Respiratoria Aguda Grave (IRAG / Neumonía) (Naranja)
    else if (facts.temperatura === "fiebre" && facts.tos !== "ninguna" && facts.respiracion === "si") {
        resultLevel = "PRIORIDAD II - NARANJA";
        resultColor = "var(--triage-orange)";
        glowColor = "var(--triage-orange-glow)";
        diagnosis = "🫁 Neumonía Grave / IRAG (Infección Respiratoria Aguda Grave). Riesgo inminente de insuficiencia respiratoria severa (hipoxia).";
        ruleApplied = 'IF (temperatura == "fiebre" AND tos != "ninguna" AND respiracion == "si")\nTHEN triage = "NARANJA (PRIORIDAD II)" AND diagnostico = "IRAG/NEUMONÍA GRAVE"';
    }
    // REGLA 4: Gastroenteritis Aguda / Deshidratación Sistémica (Amarillo)
    else if (facts.digestivo === "nauseas" && facts.temperatura === "fiebre") {
        resultLevel = "PRIORIDAD III - AMARILLO";
        resultColor = "var(--triage-yellow)";
        glowColor = "var(--triage-yellow-glow)";
        diagnosis = "🦠 Infección Gastrointestinal Aguda (Gastroenteritis) con fiebre. Riesgo moderado de deshidratación e intolerancia a la vía oral.";
        ruleApplied = 'IF (digestivo == "nauseas" AND temperatura == "fiebre")\nTHEN triage = "AMARILLO (PRIORIDAD III)" AND diagnostico = "GASTROENTERITIS ACUTA"';
    }
    // REGLA 5: Paciente Fisiológicamente Estable (Verde)
    else if (facts.conciencia === "alerta" && facts.equilibrio === "normal" && facts.respiracion === "no" && 
             facts.temperatura === "normal" && facts.presion === "normal" && facts.dolor_pecho === "no" && 
             facts.tos === "ninguna" && facts.digestivo === "ninguno") {
        resultLevel = "PRIORIDAD V - VERDE";
        resultColor = "var(--triage-green)";
        glowColor = "var(--triage-green-glow)";
        diagnosis = "✅ Paciente Clínicamente Estable. No se detectan anomalías en las funciones vitales. Puede ser atendido en consulta general.";
        ruleApplied = 'IF (todas_las_variables == "normal / estable / negativo")\nTHEN triage = "VERDE (PRIORIDAD V)" AND diagnostico = "ESTABLE"';
    }
    // REGLA POR DEFECTO: Evaluación Clínica en Urgencias (Amarillo)
    else {
        resultLevel = "PRIORIDAD III - AMARILLO";
        resultColor = "var(--triage-yellow)";
        glowColor = "var(--triage-yellow-glow)";
        diagnosis = "⚠️ Síntomas sistémicos inespecíficos. Requiere evaluación médica rápida en box para descartar patología evolutiva.";
        ruleApplied = 'IF (sintomas_multiples_leves OR descompensacion_menor)\nTHEN triage = "AMARILLO (PRIORIDAD III)" AND diagnostico = "EVALUAR SÍNTOMAS INESPECÍFICOS"';
    }

    // Salvar estado activo de triage para el modal
    currentTriageColor = resultColor;
    currentTriageText = resultLevel;

    // 3. UI Update - Cambiar de pantallas
    document.getElementById('wizard-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');

    // Actualizar nombre en la UI
    document.getElementById('result-patient-name').innerHTML = `Paciente: <span>${patientName}</span>`;

    // Actualizar caja de prioridad
    const resultBox = document.getElementById('triage-result');
    resultBox.textContent = resultLevel;
    resultBox.style.backgroundColor = resultColor;
    resultBox.style.boxShadow = `0 0 35px ${glowColor}`;
    
    // Contraste para textos oscuros en fondos claros
    if (resultColor === "var(--triage-yellow)" || resultColor === "var(--triage-green)") {
        resultBox.style.color = "#070a13";
    } else {
        resultBox.style.color = "#ffffff";
    }

    // Actualizar caja de patología
    const diagnosisBox = document.getElementById('disease-diagnosis');
    diagnosisBox.innerHTML = diagnosis;
    diagnosisBox.style.borderLeftColor = resultColor;
    diagnosisBox.style.color = resultColor;

    // Mostrar regla aplicada
    document.getElementById('rule-used').textContent = ruleApplied;

    // 4. ANIMAR CEREBRO HOLOGRÁFICO SVG DENTRO DE LA UI (Feedback visual único)
    const glowingBrain = document.getElementById('glowing-brain');
    if (glowingBrain) {
        const paths = glowingBrain.querySelectorAll('path, line');
        const nodes = glowingBrain.querySelectorAll('.node-pulse');
        
        paths.forEach(p => {
            p.setAttribute('stroke', resultColor);
            p.style.opacity = "0.9";
            p.style.transition = "stroke 0.8s ease";
        });
        nodes.forEach(n => {
            n.setAttribute('fill', resultColor);
            n.style.transition = "fill 0.8s ease";
        });
    }

    // 5. Guardar en Historial Clínico Local
    saveTriageCase(patientName, resultLevel, resultColor, diagnosis, ruleApplied);
}

/**
 * Resetea el formulario y reorienta al paso 1
 */
function resetForm() {
    // Reset de inputs
    document.getElementById('triage-form').reset();
    document.getElementById('paciente-nombre').value = "";
    
    // Limpiar option cards e inputs ocultos
    document.querySelectorAll('input[type="hidden"]').forEach(input => {
        input.value = "";
    });
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Reset de vistas
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('wizard-container').classList.remove('hidden');
    
    // Activar paso 1
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    
    // Barra de progreso
    document.getElementById('progress').style.width = '33.33%';
}

/**
 * Inicia una nueva evaluación desde la pestaña de historial de manera fluida (HCI Improvement)
 */
function startNewEvaluationFromHistory() {
    resetForm();
    switchTab('eval');
    
    // Enfocar automáticamente el campo del nombre para reducir clics (HCI Heuristic)
    setTimeout(() => {
        const nameInput = document.getElementById('paciente-nombre');
        if (nameInput) nameInput.focus();
    }, 150);
}


/**
 * Controla el Tab Switcher (HCI Navigation Improvement)
 */
function switchTab(tab) {
    const btnEval = document.getElementById('tab-eval');
    const btnHist = document.getElementById('tab-hist');
    const wizardView = document.getElementById('wizard-container');
    const resultView = document.getElementById('result-container');
    const historyView = document.getElementById('history-container');

    if (tab === 'eval') {
        btnEval.classList.add('active');
        btnHist.classList.remove('active');
        
        // Si hay resultados activos en pantalla, mostrar la pantalla de resultados
        if (!resultView.classList.contains('hidden')) {
            resultView.classList.remove('hidden');
            wizardView.classList.add('hidden');
        } else {
            wizardView.classList.remove('hidden');
            resultView.classList.add('hidden');
        }
        historyView.classList.add('hidden');
    } else if (tab === 'hist') {
        btnHist.classList.add('active');
        btnEval.classList.remove('active');
        
        wizardView.classList.add('hidden');
        resultView.classList.add('hidden');
        historyView.classList.remove('hidden');
        
        // Refrescar renderizado del historial al abrir la pestaña
        renderHistory();
    }
}

/**
 * Abre el Modal de Recomendaciones según el color de triage activo
 */
function openRecommendations() {
    const modal = document.getElementById('recommendations-modal');
    const title = document.getElementById('modal-title');
    const targetTime = document.getElementById('modal-target-time');
    const actionsList = document.getElementById('modal-actions-list');
    const alarmBox = document.getElementById('modal-warning-signals');
    const priorityIcon = document.getElementById('modal-priority-icon');

    // Limpiar lista
    actionsList.innerHTML = "";

    // Configurar contenido según Triage
    if (currentTriageColor === "var(--triage-red)") {
        priorityIcon.textContent = "🚨";
        title.textContent = "Protocolo de Emergencia Crítica - Código Rojo";
        targetTime.textContent = "Inmediato (0 minutos de espera)";
        targetTime.style.backgroundColor = "rgba(244, 63, 94, 0.15)";
        targetTime.style.color = "var(--triage-red)";
        targetTime.style.borderColor = "rgba(244, 63, 94, 0.3)";

        const actions = [
            "Trasladar de inmediato al paciente al Box de Reanimación (Shock-Trauma).",
            "Notificar con urgencia al médico intensivista o de emergencias de guardia.",
            "Canalizar dos accesos venosos periféricos de grueso calibre (18G o superior).",
            "Iniciar oxigenoterapia para mantener saturación de oxígeno por encima de 94%.",
            "Conectar monitorización cardíaca continua, oximetría y presión arterial automática.",
            "En caso de sospecha de Infarto, tomar electrocardiograma (ECG) en menos de 10 min.",
            "En caso de sospecha de ACV, activar inmediatamente el protocolo de Código Ictus."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>CRÍTICO:</strong> Vigilar estrechamente signos de colapso respiratorio, cianosis progresiva, pérdida del pulso periférico y ritmo cardíaco.";
        alarmBox.style.backgroundColor = "var(--alarm-red-bg)";
        alarmBox.style.color = "var(--alarm-red-text)";
        alarmBox.style.borderColor = "var(--alarm-red-border)";

    } else if (currentTriageColor === "var(--triage-orange)") {
        priorityIcon.textContent = "🔥";
        title.textContent = "Protocolo Muy Urgente - Código Naranja";
        targetTime.textContent = "Atención máxima en 15 minutos";
        targetTime.style.backgroundColor = "rgba(251, 146, 60, 0.15)";
        targetTime.style.color = "var(--triage-orange)";
        targetTime.style.borderColor = "rgba(251, 146, 60, 0.3)";

        const actions = [
            "Ubicación preferente en camilla del área de observación o cuidados intermedios.",
            "Evaluación por médico clínico en un tiempo no mayor a 15 minutos.",
            "Instalar acceso venoso y tomar muestras de sangre basales.",
            "Control y registro minucioso de temperatura corporal y frecuencia respiratoria.",
            "Reposo absoluto y monitorización intermitente de saturación de oxígeno."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>ALERTA:</strong> Reportar de inmediato si se presenta descompensación neurológica súbita, incremento severo de la disnea o hipotensión progresiva.";
        alarmBox.style.backgroundColor = "var(--alarm-orange-bg)";
        alarmBox.style.color = "var(--alarm-orange-text)";
        alarmBox.style.borderColor = "var(--alarm-orange-border)";

    } else if (currentTriageColor === "var(--triage-yellow)") {
        priorityIcon.textContent = "🟡";
        title.textContent = "Protocolo de Urgencia - Código Amarillo";
        targetTime.textContent = "Atención dentro de 60 minutos";
        targetTime.style.backgroundColor = "rgba(250, 204, 21, 0.1)";
        targetTime.style.color = "var(--triage-yellow)";
        targetTime.style.borderColor = "rgba(250, 204, 21, 0.2)";

        const actions = [
            "Asignar espacio en sala de espera asistida o Box de Urgencias leve.",
            "Control de signos vitales completos cada 30 minutos.",
            "Evaluar el nivel de dolor en escala visual análoga (EVA).",
            "Iniciar medidas generales (e.g., hidratación oral controlada si está indicada)."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>NOTA:</strong> Educar al paciente en sala de espera para alertar si presenta dolor de pecho, asfixia o pérdida de fuerza motriz.";
        alarmBox.style.backgroundColor = "var(--alarm-yellow-bg)";
        alarmBox.style.color = "var(--alarm-yellow-text)";
        alarmBox.style.borderColor = "var(--alarm-yellow-border)";

    } else { // Verde
        priorityIcon.textContent = "🟢";
        title.textContent = "Protocolo Estable - Código Verde";
        targetTime.textContent = "Atención hasta 120 minutos (No Urgente)";
        targetTime.style.backgroundColor = "rgba(74, 222, 128, 0.1)";
        targetTime.style.color = "var(--triage-green)";
        targetTime.style.borderColor = "rgba(74, 222, 128, 0.2)";

        const actions = [
            "Explicar de forma empática al paciente su nivel de triage y el tiempo estimado.",
            "Direccionar de forma segura a consulta médica externa o atención primaria.",
            "Entregar folleto instructivo clínico de cuidados generales.",
            "No requiere canalización de vías ni toma de muestras urgentes."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>PREVENCIÓN:</strong> Dar indicaciones de regresar a urgencias únicamente si desarrolla fiebre incontrolable, vómitos repetitivos o disnea.";
        alarmBox.style.backgroundColor = "var(--alarm-green-bg)";
        alarmBox.style.color = "var(--alarm-green-text)";
        alarmBox.style.borderColor = "var(--alarm-green-border)";
    }

    modal.classList.remove('hidden');
    modal.focus();
}

/**
 * Cierra el modal de recomendaciones
 */
function closeRecommendations() {
    document.getElementById('recommendations-modal').classList.add('hidden');
}

/**
 * Cierra el modal al hacer click en el overlay oscuro exterior
 */
function closeRecommendationsOnOverlay(event) {
    if (event.target === document.getElementById('recommendations-modal')) {
        closeRecommendations();
    }
}

/**
 * Contrae o despliega la lógica de inferencia
 */
function toggleRulesUsed() {
    const content = document.getElementById('rules-content');
    const header = document.querySelector('.rules-header h3 span');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        header.textContent = "[-]";
    } else {
        content.classList.add('hidden');
        header.textContent = "[+]";
    }
}

/* ==========================================================================
   HISTORIAL DE PACIENTES - PERSISTENCIA (LOCAL STORAGE)
   ========================================================================== */

/**
 * Guarda un caso de Triage en LocalStorage y actualiza el badge e historial
 */
function saveTriageCase(name, resultText, colorVar, diagnosis, ruleUsed) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('triageHistory')) || [];
    } catch(e) {
        history = [];
    }

    const newCase = {
        id: Date.now(),
        name: name,
        resultText: resultText,
        colorVar: colorVar,
        diagnosis: diagnosis,
        ruleUsed: ruleUsed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    history.unshift(newCase); // Añadir al inicio del arreglo
    localStorage.setItem('triageHistory', JSON.stringify(history));

    updateHistoryBadge();
}

/**
 * Actualiza el contador circular de la pestaña de historial
 */
function updateHistoryBadge() {
    const badge = document.getElementById('history-badge');
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('triageHistory')) || [];
    } catch(e) {
        history = [];
    }

    if (history.length > 0) {
        badge.textContent = history.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/**
 * Renderiza el listado del historial en el DOM con soporte de búsquedas
 */
function renderHistory() {
    const listView = document.getElementById('history-list-view');
    const searchVal = document.getElementById('history-search').value.toLowerCase().trim();
    
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('triageHistory')) || [];
    } catch(e) {
        history = [];
    }

    // Limpiar vista
    listView.innerHTML = "";

    // Filtrar por búsqueda si es aplicable
    const filteredHistory = history.filter(item => {
        return item.name.toLowerCase().includes(searchVal) || item.resultText.toLowerCase().includes(searchVal);
    });

    if (filteredHistory.length === 0) {
        listView.innerHTML = `
            <div class="empty-state">
                <span>${searchVal ? "🔍" : "🩺"}</span>
                <p>${searchVal ? "No se encontraron pacientes que coincidan." : "No hay evaluaciones de triage registradas hoy."}</p>
                ${searchVal ? "" : `
                <button class="btn btn-primary mt-4" style="width: auto; padding: 0.8rem 1.5rem;" onclick="startNewEvaluationFromHistory()">
                    ➕ Nuevo Diagnóstico
                </button>`}
            </div>
        `;
        return;
    }

    filteredHistory.forEach(item => {
        // Crear tarjeta de historial
        const card = document.createElement('div');
        card.className = "history-card";
        card.style.borderLeftColor = item.colorVar;

        // Truncar diagnóstico largo
        const shortDiag = item.diagnosis.length > 105 ? item.diagnosis.substring(0, 105) + "..." : item.diagnosis;

        card.innerHTML = `
            <div class="history-card-left">
                <span class="h-name">${item.name}</span>
                <span class="h-diag">${shortDiag}</span>
                <span class="h-time">🕒 Evaluado a las: ${item.time}</span>
            </div>
            <div class="history-card-right">
                <span class="h-badge" style="background-color: ${item.colorVar}">${item.resultText}</span>
                <button class="btn-delete-card" onclick="deleteHistoryCard(${item.id})" title="Eliminar registro">
                    🗑️
                </button>
            </div>
        `;

        listView.appendChild(card);
    });
}

/**
 * Elimina una tarjeta específica de historial
 */
function deleteHistoryCard(id) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('triageHistory')) || [];
    } catch(e) {
        history = [];
    }

    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem('triageHistory', JSON.stringify(updatedHistory));

    updateHistoryBadge();
    renderHistory();
}

/**
 * Borra toda la lista del historial local
 */
function clearHistory() {
    if (confirm("¿Está seguro de que desea eliminar permanentemente todo el historial clínico de este turno?")) {
        localStorage.removeItem('triageHistory');
        updateHistoryBadge();
        renderHistory();
    }
}

/**
 * Alterna entre el tema claro y el tema oscuro
 */
function toggleTheme() {
    const html = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const isLight = html.classList.toggle('light-theme');
    
    if (isLight) {
        localStorage.setItem('triageTheme', 'light');
        if (toggleBtn) toggleBtn.querySelector('.toggle-icon').textContent = '☀️';
    } else {
        localStorage.setItem('triageTheme', 'dark');
        if (toggleBtn) toggleBtn.querySelector('.toggle-icon').textContent = '🌙';
    }
}
