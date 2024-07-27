"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMathInText = formatMathInText;
function formatMathInText(latex) {
    return latex
        // Remove LaTeX delimiters
        .replace(/\\\[/g, '') // Remove opening \[
        .replace(/\\\]/g, '') // Remove closing \]
        // Replace LaTeX integrals with readable format
        .replace(/\\int\s*\{([^}]+)\}\s*dx/g, '∫ $1 dx') // \int{expression} dx -> ∫ expression dx
        .replace(/\\int\s*\(([^)]+)\)\s*dx/g, '∫ ($1) dx') // \int(expression) dx -> ∫ (expression) dx
        .replace(/\\int\s*([^}]+)\s*dx/g, '∫ $1 dx') // \int expression dx -> ∫ expression dx
        // Replace LaTeX fractions with readable format
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)') // \frac{a}{b} -> (a / b)
        // Replace LaTeX square roots with readable format
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)') // \sqrt{a} -> √(a)
        // Replace LaTeX superscripts and subscripts
        .replace(/(\w)\^(\d+)/g, '$1^$2') // a^2 -> a^2
        .replace(/(\w)_{(\d+)}/g, '$1_$2') // a_{2} -> a_2
        // Handle integration constants
        .replace(/C_{(\d+)}/g, 'C_$1') // C_{1} -> C_1
        // Replace common LaTeX symbols
        .replace(/\\pm/g, '±') // \pm -> ±
        .replace(/\\times/g, '×') // \times -> ×
        .replace(/\\div/g, '÷') // \div -> ÷
        .replace(/\\geq/g, '≥') // \geq -> ≥
        .replace(/\\leq/g, '≤') // \leq -> ≤
        .replace(/\\neq/g, '≠') // \neq -> ≠
        .replace(/\\infty/g, '∞') // \infty -> ∞
        // Replace LaTeX commands for parentheses
        .replace(/\\left\(/g, '(') // \left( -> (
        .replace(/\\right\)/g, ')') // \right) -> )
        .replace(/\\left\[/g, '[') // \left[ -> [
        .replace(/\\right\]/g, ']') // \right] -> ]
        .replace(/\\left\{/g, '{') // \left{ -> {
        .replace(/\\right\}/g, '}') // \right} -> }
        // Remove any remaining backslashes used for escaping
        .replace(/\\/g, '')
        // Replace LaTeX fractions with readable format
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)') // \frac{a}{b} -> (a / b)
        // Replace LaTeX square roots with readable format
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)') // \sqrt{a} -> √(a)
        // Replace LaTeX superscripts for degrees
        .replace(/(\d+)\^circ/g, '$1°') // 30^circ -> 30°
        // Replace LaTeX text for "text"
        .replace(/\\text\{([^}]+)\}/g, '$1') // \text{opposite} -> opposite
        .replace(/\\\\/g, '\\') // Handle double backslashes as single backslash
        .replace(/\\/g, ''); // Remove any remaining single backslashes
}
