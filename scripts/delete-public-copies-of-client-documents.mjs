/**
 * Deletes the 202 applicant documents that still sit in the PUBLIC
 * `events-bucket`. Verified copies already live in the private
 * `registration-documents` bucket, and the app reads only from there.
 *
 * Run this only after confirming in the dashboard that applicant documents
 * still open. It re-verifies every private copy before deleting anything, and
 * refuses to delete a file whose private copy is missing or a different size.
 *
 *   node scripts/delete-public-copies-of-client-documents.mjs --dry-run
 *   node scripts/delete-public-copies-of-client-documents.mjs --confirm
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const PUBLIC_BUCKET = 'events-bucket'
const PRIVATE_BUCKET = 'registration-documents'
const PREFIX = 'registrations/'

const args = new Set(process.argv.slice(2))
const confirmed = args.has('--confirm')

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim().replace(/^["']|["']$/g, '')]
    })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

/** Storage list() only returns one level, so walk the tree. */
async function walk(bucket, prefix) {
  const found = []
  let offset = 0

  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, { limit: 100, offset })
    if (error) throw error
    if (!data?.length) break

    for (const entry of data) {
      if (entry.id) found.push(prefix + entry.name)
      else found.push(...(await walk(bucket, `${prefix}${entry.name}/`)))
    }

    if (data.length < 100) break
    offset += 100
  }

  return found
}

async function sizeOf(bucket, key) {
  const slash = key.lastIndexOf('/')
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(key.slice(0, slash), { limit: 100, search: key.slice(slash + 1) })
  if (error) return null
  return data?.find((f) => f.name === key.slice(slash + 1))?.metadata?.size ?? null
}

const keys = (await walk(PUBLIC_BUCKET, PREFIX)).sort()
console.log(`Found ${keys.length} applicant files still in the public bucket.`)

const safe = []
const unsafe = []

for (const key of keys) {
  const [publicSize, privateSize] = await Promise.all([
    sizeOf(PUBLIC_BUCKET, key),
    sizeOf(PRIVATE_BUCKET, key),
  ])
  if (privateSize !== null && privateSize === publicSize) safe.push(key)
  else unsafe.push({ key, publicSize, privateSize })
}

console.log(`  verified private copy: ${safe.length}`)
console.log(`  NOT safe to delete:    ${unsafe.length}`)
for (const item of unsafe.slice(0, 10)) console.log('   !', item)

if (unsafe.length) {
  console.error('\nRefusing to delete: every file must have a matching private copy first.')
  process.exit(1)
}

if (!confirmed) {
  console.log('\nDry run. Re-run with --confirm to delete the public copies.')
  process.exit(0)
}

for (let i = 0; i < safe.length; i += 50) {
  const batch = safe.slice(i, i + 50)
  const { error } = await supabase.storage.from(PUBLIC_BUCKET).remove(batch)
  if (error) {
    console.error('Delete failed:', error.message)
    process.exit(1)
  }
  console.log(`  deleted ${Math.min(i + 50, safe.length)}/${safe.length}`)
}

console.log('\nDone. Applicant documents now exist only in the private bucket.')
