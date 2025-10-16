import { firebaseAuth } from './FirebaseInstances.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';

/** Selector string used to get the email input through querySelector. */
const emailSelector = 'input[name="email-user"]';

/** Selector string used to get the password input through querySelector. */
const passwordSelector = 'input[type="password"]';

/** Intended redirect URL after successful authentication. */
const redirectTarget = 'home.html';

/**
 * Initialize event listeners after document finishes loading
 */
function loginButtonInit() {

    /** Frame containing the login elements */
    const loginWindow = document.querySelector('#login-frame');

    /** Auth button SVG */
    const authButton = document.querySelector('svg#login-button');

    /** Button fill element in the button SVG */
    const getStartedButtonFill = authButton.querySelector('#layer4');

    /** Text for the auth button since it floats over the fill */
    const getStartedButtonText = authButton.querySelector('text');

    /** Container that covers the close button for the login window */
    const loginCloseButton = loginWindow.querySelector('#login-close');

    // Removing these on init so they can be defined in the HTML
    document.body.removeChild(loginWindow);

    // Linking the click handler for the text to the click handler for the fill
    getStartedButtonFill.onclick = loginButtonHandler.bind(null, loginWindow);
    getStartedButtonText.onclick = function(){

        let event = new MouseEvent('click', {
            view: window,
            bubbles: true
        });
        getStartedButtonFill.dispatchEvent(event);
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

/**
 * Changes the text located in the login-message div
 * @param {String} message The displayed message.
 * @param {Boolean?} isError True changes text color to red. Defaults to true.
 */
function changeLoginMessage(message, isError) {
    if (arguments.length < 2) {
        isError = true;
    }

    let messageContainer = document.querySelector('#login-message');

    if (isError) {
        messageContainer.style.color = 'red';
    } else {
        messageContainer.style.color = 'black';
    }

    messageContainer.textContent = message;

}

/**
 * Event handler to attach to the sign up button.
 * @param {Element} loginForm HTML element with the form tag name
 */
function signUpHandler(loginForm, redirectArg) {

    /** Change window location to the desired landing. */
    let redirect = user => {
        window.location.href = (redirectArg) ? redirectArg : redirectTarget;
    };
    
    // Only do null checking here, let firebase return the error message
    if (loginForm && loginForm.tagName == 'FORM') {
        let emailInput = loginForm.querySelector('input[type="text"]');
        let passwordInput = loginForm.querySelector('input[type="password"]');

        if (emailInput && passwordInput) {
            createUserWithEmailAndPassword(
                firebaseAuth,
                emailInput.value,
                passwordInput.value
            ).then(redirect)
            .catch(changeLoginMessage);
        }
    }    
}

/**
 * Event handler to attach to the login button.
 * @param {String} emailOrUser User login name.
 * @param {String} password User password
 * @param {String?} redirectUrl Optional. Defaults to home.html
 */
function loginHandler(emailOrUser, password, redirectUrl) {

    /** Redirect to the desired home page after sucessful sign on. */
    let redirect = (user) => {
        window.location.href = (redirectUrl) ? redirectUrl: redirectTarget;
    }

    signInWithEmailAndPassword(firebaseAuth, emailOrUser, password)
        .then(redirect)
        .catch(changeLoginMessage);
}

// Things to execute
document.addEventListener('DOMContentLoaded', loginButtonInit);