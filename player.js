function Player(_id,_startTile,_keys) {
    this.id = _id;
    this.startTile = _startTile;
    this.keys = _keys;
    this.theMostAdvancedTile = this.startTile;
    this.totalConqueredTiles = 0;
    this.rolledDice = {
        value : undefined,
        status : false
    };
}

Player.prototype.getStartTile = function() {
    return this.startTile;
}

Player.prototype.findThePossiblyMostAdvancedTile = function(hoveredTile,boardTiles,updateTheMostAdvancedTile) {
    let tile = null;
    var rowIndex = this.theMostAdvancedTile.index.row;
    var columnIndex = this.theMostAdvancedTile.index.column;
    if(Math.abs(hoveredTile.index.row - this.startTile.index.row) > Math.abs(this.theMostAdvancedTile.index.row - this.startTile.index.row))
        rowIndex = hoveredTile.index.row;
    if(Math.abs(hoveredTile.index.column - this.startTile.index.column) > Math.abs(this.theMostAdvancedTile.index.column - this.startTile.index.column))
        columnIndex = hoveredTile.index.column;
    tile = boardTiles[rowIndex][columnIndex];

    if(updateTheMostAdvancedTile)
        this.theMostAdvancedTile = tile;
        
    return tile;
}