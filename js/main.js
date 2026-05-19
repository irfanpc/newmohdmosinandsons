// Main JS for Home and Product Detail Pages

// Mobile Menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// Close mobile menu on link click
document.addEventListener('DOMContentLoaded', () => {
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });

    // Fix manual scroll when clicking an already active hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetHash = this.getAttribute('href');
            if(targetHash === '#' || targetHash === '#all') {
                e.preventDefault();
                window.location.hash = '';
                window.scrollTo({top: 0, behavior: 'smooth'});
            } else if (targetHash !== '#shop') {
                if (window.location.hash === targetHash) {
                    e.preventDefault();
                    scrollToShop();
                }
            }
        });
    });
});

function scrollToShop() {
    const shop = document.getElementById('shop');
    if (shop) {
        const y = shop.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}

// Render Product Cards
function renderProductCards(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }

    products.forEach(product => {
        const isSoldOut = product.stock <= 0;
        const isOnSale = product.discountPrice !== null;
        
        let badgeHtml = '';
        if (isSoldOut) {
            badgeHtml = '<div class="badge sold-out">Sold Out</div>';
        } else if (isOnSale) {
            badgeHtml = '<div class="badge sale">Sale</div>';
        }

        const priceHtml = isOnSale 
            ? `<div class="product-price"><span class="price-old">₹${product.price}</span> <span>₹${product.discountPrice}</span></div>`
            : `<div class="product-price">₹${product.price}</div>`;

        const card = document.createElement('a');
        card.href = `product.html?id=${product.id}`;
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                ${badgeHtml}
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x500?text=No+Image'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                ${priceHtml}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter and Search logic
function filterProducts() {
    const searchInput = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const priceFilter = document.getElementById('priceFilter')?.value || 'default';

    const collectionsSection = document.getElementById('collectionsSection');
    if (collectionsSection) {
        if (categoryFilter !== 'all' || searchInput !== '') {
            collectionsSection.style.display = 'none';
        } else {
            collectionsSection.style.display = 'block';
        }
    }

    let products = getProducts();

    // Text Search
    if (searchInput) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchInput) || 
            p.description.toLowerCase().includes(searchInput)
        );
    }

    // Category Filter
    if (categoryFilter !== 'all') {
        products = products.filter(p => p.category === categoryFilter);
    }

    // Price Sort
    if (priceFilter === 'low-high') {
        products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (priceFilter === 'high-low') {
        products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }

    renderProductCards(products);
}

function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
    }
}

// Initialize Home Page
if (document.getElementById('productGrid')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkHashAndFilter();
        window.addEventListener('hashchange', () => {
            checkHashAndFilter();
            
            const hash = window.location.hash;
            if (hash && hash !== '#' && hash !== '#all') {
                const shop = document.getElementById('shop');
                if (shop) {
                    const y = shop.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }
            } else {
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        });
    });
}

function checkHashAndFilter() {
    const hash = window.location.hash;
    const select = document.getElementById('categoryFilter');
    
    if (!select) return;

    if (hash === '#kurta-kurti') select.value = 'Kurta / Kurti';
    else if (hash === '#palazzo-sets') select.value = 'Palazzo Sets';
    else if (hash === '#sharara-sets') select.value = 'Sharara Sets';
    else if (hash === '#dupatta') select.value = 'Dupatta';
    else if (hash === '#cotton-collection') select.value = 'Cotton Collection';
    else if (hash === '#new-arrivals') select.value = 'New Arrivals';
    else if (hash === '#best-sellers') select.value = 'Best Sellers';
    else if (hash === '#offers') select.value = 'Offers';
    else select.value = 'all';

    filterProducts();
}

// --- Product Detail Logic ---

let selectedSize = '';
let currentQty = 1;
let currentProduct = null;

function renderProductDetail(productId) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    currentProduct = getProductById(productId);
    if (!currentProduct) {
        container.innerHTML = '<h2>Product not found.</h2>';
        return;
    }

    const isSoldOut = currentProduct.stock <= 0;
    const isOnSale = currentProduct.discountPrice !== null;
    
    // Images setup
    const safeImages = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images : ['https://via.placeholder.com/400x500?text=No+Image'];
    let thumbnailsHtml = safeImages.map((img, idx) => `
        <img src="${img}" class="thumbnail ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)" alt="Thumbnail ${idx+1}">
    `).join('');

    // Price setup
    const priceHtml = isOnSale 
        ? `<span class="price-old" style="font-size:1.2rem;">₹${currentProduct.price}</span> <span style="color:var(--danger-color); font-weight:600;">₹${currentProduct.discountPrice}</span>`
        : `<span style="font-weight:600;">₹${currentProduct.price}</span>`;

    // Sizes setup
    const sizesHtml = currentProduct.sizes.map(size => {
        const sizeStock = currentProduct.sizeStock ? (currentProduct.sizeStock[size] || 0) : Math.floor((currentProduct.stock || 0) / currentProduct.sizes.length);
        const isSizeOut = isSoldOut || sizeStock <= 0;
        return `<button class="size-btn" onclick="selectSize('${size}', this)" ${isSizeOut ? 'disabled title="Out of Stock"' : ''}>${size}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="product-gallery">
            <div style="position:relative;">
                ${isSoldOut ? '<div class="badge sold-out" style="font-size:1rem; padding:8px 15px;">Sold Out</div>' : ''}
                <img src="${safeImages[0]}" id="mainImage" class="main-image" alt="${currentProduct.name}">
            </div>
            <div class="thumbnail-list">
                ${thumbnailsHtml}
            </div>
        </div>
        <div class="product-info-detail">
            <h1>${currentProduct.name}</h1>
            <div class="price-wrap">
                ${priceHtml}
            </div>
            <p class="desc">${currentProduct.description}</p>
            
            <div class="stock-status ${isSoldOut ? 'stock-out' : 'stock-in'}">
                ${isSoldOut ? '<i class="fas fa-times-circle"></i> Out of Stock' : '<i class="fas fa-check-circle"></i> In Stock'}
            </div>

            <div class="size-selector">
                <h4>Select Size</h4>
                <div class="size-options">
                    ${sizesHtml}
                </div>
                <p id="sizeError" style="color:var(--danger-color); display:none; margin-top:10px; font-size:0.9rem;">Please select a size.</p>
            </div>

            <div class="quantity-selector">
                <h4>Quantity</h4>
                <div class="qty-wrap">
                    <button class="qty-btn" onclick="changeQty(-1)" ${isSoldOut ? 'disabled' : ''}>-</button>
                    <input type="number" id="qtyInput" class="qty-input" value="1" min="1" max="${currentProduct.stock}" readonly>
                    <button class="qty-btn" onclick="changeQty(1)" ${isSoldOut ? 'disabled' : ''}>+</button>
                </div>
                <p id="qtyStockMsg" style="font-size:0.8rem; color:var(--text-light); margin-top:5px;"></p>
            </div>

            <button class="btn whatsapp-btn" ${isSoldOut ? 'disabled class="btn whatsapp-btn btn-disabled"' : ''} onclick="orderOnWhatsApp()">
                <i class="fab fa-whatsapp"></i> ${isSoldOut ? 'Sold Out' : 'Order on WhatsApp'}
            </button>
        </div>
    `;
}

function changeMainImage(src, element) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.thumbnail').forEach(th => th.classList.remove('active'));
    element.classList.add('active');
}

function selectSize(size, element) {
    if (currentProduct.stock <= 0) return;
    
    const sizeStock = currentProduct.sizeStock ? (currentProduct.sizeStock[size] || 0) : Math.floor((currentProduct.stock || 0) / currentProduct.sizes.length);
    if (sizeStock <= 0) return;
    
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('sizeError').style.display = 'none';

    // Reset and update max quantity
    currentQty = 1;
    const qtyInput = document.getElementById('qtyInput');
    qtyInput.value = currentQty;
    qtyInput.max = sizeStock;
    document.getElementById('qtyStockMsg').innerText = `${sizeStock} in stock for ${size}`;
}

function changeQty(change) {
    if (currentProduct.stock <= 0) return;
    
    if (!selectedSize) {
        document.getElementById('sizeError').style.display = 'block';
        return;
    }
    
    const sizeStock = currentProduct.sizeStock ? (currentProduct.sizeStock[selectedSize] || 0) : Math.floor((currentProduct.stock || 0) / currentProduct.sizes.length);
    
    let newQty = currentQty + change;
    if (newQty >= 1 && newQty <= sizeStock) {
        currentQty = newQty;
        document.getElementById('qtyInput').value = currentQty;
    }
}

function orderOnWhatsApp() {
    if (currentProduct.stock <= 0) return;
    
    if (!selectedSize) {
        document.getElementById('sizeError').style.display = 'block';
        return;
    }

    const price = currentProduct.discountPrice || currentProduct.price;
    const totalPrice = price * currentQty;

    const message = `Hello New Mohd Mohsin And Sons! I would like to place an order:
    
*Product:* ${currentProduct.name}
*Size:* ${selectedSize}
*Quantity:* ${currentQty}
*Price:* ₹${totalPrice}

Please confirm my order.`;

    // Replace with actual business WhatsApp number
    const whatsappNumber = "1234567890"; 
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Mobile Menu Toggle
function toggleMenu() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    nav.classList.toggle('active');
    
    // Icon animation
    const icon = document.querySelector('.mobile-menu-btn i');
    if (icon) {
        if (nav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        
        // Add a small rotation effect
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = nav.classList.contains('active') ? 'rotate(90deg)' : 'rotate(0deg)';
    }
}

// Close mobile menu on link click
document.addEventListener('DOMContentLoaded', () => {
    // Check for custom Hero Media
    const heroVideoDataStr = localStorage.getItem('hero_video_data');
    if (heroVideoDataStr) {
        try {
            const data = JSON.parse(heroVideoDataStr);
            const videoBg = document.getElementById('heroVideoBg');
            const imageBg = document.getElementById('heroImageBg');
            const container = document.getElementById('heroMediaContainer');
            const videoControls = document.getElementById('heroVideoControls');
            
            if (data.type === 'image' || (data.type === 'base64' && data.src.startsWith('data:image'))) {
                if (videoBg) videoBg.style.display = 'none';
                if (imageBg) {
                    imageBg.src = data.src;
                    imageBg.style.display = 'block';
                }
                if (videoControls) videoControls.style.display = 'none';
            } else if (data.type === 'mp4' || (data.type === 'base64' && data.src.startsWith('data:video'))) {
                if (imageBg) imageBg.style.display = 'none';
                if (videoBg) {
                    videoBg.src = data.src;
                    videoBg.style.display = 'block';
                }
                if (videoControls) videoControls.style.display = 'flex';
            } else if (data.type === 'youtube') {
                if (imageBg) imageBg.style.display = 'none';
                if (videoBg) videoBg.style.display = 'none';
                if (videoControls) videoControls.style.display = 'none'; // Custom controls don't work for youtube iframe easily
                if (container) {
                    let iframe = document.getElementById('heroYoutubeBg');
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.id = 'heroYoutubeBg';
                        iframe.style.position = 'absolute';
                        iframe.style.top = '0';
                        iframe.style.left = '0';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.border = 'none';
                        iframe.style.pointerEvents = 'none';
                        container.appendChild(iframe);
                    }
                    iframe.src = `https://www.youtube.com/embed/${data.src}?autoplay=1&mute=1&loop=1&playlist=${data.src}&controls=0&showinfo=0&rel=0`;
                    iframe.style.display = 'block';
                }
            }
        } catch(e) {}
    } else {
        // Fallback for legacy hero_image or hardcoded default
        const savedHero = localStorage.getItem('hero_image');
        const videoBg = document.getElementById('heroVideoBg');
        const imageBg = document.getElementById('heroImageBg');
        const videoControls = document.getElementById('heroVideoControls');
        
        if (savedHero) {
            if (videoBg) videoBg.style.display = 'none';
            if (imageBg) {
                imageBg.src = savedHero;
                imageBg.style.display = 'block';
            }
            if (videoControls) videoControls.style.display = 'none';
        } else {
            // Enforce default image state (because img/hero.png is the default)
            if (videoBg) {
                videoBg.style.display = 'none';
                videoBg.pause();
            }
            if (imageBg) {
                imageBg.src = 'img/hero.png?v=2';
                imageBg.style.display = 'block';
            }
            if (videoControls) videoControls.style.display = 'none'; // Default is now an image
        }
    }

    // Check for custom New Arrivals Image
    const newArrivalsData = localStorage.getItem('new_arrivals_image');
    if (newArrivalsData) {
        const newArrivalsImg = document.getElementById('newArrivalsImg');
        if (newArrivalsImg) {
            newArrivalsImg.src = newArrivalsData;
        }
    }

    // Scroll Reveal Animations
    const reveals = document.querySelectorAll('.collection-card, .product-card, .social-card, .section-title');
    reveals.forEach(el => el.classList.add('reveal'));

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // Mobile Menu Link Logic
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('navLinks');
            const icon = document.querySelector('.mobile-menu-btn i');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
});

// Sticky shrink header on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});
