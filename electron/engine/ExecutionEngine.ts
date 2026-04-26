import { SkillRegistry } from './SkillRegistry';

export interface ExecutionResult {
  success: boolean;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export class ExecutionEngine {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeStep(step: any, onProgress: (msg: string) => void): Promise<ExecutionResult> {
    const skill = SkillRegistry[step.action];

    if (!skill) {
      return { success: false, message: `Skill ${step.action} not found in registry.` };
    }

    onProgress(`Executing skill: ${skill.name}`);

    // Simulate real execution
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulated failure for self-healing demonstration
    if (step.action === 'read_file' && step.path?.includes('Invoice_Final.pdf')) {
       return { success: false, message: `File not found: ${step.path}` };
    }

    onProgress(`Completed skill: ${skill.name}`);
    return { success: true, message: `Executed ${skill.name} successfully.` };
  }
}
