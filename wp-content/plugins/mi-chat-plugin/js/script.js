document.addEventListener("DOMContentLoaded", function() {

    // $(document).ready(function(){
    // Variables globales y estado inicial
    let formularioBloqueado = false;
    let chatCerradoDespuesDeEnviar = false;
    let nombreUsuario, telefonoUsuario;
	let empreUsuario, emailUsuario;
    let mensajesChat = '';
    let mensajeContactoMostrado = false;
    let temporizadorCierreChat;
	let idGoogle;

    // Función para mostrar alertas
    function mostrarAlerta(icon, title, text) {
        const alertHTML = `
        <div class="alert alert-${icon}" role="alert">
            <strong>${title}</strong> ${text}
        </div>`;
        $("#alert-container").html(alertHTML);
        setTimeout(function () {
            $("#alert-container").html("");
        }, 3000);
    }

    // Función para configurar el saludo inicial
    function configurarSaludoInicial() {
        const saludoInicial = `Hola <strong>${nombreUsuario}!</strong> <br> Tu WhatsApp: <strong> +57${telefonoUsuario}</strong>  <br><br> Te gustaria iniciar cotizacion,<br> para tu empresa: <b>${empreUsuario}</b>?`;
        $(".WhatsappChat__Text").empty().html(saludoInicial);
    }

    // Funciones para mostrar y ocultar elementos del chat
    function mostrarSegundoPaso() {
        $(".info-avatar").addClass("hide");
        $(".start-chat").removeClass("hide");
    }

    function mostrarChat() {
        if (formularioBloqueado) {
            $(".start-chat").removeClass("hide");
            $(".info-avatar").addClass("hide");
        } else {
            mostrarSegundoPaso();
        }
        configurarSaludoInicial();
        $("#whatsapp-chat").addClass("show").removeClass("hide");
        $("#form-field-name").val(nombreUsuario);
        $("#form-field-phone").val(telefonoUsuario);
        $("#form-field-company").val(empreUsuario);
		$("#form-field-email").val(emailUsuario);

        if ($("#chat-container").is(':empty')) {
            $("#chat-container").html(mensajesChat);
        }
    }

    // Función para validar el teléfono
    function esTelefonoValido(telefono) {
        const patron = /^\d{10}$/;
        return patron.test(telefono);
    }
    // Función para validar el nombre
    function esNombreValido(nombre) {
        return nombre.length > 2; // Aquí puedes añadir más reglas
    }
	// Función para validar el nombre de la empresa
    function esEmpresaValido(empresa) {
     	return empresa.length > 2; // Aquí puedes añadir más reglas
   	}
	// Función para validar el email
    function esEmailValido(email) {
     	// Expresión regular para validar un correo electrónico
		var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
   	}

	        // Funciones para manejar la hora
        function formatoHora(fecha) {
            let hora = fecha.getHours();
        let minutos = fecha.getMinutes();
            const ampm = hora >= 12 ? 'PM' : 'AM';
        hora = hora % 12;
        hora = hora ? hora : 12;
        minutos = minutos < 10 ? '0' + minutos : minutos;
        return `${hora}:${minutos} ${ampm}`;
        }
	
	// Función para abrir una conversación en WhatsApp
	function abrirConversacionWhatsApp() {
		
		// Construir la URL para abrir una conversación en WhatsApp con el número de teléfono
		let urlWhatsApp = `whatsapp://send?phone=573205418796`;

		// Construir el mensaje con el nombre, número de teléfono, empresa y correo electrónico
		let mensajeWhatsApp = `Hola, mi nombre es ${nombreUsuario},\n`;
		mensajeWhatsApp += `Te contacto desde la empresa ${empreUsuario}.\n`;
		mensajeWhatsApp += `Mi número de teléfono es ${telefonoUsuario} y mi correo electrónico es ${emailUsuario}.\n`;

		// Codificar el mensaje para que sea una URL válida
    	mensajeWhatsApp = encodeURIComponent(mensajeWhatsApp);
		
		// Agregar el nombre y mensaje si están disponibles
		
			urlWhatsApp += `&text=${mensajeWhatsApp}`;
			//urlWhatsApp += `&text=Hola ${nombreUsuario}, `;
	
		console.log(nombreUsuario);
		console.log(empreUsuario);
        console.log(telefonoUsuario);
        console.log(emailUsuario);
		// Abrir la conversación en WhatsApp después de un retraso de 2 segundos
		setTimeout(function() {
			window.open(urlWhatsApp);
		}, 3000);
	}
	
    // Función para añadir un mensaje al chat
    function agregarMensajeAlChat(mensaje) {
        const ahora = new Date();
        const horaFormato = ahora.toTimeString().split(' ')[0];

        var mensajeUsuarioHTML = `
        <div class="WhatsappChat__Message WhatsappChat__Message--user">
			<div class="WhatsappChat__Author" id="author-wapp"></div>
            <div class="WhatsappChat__Text WhatsappChat__Text--user">${mensaje}</div>
            <div class="WhatsappChat__Time WhatsappChat__Time--user" id="horaUsuario2">${formatoHora(new Date())}</div>
        </div>`;

        $("#chat-container").append(mensajeUsuarioHTML);
        $("#form-field-message").val('');

        setTimeout(function () {
            var respuestaHTML = `
            <div class="WhatsappChat__Message">
                <div class="WhatsappChat__Author" id="author-wapp2">${nombreUsuario}</div>
                <div class="WhatsappChat__Text hora-respuesta">${respuestaAutomatica(mensaje)}</div>
            </div>`;
            $("#chat-container").append(respuestaHTML);
            $("#whatsapp-chat").scrollTop($("#whatsapp-chat")[0].scrollHeight);

            formularioBloqueado = true;
            chatCerradoDespuesDeEnviar = true;
            $("#form-field-message").hide();
            $(".start-chat .blanter-msg").hide();
        }, 500);
    }

        // Función para enviar datos al webhook, incluyendo todos los parámetros UTM
        function enviarDatosWebhook(data) {
            var ahora = new Date();
            var fecha = ahora.toISOString().split('T')[0];
            var hora = ahora.toTimeString().split(' ')[0];
        
            data.fecha = fecha;
            data.hora = hora;
            data.dispositivo = detectarDispositivo();
            
            // Generar valores para los parámetros UTM
            var utm_source = "chat"; // Origen del tráfico
            var utm_medium = "whatsapp"; // Medio de tráfico
            var utm_campaign = "chat_campaign"; // Nombre de la campaña
            var utm_term = ""; 
            var utm_content = ""; 
        
            // Agregar los parámetros UTM al objeto de datos
            data.utm_source = utm_source;
            data.utm_medium = utm_medium;
            data.utm_campaign = utm_campaign;
            data.utm_term = utm_term;
            data.utm_content = utm_content;
        
            // Envía los datos al webhook
            $.ajax({
                url: 'chatConfig.webhookUrl',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (response) {
                    console.log('Datos enviados con éxito', response);
                },
                error: function (error) {
                    console.error('Error al enviar datos', error);
                }
            });
        }


    // Función para detectar el dispositivo
    function detectarDispositivo() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) {
            return 'Móvil';
        } else if (/tablet/i.test(ua)) {
            return 'Tablet';
        } else {
            return 'Escritorio';
        }
    }
console.log(chatConfig.mensajeRespuesta); // Para depuración

    function respuestaAutomatica(mensaje) {
    // Utiliza el mensaje de respuesta automática desde la configuración
    let respuestaPredeterminada = (typeof chatConfig !== 'undefined' && chatConfig.mensajeRespuesta) ? chatConfig.mensajeRespuesta : "Este es un mensaje predeterminado.";

    
}

	function evento() { 
		var evento = "form_whatsapp";
		if (typeof chatConfig !== 'undefined' && chatConfig.idGoogle) {
			$('#id-google').text(chatConfig.idGoogle);
		}
		var etiqueta = $('#id-google').text().trim();
		console.log('Etiqueta Google Funcion:', etiqueta);
		if (etiqueta.length > 0) {
			gtag('event', evento, { 
				'event_category': 'Form', 
				'event_label': evento 
			});
		}else {
			console.log("No se encontro ID");
		}
	}


// Evento de click en el botón de validación
$("#btnValidar").on("click", function () {
    nombreUsuario = $("#chat-field-name").val().trim();
    telefonoUsuario = $("#chat-field-phone").val().trim();
    empreUsuario = $("#chat-field-company").val().trim();
	emailUsuario = $("#chat-field-email").val().trim();
    var mensaje = $("#form-field-message").val().trim();

    if (!esTelefonoValido(telefonoUsuario)) {
        mostrarAlerta('error', 'Error', 'Verifica tu numero de WhatsApp');
        return;
    }

    if (!esNombreValido(nombreUsuario)) {
        mostrarAlerta('error', 'Error', 'Verifica tu nombre');
        return;
    }
	
	if (!esEmpresaValido(empreUsuario)) {
    	mostrarAlerta('error', 'Error', 'Verifica el nombre de tu empresa');
    	return;
  	}
	
	if (!esEmailValido(emailUsuario)) {
    	mostrarAlerta('error', 'Error', 'Verifica el email');
    	return;
  	}


    // Crear un objeto con los datos del usuario y los parámetros UTM
    var datosParaWebhook = {
        nombre: nombreUsuario,
        telefono: telefonoUsuario,
       	empresa: empreUsuario,
		email: emailUsuario,
        mensaje: mensaje,
        // Incluir los parámetros UTM
        utm_source: 'chat',
        utm_medium: 'whatsapp',
        utm_campaign: 'chat_campaign',
        utm_term: '',
        utm_content: ''
    };

    // Llamar a la función enviarDatosWebhook con los datos y los parámetros UTM
    enviarDatosWebhook(datosParaWebhook);
	evento();
	
    mostrarChat();
});


	
    // Manejo del formulario de chat
    $("#form_whatsapp_sl").submit(function (event) {
        event.preventDefault();
        if (formularioBloqueado) return false;

        var mensaje = $("#form-field-message").val().trim();
        if (mensaje !== '') {
            agregarMensajeAlChat(mensaje);
        }
        $("#form-field-message").val('');
    });

    // Funciones para manejar el cierre automático del chat
    function reiniciarTemporizadorCierreChat() {
        clearTimeout(temporizadorCierreChat);
        temporizadorCierreChat = setTimeout(function() {
            $("#whatsapp-chat").addClass("hide").removeClass("show");
            mensajesChat = $("#chat-container").html();
        }, 200000); // 2 minutos de inactividad
    }


    // Actualizar la configuración que viene desde el dashboard de wordpress
    if (typeof chatConfig !== 'undefined' && chatConfig.nombreEmpresa) {
        $('#company-name').text(chatConfig.nombreEmpresa);
    }
    if (typeof chatConfig !== 'undefined' && chatConfig.logoEmpresa) {
        $('#company-logo').attr('src', chatConfig.logoEmpresa);
    }
    if (typeof chatConfig !== 'undefined' && chatConfig.nombreEmpresa) {
        $('#author-wapp').text(chatConfig.nombreEmpresa);
    }
    if (typeof chatConfig !== 'undefined' && chatConfig.nombreEmpresa) {
        $('#author-wapp2').text(chatConfig.nombreEmpresa);
    }
    if (typeof chatConfig !== 'undefined' && chatConfig.textEntrada) {
        $('#asesor-text').text(chatConfig.textEntrada);
    }
	if (typeof chatConfig !== 'undefined' && chatConfig.idGoogle) {
        $('#id-google').text(chatConfig.idGoogle);
    }

    console.log(chatConfig);

    document.addEventListener("DOMContentLoaded", function() {
        if (typeof chatConfig !== 'undefined' && chatConfig.nombreEmpresa) {
            document.getElementById('author-wapp2').innerHTML = chatConfig.nombreEmpresa;
        }
    });




        function agregarMensajeAlChat(mensaje) {
            const ahora = new Date();
            const horaFormato = ahora.toTimeString().split(' ')[0];
  
            var mensajeUsuarioHTML = `
            <div class="WhatsappChat__Message WhatsappChat__Message--user">
				<div class="WhatsappChat__Author" id="author-wapp3">${nombreUsuario}</div>
                <div class="WhatsappChat__Text WhatsappChat__Text--user">${mensaje}</div>
                <div class="WhatsappChat__Time WhatsappChat__Time--user" id="horaUsuario2">${formatoHora(new Date())}</div>
            </div>
            `;
    
            $("#chat-container").append(mensajeUsuarioHTML);
            $("#form-field-message").val('');
            
            setTimeout(function () {
				
				nombreUsuario = $("#chat-field-name").val().trim();
				telefonoUsuario = $("#chat-field-phone").val().trim();
				empreUsuario = $("#chat-field-company").val().trim();
				emailUsuario = $("#chat-field-email").val().trim();
				mensaje = $("#form-field-message").val().trim();
				
                if (typeof chatConfig !== 'undefined' && chatConfig.nombreEmpresa) {
                    $('#author-wapp2').text(chatConfig.nombreEmpresa);
                }
				
                console.log('chatConfig:', chatConfig);
				
                $('#author-wapp2').text(chatConfig.nombreEmpresa);
                    
                var respuestaHTML = `<div  style="opacity: 1;" class="WhatsappChat__Message">
                        <div class="WhatsappChat__Author" id="author-wapp2">${chatConfig.nombreEmpresa}</div>
                        <div class="WhatsappChat__Text hora-respuesta">${chatConfig.mensajeRespuesta}</div>
						<div class="WhatsappChat__Time WhatsappChat__Time--user" id="horaUsuario">${formatoHora(new Date())}</div>
                        </div>`;
        
                $("#chat-container").append(respuestaHTML);
                $("#whatsapp-chat").scrollTop($("#whatsapp-chat")[0].scrollHeight);
        
                formularioBloqueado = true;
                chatCerradoDespuesDeEnviar = true;
                $("#form-field-message").hide();
                $(".start-chat .blanter-msg").hide();
                 
            }, 1000);
			abrirConversacionWhatsApp();
        }

      
        $("#form-field-message").on("keydown", function (event) {
            if (event.key === "Enter") {
            $("#form_whatsapp_sl").submit();
            }
        });

        $(document).on("click", ".close-chat, .blantershow-chat", function () {
            const isClosing = $(this).hasClass("close-chat");
        if (isClosing) {
            mensajesChat = $("#chat-container").html();
        $("#whatsapp-chat").addClass("hide").removeClass("show");
            } else {
                if (chatCerradoDespuesDeEnviar && !mensajeContactoMostrado) {
            mostrarMensajeContacto();
        chatCerradoDespuesDeEnviar = false;
                } else {
            $("#whatsapp-chat").removeClass("hide").addClass("show");
                }
            }
        });
     

        function mostrarMensajeContacto() {
            if (!mensajeContactoMostrado) {
                var mensajeContactoHTML = `
        <div class="WhatsappChat__Message2">
        <div class="WhatsappChat__Text"><b>${chatConfig.nombreEmpresa}</b><br> Te hemos contactado a tu WhatsApp: +57${telefonoUsuario}	</div>
        </div>`;

        // Limpia todo el contenido del chat antes de agregar
        $("#chat-container").empty().html(mensajeContactoHTML);
        mensajeContactoMostrado = true;
            }
        $("#whatsapp-chat").addClass("show").removeClass("hide");
        $(".WhatsappChat__Message").css('display', 'none');
        }

document.addEventListener("DOMContentLoaded", function() {
    // Verifica si chatConfig y chatConfig.nombreEmpresa están definidos
    if (typeof chatConfig !== 'undefined' && chatConfig.nombreEmpresa) {
        var companyNameElement = document.getElementById('company-name');
        if (companyNameElement) {
            companyNameElement.textContent = chatConfig.nombreEmpresa;
        }
    }
});
	

function enviarDatosWebhook(data) {
    var ahora = new Date();
    var fecha = ahora.toISOString().split('T')[0];
    var hora = ahora.toTimeString().split(' ')[0];

    data.fecha = fecha;
    data.hora = hora;
    data.dispositivo = detectarDispositivo();

    // Asegúrate de que chatConfig y chatConfig.webhookUrl están definidos
    if (typeof chatConfig !== 'undefined' && chatConfig.webhookUrl) {
        $.ajax({
            url: chatConfig.webhookUrl, // Usa la URL del webhook desde chatConfig
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                console.log('Datos enviados con éxito');
            },
            error: function (error) {
                console.error('Error al enviar datos', error);
            }
        });
    } else {
        console.error('La URL del webhook no está definida');
    }
}


        function actualizarHora() {
            $("#horaUsuario").text(formatoHora(new Date()));
			$("#horaUsuario2").text(formatoHora(new Date()));
        }

        $('#client-info').html(`Online ${formatoHora(new Date())}`);
        actualizarHora();
    });