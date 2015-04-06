<?php

date_default_timezone_set('Asia/Hong_Kong');

$mysqli = new mysqli('localhost', 'grad', 'grad', 'grad');
$mysqli->set_charset('utf8');
$mysqli->query('SET time_zone = \'Asia/Hong_Kong\'');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

function panic($reason) {
  die(json_encode(array('success' => FALSE, 'data' => $reason)));
}

function success($data) {
  die(json_encode(array('success' => TRUE, 'data' => $data)));
}

?>
