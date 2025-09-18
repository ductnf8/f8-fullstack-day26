function sendRequest(method, url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url)

    xhr.timeout = 5000

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            try {
                const data = JSON.parse(xhr.responseText);
                callback(null, data);
            } catch (e) {
                console.error(e);
                callback(new Error('Error sending request'), null);
            }
        } else {
            console.error('Error sending request');
            callback(new Error('Error sending request'), null);
        }
    }

    xhr.onerror = function () {
        console.error('Chức năng 1: Lỗi mạng khi gọi:', url);
        callback(new Error('Lỗi mạng, kiểm tra kết nối hoặc chạy qua server'), null);
    }

    xhr.ontimeout = function () {
        console.error('Chức năng 1: Hết thời gian chờ khi gọi:', url);
        callback(new Error('Hết thời gian chờ, kiểm tra kết nối mạng'), null);
    }

    xhr.send();
}

function checkElement(dom) {
    if (!dom) console.error(`Can't find ${dom} in DOM`);
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

    checkElement(userIdInput)
    checkElement(searchUserBtn)
    checkElement(userProfileCard)
    checkElement(userLoading)
    checkElement(userError)
    checkElement(userErrorText)

    if (!userIdInput || !searchUserBtn || !userProfileCard || !userLoading || !userError || !userErrorText) {
        console.error('FUNCTION1: MISSING NECESSARY DOM ELEMENT');
        return;
    }

    userError.classList.remove('show');
    userProfileCard.classList.remove('show');
    userError.style.display = 'none';
    userProfileCard.style.display = 'none';

    searchUserBtn.addEventListener('click', () => {
        const userId = userIdInput.value.trim()
        console.log('userId: ', userId)

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

        //     Call Api
        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}`, (error, user) => {
            userLoading.style.display = 'none';
            userLoading.classList.remove('show');
            console.log('Danh sach: ', user)

            if (error || !user) {
                console.log('FUNCTION: ', error);
                userError.classList.add('show');
                userErrorText.textContent = error ? error.message : 'User không tồn tại';
                return;
            }

            userProfileCard.innerHTML = `
            <div class="user-info">
            <p><span class="label">Name:</span>${user.name}</p>
            <p><span class="label">Email:</span> ${user.email}</p>
                    <p><span class="label">Phone:</span> ${user.phone}</p>
                    <p><span class="label">Website:</span> ${user.website}</p>
                    <p><span class="label">Company:</span> ${user.company.name}</p>
                    <p><span class="label">Address:</span> ${user.address.street}, ${user.address.city}</p>
            </div> 
            `

            userProfileCard.style.display = 'block';
            userProfileCard.classList.add('show');
        })
    })
}

// FUNCTION 2
function setupPosts() {
    if (!postsContainer) {
        console.error('Không tìm thấy #posts-container trong DOM');
        return;
    }
    postsLoading.style.display = 'block';
    postsError.style.display = 'none';
    postsContainer.innerHTML = '';

    sendRequest('GET', 'https://jsonplaceholder.typicode.com/posts?_limit=5', (error, posts) => {
        postsLoading.style.display = 'none';
        if (error || !posts) {
            console.error('Lỗi khi tải posts:', error);
            postsError.style.display = 'block';
            if (postsErrorText) postsErrorText.textContent = error ? error.message : 'Không tải được posts';
            return;
        }

        console.log('Posts:', posts)

        posts.forEach(post => {
            const postElement = document.createElement('div')
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

            console.log(`user infor:,${post.userId}`)

            // 🔹 CHỈNH SỬA: Lấy thông tin tác giả từ API /users/{userId}, không gọi nhầm /comments nữa
            sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${post.userId}`, (error, user) => {
                const authorElement = postElement.querySelector('.author-name');

                if (!authorElement) {
                    console.log(`Can't find author name in post ${post.id}`)
                    return;
                }
                if (error || !user) {
                    console.log(`User loading error ${post.userId}`, error)
                    authorElement.textContent = 'Author error'
                    return;
                }
                authorElement.textContent = `${user.name} (${user.email})`;
            })
        })
    })

    postsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-comments-btn')) {
            const postId = e.target.getAttribute('data-post-id');
            const commentsContainer = postsContainer.querySelector(`.comments-container[data-post-id="${postId}"]`);
            const button = e.target;

            if (!commentsContainer) {
                console.error(`Can't find comments for post ${postId}`);
                return;
            }

            if (button.textContent === 'Xem comments') {
                console.log(`Tải comments cho post ${postId}`);

                postsLoading.style.display = 'block';
                // 🔹 CHỈNH SỬA: Khi bấm "Xem comments" chỉ load comments từ /posts/{id}/comments
                sendRequest('GET', `https://jsonplaceholder.typicode.com/posts/${postId}/comments`, (error, comments) => {
                    postsLoading.style.display = 'none';
                    if (error || !comments) {
                        console.error(`Lỗi tải comments cho post ${postId}:`, error);
                        commentsContainer.innerHTML = `<p class="error">Lỗi: ${error?.message || 'Không tải được danh sách comments'}</p>`;
                        return;
                    }
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
                });
            } else {
                commentsContainer.innerHTML = '';
                commentsContainer.classList.remove('show');
                button.textContent = 'Xem comments';
                console.log(`Đã ẩn comments cho post ${postId}`);
            }
        }
    });
}

// FUNCTION 3
function setupTodoList() {

    let todos = [];
    let currentFilter = localStorage.getItem('todoFilter') || 'all';

    // Kiểm tra DOM
    checkElement(todoUserIdInput)
    checkElement(loadTodosBtn);
    // checkElement(todosContainer);
    checkElement(todosLoading);
    checkElement(todosError);
    checkElement(todosErrorText);
    // checkElement(filterAllBtn);
    // checkElement(filterCompletedBtn);
    // checkElement(filterIncompleteBtn);
    checkElement(totalTodos);
    checkElement(completedTodos);
    checkElement(incompleteTodos);

    if (!todoUserIdInput || !loadTodosBtn || !todoList || !todosLoading || !todosError || !todosErrorText || !filterAll || !filterCompleted || !filterIncomplete) {
        console.error('FUNCTION 3: Thiếu phần tử DOM cần thiết, kiểm tra index.html');
        return;
    }

    // Ẩn error, xóa danh sách hiển thị
    todosError.style.display = 'none';
    todoList.innerHTML = '';

    if (currentFilter === 'all') {
        filterAll.classList.add('active');
    } else if (currentFilter === 'completed') {
        filterCompleted.classList.add('active');
    } else if (currentFilter === 'incomplete') {
        filterIncomplete.classList.add('active');
    }

    // Cập nhật các chỉ số thống kê (total/completed/incomplete)
    function updateStats(todosToShow) {
        const completed = todosToShow.filter(todo => todo.completed).length;
        const incomplete = todosToShow.length - completed;
        totalTodos.textContent = todosToShow.length;
        completedTodos.textContent = completed;
        incompleteTodos.textContent = incomplete;
    }

    // Hiển thị danh sách todos
    function displayTodos(todosToShow) {
        todoList.innerHTML = todosToShow.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : 'incomplete'}" data-todo-id="${todo.id}" data-completed="${todo.completed}">
                <div class="todo-checkbox">${todo.completed ? '✅' : '⬜'}</div>
                <div class="todo-text">${todo.title}</div>
            </div>
        `).join('');
        updateStats(todosToShow);
    }

    // Áp filter hiện tại lên danh sách todos (trong bộ nhớ todos[])
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

    // Khi người dùng nhấn Load Todos
    loadTodosBtn.addEventListener('click', () => {
        const userId = todoUserIdInput.value.trim() || '1';

        // Validate UserId
        if (!userId || isNaN(userId) || userId < 1 || userId > 10) {
            console.log('function 3: Invalid user id:')
            todosError.style.display = 'block';
            todosErrorText.textContent = 'Vui lòng nhập User ID từ 1 đến 10';
            todoList.innerHTML = '';
            updateStats([]);
            return;
        }

        todosLoading.style.display = 'block';
        todosError.style.display = 'none';
        todoList.innerHTML = '';

        console.log(`FUNCTION 3: userId: ${userId}`);
        // Gọi API lấy todos cho user
        sendRequest('GET', `https://jsonplaceholder.typicode.com/users/${userId}/todos`, (error, data) => {
            todosLoading.style.display = 'none';
            if (error) {
                console.error(`FUNCTION 3: Lỗi tải todos cho userId ${userId}:`, error);
                todosError.style.display = 'block';
                todosErrorText.textContent = error.message;
                todoList.innerHTML = '';
                updateStats([]);
                return;
            }
            // Lưu todos vào biến cục bộ
            todos = data;
            console.log(`FUNCTION 3: Todos tải thành công cho userId ${userId}:`, todos);
            // Hiển thị theo filter hiện tại
            applyCurrentFilter();
        });
    });

    // lưu vào localStorage
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
    setupUserProfile()
    setupPosts()
    setupTodoList()
})
