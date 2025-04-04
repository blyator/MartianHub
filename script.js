const myKey = "t3SZ3enb1lEYV5PlxcJgyj5KgO4cqVb0P5hnoVol";
const URL = {
  APOD: `https://api.nasa.gov/planetary/apod?api_key=${myKey}`,
  MARS_PHOTOS: (rover) =>
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=1000&api_key=${myKey}`,
};

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function switchTab(tabId) {
  const navLinks = document.querySelectorAll(".nav-link");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  [navLinks, tabButtons].forEach((elements) =>
    elements.forEach((el) =>
      el.classList.toggle("active", el.dataset.tab === tabId)
    )
  );
  tabPanes.forEach((pane) =>
    pane.classList.toggle("active", pane.id === `${tabId}-tab`)
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  [...navLinks, ...tabButtons].forEach((element) => {
    element.addEventListener("click", (e) => {
      e.preventDefault?.();
      const tabId = element.dataset.tab;
      switchTab(tabId);
      history.pushState(null, "", `#${tabId}`);
    });
  });

  document
    .getElementById("mars-search-btn")
    .addEventListener("click", fetchMarsImages);
  document.querySelector(".nav-brand").addEventListener("click", () => {
    switchTab("apod");
    history.pushState(null, "", "#apod");
  });
  fetchAPOD();
  favouritePics();
  hamburgerMenu();
  setupModal();

  switchTab(window.location.hash.slice(1) || "apod");
});

async function fetchAPOD() {
  const apodContent = document.getElementById("apod-content");
  showLoading(apodContent);
  try {
    const data = await (await fetch(URL.APOD)).json();
    displayAPOD(data);
  } catch (error) {
    showError(apodContent, error.message);
  }
}

async function fetchMarsImages() {
  const marsContent = document.getElementById("mars-content");
  showLoading(marsContent);
  try {
    const rover = document.getElementById("rover-select").value;
    const { photos } = await (await fetch(URL.MARS_PHOTOS(rover))).json();
    marsContent.innerHTML = photos?.length
      ? generateMars(photos)
      : '<div class="empty-state">No images found for this rover.</div>';
  } catch (error) {
    showError(marsContent, error.message);
  }
}

function favouritePics() {
  const content = document.querySelector(".favorites-content");
  content.innerHTML = favorites.length
    ? genfavouritePics()
    : '<div class="empty-state"><p>Like some pictures to see them here ❤️ 🌅</p></div>';
}

function toggleFavorite(imageUrl, type, data) {
  const index = favorites.findIndex(
    (item) => item.url === imageUrl || item.img_src === imageUrl
  );
  index === -1 ? favorites.push(data) : favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  favouritePics();

  const likeBtn = event.target.closest(".like-btn");
  likeBtn.classList.toggle("liked");
}

function deleteFavorite(index) {
  const imageUrl = favorites[index].url || favorites[index].img_src;
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  favouritePics();

  const originalLikeBtn = document.querySelector(
    `button[onclick*="${imageUrl}"].like-btn`
  );
  if (originalLikeBtn) {
    originalLikeBtn.classList.remove("liked");
    originalLikeBtn.textContent = "🤍";
  }
}

function downloadPic(imageUrl, title) {
  const button = event.currentTarget;
  const originalContent = button.innerHTML;
  button.innerHTML = `
    <svg class="svgIcon" viewBox="0 0 384 512">
      <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
    </svg>
    <div class="icon2"></div>
  `;
  button.disabled = true;
  window.open(imageUrl, "_blank");
  setTimeout(() => {
    button.innerHTML = originalContent;
    button.disabled = false;
  }, 1000);
}

function hamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("show");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("show");
    });
  });

  // Close menu when clicking anywhere else on the page
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("show")) {
      hamburger.classList.remove("active");
      navLinks.classList.remove("show");
    }
  });

  // Prevent clicks inside the menu from closing it
  navLinks.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function showLoading(element) {
  element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

function showError(element, message) {
  element.innerHTML = `<div class="error">Error: ${message}</div>`;
}

const isLiked = (imageUrl) =>
  favorites.some((item) => item.url === imageUrl || item.img_src === imageUrl);

function displayAPOD(data) {
  const apodContent = document.getElementById("apod-content");
  const isVideo = data.media_type === "video";

  apodContent.innerHTML = `
    <div class="apod-container">
      <div class="apod-media">
        ${
          isVideo
            ? `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`
            : `<img src="${data.url}" alt="${data.title}" onclick="expandImage(this.src)" style="cursor: pointer;">`
        }
      </div>
      <div class="apod-content">
        <h2>${data.title}</h2>
        <p>${data.explanation}</p>
        <div class="action-buttons">
          <button onclick="downloadPic('${data.url}', 'apod-${
    data.date
  }')" class="Btn">
            <svg class="svgIcon" viewBox="0 0 384 512">
              <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
            </svg>
            <div class="icon2"></div>
            <span class="tooltip"></span>
          </button>
          <button onclick="toggleFavorite('${
            data.url
          }', 'apod', ${JSON.stringify(data).replace(/"/g, "&quot;")})" 
            class="like-btn ${isLiked(data.url) ? "liked" : ""}">
            <svg class="heart-icon" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function expandImage(imgSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("expandedImage");
  if (!modal || !modalImg) return;

  modalImg.src = imgSrc;
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  if (modal) {
    modal.classList.remove("show");
  }
}

function setupModal() {
  const modal = document.getElementById("imageModal");
  const closeBtn = document.querySelector(".close");

  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }

  if (modal) {
    modal.onclick = function (event) {
      if (event.target === modal) {
        closeModal();
      }
    };
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

function generateMars(photos) {
  return `
    <div class="image-grid">
      ${photos
        .map(
          (photo) => `
        <div class="image-card">
          <img src="${
            photo.img_src
          }" alt="Mars Rover Photo" onclick="expandImage(this.src)">
          <div class="image-info">
            <div class="action-buttons">
              <button onclick="downloadPic('${photo.img_src}', 'mars-${
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
                <svg class="heart-icon" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
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
    </div>`;
}

function genfavouritePics() {
  return `
    <div class="favorites-grid">
      ${favorites
        .map(
          (item, index) => `
        <div class="favorite-card">
          <img src="${item.url || item.img_src}" alt="${
            item.title || "Mars Rover Photo"
          }" onclick="expandImage(this.src)">
          <div class="favorite-info">
            <p>${
              item.title || `${item.rover?.name} Rover - ${item.earth_date}`
            }</p>
            <div class="action-buttons">
              <button onclick="downloadPic('${item.url || item.img_src}', '${
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
    </div>`;
}
