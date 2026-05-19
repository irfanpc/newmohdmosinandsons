// Admin JS Logic

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

function saveHeroVideoUrl() {
    let url = document.getElementById('heroVideoUrl').value.trim();
    if (!url) return alert('Please enter a valid URL or YouTube ID');
    
    let type = 'mp4';
    if(url.length === 11 && !url.includes('/')) {
        type = 'youtube';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'youtube';
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/);
        if(match) url = match[1];
    }
    
    localStorage.setItem('hero_video_data', JSON.stringify({ type: type, src: url }));
    document.getElementById('heroUploadStatus').textContent = 'Saved URL!';
    document.getElementById('heroUploadStatus').style.color = '#27ae60';
    alert('Hero Video updated! Refresh homepage to see changes.');
}

function handleHeroVideoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if(file.size > 6 * 1024 * 1024) {
            alert('File is too large for offline storage. Please use a direct video URL instead.');
            event.target.value = '';
            return;
        }
        document.getElementById('heroUploadStatus').textContent = 'Processing...';
        document.getElementById('heroUploadStatus').style.color = 'var(--text-dark)';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result;
            try {
                localStorage.setItem('hero_video_data', JSON.stringify({ type: 'base64', src: base64Data }));
                document.getElementById('heroUploadStatus').textContent = 'File uploaded successfully!';
                document.getElementById('heroUploadStatus').style.color = '#27ae60';
                alert('Hero Video uploaded! Refresh homepage to see changes.');
            } catch(error) {
                alert('Storage Quota Exceeded! Video file is too large to save in the browser. Use a Video URL instead.');
                document.getElementById('heroUploadStatus').textContent = 'Upload failed. File too large.';
                document.getElementById('heroUploadStatus').style.color = 'var(--danger-color)';
            }
        };
        reader.readAsDataURL(file);
    }
}

function handleHeroImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result;
            try {
                localStorage.setItem('hero_video_data', JSON.stringify({ type: 'image', src: base64Data }));
                document.getElementById('heroUploadStatus').textContent = 'Image saved successfully!';
                document.getElementById('heroUploadStatus').style.color = '#27ae60';
                alert('Hero Image uploaded! Refresh homepage to see changes.');
            } catch(error) {
                alert('Storage Quota Exceeded! Image file is too large.');
            }
        };
        reader.readAsDataURL(file);
    }
}

function resetHeroMedia() {
    if(confirm('Are you sure you want to reset the hero banner to the default video?')) {
        localStorage.removeItem('hero_video_data');
        localStorage.removeItem('hero_image'); // Clear legacy data too
        alert('Hero Banner reset successfully. Refresh the homepage to see changes.');
    }
}

function loadAdminProducts() {
    const tableBody = document.getElementById('adminProductTable');
    if (!tableBody) return;

    const products = getProducts();
    tableBody.innerHTML = '';

    products.forEach(product => {
        const isSoldOut = product.stock <= 0;
        const statusBadge = isSoldOut 
            ? '<span class="badge sold-out" style="position:static; display:inline-block; font-size:0.7rem;">Sold Out</span>'
            : '<span class="badge" style="position:static; display:inline-block; font-size:0.7rem; background:#27ae60; color:#fff;">In Stock</span>';

        const safeImg = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/50';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${safeImg}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td style="font-weight: 500;">${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.discountPrice || product.price} ${product.discountPrice ? `<br><small style="text-decoration:line-through; color:var(--text-light);">₹${product.price}</small>` : ''}</td>
            <td>${product.stock}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-small" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function handleNewArrivalsUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result;
            try {
                localStorage.setItem('new_arrivals_image', base64Data);
                document.getElementById('newArrivalsUploadStatus').textContent = 'Image saved successfully!';
                document.getElementById('newArrivalsUploadStatus').style.color = '#27ae60';
                alert('New Arrivals image updated! Refresh homepage to see changes.');
            } catch(error) {
                alert('Storage Quota Exceeded! Image file is too large.');
            }
        };
        reader.readAsDataURL(file);
    }
}

function resetNewArrivalsImage() {
    if(confirm('Are you sure you want to reset the New Arrivals image?')) {
        localStorage.removeItem('new_arrivals_image');
        alert('New Arrivals image reset successfully. Refresh the homepage to see changes.');
    }
}

// Modal Logic
let uploadedImages = [];

function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages.push(e.target.result);
            renderImagePreviews();
            updateHiddenImagesData();
        };
        reader.readAsDataURL(file);
    }
}

function renderImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;
    container.innerHTML = '';
    uploadedImages.forEach((src, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.innerHTML = `
            <img src="${src}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
            <span style="position: absolute; top: -5px; right: -5px; background: var(--danger-color); color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer;" onclick="removeUploadedImage(${index})">&times;</span>
        `;
        container.appendChild(wrapper);
    });
}

function removeUploadedImage(index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
    updateHiddenImagesData();
    const fileInput = document.getElementById('pImageFiles');
    if(fileInput) fileInput.value = '';
}

function updateHiddenImagesData() {
    const hiddenInput = document.getElementById('pImagesData');
    if (hiddenInput) {
        hiddenInput.value = uploadedImages.length > 0 ? 'has_images' : ''; // Just to satisfy HTML required attribute
    }
}

function addSizeField(size = '', stock = 0) {
    const container = document.getElementById('sizesStockContainer');
    if (!container) return;
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.className = 'size-stock-row';
    div.innerHTML = `
        <input type="text" list="sizeOptions" class="form-control size-name" placeholder="Size (e.g. S, Free Size)" value="${size}" required style="flex: 1;">
        <input type="number" class="form-control size-stock" placeholder="Stock" value="${stock}" required min="0" style="flex: 1;">
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove(); checkSizesData();" style="padding: 10px;"><i class="fas fa-trash"></i></button>
    `;
    div.querySelectorAll('input').forEach(input => input.addEventListener('input', checkSizesData));
    container.appendChild(div);
    checkSizesData();
}

function checkSizesData() {
    const container = document.getElementById('sizesStockContainer');
    if (!container) return;
    const rows = container.querySelectorAll('.size-stock-row');
    const hiddenInput = document.getElementById('pSizesData');
    if (hiddenInput) {
        hiddenInput.value = rows.length > 0 ? 'has_sizes' : '';
    }
}

function openModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Product';
    
    uploadedImages = [];
    renderImagePreviews();
    updateHiddenImagesData();
    
    document.getElementById('sizesStockContainer').innerHTML = '';
    addSizeField('', 0);

    document.getElementById('productModal').classList.add('active');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
    const product = getProductById(id);
    if (!product) return;

    document.getElementById('productId').value = product.id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pDesc').value = product.description;
    document.getElementById('pCategory').value = product.category;
    
    document.getElementById('sizesStockContainer').innerHTML = '';
    if (product.sizeStock) {
        for (const [size, stock] of Object.entries(product.sizeStock)) {
            addSizeField(size, stock);
        }
    } else if (product.sizes && product.sizes.length > 0) {
        const perSizeStock = Math.floor((product.stock || 0) / product.sizes.length);
        product.sizes.forEach(size => {
            addSizeField(size, perSizeStock);
        });
    } else {
        addSizeField('', 0);
    }
    
    uploadedImages = [...product.images];
    renderImagePreviews();
    updateHiddenImagesData();
    
    document.getElementById('modalTitle').innerText = 'Edit Product';
    document.getElementById('productModal').classList.add('active');
}

function saveProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value || 'p' + Date.now();
    
    const sizeStockRows = document.querySelectorAll('.size-stock-row');
    const sizes = [];
    const sizeStock = {};
    let totalStock = 0;

    sizeStockRows.forEach(row => {
        const sizeName = row.querySelector('.size-name').value.trim();
        const sizeQty = parseInt(row.querySelector('.size-stock').value) || 0;
        if (sizeName) {
            sizes.push(sizeName);
            sizeStock[sizeName] = sizeQty;
            totalStock += sizeQty;
        }
    });
    
    const images = [...uploadedImages];

    const discountVal = document.getElementById('pDiscount').value;
    const basePrice = parseFloat(document.getElementById('pPrice').value);
    let finalDiscountPrice = discountVal ? parseFloat(discountVal) : null;

    // Apply automatic 10% discount for prices over 3000
    if (basePrice > 3000) {
        finalDiscountPrice = Math.round(basePrice * 0.90);
    }

    const newProduct = {
        id: id,
        name: document.getElementById('pName').value,
        description: document.getElementById('pDesc').value,
        category: document.getElementById('pCategory').value,
        stock: totalStock,
        sizeStock: sizeStock,
        price: basePrice,
        discountPrice: finalDiscountPrice,
        sizes: sizes,
        images: images
    };

    let products = getProducts();
    const existingIndex = products.findIndex(p => p.id === id);
    
    if (existingIndex >= 0) {
        products[existingIndex] = newProduct;
    } else {
        products.push(newProduct);
    }

    saveProducts(products);
    closeModal();
    loadAdminProducts();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        loadAdminProducts();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAdminProducts();
});
