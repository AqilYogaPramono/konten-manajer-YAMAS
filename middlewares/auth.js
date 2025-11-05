const authManajer = async (req, res, next) => {
    try {
        if(req.session.manajerId) {
            return next()
        } else {
            req.flash('error', 'You do not have access to this page')
            res.redirect('/login')
        }
    } catch(err) {
        console.error(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/login')
    }
}

module.exports = { authManajer }