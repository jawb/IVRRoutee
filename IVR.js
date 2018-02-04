const { macro } = require('./Core/next')
const { readMacro } = require('./Core/macros/readMacro')

const { processCard } = require('./services/paymentService')
const { checkStatus } = require('./services/authService')


const notNull = value => !!value

const checkStatusRouter = context => {
    try {
        return ({
            'pending': 6,
            'denied': 7,
            'approved': 8,
            'closed': 9,
        })[checkStatus(context)]
    } catch(e) { return 5 }
}
const confirmCallRouter = context => context.confirmCall == 1 ? '7.3' : 0
const processCardRouter = context => processCard(context) ? '8.6' : '8.5'


const stateMachine = {

    context: {},
    
    nextStep: 1,

    step: null,
    
    steps: {
        0: { type: 'display', display: 'goodbye', next: null },
        1: { type: 'display', display: 'welcome', next: 2 },
        2: { type: 'read', param: 'id', readDisplay: 'provideID',
             confirmDisplay: 'confirmID', validate: notNull, errorDisplay: 'errorID',
             pass: 3, loop: true },
        3: { type: 'read', param: 'password', readDisplay: 'providePwd',
             confirmDisplay: 'confirmPwd', validate: notNull, errorDisplay: 'errorPwd',
             pass: 4, loop: true },
        4: { type: 'router', func: checkStatusRouter },
        5: { type: 'display', display: 'unauth', next: 2 },
        6: { type: 'display', display: 'pendingStatus' },
        7: { type: 'display', display: 'deniedStatus', next: '7.1', collect: true },
        '7.1': { type: 'display', display: '', next: '7.2', param: 'confirmCall' },
        '7.2': { type: 'router', func: confirmCallRouter },
        '7.3': { type: 'display', display: 'callExternal', call: '+xxxxxxxxxx' },
        8: { type: 'display', display: 'approvedStatus', next: '8.1' },
        '8.1': { type: 'read', param: 'ccNumber', readDisplay: 'provideCCNumber',
             confirmDisplay: 'confirmCCNumber', validate: notNull, errorDisplay: 'errorCCNumber',
             pass: '8.2', loop: true },
        '8.2': { type: 'read', param: 'ccCVV', readDisplay: 'provideCVV',
             confirmDisplay: 'confirmCVV', validate: notNull, errorDisplay: 'errorCVV',
             pass: '8.3', loop: true },
        '8.3': { type: 'read', param: 'ccExp', readDisplay: 'provideExp',
             confirmDisplay: 'confirmExp', validate: notNull, errorDisplay: 'errorExp',
             pass: '8.4', loop: true },
        '8.4': { type: 'router', func: processCardRouter },
        '8.5': { type: 'display', display: 'deniedCard', next: '8.1' },
        '8.6': { type: 'display', display: 'acceptCard', next: 0 },
        9: { type: 'display', display: 'closedStatus', next: 0 },
    }
}

const initMachine = macro(stateMachine, [ readMacro ])

const templates = {
    'goodbye': 'Thanks for your time, goodbye',
    
    'welcome': 'Hello, we\'re calling to update you about your request for a stutent bus pass.',
    
    'provideID': 'Please enter your request id.',
    'confirmID': 'The request id you entered is {{id}}, press 1 to confirm that or 2 to correct it.',
    'errorID': 'The request id is invalid.',
    
    'providePwd': 'Please enter your password.',
    'confirmPwd': 'The password you entered is {{password}}, press 1 to confirm that or 2 to correct it.',
    'errorPwd': 'The password is invalid.',
    
    'unauth': 'You\'re not authorized to continue as the credentials didn\'t match our records.',
    
    'pendingStatus': 'Your request is still being processed by us, we will get back to you with any updates.',
    
    'deniedStatus': 'Your request has been denied, sorry about that if you want to talk to a representative press 1.',
    'callExternal': 'One moment please you\'re being redirected to a representative, please hold.',
    
    'approvedStatus': 'Congratulations your request has been approved. You need to pay 100$ for your annual pass.',

    'provideCCNumber': 'Please enter your credit card number.',
    'confirmCCNumber': 'The credit card number you entered is {{ccNumber}}, press 1 to confirm that or 2 to correct it.',
    'errorCCNumber': 'The credit card number is invalid.',

    'provideCVV': 'Please enter your CVV number.',
    'confirmCVV': 'The CVV number you entered is {{ccCVV}}, press 1 to confirm that or 2 to correct it.',
    'errorCVV': 'The CVV number is invalid.',

    'provideExp': 'Please enter your card expiration date in 4 digits format, month and year concatenated.',
    'confirmExp': 'The expiration date you entered is {{ccExp}}, press 1 to confirm that or 2 to correct it.',
    'errorExp': 'The expiration date is invalid.',

    'deniedCard': 'Your credit card was denied, please try once more.',

    'acceptCard': 'Thanks your payment was approved, you will receive the pass in the mail in a few days.',

    'closedStatus': 'This request was closed.',
}

const config = {
    gender: "male",
    language: "en-GB",
    baseUrl: 'http://localhost:3000/ivr/',
    fromPhone: '+yyyyyyy',
}

module.exports = { initMachine, config, templates }
