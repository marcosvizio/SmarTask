import { db } from '../../src/dao/db/memory.js';

export function resetDb() {
  db.users.splice(0, db.users.length);
  db.tasks.splice(0, db.tasks.length);
  db.notifications.splice(0, db.notifications.length);
}
