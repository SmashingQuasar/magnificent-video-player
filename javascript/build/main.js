"use strict";
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
