const { requestPhone } = require('../flows');

async function handleStart(ctx) {
    return requestPhone(ctx);
}

module.exports = { handleStart };