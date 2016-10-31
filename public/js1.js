$( document ).ready(function() {
    	
	$("#carsFromServer").change(function(){
	 	      var selectedCar=$(this).val()
		       
				$.ajax({
				url : "desc",
				type : 'GET',
				datatype : "json",
				success : function(data) {
					alert(data)
						$("#carDesc").html(data).show();
				},
				data : {
					       'car' : selectedCar
					       }
				})
	})
	
});






	

	

	
