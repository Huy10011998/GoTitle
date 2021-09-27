import {ENDPOINT} from "react-native-dotenv";

export const InvoiceService = {

    get: (title, token) => fetch(ENDPOINT + '/api/title/' + title.apiId + '/invoice',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({
                status: response.status,
                message: json.error_description,
                errors: json.errors
            }));
        })
        .then((json) => {
            return json;
        }),
    create: (title, token, overwrite = false) => fetch(ENDPOINT + '/api/title/' + title.apiId + '/invoice',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                overwrite: overwrite,
                clientName: title.customer && title.customer.name ? title.customer.name : null,
                clientCompanyName: title.customer && title.customer.companyName ? title.customer.companyName : null,
                clientAddress: title.customer && title.customer.clientAddress ? title.customer.clientAddress : null,
                clientFileNumber: title.customer && title.customer.fileNumber ? title.customer.fileNumber : null,
                clientCompanyFileNumber: title.customer && title.customer.companyFileNumber ? title.customer.companyFileNumber : null
            })
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({
                status: response.status,
                message: json.error_description,
                errors: json.errors
            }));
        })
        .then((json) => {
            return json;
        }),
    update: (title, token, overwrite) => fetch(ENDPOINT + '/api/title/' + title.apiId + '/invoice',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                overwrite: overwrite,
                clientName: title.customer && title.customer.name ? title.customer.name : null,
                clientCompanyName: title.customer && title.customer.companyName ? title.customer.companyName : null,
                clientAddress: title.customer && title.customer.clientAddress ? title.customer.clientAddress : null,
                clientFileNumber: title.customer && title.customer.fileNumber ? title.customer.fileNumber : null,
                clientCompanyFileNumber: title.customer && title.customer.companyFileNumber ? title.customer.companyFileNumber : null
            })
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({
                status: response.status,
                message: json.error_description,
                errors: json.errors
            }));
        })
        .then((json) => {
            return json;
        }),
    getInvoiceItems: (invoiceApiId, token) => fetch(ENDPOINT + '/api/invoices/' + invoiceApiId + '/items',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({
                status: response.status,
                message: json.error_description,
                errors: json.errors
            }));
        })
        .then((json) => {
            return json;
        }),
    createInvoiceItem: (title, invoice, token, description, unitPrice, quantity = 1) => fetch(ENDPOINT + '/api/invoices/' + invoice.id + '/items',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                description: description,
                quantity: quantity,
                unitPrice: unitPrice
            })
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({
                status: response.status,
                message: json.error_description,
                errors: json.errors
            }));
        })
        .then((json) => {
            return json;
        }),
    updateInvoiceItem: (title, invoice, invoiceItem, token, overwrite) => fetch(ENDPOINT + '/api/invoices/' + invoice.id + '/items/' + invoiceItem.id,
        {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                overwrite: overwrite,
                description: invoiceItem.description,
                quantity: invoiceItem.quantity,
                unitPrice: invoiceItem.unitPrice
            })
        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({
                status: response.status,
                message: json.error_description,
                errors: json.errors
            }));
        })
        .then((json) => {
            return json;
        }),
};
