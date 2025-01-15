<p align="center">
  <img src="https://github.com/izipay-pe/Imagenes/blob/main/logos_izipay/logo-izipay-banner-1140x100.png?raw=true" alt="Formulario" width=100%/>
</p>

# Embedded-PaymentForm-NodeJS

## Índice

➡️ [1. Introducción](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#%EF%B8%8F-1-introducci%C3%B3n)  
🔑 [2. Requisitos previos](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#-2-requisitos-previos)  
🚀 [3. Ejecutar ejemplo](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#-3-ejecutar-ejemplo)  
🔗 [4. Pasos de integración](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#4-pasos-de-integraci%C3%B3n)  
💻 [4.1. Desplegar pasarela](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#41-desplegar-pasarela)  
💳 [4.2. Analizar resultado de pago](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#42-analizar-resultado-del-pago)  
📡 [4.3. Pase a producción](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#43pase-a-producci%C3%B3n)  
🎨 [5. Personalización](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#-5-personalizaci%C3%B3n)  
📚 [6. Consideraciones](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#-6-consideraciones)

## ➡️ 1. Introducción

En este manual podrás encontrar una guía paso a paso para configurar un proyecto de **[NodeJS]** con la pasarela de pagos de IZIPAY. Te proporcionaremos instrucciones detalladas y credenciales de prueba para la instalación y configuración del proyecto, permitiéndote trabajar y experimentar de manera segura en tu propio entorno local.
Este manual está diseñado para ayudarte a comprender el flujo de la integración de la pasarela para ayudarte a aprovechar al máximo tu proyecto y facilitar tu experiencia de desarrollo.

> [!IMPORTANT]
> En la última actualización se agregaron los campos: **nombre del tarjetahabiente** y **correo electrónico** (Este último campo se visualizará solo si el dato no se envía en la creación del formtoken). 

<p align="center">
  <img src="https://github.com/izipay-pe/Imagenes/blob/main/formulario_incrustado/Imagen-Formulario-Incrustado.png?raw=true" alt="Formulario" width="350"/>
</p>

## 🔑 2. Requisitos Previos

- Comprender el flujo de comunicación de la pasarela. [Información Aquí](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/guide/start.html)
- Extraer credenciales del Back Office Vendedor. [Guía Aquí](https://github.com/izipay-pe/obtener-credenciales-de-conexion)
- Para este proyecto utilizamos la herramienta Visual Studio Code.
> [!NOTE]
> Tener en cuenta que, para que el desarrollo de tu proyecto, eres libre de emplear tus herramientas preferidas.

## 🚀 3. Ejecutar ejemplo


### Clonar el proyecto
```sh
git clone https://github.com/izipay-pe/Embedded-PaymentForm-Php.git
``` 

### Datos de conexión 

Reemplace **[CHANGE_ME]** con sus credenciales de `API REST` extraídas desde el Back Office Vendedor, revisar [Requisitos previos](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#-2-requisitos-previos).

- Editar el archivo `keys/keys.js` en la ruta raiz del proyecto:
```node
const keys = {
    // Identificador de la tienda
    "USERNAME" : "~ CHANGE_ME_USER_ID ~",

    // Clave de Test o Producción
    "PASSWORD" : "~ CHANGE_ME_PASSWORD ~",

    // Clave Pública de Test o Producción
    "PUBLIC_KEY" : "~ CHANGE_ME_PUBLIC_KEY ~", 
    
    // Clave HMAC-SHA-256 de Test o Producción
    "HMACSHA256": "~ CHANGE_ME_HMAC_SHA_256 ~",
}

module.exports = keys
```

### Ejecutar proyecto

1. Ejecuta el siguiente comando para instalar todas las dependencias necesarias:
```bash
npm install
```

2.  Iniciar la aplicación:
```bash
npm start
```

## 🔗4. Pasos de integración

<p align="center">
  <img src="https://i.postimg.cc/pT6SRjxZ/3-pasos.png" alt="Formulario" />
</p>

## 💻4.1. Desplegar pasarela
### Autentificación
Extraer las claves de `usuario` y `contraseña` del Backoffice Vendedor, concatenar `usuario:contraseña` y agregarlo en la solicitud del encabezado `Authorization`. Podrás encontrarlo en el archivo `controllers/paidController.js`.
```node
const auth = 'Basic ' + btoa(username + ':' + password);

const headers = {
      'Content-Type': 'application/json',
      'Authorization': auth,
};
```
ℹ️ Para más información: [Autentificación](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/guide/embedded/keys.html)
### Crear formtoken
Para configurar la pasarela se necesita generar un formtoken. Se realizará una solicitud API REST a la api de creación de pagos:  `https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment` con los datos de la compra para generar el formtoken. Podrás encontrarlo en el archivo `controllers/paidController.js`.

```node
controller.formtoken = async (req, res) => {
    const { amount, currency, orderId, email, firstName, lastName, phoneNumber, identityType, identityCode, address, country, city, state, zipCode } = req.body;

    url = 'https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment';

    const auth = 'Basic ' + btoa(username + ':' + password); 

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': auth,
    };

    const data = {
        "amount":   amount*100,
        "currency": currency,
        "orderId":  orderId,
        "customer": {
            "email": email,
            ...
            ...
        }
    };

    const response = await axios.post(url, data, {
      headers: headers,
    });

    if (response.data.status == 'SUCCESS'){
        const formToken = response.data.answer.formToken;
        res.render("checkout", {formToken, publicKey});
    }else{
        const error = response.data;
        res.render("error", {error});
    }
}

```
ℹ️ Para más información: [Formtoken](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/guide/embedded/formToken.html)

### Visualizar formulario
Para desplegar la pasarela, se configura la llave `public key` en el encabezado (Header) del archivo `views/checkout.ejs`. En el ejemplo la llave se extrae directamente del archivo `keys/keys.js`.

Header: 
Se coloca el script de la libreria necesaria para importar las funciones y clases principales de la pasarela.
```javascript
<script type="text/javascript"
        src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
        kr-public-key="<%= publicKey %>"
        kr-post-url-success="result" kr-language="es-Es">
</script>

<!-- Estilos de la pasarela de pagos -->
<link rel="stylesheet" href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css">
<script type="text/javascript" src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js"></script>
```
Además, se inserta en el body una etiqueta div con la clase `kr-embedded` que deberá tener el atributo `kr-form-token` e incrustarle el `formtoken` generado en la etapa anterior.

Body:
```javascript
<div id="micuentawebstd_rest_wrapper">
    <div class="kr-embedded" kr-form-token="<%= formToken %>"></div>
</div>
```
ℹ️ Para más información: [Visualizar formulario](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/guide/embedded/formToken.html)

## 💳4.2. Analizar resultado del pago

### Validación de firma
Se configura la función `checkHash` que realizará la validación de los datos recibidos por el servidor luego de realizar el pago mediante el parámetro `kr-answer` utilizando una clave de encriptacón definida en `key`. Podrás encontrarlo en el archivo `controllers/paidController.js`.

```node
const checkHash = (response, key) => {
    const answer = response['kr-answer'];

    const calculateHash = Hex.stringify(hmacSHA256(answer, key))

    return calculateHash == response["kr-hash"];
}
```

Se valida que la firma recibida es correcta

```node
if (!checkHash(req.body, HMACSHA256)){
    throw new Error('Invalid signature');
}
```
En caso que la validación sea exitosa, se puede extraer los datos de `kr-answer` a través de un JSON y mostrar los datos del pago realizado.

```php
const answer = JSON.parse(req.body['kr-answer']);
```
ℹ️ Para más información: [Analizar resultado del pago](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/kb/payment_done.html)

### IPN
La IPN es una notificación de servidor a servidor (servidor de Izipay hacia el servidor del comercio) que facilita información en tiempo real y de manera automática cuando se produce un evento, por ejemplo, al registrar una transacción.

Se realiza la verificación de la firma utilizando la función `checkHash` y se devuelve al servidor de izipay un mensaje confirmando el estado del pago. Podrás encontrarlo en el archivo `controllers/paidController.js`.

```node
controller.ipn = (req, res) => {
    if (Object.keys(req.body).length === 0){
        throw new Error('No post data received!');
    }

    // Validación de firma en IPN
    if (!checkHash(req.body, password)){
        throw new Error('Invalid signature');
    }

    const answer = JSON.parse(req.body['kr-answer']);
    const transaction = answer['transactions'][0];

    //Verificar orderStatus: PAID / UNPAID
    const orderStatus = answer['orderStatus'];
    const orderId = answer['orderDetails']['orderId'];
    const transactionUuid = transaction['uuid'];

    res.status(200).send(`OK! OrderStatus is ${orderStatus}`);
}
```

La ruta o enlace de la IPN (`ruta-servidor/ipn`) debe ir configurada en el Backoffice Vendedor, en `Configuración -> Reglas de notificación -> URL de notificación al final del pago`

<p align="center">
  <img src="https://i.postimg.cc/1X6pY759/ipn.png" alt="Formulario" width=80%/>
</p>

ℹ️ Para más información: [Analizar IPN](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/api/kb/ipn_usage.html)

### Transacción de prueba

Antes de poner en marcha su pasarela de pago en un entorno de producción, es esencial realizar pruebas para garantizar su correcto funcionamiento.

Puede intentar realizar una transacción utilizando una tarjeta de prueba con la barra de herramientas de depuración (en la parte inferior de la página).

<p align="center">
  <img src="https://i.postimg.cc/3xXChGp2/tarjetas-prueba.png" alt="Formulario"/>
</p>

- También puede encontrar tarjetas de prueba en el siguiente enlace. [Tarjetas de prueba](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/api/kb/test_cards.html)

## 📡4.3.Pase a producción

Reemplace **[CHANGE_ME]** con sus credenciales de PRODUCCIÓN de `API REST` extraídas desde el Back Office Vendedor, revisar [Requisitos Previos](https://github.com/izipay-pe/Readme-Template/tree/main?tab=readme-ov-file#-2-requisitos-previos).

- Editar el archivo `keys/keys.js` en la ruta raiz del proyecto:
```node
const keys = {
    // Identificador de la tienda
    "USERNAME" : "~ CHANGE_ME_USER_ID ~",

    // Clave de Test o Producción
    "PASSWORD" : "~ CHANGE_ME_PASSWORD ~",

    // Clave Pública de Test o Producción
    "PUBLIC_KEY" : "~ CHANGE_ME_PUBLIC_KEY ~", 
    
    // Clave HMAC-SHA-256 de Test o Producción
    "HMACSHA256": "~ CHANGE_ME_HMAC_SHA_256 ~",
}

module.exports = keys
```

## 🎨 5. Personalización

Si deseas aplicar cambios específicos en la apariencia de la pasarela de pago, puedes lograrlo mediante la modificación de código CSS. En este enlace [Código CSS - Incrustado](https://github.com/izipay-pe/Personalizacion/blob/main/Formulario%20Incrustado/Style-Personalization-Incrustado.css) podrá encontrar nuestro script para un formulario incrustado.

<p align="center">
  <img src="https://i.postimg.cc/zDddmKpH/persona.png" alt="Formulario"/>
</p>

## 📚 6. Consideraciones

Para obtener más información, echa un vistazo a:

- [Formulario incrustado: prueba rápida](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/quick_start_js.html)
- [Primeros pasos: pago simple](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/javascript/guide/start.html)
- [Servicios web - referencia de la API REST](https://secure.micuentaweb.pe/doc/es-PE/rest/V4.0/api/reference.html)
