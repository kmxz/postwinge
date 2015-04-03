SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;


CREATE TABLE IF NOT EXISTS `post_free` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `reply_to` mediumint(8) unsigned NOT NULL,
  `image` tinytext CHARACTER SET ascii,
  `x_coord` smallint(6) NOT NULL,
  `y_coord` smallint(6) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coord` (`x_coord`,`y_coord`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `post_free_revision` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` mediumint(8) unsigned NOT NULL,
  `datetime` datetime NOT NULL,
  `text_content` text CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `session` (
  `key` char(32) CHARACTER SET ascii NOT NULL,
  `user_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `user` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `token` varchar(31) CHARACTER SET ascii NOT NULL,
  `display` tinytext CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
