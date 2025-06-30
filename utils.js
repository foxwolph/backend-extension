import fs from 'fs';

const DB_FILE = './db.json';

export function loadDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

export function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function addDevice(deviceId, tabId) {
  const db = loadDB();
  db.devices[deviceId] = db.devices[deviceId] || { tabs: {} };
  db.devices[deviceId].tabs[tabId] = Date.now();
  saveDB(db);
}

export function getOnlineDevices(threshold = 30000) {
  const now = Date.now();
  const db = loadDB();
  return Object.entries(db.devices).map(([id, dev]) => ({
    id,
    tabs: Object.entries(dev.tabs).map(([tid, ts]) => ({
      tabId: tid,
      online: now - ts < threshold
    }))
  }));
}

export function addJob(job) {
  const db = loadDB();
  db.jobs.push(job);
  saveDB(db);
}

export function removeJob(jobId) {
  const db = loadDB();
  db.jobs = db.jobs.filter(j => j.id !== jobId);
  saveDB(db);
}
