import React, { useState, useEffect } from "react";
import {
Modal,
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet
} from "react-native";

export default function EditPlanModal({ visible, plan, onClose, onSave }) {

const [name,setName] = useState("");
const [price,setPrice] = useState("");
const [duration,setDuration] = useState("");

useEffect(()=>{

if(plan){
setName(plan.name);
setPrice(String(plan.price));
setDuration(plan.duration);
}

},[plan]);

const savePlan = () => {

onSave({
id: plan.id,
name,
price: parseInt(price),
duration
});

onClose();

};

if(!plan) return null;

return(

<Modal visible={visible} transparent animationType="slide">

<View style={styles.overlay}>

<View style={styles.modal}>

<Text style={styles.title}>
Edit Plan
</Text>

<TextInput
style={styles.input}
value={name}
onChangeText={setName}
placeholder="Plan name"
/>

<TextInput
style={styles.input}
value={price}
onChangeText={setPrice}
placeholder="Price"
/>

<TextInput
style={styles.input}
value={duration}
onChangeText={setDuration}
placeholder="Duration (month/year)"
/>

<View style={styles.actions}>

<TouchableOpacity
style={styles.btn}
onPress={savePlan}
>
<Text style={styles.btnText}>
Save
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.cancel}
onPress={onClose}
>
<Text>Cancel</Text>
</TouchableOpacity>

</View>

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
marginBottom:10
},

input:{
borderWidth:1,
borderColor:"#ddd",
padding:10,
borderRadius:6,
marginVertical:6
},

actions:{
flexDirection:"row",
marginTop:10
},

btn:{
backgroundColor:"#1E88E5",
padding:10,
borderRadius:6,
marginRight:10
},

btnText:{
color:"#fff"
},

cancel:{
padding:10
}

});