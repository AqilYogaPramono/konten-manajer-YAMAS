const connection = require('../configs/database-akun')

class Manajer {
    static async login(data) {
        try {
            const [rows] = await connection.query(`SELECT p.id, p.nama, p.nomor_pegawai, p.status_akun, p.kata_sandi, j.nama_jabatan FROM pegawai AS p LEFT JOIN pegawai_jabatan AS pj ON p.id = pj.id_pegawai LEFT JOIN jabatan AS j ON pj.id_jabatan = j.id WHERE p.nomor_pegawai = ?`, [data.nomor_pegawai])
            return rows[0]
        } catch (err) {
            throw err
        }
    }
}

module.exports = Manajer