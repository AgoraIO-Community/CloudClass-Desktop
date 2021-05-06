/**
 * The entry point
 */

import App from './components/app'

window.addEventListener('load', () => {
    const app = new App(document.getElementById('app'))

    // A very simple component setup
    app.setupClassroom()

})