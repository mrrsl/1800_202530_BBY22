
/**
 * Initialize event listeners after document finishes loading
 */
function loginButtonInit() {

    // Frame containing the login elements
    const loginWindow = document.querySelector('#login-frame');

    // Auth button SVG
    const authButton = document.querySelector('svg#login-button');

    // Button fill element in the button SVG
    const authButtonFill = authButton.querySelector('#layer4');

    // Text for the auth button since it floats over the fill
    const authButtonText = authButton.querySelector('text');

    // Container that covers the close button for the login window
    const loginCloseButton = loginWindow.querySelector('#login-close');

    // Remove during init so we can keep it on the HTML document
    document.body.removeChild(loginWindow);

    authButtonFill.onclick = loginButtonHandler.bind(null, loginWindow);
    authButtonText.onclick = function(){

        let event = new MouseEvent('click', {
            view: window,
            bubbles: true
        });
        authButtonFill.dispatchEvent(event);
    };
    loginCloseButton.onclick = loginCloseButtonHandler.bind(null, loginWindow);
}

/**
 * Event handler for login button on the hero banner.
 * @param {Element} loginFrame Frame holding elements for login items.
 * @returns
 */
function loginButtonHandler(loginFrame) {
    document.body.appendChild(loginFrame);
}

/**
 * Event handler for the close button on the login window.
 * @param {Element} loginFrame Frame holding elements for login items.
 * @returns 
 */
function loginCloseButtonHandler(loginFrame) {
    try {
        document.body.removeChild(loginFrame);
    } catch (e) {
        return 0;
    }
}

// Things to execute
document.addEventListener('DOMContentLoaded', loginButtonInit);