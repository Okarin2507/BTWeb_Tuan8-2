"use strict";

// =================================================================
// BIẾN TOÀN CỤC VÀ KHỞI TẠO
// =================================================================

let productModalInstance = null;
let appToastInstance = null;
let allUsers = [];
let allCategoriesData = [];
initializeLogoutButton();
// Các biến trạng thái cho phân trang
const pageSize = 4;
let currentFetchContext = {
    fetcher: null,
    args: []
};

document.addEventListener('DOMContentLoaded', function() {
    // Phân luồng logic dựa trên các phần tử có trên trang
    if (document.getElementById('login-form')) {
        initializeLoginPage();
    } else if (document.getElementById('product-modal')) {
        initializeAdminPage();
    } else if (document.getElementById('user-product-list')) {
        initializeUserPage();
    }
});


// =================================================================
// CÁC HÀM DÙNG CHUNG (HELPER FUNCTIONS)
// =================================================================

async function callGraphQL(query) {
    const token = localStorage.getItem('jwt_token');
    // Nếu không có token mà không phải trang login, đá về trang login
    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        logout();
        return;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ query: query })
        });
        const result = await response.json();
        if (result.errors) {
             console.error("GraphQL Errors:", result.errors);
             if (result.errors.some(e => e.extensions?.classification === 'UNAUTHORIZED' || e.message.includes("Expired"))) {
                showToast('Your session has expired. Please log in again.', 'Session Expired', 'danger');
                setTimeout(logout, 2000);
            }
        }
        return result;
    } catch (error) {
        console.error("Network or GraphQL call failed:", error);
        if (appToastInstance) showToast('A network error occurred.', 'Network Error', 'danger');
    }
}
// Hàm hiển thị Toast Notification
function showToast(message, title = 'Notification', type = 'success') {
    const toastTitle = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');
    const toastHeader = document.querySelector('#appToast .toast-header');
    if (!toastTitle || !toastBody || !toastHeader || !appToastInstance) return;
    toastTitle.textContent = title;
    toastBody.textContent = message;
    toastHeader.className = 'toast-header';
    if (type === 'success') toastHeader.classList.add('bg-success', 'text-white');
    else if (type === 'danger') toastHeader.classList.add('bg-danger', 'text-white');
    appToastInstance.show();
}

// Hàm bật/tắt spinner
function toggleSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = show ? 'flex' : 'none';
}

// HÀM ĐĂNG XUẤT
function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
}

// THÊM: HÀM KHỞI TẠO NÚT ĐĂNG XUẤT
function initializeLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    const token = localStorage.getItem('jwt_token');

    if (logoutButton) {
        // Chỉ hiện nút logout nếu người dùng đã đăng nhập (có token)
        if (token) {
            logoutButton.style.display = 'block';
            logoutButton.addEventListener('click', logout);
        } else {
            logoutButton.style.display = 'none';
        }
    }
}


// =================================================================
// LOGIC TRANG ĐĂNG NHẬP
// =================================================================

function initializeLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const token = await response.text();
            localStorage.setItem('jwt_token', token);
            
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const isAdmin = decodedToken.roles.includes('ROLE_ADMIN');

            if (isAdmin) {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } else {
            errorDiv.textContent = 'Invalid email or password.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login failed:', error);
        errorDiv.textContent = 'An error occurred during login.';
        errorDiv.style.display = 'block';
    }
}


// =================================================================
// LOGIC DÀNH RIÊNG CHO TRANG ADMIN
// =================================================================

function initializeAdminPage() {
    const modalEl = document.getElementById('product-modal');
    if (modalEl) productModalInstance = new bootstrap.Modal(modalEl);
    const toastEl = document.getElementById('appToast');
    if (toastEl) appToastInstance = new bootstrap.Toast(toastEl, { delay: 3500 });
    const newProductBtn = document.getElementById('btn-new-product');
    if (newProductBtn) newProductBtn.addEventListener('click', handleNewProductClick);
    const productForm = document.getElementById('product-form');
    if (productForm) productForm.addEventListener('submit', handleFormSubmit);
    const productList = document.getElementById('product-list');
    if (productList) productList.addEventListener('click', handleProductListClick);

    fetchProducts(0);
    fetchCategories();
    fetchUsersForForm();
}

function fetchProducts(page = 0) {
    currentFetchContext = { fetcher: fetchProducts, args: [page] };
    toggleSpinner(true);
    const query = `query { allProductsByPrice(page: ${page}, size: ${pageSize}) { content { id, title, price, description }, totalPages, currentPage } }`;
    callGraphQL(query).then(result => {
        toggleSpinner(false);
        if (!result || result.errors) { showToast('Failed to load products.', 'Error', 'danger'); return; }
        const pageData = result.data.allProductsByPrice;
        renderProductsAdmin(pageData.content);
        renderPagination(pageData.totalPages, pageData.currentPage);
    });
}

function fetchCategories() {
    const query = `{ allCategories { id, name } }`;
    callGraphQL(query).then(result => {
        if (!result || result.errors) return;
        allCategoriesData = result.data.allCategories;
        const categoryList = document.getElementById('category-list');
        const firstChild = categoryList.querySelector('li:first-child');
        categoryList.innerHTML = '';
        if (firstChild) {
            firstChild.onclick = () => {
                document.querySelectorAll('#category-list li.active').forEach(li => li.classList.remove('active'));
                firstChild.classList.add('active');
                document.getElementById('product-list-title').innerText = 'All Products';
                fetchProducts(0);
            };
            categoryList.appendChild(firstChild);
        }
        allCategoriesData.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.style.cursor = 'pointer';
            li.textContent = cat.name;
            li.onclick = (event) => fetchProductsByCategory(cat.id, cat.name, event, 0);
            categoryList.appendChild(li);
        });
        populateCategoryDropdown();
    });
}

function fetchUsersForForm() {
    const query = `{ allUsers { id, fullname } }`;
    callGraphQL(query).then(result => {
        if (!result || result.errors) return;
        allUsers = result.data.allUsers;
        populateUserDropdown();
    });
}

function fetchProductsByCategory(categoryId, categoryName, event, page = 0) {
    currentFetchContext = { fetcher: fetchProductsByCategory, args: [categoryId, categoryName, event, page] };
    toggleSpinner(true);
    const query = `query { productsByCategory(categoryId: "${categoryId}", page: ${page}, size: ${pageSize}) { content { id, title, price, description }, totalPages, currentPage } }`;
    callGraphQL(query).then(result => {
        toggleSpinner(false);
        if (!result || result.errors) { showToast('Failed to load products for this category.', 'Error', 'danger'); return; }
        const pageData = result.data.productsByCategory;
        renderProductsAdmin(pageData.content);
        renderPagination(pageData.totalPages, pageData.currentPage);
        document.getElementById('product-list-title').innerText = `Category: ${categoryName}`;
        document.querySelectorAll('#category-list li.active').forEach(li => li.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');
    });
}

function renderProductsAdmin(products) {
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = '';
    if (!products || products.length === 0) {
        productListDiv.innerHTML = `<div class="col-12 text-center mt-5"><p class="text-muted">No products found.</p></div>`;
        return;
    }
    products.forEach(product => {
        productListDiv.innerHTML += `
            <div class="col-lg-6 mb-4">
                <div class="card shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${product.price.toLocaleString('vi-VN')} VNĐ</h6>
                        <p class="card-text small">${product.description || 'No description.'}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 text-end">
                        <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${product.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                        <button class="btn btn-sm btn-outline-danger btn-delete ms-1" data-id="${product.id}" data-title="${product.title}"><i class="bi bi-trash"></i> Delete</button>
                    </div>
                </div>
            </div>`;
    });
}

function populateUserDropdown() {
    const userSelect = document.getElementById('product-user');
    if (!userSelect) return;
    userSelect.innerHTML = '<option value="">-- Select a user --</option>';
    allUsers.forEach(user => userSelect.innerHTML += `<option value="${user.id}">${user.fullname}</option>`);
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('product-categories');
    if (!categorySelect) return;
    categorySelect.innerHTML = '';
    allCategoriesData.forEach(cat => categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`);
}

function handleNewProductClick() {
    const form = document.getElementById('product-form');
    if (!form) return;
    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('productModalLabel').innerText = 'Add New Product';
    if (productModalInstance) productModalInstance.show();
}

function handleProductListClick(event) {
    const target = event.target.closest('button');
    if (!target) return;
    const productId = target.dataset.id;
    if (target.classList.contains('btn-edit')) handleEditClick(productId);
    if (target.classList.contains('btn-delete')) handleDeleteClick(productId, target.dataset.title);
}

function handleEditClick(productId) {
    const query = `query { productById(id: "${productId}") { id, title, price, quantity, description, user {id}, categories {id} } }`;
    callGraphQL(query).then(result => {
        if (!result || result.errors) { showToast("Could not fetch product details!", 'Error', 'danger'); return; }
        const product = result.data.productById;
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-title').value = product.title;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-user').value = product.user.id;
        const categoryIds = product.categories.map(cat => cat.id);
        Array.from(document.getElementById('product-categories').options).forEach(option => {
            option.selected = categoryIds.includes(option.value);
        });
        document.getElementById('productModalLabel').innerText = 'Update Product';
        if (productModalInstance) productModalInstance.show();
    });
}

function handleDeleteClick(productId, productTitle) {
    if (confirm(`Are you sure you want to delete "${productTitle}"?`)) {
        const mutation = `mutation { deleteProduct(id: "${productId}") }`;
        callGraphQL(mutation).then(result => {
            if (!result || result.errors || !result.data.deleteProduct) {
                showToast('Failed to delete product.', 'Error', 'danger');
            } else {
                showToast(`Product "${productTitle}" deleted successfully.`);
                currentFetchContext.fetcher(...currentFetchContext.args);
            }
        });
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('product-id').value;
    const title = document.getElementById('product-title').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const description = document.getElementById('product-description').value;
    const userId = document.getElementById('product-user').value;
    const categoryIds = Array.from(document.getElementById('product-categories').selectedOptions).map(opt => opt.value);

    if (!userId) {
        showToast('Please select a seller.', 'Validation Error', 'danger');
        return;
    }

    const productInput = `{
        title: "${title.replace(/"/g, '\\"')}", price: ${price}, quantity: ${quantity},
        description: "${description.replace(/"/g, '\\"')}", userId: "${userId}",
        categoryIds: [${categoryIds.map(id => `"${id}"`).join(',')}]
    }`;
    const mutation = id ? `mutation { updateProduct(id: "${id}", productInput: ${productInput}) { id } }`
                       : `mutation { createProduct(productInput: ${productInput}) { id } }`;
    callGraphQL(mutation).then(result => {
        if (!result || result.errors) {
            showToast('Operation failed! See console for details.', 'Error', 'danger');
        } else {
            showToast(`Product ${id ? 'updated' : 'created'} successfully!`);
            if (productModalInstance) productModalInstance.hide();
            currentFetchContext.fetcher(...currentFetchContext.args);
        }
    });
}

// =================================================================
// LOGIC TRANG USER
// =================================================================

function initializeUserPage() {
    fetchAndRenderUserProducts(0);
    fetchAndRenderUserCategories();
}

function fetchAndRenderUserCategories() {
    const query = `{ allCategories { id, name } }`;
    callGraphQL(query).then(result => {
        if (!result || result.errors) return;
        const categories = result.data.allCategories;
        const categoryList = document.getElementById('user-category-list');
        const firstChild = categoryList.querySelector('li:first-child');
        categoryList.innerHTML = '';
        if (firstChild) {
            firstChild.onclick = () => {
                document.querySelectorAll('#user-category-list li.active').forEach(li => li.classList.remove('active'));
                firstChild.classList.add('active');
                document.getElementById('user-product-list-title').innerText = 'All Products';
                fetchAndRenderUserProducts(0);
            };
            categoryList.appendChild(firstChild);
        }
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.style.cursor = 'pointer';
            li.textContent = cat.name;
            li.onclick = (event) => fetchUserProductsByCategory(cat.id, cat.name, event, 0);
            categoryList.appendChild(li);
        });
    });
}

function fetchAndRenderUserProducts(page = 0) {
    currentFetchContext = { fetcher: fetchAndRenderUserProducts, args: [page] };
    const query = `query { allProductsByPrice(page: ${page}, size: ${pageSize}) { content { id, title, price, description }, totalPages, currentPage } }`;
    const productListDiv = document.getElementById('user-product-list');
    callGraphQL(query).then(result => {
        if (!result || result.errors) {
            productListDiv.innerHTML = `<p class="col-12 text-center text-danger">Could not load products.</p>`;
            return;
        }
        const pageData = result.data.allProductsByPrice;
        renderProductsUser(pageData.content);
        renderPagination(pageData.totalPages, pageData.currentPage);
    });
}

function fetchUserProductsByCategory(categoryId, categoryName, event, page = 0) {
    currentFetchContext = { fetcher: fetchUserProductsByCategory, args: [categoryId, categoryName, event, page] };
    const query = `query { productsByCategory(categoryId: "${categoryId}", page: ${page}, size: ${pageSize}) { content { id, title, price, description }, totalPages, currentPage } }`;
    callGraphQL(query).then(result => {
        if (!result || result.errors) { showToast('Failed to load products for this category.', 'Error', 'danger'); return; }
        const pageData = result.data.productsByCategory;
        renderProductsUser(pageData.content);
        renderPagination(pageData.totalPages, pageData.currentPage);
        document.getElementById('user-product-list-title').innerText = `Category: ${categoryName}`;
        document.querySelectorAll('#user-category-list li.active').forEach(li => li.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');
    });
}

function renderProductsUser(products) {
    const productListDiv = document.getElementById('user-product-list');
    if (!productListDiv) return;
    productListDiv.innerHTML = '';
    if (!products || products.length === 0) {
        productListDiv.innerHTML = `<p class="col-12 text-center text-muted">No products available in this category.</p>`;
        return;
    }
    products.forEach(product => {
        productListDiv.innerHTML += `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">${product.description || 'A great product.'}</p>
                    </div>
                    <div class="card-footer bg-light">
                        <small class="text-dark">Price: <strong>${product.price.toLocaleString('vi-VN')} VNĐ</strong></small>
                    </div>
                </div>
            </div>`;
    });
}

// =================================================================
// LOGIC PHÂN TRANG DÙNG CHUNG
// =================================================================

function renderPagination(totalPages, currentPage) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    paginationControls.innerHTML = '';
    if (totalPages <= 1) return;

    const createPageItem = (page, text, isDisabled, isActive) => {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); ${isDisabled ? '' : `changePage(${page})`}">${text}</a>`;
        return li;
    };

    paginationControls.appendChild(createPageItem(currentPage - 1, 'Previous', currentPage === 0));
    for (let i = 0; i < totalPages; i++) {
        paginationControls.appendChild(createPageItem(i, i + 1, false, i === currentPage));
    }
    paginationControls.appendChild(createPageItem(currentPage + 1, 'Next', currentPage >= totalPages - 1));
}

function changePage(page) {
    if (currentFetchContext.fetcher) {
        const newArgs = [...currentFetchContext.args];
        newArgs[newArgs.length - 1] = page;
        currentFetchContext.fetcher(...newArgs);
    }
}