<?php

require_once('thumb.php');

define('UPLOAD_DIR', dirname(__FILE__) . '/../upload/'); // including trailing slash

// store an uploaded image including its thumbnail (160 * 80), and return its filename
function image_upload($field_name) {
  if ($_FILES[$field_name]['size'] < 2048) {
    panic('The file uploaded is too small.');
  }
  if ($_FILES[$field_name]['size'] > 6291456) {
    panic('The file uploaded is too large. Please upload a file smaller than 6 MB.');
  }
  $md5 = md5_file($_FILES[$field_name]['tmp_name']);
  $size = getimagesize($_FILES[$field_name]['tmp_name']);
  if (!$size) {
    panic('The file you uploaded does not seems to be an image.');
  }
  if ($size[0] < 64 || $size[1] < 64) {
    panic('Image resolution is too low. 64 px is the minimum requirement for width/height.');
  };
  $target_filename = $md5 . image_type_to_extension($size[2]);
  $target_filepath = UPLOAD_DIR . $target_filename;
  if (file_exists($target_filepath)) {
    return $target_filename;
  }
  $gdimage = imagecreatefromstring(file_get_contents($_FILES[$field_name]['tmp_name']));
  if (!$gdimage) {
    panic('The image might be corrupted as it cannot be read.');
  }
  imagepng(thumb($gdimage), UPLOAD_DIR . $md5 . '_thumb.png', 9);
  move_uploaded_file($_FILES[$field_name]['tmp_name'], $target_filepath);
  return $target_filename;
}

?>
