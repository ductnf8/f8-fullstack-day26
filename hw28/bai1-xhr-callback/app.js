function sendRequest(method, url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = 5000; // Timeout 5 giây
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                callback(null, data);
            } catch (error) {
                console.error('Chức năng 1: Lỗi phân tích JSON:', error);
                callback(new Error('Lỗi phân tích dữ liệu JSON'), null);
            }
        } else {
            console.error('Chức năng 1: Yêu cầu thất bại:', xhr.status, xhr.statusText);
            callback(new Error(`Yêu cầu thất bại với mã trạng thái ${xhr.status}`), null);
        }
    };
    xhr.onerror = function () {
        console.error('Chức năng 1: Lỗi mạng khi gọi:', url);
        callback(new Error('Lỗi mạng, kiểm tra kết nối hoặc chạy qua server'), null);
    };
    xhr.ontimeout = function () {
        console.error('Chức năng 1: Hết thời gian chờ khi gọi:', url);
        callback(new Error('Hết thời gian chờ, kiểm tra kết nối mạng'), null);
    };
    xhr.send();
}

// Chức năng 1: User Profile Card
function setupUserProfile() {
    const userIdInput = document.getElementById('user-id-input');
    const findUserBtn = document.getElementById('search-user-btn');
    const userProfileCard = document.getElementById('user-profile-card');
    const userLoading = document.getElementById('user-loading');
    const userError = document.getElementById('user-error');
    const userErrorText = document.getElementById('user-error-text');

    // Kiểm tra sự tồn tại của các phần tử DOM
    if (!userIdInput) console.error('Chức năng 1: Không tìm thấy #user-id-input trong DOM');
    if (!findUserBtn) console.error('Chức năng 1: Không tìm thấy #search-user-btn trong DOM');
    if (!userProfileCard) console.error('Chức năng 1: Không tìm thấy #user-profile-card trong DOM');
    if (!userLoading) console.error('Chức năng 1: Không tìm thấy #user-loading trong DOM');
    if (!userError) console.error('Chức năng 1: Không tìm thấy #user-error trong DOM');
    if (!userErrorText) console.error('Chức năng 1: Không tìm thấy #user-error-text trong DOM');

    if (!userIdInput || !findUserBtn || !userProfileCard || !userLoading || !userError || !userErrorText) {
        console.error('Chức năng 1: Thiếu phần tử DOM cần thiết, kiểm tra index.html có đúng các ID: user-id-input, search-user-btn, user-profile-card, user-loading, user-error, user-error-text');
        return;
    }

    // Khởi tạo trạng thái ban đầu
    userError.classList.remove('show');
    userProfileCard.classList.remove('show');
    userError.style.display = 'none';
    userProfileCard.style.display = 'none';

    findUserBtn.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        console.log(`Chức năng 1: Nhấn nút tìm user với ID: "${userId}"`);

        if (!userId || isNaN(userId) || userId < 1 || userId > 10) {
            console.log('Chức năng 1: User ID không hợp lệ:', userId);
            userError.style.display = 'block';
            userError.classList.add('show');
            userErrorText.textContent = 'Vui lòng nhập User ID từ 1 đến 10';
            userProfileCard.style.display = 'none';
            userProfileCard.classList.remove('show');
            return;
        }

        userLoading.style.display = 'block';
        userLoading.classList.add('show');
        userError.style.display = 'none';
        userError.classList.remove('show');
        userProfileCard.style.display = 'none';
        userProfileCard.classList.remove('show');

        console.log(`Chức năng 1: Gửi yêu cầu API cho userId: ${userId}`);
        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}`, (error, user) => {
            userLoading.style.display = 'none';
            userLoading.classList.remove('show');
            if (error || !user) {
                console.error(`Chức năng 1: Lỗi tải user ${userId}:`, error);
                userError.style.display = 'block';
                userError.classList.add('show');
                userErrorText.textContent = error ? error.message : 'User không tồn tại';
                return;
            }
            console.log(`Chức năng 1: Tải user thành công:`, user);
            userProfileCard.innerHTML = `
                <div class="user-info">
                    <p><span class="label">Name:</span> ${user.name}</p>
                    <p><span class="label">Email:</span> ${user.email}</p>
                    <p><span class="label">Phone:</span> ${user.phone}</p>
                    <p><span class="label">Website:</span> ${user.website}</p>
                    <p><span class="label">Company:</span> ${user.company.name}</p>
                    <p><span class="label">Address:</span> ${user.address.street}, ${user.address.city}</p>
                </div>
            `;
            userProfileCard.style.display = 'block';
            userProfileCard.classList.add('show');
            console.log('Chức năng 1: Đã hiển thị user profile card cho userId:', userId);
        });
    });
}

// Chức năng 2: Posts với Comments
function setupPosts() {
    const postsContainer = document.getElementById('posts-container');
    const postsLoading = document.getElementById('posts-loading');
    const postsError = document.getElementById('posts-error');
    const postsErrorText = document.getElementById('posts-error-text');

    if (!postsContainer) {
        console.error('Không tìm thấy #posts-container trong DOM');
        return;
    }

    postsLoading.style.display = 'block';
    postsError.style.display = 'none';
    postsContainer.innerHTML = '';

    console.log('Bắt đầu tải posts từ API...');
    sendRequest('GET', 'https://jsonplaceholder.typicode.com/posts?_limit=5', (error, posts) => {
        postsLoading.style.display = 'none';
        if (error || !posts) {
            console.error('Lỗi khi tải posts:', error);
            postsError.style.display = 'block';
            postsErrorText.textContent = error ? error.message : 'Không tải được posts';
            return;
        }
        console.log('Posts tải thành công:', posts);
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.setAttribute('data-post-id', post.id);
            postElement.innerHTML = `
                <h4 class="post-title">${post.title}</h4>
                <p class="post-body">${post.body}</p>
                <p class="post-author">Tác giả: <span class="author-name">Đang tải...</span></p>
                <button class="show-comments-btn" data-post-id="${post.id}" data-user-id="${post.userId}">Xem comments</button>
                <div class="comments-container" data-post-id="${post.id}"></div>
            `;
            postsContainer.appendChild(postElement);

            console.log(`Tải thông tin user cho post ${post.id}, userId: ${post.userId}`);
            sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${post.userId}`, (error, user) => {
                const authorElement = postElement.querySelector('.author-name');
                if (!authorElement) {
                    console.error(`Không tìm thấy .author-name trong post ${post.id}`);
                    return;
                }
                if (error || !user) {
                    console.error(`Lỗi tải user ${post.userId}:`, error);
                    authorElement.textContent = 'Lỗi tải tác giả';
                    return;
                }
                authorElement.textContent = `${user.name} (${user.email})`;
            });
        });
    });

    postsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-comments-btn')) {
            const postId = e.target.getAttribute('data-post-id');
            const commentsContainer = postsContainer.querySelector(`.comments-container[data-post-id="${postId}"]`);
            const button = e.target;

            if (!commentsContainer) {
                console.error(`Không tìm thấy .comments-container cho post ${postId}`);
                return;
            }

            if (button.textContent === 'Xem comments') {
                console.log(`Tải danh sách posts cho post ${postId}`);
                postsLoading.style.display = 'block';
                sendRequest('GET', 'https://jsonplaceholder.typicode.com/posts?_limit=5', (error, posts) => {
                    postsLoading.style.display = 'none';
                    if (error || !posts) {
                        console.error(`Lỗi tải posts cho post ${postId}:`, error);
                        commentsContainer.innerHTML = `<p class="error">Lỗi: ${error?.message || 'Không tải được danh sách posts'}</p>`;
                        return;
                    }
                    console.log(`Danh sách posts tải thành công cho post ${postId}:`, posts);
                    commentsContainer.innerHTML = `
                        <h4>Danh sách bài posts:</h4>
                        ${posts.map(post => `
                            <div class="post-item" data-post-id="${post.id}">
                                <h4 class="post-title">${post.title}</h4>
                                <p class="post-body">${post.body}</p>
                                <p class="post-author">Tác giả: <span class="author-name">Đang tải...</span></p>
                            </div>
                        `).join('')}
                    `;
                    console.log(`Đã render ${posts.length} posts vào .comments-container cho post ${postId}`);
                    commentsContainer.classList.add('show');
                    posts.forEach(post => {
                        const postElement = commentsContainer.querySelector(`.post-item[data-post-id="${post.id}"]`);
                        if (!postElement) {
                            console.error(`Không tìm thấy .post-item[data-post-id="${post.id}"] trong comments-container`);
                            return;
                        }
                        const authorElement = postElement.querySelector('.author-name');
                        if (!authorElement) {
                            console.error(`Không tìm thấy .author-name trong post ${post.id} (comments-container)`);
                            return;
                        }
                        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${post.userId}`, (error, user) => {
                            if (error || !user) {
                                console.error(`Lỗi tải user ${post.userId} trong comments:`, error);
                                authorElement.textContent = 'Lỗi tải tác giả';
                                return;
                            }
                            authorElement.textContent = `${user.name} (${user.email})`;
                        });
                    });
                    button.textContent = 'Ẩn comments';
                });
            } else {
                commentsContainer.innerHTML = '';
                commentsContainer.classList.remove('show');
                button.textContent = 'Xem comments';
                console.log(`Đã xóa nội dung .comments-container cho post ${postId}`);
            }
        }
    });
}

// Chức năng 3: Todo List với Filter
function setupTodoList() {
    const todoUserIdInput = document.getElementById('todo-user-id-input');
    const loadTodosBtn = document.getElementById('load-todos-btn');
    const todoList = document.getElementById('todo-list');
    const todosLoading = document.getElementById('todos-loading');
    const todosError = document.getElementById('todos-error');
    const todosErrorText = document.getElementById('todos-error-text');
    const filterAll = document.getElementById('filter-all');
    const filterCompleted = document.getElementById('filter-completed');
    const filterIncomplete = document.getElementById('filter-incomplete');
    const totalTodos = document.getElementById('total-todos');
    const completedTodos = document.getElementById('completed-todos');
    const incompleteTodos = document.getElementById('incomplete-todos');
    let todos = [];
    let currentFilter = localStorage.getItem('todoFilter') || 'all';

    if (!todoUserIdInput) console.error('Không tìm thấy #todo-user-id-input');
    if (!loadTodosBtn) console.error('Không tìm thấy #load-todos-btn');
    if (!todoList) console.error('Không tìm thấy #todo-list');
    if (!todosLoading) console.error('Không tìm thấy #todos-loading');
    if (!todosError) console.error('Không tìm thấy #todos-error');
    if (!todosErrorText) console.error('Không tìm thấy #todos-error-text');
    if (!filterAll) console.error('Không tìm thấy #filter-all');
    if (!filterCompleted) console.error('Không tìm thấy #filter-completed');
    if (!filterIncomplete) console.error('Không tìm thấy #filter-incomplete');
    if (!totalTodos || !completedTodos || !incompleteTodos) console.error('Không tìm thấy các phần tử thống kê todos');

    if (!todoUserIdInput || !loadTodosBtn || !todoList || !todosLoading || !todosError || !todosErrorText || !filterAll || !filterCompleted || !filterIncomplete) {
        console.error('Chức năng 3: Thiếu phần tử DOM cần thiết, kiểm tra index.html');
        return;
    }

    todosError.style.display = 'none';
    todoList.innerHTML = '';

    console.log(`Chức năng 3: Khởi tạo filter từ localStorage: ${currentFilter}`);
    if (currentFilter === 'all') {
        filterAll.classList.add('active');
        filterCompleted.classList.remove('active');
        filterIncomplete.classList.remove('active');
    } else if (currentFilter === 'completed') {
        filterAll.classList.remove('active');
        filterCompleted.classList.add('active');
        filterIncomplete.classList.remove('active');
    } else if (currentFilter === 'incomplete') {
        filterAll.classList.remove('active');
        filterCompleted.classList.remove('active');
        filterIncomplete.classList.add('active');
    }

    function updateStats(todosToShow) {
        const completed = todosToShow.filter(todo => todo.completed).length;
        const incomplete = todosToShow.length - completed;
        totalTodos.textContent = todosToShow.length;
        completedTodos.textContent = completed;
        incompleteTodos.textContent = incomplete;
    }

    function displayTodos(todosToShow) {
        todoList.innerHTML = todosToShow.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : 'incomplete'}" data-todo-id="${todo.id}" data-completed="${todo.completed}">
                <div class="todo-checkbox">${todo.completed ? '✅' : '⬜'}</div>
                <div class="todo-text">${todo.title}</div>
            </div>
        `).join('');
        updateStats(todosToShow);
    }

    function applyCurrentFilter() {
        console.log(`Chức năng 3: Áp dụng filter: ${currentFilter}`);
        if (currentFilter === 'all') {
            displayTodos(todos);
        } else if (currentFilter === 'completed') {
            displayTodos(todos.filter(todo => todo.completed));
        } else if (currentFilter === 'incomplete') {
            displayTodos(todos.filter(todo => !todo.completed));
        }
    }

    loadTodosBtn.addEventListener('click', () => {
        const userId = todoUserIdInput.value.trim() || '1';
        if (!userId || isNaN(userId) || userId < 1 || userId > 10) {
            console.log('Chức năng 3: User ID không hợp lệ:', userId);
            todosError.style.display = 'block';
            todosErrorText.textContent = 'Vui lòng nhập User ID từ 1 đến 10';
            todoList.innerHTML = '';
            updateStats([]);
            return;
        }

        todosLoading.style.display = 'block';
        todosError.style.display = 'none';
        todoList.innerHTML = '';

        console.log(`Chức năng 3: Tải todos cho userId: ${userId}`);
        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}/todos`, (error, data) => {
            todosLoading.style.display = 'none';
            if (error) {
                console.error(`Chức năng 3: Lỗi tải todos cho userId ${userId}:`, error);
                todosError.style.display = 'block';
                todosErrorText.textContent = error.message;
                todoList.innerHTML = '';
                updateStats([]);
                return;
            }
            todos = data;
            console.log(`Chức năng 3: Todos tải thành công cho userId ${userId}:`, todos);
            applyCurrentFilter();
        });
    });

    filterAll.addEventListener('click', () => {
        currentFilter = 'all';
        localStorage.setItem('todoFilter', currentFilter);
        console.log('Chức năng 3: Lưu filter vào localStorage: all');
        filterAll.classList.add('active');
        filterCompleted.classList.remove('active');
        filterIncomplete.classList.remove('active');
        applyCurrentFilter();
    });

    filterCompleted.addEventListener('click', () => {
        currentFilter = 'completed';
        localStorage.setItem('todoFilter', currentFilter);
        console.log('Chức năng 3: Lưu filter vào localStorage: completed');
        filterAll.classList.remove('active');
        filterCompleted.classList.add('active');
        filterIncomplete.classList.remove('active');
        applyCurrentFilter();
    });

    filterIncomplete.addEventListener('click', () => {
        currentFilter = 'incomplete';
        localStorage.setItem('todoFilter', currentFilter);
        console.log('Chức năng 3: Lưu filter vào localStorage: incomplete');
        filterAll.classList.remove('active');
        filterCompleted.classList.remove('active');
        filterIncomplete.classList.add('active');
        applyCurrentFilter();
    });
}

// CSS bổ sung để hỗ trợ giao diện
const style = document.createElement('style');
style.textContent = `
    .error-message { color: red; display: none; }
    .loading-spinner { display: none; }
    .user-profile-card { display: none; }
    .user-info { padding: 10px; }
    .label { color: #667eea; font-weight: bold; }
    .post-item { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
    .comments-container { margin-top: 10px; min-height: 50px; }
    .comments-container .post-item { margin-left: 20px; border-left: 2px solid #667eea; padding-left: 10px; margin-bottom: 10px; }
    .todo-item.completed { background-color: #e0ffe0; padding: 10px; }
    .todo-item.incomplete { background-color: #ffe0e0; padding: 10px; }
    .filter-btn.active { background-color: #667eea; color: white; }
    .filter-btn { margin: 5px; }
    .show-comments-btn { cursor: pointer; background-color: #4caf50; color: white; border: none; padding: 5px 10px; }
    .show-comments-btn:hover { background-color: #45a049; }
`;
document.head.appendChild(style);

// Khởi chạy các chức năng
document.addEventListener('DOMContentLoaded', () => {
    console.log('Trang đã tải, khởi chạy các chức năng...');
    setupUserProfile();
    setupPosts();
    setupTodoList();
});