// Creates the groups from data/groups/*.json. Usage: node seed.mjs <projectId> <apiKey>
// The rules only allow creating a group that doesn't exist yet; change existing ones in the Firebase console.
import { readFileSync, readdirSync } from 'node:fs';

const [project, key] = process.argv.slice(2);

const value = (v) =>
  Array.isArray(v) ? { arrayValue: { values: v.map(value) } }
  : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v }
  : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x)])) } };

for (const file of readdirSync('data/groups')) {
  const id = file.replace(/\.json$/, '');
  const doc = JSON.parse(readFileSync(`data/groups/${file}`, 'utf8'));
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/groups?documentId=${id}&key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: value(doc).mapValue.fields }),
  });
  console.log(id, res.status, res.ok ? 'created' : (await res.json()).error?.message);
}
