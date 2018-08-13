"use strict";
var MagnificientVideoPlayer = (function () {
    function MagnificientVideoPlayer(configuration) {
        var _this = this;
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
        this.videoPlayer.addEventListener("timeupdate", function () {
            _this.timeline.value = _this.videoPlayer.currentTime;
        });
    }
    MagnificientVideoPlayer.prototype.getPlayButton = function () {
        return this.playButton;
    };
    MagnificientVideoPlayer.prototype.getPausebutton = function () {
        return this.playButton;
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
