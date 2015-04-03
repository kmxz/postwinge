<?php

date_default_timezone_set('Asia/Hong_Kong');

$mysqli = new mysqli('localhost', 'grad', 'grad', 'grad');
$mysqli->set_charset('utf8');
$mysqli->query('SET time_zone = \'Asia/Hong_Kong\'');

header('Content-Type: application/json');

function panic($reason) {
  die(json_encode(array('error' => TRUE, 'data' => $reason)));
}

function success($data) {
  die(json_encode(array('error' => FALSE, 'data' => $data)));
}

?>