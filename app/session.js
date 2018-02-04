const fs = require('fs')
const path = require('path')

const getFile = tid => path.join(__dirname, '..', 'store', tid + '.json')

const getContext = (req, next) => {
    fs.readFile(getFile(req.tid), 'utf8', (err, text) => {
        if (err) req.context = {}
        else req.context = JSON.parse(text)
        next()
    })
}

const saveContext = (tid, context) => {
    if (tid)
        fs.writeFile(getFile(tid), JSON.stringify(context), x => x)
}

function sessionMiddleware (req, res, next) {
  const { conversationTrackingId, collectedTones } = req.body
  req.tid = conversationTrackingId
  req.tones = collectedTones.split(',').join('')
  getContext(req, next)
}

module.exports = { sessionMiddleware, saveContext }
