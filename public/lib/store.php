<?php
/**
 * Where the site's data lives on the server.
 *
 *   content/  the starting copy that comes with every build (and is
 *             overwritten by every upload of a new build)
 *   data/     the live copy the admin edits; created from content/ the first
 *             time it's needed and never part of a build, so redeploying the
 *             site never undoes changes made in the admin
 *   img/      the responsive WebP files, both built and uploaded
 */
declare(strict_types=1);

const SITE_ROOT = __DIR__ . '/..';
// Local development keeps the live copy outside public/, so it never ends up in a build.
define('DATA_DIR', getenv('SITE_DATA_DIR') ?: SITE_ROOT . '/data');
const SEED_DIR = SITE_ROOT . '/content';
const IMG_DIR = SITE_ROOT . '/img';

function load_json(string $name): array
{
    $live = DATA_DIR . "/$name";
    $file = is_file($live) ? $live : SEED_DIR . "/$name";
    $data = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    return is_array($data) ? $data : [];
}

/** Writes to a temporary file first, so a reader never sees half a file. */
function save_json(string $name, array $data, bool $object = false): void
{
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0775, true)) {
        throw new RuntimeException('Nejde vytvořit složku data/ — zkontroluj práva k zápisu na hostingu.');
    }
    $json = json_encode($object && !$data ? new stdClass() : $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $tmp = DATA_DIR . "/$name." . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $json . "\n") === false || !rename($tmp, DATA_DIR . "/$name")) {
        @unlink($tmp);
        throw new RuntimeException("Nejde uložit data/$name — zkontroluj práva k zápisu na hostingu.");
    }
}

/** One edit at a time: held for the whole request that changes data. */
function lock_data()
{
    if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0775, true);
    $handle = @fopen(DATA_DIR . '/.lock', 'c');
    if ($handle) flock($handle, LOCK_EX);
    return $handle;
}

function load_artworks(): array
{
    return load_json('artworks.json');
}

function save_artworks(array $artworks): void
{
    save_json('artworks.json', array_values($artworks));
}

function load_images(): array
{
    return load_json('images.json');
}

function save_images(array $images): void
{
    save_json('images.json', $images, true);
}

/** Both pieces of data the public pages need, ready to go inside a <script>. */
function site_data_json(): string
{
    $images = load_images();
    return json_encode(
        ['artworks' => load_artworks(), 'images' => $images ?: new stdClass()],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP,
    );
}
