function HTMLActuator(_gameManager) {
    this.GMRef = _gameManager;
    this.boardTiles = [];

    this.gameContainer = document.querySelector(".game-container");
    this.boardContainer = document.querySelector(this.GMRef.board.tag);
    this.gameOverContainer = document.querySelector(".game-over");

    //this.aspectRatio = 1;
    this.screenIsSmall = false;

    this.middleCellPadding = 6;
    this.gridTemplateRows = "grid-template-rows: ";
    this.gridTemplateColumns = "grid-template-columns: ";
    this.pin = document.querySelector(".pin");
    // this.diceFaces = ['&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'];
    this.diceFacesClassMap = {
        1:"dice-one",
        2:"dice-two",
        3:"dice-three",
        4:"dice-four",
        5:"dice-five",
        6:"dice-six"
    };

    // different types of tiles
    this.tileBaseClass = "board-tile";
    this.tileStartClass = "start";
    this.tileHoverClass = "hover";
    this.tileCustomClass = "color";
    this.tileFancyClass = "alt-color";
    this.tileIllegalClass = "illegal-move";
    this.tileConClass = "conquered";
    this.tileConScndClass = "conqueredScnd";
    this.tileHelperClass = "help";

    this.sizeBounceClass = "player-infomsg-anim";

    this.setup();
}

HTMLActuator.prototype.setup = function() {
    var self = this;

    // set aspect ratio for future responsive opertions
    //this.aspectRatio = this.GMRef.board.widthTileCount / this.GMRef.board.height;

    // set up the base board
    this.gridTemplateColumns += "repeat(" + this.GMRef.board.widthTileCount + ", 1fr);";
    this.gridTemplateRows += "repeat(" + this.GMRef.board.heightTileCount + ", 1fr);";
    this.gridLayout = this.gridTemplateColumns + this.gridTemplateRows;
    this.boardContainer.setAttribute("style",this.gridLayout);

    // set up media queries
    // phone
    var phoneMediaQuery = window.matchMedia("(max-width: 768px)");
    this.phoneQuery(phoneMediaQuery, self);
    phoneMediaQuery.addListener(function(e) {
        self.phoneQuery(e);
    });
    window.addEventListener('resize', function(){
        if(self.screenIsSmall) {
            self.GMRef.board.tileSize = window.innerWidth / self.GMRef.board.widthTileCount;
            self.updateBoardDimensions();
        }
    });
    // tablet
    var tabletMediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1280px)");
    this.tabletQuery(tabletMediaQuery, self);
    tabletMediaQuery.addListener(function(e) {
        self.tabletQuery(e);
    });
    // pc
    var pcMediaQuery = window.matchMedia("(min-width: 1280px)");
    this.pcQuery(pcMediaQuery, self);
    pcMediaQuery.addListener(function(e) {
        self.pcQuery(e);
    });

    // populate the board with tiles
    for(var i = 0; i < this.GMRef.board.heightTileCount; i++) {
        var boardTilesRow = [];
        for(var j = 0; j < this.GMRef.board.widthTileCount; j++) {
            var boardTile = document.createElement("SPAN");

            boardTile.setAttribute("class",this.tileBaseClass);
            this.boardContainer.appendChild(boardTile);

            boardTilesRow.push(boardTile);
        }
        this.boardTiles.push(boardTilesRow);
    }
};

HTMLActuator.prototype.hideAuthPanel = function() {
    authPanel.style.display = "none";
}

HTMLActuator.prototype.phoneQuery = function(x) {
    if (x.matches) { // if media query matches
        //document.body.style.backgroundColor = "red";
        // set game-container grid
        this.gameContainer.style = "grid-template-columns: 1fr;";
        // update board dimensions
        this.GMRef.board.tileSize = window.innerWidth / this.GMRef.board.widthTileCount;
        this.updateBoardDimensions();
        this.screenIsSmall = true;
    } else {
        this.screenIsSmall = false;
    }
}
HTMLActuator.prototype.tabletQuery = function(x) {
    if (x.matches) { // if media query matches
        //console.log((this.GMRef.board.tileSize * this.GMRef.board.widthTileCount + 4).toString());
        //document.body.style.backgroundColor = "green";
        this.GMRef.board.tileSize = this.GMRef.board.smallerTileSize;
        // set game-container grid
        this.gameContainer.style = "grid-template-columns: 1fr " + (this.GMRef.board.tileSize * this.GMRef.board.widthTileCount + this.middleCellPadding).toString() + "px 1fr;";
        // update board dimensions
        this.updateBoardDimensions();
    }
}
HTMLActuator.prototype.pcQuery = function(x) {
    if (x.matches) { // if media query matches
        //document.body.style.backgroundColor = "blue";
        this.GMRef.board.tileSize = this.GMRef.board.originalTileSize;
        // set game-container grid
        this.gameContainer.style = "grid-template-columns: 1fr " + (this.GMRef.board.tileSize * this.GMRef.board.widthTileCount + this.middleCellPadding).toString() + "px 1fr;";
        // update board dimensions
        this.updateBoardDimensions();
    }
}


HTMLActuator.prototype.updateBoardDimensions = function() {
    var boardSizeStyleAttribute = "width: " + (this.GMRef.board.tileSize * this.GMRef.board.widthTileCount).toString()
                                + "px; height:" + (this.GMRef.board.tileSize * this.GMRef.board.heightTileCount).toString() + "px;"
                                + this.gridLayout;
    this.boardContainer.setAttribute("style",boardSizeStyleAttribute);
    // also, update pin
    if(this.GMRef.movingTile != undefined) this.updatePin(this.GMRef.movingTile);
}

HTMLActuator.prototype.switchTile = function(tile) {
    var row = tile.index.row;
    var column = tile.index.column;
    if(tile.ofPlayer != -1) {
        if(tile.ofPlayer == this.GMRef.firstPlayer.id)
            this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileConClass);
        else
            this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileConScndClass);
    } else if(tile.isSelected) {
        this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileCustomClass);
    } else if(tile.isHover.isActive) {
        if(tile.isHover.isNormal) {
            this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileHoverClass);
        } else {
            this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileIllegalClass);
        }
    } else if(tile.isFancy.isActive){
        if(tile.isFancy.isNormal) {
            this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileFancyClass);
        } else {
            this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileIllegalClass);
        }
    //} else if(tile.seen) {
    //    this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileHelperClass);
    } else if(this.GMRef.gameStarted && this.GMRef.areTilesEqual(tile,this.GMRef.activePlayer.startTile)) {
        this.boardTiles[row][column].setAttribute("class",this.tileBaseClass + " " + this.tileStartClass);
    } else {
        this.boardTiles[row][column].setAttribute("class",this.tileBaseClass);
    }
};

HTMLActuator.prototype.updatePin = function(tile) {
    var halfTileSize = this.GMRef.board.tileSize / 2;
    var pinSize = this.GMRef.board.tileSize / 1.2;
    var y_offset = this.GMRef.board.tileSize / 2.8;
    var tileMiddleCoords = {
        y : tile.index.row * this.GMRef.board.tileSize + halfTileSize - pinSize / 2 - y_offset,
        x : tile.index.column * this.GMRef.board.tileSize + halfTileSize - pinSize / 2
    };
    this.pin.style.height = pinSize.toString() + "px";
    this.pin.style.width = pinSize.toString() + "px";
    this.pin.style.top = tileMiddleCoords.y.toString() + "px";
    this.pin.style.left = tileMiddleCoords.x.toString() + "px";
}

HTMLActuator.prototype.updatePlayerRolledDice = function(playerID) {
    // get player container id
    playerContainerID = playerContainerIDs[playerID];
    // create new dice
    var firstDice = document.createElement("DIV");
    var secondDice = document.createElement("DIV");
    firstDice.setAttribute("class","dice " + this.diceFacesClassMap[this.GMRef.dice[0]]);
    secondDice.setAttribute("class","dice " + this.diceFacesClassMap[this.GMRef.dice[1]]);
    // firstDice.innerHTML = this.diceFaces[this.GMRef.dice[0] - 1];
    // secondDice.innerHTML = this.diceFaces[this.GMRef.dice[1] - 1];

    // trash old dice
    var oldFirstDice = document.getElementById(playerContainerID).firstChild.children[1].children[0];
    var oldSecondDice = document.getElementById(playerContainerID).firstChild.children[1].children[1];
    if(oldFirstDice != undefined)   oldFirstDice.remove();
    if(oldSecondDice != undefined)  oldSecondDice.remove();

    // append new dice
    document.getElementById(playerContainerID).firstChild.children[1].appendChild(firstDice);
    document.getElementById(playerContainerID).firstChild.children[1].appendChild(secondDice);
}

HTMLActuator.prototype.setPlayerMoveInfo = function(playerID) {
    var firstPlayerInfoContainer = document.getElementById(playerContainerIDs[this.GMRef.firstPlayer.id]).firstChild.children[2];
    var secondPlayerInfoContainer = document.getElementById(playerContainerIDs[this.GMRef.secondPlayer.id]).firstChild.children[2];
    var activePlayerInfoContainer;
    var inactivePlayerInfoContainer;

    firstPlayerInfoContainer.innerHTML = "Press A to ROLL dice<br>Press S to SKIP turn";
    secondPlayerInfoContainer.innerHTML = "Press K to ROLL dice<br>Press L to SKIP turn";

    //console.log(playerID, this.GMRef.firstPlayer.id);
    if(playerID == this.GMRef.firstPlayer.id) {
        activePlayerInfoContainer = document.getElementById(playerContainerIDs[this.GMRef.firstPlayer.id]).firstChild.children[2];
        inactivePlayerInfoContainer = document.getElementById(playerContainerIDs[this.GMRef.secondPlayer.id]).firstChild.children[2];
    } else {
        activePlayerInfoContainer = document.getElementById(playerContainerIDs[this.GMRef.secondPlayer.id]).firstChild.children[2];
        inactivePlayerInfoContainer = document.getElementById(playerContainerIDs[this.GMRef.firstPlayer.id]).firstChild.children[2];
    }

    if(playerID != -1) {
        activePlayerInfoContainer.setAttribute("class",this.sizeBounceClass);
        inactivePlayerInfoContainer.setAttribute("class","");
    } else {
        activePlayerInfoContainer.setAttribute("class","");
        inactivePlayerInfoContainer.setAttribute("class","");
    }

}

HTMLActuator.prototype.setGameOver = function(playerID) {
    this.gameOverContainer.style = "display: flex;align-items: center;justify-content: center;flex-direction: column;";
    if(playerID != -1) {
        this.gameOverContainer.children[0].textContent = connectedUsers[playerID].nickname + " won!";
    } else {
        this.gameOverContainer.children[0].textContent = "It's a draw!";
    }
}