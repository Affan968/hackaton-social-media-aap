const postInput = document.getElementById('postInput');
const postImage = document.getElementById('postImage');
const createPostBtn = document.getElementById('createPostBtn');
const postsContainer = document.getElementById('postsContainer');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const postTitleInput = document.getElementById('postTitleInput');

// Modal elements
const createPostModal = document.getElementById('createPostModal');
const openModalBtn = document.getElementById('openCreatePostModal');
const closeModalBtn = document.getElementById('closeCreatePostModal');

// Logout button
const logoutBtn = document.getElementById('logoutBtn');

// Sidebar profile elements (IDs added in HTML)
const sidebarNameElement = document.getElementById('sidebarUserName');
const profileInitialElement = document.getElementById('profileInitial');

/* ---------------- USER MANAGEMENT ---------------- */

function getUserName() {
    let userName = localStorage.getItem('userName');

    if (!userName || userName.trim() === "") {
        userName = prompt("Enter your username:");

        if (!userName || userName.trim() === "") {
            userName = "You";
        }

        localStorage.setItem('userName', userName.trim());
    }
    return userName.trim();
}

function updateUserNameInSidebar() {
    const userName = getUserName();

    if (sidebarNameElement) {
        sidebarNameElement.textContent = userName;
    }

    // Fallback/Default avatar URL using the initial
    if (profileInitialElement && userName.length > 0) {
        const initial = userName.charAt(0).toUpperCase();
        profileInitialElement.src = `https://via.placeholder.com/150/FFFFFF/4F46E5?text=${initial}`;
        profileInitialElement.alt = `${userName}'s Avatar`;
    }
}

/* ---------------- LOGOUT ---------------- */

function handleLogout() {
    const confirmation = confirm("Are you sure you want to logout? All local posts will be cleared?");
    if (confirmation) {
        localStorage.removeItem("loginData");
        window.location.href = "./signup/login/login.html";
    }
}



/* ---------------- INITIALIZATION ---------------- */

document.addEventListener('DOMContentLoaded', () => {
    renderPosts('latest');
    updateUserNameInSidebar();

    if (searchInput) {
        searchInput.addEventListener('input', filterAndSortPosts);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndSortPosts);
    }

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            createPostModal.classList.remove('hidden');
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            createPostModal.classList.add('hidden');
            postTitleInput.value = '';
            postInput.value = '';
            postImage.value = '';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/* ---------------- LOCAL STORAGE HELPERS ---------------- */

function getPostsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

function savePostToLocalStorage(post) {
    const posts = getPostsFromLocalStorage();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function updatePostInLocalStorage(updatedPost) {
    const posts = getPostsFromLocalStorage();
    const postIndex = posts.findIndex(p => p.id === updatedPost.id);
    if (postIndex !== -1) {
        posts[postIndex] = updatedPost;
        localStorage.setItem('posts', JSON.stringify(posts));
    }
}

function updatePostLikes(id, likes, liked) {
    const posts = getPostsFromLocalStorage();
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex !== -1) {
        posts[postIndex].likes = likes;
        posts[postIndex].liked = liked;
        localStorage.setItem('posts', JSON.stringify(posts));
    }
}

function removePostFromLocalStorage(id) {
    let posts = getPostsFromLocalStorage();
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(posts));
}

/* ---------------- SORT / FILTER ---------------- */

function sortPosts(posts, criteria) {
    if (criteria === 'latest') {
        return posts.sort((a, b) => b.id - a.id);
    } else if (criteria === 'oldest') {
        return posts.sort((a, b) => a.id - b.id);
    } else if (criteria === 'most_liked') {
        return posts.sort((a, b) => {
            if (b.likes !== a.likes) {
                return b.likes - a.likes;
            }
            return b.id - a.id;
        });
    }
    return posts;
}

function renderPosts(sortCriteria, searchTerm = '') {
    postsContainer.innerHTML = '';

    let posts = getPostsFromLocalStorage();
    const lowerCaseSearch = searchTerm.toLowerCase();

    if (searchTerm) {
        posts = posts.filter(post =>
            (post.title && post.title.toLowerCase().includes(lowerCaseSearch)) ||
            (post.content && post.content.toLowerCase().includes(lowerCaseSearch))
        );
    }

    const sortedPosts = sortPosts(posts, sortCriteria);

    if (sortedPosts.length === 0) {
        postsContainer.innerHTML = `<p class="text-text-light p-4 text-center">No posts found.</p>`;
    } else {
        const fragment = document.createDocumentFragment();
        sortedPosts.forEach(post => {
            fragment.appendChild(createPostElement(post));
        });
        postsContainer.appendChild(fragment);
    }
}

function filterAndSortPosts() {
    const sortCriteria = sortSelect ? sortSelect.value : 'latest';
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    renderPosts(sortCriteria, searchTerm);
}

/* ---------------- ADD POST ---------------- */

createPostBtn.addEventListener('click', () => {
    const title = postTitleInput.value.trim();
    const content = postInput.value.trim();
    const file = postImage.files[0];

    if (!title) return alert("Title is required.");
    if (!content && !file) return alert("Please enter text or upload an image.");

    const userName = getUserName();
    const userInitial = userName.charAt(0).toUpperCase();

    const handlePostCreation = (imageSrc) => {
        const postObj = {
            id: Date.now(),
            title: title.trim(),
            content,
            image: imageSrc || null,
            likes: 0,
            liked: false,
            userName: userName,
            userInitial: userInitial,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        savePostToLocalStorage(postObj);
        filterAndSortPosts();

        postTitleInput.value = '';
        postInput.value = '';
        postImage.value = '';
        createPostModal.classList.add('hidden');
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = e => handlePostCreation(e.target.result);
        reader.readAsDataURL(file);
    } else {
        handlePostCreation(null);
    }
});

/* ---------------- EDIT MODE ---------------- */

function setupEditListeners(postDiv, post, currentImage) {
    const editTitleInput = postDiv.querySelector('.edit-title-input');
    const editContentInput = postDiv.querySelector('.edit-content-input');
    const editImageInput = postDiv.querySelector('.edit-image-input');
    const saveBtn = postDiv.querySelector('.saveBtn');
    const cancelBtn = postDiv.querySelector('.cancelBtn');

    saveBtn.addEventListener('click', () => {
        const newTitle = editTitleInput.value.trim();
        const newContent = editContentInput.value.trim();
        const newFile = editImageInput.files[0];

        if (!newTitle) return alert("Title is required.");

        const updatePost = (imageSrc) => {
            const updatedPost = {
                ...post,
                title: newTitle,
                content: newContent,
                image: imageSrc,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };

            updatePostInLocalStorage(updatedPost);
            filterAndSortPosts();
        };

        if (newFile) {
            const reader = new FileReader();
            reader.onload = e => updatePost(e.target.result);
            reader.readAsDataURL(newFile);
        } else {
            const deleteImageChecked = postDiv.querySelector('.delete-image-checkbox')?.checked;
            const finalImage = deleteImageChecked ? null : currentImage;
            updatePost(finalImage);
        }
    });

    cancelBtn.addEventListener('click', () => {
        filterAndSortPosts();
    });
}

function setEditMode(postDiv, post) {
    const { title, content, image } = post;
    const currentImage = image;

    // The inline classes here use the utility classes defined at the end of style.css
    postDiv.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <strong class="text-text-dark">Editing Post</strong>
            <div class="flex space-x-2">
                <button class="saveBtn bg-green-500 text-white p-2 rounded-lg text-sm">Save</button>
                <button class="cancelBtn bg-gray-500 text-white p-2 rounded-lg text-sm">Cancel</button>
            </div>
        </div>
        
        <input type="text" class="edit-title-input w-full p-2 mb-2 border rounded font-bold text-lg" value="${title}">

        <textarea class="edit-content-input w-full p-2 mb-4 border rounded" rows="4">${content || ''}</textarea>

        <div class="mb-4 p-3 border rounded-lg bg-gray-50">
            <label class="block text-sm font-medium text-gray-700 mb-2">Update Image:</label>
            ${image ? `<img src="${image}" class="current-image rounded-lg max-h-40 object-cover mb-2 border">` : ''}

            <input type="file" class="edit-image-input w-full mb-2 text-sm" accept="image/*">
            
            ${image ? `
                <div class="flex items-center mt-1">
                    <input type="checkbox" class="delete-image-checkbox h-4 w-4 text-red-600 mr-2">
                    <label class="text-sm text-red-600">Delete Current Image</label>
                </div>`
            : ''}
        </div>
    `;

    setupEditListeners(postDiv, post, currentImage);
}

/* ---------------- POST ELEMENT UI ---------------- */

function createPostElement(post) {
    const { id, title, content, image, likes, liked, time, userName, userInitial } = post;

    // Safety check for user data (removed signupUser dependency for simplicity)
    const displayName = userName || 'Unknown User';

    let postDiv = document.createElement('div');
    postDiv.className = 'post-item'; // Use the main class for styling
    postDiv.dataset.id = id;

    // Improved UI structure for better alignment (using flexbox utility classes defined in CSS)
    postDiv.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
                <img class="w-8 h-8 rounded-full object-cover"
                    src="https://via.placeholder.com/150/4F46E5/FFFFFF?text=${userInitial}"
                    alt="${userName}">
                <div>
                    <strong class="text-lg font-semibold text-text-dark post-title">${displayName}</strong>
                    <span class="text-xs text-text-light block">by ${userName} - ${time}</span>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="editBtn text-blue-500 hover:text-blue-700 p-1 rounded-full">✏️</button>
                <button class="deleteBtn text-red-500 hover:text-red-700 p-1 rounded-full">🗑️</button>
            </div>
        </div>
        
        <strong class="text-lg font-bold text-text-dark">${title}</strong>

        ${content ? `<p class="text-text-dark post-content">${content}</p>` : ''}
        
        ${image ? `<img src="${image}" class="rounded-lg max-h-96 w-full object-cover border post-image">` : ''}

        <button class="likeBtn flex items-center text-gray-500 hover:text-red-500 ${liked ? 'text-red-500' : ''}">
            <span class="text-lg mr-1">${liked ? '❤️' : '🤍'}</span>
            <span>${likes} Likes</span>
        </button>
    `;

    // Like button
    postDiv.querySelector('.likeBtn').addEventListener('click', () => {
        const currentPost = getPostsFromLocalStorage().find(p => p.id === id) || post;
        let isLiked = !currentPost.liked;
        let currentLikes = currentPost.likes + (isLiked ? 1 : -1);

        updatePostLikes(id, currentLikes, isLiked);
        filterAndSortPosts();
    });

    // Delete button
    postDiv.querySelector('.deleteBtn').addEventListener('click', () => {
        postDiv.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            removePostFromLocalStorage(id);
            filterAndSortPosts();
        }, 300);
    });

    // Edit button
    postDiv.querySelector('.editBtn').addEventListener('click', () => {
        setEditMode(postDiv, post);
    });

    return postDiv;
}