const fs = require('fs')
const { getLinksService, createLinkService, deleteLinkService, updateLinkService } = require('../services/link.service')


async function getLinksController(req, res) {
    try{
        const userId = req.user.id
        const links = await getLinksService(userId)
        res.json(links)
    }
    catch(err){
        res.status(400).json({ message: err.message});
    }

}

async function createLinkController(req, res) {
    try{
        const link = {
            name: req.body.name,
            localIp: req.body.localIp,
            remoteIp: req.body.remoteIp,
            imgUrl: req.body.imgUrl,
            column: req.body.column,
            userId: req.user.id,
        }
        await createLinkService(link)
        res.json({ message: `successfully added ${link.name}` })
    }
    catch(err){
        res.status(400).json({ message: err.message});
    }
}

async function deleteLinkController(req, res) {
    try{
        const linkId = req.params.id;
        const userId = req.user.id

        await deleteLinkService(linkId, userId)
    }
    catch(err){
        res.status(400).json({ message: err.message || err })
    }
}

async function updateLinkController(req, res) {
    try {
        const linkId = req.params.id;
        const userId = req.user.id;
        const updates = req.body;

        const updatedCount = await updateLinkService(linkId, userId, updates);

        if (updatedCount === 0) {
            return res.status(404).json({ message: 'No link found to update' });
        }

        res.status(200).json({ message: 'Link updated successfully', updated: updatedCount });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


function writeDataToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (err) => {
        if (err) {
            console.log(err);
        }
    })
}

// function getNoteData(req) {
//     return new Promise((resolve, reject) => {
//         try {
//             let body = "";
//             req.on('data', (chunk) => {
//                 body += chunk.toString()
//             })

//             req.on('end', () => {
//                 resolve(body)
//             }
//             )
//         }

//         catch (error) {
//             reject(err)


//         }
//     })
// }

module.exports = {
    writeDataToFile, getLinksController, createLinkController, updateLinkController, deleteLinkController
}