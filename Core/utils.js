const Mustache = require('mustache')
const { next } = require('./next')


const getNewIDs = (id, N) => {
    let ids = []
    for (let i = 1; i <= N; i++) ids.push(id + '.' + i)
    return ids
}

const toVerbs = config => (render, steps) => {
  let verbs = []
  for (var i = 0; i < steps.length; i++) {
    const step = steps[i]
    const { gender, language, baseUrl, fromPhone } = config
    const say = {
        type: "SAY",
        message: { gender, language, text: render(step.display) }
    }
    if (say.message.text) verbs.push(say)
    if (step.collect) verbs.push({ type: "COLLECT", eventUrl: baseUrl + step.next, submitOnHash: true })
    if (step.call) verbs.push({ type: "DIAL", from: fromPhone, to: { phone: step.call } })
  }
  return verbs
}

const renderer = templates => context => key =>
  templates[key] ? Mustache.render(templates[key], context) : null

const getMachineResponse = (templates, config) => (_machine, tones) => {
    let steps = [], machine = _machine
    while (machine.nextStep) {
        if (machine.step) if (machine.step.collect) break;
        machine = next(machine, tones)
        const { step } = machine
        if (step.type === 'display') steps.push(step)
    }
    const verbs = toVerbs(config)(renderer(templates)(machine.context), steps)
    return { context: machine.context, verbs }
}

module.exports = { getNewIDs, getMachineResponse }
