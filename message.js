var tools = require('./tools');
module.exports = {
	// menampilkan informasi perintah ke bot whatsapp
	info: function (user, text) {
		var result = []
		result.push({
	      "text": "Info :\n#help : Untuk melihat format pemesanan barang.\n#status : Untuk melihat status pemesanan barang.\n#catalog : Untuk melihat daftar barang terbaru\n#cabang : Untuk melihat daftar cabang-cabang penjualan. ",
	      "type": "message"
		})

		return result
	},
	// menampilkan format pemesanan valid
	request_format: function(user, text) {
		var result = []
		result.push({
	      "text": "Contoh format pemesanan : \n",
	      "type": "message"
		})
		result.push({
	      "text": "\#tanggal/jam:...\n#pesanan order:...\n#jumlah:...\n#ekspedisi:...\n#nama penerima:...\n#alamat:...\n#no hp:...",
	      "type": "message"
		})
		return result
	},
	// menampilkan kondisi barang sekarang
	// status proses dan pengiriman
	status: function(user, text) {
		var result = []
		result.push({
	      "text": "Barang anda masih di proses oleh penjual.\n Terimakasih telah menunggu.",
	      "type": "message"
		})
		return result
	},
	// menampilkan catalog barang
	catalog: function(user, text) {
		var result = []
		result.push({
	      "text": "Madu Asli Hutan Suku Badui Rp.80.000 /botol",
	      "type": "message"
		})
		result.push({
	      "text": "Madu Sani Murni Rp.80.000 /botol",
	      "type": "message"
		})
		result.push({
	      "text": "Madu Hutan Satya Organik Rp.99.999 /botol",
	      "type": "message"
		})
		return result
	},
	// menampilkan cabang-cabang penjualan terdekat
	branch: function(user, text) {
		var result = []
		result.push({
	      "text": "Depok. Jl. R.Sanim No.3 Jawa Barat",
	      "type": "message"
		})
		result.push({
	      "text": "Tebet Raya, Ruko Prince No.4 Jakarta Selatan",
	      "type": "message"
		})
		result.push({
	      "text": "Ciracas, Perum Indah No.5, Jakarta Selatan",
	      "type": "message"
		})
		return result
	},
	// melakukan cek pemesanan dari format pesan masuk
	save_inbox: function(user, text, db) {
		var result = []
		var order = tools.parse_message(text)
		// order
		if (order.length > 0) {
			if(order.length == 7){
				db.query(
					'INSERT INTO wa_order (chat_id, message ) VALUES ($1, $2)',
					[req.body.user, req.body.text ],
					(error, results) => {
					    if (error) {
							result.push({
						      "text": "Maaf, pesanan anda gagal kami kami proses. Silahkan ulangi pemesanan lagi.",
						      "type": "message"
							})
					    } else {
							result.push({
						      "text": "Pesanan anda segera kami kami proses.  Ketik #status untuk melihat status pemesanan barang anda.",
						      "type": "message"
							})
						}
					}
				)
				
			} else {
				result.push({
			      "text": "Format pesan anda salah. Pastikan format anda sesuai dengan format yang telah disediakan, atau ketik #help untuk melihat format pesan tersebut.",
			      "type": "message"
				})
			}
		}
		return { total_inbox : order.length, data : result }
	}
};