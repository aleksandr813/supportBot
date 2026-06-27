module.exports = (answer) => {
    return (req, res) => {
        res.send(answer.good(req));
    }
}