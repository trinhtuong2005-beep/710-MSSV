// Mảng sản phẩm
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        description: "Điện thoại flagship của Apple với chip A17 Pro",
        price: "28.990.000₫",
        category: "Điện thoại",
        icon: "📱"
    },
    {
        id: 2,
        name: "MacBook Air M2",
        description: "Laptop siêu mỏng nhẹ, hiệu năng vượt trội",
        price: "26.990.000₫",
        category: "Laptop",
        icon: "💻"
    },
    {
        id: 3,
        name: "Apple Watch Series 9",
        description: "Đồng hồ thông minh cao cấp, theo dõi sức khỏe",
        price: "11.990.000₫",
        category: "Đồng hồ",
        icon: "⌚"
    },
    {
        id: 4,
        name: "AirPods Pro 2",
        description: "Tai nghe không dây chống ồn chủ động",
        price: "7.990.000₫",
        category: "Tai nghe",
        icon: "🎧"
    },
    {
        id: 5,
        name: "iPad Pro M2",
        description: "Máy tính bảng chuyên nghiệp, màn hình Liquid Retina",
        price: "24.990.000₫",
        category: "Máy tính bảng",
        icon: "📱"
    },
    {
        id: 6,
        name: "Samsung Galaxy S23",
        description: "Điện thoại Android mạnh mẽ, camera 200MP",
        price: "19.990.000₫",
        category: "Điện thoại",
        icon: "📱"
    },
    {
        id: 7,
        name: "Dell XPS 13",
        description: "Laptop cao cấp, thiết kế tinh tế",
        price: "32.990.000₫",
        category: "Laptop",
        icon: "💻"
    }
];

// DOM Elements
const productsContainer = document.getElementById('productsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const noResults = document.getElementById('noResults');
const totalProducts = document.getElementById('totalProducts');

// Hiển thị tất cả sản phẩm ban đầu
function displayProducts(productsArray) {
    productsContainer.innerHTML = '';
    
    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                ${product.icon}
            </div>
            <div class="product-content">
                <h3 class="product-title">${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.description)}</p>
                <div class="product-price">${escapeHtml(product.price)}</div>
                <span class="product-category">${escapeHtml(product.category)}</span>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
    
    // Cập nhật số lượng sản phẩm
    totalProducts.textContent = productsArray.length;
    
    // Hiển thị thông báo nếu không có sản phẩm
    noResults.style.display = productsArray.length === 0 ? 'block' : 'none';
}

// Hàm escape HTML để tránh XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Tìm kiếm sản phẩm
function searchProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Nếu search rỗng, hiển thị tất cả
    if (searchTerm === '') {
        displayProducts(products);
        return;
    }
    
    // Tối ưu: sử dụng filter với biểu thức chính quy đơn giản
    const filteredProducts = products.filter(product => {
        // Chuyển về không dấu để tìm kiếm dễ dàng hơn
        const productName = removeAccents(product.name.toLowerCase());
        const searchTermNoAccent = removeAccents(searchTerm);
        
        // Tìm kiếm theo tên và mô tả
        return productName.includes(searchTermNoAccent) || 
               removeAccents(product.description.toLowerCase()).includes(searchTermNoAccent);
    });
    
    displayProducts(filteredProducts);
}

// Hàm bỏ dấu tiếng Việt
function removeAccents(str) {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// Debounce function để tối ưu tìm kiếm
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Listeners
searchBtn.addEventListener('click', searchProducts);
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchProducts();
    }
});

// Tìm kiếm với debounce (tránh gọi hàm quá nhiều lần)
const debouncedSearch = debounce(searchProducts, 300);
searchInput.addEventListener('input', debouncedSearch);

// Khởi tạo
displayProducts(products);