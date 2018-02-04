const macro = (stateMachine, macros) => {
    let _stateMachine = stateMachine
    for (let i = 0; i < macros.length; i++) {
        _stateMachine = macros[i](_stateMachine)
    }
    return _stateMachine
}


const next = (stateMachine, data=null) => {
    
    const { nextStep, steps } = stateMachine

    if (nextStep === null) return stateMachine

    const nextStepObject = steps[nextStep]

    const { type } = nextStepObject

    if (type === 'display') return display(stateMachine, data)
    else if (type === 'router') return router(stateMachine)

    return stateMachine
}

const display = (stateMachine, data=null) => {
    const { nextStep, steps, context } = stateMachine
    const nextStepObject = steps[nextStep]
    const { param, next } = nextStepObject
    const newContext = data ? (param ? { ...context, [param]: data } : context ) : context
    return { ...stateMachine, context: newContext, step: nextStepObject, nextStep: next }
}

const router = (stateMachine) => {
    const { nextStep, steps, context } = stateMachine
    const nextStepObject = steps[nextStep]
    const { func } = nextStepObject
    const _nextStep = func(context)
    const newStateMachine = { ...stateMachine, step: nextStepObject, nextStep: _nextStep }
    return next(newStateMachine)
}


module.exports = { next, macro }
