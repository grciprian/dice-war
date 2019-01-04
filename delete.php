<?php
    // if script was invoked by the form then
    if ( $_SERVER['REQUEST_METHOD'] == 'GET' && realpath(__FILE__) == realpath( $_SERVER['SCRIPT_FILENAME'] ) ) {
        include_once('includes/db_connect.php');

        $id = $_GET['id'];

        $sql = "DELETE FROM players WHERE id = $id";
        $result = $conn->query($sql);
        if ($result === TRUE) {
            echo "true";
        } else {
            echo "false";
        }
        
        $conn->close();
    } else {
        //header( 'HTTP/1.0 404 Forbidden', TRUE, 404 );
        die( header( 'location: ./error.html' ) );
        //die();
    }
?>