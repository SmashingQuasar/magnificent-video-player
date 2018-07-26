"use strict";

interface Configuration
{
    container: HTMLElement;
    playButton: HTMLButtonElement|null;
    pauseButton: HTMLButtonElement|null;
}

class MagnificientVideoPlayer
{
    private container: HTMLElement;
    private playButton: HTMLButtonElement;
    private pauseButton: HTMLButtonElement;

    constructor(configuration: Configuration|HTMLElement)
    {

        // Checking input configuration.

        if (configuration instanceof HTMLElement) // Case of configuration being a node.
        {
            this.container = configuration;

            // Handling playButton fetching.
            
            let node_buffer = this.container.querySelector(`[data-mvp*="play"]`);
            if (node_buffer instanceof HTMLButtonElement)
            {
                this.playButton = node_buffer;
            }

        }
        else // Case of a configuration object (supposedly);
        {

            // Handling the main player container.

            if (configuration.container === undefined)
            {
                throw new SyntaxError("MVP: Invalid configuration object: No container property.");
            }
            this.container = configuration.container;

            

        }
    }

}

document.addEventListener(
    "DOMContentLoaded",
    () => 
    {
        
        const button: HTMLButtonElement|null = document.querySelector(`[data-custom-player*=play]`);

        console.log(button);

        if (button)
        {
            button.addEventListener(
                "click",
                () => 
                {
                    if (button.classList.contains("play"))
                    {
                        button.classList.remove("play");
                        button.classList.add("pause");
                    }
                    else
                    {
                        button.classList.add("play");
                        button.classList.remove("pause");
                    }
                }
            );
        }
    }
)