const apiServer = 'http://localhost:4001';
const credentials = 'omit'; // 'include' for auth, 'omit' for no auth

// DOM Elements
const columns = [
    document.getElementById('col-1'),
    document.getElementById('col-2'),
    document.getElementById('col-3'),
    document.getElementById('col-4')
];

const loginPage = document.getElementById('login');
const loginErrorMsg = document.getElementById('login-error-msg');
const dashboard = document.getElementById('dashboard');
const loadingPage = document.getElementById('loading');
const modalOverlay = document.getElementById('modal-overlay');

const openEditLinkBtn = document.getElementById('open-edit-link-form-button');
const saveChangesBtn = document.getElementById('save-changes-button');
const createLinkFormDiv = document.getElementById('edit-link-div');
const createLinkForm = document.getElementById('edit-link-form');

const openCreateUserBtn = document.getElementById('create-user-button');
const createUserFormDiv = document.getElementById('create-user-div');
const createUserForm = document.getElementById('create-user-form');

const logoutBtn = document.getElementById('logout');
const activateEditModeBtn = document.getElementById('activate-edit-mode-button');

// State
let editMode = false;
let arrayOfPositionsForBatchMove = [];
let editingMode = 'create';
let idToEdit = '';
let accessToken = null;
let pageInitialised = false;

// Initialization
window.onload = async () => {
    await refreshLogin();
};

// --- Auth Functions ---

async function refreshLogin() {
    try {
        const response = await fetch(`${apiServer}/token`, {
            method: 'POST',
            credentials: `${credentials}`
        });

        if (!response.ok) {
            accessToken = null;
            checkLoggedIn();
            return;
        }

        showLoadingPage();
        const token = await response.json();
        accessToken = token.accessToken;
        startRefreshLoginTimer(accessToken);
        checkLoggedIn();
    } catch (error) {
        console.error('Error refreshing login:', error);
        checkLoggedIn();
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${apiServer}/login`, {
            method: 'POST',
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            loginErrorMsg.style.display = 'block';
            loginErrorMsg.innerText = `Invalid credentials (${response.status})`;
            return;
        }

        const tokens = await response.json();
        accessToken = tokens.accessToken;
        startRefreshLoginTimer(accessToken);
        checkLoggedIn();
    } catch (error) {
        console.error('Login error:', error);
    }
}

async function logout() {
    try {
        await fetch(`${apiServer}/logout`, { method: 'DELETE', credentials: "include" });
        accessToken = null;
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function checkLoggedIn() {
    if (accessToken) {
        showDashboard();
    } else {
        showLoginPage();
    }
}

// --- UI State Functions ---

function showLoadingPage() {
    loadingPage.style.display = 'flex';
    loginPage.style.display = 'none';
    dashboard.style.display = 'none';
}

function showLoginPage() {
    loadingPage.style.display = 'none';
    loginPage.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loadingPage.style.display = 'none';
    loginPage.style.display = 'none';
    dashboard.style.display = 'flex';
    if (!pageInitialised) getLinks();
}

// --- Modal Helpers ---

function openModal(modalDiv) {
    modalOverlay.style.display = 'block';
    modalDiv.style.display = 'block';
}

function closeModal() {
    modalOverlay.style.display = 'none';
    createLinkFormDiv.style.display = 'none';
    createUserFormDiv.style.display = 'none';
}

// --- Event Listeners ---

logoutBtn.addEventListener('click', logout);
modalOverlay.addEventListener('click', closeModal);

activateEditModeBtn.addEventListener('click', toggleEditMode);

openEditLinkBtn.addEventListener('click', () => {
    editingMode = 'create';
    createLinkForm.reset();
    createLinkForm.querySelector('.btn').innerText = 'Create';
    openModal(createLinkFormDiv);
});

openCreateUserBtn.addEventListener('click', () => {
    createUserForm.reset();
    openModal(createUserFormDiv);
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    login(e.target.username.value, e.target.password.value);
});

createLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: e.target.name.value,
        localIp: e.target.localIp.value,
        remoteIp: e.target.remoteIp.value,
        imgUrl: e.target.imgUrl.value
    };

    if (editingMode === 'create') {
        await createLink(data);
    } else {
        await patchLink(idToEdit, data);
    }
    window.location.reload();
});

createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createUser(e.target.username.value, e.target.password.value);
    closeModal();
});

saveChangesBtn.addEventListener('click', async () => {
    if (arrayOfPositionsForBatchMove.length > 0) {
        await batchMoveLinks(arrayOfPositionsForBatchMove);
    }
    toggleEditMode();
});

// --- API Calls ---

async function getLinks() {
    try {
        const response = await fetch(`${apiServer}/links`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!response.ok) return;
        const links = await response.json();
        buildDashboardHtml(links);
        pageInitialised = true;
    } catch (error) {
        console.error('Error getting links:', error);
    }
}

async function createLink(data) {
    await fetch(`${apiServer}/link`, {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ ...data, column: 1 })
    });
}

async function patchLink(id, data) {
    await fetch(`${apiServer}/link/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
}

async function deleteLink(id) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    await fetch(`${apiServer}/link/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    window.location.reload();
}

async function createUser(username, password) {
    await fetch(`${apiServer}/register`, {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ username, password })
    });
}

async function batchMoveLinks(array) {
    await fetch(`${apiServer}/links/batchmove`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(array)
    });
    window.location.reload();
}

// --- Dashboard Builder ---

function buildDashboardHtml(links) {
    links.forEach(link => {
        const column = document.getElementById(`col-${link.column}`);
        if (!column) return;

        const card = document.createElement('div');
        card.className = 'link-card';
        card.id = link.id;

        card.innerHTML = `
            <a href="${link.remoteip}" class="link-card__main" target="_blank">
                <div class="link-card__info">
                    <img src="${link.imgurl}" alt="" class="link-card__icon">
                    <span class="link-card__title">${link.name}</span>
                </div>
                <div class="link-card__status">
                    <div class="link-card__dot" id="${link.localip}-status-local"></div>
                    <div class="link-card__dot" id="${link.remoteip}-status-remote"></div>
                </div>
            </a>
            <div class="link-card__actions">
                <button class="btn btn--secondary btn--sm edit-btn">Edit</button>
                <button class="btn btn--danger btn--sm delete-btn">Delete</button>
            </div>
        `;

        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => {
            idToEdit = link.id;
            editingMode = 'edit';
            createLinkForm.name.value = link.name;
            createLinkForm.localIp.value = link.localip;
            createLinkForm.remoteIp.value = link.remoteip;
            createLinkForm.imgUrl.value = link.imgurl;
            createLinkForm.querySelector('.btn').innerText = 'Update';
            openModal(createLinkFormDiv);
        });

        deleteBtn.addEventListener('click', () => deleteLink(link.id));

        column.appendChild(card);
    });
}

// --- Drag and Drop logic (Simplified/Updated) ---

function toggleEditMode() {
    editMode = !editMode;
    dashboard.classList.toggle('dashboard--edit-mode', editMode);
    
    openEditLinkBtn.style.display = editMode ? 'inline-flex' : 'none';
    saveChangesBtn.style.display = editMode ? 'inline-flex' : 'none';

    document.querySelectorAll('.link-card').forEach(card => {
        card.classList.toggle('link-card--edit-mode', editMode);
        card.draggable = editMode;
    });

    if (editMode) {
        initDragAndDrop();
    }
}

function initDragAndDrop() {
    const draggables = document.querySelectorAll('.link-card');
    const containers = document.querySelectorAll('.column__content');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            const columnId = draggable.parentElement.id.split('-')[1];
            const afterElement = getAfterElement(draggable.parentElement, event.clientY);
            arrayOfPositionsForBatchMove.push({
                idToMove: draggable.id,
                relativeToId: afterElement ? afterElement.id : undefined,
                targetColumn: columnId
            });
        });
    });

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getAfterElement(container, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });
    });
}

function getAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.link-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- Auth Helpers ---

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
}

function startRefreshLoginTimer(token) {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return;
    const expiresInMs = (payload.exp * 1000) - Date.now();
    setTimeout(refreshLogin, expiresInMs - 5000);
}