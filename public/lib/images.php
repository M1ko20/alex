<?php
/**
 * The image pipeline for photos uploaded in the admin — the PHP twin of
 * scripts/process-images.mjs. For each photo it writes responsive WebP files
 * to img/ and returns a manifest entry with the size, a tiny blurred
 * placeholder and two colours sampled from the image:
 *   - wall   : the average colour — used to tint the "room" around a work
 *   - accent : the most saturated recurring colour
 */
declare(strict_types=1);

require_once __DIR__ . '/store.php';

const IMAGE_WIDTHS = [640, 1200, 2000, 2800];

function images_supported(): bool
{
    return function_exists('imagecreatefromstring') && function_exists('imagewebp');
}

/**
 * @return array{0: string, 1: array} the manifest key and its entry
 */
function process_image(string $upload, string $folder): array
{
    if (!images_supported()) {
        throw new RuntimeException('Server neumí zpracovat obrázky (chybí PHP rozšíření GD s podporou WebP).');
    }
    @ini_set('memory_limit', '512M');
    @set_time_limit(120);

    $info = @getimagesize($upload);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
        throw new RuntimeException('Tohle není obrázek ve formátu JPG, PNG nebo WebP.');
    }
    $src = @imagecreatefromstring((string) file_get_contents($upload));
    if (!$src) throw new RuntimeException('Obrázek se nepodařilo načíst.');
    if ($info[2] === IMAGETYPE_JPEG) $src = apply_exif_orientation($src, $upload);
    if (!imageistruecolor($src)) imagepalettetotruecolor($src);

    $width = imagesx($src);
    $height = imagesy($src);
    $widths = array_filter(IMAGE_WIDTHS, fn($w) => $w < $width);
    if ($width <= IMAGE_WIDTHS[count(IMAGE_WIDTHS) - 1]) $widths[] = $width;
    $widths = array_values(array_unique($widths));
    sort($widths);

    $folder = preg_replace('/[^a-z0-9-]/', '', $folder) ?: 'work';
    $base = date('ymd-His') . '-' . bin2hex(random_bytes(3));
    if (!is_dir(IMG_DIR . "/$folder") && !mkdir(IMG_DIR . "/$folder", 0775, true)) {
        throw new RuntimeException('Nejde vytvořit složku pro obrázky — zkontroluj práva k zápisu do img/.');
    }

    $srcset = [];
    foreach ($widths as $w) {
        $out = "$folder/$base-$w.webp";
        $resized = resize_to_width($src, $w);
        $ok = imagewebp($resized, IMG_DIR . "/$out", $w > 1500 ? 78 : 82);
        unset($resized);
        if (!$ok) throw new RuntimeException('Nepodařilo se uložit zmenšený obrázek.');
        $srcset[] = ['w' => $w, 'src' => "/img/$out"];
    }

    $tiny = resize_to_width($src, 20);
    imagefilter($tiny, IMG_FILTER_GAUSSIAN_BLUR);
    ob_start();
    imagewebp($tiny, null, 40);
    $placeholder = 'data:image/webp;base64,' . base64_encode((string) ob_get_clean());

    $entry = ['width' => $width, 'height' => $height, 'srcset' => $srcset, 'placeholder' => $placeholder] + image_colours($src);
    return ["$folder/$base", $entry];
}

/** Removes the files of one manifest entry from img/. */
function delete_image_files(array $entry): void
{
    $root = realpath(IMG_DIR);
    $dirs = [];
    foreach ($entry['srcset'] ?? [] as $s) {
        $file = realpath(SITE_ROOT . $s['src']);
        if ($root && $file && str_starts_with($file, $root . DIRECTORY_SEPARATOR)) {
            @unlink($file);
            $dirs[dirname($file)] = true;
        }
    }
    foreach (array_keys($dirs) as $dir) {
        if ($dir !== $root && count(scandir($dir)) === 2) @rmdir($dir);
    }
}

function resize_to_width(GdImage $src, int $w): GdImage
{
    $sw = imagesx($src);
    $sh = imagesy($src);
    if ($w === $sw) return $src;
    $h = max(1, (int) round($sh * $w / $sw));
    $dst = imagecreatetruecolor($w, $h);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $w, $h, $sw, $sh);
    return $dst;
}

/** Phones store photos sideways and say so in EXIF; turn the pixels upright. */
function apply_exif_orientation(GdImage $img, string $file): GdImage
{
    $exif = function_exists('exif_read_data') ? @exif_read_data($file) : false;
    $o = (int) ($exif['Orientation'] ?? 1);
    if (in_array($o, [2, 4, 5, 7], true)) imageflip($img, $o === 4 ? IMG_FLIP_VERTICAL : IMG_FLIP_HORIZONTAL);
    $angle = match ($o) {
        3, 4 => 180,
        5, 6 => -90,
        7, 8 => 90,
        default => 0,
    };
    return $angle ? imagerotate($img, $angle, 0) : $img;
}

function image_colours(GdImage $src): array
{
    // Cover-crop to 48×48, as the Node pipeline does.
    $w = imagesx($src);
    $h = imagesy($src);
    $side = min($w, $h);
    $small = imagecreatetruecolor(48, 48);
    imagecopyresampled($small, $src, 0, 0, intdiv($w - $side, 2), intdiv($h - $side, 2), 48, 48, $side, $side);

    $sum = [0, 0, 0];
    $buckets = [];
    for ($y = 0; $y < 48; $y++) {
        for ($x = 0; $x < 48; $x++) {
            $c = imagecolorat($small, $x, $y);
            $r = ($c >> 16) & 0xff;
            $g = ($c >> 8) & 0xff;
            $b = $c & 0xff;
            $sum[0] += $r;
            $sum[1] += $g;
            $sum[2] += $b;
            [$hue, $s, $v] = rgb_to_hsv($r, $g, $b);
            if ($s < 0.28 || $v < 0.22) continue;
            $key = (int) floor($hue / 20);
            $weight = $s * $s * $v;
            $buckets[$key] ??= ['w' => 0, 'r' => 0, 'g' => 0, 'b' => 0];
            $buckets[$key]['w'] += $weight;
            $buckets[$key]['r'] += $r * $weight;
            $buckets[$key]['g'] += $g * $weight;
            $buckets[$key]['b'] += $b * $weight;
        }
    }

    $n = 48 * 48;
    $wall = hex_colour($sum[0] / $n, $sum[1] / $n, $sum[2] / $n);
    usort($buckets, fn($a, $b) => $b['w'] <=> $a['w']);
    $best = $buckets[0] ?? null;
    $accent = $best ? hex_colour($best['r'] / $best['w'], $best['g'] / $best['w'], $best['b'] / $best['w']) : $wall;
    return ['wall' => $wall, 'accent' => $accent];
}

function rgb_to_hsv(int $r, int $g, int $b): array
{
    $r /= 255;
    $g /= 255;
    $b /= 255;
    $max = max($r, $g, $b);
    $d = $max - min($r, $g, $b);
    $h = 0.0;
    if ($d) {
        if ($max === $r) $h = fmod(($g - $b) / $d, 6);
        elseif ($max === $g) $h = ($b - $r) / $d + 2;
        else $h = ($r - $g) / $d + 4;
        $h *= 60;
        if ($h < 0) $h += 360;
    }
    return [$h, $max ? $d / $max : 0, $max];
}

function hex_colour(float $r, float $g, float $b): string
{
    return sprintf('#%02x%02x%02x', (int) round($r), (int) round($g), (int) round($b));
}
