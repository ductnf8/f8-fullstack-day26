function sendRequest(method, url, retryCount = 0) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.timeout = 5000;

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch (e) {
                    console.error('Lỗi parse JSON:', e);
                    reject(new Error('Lỗi parse dữ liệu từ server'));
                }
            } else {
                console.error('Lỗi server khi gọi:', url);
                reject(new Error('Lỗi server khi tải dữ liệu'));
            }
        };

        xhr.onerror = function () {
            console.error('Chức năng: Lỗi mạng khi gọi:', url);
            reject(new Error('Lỗi mạng, kiểm tra kết nối hoặc chạy qua server'));
        };

        xhr.ontimeout = function () {
            console.error('Chức năng: Hết thời gian chờ khi gọi:', url);
            reject(new Error('Hết thời gian chờ, kiểm tra kết nối mạng'));
        };

        xhr.send();
    }).catch(error => {
        if (retryCount < 1) {
            console.log(`Thử lại lần ${retryCount + 1} sau 2 giây cho ${url}`);
            return new Promise(resolve => setTimeout(resolve, 2000))
                .then(() => sendRequest(method, url, retryCount + 1));
        }
        console.error('Lỗi sau khi thử lại:', error);
        throw new Error(`${error.message} (sau ${retryCount + 1} lần thử)`);
    });
}

function checkElement(dom) {
    if (!dom) console.error(`Không tìm thấy ${dom} trong DOM`);
}

// DOM function 1
const userIdInput = document.getElementById('user-id-input');
const searchUserBtn = document.getElementById('search-user-btn');
const userProfileCard = document.getElementById('user-profile-card');
const userLoading = document.getElementById('user-loading');
const userError = document.getElementById('user-error');
const userErrorText = document.getElementById('user-error-text');

// DOM function 2
const postsContainer = document.getElementById('posts-container');
const postsLoading = document.getElementById('posts-loading');
const postsError = document.getElementById('posts-error');
const postsErrorText = document.getElementById('posts-error-text');
const loadMorePostsBtn = document.getElementById('load-more-posts-btn');

// DOM function 3
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

// FUNCTION 1
function setupUserProfile() {
    checkElement(userIdInput);
    checkElement(searchUserBtn);
    checkElement(userProfileCard);
    checkElement(userLoading);
    checkElement(userError);
    checkElement(userErrorText);

    if (!userIdInput || !searchUserBtn || !userProfileCard || !userLoading || !userError || !userErrorText) {
        console.error('FUNCTION 1: MISSING NECESSARY DOM ELEMENT');
        return;
    }

    userError.classList.remove('show');
    userProfileCard.classList.remove('show');
    userError.style.display = 'none';
    userProfileCard.style.display = 'none';

    searchUserBtn.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        console.log('userId: ', userId);

        if (!userId || isNaN(userId) || userId < 1 || userId > 10) {
            console.log('userId is invalid');
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

        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}`)
            .then(user => {
                userLoading.style.display = 'none';
                userLoading.classList.remove('show');
                console.log('Danh sach: ', user);

                if (!user) {
                    throw new Error('User không tồn tại');
                }

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
            })
            .catch(error => {
                userLoading.style.display = 'none';
                userLoading.classList.remove('show');
                userError.style.display = 'block';
                userError.classList.add('show');
                userErrorText.textContent = error.message;
                console.error('FUNCTION 1: Lỗi tải user:', error);
            });
    });
}

// FUNCTION 2
function setupPosts() {
    let currentPage = 1;
    const postsPerPage = 5;

    checkElement(postsContainer);
    checkElement(postsLoading);
    checkElement(postsError);
    checkElement(postsErrorText);
    checkElement(loadMorePostsBtn);

    if (!postsContainer || !postsLoading || !postsError || !postsErrorText || !loadMorePostsBtn) {
        console.error('FUNCTION 2: MISSING NECESSARY DOM ELEMENT');
        return;
    }

    postsLoading.style.display = 'block';
    postsError.style.display = 'none';
    postsContainer.innerHTML = '';
    loadMorePostsBtn.style.display = 'none';

    function loadPosts(page = 1) {
        postsLoading.style.display = 'block';
        postsLoading.classList.add('show');
        postsError.style.display = 'none';
        postsError.classList.remove('show');
        if (page === 1) postsContainer.innerHTML = '';

        sendRequest('GET', `https://jsonplaceholder.typicode.com/posts?_limit=${postsPerPage}&_page=${page}`)
            .then(posts => {
                postsLoading.style.display = 'none';
                postsLoading.classList.remove('show');
                if (!posts || posts.length === 0) {
                    throw new Error('Không còn bài viết để tải');
                }

                loadMorePostsBtn.style.display = posts.length < postsPerPage ? 'none' : 'block';

                return Promise.all(posts.map(post =>
                    sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${post.userId}`)
                        .then(user => ({post, user}))
                        .catch(error => {
                            console.error(`Lỗi tải user ${post.userId}:`, error);
                            return {post, user: null};
                        })
                ));
            })
            .then(postsWithUsers => {
                postsWithUsers.forEach(({post, user}) => {
                    const postElement = document.createElement('div');
                    postElement.className = 'post-item';
                    postElement.setAttribute('data-post-id', post.id);
                    postElement.innerHTML = `
                        <h4 class="post-title">${post.title}</h4>
                        <p class="post-body">${post.body}</p>
                        <p class="post-author">Tác giả: <span class="author-name">${user ? `${user.name} (${user.email})` : 'Đang tải...'}</span></p>
                        <button class="show-comments-btn" data-post-id="${post.id}">Xem comments</button>
                        <div class="comments-container" data-post-id="${post.id}"></div>
                    `;
                    postsContainer.appendChild(postElement);
                });
            })
            .catch(error => {
                postsLoading.style.display = 'none';
                postsLoading.classList.remove('show');
                postsError.style.display = 'block';
                postsError.classList.add('show');
                postsErrorText.textContent = error.message;
                console.error('FUNCTION 2: Lỗi tải posts:', error);
            });
    }

    postsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-comments-btn')) {
            const postId = e.target.getAttribute('data-post-id');
            const commentsContainer = postsContainer.querySelector(`.comments-container[data-post-id="${postId}"]`);
            const button = e.target;

            if (!commentsContainer) {
                console.error(`Không tìm thấy comments cho post ${postId}`);
                return;
            }

            if (button.textContent === 'Xem comments') {
                console.log(`Tải comments cho post ${postId}`);
                postsLoading.style.display = 'block';
                postsLoading.classList.add('show');

                sendRequest('GET', `https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
                    .then(comments => {
                        postsLoading.style.display = 'none';
                        postsLoading.classList.remove('show');
                        console.log(`post ${postId} comments:`, comments);

                        commentsContainer.innerHTML = `
                            <h4>Danh sách comments:</h4>
                            ${comments.map(c => `
                                <div class="comment-item">
                                    <p><strong>${c.name}</strong> (${c.email})</p>
                                    <p>${c.body}</p>
                                </div>
                            `).join('')}
                        `;
                        commentsContainer.classList.add('show');
                        button.textContent = 'Ẩn comments';
                    })
                    .catch(error => {
                        postsLoading.style.display = 'none';
                        postsLoading.classList.remove('show');
                        commentsContainer.innerHTML = `<p class="error">Lỗi: ${error.message}</p>`;
                        console.error(`FUNCTION 2: Lỗi tải comments cho post ${postId}:`, error);
                    });
            } else {
                commentsContainer.innerHTML = '';
                commentsContainer.classList.remove('show');
                button.textContent = 'Xem comments';
                console.log(`Đã ẩn comments cho post ${postId}`);
            }
        }
    });

    loadMorePostsBtn.addEventListener('click', () => {
        currentPage++;
        loadPosts(currentPage);
    });

    loadPosts();
}

// FUNCTION 3
function setupTodoList() {
    let todos = [];
    let currentFilter = localStorage.getItem('todoFilter') || 'all';

    checkElement(todoUserIdInput);
    checkElement(loadTodosBtn);
    checkElement(todoList);
    checkElement(todosLoading);
    checkElement(todosError);
    checkElement(todosErrorText);
    checkElement(filterAll);
    checkElement(filterCompleted);
    checkElement(filterIncomplete);
    checkElement(totalTodos);
    checkElement(completedTodos);
    checkElement(incompleteTodos);

    if (!todoUserIdInput || !loadTodosBtn || !todoList || !todosLoading || !todosError || !todosErrorText || !filterAll || !filterCompleted || !filterIncomplete || !totalTodos || !completedTodos || !incompleteTodos) {
        console.error('FUNCTION 3: MISSING NECESSARY DOM ELEMENT');
        return;
    }

    todosError.style.display = 'none';
    todosError.classList.remove('show');
    todoList.innerHTML = '';

    if (currentFilter === 'all') {
        filterAll.classList.add('active');
    } else if (currentFilter === 'completed') {
        filterCompleted.classList.add('active');
    } else if (currentFilter === 'incomplete') {
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
        console.log(`FUNCTION 3: filter: ${currentFilter}`);
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
        console.log(`FUNCTION 3: userId: ${userId}`);

        if (!userId || isNaN(userId) || userId < 1 || userId > 10) {
            console.log('FUNCTION 3: Invalid user id');
            todosError.style.display = 'block';
            todosError.classList.add('show');
            todosErrorText.textContent = 'Vui lòng nhập User ID từ 1 đến 10';
            todoList.innerHTML = '';
            updateStats([]);
            return;
        }

        todosLoading.style.display = 'block';
        todosLoading.classList.add('show');
        todosError.style.display = 'none';
        todosError.classList.remove('show');
        todoList.innerHTML = '';

        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}/todos`)
            .then(data => {
                todosLoading.style.display = 'none';
                todosLoading.classList.remove('show');
                console.log(`FUNCTION 3: Todos tải thành công cho userId ${userId}:`, data);
                todos = data;
                applyCurrentFilter();
            })
            .catch(error => {
                todosLoading.style.display = 'none';
                todosLoading.classList.remove('show');
                todosError.style.display = 'block';
                todosError.classList.add('show');
                todosErrorText.textContent = error.message;
                console.error(`FUNCTION 3: Lỗi tải todos cho userId ${userId}:`, error);
                todoList.innerHTML = '';
                updateStats([]);
            });
    });

    filterAll.addEventListener('click', () => {
        currentFilter = 'all';
        localStorage.setItem('todoFilter', currentFilter);
        filterAll.classList.add('active');
        filterCompleted.classList.remove('active');
        filterIncomplete.classList.remove('active');
        applyCurrentFilter();
    });

    filterCompleted.addEventListener('click', () => {
        currentFilter = 'completed';
        localStorage.setItem('todoFilter', currentFilter);
        filterAll.classList.remove('active');
        filterCompleted.classList.add('active');
        filterIncomplete.classList.remove('active');
        applyCurrentFilter();
    });

    filterIncomplete.addEventListener('click', () => {
        currentFilter = 'incomplete';
        localStorage.setItem('todoFilter', currentFilter);
        filterAll.classList.remove('active');
        filterCompleted.classList.remove('active');
        filterIncomplete.classList.add('active');
        applyCurrentFilter();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupUserProfile();
    setupPosts();
    setupTodoList();
});