async function sendRequest(method, url, retryCount = 0) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5 giây
        const response = await fetch(url, {method, signal: controller.signal});
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage;
            if (response.status === 404) {
                errorMessage = `Không tìm thấy tài nguyên: ${url}`;
            } else if (response.status >= 500) {
                errorMessage = `Lỗi máy chủ: ${response.statusText}`;
            } else {
                errorMessage = `Yêu cầu thất bại với mã trạng thái ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`API ${url} thành công:`, data);
        return data;
    } catch (error) {
        console.error(`Lỗi khi gọi ${url}:`, error);
        if (retryCount < 1) {
            console.log(`Thử lại API ${url} sau 2 giây (lần ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return sendRequest(method, url, retryCount + 1);
        }
        throw new Error(`${error.message} (số lần thử: ${retryCount + 1})`);
    }
}

// Chức năng 1: User Profile Card
async function setupUserProfile() {
    const userIdInput = document.getElementById('user-id-input');
    const findUserBtn = document.getElementById('search-user-btn');
    const userProfileCard = document.getElementById('user-profile-card');
    const userLoading = document.getElementById('user-loading');
    const userError = document.getElementById('user-error');
    const userErrorText = document.getElementById('user-error-text');

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

    userError.classList.remove('show');
    userError.style.display = 'none';
    userProfileCard.classList.remove('show');
    userProfileCard.style.display = 'none';

    findUserBtn.addEventListener('click', async () => {
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

        try {
            console.log(`Chức năng 1: Tải thông tin user với ID: ${userId}`);
            const user = await sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}`);
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
        } catch (error) {
            console.error(`Chức năng 1: Lỗi tải user ${userId}:`, error);
            userError.style.display = 'block';
            userError.classList.add('show');
            userErrorText.textContent = error.message;
        } finally {
            userLoading.style.display = 'none';
            userLoading.classList.remove('show');
        }
    });
}

// Chức năng 2: Posts với Comments
async function setupPosts() {
    const postsContainer = document.getElementById('posts-container');
    const postsLoading = document.getElementById('posts-loading');
    const postsError = document.getElementById('posts-error');
    const postsErrorText = document.getElementById('posts-error-text');
    const loadMoreBtn = document.createElement('button');
    let postLimit = 5;
    let totalLoadedPosts = 0;

    if (!postsContainer) console.error('Chức năng 2: Không tìm thấy #posts-container trong DOM');
    if (!postsLoading) console.error('Chức năng 2: Không tìm thấy #posts-loading trong DOM');
    if (!postsError) console.error('Chức năng 2: Không tìm thấy #posts-error trong DOM');
    if (!postsErrorText) console.error('Chức năng 2: Không tìm thấy #posts-error-text trong DOM');

    if (!postsContainer || !postsLoading || !postsError || !postsErrorText) {
        console.error('Chức năng 2: Thiếu phần tử DOM cần thiết, kiểm tra index.html');
        return;
    }

    postsLoading.style.display = 'block';
    postsError.style.display = 'none';
    postsContainer.innerHTML = '';

    loadMoreBtn.textContent = 'Xem thêm';
    loadMoreBtn.className = 'load-more-btn';
    postsContainer.after(loadMoreBtn);

    async function loadPosts(start = 0, limit = postLimit) {
        console.log(`Chức năng 2: Tải posts từ API, start=${start}, limit=${limit}`);
        postsLoading.style.display = 'block';
        postsError.style.display = 'none';

        try {
            const posts = await sendRequest('GET', `https://jsonplaceholder.typicode.com/posts?_start=${start}&_limit=${limit}`);
            console.log(`Chức năng 2: Posts tải thành công:`, posts);
            totalLoadedPosts += posts.length;

            const postsWithUsers = [];
            for (const post of posts) {
                try {
                    const user = await sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${post.userId}`);
                    postsWithUsers.push({post, user});
                } catch (error) {
                    console.error(`Chức năng 2: Lỗi tải user ${post.userId}:`, error);
                    postsWithUsers.push({post, user: null});
                }
            }

            for (const {post, user} of postsWithUsers) {
                const postElement = document.createElement('div');
                postElement.className = 'post-item';
                postElement.setAttribute('data-post-id', post.id);
                postElement.innerHTML = `
                    <h4 class="post-title">${post.title}</h4>
                    <p class="post-body">${post.body}</p>
                    <p class="post-author">Tác giả: <span class="author-name">${user ? `${user.name} (${user.email})` : 'Lỗi tải tác giả'}</span></p>
                    <button class="show-comments-btn" data-post-id="${post.id}" data-user-id="${post.userId}">Xem comments</button>
                    <div class="comments-container" data-post-id="${post.id}"></div>
                `;
                postsContainer.appendChild(postElement);
            }
            console.log(`Chức năng 2: Đã render ${postsWithUsers.length} posts, tổng cộng: ${totalLoadedPosts}`);
            loadMoreBtn.style.display = totalLoadedPosts >= 20 ? 'none' : 'block';
        } catch (error) {
            console.error('Chức năng 2: Lỗi tải posts:', error);
            postsError.style.display = 'block';
            postsErrorText.textContent = error.message;
        } finally {
            postsLoading.style.display = 'none';
        }
    }

    await loadPosts();

    loadMoreBtn.addEventListener('click', async () => {
        console.log('Chức năng 2: Nhấn nút Xem thêm');
        await loadPosts(totalLoadedPosts, postLimit);
    });

    postsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('show-comments-btn')) {
            const postId = e.target.getAttribute('data-post-id');
            const commentsContainer = postsContainer.querySelector(`.comments-container[data-post-id="${postId}"]`);
            const button = e.target;

            if (!commentsContainer) {
                console.error(`Chức năng 2: Không tìm thấy .comments-container cho post ${postId}`);
                return;
            }

            if (button.textContent === 'Xem comments') {
                console.log(`Chức năng 2: Tải danh sách posts cho post ${postId}`);
                postsLoading.style.display = 'block';
                try {
                    const posts = await sendRequest('GET', 'https://jsonplaceholder.typicode.com/posts?_limit=5');
                    console.log(`Chức năng 2: Danh sách posts tải thành công cho post ${postId}:`, posts);
                    const postsWithUsers = [];
                    for (const post of posts) {
                        try {
                            const user = await sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${post.userId}`);
                            postsWithUsers.push({post, user});
                        } catch (error) {
                            console.error(`Chức năng 2: Lỗi tải user ${post.userId} trong comments:`, error);
                            postsWithUsers.push({post, user: null});
                        }
                    }

                    commentsContainer.innerHTML = `
                        <h4>Danh sách bài posts:</h4>
                        ${postsWithUsers.map(({post, user}) => `
                            <div class="post-item" data-post-id="${post.id}">
                                <h4 class="post-title">${post.title}</h4>
                                <p class="post-body">${post.body}</p>
                                <p class="post-author">Tác giả: <span class="author-name">${user ? `${user.name} (${user.email})` : 'Lỗi tải tác giả'}</span></p>
                            </div>
                        `).join('')}
                    `;
                    console.log(`Chức năng 2: Đã render ${postsWithUsers.length} posts vào .comments-container cho post ${postId}`);
                    commentsContainer.classList.add('show');
                    button.textContent = 'Ẩn comments';
                } catch (error) {
                    console.error(`Chức năng 2: Lỗi tải posts cho post ${postId}:`, error);
                    commentsContainer.innerHTML = `<p class="error">Lỗi: ${error.message}</p>`;
                } finally {
                    postsLoading.style.display = 'none';
                }
            } else {
                commentsContainer.innerHTML = '';
                commentsContainer.classList.remove('show');
                button.textContent = 'Xem comments';
                console.log(`Chức năng 2: Đã xóa nội dung .comments-container cho post ${postId}`);
            }
        }
    });
}

// Chức năng 3: Todo List với Filter
async function setupTodoList() {
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

    if (!todoUserIdInput) console.error('Chức năng 3: Không tìm thấy #todo-user-id-input');
    if (!loadTodosBtn) console.error('Chức năng 3: Không tìm thấy #load-todos-btn');
    if (!todoList) console.error('Chức năng 3: Không tìm thấy #todo-list');
    if (!todosLoading) console.error('Chức năng 3: Không tìm thấy #todos-loading');
    if (!todosError) console.error('Chức năng 3: Không tìm thấy #todos-error');
    if (!todosErrorText) console.error('Chức năng 3: Không tìm thấy #todos-error-text');
    if (!filterAll) console.error('Chức năng 3: Không tìm thấy #filter-all');
    if (!filterCompleted) console.error('Chức năng 3: Không tìm thấy #filter-completed');
    if (!filterIncomplete) console.error('Chức năng 3: Không tìm thấy #filter-incomplete');
    if (!totalTodos || !completedTodos || !incompleteTodos) console.error('Chức năng 3: Không tìm thấy các phần tử thống kê todos');

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

    loadTodosBtn.addEventListener('click', async () => {
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

        try {
            console.log(`Chức năng 3: Tải todos cho userId: ${userId}`);
            todos = await sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}/todos`);
            console.log(`Chức năng 3: Todos tải thành công cho userId ${userId}:`, todos);
            applyCurrentFilter();
        } catch (error) {
            console.error(`Chức năng 3: Lỗi tải todos cho userId ${userId}:`, error);
            todosError.style.display = 'block';
            todosErrorText.textContent = error.message;
            todoList.innerHTML = '';
            updateStats([]);
        } finally {
            todosLoading.style.display = 'none';
        }
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
    .load-more-btn { cursor: pointer; background-color: #667eea; color: white; border: none; padding: 10px 20px; margin-top: 10px; }
    .load-more-btn:hover { background-color: #5a67d8; }
`;
document.head.appendChild(style);

// Khởi chạy các chức năng
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Trang đã tải, khởi chạy các chức năng...');
    await Promise.all([setupUserProfile(), setupPosts(), setupTodoList()]);
});