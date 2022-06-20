module.exports = fn => {
    return (req, res, next) => {
        // err => next(err)
        fn(req, res, next).catch(next);
    }
}