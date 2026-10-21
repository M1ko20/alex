// The admin works without this file too. It adds two things:
//  - a confirmation before anything is deleted
//  - photos are made smaller in the browser and uploaded one at a time, so a
//    phone photo isn't turned away by the hosting's upload limit (the server
//    keeps at most 2800 px of width anyway)

const MAX_WIDTH = 2800
const MAX_HEIGHT = 4200
const KEEP_UNDER = 1.5 * 1024 * 1024 // smaller JPG/PNG/WebP files go up untouched

document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-confirm]')
  if (button && !confirm(button.dataset.confirm)) e.preventDefault()
})

/** An upright JPEG of the photo that fits under `limit` bytes, or the original if it's fine as it is. */
async function shrink(file, limit) {
  const plain = /^image\/(jpeg|png|webp)$/.test(file.type)
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file // the browser can't read it; let the server have a go
  }
  let scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height)
  if (plain && scale === 1 && file.size < Math.min(KEEP_UNDER, limit)) return file

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  let blob = null
  // Lower the quality a little first, then the size, until it fits.
  for (const quality of [0.92, 0.86, 0.8, 0.8, 0.8, 0.8]) {
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size <= limit) break
    if (quality === 0.8) scale *= 0.8
  }
  bitmap.close?.()
  if (!blob) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
}

const form = document.getElementById('edit')
const input = form?.querySelector('[data-upload]')
const status = form?.querySelector('[data-upload-status]')

input?.addEventListener('change', () => {
  const n = input.files.length
  status.hidden = n === 0
  status.textContent = n === 1 ? 'Vybraná 1 fotka — nahraje se po uložení.' : `Vybrané fotky: ${n} — nahrají se po uložení.`
})

/** Posts the form; the server answers with where to go next instead of redirecting. */
async function send(data) {
  // Not form.action: the form has a field named "action", which shadows it.
  const res = await fetch(location.href, { method: 'POST', body: data, headers: { 'X-Admin-Fetch': '1' } })
  const reply = res.ok ? await res.json().catch(() => null) : null
  if (!reply?.location) throw new Error(res.ok ? 'neočekávaná odpověď' : String(res.status))
  return new URL(reply.location, location.href)
}

form?.addEventListener('submit', async (e) => {
  if (!input?.files.length || !window.fetch || !window.createImageBitmap) return
  e.preventDefault()
  const buttons = form.querySelectorAll('button')
  const limit = Number(input.dataset.maxBytes) || 2 * 1024 * 1024
  const files = [...input.files]

  const fields = new FormData(form)
  if (e.submitter?.name) fields.set(e.submitter.name, e.submitter.value)
  fields.delete('upload[]')
  buttons.forEach((b) => (b.disabled = true))

  try {
    let next
    for (const [i, file] of files.entries()) {
      status.textContent = files.length === 1 ? 'Nahrávám fotku…' : `Nahrávám fotku ${i + 1} z ${files.length}…`
      const data = new FormData()
      for (const [k, v] of fields) data.append(k, v)
      data.append('upload[]', await shrink(file, limit))
      next = await send(data)

      // The rest of the photos go to the work as it is now saved (a new work
      // exists after the first request, and the button pressed is done).
      const slug = next.searchParams.get('edit')
      if (!slug) break
      fields.set('original_slug', slug)
      fields.set('op', 'save')
    }
    location.href = next.href
  } catch (err) {
    status.textContent = `Nahrání se nepovedlo (${err.message}). Zkus to znovu, třeba s méně fotkami.`
    buttons.forEach((b) => (b.disabled = false))
  }
})
