<template>
  <v-app>
    <v-card mx-auto>
      <v-card-title class="headline indigo accent-4">
        <span>Azure DevOps Checker</span>
      </v-card-title>

      <v-form @submit.prevent>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="organization"
                label="Organization"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="project" label="Project"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="user_id"
                label="User ID"
                placeholder="01234567-89ab-cdef-0123-456789abcdef"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-btn color="primary" @click="saveUserInfo">Save</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </v-app>
</template>

<script>
export default {
  data: function () {
    return {
      organization: "",
      project: "",
      user_id: "",
    };
  },
  methods: {
    saveUserInfo: function () {
      const vm = this;
      (async function () {
        const user_info = {
          organization: vm.organization,
          project: vm.project,
          user_id: vm.user_id,
        };
        await browser.storage.local.set({ user_info: user_info });
      })();
    },
  },
  created: function () {
    const vm = this;
    (async function () {
      const {
        organization,
        project,
        user_id,
      } = await AzureDevOps.currentUserInfo();
      vm.organization = organization;
      vm.project = project;
      vm.user_id = user_id;
    })();
  },
};
</script>

<style scoped>
</style>
