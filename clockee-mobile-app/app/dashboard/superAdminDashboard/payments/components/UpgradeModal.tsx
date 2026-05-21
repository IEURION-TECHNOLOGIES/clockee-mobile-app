import React from "react";
import {
Modal,
View,
Text,
TouchableOpacity,
StyleSheet
} from "react-native";

export default function UpgradePlanModal({
visible,
plans,
institution,
onClose,
onUpgrade
}) {

if(!institution) return null;

return(

<Modal visible={visible} transparent animationType="slide">

<View style={styles.overlay}>

<View style={styles.modal}>

<Text style={styles.title}>
Upgrade {institution.name}
</Text>

{plans.map(plan=>(
<TouchableOpacity
key={plan.id}
style={styles.plan}
onPress={()=>{

onUpgrade(plan);
onClose();

}}
>

<Text style={styles.planName}>
{plan.name}
</Text>

<Text>
₦{plan.price} / {plan.duration}
</Text>

</TouchableOpacity>
))}

<TouchableOpacity
style={styles.cancel}
onPress={onClose}
>
<Text>Cancel</Text>
</TouchableOpacity>

</View>

</View>

</Modal>

);

}

const styles = StyleSheet.create({

overlay:{
flex:1,
justifyContent:"center",
backgroundColor:"#00000066"
},

modal:{
backgroundColor:"#fff",
margin:20,
padding:20,
borderRadius:10
},

title:{
fontSize:18,
fontWeight:"bold",
marginBottom:15
},

plan:{
borderWidth:1,
borderColor:"#eee",
padding:12,
borderRadius:8,
marginBottom:10
},

planName:{
fontWeight:"bold"
},

cancel:{
marginTop:10,
alignSelf:"center"
}

});