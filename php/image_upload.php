<?php

define('UPLOAD_DIR', '/opt/upload/'); // including trailing slash

// store an uploaded image including its thumbnail (160 * 80), and return its filename
function image_upload($field_name) {
  if ($_FILES[$field_name]['size'] < 2048) {
    panic('The file uploaded is too small.');
  }
  if ($_FILES[$field_name]['size'] > 6291456) {
    panic('The file uploaded is too large. Please upload a file smaller than 6 MB.');
  }
  $md5 = md5_file($_FILES['userfile']['tmp_name']);
  $size = getimagesize($_FILES['userfile']['tmp_name']);
  if (!$size) {
    panic('The file you uploaded does not seems to be an image.');
  }
  if ($size[0] < 64 || $size[1] < 64) {
    panic('Image resolution is too low. 64 px is the minimum requirement for width/height.');
  };
  $target_filename = UPLOAD_DIR . $md5 . image_type_to_extension($size[2]);
  if (file_exists($target_filename) {
    return $target_filename;
  }
  $gdimage = imagecreatefromstring(file_get_contents($_FILES[$field_name]['tmp_name']));
  if (!$gdimage) {
    panic('The image might be corrupted as it cannot be read.');
  }
  $gdthumb = imagecreatetruecolor(160, 80);
  if ($size[0] > 2 * $size[1]) {
    $src_w = $size[1] * 2;
    imagecopyresampled($gdthumb, $gdimage, 0, 0, ($size[0] - $src_w) / 2, 0, 160, 80, $src_w, $size[1]);
  } else {
    $src_h = $size[0] / 2;
    imagecopyresampled($gdthumb, $gdimage, 0, 0, 0, ($size[1] - $src_h) / 2, 160, 80, $size[0], $src_h);
  }
  imagejpeg($gdthumb, UPLOAD_DIR . $md5 . '_thumb.jpg');
  move_uploaded_file($_FILES[$field_name]['tmp_name'], $target_filename);
  return $target_filename;
}

?>