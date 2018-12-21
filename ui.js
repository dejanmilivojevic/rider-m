new DPad("dpad1", {
    // Set to true if you want to have a relative swipe dpad
    "relative": false,
    // Gets called when the dpad direction changes.
    // Key is one of: DPad.UP, DPad.DOWN, DPad.LEFT, DPad.RIGHT.
    // Pressed is a boolean, true if the direction is active.
    "directionchange": function(key, pressed) {
        switch (key) {
        case 'up':
            moveDirection.up = pressed;
            break;
        case 'down':
            moveDirection.down = pressed;
            break;
        case 'left':
            moveDirection.left = pressed;
            break;
        case 'right':
            moveDirection.right = pressed;
            break;
        }
    },

    // Gets called when the DPad is touched.
    "touchstart": function() {},

    // Gets called when the DPad is released.
    // had_direction is a boolean that tells you if at lease one direction was active.
    //               can be used to determine if it was just a "tap" on the DPad.
    "touchend": function(had_direction) {},

    // (Optional) distance which the user needs to move before triggering a direction.
    "distance": {x: 10, y:10},

    // (Optional) diagonal: If true, diagonal movement are possible and it becomes a 8-way DPad:
    //                      For exmaple UP and RIGHT at the same time.
    "diagonal": true
});

new DPad("dpad2", {
    // Set to true if you want to have a relative swipe dpad
    "relative": false,
    // Gets called when the dpad direction changes.
    // Key is one of: DPad.UP, DPad.DOWN, DPad.LEFT, DPad.RIGHT.
    // Pressed is a boolean, true if the direction is active.
    "directionchange": function(key, pressed) {
        switch (key) {
        case 'left':
            moveDirection.rollLeft = pressed;
            break;
        case 'right':
            moveDirection.rollRight = pressed;
            break;
        }
    },

    // Gets called when the DPad is touched.
    "touchstart": function() {},

    // Gets called when the DPad is released.
    // had_direction is a boolean that tells you if at lease one direction was active.
    //               can be used to determine if it was just a "tap" on the DPad.
    "touchend": function(had_direction) {},

    // (Optional) distance which the user needs to move before triggering a direction.
    "distance": {x: 10, y:10},

    // (Optional) diagonal: If true, diagonal movement are possible and it becomes a 8-way DPad:
    //                      For exmaple UP and RIGHT at the same time.
    "diagonal": false
});

new Button("follow", {
    "down": function () {
        cmdDataArr.push(new CmdData(1, 32807, 0));
    },
    "up": function () {
    }
});
new Button("lock", {
    "down": function () {
        cmdDataArr.push(new CmdData(1, 32807, 1));
    },
    "up": function () {
    }
});
new Button("full", {
    "down": function () {
        cmdDataArr.push(new CmdData(1, 32807, 2));
    },
    "up": function () {
    }
});

new Button("reset", {
    "down": function () {
        cmdDataArr.push(new CmdData(1, 49185, 0));
    },
    "up": function () {
    }
});
new Button("reverse", {
    "down": function () {
        cmdDataArr.push(new CmdData(1, 49185, 1));
    },
    "up": function () {
    }
});

function setBatteryValue(value) {
    const docStyle = document.documentElement.style;
    let correctValue = 0;

    if (value >= 100) {
        correctValue = 100;
    } else if (value <= 0) {
        correctValue = 0;
    } else {
        correctValue = value;
    }

    docStyle.setProperty('--battery-level', parseInt(correctValue));
}

const pitchEl = document.getElementById('pitch-value');
const rollEl = document.getElementById('roll-value');;
const panEl = document.getElementById('pan-value');;
const fullButton = document.getElementById('full');
const lockButton = document.getElementById('lock');
const followButton = document.getElementById('follow');

function setPitch(value) {
    pitchEl.innerHTML = value;
}

function setRoll(value) {
    rollEl.innerHTML = value;
}

function setPan(value) {
    panEl.innerHTML = value;
}

function setMode(mode) {
    switch(mode) {
    case 'full':
        lockButton.classList.contains('button-active') ? lockButton.classList.remove('button-active') : null;
        followButton.classList.contains('button-active') ? followButton.classList.remove('button-active') : null;

        fullButton.classList.contains('button-active') ? null : fullButton.classList.add('button-active');
        break;
    case 'lock':
        lockButton.classList.contains('button-active') ? null : lockButton.classList.add('button-active');

        followButton.classList.contains('button-active') ? followButton.classList.remove('button-active') : null;
        fullButton.classList.contains('button-active') ? fullButton.classList.remove('button-active') : null;
        break;
    case 'follow':
        lockButton.classList.contains('button-active') ? lockButton.classList.remove('button-active') : null;
        followButton.classList.contains('button-active') ? null : followButton.classList.add('button-active');
        fullButton.classList.contains('button-active') ? fullButton.classList.remove('button-active') : null;
        break;
    }
}
