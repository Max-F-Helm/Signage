<template>
    <div>
        <Card class="mt-5">
            <template #title>
                Addendum
            </template>
            <template #content>
                <div class="p-inputgroup mt-1">
                    <span class="p-inputgroup-addon">
                        Hash Preview
                    </span>
                    <InputText placeholder=""/>
                </div>
                <div class="p-inputgroup mt-1">
                    <span class="p-inputgroup-addon">
                        Time Stamp
                    </span>
                    <InputText placeholder=""/>
                </div>
                <Dropdown class="mt-1 w-full" v-model="selectedUser" :options="users" optionLabel="name" optionValue="name" placeholder="Select a user" />
                <div class="p-inputgroup mt-1">
                    <span class="p-inputgroup-addon">
                        Type
                    </span>
                    <InputText placeholder=""/>
                </div>
                <div class="p-inputgroup mt-1">
                    <span class="p-inputgroup-addon">
                        Data Length
                    </span>
                    <InputText placeholder=""/>
                </div>
                <div class="p-inputgroup mt-1">
                    <span class="p-inputgroup-addon">
                        Hash
                    </span>
                    <InputText placeholder=""/>
                </div>
                <Card class="mt-3">
                    <template #title>
                        Data
                    </template>
                    <template #content>
                        Data Preview to be added
                    </template>
                </Card>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
    import InputText from 'primevue/inputtext';
    import PButton from "primevue/button";
    import Card from "primevue/card";
    import Dropdown from "primevue/dropdown";

    import { onMounted, ref } from "@vue/runtime-core";
    import UserService from "../service/UserService";

    const selectedUser = ref();
    const users = ref()
    const userService = ref(new UserService())

    onMounted(() => {
        userService.value.getUsers().then(data => users.value = data);
    });

</script>

<style lang="scss">

</style>
