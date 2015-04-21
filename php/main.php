<?php

date_default_timezone_set('Asia/Hong_Kong');

header('Content-Type: application/json');

function mysqli($close = FALSE) {
  static $mysqli = NULL;
  if ($close) {
    if ($mysqli) {
      $mysqli->close();
    }
  } else if (!$mysqli) {
    $mysqli = new mysqli('localhost', 'grad', 'grad', 'grad');
    $mysqli->set_charset('utf8');
    $mysqli->query('SET time_zone = \'Asia/Hong_Kong\'');
  }
  return $mysqli;
}

function redis($close = FALSE) {
  static $redis = NULL;
  if ($close) {
    if ($redis) {
      $redis->close();
    }
  } else if (!$redis) {
    $redis = new Redis();
    $redis->connect('127.0.0.1');
  }
  return $redis;
}

function panic($reason, $action = NULL) {
  mysqli(true); redis(true);
  $data = array('success' => FALSE, 'message' => $reason);
  if ($action) {
    $data['action'] = $action;
  }
  die(json_encode($data));
}

function success($data) {
  mysqli(true); redis(true);
  die(json_encode(array('success' => TRUE, 'data' => $data)));
}

function legal_post_id($post_id, $user_id) {
  $id = intval($post_id);
  $stmt = mysqli()->prepare('SELECT `post_id` FROM `post_free` WHERE `post_id` = ? AND `user_id` = ?');
  $stmt->bind_param('ii', $id, $user_id);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  if (!$stmt->get_result()->fetch_row()) {
    panic('The post you try to update to does not exist, or does not belong to you!');
  }
  return $id;
}

function get_display($user_id) {
  if (!$user_id) {
    return NULL;
  }
  $stmt = mysqli()->prepare('SELECT `display` FROM `user` WHERE `user_id` = ?');
  $stmt->bind_param('i', $user_id);
  if (!$stmt->execute()) { panic('SQL Error!'); }
  $result = $stmt->get_result()->fetch_row();
  if (!$result) { panic('The account has been deleted.'); }
  return $result[0];
}

function success_with_redis_publish($type, $data, $user_id, $channel) {
  redis()->publish($channel, json_encode(array(
    'type' => $type,
    'time' => time(),
    'data' => $data,
    'user_id' => $user_id,
    'display' => get_display($user_id)
  )));
  success($data);
}

?>
