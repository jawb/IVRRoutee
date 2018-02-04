const express = require('express')
const bodyParser = require('body-parser')
const { saveContext, sessionMiddleware } = require('./session')
const { initMachine, config, templates } = require('../IVR')
const { getMachineResponse } = require('../Core/utils.js')

const app = express()
app.use(bodyParser.json())
app.use(sessionMiddleware)

const _getMachineResponse = getMachineResponse(templates, config)

app.post('/ivr/:step', (req, res) => {
    const { context, tones, tid } = req
    const { step } = req.params
    let machine = { ...initMachine, context, nextStep: step }
    const response = _getMachineResponse(machine, tones)
    saveContext(tid, response.context)
    res.send(JSON.stringify({ verbs: response.verbs }))
})

app.listen(3000)
