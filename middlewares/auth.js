const authManajer = async (req, res, next) => {
    try {
        if(req.session.pegawaiId) {
            return next()
        } else {
            req.flash('error', 'Anda tidak memiliki akses kehalaman tersebut')
            res.redirect('/')
        }
    } catch(err) {
        console.error(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/')
    }
}

module.exports = { authManajer }