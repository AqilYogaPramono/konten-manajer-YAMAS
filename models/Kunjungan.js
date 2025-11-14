const connection = require('../configs/database')

class Kunjungan {
    static async countKujungan() {
        try {
            const [rows] = await connection.query(`SELECT count(id) as count_kunjungan FROM kunjungan`)
            return rows
        } catch (err) {
            throw err
        }
    }
}

module.exports = Kunjungan