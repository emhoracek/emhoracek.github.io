// Downhill skating game

// what is this first line, with the leading semicolon?
;(function() {
    var Game = function(){
        var screen = document.getElementById("screen").getContext("2d");

        screen.imageSmoothingEnabled = false;
        screen.webkitImageSmoothingEnabled = false;
        screen.mozImageSmoothingEnabled = false;
        
        this.keyboarder = Keyboarder();

        this.size = {x: screen.canvas.width, y: screen.canvas. height};
        this.center = { x : this.size.x / 2, y: this.size.y / 2}; 

        // image stuff from http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/ 
        this.playerImage = new Image();
        this.playerImage.src = "images/skater.png";
        this.evilTree = new Image();
        this.evilTree.src = "images/eviltree.png";

        this.road = buildRoad(this, this.size.y, 0, 250);
        this.player = new Player(this);
        this.bodies = [this.road, this.player ];
        
        this.gravity = 0.9;
        var self = this;

        var tick = function() {
            self.update();
            self.draw(screen);
            requestAnimationFrame(tick);
        };

        tick();
    };

    Game.prototype = {
        update: function() {
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].update !== undefined) {
                    this.bodies[i].update();
                }
            }

            reportCollisions(this.bodies);
        },

        draw: function(screen) {
            
            screen.clearRect(0, 0, this.size.x, this.size.y);
            
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].draw !== undefined) {
                    this.bodies[i].draw(screen);
                }
            }
        },

        addBody: function(body) {
            
            this.bodies.push(body);

        },

        removeBody: function(body) {
            var bodyIndex = this.bodies.indexOf(body);
            if(bodyIndex !== -1) {
                this.bodies.splice(bodyIndex, 1);
            }
        }
    };


    var Player = function(game) {
        this.game = game;
        this.size = { x: 40, y: 40 };
        this.center = {x: game.center.x, y: 100};
        this.keyboarder = new Keyboarder();
        this.image = game.playerImage;
        this.sprite = new Sprite ( this, { x: 20, y: 20 }, 8, 6 );
        this.state = "skating";
    };

    Player.prototype = {
        update: function() {

            /*
            if (isDown(37)) {
                this.state = "turning left";
            }
            else {
                this.sprite.image = this.game.playerImage;
            }*/

            /*
            // this is from http://ericleads.com/2012/12/switch-case-considered-harmful/
            // it's a way to avoid "switch" (which is kinda hairy in js) by using a "method lookup"
            // it's pretty cool but I dunno if I really want it.
            function doState (state, that) {
                var states = {
                    "standing": function () {     
                        that.sprite.image = that.game.evilTree; 
                        },
                    "skating": function () {
                        that.sprite.image = that.game.playerImage; 
                        },
                    "stopping": function() {
                        //do this 
                        },
                    "turning left": function() {
                        // do this 
                        },
                    "turing right": function() {
                        // do this 
                        }
                }

                if (typeof states[state] !== "function") {
                    throw new Error("Invalid action");
                }

                return states[state];
            }

            doState(this.state, this)();

            */

            this.sprite.update();

        },

        draw: function(screen) {
        
            this.sprite.render(screen);
        
        },

        collision: function(otherBody) {

            throw "implement me";

            if (otherBody.slope != undefined) {
                if (this.tilt != otherBody.slope) {
                     console.log("changing");
                }
                this.tilt = otherBody.slope;
            }

        }
    };

    var RoadSegment = function (game, slope, center) {
        this.game = game;
        this.slope = slope;
        this.size = { x: 300, y: slope }
        this.center = center
    };

    RoadSegment.prototype = {

        update: function () {

            // ?
        },


        draw: function(screen) {
            drawRect(screen, this, "blue");
            //drawText(screen, { x: 50, y: this.center.y }, this.slope );
            //drawText(screen, {x: 25, y: 50 }, this.yspeed );
        },

        collision: function(otherBody) {

            if (this.slope != otherBody.tilt) {
                this.yaccel = this.game.gravity * Math.sin( 1 - this.slope / 100);
                console.log(this.yaccel); 
                otherBody.tilt = this.slope;
            }
        }
    };

    var Decoration = function(game, center) {

        this.game = game;
        this.size = { x: 64, y: 64 } ;
        this.center = { x: game.center.x, y: game.center.y };
        this.image = game.eviltree;
        this.sprite = new Sprite ( this, {x: 51, y: 58 } );
    };

    Decoration.prototype = {
        update: function() {
            // ?
        },

        draw: function(screen) {

            this.sprite.render(screen);

            drawRect (screen, this, "red");
        }
    };

    var Road = function (game) {
        this.game = game;
        this.size = { x: 250, y: game.size.y } 
        this.center = {x: game.center.x, y: game.center.y};
        this.yaccel = 0;
        this.yspeed = 5;
        this.xspeed = 5;
        this.segments = [];
        this.decorations = [];
    };

    Road.prototype = {
        update: function() {
            
            var lowesty = 0;

            if (this.yspeed < 10) {
                this.yspeed = this.yspeed + (this.yspeed * this.yaccel);
            }
            else if (this.acceleration > 10) { 
                this.acceleration = 10;
            }
            
            for (var i = 0; i < this.segments.length; i ++) {
                
                this.segments[i].center.y -= this.yspeed;

                if (this.segments[i].center.y > lowesty) {
                    lowesty = this.segments[i].center.y;
                }

                if (isDown(37)) {
                    this.segments[i].center.x += this.xspeed;
                }
                else if (isDown(39)) {
                    this.segments[i].center.x -= this.xspeed;
                }
            }
            
            function isOnScreen(obj) {
                return (obj.center.y > -50);
            }

            var  new_segments = this.segments.filter(isOnScreen);
            
            if (lowesty < 550) {
                new_segments = new_segments.concat(buildRoad(this.game, 200, lowesty, this.segments[0].center.x).segments);
            }

            this.segments = new_segments;

            this.decorations = new Decoration (this.game, {x: 250, y: 250}); 
            
        },

        draw: function(screen) {
            for (var i = 0; i < this.segments.length; i++) {
                this.segments[i].draw(screen);
            }

            for (var i =0; i <this.decorations.length; i++) {
                this.decorations[i].draw(screen);
            }
        },

        collision: function(otherBody) {
           
            // 

        }

    };

    var buildRoad = function(game, road_size, ystart, x) {

        var road = new Road(game);
        var y = ystart;
        var yend = y + road_size;

        var curSlope = 100;

        var x = x;

        while (y < yend) {

            var nextSlope = Math.floor(Math.random() * 100);
            //console.log(nextSlope);

            var diffSlope = nextSlope - curSlope;

            while (diffSlope > 10 || diffSlope < -10) {
                if (nextSlope > curSlope) {
                     curSlope = Math.floor(curSlope + diffSlope / 2);
                }
                else {
                    curSlope = Math.floor(curSlope + diffSlope / 2);
                }
                
                y = y + Math.floor(curSlope / 2);
                road.segments.push(new RoadSegment(game, curSlope, {x: x, y: y}));
                y = y + Math.floor(curSlope / 2);
                y = y + 1;

                diffSlope = nextSlope - curSlope;
            }
        }

        return road;
    };


    var Keyboarder = function() {
        var keyState = {};

        window.addEventListener("keydown", function(e) {
            keyState[e.keyCode] = true;
        });

        window.addEventListener("keyup", function(e) {
            keyState[e.keyCode] = false;
        });

        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        };

        this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32 };
    };
    
    var isColliding = function (b1, b2) {
        
        if ( b1.center.x - b1.size.x / 2 < b2.center.x + b2.size.x / 2 &&
             b2.center.x + b2.size.x / 2 < b1.center.x + b1.size.x / 2 &&
             b1.center.y - b1.size.y / 2 < b2.center.y + b2.size.y / 2 &&
             b2.center.y + b2.size.y / 2 < b1.center.y + b1.size.y / 2) {
                
                return true;
        }
    };

    var reportCollisions = function(bodies) {
        var bodyPairs = [];

        for (var i = 0; i < bodies.length; i++) {
            for (var j = i + 1; j < bodies.length; j++) {
                if (isColliding(bodies[i], bodies[j])) {
                    bodyPairs.push([bodies[i], bodies[j]]);
                }
            }
        }

        for (var i = 0; i < bodyPairs.length; i++) {
            if (bodyPairs[i][0].collision !== undefined) {
                bodyPairs[i][0].collision(bodyPairs[i][1]);
            }
        }
    };

    window.addEventListener('load', function() {
        new Game();
    });

    var drawRect = function (screen, body, color) {
        screen.fillStyle = color;
        screen.fillRect ( body.center.x - body.size.x / 2,
                        body.center.y - body.size.y / 2,
                        body.size.x,
                        body.size.y);
    };

    var drawOutline = function (screen, body, color) {
        screen.strokeStyle = color;
        screen.rect ( body.center.x - body.size.x / 2,
                      body.center.y - body.size.y / 2,
                      body.size.x,
                      body.size.y);
        screen.stroke();
    };

    var drawText = function (screen, place, text) {
        screen.font = "10px sans";
        screen.fillStyle = "black";
        screen.fillText(text, place.x, place.y);
    };

    var Sprite = function (body, size, frames, ticksPerFrame) {
                   
        this.frameIndex = 0,
        this.tickCount = 0,
        this.ticksPerFrame = ticksPerFrame || 0;
        this.numFrames = frames || 1;
            // so if frames is "undefined" then frames is "1"?

        this.x = body.center.x;
        this.y = body.center.y;
        this.size = body.size;
        this.image = body.image;
        this.image_size = size || body.size;
    
    };

    Sprite.prototype = {
        update: function() {
            this.tickCount += 1;

            if (this.tickCount > this.ticksPerFrame) {
                this.tickCount = 0;

                if (this.frameIndex < this.numFrames - 1) {
                    this.frameIndex += 1;
                }
                else if (this.frameIndex == this.numFrames - 1) {
                    this.frameIndex = 0;
                }
            }
        },
        render: function(screen) {
            screen.drawImage (
                    this.image,
                    this.image_size.x * this.frameIndex, 0, // where to start clipping the sprite sheet
                    this.image_size.x, this.image_size.y, // where to stop clipping
                    this.x, this.y, // where to place the sprite
                    this.size.x, this.size.y ); // size of the placed sprite;
        }
    };

})();

