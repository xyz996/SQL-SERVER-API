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
                        CLASS_NO: item.CLASS_NO,
                        UNIT_NO: item.UNIT_NO,
                        M_PRICE: item.M_PRICE,
                        PRICE_LIMIT: item.PRICE_LIMIT,
                        M_TAX: item.M_TAX,
                        M_GROUP: item.M_GROUP,
                        material_balance: CalculateMaterialBalance(pool, item.M_NO, StoreNo, DBName, SName, UName, Pass),
                        M_PIC: item.m_pic
                    })
                });
                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, material: reee.material });
            } else {
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                        CLASS_NO: item.CLASS_NO,
                        UNIT_NO: item.UNIT_NO,
                        M_PRICE: item.M_PRICE,
                        PRICE_LIMIT: item.PRICE_LIMIT,
                        M_TAX: item.M_TAX,
                        M_GROUP: item.M_GROUP,
                        material_balance: CalculateMaterialBalance(pool, item.M_NO, StoreNo, DBName, SName, UName, Pass),
                        M_PIC: item.m_pic
                    })
                });
                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, material: reee.material });
            } else {
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
            }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
    }

});

//================================================
// Orders And Orders Details 
// POST /  
//================================================
router.post('/order', async (req, res, next) => {
    console.log(req.query);



    var invoice_no = req.body.invoice_no
    var invoiceDate = req.body.invoiceDate
    var invoiceType = req.body.invoiceType
    var accNo = req.body.accNo
    var insert_user = req.body.insert_user
    var sName = req.body.sName
    var manual_no = req.body.manual_no
    var total = req.body.total
    var discount = req.body.discount
    var netTotal = req.body.netTotal
    var machine_name = req.body.machine_name
    var comment = req.body.comment

    var lat = req.body.lat
    var lon = req.body.lon
    var DBName = req.body.db
    var SName = req.body.sname
    var UName = req.body.uname
    var Pass = req.body.pass

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
                .input('INVOICE_DATE', sql.DateTime, invoiceDate)
                .input('INVOICE_TYPE', sql.Float, invoiceType)
                .input('acc_no', sql.NVarChar, accNo)
                .input('user_ins', sql.NVarChar, insert_user)
                .input('date_ins', sql.NVarChar, datetime)
                .input('s_name', sql.NVarChar, sName)
                .input('manual_no', sql.NVarChar, manual_no)
                .input('machine_name', sql.NVarChar, machine_name)
                .input('INVOICE_SUM', sql.Float, total)
                .input('INVOICE_DISCOUNT', sql.Float, discount)
                .input('INVOICE_NET', sql.Float, netTotal)
                .input('invoice_comment', sql.NVarChar, comment)
                .input('lat', sql.NVarChar, lat)
                .input('lon', sql.NVarChar, lon)
                .query('BEGIN IF NOT EXISTS(SELECT * FROM [' + DBName + '].[dbo].[SALES_main_Mobile] WHERE [INVOICE_NO] LIKE @INVOICE_NO)BEGIN insert into [' + DBName + '].[dbo].[SALES_main_Mobile] (INVOICE_NO, INVOICE_DATE, INVOICE_TYPE, acc_no, user_ins, date_ins, s_name,manual_no,machine_name,INVOICE_SUM,INVOICE_DISCOUNT,INVOICE_NET ,invoice_comment,lat,lon) values(@INVOICE_NO, @INVOICE_DATE, @INVOICE_TYPE, @acc_no, @user_ins, @date_ins, @s_name,@manual_no,@machine_name,@INVOICE_SUM,@INVOICE_DISCOUNT,@INVOICE_NET ,@invoice_comment,@lat,@lon)END END');
            console.log(queryResult) // Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ isSuccess: true, msg:"Row Added Successfully" }))
            } else {
                res.send(JSON.stringify({ isSuccess: false, msg: "Failed" }))
            }


        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
    }

});

router.post('/updateOrder', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.body.db
    var SName = req.body.sname
    var UName = req.body.uname
    var Pass = req.body.pass

    var invoice_no = req.body.invoice_no
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
        order_detail = JSON.parse(req.body.orderDetail)
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
                    order_detail[i]["m_no"],
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
                    res.send(JSON.stringify({ isSuccess: false, msg: err }))
                } else {
                    res.send(JSON.stringify({ isSuccess: true, msg: "Success" }))
                }

            })

        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
    }

});
//================================================
// Paymaster
// POST /  
//================================================
router.post('/paymaster', async (req, res, next) => {
    console.log(req.query);



    var PAY_NO = req.body.PAY_NO
    var PAY_DATE = req.body.PAY_DATE
    var ACC_NO = req.body.ACC_NO
    var ACC_NAME = req.body.ACC_NAME
    var PAY_BYAN = req.body.PAY_BYAN
    var PAY_CHECK = req.body.PAY_CHECK
    var PAY_CHACK_DATE = req.body.PAY_CHACK_DATE
    var PAY_BANK = req.body.PAY_BANK
    var PAY_WAY = req.body.PAY_WAY
    var TOT_AMOUNT = req.body.TOT_AMOUNT
    var manual_no = req.body.manual_no
    var machineName = req.body.machineName
    var insertuser = req.body.insertuser

 
    var DBName = req.body.db
    var SName = req.body.sname
    var UName = req.body.uname
    var Pass = req.body.pass

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
                .input('PAY_NO', sql.NVarChar, PAY_NO)
                .input('PAY_DATE', sql.DateTime, PAY_DATE)
                .input('ACC_NO', sql.Int, ACC_NO)
                .input('ACC_NAME', sql.NVarChar, ACC_NAME)
                .input('PAY_BYAN', sql.NVarChar, PAY_BYAN)
                .input('PAY_CHECK', sql.NVarChar, PAY_CHECK)
                .input('PAY_CHACK_DATE', sql.NVarChar, PAY_CHACK_DATE)
                .input('PAY_BANK', sql.NVarChar, PAY_BANK)
                .input('PAY_WAY', sql.Int, PAY_WAY)
                .input('TOT_AMOUNT', sql.Float, TOT_AMOUNT)
                .input('manual_no', sql.Int, manual_no)
                .input('machineName', sql.NVarChar, machineName)
                .input('insertuser', sql.NVarChar, insertuser)
                .input('date_ins', sql.NVarChar, datetime)
                .input('machine_id', sql.NVarChar, manual_no)
                .query('insert into[' + DBName + '].[dbo].[PAYMASTER_mobile] (PAY_NO,PAY_DATE,ACC_NO,ACC_NAME,PAY_BYAN,PAY_CHECK,PAY_CHACK_DATE,PAY_BANK,PAY_WAY,TOT_AMOUNT,manual_no,machine_name,user_ins,date_ins,machine_id) values (@PAY_NO, @PAY_DATE, @ACC_NO, @ACC_NAME, @PAY_BYAN, @PAY_CHECK, @PAY_CHACK_DATE, @PAY_BANK, @PAY_WAY, @TOT_AMOUNT, @manual_no, @machineName , @insertuser,@date_ins,@machine_id) ');
            console.log(queryResult) // Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ isSuccess: true, msg: "Row Added Successfully" }))
            } else {
                res.send(JSON.stringify({ isSuccess: false, msg: "Failed" }))
            }


        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
    }

});



module.exports = router;
