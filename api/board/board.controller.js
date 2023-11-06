import { boardService } from './board.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getBoards(req, res) {
    try {
        logger.debug('Getting Boards:', req.query)
        // const filterBy = {
        //     txt: req.query.txt || '',
        //     pageIdx: req.query.pageIdx
        // }
        const boards = await boardService.query()
        // const boards = await boardService.query(filterBy)
        res.json(boards)
    } catch (err) {
        logger.error('Failed to get boards', err)
        res.status(400).send({ err: 'Failed to get boards' })
    }
}

export async function getBoardById(req, res) {
    try {
        const filterBy = {
            members: req.query.members || [],
            labels: req.query.labels || [],
            dueDate: req.query.dueDate || [],
            keywords: req.query.keywords || ''
        }
        const boardId = req.params.id
        const board = await boardService.getById(boardId, filterBy)
        res.json(board)
    } catch (err) {
        logger.error('Failed to get board', err)
        res.status(400).send({ err: 'Failed to get board' })
    }
}

export async function addBoard(req, res) {
    // const { loggedinUser } = req

    try {
        const board = req.body
        // board.owner = loggedinUser
        const addedBoard = await boardService.add(board)
        // socketService.broadcast({ type: 'board-added', data: addedBoard, userId: loggedinUser._id })
        res.json(addedBoard)
    } catch (err) {
        logger.error('Failed to add board', err)
        res.status(400).send({ err: 'Failed to add board' })
    }
}


export async function updateBoard(req, res) {
    const { loggedinUser } = req
    try {
        const board = req.body
        const updatedBoard = await boardService.update(board)
        socketService.broadcast({ type: 'board-updated', data: updatedBoard, userId: loggedinUser._id })
        res.json(updatedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(400).send({ err: 'Failed to update board' })

    }
}

export async function removeBoard(req, res) {
    // const { loggedinUser } = req
    try {
        const boardId = req.params.id
        const removedId = await boardService.remove(boardId)
        // socketService.broadcast({ type: 'board-removed', data: boardId, userId: loggedinUser._id })
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove board', err)
        res.status(400).send({ err: 'Failed to remove board' })
    }
}

// export async function addBoardMsg(req, res) {
//     const { loggedinUser } = req
//     try {
//         const boardId = req.params.id
//         const msg = {
//             txt: req.body.txt,
//             by: loggedinUser
//         }
//         const savedMsg = await boardService.addBoardMsg(boardId, msg)
//         res.json(savedMsg)
//     } catch (err) {
//         logger.error('Failed to update board', err)
//         res.status(400).send({ err: 'Failed to update board' })

//     }
// }

// export async function removeBoardMsg(req, res) {
//     const { loggedinUser } = req
//     try {
//         const boardId = req.params.id
//         const { msgId } = req.params

//         const removedId = await boardService.removeBoardMsg(boardId, msgId)
//         res.send(removedId)
//     } catch (err) {
//         logger.error('Failed to remove board msg', err)
//         res.status(400).send({ err: 'Failed to remove board msg' })

//     }
// }


