"use strict";

interface UserConfiguration
{
    container: HTMLElement;
    videoPlayer: HTMLVideoElement | undefined;
    playButton: HTMLButtonElement | undefined;
    pauseButton: HTMLButtonElement | undefined;
    timeline: HTMLProgressElement | undefined;
    displayTime: boolean | undefined;
    timeContainer: HTMLElement | undefined;
    displaySoundControls: boolean | undefined;
    muteButton: HTMLButtonElement | undefined;
    volume: HTMLProgressElement | undefined;
}

interface SmashingConfiguration // Will be used in the future.
{
    container: HTMLElement;
    playButton: HTMLButtonElement;
    pauseButton: HTMLButtonElement;
    timeline: HTMLProgressElement;
}

function prettyfyTime(time: number): string
{
    let seconds: number;
    let minutes: number;
    let hours: number;

    hours = Math.floor(time / 3600);

    time -= hours * 3600;

    minutes = Math.floor(time / 60);

    time -= minutes * 60;

    seconds = Math.floor(time);

    const PRETTY_MINUTES = `${minutes}`.padStart(2, "0");
    const PRETTY_SECONDS = `${seconds}`.padStart(2, "0");

    return `${hours}:${PRETTY_MINUTES}:${PRETTY_SECONDS}`;
}

class MagnificientVideoPlayer
{
    private container: HTMLElement;
    private videoPlayer: HTMLVideoElement;
    private playButton: HTMLButtonElement;
    private pauseButton: HTMLButtonElement;
    private timeline: HTMLProgressElement;
    private displayTime: boolean;
    private timeContainer: HTMLElement | undefined = undefined;
    private displaySoundControls: boolean;
    private muteButton: HTMLButtonElement | undefined;
    private volume: HTMLProgressElement | undefined;

    constructor(configuration: UserConfiguration)
    {
        // Handling the main player container.

        if (configuration.container === undefined)
        {
            throw new SyntaxError("MVP: Invalid configuration object: No container property.");
        }
        this.container = configuration.container;

        // Handling the video element.

        if (configuration.videoPlayer === undefined) // Default case where no video player is specified in configuration.
        {
            const VIDEO_PLAYER: HTMLVideoElement | null = this.container.querySelector("video"); // Trying to fetch the video player.

            if (VIDEO_PLAYER === null) // Case where there is no <video> element in the container.
            {
                throw new ReferenceError("MVP: No <video> element provided.");
            }

            this.videoPlayer = VIDEO_PLAYER;
        }
        else // If a video player is specified then we try to use it.
        {
            if (configuration.videoPlayer instanceof HTMLVideoElement) // Normal case where the video player is semantically correct.
            {
                this.videoPlayer = configuration.videoPlayer;
            }
            else
            {
                throw new TypeError("MVP: videoPlayer property MUST be an instance of HTMLVideoElement."); // Semantic issue.
            }
        }

        // Handling play button.

        if (configuration.playButton === undefined) // Default plugin setup, no specific button is provided.
        {
            const PLAY_BUTTON: HTMLButtonElement | null = this.container.querySelector(`button[data-mvp*="play"]`); // Trying to fetch the play button.

            if (PLAY_BUTTON === null) // Case where there is no play button in the DOM nor configuration.
            {
                throw new ReferenceError(`MVP: No playButton property specified in configuration and couldn't find a button[data-mvp*="play"] in the DOM.`);
            }
            this.playButton = PLAY_BUTTON;
        }
        else
        {
            if (configuration.playButton instanceof HTMLButtonElement) // PlayButton must always be of HTMLButtonElement for semantic reasons.
            {
                this.playButton = configuration.playButton;
            }
            else
            {
                throw new TypeError("MVP: Play button must be an instance of HTMLButtonElement.");
            }
        }

        // Adding required CSS class.

        if (!this.playButton.classList.contains("play"))
        {
            this.playButton.classList.add("play");
        }

        // Handling pause button.

        if (configuration.pauseButton === undefined) // Default plugin setup, no specific button is provided.
        {
            const PAUSE_BUTTON: HTMLButtonElement | null = this.container.querySelector(`button[data-mvp*="pause"]`); // Trying to fetch the pause button.

            if (PAUSE_BUTTON === null) // Case where there is no pause button in the DOM nor configuration.
            {
                throw new ReferenceError(`MVP: No pauseButton property specified in configuration and couldn't find a button[data-mvp*="pause"] in the DOM.`);
            }
            this.pauseButton = PAUSE_BUTTON;
        }
        else
        {
            if (configuration.pauseButton instanceof HTMLButtonElement) // pauseButton must always be of HTMLButtonElement for semantic reasons.
            {
                this.pauseButton = configuration.pauseButton;
            }
            else
            {
                throw new TypeError("MVP: Pause button must be an instance of HTMLButtonElement.");
            }
        }

        // Adding required CSS class.

        if (
                (!(this.playButton === this.pauseButton) || !this.videoPlayer.paused)
            &&
                !this.pauseButton.classList.contains("pause")
            )
        {
            this.pauseButton.classList.add("pause");
        }
        
        // Adding accessibility attributes.

        if (this.playButton === this.pauseButton && !this.pauseButton.hasAttribute("role"))
        {
            this.pauseButton.setAttribute("role", "switch");
        }
        
        if (this.playButton === this.pauseButton)
        {

        }

        // Play triggering event listener.

        this.playButton.addEventListener(
            "click",
            (event): void =>
            {
                if (this.videoPlayer.paused)
                {
                    this.play();
                    event.stopImmediatePropagation();
                }
            }
        );

        // Pause triggering event listener.

        this.pauseButton.addEventListener(
            "click",
            (event): void =>
            {
                if (!this.videoPlayer.paused)
                {
                    this.pause();
                    event.stopImmediatePropagation();
                }
            }
        );
        this.videoPlayer.addEventListener(
            "click",
            () =>
            {
                this.togglePlay();
            }
        );

        // Handling timeline

        if (configuration.timeline === undefined) // Default case where no progress element is provided in configuration.
        {
            const TIMELINE: HTMLElement | null = this.container.querySelector(`progress[data-mvp="timeline"]`);

            if (TIMELINE === null)
            {
                throw new ReferenceError("MVP: No timeline HTMLProgressElement provided in configuration and unable to find it in DOM.")
            }
            else
            {
                if (TIMELINE instanceof HTMLProgressElement)
                {
                    this.timeline = TIMELINE;
                }
                else
                {
                    throw new TypeError("MVP: timeline property MUST be an instance of HTMLProgressElement."); // Case impossible to reach.
                }
            }
        }
        else
        {
            if (configuration.timeline instanceof HTMLProgressElement)
            {
                this.timeline = configuration.timeline;
            }
            else
            {
                throw new TypeError("MVP: timeline property MUST be an instance of HTMLProgressElement.");
            }
        }

        window.setInterval(
            (t) =>
            {
                if (this.videoPlayer.readyState > 0)
                {
                    this.timeline.max = this.videoPlayer.duration; // Setting the max value of the timeline to the duration of the video makes it easier to handle later.
                    this.timeline.value = this.videoPlayer.currentTime; // Setting the value to the currentTime of the videoPlayer. Will most likely always set it to 0.
                    clearInterval(t);
                }
            },
            500
        );

        // Handling time display.

        if (configuration.displayTime === undefined || configuration.displayTime === false)
        {
            this.displayTime = false;
        }
        else
        {
            this.displayTime = true;

            if (configuration.timeContainer === undefined)
            {
                const TIME_CONTAINER: HTMLElement | null = this.container.querySelector(`span[data-mvp="time"]`);

                if (TIME_CONTAINER === null)
                {
                    throw new ReferenceError("MVP: No timeContainer property provided in configuration and couldn't find it in DOM.")
                }

                this.timeContainer = TIME_CONTAINER;
            }
            else
            {
                if (configuration.timeContainer instanceof HTMLElement)
                {
                    this.timeContainer = configuration.timeContainer;
                }
                else
                {
                    throw new TypeError("MVP: timeContainer property MUST be an instance of HTMLElement.");
                }
            }
            
            window.setInterval(
                (t: number) =>
                {
                    if (this.videoPlayer.readyState > 0)
                    {
                        this.updateTime();
                        clearInterval(t);
                    }
                }
            );
        }

        let time_changing = false;

        this.timeline.addEventListener(
            "mousedown",
            (): void =>
            {
                time_changing = true;
            }
        );

        this.timeline.addEventListener(
            "mousemove",
            (event): void =>
            {
                if (time_changing)
                {
                    const TIME: number = this.calculateTimelineProgress(event.clientX);
                    this.updateTime(TIME);
                }
            }
        );

        this.timeline.addEventListener(
            "mouseup",
            (event): void =>
            {
                if (time_changing)
                {
                    const TIME: number = this.calculateTimelineProgress(event.clientX);
                    this.updateTime(TIME);
                    time_changing = false;
                }
            }
        );

        this.timeline.addEventListener(
            "mouseleave",
            (event): void =>
            {
                if (time_changing)
                {
                    const TIME: number = this.calculateTimelineProgress(event.clientX);
                    this.updateTime(TIME);
                    time_changing = false;
                }
            }
        );

        // Handling timeupdate videoPlayer event.

        this.videoPlayer.addEventListener(
            "timeupdate",
            () =>
            {
                this.timeline.value = this.videoPlayer.currentTime;

                const PROGRESS: number = 100 / this.videoPlayer.duration * this.videoPlayer.currentTime / 100;

                const EVENT: Event = new CustomEvent("MVPProgressUpdate", {detail: PROGRESS});
                this.videoPlayer.dispatchEvent(EVENT);

                this.updateTime();
            }
        );

        // Handling sound controls.

        if (configuration.displaySoundControls === undefined)
        {
            this.displaySoundControls = false;
            this.volume = undefined;
        }
        else
        {
            this.displaySoundControls = true;

            // Handling mute button.

            if (configuration.muteButton === undefined)
            {
                const MUTE_BUTTON: HTMLElement | null = this.container.querySelector(`button[data-mvp="mute"]`);

                if (MUTE_BUTTON === null)
                {
                    throw new ReferenceError("MVP: No muteButton property provided in configuration and unable to find it in DOM.");
                }
                else
                {
                    if (MUTE_BUTTON instanceof HTMLButtonElement)
                    {
                        this.muteButton = MUTE_BUTTON;
                    }
                    else
                    {
                        throw new TypeError("MVP: muteButton property MUST be an instance of HTMLButtonElement.");                        
                    }
                }
            }
            else
            {
                if (configuration.muteButton instanceof HTMLButtonElement)
                {
                    this.muteButton = configuration.muteButton;
                }
                else
                {
                    throw new TypeError("MVP: muteButton property MUST be an instance of HTMLButtonElement.");
                }
            }

            // Handling volume.

            if (configuration.volume === undefined)
            {
                const VOLUME: HTMLProgressElement | null = this.container.querySelector(`progress[data-mvp="volume"]`);

                if (VOLUME === null)
                {
                    throw new ReferenceError("MVP: No volume property provided in configuration and unable to find it in DOM.");
                }
                else
                {
                    if (VOLUME instanceof HTMLProgressElement)
                    {
                        this.volume = VOLUME;
                    }
                    else
                    {
                        throw new TypeError("MVP: volume property MUST be an instance of HTMLButtonElement.");                        
                    }
                }
            }
            else
            {
                if (configuration.volume instanceof HTMLButtonElement)
                {
                    this.volume = configuration.volume;
                }
                else
                {
                    throw new TypeError("MVP: volume property MUST be an instance of HTMLButtonElement.");
                }
            }

            this.volume.max = 1;
            this.volume.value = 0.5;

            // Handling volume event listeners. TO REFACTOR.

            let volume_changing = false;

            this.volume.addEventListener(
                "mousedown",
                () =>
                {
                    if (this.displaySoundControls && this.volume !== undefined)
                    {
                        volume_changing = true;
                    }
                }
            );

            this.volume.addEventListener(
                "mousemove",
                (event) =>
                {
                    if (this.displaySoundControls && this.volume !== undefined && volume_changing)
                    {
                        const VOLUME: number = this.calculateVolume(event.clientX);
                    
                        this.setVolume(VOLUME);
                    }
                }
            );

            this.volume.addEventListener(
                "mouseup",
                (event) =>
                {
                    if (this.displaySoundControls && this.volume !== undefined && volume_changing)
                    {
                        const VOLUME: number = this.calculateVolume(event.clientX);
                    
                        this.setVolume(VOLUME);

                        volume_changing = false;
                    }
                }
            );

            this.volume.addEventListener(
                "mouseleave",
                (event) =>
                {
                    if (this.displaySoundControls && this.volume !== undefined && volume_changing)
                    {
                        const VOLUME: number = this.calculateVolume(event.clientX);
                    
                        this.setVolume(VOLUME);

                        volume_changing = false;
                    }
                }
            );

            // Handling accessibility.

            if (!this.muteButton.hasAttribute("role"))
            {
                this.muteButton.setAttribute("role", "switch");
            }

            // Handling mute button class.

            this.muteButton.classList.add("mute");

            this.muteButton.addEventListener(
                "click",
                () =>
                {
                    if (this.videoPlayer.muted)
                    {
                        this.videoPlayer.muted = false;
                        this.container.classList.remove("muted");
                    }
                    else
                    {
                        this.videoPlayer.muted = true;
                        this.container.classList.add("muted");
                    }
                }  
            );




        }

    }

    /**
     * getVideoPlayer
     */
    public getVideoPlayer(): HTMLVideoElement
    {
        return this.videoPlayer;
    }

    /**
     * getPlayButton
     */
    public getPlayButton(): HTMLButtonElement
    {
        return this.playButton;
    }

    /**
     * getPausebutton
     */
    public getPausebutton(): HTMLButtonElement
    {
        return this.playButton;
    }

    /**
     * getCurrentTime
     */
    public getCurrentTime(): number
    {
        return this.videoPlayer.currentTime;
    }

    /**
     * getDuration
     */
    public getDuration(): number
    {
        return this.videoPlayer.duration;    
    }

    /**
     * getPrettyCurrentTime
     */
    public getPrettyCurrentTime(): string
    {
        return prettyfyTime(this.videoPlayer.currentTime);
    }

    /**
     * getPrettyDuration
     */
    public getPrettyDuration(): string
    {
        return prettyfyTime(this.videoPlayer.duration);    
    }

    private calculateTimelineProgress(clientX: number): number
    {
        const TIMELINE_RECT: ClientRect | DOMRect = this.timeline.getBoundingClientRect();
        const LEFT: number = TIMELINE_RECT.left;
        const WIDTH: number = TIMELINE_RECT.width;
        const PROGRESS: number = (100 / WIDTH) * (clientX - LEFT) / 100;

        const TIME: number = this.videoPlayer.duration * PROGRESS;

        return TIME;
    }

    /**
     * updateTime
     */
    public updateTime(time: number | undefined = undefined): void
    {
        if (time !== undefined)
        {
            this.videoPlayer.currentTime = time;
        }
        if (this.displayTime && this.timeContainer !== undefined)
        {
            this.timeContainer.innerHTML = `${this.getPrettyCurrentTime()} / ${this.getPrettyDuration()}`;
        }
    }

    /**
     * getDisplaySoundControls
     */
    public getDisplaySoundControls(): boolean
    {
        return this.displaySoundControls;
    }

    private calculateVolume(clientX: number): number
    {
    
        if (this.displaySoundControls && this.volume !== undefined)
        {
            const VOLUME_RECT: ClientRect | DOMRect = this.volume.getBoundingClientRect();
            const LEFT: number = VOLUME_RECT.left;
            const WIDTH: number = VOLUME_RECT.width;
            const VOLUME: number = (100 / WIDTH) * (clientX - LEFT) / 100;
    
            return VOLUME;
        }
        else
        {
            return 0;
        }
    }

    /**
     * setVolume
     */
    public setVolume(volume: number): void
    {
        if (this.displaySoundControls && this.volume !== undefined)
        {

            if (volume > 1)
            {
                volume = volume / 100;
            }
            if (volume < 0)
            {
                volume = 0;
            }

            const EVENT: CustomEvent = new CustomEvent("MVPVolumeUpdate", { detail: volume });
            this.videoPlayer.dispatchEvent(EVENT);
            
            this.volume.value = volume;
            this.videoPlayer.volume = volume;
        }
    }

    /**
     * pause
     */
    public pause(): boolean
    {
        if (!this.videoPlayer.paused) // Should only triggers if the player isn't active.
        {
            this.videoPlayer.pause(); // This method does not return anything usable.
            this.container.classList.remove("playing"); // For CSS purpose.

            if (this.pauseButton === this.playButton)
            {
                this.pauseButton.classList.remove("pause");
                this.playButton.classList.add("play");
            }
            else
            {
                this.pauseButton.hidden = true;
                this.playButton.hidden = false;
            }
            return true;
        }
        return false;
    }

    /**
     * play
     */
    public play(): boolean
    {
        if (this.videoPlayer.paused) // Should only triggers if the player isn't active.
        {
            this.videoPlayer.play(); // This returns a promise.

            this.container.classList.add("playing"); // For CSS purpose.

            if (this.playButton === this.pauseButton) // Handling the case where the button is a switch.
            {
                this.playButton.classList.remove("play");
                this.pauseButton.classList.add("pause");
            }
            else
            {
                this.playButton.hidden = true;
                this.pauseButton.hidden = false;
            }

            return true;

        }
        return false;
    }

    /**
     * togglePlay
     */
    public togglePlay(): void
    {
        if (this.videoPlayer.paused)
        {
            this.play();
        }
        else
        {
            this.pause();
        }
    }

}