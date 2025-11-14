const connection = require('../configs/database')

class Magang {
    static async countMagang() {
        try {
            const [rows] = await connection.query(`SELECT count(id) as count_magang FROM magang`)
            return rows
        } catch (err) {
            throw err
        }
    }
}

module.exports = Magang