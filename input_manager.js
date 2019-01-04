function InputManager(_board) {
    this.events = {};
    this.board = _board;
    this.boardContainer = document.querySelector(this.board.tag);
    if (window.navigator.msPointerEnabled) {
        //Internet Explorer 10 style
        this.eventTouchStart    = "MSPointerDown";
        this.eventTouchMove     = "MSPointerMove";
        this.eventTouchEnd      = "MSPointerUp";
    } else {
        this.eventTouchStart    = "touchstart";
        this.eventTouchMove     = "touchmove";
        this.eventTouchEnd      = "touchend";
    }
    this.eventMouseClick = "click";
    this.eventMouseStart = "mousedown";
    this.eventMouseMove = "mousemove";
    this.eventMouseEnd = "mouseup";
    this.listen();
}

InputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
};

InputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
};

InputManager.prototype.listen = function () {
    var self = this;
    // var map = {
    //   38: 0, // Up
    //   39: 1, // Right
    //   40: 2, // Down
    //   37: 3, // Left
    //   75: 0, // Vim up
    //   76: 1, // Vim right
    //   74: 2, // Vim down
    //   72: 3, // Vim left
    //   87: 0, // W
    //   68: 1, // D
    //   83: 2, // S
    //   65: 3  // A
    // };

    var map = {
        65: 0, // A
        83: 1, // S
        75: 2, // K
        76: 3 // L
      };

    var oldCoords = {
        row : -1,
        column : -1
    };

    function getCursorCoords(event) {
        if (window.navigator.msPointerEnabled) {
            return {clickX : event.pageX - self.boardContainer.getBoundingClientRect().left, clickY : event.pageY - self.boardContainer.getBoundingClientRect().top};
        } else {
            return {clickX : event.clientX - self.boardContainer.getBoundingClientRect().left, clickY : event.clientY - self.boardContainer.getBoundingClientRect().top};
        }
    }

    function getTouchStartCoords() {
        if (window.navigator.msPointerEnabled) {
            return {clickX : event.pageX - self.boardContainer.getBoundingClientRect().left, clickY : event.pageY - self.boardContainer.getBoundingClientRect().top};
        } else {
            return {clickX : event.touches[0].clientX - self.boardContainer.getBoundingClientRect().left, clickY : event.touches[0].clientY - self.boardContainer.getBoundingClientRect().top};
        }
    }

    function getTouchChangedCoords() {
        if (window.navigator.msPointerEnabled) {
            return {clickX : event.pageX - self.boardContainer.getBoundingClientRect().left, clickY : event.pageY - self.boardContainer.getBoundingClientRect().top};
        } else {
            return {clickX : event.changedTouches[0].clientX - self.boardContainer.getBoundingClientRect().left, clickY : event.changedTouches[0].clientY - self.boardContainer.getBoundingClientRect().top};
        }
    }

    function getIndex(event) {
        var cursorCoords;
        if(event.touches) {
            if(event.type === "touchstart") {
                cursorCoords = getTouchStartCoords(event);
            } else if(event.type === "touchmove") {
                cursorCoords = getTouchChangedCoords(event);
            }
        } else{
            cursorCoords = getCursorCoords(event);
        }
        var possibleRowIndex = Math.floor(cursorCoords.clickY / self.board.tileSize);
        var possibleColumnIndex = Math.floor(cursorCoords.clickX / self.board.tileSize);
        var row;
        if(possibleRowIndex < 0) {
            row = 0;
        } else if(possibleRowIndex >= self.board.heightTileCount) {
            row = self.board.heightTileCount - 1;
        } else {
            row = possibleRowIndex;
        }
        var column;
        if(possibleColumnIndex < 0) {
            column = 0;
        } else if(possibleColumnIndex >= self.board.widthTileCount) {
            column = self.board.widthTileCount - 1;
        } else {
            column = possibleColumnIndex;
        }
        return {row : row, column : column};
    }

    // TOUCH HANDLER FUNCTIONS
    function touchStartHandler(event) {
        if(event.touches) {
            event.preventDefault();
            // ignore if still touching with one or more fingers or input
            if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
            event.targetTouches.length > 1 || self.targetIsInput(event)) {
                return;
            }
            
            // "force" move function to be executed in order to comply
            // with pc mouse flow
            var newCoords = getIndex(event);
            if(newCoords.row != oldCoords.row || newCoords.column != oldCoords.column) {
                self.emit("mouseMove", newCoords);
                oldCoords = newCoords;
            }
            self.emit("mouseStart", newCoords);
        }
    }

    function touchMoveHandler(event) {
        if(event.touches) {
            event.preventDefault();
            // ignore if still touching with one or more fingers or input
            if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
            event.targetTouches.length > 1 || self.targetIsInput(event)) {
                return;
            }

            var newCoords = getIndex(event);
            if(newCoords.row != oldCoords.row || newCoords.column != oldCoords.column) {
                self.emit("mouseMove", newCoords);
                oldCoords = newCoords;
            }
        }
    }

    // MOUSE HANDLER FUNCTIONS
    function mouseClickHandler(event) {
        event.preventDefault();
        self.emit("mouseStart", getIndex(event));
    }

    function mouseMoveHandler(event) {
        event.preventDefault();
        var newCoords = getIndex(event);
        if(newCoords.row != oldCoords.row || newCoords.column != oldCoords.column) {
            self.emit("mouseMove", newCoords);
            oldCoords = newCoords;
        }
    }
  
    // respond to keys
    document.addEventListener("keydown", function (event) {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        var mapped = map[event.which];
        // ignore the event if it's happening in a text field
        if (self.targetIsInput(event)) return;
        
        if (!modifiers) {
            // SPACE to start the game
            if (event.which === 32) {
                self.start.call(self, event);
                //self.rollDice.call(self, event);
            }
            if (mapped !== undefined) {
                event.preventDefault();
                self.emit("rollDice", mapped);
            }
            // R key restarts the game
            if (event.which === 82) {
                self.restart.call(self, event);
            }
        }

    });
  
    // respond to button presses
    this.bindButtonPress("#login-btn", this.login);
    this.bindButtonPress(".roll-dice-btn", this.rollDice);
    this.bindButtonPress("#rematch-btn", this.restart);
  
    // respond to touch or click events
    this.boardContainer.addEventListener(this.eventTouchStart, function(event) {
        touchStartHandler(event);
    });
    this.boardContainer.addEventListener(this.eventTouchMove, function(event) {
        touchMoveHandler(event);
    });

    this.boardContainer.addEventListener(this.eventMouseStart, function(event) {
        mouseClickHandler(event);
    });
    this.boardContainer.addEventListener(this.eventMouseMove, function(event) {
        mouseMoveHandler(event);
    });
};

InputManager.prototype.login = function (event) {
    event.preventDefault();
    this.emit("login", event);
};

InputManager.prototype.start = function (event) {
    event.preventDefault();
    this.emit("start", event);
};

InputManager.prototype.rollDice = function (event) {
    event.preventDefault();
    this.emit("rollDice", event);
};

InputManager.prototype.restart = function (event) {
    event.preventDefault();
    location.reload();
    //this.emit("restart");
};

InputManager.prototype.bindButtonPress = function (selector, fn) {
    if(selector != null && fn != null) {
        var button = document.querySelector(selector);
        button.addEventListener("click", fn.bind(this));
        button.addEventListener(this.eventTouchEnd, fn.bind(this));
    } else {
        console.log("Warning! Button or function inexistent for bind!");
    }
};

InputManager.prototype.targetIsInput = function (event) {
    return event.target.tagName.toLowerCase() === "input";
};