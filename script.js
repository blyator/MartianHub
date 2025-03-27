const myKey = "t3SZ3enb1lEYV5PlxcJgyj5KgO4cqVb0P5hnoVol";
const URL = {
  APOD: `https://api.nasa.gov/planetary/apod?api_key=${myKey}`,
  MARS_PHOTOS: (rover) =>
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=1000&api_key=${myKey}`,
};

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  setupTabSwitching();
  setupMarsSearch();
  fetchAPOD();
  loadFavorites();
  setupHamburgerMenu();
}

function setupTabSwitching() {
  const navLinks = document.querySelectorAll(".nav-link");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  function switchTab(tabId) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.tab === tabId);
    });

    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    tabPanes.forEach((pane) => {
      pane.classList.toggle("active", pane.id === `${tabId}-tab`);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.dataset.tab;
      switchTab(tabId);
      history.pushState(null, "", `#${tabId}`);
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
      history.pushState(null, "", `#${tabId}`);
    });
  });

  const hash = window.location.hash.slice(1);
  if (hash) {
    switchTab(hash);
  }
}

async function fetchAPOD() {
  const apodContent = document.getElementById("apod-content");
  showLoading(apodContent);

  try {
    const response = await fetch(URL.APOD);
    const data = await response.json();

    const mediaContent =
      data.media_type === "image"
        ? `<img src="${data.url}" alt="${data.title}">`
        : `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`;

    apodContent.innerHTML = `
      <div class="apod-container">
        <div class="apod-content">
          <h2>${data.title}</h2>
          <p>${data.explanation}</p>
          <button onclick="toggleFavorite('${
            data.url
          }', 'apod', ${JSON.stringify(data).replace(/"/g, "&quot;")})" 
            class="like-btn ${isLiked(data.url) ? "liked" : ""}">
            ${isLiked(data.url) ? "🧡 " : "🤍"}
          </button>
        </div>
        <div class="apod-media">
          ${mediaContent}
        </div>
      </div>
    `;
  } catch (error) {
    showError(apodContent, error.message);
  }
}

function setupMarsSearch() {
  document
    .getElementById("mars-search-btn")
    .addEventListener("click", fetchMarsImages);
}

async function fetchMarsImages() {
  const rover = document.getElementById("rover-select").value;
  const marsContent = document.getElementById("mars-content");

  showLoading(marsContent);

  try {
    const response = await fetch(URL.MARS_PHOTOS(rover));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      marsContent.innerHTML =
        '<div class="empty-state">No images found for this rover.</div>';
      return;
    }

    marsContent.innerHTML = `
      <div class="image-grid">
        ${data.photos
          .map(
            (photo) => `
          <div class="image-card">
            <img src="${photo.img_src}" alt="Mars Rover Photo">
            <div class="image-info">
              <div class="action-buttons">
                <button onclick="downloadImage('${photo.img_src}', 'mars-${
              photo.rover.name
            }-${photo.earth_date}')" class="Btn">
                  <svg class="svgIcon" viewBox="0 0 384 512">
                    <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
                  </svg>
                  <div class="icon2"></div>
                  <span class="tooltip"></span>
                </button>
                <button onclick="toggleFavorite('${
                  photo.img_src
                }', 'mars', ${JSON.stringify(photo).replace(/"/g, "&quot;")})" 
                  class="like-btn ${isLiked(photo.img_src) ? "liked" : ""}">
                  ${isLiked(photo.img_src) ? "🧡 " : "🤍"}
                </button>
              </div>
              <p>Rover: ${photo.rover.name}</p>
              <p>Date: ${photo.earth_date}</p>
              <p>Camera: ${photo.camera.full_name}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    console.error("Error fetching Mars images:", error);
    showError(marsContent, error.message);
  }
}

function loadFavorites() {
  updateFavoritesDisplay();
}

function addToFavorites(item) {
  if (
    !favorites.find(
      (fav) => fav.url === item.url || fav.img_src === item.img_src
    )
  ) {
    favorites.push(item);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesDisplay();
  }
}

function removeFromFavorites(index) {
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesDisplay();
}

function updateFavoritesDisplay() {
  const favoritesContent = document.querySelector(".favorites-content");

  if (favorites.length === 0) {
    favoritesContent.innerHTML = `
      <div class="empty-state">
        <p>Like some pictures to see them here 🧡 🌅</p>
      </div>`;
    return;
  }

  favoritesContent.innerHTML = `
    <div class="favorites-grid">
      ${favorites
        .map(
          (item, index) => `
        <div class="favorite-card">
          <img src="${item.url || item.img_src}" alt="${
            item.title || "Mars Rover Photo"
          }">
          <div class="favorite-info">
            <p>${
              item.title || `${item.rover?.name} Rover - ${item.earth_date}`
            }</p>
            <div class="action-buttons">
              <button onclick="downloadImage('${item.url || item.img_src}', '${
            item.title || `mars-${item.rover?.name}-${item.earth_date}`
          }')" class="Btn">
                <svg class="svgIcon" viewBox="0 0 384 512">
                  <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
                </svg>
                <div class="icon2"></div>
                <span class="tooltip"></span>
              </button>
              <button onclick="deleteFavorite(${index})" class="delete-btn">
                <svg class="svgIcon" viewBox="0 0 448 512">
                  <path class="bin-top" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7z"/>
                  <path d="M416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

async function downloadImage(imageUrl, title) {
  const button = event.currentTarget;
  const originalContent = button.innerHTML;

  button.innerHTML = `
    <svg class="svgIcon" viewBox="0 0 384 512">
      <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
    </svg>
    <div class="icon2"></div>
    <span class="tooltip">Opening...</span>
  `;
  button.disabled = true;
  window.open(imageUrl, "_blank");
  setTimeout(() => {
    button.innerHTML = originalContent;
    button.disabled = false;
  }, 1000);
}

function deleteFavorite(index) {
  const imageUrl = favorites[index].url || favorites[index].img_src;

  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  updateFavoritesDisplay();
  const originalLikeBtn = document.querySelector(
    `button[onclick*="${imageUrl}"].like-btn`
  );
  if (originalLikeBtn) {
    originalLikeBtn.classList.remove("liked");
    originalLikeBtn.textContent = "🤍";
  }
}

function showLoading(element) {
  element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

function showError(element, message) {
  element.innerHTML = `<div class="error">Error: ${message}</div>`;
}
function isLiked(imageUrl) {
  return favorites.some(
    (item) => item.url === imageUrl || item.img_src === imageUrl
  );
}

function toggleFavorite(imageUrl, type, data) {
  const index = favorites.findIndex(
    (item) => item.url === imageUrl || item.img_src === imageUrl
  );

  if (index === -1) {
    favorites.push(data);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesDisplay();

  const likeBtn = event.target;
  likeBtn.classList.toggle("liked");
  likeBtn.textContent = isLiked(imageUrl) ? "🧡 " : "🤍";
}

function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("show");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("show");
    });
  });
}
