import { batchMoveService } from '../services/reorder.service.js'

export async function batchMoveController(req, res) {

    try {
        const moves = req.body
        await batchMoveService(moves)
        res.status(200).json({ message: 'Links reordered successfully' });
    }
    catch (err) {
        console.error('Batch move failed:', err);
        res.status(400).json({ error: 'Failed to reorder links', details: err.message });
    }
}

