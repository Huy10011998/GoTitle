import {ENDPOINT} from 'react-native-dotenv';

export const TaxService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/tax',
        {
            method:'GET',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            }
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Tax Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,tax) => fetch(ENDPOINT + '/api/title/'+title.id+'/tax',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                tax: tax,
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Tax Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,tax) => fetch(ENDPOINT + '/api/title/'+title.id+'/tax/'+tax.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                tax: tax,
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Tax Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,tax) => fetch(ENDPOINT + '/api/title/'+title.id+'/tax/'+tax.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                tax: tax,
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json) => {
            return json;
        })
        .catch((error) =>{
            console.warn("Error" + error + ' ' + ENDPOINT);
            alert("Tax Service:\n" + error + "\n" + ENDPOINT);})
};
