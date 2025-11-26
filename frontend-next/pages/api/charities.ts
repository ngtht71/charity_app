import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'charities.json');

async function ensureDataFile() {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.promises.access(DATA_FILE, fs.constants.F_OK);
    } catch (e) {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify({}), 'utf8');
    }
  } catch (err) {
    console.error('Failed to ensure charities data file', err);
    throw err;
  }
}

async function readAll() {
  await ensureDataFile();
  const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

async function writeAll(data: any) {
  await ensureDataFile();
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const all = await readAll();
      return res.status(200).json(all);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const id = (body && (body.id ?? body.charityId)) as number | string | undefined;
      const record = body && body.record ? body.record : null;
      if (id === undefined || record === null) {
        return res.status(400).json({ error: 'Missing id or record in request body' });
      }
      const all = await readAll();
      all[id] = record;
      await writeAll(all);
      return res.status(200).json({ ok: true, id, record });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('charities API error', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
