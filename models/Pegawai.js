const connection = require('../configs/database-akun')
const bcrypt = require('bcryptjs')

class Pegawai {
    static async login(data) {
        try {
            const [rows] = await connection.query(`SELECT p.id, p.nama, p.nomor_pegawai, p.status_akun, p.kata_sandi, a.nama_aplikasi, a.hak_akses, pr.periode_mulai, pr.periode_berakhir FROM pegawai AS p LEFT JOIN pegawai_aplikasi AS pa ON p.id = pa.id_pegawai LEFT JOIN aplikasi AS a ON pa.id_aplikasi = a.id LEFT JOIN periode AS pr ON p.id = pr.id_pegawai WHERE p.nomor_pegawai = ?`, [data.nomor_pegawai])
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

module.exports = Pegawai