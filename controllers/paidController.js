const express = require ('express');
const axios = require('axios');
const router = express.Router();
const keys = require("../keys/keys");
const hmacSHA256 = require('crypto-js/hmac-sha256');
const Hex = require('crypto-js/enc-hex');
const util = require('util');
const fs = require('fs');
const crypto = require('crypto');
const controller = {};

const username = keys.USERNAME;
const password = keys.PASSWORD;
const publicKey = keys.PUBLIC_KEY;
const HMACSHA256 = keys.HMACSHA256; 

controller.home = (req, res) => {
    res.render("index", { title: 'Demo NodeJS' })
}

controller.formtoken = async (req, res) => {
    
    const { amount, currency, orderId, email, firstName, lastName, phoneNumber, identityType, identityCode, address, country, city, state, zipCode } = req.body;

    // URL de Web Service REST
    url = 'https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment';

    // Encabezado Basic con concatenación de "usuario:contraseña" en base64
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
            "billingDetails": {
                "firstName": firstName,
                "lastName": lastName,
                "phoneNumber": phoneNumber,
                "identityType": identityType,
                "identityCode": identityCode,
                "address": address,
                "country": country,
                "city": city,
                "state": state,
                "zipCode": zipCode
            }
        }
    };

    const response = await axios.post(url, data, {
      headers: headers,
    });

    if (response.data.status == 'SUCCESS'){
        // Obtenemos el formtoken generado
        const formToken = response.data.answer.formToken;
        res.render("checkout", {formToken, publicKey});
    }else{
        const error = response.data;
        res.render("error", {error});
    }
}

controller.paidResult = (req, res) => {
    if (Object.keys(req.body).length === 0){
        throw new Error('No post data received!');
    }

    // Validación de firma
    if (!checkHash(req.body, HMACSHA256)){
        throw new Error('Invalid signature');
    }

    const answer = JSON.parse(req.body['kr-answer']);

    res.status(200).render("result", { 'answer': answer, 'orderDetails': answer.orderDetails, 'respuesta': req.body });
}

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

const checkHash = (response, key) => {
    const answer = response['kr-answer'];

    const calculateHash = Hex.stringify(hmacSHA256(answer, key))

    return calculateHash == response["kr-hash"];
}

module.exports = controller;