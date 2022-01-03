<template>
  <v-dialog v-model="computedDialog" max-width="400">
    <v-card>
      <v-card-title class="headline error">Error</v-card-title>

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

        <v-btn color="green darken-1" text @click="computedDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  model: {
    prop: "dialog",
    event: "input",
  },
  props: {
    dialog: {
      type: Boolean,
    },
  },
  computed: {
    computedDialog: {
      get() {
        return this.dialog;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
  },
};
</script>
