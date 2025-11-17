const express = require('express')
const bcrypt = require('bcryptjs')

const Pegawai = require('../models/Pegawai')

const router = express.Router()

router.get('/', async (req, res) => {
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
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/')
        }

        const manajer = await Pegawai.login(data)

        const now = new Date()
        const mulai = manajer.periode_mulai ? new Date(manajer.periode_mulai) : null
        const berakhir = manajer.periode_berakhir ? new Date(manajer.periode_berakhir) : null

        if (!manajer) {
            req.flash('error', 'Nomor Pegawai yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (manajer.nama_aplikasi != 'konten-manajemen' && manajer.hak_akses != 'manajer') {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (mulai !== null && berakhir !== null) {
            if (!(now >= mulai && now <= berakhir)) {
                req.flash('error', 'Akun Anda tidak aktif pada periode ini')
                req.flash('data', data)
                return res.redirect('/')
            }
        }

        if (manajer.status_akun != 'Aktif') {
            req.flash('error', 'Akun anda belum aktif, silahkan hubungi Admin')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (!await bcrypt.compare(kata_sandi, manajer.kata_sandi)) {
            req.flash('error', 'Kata sandi yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/')
        }

        req.session.manajerId = manajer.id

        req.flash('success', 'Anda berhasil masuk')
        res.redirect('/manajer/dashboard')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.get('/logout', async(req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        if (req.session.manajerId) return res.redirect('/admin/dashboard')
    }
})

module.exports = router