// const { parse } = require("path")
const apiServer = 'http://localhost:4001'
let column1 = document.getElementById('col-1')
let column2 = document.getElementById('col-2')
let column3 = document.getElementById('col-3')
let column4 = document.getElementById('col-4')


let loginPage = document.getElementById('login')
let loginErrorMsg = document.getElementById('login-error-msg')

let openEditLinkFormBtn = document.getElementById('open-edit-link-form-button')
openEditLinkFormBtn.style.display = 'none'
let saveChangesBtn = document.getElementById('save-changes-button')
saveChangesBtn.style.display = 'none'
let createLinkForm = document.getElementById('edit-link-div')
let createLinkBuffer = document.getElementById('edit-link-buffer')

let dashboard = document.getElementById('dashboard')
const loadingPage = document.getElementById('loading')

const logoutBtn = document.getElementById('logout')

let editMode = false
let arrayOfPositionsForBatchMove = []

let editingMode = 'create'
let idToEdit = ''

let draggedElement = null;
let offsetX = 0;
let offsetY = 0;


const credentials = 'omit'     //'include' for auth, 'omit' for no auth

logoutBtn.addEventListener('click', () => {
    logout();
})

let accessToken = null;
// let refreshToken;

let pageInitialised = false


window.onload = async () => {
    // showLoadingPage()
    // await refreshLogin()             //enable when reenabling auth
    checkLoggedIn()                     //disable when reenabling auth
}


function checkLoggedIn() {
    showLoadingPage()                    //disable when reenabling auth
    accessToken = null;                  //disable when reenabling auth
    if (!accessToken) {                  //remove ! when reenabling auth
        showDashBoard()
    }
    else {
        showLoginPage()
    }
}

function showLoadingPage() {
    loadingPage.style.display = 'block'
    loginPage.style.display = 'none'
    dashboard.style.display = 'none'
}

function showLoginPage() {
    loadingPage.style.display = 'none'
    loginPage.style.display = 'flex'
    dashboard.style.display = 'none'
}

function showDashBoard() {
    loadingPage.style.display = 'none'
    loginPage.style.display = 'none'
    dashboard.style.display = 'flex'

    if (!pageInitialised) getLinks()

}

document.getElementById('activate-edit-mode-button').addEventListener('click', () => {
    if (!editMode) {

        openEditLinkFormBtn.style.display = 'flex'
        saveChangesBtn.style.display = 'flex'

        document.querySelectorAll('.edit-link-btns').forEach(btn => {
            btn.style.display = 'flex';
        });
        document.querySelectorAll('.btn-container').forEach(btn => {
            btn.classList.add('hover')
        });

        const draggables = document.querySelectorAll('.link-div')
        const containers = document.querySelectorAll('.btn-container')

        makeDraggable(draggables, containers, '.link-div')

    }
    else if (editMode) {
        openEditLinkFormBtn.style.display = 'none'
        saveChangesBtn.style.display = 'none'
        document.querySelectorAll('.edit-link-btns').forEach(btn => {
            btn.style.display = 'none';
        });
        document.querySelectorAll('.btn-container').forEach(btn => {
            btn.classList.remove('hover')
        });

    }

    editMode = !editMode
})

openEditLinkFormBtn.addEventListener('click', () => {
    editingMode = 'create'
    createLinkForm.style.display = 'flex'
    createLinkBuffer.style.display = 'flex'
})
document.getElementById('edit-link-buffer').addEventListener('click', () => {
    createLinkForm.style.display = 'none'
    createLinkBuffer.style.display = 'none'
})

document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = event.target.username.value
    const password = event.target.password.value
    login(username, password)
})

document.getElementById('edit-link-form').addEventListener('submit', async function (event) {
    event.preventDefault()

    const name = event.target.name.value
    const localIp = event.target.localIp.value
    const remoteIp = event.target.remoteIp.value
    const imgUrl = event.target.imgUrl.value

    if (editingMode == 'create') {
        await createLink(name, localIp, remoteIp, imgUrl)  //await because request needs to finish sending before reloading
        // console.log('creating')
    }
    else if (editingMode == 'edit') {
        await editLink(idToEdit, name, localIp, remoteIp, imgUrl)
        // console.log('editing')
    }

    idToEdit = null

    document.getElementById('edit-link-form').reset();
    window.location.reload()
    // console.log('tried creating element')
})

saveChangesBtn.addEventListener('click', async () => {
    if (arrayOfPositionsForBatchMove) await batchMoveLinks(arrayOfPositionsForBatchMove)
})


// window.onload(refreshLogin())

let getLinks = async () => {
    const response = await fetch(`${apiServer}/links`, {
        method: 'GET',
        credentials: `${credentials}`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        console.error(response.status)
        return
    }
    const linksJson = await response.json()
    // console.log(linksJson)
    console.log('got links')

    buildDashboardHtml(linksJson)
    pageInitialised = true
}



let createLink = async (name, localIp, remoteIp, imgUrl) => {
    console.log('trying to create link')
    const response = await fetch(`${apiServer}/link`, {
        method: "POST",
        credentials: `${credentials}`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            'name': name,
            'localIp': localIp,
            'remoteIp': remoteIp,
            'imgUrl': imgUrl,
            'column': 1,
            // 'row': 1
        })
    })

    if (!response.ok) {
        console.error(response.status)
        return
    }
    console.log(`${name} added`)
}

// getLinks()
// createLink('readarr', '127.0.0.1:8000', 'https://kav.example.com', 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/kavita', '1')


let refreshLogin = async () => {

    const response = await fetch(`${apiServer}/token`, {
        method: 'POST',
        credentials: `${credentials}`
    })

    if (!response.ok) {
        console.error('error logging in', response.status)
        accessToken = null
        console.log(response)
        checkLoggedIn()
        return;
    }
    showLoadingPage()
    const token = await response.json();
    accessToken = token.accessToken
    startRefreshLoginTimer(accessToken)
    checkLoggedIn()
    console.log(`login refreshed new token ${token}`)
}


let login = async (username, password) => {
    console.log('login method called')
    const response = await fetch(`${apiServer}/login`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username, password
        })
    })

    if (!response.ok) {
        // console.error('error logging in', response.status)
        loginErrorMsg.style.display = 'flex';
        loginErrorMsg.innerText = `error logging in ${response.status}`
        return;
    }

    const tokens = await response.json();
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    startRefreshLoginTimer(accessToken)

    checkLoggedIn()
    console.log(tokens)
}

let logout = async () => {
    const response = await fetch(`${apiServer}/logout`, {
        method: 'DELETE',
        credentials: "include"
        // headers: { 'Authorization': `Bearer ${accessToken}` }
    }
    )

    if (!response.ok) {
        console.error('logging out:', response.status);
        return;
    };

    accessToken = null
    console.clear();
    // window.location.reload()
    window.location.href = window.location.href;

}

let initLinks = async () => {
    if (pageInitialised) return
    pageInitialised = true
    const response = await fetch(`${apiServer}/links`, {
        method: 'GET',
        credentials: `${credentials}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching links:', response.status);
        pageInitialised = false
        return;
    };

    const jsonData = await response.json()

    console.log(jsonData)

    buildHtml(jsonData, 0, 6, column1)
    buildHtml(jsonData, 6, 11, column2)
    buildHtml(jsonData, 11, 15, column3)
    buildHtml(jsonData, 15, 17, column4)

}

let buildDashboardHtml = (array) => {
    for (let i = 0; i < array.length; i++) {
        // console.log(array[i])
        const columnId = `col-${array[i].column}`
        let columnElement = document.getElementById(columnId)

        // console.log(columnId)

        let linkDiv = document.createElement('div')
        linkDiv.className = 'link-div'
        linkDiv.id = array[i].id

        let editLinkBtns = document.createElement('div')
        editLinkBtns.className = 'edit-link-btns'


        let linkA = document.createElement('a')
        linkA.className = 'btn'
        // linkA.id = array[i].id
        linkA.href = array[i].remoteip
        linkA.draggable = true

        let imgDiv = document.createElement('div')
        imgDiv.className = 'imgDiv'
        let img = document.createElement('img')
        img.src = array[i].imgurl
        // console.log(array[i])

        imgDiv.appendChild(img)

        let nameDiv = document.createElement('div')
        nameDiv.className = 'btnTitle'

        let name = document.createElement('span')
        name.innerText = array[i].name

        nameDiv.append(name)

        let circlesDiv = document.createElement('div')
        circlesDiv.className = 'circlesDiv'

        let circle1 = document.createElement('div')
        circle1.className = 'circleDiv'

        let statusLocal = document.createElement('div')
        statusLocal.className = 'circle'
        statusLocal.id = `${array[i].localip}-status-local`

        circle1.appendChild(statusLocal)

        let circle2 = document.createElement('div')
        circle2.className = 'circleDiv'

        let statusRemote = document.createElement('div')
        statusRemote.className = 'circle'
        statusRemote.id = `${array[i].remoteip}-status-remote`

        let editButton = document.createElement('div')
        editButton.className = 'edit-link'
        editButton.innerText = 'EDIT'

        let deleteButton = document.createElement('div')
        deleteButton.className = 'delete-link'
        deleteButton.innerText = 'DELETE'



        circle2.appendChild(statusRemote)

        linkA.appendChild(imgDiv)
        linkA.appendChild(nameDiv)

        circlesDiv.appendChild(circle1)
        circlesDiv.appendChild(circle2)
        linkA.appendChild(circlesDiv)
        editLinkBtns.appendChild(editButton)
        editLinkBtns.appendChild(deleteButton)

        linkDiv.appendChild(editLinkBtns)
        linkDiv.appendChild(linkA)
        columnElement.appendChild(linkDiv)

        deleteButton.addEventListener('click', () => {
            // console.log(linkA.id)
            deleteLink(linkDiv.id)
        })

        editButton.addEventListener('click', () => {
            idToEdit = linkDiv.id
            editingMode = 'edit'
            console.log(linkDiv.id, editingMode)
            createLinkForm.style.display = 'flex'
            createLinkBuffer.style.display = 'flex'

        })

        // linkA.addEventListener('mousedown', e => {
        //     // console.log(`${name} clicked`)
        //     if (!editMode) return // disable draggable if not in edit mode
        //     draggedElement = e.currentTarget  //set draggedElement to the element with the eventlistener
        //     const rect = draggedElement.getBoundingClientRect();
        //     // console.log(`rect left = ${rect.left}`)
        //     // console.log(`rect top = ${rect.top}`)
        //     // console.log(`page x = ${e.pageX}`)
        //     // console.log(`page y = ${e.pageY}`)
        //     // console.log(`windo page offset x = ${window.pageXOffset}`)  //accounts for number of pixels scrolled left
        //     // console.log(`window page offset y = ${window.pageXOffset}`)  //accounts for number of pixels scrolled down

        //     offsetX = e.pageX - (rect.left + window.pageXOffset);
        //     offsetY = e.pageY - (rect.top + window.pageYOffset);

        //     draggedElement.style.width = rect.width + 'px';
        //     draggedElement.style.height = rect.height + 'px';
        //     // console.log(`width = ${linkA.style.width} height = ${linkA.style.height}`)
        //     // console.log(`width = ${rect.width} height = ${rect.height}`)

        //     draggedElement.style.position = 'absolute';
        //     draggedElement.style.zIndex = 1000;
        //     // moveAt(e.pageX, e.pageY)
        // })
    }
}

function makeDraggable(draggables, containers, draggablesClass) {
    let afterElement

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            console.log(`dragging ${draggable.id}`)
            draggable.classList.add('dragging')
        })

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
            const draggableId = draggable.id
            const column = draggable.parentElement
            if (draggable) {
                console.log("after element " + afterElement?.id ?? undefined);
                const columnId = column.id;
                const columnNumber = columnId.split('-')[1];
                arrayOfPositionsForBatchMove.push({ idToMove: draggableId, relativeToId: afterElement?.id ?? undefined, targetColumn: columnNumber })
                console.log(arrayOfPositionsForBatchMove)
                // moveLink(draggableId, afterElement?.id ?? undefined, column);

            }
        })
    })

    containers.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault()  //allows dropping in an element and removes not allowed cursor
            afterElement = getDragAfterElement(column, e.clientY)
            const draggable = document.querySelector('.dragging')  //can only drag one element, so the only element with class draggable is the one we are dragging

            if (afterElement == null) {
                column.appendChild(draggable)
                afterElement = column.children[column.children.length - 2]
            }
            else {
                column.insertBefore(draggable, afterElement)
            }

            afterElement = getDragAfterElement(column, e.clientY)  //not sure why but having this here fixed an issue where dragend would only use the first afterElement value set by this dragover

        })
    })

    function getDragAfterElement(column, mouseY) {
        //return the element positioned right after where the mouse is positioned, to append above that element
        const draggableElements = [...column.querySelectorAll(`${draggablesClass}:not(.dragging)`)]   //gets every element but the one we're dragging, spreads them to an array
        return draggableElements.reduce((closest, child) => { //gets the next element after a pa
            const box = child.getBoundingClientRect()
            const offset = mouseY - box.top - box.height / 2
            // console.log(offset)
            if (offset < 0 && offset > closest.offset) {//so above an element
                return { offset: offset, element: child }
            }
            else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }
}

let deleteLink = async (idToDelete) => {
    // const idToDelete = element.id
    const response = await fetch(`${apiServer}/link/${idToDelete}`, {
        method: 'DELETE',
        credentials: `${credentials}`,
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    if (!response.ok) {
        console.error('Error fetching links:', response.status);
        return;
    }

    console.log(`${idToDelete} deleted successfully`)

    window.location.reload()
}

let editLink = async (idToEdit, name, localIp, remoteIp, imgUrl) => {

    const response = await fetch(`${apiServer}/link/${idToEdit}`, {
        method: 'PATCH',
        credentials: `${credentials}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            'name': name || null,
            'localIp': localIp || null,
            'remoteIp': remoteIp || null,
            'imgUrl': imgUrl || null,
        })
    })
    if (!response.ok) {
        console.error('Error fetching links:', response.status);
        pageInitialised = false
        return;
    };
}

// let moveLink = async (dropTarget, draggedElement) => {
//     const columnId = dropTarget.id
//     const columnNumber = columnId.split('-')[1];
//     const response = await fetch(`http://localhost:2001/link/${draggedElement.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             'column': columnNumber
//         })
//     })

//     if (!response.ok) {
//         console.error('Error fetching links:', response.status);
//         pageInitialised = false
//         return;
//     };

//     window.location.reload()
// }

let moveLink = async (draggedElementId, elemtentToPutAboveId, column) => {
    console.log('tried to move element');
    const columnId = column.id;
    const columnNumber = columnId.split('-')[1];
    // console.log(draggedElementId, elemtentToPutAboveId, columnNumber,)

    const response = await fetch(`${apiServer}/links/move`, {
        method: 'PATCH',
        credentials: `${credentials}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "idToMove": draggedElementId,
            "relativeToId": elemtentToPutAboveId,
            "targetColumn": columnNumber
        })
    })

    if (!response.ok) {
        console.log('Error fetching links:', response.status);
        pageInitialised = false
        return;
    };
    console.log('moved element')
    window.location.reload()
}

let batchMoveLinks = async (array) => {
    console.log('tried to move element');
    // const columnId = column.id;
    // const columnNumber = columnId.split('-')[1];

    // console.log(draggedElementId, elemtentToPutAboveId, columnNumber,)

    const response = await fetch(`${apiServer}/links/batchmove`, {
        method: 'PATCH',
        credentials: `${credentials}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(array)
    })

    if (!response.ok) {
        console.log('Error fetching links:', response.status);
        pageInitialised = false
        return;
    };
    console.log('moved element')
    window.location.reload()
}

// document.addEventListener('mousemove', e => {
//     if (!draggedElement) return;
//     moveAt(e.pageX, e.pageY);
// });

// function moveAt(pageX, pageY) {
//     draggedElement.style.left = pageX - offsetX + 'px';
//     draggedElement.style.top = pageY - offsetY + 'px';
// }

// document.addEventListener('mouseup', e => {
//     if (!draggedElement) return;

//     // Optional: detect which column the mouse is over
//     const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest('.btn-container');

//     if (dropTarget) {
//         (moveLink(dropTarget, draggedElement))
//         // console.log(`drop target is ${dropTarget.id}`)
//     }

//     // Reset styles
//     draggedElement.style.position = '';
//     draggedElement.style.width = '';
//     draggedElement.style.height = '';
//     draggedElement.style.zIndex = '';

//     draggedElement = null;
// });

let buildHtml = (array, start, end, idToAppend) => {
    for (let i = start; i < end; i++) {
        let linkA = document.createElement('a')
        linkA.className = 'btn'
        linkA.id = array[i].appName
        linkA.href = array[i].appUrl

        let imgDiv = document.createElement('div')
        imgDiv.className = 'imgDiv'
        let img = document.createElement('img')
        img.src = `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${array[i].appName.toLowerCase()}.png`

        imgDiv.appendChild(img)

        let nameDiv = document.createElement('div')
        nameDiv.className = 'btnTitle'

        let name = document.createElement('span')
        name.innerText = array[i].appName

        nameDiv.append(name)

        let circle1 = document.createElement('div')
        circle1.className = 'circleDiv'

        let statusLocal = document.createElement('div')
        statusLocal.className = 'circle'
        statusLocal.id = `${array[i].appName.toLowerCase()}-status-local`

        circle1.appendChild(statusLocal)

        let circle2 = document.createElement('div')
        circle2.className = 'circleDiv'

        let statusRemote = document.createElement('div')
        statusRemote.className = 'circle'
        statusRemote.id = `${array[i].appName.toLowerCase()}-status-remote`

        circle2.appendChild(statusRemote)

        linkA.appendChild(imgDiv)
        linkA.appendChild(nameDiv)
        linkA.appendChild(circle1)
        linkA.appendChild(circle2)
        idToAppend.appendChild(linkA)
    }

}


function parseJwt(token) {
    const payloadBase64 = token.split('.')[1]   //splits payload into 3 parts and store as an array, jwt consists of header.payload.signature, so [1] gets the payload 
    const payloadJson = atob(payloadBase64)  ///decode the payload]
    return JSON.parse(payloadJson)   //return the decoded payload
}

function startRefreshLoginTimer(accessToken) {
    const payload = parseJwt(accessToken)
    const expiresAt = payload.exp * 1000  //exp is in seconds so we need to convert to miliseconds for js to use, exp is just an amount of time since january 1 1970, so it corresponds to an exact date and time
    const now = Date.now()  //get the current time in ms (relative to january 1st 1970)
    const expiresInMs = expiresAt - now //get the number of ms until it expires

    setTimeout(() => {   /// set access token null and call refreshLogin, 5s before accessToken expires
        accessToken = null
        console.log('trying to log in again')
        refreshLogin()
    }, expiresInMs - 5000)
}


// initLinks()