export type SkillCategory = 'safe' | 'sensitive';

export interface SkillDefinition {
  name: string;
  category: SkillCategory;
  params: string[];
  description: string;
}

export const SkillRegistry: Record<string, SkillDefinition> = {
  open_app: {
    name: 'open_app',
    category: 'safe',
    params: ['target'],
    description: 'Opens an application by name.'
  },
  search_web: {
    name: 'search_web',
    category: 'safe',
    params: ['query'],
    description: 'Searches the web for a query.'
  },
  read_file: {
    name: 'read_file',
    category: 'safe',
    params: ['path'],
    description: 'Reads the contents of a local file.'
  },
  send_email: {
    name: 'send_email',
    category: 'sensitive',
    params: ['to', 'subject', 'body'],
    description: 'Sends an email.'
  },
  overwrite_file: {
    name: 'overwrite_file',
    category: 'sensitive',
    params: ['path', 'content'],
    description: 'Overwrites a file with new content.'
  },
  delete_file: {
    name: 'delete_file',
    category: 'sensitive',
    params: ['path'],
    description: 'Deletes a file.'
  }
};

export function isSkillAllowed(skillName: string): boolean {
  return skillName in SkillRegistry;
}
