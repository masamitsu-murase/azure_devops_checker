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
              <v-text-field v-model="project" label="Project" placeholder="Project1, Project2, Project3"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="user_id"
                label="User ID"
                placeholder="01234567-89ab-cdef-0123-456789abcdef"
                :rules="userIdRules()"
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
          <v-card-title class="headline warning"> Warning </v-card-title>

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
        await browser.storage.local.set({ user_info: user_info });
        try {
          const projects = vm.project.split(",").map(x => x.trim());
          const azure_devops_list = projects.map(p => new AzureDevOps(vm.organization, p, vm.user_id));
          await Promise.all(azure_devops_list.map(ad => ad.findMyWorks()));
        } catch (e) {
          vm.dialog = true;
        }
      })();
    },
    userIdRules: function () {
      const uuid_pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      return [(v) => uuid_pattern.test(v) || "UUID in lower case is required."];
    },
  },
  created: function () {
    const vm = this;
    (async function () {
      const {
        organization,
        projects,
        user_id,
      } = await AzureDevOps.currentUserInfo();
      vm.organization = organization;
      vm.project = projects.join(", ");
      vm.user_id = user_id;
    })();
  },
};
</script>
