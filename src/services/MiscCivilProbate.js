import {ENDPOINT} from 'react-native-dotenv';

export const MiscCivilProbateService = {
    getAll: (title) => fetch(ENDPOINT + '/api/title/'+title.id+'/misc-civil-probates',
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
            alert("MiscCivilProbates Service:\n" + error + "\n" + ENDPOINT);
        }),
    create: (title,miscCivilProbates) => fetch(ENDPOINT + '/api/title/'+title.id+'/misc-civil-probates',
        {
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                miscCivilProbates: miscCivilProbates,
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
            alert("MiscCivilProbates Service:\n" + error + "\n" + ENDPOINT);
        }),
    update: (title,miscCivilProbates) => fetch(ENDPOINT + '/api/title/'+title.id+'/misc-civil-probates/'+ miscCivilProbates.id,
        {
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                miscCivilProbates: miscCivilProbates,
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
            alert("MiscCivilProbates Service:\n" + error + "\n" + ENDPOINT);
        }),
    delete: (title,miscCivilProbates) => fetch(ENDPOINT + '/api/title/'+title.id+'/misc-civil-probates/'+ miscCivilProbates.id,
        {
            method:'DELETE',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                miscCivilProbates: miscCivilProbates
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
            alert("MiscCivilProbates Service:\n" + error + "\n" + ENDPOINT);})
};
