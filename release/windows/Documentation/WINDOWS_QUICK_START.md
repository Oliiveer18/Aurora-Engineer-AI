# GUÍA RÁPIDA DE INICIO — AURORA AI CREATOR (WINDOWS)

Bienvenido a **AURORA AI CREATOR v1.0.0**, el entorno especializado de desarrollo, diseño y optimización de contenido para el videojuego RPG 2.5D **AURORA** (Phaser 3 + TypeScript).

---

## 1. INSTALACIÓN / EJECUCIÓN

Tienes dos formas de ejecutar la aplicación:

### Opción A: Instalador Estándar (Recomendado para uso continuo)
1. Haz doble clic en `AURORA-AI-CREATOR-Setup.exe`.
2. Sigue el asistente de instalación.
3. Se creará un acceso directo en tu Escritorio y en el Menú Inicio.
4. La aplicación se actualizará automáticamente cuando haya nuevas versiones estables.

### Opción B: Versión Portable (Sin instalación)
1. Haz doble clic en `AURORA-AI-CREATOR-Portable.exe`.
2. La aplicación se abrirá de inmediato sin modificar el registro de Windows ni requerir permisos de administrador.
3. Ideal para llevar en un pendrive USB o trabajar en equipos restringidos.

---

## 2. PRIMEROS PASOS

1. **Conectar tu Proyecto AURORA:**
   - Abre la aplicación.
   - En el panel principal o en la barra lateral, pulsa en **"Importar Proyecto AURORA"**.
   - Selecciona la carpeta raíz de tu repositorio de AURORA o carga el archivo `project_manifest.json`.

2. **Explorar el Estudio de Creación:**
   - **Visual Creator:** Diseña criaturas, NPCs, biomas, misiones e ítems con datos de proyección dimétrica 2.5D (anchors Y-sort, hitboxes, sombras).
   - **Free-First AI Center (0.00 €):** Ejecuta validaciones locales, simulaciones Monte Carlo de combate y cálculos de BST sin consumir tokens ni APIs de pago.
   - **Live Profiler 2.3:** Mide el rendimiento real en milisegundos de frame time, diagnostica el peso del Y-Sorting y ejecuta pruebas de estrés de entidades.
   - **Verified Optimizer:** Aplica parches quirúrgicos con **Visual Lock** y **Gameplay Lock** activados para garantizar cero pérdida de calidad gráfica ni de mecánicas.

3. **Exportar a Cursor IDE:**
   - En **Export Hub**, obtén los archivos TypeScript limpios (`aurora_creatures.ts`, `aurora_npcs.ts`, etc.) o el bundle JSON listo para sincronizar con Cursor.

---

## 3. PREGUNTAS FRECUENTES

- **¿Necesito instalar Node.js o Python?**  
  No. Los ejecutables de Windows contienen todo lo necesario.
- **¿Qué pasa si no tengo conexión a Internet?**  
  AURORA AI CREATOR funciona 100% desconectado en modo local determinista.
- **¿Dónde se guardan mis proyectos?**  
  Los datos se almacenan localmente en `%APPDATA%/aurora-ai-creator/` de forma segura.
