import {ENDPOINT} from 'react-native-dotenv';

export const DeedService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id +'/deed',
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
            alert("Deed Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,deed) => fetch(ENDPOINT + '/api/title/'+ title.id +'/deed',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                deed: deed,
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
            alert("Deed Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,deed) => fetch(ENDPOINT + '/api/title/'+title.id +'/deed/'+deed.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                deed: deed
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
            alert("Deed Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,deed) => fetch(ENDPOINT + '/api/title/'+title.id +'/deed/'+deed.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                deed: deed
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
            alert("Deed Service:\n" + error + "\n" + ENDPOINT);})
};
