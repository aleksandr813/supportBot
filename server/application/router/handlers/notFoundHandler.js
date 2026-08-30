module.exports = (answer) => (_, res) => {
    res.status(404).send(answer.bad(404));
}