// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const timerDisplay = document.getElementById('timerDisplay');
const progressBar = document.getElementById('progressBar');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const addTimeBtn = document.getElementById('addTimeBtn');
const setTimeBtn = document.getElementById('setTimeBtn');
const timeInput = document.getElementById('timeInput');
const statusMessage = document.getElementById('statusMessage');
const serverTime = document.getElementById('serverTime');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalReset = document.getElementById('modalReset');
const alertSound = document.getElementById('alertSound');
const enableSound = document.getElementById('enableSound');
const enableNotification = document.getElementById('enableNotification');

// Biến toàn cục
let totalSeconds = 10 * 60; // 10 phút mặc định
let remainingSeconds = totalSeconds;
let timerInterval = null;
let isRunning = false;
let isPaused = false;
let startTime = null;
let pauseTime = null;
let totalPausedTime = 0;

// Khởi tạo đồng hồ
function initTimer() {
    updateDisplay();
    updateProgressBar();
    updateStatus('Sẵn sàng để bắt đầu!', 'info');
    
    // Thử đồng bộ thời gian server
    syncServerTime();
}

// Cập nhật hiển thị
function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    
    // Thêm animation khi dưới 1 phút
    if (remainingSeconds <= 60) {
        timerDisplay.classList.add('danger');
        statusMessage.style.background = '#ffebee';
        statusMessage.style.color = '#c62828';
    } else if (remainingSeconds <= 300) { // 5 phút
        timerDisplay.classList.add('warning');
        timerDisplay.classList.remove('danger');
        statusMessage.style.background = '#fff3e0';
        statusMessage.style.color = '#ef6c00';
    } else {
        timerDisplay.classList.remove('warning', 'danger');
        statusMessage.style.background = '#e8f4fc';
        statusMessage.style.color = '#2980b9';
    }
}

// Cập nhật thanh progress
function updateProgressBar() {
    const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Đổi màu thanh progress
    if (remainingSeconds <= 60) {
        progressBar.style.background = 'linear-gradient(90deg, #f5576c, #ff0000)';
    } else if (remainingSeconds <= 300) {
        progressBar.style.background = 'linear-gradient(90deg, #f093fb, #f5576c)';
    }
}

// Cập nhật trạng thái
function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    
    const icons = {
        info: '💡',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    
    statusMessage.innerHTML = `${icons[type] || '💡'} ${message}`;
}

// Bắt đầu đếm ngược
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Ghi nhận thời điểm bắt đầu
    startTime = Date.now() - totalPausedTime;
    
    updateStatus('Đang đếm ngược...', 'info');
    
    // Clear interval cũ nếu có
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Tạo interval mới
    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
        
        updateDisplay();
        updateProgressBar();
        
        // Kiểm tra nếu hết giờ
        if (remainingSeconds <= 0) {
            stopTimer();
            showModal();
            playAlert();
            showNotification();
            updateStatus('Thời gian đã hết!', 'error');
        }
        
        // Lưu trạng thái vào localStorage
        saveTimerState();
    }, 1000);
}

// Tạm dừng
function pauseTimer() {
    if (!isRunning || isPaused) return;
    
    isPaused = true;
    pauseTime = Date.now();
    clearInterval(timerInterval);
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    updateStatus('Đã tạm dừng', 'warning');
}

// Tiếp tục
function resumeTimer() {
    if (!isPaused) return;
    
    isPaused = false;
    totalPausedTime += Date.now() - pauseTime;
    
    startTimer();
}

// Dừng hoàn toàn
function stopTimer() {
    isRunning = false;
    isPaused = false;
    
    clearInterval(timerInterval);
    timerInterval = null;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Đặt lại
function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    totalPausedTime = 0;
    
    updateDisplay();
    updateProgressBar();
    updateStatus('Đã đặt lại. Sẵn sàng để bắt đầu!', 'success');
    
    // Xóa state khỏi localStorage
    localStorage.removeItem('timerState');
}

// Thêm thời gian
function addTime(minutes = 1) {
    const secondsToAdd = minutes * 60;
    totalSeconds += secondsToAdd;
    remainingSeconds += secondsToAdd;
    
    updateDisplay();
    updateProgressBar();
    updateStatus(`Đã thêm ${minutes} phút!`, 'success');
}

// Đặt thời gian mới
function setTime() {
    const minutes = parseInt(timeInput.value);
    if (isNaN(minutes) || minutes < 1 || minutes > 60) {
        updateStatus('Vui lòng nhập số phút hợp lệ (1-60)', 'error');
        return;
    }
    
    stopTimer();
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    totalPausedTime = 0;
    
    updateDisplay();
    updateProgressBar();
    updateStatus(`Đã đặt thời gian: ${minutes} phút`, 'success');
}

// Phát âm thanh cảnh báo
function playAlert() {
    if (enableSound.checked) {
        alertSound.currentTime = 0;
        alertSound.play().catch(e => {
            console.log('Không thể phát âm thanh:', e);
        });
    }
}

// Hiển thị notification
function showNotification() {
    if (!enableNotification.checked) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Thời gian đã hết!', {
            body: 'Đồng hồ đếm ngược đã kết thúc.',
            icon: 'https://cdn-icons-png.flaticon.com/512/3208/3208720.png',
            requireInteraction: true
        });
    }
}

// Hiển thị modal
function showModal() {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Ẩn modal
function hideModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Lưu trạng thái timer
function saveTimerState() {
    const state = {
        totalSeconds,
        remainingSeconds,
        isRunning,
        isPaused,
        startTime: startTime ? Date.now() - startTime : 0,
        totalPausedTime,
        lastUpdate: Date.now()
    };
    
    localStorage.setItem('timerState', JSON.stringify(state));
}

// Khôi phục trạng thái timer
function loadTimerState() {
    const saved = localStorage.getItem('timerState');
    if (!saved) return false;
    
    try {
        const state = JSON.parse(saved);
        
        // Tính toán thời gian đã trôi qua
        const timeElapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
        
        if (state.isRunning && !state.isPaused) {
            // Timer đang chạy, tính toán thời gian còn lại
            const elapsedSinceStart = Math.floor((Date.now() - state.startTime) / 1000);
            remainingSeconds = Math.max(0, state.totalSeconds - elapsedSinceStart);
            
            // Khởi động lại timer nếu còn thời gian
            if (remainingSeconds > 0) {
                totalSeconds = state.totalSeconds;
                totalPausedTime = state.totalPausedTime;
                startTimer();
                updateStatus('Đã tiếp tục từ phiên trước', 'info');
                return true;
            }
        }
        
        // Nếu timer đã hết hoặc bị pause, chỉ khôi phục thời gian
        totalSeconds = state.totalSeconds;
        remainingSeconds = Math.max(0, state.remainingSeconds - timeElapsed);
        
    } catch (e) {
        console.error('Lỗi khi load timer state:', e);
    }
    
    return false;
}

// Đồng bộ thời gian server
function syncServerTime() {
    // Sử dụng World Time API
    fetch('http://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh')
        .then(response => response.json())
        .then(data => {
            const serverDate = new Date(data.datetime);
            serverTime.innerHTML = `🕒 Giờ máy chủ: ${serverDate.toLocaleTimeString('vi-VN')}`;
            
            // Lưu thời gian server để so sánh
            localStorage.setItem('serverTime', serverDate.getTime());
        })
        .catch(error => {
            console.log('Không thể đồng bộ thời gian server:', error);
            serverTime.innerHTML = '⚠️ Sử dụng thời gian hệ thống cục bộ';
            
            // Sử dụng thời gian hệ thống
            const localTime = new Date();
            localStorage.setItem('serverTime', localTime.getTime());
        });
}

// Event Listeners
startBtn.addEventListener('click', startTimer);

pauseBtn.addEventListener('click', function() {
    if (isPaused) {
        resumeTimer();
        this.innerHTML = '⏸️ Tạm dừng';
    } else {
        pauseTimer();
        this.innerHTML = '▶️ Tiếp tục';
    }
});

resetBtn.addEventListener('click', resetTimer);

addTimeBtn.addEventListener('click', () => addTime(1));

setTimeBtn.addEventListener('click', setTime);

timeInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        setTime();
    }
});

// Modal events
modalClose.addEventListener('click', hideModal);
modalCloseBtn.addEventListener('click', hideModal);
modalReset.addEventListener('click', function() {
    hideModal();
    resetTimer();
    startTimer();
});

// Đóng modal khi click bên ngoài
modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
        hideModal();
    }
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Khởi tạo
initTimer();

// Thử load state cũ
loadTimerState();

// Auto-save khi đóng trang
window.addEventListener('beforeunload', function(event) {
    if (isRunning) {
        saveTimerState();
        // Hiển thị cảnh báo nếu timer đang chạy
        event.preventDefault();
        event.returnValue = 'Timer đang chạy. Bạn có chắc muốn rời đi?';
    }
});

// Kiểm tra chênh lệch thời gian khi quay lại trang
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page được khôi phục từ bfcache
        const savedServerTime = localStorage.getItem('serverTime');
        if (savedServerTime) {
            const timeDiff = Date.now() - parseInt(savedServerTime);
            if (Math.abs(timeDiff) > 5000) { // Chênh lệch > 5 giây
                updateStatus('Phát hiện chênh lệch thời gian. Kiểm tra lại!', 'warning');
            }
        }
    }
});
