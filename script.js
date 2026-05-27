/**
 * Asistente AI Premium - Motor de Inferencia & UX Clinica Avanzada
 * Diagnóstico de patologías específicas, Triage Avanzado e Historial Persistente
 * Cumple con el Protocolo Manchester y las Heurísticas HCI.
 */

// Premium Web Audio Synthesizer for Interactive HCI Feedback
const AudioFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playSelect() {
        try {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.07);
            
            gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.07);
        } catch (e) {
            console.log("AudioContext blocked or not supported", e);
        }
    },
    playError() {
        try {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            osc.frequency.setValueAtTime(140, this.ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch (e) {
            console.log(e);
        }
    },
    playSuccess() {
        try {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Pentatonic Chord
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.05));
                
                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + (idx * 0.05) + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.7);
            });
        } catch (e) {
            console.log(e);
        }
    }
};

/**
 * MOTOR DE INFERENCIA DE ENCADENAMIENTO HACIA ADELANTE (FORWARD CHAINING)
 * Implementa la Base de Conocimiento del Triage Manchester con priorización de vida.
 */
class TriageInferenceEngine {
    constructor(facts) {
        this.facts = facts;
    }

    evaluate() {
        const {
            conciencia,
            equilibrio,
            presion_sistolica,
            temperatura,
            saturacion_o2,
            frecuencia_cardiaca,
            escala_dolor,
            dificultad_respiratoria,
            dolor_pecho,
            tos,
            sintomas_digestivos,
            // /* NUEVO */ Parámetros adicionales
            edad,
            dolor_eva,
            dolor_cabeza
        } = this.facts;

        let result = null;

        // HEURÍSTICA DE RESOLUCIÓN DE CONFLICTOS: PRIORIZACIÓN CRÍTICA (SHORT-CIRCUIT)
        
        // /* NUEVO */ REGLA 1: Hipoxia Crítica (ROJO)
        if (saturacion_o2 < 90) {
            result = {
                level: "PRIORIDAD I - ROJO",
                color: "var(--triage-red)",
                glowColor: "var(--triage-red-glow)",
                code: "hipoxia",
                diagnosis: "🚨 Hipoxia Severa / Fallo Respiratorio Agudo. Peligro inminente de asfixia o daño tisular irreversible. Iniciar oxigenoterapia de urgencia.",
                ruleApplied: 'IF (saturacion_o2 < 90)\nTHEN triage = "ROJO (PRIORIDAD I)" AND diagnostico = "HIPOXIA CRÍTICA"'
            };
        }
        // REGLA 2: Código ICTUS (ACV) -> Rojo (Inmediato)
        else if (equilibrio === "perdida" && (conciencia === "confuso" || conciencia === "inconsciente")) {
            result = {
                level: "PRIORIDAD I - ROJO",
                color: "var(--triage-red)",
                glowColor: "var(--triage-red-glow)",
                code: "acv",
                diagnosis: "⚠️ CÓDIGO ICTUS ACTIVADO: Accidente Cerebrovascular (ACV) Agudo. Daño neurológico focal en curso. Tomografía y trombolisis inmediatas.",
                ruleApplied: 'IF (equilibrio == "perdida" AND conciencia IN ["confuso", "inconsciente"])\nTHEN triage = "ROJO (PRIORIDAD I)" AND diagnostico = "ACV AGUDO"'
            };
        }
        // REGLA 3: Código INFARTO (IAM) -> Rojo (Inmediato)
        else if (dolor_pecho === "si" && (dificultad_respiratoria === true || presion_sistolica < 90 || conciencia === "inconsciente")) {
            result = {
                level: "PRIORIDAD I - ROJO",
                color: "var(--triage-red)",
                glowColor: "var(--triage-red-glow)",
                code: "iam",
                diagnosis: "⚠️ CÓDIGO INFARTO ACTIVADO: Infarto Agudo de Miocardio (IAM). Dolor opresivo coronario. Electrocardiograma (ECG) en menos de 10 min.",
                ruleApplied: 'IF (dolor_pecho == "si" AND (dificultad_respiratoria == true OR presion_sistolica < 90 OR conciencia == "inconsciente"))\nTHEN triage = "ROJO (PRIORIDAD I)" AND diagnostico = "IAM / CRISIS CORONARIA"'
            };
        }
        // /* NUEVO */ REGLA 4: Sepsis (NARANJA)
        else if (temperatura > 38.0 && presion_sistolica < 90 && frecuencia_cardiaca > 100) {
            result = {
                level: "PRIORIDAD II - NARANJA",
                color: "var(--triage-orange)",
                glowColor: "var(--triage-orange-glow)",
                code: "sepsis",
                diagnosis: "🫀 Posible Sepsis: Síndrome de Respuesta Inflamatoria Sistémica (SIRS) activo. Alto riesgo de shock séptico. Hidratación y antibióticos IV inmediatos.",
                ruleApplied: 'IF (temperatura > 38.0 AND presion_sistolica < 90 AND frecuencia_cardiaca > 100)\nTHEN triage = "NARANJA (PRIORIDAD II)" AND diagnostico = "POSIBLE SEPSIS: SIRS ACTIVO"'
            };
        }
        // /* NUEVO */ REGLA 5: Crisis Hipertensiva (NARANJA)
        else if (presion_sistolica > 160 && (dolor_cabeza === "severo" || conciencia === "confuso")) {
            result = {
                level: "PRIORIDAD II - NARANJA",
                color: "var(--triage-orange)",
                glowColor: "var(--triage-orange-glow)",
                code: "crisis_hipertensiva",
                diagnosis: "🧠 Crisis Hipertensiva urgente. Sospecha de daño en órgano diana. Control de presión guiado y analgésicos de urgencia.",
                ruleApplied: 'IF (presion_sistolica > 160 AND (dolor_cabeza == "severo" OR conciencia == "confuso"))\nTHEN triage = "NARANJA (PRIORIDAD II)" AND diagnostico = "CRISIS HIPERTENSIVA URGENTE"'
            };
        }
        // /* NUEVO */ REGLA 6: Crisis Asmática (NARANJA)
        else if (dificultad_respiratoria === true && tos !== "ninguna" && saturacion_o2 < 95) {
            result = {
                level: "PRIORIDAD II - NARANJA",
                color: "var(--triage-orange)",
                glowColor: "var(--triage-orange-glow)",
                code: "crisis_asmatica",
                diagnosis: "🫁 Crisis Asmática aguda. Broncoespasmo severo con hipoxia. Nebulización urgente con broncodilatadores y corticoides.",
                ruleApplied: 'IF (dificultad_respiratoria == true AND tos != "ninguna" AND saturacion_o2 < 95)\nTHEN triage = "NARANJA (PRIORIDAD II)" AND diagnostico = "CRISIS ASMÁTICA AGUDA"'
            };
        }
        // REGLA 7: Código NARANJA (IRAG / Neumonía original)
        else if (
            (temperatura > 39.0 && presion_sistolica < 90) ||
            (frecuencia_cardiaca > 120 && temperatura > 38.0) ||
            (temperatura > 38.0 && tos !== "ninguna" && dificultad_respiratoria === true)
        ) {
            result = {
                level: "PRIORIDAD II - NARANJA",
                color: "var(--triage-orange)",
                glowColor: "var(--triage-orange-glow)",
                code: "irag",
                diagnosis: "🫁 Código NARANJA: Infección Respiratoria Aguda Grave (IRAG) / Neumonía Grave. Riesgo elevado de insuficiencia ventilatoria severa.",
                ruleApplied: 'IF (temperatura > 39.0 AND presion_sistolica < 90)\n   OR (frecuencia_cardiaca > 120 AND temperatura > 38.0)\n   OR (temperatura > 38.0 AND tos != "ninguna" AND dificultad_respiratoria == true)\nTHEN triage = "NARANJA (PRIORIDAD II)" AND diagnostico = "IRAG / NEUMONÍA GRAVE"'
            };
        }
        // REGLA 8: Código AMARILLO (Dolor Agudo / Crisis / Gastro original)
        else if (
            (escala_dolor > 7 && presion_sistolica > 160) ||
            (sintomas_digestivos === "nauseas" && temperatura > 38.0) ||
            (sintomas_digestivos === "vomitos" && temperatura > 38.0)
        ) {
            result = {
                level: "PRIORIDAD III - AMARILLO",
                color: "var(--triage-yellow)",
                glowColor: "var(--triage-yellow-glow)",
                code: "gastro",
                diagnosis: "⚠️ Código AMARILLO: Gastroenteritis Aguda / Crisis Hipertensiva Moderada. Requiere canalización, hidratación IV y monitoreo hemodinámico rápido.",
                ruleApplied: 'IF (escala_dolor > 7 AND presion_sistolica > 160)\n   OR (sintomas_digestivos IN ["nauseas", "vomitos"] AND temperatura > 38.0)\nTHEN triage = "AMARILLO (PRIORIDAD III)" AND diagnostico = "GASTROENTERITIS / DOLOR AGUDO"'
            };
        }
        // REGLA 9: Código VERDE (Estable)
        else if (
            temperatura < 37.5 &&
            escala_dolor < 3 &&
            saturacion_o2 > 95 &&
            conciencia === "alerta" &&
            equilibrio === "normal" &&
            dificultad_respiratoria === false &&
            dolor_pecho === "no" &&
            tos === "ninguna" &&
            sintomas_digestivos === "ninguno" &&
            presion_sistolica >= 90 && presion_sistolica <= 140 &&
            frecuencia_cardiaca >= 60 && frecuencia_cardiaca <= 100
        ) {
            result = {
                level: "PRIORIDAD IV - VERDE",
                color: "var(--triage-green)",
                glowColor: "var(--triage-green-glow)",
                code: "estable",
                diagnosis: "✅ Código VERDE: Paciente Clínicamente Estable. Signos vitales en rangos basales. Puede ser atendido en consulta externa programada.",
                ruleApplied: 'IF (temperatura < 37.5 AND escala_dolor < 3 AND saturacion_o2 > 95 AND todas_las_demas_variables_estables_o_negativas)\nTHEN triage = "VERDE (PRIORIDAD IV)" AND diagnostico = "PACIENTE CLÍNICAMENTE ESTABLE"'
            };
        }
        // REGLA 10: REGLA POR DEFECTO (Inespecífico)
        else {
            result = {
                level: "PRIORIDAD III - AMARILLO",
                color: "var(--triage-yellow)",
                glowColor: "var(--triage-yellow-glow)",
                code: "default",
                diagnosis: "⚠️ Código AMARILLO (Inespecífico): Evaluación Clínica Completa Requerida. Síntomas sistémicos inespecíficos descompensados. Controlar signos vitales cada 30 min.",
                ruleApplied: 'IF (ninguna_otra_regla_activada)\nTHEN triage = "AMARILLO (PRIORIDAD III)" AND diagnostico = "EVALUAR SÍNTOMAS INESPECÍFICOS"'
            };
        }

        // /* NUEVO */ REGLA 11: Adulto Mayor Vulnerable (ESCALACIÓN)
        if (result.level !== "PRIORIDAD I - ROJO" && edad === "adulto_mayor" && (temperatura > 38.0 || presion_sistolica < 90 || presion_sistolica > 140)) {
            const originalLevel = result.level;
            if (result.level === "PRIORIDAD IV - VERDE") {
                result.level = "PRIORIDAD III - AMARILLO";
                result.color = "var(--triage-yellow)";
                result.glowColor = "var(--triage-yellow-glow)";
            } else if (result.level === "PRIORIDAD III - AMARILLO") {
                result.level = "PRIORIDAD II - NARANJA";
                result.color = "var(--triage-orange)";
                result.glowColor = "var(--triage-orange-glow)";
            } else if (result.level === "PRIORIDAD II - NARANJA") {
                result.level = "PRIORIDAD I - ROJO";
                result.color = "var(--triage-red)";
                result.glowColor = "var(--triage-red-glow)";
            }
            result.diagnosis = `👵 [VULNERABILIDAD AM] - ${result.diagnosis} (Nivel escalado automáticamente por edad avanzada y alteración térmica/hemodinámica)`;
            result.ruleApplied += `\n\n/* ESCALACIÓN DE ADULTO MAYOR VULNERABLE */\nIF (edad == "adulto_mayor" AND (temperatura > 38.0 OR presion_sistolica < 90 OR presion_sistolica > 140))\nTHEN ESCALAR_TRIAGE (Baseline: ${originalLevel} -> Final: ${result.level})`;
        }

        return result;
    }
}

// Utility to get user friendly label for requested area
function getAreaLabel(area) {
    const mapping = {
        'urgencias': '🏥 Urgencias',
        'general': '🩺 Medicina General',
        'pediatria': '👶 Pediatría',
        'trauma': '🦴 Traumatología',
        'gineco': '🤰 Ginecología'
    };
    return mapping[area] || area || 'No especificada';
}

// Variables globales para almacenar el triage activo actual
let currentTriageColor = "var(--primary-color)";
let currentTriageText = "PRIORIDAD V - VERDE";
let currentTriageCode = "default";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Vincular los event handlers de las Option Cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        
        const selectCard = () => {
            const group = card.closest('.option-cards-group');
            const inputId = group.getAttribute('data-input-id');
            const hiddenInput = document.getElementById(inputId);
            
            group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            hiddenInput.value = card.getAttribute('data-value');
            
            group.classList.remove('invalid-shake');
            group.style.outline = 'none';

            // Sonido de clic interactivo
            AudioFX.playSelect();
        };

        card.addEventListener('click', selectCard);
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
    /* NUEVO */ startCountdownTimers();

    // 3. Inicializar el botón de cambio de tema
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
        const isLight = document.documentElement.classList.contains('light-theme');
        toggleBtn.querySelector('.toggle-icon').textContent = isLight ? '☀️' : '🌙';
        toggleBtn.addEventListener('click', toggleTheme);
    }
});

/**
 * Controla el flujo paso a paso del Wizard con validación avanzada y feedback auditivo/visual
 */
function nextStep(current, next) {
    if (next < current) {
        document.getElementById(`step-${current}`).classList.remove('active');
        document.getElementById(`step-${next}`).classList.add('active');
        
        const progress = document.getElementById('progress');
        progress.style.width = `${((next) / 3) * 100}%`;
        return;
    }

    const currentStepDiv = document.getElementById(`step-${current}`);
    let allValid = true;

    // A. Validar inputs de texto
    const textInputs = currentStepDiv.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        const wrapper = input.closest('.input-wrapper') || input;
        if (!input.value.trim()) {
            allValid = false;
            wrapper.classList.add('invalid-shake');
            input.focus();
            
            if (navigator.vibrate) navigator.vibrate(100);
            AudioFX.playError();
            
            setTimeout(() => {
                wrapper.classList.remove('invalid-shake');
            }, 400);
        } else {
            wrapper.classList.remove('invalid-shake');
        }
    });

    // B. Validar inputs numéricos de Constantes Vitales
    const numericInputs = currentStepDiv.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        const wrapper = input.closest('.vital-input-wrapper') || input;
        const val = parseFloat(input.value);
        const min = parseFloat(input.getAttribute('min'));
        const max = parseFloat(input.getAttribute('max'));
        
        if (isNaN(val) || val < min || val > max) {
            allValid = false;
            wrapper.classList.add('invalid-shake');
            input.focus();
            
            if (navigator.vibrate) navigator.vibrate(100);
            AudioFX.playError();
            
            setTimeout(() => {
                wrapper.classList.remove('invalid-shake');
            }, 400);
        } else {
            wrapper.classList.remove('invalid-shake');
        }
    });

    // C. Validar inputs ocultos de Option Cards
    const hiddenInputs = currentStepDiv.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => {
        const group = currentStepDiv.querySelector(`.option-cards-group[data-input-id="${input.id}"]`);
        if (!input.value) {
            allValid = false;
            if (group) {
                group.classList.add('invalid-shake');
                group.style.outline = '2px solid var(--triage-red)';
                
                if (navigator.vibrate) navigator.vibrate(100);
                AudioFX.playError();
                
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
        return;
    }

    // Transición de pasos
    AudioFX.playSelect();
    document.getElementById(`step-${current}`).classList.remove('active');
    document.getElementById(`step-${next}`).classList.add('active');

    // Actualizar barra de progreso
    const progress = document.getElementById('progress');
    progress.style.width = `${(next / 3) * 100}%`;
}

/**
 * Inicia la animación del cargador de IA y evalúa el triage con encadenamiento hacia adelante
 */
function evaluateTriage() {
    const patientName = document.getElementById('paciente-nombre').value.trim() || "Paciente Anónimo";
    
    // /* NUEVO */ Mapear escala EVA a valor numérico para compatibilidad
    const dolorEvaMap = { 'sin_dolor': 0, 'leve': 2, 'moderado': 5, 'severo': 8 };
    const escalaDolorVal = dolorEvaMap[document.getElementById('dolor_eva').value] || 0;

    const facts = {
        area_solicitada: document.getElementById('area_solicitada').value,
        conciencia: document.getElementById('conciencia').value,
        equilibrio: document.getElementById('equilibrio').value,
        presion_sistolica: parseInt(document.getElementById('presion_sistolica').value),
        temperatura: parseFloat(document.getElementById('temperatura').value),
        saturacion_o2: parseInt(document.getElementById('saturacion_o2').value),
        frecuencia_cardiaca: parseInt(document.getElementById('frecuencia_cardiaca').value),
        escala_dolor: escalaDolorVal,
        dificultad_respiratoria: document.getElementById('dificultad_respiratoria').value === 'true',
        dolor_pecho: document.getElementById('dolor_pecho').value,
        tos: document.getElementById('tos').value,
        sintomas_digestivos: document.getElementById('sintomas_digestivos').value,
        // /* NUEVO */ Parámetros ampliados
        edad: document.getElementById('edad').value,
        dolor_eva: document.getElementById('dolor_eva').value,
        dolor_cabeza: document.getElementById('dolor_cabeza').value
    };

    // Validar paso 3
    const dificultadRaw = document.getElementById('dificultad_respiratoria').value;
    if (!dificultadRaw || !facts.dolor_pecho || !facts.tos || !facts.sintomas_digestivos || !facts.dolor_eva || !facts.dolor_cabeza) {
        nextStep(3, 3);
        return;
    }

    // --- FUTURISTIC LOADER SEQUENCE ---
    const loader = document.getElementById('ai-loader');
    const loaderProgress = document.getElementById('loader-progress');
    
    if (loader && loaderProgress) {
        loader.classList.remove('hidden');
        loaderProgress.style.width = '0%';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            loaderProgress.style.width = `${progress}%`;
            
            // Tic-tac sound
            AudioFX.playSelect();
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    finalizeTriageEvaluation(patientName, facts);
                }, 250);
            }
        }, 100);
    } else {
        finalizeTriageEvaluation(patientName, facts);
    }
}

/**
 * /* NUEVO */ Calcula el Score NEWS2 Simplificado (0 a 20 pts)
 */
function calculateNEWS2(facts) {
    let score = 0;
    
    // 1. Frecuencia Respiratoria / Dificultad
    if (facts.dificultad_respiratoria) {
        score += 3; // Equivalente a taquipnea severa
    }
    
    // 2. Saturación de Oxígeno (SpO2)
    const spo2 = facts.saturacion_o2;
    if (spo2 >= 96) score += 0;
    else if (spo2 >= 94) score += 1;
    else if (spo2 >= 92) score += 2;
    else score += 3; // < 92%
    
    // 3. Presión Sistólica
    const bps = facts.presion_sistolica;
    if (bps <= 90 || bps >= 220) score += 3;
    else if (bps <= 100) score += 2;
    else if (bps <= 110) score += 1;
    else score += 0; // 111 - 219
    
    // 4. Frecuencia Cardíaca
    const hr = facts.frecuencia_cardiaca;
    if (hr <= 40 || hr >= 131) score += 3;
    else if (hr <= 50) score += 1;
    else if (hr >= 111 && hr <= 130) score += 2;
    else if (hr >= 91 && hr <= 110) score += 1;
    else score += 0; // 51 - 90
    
    // 5. Temperatura Corporal
    const temp = facts.temperatura;
    if (temp <= 35.0) score += 3;
    else if (temp <= 36.0) score += 1;
    else if (temp >= 39.1) score += 2;
    else if (temp >= 38.1) score += 1;
    else score += 0; // 36.1 - 38.0
    
    // 6. Estado de Conciencia
    if (facts.conciencia !== 'alerta') {
        score += 3; // Confuso o inconsciente sumará 3 puntos en NEWS2
    }
    
    return score;
}

/**
 * Concluye la evaluación de triage clínica
 */
function finalizeTriageEvaluation(patientName, facts) {
    // Invocar el motor de inferencia (Forward Chaining)
    const engine = new TriageInferenceEngine(facts);
    const conclusion = engine.evaluate();

    currentTriageColor = conclusion.color;
    currentTriageText = conclusion.level;
    currentTriageCode = conclusion.code;

    // --- DYNAMIC CLINICAL ROUTING (Sistemas de Conocimiento) ---
    let assignedArea = "";
    
    // Si es Rojo (Nivel I) -> Siempre Box de Reanimación
    if (conclusion.level.includes("ROJO")) {
        assignedArea = "🚨 Box de Reanimación / Shock-Trauma (Urgencias Críticas)";
    } 
    // Si es Naranja (Nivel II) -> Siempre Box de Observación de Urgencias
    else if (conclusion.level.includes("NARANJA")) {
        assignedArea = "🏥 Box de Observación / Urgencias Especiales";
    } 
    // Si es Amarillo (Nivel III / Urgente) -> Depende de la solicitud
    else if (conclusion.level.includes("AMARILLO")) {
        if (facts.area_solicitada === "gineco") {
            assignedArea = "🤰 Box de Urgencias Gineco-Obstétricas";
        } else if (facts.area_solicitada === "pediatria") {
            assignedArea = "👶 Box de Urgencias Pediátricas";
        } else if (facts.area_solicitada === "trauma") {
            assignedArea = "🦴 Box de Traumatología (Urgencias)";
        } else {
            assignedArea = "🏥 Box de Consulta Rápida (Urgencias)";
        }
    } 
    // Si es Verde (Nivel IV / Consulta) -> Derivación externa según solicitud
    else {
        if (facts.area_solicitada === "gineco") {
            assignedArea = "🤰 Consulta Externa de Ginecología";
        } else if (facts.area_solicitada === "pediatria") {
            assignedArea = "👶 Consulta Externa de Pediatría";
        } else if (facts.area_solicitada === "trauma") {
            assignedArea = "🦴 Consulta Externa de Traumatología";
        } else if (facts.area_solicitada === "general") {
            assignedArea = "🩺 Consulta Externa de Medicina General";
        } else {
            assignedArea = "🩺 Consulta Médica General Programada";
        }
    }

    // UI Update - Cambiar de pantallas
    document.getElementById('wizard-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');

    // /* NUEVO */ Calcular y actualizar el Score NEWS2 Simplificado
    const news2Score = calculateNEWS2(facts);
    const news2ScoreVal = document.getElementById('news2-score-val');
    const news2Progress = document.getElementById('news2-progress');
    const news2Desc = document.getElementById('news2-desc');

    if (news2ScoreVal && news2Progress && news2Desc) {
        news2ScoreVal.textContent = `${news2Score} / 20 PTS`;
        const pct = (news2Score / 20) * 100;
        news2Progress.style.width = `${pct}%`;
        
        let color = 'var(--triage-green)';
        let glow = 'rgba(74, 222, 128, 0.4)';
        let desc = '';
        
        if (news2Score >= 7) {
            color = 'var(--triage-red)';
            glow = 'rgba(244, 63, 94, 0.4)';
            desc = '🔴 RIESGO CLÍNICO ALTO: Posible descompensación aguda crítica. Monitoreo continuo inmediato.';
        } else if (news2Score >= 5) {
            color = 'var(--triage-orange)';
            glow = 'rgba(251, 146, 60, 0.4)';
            desc = '🟠 RIESGO CLÍNICO MEDIO: Alerta de respuesta clínica urgente. Monitoreo frecuente obligatorio.';
        } else {
            color = 'var(--triage-green)';
            glow = 'rgba(74, 222, 128, 0.4)';
            desc = '🟢 RIESGO CLÍNICO BAJO: Paciente fisiológicamente estable. Continuar vigilancia regular.';
        }
        
        news2Progress.style.backgroundColor = color;
        news2Progress.style.boxShadow = `0 0 10px ${glow}`;
        news2Desc.textContent = desc;
    }

    // Actualizar datos de resultado en pantalla
    document.getElementById('result-patient-name').innerHTML = `Paciente: <span>${patientName}</span>`;
    document.getElementById('result-requested-area').innerHTML = `Área Solicitada: <span>${getAreaLabel(facts.area_solicitada)}</span>`;
    document.getElementById('result-assigned-area').innerHTML = `Área Asignada: <span>${assignedArea}</span>`;

    const resultBox = document.getElementById('triage-result');
    resultBox.textContent = conclusion.level;
    resultBox.style.backgroundColor = conclusion.color;
    resultBox.style.boxShadow = `0 0 35px ${conclusion.glowColor}`;
    
    // Contraste para textos oscuros en fondos claros
    if (conclusion.color === "var(--triage-yellow)" || conclusion.color === "var(--triage-green)") {
        resultBox.style.color = "#070a13";
    } else {
        resultBox.style.color = "#ffffff";
    }

    const diagnosisBox = document.getElementById('disease-diagnosis');
    diagnosisBox.innerHTML = conclusion.diagnosis;
    diagnosisBox.style.borderLeftColor = conclusion.color;
    diagnosisBox.style.color = conclusion.color;

    document.getElementById('rule-used').textContent = conclusion.ruleApplied;

    // Animar SVG
    const glowingBrain = document.getElementById('glowing-brain');
    if (glowingBrain) {
        const paths = glowingBrain.querySelectorAll('path, line');
        const nodes = glowingBrain.querySelectorAll('.node-pulse');
        
        paths.forEach(p => {
            p.setAttribute('stroke', conclusion.color);
            p.style.opacity = "0.9";
            p.style.transition = "stroke 0.8s ease";
        });
        nodes.forEach(n => {
            n.setAttribute('fill', conclusion.color);
            n.style.transition = "fill 0.8s ease";
        });
    }

    // Play success sound
    AudioFX.playSuccess();

    // Guardar en base de datos local
    saveTriageCase(patientName, conclusion.level, conclusion.color, conclusion.diagnosis, conclusion.ruleApplied, facts, assignedArea, news2Score);
}

/**
 * Resetea el formulario y reorienta al paso 1
 */
function resetForm() {
    document.getElementById('triage-form').reset();
    document.getElementById('paciente-nombre').value = "";
    
    document.querySelectorAll('input[type="hidden"]').forEach(input => {
        input.value = "";
    });
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });

    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('wizard-container').classList.remove('hidden');
    
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
    
    document.getElementById('progress').style.width = '33.33%';
}

/**
 * Inicia una nueva evaluación desde la pestaña de historial
 */
function startNewEvaluationFromHistory() {
    resetForm();
    switchTab('eval');
    
    setTimeout(() => {
        const nameInput = document.getElementById('paciente-nombre');
        if (nameInput) nameInput.focus();
    }, 150);
}

/**
 * Controla la navegación del menú dinámico (HCI Tabs)
 */
function switchTab(tab) {
    AudioFX.playSelect();
    const btnEval = document.getElementById('tab-eval');
    const btnHist = document.getElementById('tab-hist');
    const wizardView = document.getElementById('wizard-container');
    const resultView = document.getElementById('result-container');
    const historyView = document.getElementById('history-container');

    if (tab === 'eval') {
        btnEval.classList.add('active');
        btnHist.classList.remove('active');
        
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
        
        renderHistory();
    }
}

/**
 * Abre el Modal de Recomendaciones según la Regla activa (Acción Prioritaria)
 */
function openRecommendations() {
    const modal = document.getElementById('recommendations-modal');
    const title = document.getElementById('modal-title');
    const targetTime = document.getElementById('modal-target-time');
    const actionsList = document.getElementById('modal-actions-list');
    const alarmBox = document.getElementById('modal-warning-signals');
    const priorityIcon = document.getElementById('modal-priority-icon');

    actionsList.innerHTML = "";

    // Configurar contenido del modal según Código Triage
    if (currentTriageCode === "acv") {
        priorityIcon.textContent = "🚨";
        title.textContent = "Protocolo de Emergencia - Código ICTUS (ACV)";
        targetTime.textContent = "Nivel I - ROJO (Inmediato, 0 min de espera)";
        targetTime.style.backgroundColor = "rgba(244, 63, 94, 0.15)";
        targetTime.style.color = "var(--triage-red)";
        targetTime.style.borderColor = "rgba(244, 63, 94, 0.3)";

        const actions = [
            "Activar el protocolo de Código ICTUS de forma inmediata.",
            "Derivar de urgencia absoluta a Tomografía Computarizada (TAC) craneal.",
            "Preparar protocolo y accesos periféricos para trombolisis farmacológica intravenosa.",
            "Canalizar doble vía venosa periférica gruesa (18G o superior).",
            "Mantener monitorización continua de saturación, ECG y presión arterial."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>CRÍTICO:</strong> Monitorear estrechamente signos de colapso respiratorio, pérdida súbita de reflejos de vía aérea o alteración refleja pupilar.";
        alarmBox.style.backgroundColor = "var(--alarm-red-bg)";
        alarmBox.style.color = "var(--alarm-red-text)";
        alarmBox.style.borderColor = "var(--alarm-red-border)";

    } else if (currentTriageCode === "iam") {
        priorityIcon.textContent = "🚨";
        title.textContent = "Protocolo de Emergencia - Código INFARTO (IAM)";
        targetTime.textContent = "Nivel I - ROJO (Inmediato, 0 min de espera)";
        targetTime.style.backgroundColor = "rgba(244, 63, 94, 0.15)";
        targetTime.style.color = "var(--triage-red)";
        targetTime.style.borderColor = "rgba(244, 63, 94, 0.3)";

        const actions = [
            "Movilizar al paciente a la Sala de Reanimación (Shock-Trauma) de inmediato.",
            "Tomar Electrocardiograma (ECG) de 12 derivaciones en menos de 10 minutos.",
            "Disponer cateterismo cardíaco de emergencia (Sala de Hemodinamia) / Angioplastia primaria.",
            "Administrar oxígeno por cánula nasal si SpO2 es inferior al 94%.",
            "Tener carro de paro y desfibrilador listo a un costado de la camilla."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>CRÍTICO:</strong> Vigilar arritmias letales en monitorización (e.g. FV, TV) y reportar de inmediato dolor progresivo opresivo de pecho.";
        alarmBox.style.backgroundColor = "var(--alarm-red-bg)";
        alarmBox.style.color = "var(--alarm-red-text)";
        alarmBox.style.borderColor = "var(--alarm-red-border)";

    } else if (currentTriageCode === "irag") {
        priorityIcon.textContent = "🫁";
        title.textContent = "Protocolo Muy Urgente - Código Naranja (IRAG)";
        targetTime.textContent = "Nivel II - NARANJA (Muy Urgente, < 15 min)";
        targetTime.style.backgroundColor = "rgba(251, 146, 60, 0.15)";
        targetTime.style.color = "var(--triage-orange)";
        targetTime.style.borderColor = "rgba(251, 146, 60, 0.3)";

        const actions = [
            "Iniciar medición continua de Oximetría de pulso y frecuencia cardíaca.",
            "Aislar preventivamente al paciente en cubículo asignado.",
            "Instalar oxigenoterapia complementaria por mascarilla o puntas nasales.",
            "Canalizar vía venosa periférica para administración de antibioticoterapia de amplio espectro.",
            "Disponer la toma urgente de Radiografía de Tórax portátil."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>ALERTA:</strong> Reportar descompensación neurológica súbita por hipoxia, saturación < 90% o aumento severo de la disnea.";
        alarmBox.style.backgroundColor = "var(--alarm-orange-bg)";
        alarmBox.style.color = "var(--alarm-orange-text)";
        alarmBox.style.borderColor = "var(--alarm-orange-border)";

    } else if (currentTriageCode === "gastro") {
        priorityIcon.textContent = "🟡";
        title.textContent = "Protocolo Urgente - Código Amarillo (Gastro / Dolor)";
        targetTime.textContent = "Nivel III - AMARILLO (Urgente, < 30 min)";
        targetTime.style.backgroundColor = "rgba(250, 204, 21, 0.1)";
        targetTime.style.color = "var(--triage-yellow)";
        targetTime.style.borderColor = "rgba(250, 204, 21, 0.2)";

        const actions = [
            "Canalizar acceso venoso periférico para inicio de hidratación intravenosa con soluciones cristaloides.",
            "Establecer reposición de volumen y electrolitos según balance hídrico.",
            "Establecer monitoreo térmico seriado e iniciar analgésicos o antipiréticos prescritos.",
            "Evaluar el nivel de dolor en escala visual análoga (EVA) cada 20 minutos."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>NOTA:</strong> Monitorear signos de shock hipovolémico por deshidratación severa, intolerancia a la vía oral o dolor abdominal de rebote.";
        alarmBox.style.backgroundColor = "var(--alarm-yellow-bg)";
        alarmBox.style.color = "var(--alarm-yellow-text)";
        alarmBox.style.borderColor = "var(--alarm-yellow-border)";

    } else if (currentTriageCode === "estable") {
        priorityIcon.textContent = "🟢";
        title.textContent = "Protocolo Estable - Código Verde";
        targetTime.textContent = "Nivel IV - VERDE (Menos Urgente, < 120 min)";
        targetTime.style.backgroundColor = "rgba(74, 222, 128, 0.1)";
        targetTime.style.color = "var(--triage-green)";
        targetTime.style.borderColor = "rgba(74, 222, 128, 0.2)";

        const actions = [
            "Redireccionar el flujo de atención del paciente hacia la sala de consulta externa o general.",
            "Proporcionar folleto instructivo sobre pautas de alarma clínica en el hogar.",
            "Controlar signos vitales básicos antes de que abandone la sala de espera.",
            "No requiere canalización de vías intravenosas de urgencia."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>NOTA:</strong> Instruir al paciente para regresar inmediatamente a urgencias únicamente si desarrolla fiebre > 38.5°C o dificultad para respirar.";
        alarmBox.style.backgroundColor = "var(--alarm-green-bg)";
        alarmBox.style.color = "var(--alarm-green-text)";
        alarmBox.style.borderColor = "var(--alarm-green-border)";

    } else { // default
        priorityIcon.textContent = "🟡";
        title.textContent = "Protocolo Inespecífico - Código Amarillo (Urgente)";
        targetTime.textContent = "Nivel III - AMARILLO (Urgente, < 60 min)";
        targetTime.style.backgroundColor = "rgba(250, 204, 21, 0.1)";
        targetTime.style.color = "var(--triage-yellow)";
        targetTime.style.borderColor = "rgba(250, 204, 21, 0.2)";

        const actions = [
            "Asignar un box de atención prioritario para evaluación clínica presencial completa.",
            "Establecer la toma y reevaluación de constantes vitales en un lapso no mayor a 30 minutos.",
            "Iniciar vigilancia activa ante la aparición de signos focalizados de sospecha diagnóstica.",
            "Ofrecer analgésicos suaves según indicación médica inicial en box."
        ];
        actions.forEach(act => {
            const li = document.createElement('li');
            li.textContent = act;
            actionsList.appendChild(li);
        });
        alarmBox.innerHTML = "<strong>ALERTA:</strong> Reevaluar inmediatamente si el paciente reporta empeoramiento severo de síntomas o dolor agudo difuso.";
        alarmBox.style.backgroundColor = "var(--alarm-yellow-bg)";
        alarmBox.style.color = "var(--alarm-yellow-text)";
        alarmBox.style.borderColor = "var(--alarm-yellow-border)";
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

function closeRecommendationsOnOverlay(event) {
    if (event.target === document.getElementById('recommendations-modal')) {
        closeRecommendations();
    }
}

/**
 * Despliega o contrae el código de inferencia
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
 * Guarda un caso de Triage en LocalStorage
 */
function saveTriageCase(name, resultText, colorVar, diagnosis, ruleUsed, facts, assignedArea, news2Score) {
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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        facts: facts,
        assignedArea: assignedArea,
        news2Score: news2Score
    };

    history.unshift(newCase);
    localStorage.setItem('triageHistory', JSON.stringify(history));

    updateHistoryBadge();
}

/**
 * Actualiza el badge dinámico de historial
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

    listView.innerHTML = "";

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
        const card = document.createElement('div');
        card.className = "history-card";
        card.style.borderLeftColor = item.colorVar;

        const shortDiag = item.diagnosis.length > 105 ? item.diagnosis.substring(0, 105) + "..." : item.diagnosis;

        // Generar dynamic symptom pills para auditoría
        let symptomPills = [];
        if (item.facts) {
            if (item.facts.conciencia === 'confuso') symptomPills.push('🧠 Confuso');
            if (item.facts.conciencia === 'inconsciente') symptomPills.push('🧠 Inconsciente');
            if (item.facts.equilibrio === 'perdida') symptomPills.push('👁️ ACV Alert');
            if (item.facts.dificultad_respiratoria === true) symptomPills.push('🚨 Resp. Severa');
            if (item.facts.presion_sistolica < 90) symptomPills.push('📉 P. Baja');
            if (item.facts.presion_sistolica > 160) symptomPills.push('📈 P. Alta');
            if (item.facts.temperatura > 38.0) symptomPills.push('🔥 Fiebre');
            if (item.facts.saturacion_o2 < 90) symptomPills.push('🩸 SpO2 Crítica');
            else if (item.facts.saturacion_o2 < 95) symptomPills.push('🩸 SpO2 Leve');
            
            if (item.facts.frecuencia_cardiaca > 100) symptomPills.push('🫀 Taquicardia');
            else if (item.facts.frecuencia_cardiaca < 60) symptomPills.push('🫀 Bradicardia');
            
            if (item.facts.edad === 'pediatrico') symptomPills.push('👶 Pediátrico');
            if (item.facts.edad === 'adulto_mayor') symptomPills.push('👵 Adulto Mayor');
            
            if (item.facts.dolor_eva === 'moderado') symptomPills.push('🟠 Dolor Mod.');
            if (item.facts.dolor_eva === 'severo') symptomPills.push('🔴 Dolor Sev.');
            
            if (item.facts.dolor_cabeza === 'severo') symptomPills.push('🚨 Cefalea Sev.');
            
            if (item.facts.dolor_pecho === 'si') symptomPills.push('💔 Dolor Pecho');
            if (item.facts.tos === 'seca') symptomPills.push('😷 Tos Seca');
            if (item.facts.tos === 'flema') symptomPills.push('🤢 Tos Flema');
            if (item.facts.sintomas_digestivos === 'nauseas') symptomPills.push('🤢 Náuseas/Vómitos');
            if (item.facts.sintomas_digestivos === 'vomitos') symptomPills.push('🤮 Vómitos');
        }
        
        const reqArea = item.facts ? getAreaLabel(item.facts.area_solicitada) : 'No especificada';
        const asgArea = item.assignedArea || (item.resultText.includes("ROJO") ? "🚨 Box de Reanimación / Shock-Trauma (Urgencias Críticas)" : item.resultText.includes("NARANJA") ? "🏥 Box de Observación / Urgencias Especiales" : "🩺 Box / Consulta programada");
        
        const pillsHtml = symptomPills.map(p => `<span class="h-symptom-pill">${p}</span>`).join(' ');

        card.innerHTML = `
            <div class="history-card-left">
                <span class="h-name">${item.name}</span>
                <span class="h-diag">${shortDiag}</span>
                <div class="h-symptom-container">${pillsHtml}</div>
                <div class="h-areas-container">
                    <span class="h-area-tag requested" title="Área solicitada por el paciente">📋 Solicitó: <strong>${reqArea}</strong></span>
                    <span class="h-area-tag assigned" title="Área asignada por el motor experto">📍 Asignado: <strong>${asgArea}</strong></span>
                    <span class="h-area-tag news2" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--text-muted);" title="Puntaje NEWS2">📊 NEWS2: <strong>${item.news2Score !== undefined ? item.news2Score : 'N/A'} pts</strong></span>
                </div>
                <!-- /* NUEVO */ Temporizador de re-evaluación clínico -->
                <div class="h-timer" data-case-id="${item.id}">🕒 Calculando tiempo...</div>
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

/**
 * /* NUEVO */ Controla el temporizador regresivo de re-evaluación clínica en tiempo real (minutos:segundos)
 */
let countdownInterval = null;

function startCountdownTimers() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const timerElements = document.querySelectorAll('.h-timer');
        if (timerElements.length === 0) return;
        
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('triageHistory')) || [];
        } catch(e) {
            return;
        }
        
        timerElements.forEach(el => {
            const caseId = parseInt(el.getAttribute('data-case-id'));
            const item = history.find(c => c.id === caseId);
            if (!item) return;
            
            const card = el.closest('.history-card');
            
            // Determinar tiempo permitido en minutos según Protocolo Manchester
            let allowedMinutes = 120; // Verde (120 min) por defecto
            if (item.resultText.includes("ROJO")) allowedMinutes = 0;
            else if (item.resultText.includes("NARANJA")) allowedMinutes = 15;
            else if (item.resultText.includes("AMARILLO")) allowedMinutes = 30;
            
            const allowedMs = allowedMinutes * 60 * 1000;
            const elapsedMs = Date.now() - item.id;
            const remainingMs = allowedMs - elapsedMs;
            
            if (remainingMs <= 0 || allowedMinutes === 0) {
                el.innerHTML = "⚠️ TIEMPO EXCEDIDO";
                el.style.color = "var(--triage-red)";
                el.style.fontWeight = "800";
                if (card) {
                    card.classList.add('time-expired');
                }
            } else {
                const totalSeconds = Math.floor(remainingMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                el.innerHTML = `⏳ Re-evaluar en: <strong>${formattedTime}</strong>`;
                el.style.color = "var(--text-muted)";
                if (card) {
                    card.classList.remove('time-expired');
                }
            }
        });
    }, 1000);
}

/**
 * /* NUEVO */ Exporta el historial del turno actual como un archivo CSV estructurado
 */
function exportHistoryToCSV() {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('triageHistory')) || [];
    } catch(e) {
        history = [];
    }
    
    if (history.length === 0) {
        alert("No hay registros clínicos para exportar en este turno.");
        return;
    }
    
    // Cabeceras estructuradas
    let csvContent = "Hora,Nombre Paciente,Nivel Triage,Diagnóstico,Score NEWS2,Regla Aplicada\n";
    
    history.forEach(item => {
        const time = item.time || "";
        const name = `"${(item.name || "").replace(/"/g, '""')}"`;
        const triageLevel = `"${(item.resultText || "").replace(/"/g, '""')}"`;
        const diagnosis = `"${(item.diagnosis || "").replace(/"/g, '""')}"`;
        const news2 = item.news2Score !== undefined ? item.news2Score : "N/A";
        const rule = `"${(item.ruleUsed || "").replace(/"/g, '""')}"`;
        
        csvContent += `${time},${name},${triageLevel},${diagnosis},${news2},${rule}\n`;
    });
    
    // Crear Blob en UTF-8 con BOM
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `triage_turno_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
