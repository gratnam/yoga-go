$(document).ready(function() {
	$('#missingName, #takenName').hide();
	$('#myModal').modal('show');
	$('.saveName').click(function(){
		$('#missingName, #takenName').hide();
		$('.modal-body').removeClass('has-warning')
		var name = $('.name').val();
		if(name === ''){
			$('.modal-body').addClass('has-warning')
			$('#missingName').show()
		}

		//if name taken
		// if(){ 
		// 	$('.modal-body').addClass('has-warning')
		// 	$('#takenName').show()
		// }


		$('.closeName').attr('href', 'name/' + name);
		$.post('/', {'courtName': name});
	});
});

