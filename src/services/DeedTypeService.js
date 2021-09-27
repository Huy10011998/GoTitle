import {ENDPOINT} from "react-native-dotenv";
console.log(ENDPOINT);
export const DeedTypeService = {
    getAll: () => fetch(ENDPOINT + '/api/deed-types',
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
            alert("DeedType Service:\n" + error + "\n" + ENDPOINT);
        }),
    getAllByScopeAndDocType: (scope, docTypeList) => fetch(ENDPOINT + '/api/deed-type',
        {
            method: 'GET',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                scope:scope,
                docTypeList:docTypeList
            })
        })
        .then((response) =>{
            return response.json;
        })
        .then((json)=>{
            return json;
        })
        .catch((error)=>{
        console.warn("Error", error + ' ' + ENDPOINT);
        alert("DeedType Service:\n" + error + "\n" + ENDPOINT);
        })

};