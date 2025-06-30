import express from 'express';
import { loadDB, saveDB, addDevice, addJob, removeJob } from '../utils.js';
import { broadcast } from '../server.js';
import { v4 as uuid } from 'uuid';
import cors from "cors";


const router = express.Router();

router.use(cors());
// 🔐 Token Middleware
router.use((req, res, next) => {
  const token = req.headers['x-auth-token'];
  const db = loadDB();
  if (!db.authTokens.includes(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});


router.post('/poll', (req, res) => {
  const { deviceId, tabs } = req.body;
  const db = loadDB();

 db.devices[deviceId] = {
  tabs,
  lastSeen: Date.now(),
  name: db.devices[deviceId]?.name || null
};
saveDB(db);


  const jobs = db.jobs.filter(j => j.targets.includes(deviceId));
  res.json(jobs);
});

router.post('/ack', (req, res) => {
  const { jobId, tabId, deviceId } = req.body;
  const db = loadDB();

  const job = db.jobs.find(j => j.id === jobId);
  if (!job.acks) job.acks = {};
  job.acks[deviceId] = job.acks[deviceId] || [];
  if (!job.acks[deviceId].includes(tabId)) {
    job.acks[deviceId].push(tabId);
    broadcast({ type: "ack", jobId, deviceId, tabId });
  }

  saveDB(db);
  res.sendStatus(200);
});

router.post('/ping', (req, res) => {
  const { jobId, status, deviceId, tabId, result } = req.body;
  const db = loadDB();
  db.pings.push({ jobId, deviceId, tabId, status, result, time: Date.now() });
  saveDB(db);
  broadcast({ type: "ping", jobId, deviceId, tabId, status, result });
  res.sendStatus(200);
});


router.post('/send', (req, res) => {
  const job = { id: uuid(), ...req.body };
  addJob(job);
  broadcast({ type: "job", job });
  res.json(job);
});

router.post('/remove', (req, res) => {
  removeJob(req.body.jobId);
  broadcast({ type: "remove", jobId: req.body.jobId });
  res.sendStatus(200);
});

router.post('/name-device', (req, res) => {
  const { deviceId, name } = req.body;
  const db = loadDB();
  if (!db.devices[deviceId]) {
    db.devices[deviceId] = { tabs: [], lastSeen: Date.now(), name };
  } else {
    db.devices[deviceId].name = name;
  }
  saveDB(db);
  res.sendStatus(200);
});


router.get('/devices', (req, res) => res.json(loadDB().devices));
router.get('/jobs', (req, res) => res.json(loadDB().jobs));
router.get('/pings', (req, res) => res.json(loadDB().pings));

export default router;
