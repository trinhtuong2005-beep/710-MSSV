// DOM Elements
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const termsCheckbox = document.getElementById('terms');
const resetBtn = document.getElementById('resetBtn');
const successMessage = document.getElementById('successMessage');
const registeredUsers = document.getElementById('registeredUsers');

// Password requirement elements
const reqLength = document.getElementById('reqLength');
const reqUpper = document.getElementById('reqUpper');
const reqLower = document.getElementById('reqLower');
const reqNumber = document.getElementById('reqNumber');

// Hiển thị/ẩn mật khẩu
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

// Kiểm tra mật khẩu real-time
passwordInput.addEventListener('input', function() {
    const password = this.value;
    
    // Kiểm tra các yêu cầu
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    // Cập nhật UI
    updateRequirement(reqLength, hasLength);
    updateRequirement(reqUpper, hasUpper);
    updateRequirement(reqLower, hasLower);
    updateRequirement(reqNumber, hasNumber);
});

function updateRequirement(element, isValid) {
    element.classList.toggle('valid', isValid);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password
function validatePassword(password) {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
        isValid: hasLength && hasUpper && hasLower && hasNumber,
        errors: {
            length: !hasLength,
            upper: !hasUpper,
            lower: !hasLower,
            number: !hasNumber
        }
    };
}

// Lưu user vào LocalStorage
function saveUserToLocalStorage(user) {
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Kiểm tra email đã tồn tại
    if (users.some(u => u.email === user.email)) {
        return { success: false, message: 'Email đã được đăng ký!' };
    }
    
    // Mã hóa cơ bản password (trong thực tế nên dùng bcrypt)
    const userToSave = {
        ...user,
        password: btoa(user.password), // Chỉ mã hóa base64 cho demo
        id: Date.now(),
        registeredAt: new Date().toISOString()
    };
    
    users.push(userToSave);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    return { success: true, message: 'Đăng ký thành công!' };
}

// Hiển thị danh sách users
function displayRegisteredUsers() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    registeredUsers.innerHTML = '';
    
    if (users.length === 0) {
        registeredUsers.innerHTML = '<p class="no-users">Chưa có người dùng nào đăng ký</p>';
        return;
    }
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
            <div class="user-info">
                <div class="user-name">${escapeHtml(user.name)}</div>
                <div class="user-email">${escapeHtml(user.email)}</div>
                <small>${new Date(user.registeredAt).toLocaleDateString('vi-VN')}</small>
            </div>
            <button class="delete-user" data-id="${user.id}">×</button>
        `;
        registeredUsers.appendChild(userElement);
    });
    
    // Thêm event listener cho nút xóa
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            deleteUser(userId);
        });
    });
}

// Xóa user
function deleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users = users.filter(user => user.id !== userId);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    displayRegisteredUsers();
}

// Xử lý submit form
registerForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Reset messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    successMessage.style.display = 'none';
    
    // Lấy giá trị
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const terms = termsCheckbox.checked;
    
    let isValid = true;
    
    // Validate name
    if (!name || name.length < 2) {
        document.getElementById('nameError').textContent = 'Vui lòng nhập tên hợp lệ (ít nhất 2 ký tự)';
        isValid = false;
    }
    
    // Validate email
    if (!email) {
        document.getElementById('emailError').textContent = 'Vui lòng nhập email';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Email không hợp lệ';
        isValid = false;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!password) {
        document.getElementById('passwordError').textContent = 'Vui lòng nhập mật khẩu';
        isValid = false;
    } else if (!passwordValidation.isValid) {
        document.getElementById('passwordError').textContent = 'Mật khẩu không đủ mạnh';
        isValid = false;
    }
    
    // Validate terms
    if (!terms) {
        document.getElementById('termsError').textContent = 'Vui lòng đồng ý với điều khoản';
        isValid = false;
    }
    
    if (isValid) {
        // Lưu user
        const user = { name, email, password };
        const result = saveUserToLocalStorage(user);
        
        if (result.success) {
            // Hiển thị thành công
            successMessage.style.display = 'block';
            successMessage.textContent = result.message;
            
            // Reset form
            registerForm.reset();
            
            // Cập nhật danh sách users
            displayRegisteredUsers();
            
            // Ẩn message sau 5 giây
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        } else {
            // Hiển thị lỗi nếu email đã tồn tại
            document.getElementById('emailError').textContent = result.message;
        }
    }
});

// Reset form
resetBtn.addEventListener('click', function() {
    if (confirm('Bạn có chắc muốn làm mới form?')) {
        registerForm.reset();
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        successMessage.style.display = 'none';
        
        // Reset password requirements
        [reqLength, reqUpper, reqLower, reqNumber].forEach(el => {
            el.classList.remove('valid');
        });
    }
});

// Hàm escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Khởi tạo
displayRegisteredUsers();

// Real-time validation
nameInput.addEventListener('blur', function() {
    if (this.value.trim().length < 2) {
        document.getElementById('nameError').textContent = 'Tên phải có ít nhất 2 ký tự';
    }
});

emailInput.addEventListener('blur', function() {
    if (this.value && !validateEmail(this.value)) {
        document.getElementById('emailError').textContent = 'Email không hợp lệ';
    }
});
