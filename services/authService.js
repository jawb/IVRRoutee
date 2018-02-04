const checkStatus = context => {
    const { id, password } = context
    // TODO: Real authentication and status check
    if (id !== '123' || password !== '456') throw Error('Unauth')
    return 'approved'
}

module.exports = { checkStatus }
