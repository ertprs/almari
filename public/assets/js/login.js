$('#submit-button').click( function() {
    var username = $('input[name="username"]').val();
    var password = $('input[name="password"]').val();
    var remember = $('input[name="remember"]').val();
    $.ajax({
        url: '/api/auth',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 
            username : username, 
            password : password, 
            remember : remember 
        }),
        success: function(data) {
            if (data.status == 'Failed' || data.data == ''){
                swal("Login Failed!", "Please enter your username and password correctly.", "error");
            }
            if (data.status == 'sucess'){
                swal({
                    title: "Success",
                    text: "Permissions assigned Successfully",
                    icon: "success",
                    timer: 1000,
                    showCancelButton: false,
                    showConfirmButton: false,
                    buttons: false
                }).then(function(){
                    var max_expired = 1; // 1 days
                    setCookie("id",data.data,max_expired);
                    window.location.href = "/dashboard";
                })
            }
        }
    });
    $("#login-form").submit(function(e){
        e.preventDefault();
    });
});