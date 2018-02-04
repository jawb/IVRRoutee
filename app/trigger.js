const axios = require('axios')
const { initMachine, config, templates } = require('../IVR')
const { getMachineResponse } = require('../Core/utils.js')


const trigger = (token, number) => {
    
    const _getMachineResponse = getMachineResponse(templates, config)
    const response = _getMachineResponse(initMachine)

    return axios.post({
      method: 'post',
      url: 'https://connect.routee.net/voice/conversation',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-type': 'application/json'
      },
      data: {
        from: 'Bus company',
        to: { phone: number },
        dialPlan: { verbs: response.verbs }
      }
    })
}

module.exports = { trigger }
