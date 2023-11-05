import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

const PAGE_SIZE = 3


async function query(filterBy = { txt: '' }) {
    try {
        const collection = await dbService.getCollection('board')

        var boardCursor = await collection.find()

        const boards = boardCursor.toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId, filterBy) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ _id: ObjectId(boardId) })

        const filterBoard = getFilterBoard(board, filterBy)

        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

function getFilterBoard(board, filterBy) {

    //filter by members
    if (filterBy.members.length > 0) {
        board.groups.forEach(group => {
            for (let index = 0; index < group.tasks.length; index++) {
                const task = group.tasks[index];
                if (!(filterBy.members.some(memberId => task.memberIds.includes(memberId))) || task.memberIds.length === 0) {
                    group.tasks.splice(index, 1)
                    index = index - 1
                }
            }
        })
    }

    //filter by due date
    if (filterBy.dueDate.length > 0) {
        board.groups.forEach(group => {
            for (let index = 0; index < group.tasks.length; index++) {
                const task = group.tasks[index];
                if (filterBy.dueDate.includes('no dates') && filterBy.dueDate.includes('overdue')) {
                    if (task.dueDate && !(task.dueDate && task.dueDate.timeStamp < Date.now() / 1000 && !task.dueDate.isDone)) {
                        group.tasks.splice(index, 1)
                        index = index - 1
                    }
                }
                else if (filterBy.dueDate.includes('no dates')) {
                    if (task.dueDate) {
                        group.tasks.splice(index, 1)
                        index = index - 1
                    }
                }
                else if (filterBy.dueDate.includes('overdue')) {
                    if (!(task.dueDate && task.dueDate.timeStamp < Date.now() / 1000 && !task.dueDate.isDone)) {
                        group.tasks.splice(index, 1)
                        index = index - 1
                    }
                }
            }
        })
    }

    // filter by labels
    if (filterBy.labels.length > 0) {
        board.groups.forEach(group => {
            for (let index = 0; index < group.tasks.length; index++) {
                const task = group.tasks[index];
                if (!(filterBy.labels.some(labelId => task.labelIds.includes(labelId))) || task.labelIds.length === 0) {
                    group.tasks.splice(index, 1)
                    index = index - 1
                }
            }
        })
    }

    // filter by keywords
    if (filterBy.keywords.length > 0) {
        board.groups.forEach(group => {
            for (let index = 0; index < group.tasks.length; index++) {
                const task = group.tasks[index];
                if (!task.title.toLowerCase().includes(filterBy.keywords.toLowerCase())) {
                    group.tasks.splice(index, 1)
                    index = index - 1
                }
            }
        })
    }

    return board
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const collection = await dbService.getCollection('board')
        const boardId = ObjectId(board._id)
        const saveBoardId = board._id
        delete board._id
        await collection.updateOne({ _id: ObjectId(boardId) }, { $set: board })
        board._id = saveBoardId
        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function addBoardMsg(boardId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: ObjectId(boardId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add board msg ${boardId}`, err)
        throw err
    }
}

async function removeBoardMsg(boardId, msgId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: ObjectId(boardId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add board msg ${boardId}`, err)
        throw err
    }
}

export const boardService = {
    remove,
    query,
    getById,
    add,
    update,
    addBoardMsg,
    removeBoardMsg
}
