import {ENDPOINT} from 'react-native-dotenv';

export const MortgageService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/mortgages',
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
            alert("Mortgage Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,mortgage) => fetch(ENDPOINT + '/api/title/'+title.id+'/mortgages',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                mortgage: mortgage,
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
            alert("Mortgage Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,mortgage) => fetch(ENDPOINT + '/api/title/'+title.id+'/mortgages/'+mortgage.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                mortgage: mortgage,
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
            alert("Mortgage Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,mortgage) => fetch(ENDPOINT + '/api/title/'+title.id+'/mortgages/'+mortgage.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                mortgage: mortgage,
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
            alert("Mortgage Service:\n" + error + "\n" + ENDPOINT);})
};

