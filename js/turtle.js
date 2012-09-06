var Turtle = (function() {

  var Turtle = function(options) {
    var that = this;
    options = options || {};
    that.ros             = options.ros;
    that.name            = options.name;
    that.pose            = options.pose;
    that.context         = options.context;
    that.imageLoaded     = false;
    that.image           = new Image();
    that.angularVelocity = 0;
    that.linearVelocity  = 0;
    that.velocityTopic = new that.ros.Topic({
      name        : '/' + that.name + '/command_velocity'
    , messageType : 'turtlesim/Velocity'
    });

    this.image.onload = function() {
      that.meter = that.image.height;
      that.widthInMeters  = that.context.canvas.width / that.meter;
      that.heightInMeters = that.context.canvas.height / that.meter;
      that.pose.x = (that.pose.x / that.meter);
      that.pose.y = (that.pose.y / that.meter);

      that.orientation = 0;
      that.velocityTopic.subscribe(that.onVelocity.bind(that));

      that.draw();
      that.imageloaded=true;
    };

    var imageNumber = Math.floor(Math.random()*6);
    if (imageNumber === 0) {
      that.image.src = 'images/diamondback.png';
    }
    else if (imageNumber === 1) {
      that.image.src = 'images/box-turtle.png';
    }
    else if (imageNumber === 2) {
      that.image.src = 'images/electric.png';
    }

    else if (imageNumber ==3) {
      that.image.src = 'images/robot-turtle.png';
    }
    else if (imageNumber === 4) {
      that.image.src = 'images/sea-turtle.png';
    }
    else {
      this.image.src = 'images/turtle.png';
    }
  };
  Turtle.prototype.__proto__ = EventEmitter2.prototype;

  Turtle.prototype.onVelocity = function(message) {
    var dt = 0.1;
    this.linearVelocity  = message.linear;
    this.angularVelocity = message.angular;
    this.orientation = (this.orientation + this.angularVelocity * dt) % (2 * Math.PI);

    var pose = new this.ros.Message();
    pose.x = this.pose.x + Math.sin(this.orientation + (Math.PI / 2)) * this.linearVelocity * dt;
    pose.y = this.pose.y + Math.cos(this.orientation + (Math.PI / 2)) * this.linearVelocity * dt;
    pose.theta = this.orientation;
    pose.linear_velocity = this.linearVelocity;
    pose.angular_velocity = this.angularVelocity;

    if ( pose.x <  0
      || pose.x >= (this.widthInMeters)

      || pose.y <  0
      || pose.y >= (this.heightInMeters)
    ) {
      console.log("Oh no!  I hit the wall!");
    }

    pose.x = Math.min(Math.max(pose.x, 0), this.widthInMeters);
    pose.y = Math.min(Math.max(pose.y, 0), this.heightInMeters);

    this.pose.x = pose.x;
    this.pose.y = pose.y;

    var poseTopic = new this.ros.Topic({
      name        : '/' + this.name + '/pose'
    , messageType : 'turtlesim/Pose'
    });
    poseTopic.publish(pose);
    this.emit('dirty');
  };

  Turtle.prototype.draw = function() {
    this.context.save();
    var x = this.pose.x * this.meter;
    var y = this.pose.y * this.meter;
    var imageWidth = this.image.width;
    var imageHeight = this.image.height;

    this.context.translate(x, y);
    this.context.rotate(-this.orientation);
    this.context.drawImage(this.image, -(imageWidth / 2), -(imageHeight / 2), imageWidth, imageHeight);
    this.context.restore();
  };

  Turtle.prototype.moveForward = function() {
    var velocity = new this.ros.Message({
      angular : 0
    , linear  : 2
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveBackward = function() {
    var velocity = new this.ros.Message({
      angular : 0
    , linear  : -2
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveRight = function() {
    var velocity = new this.ros.Message({
      angular : -2
    , linear  : 0
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveLeft = function() {
    var velocity = new this.ros.Message({
      angular : 2
    , linear  : 0
    });

    this.velocityTopic.publish(velocity);
  };

  return Turtle;
}());

