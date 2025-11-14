const express = require('express')

const Manajer = require('../../models/Manajer')
const HalamanUtama = require('../../models/HalamanUtama')
const Kunjungan = require('../../models/Kunjungan')
const Magang = require('../../models/Magang')
const { authManajer } = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authManajer, async(req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)
        const countPhotoLandingpage = await HalamanUtama.countPhoto()
        const countKujungan = await Kunjungan.countKujungan()
        const countMagang = await Magang.countMagang()

        res.render('konten-manajer/dashboard', {manajer, countPhotoLandingpage: countPhotoLandingpage[0].count_photo_landingpage, countKujungan: countKujungan[0].count_kunjungan, countMagang: countMagang[0].count_magang})
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

module.exports = router