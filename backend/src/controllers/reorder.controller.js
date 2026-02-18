const {batchMoveService} = require('../services/reorder.service.js')

async function batchMoveController(req, res) {

    try{
        const moves = req.body
        await batchMoveService(moves)
        res.status(200).json({ message: 'Links reordered successfully' });
    }
    catch(err){
        console.error('Batch move failed:', err);
        res.status(400).json({ error: 'Failed to reorder links', details: err.message });
    }
}


module.exports = {batchMoveController}