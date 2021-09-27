import {ENDPOINT} from 'react-native-dotenv';

export const EasementService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/easement',
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
            alert("Easement Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,easements) => fetch(ENDPOINT + '/api/title/'+title.id+'/easement',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                easements: easements,
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
            alert("Easement Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,easements) => fetch(ENDPOINT + '/api/title/'+title.id+'/easement/'+easements.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                easements: easements,
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
            alert("Easement Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,easements) => fetch(ENDPOINT + '/api/title/'+title.id+'/easement/' + easements.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                easements: easements,
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
            alert("Easement Service:\n" + error + "\n" + ENDPOINT);})
};