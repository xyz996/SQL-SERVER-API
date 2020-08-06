var express = require('express')
var router = express.Router();
const { poolPromise, sql } = require('../db')


//TEST API
router.get('/', function (req, res) {
    res.end("API RUNNING")
});

//================================================
// MATERIAL
// POST / GET / MaterialBalance  
//================================================
router.post('/material', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var MaterilaName = req.query.mName
    var Price = req.query.mPrice

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('M_NAME_AR', sql.NVarChar, MaterilaName)
                .input('M_PRICE', sql.Decimal, Price)
                .query('INSERT INTO [' + DBName + '].[dbo].[MATERIALS] (M_NAME_AR,M_PRICE,pos_icon) VALUES (@M_NAME_AR,@M_PRICE,1)');
            console.log(queryResult) // Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            } else {
                res.send(JSON.stringify({ success: false, message: "Failed" }))
            }


        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});

router.get('/material', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var StoreNo = req.query.store

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT * FROM [' + DBName + '].[dbo].[MATERIALS] WHERE pos_icon = 1')

            var reee = {
                material: []
            };
            if (queryResult.recordset.length > 0) {
                queryResult.recordset.forEach(item => {
                   
                       
                    reee.material.push({
                        M_NO: item.M_NO,
                        M_NAME_AR: item.M_NAME_AR,
                        M_NAME_EN: item.M_NAME_EN,
                        CLASS_NO: item.CLASS_NO,
                        MB: CalculateMaterialBalance(pool, item.M_NO, StoreNo, DBName, SName, UName, Pass)
                    })
                });
                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, result: reee });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});

router.get('/materialByclass', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var StoreNo = req.query.store
    var ClassNo = req.query.classNo

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('CLASS_NO', sql.Decimal, ClassNo)
                .query('SELECT * FROM [' + DBName + '].[dbo].[MATERIALS] WHERE CLASS_NO = @CLASS_NO AND pos_icon = 1')

            var reee = {
                material: []
            };
            if (queryResult.recordset.length > 0) {
                queryResult.recordset.forEach(item => {


                    reee.material.push({
                        M_NO: item.M_NO,
                        M_NAME_AR: item.M_NAME_AR,
                        M_NAME_EN: item.M_NAME_EN,
                        CLASS_NO: item.CLASS_NO,
                        MB: CalculateMaterialBalance(pool, item.M_NO, StoreNo, DBName, SName, UName, Pass)
                    })
                });
                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, result: reee });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});
//Calculate Materila Balance
function CalculateMaterialBalance(pool,M_NO, Store_no, DBName, SName, UName, Pass) {
   
    console.log("M_NO = " + M_NO)
    console.log("Store_no = " + Store_no)
    console.log("DBName = " + DBName)
    console.log("SName = " + SName)
    console.log("UName = " + UName)
    console.log("Pass = " + Pass)
    const sql = require('mssql')

    if (Store_no == 0) {
        return 999999
    } else {
        if (DBName != null && SName != null && UName != null && Pass != null) {
            try {

                const entrance_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT  SUM([m_quant]) AS Result FROM  [' + DBName + '].[ACC].[entrance_detail] Where [M_NO] =@M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[entrance] WHERE [store_no] =@Store_no)')

                const move_out_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[move_out_detail] Where[M_NO] = @M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[move_out] WHERE [store_no] =@Store_no)')

                const damage_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[damage_detail] Where[M_NO] = @M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[damage] WHERE [store_no] =@Store_no)')


                const sales_main_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[sales_main_detail] Where[M_NO] = @M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[SALES_main] WHERE [store_no] =@Store_no)')

                const sales_r_main_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[sales_r_main_detail] Where[M_NO] = @M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[SALES_r_main] WHERE [store_no] =@Store_no)')

                const purchases_main_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[purchases_main_detail] Where[M_NO] = @M_NO AND [store_no] =@Store_no')

                const purchases_r_main_detail = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[purchases_r_main_detail] Where[M_NO] = @M_NO AND [store_no]=@Store_no')

                const remove_detailFrom = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[remove_detail] Where[M_NO] = @M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[remove] WHERE [store_no_from] =@Store_no)')

                const remove_detailTo = pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('Store_no', sql.Int, Store_no)
                    .query('SELECT SUM([m_quant]) AS Result FROM [' + DBName + '].[ACC].[remove_detail] Where[M_NO] = @M_NO AND INVOICE_NO in (SELECT INVOICE_NO FROM [' + DBName + '].[ACC].[remove] WHERE [store_no_to] =@Store_no)')

                var entrance = 0;
                var move_out = 0;
                var damage = 0;
                var sales_main = 0;
                var sales_r_main = 0;
                var purchases_main = 0;
                var purchases_r_main = 0;
                var sToreFrom = 0;
                var sToreTo = 0;

                if (entrance_detail.recordset.length > 0 && entrance_detail.recordset[0].Result != null) {
                    entrance = entrance_detail.recordset[0].Result
                } if (move_out_detail.recordset.length > 0 && move_out_detail.recordset[0].Result != null) {
                    move_out = move_out_detail.recordset[0].Result
                } if (damage_detail.recordset.length > 0 && damage_detail.recordset[0].Result != null) {
                    damage = damage_detail.recordset[0].Result
                } if (sales_main_detail.recordset.length > 0 && sales_main_detail.recordset[0].Result != null) {
                    sales_main = sales_main_detail.recordset[0].Result
                } if (sales_r_main_detail.recordset.length > 0 && sales_r_main_detail.recordset[0].Result != null) {
                    sales_r_main = sales_r_main_detail.recordset[0].Result
                } if (purchases_main_detail.recordset.length > 0 && purchases_main_detail.recordset[0].Result != null) {
                    purchases_main = purchases_main_detail.recordset[0].Result
                } if (purchases_r_main_detail.recordset.length > 0 && purchases_r_main_detail.recordset[0].Result != null) {
                    purchases_r_main = purchases_r_main_detail.recordset[0].Result
                } if (remove_detailFrom.recordset.length > 0 && remove_detailFrom.recordset[0].Result != null) {
                    sToreFrom = remove_detailFrom.recordset[0].Result
                } if (remove_detailTo.recordset.length > 0 && remove_detailTo.recordset[0].Result != null) {
                    sToreTo = remove_detailTo.recordset[0].Result
                }

                var sum = 0;
                sum -= sales_main;
                sum += sales_r_main;
                sum += purchases_main;
                sum -= purchases_r_main;
                sum += entrance;
                sum -= move_out;
                sum -= damage;
                sum -= sToreFrom;
                sum += sToreTo;

                console.log("SUM = " + sum)
                return sum

                //res.send(JSON.stringify({ success: true, result: sum }));

            } catch (err) {
                console.log(err.message)
                //res.send(JSON.stringify({ success: false, message: err.message }))
                return 0
            }
        } else {
            return 0
            console.log("BAD CONNECTION")
            //res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
        }
    }
};
//================================================
// Category
// GET /  
//================================================

router.get('/category', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT S_NO,S_NAME,S_PIC FROM [' + DBName + '].[dbo].[CLASSES] ORDER BY S_NO ASC')

            if (queryResult.recordset.length > 0) {
             
                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, categories: queryResult.recordset });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});

//================================================
// Barcode
// GET /  
//================================================
router.get('/barcode', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT  m_no,BARCODE FROM [' + DBName + '].[dbo].[MATERIALS_BARCODE]')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, barcodes: queryResult.recordset });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});
//================================================
// Customers
// GET /  
//================================================
router.get('/customer', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT ACC_NO,ACC_NAME FROM [' + DBName + '].[ACC].[acc_chart] WHERE CUST = 1 AND ACC_TYPE = 2')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, customers: queryResult.recordset });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});

//================================================
// Users
// GET /  
//================================================
router.get('/users', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT USER_ID,USER_PASS,P1,P2,P3,P4,P5,P6,ENAME FROM [' + DBName + '].[dbo].[users]')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "Users Fetched Successfully", count: queryResult.recordset.length, users: queryResult.recordset });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});

//================================================
// Bank
// GET /  
//================================================
router.get('/bank', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .query('SELECT * FROM [' + DBName + '].[ACC].[BANKS]')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, banks: queryResult.recordset });
            } else {
                res.send(JSON.stringify({ success: false, message: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});

//================================================
// Orders And Orders Details 
// POST /  
//================================================
router.post('/order', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var invoice_no = req.query.invoice_no
    var invoiceDate = req.query.invoiceDate
    var invoiceType = req.query.invoiceType
    var accNo = req.query.accNo
    var insert_user = req.query.insert_user
    var sName = req.query.sName
    var manual_no = req.query.manual_no
    var total = req.query.total
    var discount = req.query.discount
    var netTotal = req.query.netTotal
    var machine_name = req.query.machine_name
    var comment = req.query.comment
    var lat = req.query.lat
    var lon = req.query.lon


    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }


    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));



    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {
            var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('INVOICE_NO', sql.NVarChar, invoice_no)
                .input('INVOICE_DATE', sql.NVarChar, invoiceDate)
                .input('INVOICE_TYPE', sql.Int, invoiceType)
                .input('acc_no', sql.Int, accNo)
                .input('user_ins', sql.NVarChar, insert_user)
                .input('date_ins', sql.NVarChar, datetime)
                .input('s_name', sql.NVarChar, sName)
                .input('manual_no', sql.Int, manual_no)
                .input('machine_name', sql.NVarChar, machine_name)
                .input('INVOICE_SUM', sql.Decimal, total)
                .input('INVOICE_DISCOUNT', sql.Decimal, discount)
                .input('INVOICE_NET', sql.Decimal, netTotal)
                .input('invoice_comment', sql.NVarChar, comment)
                .input('lat', sql.Decimal, lat)
                .input('lon', sql.Decimal, lon)
                .query('BEGIN IF NOT EXISTS(SELECT * FROM [' + DBName + '].[dbo].[SALES_main_Mobile] WHERE [INVOICE_NO] LIKE @INVOICE_NO)BEGIN insert into [' + DBName + '].[dbo].[SALES_main_Mobile] (INVOICE_NO, INVOICE_DATE, INVOICE_TYPE, acc_no, user_ins, date_ins, s_name,manual_no,machine_name,INVOICE_SUM,INVOICE_DISCOUNT,INVOICE_NET ,invoice_comment,lat,lon) values(@INVOICE_NO, @INVOICE_DATE, @INVOICE_TYPE, @acc_no, @user_ins, @date_ins, @s_name,@manual_no,@machine_name,@INVOICE_SUM,@INVOICE_DISCOUNT,@INVOICE_NET ,@invoice_comment,@lat,@lon)END END');
            console.log(queryResult) // Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            } else {
                res.send(JSON.stringify({ success: false, message: "Failed" }))
            }


        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});


router.post('/updateOrder', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass

    var invoice_no = req.query.invoice_no
    var order_detail;


    var config = {

        server: SName,
        authentication: {
            type: 'default',
            options: {
                userName: UName,
                password: Pass
            }
        },
        options: {
            database: DBName,
            rowCollectionOnDone: true,
            encrypt: false,

            useColumnNames: false
        }
    }

    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('Connected To MSSQL ' + config.database);
            return pool;
        }).catch(err => console.log('Database Connection Failed ! Bad Config :', err));

    try {
        order_detail = JSON.parse(req.query.orderDetail)
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send(JSON.stringify({ success: false, message: err }))
    }

    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {

            const pool = await poolPromise
            const table = new sql.Table('[' + DBName + '].[dbo].[sales_main_detail_Mobile]') // Create virtual table to bulk insert
            table.create = true

            table.columns.add('invoice_no', sql.NVarChar(50), { nullable: false })
            table.columns.add('M_NO', sql.Int, { nullable: true })
            table.columns.add('m_barcode', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_name', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_price', sql.Float, { nullable: true })
            table.columns.add('m_quant', sql.Float, { nullable: true })
            table.columns.add('m_tax', sql.Float, { nullable: true })
            table.columns.add('m_discount', sql.Float, { nullable: true })
            table.columns.add('m_tot', sql.Float, { nullable: true })
            table.columns.add('counter_no', sql.Int, { nullable: true })
            table.columns.add('counter_serial', sql.Int, { nullable: true })
            table.columns.add('m_comment', sql.NVarChar(255), { nullable: true })
            table.columns.add('unit_no', sql.Int, { nullable: true })
            table.columns.add('rownum', sql.Int, { nullable: true })    
            table.columns.add('machine_name_d', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_price_before', sql.Float, { nullable: true })
            table.columns.add('m_tot_before', sql.Float, { nullable: true})
            table.columns.add('no_group', sql.Float, { nullable: true })

            for (i = 0; i < order_detail.length; i++) {
                table.rows.add(invoice_no,
                    order_detail[i]["M_NO"],
                    order_detail[i]["m_barcode"],
                    order_detail[i]["m_name"],
                    order_detail[i]["m_price"],
                    order_detail[i]["m_quant"],
                    order_detail[i]["m_tax"],
                    order_detail[i]["m_discount"],
                    order_detail[i]["m_tot"],
                    order_detail[i]["counter_no"],
                    order_detail[i]["counter_serial"],
                    order_detail[i]["m_comment"],
                    order_detail[i]["unit_no"],
                    (i+1),
                    order_detail[i]["machine_name_d"],
                    order_detail[i]["m_price_before"],
                    order_detail[i]["m_tot_before"],
                    order_detail[i]["no_group"],
                )
            }
            const request = pool.request()
            request.bulk(table, (err) => {
                if (err) {
                    console.log(err)
                    res.send(JSON.stringify({ success: false, message: err }))
                } else {
                    res.send(JSON.stringify({ success: true, message: "Success" }))
                }

            })

        } catch (err) {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "BAD CONNECTION" }))
    }

});
module.exports = router;