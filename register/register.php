<?php
    // if script was invoked by the form then
    if ( $_SERVER['REQUEST_METHOD'] == 'POST' && realpath(__FILE__) == realpath( $_SERVER['SCRIPT_FILENAME'] ) ) {
        include_once('../includes/db_connect.php');

        $parse_args = json_decode(file_get_contents('php://input'), true);

        $nickname = $parse_args['name'];
        $password = $parse_args['pass'];
        $email = $parse_args['mail'];

        // hash the password
        $hashedPass = hash('sha1', $password);

        $sql = "INSERT INTO players(nickname,password,email) VALUES('$nickname','$hashedPass',lower('$email'))";
        $result = $conn->query($sql);
        if($result)
            echo "All good! Hi there, player! You can now log in.";
        else echo "You gotta be kiddin' me... Something went wrong.";
        
        $conn->close();
    } else {
        //header( 'HTTP/1.0 404 Forbidden', TRUE, 404 );
        die( header( 'location: ../error.html' ) );
        //die();
    }
?>