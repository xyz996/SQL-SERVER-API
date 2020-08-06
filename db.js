const sql = require('mssql')
var config = {

    server: '192.168.1.31',
    authentication: {
        type: 'default',
        options: {
            userName: 'test',
            password: 'test'
        }
    },
    options: {
        database: 'database1',
        rowCollectionOnDone: true,
        encrypt: false,

        useColumnNames: false
    }
}

const poolPromised = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL')
        return pool
    }).catch(err => console.log('Database connection failed ! Bad config ', err))

module.exports = { sql, poolPromised}