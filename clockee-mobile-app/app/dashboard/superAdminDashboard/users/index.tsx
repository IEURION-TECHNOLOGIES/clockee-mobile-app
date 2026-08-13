import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import FilterModal from "./components/filterModal";
import UsersFilters from "./components/usersFilters";
import UsersList from "./components/usersList";
import UsersStats from "./components/usersStats";

import ChangeRoleModal from "./components/changeRoleModal";
import ConfirmActionModal from "./components/confirmActionModal";
import CreatePasswordModal from "./components/createPasswordModal";
import UserActionsModal from "./components/userActionsModal";
import ViewUserProfileModal from "./components/viewUserProfileModal";

import BottomNav from "../../../../components/BottomNav";

export default function UsersPage() {

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("all");

  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionsVisible, setActionsVisible] = useState(false);

  const [profileVisible, setProfileVisible] = useState(false);
  const [changeRoleVisible, setChangeRoleVisible] = useState(false);
  const [createPasswordVisible, setCreatePasswordVisible] = useState(false);

  const [forceLogoutVisible, setForceLogoutVisible] = useState(false);
  const [deactivateVisible, setDeactivateVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const openActions = (user: any) => {
    setSelectedUser(user);
    setActionsVisible(true);
  };

  return (
    <View style={styles.container}>

      <ScrollView stickyHeaderIndices={[1]}>

        <Text style={styles.header}>Users Management</Text>

        <UsersStats />

        <UsersFilters
          search={search}
          setSearch={setSearch}
          openFilter={() => setFilterVisible(true)}
        />

        <UsersList
          search={search}
          roleFilter={roleFilter}
          institutionFilter={institutionFilter}
          branchFilter={branchFilter}
          openActions={openActions}
        />

      </ScrollView>

      {/* FILTER MODAL */}
      <FilterModal
        visible={filterVisible}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        institutionFilter={institutionFilter}
        setInstitutionFilter={setInstitutionFilter}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        onClose={() => setFilterVisible(false)}
      />

      {/* ACTIONS */}
      <UserActionsModal
        visible={actionsVisible}
        user={selectedUser}
        onClose={() => setActionsVisible(false)}
        onViewProfile={() => {setActionsVisible(false);setProfileVisible(true)}}
        onChangeRole={() => {setActionsVisible(false);setChangeRoleVisible(true)}}
        onCreatePassword={() => {setActionsVisible(false);setCreatePasswordVisible(true)}}
        onForceLogout={() => {setActionsVisible(false);setForceLogoutVisible(true)}}
        onDeactivate={() => {setActionsVisible(false);setDeactivateVisible(true)}}
        onDelete={() => {setActionsVisible(false);setDeleteVisible(true)}}
      />

      <ViewUserProfileModal
        visible={profileVisible}
        user={selectedUser}
        onClose={() => setProfileVisible(false)}
      />

      <ChangeRoleModal
        visible={changeRoleVisible}
        user={selectedUser}
        onClose={() => setChangeRoleVisible(false)}
      />

      <CreatePasswordModal
        visible={createPasswordVisible}
        user={selectedUser}
        onClose={() => setCreatePasswordVisible(false)}
      />

      <ConfirmActionModal
        visible={forceLogoutVisible}
        title="Force Logout"
        message="User will be logged out from all devices."
        confirmText="Force Logout"
        onConfirm={()=>setForceLogoutVisible(false)}
        onCancel={()=>setForceLogoutVisible(false)}
      />

      <ConfirmActionModal
        visible={deactivateVisible}
        title="Deactivate User"
        message="User will no longer access the system."
        confirmText="Deactivate"
        danger
        onConfirm={()=>setDeactivateVisible(false)}
        onCancel={()=>setDeactivateVisible(false)}
      />

      <ConfirmActionModal
        visible={deleteVisible}
        title="Delete User"
        message="This action cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={()=>setDeleteVisible(false)}
        onCancel={()=>setDeleteVisible(false)}
      />

      <BottomNav dashboardType="superAdmin"/>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#F8FAFC",
    paddingTop:50
  },

  header:{
    fontSize:22,
    fontWeight:"700",
    paddingHorizontal:16,
    marginBottom:10
  }

});