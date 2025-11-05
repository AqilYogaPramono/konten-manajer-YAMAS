const express = require('express')
const bcrypt = require('bcryptjs')

const Manajer = require('../models/Manajer')

const router = express.Router()

router.get('/masuk', async (req, res) => {
    try {
        res.render('auths/login', { data: req.flash('data')[0] })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.post('/log', async (req, res) => {
    try {
        const { email, password } = req.body
        const data = { email, password }

        if (!email) {
            req.flash('error', 'Email is required')
            req.flash('data', data)
            return res.redirect('/masuk')
        }

        if (!password) {
            req.flash('error', 'Password is required')
            req.flash('data', data)
            return res.redirect('/masuk')
        }

        if (!await bcrypt.compare(password, users.password)) {
            req.flash('error', 'Password incorrect')
            req.flash('data', data)
            return res.redirect('/masuk')
        }

        req.flash('success', 'Login successful')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.get('/logout', async(req, res) => {
    try {
        req.session.destroy()
        req.flash('success', 'Logout successful')
        res.redirect('/')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        if (req.session.adminId) return res.redirect('/admin/dashboard')
    }
})

module.exports = router