import { SkillRegistry } from './SkillRegistry';

export class ValidationGate {
  needsValidation(actionName: string): boolean {
    const skill = SkillRegistry[actionName];
    if (!skill) return false;
    return skill.category === 'sensitive';
  }
}
