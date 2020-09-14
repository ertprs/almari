function get_info(){
	var id = getCookie('id');
    $.ajax({
        url: '/api/info',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 
            id : id
        }),
        success: function(data) {
        	console.log(data);
        	$('.label-user').text(data.data.first_name+' '+data.data.last_name);
        }
    });
}

function filter_chart(year, month) {
    $('#btn-filter').attr('disabled','disabled');
    $.ajax({
        url: `/get_chart_dashboard/?year=${year}&month=${month}`,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            $('#total-pesan').text(data.data.total_inbox);
            $('#total-proses').text(data.data.total_process);
            $('#total-terkirim').text(data.data.total_sender);
            setTimeout(function() {
                $('#btn-filter').removeAttr('disabled');
            },2000);
        }
    });
}

function filter_chart_name(year, month) {
    $('#btn-filter').attr('disabled','disabled');
    $.ajax({
        url: `/get_chart_name/?year=${year}&month=${month}`,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            var data_series = [], data_label = [];
            for(const dt of data.data) {
                data_series.push(parseInt(dt.count))
                data_label.push(dt.recipient_name);
            }
            orang_chart(data_series, data_label);

            setTimeout(function() {
                $('#btn-filter').removeAttr('disabled');
            },2000);
        }
    });
}

function filter_chart_courier(year, month) {
    $('#btn-filter').attr('disabled','disabled');
    $.ajax({
        url: `/get_chart_courier/?year=${year}&month=${month}`,
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            var data_series = [], data_label = [];
            for(const dt of data.data) {
                data_series.push(parseInt(dt.count))
                data_label.push(dt.courier);
            }

            kurir_chart(data_series, data_label);
            setTimeout(function() {
                $('#btn-filter').removeAttr('disabled');
            },2000);
        }
    });
}


function orang_chart(data_series = [], data_label = []) {
    var r = {
        plotOptions: {
            pie: {
                donut: {
                    size: "70%"
                },
                expandOnClick: !1
            }
        },
        chart: {
            height: 400,
            type: "donut"
        },
        legend: {
            show: !0,
            position: "right",
            horizontalAlign: "left",
            itemMargin: {
                horizontal: 6,
                vertical: 3
            }
        },
        series: data_series,
        labels: data_label,
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: "bottom"
                }
            }
        }],
        tooltip: {
            y: {
                formatter: function(t) {
                    return t + "k"
                }
            }
        }
    };
    if(window.chart_orang){
        window.chart_orang.destroy();
    }
    window.chart_orang = new ApexCharts(document.querySelector("#chart-orang"), r);
    window.chart_orang.render();
}

function kurir_chart(data_series = [], data_label = []) {
    var r = {
        plotOptions: {
            pie: {
                donut: {
                    size: "70%"
                },
                expandOnClick: !1
            }
        },
        chart: {
            height: 400,
            type: "donut"
        },
        legend: {
            show: !0,
            position: "right",
            horizontalAlign: "left",
            itemMargin: {
                horizontal: 6,
                vertical: 3
            }
        },
        series: data_series,
        labels: data_label,
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: "bottom"
                }
            }
        }],
        tooltip: {
            y: {
                formatter: function(t) {
                    return t
                }
            }
        }
    };
    if(window.chart_kurir){
        window.chart_kurir.destroy();
    }
    window.chart_kurir = new ApexCharts(document.querySelector("#chart-kurir"), r);
    window.chart_kurir.render();
}

function tableModalBuilder(label, data) {
    $('#dashboard-modal-title').text('').text(label);
    var rows = ``;

    for(const row of data) {
        rows += `<tr><td>${row.create_time}</td><td>${row.chat_id}</td><td>${row.order_message}</td><td>${row.quantity}</td></tr>`;
    }

    var table_string = `
    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>Waktu Pesan</th>
                <th>No. HP</th>
                <th>Pesanan</th>
                <th>Jumlah</th>
            </tr>
        </thead>
        <tbody>
            ${rows == '' ? '<tr><td align="center" colspan="4">Tidak ada data</td></tr>' : rows}
        </tbody>
    </table>`;
    $('#dashboard-modal-body').html(table_string);
}

function showDashboardModal(option=''){
    $('#dashboard-modal').modal('show');
    if(option == "pesan"){
        $.get(`/get_inbox_filter/?year=${$.cookie('filter-tahun')}&month=${$.cookie('filter-bulan')}`, function(data){
            console.log(data);
            tableModalBuilder('Daftar Pesanan',data.data);
        });
    }
    if(option == "proses"){
        $.get(`/get_process_filter/?year=${$.cookie('filter-tahun')}&month=${$.cookie('filter-bulan')}`, function(data){
            console.log(data);
            tableModalBuilder('Daftar Kelola Pesanan',data.data);
        });
    }
    if(option == "kirim"){
        $.get(`/get_sender_filter/?year=${$.cookie('filter-tahun')}&month=${$.cookie('filter-bulan')}`, function(data){
            console.log(data);
            tableModalBuilder('Daftar Pesanan Terkirim',data.data);
        });
    }
}

$(document).ready(function() {
    var curr_date = new Date();
    var curr_month = curr_date.getMonth()+1;
    var curr_year = curr_date.getFullYear();

	get_info();

    $('#filter-dashboard').on('submit',function(){
        var bulan = $('#filter-bulan').val();
        var tahun = $('#filter-tahun').val();
        
        if($.cookie('filter-bulan')) {
            $.removeCookie('filter-bulan');
        }
        $.cookie('filter-bulan', bulan);

        if($.cookie('filter-tahun')) {
            $.removeCookie('filter-tahun');
        }
        $.cookie('filter-tahun', tahun);

        filter_chart($.cookie('filter-tahun'), $.cookie('filter-bulan'));
        filter_chart_name($.cookie('filter-tahun'), $.cookie('filter-bulan'));
        filter_chart_courier($.cookie('filter-tahun'), $.cookie('filter-bulan'));        

        return false;
    });

    if($.cookie('filter-bulan') && $.cookie('filter-tahun')){
        $("#filter-bulan").val($.cookie('filter-bulan'));
        $("#filter-tahun").val($.cookie('filter-tahun'));
        curr_month = $.cookie('filter-bulan');
        curr_year = $.cookie('filter-tahun');
    } else {
        $("#filter-bulan").val(curr_month);
        $("#filter-tahun").val(curr_year);
    }

    filter_chart(curr_year, curr_month);
    filter_chart_name(curr_year, curr_month);
    filter_chart_courier(curr_year, curr_month);
});