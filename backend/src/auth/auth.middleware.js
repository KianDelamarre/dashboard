import { verifyAccessToken } from './auth.repository.js'

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']  //gets the authorisation header
    const token = authHeader && authHeader.split(' ')[1]  //if authHeader isnt null, token = authheader token
    if (!token) return res.sendStatus(401) //check if there is a token

    //decode the token producing an error object and payload object
    //error and payload object passed to callback as err, user
    //if error object isnt null, then payload (user) will be null, as the token or secret key arent valid
    try {
        req.user = verifyAccessToken(token); //when the token is valid, add the user object to the request
        req.token = token //lazy but add token to request body to be used when resetting password

        next()  //tells outer function to move onto the next middleware to continue the request
    }
    catch (err) {
        res.sendStatus(403)
    }

}


