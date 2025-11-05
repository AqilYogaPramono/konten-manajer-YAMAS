const express = require('express')

const Pengawas = require('../../models/Pengawas')
const Manajer = require('../../models/Manajer')
const { authManajer } = require('../../middlewares/auth')
const { convertImageFile } = require('../../middlewares/convertImage')
const path = require('path')
const multer = require('multer')
const fs = require('fs')

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/images/pengawas'))
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
        cb(null, unique + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

const deleteUploadedFile = (file) => {
    if (file) {
        const filePath = path.join(__dirname, '../../public/images/pengawas', file.filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

const deleteOldPhoto = (oldPhoto) => {
    if (oldPhoto) {
        const filePath = path.join(__dirname, '../../public/images/pengawas', oldPhoto)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

router.get('/', authManajer, async (req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)
        const pengawas = await Pengawas.getAll()

        res.render('konten-manajer/pengawas/index', { pengawas, manajer })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/dashboard')
    }
})

router.get('/buat', authManajer, async (req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)

        res.render('konten-manajer/pengawas/buat', {
            manajer,
            data: req.flash('data')[0]
        })

    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pengawas')
    }
})

router.post('/create', authManajer, upload.single('foto_pengawas'), async (req, res) => {
    try {
        const { nama_pengawas } = req.body
        const foto_pengawas = req.file ? req.file.filename : null
        const data = {nama_pengawas, foto_pengawas}

        if (!nama_pengawas) {
            deleteUploadedFile(req.file)

            req.flash("error", "Nama pengawas tidak boleh kosong")
            req.flash('data', data)
            return res.redirect('/manajer/pengawas/buat')
        }

        if (!foto_pengawas) {
            deleteUploadedFile(req.file)

            req.flash("error", "Foto Pengawas tidak boleh kosong")
            req.flash('data', data)
            return res.redirect('/manajer/pengawas/buat')
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)
            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect('/manajer/pengawas/buat')
        }

        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_pengawas = path.basename(result.outputPath)
            }
        }

        await Pengawas.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/manajer/pengawas')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pengawas')
    }
})

router.get('/edit/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params
        const manajer = await Manajer.getNama(req.session.manajerId)

        const pengawas = await Pengawas.getById(id)

        res.render('konten-manajer/pengawas/edit', {
            manajer,
            pengawas
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pengawas')
    }
})

router.post('/update/:id', authManajer, upload.single('foto_pengawas'), async (req, res) => {
    try {
        const {id} = req.params

        const pengawas = await Pengawas.getById(id)

        const {nama_pengawas} = req.body
        const foto_pengawas = req.file ? req.file.filename : pengawas.foto_pengawas
        const data = {nama_pengawas, foto_pengawas}

        if (!nama_pengawas) {
            deleteUploadedFile(req.file)

            req.flash("error", "Nama pengawas tidak boleh kosong")
            return res.redirect(`/manajer/pengawas/edit/${id}`)
        }

        if (!foto_pengawas) {
            deleteUploadedFile(req.file)

            req.flash("error", "Foto Pengawas tidak boleh kosong")
            return res.redirect(`/manajer/pengawas/edit/${id}`)
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect(`/manajer/pengawas/edit/${id}`)
        }

        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_pengawas = path.basename(result.outputPath)
            }
        }

        if (req.file) deleteOldPhoto(pengawas.foto_pengawas)

        await Pengawas.update(data, id)
        req.flash('success', 'Data berhasil diperbarui')
        res.redirect('/manajer/pengawas')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pengawas')
    }
})

router.post('/hapus/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params

        const data = await Pengawas.getById(id)
        if (data && data.foto_pengawas) {
            deleteOldPhoto(data.foto_pengawas)
        }

        await Pengawas.delete(id)
        req.flash('success', 'Data berhasil dihapus')
        res.redirect('/manajer/pengawas')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pengawas')
    }
})

module.exports = router
