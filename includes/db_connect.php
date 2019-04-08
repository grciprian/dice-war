<?php
    $servername = "databases.000webhost.com";
    $username = "id8112007_root";
    $password = "db4test";
    $dbname = "id8112007_dicewar";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 
?>
