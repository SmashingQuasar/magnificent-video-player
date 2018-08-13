"use strict";
function prettyfyTime(time) {
    var seconds;
    var minutes;
    var hours;
    hours = Math.floor(time / 3600);
    time -= hours * 3600;
    minutes = Math.floor(time / 60);
    time -= minutes * 60;
    seconds = Math.floor(time);
    var PRETTY_MINUTES = ("" + minutes).padStart(2, "0");
    var PRETTY_SECONDS = ("" + seconds).padStart(2, "0");
    return hours + ":" + PRETTY_MINUTES + ":" + PRETTY_SECONDS;
}
var MagnificientVideoPlayer = (function () {
    function MagnificientVideoPlayer(configuration) {
        var _this = this;
        this.timeContainer = undefined;
        if (configuration.container === undefined) {
            throw new SyntaxError("MVP: Invalid configuration object: No container property.");
        }
        this.container = configuration.container;
        if (configuration.videoPlayer === undefined) {
            var VIDEO_PLAYER = this.container.querySelector("video");
            if (VIDEO_PLAYER === null) {
                throw new ReferenceError("MVP: No <video> element provided.");
            }
            this.videoPlayer = VIDEO_PLAYER;
        }
        else {
            if (configuration.videoPlayer instanceof HTMLVideoElement) {
                this.videoPlayer = configuration.videoPlayer;
            }
            else {
                throw new TypeError("MVP: videoPlayer property MUST be an instance of HTMLVideoElement.");
            }
        }
        if (configuration.playButton === undefined) {
            var PLAY_BUTTON = this.container.querySelector("button[data-mvp*=\"play\"]");
            if (PLAY_BUTTON === null) {
                throw new ReferenceError("MVP: No playButton property specified in configuration and couldn't find a button[data-mvp*=\"play\"] in the DOM.");
            }
            this.playButton = PLAY_BUTTON;
        }
        else {
            if (configuration.playButton instanceof HTMLButtonElement) {
                this.playButton = configuration.playButton;
            }
            else {
                throw new TypeError("MVP: Play button must be an instance of HTMLButtonElement.");
            }
        }
        if (!this.playButton.classList.contains("play")) {
            this.playButton.classList.add("play");
        }
        this.playButton.addEventListener("click", function (event) {
            if (_this.videoPlayer.paused) {
                _this.videoPlayer.play()
                    .then(function () {
                    _this.container.classList.add("playing");
                    if (_this.playButton === _this.pauseButton) {
                        _this.playButton.classList.remove("play");
                        _this.pauseButton.classList.add("pause");
                    }
                    else {
                        _this.playButton.hidden = true;
                        _this.pauseButton.hidden = false;
                    }
                })
                    .catch(function (error) {
                    console.debug(error);
                });
                event.stopImmediatePropagation();
            }
        });
        if (configuration.pauseButton === undefined) {
            var PAUSE_BUTTON = this.container.querySelector("button[data-mvp*=\"pause\"]");
            if (PAUSE_BUTTON === null) {
                throw new ReferenceError("MVP: No pauseButton property specified in configuration and couldn't find a button[data-mvp*=\"pause\"] in the DOM.");
            }
            this.pauseButton = PAUSE_BUTTON;
        }
        else {
            if (configuration.pauseButton instanceof HTMLButtonElement) {
                this.pauseButton = configuration.pauseButton;
            }
            else {
                throw new TypeError("MVP: Pause button must be an instance of HTMLButtonElement.");
            }
        }
        if ((!(this.playButton === this.pauseButton) || !this.videoPlayer.paused)
            &&
                !this.pauseButton.classList.contains("pause")) {
            this.pauseButton.classList.add("pause");
        }
        if (this.playButton === this.pauseButton && !this.pauseButton.hasAttribute("role")) {
            this.pauseButton.setAttribute("role", "switch");
        }
        this.pauseButton.addEventListener("click", function (event) {
            if (!_this.videoPlayer.paused) {
                _this.videoPlayer.pause();
                _this.container.classList.remove("playing");
                if (_this.pauseButton === _this.playButton) {
                    _this.pauseButton.classList.remove("pause");
                    _this.playButton.classList.add("play");
                }
                else {
                    _this.pauseButton.hidden = true;
                    _this.playButton.hidden = false;
                }
                event.stopImmediatePropagation();
            }
        });
        if (configuration.timeline === undefined) {
            var TIMELINE = this.container.querySelector("progress[data-mvp=\"timeline\"]");
            if (TIMELINE === null) {
                throw new ReferenceError("MVP: No timeline HTMLProgressElement provided in configuration and unable to find it in DOM.");
            }
            else {
                if (TIMELINE instanceof HTMLProgressElement) {
                    this.timeline = TIMELINE;
                }
                else {
                    throw new TypeError("MVP: timeline property MUST be an instance of HTMLProgressElement.");
                }
            }
        }
        else {
            if (configuration.timeline instanceof HTMLProgressElement) {
                this.timeline = configuration.timeline;
            }
            else {
                throw new TypeError("MVP: timeline property MUST be an instance of HTMLProgressElement.");
            }
        }
        this.timeline.max = this.videoPlayer.duration;
        this.timeline.value = this.videoPlayer.currentTime;
        if (configuration.displayTime === undefined || configuration.displayTime === false) {
            this.displayTime = false;
        }
        else {
            this.displayTime = true;
            if (configuration.timeContainer === undefined) {
                var TIME_CONTAINER = document.querySelector("span[data-mvp=\"time\"]");
                if (TIME_CONTAINER === null) {
                    throw new ReferenceError("MVP: No timeContainer property provided in configuration and couldn't find it in DOM.");
                }
                this.timeContainer = TIME_CONTAINER;
            }
            else {
                if (configuration.timeContainer instanceof HTMLElement) {
                    this.timeContainer = configuration.timeContainer;
                }
                else {
                    throw new TypeError("MVP: timeContainer property MUST be an instance of HTMLElement.");
                }
            }
            this.updateTime();
        }
        this.timeline.addEventListener("click", function (event) {
            var TIMELINE_RECT = _this.timeline.getBoundingClientRect();
            var LEFT = TIMELINE_RECT.left;
            var WIDTH = TIMELINE_RECT.width;
            var PROGRESS = (100 / WIDTH) * (event.clientX - LEFT) / 100;
            var TIME = _this.videoPlayer.duration * PROGRESS;
            _this.updateTime(TIME);
        });
        this.videoPlayer.addEventListener("timeupdate", function () {
            _this.timeline.value = _this.videoPlayer.currentTime;
            _this.updateTime();
        });
        if (configuration.displaySoundControls === undefined) {
            this.displaySoundControls = false;
        }
        else {
            this.displaySoundControls = true;
            if (configuration.muteButton === undefined) {
                var MUTE_BUTTON = this.container.querySelector("button[data-mvp=\"mute\"]");
                if (MUTE_BUTTON === null) {
                    throw new ReferenceError("MVP: No muteButton property provided in configuration and unable to find it in DOM.");
                }
                else {
                    if (MUTE_BUTTON instanceof HTMLButtonElement) {
                        this.muteButton = MUTE_BUTTON;
                    }
                    else {
                        throw new TypeError("MVP: muteButton property MUST be an instance of HTMLButtonElement.");
                    }
                }
            }
            else {
                if (configuration.muteButton instanceof HTMLButtonElement) {
                    this.muteButton = configuration.muteButton;
                }
                else {
                    throw new TypeError("MVP: muteButton property MUST be an instance of HTMLButtonElement.");
                }
            }
            if (!this.muteButton.hasAttribute("role")) {
                this.muteButton.setAttribute("role", "switch");
            }
            this.muteButton.classList.add("mute");
            this.muteButton.addEventListener("click", function () {
                if (_this.videoPlayer.muted) {
                    _this.videoPlayer.muted = false;
                    _this.container.classList.remove("muted");
                }
                else {
                    _this.videoPlayer.muted = true;
                    _this.container.classList.add("muted");
                }
            });
        }
    }
    MagnificientVideoPlayer.prototype.getPlayButton = function () {
        return this.playButton;
    };
    MagnificientVideoPlayer.prototype.getPausebutton = function () {
        return this.playButton;
    };
    MagnificientVideoPlayer.prototype.getCurrentTime = function () {
        return this.videoPlayer.currentTime;
    };
    MagnificientVideoPlayer.prototype.getDuration = function () {
        return this.videoPlayer.duration;
    };
    MagnificientVideoPlayer.prototype.getPrettyCurrentTime = function () {
        return prettyfyTime(this.videoPlayer.currentTime);
    };
    MagnificientVideoPlayer.prototype.getPrettyDuration = function () {
        return prettyfyTime(this.videoPlayer.duration);
    };
    MagnificientVideoPlayer.prototype.updateTime = function (time) {
        if (time === void 0) { time = undefined; }
        if (time !== undefined) {
            this.videoPlayer.currentTime = time;
        }
        if (this.displayTime && this.timeContainer !== undefined) {
            this.timeContainer.innerHTML = this.getPrettyCurrentTime() + " / " + this.getPrettyDuration();
        }
    };
    MagnificientVideoPlayer.prototype.getDisplaySoundControls = function () {
        return this.displaySoundControls;
    };
    return MagnificientVideoPlayer;
}());
document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("[data-custom-player*=play]");
    console.log(button);
    if (button) {
        button.addEventListener("click", function () {
            if (button.classList.contains("play")) {
                button.classList.remove("play");
                button.classList.add("pause");
            }
            else {
                button.classList.add("play");
                button.classList.remove("pause");
            }
        });
    }
});
