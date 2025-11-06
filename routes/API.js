const express = require('express')

const Pembina = require('../models/Pembina')
const Pengawas = require('../models/Pengawas')
const Pengumuman = require('../models/Pengumuman')
const SahabatMedayu = require('../models/SahabatMedayu')
const HalamanUtama = require('../models/HalamanUtama')

const router = express.Router()

router.get('/pembina', async(req, res) => {
    try {
        const pembina = await Pembina.getAll()

        res.status(200).json({ pembina })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

router.get('/pengawas', async(req, res) => {
    try {
        const pengawas = await Pengawas.getAll()

        res.status(200).json({ pengawas })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

router.get('/sahabat-medayu', async(req, res) => {
    try {
        const sahabat_medayu = await SahabatMedayu.getAll()

        res.status(200).json({ sahabat_medayu })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

router.get('/pengumuman', async(req, res) => {
    try {
        const pengumuman = await Pengumuman.getPengumuman()

        res.status(200).json({ pengumuman })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

router.get('/pengumuman/:id', async(req, res) => {
    try {
        const {id} = req.params
        const pengumuman = await Pengumuman.getById(id)

        res.status(200).json({ pengumuman })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

router.get('/halaman-utama', async(req, res) => {
    try {
        const halaman_utama = await HalamanUtama.getAll()

        res.status(200).json({ halaman_utama })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

module.exports = router