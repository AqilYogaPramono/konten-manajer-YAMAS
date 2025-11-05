const connection = require('../configs/database-akun')

class Manajer {
    static async login(data) {
        try {
            const [rows] = await connection.query(`select * from admins where email = ? `, [data.email])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async getEmail(id) {
        try {
            const [rows] = await connection.query(`select email from admins where id = ? `, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }
}

module.exports = Manajer