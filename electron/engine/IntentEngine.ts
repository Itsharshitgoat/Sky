import { SemanticFirewall } from './Firewall';

export class IntentEngine {
  private firewall: SemanticFirewall;

  constructor() {
    this.firewall = new SemanticFirewall();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async parseIntent(input: string, context: any) {
    // 1. Semantic Firewall Check
    if (!this.firewall.sanitizeInput(input)) {
      throw new Error("Input blocked by Semantic Firewall: Potentially unsafe instructions detected.");
    }

    // In a real scenario, this would call Ollama to extract JSON,
    // strictly bound to the allowed SkillRegistry.
    console.log(`Parsing intent for: ${input} with context:`, context);

    // Simulate Ollama latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerInput = input.toLowerCase();

    // Mocking Ollama's constrained generation
    if (lowerInput.includes('marques') || lowerInput.includes('mkbhd')) {
      return {
        goal: "play latest video",
        steps: [
          { action: "open_app", target: "chrome" },
          { action: "search_web", query: "MKBHD latest video" },
        ],
        confidence: 0.87
      };
    } else if (lowerInput.includes('invoice') && lowerInput.includes('delete')) {
      // Sensitive action example
      return {
        goal: "delete invoice file",
        steps: [
          { action: "delete_file", path: "Invoice_Final.pdf" }
        ],
        confidence: 0.95
      }
    } else if (lowerInput.includes('invoice') && lowerInput.includes('open')) {
      // Action designed to fail for self-healing
      return {
         goal: "open invoice",
         steps: [
           { action: "read_file", path: "Invoice_Final.pdf" }
         ]
      }
    } else {
      return {
        goal: "execute generic command",
        steps: [
          { action: "search_web", query: input }
        ],
        confidence: 0.5
      };
    }
  }

  // Self-Healing System (Retry-with-Context Loop)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  async handleFailure(step: any, errorMsg: string, _context: any) {
    console.log(`Self-Healing triggered for failed step: ${step.action}. Error: ${errorMsg}`);

    // Simulate Ollama generating an alternative or asking the user
    await new Promise(resolve => setTimeout(resolve, 800));

    if (step.action === 'read_file') {
      return {
        type: 'ask_user',
        message: `I couldn't find '${step.path}' locally. Do you want me to check your recent email attachments?`
      }
    }

    return {
      type: 'retry_alternative',
      alternativeStep: { action: "search_web", query: "help with " + step.action }
    }
  }
}
