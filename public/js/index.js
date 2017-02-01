$(document).ready(function() {
	$('#myModal').modal('show');
	$('.saveName').click(function(){
		var name = $('.name').val();
		$('.closeName').attr('href', 'name/' + name);
		$.post('/', {'courtName': name});
	});
});

