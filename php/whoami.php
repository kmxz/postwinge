<?php

require_once('main.php');
require_once('auth.php');

success(array('user_id' => $user_id, 'display' => get_display($user_id)));

?>
