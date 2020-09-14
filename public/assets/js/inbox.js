class PaginationClass {
	
	constructor(path_url='/get_inbox', path_url_total='/get_total_inbox', per_page=10, tbody_id='#tbody_inbox', element_pagination='#demo' ){
		this.path_url = path_url;
		this.path_url_total = path_url_total;
		this.tbody_id = tbody_id;
		this.element_pagination = element_pagination;
		this.per_page = per_page;
		this.column_row = [];
		this.column_id = '';
		this.func_edit = function(id){alert('This is default function. ID is : '+id)};
		this.func_delete = function(id){alert('This is default function. ID is : '+id)};

	}

	build() {
		if (typeof jQuery == 'undefined') {
			alert('JQuery not loaded, please add JQuery library');
		} else {
			const classObj = this;
			$(document).ready(function() {
				classObj.buildPagination();
			});
		}
	}

	setEvent(func_edit, func_delete){
		this.func_edit = func_edit;
		this.func_delete = func_delete;
	}

	setCols(column_row, column_id){
		this.column_row = column_row;
		this.column_id = column_id;
	}

	createRow(limit, offset) {
		const classObj = this;
		$.get(classObj.path_url+'?limit='+limit+'&offset='+offset, function(data) {
			$(classObj.tbody_id).html("");
			for (const row of data.data){
				var str_col = "";
				var i = 0;
				for (const col of classObj.column_row){
					if(i < 1) {
						str_col += '<td><small>'+row[col].split("@")[0]+'</small></td>';
					} else {
						str_col += '<td><small>'+row[col]+'</small></td>';
					}
					i++;
				}

				var style_success = "";
				if(row['is_process'] == 1){
					style_success = 'background-color:#43d39e69;';
				}
				// change only row.[column] and function
				$(classObj.tbody_id).append('<tr style="'+style_success+'">\
					'+str_col+'\
					<td style="min-width:150px;">\
						<a action="edit" data="'+row[classObj.column_id]+'" class="row-data btn-success btn-sm" href="javascript:void(0)"><i class="fa fa-edit"></i></a>\
						<a action="remove" data="'+row[classObj.column_id]+'" class="row-data btn-danger btn-sm" href="javascript:void(0)"><i class="fa fa-trash"></i></a>\
					</td>\
				</tr>');
			}

			$(".row-data").click(function(event){
			        var data = $(event.currentTarget).attr('data');
			        var action = $(event.currentTarget).attr('action');
			        if(action == "edit"){
			        	classObj.func_edit(data);
			        }
			        if(action == "remove"){
			        	classObj.func_delete(data);
			        }
			    }
			);
		});
	}

	buildPagination() {
		const classObj = this;
	    $.ajax({
	        type: "GET",
	        url: classObj.path_url_total,
	        async: true,
	        contentType: 'application/json',
	        dataType:'json',
	        success : function(data) {
	            const total = data.data;
	            classObj.createRow(classObj.per_page, 0);
			    $(classObj.element_pagination).pagination({
			        items: total,
			        itemsOnPage: classObj.per_page,
			        cssStyle: 'light-theme',
			        onPageClick:function(pageNumber, event){
			        	classObj.createRow(classObj.per_page, (classObj.per_page*pageNumber)-1)
			        }
			    });
	        }
	    });
	}
}

function paginator(){
	var paginate = new PaginationClass(
		'/get_inbox',       // response json [{data:[row]}], ex. http://127.0.0.1/controller/get_inbox?limit=[number]&offset=[number]
		'/get_total_inbox', // response json {data:number}, ex. http://127.0.0.1/controller/get_total_inbox
		10,                 // per pages view
		'#tbody_inbox',     // element tbody ID or table tbody
		'#div_pagination'   // element destination pagination button
	);
	paginate.setCols(
		['chat_id', 'message', 'create_time'], // column item row from table database
		'id'                                   // column id from table database
	);
	paginate.setEvent(
		// edit
		function(id){
			
			$('#modal-process').modal('show');
			
			$.get('/get_detail_inbox?id='+id, function(response){
				
				$('#data-id').val(id);
				
				if(response.data.rows.length > 0){
					$('#input-chatid').val(response.data.rows[0].chat_id.split("@")[0]);
					$('#input-ordertime').val(moment(response.data.rows[0].create_time,'YYYY-MM-DDTHH:mm:ss').format('DD-MM-YYYY HH:mm:ss'));
				}

				if(response.data.parse.length > 6 ){
					
					for(const cparse of response.data.parse){
						if(cparse['key'] == '#tanggal/jam'){
							$('#input-datetime').val(cparse['val']);
						}
						if(cparse['key'] == '#pesananorder'){
							$('#input-ordermessage').val(cparse['val']);
						}
						if(cparse['key'] == '#jumlah'){
							$('#input-quantity').val(cparse['val']);
						}
						if(cparse['key'] == '#namapenerima'){
							$('#input-recipientname').val(cparse['val']);
						}
						if(cparse['key'] == '#alamat'){
							$('#input-address').val(cparse['val']);
						}
						if(cparse['key'] == '#nohp'){
							$('#input-phone').val(cparse['val'].split("@")[0]);
						}
						if(cparse['key'] == '#ekspedisi'){
							$('#input-courier').val(cparse['val']);
						}
						if(cparse['key'] == '#namapengirim'){
							$('#input-sender-name').val(cparse['val']);
						}
					}
				}
			});
		},
		// delete
		function(id){
			swal({
			  title: "Are you sure?",
			  text: "You don't want to display this data?",
			  icon: "warning",
			  buttons: true,
			  dangerMode: true,
			})
			.then((willDelete) => {
			  if (willDelete) {
			  	$.get('/delete_inbox?id='+id, function(response){
			  		if(response.status == 'success'){
					    swal("Data has been deleted!", {
					      icon: "success",
					    });
					    paginator();
			  		} else {
					    swal("Failed to delete data!", {
					      icon: "error",
					    });
			  		}
			  	});
			  }
			});
		}
	);

	paginate.build();
}

$(document).ready(function() {
	paginator();
	$("#form-process").on("submit", function(){
		var data_id = $('#data-id').val();
		var chat_id = $('#input-chatid').val();
		var order_time = $('#input-ordertime').val();
		var date_time = $('#input-datetime').val();
		var order_message = $('#input-ordermessage').val();
		var quantity = $('#input-quantity').val();
		var recipient_name = $('#input-recipientname').val();
		var address = $('#input-address').val();
		var phone = $('#input-phone').val();
		var courier = $('#input-courier').val();
		var sender_name = $('#input-sender-name').val();
		var data_json = {
			id : data_id,
			chat_id : chat_id,
			order_time : order_time,
			date_time : date_time,
			order_message : order_message,
			quantity : quantity,
			recipient_name : recipient_name,
			courier : courier,
			phone : phone,
			address : address,
			sender_name : sender_name,
		};
 		$.ajax({
	        url: "/update_inbox",
	        type: "POST",
	        contentType: 'application/json',
	        dataType:'json',
	        data: JSON.stringify(data_json),
	        success: function (response) {
                swal({
                    title: "Success",
                    text: "Save data successfully",
                    icon: "success",
                    timer: 1000,
                    showCancelButton: false,
                    showConfirmButton: false,
                    buttons: false
                }).then(function()  {
                	$('#modal-process').modal('hide');
                	paginator();
                })
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	           console.log(textStatus, errorThrown);
	        }
    	});
		return false;
	})
});