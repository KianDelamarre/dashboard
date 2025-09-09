// const { parse } = require("path")

let column1 = document.getElementById('col-1')
let column2 = document.getElementById('col-2')
let column3 = document.getElementById('col-3')
let column4 = document.getElementById('col-4')


let loginPage = document.getElementById('login')
let loginErrorMsg = document.getElementById('login-error-msg')
let dashboard = document.getElementById('dashboard')
const loadingPage = document.getElementById('loading')

const logoutBtn = document.getElementById('logout')

let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

logoutBtn.addEventListener('click', () => {
    logout();
})

let accessToken = null;
// let refreshToken;

let pageInitialised = false


window.onload = async () => {
    // await refreshLogin()
    checkLoggedIn()
}

function checkLoggedIn() {
    // loadingPage.style.display = 'block'
    if (!accessToken) {
        showDashBoard()
    }
    else {
        showLoginPage()
    }
}

function showLoginPage() {
    loginPage.style.display = 'flex'
    dashboard.style.display = 'none'
    loadingPage.style.display = 'none'

}

function showDashBoard() {
    loginPage.style.display = 'none'
    dashboard.style.display = 'flex'
    loadingPage.style.display = 'none'
    // if (!pageInitialised) initLinks()
}

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = event.target.username.value
    const password = event.target.password.value
    login(username, password)
})

document.getElementById('create-link-form').addEventListener('submit', function (event) {
    // event.preventDefault()
    const name = event.target.name.value
    const localIp = event.target.localIp.value
    const remoteIp = event.target.remoteIp.value
    const imgUrl = event.target.imgUrl.value

    createLink(name, localIp, remoteIp, imgUrl)
    console.log('tried creating element')
})

// window.onload(refreshLogin())



let getLinks = async () => {
    const response = await fetch('http://localhost:2001/links', {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    })

    if (!response.ok) {
        console.error(response.status)
        return
    }
    const linksJson = await response.json()
    console.log(linksJson)

    buildDashboardHtml(linksJson)
}



let createLink = async (name, localIp, remoteIp, imgUrl) => {
    const response = await fetch('http://localhost:2001/link', {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            'name': name,
            'localIp': localIp,
            'remoteIp': remoteIp,
            'imgUrl': imgUrl,
            'column': 1
        })
    })

    if (!response.ok) {
        console.error(response.status)
        return
    }
    console.log(`${name} added`)
}

getLinks()
// createLink('readarr', '127.0.0.1:8000', 'https://kav.example.com', 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/kavita', '1')


let refreshLogin = async () => {
    const response = await fetch('https://apiauth.example.com/token', {
        method: 'POST',
        credentials: 'include'
    })

    if (!response.ok) {
        console.error('error logging in', response.status)
        accessToken = null
        checkLoggedIn()
        return;
    }
    const token = await response.json();
    accessToken = token.accessToken
    startRefreshLoginTimer(accessToken)
    checkLoggedIn()
    console.log(`login refreshed new token ${token}`)
}


let login = async (username, password) => {
    console.log('login method called')
    const response = await fetch('https://apiauth.example.com/login', {
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
    const response = await fetch('https://apiauth.example.com/logout', {
        method: 'DELETE',
        credentials: "include"
    })

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
    const response = await fetch('https://api.example.com/links', {
        method: 'GET',
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
        console.log(array[i].column)
        const columnId = `col-${array[i].column}`
        let columnElement = document.getElementById(columnId)

        console.log(columnId)
        let linkA = document.createElement('a')
        linkA.className = 'btn'
        linkA.id = array[i].id
        linkA.href = array[i].remoteip

        let imgDiv = document.createElement('div')
        imgDiv.className = 'imgDiv'
        let img = document.createElement('img')
        img.src = array[i].imgurl
        console.log(array[i])

        imgDiv.appendChild(img)

        let nameDiv = document.createElement('div')
        nameDiv.className = 'btnTitle'

        let name = document.createElement('span')
        name.innerText = array[i].name

        nameDiv.append(name)

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

        let deleteButton = document.createElement('div')
        deleteButton.className = 'delete-link'
        deleteButton.innerText = 'X'

        let editButton = document.createElement('div')
        editButton.className = 'edit-link'
        editButton.innerText = 'Edit'

        circle2.appendChild(statusRemote)

        linkA.appendChild(imgDiv)
        linkA.appendChild(nameDiv)
        linkA.appendChild(circle1)
        linkA.appendChild(circle2)
        linkA.appendChild(deleteButton)
        linkA.appendChild(editButton)
        columnElement.appendChild(linkA)

        deleteButton.addEventListener('click', () => {

        })

        linkA.addEventListener('mousedown', e => {
            console.log(`${name} clicked`)
            draggedElement = e.currentTarget  //set draggedElement to the element with the eventlistener
            const rect = draggedElement.getBoundingClientRect();
            // console.log(`rect left = ${rect.left}`)
            // console.log(`rect top = ${rect.top}`)
            // console.log(`page x = ${e.pageX}`)
            // console.log(`page y = ${e.pageY}`)
            // console.log(`windo page offset x = ${window.pageXOffset}`)  //accounts for number of pixels scrolled left
            // console.log(`window page offset y = ${window.pageXOffset}`)  //accounts for number of pixels scrolled down

            offsetX = e.pageX - (rect.left + window.pageXOffset);
            offsetY = e.pageY - (rect.top + window.pageYOffset);

            draggedElement.style.width = rect.width + 'px';
            draggedElement.style.height = rect.height + 'px';
            // console.log(`width = ${linkA.style.width} height = ${linkA.style.height}`)
            // console.log(`width = ${rect.width} height = ${rect.height}`)

            draggedElement.style.position = 'absolute';
            draggedElement.style.zIndex = 1000;
            // moveAt(e.pageX, e.pageY)
        })
    }
}

let deleteLink = async (element) => {
    const idToDelete = element.id
    const response = await fetch(`http://localhost:2001/links/${idToDelete}`, {
        method: 'DELETE'
    })

    if (!response.ok) {
        console.error('Error fetching links:', response.status);
        return;
    }

    console.log(`${idToDelete} deleted successfully`)

    window.location.reload()
}

let moveLink = async (dropTarget, draggedElement) => {
    const columnId = dropTarget.id
    const columnNumber = columnId.split('-')[1];
    const response = await fetch(`http://localhost:2001/link/${draggedElement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'column': columnNumber
        })
    })

    if (!response.ok) {
        console.error('Error fetching links:', response.status);
        pageInitialised = false
        return;
    };

    window.location.reload()
}

document.addEventListener('mousemove', e => {
    if (!draggedElement) return;
    moveAt(e.pageX, e.pageY);
});

function moveAt(pageX, pageY) {
    draggedElement.style.left = pageX - offsetX + 'px';
    draggedElement.style.top = pageY - offsetY + 'px';
}

document.addEventListener('mouseup', e => {
    if (!draggedElement) return;

    // Optional: detect which column the mouse is over
    const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest('.btn-container');

    if (dropTarget) {
        (moveLink(dropTarget, draggedElement))
        // console.log(`drop target is ${dropTarget.id}`)
    }

    // Reset styles
    draggedElement.style.position = '';
    draggedElement.style.width = '';
    draggedElement.style.height = '';
    draggedElement.style.zIndex = '';

    draggedElement = null;
});

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

let changeColumn = () => {

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