import React from "react";
import { Modal,View,Text,TouchableOpacity,StyleSheet } from "react-native";

export default function InstitutionModal({visible,institution,onClose}){

if(!institution) return null;

return(

<Modal visible={visible} transparent>

<View style={styles.overlay}>

<View style={styles.modal}>

<Text style={styles.title}>
Institution Details
</Text>

<Text>Name: {institution.name}</Text>
<Text>Plan: {institution.plan}</Text>
<Text>Start: {institution.start}</Text>
<Text>Expiry: {institution.expiry}</Text>

<TouchableOpacity style={styles.btn} onPress={onClose}>
<Text style={{color:"#fff"}}>Close</Text>
</TouchableOpacity>

</View>

</View>

</Modal>

);

}

const styles=StyleSheet.create({

overlay:{flex:1,justifyContent:"center",backgroundColor:"#00000066"},

modal:{backgroundColor:"#fff",margin:20,padding:20,borderRadius:10},

title:{fontWeight:"bold",fontSize:18,marginBottom:10},

btn:{backgroundColor:"#1E88E5",padding:10,borderRadius:6,marginTop:10}

});