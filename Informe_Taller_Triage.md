# TALLER INTEGRADOR AVANZADO: Interacción Hombre-Máquina + Sistemas de Conocimiento
**Fecha:** 8 de mayo del 2026
**Tema:** Sistema Interactivo Inteligente para Apoyo al Triage y Diagnóstico Precoz

---

## PARTE 1: ANÁLISIS DEL USUARIO Y CONTEXTO

### 1. Identificación
- **Tipos de usuarios:** 
  - *Primario*: Profesional de Enfermería (encargado del área de triage).
  - *Secundario*: Médico de Urgencias (recibe la clasificación y el paciente).
  - *Terciario*: Personal Administrativo (ingreso de datos demográficos).
- **Necesidades:** Tomar decisiones precisas de clasificación (Prioridad I a V) en menos de 3 minutos por paciente. Necesitan un sistema rápido que reduzca el sesgo humano y garantice que los pacientes críticos sean atendidos inmediatamente.
- **Limitaciones cognitivas:** Altos niveles de estrés, fatiga mental por turnos prolongados de más de 12 horas, sobrecarga de información (ruido, quejas, múltiples pacientes a la vez) y fatiga por alarmas.

### 2. Definición
- **Modelos mentales del usuario:** El profesional de salud estructura mentalmente el triage como un "árbol de decisiones rápido" basado en la gravedad de los síntomas vitales. Su modelo de interacción ideal es similar a una "lista de chequeo rápida" o un interrogatorio estructurado, y esperan retroalimentación visual basada en los colores estándar del triage (Rojo, Naranja, Amarillo, Verde, Azul).
- **Problemas actuales de interacción:** El proceso manual es lento, requiere memorizar protocolos extensos, carece de validación en tiempo real y no existe una interfaz unificada, lo que deriva en errores de clasificación (subtriage o sobretriage).

### 3. Modelo Conceptual del Sistema
- **Metáfora:** El sistema actuará como un **"Colega Consultor Premium"** propulsado por IA médica. 
- En lugar de un formulario denso, el modelo conceptual se divide en **pasos progresivos** (Wizard), donde el sistema hace preguntas lógicas secuenciales, procesa las respuestas (hechos) y arroja un diagnóstico inmediato (recomendación de prioridad y patología).

---

## PARTE 2: DISEÑO DE INTERFAZ (PREMIUM UI)

### 1. Diseño y Flujo de Interacción
Se ha desarrollado un prototipo funcional interactivo compuesto por un flujo paso a paso:
- **Pantalla 1:** Evaluación Neurológica & Respiratoria.
- **Pantalla 2:** Constantes Vitales y Dolor Cardíaco.
- **Pantalla 3:** Síntomas Específicos (Tos, Digestivo).
- **Pantalla 4 (Resultado):** Tarjeta visual flotante con el color de triage, el diagnóstico sugerido de patología y la justificación lógica de la IA.

### 2. Justificación de Diseño Estético y HCI (Glassmorphism & Dark Mode)
- **Modo Oscuro (Dark Mode):** Diseñado específicamente para reducir la fatiga visual de los médicos y enfermeros que trabajan turnos de noche en ambientes hospitalarios bajo luces fluorescentes severas.
- **Glassmorphism (Paneles de Cristal):** El uso de fondos translúcidos y desenfoques (blurs) no solo moderniza la interfaz ("Wow factor"), sino que ayuda a crear **profundidad** espacial, centrando la atención del usuario en el formulario (primer plano) sin distraerlo con los fondos médicos abstractos (segundo plano).
- **Reducción de carga cognitiva:** Al dividir 8 síntomas vitales en 3 pasos diferentes, se aplica la ley de Hick y el principio de "Divulgación Progresiva" (Progressive Disclosure).
- **Generación de Imágenes UI:** Se añadieron representaciones visuales del asistente médico para generar empatía y confianza en la respuesta de la máquina (fenómeno psicológico de Antropomorfismo en HCI).

### 3. Aplicación de Heurísticas de Usabilidad (Jakob Nielsen)
1. **Visibilidad del estado del sistema:** Una barra de progreso con gradiente y animaciones suaves le indica al usuario en qué fase del triage se encuentra.
2. **Relación entre el sistema y el mundo real:** El lenguaje utilizado corresponde estrictamente a la terminología médica, adaptándose al modelo mental del usuario clínico.
3. **Prevención de errores y Feedback Inmediato:** Si el usuario no completa un campo e intenta avanzar, el sistema utiliza micro-animaciones (una ligera vibración) combinada con halos de luz roja (glow effect) en los campos faltantes, guiando la atención del ojo hacia el error sin ser punitivo.

---

## PARTE 3: INGENIERÍA DEL CONOCIMIENTO (Diagnóstico Extendido)

### 1. Base de Conocimiento
La base de conocimiento ha sido expandida para procesar "hechos" avanzados: Temperatura, Presión Arterial, Conciencia, Respiración, Equilibrio/Visión, Dolor de Pecho Irradiado, Tos y Síntomas Digestivos.

### 2. Reglas del Sistema Experto (Motor de Inferencia)
Se han construido 6 reglas lógicas condicionales para detectar patologías complejas:

1. **ACV (Emergencia Neurológica):** `IF` equilibrio == "perdida" `AND` (conciencia == "confuso" `OR` "inconsciente") `THEN` triage = "Rojo" `AND` patología = "Accidente Cerebrovascular"
2. **Infarto de Miocardio (IAM):** `IF` dolor_pecho == "si" `AND` (respiracion == "si" `OR` presion == "baja") `THEN` triage = "Rojo" `AND` patología = "IAM"
3. **Infección Respiratoria Aguda:** `IF` fiebre == "si" `AND` tos != "ninguna" `AND` respiracion == "si" `THEN` triage = "Naranja" `AND` patología = "IRAG/Neumonía"
4. **Infección Gastrointestinal:** `IF` digestivo == "nauseas" `AND` fiebre == "si" `THEN` triage = "Amarillo" `AND` patología = "Gastroenteritis"
5. **Estable:** `IF` todas_constantes == "normal" `THEN` triage = "Verde"
6. **Inespecífico:** `IF` otros_sintomas `THEN` triage = "Amarillo (Evaluación requerida)"

### 3. Tipo de Inferencia y Toma de Decisiones
- **Inferencia Utilizada:** **Encadenamiento hacia Adelante (Forward Chaining)**. El usuario introduce los síntomas iniciales (hechos) y el sistema aplica las reglas hasta alcanzar una conclusión diagnóstica y asignar un código de color.
- **Toma de decisiones jerárquica:** El motor evalúa las reglas de forma secuencial descendente, procesando primero "Amenazas a la Vida" inmediatas (IAM, ACV), luego "Pérdida de Órganos/Hipoxia" y finalmente cuadros infecciosos no críticos.

---

## PARTE 4: PROCESO DE DESARROLLO

### 1. Definición del Proceso: Modelo Iterativo Centrado en el Usuario
El proceso a seguir será el **Design Thinking adaptado a la Ingeniería de Software Iterativa**:
- **Fase 1 (Empatizar):** Identificar la fatiga visual de los médicos (motivación principal para el Dark Mode).
- **Fase 2 (Prototipar):** Creación de prototipos interactivos en HTML/CSS/JS con diseño Glassmorphism (el entregado en este taller).
- **Fase 3 (Evaluar y Refinar):** Pruebas de usabilidad in situ.

### 2. Justificación frente al Modelo en Cascada
El modelo en Cascada asume que todos los requisitos se conocen desde el principio. En el ámbito de la salud, esto es inviable y altamente riesgoso. El modelo Iterativo permite probar estéticas (ej. el contraste de colores neón sobre fondo oscuro) directamente con el personal médico, ajustando la interfaz antes de lanzar el sistema al hospital.

---

## PARTE 5: EVALUACIÓN Y USABILIDAD

### 1. Posibles problemas de usabilidad identificados
- *Contraste visual en entornos iluminados*: Aunque el Dark Mode es excelente de noche, podría sufrir de reflejos en pantallas de tablets si el pasillo del hospital está muy iluminado por el sol.
- *Fatiga en dispositivos táctiles*: Clicar elementos tipo `select` muy seguidos en lugar de botones grandes `radio` podría enlentecer la interacción táctil.

### 2. Diseño de Pruebas con Usuarios
1. **Prueba de Rendimiento Bajo Presión (Time-to-Task):**
   - *Escenario*: Paciente con sospecha de ACV (pérdida de visión, desorientado).
   - *Métrica*: Tiempo exacto desde que abre la App hasta obtener el diagnóstico en color Rojo. *Meta: < 45 segundos*.
2. **Prueba de Accesibilidad Visual:**
   - *Escenario*: Médicos usando la app en modo nocturno vs iluminación diurna.
   - *Métrica*: Tasa de quejas de deslumbramiento o errores de lectura de las etiquetas grises (`--text-muted`) sobre fondo oscuro.

---

## PARTE 6: ANÁLISIS CRÍTICO

**¿Cómo influye la ingeniería del conocimiento en la mejora de la experiencia del usuario en sistemas críticos como salud?**

La ingeniería del conocimiento transforma una simple "pantalla de ingreso de datos" en una herramienta cognitiva activa ("Premium Assist"). En el rediseño presentado, el profesional de la salud ya no solo clasifica a un paciente en base a una tabla de colores, sino que el sistema **descubre patologías ocultas** (como un ACV incipiente) cruzando múltiples variables (Equilibrio + Nivel de Consciencia) en milésimas de segundo.

Al delegar este razonamiento lógico repetitivo a la IA, la carga mental del enfermero se desploma. El diseño estético (Dark Mode, transiciones suaves y colores neón que advierten sutilmente el peligro) reduce la ansiedad y previene la "fatiga por alarmas". El resultado final es una experiencia de usuario sublime: la tecnología deja de ser un obstáculo burocrático y se convierte en un salvavidas tanto para el profesional saturado como para el paciente en estado crítico.
