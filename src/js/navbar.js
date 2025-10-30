console.log("navbar module loaded");
// Temporarily disable Firebase auth imports to test rendering
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../firebaseConfig.js";
// import { logoutUser } from "../authentication.js";

class SiteNavbar extends HTMLElement {
  constructor() {
    super();
    this.renderNavbar();
    this.renderAuthControls();
  }

  renderNavbar() {
    this.innerHTML = `
      <!-- Navbar: single source of truth -->
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Calendar</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse show" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item"><a class="nav-link active" aria-current="page" href="home.html">Home</a></li>
              <li class="nav-item"><a class="nav-link" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg></a></li>
              <li class="nav-item"><a class="nav-link" href="index.html">Sign out</a></li>
            </ul>
          </div>
          <div id="authControls" class="d-flex align-items-center"></div>
        </div>
      </nav>
    `;
    // debug: confirm nodes and force visibility
    console.log(
      "site-navbar rendered, navbarNav:",
      this.querySelector("#navbarNav")
    );
    const navList = this.querySelector("#navbarNav .navbar-nav");
    if (navList) {
      // force visible and high contrast for debugging
      navList.style.setProperty("display", "flex", "important");
      navList.style.setProperty("visibility", "visible", "important");
      navList.style.setProperty("opacity", "1", "important");
      navList.querySelectorAll(".nav-link").forEach((a) => {
        a.style.setProperty("color", "#000", "important");
      });
    }
  }
  renderAuthControls() {
    const authControls = this.querySelector("#authControls");
    if (!authControls) return;
  }
}

customElements.define("site-navbar", SiteNavbar);

document.querySelector("site-navbar").innerHTML;
