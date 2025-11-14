const connection = require('../configs/database')

class Anggota {
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT * FROM pengawas`)
            return rows
        } catch (err) {
            throw err
        }
    }

    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO pengawas SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE pengawas SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM pengawas WHERE id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM pengawas WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }
}

module.exports = Anggota