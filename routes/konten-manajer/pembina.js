const express = require('express')

const Pembina = require('../../models/Pembina')
const Manajer = require('../../models/Manajer')
const { authManajer } = require('../../middlewares/auth')
const { convertImageFile } = require('../../middlewares/convertImage')
const path = require('path')
const multer = require('multer')
const fs = require('fs')

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/images/pembina'))
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
        cb(null, unique + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

const deleteUploadedFile = (file) => {
    if (file) {
        const filePath = path.join(__dirname, '../../public/images/pembina', file.filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

const deleteOldPhoto = (oldPhoto) => {
    if (oldPhoto) {
        const filePath = path.join(__dirname, '../../public/images/pembina', oldPhoto)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

router.get('/', authManajer, async (req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)
        const pembina = await Pembina.getAll()

        res.render('konten-manajer/pembina/index', { pembina, manajer })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/dashboard')
    }
})

router.get('/buat', authManajer, async (req, res) => {
    try {
        const manajer = await Manajer.getNama(req.session.manajerId)

        res.render('konten-manajer/pembina/buat', {
            manajer,
            data: req.flash('data')[0]
        })

    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pembina')
    }
})

router.post('/create', authManajer, upload.single('foto_pembina'), async (req, res) => {
    try {
        const { nama_pembina } = req.body
        const foto_pembina = req.file ? req.file.filename : null
        const data = {nama_pembina, foto_pembina}

        if (!nama_pembina) {
            deleteUploadedFile(req.file)

            req.flash("error", "Nama pembina tidak boleh kosong")
            req.flash('data', data)
            return res.redirect('/manajer/pembina/buat')
        }

        if (!foto_pembina) {
            deleteUploadedFile(req.file)

            req.flash("error", "Foto Pembina tidak boleh kosong")
            req.flash('data', data)
            return res.redirect('/manajer/pembina/buat')
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)
            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect('/manajer/pembina/buat')
        }

        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_pembina = path.basename(result.outputPath)
            }
        }

        await Pembina.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/manajer/pembina')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pembina')
    }
})

router.get('/edit/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params
        const manajer = await Manajer.getNama(req.session.manajerId)

        const pembina = await Pembina.getById(id)

        res.render('konten-manajer/pembina/edit', {
            manajer,
            pembina
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pembina')
    }
})

router.post('/update/:id', authManajer, upload.single('foto_pembina'), async (req, res) => {
    try {
        const {id} = req.params

        const pembina = await Pembina.getById(id)

        const {nama_pembina} = req.body
        const foto_pembina = req.file ? req.file.filename : pembina.foto_pembina
        const data = {nama_pembina, foto_pembina}

        if (!nama_pembina) {
            deleteUploadedFile(req.file)

            req.flash("error", "Nama pembina tidak boleh kosong")
            return res.redirect(`/manajer/pembina/edit/${id}`)
        }

        if (!foto_pembina) {
            deleteUploadedFile(req.file)

            req.flash("error", "Foto Pembina tidak boleh kosong")
            return res.redirect(`/manajer/pembina/edit/${id}`)
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (req.file && !allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)

            req.flash('error', 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan')
            req.flash('data', req.body)
            return res.redirect(`/manajer/pembina/edit/${id}`)
        }

        if (req.file && req.file.path) {
            const result = await convertImageFile(req.file.path)
            if (result && result.outputPath) {
                data.foto_pembina = path.basename(result.outputPath)
            }
        }

        if (req.file) deleteOldPhoto(pembina.foto_pembina)

        await Pembina.update(data, id)
        req.flash('success', 'Data berhasil diperbarui')
        res.redirect('/manajer/pembina')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pembina')
    }
})

router.post('/hapus/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params

        const data = await Pembina.getById(id)
        if (data && data.foto_pembina) {
            deleteOldPhoto(data.foto_pembina)
        }

        await Pembina.delete(id)
        req.flash('success', 'Data berhasil dihapus')
        res.redirect('/manajer/pembina')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/manajer/pembina')
    }
})

module.exports = router