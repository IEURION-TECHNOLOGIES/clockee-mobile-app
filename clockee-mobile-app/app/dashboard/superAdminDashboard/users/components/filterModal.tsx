import React from "react";
import {
Modal,
View,
Text,
StyleSheet,
TouchableOpacity,
ScrollView
} from "react-native";

const ROLES = ["all","superAdmin","primaryAdmin","admin","staff"]

const INSTITUTIONS = [
"Devad Institute",
"Greenwood Academy",
"Lagos Tech School"
]

const BRANCHES = ["all","Abuja","Ikeja","Port Harcourt"]

export default function FilterModal({
visible,
roleFilter,
setRoleFilter,
institutionFilter,
setInstitutionFilter,
branchFilter,
setBranchFilter,
onClose
}:any){

const toggleInstitution=(name:string)=>{

if(institutionFilter.includes(name)){
setInstitutionFilter(institutionFilter.filter((i:any)=>i!==name))
}else{
setInstitutionFilter([...institutionFilter,name])
}

}

const resetFilters=()=>{
setRoleFilter("all")
setInstitutionFilter([])
setBranchFilter("all")
}

return(

<Modal visible={visible} animationType="slide">

<ScrollView style={styles.container}>

<Text style={styles.header}>Filters</Text>

{/* ROLE */}

<Text style={styles.label}>Role</Text>

{ROLES.map(role=>(
<TouchableOpacity
key={role}
style={styles.option}
onPress={()=>setRoleFilter(role)}
>
<Text>{role}</Text>
</TouchableOpacity>
))}

{/* INSTITUTIONS */}

<Text style={styles.label}>Institutions</Text>

{INSTITUTIONS.map(inst=>(
<TouchableOpacity
key={inst}
style={styles.option}
onPress={()=>toggleInstitution(inst)}
>
<Text>
{institutionFilter.includes(inst) ? "☑ " : "☐ "}
{inst}
</Text>
</TouchableOpacity>
))}

{/* BRANCH */}

<Text style={styles.label}>Branch</Text>

{BRANCHES.map(branch=>(
<TouchableOpacity
key={branch}
style={styles.option}
onPress={()=>setBranchFilter(branch)}
>
<Text>{branch}</Text>
</TouchableOpacity>
))}

<View style={styles.buttons}>

<TouchableOpacity style={styles.reset} onPress={resetFilters}>
<Text>Reset</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.apply} onPress={onClose}>
<Text style={{color:"#FFF"}}>Apply</Text>
</TouchableOpacity>

</View>

</ScrollView>

</Modal>

)

}

const styles=StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:"#F8FAFC"
},

header:{
fontSize:22,
fontWeight:"700",
marginBottom:20
},

label:{
fontWeight:"600",
marginTop:20,
marginBottom:10
},

option:{
padding:10,
backgroundColor:"#FFF",
marginBottom:8,
borderRadius:10
},

buttons:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:30
},

reset:{
padding:14,
backgroundColor:"#E2E8F0",
borderRadius:10
},

apply:{
padding:14,
backgroundColor:"#0284C7",
borderRadius:10
}

})