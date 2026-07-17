/**
 * Hard kill-switch for the AI chat widget, independent of the
 * VITE_ENABLE_AI_CHAT Netlify env var. The widget streams raw model
 * output without grounding to AccessMI's data - it can generate
 * unsourced claims - and has not been adversarially tested (bad
 * inputs, prompt injection, does it fail safely). Disabled by owner
 * decision until that testing happens; flip this back to true (or
 * remove it and restore the env-var check) once it has been.
 */
export const AI_CHAT_ENABLED = false;
