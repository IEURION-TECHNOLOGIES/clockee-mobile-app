import React,{useState} from "react";
import {Modal,View,Text,TextInput,TouchableOpacity,StyleSheet} from "react-native";

export default function CreatePlanModal({visible,onClose,onCreate}){

const [name,setName]=useState("");
const [price,setPrice]=useState("");
const [duration,setDuration]=useState("");

const create=()=>{
onCreate({
id:Date.now(),
name,
price:parseInt(price),
duration
});
setName("");
setPrice("");
setDuration("");
onClose();
};

return(

<Modal visible={visible} transparent>

<View style={styles.overlay}>
<View style={styles.modal}>

<Text style={styles.title}>Create Plan</Text>

<TextInput placeholder="Plan Name" style={styles.input} value={name} onChangeText={setName}/>
<TextInput placeholder="Price" style={styles.input} value={price} onChangeText={setPrice}/>
<TextInput placeholder="Duration (month/year)" style={styles.input} value={duration} onChangeText={setDuration}/>

<TouchableOpacity style={styles.btn} onPress={create}>
<Text style={{color:"#fff"}}>Create</Text>
</TouchableOpacity>

<TouchableOpacity onPress={onClose}>
<Text>Cancel</Text>
</TouchableOpacity>

</View>
</View>

</Modal>

);

}

const styles=StyleSheet.create({
overlay:{flex:1,justifyContent:"center",backgroundColor:"#00000066"},
modal:{backgroundColor:"#fff",margin:20,padding:20,borderRadius:10},
title:{fontSize:18,fontWeight:"bold"},
input:{borderWidth:1,borderColor:"#ddd",marginVertical:10,padding:10,borderRadius:6},
btn:{backgroundColor:"#1E88E5",padding:10,borderRadius:6}
});