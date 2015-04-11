<?php

// from http://stackoverflow.com/a/7229638
function imagealphamask( &$picture, $mask ) {
    // get sizes and set up new picture
    $xSize = imagesx( $picture );
    $ySize = imagesy( $picture );
    $newPicture = imagecreatetruecolor( $xSize, $ySize );
    imagesavealpha( $newPicture, true );
    imagefill( $newPicture, 0, 0, imagecolorallocatealpha( $newPicture, 0, 0, 0, 127 ) );
    // resize mask if necessary
    if( $xSize != imagesx( $mask ) || $ySize != imagesy( $mask ) ) {
        $tempPic = imagecreatetruecolor( $xSize, $ySize );
        imagecopyresampled( $tempPic, $mask, 0, 0, 0, 0, $xSize, $ySize, imagesx( $mask ), imagesy( $mask ) );
        imagedestroy( $mask );
        $mask = $tempPic;
    }
    // perform pixel-based alpha map application
    for( $x = 0; $x < $xSize; $x++ ) {
        for( $y = 0; $y < $ySize; $y++ ) {
            $alpha = imagecolorsforindex( $mask, imagecolorat( $mask, $x, $y ) );
            $alpha = 127 - floor( $alpha[ 'red' ] / 2 );
            $color = imagecolorsforindex( $picture, imagecolorat( $picture, $x, $y ) );
            imagesetpixel( $newPicture, $x, $y, imagecolorallocatealpha( $newPicture, $color[ 'red' ], $color[ 'green' ], $color[ 'blue' ], $alpha ) );
        }
    }
    // copy back to original picture
    imagedestroy( $picture );
    $picture = $newPicture;
}

function thumb($gdimage) {
    $mask = imagecreatefrompng(dirname(__FILE__) . '/mask.png');
    $GROSS_WIDTH = imagesx($mask);
    $HEIGHT = imagesy($mask);
    $origin_x = imagesx($gdimage);
    $origin_y = imagesy($gdimage);
    $gdthumb = imagecreatetruecolor($GROSS_WIDTH, $HEIGHT);
    $aspect_ratio = $GROSS_WIDTH / $HEIGHT;
    if ($origin_x > $aspect_ratio * $origin_y) {
        $src_w = $origin_y * $aspect_ratio;
        imagecopyresampled($gdthumb, $gdimage, 0, 0, ($origin_x - $src_w) / 2, 0, $GROSS_WIDTH, $HEIGHT, $src_w, $origin_y);
    } else {
        $src_h = $origin_x / $aspect_ratio;
        imagecopyresampled($gdthumb, $gdimage, 0, 0, 0, ($origin_y - $src_h) / 2, $GROSS_WIDTH, $HEIGHT, $origin_x, $src_h);
    }
    imagealphamask($gdthumb, $mask);
    return $gdthumb;
}

?>
