# dice-war
Dice War is a local game between two players.<br>
                The game's scope is to conquer terrain. The game ends when there is no more terrain left to be conquered. The player with the most conquered terrain at the end of the game wins.<br>
                <br>
                <b>RULES:</b><br>
                -roll two dice;<br>
                -the player with the highest rolled dice starts;<br>
                -continue rolling dice;<br>
                -make a rectangle with the sides generated;<br>
                -you cannot block unconquered terrain from the other player;<br>
                -the first player's first rectangle is placed in the indicated corner. The second player first rectangle in the opposing corner;<br>
                -the rectangle must be connected to your existing territory;<br>
                -if your dice are equal you can either make a rectangle with those sides generated or a 1 x 1 rectangle;<br>
                -if you cannot make the generated rectangle you skip your turn;<br>
                -when all space is filled the game ends;<br>
                -the one with the most territory wins.<br>
<br>
To set up the website create a database named 'dicewar' then create a table with the following sql command:<br>
CREATE TABLE `players` (<br>
 `id` int(10) unsigned NOT NULL AUTO_INCREMENT,<br>
 `nickname` varchar(30) NOT NULL,<br>
 `password` varchar(40) NOT NULL,<br>
 `email` varchar(100) NOT NULL,<br>
 `experience` int(7) unsigned DEFAULT NULL,<br>
 PRIMARY KEY (`id`),<br>
 UNIQUE KEY `nickname` (`nickname`)<br>
);
