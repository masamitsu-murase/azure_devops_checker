<template>
  <v-app>
    <v-card mx-auto>
      <v-card-title
        class="headline indigo primary accent--text text--lighten-5"
      >
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

      <v-dialog v-model="dialog" max-width="400">
        <v-card>
          <v-card-title class="headline warning">
            Warning
          </v-card-title>

          <v-card-text>
            Error occurred while accessing Azure DevOps.<br />
            Please check the followings:
            <ul>
              <li>You have already logged in to Azure DevOps.</li>
              <li>Your organization, project, and user id are correct.</li>
            </ul>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text @click="dialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
      dialog: false,
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
        const azure_devops = new AzureDevOps(
          vm.organization,
          vm.project,
          vm.user_id
        );
        await browser.storage.local.set({ user_info: user_info });
        try {
          await azure_devops.findMyWorks();
        } catch (e) {
          vm.dialog = true;
        }
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
