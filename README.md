# Alexandra Tomanová — website

The personal digital gallery of Alexandra Tomanová (Instagram [@al.3xqndra](https://www.instagram.com/al.3xqndra/)).
React + TypeScript + Vite front end, served by PHP, with an admin at `/admin` for the works.

```bash
npm install
npm run dev        # local development, admin at http://localhost:5173/admin (needs PHP 8.1+)
npm run php        # build and run the whole PHP site at http://localhost:8000 (needs PHP 8.1+)
npm run images     # after adding or changing any photo in /artwork
npm run build      # production build → /dist (upload this to the hosting)
npm run deploy     # build and upload to the hosting over FTP (login in .deploy.env)
```

## PHP hosting and the admin

Upload the **contents** of `dist/` to the web root of the hosting (Apache with `.htaccess`, PHP 8.1+
with GD + WebP — the usual Czech shared hosting). Then:

- The site: every page goes through `index.php`, which puts the live works into the built page.
- The admin: **`/admin`**, password in `public/lib/config.php` (not in git — copy `config.example.php` and fill it in) (also the address the enquiry form
  sends to). It can add, edit, hide, reorder and delete works, and upload, describe, reorder and
  delete their photos. Uploaded photos get the same treatment as `npm run images` (WebP sizes,
  placeholder, colours), in PHP: `public/lib/images.php`.
- `data/` and `img/` must be **writable** by PHP (775). The admin warns if they aren't.

**Where the data lives.** The build ships a starting copy in `content/` (`public/content/` in the
repo). The first time anything is read, the server uses that; the first change in the admin writes the
live copy to `data/`. `data/` is not part of the build, so uploading a new build never undoes what
was changed in the admin. **Never delete `data/` on the server**, and don't upload an empty one over
it. Changing `public/content/artworks.json` in the repo therefore only affects a fresh install.

**Locally** (`npm run dev`, `npm run php`) the admin keeps its data in `.data/` in the repo (not committed,
not part of a build), and the dev site shows it. Photos uploaded locally go to `public/img/`.

Nginx doesn't read `.htaccess`: there, send unknown paths to `/index.php` and deny `/lib/` and `/data/`
in the server config.

## Creative direction, in short

- **A gallery, in her voice.** Everything is written in the first person, as Alexandra. Nothing
  sits between a visitor and a painting except its label; her own caption for a work appears only
  on that work's page, as a quiet quotation under the facts.
- **One path through.** The home page opens on a featured work with one button down to the works;
  the wall ends with the way to the about page and to writing to her. Navigation: Works, Available,
  About, Contact.
- **Three voices of type.** *Pinyon Script* for her name and the page titles (large sizes only).
  *Instrument Serif* italic for her own words, short asides and the title on a work's own page.
  *Instrument Sans* for everything else: semibold for the titles on wall labels and in the phone
  menu, small tracked capitals for the facts on a label (number, year, medium).
- **A salon hang, not a grid.** The works hang edge to edge in rows of equal height that fill the
  width, so the paintings are big and there's no dead wall. Rows are chosen together
  (`src/components/Wall.tsx`) so each lands near a comfortable height. Rows with a lead work aim
  taller, quiet works a little smaller. On phones it becomes one walk from top to bottom.
- **The room takes on the painting.** One warm wall colour and one ink colour. Each work's average
  colour is sampled at build time and the page takes on a little of it while you look at that work.
- **Gallery conventions instead of shop conventions.** Numbered labels, a list of every work,
  "Price on request". An available work is marked with a small **hollow** dot — the opposite of a
  gallery's red "sold" sticker. "Ask me about this one" opens a message that already names the work.
- **Nothing invented.** Anything we don't know stays a `[placeholder]` in the data and is left off the page.

## Where things live

| What | Where |
| --- | --- |
| The works (titles, year, medium, size, availability, images, her words) | the admin on the live site; starting copy in `public/content/artworks.json` |
| Artist info, bio, statement, email, projects | `src/content/site.ts` |
| Content types + the placeholder convention | `src/content/types.ts` |
| Original photos (one folder per work) | `artwork/<slug>/01-work.jpg`, `02-detail.jpg`, … |
| Generated responsive images + manifest | `public/img/…`, `public/content/images.json` (don't edit by hand) |
| The PHP side (pages, admin, enquiry form) | `public/index.php`, `public/admin/`, `public/api/`, `public/lib/` |

### Adding a new work

On the live site: `/admin` → *Přidat obraz*. Its position in the list is its position on the wall
and sets its number.

To change the starting copy in the repo instead:

1. Create `artwork/<slug>/` and put the straight-on photo in as `01-work.jpg`. Details, studio shots
   and so on follow as `02-…`, `03-…`.
2. Run `npm run images`.
3. Add an entry to `public/content/artworks.json`. **Its position in the list is its position on the
   wall** and sets its number. Set `presence` to `lead` (its own wall), `standard` (paired) or
   `quiet` (smaller).

### Selling a work

In the admin, set *Stav* to *Na prodej*. In the JSON: `availability: 'available'` (optionally `price: '€…'`; without it the site says "Price on
request"). It then appears on the Available page, is marked on the wall, and gets an enquiry form.
Other states: `reserved`, `sold`, `gifted`, `private`, `unknown`.

## Enquiries

The forms post to `public/api/inquiry.php`, which emails the message to the address in
`public/lib/config.php` with Reply-To set to the visitor; nothing is stored. Each message arrives with
the subject already filled in, e.g. `Inquiry about “A place in my head” (No. 07)`. If the hosting
only sends mail from an existing mailbox, set `mail_from` there.

If sending fails (and in local development), visitors are offered email instead.

## What still needs real information

Everything marked as a `[placeholder]`, which the site leaves out. To find them all,
search `public/content/artworks.json` and `src/content` for `[`. In particular:

- **Statement** — `site.ts`. The statement ("How I work") is a first-person draft
  written by the designer from looking at the paintings, shown on the site as it is. Alexandra can
  replace it any time.
- **All the first-person copy** (the intro on the home page, the lines on the Available and Contact
  pages, "I made this one as a gift", etc.) was drafted in her voice from what is visible in the
  works and her captions. She should read it through and change anything that doesn't sound like her.
- **Availability of every work.** The four "available" works were chosen only to demonstrate the flow.
  The works marked "gifted" are the ones whose captions dedicate them to someone
  ("pro nejmilejší paní doktorku", "Angel for my angels", etc.).
- **Titles marked `workingTitle: true`** — descriptive "Untitled (…)" titles chosen for the site.
- **Medium and dimensions.** Only one size is known (50 × 70 cm, from a caption). Media come from
  her hashtags.
- **Years** are the year each work was posted, not necessarily the year it was made.
- **Translations** of Czech titles and captions are editorial. "sestřička" (nurse / little sister)
  is left untranslated where it matters.
- **Radosti v nás**: the "graduation project in graphic design, 2026" line comes from the poster in
  her photos ("Maturitní práce 2026, Grafický design"). Please confirm she's happy to have it listed.

## Image sources

All images come from public posts on @al.3xqndra: the 12 posts (May 2023 – June 2026) visible
without logging in. The profile has 34 posts, so more work can be added once Alexandra provides the files. Two photos were
cropped to the canvas; the uncropped versions are kept as installation views. Photos showing other
people (friends at the exhibition) and one whiteboard photo from a carousel were left out on purpose.
