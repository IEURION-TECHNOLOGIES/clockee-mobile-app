import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UsersFilters({search,setSearch,openFilter}:any){

  return(
    <View style={styles.container}>

      <View style={styles.searchBox}>

        <Ionicons name="search" size={18} color="#64748B"/>

        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />

      </View>

      <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
        <Ionicons name="filter" size={18} color="#FFF"/>
      </TouchableOpacity>

    </View>
  )
}

const styles=StyleSheet.create({

container:{
flexDirection:"row",
padding:16,
backgroundColor:"#F8FAFC",
alignItems:"center"
},

searchBox:{
flex:1,
flexDirection:"row",
alignItems:"center",
backgroundColor:"#FFF",
paddingHorizontal:10,
borderRadius:12
},

input:{
flex:1,
padding:10
},

filterBtn:{
marginLeft:10,
backgroundColor:"#0284C7",
padding:12,
borderRadius:10
}

})