const connection = require('../configs/database-akun')
const bcrypt = require('bcryptjs')

class Manajer {
    static async login(data) {
        try {
            const [rows] = await connection.query(`SELECT p.id, p.nama, p.nomor_pegawai, p.status_akun, p.kata_sandi, j.nama_jabatan FROM pegawai AS p LEFT JOIN pegawai_jabatan AS pj ON p.id = pj.id_pegawai LEFT JOIN jabatan AS j ON pj.id_jabatan = j.id WHERE p.nomor_pegawai = ?`, [data.nomor_pegawai])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async getNama(id) {
        try {
            const [rows] = await connection.query(`SELECT nama from pegawai where id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * from pegawai where id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async changePassword(id, data) {
        try {
            const hashedPassword = await bcrypt.hash(data.kata_sandi_baru, 10)
            await connection.query(`update pegawai set kata_sandi = ? where id = ? `, [hashedPassword, id])
        } catch (err) {
            throw err
        }
    }
}

module.exports = Manajer