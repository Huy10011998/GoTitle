import {ENDPOINT} from 'react-native-dotenv';

export const LiensService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/liens',
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
            alert("Liens Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,liens) => fetch(ENDPOINT + '/api/title/'+title.id+'/liens',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                liens: liens,
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
            alert("Liens Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,liens) => fetch(ENDPOINT + '/api/title/'+title.id+'/liens/'+liens.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                liens: liens,
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
            alert("Liens Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,liens) => fetch(ENDPOINT + '/api/title/'+title.id+'/liens/'+liens.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                liens: liens,
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
            alert("Liens Service:\n" + error + "\n" + ENDPOINT);})
};
