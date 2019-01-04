<?php
    // if script was invoked by the form then
    if ( $_SERVER['REQUEST_METHOD'] == 'POST' && realpath(__FILE__) == realpath( $_SERVER['SCRIPT_FILENAME'] ) ) {
        include_once('includes/db_connect.php');

        $parse_args = json_decode(file_get_contents('php://input'), true);

        $player = $parse_args["player"];
        $nickname = $parse_args["name"];
        $password = $parse_args["pass"];

        // hash the password
        $hashedPass = hash('sha1', $password);

        $sql = "SELECT id, nickname, email, experience FROM players WHERE lower(nickname) = lower('$nickname') AND password = '$hashedPass'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $arr = array('player' => $player, 'id' => $row["id"], 'nickname' => $row["nickname"], 'email' => $row["email"], 'experience' => $row["experience"]);
                echo json_encode($arr);
                break;
            }
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