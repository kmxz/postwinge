<?php

define('GROSS_WIDTH', 320);
define('HEIGHT', 160);

function thumb($gdimage) {
  $origin_x = imagesx($gdimage);
  $origin_y = imagesy($gdimage);
  $gdthumb = imagecreatetruecolor(GROSS_WIDTH, HEIGHT);
  $aspect_ratio = GROSS_WIDTH / HEIGHT;
  if ($origin_x > $aspect_ratio * $origin_y) {
    $src_w = $origin_y * $aspect_ratio;
    imagecopyresampled($gdthumb, $gdimage, 0, 0, ($origin_x - $src_w) / 2, 0, GROSS_WIDTH, HEIGHT, $src_w, $origin_y);
  } else {
    $src_h = $origin_x / $aspect_ratio;
    imagecopyresampled($gdthumb, $gdimage, 0, 0, 0, ($origin_y - $src_h) / 2, GROSS_WIDTH, HEIGHT, $origin_x, $src_h);
  }
  return $gdthumb;
}

?>
