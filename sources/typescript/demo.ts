"use strict";

window.addEventListener(
    "load",
    () =>
    {
        const CONTAINER: HTMLElement | null = document.querySelector(`figure[data-mvp="container"]`);

        if (CONTAINER === null)
        {
            throw new ReferenceError("MVP Demo: Impossible to find container.");
        }
        
        new MagnificientVideoPlayer(
            {
                container: CONTAINER,
                videoPlayer: undefined,
                playButton: undefined,
                pauseButton: undefined,
                timeline: undefined
            }  
        );
    }
);