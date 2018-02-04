const { getNewIDs } = require('../utils.js')

const toConfirmParam = param => '__' + param + 'Confirm__'


const readOneMacro = (stateMachine) => {
    const { steps } = stateMachine

    for (let id in steps) {
        
        const o = steps[id]
        
        if (o.type === 'read') {

            const ids = getNewIDs(id, 5)
            const confirmParam = toConfirmParam(o.param)

            const confirm = (context) => {
                return context[confirmParam] == 1 ? ids[3] : id
            }
            
            const _validate = (context) => {
                return o.validate(context[o.param]) ? o.pass : ids[4]
            }
            
            const newSteps = {
                [id]: { type: 'display', display: o.readDisplay, next: ids[0], collect: true },
                [ids[0]]: { type: 'display', display: o.confirmDisplay, param: o.param, next: ids[1], collect: true },
                [ids[1]]: { type: 'display', display: '', param: confirmParam, next: ids[2] },
                [ids[2]]: { type: 'router',  func: confirm },
                [ids[3]]: { type: 'router',  func: _validate },
                [ids[4]]: { type: 'display', display: o.errorDisplay, next: (o.loop ? id : o.fail) },
            }

            const mergedSteps = { ...steps, ...newSteps }

            newStateMachine = { ...stateMachine, steps: mergedSteps }

            return [ true, newStateMachine ]
        }
    }

    return [ false, stateMachine ]
}

const readMacro = (stateMachine) => {
    let _stateMachine = stateMachine
    let transformed = true
    while (transformed) {
        [ transformed, _stateMachine ] = readOneMacro(_stateMachine)
    }
    return _stateMachine
}


module.exports = { readMacro }
