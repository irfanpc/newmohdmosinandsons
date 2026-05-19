const DEFAULT_PRODUCTS = [
    {
        id: 'p1',
        name: 'Elegant Silk Slip Dress',
        price: 3500,
        discountPrice: null,
        description: 'A beautifully crafted silk slip dress perfect for evening wear. Features a delicate cowl neck and adjustable straps.',
        images: [
            'img/kurti.png',
            'img/palazzo.png'
        ],
        sizes: ['S', 'M', 'L'],
        stock: 15,
        category: 'New Arrivals'
    },
    {
        id: 'p2',
        name: 'Embroidered Palazzo Set',
        price: 4200,
        discountPrice: null,
        description: 'Beautiful traditional Palazzo Set with intricate embroidery, perfect for festive occasions.',
        images: [
            'img/palazzo.png',
            'img/kurti.png'
        ],
        sizes: ['M', 'L', 'XL'],
        stock: 10,
        category: 'Palazzo Sets'
    },
    {
        id: 'p3',
        name: 'Cotton Printed Kurti',
        price: 1800,
        discountPrice: null,
        description: 'Comfortable everyday cotton kurti with block print design.',
        images: [
            'img/kurti.png',
            'img/palazzo.png'
        ],
        sizes: ['S', 'M', 'L'],
        stock: 0,
        category: 'Kurta / Kurti'
    },
    {
        id: 'p4',
        name: 'Designer Silk Dupatta',
        price: 1200,
        discountPrice: null,
        description: 'Rich silk dupatta with zari border to match with your favorite ethnic outfits.',
        images: [
            'img/kurti.png',
            'img/palazzo.png'
        ],
        sizes: ['Free Size'],
        stock: 20,
        category: 'Dupatta'
    },
    {
        id: 'p5',
        name: 'Festive Sharara Set',
        price: 5500,
        discountPrice: null,
        description: 'Gorgeous 3-piece Sharara set featuring heavy work, perfect for weddings and parties.',
        images: [
            'img/palazzo.png',
            'img/kurti.png'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 5,
        category: 'Sharara Sets'
    },
    {
        id: 'p6',
        name: 'Pure Cotton Maxi Dress',
        price: 2500,
        discountPrice: null,
        description: 'Breathable and stylish pure cotton maxi dress, perfect for summer wear.',
        images: [
            'img/kurti.png',
            'img/palazzo.png'
        ],
        sizes: ['M', 'L'],
        stock: 8,
        category: 'Cotton Collection'
    },
    {
        id: 'p7',
        name: 'Classic White Anarkali',
        price: 3800,
        discountPrice: null,
        description: 'A flowing, elegant white Anarkali suit with delicate embroidery. Comes with matching Dupatta.',
        images: [
            'img/palazzo.png',
            'img/kurti.png'
        ],
        sizes: ['S', 'M', 'L'],
        stock: 12,
        category: 'Kurta / Kurti'
    },
    {
        id: 'p8',
        name: 'Floral Print Cotton Suit',
        price: 2800,
        discountPrice: null,
        description: 'Vibrant floral print cotton suit set, ideal for casual and daily wear.',
        images: [
            'img/palazzo.png',
            'img/kurti.png'
        ],
        sizes: ['M', 'L', 'XL', 'XXL'],
        stock: 25,
        category: 'Cotton Collection'
    }
];

function initData() {
    if (!localStorage.getItem('products_v8')) {
        localStorage.setItem('products_v8', JSON.stringify(DEFAULT_PRODUCTS));
    }
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products_v8')) || [];
}

function saveProducts(products) {
    localStorage.setItem('products_v8', JSON.stringify(products));
}

function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

// Initialize on load
initData();

function enforceDiscountRule() {
    let products = getProducts();
    let updated = false;
    products = products.map(p => {
        if (p.price > 3000) {
            const expectedDiscount = Math.round(p.price * 0.90);
            if (p.discountPrice !== expectedDiscount) {
                p.discountPrice = expectedDiscount;
                updated = true;
            }
        }
        return p;
    });
    if (updated) {
        saveProducts(products);
    }
}
enforceDiscountRule();
