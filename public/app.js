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

const API_URL = "http://localhost:5000/cats";
const gallery = document.getElementById("cat-gallery");

// Store all cats data for filtering
let allCatsData = [];

// Pagination variables
let currentPage = 1;
let pageSize = 9;
let filteredCatsData = [];

// --- FETCH (GET) ---
async function fetchCats() {
  try {
    gallery.innerHTML = "<h2>Loading Cats...</h2>";
    const response = await fetch(API_URL);
    const cats = await response.json();
    allCatsData = cats; // Store for filtering
    filteredCatsData = cats; // Initialize filtered data
    populateColorFilter(cats);
    renderWithPagination();
  } catch (error) {
    console.error("Error fetching cats:", error);
    gallery.innerHTML = "<h2>Error loading cats. Is the backend running?</h2>";
  }
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
    gallery.innerHTML = "<h2>No cats found. Add one!</h2>";
    return;
  }

  cats.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "cat-card";
    card.setAttribute("data-id", cat.id);

    // Use a default image if image_url is missing or null
    const imageUrl =
      cat.image_url || "https://via.placeholder.com/250x200?text=No+Image";

    // Escape single quotes for onclick attributes
    const escapedTypeName = (cat.type_name || "").replace(/'/g, "\\'");
    const escapedColor = (cat.color || "").replace(/'/g, "\\'");
    const escapedImageUrl = (cat.image_url || "").replace(/'/g, "\\'");

    card.innerHTML = `
      <img src="${imageUrl}" alt="${cat.type_name}">
      <div class="cat-info">
        <h3>${cat.type_name}</h3>
        <p><strong>ID:</strong> ${cat.id}</p>
        <p><strong>Color:</strong> ${cat.color}</p>
        <div class="actions">
          <button class="edit-btn" onclick="startEdit(${cat.id}, '${escapedTypeName}', '${escapedColor}', '${escapedImageUrl}')">Edit</button>
          <button class="delete-btn" onclick="deleteCat(${cat.id})">Delete</button>
        </div>
      </div>
    `;
    gallery.appendChild(card);
  });
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

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
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

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

document.addEventListener("DOMContentLoaded", fetchCats);
