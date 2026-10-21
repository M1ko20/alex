<?php
/**
 * The admin: /admin, password in lib/config.php.
 *
 * Everything about the works can be changed here — add, edit, hide, reorder,
 * delete, and their photos (upload, describe, reorder, delete). Changes are
 * saved to data/ and show on the site straight away (see lib/store.php).
 *
 *   ./             the list of works, in the order they hang
 *   ./?edit=slug   one work
 *   ./?new         a new work
 *
 * Every change is a POST with a CSRF token, answered with a redirect.
 */
declare(strict_types=1);

require __DIR__ . '/../lib/store.php';
require __DIR__ . '/../lib/images.php';
$config = require __DIR__ . '/../lib/config.php';

const AVAILABILITY = [
    'available' => 'Na prodej',
    'reserved' => 'Rezervováno',
    'sold' => 'Prodáno',
    'gifted' => 'Darováno',
    'private' => 'Nechávám si (neprodejné)',
    'unknown' => 'Neuvedeno',
];
const PRESENCE = [
    'lead' => ['Velký', 'má vlastní řadu na zdi, velký, s popiskem vedle'],
    'standard' => ['Běžný', 'visí ve dvojici s dalším obrazem'],
    'quiet' => ['Menší', 'o něco menší, ve dvojici nebo sám'],
];
const KINDS = [
    'work' => 'Celé dílo zepředu',
    'detail' => 'Detail',
    'studio' => 'V ateliéru / na stojanu',
    'installation' => 'Na zdi / v prostoru',
    'reference' => 'Předloha (fotka, podle které vzniklo)',
    'related' => 'Související (skicák, zin, studie)',
];
const UPLOAD_ERRORS = [
    UPLOAD_ERR_INI_SIZE => 'soubor je větší, než server dovolí',
    UPLOAD_ERR_FORM_SIZE => 'soubor je moc velký',
    UPLOAD_ERR_PARTIAL => 'nahrál se jen částečně',
    UPLOAD_ERR_NO_TMP_DIR => 'na serveru chybí dočasná složka',
    UPLOAD_ERR_CANT_WRITE => 'server ho nemůže uložit',
    UPLOAD_ERR_EXTENSION => 'server ho odmítl',
];

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
// Sessions are kept in data/ when possible: the hosting's shared session folder
// is often cleaned after 24 minutes, which would log her out in the middle of writing.
if (is_dir(DATA_DIR . '/sessions') || @mkdir(DATA_DIR . '/sessions', 0770, true)) {
    session_save_path(DATA_DIR . '/sessions');
    ini_set('session.gc_maxlifetime', '43200');
}
session_name('admin');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => $https]);
session_start();

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: same-origin');

// ---------------------------------------------------------------- helpers

function h(mixed $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}

function redirect(string $to): never
{
    // admin.js uploads with fetch, which would follow a redirect itself and
    // use up the flash message; it gets the address to go to instead.
    if (isset($_SERVER['HTTP_X_ADMIN_FETCH'])) {
        header('Content-Type: application/json');
        exit(json_encode(['location' => $to]));
    }
    header("Location: $to", true, 303);
    exit;
}

function flash(string $message, string $type = 'ok'): void
{
    $_SESSION['flash'][] = [$type, $message];
}

function logged_in(): bool
{
    return !empty($_SESSION['admin']);
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . h($_SESSION['csrf'] ?? '') . '">';
}

function find_work(array $works, string $slug): int
{
    foreach ($works as $i => $w) {
        if ($w['slug'] === $slug) return $i;
    }
    return -1;
}

function slugify(string $s): string
{
    $s = strtr(mb_strtolower($s, 'UTF-8'), [
        'á' => 'a', 'ä' => 'a', 'č' => 'c', 'ď' => 'd', 'é' => 'e', 'ě' => 'e', 'ë' => 'e', 'í' => 'i',
        'ľ' => 'l', 'ĺ' => 'l', 'ň' => 'n', 'ó' => 'o', 'ô' => 'o', 'ö' => 'o', 'ř' => 'r', 'ŕ' => 'r',
        'š' => 's', 'ť' => 't', 'ú' => 'u', 'ů' => 'u', 'ü' => 'u', 'ý' => 'y', 'ž' => 'z', 'ß' => 'ss',
    ]);
    return trim(preg_replace('/[^a-z0-9]+/', '-', $s), '-');
}

function unique_slug(string $slug, array $works, int $self): string
{
    $candidate = $slug;
    for ($n = 2; ; $n++) {
        $at = find_work($works, $candidate);
        if ($at < 0 || $at === $self) return $candidate;
        $candidate = "$slug-$n";
    }
}

/** Only http(s) links are kept, so nothing odd ends up in an href. */
function clean_url(string $url): string
{
    return preg_match('#^https?://\S+$#i', $url) ? $url : '';
}

/** A work is on the site when it isn't hidden and has at least one photo. */
function is_public(array $work, array $images): bool
{
    if (!empty($work['hidden'])) return false;
    foreach ($work['images'] as $img) {
        if (isset($images[$img['file']])) return true;
    }
    return false;
}

function thumb(array $images, string $file): string
{
    $src = $images[$file]['srcset'][0]['src'] ?? null;
    return $src ? '..' . $src : '';
}

/** Deletes photos from the manifest and from img/, unless another work still uses them. */
function drop_images(array $files, array &$images, array $works): void
{
    $used = [];
    foreach ($works as $w) {
        foreach ($w['images'] as $img) $used[$img['file']] = true;
    }
    foreach ($files as $file) {
        if (isset($used[$file]) || !isset($images[$file])) continue;
        delete_image_files($images[$file]);
        unset($images[$file]);
    }
}

function ini_bytes(string $key): int
{
    $v = trim((string) ini_get($key));
    $n = (int) $v;
    return match (strtolower(substr($v, -1))) {
        'g' => $n << 30,
        'm' => $n << 20,
        'k' => $n << 10,
        default => $n,
    } ?: PHP_INT_MAX;
}

/** The biggest photo one upload can carry (admin.js sends them one by one). */
function upload_limit(): int
{
    return max(256 << 10, min(ini_bytes('upload_max_filesize'), ini_bytes('post_max_size') - (64 << 10)));
}

function limit_note(): string
{
    return 'Server přijme najednou nejvýš ' . ini_get('post_max_size') . ' (jeden soubor do ' . ini_get('upload_max_filesize') . ').';
}

// ---------------------------------------------------------------- login

function attempts_file(): string
{
    return DATA_DIR . '/login-attempts.json';
}

/** At most 10 wrong passwords per address in 15 minutes. */
function recent_failures(string $ip): array
{
    $all = is_file(attempts_file()) ? (json_decode((string) file_get_contents(attempts_file()), true) ?: []) : [];
    return array_values(array_filter($all[$ip] ?? [], fn($t) => $t > time() - 900));
}

function record_failure(string $ip): void
{
    $all = is_file(attempts_file()) ? (json_decode((string) file_get_contents(attempts_file()), true) ?: []) : [];
    foreach ($all as $k => $times) {
        $all[$k] = array_values(array_filter($times, fn($t) => $t > time() - 900));
        if (!$all[$k]) unset($all[$k]);
    }
    $all[$ip][] = time();
    @file_put_contents(attempts_file(), json_encode($all), LOCK_EX);
}

function handle_login(array $config): never
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (count(recent_failures($ip)) >= 10) {
        flash('Moc pokusů. Zkus to znovu za čtvrt hodiny.', 'error');
        redirect('./');
    }
    $password = (string) ($config['admin_password'] ?? '');
    // An empty password (config.php copied from the template and not filled in) never logs in.
    if ($password !== '' && hash_equals($password, (string) ($_POST['password'] ?? ''))) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
        redirect('./');
    }
    record_failure($ip);
    sleep(1);
    flash('Špatné heslo.', 'error');
    redirect('./');
}

// ---------------------------------------------------------------- actions

function handle_move(): string
{
    $works = load_artworks();
    $i = find_work($works, (string) ($_POST['slug'] ?? ''));
    if ($i < 0) return './';
    $to = match ($_POST['dir'] ?? '') {
        'up' => $i - 1,
        'down' => $i + 1,
        'top' => 0,
        default => $i,
    };
    if ($to >= 0 && $to < count($works) && $to !== $i) {
        $work = array_splice($works, $i, 1);
        array_splice($works, $to, 0, $work);
        save_artworks($works);
    }
    return './#w-' . rawurlencode($works[$to]['slug'] ?? '');
}

function handle_toggle_hidden(): string
{
    $works = load_artworks();
    $i = find_work($works, (string) ($_POST['slug'] ?? ''));
    if ($i < 0) return './';
    if (empty($works[$i]['hidden'])) {
        $works[$i]['hidden'] = true;
        flash("„{$works[$i]['title']}“ je skrytý — na webu se neukazuje.");
    } else {
        unset($works[$i]['hidden']);
        flash("„{$works[$i]['title']}“ je zpátky na webu.");
    }
    save_artworks($works);
    return './#w-' . rawurlencode($works[$i]['slug']);
}

function handle_delete(): string
{
    $works = load_artworks();
    $images = load_images();
    $i = find_work($works, (string) ($_POST['slug'] ?? ''));
    if ($i < 0) return './';
    [$work] = array_splice($works, $i, 1);
    save_artworks($works);
    drop_images(array_column($work['images'], 'file'), $images, $works);
    save_images($images);
    flash("„{$work['title']}“ je smazaný i s fotkami.");
    return './';
}

function handle_save(): string
{
    $works = load_artworks();
    $images = load_images();
    $original = (string) ($_POST['original_slug'] ?? '');
    $i = $original === '' ? -1 : find_work($works, $original);
    if ($original !== '' && $i < 0) {
        flash('Tenhle obraz mezitím někdo smazal.', 'error');
        return './';
    }
    $old = $i >= 0 ? $works[$i] : ['images' => []];
    $field = fn(string $k) => trim(str_replace("\r\n", "\n", (string) ($_POST[$k] ?? '')));

    // The fields, in the same order as the Artwork type in src/content/types.ts.
    $title = $field('title') ?: 'Bez názvu';
    $work = ['slug' => unique_slug(slugify($field('slug') ?: $title) ?: 'obraz', $works, $i), 'title' => $title];
    if ($field('titleTranslation') !== '') $work['titleTranslation'] = $field('titleTranslation');
    if (!empty($_POST['workingTitle'])) $work['workingTitle'] = true;
    $year = $field('year');
    $work['year'] = preg_match('/^\d{4}$/', $year) ? (int) $year : null;
    $work['medium'] = $field('medium');
    $work['dimensions'] = $field('dimensions');
    $work['availability'] = isset(AVAILABILITY[$field('availability')]) ? $field('availability') : 'unknown';
    if ($field('price') !== '') $work['price'] = $field('price');
    $work['presence'] = isset(PRESENCE[$field('presence')]) ? $field('presence') : 'standard';
    if (!empty($_POST['hidden'])) $work['hidden'] = true;

    // Photos: the descriptions as edited, in the current order.
    $posted = [];
    foreach ((array) ($_POST['img'] ?? []) as $p) {
        if (is_array($p) && isset($p['file'])) $posted[(string) $p['file']] = $p;
    }
    $list = [];
    foreach ($old['images'] as $img) {
        $p = $posted[$img['file']] ?? [];
        $kind = (string) ($p['kind'] ?? $img['kind']);
        $item = ['file' => $img['file'], 'kind' => isset(KINDS[$kind]) ? $kind : $img['kind']];
        $caption = trim((string) ($p['caption'] ?? ($img['caption'] ?? '')));
        if ($caption !== '') $item['caption'] = $caption;
        $item['alt'] = trim((string) ($p['alt'] ?? $img['alt']));
        $list[] = $item;
    }

    // One of the buttons beside a photo: "up:<file>", "down:<file>", "delete:<file>".
    [$op, $target] = array_pad(explode(':', (string) ($_POST['op'] ?? 'save'), 2), 2, '');
    $at = array_search($target, array_column($list, 'file'), true);
    $removed = [];
    if ($at !== false) {
        if ($op === 'delete') {
            $removed = array_splice($list, $at, 1);
        } elseif (($op === 'up' && $at > 0) || ($op === 'down' && $at < count($list) - 1)) {
            $to = $op === 'up' ? $at - 1 : $at + 1;
            [$list[$at], $list[$to]] = [$list[$to], $list[$at]];
        }
    }

    // New photos.
    $uploads = $_FILES['upload'] ?? null;
    $added = 0;
    if ($uploads && is_array($uploads['name'])) {
        $kind = isset(KINDS[$_POST['upload_kind'] ?? '']) ? $_POST['upload_kind'] : 'detail';
        foreach ($uploads['name'] as $n => $name) {
            $error = $uploads['error'][$n];
            if ($error === UPLOAD_ERR_NO_FILE) continue;
            if ($error !== UPLOAD_ERR_OK) {
                flash("$name: " . (UPLOAD_ERRORS[$error] ?? 'nepodařilo se ho nahrát') . '. ' . limit_note(), 'error');
                continue;
            }
            try {
                [$key, $entry] = process_image($uploads['tmp_name'][$n], $work['slug']);
                $images[$key] = $entry;
                $list[] = ['file' => $key, 'kind' => $list ? $kind : 'work', 'alt' => ''];
                $added++;
            } catch (RuntimeException $e) {
                flash("$name: " . $e->getMessage(), 'error');
            }
        }
    }
    $work['images'] = $list;

    if ($field('words_text') !== '') {
        $work['words'] = ['text' => $field('words_text'), 'lang' => $field('words_lang') === 'cs' ? 'cs' : 'en'];
        if ($field('words_translation') !== '') $work['words']['translation'] = $field('words_translation');
        $work['words']['date'] = preg_match('/^\d{4}-\d{2}-\d{2}$/', $field('words_date')) ? $field('words_date') : '';
        $work['words']['source'] = clean_url($field('words_source'));
    }
    $work['description'] = $field('description');
    if (clean_url($field('instagram')) !== '') $work['instagram'] = clean_url($field('instagram'));

    if ($i >= 0) {
        $works[$i] = $work;
    } else {
        if (($_POST['position'] ?? 'end') === 'start') array_unshift($works, $work);
        else $works[] = $work;
    }
    save_artworks($works);
    drop_images(array_column($removed, 'file'), $images, $works);
    save_images($images);

    flash(match (true) {
        $i < 0 => 'Obraz je přidaný.' . (!$list ? ' Nahraj k němu fotku, jinak se na webu neukáže.' : ''),
        $op === 'delete' && $removed => 'Fotka je smazaná.',
        $added > 0 => $added === 1 ? 'Fotka je nahraná. Nezapomeň ji popsat.' : "Nahráno $added fotek. Nezapomeň je popsat.",
        default => 'Uloženo.',
    });
    $anchor = $added || in_array($op, ['up', 'down', 'delete'], true) ? '#photos' : '';
    return '?edit=' . rawurlencode($work['slug']) . $anchor;
}

// ---------------------------------------------------------------- requests

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Over post_max_size PHP drops the whole request, token and all.
    if (!$_POST && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        flash('Fotky byly na server moc velké. ' . limit_note() . ' Zkus jich nahrát méně najednou.', 'error');
        redirect('./' . (isset($_GET['edit']) ? '?edit=' . rawurlencode((string) $_GET['edit']) : ''));
    }
    $action = (string) ($_POST['action'] ?? '');
    if ($action === 'login') handle_login($config);
    if (!logged_in()) redirect('./');
    if (!hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''))) {
        flash('Formulář vypršel, zkus to prosím znovu.', 'error');
        redirect('./');
    }
    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        redirect('./');
    }

    $lock = lock_data();
    try {
        $to = match ($action) {
            'move' => handle_move(),
            'toggle_hidden' => handle_toggle_hidden(),
            'delete' => handle_delete(),
            'save' => handle_save(),
            default => './',
        };
    } catch (RuntimeException $e) {
        flash($e->getMessage(), 'error');
        $to = './';
    }
    redirect($to);
}

// ---------------------------------------------------------------- pages

function layout(string $title, callable $body): void
{
    // Photos are uploaded one request at a time, each with the same message.
    $flash = array_unique($_SESSION['flash'] ?? [], SORT_REGULAR);
    unset($_SESSION['flash']);
    $v = fn(string $f) => $f . '?v=' . @filemtime(__DIR__ . "/$f");
    ?>
<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?= h($title) ?> — Administrace</title>
  <link rel="icon" href="../favicon.svg">
  <link rel="stylesheet" href="<?= h($v('admin.css')) ?>">
  <script src="<?= h($v('admin.js')) ?>" defer></script>
</head>
<body>
  <header class="top">
    <a class="top-name" href="./">Administrace</a>
    <?php if (logged_in()): ?>
      <nav class="top-nav">
        <a href="../" target="_blank" rel="noopener">Web ↗</a>
        <form method="post">
          <?= csrf_field() ?>
          <button name="action" value="logout" class="link">Odhlásit</button>
        </form>
      </nav>
    <?php endif ?>
  </header>
  <main class="main">
    <?php foreach ($flash as [$type, $message]): ?>
      <p class="flash is-<?= h($type) ?>" role="<?= $type === 'error' ? 'alert' : 'status' ?>"><?= h($message) ?></p>
    <?php endforeach ?>
    <?php $body() ?>
  </main>
</body>
</html>
<?php
}

function page_login(): void
{
    layout('Přihlášení', function () { ?>
      <form method="post" class="login card">
        <h1>Přihlášení</h1>
        <label class="field">
          <span>Heslo</span>
          <input type="password" name="password" autocomplete="current-password" inputmode="numeric" required autofocus>
        </label>
        <button class="button is-solid" name="action" value="login">Přihlásit</button>
      </form>
    <?php });
}

function setup_warnings(): array
{
    $warnings = [];
    $writable = fn(string $dir) => is_dir($dir) ? is_writable($dir) : is_writable(dirname($dir));
    if (!$writable(DATA_DIR)) $warnings[] = 'Do složky data/ nejde zapisovat, takže změny nepůjde uložit. Nastav jí na hostingu práva k zápisu (775).';
    if (!$writable(IMG_DIR)) $warnings[] = 'Do složky img/ nejde zapisovat, takže nepůjde nahrávat fotky. Nastav jí na hostingu práva k zápisu (775).';
    if (!images_supported()) $warnings[] = 'PHP na serveru neumí obrázky ve formátu WebP (rozšíření GD). Bez něj nepůjde nahrávat fotky — zapni ho v nastavení hostingu.';
    return $warnings;
}

function page_list(array $works, array $images): void
{
    layout('Obrazy', function () use ($works, $images) {
        $number = 0;
        $first = true;
        ?>
      <?php foreach (setup_warnings() as $w): ?><p class="flash is-error"><?= h($w) ?></p><?php endforeach ?>
      <div class="list-head">
        <div>
          <h1>Obrazy</h1>
          <p class="dim">Pořadí tady je pořadí na zdi. První obraz je velký na úvodní stránce.</p>
        </div>
        <a class="button is-solid" href="?new">+ Přidat obraz</a>
      </div>

      <ol class="works">
        <?php foreach ($works as $i => $w):
            $public = is_public($w, $images);
            if ($public) $number++;
            $cover = $w['images'][0]['file'] ?? null;
            $src = $cover ? thumb($images, $cover) : '';
            ?>
          <li class="work<?= $public ? '' : ' is-off' ?>" id="w-<?= h($w['slug']) ?>">
            <a class="work-thumb" href="?edit=<?= h(rawurlencode($w['slug'])) ?>">
              <?php if ($src): ?><img src="<?= h($src) ?>" alt="" loading="lazy"><?php else: ?><span>bez fotky</span><?php endif ?>
            </a>
            <div class="work-text">
              <p class="work-no"><?= $public ? sprintf('č. %02d', $number) : 'není na webu' ?></p>
              <h2><a href="?edit=<?= h(rawurlencode($w['slug'])) ?>"><?= h($w['title']) ?></a></h2>
              <p class="dim">
                <?= h(implode(' · ', array_filter([$w['year'] ?? null, AVAILABILITY[$w['availability']] ?? '', PRESENCE[$w['presence']][0] ?? '']))) ?>
              </p>
              <p class="tags">
                <?php if ($public && $first): $first = false ?><span class="tag is-accent">úvodní obraz</span><?php endif ?>
                <?php if (!empty($w['hidden'])): ?><span class="tag">skrytý</span><?php endif ?>
                <?php if (!$cover): ?><span class="tag is-warn">chybí fotka</span><?php endif ?>
                <?php if (!empty($w['workingTitle'])): ?><span class="tag">pracovní název</span><?php endif ?>
              </p>
            </div>
            <div class="work-actions">
              <form method="post" class="move">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="move">
                <input type="hidden" name="slug" value="<?= h($w['slug']) ?>">
                <button name="dir" value="up" title="Posunout výš" aria-label="Posunout výš" <?= $i === 0 ? 'disabled' : '' ?>>↑</button>
                <button name="dir" value="down" title="Posunout níž" aria-label="Posunout níž" <?= $i === count($works) - 1 ? 'disabled' : '' ?>>↓</button>
              </form>
              <a class="button" href="?edit=<?= h(rawurlencode($w['slug'])) ?>">Upravit</a>
              <details class="more">
                <summary aria-label="Další možnosti">•••</summary>
                <div class="more-menu">
                  <?php if ($public): ?><a href="../work/<?= h(rawurlencode($w['slug'])) ?>" target="_blank" rel="noopener">Zobrazit na webu ↗</a><?php endif ?>
                  <?php if ($i > 0): ?>
                    <form method="post">
                      <?= csrf_field() ?>
                      <input type="hidden" name="slug" value="<?= h($w['slug']) ?>">
                      <input type="hidden" name="dir" value="top">
                      <button name="action" value="move" class="link">Dát na začátek</button>
                    </form>
                  <?php endif ?>
                  <form method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="slug" value="<?= h($w['slug']) ?>">
                    <button name="action" value="toggle_hidden" class="link"><?= empty($w['hidden']) ? 'Skrýt z webu' : 'Zase ukázat na webu' ?></button>
                  </form>
                  <form method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="slug" value="<?= h($w['slug']) ?>">
                    <button name="action" value="delete" class="link is-danger" data-confirm="Opravdu smazat „<?= h($w['title']) ?>“ i se všemi fotkami? Nejde to vrátit.">Smazat</button>
                  </form>
                </div>
              </details>
            </div>
          </li>
        <?php endforeach ?>
      </ol>
      <?php if (!$works): ?><p class="empty">Zatím tu nic není. <a href="?new">Přidej první obraz.</a></p><?php endif ?>
    <?php });
}

function page_edit(?array $w, array $images): void
{
    $new = $w === null;
    $w ??= ['slug' => '', 'title' => '', 'year' => (int) date('Y'), 'medium' => '', 'dimensions' => '', 'availability' => 'unknown', 'presence' => 'standard', 'images' => [], 'description' => ''];
    layout($new ? 'Nový obraz' : $w['title'], function () use ($w, $new, $images) {
        $sel = fn(bool $on) => $on ? ' selected' : '';
        $words = $w['words'] ?? ['text' => '', 'lang' => 'en', 'date' => '', 'source' => ''];
        ?>
      <p><a href="./" class="back">← Všechny obrazy</a></p>
      <h1><?= $new ? 'Nový obraz' : h($w['title']) ?></h1>
      <?php foreach (setup_warnings() as $warning): ?><p class="flash is-error"><?= h($warning) ?></p><?php endforeach ?>

      <form method="post" enctype="multipart/form-data" class="edit" id="edit">
        <!-- Enter in a text field saves, instead of pressing the first photo button. -->
        <button name="op" value="save" class="sr-only" tabindex="-1" aria-hidden="true">Uložit</button>
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="save">
        <input type="hidden" name="original_slug" value="<?= h($w['slug']) ?>">

        <p class="note">Texty na webu jsou anglicky. Cokoli v [hranatých závorkách] se na webu ukáže jako výrazně označený zástupný text.</p>

        <section class="card">
          <h2>Základní údaje</h2>
          <div class="grid">
            <label class="field is-wide">
              <span>Název *</span>
              <input name="title" value="<?= h($w['title']) ?>" required>
            </label>
            <label class="field">
              <span>Překlad názvu</span>
              <input name="titleTranslation" value="<?= h($w['titleTranslation'] ?? '') ?>">
              <small>Když je název česky, jeho anglický překlad.</small>
            </label>
            <label class="check">
              <input type="checkbox" name="workingTitle" value="1"<?= !empty($w['workingTitle']) ? ' checked' : '' ?>>
              <span>Pracovní název<small>Na stránce obrazu je pak poznámka, že název ještě není potvrzený.</small></span>
            </label>
            <label class="field">
              <span>Rok</span>
              <input name="year" value="<?= h($w['year'] ?? '') ?>" inputmode="numeric" pattern="\d{4}" placeholder="např. 2026">
            </label>
            <label class="field">
              <span>Technika</span>
              <input name="medium" value="<?= h($w['medium']) ?>" placeholder="např. Acrylic on canvas">
            </label>
            <label class="field">
              <span>Rozměry</span>
              <input name="dimensions" value="<?= h($w['dimensions']) ?>" placeholder="např. 50 × 70 cm">
            </label>
            <label class="field">
              <span>Adresa na webu</span>
              <input name="slug" value="<?= h($w['slug']) ?>" pattern="[a-z0-9\-]*" placeholder="vytvoří se z názvu">
              <small>/work/<b><?= h($w['slug'] ?: '…') ?></b> — malá písmena bez diakritiky, čísla a pomlčky. Když ji změníš, staré odkazy přestanou fungovat.</small>
            </label>
          </div>
        </section>

        <section class="card">
          <h2>Prodej</h2>
          <div class="grid">
            <label class="field">
              <span>Stav</span>
              <select name="availability">
                <?php foreach (AVAILABILITY as $k => $label): ?>
                  <option value="<?= $k ?>"<?= $sel($w['availability'] === $k) ?>><?= h($label) ?></option>
                <?php endforeach ?>
              </select>
              <small>„Na prodej“ ukáže obraz na stránce Available, označí ho na zdi a přidá formulář pro dotaz.</small>
            </label>
            <label class="field">
              <span>Cena</span>
              <input name="price" value="<?= h($w['price'] ?? '') ?>" placeholder="např. €450">
              <small>Prázdné = na webu stojí „Price on request“.</small>
            </label>
          </div>
        </section>

        <section class="card">
          <h2>Na zdi</h2>
          <fieldset class="choices">
            <legend>Jak velký je na zdi</legend>
            <?php foreach (PRESENCE as $k => [$label, $hint]): ?>
              <label class="choice">
                <input type="radio" name="presence" value="<?= $k ?>"<?= $w['presence'] === $k ? ' checked' : '' ?>>
                <span><b><?= h($label) ?></b> <small><?= h($hint) ?></small></span>
              </label>
            <?php endforeach ?>
          </fieldset>
          <label class="check">
            <input type="checkbox" name="hidden" value="1"<?= !empty($w['hidden']) ? ' checked' : '' ?>>
            <span>Skrýt z webu<small>Obraz zůstane tady v administraci, ale na webu se neukáže.</small></span>
          </label>
          <?php if ($new): ?>
            <label class="field">
              <span>Kam ho pověsit</span>
              <select name="position">
                <option value="end">Na konec</option>
                <option value="start">Na začátek (bude úvodní obraz)</option>
              </select>
            </label>
          <?php endif ?>
        </section>

        <section class="card" id="photos">
          <h2>Fotky</h2>
          <p class="dim">První fotka je hlavní: celé dílo, rovně zepředu. Ostatní se ukážou pod ním na stránce obrazu.</p>
          <ol class="photos">
            <?php foreach ($w['images'] as $n => $img):
                $src = thumb($images, $img['file']);
                $last = $n === count($w['images']) - 1;
                ?>
              <li class="photo">
                <input type="hidden" name="img[<?= $n ?>][file]" value="<?= h($img['file']) ?>">
                <div class="photo-thumb">
                  <?php if ($src): ?><img src="<?= h($src) ?>" alt="" loading="lazy"><?php else: ?><span>soubor chybí</span><?php endif ?>
                  <?php if ($n === 0): ?><span class="tag is-accent">hlavní</span><?php endif ?>
                </div>
                <div class="photo-fields">
                  <label class="field">
                    <span>Co je na ní</span>
                    <select name="img[<?= $n ?>][kind]">
                      <?php foreach (KINDS as $k => $label): ?>
                        <option value="<?= $k ?>"<?= $sel($img['kind'] === $k) ?>><?= h($label) ?></option>
                      <?php endforeach ?>
                    </select>
                  </label>
                  <label class="field">
                    <span>Popisek pod fotkou</span>
                    <input name="img[<?= $n ?>][caption]" value="<?= h($img['caption'] ?? '') ?>" placeholder="např. Detail, On the easel">
                  </label>
                  <label class="field is-wide">
                    <span>Popis pro nevidomé a vyhledávače</span>
                    <textarea name="img[<?= $n ?>][alt]" rows="2" placeholder="Co přesně je na fotce vidět, jednou dvěma větami (anglicky)."><?= h($img['alt']) ?></textarea>
                  </label>
                </div>
                <div class="photo-actions">
                  <button name="op" value="up:<?= h($img['file']) ?>" title="Posunout dopředu" aria-label="Posunout dopředu"<?= $n === 0 ? ' disabled' : '' ?>>↑</button>
                  <button name="op" value="down:<?= h($img['file']) ?>" title="Posunout dozadu" aria-label="Posunout dozadu"<?= $last ? ' disabled' : '' ?>>↓</button>
                  <button name="op" value="delete:<?= h($img['file']) ?>" class="is-danger" data-confirm="Smazat tuhle fotku? Nejde to vrátit.">Smazat</button>
                </div>
              </li>
            <?php endforeach ?>
          </ol>
          <div class="upload">
            <label class="field">
              <span><?= $w['images'] ? 'Přidat fotky' : 'Nahrát fotky' ?></span>
              <input type="file" name="upload[]" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple data-upload data-max-bytes="<?= upload_limit() ?>">
              <small>JPG, PNG nebo WebP. Velké fotky z mobilu se před nahráním samy zmenší.</small>
            </label>
            <?php if ($w['images']): ?>
              <label class="field">
                <span>Co na nich je</span>
                <select name="upload_kind">
                  <?php foreach (KINDS as $k => $label): if ($k === 'work') continue ?>
                    <option value="<?= $k ?>"><?= h($label) ?></option>
                  <?php endforeach ?>
                </select>
              </label>
            <?php endif ?>
            <p class="upload-status dim" data-upload-status hidden></p>
          </div>
        </section>

        <section class="card">
          <h2>Texty</h2>
          <label class="field">
            <span>Pár řádků o obrazu</span>
            <textarea name="description" rows="4"><?= h($w['description']) ?></textarea>
          </label>
          <label class="field">
            <span>Odkaz na příspěvek na Instagramu</span>
            <input name="instagram" type="url" value="<?= h($w['instagram'] ?? '') ?>" placeholder="https://www.instagram.com/p/…">
          </label>
        </section>

        <section class="card">
          <h2>Moje slova</h2>
          <p class="dim">Citát pod údaji o obrazu, třeba popisek z Instagramu. Prázdné = žádný citát.</p>
          <label class="field">
            <span>Text</span>
            <textarea name="words_text" rows="3"><?= h($words['text']) ?></textarea>
          </label>
          <div class="grid">
            <label class="field">
              <span>Jazyk citátu</span>
              <select name="words_lang">
                <option value="en"<?= $sel($words['lang'] === 'en') ?>>Angličtina</option>
                <option value="cs"<?= $sel($words['lang'] === 'cs') ?>>Čeština</option>
              </select>
            </label>
            <label class="field">
              <span>Anglický překlad</span>
              <input name="words_translation" value="<?= h($words['translation'] ?? '') ?>">
              <small>Jen když je citát česky.</small>
            </label>
            <label class="field">
              <span>Datum</span>
              <input name="words_date" type="date" value="<?= h($words['date']) ?>">
            </label>
            <label class="field">
              <span>Odkaz, odkud citát je</span>
              <input name="words_source" type="url" value="<?= h($words['source']) ?>" placeholder="https://www.instagram.com/p/…">
            </label>
          </div>
        </section>

        <div class="savebar">
          <button class="button is-solid" name="op" value="save"><?= $new ? 'Přidat obraz' : 'Uložit' ?></button>
          <a href="./" class="link">Zrušit</a>
        </div>
      </form>

      <?php if (!$new): ?>
        <form method="post" class="danger-zone">
          <?= csrf_field() ?>
          <input type="hidden" name="slug" value="<?= h($w['slug']) ?>">
          <button name="action" value="delete" class="link is-danger" data-confirm="Opravdu smazat „<?= h($w['title']) ?>“ i se všemi fotkami? Nejde to vrátit.">Smazat celý obraz</button>
        </form>
      <?php endif ?>
    <?php });
}

if (!logged_in()) {
    page_login();
    exit;
}

$works = load_artworks();
$images = load_images();
if (isset($_GET['new'])) {
    page_edit(null, $images);
} elseif (isset($_GET['edit'])) {
    $i = find_work($works, (string) $_GET['edit']);
    if ($i < 0) {
        flash('Takový obraz tu není.', 'error');
        redirect('./');
    }
    page_edit($works[$i], $images);
} else {
    page_list($works, $images);
}
