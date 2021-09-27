import {ENDPOINT} from "react-native-dotenv";

export const TitleService = {
    getAll: () => fetch(ENDPOINT + '/api/titles',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            return json;
        })
        .catch((error) => {
            console.warn("Error", error + ' ' + ENDPOINT);
            alert("Title Service:\n" + error+"\n"+ENDPOINT);
        }),
    create: (title) => fetch(ENDPOINT + '/api/titles/'+title.id,
        {
            method: 'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                 title: title,
             })
        })
        .then((response) => {
            return response.json;
        })
        .then((json) =>{
            return json;
        })
        .catch((error) =>{
            console.warn("Error", error + ' ' + ENDPOINT);
            alert("Title Service:?\n" + error +"\n" + ENDPOINT);
        }),
    update: (title) => fetch(ENDPOINT + '/api/titles/' + title.id,
        {
            method: 'PUT',
            headers: {
                'Accept' : 'application/json',
                'Content-Type': 'application/json'
            },
             body: JSON.stringify({
                 title: title,
             })
        })
        .then((response) => {
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) => {
            console.warn("Error",error + ' ' + ENDPOINT);
            alert("Title Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title) => fetch(ENDPOINT + '/api/title/id' + title.id,
        {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                title: title,
            })
        })
        .then((response) => {
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) => {
            console.warn("Error",error + ' ' + ENDPOINT);
            alert("Title Service:\n" + error + "\n" + ENDPOINT);
        }),
    sendNotification: (customer,title,token,ccme) => fetch(ENDPOINT + '/api/titles/'+ title.apiId +'/notify',
        {
            method: 'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                email:customer.email,
                name:customer.name,
                ccme:ccme
            })

        })
        .then((response) => {
            if (response.status === 200)
                return response.json();
            return response.json().then(json => Promise.reject({status:response.status,message:json.error_description, errors:json.errors}));
        })
        .then((json) => {
            return json;
        }),
};