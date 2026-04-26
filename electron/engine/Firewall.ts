export class SemanticFirewall {
  // Input Sanitization
  sanitizeInput(input: string): boolean {
    const lowerInput = input.toLowerCase();

    // Detect jailbreaks or injection patterns
    if (lowerInput.includes('ignore previous instructions') ||
        lowerInput.includes('system prompt') ||
        lowerInput.includes('bypass')) {
      return false;
    }

    // Detect dangerous shell commands
    if (lowerInput.includes('run sudo') ||
        lowerInput.includes('rm -rf') ||
        lowerInput.match(/;\s*rm/)) {
      return false;
    }

    return true;
  }
}
