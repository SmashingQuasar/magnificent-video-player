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
        if (this.playButton === this.pauseButton) {
        }
        this.playButton.addEventListener("click", function (event) {
            if (_this.videoPlayer.paused) {
                _this.play();
                event.stopImmediatePropagation();
            }
        });
        this.pauseButton.addEventListener("click", function (event) {
            if (!_this.videoPlayer.paused) {
                _this.pause();
                event.stopImmediatePropagation();
            }
        });
        this.videoPlayer.addEventListener("click", function () {
            _this.togglePlay();
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
        window.setInterval(function (t) {
            if (_this.videoPlayer.readyState > 0) {
                _this.timeline.max = _this.videoPlayer.duration;
                _this.timeline.value = _this.videoPlayer.currentTime;
                clearInterval(t);
            }
        }, 500);
        if (configuration.displayTime === undefined || configuration.displayTime === false) {
            this.displayTime = false;
        }
        else {
            this.displayTime = true;
            if (configuration.timeContainer === undefined) {
                var TIME_CONTAINER = this.container.querySelector("span[data-mvp=\"time\"]");
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
            window.setInterval(function (t) {
                if (_this.videoPlayer.readyState > 0) {
                    _this.updateTime();
                    clearInterval(t);
                }
            });
        }
        var time_changing = false;
        this.timeline.addEventListener("mousedown", function () {
            time_changing = true;
        });
        this.timeline.addEventListener("mousemove", function (event) {
            if (time_changing) {
                var TIME = _this.calculateTimelineProgress(event.clientX);
                _this.updateTime(TIME);
            }
        });
        this.timeline.addEventListener("mouseup", function (event) {
            if (time_changing) {
                var TIME = _this.calculateTimelineProgress(event.clientX);
                _this.updateTime(TIME);
                time_changing = false;
            }
        });
        this.timeline.addEventListener("mouseleave", function (event) {
            if (time_changing) {
                var TIME = _this.calculateTimelineProgress(event.clientX);
                _this.updateTime(TIME);
                time_changing = false;
            }
        });
        this.videoPlayer.addEventListener("timeupdate", function () {
            _this.timeline.value = _this.videoPlayer.currentTime;
            var PROGRESS = 100 / _this.videoPlayer.duration * _this.videoPlayer.currentTime / 100;
            var EVENT = new CustomEvent("MVPProgressUpdate", { detail: PROGRESS });
            _this.videoPlayer.dispatchEvent(EVENT);
            _this.updateTime();
        });
        if (configuration.displaySoundControls === undefined) {
            this.displaySoundControls = false;
            this.volume = undefined;
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
            if (configuration.volume === undefined) {
                var VOLUME = this.container.querySelector("progress[data-mvp=\"volume\"]");
                if (VOLUME === null) {
                    throw new ReferenceError("MVP: No volume property provided in configuration and unable to find it in DOM.");
                }
                else {
                    if (VOLUME instanceof HTMLProgressElement) {
                        this.volume = VOLUME;
                    }
                    else {
                        throw new TypeError("MVP: volume property MUST be an instance of HTMLButtonElement.");
                    }
                }
            }
            else {
                if (configuration.volume instanceof HTMLButtonElement) {
                    this.volume = configuration.volume;
                }
                else {
                    throw new TypeError("MVP: volume property MUST be an instance of HTMLButtonElement.");
                }
            }
            this.volume.max = 1;
            this.volume.value = 0.5;
            var volume_changing_1 = false;
            this.volume.addEventListener("mousedown", function () {
                if (_this.displaySoundControls && _this.volume !== undefined) {
                    volume_changing_1 = true;
                }
            });
            this.volume.addEventListener("mousemove", function (event) {
                if (_this.displaySoundControls && _this.volume !== undefined && volume_changing_1) {
                    var VOLUME = _this.calculateVolume(event.clientX);
                    _this.setVolume(VOLUME);
                }
            });
            this.volume.addEventListener("mouseup", function (event) {
                if (_this.displaySoundControls && _this.volume !== undefined && volume_changing_1) {
                    var VOLUME = _this.calculateVolume(event.clientX);
                    _this.setVolume(VOLUME);
                    volume_changing_1 = false;
                }
            });
            this.volume.addEventListener("mouseleave", function (event) {
                if (_this.displaySoundControls && _this.volume !== undefined && volume_changing_1) {
                    var VOLUME = _this.calculateVolume(event.clientX);
                    _this.setVolume(VOLUME);
                    volume_changing_1 = false;
                }
            });
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
    MagnificientVideoPlayer.prototype.getVideoPlayer = function () {
        return this.videoPlayer;
    };
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
    MagnificientVideoPlayer.prototype.calculateTimelineProgress = function (clientX) {
        var TIMELINE_RECT = this.timeline.getBoundingClientRect();
        var LEFT = TIMELINE_RECT.left;
        var WIDTH = TIMELINE_RECT.width;
        var PROGRESS = (100 / WIDTH) * (clientX - LEFT) / 100;
        var TIME = this.videoPlayer.duration * PROGRESS;
        return TIME;
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
    MagnificientVideoPlayer.prototype.calculateVolume = function (clientX) {
        if (this.displaySoundControls && this.volume !== undefined) {
            var VOLUME_RECT = this.volume.getBoundingClientRect();
            var LEFT = VOLUME_RECT.left;
            var WIDTH = VOLUME_RECT.width;
            var VOLUME = (100 / WIDTH) * (clientX - LEFT) / 100;
            return VOLUME;
        }
        else {
            return 0;
        }
    };
    MagnificientVideoPlayer.prototype.setVolume = function (volume) {
        if (this.displaySoundControls && this.volume !== undefined) {
            if (volume > 1) {
                volume = volume / 100;
            }
            if (volume < 0) {
                volume = 0;
            }
            var EVENT = new CustomEvent("MVPVolumeUpdate", { detail: volume });
            this.videoPlayer.dispatchEvent(EVENT);
            this.volume.value = volume;
            this.videoPlayer.volume = volume;
        }
    };
    MagnificientVideoPlayer.prototype.pause = function () {
        if (!this.videoPlayer.paused) {
            this.videoPlayer.pause();
            this.container.classList.remove("playing");
            if (this.pauseButton === this.playButton) {
                this.pauseButton.classList.remove("pause");
                this.playButton.classList.add("play");
            }
            else {
                this.pauseButton.hidden = true;
                this.playButton.hidden = false;
            }
            return true;
        }
        return false;
    };
    MagnificientVideoPlayer.prototype.play = function () {
        var _this = this;
        if (this.videoPlayer.paused) {
            this.videoPlayer.play()
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
                return true;
            })
                .catch(function (error) {
                console.debug(error);
            });
        }
        return false;
    };
    MagnificientVideoPlayer.prototype.togglePlay = function () {
        if (this.videoPlayer.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    };
    return MagnificientVideoPlayer;
}());
