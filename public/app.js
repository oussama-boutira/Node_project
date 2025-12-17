// Modal Functions
function showModal(message, type = "info", title = "") {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const header = document.getElementById("modal-header");
    const icon = document.getElementById("modal-icon");
    const titleEl = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");
    const footer = document.getElementById("modal-footer");

    // Set icon and title based on type
    const config = {
      success: { icon: "✓", title: title || "Success", class: "success" },
      error: { icon: "✕", title: title || "Error", class: "error" },
      warning: { icon: "⚠", title: title || "Warning", class: "warning" },
      info: { icon: "ℹ", title: title || "Information", class: "" },
    };

    const modalConfig = config[type] || config.info;

    // Reset header classes
    header.className = "modal-header";
    if (modalConfig.class) {
      header.classList.add(modalConfig.class);
    }

    icon.textContent = modalConfig.icon;
    titleEl.textContent = modalConfig.title;
    body.textContent = message;

    // Create OK button
    footer.innerHTML = "";
    const okBtn = document.createElement("button");
    okBtn.className = "modal-btn modal-btn-primary";
    okBtn.textContent = "OK";
    okBtn.onclick = () => {
      closeModal();
      resolve(true);
    };
    footer.appendChild(okBtn);

    // Show modal
    overlay.classList.add("active");

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(true);
      }
    };

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeModal();
        resolve(true);
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  });
}

function showConfirm(message, title = "Confirm Action") {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const header = document.getElementById("modal-header");
    const icon = document.getElementById("modal-icon");
    const titleEl = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");
    const footer = document.getElementById("modal-footer");

    // Set warning style
    header.className = "modal-header warning";
    icon.textContent = "?";
    titleEl.textContent = title;
    body.textContent = message;

    // Create buttons
    footer.innerHTML = "";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "modal-btn modal-btn-secondary";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => {
      closeModal();
      resolve(false);
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "modal-btn modal-btn-danger";
    confirmBtn.textContent = "Confirm";
    confirmBtn.onclick = () => {
      closeModal();
      resolve(true);
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    // Show modal
    overlay.classList.add("active");

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(false);
      }
    };

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeModal();
        resolve(false);
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  });
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.remove("active");
}

// Form Modal Functions
function openFormModal(
  mode,
  id = null,
  typeName = "",
  color = "",
  imageUrl = ""
) {
  const overlay = document.getElementById("form-modal-overlay");
  const title = document.getElementById("form-modal-title");
  const submitBtn = document.getElementById("form-submit-btn");
  const editIdInput = document.getElementById("edit_cat_id");

  if (mode === "add") {
    title.textContent = "Add New Cat";
    submitBtn.textContent = "Add Cat";
    editIdInput.value = "";
    document.getElementById("new_type_name").value = "";
    document.getElementById("new_color").value = "";
    document.getElementById("new_image_url").value = "";
  } else if (mode === "edit") {
    title.textContent = `Edit Cat (ID: ${id})`;
    submitBtn.textContent = "Update Cat";
    editIdInput.value = id;
    document.getElementById("new_type_name").value = typeName;
    document.getElementById("new_color").value = color;
    document.getElementById("new_image_url").value = imageUrl;
  }

  overlay.classList.add("active");

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeFormModal();
    }
  };

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeFormModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

function closeFormModal() {
  const overlay = document.getElementById("form-modal-overlay");
  overlay.classList.remove("active");
}

// ==================== AUTH STATE MANAGEMENT ====================

const API_BASE = "http://localhost:5000";
const API_URL = `${API_BASE}/cats`;
const gallery = document.getElementById("cat-gallery");

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem("authToken");
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Logout function
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  window.location.reload();
}

// Get auth headers for API requests
function getAuthHeaders() {
  const token = getAuthToken();
  if (token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
  return { "Content-Type": "application/json" };
}

// Render navbar based on auth state
function renderNavbar() {
  const navMenu = document.getElementById("nav-menu");
  if (!navMenu) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    const initial = user?.username?.charAt(0).toUpperCase() || "U";
    navMenu.innerHTML = `
      <div class="user-menu">
        <div class="user-info">
          <div class="user-avatar">${initial}</div>
          <span class="user-name">${user?.username || "User"}</span>
        </div>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    navMenu.innerHTML = `
      <a href="login.html" class="nav-btn nav-btn-outline">Login</a>
      <a href="register.html" class="nav-btn nav-btn-primary">Register</a>
    `;
  }
}

// Update UI based on auth state
function updateAuthUI() {
  const heroAction = document.getElementById("hero-action");
  const guestPrompt = document.getElementById("guest-prompt");

  if (heroAction && guestPrompt) {
    if (isLoggedIn()) {
      heroAction.style.display = "block";
      guestPrompt.style.display = "none";
    } else {
      heroAction.style.display = "none";
      guestPrompt.style.display = "block";
    }
  }
}

// Store all cats data for filtering
let allCatsData = [];

// Pagination variables
let currentPage = 1;
let pageSize = 8;
let filteredCatsData = [];

// --- FETCH (GET) ---
async function fetchCats() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    gallery.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
        <div style="font-size: 5rem; margin-bottom: 20px;">🔒</div>
        <h2 style="color: var(--text-primary); margin-bottom: 15px;">Login Required</h2>
        <p style="color: var(--text-secondary); margin-bottom: 25px;">Please login or register to view our adorable cat collection</p>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <a href="login.html" style="
            padding: 14px 35px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
          ">Login</a>
          <a href="register.html" style="
            padding: 14px 35px;
            border: 2px solid #667eea;
            color: #667eea;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
          ">Register</a>
        </div>
      </div>
    `;
    // Hide pagination and search for guests
    document.getElementById("pagination-container").style.display = "none";
    document.querySelector(".search-filter-container").style.display = "none";
    return;
  }

  // Show search filter for logged-in users
  document.querySelector(".search-filter-container").style.display = "block";

  try {
    // Show skeleton loading cards
    gallery.innerHTML = createSkeletonCards(6);

    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.reload();
      return;
    }

    const cats = await response.json();
    allCatsData = cats; // Store for filtering
    filteredCatsData = cats; // Initialize filtered data
    populateColorFilter(cats);
    renderWithPagination();
  } catch (error) {
    console.error("Error fetching cats:", error);
    gallery.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: #f5576c; margin-bottom: 10px;">Connection Error</h2>
        <p style="color: var(--text-secondary);">Could not connect to the server. Is the backend running?</p>
        <button onclick="fetchCats()" style="
          margin-top: 20px;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        ">🔄 Try Again</button>
      </div>
    `;
  }
}

// Create skeleton loading cards
function createSkeletonCards(count) {
  let skeletons = "";
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="cat-card" style="opacity: 0.7;">
        <div class="skeleton" style="height: 220px;"></div>
        <div style="padding: 22px;">
          <div class="skeleton" style="height: 28px; width: 70%; margin-bottom: 12px;"></div>
          <div class="skeleton" style="height: 18px; width: 40%; margin-bottom: 18px;"></div>
          <div style="display: flex; gap: 10px;">
            <div class="skeleton" style="height: 42px; flex: 1; border-radius: 16px;"></div>
            <div class="skeleton" style="height: 42px; flex: 1; border-radius: 16px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  return skeletons;
}

// --- SEARCH AND FILTER ---
function populateColorFilter(cats) {
  const colorFilter = document.getElementById("color-filter");
  const colors = [...new Set(cats.map((cat) => cat.color).filter(Boolean))];

  // Keep "All Colors" option and add unique colors
  colorFilter.innerHTML = '<option value="">All Colors</option>';
  colors.sort().forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorFilter.appendChild(option);
  });
}

function applyFilters() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();
  const selectedColor = document.getElementById("color-filter").value;

  filteredCatsData = allCatsData;

  // Filter by search term (matches type_name/breed)
  if (searchTerm) {
    filteredCatsData = filteredCatsData.filter((cat) =>
      (cat.type_name || "").toLowerCase().includes(searchTerm)
    );
  }

  // Filter by color
  if (selectedColor) {
    filteredCatsData = filteredCatsData.filter(
      (cat) => cat.color === selectedColor
    );
  }

  currentPage = 1; // Reset to first page when filters change
  renderWithPagination();
}

function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("color-filter").value = "";
  filteredCatsData = allCatsData;
  currentPage = 1;
  renderWithPagination();
}

function updateResultsCount(shown, total) {
  const resultsDiv = document.getElementById("results-count");
  if (shown === total) {
    resultsDiv.textContent = `Showing all ${total} cats`;
  } else {
    resultsDiv.textContent = `Showing ${shown} of ${total} cats`;
  }
}

// --- PAGINATION FUNCTIONS ---
function renderWithPagination() {
  const totalItems = filteredCatsData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCats = filteredCatsData.slice(startIndex, endIndex);

  renderCats(paginatedCats);
  renderPaginationControls(totalPages);

  // Update results count with pagination info
  const resultsDiv = document.getElementById("results-count");
  if (totalItems === 0) {
    resultsDiv.textContent = "No cats found";
    document.getElementById("pagination-container").style.display = "none";
  } else {
    const start = totalItems > 0 ? startIndex + 1 : 0;
    const end = Math.min(endIndex, totalItems);
    if (filteredCatsData.length === allCatsData.length) {
      resultsDiv.textContent = `Showing ${start}-${end} of ${totalItems} cats`;
    } else {
      resultsDiv.textContent = `Showing ${start}-${end} of ${totalItems} filtered cats (${allCatsData.length} total)`;
    }
    document.getElementById("pagination-container").style.display =
      totalPages > 1 ? "flex" : "none";
  }
}

function renderPaginationControls(totalPages) {
  const controlsDiv = document.getElementById("pagination-controls");
  const infoDiv = document.getElementById("pagination-info");

  infoDiv.textContent = `Page ${currentPage} of ${totalPages}`;
  controlsDiv.innerHTML = "";

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "« Prev";
  prevBtn.className = "page-btn";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => goToPage(currentPage - 1);
  controlsDiv.appendChild(prevBtn);

  // Page number buttons (show max 5 pages)
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage < maxPageButtons - 1) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  // First page button
  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.textContent = "1";
    firstBtn.className = "page-btn";
    firstBtn.onclick = () => goToPage(1);
    controlsDiv.appendChild(firstBtn);

    if (startPage > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "0 8px";
      dots.style.color = "#667eea";
      controlsDiv.appendChild(dots);
    }
  }

  // Page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = "page-btn" + (i === currentPage ? " active" : "");
    pageBtn.onclick = () => goToPage(i);
    controlsDiv.appendChild(pageBtn);
  }

  // Last page button
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.style.padding = "0 8px";
      dots.style.color = "#667eea";
      controlsDiv.appendChild(dots);
    }

    const lastBtn = document.createElement("button");
    lastBtn.textContent = totalPages;
    lastBtn.className = "page-btn";
    lastBtn.onclick = () => goToPage(totalPages);
    controlsDiv.appendChild(lastBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next »";
  nextBtn.className = "page-btn";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => goToPage(currentPage + 1);
  controlsDiv.appendChild(nextBtn);
}

function goToPage(page) {
  currentPage = page;
  renderWithPagination();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changePageSize() {
  pageSize = parseInt(document.getElementById("page-size").value);
  currentPage = 1;
  renderWithPagination();
}

function renderCats(cats) {
  gallery.innerHTML = "";
  if (cats.length === 0) {
    gallery.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🐱</div>
        <h2 style="color: var(--text-primary); margin-bottom: 10px;">No Cats Found</h2>
        <p style="color: var(--text-secondary);">Add your first adorable cat to the gallery!</p>
      </div>
    `;
    return;
  }

  cats.forEach((cat, index) => {
    const card = document.createElement("div");
    card.className = "cat-card";
    card.setAttribute("data-id", cat.id);
    card.style.animationDelay = `${index * 0.05}s`;
    card.style.animation = "fadeInUp 0.5s ease forwards";
    card.style.opacity = "0";

    // Use a default image if image_url is missing or null
    const imageUrl =
      cat.image_url ||
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop";

    // Escape single quotes for onclick attributes
    const escapedTypeName = (cat.type_name || "").replace(/'/g, "\\'");
    const escapedColor = (cat.color || "").replace(/'/g, "\\'");
    const escapedImageUrl = (cat.image_url || "").replace(/'/g, "\\'");

    // Generate a color for the badge based on the cat's color
    const colorBadgeStyle = getColorBadgeStyle(cat.color);

    card.innerHTML = `
      <div style="position: relative; overflow: hidden;">
        <img src="${imageUrl}" alt="${cat.type_name}" loading="lazy" 
             onerror="this.src='https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop'">
        <span style="
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          ${colorBadgeStyle}
        ">${cat.color || "Unknown"}</span>
      </div>
      <div class="cat-info">
        <h3>${cat.type_name || "Unknown Breed"}</h3>
        <p><strong>ID:</strong> #${cat.id}</p>
        <p><strong>Color:</strong> ${cat.color || "Unknown"}</p>
        ${
          isLoggedIn()
            ? `
        <div class="actions">
          <button class="edit-btn" onclick="startEdit(${cat.id}, '${escapedTypeName}', '${escapedColor}', '${escapedImageUrl}')">Edit</button>
          <button class="delete-btn" onclick="deleteCat(${cat.id})">Delete</button>
        </div>
        `
            : ""
        }
      </div>
    `;
    gallery.appendChild(card);
  });

  // Add the fadeInUp animation style if not already present
  if (!document.getElementById("card-animations")) {
    const style = document.createElement("style");
    style.id = "card-animations";
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Helper function to generate color badge styles
function getColorBadgeStyle(color) {
  if (!color) return "background: rgba(100, 100, 100, 0.8); color: white;";

  const colorLower = color.toLowerCase();
  const colorMap = {
    white: "background: rgba(255, 255, 255, 0.9); color: #333;",
    black: "background: rgba(30, 30, 30, 0.9); color: white;",
    orange:
      "background: linear-gradient(135deg, #ff9a56, #ff6b35); color: white;",
    gray: "background: rgba(128, 128, 128, 0.9); color: white;",
    grey: "background: rgba(128, 128, 128, 0.9); color: white;",
    brown:
      "background: linear-gradient(135deg, #8B4513, #A0522D); color: white;",
    ginger:
      "background: linear-gradient(135deg, #ff8c42, #ff6b35); color: white;",
    tabby:
      "background: linear-gradient(135deg, #d4a574, #c4956a); color: white;",
    calico:
      "background: linear-gradient(135deg, #ff9a56, #ffd93d, #333); color: white;",
    blue: "background: linear-gradient(135deg, #667eea, #764ba2); color: white;",
  };

  for (const [key, style] of Object.entries(colorMap)) {
    if (colorLower.includes(key)) {
      return style;
    }
  }

  return "background: linear-gradient(135deg, #667eea, #764ba2); color: white;";
}

// --- ADD (POST) ---
async function addCat() {
  const type_name = document.getElementById("new_type_name").value;
  const color = document.getElementById("new_color").value;
  const image_url = document.getElementById("new_image_url").value;

  if (!type_name || !color || !image_url) {
    showModal(
      "All fields must be filled out to add a new cat.",
      "warning",
      "Missing Fields"
    );
    return;
  }

  // Check if logged in
  if (!isLoggedIn()) {
    showModal("Please login to add cats.", "warning", "Login Required");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ type_name, color, image_url }),
    });

    if (response.ok) {
      // Clear the form and refresh the gallery
      document.getElementById("new_type_name").value = "";
      document.getElementById("new_color").value = "";
      document.getElementById("new_image_url").value = "";
      closeFormModal();
      fetchCats();
      showModal("Cat added successfully!", "success");
    } else {
      const errorData = await response.json();
      showModal("Failed to add cat: " + errorData.error, "error");
    }
  } catch (error) {
    console.error("Error adding cat:", error);
    showModal(
      "Could not connect to the API to add the cat.",
      "error",
      "Connection Error"
    );
  }
}

// --- DELETE ---
async function deleteCat(id) {
  const confirmed = await showConfirm(
    `Are you sure you want to delete Cat ID: ${id}? This action cannot be undone.`,
    "Delete Cat"
  );

  if (!confirmed) {
    return;
  }

  // Check if logged in
  if (!isLoggedIn()) {
    showModal("Please login to delete cats.", "warning", "Login Required");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      fetchCats(); // Refresh the gallery
      showModal(`Cat ID ${id} deleted successfully.`, "success", "Deleted");
    } else {
      const errorData = await response.json();
      showModal("Failed to delete cat: " + errorData.error, "error");
    }
  } catch (error) {
    console.error("Error deleting cat:", error);
    showModal(
      "Could not connect to the API to delete the cat.",
      "error",
      "Connection Error"
    );
  }
}

// --- EDIT (PUT) Logic ---

// Start editing - open form modal with cat data
function startEdit(id, typeName, color, imageUrl) {
  openFormModal("edit", id, typeName, color, imageUrl);
}

// Handle form submission - either add or update
function handleFormSubmit() {
  const editId = document.getElementById("edit_cat_id").value;
  if (editId) {
    updateCat(editId);
  } else {
    addCat();
  }
}

// Update an existing cat
async function updateCat(id) {
  const type_name = document.getElementById("new_type_name").value;
  const color = document.getElementById("new_color").value;
  const image_url = document.getElementById("new_image_url").value;

  if (!type_name || !color || !image_url) {
    showModal(
      "All fields must be filled out to update the cat.",
      "warning",
      "Missing Fields"
    );
    return;
  }

  const updates = { type_name, color, image_url };

  // Check if logged in
  if (!isLoggedIn()) {
    showModal("Please login to update cats.", "warning", "Login Required");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      closeFormModal(); // Close the form modal
      fetchCats(); // Refresh the gallery
      showModal(`Cat ID ${id} updated successfully!`, "success", "Updated");
    } else {
      const errorData = await response.json();
      showModal("Failed to update cat: " + errorData.error, "error");
    }
  } catch (error) {
    console.error("Error updating cat:", error);
    showModal(
      "Could not connect to the API to update the cat.",
      "error",
      "Connection Error"
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  updateAuthUI();
  fetchCats();
});
