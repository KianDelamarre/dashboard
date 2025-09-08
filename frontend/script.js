// const { parse } = require("path")

let column1 = document.getElementById('column1')
let column2 = document.getElementById('column2')
let column3 = document.getElementById('column3')
let column4 = document.getElementById('column4')

let loginPage = document.getElementById('login')
let loginErrorMsg = document.getElementById('login-error-msg')
let dashboard = document.getElementById('dashboard')
const loadingPage = document.getElementById('loading')

const logoutBtn = document.getElementById('logout')

logoutBtn.addEventListener('click', () => {
    logout();
})

let accessToken;
// let refreshToken;

let pageInitialised = false


window.onload = async () => {
    await refreshLogin()
}

function checkLoggedIn() {
    // loadingPage.style.display = 'block'
    if (accessToken) {
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
    if (!pageInitialised) initLinks()
}

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = event.target.username.value
    const password = event.target.password.value
    login(username, password)
})

// window.onload(refreshLogin())


let refreshLogin = async () => {
    const response = await fetch('https://apiauth.kianserver.uk/token', {
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
    const response = await fetch('https://apiauth.kianserver.uk/login', {
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
    const response = await fetch('https://apiauth.kianserver.uk/logout', {
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
    const response = await fetch('https://api.kianserver.uk/links', {
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


initLinks()