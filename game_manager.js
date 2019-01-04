function GameManager() {
    // players
    this.firstPlayer;
    this.secondPlayer;
    // config
    this.board = {
        tag : ".board-container",
        heightTileCount : 7, // 10
        widthTileCount : 11, // 14
        originalTileSize : 60, //50
        smallerTileSize : 50 //42
    };
    this.board.tileSize = this.board.originalTileSize;
    // runtime
    this.spacePressed = false;
    this.gameStarted = false;
    this.gameEnded = false;
    this.boardTiles = [];
    this.activePlayer;
    this.currentSelectedTile;
    this.old = {
        movingTile : undefined,
        theMostAdvancedTile : undefined
    };
    this.isAreaInLegalState = false;
    this.dice = [];
    this.enteredAreasCountID = -1; this.exitedAreaIDs = [];
    this.didMove = false;
    this.movingTile;

    // first execute logical setup then the visual one
    this.setup();
    
    // set up logic parts
    this.inputManager = new InputManager(this.board);
    this.actuator = new HTMLActuator(this);

    // set up events
    this.inputManager.on("login", login.bind(this));
    this.inputManager.on("start", this.spaceStart.bind(this));
    this.inputManager.on("rollDice", this.rollDice.bind(this));
    this.inputManager.on("mouseStart", this.selectTile.bind(this));
    this.inputManager.on("mouseMove", this.fancyArea.bind(this));
}

GameManager.prototype.setup = function() {
    // change focus to login form first field
    nicknameContainer.focus(); nicknameContainer.select();
    // populate the logical board
    for(var i = 0; i < this.board.heightTileCount; i++) {
        var boardTilesRow = [];
        for(var j = 0; j < this.board.widthTileCount; j++) {
            var boardTile = {
                index : {
                    row : i,
                    column : j
                },
                ofPlayer : -1,
                isFancy : {
                    isActive : false,
                    isNormal : true
                },
                isHover : {
                    isActive : false,
                    isNormal : true
                },
                isSelected : false,
                seen : false
            };
            boardTilesRow.push(boardTile);
        }
        this.boardTiles.push(boardTilesRow);
    }
    // set those 2 players
    this.firstPlayer = new Player(playerIDs[0],this.boardTiles[0][0],[0,1]);
    this.secondPlayer = new Player(playerIDs[1],this.boardTiles[this.board.heightTileCount - 1][this.board.widthTileCount - 1],[2,3]);
    this.activePlayer = this.firstPlayer;
}

GameManager.prototype.spaceStart = function() {
    if(!this.spacePressed && connectedUsers.length == 2) {
        this.spacePressed = true;
        this.actuator.hideAuthPanel();
        this.actuator.setPlayerMoveInfo(this.activePlayer.id);
    }
}


// utility function for traversing a specific area of tiles
GameManager.prototype.traverseArea = function(startTile,endTile,callback){
    startTileIndex = startTile.index;
    endTileIndex = endTile.index;
    // right side
    if(startTileIndex.column <= endTileIndex.column) {
        // 1st quadrant
        if(startTileIndex.row >= endTileIndex.row) {
            for(let i = endTileIndex.row; i <= startTileIndex.row; i++) {
                for(let j = startTileIndex.column; j <= endTileIndex.column; j++) {
                    if(callback(i,j) == false)  return;
                }
            }
        } else {
        // 4th quadrant
            for(let i = startTileIndex.row; i <= endTileIndex.row; i++) {
                for(let j = startTileIndex.column; j <= endTileIndex.column; j++) {
                    if(callback(i,j) == false)  return;
                }
            }
        }
    } else {
        // left side
        // 2nd quadrant
        if(startTileIndex.row >= endTileIndex.row) {
            for(let i = endTileIndex.row; i <= startTileIndex.row; i++) {
                for(let j = endTileIndex.column; j <= startTileIndex.column; j++) {
                    if(callback(i,j) == false)  return;
                }
            }
        } else {
        // 3rd quadrant
            for(let i = startTileIndex.row; i <= endTileIndex.row; i++) {
                for(let j = endTileIndex.column; j <= startTileIndex.column; j++) {
                    if(callback(i,j) == false)  return;
                }
            }
        }
    }
}

// checks equality of 2 tiles' positions
GameManager.prototype.areTilesEqual = function(firstTile, secondTile) {
    if(firstTile.index.row == secondTile.index.row && firstTile.index.column == secondTile.index.column)
        return true;
    return false;
}

// checks if choosen tile is near conquered terrain
GameManager.prototype.isTileNearConquered = function(tile) {
    // clockwise
    var map = {
        1 : {
            row : tile.index.row - 1,
            column : tile.index.column
        },
        2 : {
            row : tile.index.row,
            column : tile.index.column + 1
        },
        3 : {
            row : tile.index.row + 1,
            column : tile.index.column
        },
        4 : {
            row : tile.index.row,
            column : tile.index.column - 1
        }
    };
    // 1 - top, 2 - right, 3 - bottom, 4 - left
    var sidesToVerify = [];

    if(tile.index.row == 0 && tile.index.column == 0) { // left top corner
        sidesToVerify.push(2); sidesToVerify.push(3);
    } else if(tile.index.row == 0 && tile.index.column == this.boardTiles[0].length - 1){ // right top corner
        sidesToVerify.push(3); sidesToVerify.push(4);
    } else if(tile.index.row == this.boardTiles.length - 1 && tile.index.column == this.boardTiles[0].length - 1) { // right bottom corner
        sidesToVerify.push(1); sidesToVerify.push(4);
    } else if(tile.index.row == this.boardTiles.length - 1 && tile.index.column == 0) { // left bottom corner
        sidesToVerify.push(1); sidesToVerify.push(2);
    } else if(tile.index.row == 0) { // first row without corners
        sidesToVerify.push(2); sidesToVerify.push(3); sidesToVerify.push(4);
    } else if(tile.index.column == this.boardTiles[0].length - 1) { // last column without corners
        sidesToVerify.push(1); sidesToVerify.push(3); sidesToVerify.push(4);
    } else if(tile.index.row == this.boardTiles.length - 1) { // last row without corners
        sidesToVerify.push(1); sidesToVerify.push(2); sidesToVerify.push(4);
    } else if(tile.index.column == 0) { // first column without corners
        sidesToVerify.push(1); sidesToVerify.push(2); sidesToVerify.push(3);
    } else { // everything else
        sidesToVerify.push(1); sidesToVerify.push(2); sidesToVerify.push(3); sidesToVerify.push(4);
    }
    // now verify properly
    for(var i = 0; i < sidesToVerify.length; i++) {
        var tile = this.boardTiles[map[sidesToVerify[i]].row][map[sidesToVerify[i]].column];
        if(tile.ofPlayer == this.activePlayer.id)
            return true;
    }
    return false;
}

// find cavity recursive
GameManager.prototype.detectCavity = function(tile,limits) {
    if(tile != undefined && tile.ofPlayer != this.activePlayer.id && tile.isFancy.isActive == false && tile.isHover.isActive == false) {
        if(tile.seen == false) {
            if (tile.index.row >= limits.rowMin && tile.index.row <= limits.rowMax && tile.index.column >= limits.columnMin && tile.index.column <= limits.columnMax) { // everything else inside the active area
                tile.seen = true;
                if(this.boardTiles[tile.index.row - 1] != undefined)
                    this.detectCavity(this.boardTiles[tile.index.row - 1][tile.index.column],limits); // top tile
                if(this.boardTiles[tile.index.row] != undefined)
                    this.detectCavity(this.boardTiles[tile.index.row][tile.index.column + 1],limits); // right tile
                if(this.boardTiles[tile.index.row + 1] != undefined)
                    this.detectCavity(this.boardTiles[tile.index.row + 1][tile.index.column],limits); // bottom tile
                if(this.boardTiles[tile.index.row] != undefined)
                    this.detectCavity(this.boardTiles[tile.index.row][tile.index.column - 1],limits); // left tile
            } else { // it succeded to exit player's active area
                let i;
                for(i = 0; i < this.exitedAreaIDs.length; i++) {
                    if(this.exitedAreaIDs[i] == this.enteredAreasCountID)
                        break;
                }
                if(i == this.exitedAreaIDs.length)
                    this.exitedAreaIDs.push(this.enteredAreasCountID);
            }
        }
    }
}

// set the 'global' variable this.isAreaInLegalState according to the RULES
GameManager.prototype.findAreaLegalState = function(startTile,endTile) {
    var self = this;
    this.isAreaInLegalState = true;

    // PRE CHECK if current player rolled the dice
    if(this.isAreaInLegalState) {
        if(!this.activePlayer.rolledDice.status) {
            this.isAreaInLegalState = false;
        }
    }
    
    // FIRST check if the selected area has the width/height equal to the dice's values
    // If the dice are equal than it's a special move that let the player choose to conquer
    // those values or only one tile
    if(this.currentSelectedTile != undefined) {
        if(this.isAreaInLegalState) {
            var width = Math.abs(startTile.index.column - endTile.index.column) + 1;
            var height = Math.abs(startTile.index.row - endTile.index.row) + 1;
            if(this.dice[0] == this.dice[1]) {
                if( !((width == this.dice[0] && height == this.dice[1])
                    || (width == this.dice[1] && height == this.dice[0])
                    || (width == 1 && height == 1)) )
                    this.isAreaInLegalState = false;
            } else if( !((width == this.dice[0] && height == this.dice[1])
                    || (width == this.dice[1] && height == this.dice[0])) )
                    this.isAreaInLegalState = false;
        }
    }
    
    // SECOND check if the selected area overlaps with already conquered terrain
    if(this.isAreaInLegalState) {
        this.traverseArea(startTile,endTile,function(i,j) {
            var tile = self.boardTiles[i][j];
            if(tile.ofPlayer == -1) return true;
            self.isAreaInLegalState = false;
            return false;
        });
    }
    
    // THIRD check if the selected area makes any cavities in player's conquered terrain
    // it must be checked for either area or single hovered tile
    if(this.isAreaInLegalState) {
        if(this.old.theMostAdvancedTile != undefined) {
            if(this.old.startTile != undefined) {
                this.traverseArea(this.old.startTile,this.old.theMostAdvancedTile,function(i,j) {
                    self.boardTiles[i][j].seen = false;
                });
                this.old.startTile = undefined;
            } else {
                this.traverseArea(this.activePlayer.startTile,this.old.theMostAdvancedTile,function(i,j) {
                    self.boardTiles[i][j].seen = false;
                });
            }
            //this.actuator.switchTile(this.boardTiles[i][j]);
        }

        var theMostAdvancedTile = this.activePlayer.findThePossiblyMostAdvancedTile(endTile,this.boardTiles,false);
        var limits = {};
        if(this.activePlayer.startTile.index.row <= theMostAdvancedTile.index.row) {
            limits.rowMin = this.activePlayer.startTile.index.row;
            limits.rowMax = theMostAdvancedTile.index.row;
        } else {
            limits.rowMin = theMostAdvancedTile.index.row;
            limits.rowMax = this.activePlayer.startTile.index.row;
        }
        if(this.activePlayer.startTile.index.column <= theMostAdvancedTile.index.column) {
            limits.columnMin = this.activePlayer.startTile.index.column;
            limits.columnMax = theMostAdvancedTile.index.column;
        } else {
            limits.columnMin = theMostAdvancedTile.index.column;
            limits.columnMax = this.activePlayer.startTile.index.column;
        }
        this.enteredAreasCountID = -1; this.exitedAreaIDs = [];
        this.traverseArea(this.activePlayer.startTile,theMostAdvancedTile,function(i,j) {
            if(self.boardTiles[i][j].seen == false) {
                if(self.boardTiles[i][j] != undefined && self.boardTiles[i][j].ofPlayer != self.activePlayer.id && self.boardTiles[i][j].isFancy.isActive == false
                    && self.boardTiles[i][j].isHover.isActive == false) {
                    self.enteredAreasCountID++;
                    self.detectCavity(self.boardTiles[i][j],limits);
                }
            }
            //this.actuator.switchTile(this.boardTiles[i][j]);
        });
        
        this.old.theMostAdvancedTile = theMostAdvancedTile;
        this.old.startTile = this.activePlayer.startTile;
        // if there are less "exiting" areas than "entered" then one or more are stuked
        // creating an undesireable cavity in the player's terrain
        if(this.exitedAreaIDs.length < this.enteredAreasCountID + 1)
            this.isAreaInLegalState = false;
    }
}

GameManager.prototype.gameOver = function() {
    this.gameEnded = true;
    if(this.firstPlayer.totalConqueredTiles > this.secondPlayer.totalConqueredTiles) {
        this.actuator.setGameOver(this.firstPlayer.id);
    } else if(this.firstPlayer.totalConqueredTiles < this.secondPlayer.totalConqueredTiles) {
        this.actuator.setGameOver(this.secondPlayer.id);
    } else {
        this.actuator.setGameOver(-1);
    }
    // change info message focus
    this.actuator.setPlayerMoveInfo(-1);
}

// function called when active player changes
// ex. when rolled the dice/skip turn or player conquer terrain
GameManager.prototype.playerChanged = function() {
    // actuate players' start tile if the game started
    this.actuator.switchTile(this.firstPlayer.getStartTile());
    this.actuator.switchTile(this.secondPlayer.getStartTile());
    // change info message focus
    this.actuator.setPlayerMoveInfo(this.activePlayer.id);
}


// generate random dice
GameManager.prototype.rollDice = function(key) {
    //console.log(key);
    // ROCKET SCIENCE!
    if(this.spacePressed && !this.gameEnded) {
        // rolling the dice is legal only if there are 2 players connected
        // and the current player hasn't rolled it yet
        if(connectedUsers.length == 2 && !this.activePlayer.rolledDice.status) {
            if(this.activePlayer.keys[0] == key) {
                // reset dice
                this.dice = [];
                // first dice
                this.dice.push(Math.floor((Math.random() * 6) + 1));
                // second dice
                this.dice.push(Math.floor((Math.random() * 6) + 1));
                
                if(this.gameStarted) {
                    // update player's rolled dice
                    this.activePlayer.rolledDice.value = this.dice;
                    this.activePlayer.rolledDice.status = true;
                    // reset rolled dice status of the old player
                    if(this.activePlayer.id == this.firstPlayer.id) {
                        this.secondPlayer.rolledDice.status = false;
                    } else {
                        this.firstPlayer.rolledDice.status = false;
                    }
                    // actuate
                    this.actuator.updatePlayerRolledDice(this.activePlayer.id);
                } else {
                    // see which player starts the game
                    // after both of them rolled the dice
                    // ps: the player with the highest dice sum starts
                    if(this.firstPlayer.rolledDice.value == undefined) {
                        this.activePlayer = this.firstPlayer;
                    } else if(this.secondPlayer.rolledDice.value == undefined) {
                        this.activePlayer = this.secondPlayer;
                    }
                    // actuate
                    this.actuator.updatePlayerRolledDice(this.activePlayer.id);
                    this.activePlayer.rolledDice.value = this.dice;
                    if(this.firstPlayer.rolledDice.value != undefined && this.secondPlayer.rolledDice.value != undefined) {
                        this.gameStarted = true;
                        var firstPlayerDiceSum = this.firstPlayer.rolledDice.value[0] + this.firstPlayer.rolledDice.value[1];
                        var secondPlayerDiceSum = this.secondPlayer.rolledDice.value[0] + this.secondPlayer.rolledDice.value[1];
                        if(firstPlayerDiceSum > secondPlayerDiceSum) {
                            this.activePlayer = this.firstPlayer;
                        } else if(firstPlayerDiceSum < secondPlayerDiceSum) {
                            this.activePlayer = this.secondPlayer;
                        } else {
                            this.gameStarted = false;
                            this.firstPlayer.rolledDice.value = undefined;
                            this.secondPlayer.rolledDice.value = undefined;
                        }
                    }
                    // change active player
                    if(!this.gameStarted) {
                        if(this.activePlayer.id == this.firstPlayer.id) {
                            this.activePlayer = this.secondPlayer;
                        } else {
                            this.activePlayer = this.firstPlayer;
                        }
                    }
                }
            } else return;
        } else {
            if(this.activePlayer.keys[1] == key) {
                // skip turn
                this.activePlayer.rolledDice.status = false;
                if(this.activePlayer.id == this.firstPlayer.id) {
                    this.activePlayer = this.secondPlayer;
                } else {
                    this.activePlayer = this.firstPlayer;
                }
            } else return;
        }
        // find actual hovered tile legal state
        if(this.movingTile != undefined) {
            this.fancyArea(this.movingTile.index);
        }
        // do things when active player changed
        this.playerChanged();
    }
}

// this is executed in the event of a click
GameManager.prototype.selectTile = function(clickedTileIndex) {
    var self = this;
    var clickedTile = this.boardTiles[clickedTileIndex.row][clickedTileIndex.column];

    // click is only possible on unconquered tiles and in legal state at any time
    if(clickedTile.ofPlayer == -1 && this.isAreaInLegalState) {
        if(this.currentSelectedTile == undefined) {
            // player action started(first click)
            clickedTile.isHover.isActive = false;
            clickedTile.isHover.isNormal = true;
            clickedTile.isSelected = true;
            this.currentSelectedTile = clickedTile;
            this.actuator.switchTile(clickedTile);
        } else {
            // if player selected a tile and it didn't change to another tile so that the
            // legal state of the are to be checked than "force check" it
            if(!this.didMove) this.findAreaLegalState(this.currentSelectedTile,clickedTile);
            // conquer area
            if(this.isAreaInLegalState) {
                this.traverseArea(this.currentSelectedTile,clickedTile,function(i,j) {
                    var tile = self.boardTiles[i][j];
                    tile.ofPlayer = self.activePlayer.id;
                    tile.isSelected = false;
                    tile.isFancy.isActive = false;
                    tile.isFancy.isNormal = true;
                    tile.isHover.isActive = false;
                    tile.isHover.isNormal = true;
                    self.actuator.switchTile(tile);
                    // increase total conquered tiles of current player
                    self.activePlayer.totalConqueredTiles += 1;
                    return true;
                });
                // set the player's most advanced tile
                this.activePlayer.findThePossiblyMostAdvancedTile(clickedTile,this.boardTiles,true);
                // revert to no action started
                this.currentSelectedTile = undefined;
                // change active player
                if(this.activePlayer.id == this.firstPlayer.id) {
                    this.activePlayer = this.secondPlayer;
                } else {
                    this.activePlayer = this.firstPlayer;
                }
                // do things when active player changed
                this.playerChanged();
                // check if game ended
                if(this.firstPlayer.totalConqueredTiles + this.secondPlayer.totalConqueredTiles == this.board.heightTileCount * this.board.widthTileCount) {
                    this.gameOver();
                }
                // console.log(this.boardTiles);
            }
        }
    }
    // deselect illegal hovered area at click
    if(!this.isAreaInLegalState) {
        // reset action
        if(this.currentSelectedTile != undefined) {
            this.traverseArea(this.currentSelectedTile,clickedTile,function(i,j) {
                var tile = self.boardTiles[i][j];
                tile.isSelected = false;
                tile.isFancy.isActive = false;
                tile.isFancy.isNormal = true;
                tile.isHover.isActive = false;
                tile.isHover.isNormal = true;
                self.actuator.switchTile(tile);
                return true;
            });
            this.currentSelectedTile = undefined;
            // find actual hovered tile legal state
            this.fancyArea(clickedTileIndex);
        }
    }

    this.didMove = false;
}

// this is executed while moving the mouse over the board
GameManager.prototype.fancyArea = function(currentMovingIndex) {
    var self = this;

    var movingTile = this.boardTiles[currentMovingIndex.row][currentMovingIndex.column];
    this.movingTile = movingTile;
    this.actuator.updatePin(movingTile);

    if(this.currentSelectedTile == undefined) {
        // player didn't clicked anything
        // reset old hovered tile
        if(this.old.movingTile != undefined) {
            this.old.movingTile.isHover.isActive = false;
            this.actuator.switchTile(this.old.movingTile);
        }
        // mark the hovered tile
        // only if the tile should be clicked
        // update hovered tile's logic accordingly
        movingTile.isHover.isActive = true;
        if( this.gameStarted && (this.isTileNearConquered(movingTile) || this.areTilesEqual(movingTile,this.activePlayer.getStartTile())) ) {
            // check if current selected area is in illegal state
            this.findAreaLegalState(movingTile,movingTile);
        } else {
            this.isAreaInLegalState = false;
        }
        // update hovered tile's visual accordingly
        if(this.isAreaInLegalState) {
            movingTile.isHover.isNormal = true;
        } else {
            movingTile.isHover.isNormal = false;
        }
        // actuate
        this.actuator.switchTile(movingTile);
    } else {
        this.didMove = true;
        // player action started(first click)
        // reset old hovered area
        if(this.old.movingTile != undefined) {
            this.traverseArea(this.currentSelectedTile,this.old.movingTile,function(i,j) {
                var tile = self.boardTiles[i][j];
                tile.isFancy.isActive = false;
                tile.isFancy.isNormal = true;
                self.actuator.switchTile(tile);
                return true;
            });
        }
        // update area's logic accordingly
        this.traverseArea(this.currentSelectedTile,movingTile,function(i,j) {
            var tile = self.boardTiles[i][j];
            tile.isFancy.isActive = true;
            return true;
        });
        // check if current selected area is in illegal state
        this.findAreaLegalState(this.currentSelectedTile,movingTile);
        // update area's visual accordingly
        this.traverseArea(this.currentSelectedTile,movingTile,function(i,j) {
            var tile = self.boardTiles[i][j];
            if(self.isAreaInLegalState) {
                tile.isFancy.isNormal = true;
            } else {
                tile.isFancy.isNormal = false;
            }
            self.actuator.switchTile(tile);
            return true;
        });
    }
    this.old.movingTile = movingTile;
}