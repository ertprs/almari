// sample test
var message = "\
# Tanggal /jam : 24april \
# Pesanan order : kurma sekari al qasim Nr.minta \
jangan terlalu matang dan yg agak gede2\
# Jumlah : 20 dus\
# Ekspedisi : JTR\
# Nama penerima : ana listia\
# Alamat : Rumah Makan Gajeboh jl p tirtayasa \
Rt001/01,kec Sukabumi Bandar lampung \
# No hp : +62 812-7266-8870\
dan nomor 02103020324\
# Nama pengirim : TOKO PAYU\
"

module.exports = {
	parse_message: function (message) {
		var re = /(#[\/A-Za-z1-9 ]+):([A-Za-z0-9\/,\+\-\n\.\"\' ]+)/g;
		var m;
		var result = [];
		do {
		    m = re.exec(message);
		    if (m) {
		        result.push({ 
		        	"key" : m[1].trim().toLowerCase().replace(/\s/g, ''), 
		        	"val" : m[2].trim().toLowerCase()
		        });
		    }
		} while (m);

		return result;
	},
};