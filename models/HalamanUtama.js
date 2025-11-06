const connection = require('../configs/database')

class HalamanUtama {
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT * FROM halaman_utama ORDER BY urutan ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getUsedUrutan() {
        try {
            const [rows] = await connection.query(`SELECT urutan FROM halaman_utama ORDER BY urutan ASC`)
            return rows.map(row => row.urutan)
        } catch (err) {
            throw err
        }
    }

    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO halaman_utama SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE halaman_utama SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM halaman_utama WHERE id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM halaman_utama WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }
}

module.exports = HalamanUtama
