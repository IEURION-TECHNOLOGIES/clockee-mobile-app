import React from "react";
import {
Modal,
View,
Text,
TouchableOpacity,
StyleSheet
} from "react-native";

export default function DeactivateModal({
visible,
institution,
onCancel,
onConfirm
}){

if(!institution) return null;

return(

<Modal visible={visible} transparent animationType="fade">

<View style={styles.overlay}>

<View style={styles.modal}>

<Text style={styles.title}>
Deactivate Institution
</Text>

<Text style={styles.message}>
Are you sure you want to deactivate
{" "}
<Text style={{fontWeight:"bold"}}>
{institution.name}
</Text>
?
</Text>

<View style={styles.actions}>

<TouchableOpacity
style={styles.cancel}
onPress={onCancel}
>
<Text>Cancel</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.danger}
onPress={onConfirm}
>
<Text style={{color:"#fff"}}>
Deactivate
</Text>
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

message:{
marginBottom:20
},

actions:{
flexDirection:"row",
justifyContent:"space-between"
},

cancel:{
padding:10
},

danger:{
backgroundColor:"#E53935",
padding:10,
borderRadius:6
}

});