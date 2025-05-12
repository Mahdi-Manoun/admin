const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#btn-menu");
const closeBtn = document.querySelector("#btn-close");
const themeThoggler = document.querySelector(".theme-toggler");
const asideOverview = document.querySelector(".aside-overview");

const toggleMenu = () => {
  document.body.classList.toggle("show-menu");
  document.body.classList.toggle("fixed-scroll");
};
menuBtn.addEventListener("click", () => {
  toggleMenu();
});

closeBtn.addEventListener("click", () => {
  toggleMenu();
});
asideOverview.addEventListener("click", () => {
  toggleMenu();
});

themeThoggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");

  themeThoggler.querySelector("span:nth-child(1)").classList.toggle("actived");
  themeThoggler.querySelector("span:nth-child(2)").classList.toggle("actived");
});

document.getElementById("closeFormBtn").addEventListener("click", function() {
  document.getElementById("productForm").style.display = "none";
});

document.getElementById("addProductBtn").addEventListener("click", async function () {
  const formContainer = document.getElementById("productForm");
  formContainer.style.display = "block";
  document.getElementById("submitProductBtn").style.display = "inline-block";
  document.getElementById("updateProductBtn").style.display = "none";

  const [categoriesRes, colorsRes] = await Promise.all([
    fetch("http://localhost:5000/api/categories"),
    fetch("http://localhost:5000/api/colors"),
  ]);

  const categories = (await categoriesRes.json()).data || [];
  const colors = (await colorsRes.json()).data || [];

  // Populate categories
  const categorySelect = document.getElementById("category_id");
  categorySelect.innerHTML = '<option value="">Select Category</option>';
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });

  
  const inventoryContainer = document.getElementById("inventoryContainer");
  inventoryContainer.innerHTML = "";
  const addInventoryBtn = document.createElement("button");
  addInventoryBtn.type = "button";
  addInventoryBtn.textContent = "Add Inventory Entry";
  addInventoryBtn.onclick = () => addInventoryBlock(colors);
  inventoryContainer.appendChild(addInventoryBtn);
  addInventoryBlock(colors); // Add one by default

  
  const imagesContainer = document.getElementById("imagesContainer");
  imagesContainer.innerHTML = "";

  const primaryLabel = document.createElement("h5");
  primaryLabel.textContent = "Primary Image";
  imagesContainer.appendChild(primaryLabel);

  const primaryInputLabel = document.createElement("label");
  primaryInputLabel.textContent = "URL:";
  imagesContainer.appendChild(primaryInputLabel);

  const primaryInput = document.createElement("input");
  primaryInput.type = "file";
  primaryInput.id = "primary_image_url";
  imagesContainer.appendChild(primaryInput);
  imagesContainer.appendChild(document.createElement("br"));

  const additionalLabel = document.createElement("h5");
  additionalLabel.textContent = "Additional Images";
  imagesContainer.appendChild(additionalLabel);

  const additionalImagesDiv = document.createElement("div");
  additionalImagesDiv.id = "additionalImages";
  imagesContainer.appendChild(additionalImagesDiv);

  const firstAdditionalInput = document.createElement("input");
  firstAdditionalInput.type = "file";
  firstAdditionalInput.className = "additional_image_url";
  firstAdditionalInput.placeholder = "Image URL";
  additionalImagesDiv.appendChild(firstAdditionalInput);
  additionalImagesDiv.appendChild(document.createElement("br"));

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "Add Another Image";
  addButton.onclick = addAdditionalImageInput;
  imagesContainer.appendChild(addButton);

  
  document.getElementById("submitProductBtn").onclick = async function () {
    const categoryValue = document.getElementById("category_id").value;
    if (!categoryValue || isNaN(parseInt(categoryValue))) {
      alert("Please select a valid category.");
      return;
    }

    const product = {
      name: document.getElementById("name").value,
      price: parseFloat(document.getElementById("price").value),
      description: document.getElementById("description").value,
      category_id: parseInt(categoryValue),
      inventory: [],
      images: [],
    };

    const inventoryBlocks = document.querySelectorAll(".inventoryBlock");
    inventoryBlocks.forEach(block => {
      const color_id = parseInt(block.querySelector(".colorSelect").value);
     /*const quantity = parseInt(block.querySelector(".colorQuantity").value);*/
      const min_value = parseInt(block.querySelector(".min_value").value);
      const max_value = parseInt(block.querySelector(".max_value").value);
      const unit = block.querySelector(".unit").value;
      const age_quantity = parseInt(block.querySelector(".age_quantity").value);

      product.inventory.push({
        color_id,
       /* quantity,*/
        age_ranges: [{
          min_value,
          max_value,
          unit,
          quantity: age_quantity
        }]
      });
    });

    
    const primaryUrl = document.getElementById("primary_image_url").value;
    if (primaryUrl) {
      product.images.push({
        url: primaryUrl,
        is_primary: true,
      });
    }

    
    const additionalUrls = document.querySelectorAll(".additional_image_url");
    additionalUrls.forEach(input => {
      const url = input.value.trim();
      if (url) {
        product.images.push({ url, is_primary: false });
      }
    });

    const token = localStorage.getItem("authToken");
    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      alert("Product added!");
      loadProducts();
      formContainer.style.display = "none";
    } else {
      console.error(await res.text());
      alert("Error adding product");
    }
  };
});


function addAdditionalImageInput() {
  const container = document.getElementById("additionalImages");
  const input = document.createElement("input");
  input.type = "file";
  input.placeholder = "Image URL";
  input.className = "additional_image_url";
  container.appendChild(input);
  container.appendChild(document.createElement("br"));
}


/*function addInventoryBlock(colors, inventoryItem = null) {
  const index = document.querySelectorAll(".inventoryBlock").length;
  const div = document.createElement("div");
  div.className = "inventoryBlock";
  div.style.border = "1px solid #ccc";
  div.style.padding = "10px";
  div.style.margin = "10px 0";

  const selectedColorId = inventoryItem?.color?.id || "";
  const quantity = inventoryItem?.quantity || "";
 const ageRange = inventoryItem?.age_ranges?.[0] || {};

 const minValue = ageRange?.min_value ?? "";
  const maxValue = ageRange?.max_value ?? "";
  const unit = ageRange?.unit ?? "";
  const ageQuantity = ageRange?.quantity ?? "";


  div.innerHTML = `
    <h5>Inventory ${index + 1}</h5>
    <label>Color:</label>
   <select class="colorSelect">
      ${colors.map(c => `<option value="${c.id}" ${c.id == selectedColorId ? "selected" : ""}>${c.name}</option>`).join("")}
    </select><br>


    <label>Total Quantity:</label>
     <input type="number" class="colorQuantity" value="${quantity}"><br>

    <div class="ageRanges">
      <h6>Age Range</h6>
    <label>Min:</label><input type="number" class="min_value" value="${minValue}"><br>
      <label>Max:</label><input type="number" class="max_value" value="${maxValue}"><br>
      <label>Unit:</label><input type="text" class="unit" value="${unit}"><br>
      <label>Quantity:</label><input type="number" class="age_quantity" value="${ageQuantity}"><br>
    </div>
  `;
  document.getElementById("inventoryContainer").appendChild(div);
}*/
function bindUpdateButton(productId) {
  const formContainer = document.getElementById("productForm");
  formContainer.style.display = "block";
  document.getElementById("submitProductBtn").style.display = "inline-block";
  document.getElementById("updateProductBtn").style.display = "none";

  updateBtn.onclick = async function () {
    
    const product = {
      name: document.getElementById("name").value,
      price: parseFloat(document.getElementById("price").value),
      description: document.getElementById("description").value,
      category_id: parseInt(document.getElementById("category_id").value),
      inventory: [],
      images: [],
    };

    
    const inventoryInputs = document.querySelectorAll("[id^=color_id_]");
    inventoryInputs.forEach((_, index) => {
      const colorId = parseInt(document.getElementById(`color_id_${index}`).value);
      const quantity = parseInt(document.getElementById(`quantity_${index}`).value);
      const min = parseInt(document.getElementById(`min_value_${index}`).value || 0);
      const max = parseInt(document.getElementById(`max_value_${index}`).value || 0);
      const unit = document.getElementById(`unit_${index}`).value;
      product.inventory.push({
        color_id: colorId,
        quantity,
        age_range: { min, max, unit },
      });
    });

    
    const primaryUrl = document.getElementById("primary_image_url").value.trim();
    if (primaryUrl) {
      product.images.push({
        url: primaryUrl,
        is_primary: true,
      });
    }

    const additionalUrls = document.querySelectorAll(".additional_image_url");
    additionalUrls.forEach(input => {
      const url = input.value.trim();
      if (url) {
        product.images.push({ url, is_primary: false });
      }
    });

    const token = localStorage.getItem("authToken");
    const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      alert("Product updated!");
      loadProducts();
      document.getElementById("productForm").style.display = "none";
    } else {
      alert("Update failed");
      console.error(await res.text());
    }
  };
}

async function deleteProduct(productId) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error deleting product:", response.status, errorText);
      alert("Failed to delete the product.");
      return;
    }

    
    const productRow = document.getElementById(`product_${productId}`);
    if (productRow) {
      productRow.remove();
    }

    
    const remainingRows = document.getElementById("productListContainer").children;
    if (remainingRows.length === 0) {
      document.getElementById("productTable").style.display = "none";
    }

    alert("Product deleted successfully.");
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("An error occurred while deleting the product.");
  }
}

 


 function bindUpdateButton(productId) {
  const updateBtn = document.getElementById("updateProductBtn");
  updateBtn.style.display = "inline-block";
  document.getElementById("submitProductBtn").style.display = "none";

  updateBtn.onclick = async function () {
    const product = {
      name: document.getElementById("name").value,
      price: parseFloat(document.getElementById("price").value),
      description: document.getElementById("description").value,
      category_id: parseInt(document.getElementById("category_id").value),
      inventory: [],
      images: [],
    };

    const inventoryBlocks = document.querySelectorAll(".inventoryBlock");

   for (let block of inventoryBlocks) {
  const color_id = parseInt(block.querySelector(".colorSelect").value);
  const age_range_id = parseInt(block.querySelector(".age_range_select").value); // Add a dropdown for age ranges
  const quantity = parseInt(block.querySelector(".age_quantity").value);

  if (!isNaN(age_range_id)) {
    product.inventory.push({
      color_id,
      quantity,
      age_range_id
    });
  } else {
    console.error("Missing or invalid age_range_id");
  }
}

    const imageInputs = document.querySelectorAll("[id^=url_]");
    imageInputs.forEach((input, index) => {
      const url = input.value.trim();
      if (url) {
        product.images.push({ url, is_primary: index === 0 });
      }
    });

    const token = localStorage.getItem("authToken");
    console.log("Final update payload:", JSON.stringify(product, null, 2));

    const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      alert("Product updated!");
      currentProduct = product;
      loadProducts();
      document.getElementById("productForm").style.display = "none";
    } else {
      alert("Update failed");
      console.error(await res.text());
    }
  };
}


async function updateProduct(productId) {
  const token = localStorage.getItem("authToken");

  try {
    // Step 1: Fetch product data
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch product details.");
      return;
    }

    const result = await response.json();
    const product = result.data;
    console.log("Product data:", product);

    currentProduct = product;

    // Step 2: Populate categories
    const categoriesRes = await fetch("http://localhost:5000/api/categories");
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || categoriesJson;

    const categorySelect = document.getElementById("category_id");
    categorySelect.innerHTML = "";

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = product.category.id;

    // Step 3: Populate inventory
    const colorsRes = await fetch("http://localhost:5000/api/colors");
    const colorsJson = await colorsRes.json();
    const colors = colorsJson.data || [];

    const ageRangesRes = await fetch("http://localhost:5000/api/age_ranges");
    const ageRanges = (await ageRangesRes.json()).data;

    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.innerHTML = "";

    product.inventory.forEach((item) => {
      console.log("Adding inventory item:", item);
      addInventoryBlock(colors, item, ageRanges);
    });

    // Step 4: Populate images
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = "";

    if (product.images.length > 0) {
      product.images.forEach((img, index) => {
        const isPrimary = img.is_primary;
        imagesContainer.innerHTML += `
          <h5>${isPrimary ? "Primary Image" : `Image ${index + 1}`}</h5>
          <img src="${img.url}" width="100"><br>
          <input type="hidden" id="url_${index}" value="${img.url}"><br>
        `;

        if (!isPrimary) {
          imagesContainer.innerHTML += `
            <button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button><br>
          `;
        }
      });
    } else {
      imagesContainer.innerHTML = `
        <p>No images found for this product.</p>
      `;
    }

    imagesContainer.innerHTML += `
      <h5>Add New Image</h5>
      <label for="add_image_url">Image URL:</label>
      <input type="file" id="add_image_url" name="add_image_url"><br>
      <button type="button" onclick="addImage(${product.id})">Add Image</button>
    `;

    // Step 5: Populate main form fields
    document.getElementById("name").value = product.name || "";
    document.getElementById("price").value = product.price || 0;
    document.getElementById("description").value = product.description || "";

    // Step 6: Show form and bind update
    document.getElementById("productForm").style.display = "block";
    document.getElementById("submitProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";

    bindUpdateButton(productId);

  } catch (err) {
    console.error("Error fetching product details:", err);
    alert("An error occurred while fetching product details.");
  }
}

/*async function updateProduct(productId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch product details.");
      return;
    }

    const result = await response.json();
    console.log("Full API response:", result);

    if (!result || !result.data) {
      console.error("No product data found or incorrect response structure.");
      alert("Product data is missing or malformed.");
      return;
    }

    const product = result.data;
    console.log("Product data:", product);

    currentProduct = product;

    const inventory = Array.isArray(product.inventory) ? product.inventory : [];
    const images = Array.isArray(product.images) ? product.images : [];

    // Step 1: Fetch and populate categories
    const categoriesRes = await fetch("http://localhost:5000/api/categories");
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || categoriesJson;

    const categorySelect = document.getElementById("category_id");
    categorySelect.innerHTML = ""; // Clear existing categories

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = product.category.id;

    // Step 2: Populate colors for inventory blocks
    const colorsRes = await fetch("http://localhost:5000/api/colors");
    const colorsJson = await colorsRes.json();
    const colors = colorsJson.data || [];

    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.innerHTML = ""; // Clear previous inventory blocks

    // Populate inventory blocks with color and age range data
    product.inventory.forEach((item, index) => {
      const { color_id, age_range } = item;
      const { min, max, unit } = age_range || {};

      // Create and add inventory block with color and age range values
      addInventoryBlock(colors, item);

      // After adding the inventory block, populate age range values
      const inventoryBlock = inventoryContainer.querySelector(`#inventoryBlock_${index}`);
      if (inventoryBlock) {
        const colorSelect = inventoryBlock.querySelector(".colorSelect");
        const minValueInput = inventoryBlock.querySelector(".min_value");
        const maxValueInput = inventoryBlock.querySelector(".max_value");
        const unitInput = inventoryBlock.querySelector(".unit");

        // Set color
        if (colorSelect) colorSelect.value = color_id;  // Set color select value

        // Set age range values
        if (minValueInput) minValueInput.value = min || "";   // Set min age value
        if (maxValueInput) maxValueInput.value = max || "";   // Set max age value
        if (unitInput) unitInput.value = unit || "";           // Set age unit
      }
    });

    // Step 3: Populate images
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = ""; // Clear existing images

    if (product.images.length > 0) {
      product.images.forEach((img, index) => {
        const isPrimary = img.is_primary;
        
        // Add image with 'Remove Image' button only if it's not primary
        imagesContainer.innerHTML += `
          <h5>${isPrimary ? "Primary Image" : `Image ${index + 1}`}</h5>
          <img src="${img.url}" width="100"><br>
          <input type="hidden" id="url_${index}" value="${img.url}"><br>
        `;

        // Only show remove button for non-primary images
        if (!isPrimary) {
          const removeButtonHTML = `
            <button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button><br>
          `;
          imagesContainer.innerHTML += removeButtonHTML;
        }
      });
    } else {
      imagesContainer.innerHTML = `
        <p>No images found for this product.</p>
        <label for="add_image_url">Add an image URL:</label>
        <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
        <button onclick="addImage(${product.id})">Add Image</button>
      `;
    }

    // Always show "Add New Image" section after the images list
    imagesContainer.innerHTML += `
      <h5>Add New Image</h5>
      <label for="add_image_url">Image URL:</label>
      <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
      <button type="button" onclick="addImage(${product.id})">Add Image</button>
    `;

    // Step 4: Populate main form fields
    document.getElementById("name").value = product.name || "";
    document.getElementById("price").value = product.price || 0;
    document.getElementById("description").value = product.description || "";

    // Show the form and update the button for update
    document.getElementById("productForm").style.display = "block";
    document.getElementById("submitProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";
    bindUpdateButton(productId);
  } catch (err) {
    console.error("Error fetching product details:", err);
    alert("An error occurred while fetching product details.");
  }
}*/
/*async function updateProduct(productId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch product details.");
      return;
    }

    const result = await response.json();
    console.log("Full API response:", result);

    if (!result || !result.data) {
      console.error("No product data found or incorrect response structure.");
      alert("Product data is missing or malformed.");
      return;
    }

    const product = result.data;
    console.log("Product data:", product);

    currentProduct = product;

    const inventory = Array.isArray(product.inventory) ? product.inventory : [];
    const images = Array.isArray(product.images) ? product.images : [];

    // Step 1: Fetch and populate categories
    const categoriesRes = await fetch("http://localhost:5000/api/categories");
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || categoriesJson;

    const categorySelect = document.getElementById("category_id");
    categorySelect.innerHTML = ""; // Clear existing categories

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = product.category.id;

    // Step 2: Populate colors for inventory blocks
    const colorsRes = await fetch("http://localhost:5000/api/colors");
    const colorsJson = await colorsRes.json();
    const colors = colorsJson.data || [];

    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.innerHTML = ""; // Clear previous inventory blocks

    // Populate inventory blocks with color and age range data
    product.inventory.forEach((item, index) => {
      const { color_id, age_range } = item;
      const { min, max, unit } = age_range || {};

      // Create and add inventory block with color and age range values
      addInventoryBlock(colors, item);

      // After adding the inventory block, populate age range values
      const inventoryBlock = inventoryContainer.querySelector(`#inventoryBlock_${index}`);
      if (inventoryBlock) {
        const colorSelect = inventoryBlock.querySelector(".colorSelect");
        const minValueInput = inventoryBlock.querySelector(".min_value");
        const maxValueInput = inventoryBlock.querySelector(".max_value");
        const unitInput = inventoryBlock.querySelector(".unit");

        // Set color
        if (colorSelect) colorSelect.value = color_id;  // Set color select value

        // Set age range values
        if (minValueInput) minValueInput.value = min || "";   // Set min age value
        if (maxValueInput) maxValueInput.value = max || "";   // Set max age value
        if (unitInput) unitInput.value = unit || "";           // Set age unit
      }
    });

    // Step 3: Populate images
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = "";

    if (product.images.length > 0) {
      product.images.forEach((img, index) => {
        const isPrimary = img.is_primary;
        imagesContainer.innerHTML += `
          <h5>${isPrimary ? "Primary Image" : `Image ${index + 1}`}</h5>
          <img src="${img.url}" width="100"><br>
          <input type="hidden" id="url_${index}" value="${img.url}"><br>
          ${!isPrimary ? `<button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button><br>` : ""}
        `;

        // Add "Add Image" and "Remove Image" buttons (only for non-primary images)
        if (!isPrimary) {
          const addButtonHTML = `
            <button type="button" onclick="addImage(${product.id}, ${index})">Add Image</button>
          `;
          imagesContainer.innerHTML += addButtonHTML;

          const removeButtonHTML = `
            <button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button>
          `;
          imagesContainer.innerHTML += removeButtonHTML;
        }
      });
    } else {
      imagesContainer.innerHTML = `
        <p>No images found for this product.</p>
        <label for="add_image_url">Add an image URL:</label>
        <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
        <button onclick="addImage(${product.id})">Add Image</button>
      `;
    }

    // Always show "Add New Image" section after the images list
    imagesContainer.innerHTML += `
      <h5>Add New Image</h5>
      <label for="add_image_url">Image URL:</label>
      <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
      <button type="button" onclick="addImage(${product.id})">Add Image</button>
    `;

    // Step 4: Populate main form fields
    document.getElementById("name").value = product.name || "";
    document.getElementById("price").value = product.price || 0;
    document.getElementById("description").value = product.description || "";

    // Show the form and update the button for update
    document.getElementById("productForm").style.display = "block";
    document.getElementById("submitProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";
    bindUpdateButton(productId);
  } catch (err) {
    console.error("Error fetching product details:", err);
    alert("An error occurred while fetching product details.");
  }
}
*/

/*async function updateProduct(productId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch product details.");
      return;
    }

    const result = await response.json();
    console.log("Full API response:", result);

    if (!result || !result.data) {
      console.error("No product data found or incorrect response structure.");
      alert("Product data is missing or malformed.");
      return;
    }

    const product = result.data; 
    console.log("Product data:", product);

    currentProduct = product;

    const inventory = Array.isArray(product.inventory) ? product.inventory : [];
    const images = Array.isArray(product.images) ? product.images : [];

    // Step 1: Fetch and populate categories
    const categoriesRes = await fetch("http://localhost:5000/api/categories");
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || categoriesJson;

    const categorySelect = document.getElementById("category_id");
    categorySelect.innerHTML = ""; 

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = product.category.id;

    const colorsRes = await fetch("http://localhost:5000/api/colors");
    const colorsJson = await colorsRes.json();
    const colors = colorsJson.data || [];

    // Clear inventory container before rendering
    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.innerHTML = "";

    // Populate inventory with color and age range values
    product.inventory.forEach((item, index) => {
      const { color_id, age_range } = item;
      const { min, max, unit } = age_range || {};

      addInventoryBlock(colors, item);  // Render inventory block with color and age range

      // After rendering the inventory block, populate the age range and color inputs
      const inventoryBlock = inventoryContainer.querySelector(`#inventoryBlock_${index}`);
      if (inventoryBlock) {
        const colorSelect = inventoryBlock.querySelector(".colorSelect");
        if (colorSelect) {
          colorSelect.value = color_id;  // Set the color value
        }

        const minValueInput = inventoryBlock.querySelector(".min_value");
        const maxValueInput = inventoryBlock.querySelector(".max_value");
        const unitInput = inventoryBlock.querySelector(".unit");

        if (minValueInput) minValueInput.value = min || "";
        if (maxValueInput) maxValueInput.value = max || "";
        if (unitInput) unitInput.value = unit || "";
      }
    });

    // Step 3: Populate images
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = "";

    if (product.images.length > 0) {
      product.images.forEach((img, index) => {
        const isPrimary = img.is_primary;
        imagesContainer.innerHTML += `
          <h5>${isPrimary ? "Primary Image" : `Image ${index + 1}`}</h5>
          <img src="${img.url}" width="100"><br>
          <input type="hidden" id="url_${index}" value="${img.url}"><br>
          ${!isPrimary ? `<button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button><br>` : ""}
        `;

        // Add "Add Image" and "Remove Image" buttons (only for non-primary images)
        if (!isPrimary) {
          const addButtonHTML = `
            <button type="button" onclick="addImage(${product.id}, ${index})">Add Image</button>
          `;
          imagesContainer.innerHTML += addButtonHTML;

          const removeButtonHTML = `
            <button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button>
          `;
          imagesContainer.innerHTML += removeButtonHTML;
        }
      });
    } else {
      imagesContainer.innerHTML = `
        <p>No images found for this product.</p>
        <label for="add_image_url">Add an image URL:</label>
        <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
        <button onclick="addImage(${product.id})">Add Image</button>
      `;
    }

    // Add new image section
    imagesContainer.innerHTML += `
      <h5>Add New Image</h5>
      <label for="add_image_url">Image URL:</label>
      <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
      <button type="button" onclick="addImage(${product.id})">Add Image</button>
    `;

    // Step 4: Populate the main form fields
    document.getElementById("name").value = product.name || "";
    document.getElementById("price").value = product.price || 0;
    document.getElementById("description").value = product.description || "";

    // Show the form
    document.getElementById("productForm").style.display = "block";
    document.getElementById("submitProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";
    bindUpdateButton(productId);
  } catch (err) {
    console.error("Error fetching product details:", err);
    alert("An error occurred while fetching product details.");
  }
}
*/
/*async function updateProduct(productId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch product details.");
      return;
    }

    const result = await response.json();
    console.log("Full API response:", result);

    if (!result || !result.data) {
      console.error("No product data found or incorrect response structure.");
      alert("Product data is missing or malformed.");
      return;
    }

    const product = result.data; 
    console.log("Product data:", product);

    currentProduct = product;

    const inventory = Array.isArray(product.inventory) ? product.inventory : [];
    const images = Array.isArray(product.images) ? product.images : [];

    // Step 1: Fetch and populate categories
    const categoriesRes = await fetch("http://localhost:5000/api/categories");
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || categoriesJson;

    const categorySelect = document.getElementById("category_id");
    categorySelect.innerHTML = ""; 

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = product.category.id;

    const colorsRes = await fetch("http://localhost:5000/api/colors");
    const colorsJson = await colorsRes.json();
    const colors = colorsJson.data || [];

    // Clear inventory container before rendering
    const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.innerHTML = "";

    product.inventory.forEach((item) => {
      addInventoryBlock(colors, item); // Renders correctly with color/age_range
    });

    // Step 3: Populate images
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = "";

    if (product.images.length > 0) {
      product.images.forEach((img, index) => {  // Fix here: replaced `imageItem` with `img`
        const isPrimary = img.is_primary;
        imagesContainer.innerHTML += `
          <h5>${isPrimary ? "Primary Image" : `Image ${index + 1}`}</h5>
          <img src="${img.url}" width="100"><br>
          <input type="hidden" id="url_${index}" value="${img.url}"><br>
          ${!isPrimary ? `<button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button><br>` : ""}
        `;

        // Add "Add Image" and "Remove Image" buttons (only for non-primary images)
        if (!isPrimary) {
          const addButtonHTML = `
            <button type="button" onclick="addImage(${product.id}, ${index})">Add Image</button>
          `;
          imagesContainer.innerHTML += addButtonHTML;

          const removeButtonHTML = `
            <button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button>
          `;
          imagesContainer.innerHTML += removeButtonHTML;
        }
      });
    } else {
      imagesContainer.innerHTML = `
        <p>No images found for this product.</p>
        <label for="add_image_url">Add an image URL:</label>
        <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
        <button onclick="addImage(${product.id})">Add Image</button>
      `;
    }

    // Add new image section
    imagesContainer.innerHTML += `
      <h5>Add New Image</h5>
      <label for="add_image_url">Image URL:</label>
      <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
      <button type="button" onclick="addImage(${product.id})">Add Image</button>
    `;

    // Step 4: Populate the main form fields
    document.getElementById("name").value = product.name || "";
    document.getElementById("price").value = product.price || 0;
    document.getElementById("description").value = product.description || "";

    // Show the form
    document.getElementById("productForm").style.display = "block";
    document.getElementById("submitProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";
    bindUpdateButton(productId);
  } catch (err) {
    console.error("Error fetching product details:", err);
    alert("An error occurred while fetching product details.");
  }
}
*/
/*async function updateProduct(productId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch product details.");
      return;
    }

    const result = await response.json();
    console.log("Full API response:", result); 
    
    

    if (!result || !result.data) {
      console.error("No product data found or incorrect response structure.");
      alert("Product data is missing or malformed.");
      return;
    }

    const product = result.data; 
    console.log("Product data:", product);

    
    currentProduct = product;

    const inventory = Array.isArray(product.inventory) ? product.inventory : [];
    const images = Array.isArray(product.images) ? product.images : [];

    // Step 1: Fetch and populate categories
    const categoriesRes = await fetch("http://localhost:5000/api/categories");
    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson.data || categoriesJson;

    const categorySelect = document.getElementById("category_id");
    categorySelect.innerHTML = ""; 

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.value = product.category.id;



    const colorsRes = await fetch("http://localhost:5000/api/colors");
    const colorsJson = await colorsRes.json();
    const colors = colorsJson.data || colorsJson;
    

    const colorsContainer = document.getElementById("inventoryContainer");
    colorsContainer.innerHTML = "";
console.log("Cleared inventory container:", colorsContainer.innerHTML);
const inventoryContainer = document.getElementById("inventoryContainer");
    inventoryContainer.innerHTML = ""; // Clear previous blocks

    product.inventory.forEach((item) => {
      addInventoryBlock(colors, item); // Renders correctly with color/age_range
    });





    
 if (inventory.length > 0) {
      inventory.forEach((item) => {
         console.log(item); 
      addInventoryBlock(colors, item);  
    });

  }

    // Step 3: Populate images
    const imagesContainer = document.getElementById("imagesContainer");
    imagesContainer.innerHTML = "";

    if (images.length > 0) {
    if (product.images.length > 0){
      images.forEach((imageItem, index) => {
        const imageHTML = `
          <h5>Image ${index + 1}</h5>
          <label for="url_${index}">URL:</label>
          <img src="${imageItem.url}" alt="Product Image ${index}" width="100">
<input type="file" id="url_${index}" name="url_${index}"><br>
        `;
        imagesContainer.innerHTML += imageHTML;
        
  const imageHTML = `
    <h5>Image ${index + 1}</h5>
    <label for="url_${index}">URL:</label>
    <img src="${imageItem.url}" alt="Product Image ${index}" width="100"><br>
    <input type="hidden" id="url_${index}" value="${imageItem.url}">
  `;
  imagesContainer.innerHTML += imageHTML;
});
 if (product.images.length > 0){
images.forEach((imageItem, index) => {
product.images.forEach((img, index) => {
        const isPrimary = img.is_primary;
        imagesContainer.innerHTML += `
          <h5>${isPrimary ? "Primary Image" : `Image ${index + 1}`}</h5>
          <img src="${img.url}" width="100"><br>
          <input type="hidden" id="url_${index}" value="${img.url}"><br>
          ${!isPrimary ? `<button type="button" onclick="removeImage(${product.id}, ${index})">Remove</button><br>` : ""}
        `;
});
    } else {
      imagesContainer.innerHTML = `<p>No images found.</p>`;
    }


        if (!imageItem.is_primary) {
          const addButtonHTML = `
            <button type="button" onclick="addImage(${product.id}, ${index})">Add Image</button>
          `;
          imagesContainer.innerHTML += addButtonHTML;

          const removeButtonHTML = `
            <button type="button" onclick="removeImage(${product.id}, ${index})">Remove Image</button>
          `;
          imagesContainer.innerHTML += removeButtonHTML;
        }
      
    } else {
      console.log("No images found for this product.");
      imagesContainer.innerHTML = `
        <p>No images are currently available for this product.</p>
        <label for="add_image_url">Add an image URL:</label>
        <input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
        <button onclick="addImage(${product.id})">Add Image</button>
      `;
    }
    // Always show Add New Image section after existing ones
imagesContainer.innerHTML += `
<h5>Add New Image</h5>
<label for="add_image_url">Image URL:</label>
<input type="file" id="add_image_url" name="add_image_url" placeholder="Enter image URL"><br>
<button type="button" onclick="addImage(${product.id})">Add Image</button>
`;


    // Step 4: Populate the main form fields
    document.getElementById("name").value = product.name || "";
    document.getElementById("price").value = product.price || 0;
    document.getElementById("description").value = product.description || "";

    // Show the form
    document.getElementById("productForm").style.display = "block";
    document.getElementById("submitProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";
    bindUpdateButton(productId);
  } catch (err) {
    console.error("Error fetching product details:", err);
    alert("An error occurred while fetching product details.");
  }
}*/

function addInventoryBlock(colors, inventoryItem = null, ageRanges = []) {
  const index = document.querySelectorAll(".inventoryBlock").length;
  const div = document.createElement("div");
  div.className = "inventoryBlock";
  div.style.border = "1px solid #ccc";
  div.style.padding = "10px";
  div.style.margin = "10px 0";

  const selectedColorId = inventoryItem?.color?.id || inventoryItem?.color_id || "";
  const quantity = inventoryItem?.quantity || "";
  const ageRange = inventoryItem?.age_range || {};
  const minValue = ageRange?.min ?? 0;
const maxValue = ageRange?.max ?? 0;
const unit = ageRange?.unit ?? "years";

  div.innerHTML = `
    <h5>Inventory ${index + 1}</h5>
    <label>Color:</label>
    <select class="colorSelect">
      ${colors.map(c => `
        <option value="${c.id}" ${c.id == selectedColorId ? "selected" : ""}>${c.name}</option>
      `).join("")}
    </select><br>

    <div class="ageRanges">
      <h6>Age Range</h6>
    <label>Min:</label><input type="number" class="min_value" value="${minValue}"><br>
      <label>Max:</label><input type="number" class="max_value" value="${maxValue}"><br>
      <label>Unit:</label><input type="text" class="unit" value="${unit}"><br>
      <label>Quantity:</label><input type="number" class="age_quantity" value="${ageQuantity}"><br>
    </div>
  `;

    
   

  document.getElementById("inventoryContainer").appendChild(div);
}

async function addImage(productId) {
  const imageUrlInput = document.getElementById("add_image_url");
  if (!imageUrlInput) {
    alert("Image URL input not found.");
    return;
  }

  const imageUrl = imageUrlInput.value.trim();
  if (!imageUrl) {
    alert("Please enter a valid image URL.");
    return;
  }

  // Add new image to current product
  currentProduct.images.push({
    url: imageUrl,
    is_primary: false,
  });

  // PATCH updated product to server
  const token = localStorage.getItem("authToken");
  const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: currentProduct.name,
      price: currentProduct.price,
      description: currentProduct.description,
      category_id: currentProduct.category.id,
      inventory: currentProduct.inventory.map(item => ({
        color_id: item.color.id,
        quantity: item.quantity,
        age_range: item.age_range,
      })),
      images: currentProduct.images.map((img, i) => ({
        url: img.url,
        is_primary: i === 0,
      })),
    }),
  });

  if (response.ok) {
    alert("Image added successfully.");
    updateProduct(productId); // Reload the UI
  } else {
    alert("Failed to add image.");
    console.error(await response.text());
  }
}


async function removeImage(productId, index) {
  const confirmRemove = confirm("Are you sure you want to remove this image?");
  if (confirmRemove) {
    // Remove the image from the local product object
    currentProduct.images.splice(index, 1);

    // Send PATCH request to persist changes
    const token = localStorage.getItem("authToken");
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: currentProduct.name,
        price: currentProduct.price,
        description: currentProduct.description,
        category_id: currentProduct.category.id,
        inventory: currentProduct.inventory.map(item => ({
          color_id: item.color.id,
          quantity: item.quantity,
          age_range: item.age_range,
        })),
        images: currentProduct.images.map((img, i) => ({
          url: img.url,
          is_primary: i === 0, // keep first image as primary
        })),
      }),
    });

    if (response.ok) {
      alert("Image removed.");
      updateProduct(productId); // reload and re-render updated product
    } else {
      alert("Failed to update product after removing image.");
      console.error(await response.text());
    }
  }
}



/*async function loadProducts() {
  try {
    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      const row = document.createElement("tr");
      row.id = `product_${product.id}`;
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });
    
  } catch (err) {
    console.error("Error loading products:", err);
  }
}*/
/*async function loadProducts() {
  try {
    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      let imageHtml = "No Image Available";
      if (Array.isArray(product.images) && product.images.length > 0) {
        const primaryImage = product.images.find(img => img.is_primary);
        if (primaryImage && primaryImage.image_url) {
          imageHtml = `<img src="${primaryImage.image_url}" alt="Primary Image" style="max-width: 100px;">`;
        } else {
          const firstImage = product.images[0];
          if (firstImage && firstImage.image_url) {
            imageHtml = `<img src="${firstImage.image_url}" alt="Image" style="max-width: 100px;">`;
          }
        }
      }

      // Removed the QR code generation code entirely
      row.innerHTML = `
        <td>${imageHtml}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;

      // Append the row to the container
      container.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Remove the QR code scan handler as it's no longer needed
// async function handleQrScan(data) {
//   // Function logic removed since QR code is no longer needed
// }

// Decrement Inventory function remains unchanged
async function decrementInventory(productId, colorId, ageRangeId) {
  try {
    const response = await fetch(`http://b.sweetcuddlesboutique.com/api/products/inventory/${productId}/${colorId}/${ageRangeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decrement: 1 })
    });

    if (!response.ok) {
      throw new Error("Failed to decrement inventory");
    }

    const result = await response.json();
    console.log(`Decremented inventory for product ${productId}, color ${colorId}, age range ${ageRangeId}:`, result);
  } catch (error) {
    console.error("Error decrementing inventory:", error);
    alert("Error occurred while trying to delete the product.");
  }
}
*/

/*async function loadProducts() {
  try {
    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      console.log(`Product ID: ${product.id}`, "Images:", product.images); // Debug

      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;
      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading products:", err);
  }
}*/

/*async function loadProducts() {
  try {
    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      console.log(`Product ID: ${product.id}`, "Images:", product.images);

      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      // Use fallback values for optional fields
      const colorId = product.color?.id || 1;
      const ageRangeId = product.age_range?.id || 1;
      const colorName = product.color?.name || "N/A";
      const ageRangeName = product.age_range?.name || "N/A";

      const qrData = `Name: ${product.name}, Age: ${ageRangeName}, Color: ${colorName}`;

      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td><canvas id="qr_${product.id}" style="cursor:pointer;" title="Click to simulate scan"></canvas></td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      container.appendChild(row);

      // Generate QR Code
      const qr = new QRious({
        element: document.getElementById(`qr_${product.id}`),
        value: qrData,
        size: 100
      });

      // Add click listener to simulate QR scan
      document.getElementById(`qr_${product.id}`).addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("authToken"); // get token from localStorage

          if (!token) {
            alert("Authentication token missing. Please log in.");
            return;
          }

          const patchUrl = `https://b.sweetcuddlesboutique.com/api/products/inventory/${product.id}/${colorId}/${ageRangeId}`;
          const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!patchResponse.ok) {
            alert("Failed to decrement quantity. Server responded with " + patchResponse.status);
            return;
          }

          alert("Product deleted successfully");
        } catch (error) {
          console.error("Error scanning QR:", error);
          alert("Error processing the scan.");
        }
      });
    });

  } catch (err) {
    console.error("Error loading products:", err);
  }
}


// Call on load
window.onload = loadProducts;*/
/*async function loadProducts() {
  try {
    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      console.log(`Product ID: ${product.id}`, "Images:", product.images);

      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      // Use fallback values for optional fields
      const colorId = product.color?.id || 1;
      const ageRangeId = product.age_range?.id || 1;
      const colorName = product.color?.name || "N/A";
      const ageRangeName = product.age_range?.name || "N/A";

      const qrData = `Name: ${product.name}, Age: ${ageRangeName}, Color: ${colorName}`;

      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td><canvas id="qr_${product.id}" style="cursor:pointer;" title="Click to simulate scan"></canvas></td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      container.appendChild(row);

      // Generate QR Code
      const qr = new QRious({
        element: document.getElementById(`qr_${product.id}`),
        value: qrData,
        size: 100
      });

      // Add click listener to simulate QR scan
      document.getElementById(`qr_${product.id}`).addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("authToken"); // get token from localStorage

          if (!token) {
            alert("Authentication token missing. Please log in.");
            return;
          }

          // Debugging: log the clicked product details
          console.log("QR Clicked! Product ID:", product.id);
          console.log("QR Data:", qrData);
          console.log("Color ID:", colorId);
          console.log("Age Range ID:", ageRangeId);

          const patchUrl = `https://b.sweetcuddlesboutique.com/api/products/inventory/${product.id}/${colorId}/${ageRangeId}`;
          const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ decrement: 1 }) // This is for decrementing the quantity by 1
          });

          if (!patchResponse.ok) {
            alert("Failed to decrement quantity. Server responded with " + patchResponse.status);
            return;
          }

          alert("Product deleted successfully"); // Update the success message
        } catch (error) {
          console.error("Error scanning QR:", error);
          alert("Error processing the scan.");
        }
      });
    });

  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Call on load
window.onload = loadProducts;
*/

/*async function loadProducts() {
  try {
    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      // Fallbacks for missing data
      const colorId = product.color?.id || 1;
      const ageRangeId = product.age_range?.id || 1;
      const colorName = product.color?.name || "N/A";
      const ageRangeName = product.age_range?.name || "N/A";

      const qrData = `Name: ${product.name}, Age: ${ageRangeName}, Color: ${colorName}`;

      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td><canvas id="qr_${product.id}" style="cursor:pointer;" title="Click to simulate scan"></canvas></td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      container.appendChild(row);

      // Generate QR code
      new QRious({
        element: document.getElementById(`qr_${product.id}`),
        value: qrData,
        size: 100
      });

      // Add click listener to simulate QR scan
      document.getElementById(`qr_${product.id}`).addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("authToken");

          if (!token) {
            alert("Authentication token missing. Please log in.");
            return;
          }

          const patchUrl = `https://b.sweetcuddlesboutique.com/api/products/inventory/${product.id}/${colorId}/${ageRangeId}`;
          const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ decrement: 1 })
          });

          if (!patchResponse.ok) {
            alert("Failed to decrement quantity. Server responded with " + patchResponse.status);
            return;
          }

          alert("Product deleted successfully");
        } catch (error) {
          console.error("Error scanning QR:", error);
          alert("Error processing the scan.");
        }
      });
    });

  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Dummy stubs for action buttons
function updateProduct(id) {
  alert("Update functionality not implemented for Product ID: " + id);
}

function deleteProduct(id) {
  alert("Delete functionality not implemented for Product ID: " + id);
}

window.onload = loadProducts;

/*async function fetchColorMap() {
  const res = await fetch("https://b.sweetcuddlesboutique.com/api/colors");
  if (!res.ok) throw new Error("Failed to fetch colors");
  const data = await res.json();
  const map = {};
  for (const item of data.data || data) {
    map[item.id] = item.name;
  }
  return map;
}

async function loadProducts() {
  try {
    const colorMap = await fetchColorMap();

    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      const colorId = product.color_id || 1;
      const colorName = colorMap[colorId] || "N/A";

      const qrData = `Name: ${product.name}, Color: ${colorName}`;

      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td><canvas id="qr_${product.id}" style="cursor:pointer;" title="Click to simulate scan"></canvas></td>
        <td>
          <button onclick="updateProduct(${product.id})">Update</button>
          <button onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      `;
      container.appendChild(row);

      new QRious({
        element: document.getElementById(`qr_${product.id}`),
        value: qrData,
        size: 100
      });

      document.getElementById(`qr_${product.id}`).addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("authToken");

          if (!token) {
            alert("Authentication token missing. Please log in.");
            return;
          }

          const patchUrl = `https://b.sweetcuddlesboutique.com/api/products/inventory/${product.id}/${colorId}/1`;
          const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ decrement: 1 })
          });

          if (!patchResponse.ok) {
            alert("Failed to decrement quantity. Server responded with " + patchResponse.status);
            return;
          }

          alert("Product deleted successfully");
        } catch (error) {
          console.error("Error scanning QR:", error);
          alert("Error processing the scan.");
        }
      });
    });

  } catch (err) {
    console.error("Error loading data:", err);
  }
}



window.onload = loadProducts;*/
async function fetchColorMap() {
  const res = await fetch("http://localhost:5000/api/colors");
  if (!res.ok) throw new Error("Failed to fetch colors");
  const data = await res.json();
  const map = {};
  for (const item of data.data || data) {
    map[item.id] = item.name;
  }
  return map;
}

async function loadProducts() {
  try {
    const colorMap = await fetchColorMap();

    const response = await fetch("http://localhost:5000/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;
       

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      const colorId = product.color_id || 1;
      const colorName = colorMap[colorId] || "N/A";

      const qrData = `Name: ${product.name}`;

      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td><canvas id="qr_${product.id}" style="cursor:pointer;" title="Click to simulate scan"></canvas></td>
        <td class="action-btns">
          <button  class="update-btn" title="Update Product" onclick="updateProduct(${product.id})"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" title="Delete Product" onclick="deleteProduct(${product.id})"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      container.appendChild(row);

      new QRious({
        element: document.getElementById(`qr_${product.id}`),
        value: qrData,
        size: 100
      });

      // Simulate scan on click
      document.getElementById(`qr_${product.id}`).addEventListener("click", () => {
        handleScan(product.name, colorName);
      });
    });

  } catch (err) {
    console.error("Error loading data:", err);
  }
}

/*async function handleScan(productName, colorName) {
  console.log("Handling scan for:", productName, colorName);
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token missing. Please log in.");
      return;
    }

    const [productRes, colorRes] = await Promise.all([
      fetch("http://localhost:5000/api/products"),
      fetch("http://localhost:5000/api/colors")
    ]);

    const productData = await productRes.json();
    const colorData = await colorRes.json();

    const products = productData.data || [];
    const colors = colorData.data || [];

    const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
    const color = colors.find(c => c.name.toLowerCase() === colorName.toLowerCase());

    console.log("Product match:", product);
    console.log("Color match:", color);

    if (!product || !color) {
      alert("Product or color not found");
      return;
    }

    const patchUrl = `http://localhost:5000/api/products/inventory/${product.id}/${color.id}/1`;
    console.log("PATCH URL:", patchUrl);

    const patchResponse = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ decrement: 1 }) // Remove if API doesn't need it
    });

    const responseText = await patchResponse.text();
    console.log("PATCH response status:", patchResponse.status);
    console.log("PATCH response body:", responseText);

    if (!patchResponse.ok) {
      alert("Failed to decrement quantity. Server responded with " + patchResponse.status);
      return;
    }

    alert("Quantity decremented successfully!");
    await loadProducts(); // reload UI to reflect quantity change

  } catch (error) {
    console.error("Error processing scan:", error);
    alert("Error processing the scan.");
  }
}

/*function startQRScanner() {
  const qrScanner = new Html5Qrcode("reader");

  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      console.log("QR Code scanned:", decodedText);

      const match = decodedText.match(/Name:\s*(.*),\s*Color:\s*(.*)/i);
      if (!match) {
        alert("Invalid QR format");
        return;
      }

      const [, name, color] = match;
      console.log("Parsed from QR:", name, color);

      handleScan(name.trim(), color.trim());
    },
    (errorMessage) => {
      console.warn("QR scanning error:", errorMessage);
    }
  ).catch(err => {
    console.error("Unable to start QR scanner:", err);
  });
}*/
async function startQRScanner() {
    const qrScanner = new Html5Qrcode("reader");

    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            console.log("QR Code scanned:", decodedText);

            const match = decodedText.match(/Name:\s*(.*)/i);
            if (!match) {
                alert("Invalid QR format");
                return;
            }

            const [, name] = match;
            console.log("Parsed from QR:", name);

            // Redirect to the simple page with product and color as URL parameters
            window.location.href = `simplePage.html?name=${encodeURIComponent(name.trim())}`;

        },
        (errorMessage) => {
            console.warn("QR scanning error:", errorMessage);
        }
    ).catch(err => {
        console.error("Unable to start QR scanner:", err);
    });
}




window.onload = () => {
  loadProducts();
  startQRScanner();
};




/*async function fetchColorMap() {
  const res = await fetch("https://b.sweetcuddlesboutique.com/api/colors");
  if (!res.ok) throw new Error("Failed to fetch colors");
  const data = await res.json();
  const map = {};
  for (const item of data.data || data) {
    map[item.id] = item.name;
  }
  return map;
}

async function loadProducts() {
  try {
    const colorMap = await fetchColorMap();

    const response = await fetch("https://b.sweetcuddlesboutique.com/api/products");
    if (!response.ok) {
      console.error("Failed to fetch products");
      return;
    }

    const result = await response.json();
    const products = result.data || result;
    const container = document.getElementById("productListContainer");
    container.innerHTML = "";

    if (!products.length) {
      document.getElementById("productTable").style.display = "none";
      console.log("No products found.");
      return;
    }

    document.getElementById("productTable").style.display = "table";

    products.forEach(product => {
      const primaryImage = (product.images || []).find(
        img => img.is_primary === true || img.is_primary === "true"
      );

      const imageCell = primaryImage
        ? `<img src="${primaryImage.image_url}" alt="${product.name}" width="100" />`
        : `<span style="color: #888;">No image</span>`;

      const row = document.createElement("tr");
      row.id = `product_${product.id}`;

      const colorId = product.color_id || 1;
      const colorName = colorMap[colorId] || "N/A";

      const qrData = btoa(`decrement:${product.id}:${colorId}`);  // Embedded data: product ID and color ID

      row.innerHTML = `
        <td>${imageCell}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td><canvas id="qr_${product.id}" style="cursor:pointer;" title="Click to simulate scan"></canvas></td>
        <td>
           <button  class="update-btn" title="Update Product" onclick="updateProduct(${product.id})"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" title="Delete Product" onclick="deleteProduct(${product.id})"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      container.appendChild(row);

      // Generate QR code with embedded data (product ID and color ID)
      new QRious({
        element: document.getElementById(`qr_${product.id}`),
        value: qrData, // QR code carries productId and colorId
        size: 100
      });
    });

  } catch (err) {
    console.error("Error loading data:", err);
  }
}

window.onload = loadProducts;*/

