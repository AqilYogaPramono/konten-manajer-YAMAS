const express = require('express')

const SahabatMedayu = require('../../models/SahabatMedayu')
const Manajer = require('../../models/Manajer')
const { authManajer } = require('../../middlewares/auth')
const { convertImageFile } = require('../../middlewares/convertImage')
const path = require('path')
const multer = require('multer')
const fs = require('fs')

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/images/sahabat-medayu'))
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
        cb(null, unique + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

const deleteUploadedFile = (file) => {
    if (file) {
        const filePath = path.join(__dirname, '../../public/images/sahabat-medayu', file.filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

const deleteOldPhoto = (oldPhoto) => {
    if (oldPhoto) {
        const filePath = path.join(__dirname, '../../public/images/sahabat-medayu', oldPhoto)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

router.get('/', authManajer, async (req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)
        const sahabatMedayu = await SahabatMedayu.getAll()

        res.render('konten-manajer/sahabat-medayu/index', { sahabatMedayu, manajer })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/dashboard')
    }
})

router.get('/buat', authManajer, async (req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)

        res.render('konten-manajer/sahabat-medayu/buat', {
            manajer,
            data: req.flash('data')[0]
        })

    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/sahabat-medayu')
    }
})

router.post('/create', authManajer, upload.single('foto_sahabat_medayu'), async (req, res) => {
    try {
        const { nama_sahabat_medayu } = req.body
        const foto_sahabat_medayu = req.file ? req.file.filename : null
        const data = {nama_sahabat_medayu, foto_sahabat_medayu}

        if (!nama_sahabat_medayu) {
            deleteUploadedFile(req.file)

            req.flash("error", "Nama sahabat medayu tidak boleh kosong")
            req.flash('data', data)
            return res.redirect('/manajer/sahabat-medayu/buat')
        }

        if (!foto_sahabat_medayu) {
            deleteUploadedFile(req.file)

            req.flash("error", "Foto Sahabat Medayu tidak boleh kosong")
            req.flash('data', data)
            return res.redirect('/manajer/sahabat-medayu/buat')
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)
            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect('/manajer/sahabat-medayu/buat')
        }

        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_sahabat_medayu = path.basename(result.outputPath)
            }
        }

        await SahabatMedayu.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/manajer/sahabat-medayu')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/sahabat-medayu')
    }
})

router.get('/edit/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params
        const manajer = await Manajer.getNama(req.session.manajerId)

        const sahabatMedayu = await SahabatMedayu.getById(id)

        res.render('konten-manajer/sahabat-medayu/edit', {
            manajer,
            sahabatMedayu
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/sahabat-medayu')
    }
})

router.post('/update/:id', authManajer, upload.single('foto_sahabat_medayu'), async (req, res) => {
    try {
        const {id} = req.params

        const sahabatMedayu = await SahabatMedayu.getById(id)

        const {nama_sahabat_medayu} = req.body
        const foto_sahabat_medayu = req.file ? req.file.filename : sahabatMedayu.foto_sahabat_medayu
        const data = {nama_sahabat_medayu, foto_sahabat_medayu}

        if (!nama_sahabat_medayu) {
            deleteUploadedFile(req.file)

            req.flash("error", "Nama sahabat medayu tidak boleh kosong")
            return res.redirect(`/manajer/sahabat-medayu/edit/${id}`)
        }

        if (!foto_sahabat_medayu) {
            deleteUploadedFile(req.file)

            req.flash("error", "Foto Sahabat Medayu tidak boleh kosong")
            return res.redirect(`/manajer/sahabat-medayu/edit/${id}`)
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect(`/manajer/sahabat-medayu/edit/${id}`)
        }

        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_sahabat_medayu = path.basename(result.outputPath)
            }
        }

        if (req.file) deleteOldPhoto(sahabatMedayu.foto_sahabat_medayu)

        await SahabatMedayu.update(data, id)
        req.flash('success', 'Data berhasil diperbarui')
        res.redirect('/manajer/sahabat-medayu')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/sahabat-medayu')
    }
})

router.post('/hapus/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params

        const data = await SahabatMedayu.getById(id)
        if (data && data.foto_sahabat_medayu) {
            deleteOldPhoto(data.foto_sahabat_medayu)
        }

        await SahabatMedayu.delete(id)
        req.flash('success', 'Data berhasil dihapus')
        res.redirect('/manajer/sahabat-medayu')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/sahabat-medayu')
    }
})

module.exports = router
