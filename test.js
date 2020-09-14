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
 
device.open(function(error){
  printer
  .font('B')
  .align('ct')
  .size(1, 1)
  .text('Penerima\x0A')
  .size(1, 0)
  .align('lt')
  .text('Nama     : Sulistiana')
  .text('Alamat   : Rumah makan gajebo jl. p. tirtayasart.001/01, kec sukabumi bandar lampung')
  .text('Kurir    : JTR')
  .text('No. Hp   : 08977676555')
  .text('Pengirim : Toko Laris Herbal')
  .text('\x0A')
  .cut()
  .close()
});