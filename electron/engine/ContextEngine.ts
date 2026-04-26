import { db } from '../db/database';

export interface TemporalEvent {
  event: string;
  path?: string;
  name?: string;
  timestamp: Date;
}

export class ContextEngine {
  private temporalBreadcrumbs: TemporalEvent[] = [];

  // Immediate Context Mock
  getImmediateContext() {
    return {
      activeApp: 'VS Code',
      selectedText: '',
      windowTitle: 'Sky Project'
    };
  }

  // Temporal Context
  addTemporalEvent(event: TemporalEvent) {
    this.temporalBreadcrumbs.push(event);
    // Keep last 10 events
    if (this.temporalBreadcrumbs.length > 10) {
      this.temporalBreadcrumbs.shift();
    }
  }

  getTemporalContext() {
    return this.temporalBreadcrumbs;
  }

  // Persistent Memory
  async logCommand(input: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO commands (input) VALUES (?)', [input], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async logExecution(commandId: number, action: string, status: string, details: string) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO execution_logs (command_id, action, status, details) VALUES (?, ?, ?, ?)',
        [commandId, action, status, details],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getCombinedContext() {
    return {
      immediate: this.getImmediateContext(),
      temporal: this.getTemporalContext()
    };
  }
}
