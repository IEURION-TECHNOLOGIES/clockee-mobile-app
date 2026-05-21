import React from "react";
import { View } from "react-native";
import UserCard from "./userCard";

const USERS=[
{ id:"1", name:"Mary Johnson", role:"admin", institution:"Greenwood Academy", branch:"Ikeja"},
{ id:"2", name:"John David", role:"staff", institution:"Devad Institute", branch:"Abuja"},
{ id:"3", name:"Peter Obi", role:"primaryAdmin", institution:"Devad Institute", branch:"Port Harcourt"},
]

export default function UsersList({
search,
roleFilter,
institutionFilter,
branchFilter,
openActions
}:any){

const filtered=USERS.filter(user=>{

const matchSearch=user.name.toLowerCase().includes(search.toLowerCase())

const matchRole=roleFilter==="all" || user.role===roleFilter

const matchInstitution=
institutionFilter.length===0 || institutionFilter.includes(user.institution)

const matchBranch=branchFilter==="all" || user.branch===branchFilter

return matchSearch && matchRole && matchInstitution && matchBranch

})

return(

<View style={{paddingHorizontal:16}}>

{filtered.map(user=>(
<UserCard key={user.id} user={user} openActions={openActions}/>
))}

</View>

)

}