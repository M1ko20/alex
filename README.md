# Alexandra Tomanová — website

The personal digital gallery of Alexandra Tomanová (Instagram [@al.3xqndra](https://www.instagram.com/al.3xqndra/)).
Static site: React + TypeScript + Vite, deployable on Netlify.

```bash
npm install
npm run dev        # local development
npm run images     # after adding or changing any photo in /artwork
npm run build      # production build → /dist
```

## Creative direction, in short

- **It's her studio wall, in her voice.** Everything is written in the first person, as Alexandra.
  Her own captions are written out by hand on scraps of paper taped to the wall (Caveat, a
  handwriting face), the way her collages keep tickets, notes and handwriting.
- **A salon hang, not a grid.** The works hang edge to edge in rows of equal height that fill the
  width, so the paintings are big and there's no dead wall. Rows are chosen together
  (`src/components/Wall.tsx`) so each lands near a comfortable height. Rows with a lead work aim
  taller, quiet works a little smaller. Her notes take a place in the row on wide screens and sit
  under the work on narrower ones. On phones it becomes one walk from top to bottom.
- **The room takes on the painting.** One warm wall colour and one ink colour. Each work's average
  colour is sampled at build time and the page takes on a little of it while you look at that work.
- **Gallery conventions instead of shop conventions.** Numbered labels, a list of every work,
  "Price on request". An available work is marked with a small **hollow** dot — the opposite of a
  gallery's red "sold" sticker. "Ask me about this one" opens a message that already names the work.
- **Nothing invented.** Anything we don't know is a visible `[placeholder]`.

## Where things live

| What | Where |
| --- | --- |
| The works (titles, year, medium, size, availability, images, her words) | `src/content/artworks.ts` |
| Artist info, bio, statement, email, projects | `src/content/site.ts` |
| Content types + the placeholder convention | `src/content/types.ts` |
| Original photos (one folder per work) | `artwork/<slug>/01-work.jpg`, `02-detail.jpg`, … |
| Generated responsive images + manifest | `public/img/…`, `src/content/images.generated.json` (don't edit by hand) |

### Adding a new work

1. Create `artwork/<slug>/` and put the straight-on photo in as `01-work.jpg`. Details, studio shots
   and so on follow as `02-…`, `03-…`.
2. Run `npm run images`.
3. Add an entry to `src/content/artworks.ts`. **Its position in the list is its position on the
   wall** and sets its number. Set `presence` to `lead` (its own wall), `standard` (paired) or
   `quiet` (smaller).

### Selling a work

Set `availability: 'available'` (optionally `price: '€…'`; without it the site says "Price on
request"). It then appears on the Available page, is marked on the wall, and gets an enquiry form.
Other states: `reserved`, `sold`, `gifted`, `private`, `unknown`.

## Enquiries (no backend)

The forms post to **Netlify Forms**. A hidden copy of the form in `index.html` lets Netlify detect it.
After the first deploy, turn on email notifications in the Netlify dashboard:
*Site configuration → Forms → Form notifications → Email*. Each message arrives with the subject
already filled in, e.g. `Inquiry about “A place in my head” (No. 07)`.

If sending fails (and in local development), visitors are offered email instead. While the email
is still a placeholder, they are pointed to her Instagram.

## What still needs real information

Everything shown on the site with a dashed, monospaced `[placeholder]` style. To find them all,
search `src/content` for `[`. In particular:

- **Email address** — `artist.email` in `site.ts`
- **Bio** and **statement** — `site.ts`. The statement ("How I work") is a first-person draft
  written by the designer from looking at the paintings. It is clearly labelled as such and must be
  replaced or approved by Alexandra.
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
