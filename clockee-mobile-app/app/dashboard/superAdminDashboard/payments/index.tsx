import React, { useState, useEffect } from "react";
import {
View,
Text,
ScrollView,
StyleSheet,
TextInput,
TouchableOpacity,
Dimensions
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

import InstitutionModal from "./components/ViewModal";
import CreatePlanModal from "./components/AddModal";
import EditPlanModal from "./components/EditModal";
import UpgradePlanModal from "./components/UpgradeModal";
import DeactivateModal from "./components/DeactivateModal";
import BottomNav from "../../../../components/BottomNav"

const screenWidth = Dimensions.get("window").width;

type Institution = {
id:number
name:string
plan:string
start:string
expiry:string
status:string
}

type Plan = {
id:number
name:string
price:number
duration:string
}

export default function SubscriptionScreen(){

const [search,setSearch] = useState("");

const [institutions,setInstitutions] = useState<Institution[]>([
{
id:1,
name:"Greenfield School",
plan:"PRO",
start:"2026-01-01",
expiry:"2026-12-31",
status:"active"
},
{
id:2,
name:"Royal Academy",
plan:"BASIC",
start:"2026-02-01",
expiry:"2026-02-28",
status:"active"
}
]);

const [plans,setPlans] = useState<Plan[]>([
{
id:1,
name:"Basic",
price:20000,
duration:"month"
},
{
id:2,
name:"Pro",
price:50000,
duration:"year"
}
]);

const [payments] = useState([
{
institution:"Greenfield School",
amount:50000,
date:"Feb 12"
},
{
institution:"Royal Academy",
amount:20000,
date:"Feb 15"
}
]);

const [viewModal,setViewModal] = useState(false);
const [createPlanModal,setCreatePlanModal] = useState(false);
const [editPlanModal,setEditPlanModal] = useState(false);
const [upgradeModal,setUpgradeModal] = useState(false);
const [deactivateModal,setDeactivateModal] = useState(false);

const [selectedInstitution,setSelectedInstitution] = useState<Institution | null>(null);
const [selectedPlan,setSelectedPlan] = useState<Plan | null>(null);

useEffect(()=>{

const today = new Date();

const updated = institutions.map(inst=>{

const expiry = new Date(inst.expiry);

if(expiry < today){
return {...inst,status:"expired"};
}

return inst;

});

setInstitutions(updated);

},[]);

/* ---------------- REVENUE DATA ---------------- */

const revenueData = {
labels:["Jan","Feb","Mar","Apr","May","Jun"],
datasets:[
{
data:[20000,45000,30000,80000,60000,90000]
}
]
};

const totalRevenue =
payments.reduce((sum,p)=>sum + p.amount,0);

/* ---------------- STATS ---------------- */

const stats = {
institutions:institutions.length,
active:institutions.filter(i=>i.status==="active").length,
expired:institutions.filter(i=>i.status==="expired").length,
revenue:`₦${totalRevenue}`
};

/* ---------------- SEARCH ---------------- */

const filteredInstitutions =
institutions.filter(inst =>
inst.name.toLowerCase().includes(search.toLowerCase())
);

/* ---------------- UI ---------------- */

return(

<View style={styles.container}>

<ScrollView>

<Text style={styles.title}>
Subscription Dashboard
</Text>

<View style={styles.searchRow}>

<TextInput
placeholder="Search institution"
style={styles.search}
value={search}
onChangeText={setSearch}
/>

</View>

{/* STATS */}

<View style={styles.stats}>

<View style={styles.card}>
<Text style={styles.num}>{stats.institutions}</Text>
<Text>Total Schools</Text>
</View>

<View style={styles.card}>
<Text style={styles.num}>{stats.active}</Text>
<Text>Active</Text>
</View>

<View style={styles.card}>
<Text style={styles.num}>{stats.expired}</Text>
<Text>Expired</Text>
</View>

<View style={styles.card}>
<Text style={styles.num}>{stats.revenue}</Text>
<Text>Revenue</Text>
</View>

</View>

{/* REVENUE CHART */}

<Text style={styles.section}>
Revenue Overview
</Text>

<LineChart
data={revenueData}
width={screenWidth-40}
height={220}
chartConfig={{
backgroundGradientFrom:"#fff",
backgroundGradientTo:"#fff",
decimalPlaces:0,
color:(opacity)=>`rgba(30,136,229,${opacity})`
}}
style={{marginVertical:10,alignSelf:"center"}}
/>

{/* INSTITUTIONS */}

<Text style={styles.section}>
Institutions
</Text>

{filteredInstitutions.map(inst=>(

<View key={inst.id} style={styles.schoolCard}>

<Text style={styles.schoolName}>
{inst.name}
</Text>

<Text>Plan: {inst.plan}</Text>
<Text>Expiry: {inst.expiry}</Text>

{inst.status==="active" && (
<Text style={{color:"green"}}>Active</Text>
)}

{inst.status==="expired" && (
<Text style={{color:"red"}}>Expired</Text>
)}

<View style={styles.actions}>

<TouchableOpacity
style={styles.btn}
onPress={()=>{
setSelectedInstitution(inst);
setViewModal(true);
}}
>
<Text style={styles.btnText}>View</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.btn}
onPress={()=>{
setSelectedInstitution(inst);
setUpgradeModal(true);
}}
>
<Text style={styles.btnText}>Upgrade</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.btnDanger}
onPress={()=>{
setSelectedInstitution(inst);
setDeactivateModal(true);
}}
>
<Text style={styles.btnText}>Deactivate</Text>
</TouchableOpacity>

</View>

</View>

))}

{/* PLANS */}

<Text style={styles.section}>
Plans
</Text>

{plans.map(plan=>(

<View key={plan.id} style={styles.planCard}>

<Text style={styles.schoolName}>
{plan.name}
</Text>

<Text>
₦{plan.price} / {plan.duration}
</Text>

<TouchableOpacity
style={styles.btn}
onPress={()=>{
setSelectedPlan(plan);
setEditPlanModal(true);
}}
>
<Text style={styles.btnText}>Edit</Text>
</TouchableOpacity>

</View>

))}

</ScrollView>

{/* VIEW INSTITUTION */}

<InstitutionModal
visible={viewModal}
institution={selectedInstitution}
onClose={()=>{
setViewModal(false);
setSelectedInstitution(null);
}}
/>

{/* CREATE PLAN */}

<CreatePlanModal
visible={createPlanModal}
onClose={()=>setCreatePlanModal(false)}
onCreate={(plan)=>setPlans([...plans,plan])}
/>

{/* EDIT PLAN */}

{selectedPlan && (

<EditPlanModal
visible={editPlanModal}
plan={selectedPlan}
onClose={()=>{
setEditPlanModal(false);
setSelectedPlan(null);
}}
onSave={(updated)=>{

if(!updated) return;

setPlans(plans.map(p =>
p.id === updated.id ? updated : p
));

}}
/>

)}

{/* UPGRADE PLAN */}

<UpgradePlanModal
visible={upgradeModal}
plans={plans}
institution={selectedInstitution}
onClose={()=>{
setUpgradeModal(false);
setSelectedInstitution(null);
}}
onUpgrade={(plan)=>{

if(!selectedInstitution) return;

setInstitutions(
institutions.map(i =>
i.id === selectedInstitution.id
? {...i,plan:plan.name}
: i
)
);

setUpgradeModal(false);
setSelectedInstitution(null);

}}
/>

{/* DEACTIVATE */}

<DeactivateModal
visible={deactivateModal}
institution={selectedInstitution}
onCancel={()=>{
setDeactivateModal(false);
setSelectedInstitution(null);
}}
onConfirm={()=>{

if(!selectedInstitution) return;

setInstitutions(
institutions.filter(i =>
i.id !== selectedInstitution.id
)
);

setDeactivateModal(false);
setSelectedInstitution(null);

}}
/>

<TouchableOpacity
style={styles.fab}
onPress={()=>setCreatePlanModal(true)}
>
<Ionicons name="add" size={30} color="#fff"/>
</TouchableOpacity>

<BottomNav dashboardType="superAdmin"/>

</View>

);

}

const styles = StyleSheet.create({

container:{flex:1,marginTop:40,backgroundColor:"#F5F6FA"},

title:{fontSize:22,fontWeight:"bold",margin:20},

searchRow:{paddingHorizontal:20},

search:{
backgroundColor:"#fff",
padding:10,
borderRadius:8
},

stats:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
padding:20
},

card:{
backgroundColor:"#fff",
width:"48%",
padding:20,
borderRadius:10,
marginBottom:10
},

num:{fontSize:20,fontWeight:"bold"},

section:{fontSize:18,fontWeight:"bold",marginLeft:20,marginTop:10},

schoolCard:{
backgroundColor:"#fff",
margin:20,
padding:15,
borderRadius:10
},

schoolName:{fontWeight:"bold",fontSize:16},

actions:{flexDirection:"row",marginTop:10},

btn:{
backgroundColor:"#1E88E5",
padding:8,
borderRadius:6,
marginRight:10
},

btnDanger:{
backgroundColor:"#E53935",
padding:8,
borderRadius:6
},

btnText:{color:"#fff"},

planCard:{
backgroundColor:"#fff",
margin:20,
padding:15,
borderRadius:10
},

fab:{
position:"absolute",
bottom:100,
right:30,
backgroundColor:"#1E88E5",
width:60,
height:60,
borderRadius:30,
justifyContent:"center",
alignItems:"center"
}

});