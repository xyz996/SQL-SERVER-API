var express = require('express')
var router = express.Router();
const { poolPromise, sql } = require('../db')


//TEST API
router.get('/', function (req, res) {
    res.end("API RUNNING")
});


//====================================================================
// MATERIAL
// POST / GET / MaterialBalance  //LastItemNo
//====================================================================
router.post('/material', async (req, res, next) => {
    console.log(req.query);

    var M_NO = req.body.mno
    var Material_AR = req.body.material_ar
    var Material_EN = req.body.material_en
    var Class_NO = req.body.class_no
    var Unit_NO = req.body.unit_no
    var Provider_NO = req.body.provider_no
    var Price = req.body.price
   
    var Price_Limit = req.body.price_limit
    var CT_Price = req.body.ct_price 

   

    var TAX = req.body.tax
    var Group = req.body.m_group
    var Barcode = req.body.barcode
    var User_Insert = req.body.insertuser
    var Ex_Date = req.body.ex_date
   

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
            const pool = await poolPromise

     
            const barcodeResults = await pool.request()
                .input('BARCODE', sql.NVarChar, Barcode)
                .query('SELECT [BARCODE] FROM [' + DBName + '].[dbo].[MATERIALS_BARCODE] WHERE [BARCODE] = @BARCODE')
          

            if (barcodeResults.recordset.length > 0) {

                var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

                const pool = await poolPromise
                const MaterialsResult = await pool.request()
                    .input('M_NO', sql.Int, M_NO)
                    .input('M_NAME_AR', sql.NVarChar, Material_AR)
                    .input('M_NAME_EN', sql.NVarChar, Material_EN)
                    .input('CLASS_NO', sql.Int, Class_NO)
                    .input('UNIT_NO', sql.Int, Unit_NO)
                    .input('PROVIDER_NO', sql.Int, Provider_NO)
                    .input('M_PRICE', sql.Float, Price)
                    .input('M_GROUP', sql.Float, Group)
                    .input('PRICE_LIMIT', sql.Float, Price_Limit)
                    .input('M_TAX', sql.Float, TAX)
                    .input('user_upd', sql.NVarChar, User_Insert)
                    .input('date_upd', sql.NVarChar, datetime)
                    .input('expired_date', sql.NVarChar, null)
                    .query('UPDATE [' + DBName + '].[dbo].[MATERIALS] SET M_NAME_AR=@M_NAME_AR , M_NAME_EN=@M_NAME_EN , CLASS_NO=@CLASS_NO , UNIT_NO=@UNIT_NO , PROVIDER_NO=@PROVIDER_NO , M_PRICE=@M_PRICE , M_GROUP=@M_GROUP , PRICE_LIMIT=@PRICE_LIMIT , M_TAX=@M_TAX  ,user_upd=@user_upd  ,date_upd=@date_upd WHERE [M_NO] =@M_NO');



                if (MaterialsResult.rowsAffected != null ) {
                    res.send(JSON.stringify({ isSuccess: true, msg: "Rows Updated Successfully" }))
                } else {
                    res.send(JSON.stringify({ isSuccess: false, msg: "Failed" }))
                }

            }
            else {
                    var datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

                    const pool = await poolPromise
                    const MaterialsResult = await pool.request()
                        .input('M_NO', sql.Int, M_NO)
                        .input('M_NAME_AR', sql.NVarChar, Material_AR)
                        .input('M_NAME_EN', sql.NVarChar, Material_EN)
                        .input('CLASS_NO', sql.Int, Class_NO)
                        .input('UNIT_NO', sql.Int, Unit_NO)
                        .input('PROVIDER_NO', sql.Int, Provider_NO)
                        .input('M_PRICE', sql.Float, Price)
                        .input('M_GROUP', sql.Float, Group)
                        .input('PRICE_LIMIT', sql.Float, Price_Limit)
                        .input('M_TAX', sql.Float, TAX)
                        .input('user_ins', sql.NVarChar, User_Insert)
                        .input('date_ins', sql.NVarChar, datetime)
                        .input('expired_date', sql.NVarChar, null)
                        .query('BEGIN IF NOT EXISTS(SELECT * FROM [' + DBName + '].[dbo].[MATERIALS] WHERE [M_NO] =@M_NO)BEGIN insert into [' + DBName + '].[dbo].[MATERIALS] (M_NO, M_NAME_AR, M_NAME_EN, CLASS_NO, UNIT_NO, PROVIDER_NO,M_PRICE,M_GROUP,PRICE_LIMIT,M_TAX,user_ins,date_ins,expired_date) values(@M_NO, @M_NAME_AR, @M_NAME_EN, @CLASS_NO, @UNIT_NO, @PROVIDER_NO, @M_PRICE,@M_GROUP,@PRICE_LIMIT,@M_TAX,@user_ins,@date_ins ,@expired_date)END END');


                    const BarcodeResult = await pool.request()
                        .input('M_NO', sql.Int, M_NO)
                        .input('BARCODE', sql.NVarChar, Barcode)
                        .query('insert into [' + DBName + '].[dbo].[MATERIALS_BARCODE] (m_no, BARCODE) values(@M_NO, @BARCODE)');

                    const CTResult = await pool.request()
                        .input('m_no', sql.Int, M_NO)
                        .input('m_price', sql.Float, CT_Price)
                        .query('insert into [' + DBName + '].[dbo].[ct] (m_no, m_price) values(@m_no, @m_price)');


                    if (MaterialsResult.rowsAffected != null && BarcodeResult.rowsAffected != null && CTResult.rowsAffected != null) {
                        res.send(JSON.stringify({ isSuccess: true, msg: "Rows Added Successfully" }))
                    } else {
                        res.send(JSON.stringify({ isSuccess: false, msg: "Failed" }))
                    }
                }
            
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
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
                .input('Store_no', sql.Int, StoreNo)
                .query('SELECT *, [' + DBName + '].[dbo].material_jard (M_NO,getdate(),@Store_no) As MB FROM [' + DBName + '].[dbo].[MATERIALS] WHERE pos_icon = 1')

            var reee = {
                material: []
            };
            if (queryResult.recordset.length > 0) {
              
                    

                queryResult.recordset.forEach(item => {
                    var sumMB = item.MB
                    if (StoreNo == 0)
                        sumMB = 999999.0
                    reee.material.push({
                        M_NO: item.M_NO,
                        M_NAME_AR: item.M_NAME_AR,
                        CLASS_NO: item.CLASS_NO,
                        UNIT_NO: item.UNIT_NO,
                        M_PRICE: item.M_PRICE,
                        PRICE_LIMIT: item.PRICE_LIMIT,
                        M_TAX: item.M_TAX,
                        M_GROUP: item.M_GROUP,
                        material_balance: sumMB,
                        M_PIC: item.m_pic,
                        ser: item.ser
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

router.get('/allmaterial', async (req, res, next) => {
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
                .input('Store_no', sql.Int, StoreNo)
                .query('SELECT *, [' + DBName + '].[dbo].material_jard (M_NO,getdate(),@Store_no) As MB FROM [' + DBName + '].[dbo].[MATERIALS]')

            var reee = {
                material: []
            };
            if (queryResult.recordset.length > 0) {



                queryResult.recordset.forEach(item => {
                    var sumMB = item.MB
                    if (StoreNo == 0)
                        sumMB = 999999.0
                    reee.material.push({
                        M_NO: item.M_NO,
                        M_NAME_AR: item.M_NAME_AR,
                        CLASS_NO: item.CLASS_NO,
                        UNIT_NO: item.UNIT_NO,
                        M_PRICE: item.M_PRICE,
                        PRICE_LIMIT: item.PRICE_LIMIT,
                        M_TAX: item.M_TAX,
                        M_GROUP: item.M_GROUP,
                        material_balance: sumMB,
                        M_PIC: item.m_pic,
                        ser: item.ser
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

router.get('/materialByBarcode', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var BARCODE = req.query.barcode
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
            const materialResult = await pool.request()
                .input('BARCODE', sql.NVarChar, BARCODE)
                .input('Store_no', sql.Int, StoreNo)
                .query('SELECT *, [' + DBName + '].[dbo].material_jard (M_NO,getdate(),@Store_no) As MB, [' + DBName + '].[dbo].[material_cost] (M_NO,getdate()) As Cost  FROM [' + DBName + '].[dbo].[MATERIALS] WHERE M_NO = (SELECT [m_no] FROM [' + DBName + '].[dbo].[MATERIALS_BARCODE] where [BARCODE] = @BARCODE)')

                


            if (materialResult.recordset.length > 0) {
                const barcodeResult = await pool.request()
                    .input('M_NO', sql.NVarChar, materialResult.recordset[0].M_NO)
                    .query('SELECT [BARCODE] FROM [' + DBName + '].[dbo].[MATERIALS_BARCODE] WHERE [m_no] = @M_NO')


                const ctResult = await pool.request()
                    .input('M_NO', sql.NVarChar, materialResult.recordset[0].M_NO)
                    .query('SELECT [m_price] FROM [' + DBName + '].[dbo].[ct] WHERE [m_no] = @M_NO')

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", barcode: barcodeResult.recordset, material: materialResult.recordset[0], ct: ctResult.recordset[0] });
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

router.get('/materialByMno', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var M_NO = req.query.mno
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

            const barcodeResult = await pool.request()
                .input('M_NO', sql.NVarChar, M_NO)
                .query('SELECT [BARCODE] FROM [' + DBName + '].[dbo].[MATERIALS_BARCODE] WHERE [m_no] = @M_NO')

            const materialResult = await pool.request()
                .input('M_NO', sql.NVarChar, M_NO)
                .input('Store_no', sql.Int, StoreNo)
                .query('SELECT *, [' + DBName + '].[dbo].material_jard (@M_NO,getdate(),@Store_no) As MB, [' + DBName + '].[dbo].[material_cost] (M_NO,getdate()) As Cost  FROM [' + DBName + '].[dbo].[MATERIALS] WHERE M_NO = @M_NO')

            const ctResult = await pool.request()
                .input('M_NO', sql.NVarChar, M_NO)
                .query('SELECT [m_price] FROM [' + DBName + '].[dbo].[ct] WHERE [m_no] = @M_NO')
            if (materialResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", barcode: barcodeResult.recordset, material: materialResult.recordset[0], ct: ctResult.recordset[0] });
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

router.get('/materialSuggestion', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var CONTENT = req.query.content

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
                .input('CONTENT', sql.NVarChar, CONTENT)
                .query("SELECT [M_NO],[M_NAME_AR] FROM [" + DBName + "].[dbo].[MATERIALS] WHERE [M_NAME_AR] LIKE  '%'+ @CONTENT+ '%'")

            var reee = {
                material: []
            };
            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", suggestion: queryResult.recordset });
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
                .input('StoreNo', sql.Decimal, StoreNo)
                .query('SELECT *, [' + DBName + '].[dbo].material_jard (M_NO,getdate(),@StoreNo) As MB FROM [' + DBName + '].[dbo].[MATERIALS] WHERE CLASS_NO = @CLASS_NO AND pos_icon = 1')

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
                        material_balance: item.MB,
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
//Get Materila Balance
router.get('/materialBalance', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var StoreNo = req.query.store
    var M_NO = req.query.mno

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
            if (StoreNo == 0) {
                res.send({ isSuccess: true, MB: 999999.0 });
            } else {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('M_NO', sql.Decimal, M_NO)
                    .input('StoreNo', sql.Decimal, StoreNo)
                    .query('SELECT [' + DBName + '].[dbo].material_jard (@M_NO,getdate(),@StoreNo) As MB')
            
           
            if (queryResult.recordset.length > 0) {
                res.send({ isSuccess: true, MB: queryResult.recordset[0].MB });
            } else {
                res.send(JSON.stringify({ isSuccess: false, msg: "Empity" }))
                }
                }
        } catch (err) {
            res.send(JSON.stringify({ isSuccess: false, msg: err.message }))
        }
    } else {
        res.send(JSON.stringify({ isSuccess: false, msg: "BAD CONNECTION" }))
    }

});

router.get('/materialLastitem', async (req, res, next) => {
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
                .query('SELECT MAX(M_NO) AS NO FROM [' + DBName + '].[dbo].[MATERIALS]')

            if (queryResult.recordset.length > 0) {
               
                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", LastItemNo: (queryResult.recordset[0].NO +1)});
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
// SERIALS
// GET /  
//================================================
router.get('/serial', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var Store = req.query.store

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
            var queryResult


            if (Store == null || Store == 0) {
                queryResult = await pool.request()
                    .query('SELECT * FROM [' + DBName + '].[dbo].[materials_serials_view]')

            } else {
                queryResult = await pool.request().input('store_no_to', sql.Int, Store)
                    .query('SELECT * FROM [' + DBName + '].[dbo].[materials_serials_view] where [store_no_to] =@store_no_to')
            }
            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, serials: queryResult.recordset });
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

router.get('/serial2', async (req, res, next) => {
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
            var queryResult

                queryResult = await pool.request()
                    .query('SELECT * FROM [' + DBName + '].[dbo].[materials_serials_view]')

            
            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, serials: queryResult.recordset });
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
// Units    
// GET /  
//================================================
router.get('/units', async (req, res, next) => {
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
                .query('SELECT S_NO,S_NAME FROM [' + DBName + '].[dbo].[UNITS] ORDER BY S_NO ASC')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, units: queryResult.recordset });
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
// Printing Data    
// GET /  
//================================================
router.get('/printing', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var BARCODE = req.query.barcode

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
                .input('BARCODE', sql.NVarChar, BARCODE)
                .query('SELECT m_name_ar,desc1,desc2 FROM [' + DBName + '].[dbo].[shelf_print_view] WHERE barcode=@BARCODE')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, toPrint: queryResult.recordset[0] });
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
// Providers
// GET /  
//================================================
router.get('/providers', async (req, res, next) => {
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
                .query('SELECT S_NO,S_NAME FROM [' + DBName + '].[dbo].[PROVIDERS] ORDER BY S_NO ASC')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, providers: queryResult.recordset });
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
// Inventory
// POST /  
//================================================
router.post('/inventory', async (req, res, next) => {
    console.log(req.body);

    var MNO = req.body.mno
    var BARCODE = req.body.barcode
    var QUANTITY = req.body.quantity
    var PRICE = req.body.price
    var INSERT_USER = req.body.insertuser

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
            var TRANS_NUM =1

            const transNumResult = await pool.request()
                .query('SELECT MAX([trans_no]) AS transNO  FROM [' + DBName + '].[dbo].[inventories]')


            if (transNumResult.recordset.length > 0) 
                 TRANS_NUM = (transNumResult.recordset[0].transNO + 1)

                        const queryResult = await pool.request()
                            .input('TRANS_NUM', sql.NVarChar, TRANS_NUM)
                            .input('M_NO', sql.Int, MNO)
                            .input('BARCODE', sql.NVarChar, BARCODE)
                            .input('QUANTITY', sql.Float, QUANTITY)
                            .input('PRICE', sql.Float, PRICE)
                            .input('INSERT_USER', sql.NVarChar, INSERT_USER)
                            .input('TRANS_DATE', sql.DateTime, datetime)
                            .input('INSERT_DATE', sql.NVarChar, datetime)
                            .query('insert into[' + DBName + '].[dbo].[inventories] ([trans_no],[m_no],[barcode],[m_quantity],[m_price],[user_ins],[date_ins],[trans_date]) values (@TRANS_NUM, @M_NO, @BARCODE, @QUANTITY, @PRICE, @INSERT_USER, @INSERT_DATE,@TRANS_DATE) ');
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

//================================================
// Bonus
// GET /  
//================================================
router.get('/bonus', async (req, res, next) => {
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
                .query('SELECT * FROM [' + DBName + '].[dbo].[bonus_data]')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, bonus: queryResult.recordset });
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
                .query('SELECT m_no,BARCODE FROM [' + DBName + '].[dbo].[MATERIALS_BARCODE]')

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
                .query('SELECT ACC_NO,ACC_NAME,EMP_NO,bonus FROM [' + DBName + '].[ACC].[acc_chart] WHERE CUST = 1 AND ACC_TYPE = 2')

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
                .query('SELECT USER_ID,USER_PASS,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,ENAME,MOBILE FROM [' + DBName + '].[dbo].[users]')

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

router.get('/userLogin', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var userId = req.query.userid
    var UserPass = req.query.userpass

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
                .input('USER_ID', sql.NVarChar, userId)
                .input('USER_PASS', sql.NVarChar, UserPass)
                .query('SELECT USER_ID,USER_PASS,P30,P31,P32,P33,P35,P36,P37,P38,P39,P40,P41,ENAME,MOBILE FROM [' + DBName + '].[dbo].[users] WHERE USER_ID=@USER_ID AND USER_PASS=@USER_PASS')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "User Loged Successfully", user: queryResult.recordset[0] });
            } else {
                res.send({ isSuccess: false, msg: "User Loged Failed Check UserName Or Password", user: null });
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

// ACC_trans
// GET /  
//================================================
router.get('/trans', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.query.db
    var SName = req.query.sname
    var UName = req.query.uname
    var Pass = req.query.pass
    var ACC_NO = req.query.acc_no
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
                .input('ACC_NO', sql.NVarChar, ACC_NO)
                .query('SELECT * FROM [' + DBName + '].[dbo].[acc_trans] WHERE ACC_NO =@ACC_NO ORDER BY id')

            if (queryResult.recordset.length > 0) {

                res.send({ isSuccess: true, msg: "DATA FETCHED SUCCESSFULLY", count: queryResult.recordset.length, trans: queryResult.recordset });
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
                .input('INVOICE_NET', sql.Float, (total - discount))
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

            table.columns.add('invoice_no', sql.NVarChar(255), { nullable: false })
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
            table.columns.add('serial_no', sql.NVarChar(255), { nullable: true })

            for (i = 0; i < order_detail.length; i++) {

                const queryResult = await pool.request()
                    .input('invoice_no', sql.NVarChar, invoice_no)
                    .input('m_no', sql.Int, order_detail[i]["m_no"])
                    .input('m_name', sql.NVarChar, order_detail[i]["m_name"])
                    .input('m_price', sql.Float, order_detail[i]["m_price"])
                    .input('m_quant', sql.Float, order_detail[i]["m_quant"])
                    .input('m_tot', sql.Float, order_detail[i]["m_tot"])
                    .input('rownum', sql.Int, (i + 1))
                    .input('m_comment', sql.NVarChar, order_detail[i]["m_comment"])
                    .query('SELECT * FROM [' + DBName + '].[dbo].[sales_main_detail_Mobile] WHERE invoice_no = @invoice_no AND M_NO =@m_no AND  m_name LIKE @m_name AND m_price =@m_price AND m_quant =@m_quant  AND m_tot =@m_tot  AND rownum =@rownum AND m_comment LIKE @m_comment')

                if (queryResult.recordset.length > 0) {
                    console.log(queryResult.recordset.length)
                } else {
                    var group_no = order_detail[i]["no_group"]
                    if (group_no == 0)
                        group_no = null

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
                        (i + 1),
                        order_detail[i]["machine_name_d"],
                        order_detail[i]["m_price_before"],
                        order_detail[i]["m_tot_before"],
                        null,
                        order_detail[i]["serial_no"],
                    )
                }
            }
            const request = pool.request()
            request.bulk(table, (err) => {
                if (err) {
                    console.log(err)
                    res.send(JSON.stringify({ isSuccess: false, msg: err.message
                        }))
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

router.post('/deleteOrderItems', async (req, res, next) => {
    console.log(req.query);

    var DBName = req.body.db
    var SName = req.body.sname
    var UName = req.body.uname
    var Pass = req.body.pass

    var invoice_no = req.body.invoice_no


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
                const deleteQuerey = await pool.request()
                    .input('invoice_no', sql.NVarChar, invoice_no)
                    .query('DELETE FROM [' + DBName + '].[dbo].[sales_main_detail_Mobile] WHERE invoice_no = @invoice_no ')

            if (deleteQuerey.rowsAffected != null) {
                res.send(JSON.stringify({ isSuccess: true, msg: "Row Delleted Successfully" }))
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


//================================================
// Purchases And Purchases Details
// POST /  
//================================================

router.post('/purchases', async (req, res, next) => {
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
                .input('INVOICE_NET', sql.Float, (total - discount))
                .input('invoice_comment', sql.NVarChar, comment)
                .input('lat', sql.NVarChar, lat)
                .input('lon', sql.NVarChar, lon)
                .query('BEGIN IF NOT EXISTS(SELECT * FROM [' + DBName + '].[dbo].[purchases_bill_main_Mobile] WHERE [INVOICE_NO] LIKE @INVOICE_NO)BEGIN insert into [' + DBName + '].[dbo].[purchases_bill_main_Mobile] (INVOICE_NO, INVOICE_DATE, INVOICE_TYPE, acc_no, user_ins, date_ins, s_name,manual_no,machine_name,INVOICE_SUM,INVOICE_DISCOUNT,INVOICE_NET ,invoice_comment,lat,lon) values(@INVOICE_NO, @INVOICE_DATE, @INVOICE_TYPE, @acc_no, @user_ins, @date_ins, @s_name,@manual_no,@machine_name,@INVOICE_SUM,@INVOICE_DISCOUNT,@INVOICE_NET ,@invoice_comment,@lat,@lon)END END');
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

router.post('/purchaseDetails', async (req, res, next) => {
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
        console.log(order_detail);

    } catch (err) {
        console.log(err)
        res.status(500)
        res.send(JSON.stringify({ success: false, message: err }))
    }

    if (DBName != null && SName != null && UName != null && Pass != null) {
        try {

            const pool = await poolPromise
            const table = new sql.Table('[' + DBName + '].[dbo].[purchases_bill_detail_Mobile]') // Create virtual table to bulk insert
            table.create = true

            table.columns.add('invoice_no', sql.NVarChar(255), { nullable: false })
            table.columns.add('M_NO', sql.Int, { nullable: true })
            table.columns.add('m_barcode', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_name', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_price', sql.Float, { nullable: true })
            table.columns.add('m_quant', sql.Float, { nullable: true })
            table.columns.add('ex_date', sql.Date, { nullable: true })
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
            table.columns.add('m_tot_before', sql.Float, { nullable: true })
            table.columns.add('no_group', sql.Float, { nullable: true })
            table.columns.add('serial_no', sql.NVarChar(255), { nullable: true })

            for (i = 0; i < order_detail.length; i++) {

                const queryResult = await pool.request()
                    .input('invoice_no', sql.NVarChar, invoice_no)
                    .input('m_no', sql.Int, order_detail[i]["m_no"])
                    .input('m_name', sql.NVarChar, order_detail[i]["m_name"])
                    .input('m_price', sql.Float, order_detail[i]["m_price"])
                    .input('m_quant', sql.Float, order_detail[i]["m_quant"])
                    .input('m_tot', sql.Float, order_detail[i]["m_tot"])
                    .input('rownum', sql.Int, (i + 1))
                    .input('m_comment', sql.NVarChar, order_detail[i]["m_comment"])
                    .query('SELECT * FROM [' + DBName + '].[dbo].[purchases_bill_detail_Mobile] WHERE invoice_no = @invoice_no AND M_NO =@m_no AND  m_name LIKE @m_name AND m_price =@m_price AND m_quant =@m_quant  AND m_tot =@m_tot  AND rownum =@rownum AND m_comment LIKE @m_comment')

                if (queryResult.recordset.length > 0) {
                    console.log(queryResult.recordset.length)
                } else {
                    var group_no = order_detail[i]["no_group"]
                    if (group_no == 0)
                        group_no = null

                    table.rows.add(invoice_no,
                        order_detail[i]["m_no"],
                        order_detail[i]["m_barcode"],
                        order_detail[i]["m_name"],
                        order_detail[i]["m_price"],
                        order_detail[i]["m_quant"],
                        order_detail[i]["ex_date"],
                        order_detail[i]["m_tax"],
                        order_detail[i]["m_discount"],
                        order_detail[i]["m_tot"],
                        order_detail[i]["counter_no"],
                        order_detail[i]["counter_serial"],
                        order_detail[i]["m_comment"],
                        order_detail[i]["unit_no"],
                        (i + 1),
                        order_detail[i]["machine_name_d"],
                        order_detail[i]["m_price_before"],
                        order_detail[i]["m_tot_before"],
                        null,
                        order_detail[i]["serial_no"],
                    )
                }
            }
            const request = pool.request()
            request.bulk(table, (err) => {
                if (err) {
                    console.log(err)
                    res.send(JSON.stringify({
                        isSuccess: false, msg: err.message
                    }))
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


router.post('/repurchases', async (req, res, next) => {
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
                .input('INVOICE_NET', sql.Float, (total - discount))
                .input('invoice_comment', sql.NVarChar, comment)
                .input('lat', sql.NVarChar, lat)
                .input('lon', sql.NVarChar, lon)
                .query('BEGIN IF NOT EXISTS(SELECT * FROM [' + DBName + '].[dbo].[purchases_r_bill_main_Mobile] WHERE [INVOICE_NO] LIKE @INVOICE_NO)BEGIN insert into [' + DBName + '].[dbo].[purchases_r_bill_main_Mobile] (INVOICE_NO, INVOICE_DATE, INVOICE_TYPE, acc_no, user_ins, date_ins, s_name,manual_no,machine_name,INVOICE_SUM,INVOICE_DISCOUNT,INVOICE_NET ,invoice_comment,lat,lon) values(@INVOICE_NO, @INVOICE_DATE, @INVOICE_TYPE, @acc_no, @user_ins, @date_ins, @s_name,@manual_no,@machine_name,@INVOICE_SUM,@INVOICE_DISCOUNT,@INVOICE_NET ,@invoice_comment,@lat,@lon)END END');
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

router.post('/repurchaseDetails', async (req, res, next) => {
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
            const table = new sql.Table('[' + DBName + '].[dbo].[purchases_r_bill_detail_Mobile]') // Create virtual table to bulk insert
            table.create = true

            table.columns.add('invoice_no', sql.NVarChar(255), { nullable: false })
            table.columns.add('M_NO', sql.Int, { nullable: true })
            table.columns.add('m_barcode', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_name', sql.NVarChar(255), { nullable: true })
            table.columns.add('m_price', sql.Float, { nullable: true })
            table.columns.add('m_quant', sql.Float, { nullable: true })
            table.columns.add('ex_date', sql.Date, { nullable: true })
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
            table.columns.add('m_tot_before', sql.Float, { nullable: true })
            table.columns.add('no_group', sql.Float, { nullable: true })
            table.columns.add('serial_no', sql.NVarChar(255), { nullable: true })

            for (i = 0; i < order_detail.length; i++) {

                const queryResult = await pool.request()
                    .input('invoice_no', sql.NVarChar, invoice_no)
                    .input('m_no', sql.Int, order_detail[i]["m_no"])
                    .input('m_name', sql.NVarChar, order_detail[i]["m_name"])
                    .input('m_price', sql.Float, order_detail[i]["m_price"])
                    .input('m_quant', sql.Float, order_detail[i]["m_quant"])
                    .input('ex_date', sql.Date, order_detail[i]["ex_date"])
                    .input('m_tot', sql.Float, order_detail[i]["m_tot"])
                    .input('rownum', sql.Int, (i + 1))
                    .input('m_comment', sql.NVarChar, order_detail[i]["m_comment"])
                    .query('SELECT * FROM [' + DBName + '].[dbo].[purchases_r_bill_detail_Mobile] WHERE invoice_no = @invoice_no AND M_NO =@m_no AND  m_name LIKE @m_name AND m_price =@m_price AND m_quant =@m_quant  AND m_tot =@m_tot  AND rownum =@rownum AND m_comment LIKE @m_comment')

                if (queryResult.recordset.length > 0) {
                    console.log(queryResult.recordset.length)
                } else {
                    var group_no = order_detail[i]["no_group"]
                    if (group_no == 0)
                        group_no = null

                    table.rows.add(invoice_no,
                        order_detail[i]["m_no"],
                        order_detail[i]["m_barcode"],
                        order_detail[i]["m_name"],
                        order_detail[i]["m_price"],
                        order_detail[i]["m_quant"],
                        order_detail[i]["ex_date"],
                        order_detail[i]["m_tax"],
                        order_detail[i]["m_discount"],
                        order_detail[i]["m_tot"],
                        order_detail[i]["counter_no"],
                        order_detail[i]["counter_serial"],
                        order_detail[i]["m_comment"],
                        order_detail[i]["unit_no"],
                        (i + 1),
                        order_detail[i]["machine_name_d"],
                        order_detail[i]["m_price_before"],
                        order_detail[i]["m_tot_before"],
                        null,
                        order_detail[i]["serial_no"],
                    )
                }
            }
            const request = pool.request()
            request.bulk(table, (err) => {
                if (err) {
                    console.log(err)
                    res.send(JSON.stringify({
                        isSuccess: false, msg: err.message
                    }))
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

//Visting 
router.post('/visit', async (req, res, next) => {
    console.log(req.query);



    var visit_no = req.body.visit_no
    var visitDate = req.body.visitDate
    var accNo = req.body.accNo
    var insert_user = req.body.insert_user
    var sName = req.body.sName
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
                .input('VISIT_NO', sql.NVarChar, visit_no)
                .input('VISIT_DATE', sql.DateTime, visitDate)
                .input('acc_no', sql.NVarChar, accNo)
                .input('user_ins', sql.NVarChar, insert_user)
                .input('date_ins', sql.NVarChar, datetime)
                .input('s_name', sql.NVarChar, sName)
                .input('machine_name', sql.NVarChar, machine_name)
                .input('comment', sql.NVarChar, comment)
                .input('lat', sql.NVarChar, lat)
                .input('lon', sql.NVarChar, lon)
                .query('BEGIN IF NOT EXISTS(SELECT * FROM [' + DBName + '].[dbo].[Visit] WHERE [VISIT_NO] LIKE @VISIT_NO)BEGIN insert into [' + DBName + '].[dbo].[Visit] (VISIT_NO, VISIT_DATE, acc_no, user_ins, date_ins, s_name,machine_name ,comment,lat,lon) values(@VISIT_NO, @VISIT_DATE, @acc_no, @user_ins, @date_ins, @s_name,@machine_name ,@comment,@lat,@lon)END END');
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

//Notes 
router.post('/note', async (req, res, next) => {
    console.log(req.query);



    var visit_no = req.body.visit_no
    var visitDate = req.body.visitDate
    var insert_user = req.body.insert_user
    var machine_name = req.body.machine_name
    var notes = req.body.notes
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
                .input('VISIT_NO', sql.NVarChar, visit_no)
                .input('VISIT_DATE', sql.DateTime, visitDate)
                .input('notes', sql.NVarChar, notes)
                .input('user_ins', sql.NVarChar, insert_user)
                .input('date_ins', sql.NVarChar, datetime)
                .input('machine_name', sql.NVarChar, machine_name)
                .query('insert into [' + DBName + '].[dbo].[Mobile_Notes] (note_no, note_date, notes, user_ins, date_ins ,machine_name) values(@VISIT_NO, @VISIT_DATE, @notes, @user_ins, @date_ins, @machine_name)');
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


//Temp Customers 
router.post('/tempCustomer', async (req, res, next) => {
    console.log(req.query);


    var customer_no = req.body.customer_no
    var CustomerDate = req.body.customer_date
    var Name = req.body.name
    var Phone = req.body.phone
    var Location = req.body.location
    var Note = req.body.note
    var manual_no = req.body.manual_no
    var insertUser = req.body.insertUser
    var machine_name = req.body.machine_name
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
                .input('CUSTOMER_NO', sql.NVarChar, customer_no)
                .input('CUSTOMER_DATE', sql.DateTime, CustomerDate)
                .input('Name', sql.NVarChar, Name)
                .input('Phone', sql.NVarChar, Phone)
                .input('Location', sql.NVarChar, Location)
                .input('Note', sql.NVarChar, Note)
                .input('insertUser', sql.NVarChar, insertUser)
                .input('date_ins', sql.NVarChar, datetime)
                .input('manual_no', sql.NVarChar, manual_no)
                .input('machine_name', sql.NVarChar, machine_name)
                .query('insert into [' + DBName + '].[dbo].[Mobile_Customers] (customer_no, customer_date, name, phone, location ,note,user_ins,date_ins,manual_no,machine_name) values (@CUSTOMER_NO, @CUSTOMER_DATE, @Name, @Phone, @Location, @Note, @insertUser, @date_ins,@manual_no, @machine_name)');
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
