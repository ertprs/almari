const express = require('express')
const app = express()
const port = 3001
var bodyParser = require('body-parser')
var tools = require('./tools');
var messages = require('./message');
var proc = require('./controller.model');
const { Pool, Client } = require('pg')
var fs = require('fs'), ini = require('ini')
var path = require('path');
var jwt = require('jwt-simple');
const { base64encode, base64decode } = require('nodejs-base64');
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))
const Cookies = require('js-cookie');
const Footer_text = '@2020 | Whatsapp for sales.'
const pgp = require('pg-promise')()
const escpos = require('escpos');
// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');

// Select the adapter based on your printer type
const device  = new escpos.USB();
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
const options = { encoding: "GB18030" /* default */ }
// encoding is optional 
const printer = new escpos.Printer(device, options);

// connection using Pool
const db = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
})

// connection using PG-Promise
const cn = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: 30 // use up to 30 connections
};

const db2 = pgp(cn);

// add library to autoload and distributed to all controllers & models
var autoload = {
	jwt : jwt,
	base64decode : base64decode,
	base64encode : base64encode,
	config : config,
	db : db,
	db2 : db2,
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', [
    express.static(__dirname + '/node_modules/jquery/dist/'),
    express.static(__dirname + '/node_modules/cookieconsent/build/'),
    express.static(__dirname + '/node_modules/sweetalert/dist/'),
]);

setInterval(() => {
	// cek pesan masuk belum terbaca
	db.query('SELECT id, raw, participant, is_read FROM inbox WHERE is_read <> 1', (err, res) => {
	  	if(!err) {
	  		for(const row of res.rows) {
				var hp = row.participant.split("@")[0];
				var text = row.raw;
				var id = row.id;
				var order = tools.parse_message(text)
				if (order.length > 0) {
					if(order.length > 6){
						// insert new order
						db.query(
							'INSERT INTO whatsapp_inbox (chat_id, message ) VALUES ($1, $2)',
							[hp, text ],
							(err, res) => {
								if(!err){
									// update inbox set is_read = 1 agar tidak bisa terbaca lagi pesan masuknya
									db.query(`UPDATE inbox SET is_read = '1' WHERE id = '${id}'`, (err, res) => {
										if(!res){
											console.log("success");
										}
									})
								}
							}
						)
						
					} else {
						// update inbox set is_read = 1 agar tidak bisa terbaca lagi pesan masuknya
						db.query(`UPDATE inbox SET is_read = '1' WHERE id = '${id}'`, (err, res) => {
							if(!res){
								console.log("success");
							}
						})
					}
				} else {
					// update inbox set is_read = 1 agar tidak bisa terbaca lagi pesan masuknya
					db.query(`UPDATE inbox SET is_read = '1' WHERE id = '${id}'`, (err, res) => {
						if(!res){
							console.log("success");
						}
					})
				}
	  		}
		} else {
			console.log(err.stack);
		}
	})
},1000);

console.log(`

██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗ 
██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗
██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║
██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║
██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝
╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ 
`)

//allowing requests from outside of the domain 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// web view
app.get('/', (req, res) => {
	res.render('login', { 
		title: 'Login | Whatsapp for sales', 
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/login.js',
		]
	})
})

app.get('/dashboard', (req, res) => {
	res.render('dashboard', { 
		title: 'Dashboard | Whatsapp for sales', 
		footer_text : Footer_text,
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/libs/jq-cookie/jquery.cookie.js',
			'/assets/js/dashboard.js',
		]
	})
})

app.get('/inbox', (req, res) => {
	res.render('inbox', { 
		title: 'Inbox  | Whatsapp for sales', 
		footer_text : Footer_text,
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/inbox.js',
			'/assets/js/simplePagination.js',
		]
	})
})


app.get('/process', (req, res) => {
	res.render('process', { 
		title: 'Process  | Whatsapp for sales', 
		footer_text : Footer_text,
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/process.js',
			'/assets/libs/jq-cookie/jquery.cookie.js',
			'/assets/js/simplePagination.js',
		]
	})
})

app.post('/print_order', (req, res) => {
	var id = req.body.id
	var store = req.body.store
	var name = req.body.name
	var phone = req.body.phone
	var address = req.body.address
	var is_reseler = req.body.is_reseler

	var res_data = res;
	var rec_data = req;

	db.query(
		`SELECT recipient_name, courier, phone, address, is_delete, is_delivery, inbox_id, create_time, sender_name FROM process_order WHERE id = $1 `,
		[id],
		(err, res) => {
		    if (err) {
				console.log(err.stack);
		    } else {
		    	if(res.rows.length > 0){
					// device.open(function(error){
					//   printer
					//   .font('B')
					//   .align('ct')
					//   .size(1, 1)
					//   .text('Penerima\x0A')
					//   .size(1, 0)
					//   .align('lt')
					//   .text('Nama     : Sulistiana')
					//   .text('Alamat   : Rumah makan gajebo jl. p. tirtayasart.001/01, kec sukabumi bandar lampung')
					//   .text('Kurir    : JTR')
					//   .text('No. Hp   : 08977676555')
					//   .text('Pengirim : Toko Laris Herbal')
					//   .text('\x0A')
					//   .cut()
					//   .close()
					// });
					for(const row of res.rows){
						var nama_penerima = row.recipient_name;
						var no_hp = row.phone;
						var kurir = row.courier;
						var alamat = row.address;
						var pengirim = row.sender_name;

						if(is_reseler == "1") {
							try {
								device.open(function(error){
								  printer
								  .font('B')
								  .align('ct')
								  .size(1, 1)
								  .style('u')
								  .text('Penerima\x0A')
								  .style('')
								  .size(1, 0)
								  .align('lt')
								  .text(`Nama     : ${nama_penerima}`)
								  .text(`Alamat   : ${alamat}`)
								  .text(`Kurir    : ${kurir}`)
								  .text(`No. Hp   : ${no_hp}`)
								  .text(`Pengirim : ${pengirim}`)
								  .text('\x0A')
								  .cut()
								  .close()
								});
							}catch(e){
								console.log(e);
							}
						}

						if(is_reseler == "0") {
							try {
								device.open(function(error){
								  printer
								  .font('B')
								  .align('ct')
								  .size(1, 1)
								  .style('u')
								  .text('Penerima\x0A')
								  .style('')
								  .size(1, 0)
								  .align('lt')
								  .text(`Nama   : ${nama_penerima}`)
								  .text(`Alamat : ${alamat}`)
								  .text(`Kurir  : ${kurir}`)
								  .text(`No. Hp : ${no_hp}\x0A`)
								  .align('ct')
								  .size(1, 1)
								  .style('u')
								  .text('Pengirim\x0A')
								  .style('')
								  .size(1, 0)
								  .align('lt')
								  .text(`Toko   : ${name}`)
								  .text(`No. Hp : ${phone}`)
								  .text(`Alamat : ${address}`)
								  .text(`No. Hp : ${no_hp}\x0A`)
								  .cut()
								  .close()
								});
							}catch(e){
								console.log(e);
							}
						}

						break;
					}
		    		res_data.json({"status":"ok", "data": res.rows })
		    	} else {
		    		res_data.json({"status":"ok", "data": []})
		    	}	
			}
		}
	)

	// res.render('print_order', { 
	// 	title: 'Print Order  | Whatsapp for sales', 
	// 	footer_text : Footer_text,
	// 	css_include : [
	// 		'/assets/css/bootstrap.min.css',
	// 	],
	// 	js_include: [
	// 		'/assets/jquery.min.js',
	// 		'/assets/js/bootstrap.min.js',
	// 		'/assets/js/print_order.js',
	// 	]
	// })
})

// remove session logout
app.get('/logout', (req, res) => {
	res.render('logout', {})
})

// api v1 restFul
app.post('/api/auth', function(req, res) {
    proc.auth_login(req, res, autoload)
});

// api get profile information
app.post('/api/info', function(req, res) {
    proc.get_info(req, res, autoload)
});

/* bagian INBOX APIs interface */
// parameter body {}
app.get('/get_inbox', (req, res) => {
	proc.get_inbox(db, req, res)
})

// get total all message
app.get('/get_total_inbox', (req, res) => {
	proc.get_total_inbox(db, req, res)
});

// get detail message & parsing
app.get('/get_detail_inbox', (req, res) => {
	proc.get_detail_inbox(db, req, res, tools)
});

// save message
app.post('/update_inbox', (req, res) => {
	proc.update_inbox(db, req, res, db2)
});

// delete message
app.get('/delete_inbox', (req, res) => {
	proc.delete_inbox(req, res, autoload)
});


/* bagian PROCESS ORDER APIs interface */
// parameter body {}
app.get('/get_process', (req, res) => {
	proc.get_process(req, res, autoload)
})

// get total all process
app.get('/get_total_process', (req, res) => {
	proc.get_total_process(req, res, autoload)
});

// delete process
app.get('/delete_process', (req, res) => {
	proc.delete_process(req, res, autoload)
});

// flag delivery process
app.get('/process_delivery', (req, res) => {
	proc.process_delivery(req, res, autoload)
});

// get detail process
app.get('/get_detail_process', (req, res) => {
	proc.get_detail_process(req, res, autoload)
});

// get chart dashboard
app.get('/get_chart_dashboard', (req, res) => {
	proc.get_chart_dashboard(req, res, autoload)
});

// get chart name
app.get('/get_chart_name', (req, res) => {
	proc.get_chart_name(req, res, autoload)
});

// get chart courier
app.get('/get_chart_courier', (req, res) => {
	proc.get_chart_courier(req, res, autoload)
});

app.get('/get_inbox_filter', (req, res) => {
	proc.get_inbox_filter(req, res, autoload)
});

app.get('/get_process_filter', (req, res) => {
	proc.get_process_filter(req, res, autoload)
});

app.get('/get_sender_filter', (req, res) => {
	proc.get_sender_filter(req, res, autoload)
});

app.listen(config.app.port, () => console.log(`Webapp running in port : ${port}`))