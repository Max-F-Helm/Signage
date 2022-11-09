<template>
    <div>
        <Panel header="Users" :toggleable="true">
            <DataTable :value="users" responsive-layout="scroll">
                <Column field="name" header="Username"/>
                <Column field="mail"  header="E-Mail"/>
                <Column field="public_key" header="Public Key"/>
            </DataTable>
        </Panel>
    </div>
</template>

<script setup lang="ts">
    import DataTable from "primevue/datatable";
    import Column from "primevue/column";
    import Panel from "primevue/panel";
    
    import UserService from "../service/UserService";
    import { onMounted, ref } from "@vue/runtime-core";

    const users = ref();
    const userService = ref(new UserService());

    onMounted(() => {
        userService.value.getUsers().then(data => users.value = data);
    });
    
</script>

<style lang="scss">

</style>
