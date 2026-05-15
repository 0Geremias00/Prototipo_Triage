/**
 * Asistente AI Premium - Motor de Inferencia Extendido
 * Diagnóstico de patologías específicas y asignación de Triage
 */

function nextStep(current, next) {
    const currentStepDiv = document.getElementById(`step-${current}`);
    const selects = currentStepDiv.querySelectorAll('select');
    
    let allValid = true;
    selects.forEach(select => {
        if (!select.value) {
            allValid = false;
            select.style.borderColor = 'var(--triage-red)';
            select.style.boxShadow = '0 0 10px var(--triage-red-glow)';
        } else {
            select.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            select.style.boxShadow = 'none';
        }
    });

    if (!allValid) {
        // Reproducir pequeña vibración o animación (Feedback visual)
        currentStepDiv.style.transform = 'translateX(-10px)';
        setTimeout(() => currentStepDiv.style.transform = 'translateX(10px)', 100);
        setTimeout(() => currentStepDiv.style.transform = 'translateX(0)', 200);
        return;
    }

    document.getElementById(`step-${current}`).classList.remove('active');
    document.getElementById(`step-${next}`).classList.add('active');

    const progress = document.getElementById('progress');
    progress.style.width = `${(next / 3) * 100}%`;
}

function evaluateTriage() {
    // 1. Recolección de Hechos (Facts expandidos)
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

    // Validar último paso
    if (!facts.tos || !facts.digestivo) {
        nextStep(3, 3); // Llama la validación visual
        return;
    }

    // 2. Motor de Inferencia Inteligente
    let resultLevel = "";
    let resultColor = "";
    let glowColor = "";
    let diagnosis = "Observación General Recomendada.";
    let ruleApplied = "";

    // REGLA 1: ACV (Accidente Cerebrovascular) - Emergencia Neurológica
    if (facts.equilibrio === "perdida" && (facts.conciencia === "confuso" || facts.conciencia === "inconsciente")) {
        resultLevel = "PRIORIDAD I - ROJO";
        resultColor = "var(--triage-red)";
        glowColor = "var(--triage-red-glow)";
        diagnosis = "⚠️ ALERTA CÓDIGO ICTUS: Posible Accidente Cerebrovascular (ACV). Daño neurológico agudo inminente.";
        ruleApplied = 'IF (equilibrio == "perdida" AND conciencia != "alerta")\nTHEN diagnostico = "ACV" AND triage = "ROJO"';
    }
    // REGLA 2: Infarto Agudo de Miocardio - Emergencia Cardíaca
    else if (facts.dolor_pecho === "si" && (facts.respiracion === "si" || facts.presion === "baja" || facts.conciencia === "inconsciente")) {
        resultLevel = "PRIORIDAD I - ROJO";
        resultColor = "var(--triage-red)";
        glowColor = "var(--triage-red-glow)";
        diagnosis = "⚠️ ALERTA CÓDIGO INFARTO: Posible Infarto Agudo de Miocardio (IAM). Compromiso cardíaco severo.";
        ruleApplied = 'IF (dolor_pecho == "si" AND (respiracion == "si" OR presion == "baja"))\nTHEN diagnostico = "INFARTO" AND triage = "ROJO"';
    }
    // REGLA 3: Infección Respiratoria Aguda (Neumonía / COVID grave)
    else if (facts.temperatura === "fiebre" && facts.tos !== "ninguna" && facts.respiracion === "si") {
        resultLevel = "PRIORIDAD II - NARANJA";
        resultColor = "var(--triage-orange)";
        glowColor = "var(--triage-orange-glow)";
        diagnosis = "🫁 Posible Infección Respiratoria Aguda Grave (IRAG / Neumonía). Riesgo de hipoxia.";
        ruleApplied = 'IF (fiebre == "si" AND tos != "ninguna" AND respiracion == "si")\nTHEN diagnostico = "NEUMONÍA" AND triage = "NARANJA"';
    }
    // REGLA 4: Infección Gastrointestinal
    else if (facts.digestivo === "nauseas" && facts.temperatura === "fiebre") {
        resultLevel = "PRIORIDAD III - AMARILLO";
        resultColor = "var(--triage-yellow)";
        glowColor = "var(--triage-yellow-glow)";
        diagnosis = "🦠 Posible Infección Gastrointestinal con riesgo de deshidratación moderada.";
        ruleApplied = 'IF (digestivo == "nauseas" AND fiebre == "si")\nTHEN diagnostico = "GASTROENTERITIS" AND triage = "AMARILLO"';
    }
    // REGLA 5: Evaluación General Leve
    else if (facts.temperatura === "normal" && facts.presion === "normal" && facts.respiracion === "no" && facts.conciencia === "alerta") {
        resultLevel = "PRIORIDAD V - VERDE";
        resultColor = "var(--triage-green)";
        glowColor = "var(--triage-green-glow)";
        diagnosis = "✅ Paciente Estable. No se detectan patologías agudas de riesgo inminente.";
        ruleApplied = 'IF (todas_constantes == "normal")\nTHEN diagnostico = "ESTABLE" AND triage = "VERDE"';
    }
    // REGLA POR DEFECTO: Síntomas inespecíficos que requieren evaluación médica
    else {
        resultLevel = "PRIORIDAD III - AMARILLO";
        resultColor = "var(--triage-yellow)";
        glowColor = "var(--triage-yellow-glow)";
        diagnosis = "⚠️ Síntomas clínicos presentes que requieren evaluación médica en consulta de urgencias.";
        ruleApplied = 'IF (sintomas_combinados_leves)\nTHEN diagnostico = "EVALUAR" AND triage = "AMARILLO"';
    }

    // 3. UI Update (HCI)
    document.getElementById('wizard-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');

    const resultBox = document.getElementById('triage-result');
    resultBox.textContent = resultLevel;
    resultBox.style.backgroundColor = resultColor;
    resultBox.style.boxShadow = `0 0 30px ${glowColor}`;
    
    if (resultColor === "var(--triage-yellow)" || resultColor === "var(--triage-green)") {
        resultBox.style.color = "#000";
    } else {
        resultBox.style.color = "#fff";
    }

    const diagnosisBox = document.getElementById('disease-diagnosis');
    diagnosisBox.innerHTML = diagnosis;
    
    if(resultColor === "var(--triage-red)") {
        diagnosisBox.style.color = "#ef4444";
        diagnosisBox.style.borderLeftColor = "#ef4444";
    } else if (resultColor === "var(--triage-orange)") {
        diagnosisBox.style.color = "#f97316";
        diagnosisBox.style.borderLeftColor = "#f97316";
    } else {
        diagnosisBox.style.color = "#a78bfa";
        diagnosisBox.style.borderLeftColor = "#8b5cf6";
    }

    document.getElementById('rule-used').textContent = ruleApplied;
}

function resetForm() {
    document.getElementById('triage-form').reset();
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('wizard-container').classList.remove('hidden');
    
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    
    document.getElementById('progress').style.width = '33.33%';
}
